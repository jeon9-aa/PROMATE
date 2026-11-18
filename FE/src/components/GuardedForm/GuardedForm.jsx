import useGuardedAction from '../../hooks/useGuardedAction.js';
import { FormPendingContext } from './FormPendingContext.js';

export default function GuardedForm({ onSubmit, ...props }) {
  const [handleSubmit, pending] = useGuardedAction(onSubmit);
  return (
    <FormPendingContext.Provider value={pending}>
      <form {...props} onSubmit={handleSubmit} aria-busy={pending || props['aria-busy'] || undefined} />
    </FormPendingContext.Provider>
  );
}
