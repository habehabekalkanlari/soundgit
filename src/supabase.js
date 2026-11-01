import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://rvuiklogpbknbqvizddv.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ2dWlrbG9ncGJrbmJxdml6ZGR2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTI5ODA4NTUsImV4cCI6MjEwODU1Njg1NX0.-TX-VGtWVeU7383cD1zS_TVfOJPInGzprS-Jpqyh5rw'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)