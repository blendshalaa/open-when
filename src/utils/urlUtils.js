/**
 * Utilities for encoding and decoding letter data to/from URL parameters.
 * Uses Base64 encoding to store data in the URL hash or query param.
 */

/**
 * Encode letter data into a URL-safe Base64 string.
 * @param {Object} data - The letter data { id, label, content, recipient }.
 * @returns {string} - Base64 encoded string.
 */
export const encodeLetter = (data) => {
    try {
        const jsonString = JSON.stringify(data);
        // Encode to Base64
        const base64 = btoa(unescape(encodeURIComponent(jsonString)));
        // Make URL-safe: replace + with -, / with _, and remove =
        return base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
    } catch (e) {
        console.error("Failed to encode letter:", e);
        return null;
    }
};

/**
 * Decode a URL-safe Base64 string back into letter data.
 * @param {string} token - The Base64 encoded string.
 * @returns {Object|null} - The letter data object or null if invalid.
 */
export const decodeLetter = (token) => {
    try {
        // Restore standard Base64 characters
        let base64 = token.replace(/-/g, '+').replace(/_/g, '/');
        // Pad with = if needed
        while (base64.length % 4) {
            base64 += '=';
        }
        const jsonString = decodeURIComponent(escape(atob(base64)));
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
