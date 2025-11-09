# YouTube-Lite for Micro.blog

Lite YouTube for Micro.blog replaces YouTube links included in your posts with Paul Irish's [Lite YouTube Embed](https://github.com/paulirish/lite-youtube-embed) component so your posts can load quickly while still letting visitors play videos on demand. This Micro.blog plugin is forked from [rknightuk/micro-blog-lite-youtube](https://github.com/rknightuk/micro-blog-lite-youtube), many thanks to Robb Knight for the groundwork.

Whenever a post contains a YouTube link (or several links), the plug-in inserts a lightweight video player embed immediately after the paragraph that contains each link on your blog. This replacement does not happen inside RRS readers, so .... and also not with Mastodon or Bluesky. So unlike other plugins (https://github.com/flschr/mbplugin-youtube-nocookie) the appearance is not changed for RSS or mastodon, Bluesky where the link remains valid and not embedd code is seen. When a plain text link is posted, Mastodon and Bluesky even can render YouTube video thumbnail previews.

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
