# NEXT SAFE SEO PR RECOMMENDATION

Audit type: read-only. Baseline: `0ccccfa4d9268f45db993a1a82cd36d9189a5c7c`.

## Findings

| Finding | Severity | Evidence |
|---|---:|---|
| HTTPS production pages, robots.txt, and sitemap.xml return HTTP 200 | Pass | Live Production checks after PR #47 deployment. |
| Sitemap contains only `/` and `/en` on HTTPS + www | Pass | `https://www.relaxfixuae.com/sitemap.xml`. |
| robots.txt points once to the canonical sitemap | Pass | `https://www.relaxfixuae.com/robots.txt`. |
| Homepage canonicals and hreflang are consistent | Pass | Arabic canonical `/`; English canonical `/en`; reciprocal `ar-AE`, `en-AE`, and `x-default`. |
| Structured data uses Relax Fix UAE, Coach Ayman, Abu Dhabi, and the canonical URLs | Pass | Live HTML on `/` and `/en`. |
| `https://www.relaxfixuae.com/contact` returns a true HTTP 404 | Pass / cleanup signal | Live response is HTTP 404 with the application 404 page. The old URL may remain temporarily in Search Console until recrawled. |
| Open Graph and Twitter image tags are absent | Medium | Live HTML contains OG title/description/type/url and `twitter:card`, but no `og:image` or `twitter:image`. |
| HTTP and non-www normalization needs a clean external redirect-chain assertion | Low / verify | Vercel shows permanent redirect behavior, but the tool-added authenticated query parameter prevents treating that trace as final public-chain evidence. Production aliases include both apex and www. |
| Old `http://relaxfixuae.com` and `/contact` discoveries are historical, not sitemap entries | Informational | Neither appears in the current sitemap; `/contact` returns 404. |

## One recommended smallest PR

**Add one approved, stable social sharing image and reference it from both public language routes using `og:image` and `twitter:image`.**

Why this PR: the current social metadata explicitly requests `summary_large_image` but supplies no image URL. This is a contained metadata gap with no routing, booking, database, privacy, analytics, or indexing impact.

### Expected files to change

Exact paths must be confirmed during implementation, but the expected minimal set is:

- The shared public SEO/head metadata module used by `/` and `/en`.
- One approved image under `public/` such as `public/og/relax-fix-uae.jpg`.
- Existing public SEO verification script to assert canonical HTTPS image URLs and both tags.

No sitemap, robots, booking, database, analytics, or GBP files should change.

## Risk level

**Low**, provided the image is owner-approved, accurately represents Relax Fix UAE, uses Coach Ayman’s real approved likeness when a person is shown, and is available at a stable canonical HTTPS URL.

## Test plan

1. Typecheck, lint, and production build.
2. Verify `/` and `/en` remain HTTP 200.
3. Verify canonical and hreflang values are unchanged.
4. Verify exactly one `og:image` and one `twitter:image` exist per page.
5. Verify both image URLs use `https://www.relaxfixuae.com/` and return HTTP 200 with an image Content-Type.
6. Verify sitemap and robots remain unchanged.
7. Verify booking markup remains present without submitting a booking.
8. Preview-only visual check before owner merge approval.

## Explicit execution status

No code change was made. No SEO implementation PR was created by this audit. No Search Console, indexing, GBP, Production, database, analytics, Ads, or publishing action occurred.
