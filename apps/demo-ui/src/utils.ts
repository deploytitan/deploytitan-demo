export function cn(...classes: (string | false | null | undefined)[]) {
  return classes.filter(Boolean).join(' ')
}

export function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

export const GOLD = '#c9a84c'
export const GOLD_RGBA = 'rgba(201,168,76'
