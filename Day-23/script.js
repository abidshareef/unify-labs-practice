/* ══════════════════════════════════════════
   STATE
══════════════════════════════════════════ */

const TOTAL_STEPS = 7;

// Track which steps are complete (1-indexed)
const completedSteps = new Set();

/* ══════════════════════════════════════════
   PROGRESS
══════════════════════════════════════════ */

const updateProgress = () => {
  const count    = completedSteps.size;
  const percent  = Math.round((count / TOTAL_STEPS) * 100);

  document.getElementById('progressFill').style.width  = `${percent}%`;
  document.getElementById('progressLabel').textContent = `${count} / ${TOTAL_STEPS} steps complete`;

  // Show completion banner when all done
  const banner = document.getElementById('completionBanner');
  if (count === TOTAL_STEPS) {
    banner.classList.add('show');
    banner.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  } else {
    banner.classList.remove('show');
  }
};

/* ══════════════════════════════════════════
   STEP TOGGLE
══════════════════════════════════════════ */

const toggleStep = (stepNum) => {
  const card = document.querySelector(`.step-card[data-step="${stepNum}"]`);
  if (!card) return;

  if (completedSteps.has(stepNum)) {
    completedSteps.delete(stepNum);
    card.classList.remove('done');
    showToast(`Step ${String(stepNum).padStart(2, '0')} unmarked`);
  } else {
    completedSteps.add(stepNum);
    card.classList.add('done');
    showToast(`Step ${String(stepNum).padStart(2, '0')} complete ✓`);
  }

  updateProgress();
};

/* ══════════════════════════════════════════
   COPY CODE
══════════════════════════════════════════ */

const copyCode = (blockId) => {
  const block = document.getElementById(blockId);
  if (!block) return;

  // Get raw text from <pre><code>
  const codeEl = block.querySelector('pre code');
  const text   = codeEl ? codeEl.innerText : '';

  navigator.clipboard.writeText(text).then(() => {
    // Visual feedback on the button
    const btn = block.querySelector('.copy-btn');
    if (btn) {
      btn.textContent = 'copied!';
      btn.classList.add('copied');
      setTimeout(() => {
        btn.textContent = 'copy';
        btn.classList.remove('copied');
      }, 2000);
    }
    showToast('Copied to clipboard');
  }).catch(() => {
    showToast('Copy failed — select manually');
  });
};

/* ══════════════════════════════════════════
   LIVE CLOCK
══════════════════════════════════════════ */

const updateClock = () => {
  const now = new Date();
  const pad = (n) => String(n).padStart(2, '0');
  const time = `${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;
  const el = document.getElementById('clock');
  if (el) el.textContent = time;
};

/* ══════════════════════════════════════════
   TOAST
══════════════════════════════════════════ */

let toastTimer = null;

const showToast = (msg) => {
  const t = document.getElementById('toast');
  if (!t) return;
  t.textContent = msg;
  t.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => t.classList.remove('show'), 2200);
};

/* ══════════════════════════════════════════
   KEYBOARD SHORTCUTS
   Press 1–7 to toggle a step
══════════════════════════════════════════ */

document.addEventListener('keydown', (e) => {
  const num = parseInt(e.key, 10);
  if (num >= 1 && num <= TOTAL_STEPS) {
    toggleStep(num);
  }
});

/* ══════════════════════════════════════════
   INIT
══════════════════════════════════════════ */

// Start clock
updateClock();
setInterval(updateClock, 1000);

// Init progress display
updateProgress();