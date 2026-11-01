export function orderOptions(options: string[], seed: string): string[] {
  let state = 2166136261
  for (const character of seed) state = Math.imul(state ^ character.charCodeAt(0), 16777619) >>> 0
  const ordered = [...options]
  for (let index = ordered.length - 1; index > 0; index--) {
    state ^= state << 13
    state ^= state >>> 17
    state ^= state << 5
    const other = (state >>> 0) % (index + 1)
    ;[ordered[index], ordered[other]] = [ordered[other], ordered[index]]
  }
  return ordered
}
