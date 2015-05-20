/**
 * This file will traverse the redis database and compse a graph of all followers
 */
var redisClient = require('./lib/redisClient.js')();

console.log('digraph GithubFollowers {');
redisClient.forEachUser(considerAddToGraph, quit);

function considerAddToGraph(user) {
  // we skip users without followers for now
  if (user.followers) {
    addUser(user);
  }
}

function quit() {
  console.log('}');
  redisClient.close();
}

function addUser(user) {
  var followers = user.followers.split(',');
  followers.forEach(addLink);

  function addLink(follower) {
    console.log('"' + follower + '"->"' + user.login +'"');
  }
}
