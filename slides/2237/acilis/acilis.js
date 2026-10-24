/* Açılış sunumu · etkileşimli parçalar */
(function () {
    const $ = id => document.getElementById(id);
    const S = IL.sfx;

    // ---------- kapak: üç disiplin (sağlık · mühendislik · hukuk) ortadaki projede buluşuyor ----------
    (function cover() {
        const cv = $('cover-cv'), x = cv.getContext('2d'), Z = 1000, C = Z / 2;
        const HUB = [{ x: C, y: 150, c: '#ff5a6e', e: '🩺', t: 'Sağlık' }, { x: 150, y: 760, c: '#5fb4ff', e: '💻', t: 'Mühendislik' }, { x: 850, y: 760, c: '#fbbf24', e: '⚖️', t: 'Hukuk' }];
        const P = [];
        HUB.forEach((h, k) => { for (let i = 0; i < 26; i++) P.push({ k, a: Math.random() * 6.28, r: 60 + Math.random() * 110, s: (0.003 + Math.random() * 0.006) * (Math.random() < 0.5 ? 1 : -1), f: 0, go: 0 }); });
        IL.loop('cover', t => {
            x.clearRect(0, 0, Z, Z);
            const pulse = 0.5 + 0.5 * Math.sin(t / 700);
            // merkez
            const g = x.createRadialGradient(C, 560, 10, C, 560, 170); g.addColorStop(0, 'rgba(255,255,255,0.35)'); g.addColorStop(1, 'rgba(255,255,255,0)');
            x.fillStyle = g; x.beginPath(); x.arc(C, 560, 170, 0, 6.283); x.fill();
            // merkezden hub'lara bağlar
            HUB.forEach(h => {
                x.strokeStyle = h.c; x.globalAlpha = 0.35; x.lineWidth = 4; x.setLineDash([14, 12]); x.lineDashOffset = -t / 30;
                x.beginPath(); x.moveTo(h.x, h.y); x.lineTo(C, 560); x.stroke(); x.setLineDash([]); x.globalAlpha = 1;
            });
            // parçacıklar: hub çevresinde döner, ara sıra merkeze uçar
            const pos = P.map(p => {
                const h = HUB[p.k]; p.a += p.s;
                if (!p.go && Math.random() < 0.0015) p.go = 1;
                if (p.go) { p.f = Math.min(1, p.f + 0.008); if (p.f >= 1) { p.go = 0; p.f = 0; } }
                const hx = h.x + Math.cos(p.a) * p.r, hy = h.y + Math.sin(p.a) * p.r * 0.8, e = p.f < 0.5 ? 2 * p.f * p.f : 1 - Math.pow(-2 * p.f + 2, 2) / 2, k = p.go ? Math.sin(e * Math.PI) : 0;
                return { x: hx + (C - hx) * k, y: hy + (560 - hy) * k, c: h.c };
            });
            for (let i = 0; i < pos.length; i++) for (let j = i + 1; j < pos.length; j++) {
                const d = Math.hypot(pos[i].x - pos[j].x, pos[i].y - pos[j].y); if (d > 120) continue;
                x.strokeStyle = pos[i].c === pos[j].c ? pos[i].c : '#ffffff'; x.globalAlpha = (1 - d / 120) * 0.45; x.lineWidth = 1.5;
                x.beginPath(); x.moveTo(pos[i].x, pos[i].y); x.lineTo(pos[j].x, pos[j].y); x.stroke();
            }
            x.globalAlpha = 1;
            pos.forEach(p => { x.fillStyle = p.c; x.beginPath(); x.arc(p.x, p.y, 5, 0, 6.283); x.fill(); });
            HUB.forEach(h => {
                x.fillStyle = 'rgba(0,26,44,0.85)'; x.beginPath(); x.arc(h.x, h.y, 62, 0, 6.283); x.fill(); x.strokeStyle = h.c; x.lineWidth = 5; x.stroke();
                x.font = '56px "Segoe UI Emoji", "Apple Color Emoji", sans-serif'; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillText(h.e, h.x, h.y + 2);
                x.fillStyle = '#fff'; x.font = '800 30px Outfit, sans-serif'; x.fillText(h.t, h.x, h.y + (h.y < 300 ? -92 : 98));
            });
            x.fillStyle = '#fff'; x.beginPath(); x.arc(C, 560, 64 + pulse * 6, 0, 6.283); x.fill();
            x.fillStyle = '#cd061e'; x.font = '900 30px Outfit, sans-serif'; x.textAlign = 'center'; x.fillText('PROJE', C, 562);
        });
    })();

    // ---------- 20 katılımcı → 5 karma grup ----------
    (function groups() {
        const host = $('grp-dots'), W = 640, H = 340, G = [[90, 80], [320, 80], [550, 80], [205, 250], [435, 250]], dots = [];
        G.forEach((g, k) => {
            const c = document.createElement('div'); c.className = 'g'; c.style.left = (g[0] - 56) + 'px'; c.style.top = (g[1] - 56) + 'px'; host.appendChild(c);
            const l = document.createElement('div'); l.className = 'gl'; l.textContent = 'GRUP ' + (k + 1); l.style.left = (g[0] - 56) + 'px'; l.style.top = (g[1] + 60) + 'px'; host.appendChild(l);
        });
        for (let i = 0; i < 20; i++) {
            const d = document.createElement('div'); d.className = 'd'; const saglik = i % 2 === 0;
            d.style.background = saglik ? 'rgba(205,6,30,0.15)' : 'rgba(0,66,106,0.15)'; d.style.border = '2px solid ' + (saglik ? '#cd061e' : '#00426a'); d.textContent = saglik ? '🩺' : '💻';
            host.appendChild(d); const g = G[Math.floor(i / 4)], a = (i % 4) * Math.PI / 2 + Math.PI / 4;
            dots.push({ d, x: g[0] + Math.cos(a) * 30 - 17, y: g[1] + Math.sin(a) * 30 - 17, sx: (i % 10) * 64 + 4, sy: Math.floor(i / 10) * 60 + 120 });
        }
        const line = () => dots.forEach(o => { o.d.style.transition = 'none'; o.d.style.transform = `translate(${o.sx}px, ${o.sy}px)`; });
        line();
        IL.enter('katilimci', () => {
            line();
            setTimeout(() => { dots.forEach((o, i) => { o.d.style.transition = ''; o.d.style.transitionDelay = (i * 40) + 'ms'; o.d.style.transform = `translate(${o.x}px, ${o.y}px)`; }); S.whoosh(); }, 900);
            [1300, 1600, 1900].forEach(t => setTimeout(() => S.pop(), t));
        });
    })();

    // ---------- tanışma: 45 saniye, sıradaki kişi ----------
    (function tanisma() {
        let n = 0; const tm = $('tn-timer');
        $('tn-next').onclick = () => { n = Math.min(99, n + 1); $('tn-count').textContent = `Kişi ${n} / 20`; tm._reset(); tm._toggle(); S.whoosh(); };
        IL.leave('tanisma', () => { if (tm._reset) tm._reset(); });
    })();

    IL.start({ foot: 'TÜBİTAK 2237-A desteğiyle düzenlenmektedir · 24–25 Ekim 2026' });
})();
