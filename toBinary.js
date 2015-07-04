var fs = require('fs');
var fromdot = require('ngraph.fromdot');
var graph = fromdot(fs.readFileSync(process.argv[2] || 'followers.dot', 'utf8'));
console.log('Done, loaded ' + graph.getLinksCount() + ' edges; ' + graph.getNodesCount() + ' nodes');
var save = require('ngraph.tobinary');
save(graph, { outDir: './data' });
