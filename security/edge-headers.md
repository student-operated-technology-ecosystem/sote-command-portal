# Proposed GitHub Pages edge headers (review before activation)

Current public responses are served by GitHub Pages. GitHub Pages does not apply a repository `_headers` file. Keep Pages as origin and proxy the existing apex DNS record through Cloudflare; add a response-header transform rule for `professorsneaker.com` and `www.professorsneaker.com` if used. This is an infrastructure change: Cloudflare becomes the TLS edge and response-header authority. Verify its certificate and HTTPS redirect before enabling HSTS. Rollback: disable the transform and return the DNS record to DNS-only; allow cache expiry.

Start with **Content-Security-Policy-Report-Only** and inspect browser console/network across the front door, Help Desk, ticket queue, mission board/reader, Knowledge Base, classroom guided learning, infrastructure, and legacy routes. The current site uses inline scripts and styles, so this initial policy permits `'unsafe-inline'`. Move inline code into versioned assets and remove that allowance in a later reviewed change.

Suggested initial CSP value:

```
default-src 'self'; base-uri 'self'; object-src 'none'; frame-ancestors 'none'; form-action 'self' https://github.com; upgrade-insecure-requests; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https://raw.githubusercontent.com https://github.com https://*.githubusercontent.com; connect-src 'self' https://api.github.com https://raw.githubusercontent.com https://github.com https://profrinsem.github.io; font-src 'self' data:; frame-src 'none'
```

After report-only validation, apply the same value as `Content-Security-Policy` and remove report-only. Configure these response headers for all HTML and static asset responses:

```
Strict-Transport-Security: max-age=31536000
X-Content-Type-Options: nosniff
Referrer-Policy: strict-origin-when-cross-origin
Permissions-Policy: camera=(), microphone=(), geolocation=(), payment=(), usb=()
```

Do not use `includeSubDomains` or preload until every subdomain's HTTPS behavior is reviewed. Redirect HTTP to HTTPS at the edge. Verify both redirect and final responses. No internal management origin or GLPI endpoint is added to CSP or DNS.

Run `python3 scripts/check-headers.py https://professorsneaker.com/` after activation. The current GitHub Pages response is expected to fail this check; passing it requires edge deployment.
