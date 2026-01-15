import LZString from 'lz-string';

/**
 * Key mapping for shorter JSON
 */
const KEY_MAP = {
    id: 'i',
    recipient: 'r',
    label: 'l',
    content: 'c',
    createdAt: 't'
};

const REVERSE_KEY_MAP = Object.fromEntries(
    Object.entries(KEY_MAP).map(([k, v]) => [v, k])
);

/**
 * Encode letter data into a compressed URL-safe string.
 */
export const encodeLetter = (data) => {
    try {
        // Map keys to short versions
        const shortData = {};
        for (const [key, value] of Object.entries(data)) {
            if (KEY_MAP[key]) {
                shortData[KEY_MAP[key]] = value;
            }
        }

        const jsonString = JSON.stringify(shortData);
        return LZString.compressToEncodedURIComponent(jsonString);
    } catch (e) {
        console.error("Failed to encode letter:", e);
        return null;
    }
};

/**
 * Decode a compressed URL-safe string back into letter data.
 */
export const decodeLetter = (token) => {
    if (!token) return null;

    try {
        let jsonString;

        // Try LZ decompression first (new format)
        const decompressed = LZString.decompressFromEncodedURIComponent(token);

        if (decompressed) {
            jsonString = decompressed;
        } else {
            // Fallback to old Base64 format for backward compatibility
            let base64 = token.replace(/-/g, '+').replace(/_/g, '/');
            while (base64.length % 4) base64 += '=';
            jsonString = decodeURIComponent(escape(atob(base64)));
        }

        const data = JSON.parse(jsonString);

        // If it's the new short-key format, map it back
        if (data.i || data.c || data.l) {
            const longData = {};
            for (const [key, value] of Object.entries(data)) {
                if (REVERSE_KEY_MAP[key]) {
                    longData[REVERSE_KEY_MAP[key]] = value;
                } else {
                    longData[key] = value;
                }
            }
            return longData;
        }

        return data;
    } catch (e) {
        console.error("Failed to decode letter:", e);
        return null;
    }
};

/**
 * Generate a unique ID for a letter.
 */
export const generateId = () => {
    return Math.random().toString(36).substr(2, 6); // Shorter ID is fine for local storage
};
