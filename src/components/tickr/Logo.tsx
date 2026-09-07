export function Logo({ className = "" }: { className?: string }) {
  return (
    <span className={`font-display font-extrabold tracking-tight ${className}`}>
      Tick<span className="text-primary">r</span>
    </span>
  );
}
