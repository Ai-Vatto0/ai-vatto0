import { CREDITS_PER_VIDEO, STATUS } from '../../types/index'

export function GenerateButton({ onClick, status, credits, hasImage, hasPrompt }) {
  const isGenerating = status === STATUS.PENDING || status === STATUS.RUNNING
  const canGenerate = hasImage && hasPrompt && !isGenerating && (credits === null || credits >= CREDITS_PER_VIDEO)
  const notEnoughCredits = credits !== null && credits < CREDITS_PER_VIDEO

  let label = `⚡ GENERATE — ${CREDITS_PER_VIDEO} CREDITS`
  if (isGenerating) label = '⏳ GENERATING...'
  else if (!hasImage) label = '🖼 SELECT IMAGE FIRST'
  else if (!hasPrompt) label = '✍ ADD PROMPT FIRST'
  else if (notEnoughCredits) label = '❌ NOT ENOUGH CREDITS'

  return (
    <button
      onClick={canGenerate ? onClick : undefined}
      disabled={!canGenerate}
      style={{
        width: '100%',
        padding: '16px',
        fontFamily: 'Impact, Arial Black, sans-serif',
        fontSize: '16px',
        letterSpacing: '2px',
        textTransform: 'uppercase',
        borderRadius: '4px',
        cursor: canGenerate ? 'pointer' : 'not-allowed',
        transition: 'all 100ms ease',
        background: isGenerating
          ? 'linear-gradient(135deg, #2a1a00, #1a0800)'
          : !canGenerate
            ? 'rgba(255,255,255,0.05)'
            : 'linear-gradient(135deg, #ff6b35 0%, #cc2200 50%, #ff6b35 100%)',
        backgroundSize: isGenerating ? undefined : '200% 100%',
        color: canGenerate ? '#fff' : 'rgba(255,255,255,0.3)',
        border: `1px solid ${isGenerating ? 'rgba(255,170,0,0.4)' : canGenerate ? 'rgba(255,107,53,0.6)' : 'rgba(255,255,255,0.1)'}`,
        boxShadow: canGenerate && !isGenerating ? '0 0 25px rgba(255,107,53,0.4)' : 'none',
        animation: isGenerating ? 'pulse-gold 1.5s ease infinite' : undefined,
      }}
    >
      {label}
    </button>
  )
}
