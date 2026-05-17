export const LoadingSpinner = () => {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: "8px",
      }}
    >
      <div
        style={{
          width: "12px",
          height: "12px",
          borderRadius: "50%",
          background: "var(--primary)",
          animation: "pulse 1.5s ease-in-out infinite",
        }}
      />
      <div
        style={{
          width: "12px",
          height: "12px",
          borderRadius: "50%",
          background: "var(--primary)",
          animation: "pulse 1.5s ease-in-out infinite 0.2s",
        }}
      />
      <div
        style={{
          width: "12px",
          height: "12px",
          borderRadius: "50%",
          background: "var(--primary)",
          animation: "pulse 1.5s ease-in-out infinite 0.4s",
        }}
      />
      <style>
        {`
          @keyframes pulse {
            0%, 100% { opacity: 0.3; }
            50% { opacity: 1; }
          }
        `}
      </style>
    </div>
  );
};
