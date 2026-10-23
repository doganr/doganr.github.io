/* Canlı Modellerden Koda · etkileşimli parçalar */
(function () {
    const $ = id => document.getElementById(id);
    const S = IL.sfx, NS = 'http://www.w3.org/2000/svg';
    const svgEl = (t, a, p) => { const e = document.createElementNS(NS, t); for (const k in a) e.setAttribute(k, a[k]); if (p) p.appendChild(e); return e; };
    const lerp = (a, b, t) => a + (b - a) * t;
    const mix = (c1, c2, t) => c1.map((v, i) => Math.round(lerp(v, c2[i], t)));
    const rgb = c => `rgb(${c[0]},${c[1]},${c[2]})`;
    // temsili model grubu (tedavisiz) skor seyri, gün 1..11
    const CURVE = { e: [0, 0.4, 0.9, 1.2, 1.5, 1.7, 1.9, 2, 2, 2, 2], t: [0, 0.2, 0.5, 0.9, 1.2, 1.5, 1.7, 1.9, 2, 2, 2], s: [0, 0, 0.3, 0.7, 1, 1.3, 1.6, 1.8, 1.9, 2, 2] };
    const sevAt = d => { const i = Math.max(0, Math.min(9.999, d - 1)), k = Math.floor(i), f = i - k; return { e: lerp(CURVE.e[k], CURVE.e[k + 1], f), t: lerp(CURVE.t[k], CURVE.t[k + 1], f), s: lerp(CURVE.s[k], CURVE.s[k + 1], f) }; };

    // ---------- tepeden görünen fare (temsili çizim) ----------
    function drawMouse(x, cx, cy, sc, ang, sev) {
        let seed = 11; const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
        x.save(); x.translate(cx, cy); x.rotate(ang); x.scale(sc, sc);
        // kuyruk
        x.strokeStyle = '#e9b6b9'; x.lineCap = 'round';
        for (let k = 0; k < 6; k++) { x.lineWidth = 14 - k * 2; x.beginPath(); x.moveTo(-150, 0); x.bezierCurveTo(-230, 40 + k, -290, -60, -360 + k * 6, -20); x.globalAlpha = 0.3 + k * 0.12; x.stroke(); }
        x.globalAlpha = 1;
        // pençeler
        x.fillStyle = '#f1bfc3';
        [[95, 78], [95, -78], [-90, 84], [-90, -84]].forEach(p => { x.beginPath(); x.ellipse(p[0], p[1], 18, 11, 0.4, 0, 6.283); x.fill(); });
        // gövde
        const g = x.createRadialGradient(-10, -20, 20, 0, 0, 170); g.addColorStop(0, '#ffffff'); g.addColorStop(1, '#ddd8d3');
        x.fillStyle = g; x.beginPath(); x.ellipse(0, 0, 165, 100, 0, 0, 6.283); x.fill();
        x.strokeStyle = 'rgba(160,150,140,0.35)'; x.lineWidth = 1.5;
        for (let i = 0; i < 160; i++) { const a = rnd() * 6.283, r = Math.sqrt(rnd()), px = Math.cos(a) * r * 155, py = Math.sin(a) * r * 92; x.beginPath(); x.moveTo(px, py); x.lineTo(px - 8, py + (rnd() - 0.5) * 4); x.stroke(); }
        // baş
        x.fillStyle = '#f4f1ee'; x.beginPath(); x.ellipse(175, 0, 72, 58, 0, 0, 6.283); x.fill();
        x.beginPath(); x.ellipse(232, 0, 34, 24, 0, 0, 6.283); x.fill();
        [[150, -52], [150, 52]].forEach(p => { x.fillStyle = '#efe9e4'; x.beginPath(); x.arc(p[0], p[1], 32, 0, 6.283); x.fill(); x.fillStyle = '#f2b8bd'; x.beginPath(); x.arc(p[0] + 2, p[1], 21, 0, 6.283); x.fill(); });
        x.fillStyle = '#b3243a'; [[200, -26], [200, 26]].forEach(p => { x.beginPath(); x.arc(p[0], p[1], 7, 0, 6.283); x.fill(); });
        x.fillStyle = '#f0a3ab'; x.beginPath(); x.arc(264, 0, 8, 0, 6.283); x.fill();
        x.strokeStyle = 'rgba(120,110,100,0.5)'; x.lineWidth = 1.2;
        [-1, 1].forEach(sg => { for (let k = 0; k < 3; k++) { x.beginPath(); x.moveTo(250, sg * 10); x.quadraticCurveTo(285, sg * (16 + k * 9), 320, sg * (8 + k * 18)); x.stroke(); } });
        // tıraşlı sırt bölgesi
        const base = mix(mix([239, 201, 192], [225, 150, 146], Math.min(1, sev.e)), [196, 82, 92], Math.max(0, sev.e - 1));
        const pg = x.createRadialGradient(-10, 0, 10, -10, 0, 120);
        pg.addColorStop(0, rgb(mix(base, [255, 235, 230], 0.25))); pg.addColorStop(1, rgb(mix(base, [150, 60, 70], 0.15)));
        x.fillStyle = pg; x.beginPath(); x.ellipse(-10, 0, 112, 70, 0, 0, 6.283); x.fill();
        x.strokeStyle = 'rgba(170,160,150,0.5)'; x.lineWidth = 3; x.setLineDash([2, 5]); x.stroke(); x.setLineDash([]);
        // kalınlaşma: enine kıvrımlar
        x.save(); x.beginPath(); x.ellipse(-10, 0, 110, 68, 0, 0, 6.283); x.clip();
        const nw = Math.round(sev.t * 7);
        x.strokeStyle = rgb(mix(base, [90, 30, 40], 0.45)); x.globalAlpha = 0.18 + sev.t * 0.17; x.lineWidth = 2 + sev.t * 1.5;
        for (let k = 0; k < nw; k++) { const px = -110 + (k + 0.5) * 220 / nw; x.beginPath(); x.moveTo(px, -70); x.bezierCurveTo(px + 14, -25, px - 14, 25, px + 4, 70); x.stroke(); }
        // pullanma: beyaz pullar
        x.globalAlpha = 0.92; x.fillStyle = '#fbfaf6';
        const nf = Math.round(sev.s * 46);
        for (let k = 0; k < nf; k++) {
            const a = rnd() * 6.283, r = Math.sqrt(rnd()), px = -10 + Math.cos(a) * r * 100, py = Math.sin(a) * r * 60, s = 3 + rnd() * 6;
            x.beginPath(); x.moveTo(px - s, py); x.lineTo(px, py - s * 0.6); x.lineTo(px + s, py + s * 0.2); x.lineTo(px - s * 0.2, py + s * 0.7); x.closePath(); x.fill();
        }
        x.restore(); x.restore();
    }

    // =============== KAPAK: vizörde fare ===============
    (function cover() {
        const cv = $('cover-cv'), x = cv.getContext('2d'), Z = 1040, oc = document.createElement('canvas'); oc.width = oc.height = Z; const ox = oc.getContext('2d');
        const CAMS = [['CAM1 · Sony α6500', 'sepia(0.18) saturate(1.15) brightness(0.98)'], ['CAM2 · Xiaomi 12 Lite', 'brightness(1.07) saturate(0.9) hue-rotate(-8deg)'], ['CAM3 · iPhone 15 Pro', 'none']];
        let lastShot = -1e9, shot = 0;
        IL.loop('cover', t => {
            const P = 1700, k = Math.floor(t / P), day = (Math.floor(k / 3) % 11) + 1, cam = k % 3;
            if (k !== shot) { shot = k; lastShot = t; }
            const sev = sevAt(day);
            ox.clearRect(0, 0, Z, Z);
            const bg = ox.createLinearGradient(0, 0, Z, Z); bg.addColorStop(0, '#f2ece4'); bg.addColorStop(1, '#d9cfc4'); ox.fillStyle = bg; ox.fillRect(0, 0, Z, Z);
            ox.strokeStyle = 'rgba(150,135,120,0.18)'; ox.lineWidth = 2; for (let i = -Z; i < Z; i += 46) { ox.beginPath(); ox.moveTo(i, 0); ox.lineTo(i + Z, Z); ox.stroke(); }
            drawMouse(ox, 540 + Math.sin(t / 1800) * 10, 560 + Math.cos(t / 2300) * 8, 1.3, -0.42 + Math.sin(t / 3000) * 0.04, sev);
            x.clearRect(0, 0, Z, Z);
            x.save(); x.beginPath(); x.roundRect(20, 20, Z - 40, Z - 40, 46); x.clip();
            x.filter = CAMS[cam][1]; x.drawImage(oc, 0, 0); x.filter = 'none';
            // vizör
            x.strokeStyle = 'rgba(255,255,255,0.9)'; x.lineWidth = 7;
            [[70, 70, 1, 1], [Z - 70, 70, -1, 1], [70, Z - 70, 1, -1], [Z - 70, Z - 70, -1, -1]].forEach(([a, b, sx, sy]) => { x.beginPath(); x.moveTo(a, b + sy * 80); x.lineTo(a, b); x.lineTo(a + sx * 80, b); x.stroke(); });
            x.strokeStyle = 'rgba(255,212,0,0.95)'; x.lineWidth = 4; x.strokeRect(330, 420, 380, 300);
            x.fillStyle = 'rgba(0,26,44,0.72)'; x.beginPath(); x.roundRect(60, Z - 150, 600, 80, 18); x.fill();
            x.fillStyle = '#fff'; x.font = '800 34px "JetBrains Mono", monospace';
            x.fillText(`Gün ${String(day).padStart(2, '0')} · ${CAMS[cam][0].split(' · ')[0]}`, 86, Z - 98);
            x.fillStyle = '#ff5a6e'; x.font = '800 30px "JetBrains Mono", monospace';
            x.fillText(`E${Math.round(sev.e)} T${Math.round(sev.t)} S${Math.round(sev.s)}`, 470, Z - 98);
            x.fillStyle = 'rgba(0,26,44,0.72)'; x.beginPath(); x.roundRect(Z - 160, 74, 110, 56, 14); x.fill(); x.beginPath(); x.roundRect(60, 74, 420, 56, 14); x.fill();
            x.fillStyle = (t / 600) % 2 < 1 ? '#ef233c' : 'rgba(239,35,60,0.25)'; x.beginPath(); x.arc(Z - 132, 102, 13, 0, 6.283); x.fill();
            x.fillStyle = '#fff'; x.font = '700 28px "JetBrains Mono", monospace'; x.fillText('REC', Z - 112, 112);
            x.fillStyle = '#fff'; x.font = '700 28px Inter, sans-serif'; x.fillText('📷 ' + CAMS[cam][0], 80, 112);
            // flaş
            const fl = 1 - (t - lastShot) / 380; if (fl > 0) { x.fillStyle = `rgba(255,255,255,${(fl * 0.75).toFixed(3)})`; x.fillRect(0, 0, Z, Z); }
            x.restore();
            x.strokeStyle = 'rgba(255,255,255,0.35)'; x.lineWidth = 6; x.beginPath(); x.roundRect(20, 20, Z - 40, Z - 40, 46); x.stroke();
        });
    })();

    // =============== DERİ KESİTİ ===============
    (function skin() {
        const host = $('skin');
        const mk = id => { const s = svgEl('svg', { id, width: 640, height: 400, viewBox: '0 0 640 400' }); host.appendChild(s); return s; };
        const n = mk('skin-n'), p = mk('skin-ps');
        const path = (pts, close) => 'M' + pts.map(q => q[0].toFixed(1) + ' ' + q[1].toFixed(1)).join(' L') + (close ? ' Z' : '');
        const band = (fTop, fBot) => { const top = [], bot = []; for (let xx = 0; xx <= 640; xx += 4) { top.push([xx, fTop(xx)]); bot.push([xx, fBot(xx)]); } return path(top.concat(bot.reverse()), true); };
        const lbl = (s, x0, y0, t, c, anchor) => { const e = svgEl('text', { x: x0, y: y0, fill: c || '#00426a', stroke: '#fff', 'stroke-width': 5, 'paint-order': 'stroke', 'font-family': 'Inter, sans-serif', 'font-weight': 700, 'font-size': 17, 'text-anchor': anchor || 'start' }, s); e.textContent = t; return e; };
        const lead = (s, x1, y1, x2, y2) => svgEl('line', { x1, y1, x2, y2, stroke: '#00426a', 'stroke-width': 1.5, 'stroke-dasharray': '4 3' }, s);
        // normal
        svgEl('rect', { x: 0, y: 0, width: 640, height: 400, rx: 16, fill: '#eaf2f8' }, n);
        svgEl('path', { d: band(() => 150, () => 400), fill: '#f7dcd3' }, n);
        svgEl('path', { d: band(xx => 70 + 2 * Math.sin(xx / 30), xx => 150 + 12 * Math.sin(xx / 34)), fill: '#e9b7a4' }, n);
        svgEl('path', { d: band(xx => 60 + 2 * Math.sin(xx / 30), xx => 71 + 2 * Math.sin(xx / 30)), fill: '#f2e4d4' }, n);
        for (let k = 0; k < 7; k++) { const cx = 50 + k * 90; svgEl('path', { d: `M${cx - 10} 300 C ${cx - 10} 190, ${cx + 10} 190, ${cx + 10} 300`, stroke: '#d9534f', 'stroke-width': 3, fill: 'none', opacity: 0.7 }, n); }
        lbl(n, 18, 48, 'normal deri', '#0f9d58'); lbl(n, 622, 112, 'epidermis', '#7a4a3a', 'end'); lbl(n, 622, 360, 'dermis', '#7a4a3a', 'end');
        // sedef
        svgEl('rect', { x: 0, y: 0, width: 640, height: 400, rx: 16, fill: '#eaf2f8' }, p);
        svgEl('path', { d: band(() => 215, () => 400), fill: '#f4c6bf' }, p);
        const ridge = xx => 215 + 85 * Math.pow(Math.max(0, Math.sin(xx / 30)), 2.2);
        svgEl('path', { d: band(xx => 66 + 6 * Math.sin(xx / 21), ridge), fill: '#e39f8f' }, p);
        for (let k = 0; k < 10; k++) { const cx = 30 + k * 94.2 / 1.0 * 0.66; svgEl('path', { d: `M${cx - 9} 390 C ${cx - 22} 200, ${cx + 22} 200, ${cx + 9} 390`, stroke: '#c81e2c', 'stroke-width': 6, fill: 'none', opacity: 0.85 }, p); }
        for (let k = 0; k < 26; k++) svgEl('circle', { cx: 20 + (k * 97) % 600, cy: 250 + (k * 53) % 130, r: 4, fill: '#7c3aed', opacity: 0.6 }, p);
        svgEl('path', { d: band(xx => 30 + 8 * Math.sin(xx / 15) + 5 * Math.sin(xx / 7), xx => 68 + 6 * Math.sin(xx / 21)), fill: '#f6f2ea', stroke: '#d8d0c4', 'stroke-width': 1.5 }, p);
        for (let k = 0; k < 14; k++) {
            const fx = 20 + k * 44, fy = 30 + (k % 3) * 6, g = svgEl('g', { class: 'flake', style: `animation-delay:${(k * 0.27) % 3.5}s; transform-box: fill-box; transform-origin: center` }, p);
            svgEl('path', { d: `M${fx} ${fy} l14 -6 l10 8 l-12 7 z`, fill: '#fff', stroke: '#cfc6b8', 'stroke-width': 1 }, g);
        }
        svgEl('rect', { x: 0, y: 0, width: 640, height: 400, rx: 16, fill: 'rgba(205,6,30,0.07)' }, p);
        lbl(p, 18, 22, 'sedef plağı', '#cd061e');
        lbl(p, 360, 22, 'S · pullar', '#00426a'); lead(p, 400, 28, 420, 44);
        lbl(p, 470, 150, 'T · kalın epidermis', '#a35f00'); lead(p, 520, 156, 520, 200);
        lbl(p, 630, 352, 'E · genişlemiş damarlar', '#cd061e', 'end'); lead(p, 440, 346, 420, 320);
        const set = ps => { host.classList.toggle('ps', ps); $('skin-nb').classList.toggle('on', !ps); $('skin-pb').classList.toggle('go', ps); S.whoosh(); if (ps) S.swell(); };
        $('skin-nb').onclick = () => set(false); $('skin-pb').onclick = () => set(true);
        IL.enter('psor', () => { host.classList.remove('ps'); $('skin-nb').classList.add('on'); $('skin-pb').classList.remove('go'); });
    })();

    // =============== PASI HESAPLAYICI ===============
    IL.$s('pasi').id = 'pasi';   // kaydırıcılar bu bölüm içinde aranıyor
    (function pasi() {
        const svg = $('body'), R = { h: 'Baş', u: 'Kollar', t: 'Gövde', l: 'Bacaklar' }, Wt = { h: 0.1, u: 0.2, t: 0.3, l: 0.4 };
        const AREA = ['%0', '%1–9', '%10–29', '%30–49', '%50–69', '%70–89', '%90–100'];
        const V = { h: { e: 0, t: 0, s: 0, a: 0 }, u: { e: 0, t: 0, s: 0, a: 0 }, t: { e: 0, t: 0, s: 0, a: 0 }, l: { e: 0, t: 0, s: 0, a: 0 } };
        let cur = 't';
        const shapes = {
            h: [['circle', { cx: 125, cy: 52, r: 40 }]],
            u: [['rect', { x: 34, y: 104, width: 40, height: 170, rx: 18 }], ['rect', { x: 176, y: 104, width: 40, height: 170, rx: 18 }]],
            t: [['rect', { x: 80, y: 98, width: 90, height: 170, rx: 22 }]],
            l: [['rect', { x: 82, y: 272, width: 40, height: 190, rx: 18 }], ['rect', { x: 128, y: 272, width: 40, height: 190, rx: 18 }]],
        };
        const els = {};
        for (const k in shapes) els[k] = shapes[k].map(([t, a]) => { const e = svgEl(t, Object.assign({ class: 'rg', fill: '#e9eef3' }, a), svg); e.addEventListener('click', () => { cur = k; S.click(); sync(); }); return e; });
        const score = k => (V[k].e + V[k].t + V[k].s) * V[k].a;
        function sync() {
            $('pasi-rg').textContent = R[cur]; $('pasi-w').textContent = 'ağırlık ' + String(Wt[cur]).replace('.', ',');
            document.querySelectorAll('#pasi input[data-k]').forEach(i => { i.value = V[cur][i.dataset.k]; });
            for (const k in els) els[k].forEach(e => { e.classList.toggle('sel', k === cur); const f = score(k) / 72; e.setAttribute('fill', rgb(mix([233, 238, 243], [205, 6, 30], Math.min(1, f * 1.4)))); });
            ['e', 't', 's'].forEach(k => { document.querySelector(`#pasi [data-v="${k}"]`).textContent = V[cur][k]; });
            document.querySelector('#pasi [data-v="a"]').textContent = AREA[V[cur].a];
            const P = Object.keys(V).reduce((s, k) => s + Wt[k] * score(k), 0);
            $('pasi-v').textContent = IL.fmt(P, 1); $('pasi-bar').style.width = (P / 72 * 100) + '%';
            $('pasi-msg').innerHTML = P === 0 ? 'Temiz deri. Bir bölge seçip kaydırın.' : P <= 10 ? '<b>Hafif</b> (PASI ≤ 10)' : P <= 20 ? '<b>Orta–şiddetli</b> (PASI &gt; 10)' : '<b>Şiddetli</b>: sistemik tedavi gündemde olabilir';
            $('pasi-f').innerHTML = Object.keys(V).map(k => `${String(Wt[k]).replace('.', ',')}·(${V[k].e}+${V[k].t}+${V[k].s})·${V[k].a}`).join(' + ') + ` = <b>${IL.fmt(P, 1)}</b>`;
        }
        document.querySelectorAll('#pasi input[data-k]').forEach(i => i.addEventListener('input', () => { V[cur][i.dataset.k] = +i.value; S.tick(); sync(); }));
        const PRE = [
            { h: [0, 0, 0, 0], u: [0, 0, 0, 0], t: [0, 0, 0, 0], l: [0, 0, 0, 0] },
            { h: [0, 0, 0, 0], u: [1, 1, 1, 1], t: [1, 1, 1, 1], l: [1, 1, 1, 1] },
            { h: [1, 1, 1, 1], u: [2, 2, 2, 2], t: [2, 2, 2, 3], l: [2, 2, 1, 3] },
            { h: [2, 2, 2, 2], u: [3, 3, 3, 4], t: [3, 4, 3, 5], l: [3, 3, 3, 4] },
        ];
        document.querySelectorAll('#pasi [data-pr]').forEach(b => b.addEventListener('click', () => {
            const pr = PRE[+b.dataset.pr]; for (const k in pr) { const [e, t, s, a] = pr[k]; V[k] = { e, t, s, a }; } S.pop(); sync();
        }));
        IL.enter('pasi', sync);
    })();

    // =============== SKORU SEN VER ===============
    (function game() {
        const R = [['r1c2', [0, 0, 0]], ['r2c4', [2, 2, 1]], ['r3c1', [1, 0, 0]], ['r1c1', [1, 0, 1]], ['r2c5', [1, 2, 1]], ['r3c5', [1, 1, 1]]];   // örnek ızgaradaki diğer 9 kare skor tablosunda
        let r = 0, total = 0, shown = false;
        const rows = [...document.querySelectorAll('.sg-row')], img = $('sg-img');
        rows.forEach(row => row.querySelectorAll('.btn').forEach((b, k) => b.addEventListener('click', () => {
            if (shown) return; row.querySelectorAll('.btn').forEach(z => z.classList.toggle('on', z === b)); S.click(); row.dataset.v = k;
        })));
        function load() {
            shown = false; img.style.opacity = 0;
            setTimeout(() => { img.src = `../assets/img/pasi_${R[r][0]}.jpg`; img.style.opacity = 1; }, 250);
            rows.forEach(row => { delete row.dataset.v; row.querySelectorAll('.btn').forEach(z => z.classList.remove('on', 'exp', 'wrong', 'right')); });
            $('sg-round').textContent = `${r + 1} / ${R.length}`; $('sg-msg').innerHTML = '<p>Her satırdan bir skor seçin.</p>';
        }
        $('sg-show').onclick = () => {
            if (shown) return; shown = true; let ok = 0;
            rows.forEach((row, i) => {
                const ex = R[r][1][i], bt = row.querySelectorAll('.btn'); bt[ex].classList.add('exp');
                if (row.dataset.v !== undefined) { const v = +row.dataset.v; if (v === ex) { bt[v].classList.add('right'); ok++; } else bt[v].classList.add('wrong'); }
            });
            total += ok; $('sg-score').textContent = total;
            const [e, t, s] = R[r][1];
            if (ok === 3) { S.fanfare(); $('sg-msg').innerHTML = `<p>🎉 <b>3/3!</b> Uzman: E${e} T${t} S${s}</p>`; }
            else { (ok ? S.ding : S.buzz)(); $('sg-msg').innerHTML = `<p><b>${ok}/3</b> · Uzman: <b>E${e} T${t} S${s}</b></p>`; }
            if (r === R.length - 1) setTimeout(() => {
                $('sg-msg').innerHTML = `<p>Toplam <b>${total} / 18</b>. Sınırdaki vakalarda (“1 mi 2 mi?”) uzmanlar arasında da ayrışma olur → <b>skorlama rehberi, kör skorlama, iki skorlayıcı.</b></p>`;
                if (total >= 12) IL.confetti();
            }, 1400);
        };
        $('sg-next').onclick = () => { if (r < R.length - 1) { r++; load(); S.whoosh(); } };
        IL.enter('game', () => { r = 0; total = 0; $('sg-score').textContent = 0; load(); });
    })();

    // =============== 11 GÜNLÜK ZAMAN ÇİZELGESİ ===============
    (function timeline() {
        const A = $('tl-a').getContext('2d'), B = $('tl-b').getContext('2d'), tl = $('tl');
        const pg = document.createElement('div'); pg.className = 'pg'; tl.innerHTML = '<div class="ln"></div>'; tl.appendChild(pg);
        const dots = [];
        for (let d = 1; d <= 11; d++) {
            const L = ((d - 1) / 10 * 100) + '%', dt = document.createElement('div'); dt.className = 'dt'; dt.style.left = L; tl.appendChild(dt); dots.push(dt);
            const dl = document.createElement('div'); dl.className = 'dl'; dl.style.left = L; dl.textContent = String(12 + d).padStart(2, '0') + '.05'; tl.appendChild(dl);
        }
        const scene = (x, sev) => { x.clearRect(0, 0, 560, 440); const g = x.createLinearGradient(0, 0, 560, 440); g.addColorStop(0, '#f2ece4'); g.addColorStop(1, '#dcd2c7'); x.fillStyle = g; x.beginPath(); x.roundRect(0, 0, 560, 440, 26); x.fill(); drawMouse(x, 250, 230, 0.95, -0.3, sev); };
        let day = 1, raf = 0, lastDay = 0;
        function show(d) {
            day = d; const sv = sevAt(d), di = Math.floor(d);
            scene(A, { e: 0, t: 0, s: 0 }); scene(B, sv);
            $('tl-day').textContent = 'Gün ' + di; $('tl-date').textContent = String(12 + di).padStart(2, '0') + '.05.2025';
            $('tl-ets').innerHTML = `model: <b>E${Math.round(sv.e)} · T${Math.round(sv.t)} · S${Math.round(sv.s)}</b> · kontrol: E0 · T0 · S0`;
            pg.style.width = ((d - 1) / 10 * 100) + '%'; dots.forEach((dt, i) => dt.classList.toggle('on', i + 1 <= di));
            if (di !== lastDay) { lastDay = di; S.shutter(); }
        }
        function play() {
            cancelAnimationFrame(raf); const t0 = performance.now(); lastDay = 0;
            const f = t => { const d = 1 + Math.min(10, (t - t0) / 800); show(d); if (d < 11) raf = requestAnimationFrame(f); else S.chime(); };
            raf = requestAnimationFrame(f);
        }
        $('tl-play').onclick = play;
        IL.enter('model', () => { lastDay = 1; show(1); setTimeout(play, 700); });
        IL.leave('model', () => cancelAnimationFrame(raf));
    })();

    // =============== GRUPLAR ===============
    const GROUPS = [
        ['HC-N', 'Sağlıklı kontrol', 'Normal deri neye benzer?', '#3a7a55', 6, 3126],
        ['HC-TCH', 'Sağlıklı + test bileşiği (yüksek)', 'Bileşik tek başına ne yapar?', '#84a872', 6, 3854],
        ['PM-U', 'Sedef modeli, tedavisiz', 'Hastalık kendi seyrinde', '#b5504c', 6, 3682],
        ['PM-TCL', 'Model + bileşik (düşük doz)', 'Doz arttıkça etki artıyor mu?', '#8fb3d3', 6, 3694],
        ['PM-TCM', 'Model + bileşik (orta doz)', '', '#6a8daa', 6, 3102],
        ['PM-TCH', 'Model + bileşik (yüksek doz)', '', '#29455e', 7, 4175],
        ['PM-SR', 'Model + standart referans', 'Bilinen tedaviyle kıyas', '#7b5b8a', 6, 3133],
    ];
    (function groups() {
        const host = $('grp'), W = 1168, CW = W / 7, toks = []; let sid = 1;
        GROUPS.forEach((g, gi) => {
            const col = document.createElement('div'); col.className = 'gcol'; col.style.left = (gi * CW) + 'px'; col.style.width = CW - 8 + 'px';
            col.innerHTML = `<h4 style="color:${g[3]}">${g[0]}</h4><p>${g[1]}</p><p style="font-style:italic; color:#6d6e71">${g[2] || '&nbsp;'}</p>`;
            host.appendChild(col);
            for (let k = 0; k < g[4]; k++) {
                const t = document.createElement('div'); t.className = 'tok'; t.style.background = g[3];
                t.innerHTML = `<i></i><b>S${String(sid++).padStart(2, '0')}</b>`; host.appendChild(t);
                toks.push({ el: t, x: gi * CW + 22 + (k % 3) * 42, y: 120 + Math.floor(k / 3) * 42 });
            }
            const bar = document.createElement('div'); bar.style.cssText = `position:absolute; left:${gi * CW + 22}px; width:${CW - 52}px; bottom:28px; height:0; background:${g[3]}; border-radius:8px 8px 0 0; transition:height 1.2s cubic-bezier(.2,.8,.2,1) ${0.8 + gi * 0.08}s`;
            bar.dataset.h = Math.round(g[5] / 4175 * 150); bar.className = 'gbar'; host.appendChild(bar);
            const lb = document.createElement('div'); lb.style.cssText = `position:absolute; left:${gi * CW}px; width:${CW - 8}px; bottom:4px; text-align:center; font-family:var(--mono); font-size:14px; font-weight:800; color:${g[3]}`;
            lb.textContent = IL.fmt(g[5]) + ' görüntü'; host.appendChild(lb);
        });
        const scatter = () => toks.forEach(t => { t.el.style.transition = 'none'; t.el.style.transform = `translate(${Math.random() * (W - 40)}px, ${120 + Math.random() * 160}px) scale(0.6)`; t.el.style.opacity = 0; });
        scatter();
        IL.enter('groups', () => {
            scatter(); host.querySelectorAll('.gbar').forEach(b => { b.style.height = '0'; });
            setTimeout(() => {
                toks.forEach((t, i) => { t.el.style.transition = ''; t.el.style.transitionDelay = (i * 18) + 'ms'; t.el.style.transform = `translate(${t.x}px, ${t.y}px)`; t.el.style.opacity = 1; });
                host.querySelectorAll('.gbar').forEach(b => { b.style.height = b.dataset.h + 'px'; });
                S.whoosh(); [0, 300, 600].forEach(d => setTimeout(() => S.pop(), d));
            }, 250);
        });
    })();

    // =============== KAMERALAR ===============
    (function cams() {
        const F = $('frames'), C = [['CAM1 · Sony α6500', 1024, 684, '#6d7a86', 'sepia(0.2) saturate(1.2) brightness(0.97)'], ['CAM2 · Xiaomi 12 Lite', 1024, 576, '#c0844e', 'brightness(1.08) saturate(0.85) hue-rotate(-10deg)'], ['CAM3 · iPhone 15 Pro', 1024, 768, '#4f7699', 'none']];
        // aynı (temsili) fare, üç cihazın kendi en-boy oranı ve renk karakteriyle
        const fr = C.map(c => {
            const d = document.createElement('div'); d.className = 'camc';
            const cv = document.createElement('canvas'); cv.width = 312; cv.height = Math.round(312 * c[2] / c[1]);
            cv.style.borderColor = c[3]; cv.style.filter = c[4];
            const x = cv.getContext('2d'), g = x.createLinearGradient(0, 0, 312, cv.height); g.addColorStop(0, '#f2ece4'); g.addColorStop(1, '#dcd2c7');
            x.fillStyle = g; x.fillRect(0, 0, 312, cv.height); drawMouse(x, 140, cv.height / 2, 0.4, -0.25, sevAt(6));
            const b = document.createElement('b'); b.style.color = c[3]; b.innerHTML = `${c[0].replace(' · ', '<br>')}<br>${c[1]}×${c[2]}`;
            d.appendChild(cv); d.appendChild(b); F.appendChild(d); return d;
        });
        const svg = $('cam-bars'), V = [4935, 7795, 12036], bars = [];
        C.forEach((c, i) => {
            const y = 20 + i * 76;
            const t = svgEl('text', { x: 0, y: y + 30, 'font-family': 'Inter, sans-serif', 'font-weight': 700, 'font-size': 16, fill: c[3] }, svg); t.textContent = c[0].split(' · ')[1];
            const b = svgEl('rect', { x: 150, y: y + 6, width: V[i] / 12036 * 360, height: 40, rx: 8, fill: c[3], style: 'transform-box:fill-box; transform-origin:left; transform:scaleX(0); transition:transform 1.1s cubic-bezier(.2,.8,.2,1) ' + (0.2 + i * 0.15) + 's' }, svg);
            const v = svgEl('text', { x: 160 + V[i] / 12036 * 360, y: y + 33, 'font-family': 'JetBrains Mono, monospace', 'font-weight': 800, 'font-size': 18, fill: '#0d2233' }, svg); v.textContent = IL.fmt(V[i]);
            bars.push(b);
        });
        IL.enter('cams', () => {
            fr.forEach(d => d.classList.remove('on')); bars.forEach(b => { b.style.transform = 'scaleX(0)'; });
            fr.forEach((d, i) => setTimeout(() => { d.classList.add('on'); S.shutter(); }, 300 + i * 450));
            setTimeout(() => bars.forEach(b => { b.style.transform = 'scaleX(1)'; }), 200);
        });
    })();

    // =============== KAYIT: küçük fare fotoğrafı ===============
    IL.enter('record', () => {
        const x = $('rec-cv').getContext('2d'); x.clearRect(0, 0, 560, 440);
        const g = x.createLinearGradient(0, 0, 560, 440); g.addColorStop(0, '#f2ece4'); g.addColorStop(1, '#dcd2c7'); x.fillStyle = g; x.fillRect(0, 0, 560, 440);
        drawMouse(x, 250, 225, 0.95, -0.3, { e: 0, t: 0, s: 0 }); S.shutter();
    });

    // =============== SKOR DAĞILIMI ===============
    (function dist() {
        const svg = $('dist-svg'), D = [[8782, 9884, 8157], [12494, 10767, 11944], [3490, 4115, 4665]], C = ['#cd061e', '#d97706', '#00426a'], N = ['Eritem', 'Kalınlık', 'Pullanma'];
        const X0 = 70, Y0 = 360, H = 300, MAX = 13000, bars = [];
        for (let v = 0; v <= 12000; v += 4000) { const y = Y0 - v / MAX * H; svgEl('line', { x1: X0, x2: 740, y1: y, y2: y, stroke: '#dde5ec' }, svg); const t = svgEl('text', { x: X0 - 8, y: y + 5, 'text-anchor': 'end', 'font-family': 'JetBrains Mono, monospace', 'font-size': 13, fill: '#6d6e71' }, svg); t.textContent = IL.fmt(v); }
        ['0 · yok', '1 · hafif', '2 · şiddetli'].forEach((lbl, gi) => {
            const gx = X0 + 20 + gi * 225;
            const t = svgEl('text', { x: gx + 92, y: Y0 + 30, 'text-anchor': 'middle', 'font-family': 'Outfit, sans-serif', 'font-weight': 800, 'font-size': 20, fill: '#00426a' }, svg); t.textContent = lbl;
            D[gi].forEach((v, k) => {
                const h = v / MAX * H, x = gx + k * 62;
                bars.push(svgEl('rect', { x, y: Y0 - h, width: 56, height: h, rx: 6, fill: C[k], style: `transform-box:fill-box; transform-origin:bottom; transform:scaleY(0); transition:transform 1s cubic-bezier(.2,.8,.2,1) ${0.15 + (gi * 3 + k) * 0.07}s` }, svg));
                const tv = svgEl('text', { x: x + 28, y: Y0 - h - 8, 'text-anchor': 'middle', 'font-family': 'JetBrains Mono, monospace', 'font-weight': 800, 'font-size': 13, fill: '#0d2233' }, svg); tv.textContent = IL.fmt(v);
            });
        });
        N.forEach((n, k) => { svgEl('rect', { x: X0 + 30 + k * 140, y: 8, width: 18, height: 18, rx: 4, fill: C[k] }, svg); const t = svgEl('text', { x: X0 + 54 + k * 140, y: 23, 'font-family': 'Inter, sans-serif', 'font-weight': 700, 'font-size': 16, fill: '#0d2233' }, svg); t.textContent = n; });
        IL.enter('dist', () => { bars.forEach(b => { b.style.transform = 'scaleY(0)'; }); setTimeout(() => bars.forEach(b => { b.style.transform = 'scaleY(1)'; }), 150); });
    })();

    // =============== VERİ HATTI ===============
    IL.enter('pipeline', async () => {
        const ps = [...document.querySelectorAll('#pipe .ps')]; ps.forEach(p => p.classList.remove('lit'));
        for (let i = 0; i < ps.length; i++) { await IL.sleep(380); if (!IL.$s('pipeline').classList.contains('present')) return; ps[i].classList.add('lit'); S.blip(440 + i * 70); }
        S.chime();
    });

    // =============== SIZINTI ANİMASYONU ===============
    (function leak() {
        const host = $('leak'), NM = 10, NP = 4, cards = [];
        const W = host.clientWidth || 1168, trW = 0.64 * 1168, teX = 1168 - 0.33 * 1168;
        for (let m = 0; m < NM; m++) for (let p = 0; p < NP; p++) {
            const c = document.createElement('div'); c.className = 'card2'; c.textContent = '🐭';
            c.style.background = `hsl(${m * 36} 70% ${p % 2 ? 72 : 66}%)`; host.appendChild(c); cards.push({ el: c, m, test: false });
        }
        const place = () => {
            const tr = cards.filter(c => !c.test), te = cards.filter(c => c.test);
            const pos = (list, x0, cols) => list.forEach((c, i) => { c.el.style.transform = `translate(${x0 + 16 + (i % cols) * 58}px, ${92 + Math.floor(i / cols) * 50}px)`; });
            pos(tr.sort((a, b) => a.m - b.m), 0, 12); pos(te.sort((a, b) => a.m - b.m), teX, 6);
        };
        const mark = () => {
            const trM = new Set(cards.filter(c => !c.test).map(c => c.m)); let tw = 0, nt = 0;
            cards.forEach(c => { c.el.classList.remove('twin', 'clean'); });
            cards.filter(c => c.test).forEach(c => { nt++; if (trM.has(c.m)) { tw++; c.el.classList.add('twin'); cards.filter(o => !o.test && o.m === c.m).forEach(o => o.el.classList.add('twin')); } else c.el.classList.add('clean'); });
            return [tw, nt];
        };
        function reset() { cards.forEach(c => { c.test = false; c.el.classList.remove('twin', 'clean'); }); place(); $('lk-read').innerHTML = 'Her renk bir fare · her fareden 4 ardışık kare (neredeyse aynı)'; }
        $('lk-rand').onclick = () => {
            reset(); const idx = cards.map((_, i) => i).sort(() => Math.random() - 0.5).slice(0, 12); idx.forEach(i => { cards[i].test = true; });
            setTimeout(() => { place(); S.whoosh(); setTimeout(() => { const [tw, nt] = mark(); S.buzz(); $('lk-read').innerHTML = `❌ Testteki <b>${nt}</b> karenin <b class="red">${tw}</b> tanesinin ikizi eğitimde!`; }, 1000); }, 150);
        };
        $('lk-subj').onclick = () => {
            reset(); const ms = [...Array(NM).keys()].sort(() => Math.random() - 0.5).slice(0, 3); cards.forEach(c => { c.test = ms.includes(c.m); });
            setTimeout(() => { place(); S.whoosh(); setTimeout(() => { mark(); S.ding(); $('lk-read').innerHTML = `✅ Testteki <b>3 fare</b> eğitimde <b style="color:#0f9d58">hiç yok</b>: gerçek hayattaki gibi yeni bireyler.`; }, 1000); }, 150);
        };
        $('lk-reset').onclick = () => { reset(); S.click(); };
        IL.enter('leak', reset);
        void W; void trW;
    })();

    // =============== ÇOK GÖREVLİ MODEL ===============
    (function cnn() {
        const st = $('cnn-stack');
        for (let i = 0; i < 6; i++) {
            const w = 120 - i * 12, h = 150 - i * 18, x0 = 20 + i * 26, y0 = 20 + i * 9;
            svgEl('path', { d: `M${x0} ${y0 + 14} L${x0 + 20} ${y0} L${x0 + 20 + w * 0.2} ${y0} L${x0 + w * 0.2} ${y0 + 14} Z M${x0} ${y0 + 14} h${w * 0.2} v${h} h${-w * 0.2} Z`, fill: i % 2 ? '#0b6aa2' : '#00426a', opacity: 0.85, stroke: '#fff', 'stroke-width': 1,
                style: `animation: pulse 1.6s ease-in-out ${i * 0.15}s infinite; transform-box: fill-box; transform-origin: center` }, st);
        }
        const vec = $('cnn-vec'); const bars = Array.from({ length: 22 }, () => { const b = document.createElement('i'); b.style.height = '10px'; vec.appendChild(b); return b; });
        const heads = $('cnn-heads'), N = ['Eritem', 'Kalınlık', 'Pullanma'], hb = [];
        N.forEach(n => {
            const d = document.createElement('div'); d.className = 'head';
            d.innerHTML = `<b>${n}</b><div class="pb"><div><span>0</span><i></i></div><div><span>1</span><i></i></div><div><span>2</span><i></i></div></div>`;
            heads.appendChild(d); hb.push([...d.querySelectorAll('.pb div')]);
        });
        const ep = document.createElement('div'); ep.className = 'readout small'; heads.appendChild(ep);
        const P = [['r2c1', [2, 2, 1]], ['r1c3', [0, 0, 0]], ['r3c2', [1, 1, 1]], ['r2c2', [1, 2, 2]]];
        let pi = 0, run = 0;
        async function train() {
            const my = ++run, tgt = P[pi][1]; let seed = pi * 7 + 3; const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
            bars.forEach(b => { b.style.height = (12 + rnd() * 100) + 'px'; });
            hb.forEach((h, k) => h.forEach((d, c) => { d.classList.toggle('t', c === tgt[k]); d.querySelector('i').style.height = '33%'; }));
            for (let e = 1; e <= 8; e++) {
                await IL.sleep(420); if (my !== run) return;
                const a = e / 8;
                hb.forEach((h, k) => h.forEach((d, c) => { const v = c === tgt[k] ? lerp(0.33, 0.86, a) : lerp(0.33, 0.07, a) + (rnd() - 0.5) * 0.06 * (1 - a); d.querySelector('i').style.height = Math.round(v * 100) + '%'; }));
                ep.innerHTML = `eğitim turu (epoch) <b>${e}</b> / 8 · hedef: uzman skoru <b>E${tgt[0]} T${tgt[1]} S${tgt[2]}</b>`; S.tick();
            }
            S.ding();
        }
        $('cnn-next').onclick = () => { pi = (pi + 1) % P.length; $('cnn-img').src = `../assets/img/pasi_${P[pi][0]}.jpg`; S.whoosh(); train(); };
        IL.enter('cnn', () => { train(); });
        IL.leave('cnn', () => { run++; });
    })();

    // =============== HALKALAR ===============
    function ring(el, v, c, txt) {
        const R = 70, L = 2 * Math.PI * R;
        el.innerHTML = `<svg width="100%" height="100%" viewBox="0 0 170 170"><circle cx="85" cy="85" r="${R}" fill="none" stroke="#e3e9ef" stroke-width="16"/>` +
            `<circle cx="85" cy="85" r="${R}" fill="none" stroke="${c}" stroke-width="16" stroke-linecap="round" stroke-dasharray="${L}" stroke-dashoffset="${L}" style="transition:stroke-dashoffset 1.4s cubic-bezier(.2,.8,.2,1)"/></svg><div class="v">${txt || ''}</div>`;
        return (p, t) => { el.querySelector('circle:last-child').style.strokeDashoffset = L * (1 - p); if (t !== undefined) el.querySelector('.v').innerHTML = t; };
    }
    (function results() {
        const rs = [...document.querySelectorAll('[data-id="results"] .ring')].map(el => { const set = ring(el, 0, el.dataset.c, '<span>0</span>'); el.querySelector('.v').style.color = el.dataset.c; return { el, set, v: +el.dataset.v }; });
        IL.enter('results', () => {
            rs.forEach(r => r.set(0, `<span class="count" data-to="${r.v}" data-dec="1" data-suf="%">0</span>`));
            setTimeout(() => rs.forEach(r => { r.set(r.v / 100); IL.countUp(r.el.querySelector('.count')); }), 200);
        });
    })();

    // =============== KONTROL LİSTESİ ===============
    (function check() {
        const set = ring($('chk-ring'), 0, '#0f9d58', '0/10'), labs = [...document.querySelectorAll('#chk label')];
        $('chk-ring').querySelector('.v').style.fontSize = '30px';
        const upd = () => { const n = labs.filter(l => l.classList.contains('on')).length; set(n / 10, n === 10 ? '🚀' : n + '/10'); return n; };
        labs.forEach(l => l.addEventListener('click', e => { e.preventDefault(); l.classList.toggle('on'); const n = upd(); if (n === 10) { S.fanfare(); IL.confetti(); } else l.classList.contains('on') ? S.blip(500 + n * 60) : S.click(); }));
        IL.enter('check', upd);
    })();

    // =============== VERİ BAĞLANTISI (eğitmen) ===============
    (function veri() {
        const inp = $('veri-in'), box = $('veri-qr');
        let v = ''; try { v = new URLSearchParams(location.search).get('veri') || localStorage.getItem('il-veri') || ''; } catch (e) { /* yok say */ }
        const draw = () => {
            const u = inp.value.trim(); try { localStorage.setItem('il-veri', u); } catch (e) { /* yok say */ }
            box.innerHTML = '';
            // kısa bağlantı ekrandan okunup yazılabilsin diye QR'ın altında metin olarak da göster
            const tx = $('veri-txt'); tx.style.display = u ? '' : 'none'; tx.textContent = u.replace(/^https?:\/\//, '');
            tx.style.fontSize = u.length <= 40 ? '24px' : '13px';
            if (!u) { box.innerHTML = '<span class="small muted" style="line-height:1.3">Bağlantı girilince<br>QR burada belirir</span>'; return; }
            if (window.QRCode) new QRCode(box, { text: u, width: 220, height: 220, colorDark: '#00263d', colorLight: '#ffffff', correctLevel: QRCode.CorrectLevel.M });
        };
        inp.value = v; draw(); inp.addEventListener('change', () => { draw(); S.ding(); });
        inp.addEventListener('keydown', e => e.stopPropagation());
    })();

    // =============== UYGULAMA ===============
    document.querySelectorAll('.map .mp').forEach(m => m.addEventListener('click', () => {
        m.classList.toggle('done'); if (m.classList.contains('done')) { S.ding(); if (document.querySelectorAll('.map .mp.done').length === 9) { S.fanfare(); IL.confetti(); } } else S.click();
    }));
    (function grpBars() {
        const svg = $('grp-bars'), bars = [];
        GROUPS.forEach((g, i) => {
            const y = 12 + i * 54, w = g[5] / 4175 * 280;
            const t = svgEl('text', { x: 0, y: y + 27, 'font-family': 'JetBrains Mono, monospace', 'font-weight': 800, 'font-size': 15, fill: g[3] }, svg); t.textContent = g[0];
            bars.push(svgEl('rect', { x: 92, y: y + 6, width: w, height: 32, rx: 7, fill: g[3], style: `transform-box:fill-box; transform-origin:left; transform:scaleX(0); transition:transform 1s cubic-bezier(.2,.8,.2,1) ${0.1 + i * 0.08}s` }, svg));
            const v = svgEl('text', { x: 100 + w, y: y + 28, 'font-family': 'JetBrains Mono, monospace', 'font-weight': 700, 'font-size': 14, fill: '#0d2233' }, svg); v.textContent = IL.fmt(g[5]) + ' · ' + g[4] + ' fare';
        });
        IL.enter('u-s2', () => { bars.forEach(b => { b.style.transform = 'scaleX(0)'; }); setTimeout(() => bars.forEach(b => { b.style.transform = 'scaleX(1)'; }), 150); });
    })();

    // kırmızılık indeksi: 15 açık örnek üzerinde canlı hesap
    (function redness() {
        const L = { r1c1: 1, r1c2: 0, r1c3: 0, r1c4: 0, r1c5: 0, r2c1: 2, r2c2: 1, r2c3: 1, r2c4: 2, r2c5: 1, r3c1: 1, r3c2: 1, r3c3: 1, r3c4: 2, r3c5: 1 };
        const cv = $('red-cv'), x = cv.getContext('2d'); let data = null;
        const load = k => new Promise(res => { const im = new Image(); im.onload = () => res([k, im]); im.onerror = () => res([k, null]); im.src = `../assets/img/pasi_${k}.jpg`; });
        async function compute() {
            const ims = await Promise.all(Object.keys(L).map(load)), c = document.createElement('canvas'), cx = c.getContext('2d', { willReadFrequently: true }); const out = [];
            for (const [k, im] of ims) {
                if (!im) continue; c.width = im.width; c.height = im.height; cx.drawImage(im, 0, 0);
                const w = im.width, h = im.height, d = cx.getImageData(w / 4 | 0, h / 4 | 0, w / 2 | 0, h / 2 | 0).data; let s = 0;
                for (let i = 0; i < d.length; i += 4) s += d[i] - d[i + 1];
                out.push({ k, im, e: L[k], v: s / (d.length / 4) });
            }
            return out;
        }
        const rank = a => { const idx = a.map((v, i) => [v, i]).sort((p, q) => p[0] - q[0]), r = Array(a.length); for (let i = 0; i < idx.length;) { let j = i; while (j + 1 < idx.length && idx[j + 1][0] === idx[i][0]) j++; for (let k = i; k <= j; k++) r[idx[k][1]] = (i + j) / 2 + 1; i = j + 1; } return r; };
        const pear = (a, b) => { const n = a.length, ma = a.reduce((s, v) => s + v, 0) / n, mb = b.reduce((s, v) => s + v, 0) / n; let num = 0, da = 0, db = 0; for (let i = 0; i < n; i++) { num += (a[i] - ma) * (b[i] - mb); da += (a[i] - ma) ** 2; db += (b[i] - mb) ** 2; } return num / Math.sqrt(da * db); };
        async function draw() {
            try { if (!data) data = await compute(); } catch (e) { $('red-read').innerHTML = 'Canlı hesap için sunumu web adresinden açın.'; return; }
            const vs = data.map(d => d.v), lo = Math.min(...vs) - 5, hi = Math.max(...vs) + 5, Y = v => 370 - (v - lo) / (hi - lo) * 320, XC = [150, 330, 510];
            x.clearRect(0, 0, 640, 420); x.fillStyle = '#fff'; x.fillRect(0, 0, 640, 420);
            x.strokeStyle = '#dde5ec'; x.fillStyle = '#6d6e71'; x.font = '13px "JetBrains Mono", monospace';
            for (let k = 0; k <= 4; k++) { const v = lo + (hi - lo) * k / 4, y = Y(v); x.beginPath(); x.moveTo(60, y); x.lineTo(620, y); x.stroke(); x.fillText(v.toFixed(0), 18, y + 4); }
            x.save(); x.translate(14, 230); x.rotate(-Math.PI / 2); x.fillText('ortalama (R − G)', 0, 0); x.restore();
            ['E0 · yok', 'E1 · hafif', 'E2 · şiddetli'].forEach((t, i) => { x.fillStyle = ['#0f9d58', '#d97706', '#cd061e'][i]; x.font = '800 17px Outfit, sans-serif'; x.textAlign = 'center'; x.fillText(t, XC[i], 405); x.textAlign = 'start'; });
            const byE = [[], [], []]; data.forEach(d => byE[d.e].push(d));
            for (let e = 0; e < 3; e++) {
                const m = byE[e].reduce((s, d) => s + d.v, 0) / byE[e].length; x.strokeStyle = ['#0f9d58', '#d97706', '#cd061e'][e]; x.lineWidth = 4; x.beginPath(); x.moveTo(XC[e] - 70, Y(m)); x.lineTo(XC[e] + 70, Y(m)); x.stroke();
                for (const [i, d] of byE[e].entries()) {
                    await IL.sleep(90); const px = XC[e] + ((i % 4) - 1.5) * 36, py = Y(d.v);
                    x.save(); x.beginPath(); x.arc(px, py, 19, 0, 6.283); x.clip(); const s = Math.min(d.im.width, d.im.height); x.drawImage(d.im, (d.im.width - s) / 2, (d.im.height - s) / 2, s, s, px - 19, py - 19, 38, 38); x.restore();
                    x.strokeStyle = '#fff'; x.lineWidth = 3; x.beginPath(); x.arc(px, py, 19, 0, 6.283); x.stroke(); S.blip(520 + e * 120);
                }
            }
            const rho = pear(rank(data.map(d => d.v)), rank(data.map(d => d.e)));
            $('red-read').innerHTML = `15 örnek · Spearman ρ = <b>${rho.toFixed(2).replace('.', ',')}</b> · yatay çizgi = grup ortalaması`;
        }
        IL.enter('u-s4', () => { draw(); });
    })();

    IL.enter('end', () => setTimeout(IL.confetti, 600));
    IL.start({ foot: 'TÜBİTAK 2237 · KTÜ İLAFAR · Canlı Modellerden Koda' });
})();
