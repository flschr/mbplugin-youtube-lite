(function () {
    'use strict';

    const YT_ID_PATTERN = /^[A-Za-z0-9_-]{11}$/;
    const YOUTUBE_HOST_PATTERN = /(^|\.)youtube\.com$|(^|\.)youtu\.be$/;
    const MAX_VIDEOS_PER_PAGE = 100; // Safety limit

    /**
     * Extracts YouTube video ID from various URL formats
     * Supports: watch URLs, youtu.be, shorts, embed URLs
     */
    function extractYouTubeVideoId(url) {
        const host = url.hostname.toLowerCase();

        if (!YOUTUBE_HOST_PATTERN.test(host)) {
            return null;
        }

        const segments = url.pathname.split('/').filter(Boolean);
        const firstSegment = segments[0];
        let videoId = null;

        if (/youtube\.com$/.test(host)) {
            if (firstSegment === 'shorts' && segments[1]) {
                videoId = segments[1];
            } else if (firstSegment === 'embed' && segments[1]) {
                videoId = segments[1];
            } else if ((firstSegment === 'watch' || !firstSegment) && url.searchParams.has('v')) {
                videoId = url.searchParams.get('v');
            }
        } else {
            videoId = firstSegment;
        }

        if (!videoId) {
            console.warn(`Could not extract video ID from ${url.href}`);
            return null;
        }

        if (!YT_ID_PATTERN.test(videoId)) {
            console.warn(`Invalid video ID format for ${url.href}: ${videoId}`);
            return null;
        }

        return videoId;
    }

    /**
     * Parses a time parameter value into seconds
     * Supports: plain numbers, or format like "1h2m3s"
     */
    function parseStartTimeValue(rawValue, source) {
        if (typeof rawValue !== 'string') {
            console.warn(`Ignoring ${source}: expected a string value but received`, rawValue);
            return null;
        }

        const trimmed = rawValue.trim();
        if (!trimmed) {
            console.warn(`Ignoring ${source}: value is empty`);
            return null;
        }

        // Try plain number format first
        if (/^-?\d+$/.test(trimmed)) {
            const seconds = Number.parseInt(trimmed, 10);
            if (!Number.isFinite(seconds) || seconds < 0) {
                console.warn(`Ignoring ${source}: value must be a non-negative integer (received "${rawValue}")`);
                return null;
            }
            return seconds;
        }

        // Try duration format (e.g., "1h2m3s")
        const normalized = trimmed.toLowerCase();
        const match = normalized.match(/^(?:(\d+)h)?(?:(\d+)m)?(?:(\d+)s)?$/);
        if (match && (match[1] || match[2] || match[3])) {
            const hours = match[1] ? Number.parseInt(match[1], 10) : 0;
            const minutes = match[2] ? Number.parseInt(match[2], 10) : 0;
            const seconds = match[3] ? Number.parseInt(match[3], 10) : 0;

            const total = hours * 3600 + minutes * 60 + seconds;
            if (!Number.isFinite(total) || total < 0) {
                console.warn(`Ignoring ${source}: calculated invalid duration from "${rawValue}"`);
                return null;
            }
            return total;
        }

        console.warn(`Unrecognized time format for ${source}: "${rawValue}"`);
        return null;
    }

    /**
     * Extracts start time parameters from URL (both query and fragment)
     * Refactored to eliminate code duplication
     */
    function parseParamsFromSource(params, paramList) {
        for (const { name, source } of paramList) {
            if (params.has(name)) {
                const value = params.get(name);
                const seconds = parseStartTimeValue(value, source);
                if (seconds !== null) {
                    return seconds;
                }
            }
        }
        return null;
    }

    function extractStartTimeSeconds(url) {
        // Check query parameters first
        const queryParams = [
            { name: 'start', source: 'query parameter "start"' },
            { name: 't', source: 'query parameter "t"' },
            { name: 'time_continue', source: 'query parameter "time_continue"' },
        ];

        const queryResult = parseParamsFromSource(url.searchParams, queryParams);
        if (queryResult !== null) {
            return queryResult;
        }

        // Check fragment parameters
        const hash = url.hash ? url.hash.slice(1) : '';
        if (hash) {
            const normalizedHash = hash.replace(/^\?/, '');
            let fragmentParams;

            try {
                fragmentParams = new URLSearchParams(normalizedHash);
            } catch (err) {
                console.warn(`Unable to parse fragment for ${url.href}:`, err);
                fragmentParams = null;
            }

            if (fragmentParams) {
                const fragmentSources = [
                    { name: 'start', source: 'fragment parameter "start"' },
                    { name: 't', source: 'fragment parameter "t"' },
                    { name: 'time_continue', source: 'fragment parameter "time_continue"' },
                ];

                const fragmentResult = parseParamsFromSource(fragmentParams, fragmentSources);
                if (fragmentResult !== null) {
                    return fragmentResult;
                }
            } else if (normalizedHash.startsWith('t=')) {
                const value = normalizedHash.slice(2);
                const seconds = parseStartTimeValue(value, 'fragment parameter "t"');
                if (seconds !== null) {
                    return seconds;
                }
            }
        }

        return null;
    }

    /**
     * Generates a unique identifier for a link element
     * Uses DOM position to avoid false duplicate detection
     */
    function generateLinkKey(link) {
        // Create a unique path through the DOM tree
        const path = [];
        let current = link;
        while (current && current !== document.body) {
            let index = 0;
            let sibling = current;
            while (sibling.previousElementSibling) {
                sibling = sibling.previousElementSibling;
                index++;
            }
            path.unshift(`${current.tagName.toLowerCase()}[${index}]`);
            current = current.parentElement;
        }
        return path.join('>');
    }

    function processYouTubeLinks(postClass) {
        const processedLinks = new Set();
        let videoCount = 0;

        // Select both post-content (detail pages) and e-content (homepage) elements
        const postContents = document.querySelectorAll(`.${postClass}, .e-content`);

        postContents.forEach(container => {
            const links = [...container.getElementsByTagName('a')];

            links.forEach(link => {
                // Safety limit check
                if (videoCount >= MAX_VIDEOS_PER_PAGE) {
                    console.warn(`Reached maximum video limit (${MAX_VIDEOS_PER_PAGE}), skipping remaining links`);
                    return;
                }

                if (!link.href) return;

                const host = (link.hostname || '').toLowerCase();
                if (!host || !YOUTUBE_HOST_PATTERN.test(host)) {
                    return;
                }

                let url;
                try {
                    url = new URL(link.href);
                } catch (err) {
                    console.warn(`Skipping invalid URL ${link.href}:`, err);
                    return;
                }

                const ytId = extractYouTubeVideoId(url);
                if (!ytId) {
                    return;
                }

                // Find the paragraph containing the link
                const paragraph = link.closest('p');
                if (!paragraph) {
                    console.warn(`No paragraph found for link ${link.href}`);
                    return;
                }

                // Create unique key based on DOM position to prevent false duplicates
                const linkKey = generateLinkKey(link);

                if (processedLinks.has(linkKey)) {
                    return;
                }
                processedLinks.add(linkKey);

                // Create lite-youtube element
                const video = document.createElement('lite-youtube');
                video.setAttribute('videoid', ytId);
                video.setAttribute('playlabel', link.innerText || 'Play Video');

                const startSeconds = extractStartTimeSeconds(url);
                if (startSeconds !== null) {
                    const existingParams = video.getAttribute('params') || '';
                    const params = new URLSearchParams(existingParams);
                    params.set('start', String(startSeconds));
                    const serialized = params.toString();
                    if (serialized) {
                        video.setAttribute('params', serialized);
                    }
                }

                // Insert video right after the paragraph
                paragraph.insertAdjacentElement('afterend', video);
                videoCount++;
            });
        });

        console.log(`Processed ${videoCount} YouTube video(s)`);
    }

    function initLiteYouTube(postClass) {
        // Check if customElements is available (lite-youtube needs it)
        if (typeof customElements === 'undefined') {
            console.warn('Custom elements not supported - lite-youtube will not work');
            return;
        }

        let processed = false;
        let timeoutId = null;

        // Wait for the lite-youtube custom element to be defined before creating elements
        customElements.whenDefined('lite-youtube').then(() => {
            if (!processed) {
                processed = true;
                if (timeoutId !== null) {
                    clearTimeout(timeoutId);
                    timeoutId = null;
                }
                processYouTubeLinks(postClass);
            }
        }).catch(err => {
            console.error('Error loading lite-youtube:', err);
        });

        // Fallback: if after 3 seconds the element still isn't defined, try anyway
        timeoutId = setTimeout(() => {
            if (!processed) {
                console.warn('lite-youtube not defined after 3s, attempting to process anyway');
                processed = true;
                timeoutId = null;
                processYouTubeLinks(postClass);
            }
        }, 3000);
    }

    // Export initialization function
    window.initLiteYouTube = initLiteYouTube;
})();
