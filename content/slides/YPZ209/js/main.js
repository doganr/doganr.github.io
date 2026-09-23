/**
 * Common Initialization Script for Bilişim Etiği Slides
 */

// Initialize Lucide Icons
if (typeof lucide !== 'undefined') {
    lucide.createIcons();
}

// ---- Kod bloklarina "Kopyala" butonu (tum haftalik slaytlar) ----
function _codeText(pre) {
    // reveal.js satir-numarali bloklar: adim basina kod cogaltilir -> SADECE ilk tabloyu al
    var table = pre.querySelector('.hljs-ln');
    if (table) {
        var cells = table.querySelectorAll('.hljs-ln-code');
        return Array.prototype.map.call(cells, function (c) { return c.textContent; }).join('\n');
    }
    // satir numarasiz highlight bloklari (birden cok code fragmenti olabilir) -> ilk code
    var code = pre.querySelector('code');
    if (code) return code.textContent;
    // manuel kod blogu: butonu cikar, kalani al
    var clone = pre.cloneNode(true);
    var b = clone.querySelector('.copy-btn');
    if (b) b.remove();
    return clone.textContent;
}

function _fallbackCopy(text) {
    var ta = document.createElement('textarea');
    ta.value = text;
    ta.style.position = 'fixed';
    ta.style.opacity = '0';
    document.body.appendChild(ta);
    ta.select();
    try { document.execCommand('copy'); } catch (e) { }
    document.body.removeChild(ta);
}

function addCopyButtons() {
    document.querySelectorAll('.reveal pre').forEach(function (pre) {
        if (pre.querySelector('.copy-btn')) return;
        var btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'copy-btn';
        btn.textContent = 'Kopyala';
        btn.addEventListener('click', function (e) {
            e.stopPropagation();
            var text = _codeText(pre);
            function done() {
                btn.textContent = 'Kopyalandı ✓';
                btn.classList.add('copied');
                setTimeout(function () { btn.textContent = 'Kopyala'; btn.classList.remove('copied'); }, 1400);
            }
            if (navigator.clipboard && navigator.clipboard.writeText) {
                navigator.clipboard.writeText(text).then(done, function () { _fallbackCopy(text); done(); });
            } else { _fallbackCopy(text); done(); }
        });
        pre.appendChild(btn);
    });
}

/**
 * Helper to initialize Reveal.js with default or custom options
 * @param {Object} customOptions - Overrides for the default configuration
 */
function initReveal(customOptions = {}) {
    const defaultOptions = {
        hash: true,
        history: true,
        center: true,
        transition: 'convex', // default transition
        backgroundTransition: 'fade',
        mouseWheel: true,
        controls: true,
        progress: true,
        width: 1200,
        height: 700,
        margin: 0.05
    };

    // Merge defaults with custom options
    const options = { ...defaultOptions, ...customOptions };

    if (typeof Reveal !== 'undefined') {
        Reveal.initialize(options);
    } else {
        console.error('Reveal.js is not loaded.');
    }

    // Watermark Logic: Toggle 'first-slide' class based on slide index
    function updateLayoutState(event) {
        const revealEl = document.querySelector('.reveal');
        if (revealEl) {
            // Check for both horizontal and vertical index to ensure it's strictly the first slide
            if (event.indexh === 0 && event.indexv === 0) {
                revealEl.classList.add('first-slide');
            } else {
                revealEl.classList.remove('first-slide');
            }
        }
    }

    // Attach Watermark Logic Listeners
    if (typeof Reveal !== 'undefined') {
        Reveal.on('ready', updateLayoutState);
        Reveal.on('slidechanged', updateLayoutState);
    }

    // Kod bloklarina kopyala butonu ekle (highlight islendikten sonra)
    if (typeof Reveal !== 'undefined') {
        Reveal.on('ready', addCopyButtons);
    }

    // Re-render icons on slide change (sometimes necessary for dynamic content)
    if (typeof Reveal !== 'undefined' && typeof lucide !== 'undefined') {
        Reveal.on('slidechanged', () => {
            lucide.createIcons();
        });
    }
}
