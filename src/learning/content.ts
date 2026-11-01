import type { StudyContent, StudyItem, Lesson } from '../shared/types'
import kana from '../content/kana/items.json'
import grammar from '../content/grammar/items.json'
import vocabulary from '../content/vocabulary/items.json'
import sentences from '../content/sentences/items.json'
import lessons from '../content/lessons.json'

export function loadContent(): StudyContent {
  return {
    items: [...kana, ...grammar, ...vocabulary, ...sentences] as StudyItem[],
    lessons: lessons as Lesson[]
  }
}
