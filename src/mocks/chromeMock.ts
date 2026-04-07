/**
 * Chrome Extension API mock for local dev (npm run dev).
 *
 * When running outside a Chrome Extension context, `chrome` is undefined.
 * This shim replicates chrome.storage.local using localStorage and stubs
 * other APIs so the React app renders and functions normally in the browser.
 *
 * Only active when import.meta.env.DEV === true and chrome is not present.
 */

const STORAGE_KEY = "__bs_chrome_storage__";

function readStore(): Record<string, any> {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
  } catch {
    return {};
  }
}

function writeStore(data: Record<string, any>) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

// Minimal set of chrome.storage.onChanged listeners
const changeListeners: Array<(changes: any, area: string) => void> = [];

function notifyListeners(changes: Record<string, { newValue: any }>) {
  changeListeners.forEach((fn) => fn(changes, "local"));
}

export function initChromeMock() {
  if (typeof chrome !== "undefined" && chrome.storage) return; // real extension env

  console.info("[BuySmart DEV] Chrome API mock active");

  (window as any).chrome = {
    storage: {
      local: {
        get(keys: string | string[], callback: (result: any) => void) {
          const store = readStore();
          const keyList = Array.isArray(keys) ? keys : [keys];
          const result: Record<string, any> = {};
          keyList.forEach((k) => {
            if (k in store) result[k] = store[k];
          });
          callback(result);
        },
        set(data: Record<string, any>, callback?: () => void) {
          const store = readStore();
          Object.assign(store, data);
          writeStore(store);
          const changes: Record<string, { newValue: any }> = {};
          Object.keys(data).forEach((k) => { changes[k] = { newValue: data[k] }; });
          notifyListeners(changes);
          callback?.();
        },
        remove(keys: string | string[], callback?: () => void) {
          const store = readStore();
          const keyList = Array.isArray(keys) ? keys : [keys];
          keyList.forEach((k) => delete store[k]);
          writeStore(store);
          callback?.();
        },
      },
      onChanged: {
        addListener(fn: (changes: any, area: string) => void) {
          changeListeners.push(fn);
        },
        removeListener(fn: (changes: any, area: string) => void) {
          const idx = changeListeners.indexOf(fn);
          if (idx !== -1) changeListeners.splice(idx, 1);
        },
      },
    },
    runtime: {
      sendMessage: () => {},
      getURL: (path: string) => path,
      lastError: null,
    },
    cookies: {
      get: (_: any, callback: (cookie: any) => void) => callback(null),
    },
    scripting: { executeScript: () => {} },
    action: { onClicked: { addListener: () => {} } },
  };
}
