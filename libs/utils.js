export function easeInOutQuad(t) {
    return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
}
export function easeIn(t) {
    return t * t;
}
export function easeOut(t) {
    return 1 - (1 - t) * (1 - t);
}
//# sourceMappingURL=utils.js.map