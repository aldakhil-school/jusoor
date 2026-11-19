// إضافات المراحل القادمة في جسور. كل صفحة هنا لا تظهر إلا إذا وصل C.phase في config.js إلى مرحلتها:
// ٢ التخطيط: الاستطلاع التشاركي · ٣ التنفيذ: مكتبة الفيديوهات، شارك (نبض الأسبوع)، المسابقة، بنك الخبرات · ٤-٥: أثر جسور والقياس البعدي
// يُحمَّل قبل app.js، وapp.js يستدعي JUSOOR_EXT(api) ويمرّر له الأدوات المشتركة.
window.JUSOOR_EXT = api => {
const { C, $, $$, AR, esc, shuffle, store, send, studentBlock, fillSections, buildOpts, collect, restore, validate } = api;
const PH = C.phase || 1;
const family = () => store.get('family', null); // بيانات الطالب من آخر إرسال على هذا الجهاز
const famLine = f => `ولي أمر الطالب: <b>${esc(f.student)}</b> · ${esc(f.grade)}`;
// كتلة الطالب: إن كانت محفوظة تُعرض سطراً مع رابط «تغيير»، وإلا تُطلب
function studentArea(box, key) {
  const f = family();
  if (f && !box.dataset.edit) {
    box.innerHTML = `<div class="known">${famLine(f)} <button type="button" class="lnk">تغيير</button></div>`;
    box.querySelector('.lnk').onclick = () => { box.dataset.edit = 1; studentArea(box, key); };
  } else {
    box.innerHTML = `<div class="student">${studentBlock(key)}</div>`; const st = box.querySelector('.student'); fillSections(st);
    if (f) restore(st, f); else { const p = store.get('preset', null); if (p) restore(st, { grade: p.grade, section: String(p.section) }); }
  }
}
const stuOf = (box, form) => { const f = family(); if (f && !box.dataset.edit) return { student: f.student, grade: f.grade, section: f.section }; const n = collect(form); return { student: n.student, grade: n.grade, section: n.section }; };
const keepFam = s => { if (s.student && s.grade && s.section) store.set('family', s); };
const thanks = (el, h, p, extra = '') => { el.innerHTML = `<div class="card bar panel done"><div class="plank"></div><h1>${h}</h1><p>${p}</p>${extra}</div>`; el.scrollIntoView({ behavior: 'smooth', block: 'start' }); };
const sendErr = el => { el.textContent = 'تعذّر الإرسال. تحقّق من الاتصال بالإنترنت ثم حاول مرة أخرى.'; };

/* ══════════ مكتبة الفيديوهات (المرحلة ٣) ══════════ */
const V = (C.videos || []).filter(v => v.file);
const LIB = store.get('lib', {}); const saveLib = () => store.set('lib', LIB);
const vs = id => (LIB[id] = LIB[id] || { watched: 0, ended: false, quiz: {}, sent: false });
function libList() {
  const box = $('#vlib'); if (!box) return;
  box.innerHTML = V.map(v => {
    const s = vs(v.id), st = !v.open ? ['قريباً', 'sd'] : s.sent ? ['✓ شاركت', ''] : (s.watched > 2 ? ['أكمل المشاهدة', 'bl'] : ['جديد', 'bl']);
    const tag = v.open ? 'a' : 'div';
    return `<${tag} class="card vcard${v.open ? '' : ' locked'}"${v.open ? ` href="#v-${v.id}"` : ''}>
      <div class="vthumb">${v.poster ? `<img src="${v.poster}" alt="" loading="lazy">` : ''}<span class="vn">${AR(V.indexOf(v) + 1)}</span>${v.open ? '<span class="vplay" data-ic="play"></span>' : ''}</div>
      <div class="vbody"><h3>${esc(v.title)}</h3><p>${esc(v.sub || '')}</p><span class="pill ${st[1]}">${st[0]}</span></div></${tag}>`;
  }).join('');
  box.querySelectorAll('[data-ic]').forEach(e => e.innerHTML = `<svg viewBox="0 0 24 24" aria-hidden="true">${api.IC[e.dataset.ic] || ''}</svg>`);
  myBridge();
  const n = sentN(), open = V.filter(v => v.open).length;
  $('#vlibStat').textContent = open ? `شاركت في ${AR(n)} من ${AR(open)} فيديو متاح` : 'تُفتح الفيديوهات تباعاً خلال الفصل الدراسي.';
}
/* جسرك الشخصي: قوس لكل فيديو، يكتمل حين يرسل ولي الأمر مشاركته فيه */
const sentN = () => V.filter(v => vs(v.id).sent).length;
const nextV = () => V.find(v => v.open && !vs(v.id).sent);
function bridgeSVG() {
  const T = V.length, x0 = 24, x1 = 576, deck = 96, span = (x1 - x0) / T, per = 5, cols = ['#3ecf8e', '#6ec6e6', '#e9b872'], gold = sentN() === T && T > 0;
  let h = '';
  V.forEach((v, i) => { // من اليمين إلى اليسار مثل اتجاه القراءة
    const b = x1 - i * span, a = b - span, on = vs(v.id).sent, c = gold ? '#e9b872' : cols[i % 3];
    h += `<path d="M${a + 4} ${deck}Q${(a + b) / 2} ${deck - 78} ${b - 4} ${deck}" fill="none" stroke="${on ? c : 'rgba(255,255,255,.22)'}" stroke-width="${on ? 5 : 3}" stroke-dasharray="${on ? '' : '5 6'}" stroke-linecap="round"/>`;
    for (let k = 0; k < per; k++) { const w = (span - 8) / per, px = b - 4 - (k + 1) * w; h += `<rect x="${px + 1}" y="${deck - 3}" width="${w - 2}" height="12" rx="3" fill="${on ? c : 'rgba(255,255,255,.05)'}" stroke="${on ? 'none' : 'rgba(255,255,255,.22)'}" stroke-dasharray="3 3"/>`; }
    h += `<text x="${(a + b) / 2}" y="${deck + 34}" text-anchor="middle" font-size="15" fill="${on ? '#fff' : '#9dbccb'}" font-family="Readex Pro, sans-serif">${on ? '✓ ' : ''}${AR(i + 1)}</text>`;
  });
  for (let i = 0; i <= T; i++) { const x = x0 + i * span; h += `<rect x="${x - 5}" y="${deck + 9}" width="10" height="18" rx="3" fill="rgba(255,255,255,.45)"/>`; }
  return `<svg viewBox="0 0 600 140" role="img" aria-label="جسرك الشخصي: ${AR(sentN())} من ${AR(T)} فيديو">${h}</svg>`;
}
function myBridge() {
  if (!V.length) return;
  const n = sentN(), T = V.length, gold = n === T;
  $$('.pbridge').forEach(el => { el.classList.toggle('gold', gold); el.innerHTML = `<div class="pb-h"><div><span class="eyebrow">جسرك الشخصي</span><h3>${gold ? 'اكتمل جسرك، أنت شريك جسور الذهبي' : n ? `بنيت ${AR(n)} من ${AR(T)} أقواس` : 'كل فيديو تكمله يبني قوساً في جسرك'}</h3></div><b class="big">${AR(n)}<small>/${AR(T)}</small></b></div>`
    + bridgeSVG()
    + (gold ? '<div class="cta"><a class="btn sm" href="#card">بطاقتك الذهبية</a></div>' : (nextV() ? `<div class="cta"><a class="btn sm" href="#v-${nextV().id}">${n ? 'الفيديو التالي' : 'ابدأ أول فيديو'}</a></div>` : '') + `<p class="muted pb-p">شاهد الفيديو وأجب عن أسئلته ثم أرسل مشاركتك، يكتمل قوسه. وحين تكتمل الأقواس كلها تصير بطاقتك «شريك جسور الذهبي».</p>`); });
}
let cur = null; // الفيديو المفتوح
function openVideo(id) {
  const v = V.find(x => x.id === id && x.open); if (!v) { location.hash = 'videos'; return; }
  const s = vs(v.id), one = $('#vone'); $('#vlibWrap').hidden = true; one.hidden = false;
  one.innerHTML = `<a class="back" href="#videos">→ كل الفيديوهات</a>
    <div class="form-head"><span class="eyebrow">فيديو ${AR(V.indexOf(v) + 1)} من ${AR(V.length)} · التوجيه الأسري</span><h1>${esc(v.title)}</h1><p class="lead">${esc(v.sub || '')}</p></div>
    <div class="player" id="lp"><video id="lv" src="${v.file}" ${v.poster ? `poster="${v.poster}"` : ''} controls playsinline preload="metadata"></video>
      <div class="vq" id="lq" hidden role="dialog" aria-live="polite"><span class="vq-n" id="lqN"></span><h3 id="lqQ"></h3><div class="vq-opts" id="lqO"></div><div class="vq-fb" id="lqF"></div></div></div>
    <div class="vstat"><span class="chip" id="lcW"><span>شاهد الفيديو</span></span><span class="chip" id="lcQ"><span></span></span></div>
    <p class="muted vhint">يتوقف الفيديو عند كل سؤال، وبعد إجابتك يكمل تلقائياً.</p>
    <form class="card bar c2 panel" id="lReg" novalidate hidden><h2>سجّل مشاركتك</h2><p class="muted" style="font-size:15px">تُحتسب مشاهدتك مشاركةً في تعلّم ابنك (المؤشر ١-٣-١-٢).</p><div id="lStu"></div>
      <div class="err" id="lErr"></div><div class="form-nav"><span></span><button class="btn" type="submit">إرسال المشاركة</button></div></form>
    <div id="lDone"></div>`;
  const vid = $('#lv'), QS = v.qs || []; let lastT = 0, asking = null, tick = 0;
  cur = vid;
  const nextQ = () => QS.find((q, i) => !(('q' + (i + 1)) in s.quiz) && true);
  const kOf = q => 'q' + (QS.indexOf(q) + 1);
  const answered = () => QS.filter(q => kOf(q) in s.quiz).length;
  const dur = () => vid.duration || v.dur || 120;
  const watchedOK = () => s.ended || s.watched / dur() >= 0.85;
  function upd() {
    $('#lcW').classList.toggle('ok', watchedOK()); $('#lcW span').textContent = watchedOK() ? '✓ شاهدت الفيديو' : `شاهدت ${AR(Math.min(99, Math.round(s.watched / dur() * 100)))}٪`;
    $('#lcQ').classList.toggle('ok', answered() === QS.length); $('#lcQ span').textContent = `الأسئلة ${AR(answered())} من ${AR(QS.length)}`;
    const ready = watchedOK() && answered() === QS.length;
    $('#lReg').hidden = !ready || s.sent;
    if (s.sent && !$('#lDone').innerHTML) { setTimeout(myBridge); } if (s.sent && !$('#lDone').innerHTML) $('#lDone').innerHTML = `<div class="card bar panel done"><div class="plank"></div><h1>وصلت مشاركتك</h1><p>شكراً لك.${QS.length ? ` نتيجتك ${AR(s.score ?? 0)} من ${AR(QS.length)}.` : ''}</p><div class="card bar pbridge" style="margin-top:18px;text-align:right"></div><div class="cta">${sentN() === V.length ? '<a class="btn" href="#card">بطاقتك الذهبية</a>' : '<a class="btn" href="#videos">فيديو آخر</a>'}<a class="btn ghost" href="#home">الجسر الحي</a></div></div>`;
  }
  vid.addEventListener('timeupdate', () => {
    const d = vid.currentTime - lastT; if (d > 0 && d < 1.5) s.watched += d; lastT = vid.currentTime;
    const q = nextQ(); if (q && !asking && vid.currentTime >= q.t) ask(q);
    if (++tick % 8 === 0) saveLib(); upd();
  });
  vid.addEventListener('seeking', () => { const q = nextQ(); if (q && vid.currentTime > q.t + 0.3) { vid.currentTime = Math.max(0, q.t - 0.4); } lastT = vid.currentTime; });
  vid.addEventListener('ended', () => { s.ended = true; saveLib(); upd(); });
  function ask(q) {
    asking = q; vid.pause();
    try { if (document.fullscreenElement) document.exitFullscreen(); if (vid.webkitDisplayingFullscreen) vid.webkitExitFullscreen(); } catch {}
    vid.controls = false; $('#lp').classList.add('asking'); $('#lq').hidden = false;
    $('#lqN').textContent = `سؤال ${AR(QS.indexOf(q) + 1)} من ${AR(QS.length)}`; $('#lqQ').textContent = q.q; $('#lqF').textContent = '';
    $('#lqO').innerHTML = shuffle(q.opts.map((o, i) => [o, i])).map(([o, i]) => `<button type="button" data-i="${i}">${esc(o)}</button>`).join('');
    $('#lqO button').focus({ preventScroll: true });
  }
  $('#lqO').addEventListener('click', e => {
    const b = e.target.closest('button'); if (!b || !asking) return;
    const q = asking, i = +b.dataset.i, ok = i === 0; s.quiz[kOf(q)] = q.opts[i]; saveLib();
    $$('#lqO button').forEach(x => { x.disabled = true; if (+x.dataset.i === 0) x.classList.add('ok'); }); if (!ok) b.classList.add('no');
    $('#lqF').textContent = ok ? 'إجابة صحيحة، أحسنت.' : `الإجابة الصحيحة: ${q.opts[0]}`; $('#lqF').className = 'vq-fb ' + (ok ? 'ok' : 'no'); upd();
    setTimeout(() => { $('#lq').hidden = true; $('#lp').classList.remove('asking'); vid.controls = true; asking = null; if (vid.currentTime < dur() - 0.5) vid.play().catch(() => {}); }, ok ? 1200 : 2300);
  });
  studentArea($('#lStu'), 'lv');
  $('#lReg').addEventListener('submit', async e => {
    e.preventDefault(); const f = $('#lReg'), box = $('#lStu');
    if (box.dataset.edit || !family()) { if (!validate(f, $('#lErr'))) return; }
    const stu = stuOf(box, f), score = QS.filter(q => s.quiz[kOf(q)] === q.opts[0]).length, btn = f.querySelector('button[type=submit]'); btn.disabled = true;
    const pass = QS.length ? score >= Math.min(2, QS.length) : true; // فيديو بلا أسئلة (مثل الختامي) تكفي مشاهدته
    const row = { ...stu, video: v.id, score, passed: pass ? 'نعم' : 'لا', watched: Math.round(s.watched) };
    QS.forEach((q, i) => row['q' + (i + 1)] = s.quiz['q' + (i + 1)] || '');
    try { await send('tawjih', row); } catch { btn.disabled = false; return sendErr($('#lErr')); }
    keepFam(stu); s.sent = true; s.score = score; saveLib(); upd(); $('#lDone').scrollIntoView({ behavior: 'smooth', block: 'center' });
  });
  upd(); window.scrollTo(0, 0);
}

/* ══════════ نبض الأسبوع (المرحلة ٣) ══════════ */
const PULSE = (C.pulse || []).find(p => p.id === C.pulseNow);
async function pulseBox() {
  const box = $('#pulse'); if (!box) return;
  if (!PULSE) { box.innerHTML = '<p class="muted">يصل سؤال الأسبوع قريباً.</p>'; return; }
  const mine = store.get('pulse', {})[PULSE.id];
  box.innerHTML = `<h3>${esc(PULSE.q)}</h3><div class="pulse-opts">` + PULSE.opts.map(o => `<button type="button" class="${mine === o ? 'on' : ''}" ${mine ? 'disabled' : ''}>${esc(o)}</button>`).join('') + `</div><div class="pulse-res" id="pRes"></div>` + (PULSE.challenge ? `<div class="info" style="margin-top:16px"><b>تحدي البيت هذا الأسبوع:</b> ${esc(PULSE.challenge)}</div>` : '');
  if (mine) return pulseRes();
  box.querySelectorAll('.pulse-opts button').forEach(b => b.onclick = async () => {
    const a = b.textContent; box.querySelectorAll('.pulse-opts button').forEach(x => x.disabled = true); b.classList.add('on');
    const f = family(); try { await send('pulse', { id: PULSE.id, a, ...(f ? { grade: f.grade } : {}) }); } catch { box.querySelectorAll('.pulse-opts button').forEach(x => x.disabled = false); return; }
    const m = store.get('pulse', {}); m[PULSE.id] = a; store.set('pulse', m); pulseRes(a);
  });
}
async function pulseRes(justNow) {
  let s = null; try { s = await api.stats(true); } catch {}
  const cnt = Object.assign({}, (s?.pulse || {})[PULSE.id] || {}); if (justNow && s && !s.demo) cnt[justNow] = Math.max(cnt[justNow] || 0, 1);
  const tot = PULSE.opts.reduce((a, o) => a + (cnt[o] || 0), 0);
  $('#pRes').innerHTML = (tot ? PULSE.opts.map(o => { const p = Math.round((cnt[o] || 0) / tot * 100); return `<div class="pr"><span>${esc(o)}</span><div class="bar"><i style="width:${p}%"></i></div><b>${AR(p)}٪</b></div>`; }).join('') : '')
    + `<p class="muted" style="font-size:13px;margin-top:8px">شكراً لك. ${tot ? `النتيجة من ${AR(tot)} إجابة، وتتحدّث كل دقيقتين.` : 'تظهر النتيجة بعد أول الإجابات.'}</p>`;
}

/* ══════════ المسابقة (المرحلة ٣) ══════════ */
function contestPage() {
  const f = $('#fContest'); if (!f || f.dataset.ready) return; f.dataset.ready = 1;
  const k = C.contest || {};
  $('#ctDeadline').textContent = k.deadline ? `آخر موعد للمشاركة: ${k.deadline}` : 'يُعلن آخر موعد للمشاركة قريباً.';
  $('#ctSubmit').innerHTML = esc(k.submit || 'تصلك طريقة إرسال الفيديو من المدرسة بعد التسجيل.');
  if (!k.open) { f.hidden = true; $('#ctClosed').hidden = false; return; }
  studentArea($('#ctStu'), 'ct'); buildOpts(f);
  if (store.get('contest', null)) { f.hidden = true; $('#ctDone').hidden = false; }
  f.addEventListener('submit', async e => {
    e.preventDefault(); const box = $('#ctStu'), err = $('#ctErr');
    if (!validate(f, err)) return;
    const n = collect(f), stu = stuOf(box, f), btn = f.querySelector('button[type=submit]'); btn.disabled = true;
    try { await send('contest', { ...stu, relation: n.relation, aspects: n.aspects, title: n.title || '', consent: n.consent }); } catch { btn.disabled = false; return sendErr(err); }
    keepFam(stu); store.set('contest', { at: Date.now() }); f.hidden = true; $('#ctDone').hidden = false; $('#ctDone').scrollIntoView({ behavior: 'smooth', block: 'center' });
  });
}

/* ══════════ بنك خبرات الآباء (المرحلة ٣) ══════════ */
function expertPage() {
  const f = $('#fExpert'); if (!f || f.dataset.ready) return; f.dataset.ready = 1; studentArea($('#exStu'), 'ex'); buildOpts(f);
  if (store.get('expert', null)) { f.hidden = true; $('#exDone').hidden = false; }
  f.addEventListener('submit', async e => {
    e.preventDefault(); const err = $('#exErr'); if (!validate(f, err)) return;
    const n = collect(f), phone = (n.phone || '').replace(/[٠-٩]/g, d => '٠١٢٣٤٥٦٧٨٩'.indexOf(d)).replace(/\D/g, '');
    if (phone && !/^05\d{8}$/.test(phone)) { err.textContent = 'رقم الجوال يبدأ بـ 05 ويتكون من ١٠ أرقام، أو اتركه فارغاً.'; return; }
    const btn = f.querySelector('button[type=submit]'); btn.disabled = true;
    const stu = stuOf($('#exStu'), f);
    try { await send('expert', { ...stu, name: n.name, field: n.field, job: n.job || '', types: n.types, times: n.times || '', phone }); } catch { btn.disabled = false; return sendErr(err); }
    keepFam(stu);
    store.set('expert', { at: Date.now() }); f.hidden = true; $('#exDone').hidden = false; $('#exDone').scrollIntoView({ behavior: 'smooth', block: 'center' });
  });
}

/* ══════════ الاستطلاع التشاركي (المرحلة ٢) ══════════ */
function shuraPage() {
  const f = $('#fShura'); if (!f || f.dataset.ready) return; f.dataset.ready = 1;
  const S = C.shura || {};
  [['#shGoal', S.goals], ['#shVid', S.videos], ['#shProj', S.projects], ['#shName', S.names]].forEach(([id, l]) => { const e = $(id); e.dataset.opts = (l || []).join('|'); delete e.dataset.built; });
  buildOpts(f);
  if (store.get('shura', null)) { f.hidden = true; $('#shDone').hidden = false; }
  f.addEventListener('submit', async e => {
    e.preventDefault(); const err = $('#shErr'); if (!validate(f, err)) return;
    const n = collect(f);
    const btn = f.querySelector('button[type=submit]'); btn.disabled = true;
    try { await send('shura', { role: n.role, goal: n.goal, videos: n.videos, project: n.project, other: n.other || '', amn: n.amn, day: n.day, time: n.time, name: n.name, idea: n.idea || '' }); } catch { btn.disabled = false; return sendErr(err); }
    store.set('shura', { at: Date.now() }); f.hidden = true; $('#shDone').hidden = false; $('#shDone').scrollIntoView({ behavior: 'smooth', block: 'center' });
  });
}

/* ══════════ أثر جسور (المرحلة ٤-٥) ══════════ */
async function atharPage() {
  const box = $('#athar'); if (!box) return;
  let s = null; try { s = await api.stats(); } catch {} if (!s) return;
  const fam = s.families || C.families, pct = n => AR(Math.round(Math.min(1, (n || 0) / fam) * 100)) + '٪';
  const t = s.tawjih || {}, items = [
    ['users', 'شاركت في رحلة جسور', pct(s.participants), `${AR(s.participants || 0)} أسرة من ${AR(fam)}`],
    ['chart', 'الرضا العام عن المناخ', s.sat_post != null && s.n_post ? AR(s.sat_post) + '٪' : AR(s.satisfaction || 0) + '٪', s.sat_post != null && s.n_post ? `القياس البعدي (القبلي ${AR(s.sat_pre ?? 0)}٪)` : 'القياس القبلي'],
    ['video', 'شاهدت فيديوهات التوجيه', pct(t.families), `${AR(t.views || 0)} مشاهدة مكتملة`],
    ['briefcase', 'بنك خبرات الآباء', AR(s.experts || 0), 'ولي أمر قدّم خبرته'],
    ['camera', 'مسابقة استثمار لا يُقدّر بثمن', AR(s.contest || 0), 'مشاركة'],
    ['pulse', 'نبض الأسبوع', AR(s.pulseTotal || 0), 'إجابة']
  ];
  box.innerHTML = items.map(([ic, h, big, p], i) => `<div class="card bar ${['', 'c2', 'c3'][i % 3]} astat"><span class="tile ${['', 't2', 't3'][i % 3]}" data-ic="${ic}"></span><div class="big">${big}</div><h3>${h}</h3><p>${p}</p></div>`).join('');
  box.querySelectorAll('[data-ic]').forEach(e => e.innerHTML = `<svg viewBox="0 0 24 24" aria-hidden="true">${api.IC[e.dataset.ic] || ''}</svg>`);
  const hon = C.honor || []; $('#honor').hidden = !hon.length || PH < 5;
  $('#honorList').innerHTML = hon.map(h => `<li><b>${esc(h[0])}</b><span>${esc(h[1] || '')}</span></li>`).join('');
}

/* ══════════ الرئيسية في المراحل اللاحقة ══════════ */
function home(s) {
  if (PH >= 3 && $('#m2t')) { // المؤشر ١-٣-١-٢: الأسر التي اطّلعت أو شاهدت فيديو توجيه
    const fam = s.families || C.families, n = Math.max(s.ittala || 0, (s.tawjih || {}).union || 0);
    $('#m2').style.width = Math.min(100, n / fam * 100) + '%'; $('#m2t').textContent = AR(n) + ' أسرة شاركت في التوجيه الأسري';
    $('#m3').style.width = Math.min(100, (s.experts || 0) / Math.max(1, fam * 0.3) * 100) + '%'; $('#m3t').textContent = AR(s.experts || 0) + ' في بنك خبرات الآباء';
  }
  if (PH >= 4 && s.n_post && $('#m1t')) { $('#m1').style.width = Math.min(100, s.sat_post) + '%'; $('#m1t').textContent = `القياس البعدي: رضا ${AR(s.sat_post)}٪ (القبلي ${AR(s.sat_pre ?? 0)}٪)`; }
}

return {
  onRoute(id, raw) {
    if (cur && raw.indexOf('v-') !== 0) { try { cur.pause(); } catch {} cur = null; }
    if (id === 'videos') { if (raw.indexOf('v-') === 0) openVideo(raw.slice(2)); else { $('#vone').hidden = true; $('#vone').innerHTML = ''; $('#vlibWrap').hidden = false; libList(); } }
    if (id === 'shariq') pulseBox();
    if (id === 'contest') contestPage();
    if (id === 'khibra') expertPage();
    if (id === 'shura') shuraPage();
    if (id === 'athar') atharPage();
    if (id === 'card') myBridge();
  },
  home,
  nextVideo: () => { const v = PH >= 3 ? nextV() : null; return v ? { id: v.id, title: v.title, k: V.indexOf(v) + 1, T: V.length } : null; },
  pulsePending: () => PH >= 3 && !!PULSE && !(PULSE.id in store.get('pulse', {})),
  // لبطاقة شريك جسور: كم فيديو اكتمل، وهل صارت ذهبية
  card: () => PH >= 3 && V.length ? { n: sentN(), T: V.length, gold: sentN() === V.length } : null
};
};
