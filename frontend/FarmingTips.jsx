import React, { useState, useEffect } from "react";
import Chatbot from "./Chatbot";

function FarmingTips() {
  const [isOpen, setIsOpen] = useState(false);
  const [showPrompt, setShowPrompt] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      const interval = setInterval(() => {
        setShowPrompt(true);
        setTimeout(() => setShowPrompt(false), 1500);
      }, 3000);
      return () => clearInterval(interval);
    }
  }, [isOpen]);

  return (
    <div>
      {/* Chatbot icon + soft nudge */}
      {!isOpen && (
        <div
          style={{
            position: "fixed",
            bottom: "20px",
            right: "20px",
            display: "flex",
            alignItems: "center",
            zIndex: 1000,
          }}
        >
          {/* Soft nudge */}
          {showPrompt && (
            <div
              style={{
                backgroundColor: "#4CAF50",
                color: "white",
                padding: "10px 15px",
                borderRadius: "20px",
                marginRight: "10px",
                boxShadow: "0 4px 6px rgba(0,0,0,0.15)",
                animation: "softNudge 1.5s ease forwards",
                transform: "translateX(-10px)",
              }}
            >
              Hi, talk to me for farming related ideas!
            </div>
          )}

          {/* Chatbot icon */}
          <div
            onClick={() => setIsOpen(true)}
            style={{
              backgroundColor: "#4CAF50",
              color: "white",
              borderRadius: "50%",
              width: "60px",
              height: "60px",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              cursor: "pointer",
              fontSize: "28px",
              boxShadow: "0 4px 8px rgba(0,0,0,0.2)",
            }}
          >
            🤖
          </div>
        </div>
      )}

      {/* Render Chatbot only when open */}
      {isOpen && (
        <div
          style={{
            position: "fixed",
            bottom: "20px",
            right: "20px",
            zIndex: 1000,
          }}
        >
          <Chatbot onClose={() => setIsOpen(false)} />
        </div>
      )}

      <style>
        {`
          @keyframes softNudge {
            0% { opacity: 0; transform: translateX(-20px); }
            50% { opacity: 1; transform: translateX(-5px); }
            100% { opacity: 0; transform: translateX(-10px); }
          }
        `}
      </style>
    </div>
  );
}

export default FarmingTips;
