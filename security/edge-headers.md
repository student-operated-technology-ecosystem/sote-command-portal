# Proposed GitHub Pages edge headers (review before activation)

Current public responses are served by GitHub Pages. GitHub Pages does not apply a repository `_headers` file. The domain already delegates to macy.ns.cloudflare.com and max.ns.cloudflare.com. Keep Pages as origin; change only the existing apex web DNS record from DNS-only to proxied in the existing Cloudflare zone, then add a response-header transform rule for `professorsneaker.com` and `www.professorsneaker.com` if used. This is an infrastructure change: Cloudflare becomes the TLS edge and response-header authority. Verify its certificate and HTTPS redirect before enabling HSTS. Rollback: disable the transform and return the DNS record to DNS-only; allow cache expiry.

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

## Exact activation sequence

1. In Cloudflare DNS, preserve the existing apex target and all unrelated DNS records. Enable **Proxied** only for the ProfessorSneaker web record. Check the Cloudflare edge certificate and use **Full (strict)** SSL/TLS mode if GitHub Pages origin certificate validation succeeds.
2. Enable **Always Use HTTPS** and verify that `http://professorsneaker.com/` redirects to HTTPS. The current GitHub Pages origin already returns a 301, but the Cloudflare edge must do so after proxying.
3. In **Rules → Overview → Create rule → Response Header Transform Rule**, use the match expression `(http.host eq "professorsneaker.com")`. Set static headers `X-Content-Type-Options`, `Referrer-Policy`, and `Permissions-Policy` to the values above. Set `Content-Security-Policy-Report-Only` to the proposed CSP string.
4. Browse every active route and inspect CSP violations. Fix legitimate blocked resources by adding only the required source, and test input, navigation, Knowledge Base rendering, ticket and mission readers, and classroom learning. Once clean, replace the report-only header with `Content-Security-Policy`.
5. Add `Strict-Transport-Security: max-age=31536000` after verifying HTTPS and the certificate. Run the live checker on the apex and ticket reader. Confirm the five headers on HTML and assets. Do not enable HSTS preload or includeSubDomains.
6. Rollback the CSP rule if a page breaks. If the edge itself fails, disable proxying on the same web DNS record and restore DNS-only; leave mail and other records untouched.

Cloudflare dashboard access is required to perform steps 1–5. No Cloudflare token or connected administration tool is available in this execution environment, and the Cloudflare dashboard presented a repeated human-verification block to the cloud browser. Do not put an API token in GitHub, the portal, chat, or a public repository.
