export const FRAME_RATE = 25

export function getTimeFromFrames(frames: number): number {
	return (1000 / FRAME_RATE) * frames
}
