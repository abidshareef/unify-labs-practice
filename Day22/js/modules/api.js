/**
 * NEXUS — API Module
 * Handles all data fetching from the CoinCap API.
 * Uses try/catch for robust error handling.
 * Includes built-in mock data fallback for offline/portfolio demo mode.
 */

const BASE_URL = 'https://api.coincap.io/v2';

/**
 * Fetches the top cryptocurrencies by market cap.
 * Falls back to realistic mock data if the API is unreachable.
 * @param {number} limit - Number of coins to fetch (default 50)
 * @returns {Promise<Array>} Normalized coin data array
 */
export async function fetchCoins(limit = 50) {
    try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 8000);

        const response = await fetch(`${BASE_URL}/assets?limit=${limit}`, {
            signal: controller.signal,
        });
        clearTimeout(timeout);

        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const json = await response.json();

        if (!json.data || !Array.isArray(json.data)) {
            throw new Error('Invalid API response format');
        }

        return json.data.map(normalizeCoin);
    } catch (error) {
        console.warn('NEXUS — Live API unavailable, using demo data:', error.message);
        return getMockCoins(limit);
    }
}

/**
 * Fetches 24-hour price history for a single coin (for sparklines).
 * Falls back to generated mock data.
 * @param {string} id - CoinCap asset ID
 * @returns {Promise<Array<number>>} Array of price points
 */
export async function fetchCoinHistory(id) {
    try {
        const end = Date.now();
        const start = end - 24 * 60 * 60 * 1000;
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 5000);

        const response = await fetch(
            `${BASE_URL}/assets/${id}/history?interval=h1&start=${start}&end=${end}`,
            { signal: controller.signal }
        );
        clearTimeout(timeout);

        if (!response.ok) return generateMockHistory(id);

        const json = await response.json();
        if (!json.data || !Array.isArray(json.data)) return generateMockHistory(id);

        return json.data.map(point => parseFloat(point.priceUsd));
    } catch {
        return generateMockHistory(id);
    }
}

/**
 * Fetches history data for multiple coins in parallel.
 * @param {Array} coins - Array of coin objects
 * @returns {Promise<Object>} Map of coinId -> price history array
 */
export async function fetchAllHistories(coins) {
    const historyMap = {};

    const batches = [];
    for (let i = 0; i < coins.length; i += 10) {
        batches.push(coins.slice(i, i + 10));
    }

    for (const batch of batches) {
        const results = await Promise.allSettled(
            batch.map(coin => fetchCoinHistory(coin.id))
        );

        batch.forEach((coin, index) => {
            if (results[index].status === 'fulfilled') {
                historyMap[coin.id] = results[index].value;
            } else {
                historyMap[coin.id] = generateMockHistory(coin.id);
            }
        });
    }

    return historyMap;
}

/**
 * Normalizes raw API data into a clean coin object.
 */
function normalizeCoin(raw) {
    return {
        id: raw.id,
        rank: parseInt(raw.rank, 10),
        name: raw.name,
        symbol: raw.symbol,
        price: parseFloat(raw.priceUsd) || 0,
        marketCap: parseFloat(raw.marketCapUsd) || 0,
        volume24h: parseFloat(raw.volumeUsd24Hr) || 0,
        change24h: parseFloat(raw.changePercent24Hr) || 0,
        supply: parseFloat(raw.supply) || 0,
        maxSupply: raw.maxSupply ? parseFloat(raw.maxSupply) : null,
        vwap24h: parseFloat(raw.vwap24Hr) || 0,
        explorer: raw.explorer || null,
    };
}

// ═══════════════════════════════════════════════════════════════════════
// MOCK DATA — Realistic fallback for offline / demo mode
// ═══════════════════════════════════════════════════════════════════════

const MOCK_DATA = [
    { id: 'bitcoin', rank: 1, name: 'Bitcoin', symbol: 'BTC', price: 97284.52, marketCap: 1928471000000, volume24h: 38542100000, change24h: 2.34, supply: 19821000, vwap24h: 96850.20 },
    { id: 'ethereum', rank: 2, name: 'Ethereum', symbol: 'ETH', price: 3456.78, marketCap: 415820000000, volume24h: 18320400000, change24h: -1.15, supply: 120340000, vwap24h: 3480.50 },
    { id: 'tether', rank: 3, name: 'Tether', symbol: 'USDT', price: 1.00, marketCap: 139570000000, volume24h: 62410000000, change24h: 0.01, supply: 139500000000, vwap24h: 1.00 },
    { id: 'solana', rank: 4, name: 'Solana', symbol: 'SOL', price: 198.42, marketCap: 96520000000, volume24h: 4821000000, change24h: 5.67, supply: 486500000, vwap24h: 195.30 },
    { id: 'binance-coin', rank: 5, name: 'BNB', symbol: 'BNB', price: 678.90, marketCap: 98420000000, volume24h: 2340000000, change24h: 1.89, supply: 145000000, vwap24h: 672.40 },
    { id: 'xrp', rank: 6, name: 'XRP', symbol: 'XRP', price: 2.45, marketCap: 141230000000, volume24h: 8920000000, change24h: 3.42, supply: 57640000000, vwap24h: 2.38 },
    { id: 'usd-coin', rank: 7, name: 'USD Coin', symbol: 'USDC', price: 1.00, marketCap: 56780000000, volume24h: 8340000000, change24h: 0.02, supply: 56750000000, vwap24h: 1.00 },
    { id: 'cardano', rank: 8, name: 'Cardano', symbol: 'ADA', price: 1.12, marketCap: 39850000000, volume24h: 1820000000, change24h: -2.31, supply: 35560000000, vwap24h: 1.14 },
    { id: 'dogecoin', rank: 9, name: 'Dogecoin', symbol: 'DOGE', price: 0.3842, marketCap: 56720000000, volume24h: 3410000000, change24h: 7.82, supply: 147600000000, vwap24h: 0.3690 },
    { id: 'avalanche', rank: 10, name: 'Avalanche', symbol: 'AVAX', price: 42.15, marketCap: 17290000000, volume24h: 892000000, change24h: -0.45, supply: 410200000, vwap24h: 42.50 },
    { id: 'tron', rank: 11, name: 'TRON', symbol: 'TRX', price: 0.245, marketCap: 21130000000, volume24h: 1230000000, change24h: 1.56, supply: 86280000000, vwap24h: 0.242 },
    { id: 'polkadot', rank: 12, name: 'Polkadot', symbol: 'DOT', price: 8.92, marketCap: 12840000000, volume24h: 456000000, change24h: -3.21, supply: 1440000000, vwap24h: 9.10 },
    { id: 'chainlink', rank: 13, name: 'Chainlink', symbol: 'LINK', price: 19.45, marketCap: 12420000000, volume24h: 678000000, change24h: 4.56, supply: 638900000, vwap24h: 18.90 },
    { id: 'polygon', rank: 14, name: 'Polygon', symbol: 'MATIC', price: 0.582, marketCap: 5420000000, volume24h: 345000000, change24h: -1.78, supply: 9320000000, vwap24h: 0.590 },
    { id: 'shiba-inu', rank: 15, name: 'Shiba Inu', symbol: 'SHIB', price: 0.00002845, marketCap: 16750000000, volume24h: 1120000000, change24h: 12.34, supply: 589000000000000, vwap24h: 0.00002710 },
    { id: 'litecoin', rank: 16, name: 'Litecoin', symbol: 'LTC', price: 108.75, marketCap: 8150000000, volume24h: 542000000, change24h: 0.89, supply: 74900000, vwap24h: 107.80 },
    { id: 'uniswap', rank: 17, name: 'Uniswap', symbol: 'UNI', price: 14.32, marketCap: 8620000000, volume24h: 312000000, change24h: -0.67, supply: 602000000, vwap24h: 14.45 },
    { id: 'bitcoin-cash', rank: 18, name: 'Bitcoin Cash', symbol: 'BCH', price: 478.90, marketCap: 9450000000, volume24h: 423000000, change24h: 1.23, supply: 19740000, vwap24h: 475.20 },
    { id: 'stellar', rank: 19, name: 'Stellar', symbol: 'XLM', price: 0.445, marketCap: 13420000000, volume24h: 567000000, change24h: 6.78, supply: 30160000000, vwap24h: 0.428 },
    { id: 'near-protocol', rank: 20, name: 'NEAR Protocol', symbol: 'NEAR', price: 5.82, marketCap: 7120000000, volume24h: 389000000, change24h: -2.45, supply: 1224000000, vwap24h: 5.95 },
    { id: 'cosmos', rank: 21, name: 'Cosmos', symbol: 'ATOM', price: 9.15, marketCap: 3580000000, volume24h: 234000000, change24h: 1.34, supply: 391200000, vwap24h: 9.05 },
    { id: 'monero', rank: 22, name: 'Monero', symbol: 'XMR', price: 215.40, marketCap: 3920000000, volume24h: 178000000, change24h: 0.56, supply: 18200000, vwap24h: 214.30 },
    { id: 'ethereum-classic', rank: 23, name: 'Ethereum Classic', symbol: 'ETC', price: 28.45, marketCap: 4180000000, volume24h: 267000000, change24h: -1.89, supply: 146900000, vwap24h: 28.90 },
    { id: 'aptos', rank: 24, name: 'Aptos', symbol: 'APT', price: 11.28, marketCap: 5340000000, volume24h: 312000000, change24h: 3.45, supply: 473400000, vwap24h: 10.95 },
    { id: 'filecoin', rank: 25, name: 'Filecoin', symbol: 'FIL', price: 6.42, marketCap: 3640000000, volume24h: 234000000, change24h: -0.78, supply: 567200000, vwap24h: 6.48 },
    { id: 'hedera', rank: 26, name: 'Hedera', symbol: 'HBAR', price: 0.312, marketCap: 11780000000, volume24h: 456000000, change24h: 8.92, supply: 37800000000, vwap24h: 0.298 },
    { id: 'internet-computer', rank: 27, name: 'Internet Computer', symbol: 'ICP', price: 12.85, marketCap: 6120000000, volume24h: 178000000, change24h: 2.34, supply: 476200000, vwap24h: 12.60 },
    { id: 'vechain', rank: 28, name: 'VeChain', symbol: 'VET', price: 0.0542, marketCap: 4390000000, volume24h: 189000000, change24h: -1.45, supply: 81000000000, vwap24h: 0.0548 },
    { id: 'render-token', rank: 29, name: 'Render', symbol: 'RNDR', price: 8.92, marketCap: 4620000000, volume24h: 234000000, change24h: 5.67, supply: 518000000, vwap24h: 8.65 },
    { id: 'arbitrum', rank: 30, name: 'Arbitrum', symbol: 'ARB', price: 1.28, marketCap: 4120000000, volume24h: 345000000, change24h: -3.12, supply: 3220000000, vwap24h: 1.32 },
    { id: 'optimism', rank: 31, name: 'Optimism', symbol: 'OP', price: 2.45, marketCap: 3280000000, volume24h: 234000000, change24h: 1.78, supply: 1340000000, vwap24h: 2.42 },
    { id: 'injective', rank: 32, name: 'Injective', symbol: 'INJ', price: 28.90, marketCap: 2780000000, volume24h: 178000000, change24h: 4.56, supply: 96200000, vwap24h: 28.10 },
    { id: 'sei', rank: 33, name: 'Sei', symbol: 'SEI', price: 0.542, marketCap: 2120000000, volume24h: 189000000, change24h: -2.34, supply: 3910000000, vwap24h: 0.552 },
    { id: 'aave', rank: 34, name: 'Aave', symbol: 'AAVE', price: 342.50, marketCap: 5120000000, volume24h: 312000000, change24h: 3.45, supply: 14960000, vwap24h: 338.20 },
    { id: 'algorand', rank: 35, name: 'Algorand', symbol: 'ALGO', price: 0.378, marketCap: 3120000000, volume24h: 156000000, change24h: 0.89, supply: 8250000000, vwap24h: 0.374 },
    { id: 'fantom', rank: 36, name: 'Fantom', symbol: 'FTM', price: 0.892, marketCap: 2500000000, volume24h: 234000000, change24h: 6.78, supply: 2800000000, vwap24h: 0.862 },
    { id: 'the-graph', rank: 37, name: 'The Graph', symbol: 'GRT', price: 0.328, marketCap: 3120000000, volume24h: 178000000, change24h: -1.23, supply: 9520000000, vwap24h: 0.332 },
    { id: 'theta-network', rank: 38, name: 'Theta Network', symbol: 'THETA', price: 2.45, marketCap: 2450000000, volume24h: 89000000, change24h: 1.56, supply: 1000000000, vwap24h: 2.42 },
    { id: 'flow', rank: 39, name: 'Flow', symbol: 'FLOW', price: 0.982, marketCap: 1520000000, volume24h: 67000000, change24h: -0.45, supply: 1548000000, vwap24h: 0.985 },
    { id: 'sandbox', rank: 40, name: 'The Sandbox', symbol: 'SAND', price: 0.648, marketCap: 1540000000, volume24h: 234000000, change24h: 4.56, supply: 2378000000, vwap24h: 0.632 },
    { id: 'decentraland', rank: 41, name: 'Decentraland', symbol: 'MANA', price: 0.572, marketCap: 1120000000, volume24h: 143000000, change24h: 2.34, supply: 1960000000, vwap24h: 0.564 },
    { id: 'axie-infinity', rank: 42, name: 'Axie Infinity', symbol: 'AXS', price: 8.45, marketCap: 1210000000, volume24h: 89000000, change24h: -1.78, supply: 143200000, vwap24h: 8.56 },
    { id: 'eos', rank: 43, name: 'EOS', symbol: 'EOS', price: 0.892, marketCap: 1340000000, volume24h: 178000000, change24h: 0.67, supply: 1503000000, vwap24h: 0.888 },
    { id: 'tezos', rank: 44, name: 'Tezos', symbol: 'XTZ', price: 1.28, marketCap: 1280000000, volume24h: 45000000, change24h: -0.34, supply: 1000000000, vwap24h: 1.28 },
    { id: 'iota', rank: 45, name: 'IOTA', symbol: 'IOTA', price: 0.342, marketCap: 1180000000, volume24h: 34000000, change24h: 2.89, supply: 3450000000, vwap24h: 0.338 },
    { id: 'zcash', rank: 46, name: 'Zcash', symbol: 'ZEC', price: 42.80, marketCap: 698000000, volume24h: 56000000, change24h: 1.12, supply: 16320000, vwap24h: 42.50 },
    { id: 'maker', rank: 47, name: 'Maker', symbol: 'MKR', price: 1842.00, marketCap: 1720000000, volume24h: 89000000, change24h: -2.45, supply: 934000, vwap24h: 1860.00 },
    { id: 'neo', rank: 48, name: 'NEO', symbol: 'NEO', price: 15.60, marketCap: 1100000000, volume24h: 67000000, change24h: 3.21, supply: 70540000, vwap24h: 15.32 },
    { id: 'dash', rank: 49, name: 'Dash', symbol: 'DASH', price: 32.45, marketCap: 386000000, volume24h: 78000000, change24h: 0.45, supply: 11900000, vwap24h: 32.30 },
    { id: 'pepe', rank: 50, name: 'Pepe', symbol: 'PEPE', price: 0.00001234, marketCap: 5190000000, volume24h: 1890000000, change24h: 15.67, supply: 420690000000000, vwap24h: 0.00001180 },
];

/**
 * Returns mock coin data.
 * @param {number} limit
 * @returns {Array}
 */
function getMockCoins(limit) {
    // Add slight randomization to make it feel "live"
    return MOCK_DATA.slice(0, limit).map(coin => ({
        ...coin,
        price: coin.price * (1 + (Math.random() - 0.5) * 0.01),
        change24h: coin.change24h + (Math.random() - 0.5) * 0.5,
        volume24h: coin.volume24h * (1 + (Math.random() - 0.5) * 0.05),
        maxSupply: null,
        explorer: null,
    }));
}

/**
 * Generates realistic mock sparkline history data.
 * @param {string} id - Coin id (used as seed for consistency)
 * @returns {Array<number>}
 */
function generateMockHistory(id) {
    const coin = MOCK_DATA.find(c => c.id === id);
    const basePrice = coin ? coin.price : 100;
    const points = 24;
    const history = [];

    // Simple hash from id for deterministic-ish but unique patterns
    let seed = 0;
    for (let i = 0; i < id.length; i++) {
        seed = (seed * 31 + id.charCodeAt(i)) & 0xffffffff;
    }

    let price = basePrice * 0.98;
    for (let i = 0; i < points; i++) {
        // Pseudo-random walk
        seed = (seed * 1103515245 + 12345) & 0xffffffff;
        const rand = ((seed >> 16) & 0x7fff) / 0x7fff;
        const change = (rand - 0.48) * basePrice * 0.015;
        price = Math.max(basePrice * 0.9, Math.min(basePrice * 1.1, price + change));
        history.push(price);
    }

    // Ensure last point is near current price
    history[points - 1] = basePrice;

    return history;
}

export default { fetchCoins, fetchCoinHistory, fetchAllHistories };
