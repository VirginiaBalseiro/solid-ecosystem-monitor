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

var w3capi = require("node-w3capi");
const fs = require("fs");

const SOLID_CG_ID = 110151;
const W3C_INVITED_EXPERTS_ID = 36747;

const handleUsers = async function (err, data) {
  const users = [];
  const orgs = [];
  const orgsMap = {};

  if (err) return console.error("[ERROR]", err);

  for (let i = 0; i < data.length; i++) {
    const user = data[i];
    try {
      console.log("# GET " + user.href);
      const userData = await fetch(user.href).then((res) => res.json());
      console.log("# GET " + userData._links.affiliations.href);
      const a = await fetch(userData._links.affiliations.href).then((res) =>
        res.json()
      );
      let affiliations = [];
      if (a._links.affiliations) {
        await Promise.all(
          a._links.affiliations.map(async (af) => {
            let aff = await fetch(af.href).then((res) => res.json());
            if (aff.id === W3C_INVITED_EXPERTS_ID) return;

            affiliations.push(aff);

            if (!orgsMap[aff.id]) {
              orgsMap[aff.id] = {
                ...aff,
                orgUsers: [],
              };
            }
            orgsMap[aff.id].orgUsers.push({
              name: userData.name,
              id: userData.id,
            });
          })
        );
      }
      users.push({
        name: userData.name,
        id: userData.id,
        affiliations,
      });
    } catch (e) {
      console.log(e);
    }
  }

  for (const key in orgsMap) {
    if (Object.hasOwnProperty.call(orgsMap, key)) {
      orgs.push(orgsMap[key]);
    }
  }

  fs.writeFileSync("users.json", JSON.stringify(users, null, 2));
  fs.writeFileSync("orgs.json", JSON.stringify(orgs, null, 2));

  var html = showOutput(users, orgs, {
    name: "W3C Solid Community Group",
    description: "test",
  });

  fs.writeFileSync("participants.html", html);
};

w3capi.group(SOLID_CG_ID).users().fetch(handleUsers);

function showOutput(users, orgs, groupData) {
  console.log("------------showOutput:");
  var tr = [];

  users = sortToLower(users, 'name');

  users.forEach(function (user) {
    console.log("### " + user.name);

    var userId = user.id;
    var userIdAboutType =
      ' about="https://www.w3.org/users/' +
      userId +
      '" id="' +
      userId +
      '" typeof="schema:Person"';

    var name = '<span property="schema:name">' + user.name + "</span>";

    var affiliations = [];
    user.affiliations.forEach(function (affiliation) {
      affiliations.push(affiliation.name);
    });
    affiliations = affiliations.join(", ");

    tr.push(
      "<tr><td" +
        userIdAboutType +
        ">" +
        name +
        "</td><td>" +
        affiliations +
        "</td></tr>"
    );
  });

  var tfoot = [];
  tfoot.push("<dl>");
  tfoot.push(
    '<dt>Data source</dt><dd><a href="https://api.w3.org/">https://api.w3.org/</a></dd>'
  );
  tfoot.push("<dt>Number of participants</dt><dd>" + users.length + "</dd>");
  tfoot.push("<dt>Number of organisations</dt><dd>" + orgs.length + "</dd>");
  tfoot.push("</dl>");

  var html = "";
  html =
    '<table id="participants"><caption>' +
    groupData.name +
    " Participants</caption><thead><tr><th>Individual</th><th>Affiliation</th></tr></thead><tbody>" +
    tr.join("") +
    '</tbody><tfoot><tr><td colspan="2">' +
    tfoot.join("") +
    "</td></tr></tfoot></table>";

  html = "<article>" + html + "\n\n" + showOrganizations(orgs) + "</article>";

  var o = {
    prefixes: {
      schema: "http://schema.org/",
    },
  };

  //TODO: Use info from config when available for title
  html = createHTML("W3C Solid Community Group Participants", html, o);

  console.log(html);

  return html;
}

function showOrganizations(orgs) {
  var orgsTable = [];

  orgs = sortToLower(orgs, 'name');

  orgs.forEach(function (org) {
    var orgId = org.id;
    var orgInfo = org.name;

    var orgUsers = [];
    org.orgUsers.forEach(function (orgUser) {
      orgUsers.push(orgUser.name);
    });
    orgUsers = sortToLower(orgUsers).join(", ");

    orgsTable.push(
      '<tr><td id="' +
        orgId +
        '">' +
        orgInfo +
        "</td><td>" +
        orgUsers +
        "</td><td>" +
        org.orgUsers.length +
        "</td></tr>"
    );
  });

  var tfoot = [];
  tfoot.push("<dl>");
  tfoot.push(
    '<dt>Data source</dt><dd><a href="https://api.w3.org/">https://api.w3.org/</a></dd>'
  );
  tfoot.push("</dl>");

  orgsTable =
    '<table id="organizations"><caption>Organizations</caption><thead><tr><td>Name</td><td>Participants</td><td>Number of participants</td></thead><tbody>' +
    orgsTable.join("") +
    '</tbody><tfoot><tr><td colspan="3">' +
    tfoot.join("") +
    "</td></tr></tfoot></table>";

  return orgsTable;
}

//from dokieli utils.js
function sortToLower(array, key) {
  return array.sort(function (a, b) {
    if (key) {
      a = a[key];
      b = b[key];
    }
    return a.toLowerCase().localeCompare(b.toLowerCase());
  });
}

//from dokieli doc.js (with modification to include meta and links to CSS)
function createHTML(title, main, options) {
  title = title || "";
  options = options || {};
  var prefix =
    "prefixes" in options && Object.keys(options.prefixes).length > 0
      ? ' prefix="' + getRDFaPrefixHTML(options.prefixes) + '"'
      : "";
  var lang = options.lang || "en";
  lang = ' lang="' + lang + '" xml:lang="' + lang + '"';
  lang = "omitLang" in options ? "" : lang;

  return (
    "<!DOCTYPE html>\n\
<html" +
    lang +
    ' xmlns="http://www.w3.org/1999/xhtml">\n\
  <head>\n\
    <meta charset="utf-8" />\n\
    <meta content="width=device-width, initial-scale=1" name="viewport" />\n\
    <link href="https://dokie.li/media/css/basic.css" media="all" rel="stylesheet" title="Basic" />\n\
    <title>' +
    title +
    "</title>\n\
  </head>\n\
  <body" +
    prefix +
    ">\n\
    <main>\n\
" +
    main +
    "\n\
    </main>\n\
  </body>\n\
</html>\n\
"
  );
}

//from dokieli doc.js
function getRDFaPrefixHTML(prefixes) {
  return Object.keys(prefixes)
    .map(function (i) {
      return i + ": " + prefixes[i];
    })
    .join(" ");
}
