import { describe, expect, it, vi } from 'vitest'
import { getJapaneseVoice, speakJapanese, watchJapaneseVoice } from '../src/app/speech'

function voice(lang: string): SpeechSynthesisVoice {
  return { lang, name: lang, default: false, localService: true, voiceURI: lang } as SpeechSynthesisVoice
}

function synthesis(initialVoices: SpeechSynthesisVoice[]) {
  let voices = initialVoices
  const listeners = new Set<() => void>()
  const synth = {
    getVoices: () => voices,
    cancel: vi.fn(),
    speak: vi.fn(),
    addEventListener: (_event: string, callback: () => void) => { listeners.add(callback) },
    removeEventListener: (_event: string, callback: () => void) => { listeners.delete(callback) }
  } as unknown as SpeechSynthesis
  return { synth, setVoices(next: SpeechSynthesisVoice[]) { voices = next; listeners.forEach((listener) => listener()) } }
}

describe('device Japanese speech', () => {
  it('selects an available Japanese voice', () => {
    const { synth } = synthesis([voice('ko-KR'), voice('ja-JP')])
    expect(getJapaneseVoice(synth)?.lang).toBe('ja-JP')
  })

  it('returns false and never speaks without a Japanese voice', () => {
    const { synth } = synthesis([voice('ko-KR')])
    expect(speakJapanese('こんにちは', synth, () => ({} as SpeechSynthesisUtterance))).toBe(false)
    expect(synth.speak).not.toHaveBeenCalled()
  })

  it('reports a voice that arrives later and unregisters its listener', () => {
    const source = synthesis([])
    const callback = vi.fn()
    const stop = watchJapaneseVoice(callback, source.synth)
    expect(callback).toHaveBeenCalledWith(false)
    source.setVoices([voice('ja-JP')])
    expect(callback).toHaveBeenLastCalledWith(true)
    stop()
    source.setVoices([])
    expect(callback).toHaveBeenCalledTimes(2)
  })

  it('cancels prior speech before replaying with the selected voice', () => {
    const japanese = voice('ja-JP')
    const { synth } = synthesis([japanese])
    const utterances: SpeechSynthesisUtterance[] = []
    const make = (text: string) => {
      const utterance = { text } as SpeechSynthesisUtterance
      utterances.push(utterance)
      return utterance
    }
    expect(speakJapanese('あ', synth, make)).toBe(true)
    expect(speakJapanese('い', synth, make)).toBe(true)
    expect(synth.cancel).toHaveBeenCalledTimes(2)
    expect(synth.speak).toHaveBeenCalledTimes(2)
    expect(utterances[1].voice).toBe(japanese)
    expect(utterances[1].lang).toBe('ja-JP')
  })
})
