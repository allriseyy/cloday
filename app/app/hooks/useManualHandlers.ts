// hooks/useManualHandlers.ts
import { useCallback } from "react";

export function useManualHandlers(onBack: () => void) {
  // In case you add analytics, haptics, or confirm dialogs later
  const handleBack = useCallback(() => {
    onBack();
  }, [onBack]);

  return { handleBack };
}

// Prevent Expo Router warning
export default {};
