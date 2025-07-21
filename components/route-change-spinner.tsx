"use client"
import { useGlobalLoading } from "@/components/global-loading-context"
import { usePathname } from "next/navigation"
import { useEffect } from "react"
import { Spinner } from "@/components/ui/skeleton"

export function RouteChangeSpinner() {
  const { loading, setLoading } = useGlobalLoading()
  const pathname = usePathname()

  useEffect(() => {
    // Hide spinner after route change
    setLoading(false)
    // eslint-disable-next-line
  }, [pathname])

  if (!loading) return null
  
  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/20 pointer-events-none">
      <Spinner size={48} className="text-primary" />
    </div>
  )
} 