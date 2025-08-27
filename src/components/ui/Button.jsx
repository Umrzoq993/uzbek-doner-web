export default function Button({
  as: Comp = "button",
  className = "",
  variant = "primary",
  ...rest
}) {
  return <Comp className={`btn btn--${variant} ${className}`} {...rest} />;
}
