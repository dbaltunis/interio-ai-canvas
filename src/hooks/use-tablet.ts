import { useState, useEffect } from "react"

const TABLET_MIN = 768
const TABLET_MAX = 1024

export function useIsTablet() {
  const [isTablet, setIsTablet] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    const width = window.innerWidth;
    return width >= TABLET_MIN && width < TABLET_MAX;
  })

  useEffect(() => {
    const onChange = () => {
      const width = window.innerWidth;
      setIsTablet(width >= TABLET_MIN && width < TABLET_MAX);
    }
    
    window.addEventListener("resize", onChange)
    onChange()
    
    return () => window.removeEventListener("resize", onChange)
  }, [])

  return isTablet
}
