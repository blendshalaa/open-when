/**
 * Utilities for encoding and decoding letter data to/from URL parameters.
 * Uses Base64 encoding to store data in the URL hash or query param.
 */

/**
 * Encode letter data into a Base64 string.
 * @param {Object} data - The letter data { id, label, content, recipient }.
 * @returns {string} - Base64 encoded string.
 */
export const encodeLetter = (data) => {
    try {
        const jsonString = JSON.stringify(data);
        // Use btoa for Base64 encoding, handling unicode characters
        return btoa(unescape(encodeURIComponent(jsonString)));
    } catch (e) {
        console.error("Failed to encode letter:", e);
        return null;
    }
};

/**
 * Decode a Base64 string back into letter data.
 * @param {string} token - The Base64 encoded string.
 * @returns {Object|null} - The letter data object or null if invalid.
 */
export const decodeLetter = (token) => {
    try {
        // Use atob for Base64 decoding, handling unicode characters
        const jsonString = decodeURIComponent(escape(atob(token)));
        return JSON.parse(jsonString);
    } catch (e) {
        console.error("Failed to decode letter:", e);
        return null;
    }
};

/**
 * Generate a unique ID for a letter.
 * @returns {string} - A random unique ID.
 */
export const generateId = () => {
    return Math.random().toString(36).substr(2, 9) + Date.now().toString(36);
};
