# CI/CD

## Pipeline

`.github/workflows/ci.yml` runs on every push and pull request to `main`, plus
manual dispatch.

```
quality (typecheck + lint + format)
   ├─ ui: chromium   ─┐
   ├─ ui: firefox    ─┼─ publish (main only)
   ├─ ui: webkit     ─┤     └─ merge Allure results → gh-pages
   ├─ api            ─┤
   └─ a11y           ─┘
```

Design points:

- **Quality gate first.** The browser matrix does not start if typecheck, lint
  or formatting fails.
- **Only the browsers a job needs.** `npx playwright install --with-deps <project>`
  plus Chromium, because the shared auth setup project runs on Chromium. Each job
  still avoids installing the other two browsers.
- **Layer separation.** API and accessibility suites are their own jobs, so a
  UI regression never masks an API result.
- **Least privilege.** Workflow default is `contents: read`; only the publish
  job requests `contents: write`.
- **Concurrency.** Superseded runs on the same ref are cancelled.

## Artifacts

| Artifact | Contents | Retention |
| --- | --- | --- |
| `html-report-<project>` | Playwright HTML report | 7 days |
| `allure-<project>` | raw Allure results | 7 days |
| `traces-<project>` | traces, videos, screenshots (failures only) | 7 days |

## Publishing the Allure report

On `main`, the publish job downloads every `allure-*` artifact, generates one
combined report and pushes it to the `gh-pages` branch.

One-time setup on GitHub:

1. **Settings → Pages → Build and deployment → Source: Deploy from a branch**
2. Branch: `gh-pages`, folder: `/ (root)`
3. Report URL: `https://<user>.github.io/<repo>/`

The first successful run creates the branch. Until then the Pages URL 404s.

## Local parity

```bash
npm run validate          # same static gate as CI
npm run test:api          # API job
npm run test:a11y         # accessibility job
npm run test:chromium     # one browser of the UI matrix
```

`CI=true` is set automatically by GitHub Actions; locally it is unset, so
retries are 0 and workers are unconstrained.

## Scaling the suite

The matrix currently runs whole browser projects. When UI runtime exceeds the
20-minute mark, add sharding:

```yaml
strategy:
  matrix:
    project: [chromium, firefox, webkit]
    shard: [1/2, 2/2]
steps:
  - run: npx playwright test --project=${{ matrix.project }} --shard=${{ matrix.shard }}
```

Sharded runs need `--reporter=blob` and a `merge-reports` job; Allure results
merge without changes because each shard writes unique result files.

## Troubleshooting

| Symptom | Cause | Fix |
| --- | --- | --- |
| `Executable doesn't exist` | browser not installed | `npx playwright install --with-deps chromium` |
| API 403 on write | token missing or expired | re-authenticate; token is cached per `BookingApi` instance |
| UI tests redirect to login | `.auth` state missing or stale | re-run the `setup` project |
| Allure publish fails | Pages not enabled for `gh-pages` | enable Pages as above |
| Flaky failure only in CI | different viewport/timing | reproduce with `CI=true npx playwright test`, inspect trace |
