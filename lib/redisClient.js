// todo: this should probably be split into two files
var Redis = require('ioredis');

module.exports = redisClient;

function redisClient() {
  var LAST_SAVED_ID = '_lastSavedId';
  var LAST_FOLLOWER_TIME = '_lastFollowerTime';

  var redis = new Redis();

  return {
    /**
     * Save array of users and returns maximum seen id
     */
    saveUsers: saveUsers,

    /**
     * Returns a promise for the last saved user identifier, so that clients can
     * resume indexing at any time.
     */
    getLastSavedId: getLastSavedId,

    /**
     * Close the connection and dispose the client
     */
    close: close,

    saveLastFollowerSearch: saveLastFollowerSearch,

    getLastFollowerSearch: getLastFollowerSearch,

    saveToHash: saveToSet
  };

  function saveToSet(key, values) {
    redis.sadd(key, values);
  }

  function saveLastFollowerSearch(timeStamp) {
    redis.set(LAST_FOLLOWER_TIME, timeStamp);
    return timeStamp;
  }

  function getLastFollowerSearch() {
    return redis.get(LAST_FOLLOWER_TIME);
  }

  function close() {
    redis.disconnect();
  }

  function getLastSavedId() {
    return redis.get(LAST_SAVED_ID);
  }

  function saveUsers(users) {
    if (!users || typeof users.length !== 'number') throw new Error('Invalid users object: ' + users);

    var pipeline = redis.pipeline();
    var maxId = 0;
    for (var i = 0; i < users.length; ++i) {
      var user = users[i];
      pipeline.hmset(user.login, {id: user.id});
      if (user.id > maxId) maxId = user.id;
    }
    pipeline.set(LAST_SAVED_ID, maxId);

    pipeline.exec(function (err, results) {
      if (err) {
        console.log('ERROR: ' + err, results);
        throw (err);
      }
    });

    return maxId;
  }
}
