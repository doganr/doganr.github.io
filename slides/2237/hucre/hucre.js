/* Hücreden Koda · etkileşimli parçalar */
(function () {
    const $ = id => document.getElementById(id);
    const S = IL.sfx;
    const W = 640, H = 480;

    // ---------- BCCD görüntüleri: piksel verisi ----------
    const IMG = {}, PIX = {};
    const load = n => new Promise(res => {
        const im = new Image();
        im.onload = () => {
            const c = document.createElement('canvas'); c.width = W; c.height = H;
            const x = c.getContext('2d'); x.drawImage(im, 0, 0);
            IMG[n] = im; PIX[n] = x.getImageData(0, 0, W, H).data; res();
        };
        im.src = BCCD.img[n];
    });
    const ready = Promise.all(['00000', '00010', '00098'].map(load));
    const COL = { RBC: '#ef233c', WBC: '#7c3aed', Platelets: '#f59e0b' };
    const hue = k => `hsl(${(k * 137.5) % 360} 80% 55%)`;

    // yeşil kanalda Otsu eşiği (maske: G < eşik)
    function otsu(n, ch) {
        const d = PIX[n], h = new Float64Array(256), c = ch === undefined ? 1 : ch;
        for (let i = c; i < d.length; i += 4) h[d[i]]++;
        const tot = W * H; let sum = 0; for (let i = 0; i < 256; i++) sum += i * h[i];
        let sB = 0, wB = 0, best = -1, th = 0, mb = 0, mf = 0;
        for (let t = 0; t < 256; t++) {
            wB += h[t]; if (!wB) continue; const wF = tot - wB; if (!wF) break;
            sB += t * h[t]; const mB = sB / wB, mF = (sum - sB) / wF, v = wB * wF * (mB - mF) * (mB - mF);
            if (v > best) { best = v; th = t; mb = mB; mf = mF; }
        }
        return { t: th + 1, mb, mf, h };
    }
    // maske + 8-komşulu bağlı bileşenler; alanı minA'dan küçükler gürültü
    function segment(n, t, minA) {
        minA = minA || 120;
        const d = PIX[n], N = W * H, m = new Uint8Array(N), lab = new Int32Array(N), st = new Int32Array(N);
        for (let i = 0; i < N; i++) m[i] = d[i * 4 + 1] < t ? 1 : 0;
        const area = [0]; let k = 0;
        for (let i = 0; i < N; i++) {
            if (!m[i] || lab[i]) continue;
            k++; let sp = 0, a = 0; st[sp++] = i; lab[i] = k;
            while (sp) {
                const p = st[--sp]; a++; const x = p % W, y = (p / W) | 0;
                for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) {
                    const xx = x + dx, yy = y + dy; if (xx < 0 || yy < 0 || xx >= W || yy >= H) continue;
                    const q = yy * W + xx; if (m[q] && !lab[q]) { lab[q] = k; st[sp++] = q; }
                }
            }
            area.push(a);
        }
        let cnt = 0; const keep = area.map(a => a >= minA); for (let j = 1; j <= k; j++) if (keep[j]) cnt++;
        return { m, lab, keep, cnt };
    }
    // bileşenleri renkli boya (görüntü soluk arka planda)
    function paintObjects(x, n, seg, dim) {
        const out = x.createImageData(W, H), d = PIX[n], o = out.data;
        const cols = {};
        for (let i = 0; i < W * H; i++) {
            const L = seg.lab[i], j = i * 4;
            if (L && seg.keep[L]) {
                let c = cols[L]; if (!c) { const hh = (L * 137.5) % 360; c = cols[L] = hsl(hh, 0.8, 0.55); }
                o[j] = c[0]; o[j + 1] = c[1]; o[j + 2] = c[2];
            } else { const g = d[j + 1] * dim + 255 * (1 - dim); o[j] = o[j + 1] = o[j + 2] = g; }
            o[j + 3] = 255;
        }
        x.putImageData(out, 0, 0);
    }
    function hsl(h, s, l) {
        const a = s * Math.min(l, 1 - l), f = n => { const k = (n + h / 30) % 12; return 255 * (l - a * Math.max(-1, Math.min(k - 3, 9 - k, 1))); };
        return [f(0), f(8), f(4)];
    }
    function boxes(x, n, lw, filter) {
        BCCD.box[n].forEach(b => {
            if (filter && !filter(b)) return;
            x.strokeStyle = COL[b[0]]; x.lineWidth = lw || 3; x.strokeRect(b[1], b[2], b[3] - b[1], b[4] - b[2]);
        });
    }

    // =============== KAPAK: mikroskop penceresinde hücre → piksel → sayı ===============
    (function cover() {
        const cv = $('cover-cv'), x = cv.getContext('2d'), Z = 1040, R = 500;
        const oc = document.createElement('canvas'); oc.width = oc.height = Z; const ox = oc.getContext('2d');
        const B = 40, NB = Z / B, sc = document.createElement('canvas'); sc.width = sc.height = NB; const sx = sc.getContext('2d', { willReadFrequently: true });
        const rnd = (a, b) => a + Math.random() * (b - a);
        const cells = [];
        for (let i = 0; i < 24; i++) cells.push({ x: rnd(0, Z), y: rnd(0, Z), r: rnd(62, 84), vx: rnd(-0.25, 0.25), vy: rnd(-0.2, 0.2), k: 0, a: rnd(0, 6) });
        cells.push({ x: 600, y: 420, r: 104, vx: 0.12, vy: 0.08, k: 1, a: 0 }, { x: 260, y: 760, r: 96, vx: -0.1, vy: -0.1, k: 1, a: 2 });
        for (let i = 0; i < 6; i++) cells.push({ x: rnd(0, Z), y: rnd(0, Z), r: rnd(9, 14), vx: rnd(-0.3, 0.3), vy: rnd(-0.3, 0.3), k: 2, a: 0 });
        function drawCell(c, t) {
            ox.save(); ox.translate(c.x, c.y);
            if (c.k === 0) {
                const g = ox.createRadialGradient(0, 0, c.r * 0.1, 0, 0, c.r);
                g.addColorStop(0, '#f4d4cf'); g.addColorStop(0.45, '#eab0ad'); g.addColorStop(0.82, '#d9868a'); g.addColorStop(1, 'rgba(201,110,116,0.9)');
                ox.fillStyle = g; ox.beginPath(); ox.ellipse(0, 0, c.r, c.r * 0.93, c.a, 0, 6.283); ox.fill();
            } else if (c.k === 1) {
                const g = ox.createRadialGradient(0, 0, 0, 0, 0, c.r);
                g.addColorStop(0, '#e2d3ee'); g.addColorStop(1, 'rgba(199,180,224,0.85)');
                ox.fillStyle = g; ox.beginPath(); ox.arc(0, 0, c.r, 0, 6.283); ox.fill();
                ox.fillStyle = '#6a3fb0';
                for (let j = 0; j < 4; j++) {
                    const a = j * 1.57 + c.a + Math.sin(t / 2000 + j) * 0.1; ox.beginPath();
                    ox.ellipse(Math.cos(a) * c.r * 0.38, Math.sin(a) * c.r * 0.38, c.r * 0.3, c.r * 0.22, a, 0, 6.283); ox.fill();
                }
            } else { ox.fillStyle = '#8b5cc7'; ox.beginPath(); ox.arc(0, 0, c.r, 0, 6.283); ox.fill(); }
            ox.restore();
        }
        IL.loop('cover', t => {
            // hücreleri hareket ettir, mikroskop alanını çiz
            const g = ox.createRadialGradient(Z / 2, Z / 2, 50, Z / 2, Z / 2, Z / 1.3);
            g.addColorStop(0, '#f3ece6'); g.addColorStop(1, '#ddd0c8'); ox.fillStyle = g; ox.fillRect(0, 0, Z, Z);
            cells.forEach(c => {
                c.x += c.vx; c.y += c.vy; c.a += 0.0015;
                if (c.x < -c.r) c.x = Z + c.r; if (c.x > Z + c.r) c.x = -c.r; if (c.y < -c.r) c.y = Z + c.r; if (c.y > Z + c.r) c.y = -c.r;
                drawCell(c, t);
            });
            // tarama çizgisi: 0 → Z → 0 (sayısallaştırma)
            const P = 16000, ph = (t % P) / P, e = u => u < 0.5 ? 4 * u * u * u : 1 - Math.pow(-2 * u + 2, 3) / 2;
            const sxp = ph < 0.42 ? e(ph / 0.42) * Z : ph < 0.55 ? Z : ph < 0.95 ? (1 - e((ph - 0.55) / 0.4)) * Z : 0;
            x.clearRect(0, 0, Z, Z);
            x.save(); x.beginPath(); x.arc(Z / 2, Z / 2, R, 0, 6.283); x.clip();
            x.drawImage(oc, 0, 0);
            if (sxp > 1) {
                sx.drawImage(oc, 0, 0, NB, NB); const px = sx.getImageData(0, 0, NB, NB).data;
                x.save(); x.beginPath(); x.rect(0, 0, sxp, Z); x.clip();
                x.imageSmoothingEnabled = false; x.drawImage(sc, 0, 0, Z, Z);
                // tarama çizgisinin arkasında sayılar
                x.font = 'bold 14px "JetBrains Mono", monospace'; x.textAlign = 'center'; x.textBaseline = 'middle';
                const c0 = Math.max(0, Math.floor(sxp / B) - 5), c1 = Math.min(NB - 1, Math.floor(sxp / B));
                for (let cx = c0; cx <= c1; cx++) for (let cy = 0; cy < NB; cy++) {
                    const j = (cy * NB + cx) * 4, gv = px[j + 1];
                    x.globalAlpha = 0.35 + 0.65 * (1 - (c1 - cx) / 6);
                    x.fillStyle = gv < 165 ? '#fff' : '#3a2a30'; x.fillText(gv, cx * B + B / 2, cy * B + B / 2);
                }
                x.globalAlpha = 1;
                x.strokeStyle = 'rgba(0,0,0,0.12)'; x.lineWidth = 1;
                for (let i = 0; i <= NB; i++) { x.beginPath(); x.moveTo(i * B, 0); x.lineTo(i * B, Z); x.stroke(); x.beginPath(); x.moveTo(0, i * B); x.lineTo(Z, i * B); x.stroke(); }
                x.restore();
                const lg = x.createLinearGradient(sxp - 60, 0, sxp + 8, 0);
                lg.addColorStop(0, 'rgba(239,35,60,0)'); lg.addColorStop(1, 'rgba(239,35,60,0.55)');
                x.fillStyle = lg; x.fillRect(sxp - 60, 0, 68, Z);
                x.fillStyle = '#ff2d4b'; x.fillRect(sxp - 2, 0, 4, Z);
            }
            // okülerdeki ölçek çizgisi
            x.strokeStyle = 'rgba(0,26,44,0.35)'; x.lineWidth = 2;
            x.beginPath(); x.moveTo(Z / 2 - 300, Z / 2); x.lineTo(Z / 2 + 300, Z / 2); x.stroke();
            for (let i = -10; i <= 10; i++) { const L = i % 5 === 0 ? 22 : 11; x.beginPath(); x.moveTo(Z / 2 + i * 30, Z / 2 - L); x.lineTo(Z / 2 + i * 30, Z / 2 + L); x.stroke(); }
            x.restore();
            // okülerin metal halkası
            const rg = x.createLinearGradient(0, 0, Z, Z); rg.addColorStop(0, '#9fb3c4'); rg.addColorStop(0.5, '#29475e'); rg.addColorStop(1, '#0b2234');
            x.lineWidth = 26; x.strokeStyle = rg; x.beginPath(); x.arc(Z / 2, Z / 2, R + 6, 0, 6.283); x.stroke();
            x.lineWidth = 4; x.strokeStyle = 'rgba(255,90,110,0.9)'; x.beginPath(); x.arc(Z / 2, Z / 2, R + 22, -1.2, -1.2 + 1.4 * Math.sin(t / 2600) + 1.6); x.stroke();
        });
    })();

    // =============== OYUN: KAÇ HÜCRE ===============
    (function game() {
        const cv = $('game-cv'), x = cv.getContext('2d'), cover = $('game-cover'), tm = $('game-timer'), msg = $('game-msg');
        let timer = null, run = 0;
        const reset = () => {
            clearInterval(timer); run++; cover.style.opacity = 1; cover.textContent = '?'; cv.style.filter = 'none'; tm.style.opacity = 0;
            $('game-n').textContent = '?'; $('game-m').textContent = '?';
            msg.innerHTML = '<p>Tahminler? 🙋 En yakın tahmin alkışı hak eder.</p>';
        };
        IL.enter('game', reset);
        $('game-start').onclick = () => ready.then(() => {
            reset(); x.drawImage(IMG['00000'], 0, 0); cover.style.opacity = 0; let k = 5; tm.textContent = k; tm.style.opacity = 1; S.beep(660);
            timer = setInterval(() => {
                k--; tm.textContent = k;
                if (k > 0) { S.beep(660); return; }
                clearInterval(timer); tm.style.opacity = 0; S.beep(990); cv.style.filter = 'blur(18px)';
                setTimeout(() => { cover.style.opacity = 1; cover.textContent = '🤔'; }, 500);
                msg.innerHTML = '<p><b>Süre doldu!</b> Kaç hücre saydınız? Alyuvar + akyuvar…</p>';
            }, 1000);
        });
        $('game-expert').onclick = () => ready.then(async () => {
            clearInterval(timer); const my = ++run; cover.style.opacity = 0; cv.style.filter = 'none'; tm.style.opacity = 0;
            x.drawImage(IMG['00000'], 0, 0); let n = 0;
            const bx = BCCD.box['00000'].slice().sort((a, b) => (a[0] === 'WBC') - (b[0] === 'WBC'));
            for (const b of bx) {
                if (my !== run) return;
                x.strokeStyle = COL[b[0]]; x.lineWidth = 4; x.strokeRect(b[1], b[2], b[3] - b[1], b[4] - b[2]);
                n++; $('game-n').textContent = n; S.blip(420 + n * 28); await IL.sleep(150);
            }
            S.chime(); msg.innerHTML = '<p>👩‍🔬 Uzman: <b>19 alyuvar + 1 akyuvar = 20</b> hücre. Kenarda yarım kalanları da saymış!</p>';
        });
        $('game-pc').onclick = () => ready.then(() => {
            clearInterval(timer); run++; cover.style.opacity = 0; cv.style.filter = 'none'; tm.style.opacity = 0;
            const o = otsu('00000'), sg = segment('00000', o.t, 120); paintObjects(x, '00000', sg, 0.35);
            $('game-m').textContent = sg.cnt; S.buzz();
            msg.innerHTML = `<p>🤖 Basit eşikleme yalnız <b>${sg.cnt}</b> leke buldu 😬 Birbirine değen hücreler <b>tek nesne</b> sanıldı. Çözümü birazdan göreceğiz: <b>havza yöntemi</b>.</p>`;
        });
    })();

    // =============== PİKSEL MERCEĞİ ===============
    (function pixel() {
        const cv = $('pix-cv'), x = cv.getContext('2d'), L = $('pix-lens'), lx = L.getContext('2d'), sc = 576 / W, N = 7, CS = 60;
        let mx = 300, my = 200, last = -1e9;
        cv.addEventListener('mousemove', e => {
            const r = cv.getBoundingClientRect(); mx = (e.clientX - r.left) / r.width * W; my = (e.clientY - r.top) / r.height * H; last = performance.now();
        });
        let lastCell = '';
        IL.loop('pixel', t => {
            if (!PIX['00010']) return;
            if (performance.now() - last > 2500) { mx = 320 + 250 * Math.sin(t / 2600); my = 240 + 175 * Math.sin(t / 1900 + 1); }
            const cx = Math.max(3, Math.min(W - 4, Math.round(mx))), cy = Math.max(3, Math.min(H - 4, Math.round(my)));
            x.drawImage(IMG['00010'], 0, 0, 576, 432);
            x.strokeStyle = '#ffd400'; x.lineWidth = 3; x.strokeRect((cx - 3.5) * sc, (cy - 3.5) * sc, N * sc, N * sc);
            x.beginPath(); x.arc(cx * sc, cy * sc, 26, 0, 6.283); x.stroke();
            lx.clearRect(0, 0, 420, 420); lx.textAlign = 'center'; lx.textBaseline = 'middle';
            const d = PIX['00010'];
            for (let j = 0; j < N; j++) for (let i = 0; i < N; i++) {
                const p = ((cy - 3 + j) * W + (cx - 3 + i)) * 4, r = d[p], g = d[p + 1], b = d[p + 2];
                lx.fillStyle = `rgb(${r},${g},${b})`; lx.fillRect(i * CS, j * CS, CS, CS);
                const lum = 0.3 * r + 0.59 * g + 0.11 * b; lx.fillStyle = lum < 140 ? '#fff' : '#1b1b1b';
                lx.font = 'bold 13px "JetBrains Mono", monospace';
                lx.fillText(r, i * CS + CS / 2, j * CS + 16); lx.fillText(g, i * CS + CS / 2, j * CS + 30); lx.fillText(b, i * CS + CS / 2, j * CS + 44);
            }
            lx.strokeStyle = 'rgba(0,0,0,0.25)'; lx.lineWidth = 1;
            for (let i = 0; i <= N; i++) { lx.beginPath(); lx.moveTo(i * CS, 0); lx.lineTo(i * CS, 420); lx.stroke(); lx.beginPath(); lx.moveTo(0, i * CS); lx.lineTo(420, i * CS); lx.stroke(); }
            lx.strokeStyle = '#ef233c'; lx.lineWidth = 4; lx.strokeRect(3 * CS + 2, 3 * CS + 2, CS - 4, CS - 4);
            const p = (cy * W + cx) * 4, key = cx + ',' + cy;
            if (key !== lastCell) {
                lastCell = key;
                $('pix-read').innerHTML = `(x, y) = (<b>${cx}</b>, <b>${cy}</b>) · R <b style="color:#cd061e">${d[p]}</b> · G <b style="color:#0f9d58">${d[p + 1]}</b> · B <b style="color:#1d4ed8">${d[p + 2]}</b>`;
            }
        });
    })();

    // =============== RENK KANALLARI ===============
    (function rgb() {
        const cv = $('rgb-cv'), x = cv.getContext('2d'), hc = $('rgb-hist'), hx = hc.getContext('2d');
        const tmp = document.createElement('canvas'); tmp.width = W; tmp.height = H; const tx = tmp.getContext('2d');
        const CH = ['#cd061e', '#0f9d58', '#1d4ed8'], NM = ['R (kırmızı)', 'G (yeşil)', 'B (mavi)'];
        let mode = 'rgb';
        function draw() {
            if (!PIX['00000']) return;
            const d = PIX['00000'];
            if (mode === 'rgb') x.drawImage(IMG['00000'], 0, 0, 560, 420);
            else {
                const c = +mode, im = tx.createImageData(W, H);
                for (let i = 0; i < W * H; i++) { const v = d[i * 4 + c]; im.data[i * 4] = im.data[i * 4 + 1] = im.data[i * 4 + 2] = v; im.data[i * 4 + 3] = 255; }
                tx.putImageData(im, 0, 0); x.drawImage(tmp, 0, 0, 560, 420);
            }
            // histogram
            hx.clearRect(0, 0, 560, 200); hx.fillStyle = '#fff'; hx.fillRect(0, 0, 560, 200);
            const chans = mode === 'rgb' ? [0, 1, 2] : [+mode]; let mx = 0; const hs = chans.map(c => { const o = otsu('00000', c); mx = Math.max(mx, ...o.h); return o; });
            chans.forEach((c, k) => {
                const h = hs[k].h; hx.beginPath(); hx.moveTo(20, 180);
                for (let v = 0; v < 256; v++) hx.lineTo(20 + v * 2.05, 180 - h[v] / mx * 165);
                hx.lineTo(20 + 255 * 2.05, 180); hx.closePath(); hx.fillStyle = CH[c] + (mode === 'rgb' ? '40' : '66'); hx.fill(); hx.strokeStyle = CH[c]; hx.lineWidth = 2; hx.stroke();
                if (mode !== 'rgb') {
                    const tx0 = 20 + hs[k].t * 2.05; hx.setLineDash([6, 5]); hx.strokeStyle = '#00426a'; hx.beginPath(); hx.moveTo(tx0, 8); hx.lineTo(tx0, 180); hx.stroke(); hx.setLineDash([]);
                    hx.fillStyle = '#00426a'; hx.font = 'bold 13px "JetBrains Mono", monospace'; hx.fillText('Otsu eşiği ' + hs[k].t, Math.min(tx0 + 6, 440), 22);
                }
            });
            hx.fillStyle = '#6d6e71'; hx.font = '12px "JetBrains Mono", monospace'; hx.fillText('0', 16, 195); hx.fillText('255', 530, 195); hx.fillText('piksel değeri →', 230, 195);
            if (mode === 'rgb') $('rgb-read').innerHTML = 'Üç kanal üst üste. Bir kanal seçin ↑';
            else { const o = hs[0]; $('rgb-read').innerHTML = `${NM[+mode]}: koyu tepe ≈ <b>${Math.round(o.mb)}</b> · açık tepe ≈ <b>${Math.round(o.mf)}</b> · ayrışma <b>${Math.round(o.mf - o.mb)}</b>`; }
        }
        $('rgb-tabs').addEventListener('click', e => {
            const b = e.target.closest('.btn'); if (!b) return;
            $('rgb-tabs').querySelectorAll('.btn').forEach(z => z.classList.toggle('on', z === b)); mode = b.dataset.c; S.click(); draw();
        });
        IL.enter('rgb', () => ready.then(draw));
    })();

    // =============== EDOF ===============
    (function edof() {
        const cv = $('edof-cv'), x = cv.getContext('2d'), CW = 620, CHh = 390, fs = $('edof-f'), stack = $('edof-stack');
        const cells = [];
        let seed = 7; const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
        for (let i = 0; i < 16; i++) cells.push({ x: 40 + rnd() * 500, y: 40 + rnd() * 310, r: 30 + rnd() * 14, z: rnd(), k: i === 5 || i === 11 ? 1 : 0, a: rnd() * 3 });
        let fused = false, busy = false;
        function cell(c, blur) {
            x.save(); x.filter = blur > 0.3 ? `blur(${blur.toFixed(1)}px)` : 'none'; x.translate(c.x, c.y);
            if (c.k === 0) {
                const g = x.createRadialGradient(0, 0, c.r * 0.1, 0, 0, c.r);
                g.addColorStop(0, '#f5d8d3'); g.addColorStop(0.45, '#ebb1ae'); g.addColorStop(0.85, '#d27d83'); g.addColorStop(1, '#c46a72');
                x.fillStyle = g; x.beginPath(); x.ellipse(0, 0, c.r, c.r * 0.92, c.a, 0, 6.283); x.fill();
            } else {
                x.fillStyle = '#d9c8ea'; x.beginPath(); x.arc(0, 0, c.r * 1.25, 0, 6.283); x.fill(); x.fillStyle = '#6a3fb0';
                for (let j = 0; j < 4; j++) { const a = j * 1.6 + c.a; x.beginPath(); x.ellipse(Math.cos(a) * c.r * 0.45, Math.sin(a) * c.r * 0.45, c.r * 0.36, c.r * 0.26, a, 0, 6.283); x.fill(); }
            }
            x.restore();
        }
        function draw(f) {
            x.fillStyle = '#f1e8e2'; x.fillRect(0, 0, CW, CHh);
            cells.forEach(c => cell(c, fused ? 0 : Math.abs(c.z - f) * 18));
            // derinlik göstergesi
            x.fillStyle = 'rgba(0,26,44,0.75)'; x.fillRect(CW - 46, 14, 32, CHh - 28);
            cells.forEach(c => { const yy = 24 + c.z * (CHh - 48), sharp = fused || Math.abs(c.z - f) < 0.1; x.fillStyle = sharp ? '#22c55e' : '#9fb3c4'; x.beginPath(); x.arc(CW - 30, yy, 4, 0, 6.283); x.fill(); });
            if (!fused) { const yf = 24 + f * (CHh - 48); x.fillStyle = '#ff2d4b'; x.fillRect(CW - 50, yf - 2, 40, 4); }
            x.fillStyle = '#fff'; x.font = 'bold 11px "JetBrains Mono", monospace'; x.save(); x.translate(CW - 52, CHh / 2); x.rotate(-Math.PI / 2); x.textAlign = 'center'; x.fillStyle = '#00426a'; x.fillText('derinlik', 0, 0); x.restore();
            if (fused) { x.fillStyle = 'rgba(15,157,88,0.92)'; x.beginPath(); x.roundRect(16, 14, 210, 40, 12); x.fill(); x.fillStyle = '#fff'; x.font = '800 20px Outfit, sans-serif'; x.fillText('✓ Her yer net (EDOF)', 28, 41); }
        }
        const f = () => +fs.value / 100;
        fs.addEventListener('input', () => { fused = false; $('edof-fv').textContent = fs.value; draw(f()); S.tick(); });
        IL.enter('edof', () => { fused = false; stack.innerHTML = ''; fs.value = 25; $('edof-fv').textContent = 25; draw(0.25); });
        $('edof-scan').onclick = async () => {
            if (busy) return; busy = true; fused = false; stack.innerHTML = '';
            for (let k = 0; k <= 4; k++) {
                const target = k / 4;
                for (let s = 0; s <= 10; s++) { const v = target - 0.25 * (1 - s / 10) * (k > 0); fs.value = Math.round(Math.max(0, v) * 100); $('edof-fv').textContent = fs.value; draw(Math.max(0, v)); await IL.sleep(22); }
                const th = document.createElement('canvas'); th.width = 100; th.height = 63; th.style.cssText = 'border-radius:8px; box-shadow:0 4px 10px -4px rgba(0,0,0,.4); transition:transform .4s';
                th.getContext('2d').drawImage(cv, 0, 0, 100, 63); stack.appendChild(th); S.shutter(); await IL.sleep(160);
            }
            busy = false;
        };
        $('edof-fuse').onclick = async () => {
            if (busy) return; busy = true;
            if (!stack.children.length) { busy = false; await $('edof-scan').onclick(); busy = true; }
            [...stack.children].forEach((c, i) => setTimeout(() => { c.style.transform = 'translateY(-14px) scale(1.08)'; S.blip(500 + i * 90); }, i * 120));
            await IL.sleep(750); fused = true; draw(f()); S.chime();
            x.fillStyle = 'rgba(255,255,255,0.8)'; x.fillRect(0, 0, CW, CHh); await IL.sleep(60); draw(f());
            [...stack.children].forEach(c => { c.style.transform = 'none'; });
            busy = false;
        };
    })();

    // =============== SFF: dönen 3B alyuvar (Evans–Fung) ===============
    (function sff() {
        const cv = $('sff-cv'), x = cv.getContext('2d'), Wc = 900, Hc = 840, zs = $('sff-z');
        const R0 = 3.91, C0 = 0.207161, C2 = 2.002558, C4 = -1.122762, NR = 22, NS = 60, SC = 92;
        const half = rho => 0.5 * R0 * Math.sqrt(Math.max(0, 1 - rho * rho)) * (C0 + C2 * rho * rho + C4 * rho ** 4);
        // köşe noktaları (µm)
        const V = []; // [surf][i][j] → [x,y,z]
        [1, -1].forEach(sg => {
            const S_ = [];
            for (let i = 0; i <= NR; i++) {
                const rho = Math.sin(i / NR * Math.PI / 2), row = [];
                for (let j = 0; j < NS; j++) { const th = j / NS * 2 * Math.PI; row.push([R0 * rho * Math.cos(th), R0 * rho * Math.sin(th), sg * half(rho)]); }
                S_.push(row);
            }
            V.push(S_);
        });
        let yaw = 0.6, pitch = -1.05, drag = null, auto = true, cut = false;
        $('sff-cut').onclick = () => {
            cut = !cut; $('sff-cut').classList.toggle('go', cut); $('sff-cut').textContent = cut ? '🔄 Bütün hücre' : '✂️ Ortadan kes';
            S.whoosh(); S.pop(); auto = true; if (cut) { yaw = Math.PI; pitch = -1.42; } else pitch = -1.05;
        };
        IL.enter('sff', () => { if (cut) $('sff-cut').onclick(); });
        cv.addEventListener('pointerdown', e => { drag = { x: e.clientX, y: e.clientY, yaw, pitch }; auto = false; cv.setPointerCapture(e.pointerId); cv.style.cursor = 'grabbing'; });
        cv.addEventListener('pointermove', e => { if (!drag) return; yaw = drag.yaw + (e.clientX - drag.x) * 0.012; pitch = Math.max(-1.6, Math.min(0.2, drag.pitch + (e.clientY - drag.y) * 0.01)); });
        cv.addEventListener('pointerup', () => { drag = null; cv.style.cursor = 'grab'; setTimeout(() => { auto = true; }, 3000); });
        const zf = () => (+zs.value / 100 - 0.5) * 2.6;
        zs.addEventListener('input', () => { $('sff-zv').textContent = (zf() >= 0 ? '+' : '') + zf().toFixed(1).replace('.', ',') + ' µm'; S.tick(); });
        IL.enter('sff', () => zs.dispatchEvent(new Event('input')));
        const Lx = -0.35, Ly = -0.55, Lz = 0.76;
        IL.loop('sff', t => {
            if (auto) { if (cut) yaw = Math.PI + 0.35 * Math.sin(t / 2400); else yaw += 0.006; }
            const cy = Math.cos(yaw), sy = Math.sin(yaw), cp = Math.cos(pitch), sp = Math.sin(pitch);
            const rot = p => { const x1 = p[0] * cy - p[1] * sy, y1 = p[0] * sy + p[1] * cy, z1 = p[2]; return [x1, y1 * cp - z1 * sp, y1 * sp + z1 * cp]; };
            const proj = p => [Wc / 2 + p[0] * SC, Hc / 2 + 30 + p[1] * SC];
            const Q = [], zF = zf();
            const NJ = cut ? NS / 2 : NS;
            if (cut) { // kesit yüzü (y = 0 düzlemi): alyuvarın “halter” profili
                const xs = []; for (let i = NR; i >= 0; i--) xs.push(-R0 * Math.sin(i / NR * Math.PI / 2)); for (let i = 1; i <= NR; i++) xs.push(R0 * Math.sin(i / NR * Math.PI / 2));
                for (let k = 0; k < xs.length - 1; k++) {
                    const xa = xs[k], xb = xs[k + 1], ha = half(Math.abs(xa) / R0), hb = half(Math.abs(xb) / R0);
                    const pts = [[xa, 0, -ha], [xa, 0, ha], [xb, 0, hb], [xb, 0, -hb]].map(rot);
                    Q.push({ p: pts, depth: (pts[0][2] + pts[1][2] + pts[2][2] + pts[3][2]) / 4, sh: 0.8, foc: false, cutf: true });
                }
            }
            for (let s = 0; s < 2; s++) for (let i = 0; i < NR; i++) for (let j = 0; j < NJ; j++) {
                const a = V[s][i][j], b = V[s][i][(j + 1) % NS], c = V[s][i + 1][(j + 1) % NS], d = V[s][i + 1][j];
                const ra = rot(a), rb = rot(b), rc = rot(c), rd = rot(d);
                const ux = rc[0] - ra[0], uy = rc[1] - ra[1], uz = rc[2] - ra[2], vx = rd[0] - rb[0], vy = rd[1] - rb[1], vz = rd[2] - rb[2];
                let nx = uy * vz - uz * vy, ny = uz * vx - ux * vz, nz = ux * vy - uy * vx; const nl = Math.hypot(nx, ny, nz) || 1; nx /= nl; ny /= nl; nz /= nl;
                const zc = (a[2] + b[2] + c[2] + d[2]) / 4;
                Q.push({ p: [ra, rb, rc, rd], depth: (ra[2] + rb[2] + rc[2] + rd[2]) / 4, sh: Math.abs(nx * Lx + ny * Ly + nz * Lz), foc: Math.abs(zc - zF) < 0.11 });
            }
            Q.sort((p, q) => q.depth - p.depth);
            x.clearRect(0, 0, Wc, Hc);
            // odak düzlemi (arka)
            const pl = [[-5, -5, zF], [5, -5, zF], [5, 5, zF], [-5, 5, zF]].map(rot).map(proj);
            x.fillStyle = 'rgba(251,191,36,0.08)'; x.beginPath(); pl.forEach((p, i) => i ? x.lineTo(p[0], p[1]) : x.moveTo(p[0], p[1])); x.closePath(); x.fill();
            Q.forEach(q => {
                const l = 0.28 + 0.72 * q.sh;
                x.fillStyle = q.cutf ? '#5e0f22' : q.foc ? `rgb(${Math.round(250 * l + 5)},${Math.round(200 * l + 20)},${Math.round(40 * l)})` : `rgb(${Math.round(215 * l + 25)},${Math.round(70 * l + 18)},${Math.round(82 * l + 20)})`;
                x.beginPath(); q.p.forEach((p, i) => { const s = proj(p); i ? x.lineTo(s[0], s[1]) : x.moveTo(s[0], s[1]); }); x.closePath(); x.fill();
                x.strokeStyle = x.fillStyle; x.lineWidth = 1; x.stroke();
            });
            x.setLineDash([10, 8]); x.strokeStyle = 'rgba(251,191,36,0.75)'; x.lineWidth = 2; x.beginPath(); pl.forEach((p, i) => i ? x.lineTo(p[0], p[1]) : x.moveTo(p[0], p[1])); x.closePath(); x.stroke(); x.setLineDash([]);
            if (cut) { // kesit profilinin dış çizgisi + odak düzleminin kesitle buluştuğu yer
                x.strokeStyle = '#fff'; x.lineWidth = 4; x.beginPath();
                for (let k = -80; k <= 80; k++) { const xv = R0 * k / 80, s = proj(rot([xv, 0, half(Math.abs(xv) / R0)])); k === -80 ? x.moveTo(s[0], s[1]) : x.lineTo(s[0], s[1]); }
                for (let k = 80; k >= -80; k--) { const xv = R0 * k / 80, s = proj(rot([xv, 0, -half(Math.abs(xv) / R0)])); x.lineTo(s[0], s[1]); }
                x.closePath(); x.stroke();
                x.strokeStyle = '#fbbf24'; x.lineWidth = 5; x.beginPath(); let on = false;
                for (let k = -60; k <= 60; k++) {
                    const xv = R0 * k / 60, inside = Math.abs(zF) <= half(Math.abs(xv) / R0);
                    const s = proj(rot([xv, 0, zF]));
                    if (inside) { on ? x.lineTo(s[0], s[1]) : x.moveTo(s[0], s[1]); on = true; } else on = false;
                }
                x.stroke();
                x.fillStyle = '#fff'; x.font = '700 26px Inter, sans-serif'; x.fillText('ortası ince, kenarı kalın → bikonkav', 40, 90);
            }
            // ölçek
            x.fillStyle = 'rgba(255,255,255,0.85)'; x.fillRect(40, Hc - 50, SC * 2, 6); x.font = 'bold 24px "JetBrains Mono", monospace'; x.fillText('2 µm', 40, Hc - 62);
            x.fillStyle = 'rgba(255,255,255,0.7)'; x.font = '600 24px Inter, sans-serif'; x.fillText('çap ≈ 7,8 µm · kalın kenar ≈ 2,6 µm · orta ≈ 0,8 µm', 40, 46);
        });
    })();

    // =============== ETİKET TÜRLERİ ===============
    (function annot() {
        const cv = $('ann-cv'), x = cv.getContext('2d'); let run = 0, seg = null;
        const M = [
            { q: '“Bu görüntüde akyuvar var mı?”', d: 'Görüntü başına <b>tek etiket</b>. Hasta/numune düzeyinde karar (ör. “anormal / normal”).', w: 12, c: '⚡ en ucuz: görüntü başına tek tık' },
            { q: '“Kaç hücre var?”', d: 'Her hücreye <b>bir nokta</b>. Sayım ve yoğunluk için yeterli.', w: 35, c: '🖱️ hücre başına bir tık' },
            { q: '“Hangi hücre, nerede?”', d: 'Her hücreye <b>kutu + sınıf</b>. BCCD bu türde (Pascal VOC).', w: 60, c: '🖱️🖱️ hücre başına iki köşe + sınıf' },
            { q: '“Hücrenin sınırı tam olarak nerede?”', d: 'Her piksel için <b>hangi hücreye ait</b>. Alan, şekil, morfoloji ölçümü için. (Burada temsili çizildi.)', w: 100, c: '🖌️ en pahalısı: sınırı piksel piksel çizmek' },
        ];
        async function show(m) {
            const my = ++run, bx = BCCD.box['00098'];
            $('ann-q').innerHTML = M[m].q; $('ann-d').innerHTML = M[m].d; $('ann-bar').style.width = M[m].w + '%'; $('ann-cost').innerHTML = M[m].c;
            await ready; x.drawImage(IMG['00098'], 0, 0);
            if (m === 0) {
                x.strokeStyle = '#7c3aed'; x.lineWidth = 14; x.strokeRect(7, 7, W - 14, H - 14);
                x.fillStyle = '#7c3aed'; x.beginPath(); x.roundRect(24, 24, 330, 58, 16); x.fill();
                x.fillStyle = '#fff'; x.font = '800 30px Outfit, sans-serif'; x.fillText('Akyuvar içeriyor ✓', 42, 64); S.pop();
            } else if (m === 1) {
                let n = 0;
                for (const b of bx) {
                    if (my !== run) return; n++;
                    const cx = (b[1] + b[3]) / 2, cy = (b[2] + b[4]) / 2;
                    x.fillStyle = COL[b[0]]; x.beginPath(); x.arc(cx, cy, 15, 0, 6.283); x.fill(); x.strokeStyle = '#fff'; x.lineWidth = 3; x.stroke();
                    x.fillStyle = '#fff'; x.font = 'bold 15px "JetBrains Mono", monospace'; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillText(n, cx, cy + 1);
                    x.textAlign = 'start'; x.textBaseline = 'alphabetic'; S.blip(500 + n * 30); await IL.sleep(90);
                }
                x.fillStyle = 'rgba(0,26,44,0.85)'; x.beginPath(); x.roundRect(20, 20, 520, 50, 14); x.fill();
                x.fillStyle = '#fff'; x.font = '700 22px Outfit, sans-serif'; x.fillText('15 hücre: 13 alyuvar · 1 akyuvar · 1 trombosit', 34, 52);
            } else if (m === 2) {
                for (const b of bx) {
                    if (my !== run) return;
                    x.strokeStyle = COL[b[0]]; x.lineWidth = 4; x.strokeRect(b[1], b[2], b[3] - b[1], b[4] - b[2]);
                    const lb = b[0] === 'Platelets' ? 'PLT' : b[0]; x.fillStyle = COL[b[0]]; x.fillRect(b[1], b[2] - 20, lb.length * 11 + 10, 20);
                    x.fillStyle = '#fff'; x.font = 'bold 14px "JetBrains Mono", monospace'; x.fillText(lb, b[1] + 5, b[2] - 5); S.blip(600); await IL.sleep(80);
                }
            } else {
                if (!seg) { const o = otsu('00098'); seg = segment('00098', o.t + 6, 120); }
                const im = x.getImageData(0, 0, W, H), d = im.data, own = new Int8Array(W * H).fill(-1);
                bx.forEach((b, k) => { for (let yy = b[2]; yy < b[4]; yy++) for (let xx = b[1]; xx < b[3]; xx++) { const i = yy * W + xx; if (own[i] < 0 && seg.m[i]) own[i] = k; } });
                for (let i = 0; i < W * H; i++) {
                    const k = own[i]; if (k < 0) continue; const c = hsl(bx[k][0] === 'RBC' ? (k * 47) % 40 + 345 : bx[k][0] === 'WBC' ? 270 : 40, 0.85, 0.5);
                    d[i * 4] = d[i * 4] * 0.35 + c[0] * 0.65; d[i * 4 + 1] = d[i * 4 + 1] * 0.35 + c[1] * 0.65; d[i * 4 + 2] = d[i * 4 + 2] * 0.35 + c[2] * 0.65;
                }
                x.putImageData(im, 0, 0); S.pop();
            }
        }
        $('ann-tabs').addEventListener('click', e => {
            const b = e.target.closest('.btn'); if (!b) return;
            $('ann-tabs').querySelectorAll('.btn').forEach(z => z.classList.toggle('on', z === b)); S.click(); show(+b.dataset.m);
        });
        IL.enter('annot', () => { $('ann-tabs').querySelectorAll('.btn').forEach((z, i) => z.classList.toggle('on', i === 0)); show(0); });
    })();

    // =============== BCCD çubukları ===============
    IL.enter('bccd', s => setTimeout(() => s.querySelectorAll('.bar').forEach(b => { b.style.width = (b.dataset.w * 3.2) + 'px'; }), 300));
    IL.leave('bccd', s => s.querySelectorAll('.bar').forEach(b => { b.style.width = '0'; }));

    // =============== EŞİKLEME ===============
    (function thresh() {
        const cv = $('th-cv'), x = cv.getContext('2d'), ts = $('th-t'); let view = 1, showBox = false, raf = 0;
        function draw() {
            if (!PIX['00000']) return;
            const t = +ts.value, sg = segment('00000', t, 120); $('th-tv').textContent = t;
            if (view === 0) x.drawImage(IMG['00000'], 0, 0);
            else if (view === 1) {
                const im = x.createImageData(W, H), o = im.data;
                for (let i = 0; i < W * H; i++) { const v = sg.m[i]; o[i * 4] = v ? 255 : 0; o[i * 4 + 1] = v ? 255 : 38; o[i * 4 + 2] = v ? 255 : 61; o[i * 4 + 3] = 255; }
                x.putImageData(im, 0, 0);
            } else paintObjects(x, '00000', sg, 0.3);
            if (showBox) { x.setLineDash([10, 6]); boxes(x, '00000', 3); x.setLineDash([]); }
            $('th-n').textContent = sg.cnt;
            const m = $('th-msg'), ot = otsu('00000').t;
            if (t < ot - 12) m.innerHTML = `Eşik <b>düşük</b>: yalnız en koyu pikseller seçildi → hücreler <b>eksik, parça parça</b>.`;
            else if (t > ot + 12) m.innerHTML = `Eşik <b>yüksek</b>: arka plan da “hücre” sanıldı → her şey <b>birbirine yapıştı</b>.`;
            else m.innerHTML = `Otsu civarı: <b>${sg.cnt}</b> nesne. Birbirine değen hücreler <b>tek nesne</b> sayıldı → uzmanın altında. “Nesneler” görünümüne bakın!`;
        }
        const req = () => { cancelAnimationFrame(raf); raf = requestAnimationFrame(draw); };
        ts.addEventListener('input', () => { req(); S.tick(); });
        $('th-view').addEventListener('click', e => {
            const b = e.target.closest('.btn'); if (!b) return; view = +b.dataset.v;
            $('th-view').querySelectorAll('.btn').forEach(z => z.classList.toggle('on', z === b)); S.click(); req();
        });
        $('th-box').onclick = () => { showBox = !showBox; $('th-box').classList.toggle('on', showBox); S.click(); req(); };
        $('th-otsu').onclick = async () => {
            await ready; const target = otsu('00000').t, from = +ts.value;
            for (let i = 1; i <= 20; i++) { ts.value = Math.round(from + (target - from) * i / 20); draw(); S.tick(); await IL.sleep(30); }
            S.ding();
        };
        IL.enter('thresh', () => ready.then(draw));
    })();

    // =============== HAVZA (WATERSHED) ===============
    (function water() {
        const cv = $('ws-cv'), x = cv.getContext('2d'), pv = $('ws-prof'), px = pv.getContext('2d');
        const GW = 280, GH = 150, N = GW * GH, PR = 76;
        const discs = [[86, 76, 46], [152, 70, 44], [214, 82, 40]];
        const m = new Uint8Array(N), dist = new Float32Array(N), lab = new Int8Array(N);
        for (let y = 0; y < GH; y++) for (let xx = 0; xx < GW; xx++) if (discs.some(d => (xx - d[0]) ** 2 + (y - d[1]) ** 2 <= d[2] * d[2])) m[y * GW + xx] = 1;
        // kenara uzaklık: iki geçişli pah (chamfer) dönüşümü
        for (let i = 0; i < N; i++) dist[i] = m[i] ? 1e9 : 0;
        const a = 1, b = Math.SQRT2;
        for (let y = 0; y < GH; y++) for (let xx = 0; xx < GW; xx++) { const i = y * GW + xx; if (!m[i]) continue; let v = dist[i];
            if (xx > 0) v = Math.min(v, dist[i - 1] + a); else v = Math.min(v, a);
            if (y > 0) { v = Math.min(v, dist[i - GW] + a); if (xx > 0) v = Math.min(v, dist[i - GW - 1] + b); if (xx < GW - 1) v = Math.min(v, dist[i - GW + 1] + b); } else v = Math.min(v, a);
            dist[i] = v; }
        for (let y = GH - 1; y >= 0; y--) for (let xx = GW - 1; xx >= 0; xx--) { const i = y * GW + xx; if (!m[i]) continue; let v = dist[i];
            if (xx < GW - 1) v = Math.min(v, dist[i + 1] + a); else v = Math.min(v, a);
            if (y < GH - 1) { v = Math.min(v, dist[i + GW] + a); if (xx < GW - 1) v = Math.min(v, dist[i + GW + 1] + b); if (xx > 0) v = Math.min(v, dist[i + GW - 1] + b); } else v = Math.min(v, a);
            dist[i] = v; }
        let maxD = 0; for (let i = 0; i < N; i++) maxD = Math.max(maxD, dist[i]);
        const WC = [[59, 130, 246], [16, 185, 129], [245, 158, 11]];
        const heat = v => { const t = v / maxD; return [Math.round(10 + 245 * Math.min(1, t * 1.6)), Math.round(40 + 200 * Math.max(0, t - 0.45) * 1.8), Math.round(90 * (1 - t) + 20)]; };
        let step = 0, level = 0, anim = 0;
        const img = x.createImageData(GW, GH), sm = document.createElement('canvas'); sm.width = GW; sm.height = GH; const smx = sm.getContext('2d');
        function render() {
            const o = img.data;
            for (let i = 0; i < N; i++) {
                const j = i * 4; let c;
                if (!m[i]) c = [0, 26, 44];
                else if (step === 0) c = [255, 255, 255];
                else {
                    c = heat(dist[i]);
                    if (step === 2 && lab[i]) {
                        const w = WC[lab[i] - 1]; c = [c[0] * 0.25 + w[0] * 0.75, c[1] * 0.25 + w[1] * 0.75, c[2] * 0.25 + w[2] * 0.75];
                        const xx = i % GW;
                        if ((xx < GW - 1 && lab[i + 1] && lab[i + 1] !== lab[i]) || (i + GW < N && lab[i + GW] && lab[i + GW] !== lab[i])) c = [239, 35, 60];
                    }
                }
                o[j] = c[0]; o[j + 1] = c[1]; o[j + 2] = c[2]; o[j + 3] = 255;
            }
            smx.putImageData(img, 0, 0); x.imageSmoothingEnabled = false; x.drawImage(sm, 0, 0, 560, 300);
            if (step >= 1) { x.fillStyle = '#fff'; discs.forEach(d => { x.beginPath(); x.arc(d[0] * 2, d[1] * 2, 7, 0, 6.283); x.fill(); }); }
            x.strokeStyle = 'rgba(255,255,255,0.5)'; x.setLineDash([6, 6]); x.beginPath(); x.moveTo(0, PR * 2); x.lineTo(560, PR * 2); x.stroke(); x.setLineDash([]);
            // kesit: arazi = maxD − uzaklık (vadiler hücre merkezleri)
            px.fillStyle = '#fff'; px.fillRect(0, 0, 560, 150);
            const yb = 140, sc = 118 / maxD, ter = xx => { const i = PR * GW + xx; return m[i] ? maxD - dist[i] : maxD; };
            if (step === 2) for (let xx = 0; xx < GW; xx++) {
                const i = PR * GW + xx, tr = ter(xx); if (!lab[i] || tr > level) continue;
                const w = WC[lab[i] - 1]; px.fillStyle = `rgba(${w[0]},${w[1]},${w[2]},0.75)`; px.fillRect(xx * 2, yb - level * sc, 2, (level - tr) * sc);
            }
            px.beginPath(); px.moveTo(0, 150); for (let xx = 0; xx < GW; xx++) px.lineTo(xx * 2, yb - ter(xx) * sc); px.lineTo(560, 150); px.closePath();
            px.fillStyle = step === 0 ? '#c9d3dc' : '#4a3426'; px.fill();
            if (step === 2) { px.strokeStyle = '#1d4ed8'; px.setLineDash([5, 4]); px.beginPath(); px.moveTo(0, yb - level * sc); px.lineTo(560, yb - level * sc); px.stroke(); px.setLineDash([]); }
            px.fillStyle = '#00426a'; px.font = 'bold 12px "JetBrains Mono", monospace'; px.fillText(step === 2 ? 'kesit: su seviyesi yükseliyor' : 'kesit (kesikli çizgi boyunca)', 10, 16);
        }
        // Meyer taşması: tohumlardan başlayıp en alçak pikselden yükselerek etiket yay (öncelik kuyruğu)
        const full = new Int8Array(N);
        (function flood() {
            const hp = [], H_ = i => maxD - dist[i];
            const push = i => { hp.push(i); let k = hp.length - 1; while (k > 0) { const p = (k - 1) >> 1; if (H_(hp[p]) <= H_(hp[k])) break; [hp[p], hp[k]] = [hp[k], hp[p]]; k = p; } };
            const pop = () => {
                const top = hp[0], last = hp.pop();
                if (hp.length) { hp[0] = last; let k = 0; for (;;) { const l = 2 * k + 1, r = l + 1; let q = k; if (l < hp.length && H_(hp[l]) < H_(hp[q])) q = l; if (r < hp.length && H_(hp[r]) < H_(hp[q])) q = r; if (q === k) break; [hp[q], hp[k]] = [hp[k], hp[q]]; k = q; } }
                return top;
            };
            discs.forEach((d, k) => { const i = d[1] * GW + d[0]; full[i] = k + 1; push(i); });
            while (hp.length) {
                const i = pop(), xx = i % GW;
                for (const j of [xx > 0 ? i - 1 : -1, xx < GW - 1 ? i + 1 : -1, i - GW, i + GW]) {
                    if (j < 0 || j >= N || !m[j] || full[j]) continue; full[j] = full[i]; push(j);
                }
            }
        })();
        // su seviyesinin altında kalan pikseller görünür olur
        function grow() { for (let i = 0; i < N; i++) lab[i] = m[i] && maxD - dist[i] <= level ? full[i] : 0; }
        function setStep(s) {
            cancelAnimationFrame(anim); step = s;
            document.querySelectorAll('[data-ws]').forEach(b => b.classList.toggle('on', +b.dataset.ws === s));
            const rd = $('ws-read');
            if (s === 0) { rd.innerHTML = 'Maske: <b>1</b> nesne (yanlış! üç hücre var)'; render(); }
            else if (s === 1) { rd.innerHTML = 'Merkezler kenardan en uzak noktalar → <b>3 tepe = 3 tohum</b>'; render(); }
            else {
                lab.fill(0); level = 0;
                rd.innerHTML = 'Su basıyor…'; let fr = 0;
                const f = () => {
                    level = Math.min(maxD, level + maxD / 130); grow(); render(); if (++fr % 9 === 0) S.drop();
                    if (level < maxD) anim = requestAnimationFrame(f);
                    else { rd.innerHTML = 'Havza: <b>3 hücre ✓</b> · kırmızı çizgiler = sular buluştu = sınır'; S.chime(); }
                };
                anim = requestAnimationFrame(f);
            }
        }
        document.querySelectorAll('[data-ws]').forEach(b => b.addEventListener('click', () => { S.click(); setStep(+b.dataset.ws); }));
        IL.enter('water', () => setStep(0));
        IL.leave('water', () => cancelAnimationFrame(anim));
    })();

    // =============== KURAL vs ÖĞRENME: gerçek hücre kesitleri ===============
    (function learn() {
        const host = $('learn-crops'); let built = false, run = 0;
        const pick = [['00000', 'RBC', 78, 336, 184, 435], ['00098', 'WBC', 178, 130, 360, 311], ['00000', 'RBC', 63, 237, 169, 336], ['00098', 'Platelets', 29, 414, 72, 449],
            ['00098', 'RBC', 371, 278, 481, 380], ['00010', 'WBC', 23, 229, 204, 421], ['00000', 'RBC', 214, 362, 320, 461], ['00098', 'RBC', 105, 221, 191, 322],
            ['00000', 'WBC', 260, 177, 491, 376], ['00010', 'RBC', 275, 166, 358, 253], ['00098', 'RBC', 377, 153, 466, 244], ['00000', 'RBC', 155, 74, 247, 174]];
        const short = { RBC: 'RBC', WBC: 'WBC', Platelets: 'PLT' };
        async function go() {
            await ready; const my = ++run;
            if (!built) {
                built = true;
                pick.forEach(p => {
                    const d = document.createElement('div'); d.className = 'crop'; const c = document.createElement('canvas'); c.width = c.height = 148;
                    const w = p[4] - p[2], h = p[5] - p[3], s = Math.max(w, h), cx = (p[2] + p[4]) / 2, cy = (p[3] + p[5]) / 2;
                    c.getContext('2d').drawImage(IMG[p[0]], cx - s / 2, cy - s / 2, s, s, 0, 0, 148, 148);
                    const sp = document.createElement('span'); sp.textContent = short[p[1]]; sp.style.background = COL[p[1]];
                    d.appendChild(c); d.appendChild(sp); host.appendChild(d);
                });
            }
            const items = [...host.children]; items.forEach(i => i.classList.remove('on')); $('learn-out').textContent = 'model';
            await IL.sleep(500);
            for (const it of items) { if (my !== run) return; it.classList.add('on'); S.blip(520); await IL.sleep(170); }
            const br = $('learn-brain'); br.classList.add('pulse');
            for (const t of ['öğreniyor…', 'RBC ✓', 'WBC ✓', 'PLT ✓', 'hazır ✓']) { if (my !== run) return; $('learn-out').textContent = t; S.pop(); await IL.sleep(650); }
            S.ding(); br.classList.remove('pulse');
        }
        IL.enter('learn', go);
        IL.leave('learn', () => { run++; });
    })();

    // =============== EVRİŞİM ===============
    (function conv() {
        const ci = $('cv-in'), xi = ci.getContext('2d'), co = $('cv-out'), xo = co.getContext('2d'), GW = 96, GH = 80, SC = 4;
        const K = {
            blur: { k: [1, 2, 1, 2, 4, 2, 1, 2, 1], d: 16, o: 0, lbl: '÷16' },
            sharp: { k: [0, -1, 0, -1, 5, -1, 0, -1, 0], d: 1, o: 0 },
            edge: { k: [-1, -1, -1, -1, 8, -1, -1, -1, -1], d: 1, o: 0, abs: true, g: 1.8 },
            emboss: { k: [-2, -1, 0, -1, 1, 1, 0, 1, 2], d: 1, o: 128 },
        };
        let g = null, gb = null, cur = 'blur', anim = 0;
        const si = document.createElement('canvas'); si.width = GW; si.height = GH; const sx = si.getContext('2d');
        const so = document.createElement('canvas'); so.width = GW; so.height = GH; const sox = so.getContext('2d');
        function prep() {
            if (g) return; const c = document.createElement('canvas'); c.width = GW; c.height = GH; const x = c.getContext('2d');
            x.drawImage(IMG['00000'], 200, 140, 320, 266, 0, 0, GW, GH); const d = x.getImageData(0, 0, GW, GH).data; g = new Float32Array(GW * GH);
            for (let i = 0; i < GW * GH; i++) g[i] = 0.3 * d[i * 4] + 0.59 * d[i * 4 + 1] + 0.11 * d[i * 4 + 2];
            // kenar filtresi için hafif yumuşatılmış kopya (JPEG gürültüsü kenar sanılmasın)
            gb = new Float32Array(GW * GH);
            for (let y = 0; y < GH; y++) for (let xx = 0; xx < GW; xx++) {
                let s = 0, w = 0; for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) { const yy = y + dy, x2 = xx + dx; if (yy < 0 || x2 < 0 || yy >= GH || x2 >= GW) continue; const k = (2 - Math.abs(dx)) * (2 - Math.abs(dy)); s += k * g[yy * GW + x2]; w += k; }
                gb[y * GW + xx] = s / w;
            }
            const im = sx.createImageData(GW, GH); for (let i = 0; i < GW * GH; i++) { im.data[i * 4] = im.data[i * 4 + 1] = im.data[i * 4 + 2] = g[i]; im.data[i * 4 + 3] = 255; } sx.putImageData(im, 0, 0);
        }
        function kern() {
            const k = K[cur]; $('cv-k').innerHTML = k.k.map(v => `<div class="${v < 0 ? 'neg' : ''}">${v}</div>`).join('') + (k.lbl ? `<div style="grid-column:span 3; height:26px; font-size:14px">${k.lbl}</div>` : '');
        }
        function run() {
            cancelAnimationFrame(anim); prep(); kern(); const k = K[cur], out = sox.createImageData(GW, GH); let row = 0;
            for (let i = 0; i < GW * GH; i++) out.data[i * 4 + 3] = 255;
            const f = () => {
                for (let r = 0; r < 2 && row < GH; r++, row++) for (let xx = 0; xx < GW; xx++) {
                    let s = 0; for (let j = 0; j < 9; j++) { const yy = Math.min(GH - 1, Math.max(0, row + ((j / 3) | 0) - 1)), x2 = Math.min(GW - 1, Math.max(0, xx + (j % 3) - 1)); s += k.k[j] * (k.abs ? gb : g)[yy * GW + x2]; }
                    s = s / k.d + k.o;
                    const v = Math.max(0, Math.min(255, k.abs ? Math.abs(s) * k.g : s)), p = (row * GW + xx) * 4; out.data[p] = out.data[p + 1] = out.data[p + 2] = v;
                }
                sox.putImageData(out, 0, 0);
                xi.imageSmoothingEnabled = false; xi.drawImage(si, 0, 0, GW * SC, GH * SC);
                xo.imageSmoothingEnabled = false; xo.fillStyle = '#e6ebf0'; xo.fillRect(0, 0, GW * SC, GH * SC); xo.drawImage(so, 0, 0, GW * SC, GH * SC);
                if (row < GH) {
                    const wx = (Date.now() / 3 % GW) | 0;
                    xi.strokeStyle = '#ffd400'; xi.lineWidth = 3; xi.strokeRect((wx - 1) * SC, (row - 1) * SC, 3 * SC, 3 * SC);
                    xi.fillStyle = 'rgba(255,212,0,0.18)'; xi.fillRect(0, (row - 1) * SC, GW * SC, 3 * SC);
                    xo.fillStyle = '#ef233c'; xo.fillRect(0, row * SC, GW * SC, 3);
                    if (row % 8 === 0) S.tick(); anim = requestAnimationFrame(f);
                }
            };
            anim = requestAnimationFrame(f);
        }
        $('cv-tabs').addEventListener('click', e => {
            const b = e.target.closest('.btn'); if (!b) return; cur = b.dataset.k;
            $('cv-tabs').querySelectorAll('.btn').forEach(z => z.classList.toggle('on', z === b)); S.click(); run();
        });
        IL.enter('conv', () => ready.then(run));
        IL.leave('conv', () => cancelAnimationFrame(anim));
    })();

    // =============== U-NET ===============
    (function unet() {
        const svg = $('unet-svg'), NS = 'http://www.w3.org/2000/svg';
        const el = (t, a, p) => { const e = document.createElementNS(NS, t); for (const k in a) e.setAttribute(k, a[k]); (p || svg).appendChild(e); return e; };
        const lv = [{ h: 130, w: 14 }, { h: 100, w: 20 }, { h: 74, w: 28 }, { h: 54, w: 36 }], bot = { h: 44, w: 44 };
        const top = i => 22 + i * 82, encX = [40, 112, 184, 256], decX = [608, 536, 464, 392];
        el('defs', {}).innerHTML = '<marker id="ua" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse"><path d="M0 0 L10 5 L0 10z" fill="#6d6e71"/></marker>' +
            '<radialGradient id="ug"><stop offset="0" stop-color="#fff"/><stop offset="1" stop-color="#ffd400" stop-opacity="0"/></radialGradient>';
        const cen = [];
        lv.forEach((l, i) => {
            const y = top(i);
            [0, 1].forEach(k => el('rect', { x: encX[i] + k * (l.w + 4), y, width: l.w, height: l.h, rx: 4, fill: '#00426a', opacity: 0.88 - k * 0.15, class: 'blk' }));
            [0, 1].forEach(k => el('rect', { x: decX[i] - l.w * 2 - 4 + k * (l.w + 4), y, width: l.w, height: l.h, rx: 4, fill: '#cd061e', opacity: 0.75 + k * 0.13, class: 'blk' }));
            const ym = y + l.h / 2;
            el('line', { x1: encX[i] + l.w * 2 + 10, y1: ym, x2: decX[i] - l.w * 2 - 12, y2: ym, stroke: '#f59e0b', 'stroke-width': 3, class: 'skip', 'marker-end': 'url(#ua)' });
            cen.push([encX[i] + l.w + 2, ym]);
        });
        const by = top(4) - 6; el('rect', { x: 350 - bot.w, y: by, width: bot.w * 2, height: bot.h, rx: 6, fill: '#f59e0b' });
        for (let i = 0; i < 3; i++) {
            el('path', { d: `M${encX[i] + lv[i].w} ${top(i) + lv[i].h + 4} L${encX[i + 1] + lv[i + 1].w} ${top(i + 1) - 6}`, stroke: '#00426a', 'stroke-width': 2.5, fill: 'none', 'marker-end': 'url(#ua)' });
            el('path', { d: `M${decX[i + 1] - lv[i + 1].w} ${top(i + 1) - 6} L${decX[i] - lv[i].w} ${top(i) + lv[i].h + 4}`, stroke: '#cd061e', 'stroke-width': 2.5, fill: 'none', 'marker-end': 'url(#ua)' });
        }
        el('path', { d: `M${encX[3] + lv[3].w} ${top(3) + lv[3].h + 4} L${350 - 20} ${by - 4}`, stroke: '#00426a', 'stroke-width': 2.5, fill: 'none', 'marker-end': 'url(#ua)' });
        el('path', { d: `M${350 + 20} ${by - 4} L${decX[3] - lv[3].w} ${top(3) + lv[3].h + 4}`, stroke: '#cd061e', 'stroke-width': 2.5, fill: 'none', 'marker-end': 'url(#ua)' });
        [['Kodlayıcı', 120, 395, '#00426a'], ['Kod çözücü', 580, 395, '#cd061e'], ['darboğaz', 350, by + bot.h + 20, '#a35f00']].forEach(([s, x, y, c]) => {
            const t = el('text', { x, y, fill: c, 'font-family': 'Outfit, sans-serif', 'font-weight': 800, 'font-size': s === 'darboğaz' ? 15 : 20, 'text-anchor': 'middle' }); t.textContent = s;
        });
        const sk = el('text', { x: 350, y: 14, fill: '#a35f00', 'font-family': 'Inter, sans-serif', 'font-weight': 700, 'font-size': 13, 'text-anchor': 'middle' }); sk.textContent = 'atlama bağlantıları (köprüler)';
        const pathD = `M${cen[0][0]} ${cen[0][1]} L${cen[1][0]} ${cen[1][1]} L${cen[2][0]} ${cen[2][1]} L${cen[3][0]} ${cen[3][1]} L350 ${by + bot.h / 2} ` +
            [3, 2, 1, 0].map(i => `L${decX[i] - lv[i].w - 2} ${top(i) + lv[i].h / 2}`).join(' ');
        const dot = el('circle', { r: 13, fill: 'url(#ug)' }); const dot2 = el('circle', { r: 5, fill: '#fff' });
        [dot, dot2].forEach(d => el('animateMotion', { dur: '3.2s', repeatCount: 'indefinite', path: pathD }, d));
        // giriş / çıkış küçük resimleri
        ready.then(() => {
            const ci = $('un-in').getContext('2d'); ci.drawImage(IMG['00098'], 80, 60, 480, 384, 0, 0, 200, 160);
            const o = otsu('00098'), sg = segment('00098', o.t + 6, 120), c = document.createElement('canvas'); c.width = W; c.height = H; const x = c.getContext('2d');
            const im = x.createImageData(W, H);
            for (let i = 0; i < W * H; i++) { const L = sg.lab[i], j = i * 4; if (L && sg.keep[L]) { const cc = hsl((L * 137.5) % 360, 0.75, 0.6); im.data[j] = cc[0]; im.data[j + 1] = cc[1]; im.data[j + 2] = cc[2]; } else { im.data[j] = 0; im.data[j + 1] = 26; im.data[j + 2] = 44; } im.data[j + 3] = 255; }
            x.putImageData(im, 0, 0); $('un-out').getContext('2d').drawImage(c, 80, 60, 480, 384, 0, 0, 200, 160);
        });
    })();

    // =============== IoU / Dice ===============
    (function iou() {
        const svg = $('iou-svg'), NS = 'http://www.w3.org/2000/svg', dxs = $('iou-dx'), rs = $('iou-r');
        svg.setAttribute('viewBox', '0 0 600 400');
        svg.innerHTML = '<defs><clipPath id="gtc"><circle cx="220" cy="200" r="100"/></clipPath></defs>' +
            '<circle cx="220" cy="200" r="100" fill="rgba(15,157,88,0.14)" stroke="#0f9d58" stroke-width="4" stroke-dasharray="12 8"/>' +
            '<circle id="pc" cx="260" cy="200" r="100" fill="rgba(205,6,30,0.10)" stroke="#cd061e" stroke-width="4"/>' +
            '<circle id="ic" cx="260" cy="200" r="100" fill="rgba(245,158,11,0.6)" clip-path="url(#gtc)"/>' +
            '<text x="120" y="70" font-family="Outfit" font-weight="800" font-size="22" fill="#0f9d58">uzman</text>' +
            '<text id="pt" x="330" y="70" font-family="Outfit" font-weight="800" font-size="22" fill="#cd061e">model</text>';
        const r1 = 100; let wasOk = null;
        function upd() {
            const d = +dxs.value, r2 = +rs.value; $('iou-dxv').textContent = d; $('iou-rv').textContent = r2;
            ['pc', 'ic'].forEach(id => { const c = svg.querySelector('#' + id); c.setAttribute('cx', 220 + d); c.setAttribute('r', r2); });
            svg.querySelector('#pt').setAttribute('x', Math.min(520, 240 + d + r2 * 0.4));
            let I;
            if (d >= r1 + r2) I = 0; else if (d <= Math.abs(r1 - r2)) I = Math.PI * Math.min(r1, r2) ** 2;
            else {
                I = r1 * r1 * Math.acos((d * d + r1 * r1 - r2 * r2) / (2 * d * r1)) + r2 * r2 * Math.acos((d * d + r2 * r2 - r1 * r1) / (2 * d * r2))
                    - 0.5 * Math.sqrt((-d + r1 + r2) * (d + r1 - r2) * (d - r1 + r2) * (d + r1 + r2));
            }
            const A1 = Math.PI * r1 * r1, A2 = Math.PI * r2 * r2, iouV = I / (A1 + A2 - I), dice = 2 * I / (A1 + A2);
            const fmt = v => v.toFixed(2).replace('.', ','), col = v => v < 0.5 ? '#cd061e' : v < 0.75 ? '#d97706' : '#0f9d58';
            $('iou-v').textContent = fmt(iouV); $('iou-v').style.color = col(iouV); $('dice-v').textContent = fmt(dice);
            const ok = iouV >= 0.5; if (wasOk !== null && ok !== wasOk) ok ? S.ding() : S.buzz(); wasOk = ok;
        }
        [dxs, rs].forEach(s => s.addEventListener('input', () => { upd(); S.tick(); }));
        document.querySelectorAll('[data-p]').forEach(b => b.addEventListener('click', async () => {
            const [td, tr] = b.dataset.p.split(',').map(Number), d0 = +dxs.value, r0 = +rs.value;
            for (let i = 1; i <= 18; i++) { const e = 1 - Math.pow(1 - i / 18, 3); dxs.value = d0 + (td - d0) * e; rs.value = r0 + (tr - r0) * e; upd(); await IL.sleep(22); }
        }));
        IL.enter('iou', () => { wasOk = null; upd(); });
    })();

    // =============== DOĞRULUK TUZAĞI ===============
    (function acc() {
        const w = $('waf'); const wbc = new Set([7, 23, 38, 51, 66, 74, 88, 95]);
        for (let i = 0; i < 100; i++) { const d = document.createElement('i'); if (wbc.has(i)) d.className = 'w'; d.style.transitionDelay = (i * 9) + 'ms'; w.appendChild(d); }
        IL.enter('acc', () => { w.classList.remove('on', 'judge'); setTimeout(() => w.classList.add('on'), 200); });
        IL.wafJudge = () => { w.classList.add('judge'); S.buzz(); };
    })();

    // =============== UYGULAMA HARİTASI ===============
    document.querySelectorAll('.map .mp').forEach(m => m.addEventListener('click', () => {
        m.classList.toggle('done'); if (m.classList.contains('done')) { S.ding(); if (document.querySelectorAll('.map .mp.done').length === 10) { S.fanfare(); IL.confetti(); } } else S.click();
    }));
    IL.enter('end', () => setTimeout(IL.confetti, 600));

    IL.start({ foot: 'TÜBİTAK 2237 · KTÜ İLAFAR · Hücreden Koda' });
})();
