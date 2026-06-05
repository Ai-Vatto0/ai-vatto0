import { STATUS } from '../../hooks/useGenerate'

const LABEL = {
  [STATUS.UPLOADING]: 'Bild wird hochgeladen…',
  [STATUS.CREATING]: 'Task wird erstellt…',
  [STATUS.PENDING]: 'In Warteschlange…',
  [STATUS.RUNNING]: 'Wird gerendert…',
  [STATUS.SUCCEEDED]: 'Fertig',
  [STATUS.FAILED]: 'Fehlgeschlagen',
}

export function StatusBadge({ status }) {
  if (status === STATUS.IDLE) return null
  const kind = status === STATUS.SUCCEEDED ? 'ok' : status === STATUS.FAILED ? 'err' : 'running'
  const pulse = ![STATUS.SUCCEEDED, STATUS.FAILED].includes(status)
  return (
    <span className={`badge ${kind}`}>
      <i className={`dot ${pulse ? 'pulse' : ''}`} />
      {LABEL[status] || status}
    </span>
  )
}
