'use client'

import { useEffect, useState } from 'react'

interface Creator {
  id: string | number
  name: string
  image: string
  username?: string
}

const PLACEHOLDER_CREATORS: Creator[] = [
  {
    id: 'placeholder-1',
    name: 'New Creator',
    image: 'https://nhjsbrcctdbatwdeipwo.supabase.co/storage/v1/object/public/public%20contents/home%20page/placeholders%20creators/494ae0dcb267fc9e305fe9b03c126eb6%20(2).jpg.jpeg',
  },
  {
    id: 'placeholder-2',
    name: 'Rising Star',
    image: 'https://nhjsbrcctdbatwdeipwo.supabase.co/storage/v1/object/public/public%20contents/home%20page/placeholders%20creators/5db3ee623b3e95f749e26863cc62b6be.jpg.jpeg',
  },
  {
    id: 'placeholder-3',
    name: 'Featured Creator',
    image: 'https://nhjsbrcctdbatwdeipwo.supabase.co/storage/v1/object/public/public%20contents/home%20page/placeholders%20creators/62d59fc65b087babff32ded2376b9e42.jpg.jpeg',
  },
  {
    id: 'placeholder-4',
    name: 'Top Talent',
    image: 'https://nhjsbrcctdbatwdeipwo.supabase.co/storage/v1/object/public/public%20contents/home%20page/placeholders%20creators/b2bd65a9aedd7b9ad04373a89997e3f0.jpg.jpeg',
  },
  {
    id: 'placeholder-4',
    name: 'Top Talent',
    image: 'https://nhjsbrcctdbatwdeipwo.supabase.co/storage/v1/object/public/public%20contents/home%20page/placeholders%20creators/Celestian%20girlie.jpg',
  },
  {
    id: 'placeholder-4',
    name: 'Top Talent',
    image: 'https://nhjsbrcctdbatwdeipwo.supabase.co/storage/v1/object/public/public%20contents/home%20page/placeholders%20creators/Disco%20cowgirl%20bachelorette.jpg',
  },
  {
    id: 'placeholder-4',
    name: 'Top Talent',
    image: 'https://nhjsbrcctdbatwdeipwo.supabase.co/storage/v1/object/public/public%20contents/home%20page/placeholders%20creators/download%20(12).jpg',
  },
  {
    id: 'placeholder-4',
    name: 'Top Talent',
    image: 'https://nhjsbrcctdbatwdeipwo.supabase.co/storage/v1/object/public/public%20contents/home%20page/placeholders%20creators/download%20(9).jpg',
  },
  {
    id: 'placeholder-4',
    name: 'Top Talent',
    image: 'https://nhjsbrcctdbatwdeipwo.supabase.co/storage/v1/object/public/public%20contents/home%20page/placeholders%20creators/edb6b61c1acdfd400bf2035fa9999c4c.jpg.jpeg',
  },
  {
    id: 'placeholder-4',
    name: 'Top Talent',
    image: 'https://nhjsbrcctdbatwdeipwo.supabase.co/storage/v1/object/public/public%20contents/home%20page/placeholders%20creators/faff00b09b2ca492da70bda53cbf4328.jpg.jpeg',
  },
]

export function MockCreatorsCarousel() {
  const creators = PLACEHOLDER_CREATORS
  const duplicatedContestants = [...creators, ...creators, ...creators]
  const [scrollPosition, setScrollPosition] = useState(0)

  useEffect(() => {
    if (creators.length === 0) return
    const interval = setInterval(() => {
      setScrollPosition((prev) => {
        const newPosition = prev + 1
        if (newPosition > creators.length * 150) return 0
        return newPosition
      })
    }, 30)
    return () => clearInterval(interval)
  }, [creators.length])

  return (
    <div className="w-full overflow-hidden   py-12">
      <div className="relative">
        <div className="absolute left-0 top-0 bottom-0 w-12 bg-gradient-to-r from-black via-transparent to-transparent z-10" />
        <div className="absolute right-0 top-0 bottom-0 w-12 bg-gradient-to-l from-black via-transparent to-transparent z-10" />

        <div
          className="flex gap-6 px-6"
          style={{ transform: `translateX(-${scrollPosition}px)` }}
        >
          {duplicatedContestants.map((contestant, index) => (
            <div
              key={`${contestant.id}-${index}`}
              className="flex-shrink-0 w-32 h-48 relative group cursor-pointer transition-transform duration-300 hover:scale-105"
            >
              <div className="relative w-full h-full rounded-2xl overflow-hidden shadow-lg">
                <img
                  src={contestant.image}
                  alt={contestant.name}
                  className="absolute inset-0 w-full h-full object-cover group-hover:brightness-110 transition-all duration-300"
                />

                <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-3">
                  <p className="text-white text-sm font-semibold text-center line-clamp-2">
                    @{contestant.name}
                  </p>
                </div>

                <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-10 transition-opacity duration-300" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
