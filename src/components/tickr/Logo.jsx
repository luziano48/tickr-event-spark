import logoImage from "@/assets/Logo.png";

export function Logo({ className = "" }) {
  return (
    <img
      src={logoImage}
      alt="Tickr Eventos"
      width={150}
      height={60}
      className={`h-10 w-auto object-contain drop-shadow-[0_0_2px_rgba(255,255,255,0.9)] drop-shadow-[0_0_6px_rgba(255,255,255,0.3)] ${className}`}
    />
  );
}
