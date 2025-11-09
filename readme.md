# YouTube-Lite for Micro.blog

Lite YouTube for Micro.blog replaces YouTube links in your posts with Paul Irish's [Lite YouTube Embed](https://github.com/paulirish/lite-youtube-embed) component so pages stay fast while visitors can still play videos on demand. The plug-in is a fork of [rknightuk/micro-blog-lite-youtube](https://github.com/rknightuk/micro-blog-lite-youtube) and builds on Robb Knight's original work.

Whenever a post contains a YouTube link, the plug-in injects a lightweight player right after the paragraph that mentions it on your blog. RSS readers, Mastodon, and Bluesky continue to show the plain link so their previews work as usual.

## Highlights

- Enhances individual posts and timeline excerpts (default `.e-content`, or your configured post class).
- Understands classic watch URLs, `youtu.be` short links, embedded URLs, and YouTube Shorts.
- Preserves start times from `start`, `t`, and `time_continue` parameters.
- Avoids duplicate embeds and adds friendly error handling.
- Loads the bundled `lite-youtube` web component with fallbacks for older browsers.

## Differences from the original plug-in

This fork keeps the same appearance as the directory's "Lite YouTube for Micro.blog" project and adds:

- Broader URL detection, including Shorts and embed links.
- Respect for shared start times so playback begins where intended.
- Inline embeds directly after each matching paragraph, including on the home page.
- Locally bundled assets and detailed runtime logging for easier troubleshooting.

### Configuration

1. Go to **Plug-ins** and click **Settings** next to **Lite YouTube for Micro.blog**.
2. Set the class name that wraps your post content (default: `post-content`).
3. Click **Update Settings**.

The plug-in automatically loads two partials:

- `lite-youtube-head.html` – CSS for the component (included in `<head>`).
- `lite-youtube-footer.html` – JavaScript for link detection and embed injection (included before `</body>`).
