import "./ErrorState.css";

function ErrorState({ 
  title = "Something went wrong", 
  message = "We couldn't complete your request. Please try again.",
  onRetry,
  icon = "⚠️",
  retryText = "Try Again"
}) {
  return (
    <div className="error-state">
      <div className="error-state-icon">{icon}</div>
      <h3 className="error-state-title">{title}</h3>
      <p className="error-state-message">{message}</p>
      {onRetry && (
        <button className="error-state-button" onClick={onRetry}>
          🔄 {retryText}
        </button>
      )}
    </div>
  );
}

export default ErrorState;