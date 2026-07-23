'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

interface Vibe {
  id: string
  user_id: string
  audio_url: string
  photo_url: string
  vibe_type: string
  location: string
  caption: string
  play_count: number
  created_at: string
}

export default function FeedPage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [vibes, setVibes] = useState<Vibe[]>([])
  const [loading, setLoading] = useState(true)
  const [playingId, setPlayingId] = useState<string | null>(null)
  const [isMuted, setIsMuted] = useState(false)

  const audioRefs = useRef<{ [key: string]: HTMLAudioElement }>({})
  const containerRefs = useRef<{ [key: string]: HTMLDivElement }>({})
  const intersectionObserverRef = useRef<IntersectionObserver | null>(null)

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
        .order('created_at', { ascending: false })
        .limit(50)

      if (error) {
        console.error(error)
        return
      }

      setVibes(data || [])
    }

    fetchVibes()
  }, [user])

  // Setup intersection observer for auto-play
  useEffect(() => {
    intersectionObserverRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const vibeId = entry.target.getAttribute('data-vibe-id')
          if (!vibeId) return

          if (entry.isIntersecting) {
            // Stop all other audio
            Object.keys(audioRefs.current).forEach((id) => {
              if (id !== vibeId && audioRefs.current[id]) {
                audioRefs.current[id].pause()
              }
            })

            // Play this vibe's audio
            if (audioRefs.current[vibeId]) {
              setPlayingId(vibeId)
              audioRefs.current[vibeId].play().catch((err) => {
                console.error('Autoplay prevented:', err)
              })
            }
          } else {
            // Pause if scrolled out
            if (audioRefs.current[vibeId]) {
              audioRefs.current[vibeId].pause()
            }
            if (playingId === vibeId) {
              setPlayingId(null)
            }
          }
        })
      },
      { threshold: 0.5 }
    )

    // Observe all vibe containers
    Object.values(containerRefs.current).forEach((el) => {
      if (el) intersectionObserverRef.current?.observe(el)
    })

    return () => {
      intersectionObserverRef.current?.disconnect()
    }
  }, [playingId])

  const handlePlayClick = (vibeId: string) => {
    const audio = audioRefs.current[vibeId]
    if (!audio) return

    if (playingId === vibeId) {
      audio.pause()
      setPlayingId(null)
    } else {
      // Stop all others
      Object.keys(audioRefs.current).forEach((id) => {
        if (id !== vibeId && audioRefs.current[id]) {
          audioRefs.current[id].pause()
        }
      })

      setPlayingId(vibeId)
      audio.play().catch((err) => console.error('Play error:', err))
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
    <main className="min-h-screen bg-gradient-dark pb-8">
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
              href="/map"
              className="px-4 py-2 border border-purple-500 rounded-lg hover:bg-purple-500/10"
            >
              Map
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

      {/* Feed */}
      <div className="max-w-2xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Global Vibe Feed 🌍</h1>

        {vibes.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-gray-400 text-lg mb-4">No vibes yet. Be the first to share!</p>
            <Link
              href="/upload"
              className="inline-block px-6 py-2 bg-gradient-vibe rounded-lg font-bold hover:opacity-90"
            >
              Record Your Vibe
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {vibes.map((vibe) => (
              <div
                key={vibe.id}
                ref={(el) => {
                  if (el) containerRefs.current[vibe.id] = el
                }}
                data-vibe-id={vibe.id}
                className="bg-dark-card border border-dark-surface rounded-lg overflow-hidden hover:border-purple-500/50 transition"
              >
                {/* Photo */}
                <div className="relative w-full h-96 md:h-96 bg-black">
                  <img
                    src={vibe.photo_url}
                    alt="Vibe"
                    className="w-full h-full object-cover"
                  />

                  {/* Play Button Overlay */}
                  <div className="absolute inset-0 flex items-center justify-center bg-black/40 group hover:bg-black/50 transition">
                    <button
                      onClick={() => handlePlayClick(vibe.id)}
                      className={`w-20 h-20 rounded-full flex items-center justify-center text-4xl font-bold transition ${
                        playingId === vibe.id
                          ? 'bg-red-500 hover:bg-red-600'
                          : 'bg-gradient-vibe hover:opacity-90'
                      } play-button`}
                    >
                      {playingId === vibe.id ? '⏹' : '▶'}
                    </button>
                  </div>

                  {/* Vibe Type Badge */}
                  <div className="absolute top-4 right-4 bg-dark-surface/80 backdrop-blur-sm px-3 py-1 rounded-full">
                    <span className="text-2xl">{getVibeEmoji(vibe.vibe_type)}</span>
                  </div>
                </div>

                {/* Audio Element */}
                <audio
                  ref={(el) => {
                    if (el) audioRefs.current[vibe.id] = el
                  }}
                  src={vibe.audio_url}
                  onEnded={() => setPlayingId(null)}
                />

                {/* Info */}
                <div className="p-6">
                  <p className="text-sm text-gray-400 mb-2">{vibe.caption}</p>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-purple-400">
                      🎵 {vibe.play_count} plays
                    </span>
                    <button className="text-lg hover:text-purple-400 transition">
                      💜
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  )
}
