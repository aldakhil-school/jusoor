// موقع مبادرة جسور – ثانوية عبدالرحمن الداخل
(() => {
const C = window.JUSOOR_CONFIG, $ = s => document.querySelector(s), $$ = s => [...document.querySelectorAll(s)];
const AR = n => String(n).replace(/\d/g, d => '٠١٢٣٤٥٦٧٨٩'[d]);
const store = {
  get(k, d) { try { return JSON.parse(localStorage.getItem('jusoor_' + k)) ?? d; } catch { return d; } },
  set(k, v) { try { localStorage.setItem('jusoor_' + k, JSON.stringify(v)); } catch {} }
};
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]); // نص من الخادم يُعرض نصاً فقط
const shuffle = a => a.map(v => [Math.random(), v]).sort((x, y) => x[0] - y[0]).map(x => x[1]);

/* ── الأيقونات ── */
const IC = {
  handshake:'<path d="m11 17 2 2a1 1 0 1 0 3-3"/><path d="m14 14 2.5 2.5a1 1 0 1 0 3-3l-3.88-3.88a3 3 0 0 0-4.24 0l-.88.88a1 1 0 1 1-3-3l2.81-2.81a5.79 5.79 0 0 1 7.06-.87l.47.28a2 2 0 0 0 1.42.25L21 4"/><path d="m21 3 1 11h-2"/><path d="M3 3 2 14l6.5 6.5a1 1 0 1 0 3-3"/><path d="M3 4h8"/>',
  cap:'<path d="M22 10 12 5 2 10l10 5 10-5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/>',
  share:'<circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><path d="m8.59 13.51 6.83 3.98"/><path d="m15.41 6.51-6.82 3.98"/>',
  play:'<polygon points="7 4 20 12 7 20 7 4"/>',
  chart:'<path d="M3 3v18h18"/><path d="M8 17v-5"/><path d="M13 17V8"/><path d="M18 17v-9"/>',
  users:'<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>',
  video:'<path d="m16 13 5.22 3.48a.5.5 0 0 0 .78-.42V7.94a.5.5 0 0 0-.76-.43L16 10.5"/><rect x="2" y="6" width="14" height="12" rx="2"/>',
  camera:'<path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3z"/><circle cx="12" cy="13" r="3"/>',
  pulse:'<path d="M22 12h-4l-3 9L9 3l-3 9H2"/>',
  briefcase:'<rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/>',
  home:'<path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><path d="M9 22V12h6v10"/>',
  board:'<path d="M2 3h20"/><path d="M21 3v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V3"/><path d="m7 21 5-5 5 5"/>',
  lock:'<rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>',
  route:'<circle cx="6" cy="19" r="3"/><path d="M9 19h8.5a3.5 3.5 0 0 0 0-7h-11a3.5 3.5 0 0 1 0-7H15"/><circle cx="18" cy="5" r="3"/>',
  check:'<path d="M20 6 9 17l-5-5"/>',
  download:'<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><path d="m7 10 5 5 5-5"/><path d="M12 15V3"/>'
};
$$('[data-ic]').forEach(e => e.innerHTML = `<svg viewBox="0 0 24 24" aria-hidden="true">${IC[e.dataset.ic] || ''}</svg>`);

/* ── عناصر النماذج ── */
let uid = 0;
function buildOpts(root = document) {
  root.querySelectorAll('.opts[data-opts]').forEach(box => {
    if (box.dataset.built) return; box.dataset.built = 1;
    const multi = box.dataset.multi === '1', name = box.dataset.name;
    box.innerHTML = box.dataset.opts.split('|').map(o =>
      `<label class="opt"><input type="${multi ? 'checkbox' : 'radio'}" name="${name}" value="${o}" id="o${++uid}"><span>${o}</span></label>`).join('');
  });
}
const secList = g => (C.sections[g] || []).map(x => Array.isArray(x) ? x : [x, AR(x)]);
const secName = (g, s) => { const f = secList(g).find(x => x[0] == s); return f && isNaN(+f[1].replace(/[٠-٩]/g, '1')) && !/^[٠-٩]+$/.test(f[1]) ? f[1] : 'شعبة ' + AR(+s || 0); };
function fillSections(root) { // قائمة الشعب تتغير حسب الصف المختار
  const g = root.querySelector('[name=grade]'), s = root.querySelector('[name=section]'); if (!g || !s) return;
  const keep = s.value, list = secList(g.value);
  s.innerHTML = `<option value="">${g.value ? 'اختر' : 'اختر الصف أولاً'}</option>` + list.map(([v, l]) => `<option value="${v}">${l}</option>`).join('');
  s.disabled = !g.value; if (list.some(x => String(x[0]) === keep)) s.value = keep;
}
document.addEventListener('change', e => { if (e.target.name === 'grade' && e.target.closest('.student')) fillSections(e.target.closest('.student')); });
function studentBlock(prefix) {
  const g = C.grades.map(x => `<option>${x}</option>`).join(''), s = '';
  return `<div class="q" data-req="student"><label for="${prefix}-name">اسم الطالب</label><input class="inp" id="${prefix}-name" name="student" autocomplete="off" placeholder="الاسم الثلاثي"></div>
  <div class="q row2"><div data-req="grade"><label class="ql" for="${prefix}-grade">الصف</label><select class="inp" id="${prefix}-grade" name="grade"><option value="">اختر</option>${g}</select></div>
  <div data-req="section"><label class="ql" for="${prefix}-sec">الشعبة</label><select class="inp" id="${prefix}-sec" name="section"><option value="">اختر</option>${s}</select></div></div>`;
}
$$('.student').forEach((el, i) => { el.innerHTML = studentBlock('s' + i); fillSections(el); });
buildOpts();

function collect(form) {
  const o = {};
  new FormData(form).forEach((v, k) => { v = String(v).trim(); if (v) o[k] = o[k] ? o[k] + '، ' + v : v; });
  return o;
}
function restore(form, data) {
  Object.entries(data || {}).forEach(([k, v]) => form.querySelectorAll(`[name="${k}"]`).forEach(el => {
    if (el.type === 'radio' || el.type === 'checkbox') el.checked = String(v).split('، ').includes(el.value); else el.value = v;
    if (k === 'grade') { const st = el.closest('.student'); if (st) fillSections(st); }
  }));
}
function filled(root, k) {
  const els = [...root.querySelectorAll(`[name="${k}"]`)];
  if (!els.length) return false;
  return els[0].type === 'radio' || els[0].type === 'checkbox' ? els.some(x => x.checked) : !!String(els[0].value).trim();
}
function validate(root, errEl) {
  let bad = 0;
  root.querySelectorAll('[data-req]').forEach(q => { const ok = filled(root, q.dataset.req); q.classList.toggle('miss', !ok); if (!ok) bad++; });
  const cnt = bad === 1 ? 'إجابة واحدة مظللة' : bad === 2 ? 'إجابتان مظللتان' : bad <= 10 ? `${AR(bad)} إجابات مظللة` : `${AR(bad)} إجابة مظللة`;
  errEl.textContent = bad ? `بقيت ${cnt}، أكملها للمتابعة.` : '';
  if (bad) root.querySelector('.miss')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  return !bad;
}

/* ── الإرسال والإحصاءات ── */
async function send(formName, data) {
  const row = { form: formName, at: new Date().toISOString(), ...data };
  if (!C.api) { const d = store.get('demo', []); d.push(row); store.set('demo', d); return true; }
  await fetch(C.api, { method: 'POST', mode: 'no-cors', headers: { 'Content-Type': 'text/plain;charset=utf-8' }, body: JSON.stringify(row) });
  return true;
}
async function stats() {
  if (!C.api) {
    const d = store.get('demo', []);
    return { demo: true, families: C.families, participants: 268 + d.filter(r => r.form === 'needs').length, ittala: 231, climate: 412, satisfaction: 84, needs: 174,
      classes: [['الثالث الثانوي', 2, 71], ['الثاني الثانوي', 4, 64], ['الأول الثانوي', 1, 58], ['الثالث الثانوي', 5, 52], ['الثاني الثانوي', 1, 47]] };
  }
  const r = await fetch(C.api + '?action=stats'); return r.json();
}

/* ── الجسر الحي ── */
function drawBridge(rate) {
  const svg = $('#bridge'), N = 36, x0 = 30, x1 = 570, deckY = 160, span = (x1 - x0) / 3, w = (x1 - x0) / N, peak = 40;
  const filledN = Math.round(rate * N), cols = ['#3ecf8e', '#6ec6e6', '#e9b872'];
  let h = '';
  for (let k = 0; k < 3; k++) {
    const a = x0 + k * span, b = a + span;
    h += `<path d="M${a} ${deckY}Q${a + span / 2} ${peak} ${b} ${deckY}" fill="none" stroke="${cols[2 - k]}" stroke-opacity=".55" stroke-width="5" stroke-linecap="round"/>`;
  }
  for (let i = 0; i < N; i++) {
    const x = x1 - (i + 1) * w, seg = Math.min(2, Math.floor(i / (N / 3))), on = i < filledN;
    const cx = x + w / 2, t = ((cx - x0) % span) / span, top = deckY - 2 * t * (1 - t) * (deckY - peak);
    h += `<line x1="${cx}" y1="${deckY - 4}" x2="${cx}" y2="${top + 3}" stroke="rgba(255,255,255,.16)" stroke-width="1.2"/>`;
    h += `<rect x="${x + 1.2}" y="${deckY - 4}" width="${w - 2.4}" height="20" rx="3" fill="${on ? cols[seg] : 'rgba(255,255,255,.04)'}" stroke="${on ? 'none' : 'rgba(255,255,255,.25)'}" stroke-dasharray="${on ? '' : '3 3'}" style="opacity:0;transition:opacity .4s ${i * 30}ms"/>`;
  }
  [x0, x0 + span, x0 + 2 * span, x1].forEach(x => h += `<rect x="${x - 7}" y="${deckY + 16}" width="14" height="44" rx="3" fill="rgba(255,255,255,.5)"/>`);
  h += `<line x1="10" y1="${deckY + 60}" x2="590" y2="${deckY + 60}" stroke="rgba(110,198,230,.25)" stroke-width="2" stroke-dasharray="6 8"/>`;
  svg.innerHTML = h;
  requestAnimationFrame(() => svg.querySelectorAll('rect[style]').forEach(r => r.style.opacity = 1));
}
let homeDrawn = false;
async function loadHome() {
  const inProg = J.started || J.st > 0 || Object.keys(J.quiz).length;
  const [lbl, href] = done && !inProg ? ['بطاقة شريك جسور', '#card'] : inProg ? ['أكمل رحلتك في جسور', '#rihla'] : ['ابدأ رحلتك في جسور', '#rihla'];
  $('#heroGo').textContent = lbl; $('#heroGo').href = href; $('#homeGo').textContent = inProg ? 'أكمل الرحلة' : done ? 'رحلة لابن آخر' : 'ابدأ الرحلة';
  if (!homeDrawn) { drawBridge(0); homeDrawn = true; }
  let s; try { s = await stats(); } catch { s = null; }
  if (!s) return;
  $('#demoNote').hidden = !s.demo;
  const fam = s.families || C.families, rate = Math.min(1, (s.participants || 0) / fam);
  drawBridge(rate);
  $('#bridgePct').textContent = AR(Math.round(rate * 100)) + '٪';
  const set = (id, v, t) => { $('#' + id).style.width = Math.min(100, v * 100) + '%'; $('#' + id + 't').textContent = t; };
  const sat = s.satisfaction ?? null; // المؤشر ١-٣-١-١: المستهدف ٩٠٪ رضا عام
  set('m1', sat != null && s.climate ? sat / 100 : (s.climate || 0) / fam, sat != null && s.climate ? `رضا عام ${AR(sat)}٪ من ${AR(s.climate)} رد` : AR(s.climate || 0) + ' رد على مقياس المناخ');
  set('m2', (s.ittala || 0) / fam, AR(s.ittala || 0) + ' أسرة اطّلعت');
  const rows = (s.classes || []).slice(0, 5);
  $('#boardEmpty').hidden = rows.length > 0;
  $('#board').innerHTML = rows.map((r, i) => `<tr><td class="rank">${AR(i + 1)}</td><td>${esc(r[0])} – ${esc(secName(r[0], r[1]))}</td><td style="width:40%"><div class="bar"><i style="width:${Math.max(0, Math.min(100, +r[2] || 0))}%"></i></div></td><td style="width:56px;text-align:left">${AR(Math.round(+r[2] || 0))}٪</td></tr>`).join('');
}

/* ── محرّك مقياس المناخ ── */
const ROLE = { parent: 'ولي أمر', student: 'طالب', teacher: 'معلم', admin: 'إداري' }, CUT = [0, 16, 36, 54, 68, 84];
const LIK = ['أوافق بشدة', 'أوافق', 'محايد', 'لا أوافق', 'لا أوافق بشدة'];
/* النسخة المختصرة: ثلاث عبارات من كل بُعد بأرقامها في المقياس الرسمي، وسؤال رضا عام */
const PICK = [[1, 4, 12], [17, 29, 32], [40, 44, 51], [55, 58, 61], [70, 76, 81]];
const OVERALL = { parent: 'بشكل عام، أنا راضٍ عن المناخ في مدرسة ابني', student: 'بشكل عام، أنا راضٍ عن المناخ في مدرستي',
  teacher: 'بشكل عام، أنا راضٍ عن المناخ وبيئة العمل في مدرستي', admin: 'بشكل عام، أنا راضٍ عن المناخ في مدرستنا' };
const C_TOTAL = PICK.flat().length + 1;
function climate(o) {
  const s = o.state;
  function infoStep() {
    const g = C.grades.map(x => `<option>${x}</option>`).join('');
    const sel = (n, l, opts) => `<div class="q" data-req="${n}"><label class="ql" for="ci-${n}">${l}</label><select class="inp" id="ci-${n}" name="${n}"><option value="">اختر</option>${opts}</select></div>`;
    const yrs = ['أقل من سنة', '١–٥ سنوات', '٦–١٠ سنوات', 'أكثر من ١٠ سنوات'].map(x => `<option>${x}</option>`).join('');
    return o.role === 'student' ? sel('grade', 'صفك', g) : sel('years', 'سنوات العمل في هذه المدرسة', yrs);
  }
  const item = (key, num, text, cls = '') => `<div class="q likert${cls}" data-req="${key}"><div class="st"><b>${AR(num)}</b><span>${text}</span></div><div class="scale">` +
    LIK.map((l, j) => `<label class="opt"><input type="radio" name="${key}" value="${5 - j}" ${s.ans[key] == 5 - j ? 'checked' : ''}><span>${l}</span></label>`).join('') + `</div></div>`;
  function render() {
    const items = window.CLIMATE[o.role];
    o.bar.innerHTML = ''; o.bar.hidden = true;
    o.lbl.textContent = `${ROLE[o.role]} · ${AR(C_TOTAL)} عبارة`;
    let h = `<h2>رأيك في المدرسة</h2><p class="muted" style="font-size:15px">اختر ما يعبّر عن رأيك في كل عبارة.</p>`, n = 0;
    if (o.withInfo) h += infoStep();
    PICK.forEach((grp, d) => {
      h += `<div class="dim-h">${window.CLIMATE_DIMS[d]}</div>`;
      grp.forEach(k => h += item('c' + k, ++n, items[k - 1]));
    });
    h += `<div class="dim-h">الرضا العام</div>` + item('overall', ++n, OVERALL[o.role], ' overall');
    o.panel.innerHTML = h;
    Object.entries(s.info).forEach(([k, v]) => { const el = o.panel.querySelector('#ci-' + k); if (el) el.value = v; });
  }
  o.panel.addEventListener('change', e => {
    if (/^c\d+$|^overall$/.test(e.target.name)) s.ans[e.target.name] = +e.target.value; else s.info[e.target.name] = e.target.value;
    const q = e.target.closest('.q'); q?.classList.remove('miss');
    if (q?.classList.contains('likert')) { // انتقل تلقائياً للعبارة التالية غير المجابة
      const next = [...o.panel.querySelectorAll('.likert')].find(x => x !== q && !x.querySelector('input:checked') && x.compareDocumentPosition(q) & Node.DOCUMENT_POSITION_PRECEDING);
      (next || o.nextBtn).scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
    o.onChange?.();
  });
  return {
    render,
    isFirst: () => true, isLast: () => true,
    next(errEl) { return validate(o.panel, errEl) ? 'done' : false; },
    prev() { return false; }
  };
}
const positive = ans => { const v = Object.values(ans); return v.length ? Math.round(v.filter(x => x >= 4).length / v.length * 100) : 0; };

/* ══════════ رحلتك في جسور ══════════ */
const J0 = () => ({ st: 0, max: 0, watched: 0, ended: false, quiz: {}, c: { step: 1, ans: {}, info: {} }, n: {}, started: false });
let J = Object.assign(J0(), store.get('journey', {}));
let done = store.get('jdone', null);
const saveJ = () => store.set('journey', J);
const ST = [
  { title: 'اطّلع على مبادرة جسور', lead: 'شاهد الفيديو التعريفي، وأجب عن الأسئلة التي تظهر داخله.' },
  { title: 'مقياس المناخ المدرسي', lead: 'رأيك في المدرسة من خلال ١٦ عبارة قصيرة تستغرق دقيقتين. لا توجد إجابات صحيحة أو خاطئة، والمطلوب رأيك الصادق، وتُعرض النتائج مجمّعة دون أسماء.' },
  { title: 'احتياجات الأسرة', lead: 'أخبرنا عن ابنك وما تحتاجه لدعمه، ثم أرسل رحلتك كاملة لتحصل على بطاقة شريك جسور.' }
];

/* المحطة ١: الأسئلة داخل الفيديو */
const VQ = [
  { t: 15.8, k: 'q1', q: 'مبادرة جسور جسرٌ بين المدرسة و...', opts: ['البيت والمجتمع', 'المعلمين فقط', 'الطلاب فقط'] },
  { t: 53.2, k: 'q2', q: 'ما الذي يصلك من جسور على جوالك؟', opts: ['فيديوهات قصيرة وتقرير عن مستوى ابنك', 'دعوات لزيارة المدرسة فقط', 'لا يصلني شيء'] },
  { t: 62.6, k: 'q3', q: 'كيف تُحتسب مشاركتك؟', opts: ['مشاهدة الفيديو والإجابة عن الأسئلة', 'زيارة المدرسة فقط', 'الاتصال بالمدرسة'] }
]; // الإجابة الصحيحة هي الخيار الأول دائماً، وتُعرض الخيارات بترتيب عشوائي
const vid = $('#vid'); let lastT = 0, asking = null, saveTick = 0;
const nextQ = () => VQ.find(q => !(q.k in J.quiz));
const answered = () => VQ.filter(q => q.k in J.quiz).length;
const vDur = () => vid.duration || 81.7;
const watchedOK = () => J.ended || J.watched / vDur() >= 0.85;
const st0OK = () => watchedOK() && answered() === VQ.length;

vid.addEventListener('timeupdate', () => {
  const d = vid.currentTime - lastT; if (d > 0 && d < 1.5) J.watched += d; lastT = vid.currentTime;
  const q = nextQ(); if (q && !asking && vid.currentTime >= q.t) ask(q);
  if (++saveTick % 8 === 0) saveJ();
  updateJ();
});
vid.addEventListener('seeking', () => {
  const q = nextQ();
  if (q && vid.currentTime > q.t + 0.3) { vid.currentTime = Math.max(0, q.t - 0.4); flash('أجب عن السؤال أولاً لتكمل الفيديو.'); }
  lastT = vid.currentTime;
});
vid.addEventListener('ended', () => { J.ended = true; J.started = true; saveJ(); updateJ(); });
vid.addEventListener('play', () => { if (!J.started) { J.started = true; saveJ(); } });
function flash(t) { const e = $('#jErr'); e.textContent = t; clearTimeout(flash.t); flash.t = setTimeout(() => { if (e.textContent === t) e.textContent = ''; }, 2600); }
function ask(q) {
  asking = q; vid.pause();
  try { if (document.fullscreenElement) document.exitFullscreen(); if (vid.webkitDisplayingFullscreen) vid.webkitExitFullscreen(); } catch {}
  vid.controls = false; $('#player').classList.add('asking'); $('#vq').hidden = false;
  $('#vqN').textContent = `سؤال ${AR(VQ.indexOf(q) + 1)} من ${AR(VQ.length)}`; $('#vqQ').textContent = q.q; $('#vqF').textContent = '';
  $('#vqO').innerHTML = shuffle(q.opts.map((o, i) => [o, i])).map(([o, i]) => `<button type="button" data-i="${i}">${o}</button>`).join('');
  $('#vqO button').focus({ preventScroll: true });
  $('#player').scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}
$('#vqO').addEventListener('click', e => {
  const b = e.target.closest('button'); if (!b || !asking) return;
  const q = asking, i = +b.dataset.i, ok = i === 0;
  J.quiz[q.k] = q.opts[i]; saveJ();
  $$('#vqO button').forEach(x => { x.disabled = true; if (+x.dataset.i === 0) x.classList.add('ok'); });
  if (!ok) b.classList.add('no');
  $('#vqF').textContent = ok ? 'إجابة صحيحة، أحسنت.' : `الإجابة الصحيحة: ${q.opts[0]}`;
  $('#vqF').className = 'vq-fb ' + (ok ? 'ok' : 'no');
  updateJ();
  setTimeout(() => {
    $('#vq').hidden = true; $('#player').classList.remove('asking'); vid.controls = true; asking = null;
    if (vid.currentTime < vDur() - 0.5) vid.play().catch(() => {});
  }, ok ? 1200 : 2300);
});

/* المحطة ٢: مقياس المناخ لولي الأمر */
const cj = climate({ bar: $('#cBar'), lbl: $('#cLbl'), panel: $('#cPanel'), nextBtn: $('#jNext'), role: 'parent', state: J.c, withInfo: false, onChange: () => { saveJ(); drawJourney(); } });

/* المحطة ٣: الاحتياجات */
const fN = $('#st2');
restore(fN, J.n); $('#mInfo').hidden = J.n.mustaqbal !== 'لا أعرفه';
const saveN = () => { J.n = collect(fN); saveJ(); drawJourney(); };
fN.addEventListener('change', e => {
  if (e.target.name === 'mustaqbal') $('#mInfo').hidden = e.target.value !== 'لا أعرفه';
  e.target.closest('.q, [data-req]')?.classList.remove('miss'); saveN();
});
fN.addEventListener('input', () => { clearTimeout(saveN.t); saveN.t = setTimeout(saveN, 400); });
fN.addEventListener('submit', e => e.preventDefault());

/* جسر التقدّم */
function progress() {
  const p0 = st0OK() ? 1 : Math.min(1, J.watched / vDur()) * 0.7 + answered() / VQ.length * 0.3;
  const p1 = Object.keys(J.c.ans).filter(k => k === 'overall' || PICK.flat().includes(+k.slice(1))).length / C_TOTAL;
  const req = [...fN.querySelectorAll('[data-req]')], p2 = req.filter(q => filled(fN, q.dataset.req)).length / req.length;
  return [Math.min(1, p0), Math.min(1, p1), Math.min(1, p2)];
}
function drawJourney() {
  const P = progress(), cols = ['#3ecf8e', '#6ec6e6', '#e9b872'], deck = 84, peak = 14, N = 12, span = 180, x1 = 570;
  let h = '';
  for (let k = 0; k < 3; k++) {
    const b = x1 - k * span, a = b - span, w = span / N, on = Math.round(P[k] * N), full = P[k] >= 1, cur = J.st === k;
    h += `<path d="M${a + 4} ${deck}Q${a + span / 2} ${peak - 18} ${b - 4} ${deck}" fill="none" stroke="${cols[k]}" stroke-opacity="${full ? 1 : cur ? .7 : .3}" stroke-width="${cur ? 5 : 4}" stroke-linecap="round"/>`;
    for (let i = 0; i < N; i++) {
      const x = b - (i + 1) * w, cx = x + w / 2, t = (cx - a) / span, top = deck - 2 * t * (1 - t) * (deck - peak + 18) * 0.98, f = i < on;
      h += `<line x1="${cx}" y1="${deck - 3}" x2="${cx}" y2="${top + 4}" stroke="rgba(255,255,255,${f ? .3 : .12})" stroke-width="1"/>`;
      h += `<rect x="${x + 1}" y="${deck - 3}" width="${w - 2}" height="15" rx="2.5" fill="${f ? cols[k] : 'rgba(255,255,255,.04)'}" stroke="${f ? 'none' : 'rgba(255,255,255,.22)'}" stroke-dasharray="${f ? '' : '3 3'}"/>`;
    }
  }
  [30, 210, 390, 570].forEach(x => h += `<rect x="${x - 5}" y="${deck + 14}" width="10" height="20" rx="2" fill="rgba(255,255,255,.45)"/>`);
  $('#jSvg').innerHTML = h;
  $$('.jlabels li').forEach(li => { const k = +li.dataset.st; li.classList.toggle('on', J.st === k); li.classList.toggle('ok', P[k] >= 1 && (k !== 1 || J.max > 1)); li.classList.toggle('go', k <= J.max); });
}
function updateJ() {
  const w = Math.min(100, Math.round(J.watched / vDur() * 100));
  $('#chipWatch').classList.toggle('ok', watchedOK());
  $('#chipWatch span:last-child').textContent = watchedOK() ? 'شاهدت الفيديو' : w ? `شاهدت ${AR(w)}٪ من الفيديو` : 'شاهد الفيديو';
  $('#chipQ').classList.toggle('ok', answered() === VQ.length);
  $('#chipQ span:last-child').textContent = `الأسئلة ${AR(answered())} من ${AR(VQ.length)}`;
  if (J.st === 0) $('#jNext').classList.toggle('wait', !st0OK());
  drawJourney();
}
function renderJ() {
  const showDone = done && !J.started && J.st === 0 && !Object.keys(J.quiz).length;
  $('#jDone').hidden = !showDone; $('#jNavWrap').hidden = showDone;
  $('#jTitle').textContent = showDone ? 'رحلتك في جسور' : ST[J.st].title; $('#jLead').textContent = showDone ? '' : ST[J.st].lead;
  [0, 1, 2].forEach(k => $('#st' + k).hidden = showDone || J.st !== k);
  if (J.st !== 0 && !vid.paused) vid.pause();
  if (J.st === 1) cj.render();
  $('#jPrev').hidden = J.st === 0;
  $('#jNext').classList.remove('wait');
  $('#jNext').textContent = J.st === 0 ? 'التالي: مقياس المناخ' : J.st === 1 ? (cj.isLast() ? 'التالي: احتياجات الأسرة' : 'التالي') : 'إرسال وإكمال الرحلة';
  $('#jErr').textContent = '';
  updateJ();
}
function go(k) { J.st = k; J.max = Math.max(J.max, k); J.started = true; saveJ(); renderJ(); $('.jbridge').scrollIntoView({ behavior: 'smooth', block: 'start' }); }
$$('.jlabels li').forEach(li => li.addEventListener('click', () => { const k = +li.dataset.st; if (k <= J.max && k !== J.st) go(k); }));
$('#jPrev').addEventListener('click', () => {
  if (J.st === 1 && cj.prev()) { renderJ(); $('.jbridge').scrollIntoView({ behavior: 'smooth' }); return; }
  go(J.st - 1);
});
$('#jNext').addEventListener('click', async () => {
  const err = $('#jErr');
  if (J.st === 0) {
    if (!st0OK()) { err.textContent = !watchedOK() ? 'أكمل مشاهدة الفيديو والإجابة عن أسئلته أولاً.' : 'أجب عن أسئلة الفيديو أولاً.'; return; }
    return go(1);
  }
  if (J.st === 1) {
    const r = cj.next(err); if (!r) return;
    saveJ(); if (r === 'moved') { renderJ(); $('.jbridge').scrollIntoView({ behavior: 'smooth' }); return; }
    return go(2);
  }
  if (!validate(fN, err)) return;
  const btn = $('#jNext'); btn.disabled = true; btn.textContent = 'جارٍ الإرسال…';
  const n = collect(fN), stu = { student: n.student, grade: n.grade, section: n.section };
  const score = VQ.filter(q => J.quiz[q.k] === q.opts[0]).length;
  const it = { ...stu, relation: n.relation, expert: n.expert || '', q1: J.quiz.q1, q2: J.quiz.q2, q3: J.quiz.q3, score, passed: score >= 2 ? 'نعم' : 'لا', watched: Math.round(J.watched) };
  const nd = { ...n }; ['relation', 'expert'].forEach(k => delete nd[k]);
  try {
    await Promise.all([send('ittala', it), send('climate', { role: ROLE.parent, grade: n.grade, positive: positive(J.c.ans), ...J.c.ans }), send('needs', nd)]);
  } catch {
    btn.disabled = false; btn.textContent = 'إرسال وإكمال الرحلة'; err.textContent = 'تعذّر الإرسال. تحقّق من الاتصال بالإنترنت ثم حاول مرة أخرى، وإجاباتك محفوظة.'; return;
  }
  done = { grade: n.grade, student: n.student, at: Date.now() }; store.set('jdone', done);
  const c = J.c; J = J0(); Object.assign(c, { step: 1, ans: {}, info: {} }); J.c = c; saveJ(); // نفس كائن المقياس المرتبط بالمحرّك
  fN.reset(); $('#mInfo').hidden = true; btn.disabled = false;
  location.hash = 'card';
});
$('#jAgain').addEventListener('click', () => { J = J0(); J.started = true; saveJ(); location.reload(); });

/* ══════════ بطاقة شريك جسور ══════════ */
const loadImg = src => new Promise((ok, no) => { const i = new Image(); i.onload = () => ok(i); i.onerror = no; i.src = src; });
let cardBlob = null;
async function makeCard(showName) {
  await Promise.all(['700 120px "Readex Pro"', '600 44px "Readex Pro"', '500 34px "IBM Plex Sans Arabic"', '400 28px "IBM Plex Sans Arabic"'].map(f => document.fonts.load(f).catch(() => {})));
  const W = 1080, H = 1350, cv = document.createElement('canvas'); cv.width = W; cv.height = H;
  const x = cv.getContext('2d'); x.direction = 'rtl';
  let g = x.createLinearGradient(0, 0, 0, H); g.addColorStop(0, '#0e3a4f'); g.addColorStop(1, '#061a24'); x.fillStyle = g; x.fillRect(0, 0, W, H);
  g = x.createRadialGradient(900, 120, 0, 900, 120, 700); g.addColorStop(0, 'rgba(60,140,200,.28)'); g.addColorStop(1, 'rgba(60,140,200,0)'); x.fillStyle = g; x.fillRect(0, 0, W, H);
  g = x.createRadialGradient(100, 1300, 0, 100, 1300, 700); g.addColorStop(0, 'rgba(18,168,122,.22)'); g.addColorStop(1, 'rgba(18,168,122,0)'); x.fillStyle = g; x.fillRect(0, 0, W, H);
  x.fillStyle = 'rgba(255,255,255,.06)'; for (let i = 20; i < W; i += 34) for (let j = 20; j < H; j += 34) { x.beginPath(); x.arc(i, j, 1.4, 0, 7); x.fill(); }
  // إطار
  x.strokeStyle = 'rgba(255,255,255,.14)'; x.lineWidth = 2; x.beginPath(); x.roundRect(36, 36, W - 72, H - 72, 40); x.stroke();
  g = x.createLinearGradient(0, 0, W, 0); g.addColorStop(0, '#e9b872'); g.addColorStop(.45, '#6ec6e6'); g.addColorStop(1, '#3ecf8e');
  x.fillStyle = g; x.beginPath(); x.roundRect(120, 34, W - 240, 6, 3); x.fill();
  // الهوية
  try { const logo = await loadImg('assets/moe-logo-white.png'); const lh = 104, lw = lh * logo.width / logo.height; x.drawImage(logo, W - 96 - lw, 92, lw, lh);
    x.fillStyle = 'rgba(255,255,255,.35)'; x.fillRect(W - 96 - lw - 34, 92, 2, lh);
    x.textAlign = 'right'; x.fillStyle = '#fff'; x.font = '600 44px "Readex Pro"'; x.fillText(C.school, W - 96 - lw - 64, 140);
    x.fillStyle = '#9dbccb'; x.font = '400 28px "IBM Plex Sans Arabic"'; x.fillText('الإدارة العامة للتعليم بمحافظة جدة', W - 96 - lw - 64, 184); } catch {}
  // الجسر
  const deck = 560, x0 = 150, x1 = 930, span = (x1 - x0) / 3, N = 36, w = (x1 - x0) / N, cols = ['#3ecf8e', '#6ec6e6', '#e9b872'];
  for (let k = 0; k < 3; k++) { const a = x0 + k * span; x.strokeStyle = cols[2 - k]; x.lineWidth = 9; x.lineCap = 'round'; x.beginPath(); x.moveTo(a, deck); x.quadraticCurveTo(a + span / 2, deck - 300, a + span, deck); x.stroke(); }
  for (let i = 0; i < N; i++) {
    const px = x1 - (i + 1) * w, cx = px + w / 2, t = ((cx - x0) % span) / span, top = deck - 2 * t * (1 - t) * 300;
    x.strokeStyle = 'rgba(255,255,255,.3)'; x.lineWidth = 2; x.beginPath(); x.moveTo(cx, deck - 6); x.lineTo(cx, top + 6); x.stroke();
    x.fillStyle = cols[Math.min(2, Math.floor(i / 12))]; x.beginPath(); x.roundRect(px + 2, deck - 6, w - 4, 30, 5); x.fill();
  }
  x.fillStyle = 'rgba(255,255,255,.55)'; [x0, x0 + span, x0 + 2 * span, x1].forEach(px => { x.beginPath(); x.roundRect(px - 10, deck + 30, 20, 70, 5); x.fill(); });
  x.strokeStyle = 'rgba(110,198,230,.3)'; x.setLineDash([10, 14]); x.lineWidth = 3; x.beginPath(); x.moveTo(90, deck + 104); x.lineTo(W - 90, deck + 104); x.stroke(); x.setLineDash([]);
  // النص
  x.textAlign = 'center';
  g = x.createLinearGradient(260, 0, 820, 0); g.addColorStop(0, '#6ec6e6'); g.addColorStop(1, '#3ecf8e');
  x.fillStyle = g; x.font = '700 124px "Readex Pro"'; x.fillText('شريك جسور', W / 2, 840);
  x.fillStyle = '#fff'; x.font = '500 40px "IBM Plex Sans Arabic"';
  const gr = done?.grade ? 'الصف ' + done.grade : '';
  if (showName && done?.student) { x.fillText('ولي أمر الطالب: ' + done.student, W / 2, 930); x.fillStyle = '#cfe3ec'; x.font = '400 34px "IBM Plex Sans Arabic"'; x.fillText(gr, W / 2, 984); }
  else x.fillText('ولي أمر طالب في ' + (gr || 'المدرسة'), W / 2, 950);
  x.fillStyle = '#cfe3ec'; x.font = '400 32px "IBM Plex Sans Arabic"'; x.fillText('أكمل رحلته في مبادرة جسور ١٤٤٨هـ', W / 2, 1050);
  // الشارات
  const badges = ['اطّلع', 'مقياس المناخ', 'الاحتياجات'], bc = ['rgba(62,207,142,', 'rgba(110,198,230,', 'rgba(233,184,114,'];
  x.font = '500 28px "IBM Plex Sans Arabic"';
  const bw = badges.map(b => x.measureText('✓ ' + b).width + 56), tot = bw.reduce((a, b) => a + b, 0) + 24 * 2;
  let bx = W / 2 + tot / 2;
  badges.forEach((b, i) => { const ww = bw[i]; bx -= ww; x.fillStyle = bc[i] + '.16)'; x.strokeStyle = bc[i] + '.6)'; x.lineWidth = 2; x.beginPath(); x.roundRect(bx, 1100, ww, 58, 29); x.fill(); x.stroke(); x.fillStyle = '#fff'; x.fillText('✓ ' + b, bx + ww / 2, 1139); bx -= 24; });
  // التاريخ والختام
  let date = ''; try { date = new Intl.DateTimeFormat('ar-SA-u-ca-islamic-umalqura-nu-arab', { day: 'numeric', month: 'long', year: 'numeric' }).format(done?.at || Date.now()); } catch {}
  x.fillStyle = '#3ecf8e'; x.font = '600 34px "Readex Pro"'; x.fillText('نبني علاقات.. نصنع مستقبلاً', W / 2, 1232);
  x.fillStyle = '#9dbccb'; x.font = '400 24px "IBM Plex Sans Arabic"'; x.fillText(date, W / 2, 1276);
  return new Promise(r => cv.toBlob(r, 'image/png'));
}
async function renderCard() {
  const show = $('#pcName').checked;
  cardBlob = await makeCard(show);
  const img = $('#pcImg'); if (img.dataset.url) URL.revokeObjectURL(img.dataset.url);
  img.src = img.dataset.url = URL.createObjectURL(cardBlob);
}
$('#pcName').addEventListener('change', renderCard);
const siteUrl = () => location.origin + location.pathname;
$('#pcSave').addEventListener('click', () => {
  if (!cardBlob) return; const a = document.createElement('a'); a.href = URL.createObjectURL(cardBlob); a.download = 'بطاقة-شريك-جسور.png'; a.click();
});
$('#pcShare').addEventListener('click', async () => {
  if (!cardBlob) return;
  const text = `أكملت رحلتي في مبادرة جسور مع ${C.school}. شاركنا وابدأ رحلتك: ${siteUrl()}`;
  const file = new File([cardBlob], 'شريك-جسور.png', { type: 'image/png' });
  try { if (navigator.canShare?.({ files: [file] })) { await navigator.share({ files: [file], text }); return; } } catch (e) { if (e.name === 'AbortError') return; }
  window.open('https://wa.me/?text=' + encodeURIComponent(text), '_blank', 'noopener');
});

/* ══════════ مقياس المناخ: الطلاب والمعلمون والإداريون ══════════ */
let kRole = null, kState = null, ck = null;
$$('.role[data-role]').forEach(b => b.addEventListener('click', () => {
  kRole = b.dataset.role; kState = { step: 0, ans: {}, info: {} };
  ck = climate({ bar: $('#kBar'), lbl: $('#kLbl'), panel: $('#kPanel'), nextBtn: $('#kNext'), role: kRole, state: kState, withInfo: true });
  $('#climateRoles').hidden = true; $('#kDone').hidden = true; $('#f-climate').hidden = false; ck.render(); kNav();
  $('#f-climate').scrollIntoView({ behavior: 'smooth' });
}));
function kNav() { $('#kNext').textContent = ck.isLast() ? 'إرسال' : 'التالي'; $('#kErr').textContent = ''; }
$('#kPrev').addEventListener('click', () => {
  if (ck.prev()) { kNav(); $('#f-climate').scrollIntoView({ behavior: 'smooth' }); return; }
  $('#f-climate').hidden = true; $('#climateRoles').hidden = false;
});
$('#kNext').addEventListener('click', async () => {
  const r = ck.next($('#kErr')); if (!r) return;
  if (r === 'moved') { kNav(); $('#f-climate').scrollIntoView({ behavior: 'smooth' }); return; }
  const btn = $('#kNext'); btn.disabled = true;
  try { await send('climate', { role: ROLE[kRole], ...kState.info, positive: positive(kState.ans), ...kState.ans }); }
  catch { btn.disabled = false; $('#kErr').textContent = 'تعذّر الإرسال. تحقّق من الاتصال ثم حاول مرة أخرى.'; return; }
  btn.disabled = false; $('#f-climate').hidden = true; $('#kDone').hidden = false; window.scrollTo(0, 0);
});

/* ── التنقل ── */
function route() {
  let p = (location.hash || '#home').slice(1);
  if (p === 'ittala' || p === 'needs') p = 'rihla';
  // روابط مباشرة: #students للطلاب، #staff للمعلمين والإداريين
  const aud = p === 'students' ? 'student' : p === 'staff' ? 'staff' : null;
  if (aud) p = 'climate';
  if (p === 'card' && !done) p = 'rihla';
  const id = $('#p-' + p) ? p : 'home', nav = id === 'card' ? 'rihla' : id;
  $$('section.page').forEach(s => s.classList.toggle('on', s.id === 'p-' + id));
  $$('[data-nav]').forEach(a => { const on = a.dataset.nav === nav; a.classList.toggle('on', on); on ? a.setAttribute('aria-current', 'page') : a.removeAttribute('aria-current'); });
  if (id === 'home') loadHome();
  if (id === 'rihla') renderJ();
  if (id === 'card') renderCard();
  if (id === 'climate') {
    if (!$('#kDone').hidden) { $('#kDone').hidden = true; $('#climateRoles').hidden = false; }
    $$('.role[data-r]').forEach(r => r.hidden = !!aud && r.dataset.r !== aud);
    if (aud === 'student' && $('#f-climate').hidden) $('.role[data-role=student]').click();
  }
  if (id !== 'rihla' && !vid.paused) vid.pause();
  window.scrollTo(0, 0);
}
addEventListener('hashchange', route); route();
})();
