// storage.js - Local Storage Implementation
class LocalStorageManager {
    static getItem(key) {
        try {
            return JSON.parse(localStorage.getItem(key));
        } catch (error) {
            console.error('Error reading from localStorage:', error);
            return null;
        }
    }

    static setItem(key, value) {
        try {
            localStorage.setItem(key, JSON.stringify(value));
            return true;
        } catch (error) {
            console.error('Error writing to localStorage:', error);
            return false;
        }
    }

    static removeItem(key) {
        try {
            localStorage.removeItem(key);
            return true;
        } catch (error) {
            console.error('Error removing from localStorage:', error);
            return false;
        }
    }

    static clear() {
        try {
            localStorage.clear();
            return true;
        } catch (error) {
            console.error('Error clearing localStorage:', error);
            return false;
        }
    }
}

// Export for use in other files
// window.LocalStorageManager = LocalStorageManager;
export {LocalStorageManager};
