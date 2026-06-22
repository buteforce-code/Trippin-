import type { TripRepository } from './repository'
import { SupabaseTripRepository } from './supabaseRepo'
import { supabase } from '../lib/supabase'

export const tripRepository: TripRepository = new SupabaseTripRepository(supabase)
