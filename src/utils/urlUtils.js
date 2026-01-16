import LZString from 'lz-string';

/**
 * Simple hash function to generate a consistent ID from content.
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
 * Generate a unique ID.
 */
export const generateId = () => {
    return Math.random().toString(36).substr(2, 8);
};

/**
 * Encode collection data into a compressed URL-safe string.
 * Format: JSON compressed with LZ-String
 * 
 * Letter schema:
 * - i: id
 * - t: type ('text' | 'voice')
 * - b: label
 * - c: content (for text)
 * - a: audioData (for voice, base64)
 * - d: releaseDate (timestamp or null)
 */
export const encodeCollection = (collection) => {
    try {
        const payload = JSON.stringify({
            i: collection.id,
            n: collection.name || '',
            r: collection.recipient || '',
            l: collection.letters.map(letter => ({
                i: letter.id,
                t: letter.type || 'text',
                b: letter.label,
                c: letter.content || '',
                a: letter.audioData || null,
                d: letter.releaseDate || null
            })),
            t: collection.createdAt
        });
        return LZString.compressToEncodedURIComponent(payload);
    } catch (e) {
        console.error("Failed to encode collection:", e);
        return null;
    }
};

/**
 * Decode a compressed string back into collection data.
 */
export const decodeCollection = (token) => {
    if (!token) return null;

    try {
        const decompressed = LZString.decompressFromEncodedURIComponent(token);
        if (!decompressed) return null;

        const data = JSON.parse(decompressed);

        // Handle new collection format
        if (data.l && Array.isArray(data.l)) {
            return {
                id: data.i,
                name: data.n || '',
                recipient: data.r || '',
                letters: data.l.map(letter => ({
                    id: letter.i,
                    type: letter.t || 'text',
                    label: letter.b,
                    content: letter.c || '',
                    audioData: letter.a || null,
                    releaseDate: letter.d || null
                })),
                createdAt: data.t
            };
        }

        // Fallback: try legacy single letter format (pipe-delimited)
        if (decompressed.includes('|')) {
            const [recipient, label, content] = decompressed.split('|');
            const legacyId = hashString(decompressed);
            return {
                id: legacyId,
                name: '',
                recipient: recipient || '',
                letters: [{
                    id: legacyId + '_0',
                    type: 'text',
                    label: label,
                    content: content,
                    audioData: null,
                    releaseDate: null
                }],
                createdAt: null
            };
        }

        return null;
    } catch (e) {
        console.error("Failed to decode collection:", e);
        return null;
    }
};

// Legacy functions for backward compatibility
export const encodeLetter = (data) => {
    try {
        const payload = `${data.recipient || ''}|${data.label}|${data.content}`;
        return LZString.compressToEncodedURIComponent(payload);
    } catch (e) {
        console.error("Failed to encode letter:", e);
        return null;
    }
};

export const decodeLetter = (token) => {
    if (!token) return null;

    try {
        const decompressed = LZString.decompressFromEncodedURIComponent(token);

        if (decompressed && decompressed.includes('|')) {
            const [recipient, label, content] = decompressed.split('|');
            const data = { recipient, label, content };
            data.id = hashString(decompressed);
            return data;
        }
        return null;
    } catch (e) {
        console.error("Failed to decode letter:", e);
        return null;
    }
};
