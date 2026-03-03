import { createClient } from '@supabase/supabase-js'
import fs from 'fs'

const supabaseUrl = 'https://nhjsbrcctdbatwdeipwo.supabase.co' // NEVER expose this on the client
const serviceRoleKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5oanNicmNjdGRiYXR3ZGVpcHdvIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0NzU5NjA5NywiZXhwIjoyMDYzMTcyMDk3fQ.8z1sgX4Qx9YyhblWTnoMNTnf_EMh1Skr2XJeRehNrZk' // NEVER expose this on the client

const bucket = 'content'
const creatorId = '6e11b38f-724a-46f8-bb05-cdaba4c1ae66'

// Create Supabase client with service role key
const supabase = createClient(supabaseUrl, serviceRoleKey)

async function generateSQL() {
  const { data, error } = await supabase
    .storage
    .from(bucket)
    .list(creatorId, { limit: 1000 })

  if (error) {
    console.error('❌ Error listing files:', error)
    return
  }

  console.log(`📄 Generating SQL for ${data.length} files...`)

  const outputFile = 'video_inserts.sql'
  fs.writeFileSync(outputFile, '') // clear file if exists

  data.forEach(file => {
    const publicUrl = `${supabaseUrl}/storage/v1/object/public/${bucket}/${creatorId}/${file.name}`
    const title = file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ')
    const sql = `INSERT INTO posts (creator_id, title, file_url, created_at) VALUES ('${creatorId}', '${title}', '${publicUrl}', NOW());`
    fs.appendFileSync(outputFile, sql + '\n')
  })

  console.log(`✅ SQL file written to ${outputFile}`)
}

generateSQL()
