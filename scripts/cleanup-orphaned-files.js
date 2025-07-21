const { createClient } = require('@supabase/supabase-js')

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

async function cleanupOrphanedFiles() {
  console.log('🔍 Checking for orphaned files...')

  try {
    // Get all posts with file_url
    const { data: posts, error: postsError } = await supabase
      .from('posts')
      .select('id, file_url, creator_id')
      .not('file_url', 'is', null)

    if (postsError) {
      console.error('Error fetching posts:', postsError)
      return
    }

    console.log(`Found ${posts.length} posts with file URLs`)

    const orphanedPosts = []
    const validPosts = []

    // Check each post's file
    for (const post of posts) {
      try {
        // Check if file exists in storage
        const { data: fileExists, error: checkError } = await supabase.storage
          .from('content')
          .list(post.file_url.split('/').slice(0, -1).join('/'), {
            search: post.file_url.split('/').pop()
          })

        if (checkError || !fileExists || fileExists.length === 0) {
          console.log(`❌ Orphaned post found: ${post.id} (${post.file_url})`)
          orphanedPosts.push(post)
        } else {
          validPosts.push(post)
        }
      } catch (error) {
        console.log(`❌ Error checking post ${post.id}:`, error.message)
        orphanedPosts.push(post)
      }
    }

    console.log(`\n📊 Results:`)
    console.log(`✅ Valid posts: ${validPosts.length}`)
    console.log(`❌ Orphaned posts: ${orphanedPosts.length}`)

    if (orphanedPosts.length > 0) {
      console.log('\n🗑️  Orphaned posts to clean up:')
      orphanedPosts.forEach(post => {
        console.log(`  - Post ID: ${post.id}, File: ${post.file_url}`)
      })

      // Ask for confirmation before deleting
      console.log('\n⚠️  To delete orphaned posts, uncomment the following lines in the script:')
      console.log('// const { error: deleteError } = await supabase')
      console.log('//   .from("posts")')
      console.log('//   .delete()')
      console.log('//   .in("id", orphanedPosts.map(p => p.id))')
      console.log('// if (deleteError) console.error("Error deleting posts:", deleteError)')
      console.log('// else console.log(`Deleted ${orphanedPosts.length} orphaned posts`)')
    }

    // Check profiles for orphaned avatars
    console.log('\n🔍 Checking for orphaned avatars...')
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('id, username, avatar_url')
      .not('avatar_url', 'is', null)

    if (profilesError) {
      console.error('Error fetching profiles:', profilesError)
      return
    }

    const orphanedAvatars = []
    const validAvatars = []

    for (const profile of profiles) {
      try {
        const { data: fileExists, error: checkError } = await supabase.storage
          .from('avatars')
          .list(profile.avatar_url.split('/').slice(0, -1).join('/'), {
            search: profile.avatar_url.split('/').pop()
          })

        if (checkError || !fileExists || fileExists.length === 0) {
          console.log(`❌ Orphaned avatar found: ${profile.username} (${profile.avatar_url})`)
          orphanedAvatars.push(profile)
        } else {
          validAvatars.push(profile)
        }
      } catch (error) {
        console.log(`❌ Error checking avatar for ${profile.username}:`, error.message)
        orphanedAvatars.push(profile)
      }
    }

    console.log(`\n📊 Avatar Results:`)
    console.log(`✅ Valid avatars: ${validAvatars.length}`)
    console.log(`❌ Orphaned avatars: ${orphanedAvatars.length}`)

    if (orphanedAvatars.length > 0) {
      console.log('\n🗑️  Orphaned avatars to clean up:')
      orphanedAvatars.forEach(profile => {
        console.log(`  - User: ${profile.username}, Avatar: ${profile.avatar_url}`)
      })

      console.log('\n⚠️  To clear orphaned avatars, uncomment the following lines:')
      console.log('// const { error: updateError } = await supabase')
      console.log('//   .from("profiles")')
      console.log('//   .update({ avatar_url: null })')
      console.log('//   .in("id", orphanedAvatars.map(p => p.id))')
      console.log('// if (updateError) console.error("Error updating profiles:", updateError)')
      console.log('// else console.log(`Cleared ${orphanedAvatars.length} orphaned avatars`)')
    }

  } catch (error) {
    console.error('Script error:', error)
  }
}

// Run the cleanup
cleanupOrphanedFiles() 