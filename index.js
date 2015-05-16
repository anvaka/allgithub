/**
 * This module simply walks through entire `/users` endpoint and stores every
 * user into redis. Key is user name, value is a map of user properties.
 *
 * The map by defaul contains only user id (a number). Subsequent crawlers will
 * fill in fields of the map (e.g. followers, starred repositories, etc).
 *
 * @see https://developer.github.com/v3/users/#get-all-users
 */
var LAST_SAVED_ID = '_lastSavedId';

var githubClient = require('./lib/githubClient.js')(process.env.GH_TOKEN);
var redisClient = require('./lib/redisClient.js')();

redisClient.get(LAST_SAVED_ID)
  .then(greetUser)
  .then(indexUsers);

function greetUser(since) {
  console.log('Welcome to the github users crawler!');
  if (since) {
    since = parseInt(since, 10);
    console.log('Attemtpting to resume indexing since user id: ' + since);
  }

  return since;
}

function indexUsers(since) {
  githubClient.getUsers(since)
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
  indexUsers(ctx.lastSavedId);
}

function save(users) {
  var lastSavedId = redisClient.saveUsers(users);
  redisClient.set(LAST_SAVED_ID, lastSavedId);

  console.log('last saved id: ' + lastSavedId);

  return {
    isDone: users.length < 100, // this can only happen if we reached the last page
    lastSavedId: lastSavedId
  };
}
