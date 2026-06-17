const fs = require('fs')
const path = require('path')

function safeReadJson(filePath) {
  try {
    return JSON.parse(fs.readFileSync(filePath, 'utf8') || '[]')
  } catch (e) {
    return []
  }
}

const reportsPath = path.resolve(process.cwd(), 'reports', 'reports.json')
if (!fs.existsSync(reportsPath)) {
  console.log('\n[GLOBAL SUMMARY] No reports found (reports/reports.json missing).')
  process.exit(0)
}

const reports = safeReadJson(reportsPath)

let totalClicks = 0
let matchedClicks = 0
let mismatchedClicks = 0
let noDbRows = 0

const fields = {
  title: { match: 0, total: 0 },
  referer: { match: 0, total: 0 },
  url: { match: 0, total: 0 },
  numEmpleado: { match: 0, total: 0 }
}

for (const report of reports) {
  const clicks = Array.isArray(report.clicks) ? report.clicks : []
  for (const c of clicks) {
    const detail = c.detail ?? c
    totalClicks++
    const match = detail.match ?? null
    const db = detail.database ?? {}
    const hasDb = db && Object.keys(db).length > 0
    if (!hasDb) noDbRows++

    if (match && typeof match === 'object') {
      for (const key of Object.keys(fields)) {
        if (key in match) {
          fields[key].total++
          if (match[key]) fields[key].match++
        }
      }
      if (detail.matchOk === true) matchedClicks++
      else mismatchedClicks++
    } else {
      // no match info: count as mismatched for visibility
      mismatchedClicks++
    }
  }
}

console.log('\n===== GLOBAL CLICKS SUMMARY =====')
console.log(`Total clicks processed: ${totalClicks}`)
console.log(`Clicks with DB row found: ${totalClicks - noDbRows}`)
console.log(`Clicks without DB row: ${noDbRows}`)
console.log(`Clicks fully matched: ${matchedClicks}`)
console.log(`Clicks with mismatches (or no match info): ${mismatchedClicks}`)
console.log('\nPer-field matches:')
for (const [k, v] of Object.entries(fields)) {
  console.log(` - ${k}: ${v.match} / ${v.total} matched`)
}
console.log('=================================\n')

// exit normally
process.exit(0)
