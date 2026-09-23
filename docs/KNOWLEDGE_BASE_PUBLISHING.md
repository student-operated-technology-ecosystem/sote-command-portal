# SOTE Knowledge Base Publishing Contract

**Version:** 1.0  
**Status:** Active

The Command Portal is the public-safe presentation layer for SOTE knowledge. The private `SOTE-framework` repository remains the controlled authoring source.

## Source of truth

Operational Knowledge Articles are authored, reviewed, and accepted in:

`student-operated-technology-ecosystem/SOTE-framework/knowledge/`

The Command Portal catalog is:

`data/knowledge-base.json`

The browser renders that catalog on:

`knowledge-base.html`

Do not maintain a second authoritative copy of operational article bodies in this public repository.

## Publication gate

A Knowledge Article may be added to the public catalog only after review confirms that it contains no:

- credentials, secrets, tokens, or private keys;
- private student or ticket information;
- sensitive internal IP or infrastructure details;
- exploitable security findings;
- unapproved screenshots or diagrams;
- content outside the intended public-safe scope.

Classroom drafts and open pull requests are not approved knowledge.

## Catalog fields

Each published entry contains:

- `id`
- `title`
- `category`
- `category_label`
- `version`
- `status`
- `summary`

This metadata is intentionally public-safe. Article bodies remain controlled in SOTE Framework until a separate public publishing decision is made.

## Publishing workflow

1. Author or revise the KA in SOTE Framework on a branch.
2. Open a pull request.
3. Review technical accuracy, safety, scope, evidence, and public-safety boundaries.
4. Merge the accepted KA into `main`.
5. Add or update its public-safe metadata in `data/knowledge-base.json`.
6. Verify search/category behavior on `knowledge-base.html`.

This contract is designed so Step 5 can later be performed by an automated cross-repository publishing workflow without changing the Command Portal page architecture.
