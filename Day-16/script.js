/* ══════════════════════════════════════════
   UTILITY FUNCTIONS  (Arrow Functions)
══════════════════════════════════════════ */

// 1. Title Case: trim + capitalize first letter of every word
const toTitleCase = (str) =>
  str
    .trim()
    .split(/\s+/)
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');

// 2. Count vowels in a string
const countVowels = (str) => {
  const matches = str.match(/[aeiouAEIOU]/g);
  return matches ? matches.length : 0;
};

// 3. Secret Message generator — replaces target words with ***
const secretMessage = (str, wordsToHide) => {
  let result = str;
  wordsToHide.forEach(word => {
    const trimmed = word.trim();
    if (!trimmed) return;
    const regex = new RegExp(`\\b${trimmed}\\b`, 'gi');
    result = result.replace(regex, '***');
  });
  return result;
};

/* ══════════════════════════════════════════
   STATISTICS HELPERS  (Math Object)
══════════════════════════════════════════ */

const getWordCount = (str) =>
  str.trim() === '' ? 0 : str.trim().split(/\s+/).length;

const getSentenceCount = (str) => {
  const matches = str.match(/[^.!?]*[.!?]+/g);
  return matches ? matches.length : (str.trim() ? 1 : 0);
};

const getCharCount = (str) => str.length;

// Update stat cards with pop animation
const updateStats = (str) => {
  const setVal = (id, val) => {
    const el = document.getElementById(id);
    if (el.textContent !== String(val)) {
      el.textContent = val;
      el.classList.remove('pop');
      void el.offsetWidth; // force reflow to restart animation
      el.classList.add('pop');
    }
  };
  setVal('statChars',     getCharCount(str));
  setVal('statWords',     getWordCount(str));
  setVal('statVowels',    countVowels(str));
  setVal('statSentences', getSentenceCount(str));
};

/* ══════════════════════════════════════════
   UI HELPERS
══════════════════════════════════════════ */

const getInput = () => document.getElementById('inputText').value;

const showToast = (msg) => {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), 2000);
};

const switchTab = (name) => {
  document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
  document.querySelectorAll('.output-pane').forEach(p => p.classList.remove('active'));
  const tabMap = { title: 0, vowels: 1, secret: 2 };
  document.querySelectorAll('.tab')[tabMap[name]].classList.add('active');
  document.getElementById(`pane-${name}`).classList.add('active');
};

const copyOutput = (id, plainText = false) => {
  const el = document.getElementById(id);
  const text = plainText ? el.innerText : el.textContent;
  navigator.clipboard.writeText(text).then(() => showToast('Copied to clipboard!'));
};

const pasteToInput = (id) => {
  const el = document.getElementById(id);
  const text = el.textContent;
  if (!text || el.classList.contains('empty')) return;
  document.getElementById('inputText').value = text;
  document.getElementById('charCount').textContent = `${text.length} chars`;
  updateStats(text);
  showToast('Pasted as new input!');
};

/* ══════════════════════════════════════════
   BUTTON ACTIONS
══════════════════════════════════════════ */

const runTitleCase = () => {
  const text = getInput();
  if (!text.trim()) { showToast('No input text!'); return; }

  const result = toTitleCase(text);
  const el = document.getElementById('out-title');
  el.textContent = result;
  el.classList.remove('empty');
  switchTab('title');
};

const runVowels = () => {
  const text = getInput();
  if (!text.trim()) { showToast('No input text!'); return; }

  const count = countVowels(text);
  const el = document.getElementById('out-vowels');

  // Build highlighted HTML — vowels in red, consonants in default
  const highlighted = text.split('').map(ch =>
    /[aeiouAEIOU]/.test(ch)
      ? `<span class="v">${ch}</span>`
      : `<span class="c">${ch}</span>`
  ).join('');

  el.innerHTML = highlighted;
  el.classList.remove('empty');

  // Sync vowel stat card
  document.getElementById('statVowels').textContent = count;
  showToast(`${count} vowel${count !== 1 ? 's' : ''} found`);
  switchTab('vowels');
};

const runSecret = () => {
  const text = getInput();
  if (!text.trim()) { showToast('No input text!'); return; }

  const rawWords = document.getElementById('secretWords').value;
  const words = rawWords.split(',').map(w => w.trim()).filter(Boolean);

  if (!words.length) { showToast('Enter words to censor!'); return; }

  const result = secretMessage(text, words);

  // Render censored *** in red spans
  const el = document.getElementById('out-secret');
  el.innerHTML = result.replace(/\*\*\*/g, '<span class="censored">***</span>');
  el.classList.remove('empty');

  const censored = (result.match(/\*\*\*/g) || []).length;
  showToast(`${censored} word${censored !== 1 ? 's' : ''} censored`);
  switchTab('secret');
};

const runAll = () => {
  const text = getInput();
  if (!text.trim()) { showToast('No input text!'); return; }
  runTitleCase();
  runVowels();
  runSecret();
  showToast('All functions applied!');
};

const clearAll = () => {
  document.getElementById('inputText').value = '';
  document.getElementById('charCount').textContent = '0 chars';
  updateStats('');

  ['out-title', 'out-vowels', 'out-secret'].forEach(id => {
    document.getElementById(id).classList.add('empty');
  });

  document.getElementById('out-title').textContent = 'Run ⬡ Title Case to see output…';
  document.getElementById('out-vowels').innerHTML  = 'Run ◈ Count Vowels to see output…';
  document.getElementById('out-secret').innerHTML  = 'Run ▣ Secret Mode to see output…';
};

/* ══════════════════════════════════════════
   EVENT LISTENERS + INIT
══════════════════════════════════════════ */

document.getElementById('inputText').addEventListener('input', () => {
  const val = getInput();
  document.getElementById('charCount').textContent = `${val.length} chars`;
  updateStats(val);
});

// Initialise stat cards to 0
updateStats('');