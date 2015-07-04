var graph = require('./lib/loadGraph.js')();
console.log('Done, loaded ' + graph.getLinksCount() + ' edges; ' + graph.getNodesCount() + ' nodes');
var save = require('ngraph.tobinary');
save(graph, { outDir: './data' });
