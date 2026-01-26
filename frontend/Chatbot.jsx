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

  const styles = {
    container: {
      width: "100%",
      maxWidth: "400px",
      height: "500px",
      display: "flex",
      flexDirection: "column",
      borderRadius: "12px",
      fontFamily: "Arial, sans-serif",
      backgroundColor: "#F2F7F2",
      border: "1px solid #C8D8C8",
      color: "#333",
      boxShadow: "0 4px 12px rgba(0,0,0,0.2)",
      overflow: "hidden",
      position: "relative",
      cursor: "default",
    },
    header: {
      backgroundColor: "#A8C0A8",
      color: "#1B3B1B",
      padding: "10px",
      textAlign: "center",
      fontWeight: "bold",
      borderTopLeftRadius: "12px",
      borderTopRightRadius: "12px",
      position: "relative",
      cursor: "pointer",
    },
    closeBtn: {
      position: "absolute",
      right: "10px",
      top: "50%",
      transform: "translateY(-50%)",
      cursor: "pointer",
      fontWeight: "bold",
      color: "#1B3B1B",
      fontSize: "18px",
    },
    messages: {
      flex: 1,
      padding: "10px",
      overflowY: "auto",
      backgroundColor: "#EDF6ED",
    },
    message: {
      margin: "5px 0",
      padding: "10px 14px",
      borderRadius: "18px",
      maxWidth: "80%",
      wordWrap: "break-word",
      boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
    },
    userMsg: {
      backgroundColor: "#C8E6C9",
      alignSelf: "flex-end",
      color: "#1B3B1B",
    },
    botMsg: {
      backgroundColor: "#FFFFFF",
      alignSelf: "flex-start",
      color: "#333",
    },
    inputContainer: {
      display: "flex",
      borderTop: "1px solid #C8D8C8",
      backgroundColor: "#EDF6ED",
    },
    input: {
      flex: 1,
      padding: "10px",
      border: "none",
      outline: "none",
      backgroundColor: "#FFFFFF",
      color: "#333",
    },
    button: {
      padding: "10px 15px",
      border: "none",
      backgroundColor: "#A8C0A8",
      color: "#1B3B1B",
      cursor: "pointer",
      fontWeight: "bold",
    },
  };

  return (
    <div style={styles.container}>
      {/* Clicking header closes the chatbot */}
      <div style={styles.header} onClick={onClose}>
        AgriShield Chatbot 🌾
        <span style={styles.closeBtn}>✖</span>
      </div>
      <div style={styles.messages}>
        {messages.map((msg, idx) => (
          <div
            key={idx}
            style={{
              ...styles.message,
              ...(msg.sender === "bot" ? styles.botMsg : styles.userMsg),
            }}
          >
            {msg.text}
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
      <div style={styles.inputContainer}>
        <input
          type="text"
          placeholder="Type your message..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={handleKeyPress}
          style={styles.input}
        />
        <button onClick={sendMessage} style={styles.button}>
          Send
        </button>
      </div>
    </div>
  );
};

export default Chatbot;
