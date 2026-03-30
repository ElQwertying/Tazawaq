import { PHYSICS_THRESHOLD } from './config.js';

export function calculatePhysics(delta) {
	const sign = delta > 0 ? 1 : -1;
	const absDelta = Math.abs(delta);
	if (absDelta <= PHYSICS_THRESHOLD) return delta * 0.2;
	return (PHYSICS_THRESHOLD * 0.5 * sign) + (delta - (PHYSICS_THRESHOLD * sign)) * 2.0;
}