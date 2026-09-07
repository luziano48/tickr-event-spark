import type { ReactNode } from "react";
import { BottomNav } from "./BottomNav";

export function Screen({ children, nav = true }: { children: ReactNode; nav?: boolean }) {
  return (
    <div className="mx-auto min-h-screen max-w-md bg-background">
      <div className={nav ? "pb-28" : ""}>{children}</div>
      {nav ? <BottomNav /> : null}
    </div>
  );
}
