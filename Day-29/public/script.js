// ── State ─────────────────────────────────────────────────────────────────
let allPosts  = [];
let activeTag = 'all';
let editingId = null;

// ── DOM ───────────────────────────────────────────────────────────────────
const container      = document.getElementById('blog-container');
const featuredSection= document.getElementById('featured-section');
const emptyState     = document.getElementById('empty-state');
const modal          = document.getElementById('modal');
const toast          = document.getElementById('toast');
const tagNav         = document.getElementById('tag-nav');
const postCountLabel = document.getElementById('post-count-label');
const dateDisplay    = document.getElementById('date-display');

const fieldTitle   = document.getElementById('field-title');
const fieldAuthor  = document.getElementById('field-author');
const fieldContent = document.getElementById('field-content');
const fieldTag     = document.getElementById('field-tag');
const submitBtn    = document.getElementById('submitPost');
const modalTitle   = document.getElementById('modal-title');

// ── Init date ─────────────────────────────────────────────────────────────
dateDisplay.textContent = new Date().toLocaleDateString('en-US', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
});

// ── Helpers ───────────────────────────────────────────────────────────────
function esc(str) {
    return String(str)
        .replace(/&/g,'&amp;').replace(/</g,'&lt;')
        .replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

function fmtDate(d) {
    return new Date(d).toLocaleDateString('en-US', {
        month: 'long', day: 'numeric', year: 'numeric'
    });
}

function showToast(msg, type = 'success') {
    toast.textContent = msg;
    toast.className   = `toast ${type}`;
    clearTimeout(showToast._t);
    showToast._t = setTimeout(() => toast.classList.add('hidden'), 3000);
}

// ── Modal ─────────────────────────────────────────────────────────────────
function openModal(mode = 'create', post = null) {
    editingId = null;
    clearForm();
    modal.classList.remove('hidden');
    document.body.style.overflow = 'hidden';

    if (mode === 'edit' && post) {
        editingId             = post._id;
        fieldTitle.value      = post.title;
        fieldAuthor.value     = post.author;
        fieldContent.value    = post.content;
        fieldTag.value        = post.tag || 'General';
        modalTitle.textContent= 'Edit Story';
        submitBtn.textContent = 'Update';
    } else {
        modalTitle.textContent= 'New Story';
        submitBtn.textContent = 'Publish';
    }
}

function closeModal() {
    modal.classList.add('hidden');
    document.body.style.overflow = '';
    clearForm();
    editingId = null;
}

function clearForm() {
    fieldTitle.value = fieldAuthor.value = fieldContent.value = '';
    fieldTag.value   = 'General';
    document.getElementById('edit-id').value = '';
}

// ── Render ────────────────────────────────────────────────────────────────
function buildTagNav(posts) {
    const tags = ['all', ...new Set(posts.map(p => p.tag || 'General'))];
    tagNav.innerHTML = tags.map(t =>
        `<button class="tag-pill ${t === activeTag ? 'active' : ''}" data-tag="${t}">
            ${t === 'all' ? 'All Topics' : t}
        </button>`
    ).join('');
    tagNav.querySelectorAll('.tag-pill').forEach(btn => {
        btn.addEventListener('click', () => {
            activeTag = btn.dataset.tag;
            tagNav.querySelectorAll('.tag-pill').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            renderPosts();
        });
    });
}

function renderFeatured(post) {
    if (!post) { featuredSection.innerHTML = ''; return; }
    featuredSection.innerHTML = `
        <div class="featured-card">
            <div class="featured-left">
                <span class="featured-tag">${esc(post.tag || 'General')}</span>
                <h2 class="featured-title">${esc(post.title)}</h2>
                <div class="featured-meta">
                    By <strong>${esc(post.author)}</strong> &nbsp;·&nbsp; ${fmtDate(post.date)}
                </div>
                <div class="featured-actions">
                    <button class="btn-action" onclick="editPost('${post._id}')">Edit</button>
                    <button class="btn-action del" onclick="deletePost('${post._id}')">Delete</button>
                </div>
            </div>
            <div class="featured-divider"></div>
            <div class="featured-right">
                <p class="featured-excerpt">${esc(post.content.slice(0, 180))}${post.content.length > 180 ? '…' : ''}</p>
                <p class="featured-body">${esc(post.content)}</p>
            </div>
        </div>
    `;
}

function renderPosts() {
    const filtered = activeTag === 'all'
        ? allPosts
        : allPosts.filter(p => (p.tag || 'General') === activeTag);

    // update count label
    postCountLabel.textContent = `${filtered.length} ${filtered.length === 1 ? 'story' : 'stories'}`;

    if (filtered.length === 0) {
        featuredSection.innerHTML = '';
        container.innerHTML = '';
        emptyState.classList.remove('hidden');
        return;
    }
    emptyState.classList.add('hidden');

    // featured = newest post
    renderFeatured(filtered[0]);

    // rest in grid
    const rest = filtered.slice(1);
    if (rest.length === 0) {
        container.innerHTML = '';
        return;
    }

    container.innerHTML = rest.map(post => `
        <article class="post-card">
            <span class="post-tag">${esc(post.tag || 'General')}</span>
            <h3 class="post-title">${esc(post.title)}</h3>
            <p class="post-excerpt">${esc(post.content)}</p>
            <div class="post-foot">
                <span class="post-author">By <b>${esc(post.author)}</b></span>
                <span class="post-date">${fmtDate(post.date)}</span>
            </div>
            <div class="card-actions">
                <button class="btn-action" onclick="editPost('${post._id}')">Edit</button>
                <button class="btn-action del" onclick="deletePost('${post._id}')">Delete</button>
            </div>
        </article>
    `).join('');
}

// ── API ───────────────────────────────────────────────────────────────────
async function loadPosts() {
    try {
        const res = await fetch('/api/posts');
        allPosts  = await res.json();
        buildTagNav(allPosts);
        renderPosts();
    } catch {
        container.innerHTML = `<p style="grid-column:1/-1;padding:3rem;text-align:center;color:var(--muted)">⚠ Could not connect to database.</p>`;
        showToast('Failed to load posts', 'error');
    }
}

async function submitPost() {
    const title   = fieldTitle.value.trim();
    const author  = fieldAuthor.value.trim();
    const content = fieldContent.value.trim();
    const tag     = fieldTag.value;

    if (!title || !author || !content) {
        showToast('Please fill in all fields', 'error');
        return;
    }

    submitBtn.disabled     = true;
    submitBtn.textContent  = editingId ? 'Updating…' : 'Publishing…';

    try {
        const url    = editingId ? `/api/posts/${editingId}` : '/api/posts';
        const method = editingId ? 'PUT' : 'POST';
        const res    = await fetch(url, {
            method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ title, author, content, tag })
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Request failed');
        showToast(editingId ? '✓ Story updated' : '✓ Story published');
        closeModal();
        await loadPosts();
    } catch (err) {
        showToast(err.message, 'error');
    } finally {
        submitBtn.disabled    = false;
        submitBtn.textContent = editingId ? 'Update' : 'Publish';
    }
}

async function deletePost(id) {
    if (!confirm('Delete this story?')) return;
    try {
        await fetch(`/api/posts/${id}`, { method: 'DELETE' });
        showToast('Story deleted');
        await loadPosts();
    } catch { showToast('Failed to delete', 'error'); }
}

async function editPost(id) {
    try {
        const res  = await fetch(`/api/posts/${id}`);
        const post = await res.json();
        openModal('edit', post);
    } catch { showToast('Could not load post', 'error'); }
}

// ── Events ────────────────────────────────────────────────────────────────
document.getElementById('openModal').addEventListener('click',  () => openModal());
document.getElementById('closeModal').addEventListener('click', closeModal);
document.getElementById('cancelModal').addEventListener('click', closeModal);
document.getElementById('submitPost').addEventListener('click', submitPost);
modal.addEventListener('click', e => { if (e.target === modal) closeModal(); });
document.addEventListener('keydown', e => { if (e.key === 'Escape') closeModal(); });

// ── Boot ──────────────────────────────────────────────────────────────────
window.onload = loadPosts;