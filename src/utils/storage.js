/**
 * Wrapper for localStorage to satisfy the "window.storage" requirement.
 * Handles persistence of "opened" state for letters within collections.
 */

const STORAGE_PREFIX = 'open_when_';

export const storage = {
  /**
   * Mark a letter within a collection as opened.
   * @param {string} collectionId - The unique ID of the collection.
   * @param {string} letterId - The unique ID of the letter within the collection.
   */
  markLetterAsOpened: (collectionId, letterId) => {
    const key = `${STORAGE_PREFIX}${collectionId}_${letterId}`;
    const data = {
      opened: true,
      timestamp: new Date().toISOString(),
    };
    window.localStorage.setItem(key, JSON.stringify(data));
  },

  /**
   * Check if a letter within a collection has been opened.
   * @param {string} collectionId - The unique ID of the collection.
   * @param {string} letterId - The unique ID of the letter.
   * @returns {boolean} - True if opened, false otherwise.
   */
  isLetterOpened: (collectionId, letterId) => {
    const key = `${STORAGE_PREFIX}${collectionId}_${letterId}`;
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
   * Get the timestamp when a letter was opened.
   * @param {string} collectionId - The unique ID of the collection.
   * @param {string} letterId - The unique ID of the letter.
   * @returns {string|null} - ISO timestamp or null if not opened.
   */
  getLetterOpenTimestamp: (collectionId, letterId) => {
    const key = `${STORAGE_PREFIX}${collectionId}_${letterId}`;
    const item = window.localStorage.getItem(key);
    if (!item) return null;
    try {
      const data = JSON.parse(item);
      return data.timestamp;
    } catch (e) {
      return null;
    }
  },

  // Legacy support for single letters (backward compatibility)
  markAsOpened: (id) => {
    const key = `${STORAGE_PREFIX}${id}`;
    const data = {
      opened: true,
      timestamp: new Date().toISOString(),
    };
    window.localStorage.setItem(key, JSON.stringify(data));
  },

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
