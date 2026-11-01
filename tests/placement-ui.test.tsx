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
    for (let index = 0; index < 12 && !result; index++) {
      await user.click(screen.getAllByRole('button')[0])
    }
    expect(result?.starts).toEqual({
      kana: 'katakana-basic', grammar: 'N4', vocabulary: 'N4', sentences: 'N4'
    })
  })
})
