import { basicKana, combinedKana, voicedKana } from '../content/kana/syllabary'
import type { Lesson, StudyItem } from '../shared/types'

function parse(source: string): { kana: string; cue: string }[] {
  return source.split(/\s+/).map((part) => {
    const separator = part.indexOf(':')
    if (separator < 1) throw new Error(`Invalid kana: ${part}`)
    return { kana: part.slice(0, separator), cue: part.slice(separator + 1) }
  })
}

function toKatakana(hiragana: string): string {
  return [...hiragana].map((character) => String.fromCodePoint(character.codePointAt(0)! + 0x60)).join('')
}

export function buildKanaContent(): { items: StudyItem[]; lessons: Lesson[] } {
  const items: StudyItem[] = []
  const lessons: Lesson[] = []
  for (const [script, transform] of [
    ['hiragana', (kana: string) => kana],
    ['katakana', toKatakana]
  ] as const) {
    for (const [group, source] of [['basic', basicKana], ['voiced', voicedKana], ['combined', combinedKana]] as const) {
      const entries = parse(source).map(({ kana, cue }) => ({ kana: transform(kana), cue }))
      const cues = [...new Set(entries.map((entry) => entry.cue))]
      entries.forEach((entry, index) => {
        if (script === 'hiragana' && ['あ', 'い', 'きゃ'].includes(entry.kana)) return
        const lessonNumber = Math.floor(index / 10) + 1
        const lessonId = `kana-${script}-${group}-${lessonNumber}`
        let lesson = lessons.find((candidate) => candidate.id === lessonId)
        if (!lesson) {
          lesson = { id: lessonId, chapter: 'kana', level: 'kana', topicId: `${script}-${group}`,
            title: `${script === 'hiragana' ? '히라가나' : '가타카나'} ${group === 'basic' ? '기본' : group === 'voiced' ? '탁음·반탁음' : '요음'} ${lessonNumber}`,
            estimatedMinutes: 10, itemIds: [] }
          lessons.push(lesson)
        }
        const id = `kana-${script}-${group}-${String(index + 1).padStart(2, '0')}`
        lesson.itemIds.push(id)
        const distractors = cues.filter((cue) => cue !== entry.cue)
        items.push({
          id, chapter: 'kana', level: 'kana', topicId: `${script}-${group}`, lessonId,
          kind: group === 'basic' && index % 7 === 2 ? 'input' : 'choice',
          prompt: `「${entry.kana}」의 소리는 무엇에 가깝나요?${group === 'basic' && index % 7 === 2 ? ' 한글로 입력하세요.' : ''}`,
          options: [entry.cue, ...[0, 1, 2].map((offset) => distractors[(index * 3 + offset * 7) % distractors.length])],
          answer: entry.cue,
          explanation: `「${entry.kana}」는 한국어로 ‘${entry.cue}’에 가까운 소리입니다. 일본어의 길이와 입 모양도 함께 익혀 보세요.`,
          speechText: entry.kana
        })
      })
    }
  }
  const special = [
    ['hiragana', '「きって」의 작은 「っ」는 어떻게 읽나요?', '다음 자음을 한 박자 막았다가 냅니다', 'きって', '「っ」는 촉음입니다. 다음 자음 앞에서 한 박자 멈추며, 「きって」는 표·우표 등을 뜻합니다.'],
    ['hiragana', '「がっこう」의 「っ」는 어떤 역할인가요?', '다음 자음 앞에 짧은 멈춤을 넣습니다', 'がっこう', '「がっこう」의 작은 っ는 촉음으로, こ 앞에서 한 박자 멈춥니다.'],
    ['hiragana', '「おばあさん」과 「おばさん」을 구별하는 소리는?', 'あ를 길게 발음하는지', 'おばあさん', '「おばあさん」은 할머니, 「おばさん」은 아주머니·이모 등입니다. あ의 길이가 뜻을 바꿉니다.'],
    ['hiragana', '「おにいさん」의 긴 소리는 어디인가요?', 'にい', 'おにいさん', '「おにいさん」에서는 にい를 길게 읽습니다. 한 박자의 차이를 의식하세요.'],
    ['hiragana', '「きょう」의 소리 길이에 맞는 것은?', '쿄오에 가까운 긴 소리', 'きょう', '「きょう」는 오늘이라는 뜻이며 よう 부분을 길게 읽습니다.'],
    ['hiragana', '「まって」의 「っ」를 빠뜨리면?', '소리 길이가 달라집니다', 'まって', '「まって」는 기다려라는 말입니다. 작은 っ의 한 박자를 살려 읽습니다.'],
    ['katakana', '「コーヒー」의 「ー」는 무엇을 나타내나요?', '바로 앞 모음을 길게 읽습니다', 'コーヒー', '가타카나의 「ー」는 장음 부호입니다. 「コーヒー」에서는 오와 이 소리를 길게 냅니다.'],
    ['katakana', '「スーパー」의 「ー」는 몇 번 나오나요?', '두 번', 'スーパー', '「スーパー」에는 장음 부호가 두 번 있으며 각각 앞 모음을 길게 읽습니다.'],
    ['katakana', '「ベッド」의 작은 「ッ」는?', '다음 자음 앞에 한 박자 멈춥니다', 'ベッド', '「ベッド」의 작은 ッ는 촉음이며 ド 앞에서 한 박자 멈춥니다.'],
    ['katakana', '「ケーキ」의 긴 소리를 만드는 글자는?', 'ー', 'ケーキ', '「ケーキ」의 ー가 ケ의 모음을 길게 만듭니다.'],
    ['katakana', '「サッカー」의 작은 「ッ」는?', '촉음', 'サッカー', '「サッカー」의 작은 ッ는 다음 カ 앞에서 한 박자 멈추는 촉음입니다.'],
    ['katakana', '「メール」의 「ー」를 빼면?', '모음 길이가 달라집니다', 'メール', '「メール」은 이메일을 뜻하며 ー로 メ의 모음을 길게 읽습니다.']
  ] as const
  for (const script of ['hiragana', 'katakana'] as const) {
    const examples = special.filter((entry) => entry[0] === script)
    const lessonId = `kana-${script}-special-1`
    const itemIds: string[] = []
    examples.forEach(([, prompt, answer, speechText, explanation], index) => {
      const id = `kana-${script}-special-${index + 1}`
      itemIds.push(id)
      const distractors = examples.map((entry) => entry[2]).filter((choice) => choice !== answer)
      items.push({
        id, chapter: 'kana', level: 'kana', topicId: `${script}-special`, lessonId,
        kind: 'choice', prompt, options: [answer, ...distractors.slice(0, 3)], answer, explanation, speechText
      })
    })
    lessons.push({ id: lessonId, chapter: 'kana', level: 'kana', topicId: `${script}-special`,
      title: `${script === 'hiragana' ? '히라가나' : '가타카나'} 촉음·장음`, estimatedMinutes: 10, itemIds })
  }
  return { items, lessons }
}
