import React, { useState, useEffect, useRef } from "react";

const Chatbot = ({ onClose }) => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [sessionId, setSessionId] = useState(null);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMsg = { sender: "user", text: input };
    setMessages((prev) => [...prev, userMsg]);

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
    }

    setInput("");
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") sendMessage();
  };

  return (
    <>
      <style>
        {chatbotStyles}
      </style>
      <div className="chatbot-wrapper">
        <div className="chatbot-messages">
          {messages.map((msg, idx) => (
            <div
              key={idx}
              className={`chatbot-message ${msg.sender}`}
            >
              <div className="chatbot-message-icon">
                {msg.sender === "bot" ? "🤖" : "👤"}
              </div>
              <div className="chatbot-message-content">
                <div className="chatbot-message-bubble">
                  {msg.text}
                </div>
              </div>
            </div>
          ))}
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
          />
          <button onClick={sendMessage} className="chatbot-send-btn">
            ➤
          </button>
        </div>
      </div>
    </>
  );
};

const chatbotStyles = `
/* Chatbot Wrapper */
.chatbot-wrapper {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  background: linear-gradient(135deg, #fafafa 0%, #ffffff 100%);
}

/* Messages Container */
.chatbot-messages {
  flex: 1;
  overflow-y: auto;
  padding: 30px;
  background: linear-gradient(135deg, #fafafa 0%, #ffffff 100%);
}

.chatbot-messages::-webkit-scrollbar {
  width: 10px;
}

.chatbot-messages::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 10px;
}

.chatbot-messages::-webkit-scrollbar-thumb {
  background: linear-gradient(135deg, #4CAF50 0%, #2e7d32 100%);
  border-radius: 10px;
}

.chatbot-messages::-webkit-scrollbar-thumb:hover {
  background: linear-gradient(135deg, #2e7d32 0%, #1b5e20 100%);
}

/* Individual Message */
.chatbot-message {
  margin-bottom: 25px;
  display: flex;
  align-items: flex-start;
  gap: 20px;
  animation: messageSlideIn 0.4s ease;
}

/* Bot message - left aligned (icon on left) */
.chatbot-message.bot {
  flex-direction: row;
}

/* User message - right aligned (icon on right) */
.chatbot-message.user {
  flex-direction: row-reverse;
  justify-content: flex-end;
}

@keyframes messageSlideIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Message Icon */
.chatbot-message-icon {
  font-size: 1.8rem;        
  min-width: 38px;          
  height: 38px;             
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  filter: drop-shadow(0 2px 8px rgba(0, 0, 0, 0.15));
  flex-shrink: 0;
}

.chatbot-message.bot .chatbot-message-icon {
  background: linear-gradient(135deg, #43a047 0%, #1b5e20 100%);
  box-shadow: 0 4px 12px rgba(76, 175, 80, 0.4);
}

.chatbot-message.user .chatbot-message-icon {
  background: white;
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
}

/* Message Content */
.chatbot-message-content {
  flex: 1;
  display: flex;
  flex-direction: column;
}

/* Message Bubble */
.chatbot-message-bubble {
  padding: 8px 20px;
  border-radius: 20px;
  font-size: 1.15rem;
  line-height: 1.7;
  font-weight: 500;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  max-width: 50%;
  word-wrap: break-word;
}

.chatbot-message.bot .chatbot-message-bubble {
  background: linear-gradient(135deg, #f1f8f4 0%, #ffffff 100%);
  border: 2px solid rgba(76, 175, 80, 0.2);
  color: #2c3e50;
  align-self: flex-start;
}

.chatbot-message.user .chatbot-message-bubble {
  background: linear-gradient(135deg, #43a047 0%, #1b5e20 100%);
  color: white;
  align-self: flex-end;
  text-align: right;
}

/* Input Container */
.chatbot-input-container {
  padding: 25px 30px;
  background: linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%);
  border-top: 3px solid rgba(76, 175, 80, 0.2);
  display: flex;
  gap: 15px;
  align-items: center;
  box-shadow: 0 -4px 15px rgba(0, 0, 0, 0.1);
}

/* Input Field */
.chatbot-input {
  flex: 1;
  padding: 18px 24px;
  border: 3px solid transparent;
  border-radius: 50px;
  font-size: 1.15rem;
  outline: none;
  background: linear-gradient(white, white) padding-box,
              linear-gradient(135deg, #4CAF50, #2e7d32) border-box;
  transition: all 0.3s ease;
  font-weight: 500;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
}

.chatbot-input:focus {
  background: linear-gradient(white, white) padding-box,
              linear-gradient(135deg, #2e7d32, #4CAF50) border-box;
  box-shadow: 0 6px 18px rgba(76, 175, 80, 0.3);
  transform: translateY(-2px);
}

.chatbot-input::placeholder {
  color: #999;
  font-weight: 400;
}

/* Send Button */
.chatbot-send-btn {
  background: linear-gradient(135deg, #4CAF50 0%, #2e7d32 100%);
  color: white;
  border: 3px solid rgba(255, 255, 255, 0.3);
  width: 60px;
  height: 60px;
  border-radius: 50%;
  cursor: pointer;
  font-size: 1.6rem;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
  box-shadow: 0 6px 18px rgba(76, 175, 80, 0.4);
  font-weight: 700;
}

.chatbot-send-btn:hover {
  background: linear-gradient(135deg, #2e7d32 0%, #1b5e20 100%);
  transform: scale(1.1) rotate(15deg);
  box-shadow: 0 8px 24px rgba(76, 175, 80, 0.6);
}

.chatbot-send-btn:disabled {
  background: #ccc;
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}
`;

export default Chatbot;