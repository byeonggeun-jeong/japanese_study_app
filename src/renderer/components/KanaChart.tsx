import { useState } from 'react'
import { basicKana, combinedKana, voicedKana } from '../../content/kana/syllabary'

type KanaCell = { kana: string; cue: string }
const parse = (text: string): KanaCell[] => text.trim().split(/\s+/).map(entry => {
  const [kana, cue] = entry.split(':')
  return { kana, cue }
})
const basicRows: (KanaCell | null)[][] = basicKana.split('\n').map(line => {
  const entries = parse(line)
  if (entries[0].kana === 'や') return [entries[0], null, entries[1], null, entries[2]]
  if (entries[0].kana === 'わ') return [entries[0], null, null, null, entries[1]]
  return entries
})
const rowsOf = (text: string, size: number): KanaCell[][] => {
  const entries = parse(text)
  return Array.from({ length: Math.ceil(entries.length / size) }, (_, index) => entries.slice(index * size, (index + 1) * size))
}

export function KanaChart() {
  const [script, setScript] = useState<'hiragana' | 'katakana'>('hiragana')
  const display = (kana: string) => script === 'hiragana' ? kana : [...kana].map(char => String.fromCodePoint(char.codePointAt(0)! + 0x60)).join('')
  const groups = [
    { title: '기본 문자', headings: ['a', 'i', 'u', 'e', 'o'], rows: basicRows },
    { title: '탁음·반탁음', headings: ['a', 'i', 'u', 'e', 'o'], rows: rowsOf(voicedKana, 5) },
    { title: '요음', headings: ['ya', 'yu', 'yo'], rows: rowsOf(combinedKana, 3) }
  ]
  return <div className="kana-chart-page">
    <div className="page-intro"><h1>문자표</h1><p>한글 표기는 발음 참고용입니다.</p></div>
    <div className="script-switch" role="group" aria-label="문자 종류">
      <button type="button" aria-pressed={script === 'hiragana'} onClick={() => setScript('hiragana')}>히라가나</button>
      <button type="button" aria-pressed={script === 'katakana'} onClick={() => setScript('katakana')}>가타카나</button>
    </div>
    <div className="kana-tables">
      {groups.map((group, groupIndex) => <section className="kana-table-card" key={group.title}>
        <table>
          <caption>{group.title}</caption>
          <thead><tr>{group.headings.map(heading => <th scope="col" key={heading}>{heading}</th>)}</tr></thead>
          <tbody>{group.rows.map((row, rowIndex) => <tr key={rowIndex}>{row.map((cell, column) => <td key={column}>
            {cell && <><span className="kana-glyph" lang="ja">{display(cell.kana)}</span><span className="kana-reading">{cell.cue}</span></>}
          </td>)}</tr>)}</tbody>
        </table>
        {groupIndex === 0 && <p className="kana-extra"><span lang="ja">{display('ん')}</span><span>비음</span></p>}
      </section>)}
    </div>
  </div>
}
