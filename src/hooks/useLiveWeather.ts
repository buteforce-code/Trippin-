import { useQuery } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'

export interface LiveWeather {
  name: string
  icon: string | null
  temp: string | null
  cond: string | null
}

/**
 * Live per-stop weather from the `weather` edge function (OpenWeather, keyed by
 * stop lat/lng). Returns a name→weather map; empty in mock mode so the Trip
 * screen falls back to the seeded static weather.
 */
export function useLiveWeather() {
  return useQuery<Map<string, LiveWeather>>({
    queryKey: ['weather', 'live'],
    enabled: Boolean(supabase),
    staleTime: 30 * 60 * 1000,
    retry: false,
    queryFn: async () => {
      const client = supabase
      const map = new Map<string, LiveWeather>()
      if (!client) return map
      const { data, error } = await client.functions.invoke('weather')
      if (error) throw error
      for (const s of (data?.stops ?? []) as LiveWeather[]) map.set(s.name, s)
      return map
    },
  })
}
