import { useEffect, useRef, useState } from 'react'
import type { SkyObject } from './catalogue'
import { fetchObjectInfo, type ObjectInfo } from './objectInfo'
import { Icon } from './Icons'

type Props = { object: SkyObject; onClose: () => void }

type State =
  | { status: 'loading' }
  | { status: 'error'; message: string }
  | { status: 'ready'; info: ObjectInfo }

export default function ObjectInfoModal({ object, onClose }: Props) {
  const dialogRef = useRef<HTMLDialogElement>(null)
  const [state, setState] = useState<State>({ status: 'loading' })
  const [attempt, setAttempt] = useState(0)

  useEffect(() => {
    const dialog = dialogRef.current
    if (!dialog || dialog.open) return
    if (typeof dialog.showModal === 'function') dialog.showModal()
    else dialog.setAttribute('open', '')
  }, [])

  useEffect(() => {
    const controller = new AbortController()
    fetchObjectInfo(object, controller.signal)
      .then((info) => setState({ status: 'ready', info }))
      .catch((error: unknown) => {
        if (controller.signal.aborted) return
        setState({
          status: 'error',
          message: error instanceof Error ? error.message : 'Could not load more info right now.'
        })
      })
    return () => controller.abort()
  }, [object, attempt])

  return (
    <dialog
      ref={dialogRef}
      className="info-modal"
      aria-labelledby="info-modal-title"
      onClose={onClose}
      onClick={(event) => {
        if (event.target === dialogRef.current) dialogRef.current?.close()
      }}
    >
      <div className="info-modal-body">
        <div className="info-modal-header">
          <div>
            <p className="object-type">{object.kind}</p>
            <h3 id="info-modal-title">{object.name}</h3>
          </div>
          <button type="button" className="info-close" aria-label="Close"
            onClick={() => dialogRef.current?.close()}>✕</button>
        </div>

        {state.status === 'loading' && (
          <p className="info-status" role="status">Asking the AI guide about {object.name}…</p>
        )}

        {state.status === 'error' && (
          <div className="info-status" role="alert">
            <p>{state.message}</p>
            <button type="button" className="secondary-button"
              onClick={() => { setState({ status: 'loading' }); setAttempt((v) => v + 1) }}>
              Try again
            </button>
          </div>
        )}

        {state.status === 'ready' && (
          <>
            <p className="info-summary">{state.info.summary}</p>
            <dl className="info-details">
              {state.info.details.map((detail) => (
                <div key={detail.label}>
                  <dt>{detail.label}</dt>
                  <dd>{detail.value}</dd>
                </div>
              ))}
            </dl>
            <h4 className="info-facts-title"><Icon name="spark" size={16} /> Fun facts</h4>
            <ul className="info-facts">
              {state.info.funFacts.map((fact) => <li key={fact}>{fact}</li>)}
            </ul>
            <p className="info-disclaimer">AI-generated — double-check anything important.</p>
          </>
        )}
      </div>
    </dialog>
  )
}