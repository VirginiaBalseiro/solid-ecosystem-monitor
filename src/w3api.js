//https://api.w3.org/doc

const config = {
  'groupType' : 'cg',
  'groupShortName': 'solid',
  'itemsCount': '10000'
}
const w3CgSolidUsersUrl = 'https://api.w3.org/groups/' + config.groupType + '/' + config.groupShortName + '/users'
const apiItems = 'items=' + config.itemsCount;

function getResource (url, headers = {}, options = {}) {
  options.method = 'GET'

  if (!headers['Accept']) {
    headers['Accept'] = 'application/json'
  }

  options.headers = Object.assign({}, headers)

  console.log('### ' + options.method + ': ' + url)

  return fetch(url, options)
    .catch(error => {
      throw error
    })
    .then(response => {
      if (!response.ok) {  // not a 2xx level response
        let error = new Error('Error fetching resource: ' +
          response.status + ' ' + response.statusText)
        error.status = response.status
        error.response = response

        throw error
      }

      return response
    })
}

function getResourceData (url, headers = {}, options = {}) {
  return getResource(url, headers, options)
    .catch(e => { console.log(e) })
    .then(response => { return response.text()})
    .then(response => {
      try { response = JSON.parse(response) }
      catch (error) { throw error }

      return response;
    })
}

function getUsers (url, headers = {}, options = {}) {
  var query = (options.query) ? options.query + '&' + apiItems : apiItems
  url = url + '?' + query

  return getResourceData(url, headers, options)
}

getUsers(w3CgSolidUsersUrl).then(response => {
  var users = response._links.users;
  var usersData = {};
  var affiliationsData = {};
  var participantsData = {};

// users = [
//   {
//       "href": "https://api.w3.org/users/d3sh0ism2z488wcoo4gs8g0g0s0ws8k",
//       "title": "Sarven Capadisli",
//       "former": false
//   },
//   {
//       "href": "https://api.w3.org/users/tw3nw1pbm7kow8wk004o8owcso0kck4",
//       "title": "Virginia Balseiro",
//       "former": false
//   },
//   {
//       "href": "https://api.w3.org/users/qr8dwote0iog08wwg4w0koo4ogcg00g",
//       "title": "Pol Alvarez",
//       "former": false
//   },
//   {
//       "href": "https://api.w3.org/users/i5y21d0k17kg00ck8c80o0c48cg8okk",
//       "title": "Dmitri Zagidulin",
//       "former": false
//   }
// ]

  var promises = []
  users.forEach(function(user) {
    promises.push(getResourceData(user.href))
  });

  Promise.all(promises.map(p => p.catch(e => e)))
    .then(responses => {
      responses.forEach(function(response) {
        usersData[response._links.self.href] = response
// console.log(usersData);
      })

      return usersData;
    })
    .then(data => {
      var promises = []
      Object.keys(data).forEach(function(o) {
        //FIXME: independents don't have affiliations
        promises.push(getResourceData(data[o]._links.affiliations.href))
      });

      return Promise.all(promises.map(p => p.catch(e => e)))
        .then(responses => {
          responses.forEach(function(response) {
// console.log(response)
            if (response && response._links.up) {
// console.log(response._links.affiliations)
              usersData[response._links.up.href]._links.affiliations = response._links.affiliations
            }
          })
// console.log(usersData)
          return usersData;
        });
    })
    .then(data => {
// console.log(data)

      var promises = []
      Object.keys(data).forEach(function(o) {
// console.log(o)
        if (data[o]._links.affiliations) {
          data[o]._links.affiliations.forEach(function(affiliation){
            promises.push(getResourceData(affiliation.href))
          });
        }
      })

      return Promise.all(promises.map(p => p.catch(e => e)))
        .then(responses => {
          responses.forEach(function(response) {
// console.log(response)
            if (response) {
              affiliationsData[response._links.self.href] = response
            }
          })

          return affiliationsData;
        })
      })
    .then(data => {
// console.log(data)

      var promises = []
      Object.keys(data).forEach(function(o) {
// console.log(o)
        if (data[o]._links.participants) {
          var url = data[o]._links.participants.href + '?' + apiItems

          promises.push(getResourceData(url))
        }
      })

      return Promise.all(promises.map(p => p.catch(e => e)))
        .then(responses => {
          responses.forEach(function(response) {
// console.log(response)
            if (response) {
              participantsData[response._links.self.href] = response
            }
          })

          return participantsData;
        })
    })

    .then(data => {
      Object.keys(data).forEach(function(o) {
// console.log(data[o]._links.up)

//Where https://www.w3.org/groups/cg/solid/participants/ shows `users` with "Individual CLA commitment but affiliated with [X]" don't have those affiliations ([X]) listing them as a `participant` of the group.

        if (data[o]._links.up) {
console.log('### ' + data[o]._links.up.href + ' ' + affiliationsData[data[o]._links.up.href].name)
          if (data[o]._links.participants) {
            data[o]._links.participants.forEach(function(participant) {
              if (usersData[participant.href]) {
console.log('    ' + participant.href + ' ' + usersData[participant.href].name)
              }
            })
          }
        }
      })

    })

})
