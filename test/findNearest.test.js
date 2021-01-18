import {strict as assert} from 'assert';
import fromJson from 'ngraph.fromjson';
import DnNearestLinkFinder from '../index.js';


// http://graphonline.ru/?graph=LOTXzPaeLfYCDYYT only numberic nodes
const graph = fromJson('{"nodes":[{"id":"0","data":{"xy":[160,112]}},{"id":"1","data":{"xy":[312,59]}},{"id":"2","data":{"xy":[466,113]}},{"id":"3","data":{"xy":[598,194]}},{"id":"4","data":{"xy":[521,290]}},{"id":"5","data":{"xy":[406,293]}},{"id":"6","data":{"xy":[201,289]}},{"id":"7","data":{"xy":[370,136]}},{"id":"8","data":{"xy":[337,230]}},{"id":"9","data":{"xy":[248,158]}}],"links":[{"fromId":"0","toId":"1","data":{}},{"fromId":"1","toId":"2","data":{}},{"fromId":"2","toId":"3","data":{}},{"fromId":"3","toId":"5","data":{}},{"fromId":"5","toId":"4","data":{}},{"fromId":"5","toId":"2","data":{}},{"fromId":"5","toId":"6","data":{}},{"fromId":"6","toId":"0","data":{}},{"fromId":"7","toId":"9","data":{}},{"fromId":"8","toId":"7","data":{}},{"fromId":"8","toId":"9","data":{}},{"fromId":"9","toId":"6","data":{}},{"fromId":"7","toId":"2","data":{}},{"fromId":"8","toId":"2","data":{}},{"fromId":"8","toId":"6","data":{}}]}');
let nearestLinkFinder = new DnNearestLinkFinder(graph);

describe("isInsideGraph", () => {
    let data = [
        [492, 325, false, 'K'],
        [543, 204, true, 'L'],
        [269, 220, true, 'M'],
        [330, 170, true, 'N'],
        [563, 288, false, 'S'],
    ];
    data.forEach((data) => {
        it(JSON.stringify(data), () => {
            assert.equal(nearestLinkFinder.isInsideGraph(data[0], data[1]), data[2]);
        });
    });
})

it('findNearestPoint', () => {
    let node = nearestLinkFinder.findNearestPoint([492, 325]); // K
    assert.equal(node.id, '4');
});

it('routeInside', () => {
    let res = nearestLinkFinder.findLink([543, 204]); // L
    assert.equal(res.nodeA.id, '5');
    assert.equal(res.nodeB.id, '3');
    assert.deepEqual(
        [res.nearestPoint[0].toFixed(2), res.nearestPoint[1].toFixed(2)],
        ['550.48', '218.50'],
    );
});

it('routeOutsideK', () => {
    let res = nearestLinkFinder.findLink([492, 325]); // K
    assert.equal(res.nodeA.id, '4');
    assert.equal(res.nodeB.id, '5');
    assert.deepEqual(
        [res.nearestPoint[0].toFixed(2), res.nearestPoint[1].toFixed(2)],
        ['491.11', '290.78'],
    );
});

it('routeOutsideS', () => {
    let res = nearestLinkFinder.findLink([563, 288]); // S
    assert.equal(res.nodeA.id, '4');
    assert.equal(res.nodeB.id, '5');
    assert.deepEqual(
        [res.nearestPoint[0], res.nearestPoint[1]],
        res.nodeA.data.xy,
    );
});
