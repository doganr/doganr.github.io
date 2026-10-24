/* Başarılı Bir Proje Dosyası · etkileşimli parçalar */
(function () {
    const $ = id => document.getElementById(id);
    const S = IL.sfx;

    // ---------- kapak: kendini yazan proje dosyası, büyüyen iş-zaman çizelgesi, panel damgası ----------
    (function cover() {
        const cv = $('cover-cv'), x = cv.getContext('2d'), Z = 960;
        const secs = [['Özgün Değer', '#00426a'], ['Yöntem', '#cd061e'], ['Proje Yönetimi', '#f59e0b'], ['Yaygın Etki', '#0f9d58']];
        const IP = [[0, 3], [4, 12], [4, 12], [13, 15], [15, 24], [15, 24]], IPC = ['#0d9488', '#00426a', '#0b6aa2', '#7c3aed', '#cd061e', '#f59e0b'];
        IL.loop('cover', t => {
            const P = 9000, ph = (t % P) / P;
            x.clearRect(0, 0, Z, Z);
            // kâğıt
            x.save(); x.translate(Z / 2, Z / 2); x.rotate(-0.05);
            x.fillStyle = 'rgba(0,0,0,0.25)'; x.fillRect(-330 + 14, -420 + 18, 660, 840);
            x.fillStyle = '#fbfcfd'; x.fillRect(-330, -420, 660, 840);
            x.fillStyle = '#00426a'; x.fillRect(-330, -420, 660, 70);
            x.fillStyle = '#fff'; x.font = '800 30px Outfit, sans-serif'; x.textAlign = 'left'; x.fillText('ARDEB · Araştırma Önerisi', -300, -374);
            // dört bölüm, satırlar yazılıyor
            secs.forEach(([nm, c], i) => {
                const y0 = -320 + i * 118, start = i * 0.13, f = Math.max(0, Math.min(1, (ph - start) / 0.13));
                x.fillStyle = c; x.fillRect(-300, y0, 10, 92);
                x.fillStyle = '#0d2233'; x.font = '800 26px Outfit, sans-serif'; x.fillText(`${i + 1}. ${nm}`, -275, y0 + 24);
                for (let k = 0; k < 3; k++) {
                    const w = [520, 470, 380][k] * Math.max(0, Math.min(1, f * 3 - k));
                    x.fillStyle = '#d5dee7'; x.fillRect(-275, y0 + 42 + k * 18, w, 9);
                }
                if (f >= 1) { x.fillStyle = '#0f9d58'; x.font = '900 34px Outfit, sans-serif'; x.fillText('✓', 250, y0 + 28); }
            });
            // iş-zaman çizelgesi
            const g0 = 160, gf = Math.max(0, Math.min(1, (ph - 0.52) / 0.2));
            x.fillStyle = '#0d2233'; x.font = '700 20px Inter, sans-serif'; x.fillText('İş-zaman çizelgesi (24 ay)', -300, g0);
            IP.forEach(([a, b], i) => {
                const y = g0 + 18 + i * 26, X0 = -300 + a / 24 * 590, W = (b - a + 1) / 24 * 590 * gf;
                x.fillStyle = '#eef2f6'; x.fillRect(-300, y, 590, 18); x.fillStyle = IPC[i]; x.fillRect(X0, y, W, 18);
            });
            x.restore();
            // panel damgası
            const sf = Math.max(0, Math.min(1, (ph - 0.78) / 0.06));
            if (sf > 0 && ph < 0.97) {
                const sc = 2.2 - 1.2 * sf; x.save(); x.translate(Z / 2 + 170, Z / 2 + 300); x.rotate(-0.25); x.scale(sc, sc); x.globalAlpha = Math.min(1, sf * 1.5);
                x.strokeStyle = '#cd061e'; x.lineWidth = 8; x.strokeRect(-150, -48, 300, 96); x.fillStyle = '#cd061e'; x.font = '900 46px Outfit, sans-serif'; x.textAlign = 'center'; x.fillText('DESTEK ✓', 0, 16);
                x.restore();
            }
        });
    })();

    // ---------- iş-zaman çizelgesi + katkı toplamı ----------
    (function gantt() {
        const D = [['1', 'Odak dizilerinden veri seti', 'Yürütücü · danışman · 2 doktora bursiyeri', 0, 3, 10, '#0d9488'],
            ['2', 'Optimum odaklı 2B görüntüler', 'Yürütücü · araştırmacı · YL bursiyeri', 4, 12, 20, '#00426a'],
            ['3', '3B şekillerin oluşturulması', 'Yürütücü · araştırmacı · YL bursiyeri', 4, 12, 20, '#0b6aa2'],
            ['4', 'Etiketleme ve segmentasyon veri seti', 'Yürütücü · danışman · 2 doktora bursiyeri', 13, 15, 10, '#7c3aed'],
            ['5', '2B görüntülerde segmentasyon', 'Yürütücü · araştırmacı · YL bursiyeri', 15, 24, 20, '#cd061e'],
            ['6', '3B şekillerde segmentasyon', 'Yürütücü · araştırmacı · YL bursiyeri', 15, 24, 20, '#f59e0b']];
        const host = $('gantt'), st = $('stack'), bars = [];
        host.innerHTML = '<div class="axis"><div><b>İP · iş paketi · kim</b></div><div><span>0. ay</span><span>6</span><span>12</span><span>18</span><span>24. ay</span></div><div style="text-align:right"><b>katkı</b></div></div>';
        D.forEach(([no, nm, kim, a, b, k, c], i) => {
            const r = document.createElement('div'); r.className = 'gr';
            r.innerHTML = `<div class="nm"><i>İP${no}</i>${nm}<div class="tiny muted" style="font-weight:500">${kim}</div></div><div class="track"><div class="bar" style="left:${(a ? a - 1 : 0) / 24 * 100}%; width:${(b - (a ? a - 1 : 0)) / 24 * 100}%; background:${c}; transition-delay:${0.2 + i * 0.25}s"></div></div><div class="kat">%${k}</div>`;
            host.appendChild(r); bars.push(r.querySelector('.bar'));
            const s = document.createElement('div'); s.style.background = c; s.dataset.w = k; s.textContent = k; s.style.transitionDelay = (1.8 + i * 0.15) + 's'; st.appendChild(s);
        });
        IL.enter('gantt', () => {
            bars.forEach(b => { b.style.transition = 'none'; b.style.transform = 'scaleX(0)'; }); st.querySelectorAll('div').forEach(d => { d.style.transition = 'none'; d.style.width = '0'; });
            setTimeout(() => { bars.forEach(b => { b.style.transition = ''; b.style.transform = 'scaleX(1)'; }); st.querySelectorAll('div').forEach(d => { d.style.transition = ''; d.style.width = d.dataset.w + '%'; }); }, 100);
            [300, 550, 800, 1050, 1300, 1550].forEach((t, i) => setTimeout(() => S.blip(440 + i * 70), t)); setTimeout(() => S.chime(), 2900);
        });
    })();

    // ---------- paylaşım: gruba tıkla, 60 saniye ----------
    (function share() {
        const tm = $('py-timer'), bs = [...document.querySelectorAll('#py-grp .btn')];
        bs.forEach(b => b.addEventListener('click', () => {
            bs.forEach(z => { if (z.classList.contains('on')) { z.classList.remove('on'); z.classList.add('done'); } });
            b.classList.remove('done'); b.classList.add('on'); tm._reset(); tm._toggle(); S.whoosh();
        }));
        IL.leave('paylasim', () => { if (tm._reset) tm._reset(); });
    })();

    IL.start({ foot: 'TÜBİTAK 2237-A desteğiyle düzenlenmektedir · 24–25 Ekim 2026' });
})();
