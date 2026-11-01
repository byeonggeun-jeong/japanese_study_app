import type { StudyContent, StudyItem, Lesson } from '../shared/types'
import kana from '../content/kana/items.json'
import grammar from '../content/grammar/items.json'
import vocabulary from '../content/vocabulary/items.json'
import sentences from '../content/sentences/items.json'
import lessons from '../content/lessons.json'
import { buildWordContent } from './wordContent'
import { buildGrammarContent } from './grammarContent'
import { buildSentenceContent } from './sentenceContent'
import { buildKanaContent } from './kanaContent'

export function loadContent(): StudyContent {
  const wordContent = buildWordContent()
  const grammarContent = buildGrammarContent()
  const sentenceContent = buildSentenceContent()
  const kanaContent = buildKanaContent()
  return {
    items: [...kana, ...grammar, ...vocabulary, ...sentences, ...kanaContent.items, ...wordContent.items, ...grammarContent.items, ...sentenceContent.items] as StudyItem[],
    lessons: [...lessons, ...kanaContent.lessons, ...wordContent.lessons, ...grammarContent.lessons, ...sentenceContent.lessons] as Lesson[]
  }
}
