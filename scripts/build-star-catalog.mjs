import { readFileSync, writeFileSync } from 'node:fs'

const parse = (line) => {
  const values = []
  let value = ''
  let quoted = false
  for (let index = 0; index < line.length; index += 1) {
    const char = line[index]
    if (char === '"') {
      if (quoted && line[index + 1] === '"') { value += char; index += 1 } else quoted = !quoted
    } else if (char === ',' && !quoted) { values.push(value); value = '' } else value += char
  }
  values.push(value)
  return values
}

const rows = readFileSync(process.argv[2], 'utf8').trim().split('\n').slice(1)
const stars = rows.flatMap((row) => {
  const fields = parse(row)
  const ra = Number(fields[7]); const dec = Number(fields[8]); const magnitude = Number(fields[13])
  return Number.isFinite(ra) && Number.isFinite(dec) && Number.isFinite(magnitude) && magnitude > -2 && magnitude <= 6.5
    ? [[Number(ra.toFixed(5)), Number(dec.toFixed(5)), Number(magnitude.toFixed(2))]] : []
})
writeFileSync(process.argv[3], JSON.stringify(stars))
console.log(`Wrote ${stars.length} stars`)
