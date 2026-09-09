# GitHub data scripts

## hall-of-fame.js

Ranks every pull request and issue on a repository by comment count and, for
the top N of each, records who commented how often. Counts conversation comments and inline
review comments with a body. Approvals and other review actions without a
comment are not counted.

```sh
GITHUB_TOKEN=... node github/hall-of-fame.js --repo solid/specification --top 20
```

Writes `data/hall-of-fame.json`, which `src/main.js` renders on the page.

The run takes roughly 75 API calls. The unauthenticated limit is 60 per hour,
so a token is recommended. Pages are cached under `github/.cache/`; a run that
hits the rate limit resumes on re-run. Delete the cache to refresh the data.
