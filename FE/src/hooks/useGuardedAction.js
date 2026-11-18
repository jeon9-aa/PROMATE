import { useRef, useState } from 'react';
import { createActionGate } from '../utils/actionGate.js';

export default function useGuardedAction(action) {
  const gate = useRef(null);
  const [pending, setPending] = useState(false);

  const handleAction = (event) => {
    if (!gate.current) gate.current = createActionGate();
    return gate.current.run(() => {
      const result = action?.(event);
      if (result && typeof result.then === 'function') {
        setPending(true);
        return Promise.resolve(result).finally(() => setPending(false));
      }
      return result;
    }, () => {
      event.preventDefault();
      event.stopPropagation();
    });
  };

  return [handleAction, pending];
}
