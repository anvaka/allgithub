// todo: this should probably be split into two files
var Redis = require('ioredis');

module.exports = redisClient;

function redisClient() {
  var redis = new Redis();
  redis.defineCommand('getAllUsers', {
    lua: [
      "local result = {}",
      "for i, v in ipairs(KEYS) do",
      // Keys with '_' prefix are reserved, and do not represent users:
      "  if string.sub(KEYS[i], 1, 1) ~= '_' then",
      "    local user = redis.call('hgetall', KEYS[i])",
      "    table.insert(user, 'login')",
      "    table.insert(user, KEYS[i])",
      "    result[i] = user",
      "  end",
      "end",
      "return result"
    ].join('\n')
  });

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
    saveToSet: saveToSet,

    /**
     * Removes a random element from a set at given key
     *
     * @param {string} key
     * @returns promise that resolves with the element.
     */
    popFromSet: popFromSet,

    saveToHash: saveToHash,

    getHash: getHash,

    forEachUser: forEachUser
  };

  function forEachUser(callback, done) {

    getChunk(0);

    function getChunk(from) {
      redis.scan(from).then(processChunk);
    }

    function processChunk(chunk) {
      var cursor = parseInt(chunk[0], 10);
      var logins = chunk[1];
      // getAllUsers for each user returns an array of attributes e.g.:
      // [
      //   [ 'id', '762', 'login', 'asanghi' ],
      //   [ 'id', '877', 'login', 'larssg' ], ..
      // ]
      // Here we are mapping it to array of users:
      // [ { id: 762, login: 'asanghi'}, .. }
      return redis.getAllUsers(logins.length, logins)
              .then(mapToObjects)
              .then(reportToClient)
              .then(getNextChunk);

      function getNextChunk() {
        if (cursor !== 0) getChunk(cursor);
        else done();
      }
    }

    function reportToClient(users) {
      users.forEach(callback);
    }
  }

  function getHash(key) {
    return redis.hgetall(key);
  }

  function saveToHash(key, properties) {
    return redis.hmset(key, properties);
  }

  function saveToSet(key, values) {
    return redis.sadd(key, values);
  }

  function popFromSet(key) {
    return redis.spop(key);
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
      pipeline.hmset(user.login, {
        id: user.id
      });
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

function mapToObjects(results) {
  return results.map(toObjects);
}

function toObjects(attributesArray) {
  var object = Object.create(null);
  for (var i = 0; i < attributesArray.length; i += 2) {
    object[attributesArray[i]] = attributesArray[i + 1];
  }
  return object;
}
