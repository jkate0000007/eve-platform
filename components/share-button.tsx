"use client"

import { Button } from "@/components/ui/button"
import { ArrowRight } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useState } from "react"

interface ShareButtonProps {
  url: string
  variant?: "default" | "shorts" | "profile"
  label?: string
}

export function ShareButton({ url, variant = "default", label }: ShareButtonProps) {
  const { toast } = useToast()
  const [copied, setCopied] = useState(false)

  const handleShare = async () => {
    try {
      if (navigator.share) {
        await navigator.share({ url })
      } else {
        await navigator.clipboard.writeText(url)
        setCopied(true)
        toast({
          title: "Link copied!",
          description: "You can now share it anywhere.",
        })
        setTimeout(() => setCopied(false), 2000)
      }
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to copy/share link.",
        variant: "destructive",
      })
    }
  }

  if (variant === "shorts") {
    return (
      <Button
        type="button"
        size="icon"
        className={`rounded-full shadow-md transition-colors flex flex-col items-center justify-center w-12 h-12 bg-white text-gray-900 hover:bg-blue-100`}
        style={{ border: "none" }}
        onClick={handleShare}
        aria-label="Share"
      >
        <ArrowRight className="h-6 w-6" />
      </Button>
    )
  }
  if (variant === "profile") {
    return (
      <Button
        variant="outline"
        size="default"
        className="w-full border-blue-200 text-blue-600 hover:bg-blue-50 hover:text-blue-700"
        onClick={handleShare}
        aria-label="Share Profile"
      >
        <ArrowRight className="h-4 w-4 mr-2" />
        {label || "Share Profile"}
      </Button>
    )
  }
  return (
    <Button
      variant="ghost"
      size="sm"
      className="flex items-center gap-1 text-blue-500 hover:text-blue-600"
      onClick={handleShare}
      aria-label="Share"
    >
      <ArrowRight className="h-4 w-4" />
      {label || "Share"}
    </Button>
  )
} 