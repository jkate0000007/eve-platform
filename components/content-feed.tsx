"use client"

import { useState, useRef, useEffect } from "react"
import { ContentPlayer } from "./content-player"
import { Button } from "@/components/ui/button"
import { ArrowUp, ArrowDown } from "lucide-react"

interface ContentFeedProps {
  posts: any[]
}

export function ContentFeed({ posts }: ContentFeedProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isScrolling, setIsScrolling] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  const handleScroll = (direction: 'up' | 'down') => {
    if (isScrolling) return

    setIsScrolling(true)
    
    if (direction === 'down' && currentIndex < posts.length - 1) {
      setCurrentIndex(prev => prev + 1)
    } else if (direction === 'up' && currentIndex > 0) {
      setCurrentIndex(prev => prev - 1)
    }

    setTimeout(() => setIsScrolling(false), 300)
  }

  const handleWheel = (e: WheelEvent) => {
    e.preventDefault()
    
    if (e.deltaY > 0) {
      handleScroll('down')
    } else {
      handleScroll('up')
    }
  }

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'ArrowDown' || e.key === ' ') {
      e.preventDefault()
      handleScroll('down')
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      handleScroll('up')
    }
  }

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    container.addEventListener('wheel', handleWheel, { passive: false })
    window.addEventListener('keydown', handleKeyDown)

    return () => {
      container.removeEventListener('wheel', handleWheel)
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [currentIndex, isScrolling])

  if (!posts || posts.length === 0) {
    return (
      <div className="h-full w-full flex items-center justify-center bg-black">
        <div className="text-center text-white">
          <h2 className="text-2xl font-bold mb-4">No content available</h2>
          <p className="text-gray-400">Check back later for featured content!</p>
        </div>
      </div>
    )
  }

  return (
    <div 
      ref={containerRef}
      className="h-full w-full bg-black relative overflow-hidden"
    >
      {/* Current Content */}
      <div className="h-full w-full">
        <ContentPlayer
          post={posts[currentIndex]}
          isActive={true}
          onLike={() => console.log('Like clicked')}
          onComment={() => console.log('Comment clicked')}
          onShare={() => console.log('Share clicked')}
        />
      </div>

      {/* Navigation Controls */}
      <div className="absolute right-4 top-1/2 transform -translate-y-1/2 flex flex-col gap-4">
        <Button
          variant="ghost"
          size="icon"
          className="h-12 w-12 bg-black/50 text-white hover:bg-black/70 disabled:opacity-50"
          onClick={() => handleScroll('up')}
          disabled={currentIndex === 0 || isScrolling}
        >
          <ArrowUp className="h-6 w-6" />
        </Button>
        
        <Button
          variant="ghost"
          size="icon"
          className="h-12 w-12 bg-black/50 text-white hover:bg-black/70 disabled:opacity-50"
          onClick={() => handleScroll('down')}
          disabled={currentIndex === posts.length - 1 || isScrolling}
        >
          <ArrowDown className="h-6 w-6" />
        </Button>
      </div>

      {/* Progress Indicator */}
      <div className="absolute top-4 left-4 bg-black/50 px-3 py-1 rounded-full">
        <span className="text-white text-sm">
          {currentIndex + 1} / {posts.length}
        </span>
      </div>

      {/* Instructions */}
      <div className="absolute bottom-20 left-4 bg-black/50 px-3 py-2 rounded-lg">
        <p className="text-white text-xs">
          Use arrow keys or scroll to navigate
        </p>
      </div>
    </div>
  )
} 