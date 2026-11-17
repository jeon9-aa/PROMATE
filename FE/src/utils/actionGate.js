// Lock immediately, before React renders, and keep async actions locked until settled.
export function createActionGate(cooldown = 500, now = () => Date.now()) {
  let pending = false;
  let availableAt = 0;

  return {
    run(action, onBlocked = () => {}) {
      if (pending || now() < availableAt) {
        onBlocked();
        return;
      }
      pending = true;
      const release = () => {
        pending = false;
        availableAt = now() + cooldown;
      };
      try {
        const result = action();
        if (result && typeof result.then === 'function') {
          return Promise.resolve(result).finally(release);
        }
        release();
        return result;
      } catch (error) {
        release();
        throw error;
      }
    },
  };
}
