var Promise = require("bluebird");

module.exports = githubClient;

function githubClient(token) {
  var USERS = 'https://api.github.com/users?access_token=' + token + '&since=';
  var request = require('request-promise');
  var errors = require('request-promise/errors');

  return {
    getUsers: getUsers
  };

  function getUsers(since) {
    if (typeof since !== 'number') {
      console.log('`since` argument is not present. Assuming 0');
      since = 0;
    }

    var options = {
      uri: USERS + since,
      resolveWithFullResponse: true,
      headers: {
        'User-Agent': 'anvaka/ghcrawl'
      }
    };

    console.log('Loading users since ' + since);

    return request(options)
      .then(verifyRateLimits)
      .catch(errors.StatusCodeError, handle403);

    function verifyRateLimits(res) {
      var rateLimitPromise = getRateLimitPromiseFromHeaders(res.headers);
      if (rateLimitPromise) return rateLimitPromise;

      return JSON.parse(res.body);
    }

    function getRateLimitPromiseFromHeaders(headers) {
      var rateLimit = parseRateLimit(headers);
      console.log('Rate limit: ' + rateLimit.limit + '/' + rateLimit.remaining);
      if (rateLimit.remaining === 0) {
        var waitTime = rateLimit.reset - new Date();
        console.log('Rate limit exceeded, waiting before retry: ' + waitTime + 'ms');
        console.log('Current time is ' + (new Date()) + '; Reset: ' + (new Date(rateLimit.reset)));
        return Promise.delay(waitTime).then(resume);
      }
    }

    function resume() {
      return getUsers(since);
    }

    function handle403(reason) {
      if (reason.statusCode === 403) {
        var headers = reason.response.headers;
        return getRateLimitPromiseFromHeaders(headers);
      }

      console.log('Could not handle answer from github', reason);
      throw new Error(reason);
    }
  }
}

function parseRateLimit(headers) {
  var resetUTC = parseInt(headers['x-ratelimit-reset'], 10) * 1000;

  return {
    limit: parseInt(headers['x-ratelimit-limit'], 10),
    remaining: parseInt(headers['x-ratelimit-remaining'], 10),
    reset: resetUTC
  };
}
