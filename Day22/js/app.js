/**
 * NEXUS — Main Application Module
 * Orchestrates all modules: API, State, UI, Particles.
 * Handles event wiring, data flow, and auto-refresh.
 */

import { fetchCoins, fetchAllHistories } from './modules/api.js';
import AppState, {
    loadState,
    setCoins,
    setHistories,
    setLoading,
    toggleFavorite,
    isFavorite,
    toggleTheme,
    setSortField,
    toggleSortDirection,
    setSearchQuery,
    setActiveTab,
    getFilteredCoins,
    getStats,
    getFavoritesCount,
    getLastUpdatedTime,
} from './modules/state.js';
import {
    renderSkeletons,
    renderCards,
    renderStats,
    updateWatchlistCount,
    updateLastUpdated,
    applyTheme,
    updateSortUI,
    updateSortDirectionUI,
    toggleSearchClear,
    updateTabUI,
    updateEmptyStateText,
    showToast,
} from './modules/ui.js';
import ParticleSystem from './particles.js';

// ─── Constants ─────────────────────────────────────────────────────────
const AUTO_REFRESH_INTERVAL = 60_000; // 60 seconds
const SEARCH_DEBOUNCE_DELAY = 250;    // 250ms debounce

// ─── Module-level variables ────────────────────────────────────────────
let particleSystem = null;
let refreshTimer = null;
let searchDebounceTimer = null;

// ─── Initialization ────────────────────────────────────────────────────

/**
 * Main initialization function.
 * Called on DOMContentLoaded.
 */
async function init() {
    // 1. Load persisted state from localStorage
    loadState();

    // 2. Apply persisted theme
    applyTheme(AppState.theme);

    // 3. Apply persisted sort preferences
    updateSortUI(AppState.sortField);
    updateSortDirectionUI(AppState.sortDirection);

    // 4. Update watchlist badge
    updateWatchlistCount(getFavoritesCount());

    // 5. Initialize particle system
    particleSystem = new ParticleSystem('particle-canvas');
    particleSystem.setTheme(AppState.theme);
    particleSystem.start();

    // 6. Bind all event listeners
    bindEvents();

    // 7. Fetch initial data
    await loadData();

    // 8. Start auto-refresh
    startAutoRefresh();
}

// ─── Data Loading ──────────────────────────────────────────────────────

/**
 * Fetches coin data and updates the UI.
 * Shows skeletons during load, handles errors with toasts.
 */
async function loadData() {
    setLoading(true);
    renderSkeletons(12);

    try {
        // Fetch main coin data
        const coins = await fetchCoins(50);
        setCoins(coins);

        // Update stats
        const stats = getStats();
        renderStats(stats);

        // Update last-updated time
        updateLastUpdated(getLastUpdatedTime());

        // Render cards
        const filtered = getFilteredCoins();
        renderCards(filtered, isFavorite, AppState.histories);

        // Fetch sparkline histories in background (non-blocking)
        fetchAllHistories(coins).then(histories => {
            setHistories(histories);
            // Re-render cards with sparklines
            const currentFiltered = getFilteredCoins();
            renderCards(currentFiltered, isFavorite, histories);
        });

        setLoading(false);
        showToast('Data refreshed successfully', 'success', 2500);
    } catch (error) {
        setLoading(false);
        console.error('NEXUS — Data fetch error:', error);
        showToast(error.message || 'Failed to load data. Please try again.', 'error', 6000);

        // If we have cached coins, show them
        if (AppState.coins.length > 0) {
            const filtered = getFilteredCoins();
            renderCards(filtered, isFavorite, AppState.histories);
        }
    }
}

// ─── Event Binding ─────────────────────────────────────────────────────

/**
 * Binds all event listeners.
 */
function bindEvents() {
    // Theme Toggle
    const themeBtn = document.getElementById('theme-toggle');
    themeBtn?.addEventListener('click', handleThemeToggle);

    // Refresh Button
    const refreshBtn = document.getElementById('refresh-btn');
    refreshBtn?.addEventListener('click', handleRefresh);

    // Search Input
    const searchInput = document.getElementById('search-input');
    searchInput?.addEventListener('input', handleSearchInput);

    // Search Clear
    const searchClear = document.getElementById('search-clear');
    searchClear?.addEventListener('click', handleSearchClear);

    // Sort Buttons (Event Delegation)
    const sortContainer = document.querySelector('.controls__sort-buttons');
    sortContainer?.addEventListener('click', handleSortClick);

    // Sort Direction Toggle
    const sortDirBtn = document.getElementById('sort-direction');
    sortDirBtn?.addEventListener('click', handleSortDirection);

    // Tab Buttons
    const tabDashboard = document.getElementById('tab-dashboard');
    const tabWatchlist = document.getElementById('tab-watchlist');
    tabDashboard?.addEventListener('click', () => handleTabSwitch('dashboard'));
    tabWatchlist?.addEventListener('click', () => handleTabSwitch('watchlist'));

    // Favorite Buttons (Event Delegation on grid)
    const grid = document.getElementById('cards-grid');
    grid?.addEventListener('click', handleGridClick);
}

// ─── Event Handlers ────────────────────────────────────────────────────

/**
 * Handles theme toggle.
 */
function handleThemeToggle() {
    const newTheme = toggleTheme();
    applyTheme(newTheme);
    particleSystem?.setTheme(newTheme);
    showToast(`${newTheme === 'dark' ? '🌙 Dark' : '☀️ Light'} mode activated`, 'info', 2000);
}

/**
 * Handles manual refresh.
 */
async function handleRefresh() {
    const btn = document.getElementById('refresh-btn');
    if (btn) {
        btn.disabled = true;
        btn.style.opacity = '0.5';
    }

    await loadData();

    // Re-enable after cooldown
    setTimeout(() => {
        if (btn) {
            btn.disabled = false;
            btn.style.opacity = '1';
        }
    }, 2000);
}

/**
 * Handles search input with debouncing.
 */
function handleSearchInput(e) {
    const query = e.target.value;
    toggleSearchClear(query.length > 0);

    // Debounce
    clearTimeout(searchDebounceTimer);
    searchDebounceTimer = setTimeout(() => {
        setSearchQuery(query);
        const filtered = getFilteredCoins();
        renderCards(filtered, isFavorite, AppState.histories);
    }, SEARCH_DEBOUNCE_DELAY);
}

/**
 * Handles clearing the search input.
 */
function handleSearchClear() {
    const searchInput = document.getElementById('search-input');
    if (searchInput) {
        searchInput.value = '';
        searchInput.focus();
    }
    toggleSearchClear(false);
    setSearchQuery('');
    const filtered = getFilteredCoins();
    renderCards(filtered, isFavorite, AppState.histories);
}

/**
 * Handles sort button clicks.
 */
function handleSortClick(e) {
    const btn = e.target.closest('.sort-btn');
    if (!btn) return;

    const field = btn.dataset.sort;
    setSortField(field);
    updateSortUI(field);

    const filtered = getFilteredCoins();
    renderCards(filtered, isFavorite, AppState.histories);
}

/**
 * Handles sort direction toggle.
 */
function handleSortDirection() {
    const newDir = toggleSortDirection();
    updateSortDirectionUI(newDir);

    const filtered = getFilteredCoins();
    renderCards(filtered, isFavorite, AppState.histories);
}

/**
 * Handles tab switching.
 */
function handleTabSwitch(tab) {
    setActiveTab(tab);
    updateTabUI(tab);
    updateEmptyStateText(tab);

    const filtered = getFilteredCoins();
    renderCards(filtered, isFavorite, AppState.histories);
}

/**
 * Handles clicks within the cards grid (event delegation).
 * Captures favorite button clicks.
 */
function handleGridClick(e) {
    const favBtn = e.target.closest('.card__fav-btn');
    if (!favBtn) return;

    const coinId = favBtn.dataset.favId;
    if (!coinId) return;

    // Toggle favorite
    const isNowFavorited = toggleFavorite(coinId);

    // Animate the button
    favBtn.classList.add('animate');
    setTimeout(() => favBtn.classList.remove('animate'), 400);

    // Update watchlist count
    updateWatchlistCount(getFavoritesCount());

    // If on watchlist tab and unfavorited, re-render to remove card
    if (AppState.activeTab === 'watchlist' && !isNowFavorited) {
        const filtered = getFilteredCoins();
        renderCards(filtered, isFavorite, AppState.histories);
        showToast('Removed from watchlist', 'info', 2000);
    } else {
        // Just update the button appearance
        if (isNowFavorited) {
            favBtn.classList.add('card__fav-btn--active');
            favBtn.innerHTML = `<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" stroke-width="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>`;
            favBtn.title = 'Remove from watchlist';
            showToast('Added to watchlist ❤️', 'success', 2000);
        } else {
            favBtn.classList.remove('card__fav-btn--active');
            favBtn.innerHTML = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>`;
            favBtn.title = 'Add to watchlist';
            showToast('Removed from watchlist', 'info', 2000);
        }
    }
}

// ─── Auto Refresh ──────────────────────────────────────────────────────

/**
 * Starts the auto-refresh interval for live data.
 */
function startAutoRefresh() {
    stopAutoRefresh();
    refreshTimer = setInterval(async () => {
        try {
            const coins = await fetchCoins(50);
            setCoins(coins);

            const stats = getStats();
            renderStats(stats);
            updateLastUpdated(getLastUpdatedTime());

            const filtered = getFilteredCoins();
            renderCards(filtered, isFavorite, AppState.histories);
        } catch (error) {
            console.warn('Auto-refresh failed:', error.message);
        }
    }, AUTO_REFRESH_INTERVAL);
}

/**
 * Stops the auto-refresh interval.
 */
function stopAutoRefresh() {
    if (refreshTimer) {
        clearInterval(refreshTimer);
        refreshTimer = null;
    }
}

// ─── Start the application ────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', init);
