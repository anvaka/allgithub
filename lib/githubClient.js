module.exports = githubClient;
var githubRequest = require('./githubRequest.js');

function githubClient(token) {
  var tokenPart = '';
  if (token) tokenPart = 'access_token=' + token + '&';
  var USERS = 'https://api.github.com/users?' + tokenPart + 'since=';
  var USER_DETAILS = 'https://api.github.com/users/';
  var SEARCH_USER_WITH_FOLLOWERS = 'https://api.github.com/search/users?per_page=100&sort=joined&order=asc&q=';

  return {
    getUsers: getUsers,
    getWhenUserJoined: getWhenUserJoined,
    getUsersWhoJoinedAfter: getUsersWhoJoinedAfter
  };

  function getUsersWhoJoinedAfter(date, minFollowers) {
    if (typeof minFollowers !== 'number') minFollowers = 3;
    if (typeof date !== 'string') date = '2005-01-01';

    var searchArgs = createRequestArgs(SEARCH_USER_WITH_FOLLOWERS +
      'created:>' + date +
      ' followers:>=' + minFollowers);

    return githubRequest(searchArgs, true).then(combineResults);

    function combineResults(results) {
      var allResults = [];
      for (var i = 0; i < results.length; ++i) {
        var items = results[i].items;
        for (var j = 0; j < items.length; j++) {
          var item = items[j];
          allResults.push(item.login);
        }
      }
      return allResults;
    }
  }

  function getWhenUserJoined(userName) {
    console.log('Loading user\'s join date: ' + userName);
    var detailsRequest = createRequestArgs(USER_DETAILS + userName);
    return githubRequest(detailsRequest).then(getTime);

    function getTime(user) {
      return user.created_at;
    }
  }

  function getUsers(since) {
    if (typeof since !== 'number') {
      console.log('`since` argument is not present. Assuming 0');
      since = 0;
    }

    var usersRequest = createRequestArgs(USERS + since);
    console.log('Loading users since ' + since);

    return githubRequest(usersRequest);
  }
}

function createRequestArgs(uri) {
  return {
    uri: uri,
    resolveWithFullResponse: true,
    headers: {
      'User-Agent': 'anvaka/ghcrawl'
    }
  };
}
