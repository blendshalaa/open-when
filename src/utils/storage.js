/**
 * Wrapper for localStorage to satisfy the "window.storage" requirement.
 * Handles persistence of "opened" state for letters.
 */

const STORAGE_PREFIX = 'open_when_';

export const storage = {
  /**
   * Mark a letter as opened.
   * @param {string} id - The unique ID of the letter.
   */
  markAsOpened: (id) => {
    const key = `${STORAGE_PREFIX}${id}`;
    const data = {
      opened: true,
      timestamp: new Date().toISOString(),
    };
    window.localStorage.setItem(key, JSON.stringify(data));
  },

  /**
   * Check if a letter has been opened.
   * @param {string} id - The unique ID of the letter.
   * @returns {boolean} - True if opened, false otherwise.
   */
  isOpened: (id) => {
    const key = `${STORAGE_PREFIX}${id}`;
    const item = window.localStorage.getItem(key);
    if (!item) return false;
    try {
      const data = JSON.parse(item);
      return data.opened === true;
    } catch (e) {
      return false;
    }
  },

  /**
   * Get the timestamp when the letter was opened.
   * @param {string} id - The unique ID of the letter.
   * @returns {string|null} - ISO timestamp or null if not opened.
   */
  getOpenTimestamp: (id) => {
    const key = `${STORAGE_PREFIX}${id}`;
    const item = window.localStorage.getItem(key);
    if (!item) return null;
    try {
      const data = JSON.parse(item);
      return data.timestamp;
    } catch (e) {
      return null;
    }
  },
};

// Expose as window.storage as requested
window.storage = storage;
