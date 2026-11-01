import { loadContent } from '../src/learning/content'
import { validateContent } from '../src/learning/validateContent'

const { items, lessons } = loadContent()
const issues = validateContent(items, lessons)
const targets = { vocabulary: 1200, grammar: 100, sentences: 300 } as const
for (const [chapter, minimum] of Object.entries(targets)) {
  const count = items.filter((item) => item.chapter === chapter).length
  if (count < minimum) issues.push({ code: 'inventory-below-target', id: `${chapter}: ${count}/${minimum}` })
}
if (lessons.length < 120) issues.push({ code: 'inventory-below-target', id: `lessons: ${lessons.length}/120` })

if (issues.length > 0) {
  for (const issue of issues) console.error(`${issue.code}: ${issue.id}`)
  process.exitCode = 1
} else {
  console.log(`Validated ${items.length} items in ${lessons.length} lessons.`)
}
