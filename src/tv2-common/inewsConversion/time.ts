export function TimeFromINewsField(field: string | undefined): number {
	const time = Number(field)
	if (isNaN(time)) {
		return 0
	}

	return time
}
