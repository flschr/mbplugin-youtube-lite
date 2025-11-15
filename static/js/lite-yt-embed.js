(function () {
    'use strict';

    const PRECONNECTED = new Set();

    function addPrefetch(kind, url, as) {
        if (PRECONNECTED.has(url)) {
            return;
        }
        PRECONNECTED.add(url);

        const link = document.createElement('link');
        link.rel = kind;
        link.href = url;
        if (as) {
            link.as = as;
        }
        document.head.appendChild(link);
    }

    function warmConnections() {
        addPrefetch('preconnect', 'https://www.youtube.com');
        addPrefetch('preconnect', 'https://www.youtube-nocookie.com');
        addPrefetch('preconnect', 'https://www.google.com');
        addPrefetch('preconnect', 'https://i.ytimg.com', 'image');
        addPrefetch('preconnect', 'https://s.ytimg.com');
    }

    class LiteYTEmbed extends HTMLElement {
        constructor() {
            super();
            this._onPointerOver = this._onPointerOver.bind(this);
            this._onFocus = this._onFocus.bind(this);
            this._onClick = this._onClick.bind(this);
        }

        static get observedAttributes() {
            return ['videoid', 'playlistid', 'params', 'poster', 'playlabel', 'nocookie'];
        }

        connectedCallback() {
            if (this._initialized) {
                return;
            }
            this._initialize();
            this._initialized = true;
        }

        disconnectedCallback() {
            this.removeEventListener('pointerover', this._onPointerOver);
            this.removeEventListener('focus', this._onFocus, true);
            this.removeEventListener('click', this._onClick);
        }

        attributeChangedCallback(name, oldValue, newValue) {
            if (!this._initialized || oldValue === newValue) {
                return;
            }
            if (name === 'videoid' || name === 'playlistid') {
                this._updatePoster();
            }
            if (name === 'playlabel') {
                this._updatePlayButtonLabel();
            }
        }

        get videoId() {
            return this.getAttribute('videoid');
        }

        get playlistId() {
            return this.getAttribute('playlistid');
        }

        get playLabel() {
            return this.getAttribute('playlabel') || 'Play Video';
        }

        get posterUrl() {
            if (this.hasAttribute('poster')) {
                return this.getAttribute('poster');
            }
            if (this.videoId) {
                return `https://i.ytimg.com/vi/${encodeURIComponent(this.videoId)}/hqdefault.jpg`;
            }
            return '';
        }

        _initialize() {
            this._updatePoster();

            if (!this.querySelector('.lty-playbtn')) {
                const button = document.createElement('button');
                button.type = 'button';
                button.className = 'lty-playbtn';

                const hiddenLabel = document.createElement('span');
                hiddenLabel.className = 'lty-visually-hidden';
                hiddenLabel.textContent = this.playLabel;
                button.appendChild(hiddenLabel);

                this.appendChild(button);
            }

            this._updatePlayButtonLabel();

            this.addEventListener('pointerover', this._onPointerOver);
            this.addEventListener('focus', this._onFocus, true);
            this.addEventListener('click', this._onClick);
        }

        _updatePoster() {
            const poster = this.posterUrl;
            if (poster) {
                this.style.backgroundImage = `url('${poster}')`;
            } else {
                this.style.removeProperty('background-image');
            }
        }

        _updatePlayButtonLabel() {
            const button = this.querySelector('.lty-playbtn');
            if (!button) {
                return;
            }
            button.setAttribute('aria-label', this.playLabel);
            const hidden = button.querySelector('.lty-visually-hidden');
            if (hidden) {
                hidden.textContent = this.playLabel;
            }
        }

        _onPointerOver() {
            warmConnections();
        }

        _onFocus() {
            warmConnections();
        }

        _onClick(event) {
            event.preventDefault();
            if (this.classList.contains('lty-activated')) {
                return;
            }

            this.classList.add('lty-activated');
            const playButton = this.querySelector('.lty-playbtn');
            if (playButton) {
                playButton.remove();
            }

            const iframe = document.createElement('iframe');
            iframe.setAttribute('frameborder', '0');
            iframe.setAttribute('allow', 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share');
            iframe.setAttribute('allowfullscreen', '');
            iframe.setAttribute('title', this.playLabel);
            const src = this._buildEmbedSrc();
            if (!src) {
                console.warn('lite-youtube: Unable to build embed URL for element', this);
                return;
            }

            iframe.src = src;
            this.appendChild(iframe);
        }

        _buildEmbedSrc() {
            const params = new URLSearchParams(this.getAttribute('params') || '');
            params.set('autoplay', '1');
            params.set('playsinline', '1');

            let base = this.hasAttribute('nocookie') ? 'https://www.youtube-nocookie.com' : 'https://www.youtube.com';
            let path;

            if (this.playlistId && !this.videoId) {
                path = `/embed/videoseries?list=${encodeURIComponent(this.playlistId)}`;
            } else if (this.videoId) {
                const id = this.videoId;
                path = `/embed/${encodeURIComponent(id)}`;
                if (this.playlistId) {
                    params.set('list', this.playlistId);
                }
            } else {
                return '';
            }

            const separator = path.includes('?') ? '&' : '?';
            return `${base}${path}${separator}${params.toString()}`;
        }
    }

    if (!customElements.get('lite-youtube')) {
        customElements.define('lite-youtube', LiteYTEmbed);
    }
})();
