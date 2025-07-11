

export function loadLocalStorage<T>(key: string, fallback: T): T {
    const saved = localStorage.getItem(key);
    if (saved !== null) {
        try {
        const parsed = JSON.parse(saved);
        return parsed as T;
        } catch (e) {
        console.warn(`Invalid data in localStorage for key "${key}":`, e);
        }
    }
    return fallback;
}

export function saveLocalStorage<T>(key: string, data: T): void {
    try {
        localStorage.setItem(key, JSON.stringify(data));
    } catch (e) {
        console.error(`Failed to save data to localStorage for key "${key}":`, e);
    }
}
export function clearLocalStorage(key: string): void {
    try {
        localStorage.removeItem(key);
    } catch (e) {
        console.error(`Failed to clear localStorage for key "${key}":`, e);
    }
}
export function clearAllLocalStorage(): void {
    try {
        localStorage.clear();
    } catch (e) {
        console.error("Failed to clear all localStorage:", e);
    }
}