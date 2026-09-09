// Ranks pull requests by comment count and records who commented how often.
// Usage: GITHUB_TOKEN=... node github/hall-of-fame.js [--repo owner/name] [--top 20]
// Output: data/hall-of-fame.json

import fs from "fs";
import path from "node:path";

const args = process.argv.slice(2);
function arg(name, fallback) {
  const i = args.indexOf(name);
  return i !== -1 && args[i + 1] ? args[i + 1] : fallback;
}

const REPO = arg("--repo", "solid/specification");
const TOP = parseInt(arg("--top", "20"), 10);
const API = "https://api.github.com";
const TOKEN = process.env.GITHUB_TOKEN;

const root = path.dirname(new URL(import.meta.url).pathname);
const cacheDir = path.join(root, ".cache", REPO.replace("/", "__"));
const outputDir = path.join(root, "..", "data");
const outputPath = path.join(outputDir, "hall-of-fame.json");

fs.mkdirSync(cacheDir, { recursive: true });
fs.mkdirSync(outputDir, { recursive: true });

const headers = {
  Accept: "application/vnd.github+json",
  "User-Agent": "solid-ecosystem-monitor",
  ...(TOKEN ? { Authorization: `Bearer ${TOKEN}` } : {}),
};

function cacheKey(url) {
  return path.join(cacheDir, encodeURIComponent(url) + ".json");
}

async function get(url) {
  const key = cacheKey(url);
  if (fs.existsSync(key)) {
    return JSON.parse(fs.readFileSync(key, "utf-8"));
  }
  let res;
  for (let attempt = 1; ; attempt++) {
    res = await fetch(url, { headers });
    if (res.status < 500 || attempt >= 5) break;
    await new Promise((r) => setTimeout(r, attempt * 2000));
  }
  if (!res.ok) {
    const remaining = res.headers.get("x-ratelimit-remaining");
    const reset = res.headers.get("x-ratelimit-reset");
    if (res.status === 403 && remaining === "0") {
      const at = new Date(reset * 1000).toISOString();
      throw new Error(`Rate limit exhausted; resets at ${at}. Re-run to resume.`);
    }
    throw new Error(`${res.status} ${res.statusText} for ${url}`);
  }
  const body = await res.json();
  const link = res.headers.get("link") || "";
  const m = link.match(/<([^>]+)>;\s*rel="next"/);
  const next = m ? m[1] : null;
  fs.writeFileSync(key, JSON.stringify({ body, next }));
  return { body, next };
}

async function getAll(url, label) {
  const items = [];
  let page = 1;
  while (url) {
    process.stderr.write(`\r${label}: page ${page}   `);
    const { body, next } = await get(url);
    items.push(...body);
    url = next;
    page++;
  }
  process.stderr.write(`\r${label}: ${items.length} items\n`);
  return items;
}

function numberFromUrl(url) {
  return parseInt(url.split("/").pop(), 10);
}

function toEntry(item) {
  return {
    number: item.number,
    title: item.title,
    url: item.html_url,
    author: item.user?.login,
    state: item.merged_at ? "merged" : item.state,
    created_at: item.created_at,
    closed_at: item.closed_at,
    issue_comments: 0,
    review_comments: 0,
    commenters: {},
  };
}

function rank(entries) {
  return entries
    .map((e) => ({
      ...e,
      total: e.issue_comments + e.review_comments,
      commenters: Object.entries(e.commenters)
        .map(([login, count]) => ({ login, count }))
        .sort((a, b) => b.count - a.count || a.login.localeCompare(b.login)),
    }))
    .sort((a, b) => b.total - a.total || a.number - b.number)
    .slice(0, TOP);
}

function print(label, total, top) {
  console.log(`\nTop ${top.length} of ${total} ${label} in ${REPO}:`);
  for (const e of top) {
    console.log(`#${e.number}  ${String(e.total).padStart(4)}  ${e.title}`);
  }
}

async function main() {
  const prs = await getAll(
    `${API}/repos/${REPO}/pulls?state=all&per_page=100`,
    "Pull requests"
  );
  // The issues endpoint also returns pull requests; those are filtered out.
  const issues = (
    await getAll(`${API}/repos/${REPO}/issues?state=all&per_page=100`, "Issues")
  ).filter((i) => !i.pull_request);
  const issueComments = await getAll(
    `${API}/repos/${REPO}/issues/comments?per_page=100`,
    "Issue comments"
  );
  const reviewComments = await getAll(
    `${API}/repos/${REPO}/pulls/comments?per_page=100`,
    "Review comments"
  );

  const byNumber = new Map();
  for (const pr of prs) byNumber.set(pr.number, toEntry(pr));
  for (const issue of issues) byNumber.set(issue.number, toEntry(issue));

  const comments = [
    ...issueComments.map((c) => ({ ...c, kind: "issue_comments", ref: c.issue_url })),
    ...reviewComments.map((c) => ({ ...c, kind: "review_comments", ref: c.pull_request_url })),
  ];

  const seen = new Set();
  for (const c of comments) {
    const id = `${c.kind}:${c.id}`;
    if (seen.has(id)) continue;
    seen.add(id);
    if (!c.body || !c.body.trim()) continue;
    const entry = byNumber.get(numberFromUrl(c.ref));
    if (!entry) continue;
    entry[c.kind]++;
    const login = c.user?.login;
    if (login) entry.commenters[login] = (entry.commenters[login] || 0) + 1;
  }

  const output = {
    repo: REPO,
    generated_at: new Date().toISOString(),
    pulls: {
      total: prs.length,
      top: rank(prs.map((p) => byNumber.get(p.number))),
    },
    issues: {
      total: issues.length,
      top: rank(issues.map((i) => byNumber.get(i.number))),
    },
  };
  fs.writeFileSync(outputPath, JSON.stringify(output, null, 2) + "\n");
  console.log(`Wrote ${outputPath}`);
  print("pull requests", prs.length, output.pulls.top);
  print("issues", issues.length, output.issues.top);
}

main().catch((e) => {
  console.error("\n" + e.message);
  process.exit(1);
});
