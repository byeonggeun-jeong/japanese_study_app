export function ChoiceQuestion({ options, onAnswer, speechText, onSpeak }: {
  options: string[]
  onAnswer(value: string): void
  speechText?: string
  onSpeak?(text: string): void
}) {
  return (
    <>
      {speechText && onSpeak && <button type="button" className="listen-button" onClick={() => onSpeak(speechText)}>문장 듣기</button>}
      <div className="option-list" role="group" aria-label="답 선택">
        {options.map((option, index) => (
          <button type="button" key={`${option}-${index}`} onClick={() => onAnswer(option)}>{option}</button>
        ))}
      </div>
    </>
  )
}
