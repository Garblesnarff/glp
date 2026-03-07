type StorageValue = {
  value: string | null;
};

type StorageAdapter = {
  get: (key: string) => Promise<StorageValue>;
  set: (key: string, value: string) => Promise<void>;
};

declare global {
  interface Window {
    storage?: StorageAdapter;
  }
}

const browserStorage: StorageAdapter = {
  async get(key) {
    if (typeof window === "undefined") {
      return { value: null };
    }

    if (window.storage) {
      return window.storage.get(key);
    }

    return { value: window.localStorage.getItem(key) };
  },
  async set(key, value) {
    if (typeof window === "undefined") {
      return;
    }

    if (window.storage) {
      await window.storage.set(key, value);
      return;
    }

    window.localStorage.setItem(key, value);
  },
};

export async function readStoredJson<T>(key: string): Promise<T | null> {
  try {
    const result = await browserStorage.get(key);
    return result.value ? (JSON.parse(result.value) as T) : null;
  } catch {
    return null;
  }
}

export async function writeStoredJson<T>(key: string, value: T): Promise<void> {
  try {
    await browserStorage.set(key, JSON.stringify(value));
  } catch {
    // Best-effort persistence. The app should still work without storage.
  }
}
