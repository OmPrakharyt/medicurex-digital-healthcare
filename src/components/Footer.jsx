import React from "react";

const Footer = () => {
  return (
    <footer style={{
      background: "#1e293b",
      color: "white",
      textAlign: "center",
      padding: "30px 20px",
      marginTop: "auto",
      width: "100%",
      borderTop: "3px solid #3b82f6"
    }}>
      <p style={{ margin: "0", fontSize: "18px", fontWeight: "bold" }}>Website developed by:</p>
      <div style={{ marginTop: "15px", fontSize: "16px", color: "#cbd5e1", lineHeight: "1.8", fontWeight: "500" }}>
        <p style={{ margin: "0" }}>Om Prakhar (Frontend + Backend)</p>
        <p style={{ margin: "0" }}>Abhinav Singh (Frontend)</p>
        <p style={{ margin: "0" }}>Mradul (Backend)</p>
      </div>
    </footer>
  );
};

export default Footer;
