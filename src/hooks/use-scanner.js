import { useState } from "react";

export function useScanner() {
  const [validated, setValidated] = useState(true);

  return {
    validated,
    validate: () => setValidated(true),
    reset: () => setValidated(false),
  };
}
