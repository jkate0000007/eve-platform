"use client"
import { createContext, useContext, useState } from "react"

const GlobalLoadingContext = createContext({
  loading: false,
  setLoading: (v: boolean) => {},
})

export function GlobalLoadingProvider({ children }: { children: React.ReactNode }) {
  const [loading, setLoading] = useState(false)
  return (
    <GlobalLoadingContext.Provider value={{ loading, setLoading }}>
      {children}
    </GlobalLoadingContext.Provider>
  )
}

export function useGlobalLoading() {
  return useContext(GlobalLoadingContext)
} 