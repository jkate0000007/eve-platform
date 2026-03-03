"use client"

import { useState } from "react"

type Props = {
  creatorId: string
  userId: string
}

const TRAITS = [
  { key: "caring", label: "Caring" },
  { key: "pretty", label: "Pretty" },
  { key: "funny", label: "Funny" },
  { key: "kind", label: "Kind" },
  { key: "face_card", label: "Face card" },
  { key: "romantic", label: "Romantic" },
  { key: "cute", label: "Cute" },
  { key: "body", label: "Body" },
] as const

export default function TraitRating({ creatorId, userId }: Props) {
  const [selected, setSelected] = useState<string[]>([])
  const [loading, setLoading] = useState(false)

  const toggleTrait = (trait: string) => {
    if (loading) return

    setSelected((prev) =>
      prev.includes(trait)
        ? prev.filter((t) => t !== trait)
        : [...prev, trait]
    )
  }

  const submitRating = async () => {
    setLoading(true)

    await fetch("/api/rate-traits", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        creatorId,
        traits: selected,
      }),
    })

    setLoading(false)
  }

  return (
    <div className="mt-4">
      {/* Trait pills */}
      <div className="flex flex-wrap gap-2">
        {TRAITS.map((trait) => {
          const active = selected.includes(trait.key)

          return (
            <button
              key={trait.key}
              onClick={() => toggleTrait(trait.key)}
              className={`px-4 py-2 rounded-full text-sm transition
                ${
                  active
                    ? "bg-violet-600 text-white shadow"
                    : "bg-muted text-muted-foreground hover:bg-muted/70"
                }`}
            >
              {trait.label}
            </button>
          )
        })}
      </div>

      {/* Submit */}
      <button
        onClick={submitRating}
        disabled={loading || selected.length === 0}
        className="mt-4 px-6 py-2 rounded-full bg-primary text-primary-foreground disabled:opacity-50"
      >
        {loading ? "Saving..." : "Submit rating"}
      </button>
    </div>
  )
}
