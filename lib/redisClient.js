var Redis = require('ioredis');

module.exports = redisClient;

function redisClient() {
  var LAST_SAVED_ID = '_lastSavedId';

  var redis = new Redis();

  return {
    /**
     * Save array of users and returns maximum seen id
     */
    save: save,

    /**
     * Returns a promise for the last saved user identifier, so that clients can
     * resume indexing at any time.
     */
    getLastSavedId: getLastSavedId
  };

  function getLastSavedId() {
    return redis.get(LAST_SAVED_ID);
  }

  function save(users) {
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
