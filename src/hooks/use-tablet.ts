import { useState, useEffect } from "react"

const TABLET_MIN_BREAKPOINT = 768
const TABLET_MAX_BREAKPOINT = 1024

export function useIsTablet() {
  const [isTablet, setIsTablet] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    return window.innerWidth >= TABLET_MIN_BREAKPOINT && window.innerWidth < TABLET_MAX_BREAKPOINT;
  })

  useEffect(() => {
    const mql = window.matchMedia(`(min-width: ${TABLET_MIN_BREAKPOINT}px) and (max-width: ${TABLET_MAX_BREAKPOINT - 1}px)`)
    const onChange = () => {
      setIsTablet(window.innerWidth >= TABLET_MIN_BREAKPOINT && window.innerWidth < TABLET_MAX_BREAKPOINT)
    }

    mql.addEventListener("change", onChange)
    setIsTablet(window.innerWidth >= TABLET_MIN_BREAKPOINT && window.innerWidth < TABLET_MAX_BREAKPOINT)

    return () => mql.removeEventListener("change", onChange)
  }, [])

  return isTablet
}
