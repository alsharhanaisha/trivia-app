import { useEffect, useState } from 'react';
import { AccessibilityInfo, Platform } from 'react-native';

// The web build has no native animation module, so transform/opacity animations run in JS there.
export const nativeDriver = Platform.OS !== 'web';

export function useReduceMotion() {
  const [reduce, setReduce] = useState(false);
  useEffect(() => {
    AccessibilityInfo.isReduceMotionEnabled().then(setReduce);
    const sub = AccessibilityInfo.addEventListener('reduceMotionChanged', setReduce);
    return () => sub.remove();
  }, []);
  return reduce;
}
