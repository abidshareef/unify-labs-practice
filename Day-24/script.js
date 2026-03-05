const TOTAL = 4;
const done  = new Set();

/* ── PROGRESS ── */
const updateProgress = () => {
  const n = done.size;
  document.getElementById('progressFill').style.width = `${(n / TOTAL) * 100}%`;
  document.getElementById('progressLabel').textContent = `${n} / ${TOTAL} complete`;
  const comp = document.getElementById('completion');
  n === TOTAL ? comp.classList.add('show') : comp.classList.remove('show');
};

/* ── STEP TOGGLE ── */
const toggleStep = (n) => {
  const card = document.querySelector(`.step[data-step="${n}"]`);
  if (!card) return;
  done.has(n) ? done.delete(n) : done.add(n);
  card.classList.toggle('done', done.has(n));
  toast(done.has(n) ? `Step 0${n} complete ✓` : `Step 0${n} unmarked`);
  updateProgress();
};

/* ── COPY CODE ── */
const cp = (id) => {
  const el  = document.getElementById(id);
  const btn = el.querySelector('button');
  const txt = el.querySelector('code').innerText;
  navigator.clipboard.writeText(txt).then(() => {
    btn.textContent = 'copied!';
    btn.classList.add('copied');
    toast('Copied!');
    setTimeout(() => { btn.textContent = 'copy'; btn.classList.remove('copied'); }, 2000);
  });
};

/* ── TOAST ── */
let _t;
const toast = (msg) => {
  const el = document.getElementById('toast');
  el.textContent = msg;
  el.classList.add('show');
  clearTimeout(_t);
  _t = setTimeout(() => el.classList.remove('show'), 2000);
};

/* ── CLOCK ── */
const tick = () => {
  const p = n => String(n).padStart(2,'0');
  const d = new Date();
  document.getElementById('clock').textContent = `${p(d.getHours())}:${p(d.getMinutes())}:${p(d.getSeconds())}`;
};
tick();
setInterval(tick, 1000);
updateProgress();