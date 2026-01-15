import LZString from 'lz-string';

/**
 * Simple hash function to generate a consistent ID from content.
 * This allows us to track "opened" status without storing the ID in the URL.
 */
const hashString = (str) => {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        const char = str.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash |= 0;
    }
    return Math.abs(hash).toString(36);
};

/**
 * Encode letter data into a highly compressed string.
 * Format: recipient|label|content
 */
export const encodeLetter = (data) => {
    try {
        const payload = `${data.recipient || ''}|${data.label}|${data.content}`;
        return LZString.compressToEncodedURIComponent(payload);
    } catch (e) {
        console.error("Failed to encode letter:", e);
        return null;
    }
};

/**
 * Decode a compressed string back into letter data.
 */
export const decodeLetter = (token) => {
    if (!token) return null;

    try {
        const decompressed = LZString.decompressFromEncodedURIComponent(token);

        if (decompressed && decompressed.includes('|')) {
            // New delimited format: recipient|label|content
            const [recipient, label, content] = decompressed.split('|');
            const data = { recipient, label, content };
            // Generate ID on the fly for storage tracking
            data.id = hashString(decompressed);
            return data;
        } else {
            // Fallback for JSON formats (Base64 or LZ-JSON)
            let jsonString = decompressed;
            if (!jsonString) {
                let base64 = token.replace(/-/g, '+').replace(/_/g, '/');
                while (base64.length % 4) base64 += '=';
                jsonString = decodeURIComponent(escape(atob(base64)));
            }

            const data = JSON.parse(jsonString);

            // Handle short-key JSON format
            if (data.i || data.c || data.l) {
                return {
                    id: data.i,
                    recipient: data.r,
                    label: data.l,
                    content: data.c,
                    createdAt: data.t
                };
            }
            return data;
        }
    } catch (e) {
        console.error("Failed to decode letter:", e);
        return null;
    }
};

/**
 * Generate a unique ID (only used for initial creation if needed, 
 * but now we mostly use hashString).
 */
export const generateId = () => {
    return Math.random().toString(36).substr(2, 6);
};
