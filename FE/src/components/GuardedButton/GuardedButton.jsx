import useGuardedAction from '../../hooks/useGuardedAction.js';
import { useContext } from 'react';
import { FormPendingContext } from '../GuardedForm/FormPendingContext.js';

export default function GuardedButton({ onClick, disabled, ...props }) {
  const [handleClick, pending] = useGuardedAction(onClick);
  const formPending = useContext(FormPendingContext);
  return (
    <button
      {...props}
      disabled={disabled || pending || formPending}
      aria-busy={pending || props['aria-busy'] || undefined}
      onClick={handleClick}
    />
  );
}
