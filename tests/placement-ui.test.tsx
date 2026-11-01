// @vitest-environment jsdom
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import { Placement } from '../src/renderer/components/Placement'
import { loadContent } from '../src/learning/content'
import type { PlacementResult } from '../src/learning/placement'

describe('placement screen', () => {
  it('finishes the staged questions and reports separate chapter starts', async () => {
    const user = userEvent.setup()
    let result: PlacementResult | undefined
    render(<Placement items={loadContent().items} onComplete={(value) => { result = value }} />)

    expect(screen.getByRole('heading', { name: '시작점 찾기' })).toBeTruthy()
    for (const answer of ['아', '이', '캬', 'です', 'へ', 'もいい', 'みず', 'やま', 'やくそく', '물을 주세요.', '이것은 책입니다.', '비가 오면 외출하지 않겠습니다.']) {
      await user.click(screen.getByRole('button', { name: answer, exact: true }))
    }
    expect(result?.starts).toEqual({
      kana: 'katakana-basic', grammar: 'N4', vocabulary: 'N4', sentences: 'N4'
    })
  })
})
