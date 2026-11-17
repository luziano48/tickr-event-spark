import { useEffect, useState } from "react";
import { useRouter, useRouterState } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";

let activePath = null;
let routeStack = [];

function recordPath(pathname) {
  if (activePath !== pathname) {
    if (routeStack.at(-2) === pathname) {
      routeStack.pop();
    } else {
      routeStack.push(pathname);
      if (routeStack.length > 20) routeStack.shift();
    }
    activePath = pathname;
  }
  return routeStack.length > 1;
}

export function VisitorBackButton({
  fallbackTo = "/",
  className = "grid size-10 shrink-0 place-items-center rounded-full bg-surface text-foreground transition-colors hover:bg-surface-2",
  children,
}) {
  const router = useRouter();
  const pathname = useRouterState({ select: (state) => state.location.pathname });
  const [canGoBack, setCanGoBack] = useState(false);

  useEffect(() => {
    setCanGoBack(recordPath(pathname));
  }, [pathname]);

  function goBack() {
    const previousPath = routeStack.at(-2);
    if (canGoBack && previousPath) {
      router.navigate({ to: previousPath });
      return;
    }

    if (pathname === "/" && fallbackTo !== "/") {
      routeStack.push(fallbackTo);
      activePath = fallbackTo;
    } else {
      routeStack = [fallbackTo];
      activePath = fallbackTo;
    }
    router.navigate({ to: fallbackTo });
  }

  return (
    <button type="button" aria-label="Voltar" title="Voltar" onClick={goBack} className={className}>
      <ArrowLeft className="size-4 shrink-0" />
      {children}
    </button>
  );
}
