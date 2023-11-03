import w3capi from "node-w3capi"

const W3C_INVITED_EXPERTS_ID = 36747;

export async function fetchData(groupId) {
  const data = await w3capi.group(groupId).users().fetch();
  const users = [];
  const orgs = [];
  const orgsMap = {};

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

  return { users, orgs }
}
