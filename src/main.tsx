import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

// In dev mode: shim Chrome extension APIs so the app works in a normal browser tab.
// This block is tree-shaken out of production builds by Vite.
if (import.meta.env.DEV) {
  // Inline the mock init so we avoid top-level await
  const STORAGE_KEY = '__bs_chrome_storage__';
  const readStore = (): Record<string, any> => {
    try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}'); }
    catch { return {}; }
  };
  const writeStore = (data: Record<string, any>) =>
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));

  const listeners: Array<(c: any, a: string) => void> = [];

  if (typeof chrome === 'undefined' || !chrome.storage) {
    console.info('[BuySmart DEV] Chrome API mock active — using localStorage');
    (window as any).chrome = {
      storage: {
        local: {
          get(keys: string | string[], cb: (r: any) => void) {
            const store = readStore();
            const ks = Array.isArray(keys) ? keys : [keys];
            const result: Record<string, any> = {};
            ks.forEach(k => { if (k in store) result[k] = store[k]; });
            cb(result);
          },
          set(data: Record<string, any>, cb?: () => void) {
            const store = readStore();
            Object.assign(store, data);
            writeStore(store);
            const changes: Record<string, { newValue: any }> = {};
            Object.keys(data).forEach(k => { changes[k] = { newValue: data[k] }; });
            listeners.forEach(fn => fn(changes, 'local'));
            cb?.();
          },
          remove(keys: string | string[], cb?: () => void) {
            const store = readStore();
            (Array.isArray(keys) ? keys : [keys]).forEach(k => delete store[k]);
            writeStore(store);
            cb?.();
          },
        },
        onChanged: {
          addListener: (fn: (c: any, a: string) => void) => listeners.push(fn),
          removeListener: (fn: (c: any, a: string) => void) => {
            const i = listeners.indexOf(fn);
            if (i !== -1) listeners.splice(i, 1);
          },
        },
      },
      runtime: { sendMessage: () => {}, getURL: (p: string) => p, lastError: null },
      cookies: { get: (_: any, cb: (c: any) => void) => cb(null) },
      scripting: { executeScript: () => {} },
    };
  }
}

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
