export class M2LXConfigurationError extends Error {}

export function m2lxAssert(condition: unknown, message: string): asserts condition {
	if (!condition) {
		throw new M2LXConfigurationError(`M2L-X: ${message}`)
	}
}
