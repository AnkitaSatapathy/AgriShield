import React, { useState, useEffect, useRef } from "react";

const Chatbot = ({ onClose }) => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [sessionId, setSessionId] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Prevent body scroll when chatbot is open
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "unset";
    };
  }, []);

  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMsg = { sender: "user", text: input };
    setMessages((prev) => [...prev, userMsg]);
    setIsLoading(true);

    try {
      const res = await fetch("http://localhost:8000/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: input, session_id: sessionId }),
      });
      const data = await res.json();

      if (!sessionId && data.session_id) setSessionId(data.session_id);

      setMessages((prev) => [...prev, { sender: "bot", text: data.reply }]);
    } catch (err) {
      console.error(err);
      setMessages((prev) => [...prev, { sender: "bot", text: "Error contacting server." }]);
    } finally {
      setIsLoading(false);
    }

    setInput("");
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !isLoading) sendMessage();
  };

  return (
    <>
      <style>
        {chatbotStyles}
      </style>
      
      {/* Full Screen Overlay */}
      <div className="chatbot-overlay" onClick={onClose} />
      
      {/* Full Screen Modal */}
      <div className="chatbot-modal">
        <div className="chatbot-header">
          <div className="chatbot-title">
            <span className="chatbot-icon">🌾</span>
            <h2>AgriShield Assistant</h2>
          </div>
          <button className="chatbot-close-btn" onClick={onClose}>✕</button>
        </div>

        <div className="chatbot-wrapper">
          <div className="chatbot-messages">
            {messages.length === 0 ? (
              <div className="chatbot-welcome">
                <div className="welcome-icon">🤖</div>
                <h3>Welcome to AgriShield</h3>
                <p>Ask me anything about crops, soil, water, fertilizers, and pest control!</p>
              </div>
            ) : (
              messages.map((msg, idx) => (
                <div
                  key={idx}
                  className={`chatbot-message ${msg.sender}`}
                >
                  <div className="chatbot-message-icon">
                    {msg.sender === "bot" ? "🤖" : "👨‍🌾"}
                  </div>
                  <div className="chatbot-message-content">
                    <div className="chatbot-message-bubble">
                      {msg.text.includes('<h2>') ? (
                        <div dangerouslySetInnerHTML={{ __html: msg.text.replace(/\n/g, '<br/>') }} />
                      ) : (
                        msg.text
                      )}
                    </div>
                  </div>
                </div>
              ))
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
              onClick={sendMessage} 
              className="chatbot-send-btn"
              disabled={isLoading || !input.trim()}
            >
              {isLoading ? "⏳" : "✈️"}
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

const chatbotStyles = `
/* Prevent body scroll when chatbot is open */
body {
  overflow: hidden;
}

/* HTML overflow reset */
html {
  overflow: auto;
}

/* CHATBOT CONTAINER STYLES - Self-contained */
.chatbot-container {
  position: fixed;
  bottom: 20px;
  right: 20px;
  width: 75vw;
  height: 85vh;
  min-width: 600px;
  background: linear-gradient(135deg, #0d1f1a 0%, #0f2820 50%, #0d1f1a 100%);
  border-radius: 20px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.7);
  display: flex;
  flex-direction: column;
  z-index: 1001;
  animation: chatbotSlideIn 0.3s ease-out;
  border: 2px solid rgba(76, 175, 80, 0.3);
}

@keyframes chatbotSlideIn {
  from {
    opacity: 0;
    transform: translateY(50px) scale(0.95);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

/* Overlay */
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

/* Full Screen Modal - The main chatbot window */
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

/* Header */
.chatbot-header {
  padding: 25px 30px;
  background: linear-gradient(135deg, rgba(76, 175, 80, 0.25) 0%, rgba(76, 175, 80, 0.12) 100%);
  border-bottom: 3px solid rgba(76, 175, 80, 0.5);
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-radius: 20px 20px 0 0;
  box-shadow: 0 4px 12px rgba(76, 175, 80, 0.15);
}

.chatbot-title {
  display: flex;
  align-items: center;
  gap: 15px;
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
}

.chatbot-close-btn:hover {
  background: rgba(76, 175, 80, 0.15);
  border-color: rgba(76, 175, 80, 0.5);
  transform: rotate(90deg);
}

/* Chatbot Wrapper */
.chatbot-wrapper {
  width: 100%;
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

/* Welcome Message */
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

/* Messages Container */
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

.chatbot-messages::-webkit-scrollbar-thumb:hover {
  background: linear-gradient(135deg, #66bb6a 0%, #43a047 100%);
}

/* Individual Message */
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

/* Bot message - left aligned */
.chatbot-message.bot {
  flex-direction: row;
  justify-content: flex-start;
}

/* User message - right aligned */
.chatbot-message.user {
  flex-direction: row-reverse;
  justify-content: flex-end;
}

/* Message Icon */
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

/* Message Content */
.chatbot-message-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  max-width: 75%;
}

/* Message Bubble */
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

.chatbot-message-bubble h2 {
  margin: 0 0 16px 0;
  font-size: 1.6rem;
  font-weight: 800;
  color: #4CAF50;
  letter-spacing: 0.8px;
  line-height: 1.3;
  text-transform: uppercase;
  opacity: 0.95;
}

.chatbot-message-bubble p {
  margin: 12px 0;
  color: inherit;
}

.chatbot-message-bubble ul,
.chatbot-message-bubble ol {
  margin: 10px 0;
  padding-left: 20px;
}

.chatbot-message-bubble li {
  margin: 6px 0;
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

/* Loading Bubble */
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

/* Input Container */
.chatbot-input-container {
  padding: 20px 30px;
  background: linear-gradient(135deg, rgba(27, 94, 32, 0.2) 0%, rgba(15, 40, 24, 0.3) 100%);
  border-top: 2px solid rgba(76, 175, 80, 0.2);
  display: flex;
  gap: 12px;
  align-items: center;
}

/* Input Field */
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

/* Send Button */
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

/* Responsive Design */
@media (max-width: 1200px) {
  .chatbot-modal {
    width: 80vw;
    height: 85vh;
  }

  .chatbot-container {
    width: 80vw;
  }
}

@media (max-width: 768px) {
  .chatbot-modal {
    width: 95vw;
    height: 95vh;
    min-width: auto;
    border-radius: 15px;
  }

  .chatbot-container {
    width: 95vw;
    height: 95vh;
    min-width: auto;
  }

  .chatbot-message-content {
    max-width: 90%;
  }

  .chatbot-title h2 {
    font-size: 1.4rem;
  }

  .chatbot-welcome h3 {
    font-size: 1.6rem;
  }

  .chatbot-message-bubble {
    font-size: 0.9rem;
  }

  .chatbot-message-bubble h2 {
    font-size: 1.3rem;
  }
  
  /* Full Screen Modal */
.chatbot-modal {
  position: fixed;
  top: 50%;
  left: 50%;
  width: 75vw;
  height: 85vh;
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

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

/* Header */
.chatbot-header {
  padding: 25px 30px;
  background: linear-gradient(135deg, rgba(76, 175, 80, 0.25) 0%, rgba(76, 175, 80, 0.12) 100%);
  border-bottom: 3px solid rgba(76, 175, 80, 0.5);
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-radius: 20px 20px 0 0;
  box-shadow: 0 4px 12px rgba(76, 175, 80, 0.15);
}

.chatbot-title {
  display: flex;
  align-items: center;
  gap: 15px;
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
}

.chatbot-close-btn:hover {
  background: rgba(76, 175, 80, 0.15);
  border-color: rgba(76, 175, 80, 0.5);
  transform: rotate(90deg);
}

/* Chatbot Wrapper */
.chatbot-wrapper {
  width: 100%;
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

/* Welcome Message */
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

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
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

/* Messages Container */
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

.chatbot-messages::-webkit-scrollbar-thumb:hover {
  background: linear-gradient(135deg, #66bb6a 0%, #43a047 100%);
}

/* Individual Message */
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

/* Bot message - left aligned */
.chatbot-message.bot {
  flex-direction: row;
  justify-content: flex-start;
}

/* User message - right aligned */
.chatbot-message.user {
  flex-direction: row-reverse;
  justify-content: flex-end;
}

/* Message Icon */
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

/* Message Content */
.chatbot-message-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  max-width: 75%;
}

/* Message Bubble */
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

.chatbot-message-bubble h2 {
  margin: 0 0 16px 0;
  font-size: 1.6rem;
  font-weight: 800;
  color: #4CAF50;
  letter-spacing: 0.8px;
  line-height: 1.3;
  text-transform: uppercase;
  opacity: 0.95;
}

.chatbot-message-bubble p {
  margin: 12px 0;
  color: inherit;
}

.chatbot-message-bubble ul,
.chatbot-message-bubble ol {
  margin: 10px 0;
  padding-left: 20px;
}

.chatbot-message-bubble li {
  margin: 6px 0;
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

/* Loading Bubble */
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

/* Input Container */
.chatbot-input-container {
  padding: 20px 30px;
  background: linear-gradient(135deg, rgba(27, 94, 32, 0.2) 0%, rgba(15, 40, 24, 0.3) 100%);
  border-top: 2px solid rgba(76, 175, 80, 0.2);
  display: flex;
  gap: 12px;
  align-items: center;
}

/* Input Field */
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

/* Send Button */
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

/* Responsive Design */
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

  .chatbot-message-content {
    max-width: 90%;
  }

  .chatbot-title h2 {
    font-size: 1.4rem;
  }

  .chatbot-welcome h3 {
    font-size: 1.6rem;
  }

  .chatbot-message-bubble {
    font-size: 0.9rem;
  }

  .chatbot-message-bubble h2 {
    font-size: 1.3rem;
  }
}`;

export default Chatbot;