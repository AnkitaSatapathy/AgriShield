"""
Seasonal Analysis Service  (v3 – correct philosophy)

The score answers ONE question:
  "Given TODAY's actual weather conditions vs the 20-year historical baseline
   for this location and month, is it a good time RIGHT NOW to grow this crop?"

Logic:
  • We compare CURRENT weather (temperature, rainfall, humidity) against:
      a) The crop's ideal growing parameters
      b) What the historical baseline for THIS MONTH is at this location
  • If current February conditions are cold & dry and the crop is Rice (needs
    warm + heavy rain), the score will be LOW (not suitable right now).
  • The score is NOT about "when is this crop generally grown?" — it's about
    "do TODAY's conditions match what this crop needs?"

Additional context layers:
  • Season timing penalty: how far are we from the crop's sowing window?
    (a crop 4 months away from its season also scores lower)
  • Historical pattern comparison: is this year's weather better or worse
    than previous years for this crop?
  • Disaster risk warnings
  • Multi-cycle opportunity if conditions are exceptional
"""

from datetime import datetime
from typing import Dict, List, Optional, Tuple

from historical_weather_service import (
    HistoricalWeatherService,
    get_coordinates,
    get_crop_info,
    get_primary_season,
    MONTH_NAMES,
    CROP_SEASONAL_INFO,
    _season_date_range,
)


class SeasonalAnalysisService:
    def __init__(self):
        self.hist_svc = HistoricalWeatherService()

    # ─────────────────────────────────────────────────────────────────────────
    # PUBLIC ENTRY POINT
    # ─────────────────────────────────────────────────────────────────────────
    def get_seasonal_analysis(self, state: str, district: str, crop: str) -> Dict:
        result: Dict = {
            "state": state, "district": district, "crop": crop,
            "analysis_date": datetime.now().isoformat(),
            "success": False, "error": None,
        }

        coords = get_coordinates(district, state)
        if not coords:
            result["error"] = (
                f"Could not determine coordinates for {district}, {state}. "
                "Please check the district name."
            )
            return result

        lat, lon = coords
        result["coordinates"] = {"lat": lat, "lon": lon}
        current_month = datetime.now().month
        current_year  = datetime.now().year

        # ── 1. 20-year monthly climate normals ──────────────────────────────
        hist_monthly = self.hist_svc.get_monthly_climate_normals(lat, lon)
        if not hist_monthly:
            result["error"] = "Unable to fetch historical climate data. Try again later."
            return result
        result["historical_monthly_normals"] = [
            hist_monthly[m] for m in sorted(hist_monthly.keys())
        ]

        # ── 2. Current-year actuals ──────────────────────────────────────────
        curr_year_monthly = self.hist_svc.get_current_year_monthly(lat, lon)
        result["current_year_monthly"] = (
            [curr_year_monthly[m] for m in sorted(curr_year_monthly.keys())]
            if curr_year_monthly else []
        )

        # ── 3. 16-day extended forecast ──────────────────────────────────────
        ext_forecast = self.hist_svc.get_extended_forecast(lat, lon)
        result["extended_forecast_16days"] = ext_forecast or []

        # ── 4. Crop info & primary season ────────────────────────────────────
        crop_info  = get_crop_info(crop)
        season_type = get_primary_season(crop_info) if crop_info else (
            "kharif" if 6 <= current_month <= 10 else "rabi"
        )
        result["current_season_type"] = season_type

        # ── 5. Get CURRENT actual conditions (this month's real data) ────────
        current_conditions = self._get_current_conditions(
            current_month, curr_year_monthly, hist_monthly, ext_forecast or []
        )
        result["current_conditions"] = current_conditions

        # ── 6. 12-month forecast (per-month 20yr normals) ────────────────────
        monthly_forecast = self._project_monthly_forecast(
            ext_forecast or [], hist_monthly, current_month, curr_year_monthly or {}
        )
        result["monthly_forecast"] = monthly_forecast

        # ── 7. Season comparison — season-window-aware ───────────────────────
        yoy = self.hist_svc.get_yearly_seasonal_data(lat, lon, season_type)
        current_season_rainfall = self.hist_svc.get_current_season_so_far(
            lat, lon, season_type, current_year, current_month
        )
        season_comparison = self._build_season_comparison(
            yoy or [], current_season_rainfall, season_type, current_year
        )
        result["season_comparison"] = season_comparison

        # ── 8. Disaster warnings ─────────────────────────────────────────────
        disaster_warnings = self.hist_svc.get_disaster_warnings(state, current_month)
        result["disaster_warnings"] = disaster_warnings

        # ── 9. Suitability score: NOW-conditions vs crop needs ────────────────
        suitability = self._assess_crop_suitability_now(
            crop=crop, crop_info=crop_info,
            current_conditions=current_conditions,
            hist_monthly=hist_monthly,
            season_comparison=season_comparison,
            disaster_warnings=disaster_warnings,
            current_month=current_month,
            state=state, season_type=season_type,
        )
        result["crop_suitability"] = suitability
        result["success"] = True
        return result

    # ─────────────────────────────────────────────────────────────────────────
    # GET CURRENT CONDITIONS  (what's actually happening this month)
    # ─────────────────────────────────────────────────────────────────────────
    def _get_current_conditions(
        self,
        current_month: int,
        curr_year_monthly: Optional[Dict],
        hist_monthly: Dict,
        ext_forecast: List[Dict],
    ) -> Dict:
        """
        Best estimate of current-month conditions:
        Priority: current-year actual → 16-day forecast → historical normal for this month.
        """
        # Try current-year actual for this month first
        if curr_year_monthly and current_month in curr_year_monthly:
            cy = curr_year_monthly[current_month]
            # Only use if we have enough data (at least 10 days in)
            return {
                "temp_mean":  cy.get("temp_mean"),
                "temp_max":   cy.get("temp_max"),
                "temp_min":   cy.get("temp_min"),
                "precipitation_mm": cy.get("precipitation_mm", 0),
                "humidity":   cy.get("humidity"),
                "wind_speed_kmh": cy.get("wind_speed_kmh"),
                "source": "current_year_actual",
            }

        # Try 16-day forecast
        if ext_forecast:
            this_month_days = [d for d in ext_forecast if d.get("month") == current_month]
            if len(this_month_days) >= 3:
                temps = [d["temp_avg"] for d in this_month_days if d.get("temp_avg")]
                precips = [d.get("precipitation_mm", 0) for d in this_month_days]
                humids = [d["humidity"] for d in this_month_days if d.get("humidity")]
                return {
                    "temp_mean":  round(sum(temps) / len(temps), 1) if temps else None,
                    "temp_max":   max(d.get("temp_max", 0) for d in this_month_days),
                    "temp_min":   min(d.get("temp_min", 99) for d in this_month_days),
                    "precipitation_mm": round(sum(precips), 1),
                    "humidity":   round(sum(humids) / len(humids), 1) if humids else None,
                    "wind_speed_kmh": None,
                    "source": "16day_forecast",
                }

        # Fallback: historical normal for this month
        hist = hist_monthly.get(current_month, {})
        return {
            "temp_mean":  hist.get("temp_mean"),
            "temp_max":   hist.get("temp_max"),
            "temp_min":   hist.get("temp_min"),
            "precipitation_mm": hist.get("precipitation_mm", 0),
            "humidity":   hist.get("humidity"),
            "wind_speed_kmh": hist.get("wind_speed_kmh"),
            "source": "historical_normal",
        }

    # ─────────────────────────────────────────────────────────────────────────
    # MONTHLY FORECAST (12 months using per-month 20yr normals)
    # ─────────────────────────────────────────────────────────────────────────
    def _project_monthly_forecast(
        self,
        ext_forecast: List[Dict],
        hist_monthly: Dict,
        current_month: int,
        curr_year_monthly: Dict,
    ) -> List[Dict]:
        from collections import defaultdict
        fc_by_month: Dict = defaultdict(
            lambda: {"temp_max": [], "temp_min": [], "precip": [], "wind": [], "humidity": []}
        )
        for day in ext_forecast:
            m = day.get("month")
            if m:
                if day.get("temp_max") is not None:
                    fc_by_month[m]["temp_max"].append(day["temp_max"])
                if day.get("temp_min") is not None:
                    fc_by_month[m]["temp_min"].append(day["temp_min"])
                fc_by_month[m]["precip"].append(day.get("precipitation_mm", 0))
                if day.get("wind_speed_kmh") is not None:
                    fc_by_month[m]["wind"].append(day["wind_speed_kmh"])
                if day.get("humidity") is not None:
                    fc_by_month[m]["humidity"].append(day["humidity"])

        def _avg(lst): return round(sum(lst) / len(lst), 1) if lst else None

        monthly_outlook = []
        for m in range(1, 13):
            hist = hist_monthly.get(m, {})

            if m < current_month and m in curr_year_monthly:
                cy = curr_year_monthly[m]
                monthly_outlook.append({
                    "month": m, "month_name": MONTH_NAMES[m - 1],
                    "temp_mean": cy.get("temp_mean"), "temp_max": cy.get("temp_max"),
                    "temp_min": cy.get("temp_min"),
                    "precipitation_mm": cy.get("precipitation_mm", 0),
                    "wind_speed_kmh": cy.get("wind_speed_kmh"), "humidity": cy.get("humidity"),
                    "data_source": "actual",
                    "historical_avg_precip": hist.get("precipitation_mm"),
                    "historical_avg_temp": hist.get("temp_mean"),
                })
                continue

            if m in fc_by_month and len(fc_by_month[m]["temp_max"]) >= 5:
                fc = fc_by_month[m]
                temp_mean = _avg([(h + l) / 2 for h, l in zip(fc["temp_max"], fc["temp_min"]) if h and l])
                days_covered = len(fc["precip"])
                precip_full = round(sum(fc["precip"]) * (30 / max(days_covered, 1)), 1)
                monthly_outlook.append({
                    "month": m, "month_name": MONTH_NAMES[m - 1],
                    "temp_mean": temp_mean, "temp_max": hist.get("temp_max"),
                    "temp_min": hist.get("temp_min"), "precipitation_mm": precip_full,
                    "wind_speed_kmh": _avg(fc["wind"]), "humidity": _avg(fc["humidity"]),
                    "data_source": "forecast",
                    "historical_avg_precip": hist.get("precipitation_mm"),
                    "historical_avg_temp": hist.get("temp_mean"),
                })
                continue

            # Default: 20-yr historical normal for this month (July shows monsoon rain)
            monthly_outlook.append({
                "month": m, "month_name": MONTH_NAMES[m - 1],
                "temp_mean": hist.get("temp_mean"), "temp_max": hist.get("temp_max"),
                "temp_min": hist.get("temp_min"),
                "precipitation_mm": hist.get("precipitation_mm", 0),
                "wind_speed_kmh": hist.get("wind_speed_kmh"), "humidity": hist.get("humidity"),
                "data_source": "projected_from_normals",
                "historical_avg_precip": hist.get("precipitation_mm"),
                "historical_avg_temp": hist.get("temp_mean"),
            })
        return monthly_outlook

    # ─────────────────────────────────────────────────────────────────────────
    # SEASON COMPARISON
    # ─────────────────────────────────────────────────────────────────────────
    def _build_season_comparison(
        self, yoy: List[Dict], current_season_rainfall: float,
        season_type: str, current_year: int,
    ) -> Dict:
        if not yoy:
            return {"error": "Year-over-year data unavailable"}
        rainfalls = [y["total_rainfall_mm"] for y in yoy if y["total_rainfall_mm"] > 0]
        avg_rf = round(sum(rainfalls) / len(rainfalls), 1) if rainfalls else 0
        max_rf = max(rainfalls) if rainfalls else 0
        min_rf = min(rainfalls) if rainfalls else 0
        comparison = (
            "above_average" if current_season_rainfall > avg_rf * 1.1
            else "below_average" if current_season_rainfall < avg_rf * 0.9
            else "near_average"
        )
        percentile = _percentile_rank(current_season_rainfall, rainfalls)
        season_display = {
            "kharif": "Kharif/Monsoon (Jun–Sep)", "rabi": "Rabi/Winter (Oct–Feb)",
            "zaid": "Zaid/Summer (Mar–May)", "whole_year": "Whole Year",
        }.get(season_type, season_type.title())
        season_window = {
            "kharif": "Jun–Sep", "rabi": "Oct–Feb",
            "zaid": "Mar–May", "whole_year": "Jan–Dec",
        }.get(season_type, "")
        return {
            "season_type": season_type, "season_display": season_display,
            "season_window": season_window,
            "current_year_rainfall_mm": current_season_rainfall,
            "historical_avg_rainfall_mm": avg_rf, "historical_max_rainfall_mm": max_rf,
            "historical_min_rainfall_mm": min_rf, "rainfall_comparison": comparison,
            "percentile_rank": percentile,
            "verdict_text": _rainfall_verdict(comparison, percentile, season_display),
            "yearly_data": yoy + [{
                "year": current_year, "season": season_type,
                "total_rainfall_mm": current_season_rainfall,
                "avg_temp": None, "is_current_year": True,
            }],
        }

    # ─────────────────────────────────────────────────────────────────────────
    # CORE: SCORE = "IS IT SUITABLE RIGHT NOW?" (v3 correct philosophy)
    # ─────────────────────────────────────────────────────────────────────────
    def _assess_crop_suitability_now(
        self,
        crop: str, crop_info: Optional[Dict],
        current_conditions: Dict,
        hist_monthly: Dict,
        season_comparison: Dict,
        disaster_warnings: List[Dict],
        current_month: int, state: str, season_type: str,
    ) -> Dict:
        """
        Score = how well do CURRENT/NEAR-TERM conditions match this crop's needs?

        Components:
          A. Current temperature match        (0-30 pts)
          B. Current rainfall/moisture match  (0-25 pts)
          C. Current humidity match           (0-15 pts)
          D. Season timing penalty            (0-20 pts deducted if off-season)
          E. Historical season quality bonus  (0-10 pts)
          F. Disaster risk penalty            (0-20 pts deducted)

        A score of 80+ = Highly Suitable NOW
        60-79 = Suitable with care
        40-59 = Marginal
        <40   = Not suitable right now
        """
        if not crop_info:
            return {
                "overall_score": 0, "verdict": "Crop Data Unavailable ❓",
                "suitable": False, "confidence": "low",
                "summary": f"No seasonal profile found for '{crop}'.",
                "key_factors": [], "recommendations": [],
                "multi_cycle_possible": False, "disaster_risk_level": "unknown",
            }

        factors: List[Dict] = []
        score = 0  # BUILD UP from 0, not deduct from 100

        ideal_temp     = crop_info.get("ideal_temp_range", (15, 35))
        ideal_rain     = crop_info.get("ideal_rainfall_monthly_mm", (60, 200))
        ideal_humidity = crop_info.get("ideal_humidity", (40, 80))
        heat_sensitive = crop_info.get("heat_sensitive", False)
        waterlog_sens  = crop_info.get("waterlog_sensitive", False)
        water_demand   = crop_info.get("water_demand", "medium")
        sowing_months  = crop_info.get("sowing_months", [])
        season_label   = crop_info.get("season_label", "")

        curr_temp  = current_conditions.get("temp_mean")
        curr_rain  = current_conditions.get("precipitation_mm", 0)
        curr_humid = current_conditions.get("humidity")

        # ── Historical baseline for this month ───────────────────────────────
        hist_this_month = hist_monthly.get(current_month, {})
        hist_temp  = hist_this_month.get("temp_mean")
        hist_rain  = hist_this_month.get("precipitation_mm", 0)
        hist_humid = hist_this_month.get("humidity")

        # ══════════════════════════════════════════════════════════════════════
        # A. TEMPERATURE MATCH  (max 30 pts)
        # ══════════════════════════════════════════════════════════════════════
        if curr_temp is not None:
            t_min, t_max = ideal_temp
            t_range = t_max - t_min
            if t_min <= curr_temp <= t_max:
                # Inside ideal range: full 30 pts, scaled by how central we are
                centre = (t_min + t_max) / 2
                deviation = abs(curr_temp - centre) / (t_range / 2)
                temp_pts = round(30 * (1 - deviation * 0.3))  # max deduct 9 pts for edge
                temp_pts = max(21, temp_pts)
                label = "✅ Optimal" if deviation < 0.3 else "✅ Acceptable"
                detail = (f"Current {curr_temp}°C is within the ideal {t_min}–{t_max}°C range for {crop}. "
                          f"Historical avg for {MONTH_NAMES[current_month-1]}: {hist_temp}°C.")
            elif curr_temp < t_min:
                deficit = t_min - curr_temp
                temp_pts = max(0, round(30 * (1 - min(1, deficit / 10))))
                label = "❌ Too Cold" if deficit > 8 else "⚠️ Below Ideal"
                detail = (f"Current {curr_temp}°C is {deficit:.1f}°C below the minimum {t_min}°C needed by {crop}. "
                          f"Historical avg for {MONTH_NAMES[current_month-1]}: {hist_temp}°C.")
            else:  # too hot
                excess = curr_temp - t_max
                penalty = 2 if heat_sensitive else 1
                temp_pts = max(0, round(30 * (1 - min(1, excess * penalty / 10))))
                label = "❌ Too Hot" if excess > 8 else "⚠️ Above Ideal"
                detail = (f"Current {curr_temp}°C is {excess:.1f}°C above the maximum ideal {t_max}°C for {crop}. "
                          f"{'Heat-sensitive crop.' if heat_sensitive else ''} "
                          f"Historical avg: {hist_temp}°C.")

            # Bonus if current is better than historical for crop needs
            if hist_temp and t_min <= curr_temp <= t_max and not (t_min <= hist_temp <= t_max):
                detail += " 🌟 Current conditions are better than the typical historical baseline for this month."
                temp_pts = min(30, temp_pts + 3)

            factors.append({"label": "Temperature Now", "status": label,
                "detail": detail, "score_impact": temp_pts,
                "max_pts": 30, "current_value": f"{curr_temp}°C",
                "ideal_range": f"{t_min}–{t_max}°C"})
            score += temp_pts
        else:
            factors.append({"label": "Temperature Now", "status": "⚪ No Data",
                "detail": "Current temperature data unavailable.", "score_impact": 15,
                "max_pts": 30, "current_value": "N/A", "ideal_range": f"{ideal_temp[0]}–{ideal_temp[1]}°C"})
            score += 15

        # ══════════════════════════════════════════════════════════════════════
        # B. RAINFALL / MOISTURE MATCH  (max 25 pts)
        # ══════════════════════════════════════════════════════════════════════
        r_min, r_max = ideal_rain
        if curr_rain is not None:
            if r_min <= curr_rain <= r_max:
                rain_pts = 25
                label = "✅ Adequate"
                detail = (f"Current rainfall {curr_rain}mm is within ideal {r_min}–{r_max}mm/month for {crop}. "
                          f"Historical avg: {hist_rain}mm.")
            elif curr_rain < r_min:
                deficit_pct = (r_min - curr_rain) / max(r_min, 1)
                rain_pts = max(0, round(25 * (1 - min(1, deficit_pct))))
                label = "❌ Insufficient Rainfall" if deficit_pct > 0.6 else "⚠️ Below Ideal"
                detail = (f"Current rainfall {curr_rain}mm is well below the minimum {r_min}mm needed. "
                          f"{crop} is a {water_demand}-water-demand crop. "
                          f"Historical avg for {MONTH_NAMES[current_month-1]}: {hist_rain}mm. "
                          f"{'Supplementary irrigation essential.' if water_demand == 'high' else 'Some irrigation recommended.'}")
            else:
                excess_pct = (curr_rain - r_max) / max(r_max, 1)
                if waterlog_sens:
                    rain_pts = max(5, round(25 * (1 - min(1, excess_pct * 0.5))))
                    label = "⚠️ Excess Rain — Waterlogging Risk"
                else:
                    rain_pts = max(15, round(25 * (1 - min(0.4, excess_pct * 0.2))))
                    label = "⚠️ Above Ideal (manageable)"
                detail = (f"Current rainfall {curr_rain}mm exceeds ideal range of {r_min}–{r_max}mm. "
                          f"{'Waterlogging risk for this crop.' if waterlog_sens else 'Generally tolerable.'}")

            # Bonus: current year better than historical for this crop's needs
            if hist_rain < r_min and r_min <= curr_rain <= r_max:
                detail += " 🌟 This year is wetter than the historical norm for this month — beneficial for this crop."
                rain_pts = min(25, rain_pts + 3)
            elif hist_rain > r_max and r_min <= curr_rain <= r_max:
                detail += " 🌟 This year has better-controlled rainfall than historical avg — reduced waterlog risk."
                rain_pts = min(25, rain_pts + 3)

            factors.append({"label": "Rainfall / Moisture Now", "status": label,
                "detail": detail, "score_impact": rain_pts,
                "max_pts": 25, "current_value": f"{curr_rain}mm",
                "ideal_range": f"{r_min}–{r_max}mm/month"})
            score += rain_pts
        else:
            factors.append({"label": "Rainfall / Moisture Now", "status": "⚪ No Data",
                "detail": "Current rainfall data unavailable.", "score_impact": 12,
                "max_pts": 25, "current_value": "N/A", "ideal_range": f"{r_min}–{r_max}mm"})
            score += 12

        # ══════════════════════════════════════════════════════════════════════
        # C. HUMIDITY MATCH  (max 15 pts)
        # ══════════════════════════════════════════════════════════════════════
        h_min, h_max = ideal_humidity
        if curr_humid is not None:
            if h_min <= curr_humid <= h_max:
                hum_pts = 15
                label = "✅ Suitable"
                detail = f"Current humidity {curr_humid}% is within the ideal {h_min}–{h_max}% range for {crop}."
            elif curr_humid < h_min:
                deficit = h_min - curr_humid
                hum_pts = max(0, round(15 * (1 - min(1, deficit / 30))))
                label = "⚠️ Too Dry" if deficit > 20 else "⚠️ Slightly Dry"
                detail = f"Humidity {curr_humid}% is below ideal {h_min}%. May stress {crop}."
            else:
                excess = curr_humid - h_max
                hum_pts = max(5, round(15 * (1 - min(0.6, excess / 30))))
                label = "⚠️ High Humidity — Disease Risk"
                detail = f"Humidity {curr_humid}% exceeds ideal {h_max}% for {crop}. Fungal disease risk elevated."
            factors.append({"label": "Humidity Now", "status": label,
                "detail": detail, "score_impact": hum_pts,
                "max_pts": 15, "current_value": f"{curr_humid}%",
                "ideal_range": f"{h_min}–{h_max}%"})
            score += hum_pts
        else:
            factors.append({"label": "Humidity Now", "status": "⚪ No Data",
                "detail": "Humidity data unavailable.", "score_impact": 7,
                "max_pts": 15, "current_value": "N/A", "ideal_range": f"{h_min}–{h_max}%"})
            score += 7

        # ══════════════════════════════════════════════════════════════════════
        # D. SEASON TIMING  (bonus/neutral/penalty based on growing calendar)
        # Checks three phases: sowing window, active growing season, off-season
        # ══════════════════════════════════════════════════════════════════════
        harvest_months = crop_info.get("harvest_months", [])
        growing_months = _get_growing_months(sowing_months, harvest_months)
        months_until   = _months_until_next_window(current_month, sowing_months)
        in_growing     = current_month in growing_months

        if months_until == 0:
            timing_pts = 20
            label = "✅ In Sowing Window"
            detail = f"Currently in the optimal sowing window for {crop} ({season_label}). Best time to sow."
            score += timing_pts
        elif in_growing:
            timing_pts = 10
            label = "🌱 Active Growing Season"
            detail = (f"Currently within the growing period for {crop} ({season_label}). "
                       "Crop would be in mid-growth or approaching harvest if sown on time.")
            score += timing_pts
        elif months_until == 1:
            timing_pts = 5
            label = "⚠️ 1 Month to Sowing Window"
            detail = f"Sowing window for {crop} opens next month. Prepare land and inputs now."
            score += timing_pts
        elif months_until == 2:
            timing_pts = 0
            label = "ℹ️ 2 Months to Sowing Window"
            detail = f"{crop} ({season_label}) sowing window begins in ~2 months."
        elif months_until <= 4:
            timing_pts = -10
            label = f"⏳ {months_until} Months Until Sowing Season"
            detail = (f"{crop} is a {season_label} crop. {months_until} months before next sowing window. "
                       "Current conditions are not suitable for sowing yet.")
            score -= 10
        else:
            timing_pts = -20
            label = f"❌ Off-Season ({months_until} months from sowing)"
            detail = (f"{crop} is a {season_label} crop and is {months_until} months away from its sowing window. "
                       "Current conditions are fundamentally mismatched for this crop right now.")
            score -= 20

        harvest_display = ", ".join(MONTH_NAMES[m-1] for m in harvest_months[:3]) if harvest_months else "—"
        factors.append({"label": "Season Timing", "status": label,
            "detail": detail, "score_impact": timing_pts,
            "max_pts": 20,
            "current_value": f"{MONTH_NAMES[current_month-1]}",
            "ideal_range": f"Sow: {', '.join(MONTH_NAMES[m-1] for m in sowing_months[:3])} | Harvest: {harvest_display}"})

        # ══════════════════════════════════════════════════════════════════════
        # E. HISTORICAL SEASON QUALITY BONUS  (max +10 pts)
        # Is this year's season better than historical for this crop?
        # ══════════════════════════════════════════════════════════════════════
        rf_comparison = season_comparison.get("rainfall_comparison", "near_average")
        percentile    = season_comparison.get("percentile_rank", 50)

        if water_demand == "high":
            if rf_comparison == "above_average":
                hist_pts = 10
                hist_label = "🌧️ Season Wetter than Historical Avg"
                hist_detail = (f"This {season_type} season has more rainfall than {100-percentile:.0f}% "
                                f"of past years — favourable for high-water-demand {crop}.")
            elif rf_comparison == "below_average":
                hist_pts = 0
                hist_label = "🏜️ Season Drier than Historical Avg"
                hist_detail = (f"This {season_type} season is drier than {percentile:.0f}% of past years. "
                                f"Intensive irrigation will be needed for {crop}.")
            else:
                hist_pts = 5
                hist_label = "📊 Season Near Historical Average"
                hist_detail = "Rainfall tracking near the 20-year historical average."
        elif water_demand == "low":
            if rf_comparison == "below_average":
                hist_pts = 10
                hist_label = "☀️ Drier Season — Favourable for Low-Water Crop"
                hist_detail = f"Below-average rainfall suits low-water-demand {crop}."
            elif rf_comparison == "above_average":
                hist_pts = 2
                hist_label = "⚠️ Wetter Season — Excess for Low-Water Crop"
                hist_detail = f"Above-average rainfall may be excessive for {crop}."
            else:
                hist_pts = 6
                hist_label = "📊 Season Near Historical Average"
                hist_detail = "Rainfall near average — manageable for this crop."
        else:
            hist_pts = {"near_average": 6, "above_average": 7, "below_average": 3}.get(rf_comparison, 5)
            hist_label = "📊 Season vs Historical Average"
            hist_detail = season_comparison.get("verdict_text", "")

        factors.append({"label": f"Season Quality vs History ({season_type.title()})",
            "status": hist_label, "detail": hist_detail,
            "score_impact": hist_pts, "max_pts": 10,
            "current_value": f"{season_comparison.get('current_year_rainfall_mm', '?')}mm",
            "ideal_range": f"Hist avg {season_comparison.get('historical_avg_rainfall_mm', '?')}mm"})
        score += hist_pts

        # ══════════════════════════════════════════════════════════════════════
        # F. DISASTER RISK PENALTY  (max -20 pts)
        # ══════════════════════════════════════════════════════════════════════
        high_d = [d for d in disaster_warnings if d.get("severity") == "high"]
        med_d  = [d for d in disaster_warnings if d.get("severity") == "medium"]
        disaster_risk = "none"

        if high_d:
            disaster_risk = "high"
            score -= 20
            factors.append({
                "label": "⚠️ Recurring Disaster Risk", "status": "🚨 HIGH ALERT",
                "detail": " | ".join(
                    f"{d['event_type']} historically hits {', '.join(d['upcoming_risk_months'])} "
                    f"(last: {', '.join(str(y) for y in d['last_occurrences'][:3])})"
                    for d in high_d
                ),
                "score_impact": -20, "max_pts": 0,
                "current_value": "Active", "ideal_range": "None"
            })
        elif med_d:
            disaster_risk = "medium"
            score -= 10
            factors.append({
                "label": "Moderate Disaster Risk", "status": "⚠️ CAUTION",
                "detail": " | ".join(f"{d['event_type']} possible soon" for d in med_d),
                "score_impact": -10, "max_pts": 0,
                "current_value": "Moderate", "ideal_range": "None"
            })
        else:
            factors.append({"label": "Disaster Risk", "status": "✅ Clear",
                "detail": "No recurring disaster pattern detected for this location and season.",
                "score_impact": 0, "max_pts": 0,
                "current_value": "None", "ideal_range": "None"})

        # ── Final clamp ───────────────────────────────────────────────────────
        score = max(0, min(100, score))
        verdict, suitable = _score_to_verdict(score)

        multi_cycle = _check_multi_cycle(crop_info, rf_comparison)

        return {
            "overall_score": score, "verdict": verdict, "suitable": suitable,
            "confidence": "high" if (score >= 70 or score <= 30) else "medium",
            "summary": _build_summary_now(
                crop, score, verdict, curr_temp, curr_rain, ideal_temp, ideal_rain,
                months_until, disaster_risk, multi_cycle, state, season_label,
                MONTH_NAMES[current_month - 1]
            ),
            "key_factors": factors,
            "recommendations": _build_recommendations_now(
                crop, crop_info, score, months_until, rf_comparison,
                disaster_warnings, multi_cycle, current_month,
                curr_temp, curr_rain, ideal_temp, ideal_rain
            ),
            "multi_cycle_possible": multi_cycle,
            "disaster_risk_level": disaster_risk,
            "sowing_window_months": [MONTH_NAMES[m - 1] for m in sowing_months],
            "harvest_window_months": [MONTH_NAMES[m - 1] for m in crop_info.get("harvest_months", [])],
            "season_type": season_type,
            "season_label": season_label,
            "current_conditions_used": current_conditions,
        }


# ─────────────────────────────────────────────────────────────────────────────
# HELPERS
# ─────────────────────────────────────────────────────────────────────────────

def _get_growing_months(sowing: List[int], harvest: List[int]) -> set:
    """
    Return the set of calendar months that fall within the growing season,
    i.e. from the earliest sowing month to the latest harvest month (wrapping year boundary).
    Example: Wheat sow [10,11], harvest [3,4] → {10,11,12,1,2,3,4}
    """
    if not sowing or not harvest:
        return set()
    # Take the earliest sowing and latest harvest
    # Handle year-wrap (e.g. Oct sow, Mar harvest)
    all_months = set(sowing) | set(harvest)
    # Walk from min sow month to max harvest month, wrapping if needed
    start = min(sowing)
    end   = max(harvest)
    if end < start:
        # Wraps year boundary e.g. Oct(10) → Mar(3)
        months = set(range(start, 13)) | set(range(1, end + 1))
    else:
        months = set(range(start, end + 1))
    return months


def _months_until_next_window(current: int, sowing: List[int]) -> int:
    if not sowing: return 6
    if current in sowing: return 0
    min_diff = 12
    for s in sowing:
        diff = (s - current) % 12
        if 0 < diff < min_diff:
            min_diff = diff
    return min_diff


def _percentile_rank(value: float, data: List[float]) -> float:
    if not data: return 50.0
    below = sum(1 for x in data if x < value)
    return round(below / len(data) * 100, 1)


def _rainfall_verdict(comparison: str, percentile: float, season_display: str) -> str:
    if comparison == "above_average":
        return (f"This {season_display} season is wetter than {100 - percentile:.0f}% of "
                "years in the past decade — stronger-than-normal rainfall.")
    elif comparison == "below_average":
        return (f"This {season_display} season has been drier than {percentile:.0f}% of "
                "years in the past decade — water stress risk for moisture-dependent crops.")
    return (f"This {season_display} season is tracking near the historical average.")


def _score_to_verdict(score: int) -> Tuple[str, bool]:
    if score >= 75: return "Highly Suitable Right Now ✅", True
    if score >= 55: return "Suitable with Precautions ⚠️", True
    if score >= 35: return "Marginal — Conditions Challenging 🔶", False
    return "Not Suitable Right Now ❌", False


def _check_multi_cycle(crop_info: Dict, rf_comparison: str) -> bool:
    seasons = crop_info.get("seasons", [])
    if "Whole Year" in seasons: return True
    if (len(seasons) >= 2 and rf_comparison == "above_average"
            and crop_info.get("water_demand") == "high"):
        return True
    return False


def _build_summary_now(
    crop: str, score: int, verdict: str,
    curr_temp: Optional[float], curr_rain: Optional[float],
    ideal_temp: Tuple, ideal_rain: Tuple,
    months_until: int, disaster_risk: str,
    multi_cycle: bool, state: str, season_label: str,
    current_month_name: str,
) -> str:
    """
    Plain-English summary that directly answers: Is this crop suitable RIGHT NOW?
    """
    # Explain WHY based on actual conditions
    reasons = []

    if curr_temp is not None:
        if curr_temp < ideal_temp[0]:
            reasons.append(
                f"current temperature ({curr_temp}°C) is too cold "
                f"(needs {ideal_temp[0]}–{ideal_temp[1]}°C)"
            )
        elif curr_temp > ideal_temp[1]:
            reasons.append(
                f"current temperature ({curr_temp}°C) is too hot "
                f"(needs {ideal_temp[0]}–{ideal_temp[1]}°C)"
            )
        else:
            reasons.append(f"temperature ({curr_temp}°C) is in the ideal range")

    if curr_rain is not None:
        if curr_rain < ideal_rain[0]:
            reasons.append(
                f"rainfall ({curr_rain}mm) is far below the {ideal_rain[0]}mm minimum needed"
            )
        elif curr_rain > ideal_rain[1]:
            reasons.append(f"excess rainfall ({curr_rain}mm) may cause waterlogging")
        else:
            reasons.append(f"rainfall ({curr_rain}mm) is adequate")

    if months_until > 0:
        reasons.append(
            f"sowing window is still {months_until} month(s) away ({season_label})"
        )

    reason_text = "; ".join(reasons) if reasons else "current conditions assessed"

    disaster_note = ""
    if disaster_risk == "high":
        disaster_note = f" Additionally, {state} has high historical risk of severe weather events in the coming months."
    elif disaster_risk == "medium":
        disaster_note = f" Moderate disaster risk exists for {state} in upcoming months."

    multi_note = " Multiple cultivation cycles could be possible this year given current conditions." if multi_cycle else ""

    return (
        f"In {current_month_name}, {state}: {crop} scores {score}/100 — {verdict}. "
        f"Key reasons: {reason_text}.{disaster_note}{multi_note}"
    )


def _build_recommendations_now(
    crop: str, crop_info: Dict, score: int, months_until: int,
    rf_comparison: str, disaster_warnings: List[Dict],
    multi_cycle: bool, current_month: int,
    curr_temp: Optional[float], curr_rain: Optional[float],
    ideal_temp: Tuple, ideal_rain: Tuple,
) -> List[str]:
    recs = []

    # Core recommendation based on score
    if score >= 75:
        recs.append(
            f"✅ Current conditions are well-suited for {crop}. This is a good time to "
            "proceed with field preparation and sowing."
        )
    elif score >= 55:
        recs.append(
            f"⚠️ Conditions are marginal but workable for {crop}. Proceed with caution "
            "and closer-than-usual monitoring."
        )
    else:
        if months_until > 0:
            sowing_months_names = [MONTH_NAMES[m - 1] for m in crop_info.get("sowing_months", [])]
            recs.append(
                f"⏳ {crop} is a {crop_info.get('season_label', '')} crop. The optimal sowing window "
                f"({', '.join(sowing_months_names[:3])}) is {months_until} month(s) away. "
                "Wait for the season to begin before sowing."
            )
        else:
            recs.append(
                f"❌ Current conditions are not suitable for {crop}. Assess whether alternative "
                "crops better matched to present conditions are viable."
            )

    # Specific weather-based advice
    if curr_temp is not None and curr_temp < ideal_temp[0]:
        recs.append(
            f"🌡️ Temperature ({curr_temp}°C) is too low for {crop}. "
            f"Minimum required is {ideal_temp[0]}°C. Consider cold-tolerant varieties or wait for warmer conditions."
        )
    if curr_rain is not None and curr_rain < ideal_rain[0] and crop_info.get("water_demand") == "high":
        recs.append(
            f"💧 Rainfall ({curr_rain}mm) is insufficient for high-water-demand {crop}. "
            "Ensure reliable irrigation infrastructure before proceeding."
        )

    # Disaster warnings
    for d in disaster_warnings:
        if d.get("severity") == "high":
            months_str = ", ".join(d.get("upcoming_risk_months", []))
            recs.append(
                f"🌀 {d['event_type']} risk is HIGH in {months_str}. Consider crop insurance "
                "and short-duration varieties that harvest before peak risk period."
            )
        elif d.get("severity") == "medium":
            recs.append(
                f"⚡ Moderate {d['event_type']} risk — maintain drainage and emergency preparedness."
            )

    if multi_cycle:
        recs.append(
            f"🔄 Above-average seasonal rainfall makes multiple cultivation cycles of {crop} "
            "feasible this year if you're within or approaching the sowing window."
        )

    if not recs:
        recs.append(f"Monitor field conditions closely and consult your local KVK for {crop} guidance.")

    return recs