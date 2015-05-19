/**
 * This module uses data created by `findUsersWithFollowers.js` and for each
 * individual it issues request to `/users/<name>/followers`, and stores them
 * into redis (under <name> followers map)
 */
var githubClient = require('./lib/githubClient.js')(process.env.GH_TOKEN);
var redisClient = require('./lib/redisClient.js')();
var config = require('./redisNames.js');

redisClient.get(config.BEING_INDEXED_USER_FOLLOWERS)
    .then(greet)
    .then(indexUserFollowers);

function greet(lastUser) {
  console.log('Welcome to the followers crawler.');
  if (lastUser) {
    console.log('Attemtpting to resume from: ' + lastUser);
    return lastUser;
  } else {
    return startNextUser();
  }
}

function indexUserFollowers(userName) {
  if (userName === undefined) {
    console.log('Are we done? Looks like there are no more users!');
    process.exit(0);
    return;
  }
  console.log('Indexing followers of ' + userName);

  githubClient.getFollowers(userName)
    .then(save)
    .then(loadMore)
    .catch(function(e) {
      console.log('Something went bad: ' + e);
      console.log('Quiting...');
      process.exit(-1);
    });

  function save(followers) {
    console.log('Saving ' + followers.length + ' followers');
    return redisClient.saveToHash(userName, {
      followers: followers
    });
  }
}

function loadMore() {
  startNextUser().then(indexUserFollowers);
}


function startNextUser() {
  return redisClient.popFromSet(config.JOINED_AFTER).then(markUser);
}

function markUser(user) {
  redisClient.set(config.BEING_INDEXED_USER_FOLLOWERS, user);
  return user;
}
