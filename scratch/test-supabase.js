
import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config()

const supabaseUrl = process.env.VITE_SUPABASE_URL
const supabaseKey = process.env.VITE_SUPABASE_PUBLISHABLE_KEY

console.log(`Checking connection to: ${supabaseUrl}`)

const supabase = createClient(supabaseUrl, supabaseKey)

async function test() {
  const { data, error } = await supabase.from('products').select('*').limit(1)
  if (error) {
    console.error('Error connecting to Supabase:', error.message)
    process.exit(1)
  }
  console.log('Successfully connected! Tables found:', data)
}

test()
