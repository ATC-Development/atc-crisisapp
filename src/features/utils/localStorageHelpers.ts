

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
export function clearChecklist(category: string): void {
  try {
    localStorage.removeItem(`checklist-${category}`);
  } catch (e) {
    console.error(`Failed to clear checklist for "${category}"`, e);
  }
}

export function clearForm(formId: string): void {
  try {
    localStorage.removeItem(`form-${formId}`);
  } catch (e) {
    console.error(`Failed to clear form for "${formId}"`, e);
  }
}

// Optional: full app reset (if needed)
export function clearAppLocalStorage(): void {
  try {
    Object.keys(localStorage).forEach(key => {
      if (key.startsWith("checklist-") || key.startsWith("form-")) {
        localStorage.removeItem(key);
      }
    });
  } catch (e) {
    console.error("Failed to clear app-specific localStorage:", e);
  }
}
