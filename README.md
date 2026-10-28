# 0x0ff5et.github.io

Cloud security projects, write-ups and security research by Prakhar (0x0ff5et).
A static, gamified site: black theme, XP and levels, quest stages for every write-up.
No build step and no dependencies. Plain HTML, CSS and JavaScript, hosted on GitHub Pages.

## Files

| File | Purpose |
|---|---|
| `index.html` | Home: hero and Recent Posts |
| `posts.html` | All posts with tag filter and search |
| `about.html` | About me |
| `aws-iam-project.html` | Write-up: Enhance Cloud Security with AWS IAM |
| `aws-secrets-manager-project.html` | Write-up: Secure Secrets with AWS Secrets Manager |
| `404.html` | Not found page |
| `styles.css` / `script.js` | Shared styles and game logic |
| `assets/` | Screenshots used by the write-ups |

## Add a new post

1. Copy an existing write-up page and edit the content. Keep one `<h2 class="stage">` per stage and the `<div class="win" id="end">` block at the end.
2. Set `data-post="your-slug"` on `<body>` and add `your-slug` to `SLUGS` at the top of `script.js`.
3. Add a card for it in `index.html` and `posts.html` (copy a `<a class="q">` block).
4. Put screenshots in `assets/<name>/` and push.

## Notes

- Visitor progress (XP, stages, badges) is saved in their own browser with `localStorage`. Nothing is sent anywhere.
- Never commit real credentials. The Secrets Manager write-up uses redacted values.
