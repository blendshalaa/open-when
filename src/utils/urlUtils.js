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
        const payload = {
            i: collection.id,
            t: collection.createdAt ? new Date(collection.createdAt).getTime() : Date.now()
        };

        if (collection.name) payload.n = collection.name;
        if (collection.recipient) payload.r = collection.recipient;

        payload.l = collection.letters.map(letter => {
            const l = {
                i: letter.id,
                b: letter.label
            };
            if (letter.type && letter.type !== 'text') l.t = letter.type;
            if (letter.content) l.c = letter.content;
            if (letter.audioData) l.a = letter.audioData;
            if (letter.releaseDate) l.d = new Date(letter.releaseDate).getTime();
            return l;
        });

        return LZString.compressToEncodedURIComponent(JSON.stringify(payload));
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
                    // Handle both timestamp (new) and ISO string (old)
                    releaseDate: letter.d ? (typeof letter.d === 'number' ? new Date(letter.d).toISOString() : letter.d) : null
                })),
                // Handle both timestamp (new) and ISO string (old)
                createdAt: data.t ? (typeof data.t === 'number' ? new Date(data.t).toISOString() : data.t) : null
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

/**
 * Shorten a long URL using TinyURL.
 */
export const shortenUrl = async (longUrl) => {
    try {
        // TinyURL does not support localhost
        if (longUrl.includes('localhost') || longUrl.includes('127.0.0.1')) {
            throw new Error('Local addresses (localhost) cannot be shortened. This will work once you deploy the app to a real website.');
        }

        // TinyURL's public API
        const response = await fetch(`https://tinyurl.com/api-create.php?url=${encodeURIComponent(longUrl)}`);
        if (response.ok) {
            return await response.text();
        }

        if (longUrl.length > 2000) {
            throw new Error('Collection is too large to shorten (likely due to audio or long text). The long link will still work, or try saving to cloud!');
        }

        throw new Error('TinyURL service is currently unavailable.');
    } catch (e) {
        console.error("Shortening failed:", e);
        throw e; // Rethrow to handle in UI
    }
};

/**
 * Upload collection data to Bytebin (cloud storage).
 * Returns the key (ID).
 */
export const uploadToBytebin = async (data) => {
    try {
        const response = await fetch('https://bytebin.lucko.me/post', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        });

        if (response.ok) {
            const result = await response.json();
            return result.key;
        }
        throw new Error('Failed to upload to cloud storage');
    } catch (e) {
        console.error("Cloud upload failed:", e);
        throw e;
    }
};

/**
 * Fetch collection data from Bytebin using the key.
 */
export const fetchFromBytebin = async (key) => {
    try {
        const response = await fetch(`https://bytebin.lucko.me/${key}`);
        if (response.ok) {
            return await response.json();
        }
        return null;
    } catch (e) {
        console.error("Cloud fetch failed:", e);
        return null;
    }
};
