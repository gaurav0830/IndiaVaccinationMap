import React from "react";

const Loader = ({
  size = 60,
  color = "white",
  background = "#0e5e86ff",
  message = "Loading...",
}) => {
  return (
    <div
      style={{
        width: "100vw",
        height: "100vh",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        background,
        color,
        fontSize: "20px",
        fontWeight: "bold",
        gap: "15px",
      }}
    >
      <div
        style={{
          border: `6px solid rgba(255,255,255,0.3)`,
          borderTop: `6px solid ${color}`,
          borderRadius: "50%",
          width: size,
          height: size,
          animation: "spin 1s linear infinite",
        }}
      />
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
      <span>{message}</span>
    </div>
  );
};

export default Loader;
