/**
 * NEXUS — UI Module
 * Handles all DOM rendering: cards, skeletons, toasts, stats, sparklines.
 * Uses template literals for dynamic HTML generation.
 */

// ─── DOM References ────────────────────────────────────────────────────
const Elements = {
    grid: () => document.getElementById('cards-grid'),
    emptyState: () => document.getElementById('empty-state'),
    statsSection: () => document.getElementById('stats-section'),
    toastContainer: () => document.getElementById('toast-container'),
    watchlistCount: () => document.getElementById('watchlist-count'),
    lastUpdated: () => document.getElementById('last-updated'),
    searchInput: () => document.getElementById('search-input'),
    searchClear: () => document.getElementById('search-clear'),
    sortDirection: () => document.getElementById('sort-direction'),
};

// ─── Format Utilities ──────────────────────────────────────────────────

/**
 * Formats a number as compact currency (e.g., $1.23T, $456.7B).
 * @param {number} num
 * @returns {string}
 */
function formatCurrency(num) {
    if (num >= 1e12) return `$${(num / 1e12).toFixed(2)}T`;
    if (num >= 1e9) return `$${(num / 1e9).toFixed(2)}B`;
    if (num >= 1e6) return `$${(num / 1e6).toFixed(2)}M`;
    if (num >= 1e3) return `$${(num / 1e3).toFixed(2)}K`;
    if (num >= 1) return `$${num.toFixed(2)}`;
    if (num >= 0.01) return `$${num.toFixed(4)}`;
    return `$${num.toFixed(8)}`;
}

/**
 * Formats a price with appropriate precision.
 * @param {number} price
 * @returns {string}
 */
function formatPrice(price) {
    if (price >= 1000) return `$${price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    if (price >= 1) return `$${price.toFixed(2)}`;
    if (price >= 0.01) return `$${price.toFixed(4)}`;
    return `$${price.toFixed(8)}`;
}

/**
 * Formats a percentage change with + sign for positives.
 * @param {number} change
 * @returns {string}
 */
function formatChange(change) {
    const sign = change >= 0 ? '+' : '';
    return `${sign}${change.toFixed(2)}%`;
}

/**
 * Returns an SVG icon string for given type.
 */
function getToastIcon(type) {
    switch (type) {
        case 'error':
            return `<svg class="toast__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>`;
        case 'success':
            return `<svg class="toast__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>`;
        case 'info':
        default:
            return `<svg class="toast__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>`;
    }
}

// ─── Coin Card Generation ──────────────────────────────────────────────

/**
 * Generates HTML for a single coin card using template literals.
 * @param {Object} coin - Normalized coin object
 * @param {boolean} isFav - Whether the coin is in favorites
 * @returns {string} HTML string
 */
function createCardHTML(coin, isFav) {
    const changeClass = coin.change24h >= 0 ? 'card__change--up' : 'card__change--down';
    const changeArrow = coin.change24h >= 0 ? '▲' : '▼';
    const favClass = isFav ? 'card__fav-btn--active' : '';
    const favIcon = isFav
        ? `<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" stroke-width="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>`
        : `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>`;

    return `
        <article class="card" data-coin-id="${coin.id}" id="card-${coin.id}">
            <div class="card__header">
                <div class="card__info">
                    <span class="card__rank">${coin.rank}</span>
                    <img
                        class="card__icon"
                        src="https://assets.coincap.io/assets/icons/${coin.symbol.toLowerCase()}@2x.png"
                        alt="${coin.name}"
                        loading="lazy"
                        onerror="this.style.display='none'"
                    >
                    <div class="card__name-group">
                        <h3 class="card__name">${coin.name}</h3>
                        <span class="card__symbol">${coin.symbol}</span>
                    </div>
                </div>
                <button
                    class="card__fav-btn ${favClass}"
                    data-fav-id="${coin.id}"
                    title="${isFav ? 'Remove from watchlist' : 'Add to watchlist'}"
                    aria-label="${isFav ? 'Remove from watchlist' : 'Add to watchlist'}"
                >
                    ${favIcon}
                </button>
            </div>

            <div class="card__body">
                <div class="card__price-row">
                    <span class="card__price">${formatPrice(coin.price)}</span>
                    <span class="card__change ${changeClass}">
                        <span class="card__change-arrow">${changeArrow}</span>
                        ${formatChange(coin.change24h)}
                    </span>
                </div>
                <div class="card__sparkline" id="sparkline-${coin.id}">
                    <canvas></canvas>
                </div>
            </div>

            <div class="card__footer">
                <div class="card__stat">
                    <span class="card__stat-label">Market Cap</span>
                    <span class="card__stat-value">${formatCurrency(coin.marketCap)}</span>
                </div>
                <div class="card__stat">
                    <span class="card__stat-label">24h Volume</span>
                    <span class="card__stat-value">${formatCurrency(coin.volume24h)}</span>
                </div>
                <div class="card__stat">
                    <span class="card__stat-label">Supply</span>
                    <span class="card__stat-value">${formatCurrency(coin.supply).replace('$', '')}</span>
                </div>
                <div class="card__stat">
                    <span class="card__stat-label">VWAP 24h</span>
                    <span class="card__stat-value">${formatPrice(coin.vwap24h)}</span>
                </div>
            </div>
        </article>
    `;
}

// ─── Skeleton Generation ───────────────────────────────────────────────

/**
 * Generates HTML for a single skeleton card.
 * @returns {string} HTML string
 */
function createSkeletonHTML() {
    return `
        <div class="skeleton">
            <div class="skeleton__row">
                <div class="skeleton__circle"></div>
                <div style="flex:1; display:flex; flex-direction:column; gap:6px;">
                    <div class="skeleton__line skeleton__line--medium"></div>
                    <div class="skeleton__line skeleton__line--short"></div>
                </div>
            </div>
            <div class="skeleton__line skeleton__line--long" style="height:24px;"></div>
            <div class="skeleton__block"></div>
            <div style="display:grid; grid-template-columns:1fr 1fr; gap:8px;">
                <div class="skeleton__line skeleton__line--full" style="height:32px;"></div>
                <div class="skeleton__line skeleton__line--full" style="height:32px;"></div>
                <div class="skeleton__line skeleton__line--full" style="height:32px;"></div>
                <div class="skeleton__line skeleton__line--full" style="height:32px;"></div>
            </div>
        </div>
    `;
}

// ─── Sparkline Drawing ─────────────────────────────────────────────────

/**
 * Draws a sparkline chart on a canvas element.
 * @param {HTMLCanvasElement} canvas - The canvas to draw on
 * @param {Array<number>} data - Price points
 * @param {boolean} isPositive - Whether the overall change is positive
 */
function drawSparkline(canvas, data, isPositive) {
    if (!canvas || !data || data.length < 2) return;

    const ctx = canvas.getContext('2d');
    const rect = canvas.parentElement.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;

    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);

    const width = rect.width;
    const height = rect.height;

    const min = Math.min(...data);
    const max = Math.max(...data);
    const range = max - min || 1;

    const color = isPositive ? '#22c55e' : '#ef4444';
    const gradientColor = isPositive ? 'rgba(34, 197, 94,' : 'rgba(239, 68, 68,';

    // Draw fill gradient
    const gradient = ctx.createLinearGradient(0, 0, 0, height);
    gradient.addColorStop(0, `${gradientColor}0.2)`);
    gradient.addColorStop(1, `${gradientColor}0)`);

    ctx.beginPath();
    ctx.moveTo(0, height);

    data.forEach((price, i) => {
        const x = (i / (data.length - 1)) * width;
        const y = height - ((price - min) / range) * (height * 0.85) - height * 0.05;
        if (i === 0) {
            ctx.lineTo(x, y);
        } else {
            // Smooth curve
            const prevX = ((i - 1) / (data.length - 1)) * width;
            const prevY = height - ((data[i - 1] - min) / range) * (height * 0.85) - height * 0.05;
            const cpX = (prevX + x) / 2;
            ctx.bezierCurveTo(cpX, prevY, cpX, y, x, y);
        }
    });

    ctx.lineTo(width, height);
    ctx.closePath();
    ctx.fillStyle = gradient;
    ctx.fill();

    // Draw line
    ctx.beginPath();
    data.forEach((price, i) => {
        const x = (i / (data.length - 1)) * width;
        const y = height - ((price - min) / range) * (height * 0.85) - height * 0.05;
        if (i === 0) {
            ctx.moveTo(x, y);
        } else {
            const prevX = ((i - 1) / (data.length - 1)) * width;
            const prevY = height - ((data[i - 1] - min) / range) * (height * 0.85) - height * 0.05;
            const cpX = (prevX + x) / 2;
            ctx.bezierCurveTo(cpX, prevY, cpX, y, x, y);
        }
    });

    ctx.strokeStyle = color;
    ctx.lineWidth = 2;
    ctx.stroke();
}

// ─── Public Render Functions ───────────────────────────────────────────

/**
 * Renders loading skeleton cards in the grid.
 * @param {number} count - Number of skeletons to show
 */
export function renderSkeletons(count = 12) {
    const grid = Elements.grid();
    if (!grid) return;

    let html = '';
    for (let i = 0; i < count; i++) {
        html += createSkeletonHTML();
    }
    grid.innerHTML = html;

    // Stagger animation
    const skeletons = grid.querySelectorAll('.skeleton');
    skeletons.forEach((el, i) => {
        el.style.animationDelay = `${i * 60}ms`;
    });

    Elements.emptyState().style.display = 'none';
}

/**
 * Renders coin cards in the grid.
 * @param {Array} coins - Filtered/sorted coins array
 * @param {Function} isFavoriteFn - Function to check if coin is favorited
 * @param {Object} histories - Map of coin ID to price history
 */
export function renderCards(coins, isFavoriteFn, histories = {}) {
    const grid = Elements.grid();
    const emptyState = Elements.emptyState();
    if (!grid) return;

    if (coins.length === 0) {
        grid.innerHTML = '';
        emptyState.style.display = 'block';
        return;
    }

    emptyState.style.display = 'none';

    const html = coins.map(coin => createCardHTML(coin, isFavoriteFn(coin.id))).join('');
    grid.innerHTML = html;

    // Stagger card animations
    const cards = grid.querySelectorAll('.card');
    cards.forEach((el, i) => {
        el.style.animationDelay = `${i * 40}ms`;
    });

    // Draw sparklines
    requestAnimationFrame(() => {
        coins.forEach(coin => {
            const sparklineContainer = document.getElementById(`sparkline-${coin.id}`);
            if (sparklineContainer) {
                const canvas = sparklineContainer.querySelector('canvas');
                const historyData = histories[coin.id];
                if (historyData && historyData.length > 1) {
                    drawSparkline(canvas, historyData, coin.change24h >= 0);
                }
            }
        });
    });
}

/**
 * Renders aggregate statistics in the dashboard header.
 * @param {Object} stats - Stats object from state module
 */
export function renderStats(stats) {
    const mcapEl = document.getElementById('stat-mcap-value');
    const volumeEl = document.getElementById('stat-volume-value');
    const changeEl = document.getElementById('stat-change-value');
    const btcEl = document.getElementById('stat-btc-value');

    if (mcapEl) mcapEl.textContent = formatCurrency(stats.totalMarketCap);
    if (volumeEl) volumeEl.textContent = formatCurrency(stats.totalVolume);

    if (changeEl) {
        changeEl.textContent = formatChange(stats.avgChange);
        changeEl.style.color = stats.avgChange >= 0
            ? 'var(--color-success)'
            : 'var(--color-danger)';
    }

    if (btcEl) btcEl.textContent = `${stats.btcDominance.toFixed(1)}%`;
}

/**
 * Updates the watchlist count badge.
 * @param {number} count
 */
export function updateWatchlistCount(count) {
    const el = Elements.watchlistCount();
    if (!el) return;

    if (count > 0) {
        el.textContent = count;
        el.style.display = 'inline-flex';
    } else {
        el.style.display = 'none';
    }
}

/**
 * Updates the last updated timestamp in the navbar.
 * @param {string} time
 */
export function updateLastUpdated(time) {
    const el = Elements.lastUpdated();
    if (el) el.textContent = time;
}

/**
 * Applies the theme to the document.
 * @param {string} theme - 'dark' or 'light'
 */
export function applyTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
}

/**
 * Updates the active sort button UI.
 * @param {string} field - Active sort field
 */
export function updateSortUI(field) {
    document.querySelectorAll('.sort-btn').forEach(btn => {
        btn.classList.toggle('sort-btn--active', btn.dataset.sort === field);
    });
}

/**
 * Updates the sort direction button UI.
 * @param {string} direction - 'asc' or 'desc'
 */
export function updateSortDirectionUI(direction) {
    const btn = Elements.sortDirection();
    if (btn) {
        btn.setAttribute('data-dir', direction);
    }
}

/**
 * Shows the search clear button.
 * @param {boolean} show
 */
export function toggleSearchClear(show) {
    const el = Elements.searchClear();
    if (el) el.style.display = show ? 'flex' : 'none';
}

/**
 * Updates the active tab UI.
 * @param {string} tab - 'dashboard' or 'watchlist'
 */
export function updateTabUI(tab) {
    document.querySelectorAll('.navbar__tab').forEach(btn => {
        btn.classList.toggle('navbar__tab--active', btn.dataset.tab === tab);
    });
}

/**
 * Updates the empty state for watchlist.
 * @param {string} tab
 */
export function updateEmptyStateText(tab) {
    const title = Elements.emptyState()?.querySelector('.empty-state__title');
    const text = Elements.emptyState()?.querySelector('.empty-state__text');

    if (tab === 'watchlist') {
        if (title) title.textContent = 'Your watchlist is empty';
        if (text) text.textContent = 'Click the heart icon on any coin to add it here';
    } else {
        if (title) title.textContent = 'No results found';
        if (text) text.textContent = 'Try adjusting your search or filters';
    }
}

/**
 * Shows a toast notification.
 * @param {string} message - The message to display
 * @param {'error'|'success'|'info'} type - Toast type
 * @param {number} duration - Duration in ms (default 4000)
 */
export function showToast(message, type = 'info', duration = 4000) {
    const container = Elements.toastContainer();
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = `toast toast--${type}`;
    toast.innerHTML = `
        ${getToastIcon(type)}
        <span class="toast__message">${message}</span>
    `;

    container.appendChild(toast);

    // Auto-remove after duration
    setTimeout(() => {
        toast.classList.add('toast--exit');
        toast.addEventListener('animationend', () => toast.remove());
    }, duration);

    // Cap at 3 toasts
    const toasts = container.querySelectorAll('.toast:not(.toast--exit)');
    if (toasts.length > 3) {
        toasts[0].classList.add('toast--exit');
        toasts[0].addEventListener('animationend', () => toasts[0].remove());
    }
}

export default {
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
};
