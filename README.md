# ghcrawl

Crawling github data

# usage

Prerequisites:

1. Make sure redis is installed and running on default port
2. [Register github token](https://help.github.com/articles/creating-an-access-token-for-command-line-use/)
and set it into `GH_TOKEN` environment variable.
3. Install the crawler:

```
git clone https://github.com/anvaka/ghcrawl
cd ghcrawl
npm i
```

Now we are redy to index.

## Find all users with more than 2 followers

This will use search API and will go through all users on GitHub who has more
than two followers.  At
the moment there are [more than 400k users](https://github.com/search?q=followers%3A%3E2&type=Users&utf8=%E2%9C%93).

Each search request can return up to 100 records per page, which gives us
`400,000 / 100 = 4,000` requests to make. Search API is rate limited at 30
requests per minute. Which means the indexing will take `4,000/30 = 133` -
more than two hours:

```
node findUsersWithFollowers.js
```

## Find all followers

Now that we have all users who have more than two followers, lets index
those followers. Bad news we will have to make one request per user.
Good news, rate limit is 5,000 requests per hour, which gives us estimated
amount of work: `400,000/5,000 = 80` - more than 80 hours of work:

```
node indexUserFollowers.js
```

## Time to get the graph

Now that we have all users indexed, we can construct the graph:

```
node makeFollowersGraph.js > github.dot
```

# license

MIT
