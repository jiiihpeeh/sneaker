import "./Logo.css";

interface LogoProps {
  size?: "sm" | "md" | "lg";
}

export function Logo(props: LogoProps) {
  return (
    <div class={`logo logo-${props.size || "md"}`}>
      <img src="/logo.svg" alt="Sneaker" />
    </div>
  );
}
