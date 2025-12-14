import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://biahhjksmawdcirfpqwi.supabase.co'
const supabaseAnonKey = 'sb_publishable_H8C44nBYDqKs100pRc0qLQ_EH_wzoWe'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Subject options for UK curriculum
export const SUBJECTS = [
  'Mathematics',
  'English Language & Literature',
  'Biology',
  'Chemistry',
  'Physics',
  'History',
  'Geography',
  'Modern Foreign Languages',
  'Computer Science',
  'Design & Technology',
  'Art & Design',
  'Music',
  'PE',
  'Religious Studies',
  'Business Studies',
  'Economics',
  'Psychology',
  'Sociology'
]

// Key Stage options
export const KEY_STAGES = ['KS2', 'KS3', 'KS4', 'KS5']