// 요청 중 들어온 메시지는 후속 요청으로 처리하고, 숨겨진 화면에서는 보류
export function createChatReadMarker({ markRead, isVisible, onSuccess, onError }) {
  let pending = false;
  let running = false;
  let disposed = false;
  const controller = new AbortController();

  async function flush() {
    if (disposed || running || !pending || !isVisible()) return;
    running = true;
    try {
      while (!disposed && pending && isVisible()) {
        pending = false;
        await markRead(controller.signal);
        if (!disposed) onSuccess();
      }
    } catch (error) {
      if (!disposed) {
        pending = true;
        onError(error);
      }
    } finally {
      running = false;
    }
  }

  return {
    request() {
      pending = true;
      return flush();
    },
    flush,
    dispose() {
      disposed = true;
      controller.abort();
    },
  };
}
