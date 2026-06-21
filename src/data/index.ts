/**
 * The active repository. Phase 1 uses the in-memory mock; Phase 2 swaps this
 * single line for `new SupabaseTripRepository(...)` and nothing else changes.
 */
import type { TripRepository } from './repository'
import { MockTripRepository } from './mock'
import { SupabaseTripRepository } from './supabaseRepo'
import { isSupabaseConfigured, supabase } from '../lib/supabase'

export const tripRepository: TripRepository =
  isSupabaseConfigured && supabase
    ? new SupabaseTripRepository(supabase)
    : new MockTripRepository()
