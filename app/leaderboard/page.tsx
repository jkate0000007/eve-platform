import { createClient } from "@/lib/supabase/server"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"


export default async function LeaderboardPage() {
  const supabase = createClient()

  const { data, error } = await supabase.rpc("get_leaderboard_ranking")

  if (error) {
    console.log(error)
    return (
      <div className="p-6 text-center text-red-500">
        Failed to load leaderboard
      </div>
    )
  }

  return (
    <div className="container mx-auto max-w-6xl p-4 sm:p-6">
      <h1 className="text-3xl sm:text-4xl font-bold mb-6 text-center">
        🏆 Hotness Score! <span className="text-yellow-500">🔥</span>
      </h1>

      <div className="bg-white dark:bg-neutral-900 shadow rounded-xl divide-y">
        {data?.map((creator: any, index: number) => (
          <div
            key={creator.creator_id}
            className="flex flex-col sm:flex-row items-center sm:justify-between p-3 sm:p-4 hover:bg-gray-100 dark:hover:bg-neutral-800 transition rounded-xl"
          >
            <div className="flex items-center justify-between  gap-3 sm:gap-4 w-full sm:w-auto ">
              {/* Rank */}
           <div className="flex items-center gap-3 sm:gap-4 w-full sm:w-auto">
           <span
                className={`flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 rounded-full font-bold text-white ${
                  index === 0
                    ? "bg-yellow-500"
                    : index === 1
                    ? "bg-gray-400"
                    : index === 2
                    ? "bg-amber-700"
                    : "bg-gray-300 dark:bg-neutral-700"
                }`}
              >
                {index + 1}
              </span>

              {/* Avatar */}
              <Avatar className="h-12 w-12 sm:h-16 sm:w-16">
                {creator.avatar_url ? (
                  <AvatarImage
                    src={`${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/avatars/${creator.avatar_url}`}
                    alt={creator.username || ""}
                    className="object-cover"
                  />
                ) : (
                  <AvatarFallback>
                    {creator.username?.charAt(0).toUpperCase() || "U"}
                  </AvatarFallback>
                )}
              </Avatar>

              {/* Name & total ratings */}
              <div className="flex flex-col text-left truncate max-w-[120px] sm:max-w-xs">
                <span className="font-semibold text-sm sm:text-base truncate">
                  {creator.username}
                </span>
                <span className="text-xs sm:text-sm text-gray-500">
                  {creator.total_ratings} rating{creator.total_ratings !== 1 ? "s" : ""}
                </span>
              </div>
           </div>

            {/* Country */}
            <div className="block md:hidden">
             <div className="flex items-center  gap-2">
             {creator.country && (
                        <span className="flex items-center gap-1 text-xs text-muted-foreground">
                          <img
                            src={`https://flagcdn.com/w20/${creator.country.toLowerCase()}.png`}
                            className="w-4 h-4 rounded-full"
                            alt={creator.country}
                          />
                          {creator.country}
                        </span>
                      )}
              </div>  
             </div>

               {/* Average rating */}
            <span className="block md:hidden mt-2 sm:mt-0 text-yellow-500 font-bold text-sm sm:text-lg">
              ⭐ {creator.average_rating.toFixed(1)}
            </span>
            </div>

           <div>
             {/* Country */}
             <div className="hidden md:block">
             <div className="flex items-center  gap-2">
             {creator.country && (
                        <span className="flex items-center gap-1 text-xs text-muted-foreground">
                          <img
                            src={`https://flagcdn.com/w20/${creator.country.toLowerCase()}.png`}
                            className="w-4 h-4 rounded-full"
                            alt={creator.country}
                          />
                          {creator.country}
                        </span>
                      )}
              </div>  
             </div>

        
             {/* Average rating */}
             <span className="hidden md:block mt-2 sm:mt-0 text-yellow-500 font-bold text-sm sm:text-lg">
              ⭐ {creator.average_rating.toFixed(1)}
            </span>
           </div>
          </div>
        ))}
      </div>
    </div>
  )
}
