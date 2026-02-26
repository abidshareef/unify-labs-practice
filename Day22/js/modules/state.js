/**
 * NEXUS — State Module
 * Central state management with localStorage persistence.
 * Tracks coins, favorites, theme, sort preferences, and search query.
 */

const STORAGE_KEYS = {
    FAVORITES: 'nexus_favorites',
    THEME: 'nexus_theme',
    SORT_FIELD: 'nexus_sort_field',
    SORT_DIR: 'nexus_sort_direction',
};

/**
 * The central application state object.
 */
const AppState = {
    coins: [],
    filteredCoins: [],
    histories: {},
    favorites: new Set(),
    theme: 'dark',
    sortField: 'rank',
    sortDirection: 'asc',
    searchQuery: '',
    activeTab: 'dashboard',
    isLoading: true,
    lastUpdated: null,
};

/**
 * Loads persisted state from localStorage.
 */
export function loadState() {
    try {
        // Load favorites
        const savedFavorites = localStorage.getItem(STORAGE_KEYS.FAVORITES);
        if (savedFavorites) {
            const parsed = JSON.parse(savedFavorites);
            if (Array.isArray(parsed)) {
                AppState.favorites = new Set(parsed);
            }
        }

        // Load theme
        const savedTheme = localStorage.getItem(STORAGE_KEYS.THEME);
        if (savedTheme === 'light' || savedTheme === 'dark') {
            AppState.theme = savedTheme;
        } else {
            // Respect system preference
            const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
            AppState.theme = prefersDark ? 'dark' : 'light';
        }

        // Load sort preferences
        const savedSortField = localStorage.getItem(STORAGE_KEYS.SORT_FIELD);
        if (savedSortField) {
            AppState.sortField = savedSortField;
        }

        const savedSortDir = localStorage.getItem(STORAGE_KEYS.SORT_DIR);
        if (savedSortDir === 'asc' || savedSortDir === 'desc') {
            AppState.sortDirection = savedSortDir;
        }
    } catch (error) {
        console.warn('Failed to load persisted state:', error);
    }
}

/**
 * Saves the current favorites list to localStorage.
 */
function saveFavorites() {
    try {
        localStorage.setItem(
            STORAGE_KEYS.FAVORITES,
            JSON.stringify([...AppState.favorites])
        );
    } catch (error) {
        console.warn('Failed to save favorites:', error);
    }
}

/**
 * Saves the current theme to localStorage.
 */
function saveTheme() {
    try {
        localStorage.setItem(STORAGE_KEYS.THEME, AppState.theme);
    } catch (error) {
        console.warn('Failed to save theme:', error);
    }
}

/**
 * Saves sort preferences to localStorage.
 */
function saveSortPreferences() {
    try {
        localStorage.setItem(STORAGE_KEYS.SORT_FIELD, AppState.sortField);
        localStorage.setItem(STORAGE_KEYS.SORT_DIR, AppState.sortDirection);
    } catch (error) {
        console.warn('Failed to save sort preferences:', error);
    }
}

/**
 * Adds a coin to favorites.
 * @param {string} coinId
 */
export function addFavorite(coinId) {
    AppState.favorites.add(coinId);
    saveFavorites();
}

/**
 * Removes a coin from favorites.
 * @param {string} coinId
 */
export function removeFavorite(coinId) {
    AppState.favorites.delete(coinId);
    saveFavorites();
}

/**
 * Toggles a coin in/out of favorites.
 * @param {string} coinId
 * @returns {boolean} True if now favorited, false if removed
 */
export function toggleFavorite(coinId) {
    if (AppState.favorites.has(coinId)) {
        removeFavorite(coinId);
        return false;
    } else {
        addFavorite(coinId);
        return true;
    }
}

/**
 * Checks if a coin is favorited.
 * @param {string} coinId
 * @returns {boolean}
 */
export function isFavorite(coinId) {
    return AppState.favorites.has(coinId);
}

/**
 * Toggles the theme between dark and light.
 * @returns {string} The new theme
 */
export function toggleTheme() {
    AppState.theme = AppState.theme === 'dark' ? 'light' : 'dark';
    saveTheme();
    return AppState.theme;
}

/**
 * Sets the sort field and persists it.
 * @param {string} field - The field to sort by
 */
export function setSortField(field) {
    AppState.sortField = field;
    saveSortPreferences();
}

/**
 * Toggles sort direction and persists it.
 * @returns {string} The new direction
 */
export function toggleSortDirection() {
    AppState.sortDirection = AppState.sortDirection === 'asc' ? 'desc' : 'asc';
    saveSortPreferences();
    return AppState.sortDirection;
}

/**
 * Sets the search query.
 * @param {string} query
 */
export function setSearchQuery(query) {
    AppState.searchQuery = query.toLowerCase().trim();
}

/**
 * Sets the active tab.
 * @param {string} tab
 */
export function setActiveTab(tab) {
    AppState.activeTab = tab;
}

/**
 * Updates the coins data in state.
 * @param {Array} coins
 */
export function setCoins(coins) {
    AppState.coins = coins;
    AppState.lastUpdated = new Date();
}

/**
 * Updates the histories data in state.
 * @param {Object} histories
 */
export function setHistories(histories) {
    AppState.histories = histories;
}

/**
 * Sets the loading state.
 * @param {boolean} loading
 */
export function setLoading(loading) {
    AppState.isLoading = loading;
}

/**
 * Filters coins based on the current search query using .filter().
 * @returns {Array} Filtered coins array
 */
export function getFilteredCoins() {
    let coins = [...AppState.coins];

    // Filter by active tab (watchlist shows only favorites)
    if (AppState.activeTab === 'watchlist') {
        coins = coins.filter(coin => AppState.favorites.has(coin.id));
    }

    // Filter by search query using .filter()
    if (AppState.searchQuery) {
        coins = coins.filter(coin =>
            coin.name.toLowerCase().includes(AppState.searchQuery) ||
            coin.symbol.toLowerCase().includes(AppState.searchQuery)
        );
    }

    // Sort using .sort()
    coins = sortCoins(coins, AppState.sortField, AppState.sortDirection);

    AppState.filteredCoins = coins;
    return coins;
}

/**
 * Sorts coins array using .sort() method.
 * @param {Array} coins - Array to sort
 * @param {string} field - Field to sort by
 * @param {string} direction - 'asc' or 'desc'
 * @returns {Array} Sorted array
 */
function sortCoins(coins, field, direction) {
    const multiplier = direction === 'asc' ? 1 : -1;

    return coins.sort((a, b) => {
        switch (field) {
            case 'name':
                return multiplier * a.name.localeCompare(b.name);
            case 'price':
                return multiplier * (a.price - b.price);
            case 'marketCap':
                return multiplier * (a.marketCap - b.marketCap);
            case 'change':
                return multiplier * (a.change24h - b.change24h);
            case 'rank':
            default:
                return multiplier * (a.rank - b.rank);
        }
    });
}

/**
 * Computes aggregate statistics using .reduce().
 * @returns {Object} Stats object
 */
export function getStats() {
    if (AppState.coins.length === 0) {
        return { totalMarketCap: 0, totalVolume: 0, avgChange: 0, btcDominance: 0 };
    }

    const totals = AppState.coins.reduce(
        (acc, coin) => {
            acc.totalMarketCap += coin.marketCap;
            acc.totalVolume += coin.volume24h;
            acc.totalChange += coin.change24h;
            return acc;
        },
        { totalMarketCap: 0, totalVolume: 0, totalChange: 0 }
    );

    const btcCoin = AppState.coins.find(c => c.symbol === 'BTC');
    const btcDominance = btcCoin
        ? (btcCoin.marketCap / totals.totalMarketCap) * 100
        : 0;

    return {
        totalMarketCap: totals.totalMarketCap,
        totalVolume: totals.totalVolume,
        avgChange: totals.totalChange / AppState.coins.length,
        btcDominance,
    };
}

/**
 * Gets the favorites count.
 * @returns {number}
 */
export function getFavoritesCount() {
    return AppState.favorites.size;
}

/**
 * Gets the last updated time as a formatted string.
 * @returns {string}
 */
export function getLastUpdatedTime() {
    if (!AppState.lastUpdated) return '--:--';
    return AppState.lastUpdated.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
    });
}

// Export the state object as default for direct access if needed
export default AppState;
