import w3capi from "node-w3capi"

const W3C_INVITED_EXPERTS_ID = 36747;

export function alphaSort(a, b) {
  return a.localeCompare(b, "en", { ignorePunctuation: true })
}

export async function fetchData(groupId) {
  const groupUsers = await w3capi.group(groupId).users().fetch();
  const users = [];
  const orgsMap = {};

  for (const user of groupUsers) {
    const userData = await fetch(user.href).then((res) => res.json());

    const userAffiliationsData = await fetch(userData._links.affiliations.href).then((res) =>
      res.json()
    );

    const userAffiliations = [];
    if (userAffiliationsData._links.affiliations) {
      await Promise.all(
        userAffiliationsData._links.affiliations.map(async (affiliation) => {
          let organizationData = await fetch(affiliation.href).then((res) => res.json());
          if (organizationData.id === W3C_INVITED_EXPERTS_ID) return;

          userAffiliations.push(organizationData);

          if (!orgsMap[organizationData.id]) {
            orgsMap[organizationData.id] = {
              ...organizationData,
              orgUsers: [],
            };
          }
          orgsMap[organizationData.id].orgUsers.push({
            name: userData.name,
            id: userData.id,
          });
        })
      );
    }
    
    users.push({
      name: userData.name,
      id: userData.id,
      affiliations: userAffiliations,
    });
  }

  const orgs = Object.values(orgsMap)

  // sort by name
  users.sort((a, b) => alphaSort(a.name, b.name))
  orgs.sort((a, b) => alphaSort(a.name, b.name))

  // sort org users by w3c id
  orgs.forEach(organization => {
    organization.orgUsers.sort((a, b) => a.id - b.id)
  })

  return { users, orgs }
}
