"use client"
import { useState, useEffect } from "react"

type Props = {
  creatorId: string
  userId: string
}

export default function RatingStars({ creatorId, userId }: Props) {
  const [rating, setRating] = useState<number>(0)
  const [hoverValue, setHoverValue] = useState<number>(0)
  const [loading, setLoading] = useState(false)

  const submitRating = async (value: number) => {
    setLoading(true)
    setRating(value)

    await fetch("/api/rate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ creatorId, rating: value }),
    })

    setLoading(false)
  }

  return (
    <div className="flex gap-1 text-yellow-500 text-2xl mt-2">
      {[...Array(10)].map((_, i) => {
        const value = i + 1
        return (
          <span
            key={value}
            onClick={() => !loading && submitRating(value)}
            onMouseEnter={() => setHoverValue(value)}
            onMouseLeave={() => setHoverValue(0)}
            className={`cursor-pointer transition ${
              (hoverValue || rating) >= value ? "text-yellow-500" : "text-gray-300"
            }`}
          >
            ★
          </span>
        )
      })}
    </div>
  )
}
