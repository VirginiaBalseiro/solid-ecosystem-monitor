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
import tablemark from 'tablemark'
import { fetchData, alphaSort} from "./api.js";
import { renderHTML } from "./html.js";

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
    default: "affiliation-default-voters.md",
    designated: "affiliation-designated-voters.md"
  },
  txt: {
    voters: "eligible-voters.txt"
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

const nonSingularOrgs = data.orgs.filter(org => org.orgUsers.length > 1)

spinner.start("🤖 Generating markdown")
  const markdown = tablemark(nonSingularOrgs
    .map(o => ({
      name: o.name,
      members: o.orgUsers.length,
      default: o.orgUsers[0].name,
      designated: ''
    }))
  )
fs.writeFileSync(filenames.md.default, markdown);
spinner.succeed("Generated markdown")

if (localDataExists(filenames.md)) {
  spinner.start("🤖 Generating eligible voters list")
  const representativesTable = fs.readFileSync(filenames.md.designated, 'utf-8')
    .split('\n').slice(2).filter(Boolean)

  const orgRepresentatives = representativesTable.map(row => {
    const fallback = row.split('|')[3].trim()
    const designated = row.split('|')[4].trim()
    return designated || fallback
  })

  const simpleVoters = data.users
    .filter(user => !nonSingularOrgs.some(org => org.orgUsers.find(u => u.id === user.id)))
    .map(user => user.name)
  const eligibleVoters = [...simpleVoters, ...orgRepresentatives]
  eligibleVoters.sort(alphaSort)
  fs.writeFileSync(filenames.txt.voters, eligibleVoters.join('\n') + '\n');
  spinner.succeed("Generated eligible voters list")
}

spinner.stop()
