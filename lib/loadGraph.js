var fs = require('fs');
var fromdot = require('ngraph.fromdot');

module.exports = loadGraph;
function loadGraph() {
  var fileName = process.argv[2] || './github.dot';
  console.log('Loading graph from ' + fileName);
  var content = fs.readFileSync(fileName, 'utf8');
  var graph = fromdot(content);
  console.log('Loaded ' + graph.getLinksCount() + ' edges; ' + graph.getNodesCount() + ' vertices;');
  return graph;
}
