## Lite YouTube for Micro.blog

This plugin appends a [lite-youtube](https://github.com/paulirish/lite-youtube-embed) embed at the end of any post that includes a YouTube link (it also works with multiple links in one post).

### Example

**Before**:

![before](before.png)

**After**:

![after](after.png)

## Installation

1. Find [Lite YouTube for Micro.blog](https://micro.blog/account/plugins/view/83) in the plug-in directory
2. Install to the site you want to install to and press install
3. Ta-da! It's installed

### Configuration

1. Go to _plug-ins_ and pressing settings next to _Lite YouTube for Micro.blog_
2. Set the class name on the element for the posts on your blog
3. Click _Update Settings_

The plugin automatically includes the necessary styles and scripts via these partials:
- `lite-youtube-head.html` (included in `<head>`) - Contains CSS styles
- `lite-youtube-footer.html` (included before `</body>`) - Contains JavaScript

For advanced usage, you can also use the individual partials:
- `lite-youtube-styles.html` - Just the CSS styles
- `lite-youtube-embed.html` - Just the JavaScript

These unique names ensure the plugin won't conflict with or override your theme's own `head.html` or `footer.html` partials.