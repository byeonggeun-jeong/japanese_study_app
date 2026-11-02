// @vitest-environment jsdom
import { cleanup, render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, expect, it, vi } from 'vitest'
import { App } from '../src/app/App'
import { Settings } from '../src/app/components/Settings'
import { createEmptyProgress } from '../src/server/progressStore'
afterEach(cleanup)
it('opens both kana charts from daily study without changing progress', async () => {
 const user=userEvent.setup()
 const save=vi.fn(async()=>{})
 render(<App api={{loadProgress:async()=>({...createEmptyProgress(),placement:{starts:{kana:'hiragana-basic'},completedAt:'2026-11-02'}}),saveProgress:save}} today="2026-11-02" />)
 const nav=await screen.findByRole('navigation',{name:'주요 메뉴'})
 expect(within(nav).getByRole('button',{name:'오늘의 학습'})).toBeTruthy()
 expect(screen.queryByText('기초부터 N4까지')).toBeNull()
 expect(within(screen.getByRole('main')).queryByRole('heading',{name:'자유 연습'})).toBeNull()
 await user.click(screen.getByRole('button',{name:'문자표 보기'}))
 expect(screen.getByRole('heading',{name:'문자표'})).toBeTruthy()
 for(const kana of ['あ','を','ん','が','きゃ']) expect(within(screen.getByRole('main')).getByText(kana)).toBeTruthy()
 await user.click(screen.getByRole('button',{name:'가타카나'}))
 for(const kana of ['ア','ヲ','ン','ガ','キャ']) expect(within(screen.getByRole('main')).getByText(kana)).toBeTruthy()
 expect(within(screen.getByRole('main')).queryByText('あ')).toBeNull()
 expect(save).not.toHaveBeenCalled()
 await user.click(within(nav).getByRole('button',{name:'오늘의 학습'}))
 expect(screen.getByRole('button',{name:'문자표 보기'})).toBeTruthy()
})
it('separates app information from credits and exposes the author and source links',()=>{
 render(<Settings onRedoPlacement={()=>{}} japaneseVoiceAvailable={false} />)
 expect(screen.getByRole('heading',{name:'앱 정보'})).toBeTruthy()
 expect(screen.getByRole('heading',{name:'콘텐츠 출처'})).toBeTruthy()
 expect(screen.getByRole('link',{name:'@byeonggeun-jeong'}).getAttribute('href')).toBe('https://github.com/byeonggeun-jeong')
 expect(screen.getByRole('link',{name:'소스 코드'}).getAttribute('href')).toBe('https://github.com/byeonggeun-jeong/japanese_study_app')
})
