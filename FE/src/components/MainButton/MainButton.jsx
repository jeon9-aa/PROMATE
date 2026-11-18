import GuardedButton from '../GuardedButton/GuardedButton.jsx';
import "./MainButton.css";

function MainButton({
  children,
  onClick,
  disabled = false,
  type = "button",
  size = "md",
  fullWidth = false,
  className = "",
  ...props
}) {
  return (
    <GuardedButton
      type={type}
      className={`main-btn ${size} ${fullWidth ? "full-width" : ""} ${className}`.trim()}
      onClick={onClick}
      disabled={disabled}
      {...props}
    >
      {children}
    </GuardedButton>
  );
}

export default MainButton;
