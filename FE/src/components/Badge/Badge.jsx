import GuardedButton from '../GuardedButton/GuardedButton.jsx';
import "./Badge.css";

function Badge({
  children,
  selected = false,
  onClick,
  type = "button",
  className = "",
  ...props
}) {
  const classes = ["badge", selected ? "badge--selected" : "", className]
    .filter(Boolean)
    .join(" ");

  return (
    <GuardedButton type={type} className={classes} onClick={onClick} {...props}>
      {children}
    </GuardedButton>
  );
}

export default Badge;
