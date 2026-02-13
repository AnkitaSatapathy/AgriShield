"""
Seasonal Analysis Service
Compares current season weather to 20-year historical averages,
generates monthly predictions, and assesses crop suitability.
"""

from datetime import datetime
from typing import Dict, List, Optional, Tuple
import math

from historical_weather_service import (
    HistoricalWeatherService,
    get_coordinates,
    get_crop_info,
    MONTH_NAMES,
    CROP_SEASONAL_INFO,
)


class SeasonalAnalysisService:
    """
    Orchestrates all historical + prediction + advisory logic for the
    new /api/seasonal-analysis endpoint.
    """

    def __init__(self):
        self.hist_svc = HistoricalWeatherService()

    # ─────────────────────────────────────────────────────────────────────────
    # PUBLIC ENTRY POINT
    # ─────────────────────────────────────────────────────────────────────────
    def get_seasonal_analysis(
        self,
        state: str,
        district: str,
        crop: str,
    ) -> Dict:
        """
        Full seasonal analysis pipeline:
        1. Geocode district / state
        2. Fetch 20-year monthly climate normals
        3. Fetch current-year monthly actuals
        4. Fetch 16-day forecast & project forward to monthly
        5. Year-over-year seasonal comparison (last 10 years)
        6. Disaster / hazard warnings
        7. Score crop suitability & produce verdict
        """
        result: Dict = {
            "state": state,
            "district": district,
            "crop": crop,
            "analysis_date": datetime.now().isoformat(),
            "success": False,
            "error": None,
        }

        # ── 0. Co-ordinates ─────────────────────────────────────────────────
        coords = get_coordinates(district, state)
        if not coords:
            result["error"] = (
                f"Could not determine co-ordinates for {district}, {state}. "
                "Please check the district name."
            )
            return result

        lat, lon = coords
        result["coordinates"] = {"lat": lat, "lon": lon}
        current_month = datetime.now().month
        current_year = datetime.now().year

        # ── 1. Historical 20-year monthly normals ───────────────────────────
        hist_monthly = self.hist_svc.get_monthly_climate_normals(lat, lon)
        if not hist_monthly:
            result["error"] = "Unable to fetch historical climate data. Try again later."
            return result

        result["historical_monthly_normals"] = [
            hist_monthly[m] for m in sorted(hist_monthly.keys())
        ]

        # ── 2. Current-year monthly actuals ─────────────────────────────────
        curr_year_monthly = self.hist_svc.get_current_year_monthly(lat, lon)
        result["current_year_monthly"] = (
            [curr_year_monthly[m] for m in sorted(curr_year_monthly.keys())]
            if curr_year_monthly
            else []
        )

        # ── 3. Extended forecast (16 days) ──────────────────────────────────
        ext_forecast = self.hist_svc.get_extended_forecast(lat, lon)
        result["extended_forecast_16days"] = ext_forecast or []

        # ── 4. Monthly projected forecast  (roll 16-day into monthly bins) ──
        monthly_forecast = self._project_monthly_forecast(
            ext_forecast or [], hist_monthly, current_month, current_year
        )
        result["monthly_forecast"] = monthly_forecast

        # ── 5. Season comparison (current vs. past 10 years) ────────────────
        crop_info = get_crop_info(crop)
        season_type = _detect_season(crop_info, current_month)
        yoy = self.hist_svc.get_yearly_seasonal_data(lat, lon, season_type)
        current_season_rainfall = _sum_current_season_rainfall(
            curr_year_monthly, season_type, current_month
        )
        season_comparison = self._build_season_comparison(
            yoy or [], current_season_rainfall, season_type, current_year
        )
        result["season_comparison"] = season_comparison
        result["current_season_type"] = season_type

        # ── 6. Disaster / hazard warnings ───────────────────────────────────
        disaster_warnings = self.hist_svc.get_disaster_warnings(state, current_month)
        result["disaster_warnings"] = disaster_warnings

        # ── 7. Crop suitability scoring ──────────────────────────────────────
        suitability = self._assess_crop_suitability(
            crop=crop,
            crop_info=crop_info,
            hist_monthly=hist_monthly,
            curr_year_monthly=curr_year_monthly,
            ext_forecast=ext_forecast or [],
            season_comparison=season_comparison,
            disaster_warnings=disaster_warnings,
            current_month=current_month,
            state=state,
        )
        result["crop_suitability"] = suitability

        result["success"] = True
        return result

    # ─────────────────────────────────────────────────────────────────────────
    # MONTHLY FORECAST PROJECTION
    # ─────────────────────────────────────────────────────────────────────────
    def _project_monthly_forecast(
        self,
        ext_forecast: List[Dict],
        hist_monthly: Dict[int, Dict],
        current_month: int,
        current_year: int,
    ) -> List[Dict]:
        """
        Build a 12-month outlook:
        - Past months this year: actual data from hist (current year actuals)
        - Current + next ~2 weeks: from extended forecast
        - Remaining months: from 20-yr climate normals with anomaly offset
        """
        from collections import defaultdict

        # Group 16-day forecast into months
        forecast_by_month: Dict[int, Dict] = defaultdict(
            lambda: {"temp_max": [], "temp_min": [], "precip": [], "wind": [], "humidity": []}
        )
        for day in ext_forecast:
            m = day.get("month")
            if m:
                if day.get("temp_max") is not None:
                    forecast_by_month[m]["temp_max"].append(day["temp_max"])
                if day.get("temp_min") is not None:
                    forecast_by_month[m]["temp_min"].append(day["temp_min"])
                forecast_by_month[m]["precip"].append(day.get("precipitation_mm", 0))
                if day.get("wind_speed_kmh") is not None:
                    forecast_by_month[m]["wind"].append(day["wind_speed_kmh"])
                if day.get("humidity") is not None:
                    forecast_by_month[m]["humidity"].append(day["humidity"])

        def _avg(lst): return round(sum(lst) / len(lst), 1) if lst else None

        # Compute a temp anomaly from the 16-day window relative to climatology
        anomaly_temp = 0.0
        anomaly_precip_ratio = 1.0
        if current_month in forecast_by_month and current_month in hist_monthly:
            fc = forecast_by_month[current_month]
            hist = hist_monthly[current_month]
            fc_temp = _avg(
                [(h + l) / 2 for h, l in zip(fc["temp_max"], fc["temp_min"])
                 if h and l]
            )
            if fc_temp and hist.get("temp_mean"):
                anomaly_temp = fc_temp - hist["temp_mean"]
            fc_precip = sum(fc["precip"])
            # Scale to monthly total (16-day covers ~50% of month avg)
            days_in_forecast = len(fc["precip"])
            if days_in_forecast > 0 and hist.get("precipitation_mm") and hist["precipitation_mm"] > 0:
                expected_partial = hist["precipitation_mm"] * (days_in_forecast / 30)
                anomaly_precip_ratio = fc_precip / max(expected_partial, 1)

        monthly_outlook = []
        for m in range(1, 13):
            hist = hist_monthly.get(m, {})
            label = "historical_avg"

            if m in forecast_by_month and len(forecast_by_month[m]["temp_max"]) >= 5:
                fc = forecast_by_month[m]
                temp_mean = _avg(
                    [(h + l) / 2 for h, l in zip(fc["temp_max"], fc["temp_min"])
                     if h and l]
                )
                precip = round(sum(fc["precip"]), 1)
                wind = _avg(fc["wind"])
                humidity = _avg(fc["humidity"])
                label = "forecast"
            else:
                # Use historical + anomaly offset
                base_temp = hist.get("temp_mean")
                temp_mean = round(base_temp + anomaly_temp, 1) if base_temp else hist.get("temp_mean")
                hist_precip = hist.get("precipitation_mm") or 0
                precip = round(hist_precip * anomaly_precip_ratio, 1)
                wind = hist.get("wind_speed_kmh")
                humidity = hist.get("humidity")
                label = "projected_from_normals"

            monthly_outlook.append({
                "month": m,
                "month_name": MONTH_NAMES[m - 1],
                "temp_mean": temp_mean,
                "temp_max": hist.get("temp_max"),
                "temp_min": hist.get("temp_min"),
                "precipitation_mm": precip,
                "wind_speed_kmh": wind,
                "humidity": humidity,
                "data_source": label,
                "historical_avg_precip": hist.get("precipitation_mm"),
                "historical_avg_temp": hist.get("temp_mean"),
            })

        return monthly_outlook

    # ─────────────────────────────────────────────────────────────────────────
    # SEASON COMPARISON (year-over-year)
    # ─────────────────────────────────────────────────────────────────────────
    def _build_season_comparison(
        self,
        yoy: List[Dict],
        current_season_rainfall: float,
        season_type: str,
        current_year: int,
    ) -> Dict:
        if not yoy:
            return {"error": "Year-over-year data unavailable"}

        rainfalls = [y["total_rainfall_mm"] for y in yoy if y["total_rainfall_mm"] > 0]
        avg_rainfall = round(sum(rainfalls) / len(rainfalls), 1) if rainfalls else 0
        max_rf = max(rainfalls) if rainfalls else 0
        min_rf = min(rainfalls) if rainfalls else 0

        comparison = "above_average" if current_season_rainfall > avg_rainfall * 1.1 else (
            "below_average" if current_season_rainfall < avg_rainfall * 0.9 else "near_average"
        )

        percentile = _percentile_rank(current_season_rainfall, rainfalls)

        yoy_with_current = yoy + [{
            "year": current_year,
            "season": season_type,
            "total_rainfall_mm": current_season_rainfall,
            "avg_temp": None,
            "is_current_year": True,
        }]

        return {
            "season_type": season_type,
            "current_year_rainfall_mm": current_season_rainfall,
            "historical_avg_rainfall_mm": avg_rainfall,
            "historical_max_rainfall_mm": max_rf,
            "historical_min_rainfall_mm": min_rf,
            "rainfall_comparison": comparison,
            "percentile_rank": percentile,
            "verdict_text": _rainfall_verdict(comparison, percentile, season_type),
            "yearly_data": yoy_with_current,
        }

    # ─────────────────────────────────────────────────────────────────────────
    # CROP SUITABILITY SCORING
    # ─────────────────────────────────────────────────────────────────────────
    def _assess_crop_suitability(
        self,
        crop: str,
        crop_info: Optional[Dict],
        hist_monthly: Dict[int, Dict],
        curr_year_monthly: Optional[Dict[int, Dict]],
        ext_forecast: List[Dict],
        season_comparison: Dict,
        disaster_warnings: List[Dict],
        current_month: int,
        state: str,
    ) -> Dict:
        if not crop_info:
            return {
                "overall_score": 50,
                "verdict": "Unknown",
                "confidence": "low",
                "suitable": True,
                "summary": f"No specific seasonal data available for {crop}. Monitor conditions manually.",
                "key_factors": [],
                "recommendations": [],
                "multi_cycle_possible": False,
                "disaster_risk_level": "unknown",
            }

        factors: List[Dict] = []
        score = 100  # start full, deduct

        # ── A. Season/month alignment ────────────────────────────────────────
        sowing_months = crop_info.get("sowing_months", [])
        months_until_sowing = _months_until_next_window(current_month, sowing_months)
        if months_until_sowing == 0:
            factors.append({"label": "Sowing Window", "status": "✅ Optimal",
                            "detail": f"Currently in ideal sowing window for {crop}.", "score_impact": 0})
        elif months_until_sowing <= 2:
            factors.append({"label": "Sowing Window", "status": "⚠️ Approaching",
                            "detail": f"Sowing window in ~{months_until_sowing} month(s).", "score_impact": -5})
        else:
            factors.append({"label": "Sowing Window", "status": "ℹ️ Off-season",
                            "detail": f"Next sowing window in ~{months_until_sowing} month(s).", "score_impact": -15})
            score -= 15

        # ── B. Rainfall adequacy ─────────────────────────────────────────────
        ideal_rain = crop_info.get("ideal_rainfall_monthly_mm", (60, 200))
        sowing_months_rain = []
        for sm in sowing_months:
            m_data = (curr_year_monthly or {}).get(sm) or hist_monthly.get(sm) or {}
            p = m_data.get("precipitation_mm")
            if p:
                sowing_months_rain.append(p)

        if sowing_months_rain:
            avg_rain = sum(sowing_months_rain) / len(sowing_months_rain)
            if ideal_rain[0] <= avg_rain <= ideal_rain[1]:
                factors.append({"label": "Rainfall", "status": "✅ Adequate",
                                "detail": f"Avg sowing-period rainfall {avg_rain:.0f}mm is within ideal {ideal_rain[0]}–{ideal_rain[1]}mm range.",
                                "score_impact": 0})
            elif avg_rain < ideal_rain[0]:
                deficit_pct = (ideal_rain[0] - avg_rain) / ideal_rain[0] * 100
                impact = -int(min(20, deficit_pct * 0.4))
                factors.append({"label": "Rainfall", "status": "⚠️ Below Ideal",
                                "detail": f"Avg rainfall {avg_rain:.0f}mm is {deficit_pct:.0f}% below ideal minimum. Supplementary irrigation may be needed.",
                                "score_impact": impact})
                score += impact
            else:
                excess_pct = (avg_rain - ideal_rain[1]) / ideal_rain[1] * 100
                impact = -int(min(15, excess_pct * 0.3))
                factors.append({"label": "Rainfall", "status": "⚠️ Excess Risk",
                                "detail": f"Avg rainfall {avg_rain:.0f}mm exceeds ideal range by {excess_pct:.0f}%. Waterlogging risk possible.",
                                "score_impact": impact})
                score += impact

        # ── C. Season comparison (is this year wetter/drier than normal?) ──
        rf_comparison = season_comparison.get("rainfall_comparison", "near_average")
        percentile = season_comparison.get("percentile_rank", 50)
        water_demand = crop_info.get("water_demand", "medium")
        if water_demand == "high":
            if rf_comparison == "above_average":
                factors.append({"label": "Season Rainfall vs History", "status": "✅ Favorable",
                                "detail": f"This season is wetter than average (top {100-percentile:.0f}th percentile), beneficial for high water-demand crop {crop}.",
                                "score_impact": +10})
                score += 10
            elif rf_comparison == "below_average":
                factors.append({"label": "Season Rainfall vs History", "status": "⚠️ Below Average",
                                "detail": f"This season is drier than normal ({percentile:.0f}th percentile). High water-demand {crop} may need intensive irrigation.",
                                "score_impact": -10})
                score -= 10
        elif water_demand == "low":
            if rf_comparison == "above_average":
                factors.append({"label": "Season Rainfall vs History", "status": "⚠️ Excess Risk",
                                "detail": f"Above-average rainfall may cause waterlogging risk for low water-demand {crop}.",
                                "score_impact": -8})
                score -= 8
        else:
            factors.append({"label": "Season Rainfall vs History",
                            "status": "✅ Normal" if rf_comparison == "near_average" else ("🌧️ Above avg" if rf_comparison == "above_average" else "🏜️ Below avg"),
                            "detail": season_comparison.get("verdict_text", ""),
                            "score_impact": 0})

        # ── D. Temperature suitability ───────────────────────────────────────
        ideal_temp = crop_info.get("ideal_temp_range", (15, 35))
        heat_sensitive = crop_info.get("heat_sensitive", False)
        temp_deductions = 0
        for sm in sowing_months:
            m_data = (curr_year_monthly or {}).get(sm) or hist_monthly.get(sm) or {}
            t = m_data.get("temp_mean")
            if t:
                if t < ideal_temp[0]:
                    temp_deductions += 5
                elif t > ideal_temp[1]:
                    temp_deductions += (10 if heat_sensitive else 5)

        if temp_deductions == 0:
            factors.append({"label": "Temperature", "status": "✅ Suitable",
                            "detail": f"Temperatures align with ideal {ideal_temp[0]}–{ideal_temp[1]}°C range for {crop}.",
                            "score_impact": 0})
        else:
            avg_impact = -min(20, temp_deductions)
            factors.append({"label": "Temperature", "status": "⚠️ Outside Ideal Range",
                            "detail": f"Some sowing-period months have temperatures outside the ideal {ideal_temp[0]}–{ideal_temp[1]}°C range.",
                            "score_impact": avg_impact})
            score += avg_impact

        # ── E. Disaster risk ─────────────────────────────────────────────────
        high_disasters = [d for d in disaster_warnings if d.get("severity") == "high"]
        med_disasters = [d for d in disaster_warnings if d.get("severity") == "medium"]
        disaster_risk = "none"
        if high_disasters:
            disaster_risk = "high"
            deduct = -20
            factors.append({
                "label": "⚠️ Recurring Disaster Risk",
                "status": "🚨 HIGH ALERT",
                "detail": " | ".join(
                    f"{d['event_type']} historically hits in {', '.join(d['upcoming_risk_months'])} "
                    f"(last: {', '.join(str(y) for y in d['last_occurrences'][:3])})"
                    for d in high_disasters
                ),
                "score_impact": deduct,
            })
            score += deduct
        elif med_disasters:
            disaster_risk = "medium"
            deduct = -10
            factors.append({
                "label": "Moderate Disaster Risk",
                "status": "⚠️ CAUTION",
                "detail": " | ".join(
                    f"{d['event_type']} possible in upcoming months"
                    for d in med_disasters
                ),
                "score_impact": deduct,
            })
            score += deduct
        else:
            factors.append({"label": "Disaster Risk", "status": "✅ No Historical Pattern",
                            "detail": "No major recurring disaster pattern detected for this region and season.",
                            "score_impact": 0})

        # ── F. Multi-cycle possibility ────────────────────────────────────────
        multi_cycle = _check_multi_cycle(
            crop_info, rf_comparison, hist_monthly, curr_year_monthly
        )

        # ── Final score clamp ─────────────────────────────────────────────────
        score = max(0, min(100, score))

        verdict, suitable = _score_to_verdict(score)

        recommendations = _build_recommendations(
            crop=crop,
            crop_info=crop_info,
            score=score,
            rf_comparison=rf_comparison,
            disaster_warnings=disaster_warnings,
            multi_cycle=multi_cycle,
            current_month=current_month,
        )

        summary = _build_summary(
            crop=crop,
            score=score,
            verdict=verdict,
            rf_comparison=rf_comparison,
            disaster_risk=disaster_risk,
            multi_cycle=multi_cycle,
            state=state,
            current_month=current_month,
        )

        return {
            "overall_score": score,
            "verdict": verdict,
            "suitable": suitable,
            "confidence": "high" if score >= 70 or score <= 30 else "medium",
            "summary": summary,
            "key_factors": factors,
            "recommendations": recommendations,
            "multi_cycle_possible": multi_cycle,
            "disaster_risk_level": disaster_risk,
            "sowing_window_months": [MONTH_NAMES[m - 1] for m in crop_info.get("sowing_months", [])],
            "harvest_window_months": [MONTH_NAMES[m - 1] for m in crop_info.get("harvest_months", [])],
            "season_type": _detect_season(crop_info, datetime.now().month),
        }


# ─────────────────────────────────────────────────────────────────────────────
# HELPER FUNCTIONS
# ─────────────────────────────────────────────────────────────────────────────

def _detect_season(crop_info: Optional[Dict], current_month: int) -> str:
    if not crop_info:
        return "kharif" if 6 <= current_month <= 10 else "rabi"
    seasons = crop_info.get("seasons", [])
    if "Rabi" in seasons:
        return "rabi"
    return "kharif"


def _months_until_next_window(current: int, sowing: List[int]) -> int:
    if not sowing:
        return 6
    if current in sowing:
        return 0
    min_diff = 12
    for s in sowing:
        diff = (s - current) % 12
        if 0 < diff < min_diff:
            min_diff = diff
    return min_diff


def _sum_current_season_rainfall(
    curr_year: Optional[Dict[int, Dict]],
    season_type: str,
    current_month: int,
) -> float:
    if not curr_year:
        return 0.0
    if season_type == "kharif":
        months = [m for m in [6, 7, 8, 9] if m <= current_month]
    elif season_type == "rabi":
        months = [m for m in [10, 11, 12, 1, 2] if m <= current_month]
    else:
        months = list(range(1, current_month + 1))
    return round(
        sum(curr_year[m].get("precipitation_mm", 0) for m in months if m in curr_year), 1
    )


def _percentile_rank(value: float, data: List[float]) -> float:
    if not data:
        return 50.0
    below = sum(1 for x in data if x < value)
    return round(below / len(data) * 100, 1)


def _rainfall_verdict(comparison: str, percentile: float, season_type: str) -> str:
    season_label = "Kharif/Monsoon" if season_type == "kharif" else "Rabi"
    if comparison == "above_average":
        return (
            f"This {season_label} season is wetter than {100-percentile:.0f}% of years in the past decade — "
            "indicating a stronger-than-normal monsoon / rainfall pattern."
        )
    elif comparison == "below_average":
        return (
            f"This {season_label} season has been drier than {percentile:.0f}% of years in the past decade — "
            "water stress may affect moisture-dependent crops without supplemental irrigation."
        )
    return (
        f"This {season_label} season is tracking near the historical average, "
        "consistent with typical weather patterns."
    )


def _score_to_verdict(score: int) -> Tuple[str, bool]:
    if score >= 75:
        return "Highly Suitable ✅", True
    elif score >= 55:
        return "Suitable with Precautions ⚠️", True
    elif score >= 35:
        return "Marginal — Exercise Caution 🔶", True
    else:
        return "Not Recommended This Season ❌", False


def _check_multi_cycle(
    crop_info: Dict,
    rf_comparison: str,
    hist_monthly: Dict,
    curr_year: Optional[Dict],
) -> bool:
    """Can the crop be grown more than once this year given conditions?"""
    seasons = crop_info.get("seasons", [])
    if "Whole Year" in seasons:
        return True
    if len(seasons) >= 2 and rf_comparison in ("above_average", "near_average"):
        # High water demand crops can do multiple cycles if rainfall is good
        if crop_info.get("water_demand") == "high" and rf_comparison == "above_average":
            return True
    return False


def _build_recommendations(
    crop: str,
    crop_info: Dict,
    score: int,
    rf_comparison: str,
    disaster_warnings: List[Dict],
    multi_cycle: bool,
    current_month: int,
) -> List[str]:
    recs = []
    sowing_months = crop_info.get("sowing_months", [])

    if multi_cycle:
        recs.append(
            f"🔄 Multiple cropping cycles of {crop} may be feasible this year given above-normal rainfall — "
            "consider a second or relay cropping round to maximise yield."
        )

    if rf_comparison == "above_average" and crop_info.get("water_demand") == "high":
        recs.append(
            f"💧 Above-average rainfall this season is highly beneficial for {crop}. "
            "Reduce supplemental irrigation frequency; monitor for waterlogging."
        )
    elif rf_comparison == "below_average":
        recs.append(
            f"🏜️ Below-average rainfall detected. Ensure reliable irrigation access before sowing {crop}. "
            "Consider drought-tolerant varieties."
        )

    if score < 55:
        recs.append(
            f"⚠️ Overall suitability score is low ({score}/100). Consult your local Krishi Vigyan Kendra (KVK) "
            f"before committing to large-scale {crop} cultivation this season."
        )

    for d in disaster_warnings:
        if d.get("severity") == "high":
            months_str = ", ".join(d.get("upcoming_risk_months", []))
            recs.append(
                f"🌀 {d['event_type']} risk is HIGH in {months_str} based on past {len(d.get('last_occurrences',[]))} years. "
                "Consider insurance coverage and short-duration varieties that can be harvested before peak risk window."
            )
        elif d.get("severity") == "medium":
            recs.append(
                f"⚡ Moderate {d['event_type']} risk ahead. Keep emergency drainage/flood-proofing measures ready."
            )

    months_until = _months_until_next_window(current_month, sowing_months)
    if 1 <= months_until <= 2:
        month_names = [MONTH_NAMES[m - 1] for m in sowing_months]
        recs.append(
            f"📅 Optimal sowing window ({', '.join(month_names)}) is approaching. "
            "Prepare seeds, soil, and inputs now for timely sowing."
        )

    if not recs:
        recs.append(
            f"✅ Conditions appear generally favourable for {crop}. "
            "Continue regular monitoring and follow local KVK guidance."
        )

    return recs


def _build_summary(
    crop: str,
    score: int,
    verdict: str,
    rf_comparison: str,
    disaster_risk: str,
    multi_cycle: bool,
    state: str,
    current_month: int,
) -> str:
    season_label = "Kharif (Monsoon)" if 6 <= current_month <= 10 else "Rabi (Winter)"
    rf_desc = {
        "above_average": "above-average rainfall",
        "below_average": "below-average rainfall",
        "near_average": "near-normal rainfall",
    }.get(rf_comparison, "")

    disaster_note = ""
    if disaster_risk == "high":
        disaster_note = (
            f" ⚠️ Importantly, {state} has a history of severe weather events "
            "(cyclone / flood / heatwave) in the coming months — this significantly impacts suitability."
        )
    elif disaster_risk == "medium":
        disaster_note = f" Moderate historical disaster risk exists; plan accordingly."

    multi_note = (
        " Multiple cultivation cycles appear feasible given current season conditions."
        if multi_cycle else ""
    )

    return (
        f"For {crop} in {state} during {season_label}, the overall suitability score is "
        f"{score}/100 — {verdict}. "
        f"This season is showing {rf_desc} compared to the 20-year historical average."
        f"{disaster_note}{multi_note}"
    )