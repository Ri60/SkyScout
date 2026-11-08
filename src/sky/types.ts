import type { buildSky, SkyPoint } from '../skyView'

export type SkyScene = ReturnType<typeof buildSky>
export type ScreenPoint = { x: number; y: number }
export type ProjectPoint = (point: SkyPoint) => ScreenPoint | null

export const SKY_WIDTH = 960
export const SKY_HEIGHT = 540
export const COMPASS_DIRECTIONS = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW']
