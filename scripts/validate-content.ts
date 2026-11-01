import { loadContent } from '../src/learning/content'
import { validateContent } from '../src/learning/validateContent'

const { items, lessons } = loadContent()
const issues = validateContent(items, lessons)

if (issues.length > 0) {
  for (const issue of issues) console.error(`${issue.code}: ${issue.id}`)
  process.exitCode = 1
} else {
  console.log(`Validated ${items.length} items in ${lessons.length} lessons.`)
}
