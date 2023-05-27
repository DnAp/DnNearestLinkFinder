import {
    distanceSqrt,
    findNearestPointOnSegment,
    normalizeRadians,
    getNextArrayIndex,
    getPreviousArrayIndex
} from './helpers.js'

export default class DnNearestLinkFinder {
    /**
     * @param {Graph} graph
     * @param {{max_external_points: int, build_external_polygon: boolean}} options
     * @returns {number}
     */
    constructor(graph, options = {}) {
        this.graph = graph;
        this.options = {
            max_external_points: 10,
            build_external_polygon: true,
        };
        Object.assign(this.options, options);
        this._buildIndex();
        if (this.options.build_external_polygon) {
            this._buildExternalPolygon();
        }
    }

    _buildIndex() {
        let toNodeId, toNode, angle, links, i;
        this.graph.forEachNode(node => {
            links = [];
            for (i = 0; i < node.links.length; i++) {
                toNodeId = node.links[i].toId === node.id ? node.links[i].fromId : node.links[i].toId;
                toNode = this.graph.getNode(toNodeId);
                angle = Math.atan2(toNode.data.xy[1] - node.data.xy[1], toNode.data.xy[0] - node.data.xy[0]);

                links.push({node: toNode, angle: normalizeRadians(angle)});
            }
            links.sort((a, b) => a.angle - b.angle);
            node.data.linksByAngle = links;
        });
    }

    _buildExternalPolygon() {
        let rightNode = {xy: [-Infinity]};
        this.graph.forEachNode(node => {
            if (rightNode.xy[0] < node.data.xy[0]) {
                rightNode.xy = node.data.xy;
                rightNode.node = node;
            }
        });
        let polygon = this.getPolygon(rightNode.node, 0);
        let xp = [], yp = [];
        for (let i = 0; i < polygon.length; i++) {
            xp.push(polygon[i].data.xy[0]);
            yp.push(polygon[i].data.xy[1]);
        }
        this._polygon = {xp, yp, polygon};
    }

    /**
     * @param {Number[]} position
     * @return {{nodeA: Node, nodeB: Node, nearestPoint: [Number, Number], distanceSqrt: Number}}
     */
    findLink(position) {
        let segments;

        if (!this.options.build_external_polygon || this.isInsideGraph(position[0], position[1])) {
            let node = this.findNearestPoint(position);
            let polygon = this.getPolygon(node, Math.atan2(position[1] - node.data.xy[1], position[0] - node.data.xy[0]));
            segments = this.polygonToSegments(polygon);
        } else {
            segments = this._findSegmentsInExternalPolygon(position);
        }

        let aPos, bPos, s;
        let segmentData = segments.map(segment => {
            aPos = segment[0].data.xy;
            bPos = segment[1].data.xy;
            s = {
                nodeA: segment[0], nodeB: segment[1], nearestPoint: findNearestPointOnSegment(aPos, bPos, position),
            };
            s.distanceSqrt = distanceSqrt(position, s.nearestPoint);
            return s;
        });
        let goodSegment = {distanceSqrt: Infinity};
        for (let i = 0; i < segmentData.length; i++) {
            if (goodSegment.distanceSqrt > segmentData[i].distanceSqrt)
                goodSegment = segmentData[i];
        }
        return goodSegment;
    }

    findNearestPoint(position) {
        let result = {
            distance: Infinity,
            node: null,
        };
        let distance;
        this.graph.forEachNode(node => {
            distance = distanceSqrt(position, node.data.xy);
            if (result.distance > distance) {
                result.distance = distance;
                result.node = node;
            }
        });
        return result.node;
    }

    /**
     * @param {Node} startNode
     * @param {Number} startAngle in radian
     * @return {Node[]}
     */
    getPolygon(startNode, startAngle) {
        let currentNode, prevNode = startNode, links, i;
        const poly = [];
        for (i = 0; i < startNode.data.linksByAngle.length; i++) {
            if (startNode.data.linksByAngle[i].angle > startAngle) {
                currentNode = startNode.data.linksByAngle[i].node;
                break;
            }
            currentNode = startNode.data.linksByAngle[0].node;
        }
        poly.push(currentNode);

        do {
            links = this._getUniqueNodeLinks(currentNode.data.linksByAngle);
            if (links.length === 1) {
                [prevNode, currentNode] = [currentNode, prevNode];
                poly.push(currentNode);
                continue;
            }
            for (i = 0; i < links.length; i++) {
                if (links[i].node === prevNode)
                    break;
            }
            prevNode = currentNode;
            currentNode = links[getNextArrayIndex(i, links.length)].node;
            poly.push(currentNode);
        } while (currentNode !== startNode);

        return poly;
    }

    _getUniqueNodeLinks(links) {
        return Object.values(links.reduce((result, link) => ({
            ...result,
            [link.node.id]: link,
        }), {}));
    }

    isInsideGraph(x, y) {
        if (!this.options.build_external_polygon) {
            return false;
        }
        let xp = this._polygon.xp;
        let yp = this._polygon.yp;
        let npol = xp.length;
        let j = npol - 1;
        let c = false;
        for (let i = 0; i < npol; i++) {
            // fucking magic
            if ((((yp[i] <= y) && (y < yp[j])) || ((yp[j] <= y) && (y < yp[i])))
                && (x > (xp[j] - xp[i]) * (y - yp[i]) / (yp[j] - yp[i]) + xp[i])) {
                c = !c;
            }
            j = i;
        }
        return c;
    }

    /**
     * @param {Node[]} polygon
     * @return {[Node, Node]}
     */
    polygonToSegments(polygon) {
        let segments = [];
        for (let i = 0; i < polygon.length - 1; i++) {
            segments.push([polygon[i], polygon[i + 1]]);
        }
        segments.push([polygon[polygon.length - 1], polygon[0]]);
        return segments;
    }

    /**
     * @param {[Number, Number]} position
     * @return {[Node, Node]}
     */
    _findSegmentsInExternalPolygon(position) {
        let segments = [], segment;
        let nearestPoint = this._findNearestInExternalPolygon(position);
        let u = nearestPoint.k;
        let d = nearestPoint.k;
        const polygon = this._polygon.polygon;
        const polygonLength = polygon.length;
        for (let i = 0; i < this.options.max_external_points / 2; i++) {
            segment = polygon[u];
            u = getNextArrayIndex(u, polygonLength);
            segments.push([segment, polygon[u]]);
            segment = polygon[d];
            d = getPreviousArrayIndex(d, polygonLength);
            segments.push([segment, polygon[d]]);
        }
        return segments;
    }

    _findNearestInExternalPolygon(position) {
        let result = {
            distance: Infinity,
            node: null,
            k: -1,
        };
        let distance, node;
        for (let i = 0; i < this._polygon.polygon.length; i++) {
            node = this._polygon.polygon[i];
            distance = distanceSqrt(position, node.data.xy);
            if (result.distance > distance) {
                result.distance = distance;
                result.node = node;
                result.k = i;
            }
        }
        return result;
    }
}
