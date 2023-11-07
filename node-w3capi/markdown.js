import tablemark from 'tablemark'

export function renderMarkdown (users, orgs, groupData) {
   
  const nonSingularOrgs = orgs.filter(org => org.orgUsers.length > 1)
  const formatted = nonSingularOrgs
    .map(o => ({
      name: o.name,
      members: o.orgUsers.length,
      default: o.orgUsers[0].name,
      designated: ''
    }))
  return tablemark(formatted)
}
