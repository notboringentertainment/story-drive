// TipTap Loader - Simplified CDN loading for vanilla JS
// Uses the standalone TipTap bundle with StarterKit

const TipTapLoader = {
    loaded: false,
    loadPromise: null,

    // Load TipTap from CDN using the standalone bundle
    load: function() {
        if (this.loaded) {
            return Promise.resolve();
        }

        if (this.loadPromise) {
            return this.loadPromise;
        }

        this.loadPromise = new Promise((resolve, reject) => {
            console.log('Loading TipTap from CDN...');

            // Use the standalone bundle which includes everything we need
            const script = document.createElement('script');
            script.src = 'https://unpkg.com/@tiptap/standalone@2.1.13/dist/cdn/tiptap-bundle.umd.js';

            script.onload = () => {
                console.log('TipTap bundle loaded');

                // The standalone bundle exposes everything on window
                if (window.TiptapBundle) {
                    // Map to our expected namespace
                    window.Editor = window.TiptapBundle.Editor;
                    window.TipTapCore = {
                        Editor: window.TiptapBundle.Editor,
                        StarterKit: window.TiptapBundle.StarterKit
                    };

                    this.loaded = true;
                    console.log('✅ TipTap initialized successfully');
                    resolve();
                } else {
                    reject(new Error('TipTap bundle not found on window object'));
                }
            };

            script.onerror = () => {
                reject(new Error('Failed to load TipTap bundle from CDN'));
            };

            document.head.appendChild(script);
        });

        return this.loadPromise;
    },

    // Alternative loading method using modules separately
    loadModular: function() {
        if (this.loaded) {
            return Promise.resolve();
        }

        this.loadPromise = new Promise((resolve, reject) => {
            console.log('Loading TipTap modules from CDN...');

            // Create script tags for core and starter-kit
            const loadScript = (src, globalName) => {
                return new Promise((scriptResolve, scriptReject) => {
                    const script = document.createElement('script');
                    script.src = src;

                    script.onload = () => {
                        console.log(`Loaded: ${globalName}`);
                        scriptResolve();
                    };

                    script.onerror = () => {
                        scriptReject(new Error(`Failed to load: ${src}`));
                    };

                    document.head.appendChild(script);
                });
            };

            // Load core first, then starter-kit
            Promise.all([
                loadScript('https://unpkg.com/@tiptap/core@2.1.13/dist/index.umd.js', '@tiptap/core'),
                loadScript('https://unpkg.com/@tiptap/starter-kit@2.1.13/dist/index.umd.js', '@tiptap/starter-kit')
            ])
            .then(() => {
                // After loading, check what's available
                console.log('Checking loaded modules...');

                // Different CDNs expose modules differently
                if (window.TiptapCore && window.TiptapStarterKit) {
                    window.Editor = window.TiptapCore.Editor;
                    window.TipTapCore = {
                        Editor: window.TiptapCore.Editor,
                        StarterKit: window.TiptapStarterKit.StarterKit
                    };
                } else if (window['@tiptap/core'] && window['@tiptap/starter-kit']) {
                    window.Editor = window['@tiptap/core'].Editor;
                    window.TipTapCore = {
                        Editor: window['@tiptap/core'].Editor,
                        StarterKit: window['@tiptap/starter-kit'].StarterKit
                    };
                } else {
                    // Fallback: try to find the modules
                    const core = window.Tiptap || window.TiptapCore || window['@tiptap/core'];
                    const starterKit = window.TiptapStarterKit || window['@tiptap/starter-kit'];

                    if (core && core.Editor) {
                        window.Editor = core.Editor;
                        window.TipTapCore = {
                            Editor: core.Editor,
                            StarterKit: starterKit ? starterKit.StarterKit : null
                        };
                    }
                }

                if (window.Editor) {
                    this.loaded = true;
                    console.log('✅ TipTap modules loaded successfully');
                    resolve();
                } else {
                    reject(new Error('Could not find TipTap Editor on window object'));
                }
            })
            .catch(reject);
        });

        return this.loadPromise;
    },

    // Check if TipTap is loaded
    isLoaded: function() {
        return this.loaded && window.Editor !== undefined;
    }
};

// Log availability
console.log('TipTapLoader ready. Call TipTapLoader.load() to load TipTap.');