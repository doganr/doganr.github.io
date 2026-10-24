/**
 * Common Initialization Script for Bilişim Etiği Slides
 */

// Initialize Lucide Icons
if (typeof lucide !== 'undefined') {
    lucide.createIcons();
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

    // Re-render icons on slide change (sometimes necessary for dynamic content)
    if (typeof Reveal !== 'undefined' && typeof lucide !== 'undefined') {
        Reveal.on('slidechanged', () => {
            lucide.createIcons();
        });
    }
}
