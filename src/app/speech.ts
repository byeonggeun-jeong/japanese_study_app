export function getJapaneseVoice(synthesis: SpeechSynthesis | undefined = globalThis.speechSynthesis): SpeechSynthesisVoice | null {
  return synthesis?.getVoices().find((voice) => /^ja(?:-|$)/i.test(voice.lang)) ?? null
}

export function watchJapaneseVoice(
  onChange: (available: boolean) => void,
  synthesis: SpeechSynthesis | undefined = globalThis.speechSynthesis
): () => void {
  if (!synthesis) {
    onChange(false)
    return () => {}
  }
  const update = () => onChange(Boolean(getJapaneseVoice(synthesis)))
  synthesis.addEventListener('voiceschanged', update)
  update()
  return () => synthesis.removeEventListener('voiceschanged', update)
}

export function speakJapanese(
  text: string,
  synthesis: SpeechSynthesis | undefined = globalThis.speechSynthesis,
  makeUtterance: (text: string) => SpeechSynthesisUtterance = (value) => new SpeechSynthesisUtterance(value)
): boolean {
  const voice = getJapaneseVoice(synthesis)
  if (!voice || !synthesis || !text.trim()) return false
  const utterance = makeUtterance(text)
  utterance.voice = voice
  utterance.lang = voice.lang
  utterance.rate = 0.9
  synthesis.cancel()
  synthesis.speak(utterance)
  return true
}
