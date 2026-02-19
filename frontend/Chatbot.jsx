import React, { useState, useEffect, useRef } from "react";

const Chatbot = ({ onClose }) => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [sessionId, setSessionId] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [tone, setTone] = useState("formal");
  const [buttonClicked, setButtonClicked] = useState(false);
  const [showOptionsAgain, setShowOptionsAgain] = useState(false);
  const [awaitingCropSeason, setAwaitingCropSeason] = useState(false);
  const [lastFollowUp, setLastFollowUp] = useState(""); // Track last follow-up question
  const [showTopicButtons, setShowTopicButtons] = useState(false); // NEW: Show topic buttons after "no"
  const messagesEndRef = useRef(null);
  const inactivityTimeoutRef = useRef(null);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Prevent body scroll
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "unset";
    };
  }, []);

  // Reset inactivity timer
  const resetInactivityTimer = () => {
    if (inactivityTimeoutRef.current) {
      clearTimeout(inactivityTimeoutRef.current);
    }
    inactivityTimeoutRef.current = setTimeout(() => {
      if (buttonClicked) {
        setShowOptionsAgain(true);
      }
    }, 120000); // 2 minutes (120 seconds)
  };

  // Setup timer
  useEffect(() => {
    if (buttonClicked && !isLoading && messages.length > 0) {
      resetInactivityTimer();
    }
    return () => {
      if (inactivityTimeoutRef.current) {
        clearTimeout(inactivityTimeoutRef.current);
      }
    };
  }, [messages, isLoading, buttonClicked]);

  const sendMessage = async (messageText = input) => {
    if (!messageText.trim()) return;

    const userMsg = { sender: "user", text: messageText };
    setMessages((prev) => [...prev, userMsg]);
    setIsLoading(true);
    setShowOptionsAgain(false);
    setShowTopicButtons(false); // Hide buttons while sending

    const messageTextLower = messageText.toLowerCase();
    const affirmativeWords = ["yes", "yeah", "yep", "sure", "ok", "okay", "definitely", "absolutely", "please", "want"];
    const negativeWords = ["no", "nope", "nah", "don't", "dont", "not interested", "skip"];
    const isAffirmative = affirmativeWords.some(word => messageTextLower.includes(word));
    const isNegative = negativeWords.some(word => messageTextLower.includes(word));

    // If user says yes/sure and there's a follow-up question, send directly to backend
    if (isAffirmative && lastFollowUp && lastFollowUp.trim()) {
      try {
        const res = await fetch("http://localhost:8000/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            message: messageText,
            session_id: sessionId,
            tone: tone,
            button_clicked: buttonClicked,
          }),
        });
        const data = await res.json();

        if (!sessionId && data.session_id) setSessionId(data.session_id);
        setMessages((prev) => [...prev, { sender: "bot", text: data.reply }]);
        
        // Extract next follow-up from response
        const followUpMatch = data.reply.match(/\*\*\*\*\s*(.+?)(?:\n|$)/);
        if (followUpMatch) {
          const newFollowUp = followUpMatch[1].trim();
          setLastFollowUp(newFollowUp);
        } else {
          setLastFollowUp("");
        }
      } catch (err) {
        console.error(err);
        setMessages((prev) => [...prev, { sender: "bot", text: "Error contacting server." }]);
      } finally {
        setIsLoading(false);
      }
   } else if (isNegative) {
      setLastFollowUp("");
      setShowTopicButtons(true);
      setIsLoading(false);

      return;
   
    } else {
      // Normal message handling
      try {
        const res = await fetch("http://localhost:8000/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            message: messageText,
            session_id: sessionId,
            tone: tone,
            button_clicked: buttonClicked,
          }),
        });
        const data = await res.json();

        if (!sessionId && data.session_id) setSessionId(data.session_id);
        setMessages((prev) => [...prev, { sender: "bot", text: data.reply }]);
        
        // Extract follow-up question from bot response and store it
        const followUpMatch = data.reply.match(/\*\*\*\*\s*(.+?)(?:\n|$)/);
        if (followUpMatch) {
          const newFollowUp = followUpMatch[1].trim();
          setLastFollowUp(newFollowUp);
        } else {
          setLastFollowUp("");
        }
        
        // After user provides crop/season, no longer awaiting
        if (awaitingCropSeason) {
          setAwaitingCropSeason(false);
        }
      } catch (err) {
        console.error(err);
        setMessages((prev) => [...prev, { sender: "bot", text: "Error contacting server." }]);
      } finally {
        setIsLoading(false);
      }
    }

    setInput("");
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !isLoading) {
      if (buttonClicked) {
        sendMessage();
      }
    }
  };

  const handleQuickButton = (text) => {
    setShowTopicButtons(false); // Hide buttons when a button is clicked
    sendMessage(text);
  };

  const handleTopicButton = (text) => {
  setShowTopicButtons(false);

  // 🔥 Reset context behavior
  setAwaitingCropSeason(true);
  setLastFollowUp("");
  setButtonClicked(true);

  // Add user message manually
  const userMsg = { sender: "user", text: text };
  setMessages((prev) => [...prev, userMsg]);

  // Immediately ask crop & season again
  const cropSeasonQuestion =
    "🌾 Which crop would you like to know about?\n\n" +
    "(e.g., rice, wheat, tomato, potato, cotton, sugarcane, maize, groundnut, etc.)\n\n" +
    "And which season? (Kharif, Rabi, or Summer)";

  setMessages((prev) => [
    ...prev,
    { sender: "bot", text: cropSeasonQuestion },
  ]);
};

  const handleInitialButton = (text) => {
    setButtonClicked(true);
    setShowOptionsAgain(false);
    setAwaitingCropSeason(true);
    setInput(text);

    setTimeout(() => {
      const userMsg = { sender: "user", text: text };
      setMessages((prev) => [...prev, userMsg]);

      // Immediately show crop/season question
      const cropSeasonQuestion = "🌾 Which crop would you like to know about?\n\n(e.g., rice, wheat, tomato, potato, cotton, sugarcane, maize, groundnut, etc.)\n\nAnd which season? (Kharif, Rabi, or Summer)";
      setMessages((prev) => [...prev, { sender: "bot", text: cropSeasonQuestion }]);
    }, 0);
  };

  const changeTone = (newTone) => {
    setTone(newTone);
    setMessages([]);
    setSessionId(null);
    setButtonClicked(false);
    setShowOptionsAgain(false);
    setAwaitingCropSeason(false);
    setLastFollowUp("");
    setShowTopicButtons(false);
  };

  return (
    <>
      <style>{chatbotStyles}</style>

      <div className="chatbot-overlay" onClick={onClose} />

      <div className="chatbot-modal">
        <div className="chatbot-header">
          <div className="chatbot-title">
            <span className="chatbot-icon">🌾</span>
            <h2>AgriShield Assistant</h2>
          </div>

          <div className="tone-toggle">
            <button
              className={`tone-btn ${tone === "formal" ? "active" : ""}`}
              onClick={() => changeTone("formal")}
            >
              📋 Formal
            </button>
            <button
              className={`tone-btn ${tone === "interesting" ? "active" : ""}`}
              onClick={() => changeTone("interesting")}
            >
              😄 Interesting
            </button>
          </div>

          <button className="chatbot-close-btn" onClick={onClose}>✕</button>
        </div>

        <div className="chatbot-wrapper">
          <div className="chatbot-messages">
            {/* STEP 1: Welcome screen with options */}
            {messages.length === 0 && !buttonClicked ? (
              <div className="chatbot-welcome">
                <div className="welcome-icon">🤖</div>
                <h3>AgriShield</h3>
                <p style={{ marginBottom: "30px" }}>Select a topic to get started</p>

                <div className="quick-buttons">
                  <button
                    className="quick-btn"
                    onClick={() => handleInitialButton("")}
                  >
                    🌱 Crop Cultivation
                  </button>
                  <button
                    className="quick-btn"
                    onClick={() => handleInitialButton("How to manage soil?")}
                  >
                    🌍 Soil Management
                  </button>
                  <button
                    className="quick-btn"
                    onClick={() => handleInitialButton("Water management tips")}
                  >
                    💧 Water Management
                  </button>
                  <button
                    className="quick-btn"
                    onClick={() => handleInitialButton("Pest and disease control")}
                  >
                    🐛 Pest Control
                  </button>
                  <button
                    className="quick-btn"
                    onClick={() => handleInitialButton("Fertilizer recommendations")}
                  >
                    🧴 Fertilizers
                  </button>
                  <button
                    className="quick-btn"
                    onClick={() => handleInitialButton("Organic farming methods")}
                  >
                    🌿 Organic Farming
                  </button>
                </div>
              </div>
            ) : (
              <>
                {/* Display messages after button clicked */}
                {messages.map((msg, idx) => (
                  <div key={idx} className={`chatbot-message ${msg.sender}`}>
                    <div className="chatbot-message-icon">
                      {msg.sender === "bot" ? "🤖" : "👨‍🌾"}
                    </div>
                    <div className="chatbot-message-content">
                      <div className="chatbot-message-bubble">{msg.text}</div>
                    </div>
                  </div>
                ))}

                {/* NEW: Show topic buttons after "no" response */}
                {showTopicButtons && !isLoading && (
                  <div className="no-response-buttons">
                    <p>Select a topic to explore:</p>
                    <div className="quick-buttons">
                      <button
                        className="quick-btn"
                        onClick={() => handleTopicButton("Tell me about crop cultivation")}
                      >
                        🌱 Crop Cultivation
                      </button>
                      <button
                        className="quick-btn"
                        onClick={() => handleTopicButton("How to manage soil?")}
                      >
                        🌍 Soil Management
                      </button>
                      <button
                        className="quick-btn"
                        onClick={() => handleTopicButton("Water management tips")}
                      >
                        💧 Water Management
                      </button>
                      <button
                        className="quick-btn"
                        onClick={() => handleTopicButton("Pest and disease control")}
                      >
                        🐛 Pest Control
                      </button>
                      <button
                        className="quick-btn"
                        onClick={() => handleTopicButton("Fertilizer recommendations")}
                      >
                        🧴 Fertilizers
                      </button>
                      <button
                        className="quick-btn"
                        onClick={() => handleTopicButton("Organic farming methods")}
                      >
                        🌿 Organic Farming
                      </button>
                    </div>
                  </div>
                )}

                {/* STEP 9: Show options again after 40 seconds inactivity */}
                {showOptionsAgain && !isLoading && !showTopicButtons && (
                  <div className="inactivity-message">
                    <p>What would you like to know about?</p>
                    <div className="quick-buttons">
                      <button
                        className="quick-btn"
                        onClick={() => handleQuickButton("Tell me about crop cultivation")}
                      >
                        🌱 Crop Cultivation
                      </button>
                      <button className="quick-btn" onClick={() => handleQuickButton("How to manage soil?")}>
                        🌍 Soil Management
                      </button>
                      <button
                        className="quick-btn"
                        onClick={() => handleQuickButton("Water management tips")}
                      >
                        💧 Water Management
                      </button>
                      <button
                        className="quick-btn"
                        onClick={() => handleQuickButton("Pest and disease control")}
                      >
                        🐛 Pest Control
                      </button>
                      <button
                        className="quick-btn"
                        onClick={() => handleQuickButton("Fertilizer recommendations")}
                      >
                        🧴 Fertilizers
                      </button>
                      <button
                        className="quick-btn"
                        onClick={() => handleQuickButton("Organic farming methods")}
                      >
                        🌿 Organic Farming
                      </button>
                    </div>
                  </div>
                )}
              </>
            )}

            {isLoading && (
              <div className="chatbot-message bot">
                <div className="chatbot-message-icon">🤖</div>
                <div className="chatbot-message-content">
                  <div className="chatbot-message-bubble loading-bubble">
                    <span className="typing-dot">.</span>
                    <span className="typing-dot">.</span>
                    <span className="typing-dot">.</span>
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* STEP 4-8: Input only appears after button clicked and no topic buttons shown */}
          {buttonClicked && !showOptionsAgain && !showTopicButtons && (
            <div className="chatbot-input-container">
              <input
                type="text"
                className="chatbot-input"
                placeholder="Type your message..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                disabled={isLoading}
              />
              <button
                onClick={() => sendMessage()}
                className="chatbot-send-btn"
                disabled={isLoading || !input.trim()}
              >
                {isLoading ? "⏳" : "✈️"}
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

const chatbotStyles = `
body {
  overflow: hidden;
}

html {
  overflow: auto;
}

.chatbot-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 999;
  backdrop-filter: blur(3px);
  animation: fadeIn 0.3s ease-out;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

.chatbot-modal {
  position: fixed;
  top: 50%;
  left: 50%;
  width: 60vw;
  height: 100vh;
  min-width: 600px;
  background: linear-gradient(135deg, #0d1f1a 0%, #0f2820 50%, #0d1f1a 100%);
  border-radius: 20px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.7);
  display: flex;
  flex-direction: column;
  z-index: 1000;
  border: 2px solid rgba(76, 175, 80, 0.3);
  transform: translate(-50%, -50%);
  margin: 0;
  padding: 0;
}

.chatbot-header {
  padding: 20px 30px;
  background: linear-gradient(135deg, rgba(76, 175, 80, 0.25) 0%, rgba(76, 175, 80, 0.12) 100%);
  border-bottom: 3px solid rgba(76, 175, 80, 0.5);
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-radius: 20px 20px 0 0;
  box-shadow: 0 4px 12px rgba(76, 175, 80, 0.15);
  gap: 15px;
}

.chatbot-title {
  display: flex;
  align-items: center;
  gap: 15px;
  min-width: 200px;
}

.chatbot-icon {
  font-size: 2.2rem;
  animation: bounce 2s infinite;
}

@keyframes bounce {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-8px); }
}

.chatbot-title h2 {
  color: #4CAF50;
  margin: 0;
  font-size: 1.8rem;
  font-weight: 700;
  letter-spacing: 1px;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
  white-space: nowrap;
}

.tone-toggle {
  display: flex;
  gap: 8px;
  flex: 1;
  justify-content: center;
}

.tone-btn {
  padding: 8px 16px;
  border: 2px solid rgba(76, 175, 80, 0.4);
  background: rgba(76, 175, 80, 0.08);
  color: #a8d5a8;
  border-radius: 20px;
  cursor: pointer;
  font-size: 0.9rem;
  font-weight: 600;
  transition: all 0.3s ease;
  white-space: nowrap;
}

.tone-btn:hover {
  background: rgba(76, 175, 80, 0.15);
  border-color: rgba(76, 175, 80, 0.6);
}

.tone-btn.active {
  background: rgba(76, 175, 80, 0.3);
  border-color: #4CAF50;
  color: #4CAF50;
  box-shadow: 0 0 10px rgba(76, 175, 80, 0.3);
}

.chatbot-close-btn {
  background: rgba(255, 255, 255, 0.1);
  color: #4CAF50;
  border: 2px solid rgba(76, 175, 80, 0.3);
  width: 45px;
  height: 45px;
  border-radius: 50%;
  cursor: pointer;
  font-size: 1.3rem;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
  flex-shrink: 0;
}

.chatbot-close-btn:hover {
  background: rgba(76, 175, 80, 0.15);
  border-color: rgba(76, 175, 80, 0.5);
  transform: rotate(90deg);
}

.chatbot-wrapper {
  width: 100%;
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.chatbot-welcome {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: 50px 40px;
  animation: fadeIn 0.8s ease;
  background: linear-gradient(135deg, rgba(76, 175, 80, 0.05) 0%, transparent 100%);
}

.welcome-icon {
  font-size: 5rem;
  margin-bottom: 25px;
  animation: float 3s ease-in-out infinite;
}

@keyframes float {
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-20px); }
}

.chatbot-welcome h3 {
  color: #4CAF50;
  font-size: 2.2rem;
  margin: 15px 0;
  font-weight: 700;
  letter-spacing: 0.5px;
}

.chatbot-welcome p {
  color: #a8d5a8;
  font-size: 1.05rem;
  max-width: 450px;
  line-height: 1.7;
  font-weight: 400;
}

.chatbot-messages {
  flex: 1;
  overflow-y: auto;
  padding: 30px;
  display: flex;
  flex-direction: column;
  gap: 18px;
  scroll-behavior: smooth;
  background: linear-gradient(135deg, #0a1511 0%, #0f2820 100%);
}

.chatbot-messages::-webkit-scrollbar {
  width: 8px;
}

.chatbot-messages::-webkit-scrollbar-track {
  background: rgba(76, 175, 80, 0.08);
  border-radius: 10px;
}

.chatbot-messages::-webkit-scrollbar-thumb {
  background: linear-gradient(135deg, #4CAF50 0%, #2e7d32 100%);
  border-radius: 10px;
}

.chatbot-message {
  display: flex;
  align-items: flex-start;
  gap: 14px;
  animation: messageSlideIn 0.4s ease;
}

@keyframes messageSlideIn {
  from {
    opacity: 0;
    transform: translateY(15px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.chatbot-message.bot {
  flex-direction: row;
  justify-content: flex-start;
}

.chatbot-message.user {
  flex-direction: row-reverse;
  justify-content: flex-end;
}

.chatbot-message-icon {
  font-size: 1.6rem;
  min-width: 42px;
  height: 42px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  flex-shrink: 0;
  background: rgba(76, 175, 80, 0.15);
  border: 2px solid rgba(76, 175, 80, 0.3);
}

.chatbot-message.bot .chatbot-message-icon {
  background: rgba(76, 175, 80, 0.2);
  border-color: rgba(76, 175, 80, 0.4);
}

.chatbot-message.user .chatbot-message-icon {
  background: rgba(76, 175, 80, 0.25);
  border-color: rgba(76, 175, 80, 0.5);
}

.chatbot-message-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  max-width: 75%;
}

.chatbot-message-bubble {
  padding: 16px 22px;
  border-radius: 18px;
  font-size: 0.95rem;
  line-height: 1.7;
  font-weight: 400;
  word-wrap: break-word;
  white-space: pre-wrap;
  animation: bubbleGrow 0.3s ease;
}

@keyframes bubbleGrow {
  from {
    opacity: 0;
    scale: 0.8;
  }
  to {
    opacity: 1;
    scale: 1;
  }
}

.chatbot-message.bot .chatbot-message-bubble {
  background: rgba(76, 175, 80, 0.12);
  border: 1px solid rgba(76, 175, 80, 0.3);
  color: #e8f5e9;
  align-self: flex-start;
}

.chatbot-message.user .chatbot-message-bubble {
  background: linear-gradient(135deg, #2e7d32 0%, #1b5e20 100%);
  color: #c8e6c9;
  align-self: flex-end;
  text-align: left;
  border: 1px solid rgba(76, 175, 80, 0.4);
}

.loading-bubble {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 14px 18px;
}

.typing-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #4CAF50;
  animation: typing 1.4s infinite;
}

.typing-dot:nth-child(2) {
  animation-delay: 0.2s;
}

.typing-dot:nth-child(3) {
  animation-delay: 0.4s;
}

@keyframes typing {
  0%, 60%, 100% { opacity: 0.3; transform: translateY(0); }
  30% { opacity: 1; transform: translateY(-8px); }
}

.no-response-buttons {
  display: flex;
  flex-direction: column;
  gap: 15px;
  padding: 20px;
  background: rgba(76, 175, 80, 0.08);
  border: 2px solid rgba(76, 175, 80, 0.3);
  border-radius: 12px;
  animation: slideUp 0.3s ease;
}

.no-response-buttons p {
  color: #a8d5a8;
  font-size: 1rem;
  margin: 0 0 10px 0;
  font-weight: 600;
  text-align: center;
}

.inactivity-message {
  display: flex;
  flex-direction: column;
  gap: 15px;
  padding: 20px;
  background: rgba(76, 175, 80, 0.08);
  border: 2px solid rgba(76, 175, 80, 0.3);
  border-radius: 12px;
  animation: slideUp 0.3s ease;
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.inactivity-message p {
  color: #a8d5a8;
  font-size: 1rem;
  margin: 0;
  font-weight: 600;
  text-align: center;
}

.quick-buttons {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
  width: 100%;
  max-width: 450px;
  margin: 0 auto;
}

.quick-btn {
  padding: 12px 16px;
  background: rgba(76, 175, 80, 0.12);
  border: 2px solid rgba(76, 175, 80, 0.3);
  color: #a8d5a8;
  border-radius: 12px;
  cursor: pointer;
  font-size: 0.9rem;
  font-weight: 600;
  transition: all 0.3s ease;
  text-align: center;
  white-space: nowrap;
}

.quick-btn:hover {
  background: rgba(76, 175, 80, 0.25);
  border-color: #4CAF50;
  color: #4CAF50;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(76, 175, 80, 0.2);
}

.quick-btn:active {
  transform: translateY(0);
}

.chatbot-input-container {
  padding: 20px 30px;
  background: linear-gradient(135deg, rgba(27, 94, 32, 0.2) 0%, rgba(15, 40, 24, 0.3) 100%);
  border-top: 2px solid rgba(76, 175, 80, 0.2);
  display: flex;
  gap: 12px;
  align-items: center;
}

.chatbot-input {
  flex: 1;
  padding: 14px 20px;
  border: 2px solid rgba(76, 175, 80, 0.3);
  border-radius: 50px;
  font-size: 0.95rem;
  outline: none;
  background: rgba(232, 245, 233, 0.08);
  color: #e8f5e9;
  transition: all 0.3s ease;
  font-weight: 400;
}

.chatbot-input::placeholder {
  color: rgba(200, 230, 201, 0.6);
}

.chatbot-input:focus {
  border-color: rgba(76, 175, 80, 0.6);
  background: rgba(232, 245, 233, 0.12);
  box-shadow: 0 0 12px rgba(76, 175, 80, 0.2);
}

.chatbot-input:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.chatbot-send-btn {
  background: linear-gradient(135deg, #2e7d32 0%, #1b5e20 100%);
  color: #c8e6c9;
  border: 2px solid rgba(76, 175, 80, 0.3);
  width: 50px;
  height: 50px;
  border-radius: 50%;
  cursor: pointer;
  font-size: 1.3rem;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
  box-shadow: 0 4px 12px rgba(76, 175, 80, 0.2);
  font-weight: 500;
}

.chatbot-send-btn:hover:not(:disabled) {
  background: linear-gradient(135deg, #1b5e20 0%, #0d3b1a 100%);
  transform: scale(1.08);
  box-shadow: 0 6px 16px rgba(76, 175, 80, 0.4);
  border-color: rgba(76, 175, 80, 0.6);
}

.chatbot-send-btn:active:not(:disabled) {
  transform: scale(0.95);
}

.chatbot-send-btn:disabled {
  background: rgba(76, 175, 80, 0.2);
  cursor: not-allowed;
  color: rgba(200, 230, 201, 0.5);
  border-color: rgba(76, 175, 80, 0.2);
}

@media (max-width: 1200px) {
  .chatbot-modal {
    width: 80vw;
    height: 85vh;
  }
}

@media (max-width: 768px) {
  .chatbot-modal {
    width: 95vw;
    height: 95vh;
    min-width: auto;
    border-radius: 15px;
  }

  .chatbot-header {
    flex-wrap: wrap;
    padding: 15px;
    gap: 10px;
  }

  .chatbot-title {
    min-width: auto;
  }

  .chatbot-title h2 {
    font-size: 1.4rem;
  }

  .tone-toggle {
    flex-basis: 100%;
    min-width: 100%;
  }

  .tone-btn {
    font-size: 0.85rem;
    padding: 6px 12px;
  }

  .chatbot-message-content {
    max-width: 90%;
  }

  .chatbot-welcome h3 {
    font-size: 1.6rem;
  }

  .chatbot-message-bubble {
    font-size: 0.9rem;
  }

  .quick-buttons {
    grid-template-columns: 1fr;
    width: 100%;
    max-width: 100%;
  }

  .quick-btn {
    font-size: 0.85rem;
    padding: 10px 12px;
  }
}
`;

export default Chatbot;