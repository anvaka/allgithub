/**
 * This file will traverse the redis database and compse a graph of all followers
 */
var redisClient = require('./lib/redisClient.js')();
var graph = require('ngraph.graph')({uniqueLinkIds: false});
var todot = require('ngraph.todot');

redisClient.forEachUser(considerAddToGraph, quit);

function considerAddToGraph(user) {
  // we skip users without followers for now
  if (user.followers) {
    addUser(user);
  }
}

function quit() {
  console.log(todot(graph));
  redisClient.close();
}

function addUser(user) {
  var followers = user.followers.split(',');
  followers.forEach(addLink);

  function addLink(follower) {
    graph.addLink(follower, user.login);
  }
}
