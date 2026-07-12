'use client'

import { useEffect, useRef, useState } from 'react'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import mapboxgl from 'mapbox-gl'
import 'mapbox-gl/dist/mapbox-gl.css'

interface Vibe {
  id: string
  user_id: string
  audio_url: string
  photo_url: string
  vibe_type: string
  location: {
    city: string
    country_code: string
    latitude: number
    longitude: number
  }
  caption: string
  play_count: number
  created_at: string
}

export default function MapPage() {
  const router = useRouter()
  const mapContainer = useRef<HTMLDivElement>(null)
  const map = useRef<mapboxgl.Map | null>(null)
  const [user, setUser] = useState<any>(null)
  const [vibes, setVibes] = useState<Vibe[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedVibe, setSelectedVibe] = useState<Vibe | null>(null)
  const [playingId, setPlayingId] = useState<string | null>(null)
  const audioRef = useRef<HTMLAudioElement>(null)

  // Check auth
  useEffect(() => {
    const checkAuth = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/auth/login')
        return
      }
      setUser(user)
      setLoading(false)
    }
    checkAuth()
  }, [router])

  // Fetch vibes
  useEffect(() => {
    if (!user) return

    const fetchVibes = async () => {
      const { data, error } = await supabase
        .from('vibes')
        .select('*')
        .limit(100)

      if (error) {
        console.error(error)
        return
      }

      setVibes(data || [])
    }

    fetchVibes()
  }, [user])

  // Initialize map
  useEffect(() => {
    if (!mapContainer.current || map.current) return

    mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN || ''

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/dark-v11',
      center: [0, 20],
      zoom: 2,
    })

    return () => {
      map.current?.remove()
    }
  }, [])

  // Add vibe markers to map
  useEffect(() => {
    if (!map.current || !vibes.length) return

    vibes.forEach((vibe) => {
      if (!vibe.location?.latitude || !vibe.location?.longitude) return

      const getVibeEmoji = (type: string) => {
        const emojiMap: { [key: string]: string } = {
          peace: '☮️',
          joy: '😊',
          chaos: '🎭',
          love: '💜',
          tired: '😴',
          hype: '🔥',
        }
        return emojiMap[type] || '🎵'
      }

      // Create marker element
      const el = document.createElement('div')
      el.className = 'marker cursor-pointer text-3xl hover:scale-125 transition'
      el.textContent = getVibeEmoji(vibe.vibe_type)
      el.style.filter = 'drop-shadow(0 0 8px rgba(102, 126, 234, 0.6))'

      // Create marker
      const marker = new mapboxgl.Marker(el)
        .setLngLat([vibe.location.longitude, vibe.location.latitude])
        .addTo(map.current!)

      // Add click handler
      el.addEventListener('click', () => {
        setSelectedVibe(vibe)
      })
    })
  }, [vibes])

  const handlePlayClick = () => {
    if (!selectedVibe) return

    if (!audioRef.current) return

    if (playingId === selectedVibe.id) {
      audioRef.current.pause()
      setPlayingId(null)
    } else {
      audioRef.current.src = selectedVibe.audio_url
      audioRef.current.play()
      setPlayingId(selectedVibe.id)
    }
  }

  const getVibeEmoji = (type: string) => {
    const emojiMap: { [key: string]: string } = {
      peace: '☮️',
      joy: '😊',
      chaos: '🎭',
      love: '💜',
      tired: '😴',
      hype: '🔥',
    }
    return emojiMap[type] || '🎵'
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="spinner"></div>
      </div>
    )
  }

  return (
    <main className="min-h-screen bg-gradient-dark">
      {/* Navigation */}
      <nav className="border-b border-dark-card bg-dark-surface/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <Link href="/" className="text-2xl font-bold gradient-text">
            🎵 Vibe Passport
          </Link>
          <div className="flex gap-4">
            <Link
              href="/upload"
              className="px-4 py-2 bg-gradient-vibe rounded-lg hover:opacity-90"
            >
              Upload
            </Link>
            <Link
              href="/feed"
              className="px-4 py-2 border border-purple-500 rounded-lg hover:bg-purple-500/10"
            >
              Feed
            </Link>
            <Link
              href="/dashboard"
              className="px-4 py-2 border border-purple-500 rounded-lg hover:bg-purple-500/10"
            >
              Dashboard
            </Link>
          </div>
        </div>
      </nav>

      <div className="flex h-[calc(100vh-73px)]">
        {/* Map Container */}
        <div
          ref={mapContainer}
          className="flex-1"
          style={{ width: '100%', height: '100%' }}
        />

        {/* Sidebar with selected vibe info */}
        {selectedVibe && (
          <div className="w-80 bg-dark-card border-l border-dark-surface p-6 overflow-y-auto">
            <button
              onClick={() => setSelectedVibe(null)}
              className="absolute top-4 right-4 text-gray-400 hover:text-white"
            >
              ✕
            </button>

            <div className="space-y-4">
              {/* Photo */}
              <div className="relative w-full h-48 rounded-lg overflow-hidden bg-black">
                <img
                  src={selectedVibe.photo_url}
                  alt="Vibe"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                  <button
                    onClick={handlePlayClick}
                    className={`w-16 h-16 rounded-full flex items-center justify-center text-3xl font-bold transition ${
                      playingId === selectedVibe.id
                        ? 'bg-red-500 hover:bg-red-600'
                        : 'bg-gradient-vibe hover:opacity-90'
                    } play-button`}
                  >
                    {playingId === selectedVibe.id ? '⏹' : '▶'}
                  </button>
                </div>
              </div>

              {/* Vibe Info */}
              <div>
                <div className="flex items-center gap-3 mb-3">
                  <span className="text-3xl">{getVibeEmoji(selectedVibe.vibe_type)}</span>
                  <div>
                    <p className="text-sm font-semibold text-gray-400">Vibe</p>
                    <p className="text-lg font-bold capitalize">{selectedVibe.vibe_type}</p>
                  </div>
                </div>

                <p className="text-sm text-gray-400 mb-4">{selectedVibe.caption}</p>

                <div className="space-y-2 text-sm">
                  <p className="text-gray-400">
                    📍 {selectedVibe.location?.city}, {selectedVibe.location?.country_code}
                  </p>
                  <p className="text-gray-400">
                    🎵 {selectedVibe.play_count} plays
                  </p>
                  <p className="text-gray-400">
                    ⏰ {new Date(selectedVibe.created_at).toLocaleString()}
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-2 pt-4 border-t border-dark-surface">
                <button className="w-full px-4 py-2 bg-gradient-vibe rounded-lg font-bold hover:opacity-90 transition">
                  💜 Save
                </button>
                <button className="w-full px-4 py-2 border border-purple-500 rounded-lg font-bold hover:bg-purple-500/10 transition">
                  Share
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Audio element for playback */}
        <audio
          ref={audioRef}
          onEnded={() => setPlayingId(null)}
          crossOrigin="anonymous"
        />
      </div>
    </main>
  )
}
