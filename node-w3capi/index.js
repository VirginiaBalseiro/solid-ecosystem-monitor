// https://api.w3.org/docs
// https://w3c.github.io/w3c-api/
// https://github.com/w3c/node-w3capi

//Group ID is from e.g., https://api.w3.org/groups/cg/solid `id`
//TODO: Something like where config for `groupType`` and `g`roupShortName`` can come from CLI or derived from Web form input, e.g., https://www.w3.org/groups/cg/solid :
// var config = {
//   "groupType" : "cg",
//   "groupShortName": "solid",
//   "itemsValue": "1000"
// }

// var api = {
//   "url": {
//     "group": "https://api.w3.org/groups/" + config.groupType + "/" + config.groupShortName
//   },
//   "items": "items=" + config.itemsValue
// }

import fs from "fs";
import ora from "ora";
import { fetchData } from "./api.js";
import { renderHTML } from "./html.js";
import { renderMarkdown } from "./markdown.js";

const SOLID_CG_ID = 110151;

const filenames = {
  json: {
    users: "users.json",
    orgs: "orgs.json"
  },
  html: {
    participants: "participants.html"
  },
  md: {
    affiliations: "affiliations.md"
  }
}

const spinner = ora("🐌 Starting").start()

let data

function localDataExists(record) {
  return Object.values(record).every(filename => fs.existsSync(filename))
}

// check if exist in the filesystem
if (localDataExists(filenames.json)) {
  spinner.succeed("💾 Found existing local data")
  data = {
    users: JSON.parse(fs.readFileSync(filenames.json.users, 'utf-8')),
    orgs: JSON.parse(fs.readFileSync(filenames.json.orgs, 'utf-8'))
  }
} else {
  spinner.start("☕ Fetching data from W3C API")
  data = await fetchData(SOLID_CG_ID);
  spinner.succeed("😅 Fetched data from W3C API")
  spinner.start("🤖 Writing local data")
  fs.writeFileSync(filenames.json.users, JSON.stringify(data.users, null, 2));
  fs.writeFileSync(filenames.json.orgs, JSON.stringify(data.orgs, null, 2));
  spinner.succeed("💾 Wrote local data")
}


spinner.start("🤖 Generating HTML")
const html = renderHTML(data.users, data.orgs, {
  name: "W3C Solid Community Group",
  description: "test",
});
fs.writeFileSync(filenames.html.participants, html);
spinner.succeed("Generated HTML")

spinner.start("🤖 Generating markdown")
const markdown = renderMarkdown(data.users, data.orgs, {
  name: "W3C Solid Community Group",
  description: "test",
});
fs.writeFileSync(filenames.md.affiliations, markdown);
spinner.succeed("Generated markdown")

spinner.stop()
