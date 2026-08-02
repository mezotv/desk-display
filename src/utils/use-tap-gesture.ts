import { useCallback, useEffect, useRef } from 'react'

const DOUBLE_TAP_DELAY_MS = 300

export function useTapGesture(
  onSingleTap: () => void,
  onDoubleTap: () => void,
) {
  const lastTapAt = useRef(0)
  const singleTapTimer = useRef<number | null>(null)
  const singleTapCallback = useRef(onSingleTap)
  const doubleTapCallback = useRef(onDoubleTap)

  singleTapCallback.current = onSingleTap
  doubleTapCallback.current = onDoubleTap

  useEffect(
    () => () => {
      if (singleTapTimer.current !== null) {
        window.clearTimeout(singleTapTimer.current)
      }
    },
    [],
  )

  return useCallback(() => {
    const now = Date.now()

    if (now - lastTapAt.current <= DOUBLE_TAP_DELAY_MS) {
      if (singleTapTimer.current !== null) {
        window.clearTimeout(singleTapTimer.current)
        singleTapTimer.current = null
      }

      lastTapAt.current = 0
      doubleTapCallback.current()
      return
    }

    lastTapAt.current = now
    singleTapTimer.current = window.setTimeout(() => {
      lastTapAt.current = 0
      singleTapTimer.current = null
      singleTapCallback.current()
    }, DOUBLE_TAP_DELAY_MS)
  }, [])
}
