/* Sağlıkta YZ ve Algoritmik Temeller · etkileşimli parçalar */
(function () {
    const $ = id => document.getElementById(id);
    const S = IL.sfx, NS = 'http://www.w3.org/2000/svg';
    const svgEl = (t, a, p) => { const e = document.createElementNS(NS, t); for (const k in a) e.setAttribute(k, a[k]); if (p) p.appendChild(e); return e; };

    // ---------- kapak: sinyal akan bir yapay sinir ağı ----------
    (function cover() {
        const cv = $('cover-cv'), x = cv.getContext('2d'), Z = 1000, L = [4, 6, 6, 3], X = [110, 330, 550, 760];
        const nodes = L.map((n, l) => Array.from({ length: n }, (_, i) => ({ x: X[l], y: Z / 2 + (i - (n - 1) / 2) * 130 })));
        const pulses = [];
        const outLbl = ['Tanı', 'Tedavi', 'İlaç'], inLbl = ['🩻', '🫀', '🧪', '🧬'];
        IL.loop('cover', t => {
            x.clearRect(0, 0, Z, Z);
            for (let l = 0; l < L.length - 1; l++) nodes[l].forEach(a => nodes[l + 1].forEach(b => {
                x.strokeStyle = 'rgba(255,255,255,0.14)'; x.lineWidth = 2; x.beginPath(); x.moveTo(a.x, a.y); x.lineTo(b.x, b.y); x.stroke();
            }));
            if (Math.random() < 0.12) { const l = Math.floor(Math.random() * 3), a = nodes[l][Math.random() * L[l] | 0], b = nodes[l + 1][Math.random() * L[l + 1] | 0]; pulses.push({ a, b, f: 0, c: Math.random() < 0.5 ? '#ff5a6e' : '#5fb4ff' }); }
            for (let i = pulses.length - 1; i >= 0; i--) {
                const p = pulses[i]; p.f += 0.025; if (p.f >= 1) { pulses.splice(i, 1); continue; }
                const px = p.a.x + (p.b.x - p.a.x) * p.f, py = p.a.y + (p.b.y - p.a.y) * p.f;
                x.strokeStyle = p.c; x.globalAlpha = 0.8; x.lineWidth = 3; x.beginPath(); x.moveTo(p.a.x + (p.b.x - p.a.x) * Math.max(0, p.f - 0.15), p.a.y + (p.b.y - p.a.y) * Math.max(0, p.f - 0.15)); x.lineTo(px, py); x.stroke();
                x.globalAlpha = 1; x.fillStyle = p.c; x.beginPath(); x.arc(px, py, 7, 0, 6.283); x.fill();
            }
            nodes.forEach((ln, l) => ln.forEach((n, i) => {
                const glow = 0.5 + 0.5 * Math.sin(t / 500 + i + l * 2);
                x.fillStyle = l === 0 ? '#ffffff' : l === L.length - 1 ? '#ff5a6e' : `rgba(95,180,255,${0.55 + 0.45 * glow})`;
                x.beginPath(); x.arc(n.x, n.y, l === 0 || l === L.length - 1 ? 40 : 22, 0, 6.283); x.fill();
                x.textAlign = 'center'; x.textBaseline = 'middle';
                if (l === 0) { x.font = '40px "Segoe UI Emoji", "Apple Color Emoji", sans-serif'; x.fillText(inLbl[i], n.x, n.y + 2); }
                if (l === L.length - 1) { x.fillStyle = '#fff'; x.font = '800 30px Outfit, sans-serif'; x.textAlign = 'left'; x.fillText(outLbl[i], n.x + 52, n.y + 2); }
            }));
        });
    })();

    // ---------- oyuncak model: yeni hastanın diyabet olasılığı ----------
    (function toy() {
        const s = ['yas', 'glu', 'vki'].map(k => $('ml-' + k));
        const f = () => {
            const [y, g, v] = s.map(e => +e.value); s.forEach(e => { $(e.id + 'v').textContent = e.value; });
            const p = 1 / (1 + Math.exp(-(0.045 * (g - 120) + 0.12 * (v - 27) + 0.03 * (y - 45))));
            $('ml-risk').firstElementChild.style.width = (p * 100) + '%';
            const sev = p > 0.66 ? ['yüksek', '#cd061e'] : p > 0.33 ? ['orta', '#d97706'] : ['düşük', '#0f9d58'];
            $('ml-out').innerHTML = `Tahmin: diyabet olasılığı <b style="color:${sev[1]}">${sev[0]}</b> (%${Math.round(p * 100)})`;
        };
        s.forEach(e => e.addEventListener('input', () => { f(); S.tick(); }));
        IL.enter('ml', f);
    })();

    // ---------- 1B: kayan EKG · 2B: piksel ızgarası ----------
    (function veri() {
        const e = $('ekg-cv'), ex = e.getContext('2d'), W = 760, H = 380;
        const beat = u => { // tek atım (0..1)
            const g = (m, s, a) => a * Math.exp(-((u - m) ** 2) / (2 * s * s));
            return g(0.18, 0.025, 0.12) - g(0.37, 0.008, 0.12) + g(0.40, 0.012, 1.0) - g(0.43, 0.01, 0.25) + g(0.68, 0.045, 0.28);
        };
        const im = new Image(); im.src = '../assets/img/h_mikroskop.jpg';
        const m = $('mik-cv'), mx = m.getContext('2d'); let px = null;
        im.onload = () => { mx.drawImage(im, 0, 0); try { px = mx.getImageData(0, 0, 704, 528).data; } catch (err) { px = null; } };
        IL.loop('veri', t => {
            ex.fillStyle = '#fff'; ex.fillRect(0, 0, W, H);
            ex.strokeStyle = 'rgba(205,6,30,0.12)'; ex.lineWidth = 1;
            for (let i = 0; i < W; i += 20) { ex.beginPath(); ex.moveTo(i, 0); ex.lineTo(i, H); ex.stroke(); }
            for (let j = 0; j < H; j += 20) { ex.beginPath(); ex.moveTo(0, j); ex.lineTo(W, j); ex.stroke(); }
            ex.strokeStyle = '#0b6a7a'; ex.lineWidth = 4; ex.beginPath();
            const sh = t / 6;
            for (let i = 0; i < W; i += 2) { const u = ((i + sh) % 250) / 250, y = H * 0.62 - beat(u) * 200; i ? ex.lineTo(i, y) : ex.moveTo(i, y); }
            ex.stroke();
            const cur = W - 4; ex.fillStyle = '#cd061e'; ex.beginPath(); ex.arc(cur, H * 0.62 - beat(((cur + sh) % 250) / 250) * 200, 8, 0, 6.283); ex.fill();
            // mikroskop: gezen piksel merceği
            if (!im.complete) return;
            mx.drawImage(im, 0, 0);
            const cx = 352 + 230 * Math.sin(t / 2300), cy = 264 + 160 * Math.sin(t / 1700 + 1), B = 24, N = 5, x0 = Math.round(cx / B) * B - 2 * B, y0 = Math.round(cy / B) * B - 2 * B;
            mx.strokeStyle = '#ffd400'; mx.lineWidth = 3; mx.font = 'bold 11px "JetBrains Mono", monospace'; mx.textAlign = 'center'; mx.textBaseline = 'middle';
            for (let i = 0; i < N; i++) for (let j = 0; j < N; j++) {
                const X = x0 + i * B, Y = y0 + j * B;
                if (px) { const k = ((Math.min(527, Math.max(0, Y + 12)) * 704) + Math.min(703, Math.max(0, X + 12))) * 4, gv = Math.round((px[k] + px[k + 1] + px[k + 2]) / 3);
                    mx.fillStyle = `rgb(${gv},${gv},${gv})`; mx.fillRect(X, Y, B, B); mx.fillStyle = gv < 128 ? '#fff' : '#000'; mx.fillText(gv, X + B / 2, Y + B / 2 + 1); }
                mx.strokeRect(X, Y, B, B);
            }
        });
    })();

    // ---------- HaCaT: uzman etiketi ↔ model tahmini kaydırıcısı ----------
    (function cmp() {
        const c = $('cmp'), top = c.querySelector('.top'), bar = c.querySelector('.bar'); let auto = true, raf = 0;
        const set = f => { top.style.clipPath = `inset(0 0 0 ${f * 100}%)`; bar.style.left = (f * 100) + '%'; };
        c.addEventListener('pointermove', e => { auto = false; const r = c.getBoundingClientRect(); set(Math.max(0, Math.min(1, (e.clientX - r.left) / r.width))); });
        IL.enter('hacat', () => {
            auto = true; const t0 = performance.now(); cancelAnimationFrame(raf);
            const f = t => { if (!auto) return; set(0.5 + 0.42 * Math.sin((t - t0) / 1400)); raf = requestAnimationFrame(f); }; raf = requestAnimationFrame(f);
        });
        IL.leave('hacat', () => cancelAnimationFrame(raf));
    })();

    // ---------- ezber: veri bölme ve başarı çubukları ----------
    IL.enter('ezber', s => {
        s.querySelectorAll('#split div, .bars2 .b').forEach(d => { d.style.transition = 'none'; d.style.width = '0'; });
        setTimeout(() => s.querySelectorAll('#split div, .bars2 .b').forEach(d => { d.style.transition = ''; d.style.width = d.dataset.w + '%'; }), 120);
    });

    // ---------- yaşam döngüsü ----------
    (function cycle() {
        const host = $('cyc'), W = 560, H = 520, cx = W / 2, cy = H / 2, rx = 205, ry = 195;
        const N = [['1 · Problemi tanımla', 'Klinik soru, hedef kullanıcı, başarı ölçütü', 's', 'Sağlıkçı önde'], ['2 · Veriyi topla', 'Etik kurul onayı, KVKK uyumu, veri kalitesi', 'b', 'Birlikte'],
            ['3 · Veriyi hazırla', 'Temizleme, eksik değerler, etiketleme', 'b', 'Birlikte'], ['4 · Modelle', 'Algoritma seçimi, eğitim, iyileştirme', 'm', 'Mühendis önde'],
            ['5 · Doğrula', 'Ayrı test verisi, başka merkezin verisi, klinik çalışma', 'b', 'Birlikte'], ['6 · Kullan ve izle', 'İş akışına uyum, performans takibi, güncelleme', 'b', 'Birlikte']];
        const svg = svgEl('svg', { width: W, height: H, viewBox: `0 0 ${W} ${H}`, style: 'position:absolute; inset:0' }); host.appendChild(svg);
        svgEl('ellipse', { cx, cy, rx, ry, fill: 'none', stroke: '#c9d6e2', 'stroke-width': 6, 'stroke-dasharray': '14 10' }, svg);
        const dot = svgEl('circle', { r: 11, fill: '#cd061e' }, svg);
        const ns = N.map((n, i) => {
            const a = -Math.PI / 2 + i * Math.PI / 3, d = document.createElement('div'); d.className = 'node';
            d.style.left = (cx + rx * Math.cos(a)) + 'px'; d.style.top = (cy + ry * Math.sin(a)) + 'px'; d.style.borderTopColor = n[2] === 's' ? '#cd061e' : n[2] === 'm' ? '#00426a' : '#0f9d58';
            d.innerHTML = `<b>${n[0]}</b><span>${n[1]}</span><em class="who-${n[2]}">${n[3]}</em>`; host.appendChild(d); return d;
        });
        const mid = document.createElement('div'); mid.style.cssText = 'position:absolute; left:50%; top:50%; transform:translate(-50%,-50%); font-family:var(--head); font-weight:900; font-size:30px; color:var(--navy); text-align:center';
        mid.innerHTML = '🔁<br>YZ<br>projesi'; host.appendChild(mid);
        let last = -1;
        IL.loop('dongu', t => {
            const f = (t / 1500) % 6, k = Math.floor(f), a = -Math.PI / 2 + f * Math.PI / 3;
            dot.setAttribute('cx', cx + rx * Math.cos(a)); dot.setAttribute('cy', cy + ry * Math.sin(a));
            if (k !== last) { last = k; ns.forEach((n, i) => n.classList.toggle('lit', i === k)); S.blip(440 + k * 70); }
        });
    })();

    // ---------- dengesiz veri: 100 kişi, 1 hasta ----------
    (function waffle() {
        const w = $('waf1');
        for (let i = 0; i < 100; i++) { const d = document.createElement('i'); if (i === 57) d.className = 's'; d.style.transitionDelay = (i * 8) + 'ms'; w.appendChild(d); }
        IL.enter('dengesiz', () => { w.classList.remove('on', 'judge'); setTimeout(() => w.classList.add('on'), 150); });
        IL.dengesizJudge = () => { w.classList.add('judge'); };
    })();

    // ---------- eşik: iki dağılım, kaçan hasta ve yanlış alarm ----------
    (function threshold() {
        const svg = $('thr-svg'), W = 680, H = 330, X0 = 30, X1 = 650, Y0 = 280, sd = 0.12, mh = 0.36, ms = 0.66;
        const pdf = (x, m) => Math.exp(-((x - m) ** 2) / (2 * sd * sd));
        const X = u => X0 + u * (X1 - X0), Y = v => Y0 - v * 220;
        const erf = z => { const t = 1 / (1 + 0.3275911 * Math.abs(z)), y = 1 - (((((1.061405429 * t - 1.453152027) * t) + 1.421413741) * t - 0.284496736) * t + 0.254829592) * t * Math.exp(-z * z); return z >= 0 ? y : -y; };
        const cdf = (x, m) => 0.5 * (1 + erf((x - m) / (sd * Math.SQRT2)));
        const path = (m, a, b) => { let d = `M${X(a)} ${Y0}`; for (let u = a; u <= b + 1e-9; u += 0.005) d += ` L${X(u)} ${Y(pdf(u, m))}`; return d + ` L${X(b)} ${Y0} Z`; };
        const line = m => { let d = ''; for (let u = 0; u <= 1.0001; u += 0.005) d += (u ? ' L' : 'M') + X(u) + ' ' + Y(pdf(u, m)); return d; };
        svgEl('line', { x1: X0, y1: Y0, x2: X1, y2: Y0, stroke: '#9fb3c4', 'stroke-width': 2 }, svg);
        const fn = svgEl('path', { fill: 'rgba(245,158,11,0.45)' }, svg), fp = svgEl('path', { fill: 'rgba(13,148,136,0.38)' }, svg);
        svgEl('path', { d: line(mh), fill: 'none', stroke: '#0d9488', 'stroke-width': 4 }, svg);
        svgEl('path', { d: line(ms), fill: 'none', stroke: '#f59e0b', 'stroke-width': 4 }, svg);
        const t1 = svgEl('text', { x: X(mh), y: Y(1) - 10, 'text-anchor': 'middle', 'font-family': 'Outfit', 'font-weight': 800, 'font-size': 20, fill: '#0b7a70' }, svg); t1.textContent = 'Sağlam';
        const t2 = svgEl('text', { x: X(ms), y: Y(1) - 10, 'text-anchor': 'middle', 'font-family': 'Outfit', 'font-weight': 800, 'font-size': 20, fill: '#b45309' }, svg); t2.textContent = 'Hasta';
        const th = svgEl('line', { y1: 26, y2: Y0 + 6, stroke: '#00426a', 'stroke-width': 3, 'stroke-dasharray': '8 6' }, svg);
        const thl = svgEl('text', { y: 20, 'text-anchor': 'middle', 'font-family': 'JetBrains Mono', 'font-weight': 800, 'font-size': 15, fill: '#00426a' }, svg); thl.textContent = 'eşik';
        const ax = svgEl('text', { x: X1, y: Y0 + 34, 'text-anchor': 'end', 'font-family': 'Inter', 'font-size': 14, fill: '#6d6e71' }, svg); ax.textContent = 'modelin verdiği risk puanı →';
        const lfn = svgEl('text', { 'font-family': 'Inter', 'font-weight': 700, 'font-size': 14, fill: '#b45309', 'text-anchor': 'end' }, svg);
        const lfp = svgEl('text', { 'font-family': 'Inter', 'font-weight': 700, 'font-size': 14, fill: '#0b7a70' }, svg);
        const r = $('thr'); let was = null;
        function upd() {
            const t = +r.value / 100; $('thrv').textContent = t.toFixed(2).replace('.', ',');
            fn.setAttribute('d', path(ms, 0, t)); fp.setAttribute('d', path(mh, t, 1));
            th.setAttribute('x1', X(t)); th.setAttribute('x2', X(t)); thl.setAttribute('x', X(t));
            lfn.setAttribute('x', X(t) - 8); lfn.setAttribute('y', Y0 - 12); lfn.textContent = 'kaçan hasta';
            lfp.setAttribute('x', X(t) + 8); lfp.setAttribute('y', Y0 - 12); lfp.textContent = 'yanlış alarm';
            const sens = 1 - cdf(t, ms), spec = cdf(t, mh);
            $('thr-sens').textContent = '%' + Math.round(sens * 100); $('thr-spec').textContent = '%' + Math.round(spec * 100);
        }
        r.addEventListener('input', () => { upd(); S.tick(); });
        document.querySelectorAll('[data-th]').forEach(b => b.addEventListener('click', async () => {
            const to = +b.dataset.th, fr = +r.value; for (let i = 1; i <= 16; i++) { r.value = fr + (to - fr) * i / 16; upd(); await IL.sleep(25); } S.ding(); void was;
        }));
        IL.enter('esik', () => { r.value = 50; upd(); });
    })();

    IL.start({ foot: 'TÜBİTAK 2237-A desteğiyle düzenlenmektedir · 24–25 Ekim 2026' });
})();
