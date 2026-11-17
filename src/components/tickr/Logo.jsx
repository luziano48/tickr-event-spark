import logoImage from "@/assets/Logo.png";

export function Logo({ className = "" }) {
  return (
    <img
      src={logoImage}
      alt="Tickr Eventos"
      width={150}
      height={60}
      className={`h-10 w-auto object-contain ${className}`}
    />
  );
}
