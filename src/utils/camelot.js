// src/utils/camelot.js
export function getCompatibleKeys(currentKey) {
  if (!currentKey) return []

  const match = currentKey.match(/^(\d{1,2})([AB])$/)
  if (!match) return []

  const num = parseInt(match[1])
  const letter = match[2]

  const sameLetterPlus = num === 12 ? 1 : num + 1
  const sameLetterMinus = num === 1 ? 12 : num - 1
  const oppositeLetter = letter === 'A' ? 'B' : 'A'

  return [
    currentKey,
    `${sameLetterPlus}${letter}`,
    `${sameLetterMinus}${letter}`,
    `${num}${oppositeLetter}`
  ]
}