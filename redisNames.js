module.exports = {
  // User by index.js to store index of the last saved user (`since` argument)
  LAST_SAVED_ID: '_lastSavedId',

  /**
   * User by findUsersWithFollowers.js to store maximum `created` time of the
   * found users. This time is later used as a start time for the next search.
   * Remember, github's search is limited by 1k results, thus we have to find
   * search invariant that allows us to iterate over millions of users. This
   * `created` time represents such invariant.
   */
  LAST_FOLLOWER_TIME: 'lastFollowerTime2',

  /**
   * Where findUsersWithFollowers stores all users with followers, it has to be
   * a set, since we don't want to have duplicates from overlapping searches.
   */
  JOINED_AFTER: '_joinedAfterV2',

  /**
   * The followers crawler will pop a user from JOINED_AFTER set and temporary
   * store him or here here. So that if the programm is interrupted we can
   * resume without loosing current user
   */
  BEING_INDEXED_USER_FOLLOWERS: '_userBeingIndexedForFollowers'
};
