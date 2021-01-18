const TWO_PI = Math.PI * 2;

/**
 * @param {Number[]} v1
 * @param {Number[]} v2
 * @return {number}
 */
function distanceSqrt(v1, v2) {
    return Math.pow((v2[0] - v1[0]), 2) + Math.pow((v2[1] - v1[1]), 2);
}

/**
 * Find the nearest point on a segment A,B
 *
 * @param {Number[]} a
 * @param {Number[]} b
 * @param {Number[]} c
 * @see https://stackoverflow.com/questions/61333058/find-the-nearest-point-on-a-segment
 */
function findNearestPointOnSegment(a, b, c) {
    let o = distanceSqrt(a, b);

    // In coordinates:
    let cf = ((b[0] - a[0]) * (c[0] - a[0]) + (b[1] - a[1]) * (c[1] - a[1])) / o;
    if (cf < 0)
        return a;
    if (cf > 1)
        return b;
    return [a[0] + (b[0] - a[0]) * cf, a[1] + (b[1] - a[1]) * cf];
}

function normalizeRadians(degrees) {
    while (degrees < 0) {
        degrees += TWO_PI;
    }
    while (degrees > TWO_PI) {
        degrees -= TWO_PI;
    }
    return degrees;
}

/**
 * Return i+1 or zero if the end of the array is reached
 * @param {Number} i
 * @param {Number} arrayLength
 * @return {Number}
 */
function getNextArrayIndex(i, arrayLength) {
    i++;
    if (i >= arrayLength)
        return 0;
    return i;
}

/**
 * Return i-1 or arrayLength-1 if index out of array range
 * @param {Number} i
 * @param {Number} arrayLength
 * @return {Number}
 */
function getPreviousArrayIndex(i, arrayLength) {
    i--;
    if (i < 0)
        return arrayLength - 1;
    return i;
}

export {
    distanceSqrt,
    findNearestPointOnSegment,
    normalizeRadians,
    getNextArrayIndex,
    getPreviousArrayIndex
}
