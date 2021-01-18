# DnNearestLinkFinder
Finds the nearest point belonging to the graph.

This library uses the graph from the library [ngraph](https://github.com/anvaka/ngraph.graph).


# Example
```js
import createGraph from 'ngraph.graph';
import DnNearestLinkFinder from 'dn_nearest_link_finder';

// Create graph
let graph = createGraph();

graph.addNode(1, { xy: [0, 0] });
graph.addNode(2, { xy: [0, 1] });
graph.addNode(3, { xy: [1, 1] });
graph.addNode(4, { xy: [1, 0] });

graph.addLink(1, 2);
graph.addLink(2, 3);
graph.addLink(3, 4);
graph.addLink(4, 1);

let finder = new DnNearestLinkFinder(graph);
let result = finder.findLink([0.65, 0.5]);
console.log(result.nodeA.id);
console.log(result.nodeB.id);
console.log(result.nearestPoint);
```

# License
MIT License

Copyright 2021 DnAp<dnlebedev@gmail.com>
