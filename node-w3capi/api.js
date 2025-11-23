import w3capi from "node-w3capi";

const W3C_INVITED_EXPERTS_ID = 36747;

export function alphaSort(a, b) {
  return a.localeCompare(b, "en", { ignorePunctuation: true });
}

export async function fetchData(groupId) {
  const groupUsers = await w3capi.group(groupId).users().fetch({ embed: true });

  const users = [];
  const orgsMap = {};

  for (const userData of groupUsers) {
    const userAffiliations = await w3capi
      .user(userData._links.self.href.split("/").pop())
      .affiliations()
      .fetch({ embed: true })
      .then((data) => data.filter((org) => org.id !== W3C_INVITED_EXPERTS_ID));

    for (const organizationData of userAffiliations) {
      if (!orgsMap[organizationData.id]) {
        orgsMap[organizationData.id] = {
          id: organizationData.id,
          name: organizationData.name,
          orgUsers: [],
        };
      }

      orgsMap[organizationData.id].orgUsers.push({
        name: userData.name,
        id: userData.id,
      });
    }

    users.push({
      name: userData.name,
      id: userData.id,
      affiliations: userAffiliations,
    });
  }

  const orgs = Object.values(orgsMap);

  // sort by name
  users.sort((a, b) => alphaSort(a.name, b.name));
  orgs.sort((a, b) => alphaSort(a.name, b.name));

  // sort org users by w3c id
  orgs.forEach((organization) => {
    organization.orgUsers.sort((a, b) => a.id - b.id);
  });

  return { users, orgs };
}
