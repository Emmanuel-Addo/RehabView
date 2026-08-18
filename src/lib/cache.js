/**
 * Simple in-process cache for GEE results.
 * Keys are strings, values are cached with a timestamp.
 * TTL: 24 hours for NDVI metrics, 7 days for district lists.
 */

const store = new Map();

const TTL = {
    metrics: 24 * 60 * 60 * 1000,   // 24 hours
    districts: 7 * 24 * 60 * 60 * 1000, // 7 days
    layers: 24 * 60 * 60 * 1000,    // 24 hours
    metadata: 7 * 24 * 60 * 60 * 1000, // 7 days
};

export function getCached(key, ttlKey = 'metrics') {
    const entry = store.get(key);
    if (!entry) return null;
    if (Date.now() - entry.ts > (TTL[ttlKey] ?? TTL.metrics)) {
        store.delete(key);
        return null;
    }
    return entry.data;
}

export function setCached(key, data) {
    store.set(key, { data, ts: Date.now() });
}

export function cacheSize() {
    return store.size;
}
