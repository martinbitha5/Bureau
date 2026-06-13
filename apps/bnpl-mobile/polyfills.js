// Correctif RN 0.81 + New Architecture (Expo Go SDK 54).
// Les constantes de phase d'Event (NONE, CAPTURING_PHASE, AT_TARGET, BUBBLING_PHASE) sont
// définies en lecture seule, ce qui casse event-target-shim (utilisé par AbortController / fetch)
// → "Cannot assign to read-only property 'NONE'". On les rend modifiables AVANT tout fetch.
// Réf : https://github.com/facebook/react-native/issues/54732
const E = globalThis.Event;
if (E) {
  const phases = [
    ["NONE", 0],
    ["CAPTURING_PHASE", 1],
    ["AT_TARGET", 2],
    ["BUBBLING_PHASE", 3],
  ];
  let needsReplace = false;
  for (const [key, value] of phases) {
    try {
      Object.defineProperty(E, key, { value, writable: true, configurable: true });
    } catch (_e) {
      needsReplace = true;
    }
  }
  if (needsReplace) {
    const Patched = class extends E {};
    for (const [key, value] of phases) {
      try {
        Object.defineProperty(Patched, key, { value, writable: true, configurable: true });
      } catch (_e) {
        // ignore
      }
    }
    globalThis.Event = Patched;
  }
}
