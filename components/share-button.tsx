"use client"

import { Button } from "@/components/ui/button"
import { Send as LucideSend } from "lucide-react"
import { PaperAirplaneIcon as SendSolid } from "@heroicons/react/24/solid"
import { useToast } from "@/hooks/use-toast"
import { useState } from "react"
import { Send } from "lucide-react";

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
      <div className="flex flex-col items-center">
        <button
          type="button"
          className="bg-transparent border-none p-0 m-0 focus:outline-none"
          onClick={handleShare}
          aria-label="Share"
          title="Share"
        >
          <SendSolid className={`h-8 w-8 transition-colors ${copied ? "text-blue-500" : "text-white"}`} />
        </button>
        {copied && <span className="text-xs font-semibold mt-1 text-white drop-shadow">Copied!</span>}
      </div>
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
        <Send className="h-4 w-4 mr-2" />
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
      <Send className="h-4 w-4" />
      {label || "Share"}
    </Button>
  )
} 