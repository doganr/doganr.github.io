/* TÜBİTAK 2237 · KTÜ İLAFAR ortak sunum motoru: ses, slayt kancaları, sayaçlar, quiz, QR, konfeti, arka plan */
(function () {
    const IL = window.IL = {};

    // ---------- ses: WebAudio ile anında sentez (dosya yok) ----------
    IL.sfx = (() => {
        let ctx = null, master = null, on = true, lastTick = 0;
        try { on = localStorage.getItem('il-sound') !== '0'; } catch (e) { /* gizli pencere */ }
        function ac() {
            if (!ctx) {
                const C = window.AudioContext || window.webkitAudioContext;
                if (!C) return null;
                ctx = new C(); master = ctx.createGain(); master.gain.value = 0.55; master.connect(ctx.destination);
            }
            if (ctx.state === 'suspended') ctx.resume();
            return ctx;
        }
        function tone(freq, dur, o = {}) {
            if (!on) return; const c = ac(); if (!c) return;
            const t = c.currentTime + (o.delay || 0), osc = c.createOscillator(), g = c.createGain();
            osc.type = o.type || 'sine'; osc.frequency.setValueAtTime(freq, t);
            if (o.slide) osc.frequency.exponentialRampToValueAtTime(o.slide, t + dur);
            g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(o.vol || 0.15, t + (o.attack || 0.006));
            g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
            osc.connect(g); g.connect(master); osc.start(t); osc.stop(t + dur + 0.05);
        }
        function noise(dur, o = {}) {
            if (!on) return; const c = ac(); if (!c) return;
            const t = c.currentTime + (o.delay || 0), n = Math.floor(c.sampleRate * dur), b = c.createBuffer(1, n, c.sampleRate), d = b.getChannelData(0);
            for (let i = 0; i < n; i++) d[i] = Math.random() * 2 - 1;
            const s = c.createBufferSource(), f = c.createBiquadFilter(), g = c.createGain();
            s.buffer = b; f.type = 'bandpass'; f.Q.value = o.q || 0.7;
            f.frequency.setValueAtTime(o.f0 || 500, t); f.frequency.exponentialRampToValueAtTime(o.f1 || 2500, t + dur);
            g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(o.vol || 0.1, t + dur * 0.35); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
            s.connect(f); f.connect(g); g.connect(master); s.start(t); s.stop(t + dur + 0.05);
        }
        return {
            get on() { return on; },
            set(v) { on = v; try { localStorage.setItem('il-sound', on ? '1' : '0'); } catch (e) { /* yok say */ } if (on) ac(); },
            unlock() { if (on) ac(); },
            whoosh() { noise(0.32, { vol: 0.05, f0: 350, f1: 2200, q: 0.6 }); },
            pop() { tone(480, 0.13, { vol: 0.1, slide: 860 }); },
            tick() { const n = performance.now(); if (n - lastTick < 55) return; lastTick = n; tone(1900, 0.025, { type: 'square', vol: 0.025 }); },
            click() { tone(1200, 0.04, { type: 'triangle', vol: 0.06 }); },
            ding() { tone(880, 0.5, { vol: 0.13 }); tone(1320, 0.6, { vol: 0.09, delay: 0.08 }); },
            buzz() { tone(150, 0.28, { type: 'sawtooth', vol: 0.06 }); tone(112, 0.32, { type: 'sawtooth', vol: 0.05, delay: 0.06 }); },
            chime() { [523, 659, 784, 1047].forEach((f, i) => tone(f, 0.7, { vol: 0.08, delay: i * 0.085 })); },
            fanfare() { [523, 659, 784, 1047, 784, 1047, 1319].forEach((f, i) => tone(f, i === 6 ? 0.9 : 0.3, { type: 'triangle', vol: 0.1, delay: i * 0.11 })); },
            shutter() { noise(0.07, { vol: 0.22, f0: 3200, f1: 1400, q: 0.5 }); noise(0.06, { vol: 0.16, f0: 2200, f1: 900, q: 0.5, delay: 0.09 }); },
            blip(f) { tone(f || 660, 0.09, { type: 'triangle', vol: 0.07 }); },
            drop() { tone(1100, 0.22, { vol: 0.09, slide: 320 }); },
            beep(f) { tone(f || 880, 0.16, { type: 'square', vol: 0.04 }); },
            swell() { tone(220, 1.2, { vol: 0.06, attack: 0.5, slide: 440 }); tone(330, 1.2, { vol: 0.04, attack: 0.5, slide: 660 }); },
        };
    })();

    // ---------- slayt giriş / çıkış kancaları ----------
    const enterFns = {}, leaveFns = {};
    IL.enter = (id, fn) => (enterFns[id] = enterFns[id] || []).push(fn);
    IL.leave = (id, fn) => (leaveFns[id] = leaveFns[id] || []).push(fn);
    IL.$s = id => document.querySelector('section[data-id="' + id + '"]');
    // slayt görünürken dönen animasyon döngüsü
    IL.loop = (id, fn) => {
        let raf = 0;
        IL.enter(id, () => {
            cancelAnimationFrame(raf); const t0 = performance.now();
            const f = t => { fn(Math.max(0, t - t0)); raf = requestAnimationFrame(f); };
            raf = requestAnimationFrame(f);
        });
        IL.leave(id, () => cancelAnimationFrame(raf));
    };
    IL.sleep = ms => new Promise(r => setTimeout(r, ms));

    // ---------- sayılar ----------
    IL.fmt = (v, d) => new Intl.NumberFormat('tr-TR', { minimumFractionDigits: d || 0, maximumFractionDigits: d || 0 }).format(v);
    IL.countUp = el => {
        const to = +el.dataset.to, d = +(el.dataset.dec || 0), dur = +(el.dataset.dur || 1500), pre = el.dataset.pre || '', suf = el.dataset.suf || '';
        const from = +(el.dataset.from || 0), t0 = performance.now();
        cancelAnimationFrame(el._raf);
        const step = t => {
            const p = Math.min(1, (t - t0) / dur), e = 1 - Math.pow(1 - p, 3);
            el.textContent = pre + IL.fmt(from + (to - from) * e, d) + suf;
            if (p < 1) { IL.sfx.tick(); el._raf = requestAnimationFrame(step); }
        };
        el._raf = requestAnimationFrame(step);
    };
    function runCounters(root) {
        root.querySelectorAll('.count').forEach(el => {
            const fr = el.closest('.fragment');
            if (fr && !fr.classList.contains('visible')) { el.textContent = (el.dataset.pre || '') + IL.fmt(+(el.dataset.from || 0), +(el.dataset.dec || 0)) + (el.dataset.suf || ''); return; }
            IL.countUp(el);
        });
    }

    // ---------- yazı makinesi ----------
    IL.type = (el, speed) => {
        const full = el.dataset.full || (el.dataset.full = el.textContent);
        clearInterval(el._tw); let i = 0; el.textContent = '';
        el._tw = setInterval(() => {
            i += 2; el.textContent = full.slice(0, i);
            if (i % 6 === 0) IL.sfx.tick();
            if (i >= full.length) clearInterval(el._tw);
        }, speed || 22);
    };

    // ---------- konfeti ----------
    IL.confetti = () => {
        let cv = document.getElementById('il-confetti');
        if (!cv) { cv = document.createElement('canvas'); cv.id = 'il-confetti'; document.body.appendChild(cv); }
        const W = cv.width = innerWidth, H = cv.height = innerHeight, x = cv.getContext('2d');
        const cols = ['#cd061e', '#00426a', '#f59e0b', '#0f9d58', '#ffffff', '#7c3aed'];
        const P = Array.from({ length: 170 }, () => ({ x: W / 2 + (Math.random() - 0.5) * W * 0.3, y: H * 0.55, vx: (Math.random() - 0.5) * 18,
            vy: -Math.random() * 20 - 8, r: Math.random() * 6 + 4, c: cols[Math.random() * cols.length | 0], a: Math.random() * 6, va: (Math.random() - 0.5) * 0.4 }));
        const t0 = performance.now();
        (function f(t) {
            x.clearRect(0, 0, W, H);
            P.forEach(p => { p.vy += 0.45; p.vx *= 0.99; p.x += p.vx; p.y += p.vy; p.a += p.va;
                x.save(); x.translate(p.x, p.y); x.rotate(p.a); x.fillStyle = p.c; x.fillRect(-p.r, -p.r / 2, p.r * 2, p.r); x.restore(); });
            if (t - t0 < 3200) requestAnimationFrame(f); else x.clearRect(0, 0, W, H);
        })(t0);
    };

    // ---------- koyu slaytlarda yüzen hücreler / moleküller ----------
    function bgCells() {
        const cv = document.createElement('canvas'); cv.id = 'il-bg';
        const rv = document.querySelector('.reveal'); rv.insertBefore(cv, rv.querySelector('.slides'));
        const x = cv.getContext('2d'); let W, H, dpr;
        const fit = () => { dpr = Math.min(2, devicePixelRatio || 1); W = rv.clientWidth; H = rv.clientHeight; cv.width = W * dpr; cv.height = H * dpr; cv.style.width = W + 'px'; cv.style.height = H + 'px'; };
        fit(); addEventListener('resize', fit);
        const P = Array.from({ length: 34 }, (_, i) => ({ x: Math.random(), y: Math.random(), r: 10 + Math.random() * 34, k: i % 3, s: 0.2 + Math.random() * 0.6,
            a: Math.random() * 6.28, va: (Math.random() - 0.5) * 0.004, ph: Math.random() * 6.28 }));
        (function f(t) {
            requestAnimationFrame(f);
            if (!document.body.classList.contains('il-dark')) return;
            x.setTransform(dpr, 0, 0, dpr, 0, 0); x.clearRect(0, 0, W, H);
            P.forEach(p => {
                p.y -= p.s * 0.00018; if (p.y < -0.1) { p.y = 1.1; p.x = Math.random(); }
                p.a += p.va; const px = p.x * W + Math.sin(t / 3000 + p.ph) * 18, py = p.y * H;
                x.save(); x.translate(px, py); x.rotate(p.a); x.globalAlpha = 0.09 + 0.05 * Math.sin(t / 1500 + p.ph);
                x.strokeStyle = '#fff'; x.fillStyle = '#fff'; x.lineWidth = 2;
                if (p.k === 0) { // alyuvar: halka
                    x.beginPath(); x.arc(0, 0, p.r, 0, 6.28); x.stroke(); x.beginPath(); x.arc(0, 0, p.r * 0.45, 0, 6.28); x.globalAlpha *= 0.6; x.stroke();
                } else if (p.k === 1) { // altıgen halka (molekül)
                    x.beginPath(); for (let i = 0; i < 7; i++) { const a = i * Math.PI / 3; x.lineTo(Math.cos(a) * p.r * 0.7, Math.sin(a) * p.r * 0.7); } x.stroke();
                    for (let i = 0; i < 6; i += 2) { const a = i * Math.PI / 3; x.beginPath(); x.arc(Math.cos(a) * p.r * 0.7, Math.sin(a) * p.r * 0.7, 3, 0, 6.28); x.fill(); }
                } else { // piksel karesi
                    x.strokeRect(-p.r * 0.35, -p.r * 0.35, p.r * 0.7, p.r * 0.7);
                }
                x.restore();
            });
        })(0);
    }

    // ---------- geri sayım: <div class="timer" data-sec="480"></div> (T tuşu başlat/durdur) ----------
    IL.timer = el => {
        const S = IL.sfx, total = +el.dataset.sec * 1000, R = 52, L = 2 * Math.PI * R;
        el.innerHTML = `<div class="tw-ring"><svg viewBox="0 0 120 120"><circle cx="60" cy="60" r="${R}" fill="none" stroke="#e3e9ef" stroke-width="10"/>` +
            `<circle class="fg" cx="60" cy="60" r="${R}" fill="none" stroke="#0f9d58" stroke-width="10" stroke-linecap="round" stroke-dasharray="${L}" transform="rotate(-90 60 60)"/></svg>` +
            `<div class="tv"></div></div><div class="tbtn"><button class="btn go" title="Başlat / durdur (T)">▶</button><button class="btn" title="Sıfırla">↺</button></div>`;
        const fg = el.querySelector('.fg'), tv = el.querySelector('.tv'), [bp, br] = el.querySelectorAll('button');
        let left = total, run = false, t0 = 0, iv = 0, lastSec = -1;
        const fmt = ms => { const s = Math.ceil(ms / 1000); return Math.floor(s / 60) + ':' + String(s % 60).padStart(2, '0'); };
        const paint = () => {
            const f = left / total; fg.style.strokeDashoffset = L * (1 - f);
            fg.style.stroke = f > 0.3 ? '#0f9d58' : f > 0.1 ? '#f59e0b' : '#cd061e'; tv.textContent = fmt(left); el.classList.toggle('done', left <= 0);
        };
        const stop = () => { run = false; clearInterval(iv); bp.textContent = '▶'; };
        const tick = () => {
            const now = performance.now(); left = Math.max(0, left - (now - t0)); t0 = now;
            const s = Math.ceil(left / 1000); if (s !== lastSec) { lastSec = s; if (s <= 10 && s > 0) S.beep(s <= 3 ? 990 : 660); }
            if (left <= 0) { stop(); S.chime(); S.ding(); }
            paint();
        };
        const start = () => { if (left <= 0) left = total; run = true; t0 = performance.now(); clearInterval(iv); iv = setInterval(tick, 200); bp.textContent = '⏸'; S.click(); };
        el._toggle = () => { if (run) { stop(); S.click(); } else start(); };
        el._reset = () => { stop(); left = total; lastSec = -1; paint(); };
        bp.onclick = e => { e.stopPropagation(); el._toggle(); };
        br.onclick = e => { e.stopPropagation(); el._reset(); S.click(); };
        paint();
    };

    // ---------- form / bağlantı QR'ı: <div class="linkqr" data-key="on"></div> (window.FORMLAR ya da kutuya yapıştırılan) ----------
    IL.linkqr = el => {
        const key = el.dataset.key, cfg = (window.FORMLAR || {})[key] || '', size = +(el.dataset.size || 230);
        let v = ''; try { v = localStorage.getItem('il-link-' + key) || ''; } catch (e) { /* yok say */ }
        el.innerHTML = '<div class="qr lq"></div><div class="url lu"></div><input class="lin" placeholder="(eğitmen) form bağlantısını yapıştırın">';
        const q = el.querySelector('.lq'), u = el.querySelector('.lu'), inp = el.querySelector('.lin');
        inp.value = cfg || v; if (cfg) inp.style.display = 'none';
        const draw = () => {
            const x = inp.value.trim(); q.innerHTML = ''; u.textContent = x.replace(/^https?:\/\//, '');
            q.style.display = u.style.display = x ? '' : 'none';
            if (x && window.QRCode) new QRCode(q, { text: x, width: size, height: size, colorDark: '#00263d', colorLight: '#ffffff', correctLevel: QRCode.CorrectLevel.M });
        };
        inp.addEventListener('change', () => { try { localStorage.setItem('il-link-' + key, inp.value.trim()); } catch (e) { /* yok say */ } draw(); IL.sfx.ding(); });
        inp.addEventListener('keydown', e => e.stopPropagation());
        draw();
    };

    // ---------- el kaldırma sayacı: .tally içindeki button[data-c]; tık +1, sağ tık −1 ----------
    IL.tally = el => {
        const bs = [...el.querySelectorAll('button[data-c]')];
        const upd = () => {
            const n = bs.map(b => +b.dataset.n || 0), tot = n.reduce((a, b) => a + b, 0) || 1;
            bs.forEach((b, i) => { b.querySelector('b').textContent = n[i]; const bar = b.querySelector('i'); if (bar) bar.style.width = (100 * n[i] / tot) + '%'; });
        };
        bs.forEach(b => {
            b.innerHTML = `<i style="background:${b.dataset.c}"></i><span>${b.innerHTML}</span><b>0</b>`;
            b.addEventListener('click', e => { e.stopPropagation(); b.dataset.n = (+b.dataset.n || 0) + 1; IL.sfx.blip(500 + 40 * b.dataset.n); upd(); });
            b.addEventListener('contextmenu', e => { e.preventDefault(); b.dataset.n = Math.max(0, (+b.dataset.n || 0) - 1); IL.sfx.click(); upd(); });
        });
        upd();
    };

    // ---------- başlat ----------
    IL.start = (opts) => {
        opts = opts || {};
        document.querySelectorAll('.st').forEach(st => [...st.children].forEach((c, i) => c.style.setProperty('--i', i)));
        // alt bilgi + ses düğmesi
        const foot = document.createElement('div'); foot.id = 'il-foot';
        foot.innerHTML = '<i></i>' + (opts.foot || 'TÜBİTAK 2237 · KTÜ İLAFAR'); document.body.appendChild(foot);
        const sb = document.createElement('button'); sb.id = 'il-snd'; sb.title = 'Ses aç/kapat (M)';
        const paint = () => { sb.textContent = IL.sfx.on ? '🔊' : '🔇'; };
        IL.toggleSound = () => { IL.sfx.set(!IL.sfx.on); paint(); if (IL.sfx.on) IL.sfx.ding(); };
        sb.addEventListener('click', e => { e.stopPropagation(); IL.toggleSound(); sb.blur(); }); paint(); document.body.appendChild(sb);
        ['keydown', 'pointerdown'].forEach(ev => addEventListener(ev, () => IL.sfx.unlock(), { once: true, capture: true }));
        // quiz
        document.addEventListener('click', e => {
            const o = e.target.closest('.quiz .opt'); if (!o) return;
            const q = o.closest('.quiz'), fb = q.querySelector('.fb');
            if (o.dataset.ok !== undefined) { o.classList.add('ok'); IL.sfx.ding(); if (fb) fb.innerHTML = o.dataset.fb || q.dataset.fb || '✓ Doğru!'; }
            else { o.classList.add('no'); IL.sfx.buzz(); if (fb && o.dataset.fb) fb.innerHTML = o.dataset.fb; }
        });
        // çevrilen kartlar
        document.addEventListener('click', e => { const f = e.target.closest('.flip'); if (!f) return; f.classList.toggle('on'); IL.sfx.whoosh(); IL.sfx.pop(); });
        // QR kodları
        document.querySelectorAll('.qr[data-url]').forEach(el => {
            const s = +(el.dataset.size || 170);
            if (window.QRCode) new QRCode(el, { text: el.dataset.url, width: s, height: s, colorDark: '#00263d', colorLight: '#ffffff', correctLevel: QRCode.CorrectLevel.M });
        });
        bgCells();
        document.querySelectorAll('.timer[data-sec]').forEach(IL.timer);
        document.querySelectorAll('.linkqr[data-key]').forEach(IL.linkqr);
        document.querySelectorAll('.tally').forEach(IL.tally);

        Reveal.initialize(Object.assign({
            width: 1280, height: 720, margin: 0.03, minScale: 0.2, maxScale: 3, center: false, hash: true, hashOneBasedIndex: true,
            slideNumber: 'c/t', controls: true, controlsTutorial: false, progress: true, transition: 'slide', backgroundTransition: 'fade',
            navigationMode: 'linear', plugins: window.RevealNotes ? [RevealNotes] : [], keyboard: { 77: () => IL.toggleSound(), 84: () => { const t = Reveal.getCurrentSlide().querySelector('.timer'); if (t && t._toggle) t._toggle(); } },
        }, opts.reveal || {}));

        const onSlide = (cur, prev, sound) => {
            document.body.classList.toggle('il-dark', cur.classList.contains('dark'));
            document.body.classList.toggle('il-nofoot', cur.classList.contains('nofoot'));
            if (prev && prev.dataset.id) (leaveFns[prev.dataset.id] || []).forEach(f => f(prev));
            runCounters(cur);
            cur.querySelectorAll('.tw').forEach(el => IL.type(el));
            if (cur.dataset.id) (enterFns[cur.dataset.id] || []).forEach(f => f(cur));
            if (sound) (cur.dataset.sound && IL.sfx[cur.dataset.sound] ? IL.sfx[cur.dataset.sound]() : IL.sfx.whoosh());
        };
        Reveal.on('ready', e => onSlide(e.currentSlide, null, false));
        Reveal.on('slidechanged', e => onSlide(e.currentSlide, e.previousSlide, true));
        Reveal.on('fragmentshown', e => {
            IL.sfx.pop();
            const f = e.fragment; (f.matches('.count') ? [f] : [...f.querySelectorAll('.count')]).forEach(IL.countUp);
            if (f.dataset.sfx && IL.sfx[f.dataset.sfx]) IL.sfx[f.dataset.sfx]();
            if (f.dataset.call && IL[f.dataset.call]) IL[f.dataset.call](f);
        });
        Reveal.on('fragmenthidden', () => IL.sfx.click());
    };
})();
