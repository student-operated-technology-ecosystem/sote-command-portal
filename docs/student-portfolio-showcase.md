# Student Portfolio Showcase (employer-facing directory)

Public page: [Student Portfolios](../portfolios.html) (published at https://professorsneaker.com/portfolios.html when the site deployment completes).

## The moving parts

- Shared portal navigation in `assets/js/navigation-v2.js` adds **Student Portfolios** to the menu on pages using the shared shell.
- `portfolios.html` displays a searchable, accessible directory based on `data/portfolio-directory.json`.
- Alex Morgan is a **fictional instructional example**. Verify the live link before using it with employers.
- Student-owned portfolios are not copied into the portal. The directory links to their independently published websites and GitHub repos.
- `scripts/build_portfolio_directory.py` reads **open** issues labeled `portfolio-approved` in this repository and generates the public JSON.
- `.github/workflows/portfolio-directory.yml` automatically refreshes when issues are opened, edited, labeled, unlabeled, closed, or reopened, as well as daily and on manual dispatch.
- The directory does not discover all published GitHub Pages websites automatically. Submissions are reviewed first; after approval, updating the directory is automatic.

## One-time setup for maintainers

1. Create GitHub issue labels `portfolio-submission` (incoming requests) and **`portfolio-approved`** (instructor-approved public entries) under this repo's **Issues → Labels**, if they do not exist already.
2. In **Settings → Actions → General → Workflow permissions**, allow GitHub Actions to write repository contents; the workflow uses `GITHUB_TOKEN` and its own `contents: write` permission to commit the generated JSON. Ensure Actions are enabled.
3. Check the **Refresh approved student portfolios** workflow under Actions and run it manually once.
4. Verify https://professorsneaker.com/portfolios.html and its desktop/mobile navigation after deployment. If deploying under a GitHub Pages project URL, use the correct project-root address.
5. Verify Alex Morgan's linked GitHub Pages site separately. If not live, enable Pages for `CIT-205-classroom` before promoting the example publicly.

## Student submission and review

1. Student publishes their portfolio using https://github.com/student-operated-technology-ecosystem/cit205-portfolio-template/generate.
2. Student voluntarily opens a [portfolio submission issue](https://github.com/student-operated-technology-ecosystem/sote-command-portal/issues/new?template=student-portfolio-submission.md), enters their public display name, website, GitHub repository, professional summary and skills, and checks all three consent/safety boxes.
3. Instructor checks ownership, consent, link accessibility, evidence quality, privacy/redaction, and professional readiness. Only then add `portfolio-approved`.
4. The workflow rebuilds the directory and commits the JSON. Normal portal site deployment publishes the change.
5. To delist someone, remove `portfolio-approved` or close the issue. The workflow then removes their public card on its next successful run. For urgent removal, manually delete the JSON entry and verify deployment; fix workflow issues so it does not get republished.

## Limitations and safeguards

This is an **opt-in moderated directory**, not a scrape of student GitHub accounts. Creating or uploading a portfolio alone does not imply permission to publish the student's name. The issue body is public, so avoid sensitive information there. Approval makes the directory update automatic, but **does not** imply the student's portfolio site is auto-published: each student enables GitHub Pages in their own repository.

Do not promote Alex Morgan as a real graduate or student. The original classroom repository remains authoritative for CIT-205 assessment directions.
