import { useState, useEffect } from 'react';

// Custom hook to manage state that persists in localStorage.
function usePersistentState(key, defaultValue) {
    // Initialize state from localStorage or use the default value.
    const [state, setState] = useState(() => {
        try {
            const persistentValue = window.localStorage.getItem(key);
            // Parse stored json or return default value if it doesn't exist.
            return persistentValue !== null ? JSON.parse(persistentValue) : defaultValue;
        } catch (error) {
            // If error reading from localStorage, return default value.
            console.warn(`Error reading localStorage key “${key}”:`, error);
            return defaultValue;
        }
    });

    // useEffect to update localStorage when the state changes.
    useEffect(() => {
        try {
            window.localStorage.setItem(key, JSON.stringify(state));
        } catch (error) {
            // If error writing to localStorage, log the error.
            console.warn(`Error setting localStorage key “${key}”:`, error);
        }
    }, [key, state]); // Only re-run if key or state changes.

    return [state, setState];
}

export default usePersistentState;
