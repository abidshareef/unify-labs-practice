const TOTAL = 6;
const done  = new Set();

const updateProgress = () => {
  const n = done.size;
  document.getElementById('progressFill').style.width = `${(n / TOTAL) * 100}%`;
  document.getElementById('progressLabel').textContent = `${n} / ${TOTAL} complete`;
  const c = document.getElementById('completion');
  n === TOTAL ? c.classList.add('show') : c.classList.remove('show');
};

const toggleStep = (n) => {
  const card = document.querySelector(`.step[data-step="${n}"]`);
  if (!card) return;
  done.has(n) ? done.delete(n) : done.add(n);
  card.classList.toggle('done', done.has(n));
  toast(done.has(n) ? `Step 0${n} complete ✓` : `Step 0${n} unmarked`);
  updateProgress();
};

const cp = (id) => {
  const el  = document.getElementById(id);
  const btn = el.querySelector('button');
  navigator.clipboard.writeText(el.querySelector('code').innerText).then(() => {
    btn.textContent = 'copied!';
    btn.classList.add('copied');
    toast('Copied!');
    setTimeout(() => { btn.textContent = 'copy'; btn.classList.remove('copied'); }, 2000);
  });
};

let _t;
const toast = (msg) => {
  const el = document.getElementById('toast');
  el.textContent = msg;
  el.classList.add('show');
  clearTimeout(_t);
  _t = setTimeout(() => el.classList.remove('show'), 2000);
};

const tick = () => {
  const p = n => String(n).padStart(2, '0');
  const d = new Date();
  document.getElementById('clock').textContent = `${p(d.getHours())}:${p(d.getMinutes())}:${p(d.getSeconds())}`;
};

tick(); setInterval(tick, 1000); updateProgress();