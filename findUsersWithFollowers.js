var githubClient = require('./lib/githubClient.js')(process.env.GH_TOKEN);
var redisClient = require('./lib/redisClient.js')();

redisClient.getLastFollowerSearch()
  .then(greet)
  .then(indexUsers);

function greet(after) {
  console.log('Welcome to the crawler of users who has followers.');
  if (after) {
    console.log('Attemtpting to resume from "joined date": ' + after);
  }

  return after;
}

function indexUsers(after) {
  githubClient.getUsersWhoJoinedAfter(after)
    .then(save)
    .then(loadMore)
    .catch(function(e) {
      console.log('Something went bad: ' + e);
      console.log('Quiting...');
      process.exit(-1);
    });
}

function loadMore(ctx) {
  if (ctx.isDone) {
    console.log('All is done.');
    redisClient.close();
    return;
  }

  githubClient.getWhenUserJoined(ctx.lastSavedId)
    .then(saveLastTimeSamp)
    .then(indexUsers);
}

function save(users) {
  redisClient.saveToHash('_joinedAfter', users);
  var lastSavedUser = users[users.length - 1];
  console.log('last saved user: ' + lastSavedUser);

  return {
    isDone: users.length < 100, // this can only happen if we reached the last page
    lastSavedId: lastSavedUser
  };
}

function saveLastTimeSamp(stamp) {
  return redisClient.saveLastFollowerSearch(stamp);
}
