require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = process.env.SUPABASE_URL;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

const DUMMY_USER_COUNT = 100;

async function createDummyUsers() {
  for (let i = 1; i <= DUMMY_USER_COUNT; i++) {
    const email = `dummyuser${i}@example.com`;
    const password = `Password${i}!`;
    const { data, error } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
    });
    if (error && !error.message.includes('User already registered')) {
      console.error(`Error creating user ${email}:`, error.message);
    } else {
      console.log(`Created or already exists: ${email}`);
    }
  }
}

async function getDummyFanIds() {
  // Wait for profiles to be created (if you have a trigger for that)
  // If not, you may need to create profiles manually
  const { data, error } = await supabase
    .from('profiles')
    .select('id')
    .like('username', 'dummyuser%');
  if (error) throw error;
  return data.map((row) => row.id);
}

async function getCreatorIds() {
  const { data, error } = await supabase
    .from('profiles')
    .select('id')
    .eq('account_type', 'creator');
  if (error) throw error;
  return data.map((row) => row.id);
}

async function seedFollowers(dummyFanIds, creatorIds) {
  let inserted = 0;
  for (const creatorId of creatorIds) {
    for (const fanId of dummyFanIds) {
      // Insert follower
      const { error } = await supabase
        .from('followers')
        .insert([{ user_id: fanId, followed_id: creatorId }]);
      if (!error) {
        inserted++;
      } else if (!error.message.includes('duplicate key')) {
        console.error(`Error inserting follower:`, error.message);
      }
    }
  }
  console.log(`Inserted ${inserted} follower relationships.`);
}

async function main() {
  console.log('Creating dummy users...');
  await createDummyUsers();

  // Wait a bit for triggers to create profiles (if needed)
  console.log('Waiting for profiles to be created...');
  await new Promise((resolve) => setTimeout(resolve, 10000));

  console.log('Fetching dummy fan IDs...');
  const dummyFanIds = await getDummyFanIds();
  console.log('Fetching creator IDs...');
  const creatorIds = await getCreatorIds();

  if (dummyFanIds.length === 0 || creatorIds.length === 0) {
    console.error('No dummy fans or creators found. Aborting.');
    return;
  }

  console.log('Seeding followers...');
  await seedFollowers(dummyFanIds, creatorIds);

  console.log('All done!');
}

main().catch(console.error); 