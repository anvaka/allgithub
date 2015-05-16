// todo: this should probably be split into two files
var Redis = require('ioredis');

module.exports = redisClient;

function redisClient() {
  var redis = new Redis();

  return {
    /**
     * Save array of users and returns maximum seen id
     */
    saveUsers: saveUsers,

    /**
     * Close the connection and dispose the client
     */
    close: close,

    /**
     * Set key value into redis
     *
     * @param {string} key where we store value
     * @param {string|number} value that we want to store
     */
    set: set,

    /**
     * Get value at given key
     *
     * @param {string} key to the value.
     * @returns promise that resolves with the value.
     */
    get: get,

    /**
     * Adds all values as hash values for the key
     *
     * @param {string} key
     * @param {array} values - array of values that become values of the hash
     */
    saveToSet: saveToSet
  };

  function saveToSet(key, values) {
    redis.sadd(key, values);
  }

  function set(key, value) {
    return redis.set(key, value);
  }

  function get(key) {
    return redis.get(key);
  }

  function close() {
    redis.disconnect();
  }

  function saveUsers(users) {
    if (!users || typeof users.length !== 'number') throw new Error('Invalid users object: ' + users);

    var pipeline = redis.pipeline();
    var maxId = 0;
    for (var i = 0; i < users.length; ++i) {
      var user = users[i];
      pipeline.hmset(user.login, { id: user.id });
      if (user.id > maxId) maxId = user.id;
    }

    pipeline.exec(logIfError);

    return maxId;
  }
}

function logIfError(err, results) {
  if (err) {
    console.log('ERROR: ' + err, results);
    throw (err);
  }
}
