# Lite YouTube for Micro.blog

Lite YouTube for Micro.blog replaces standard YouTube iframes with Paul Irish's
[Lite YouTube Embed](https://github.com/paulirish/lite-youtube-embed) component so
your posts can load quickly while still letting visitors play videos on demand.
It is proudly forked from [rknightuk/micro-blog-lite-youtube](https://github.com/rknightuk/micro-blog-lite-youtube);
many thanks to the original author for the inspiration and groundwork.
Whenever a post contains a YouTube link (or several links), the plug-in inserts
a lightweight embed immediately after the paragraph that contains each link.

## Key features

- Automatically enhances both individual post pages and timeline/home page
  excerpts (elements with the configured post class and the default `.e-content`).
- Supports classic watch links, shortened `youtu.be` URLs, embedded URLs, and
  YouTube Shorts.
- Preserves share links that start at a specific timestamp by translating
  supported `start`, `t`, and `time_continue` query or fragment parameters into
  Lite YouTube player parameters.
- Adds polite error handling and duplicate detection so the same video is not
  embedded twice when a paragraph contains repeated links.
- Loads the `lite-youtube` web component from the plug-in bundle and waits for it
  to be ready before generating embeds, with a timed fallback for older
  browsers.

## What is different from the original plug-in?

This Micro.blog plug-in started as a fork of the directory's original "Lite
YouTube for Micro.blog" project. The fork keeps the same visual appearance but
adds several quality-of-life improvements:

- JavaScript has been rewritten to detect and transform more YouTube URL
  formats, including Shorts and embedded URLs, instead of only classic
  `watch?v=` links.
- Start times from share URLs are now honored so videos begin playing where the
  author intended.
- Embeds are injected right after the paragraph that contains each link (even on
  the Micro.blog home page) instead of being appended at the end of the post.
- The Lite YouTube web component is bundled locally for resilience and loaded
  with graceful fallbacks.
- Extensive runtime logging makes it easier to troubleshoot unexpected URLs
  without breaking page rendering.

### Configuration

1. Go to **Plug-ins** and click **Settings** next to **Lite YouTube for Micro.blog**.
2. Set the class name that wraps the post content on your theme (the default is
   `post-content`).
3. Click **Update Settings**.

The plug-in automatically includes the necessary styles and scripts via these
partials:

- `lite-youtube-head.html` (included in `<head>`) – CSS styles for the
  component.
- `lite-youtube-footer.html` (included before `</body>`) – JavaScript for link
  detection and embed injection.
