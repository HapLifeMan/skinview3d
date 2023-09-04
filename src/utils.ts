export function easeInOutQuad(t: number): number {
	return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2
}

export function easeIn(t: number): number {
	return t * t
}

export function easeOut(t: number): number {
	return 1 - (1 - t) * (1 - t)
}
