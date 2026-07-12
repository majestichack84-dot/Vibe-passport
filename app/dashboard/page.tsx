'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

export default function DashboardPage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [userProfile, setUserProfile] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [userVibes, setUserVibes] = useState<any[]>([])

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/auth/login')
        return
      }
      setUser(user)

      // Get user profile
      const { data: profile } = await supabase
        .from('users')
        .select('*')
        .eq('id', user.id)
        .single()

      setUserProfile(profile)

      // Get user vibes
      const { data: vibes } = await supabase
        .from('vibes')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      setUserVibes(vibes || [])
      setLoading(false)
    }

    checkAuth()
  }, [router])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/')
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
              Upload Vibe
            </Link>
            <Link
              href="/feed"
              className="px-4 py-2 border border-purple-500 rounded-lg hover:bg-purple-500/10"
            >
              Feed
            </Link>
            <button
              onClick={handleLogout}
              className="px-4 py-2 border border-red-500 rounded-lg hover:bg-red-500/10 text-red-400"
            >
              Logout
            </button>
          </div>
        </div>
      </nav>

      {/* Dashboard Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Profile Header */}
        <div className="bg-dark-card border border-dark-surface rounded-lg p-8 mb-8">
          <div className="flex items-start justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold mb-2">{userProfile?.display_name || user?.email}</h1>
              <p className="text-gray-400">Email: {user?.email}</p>
              <p className="text-gray-400 mt-2">Member since {new Date(user?.created_at).toLocaleDateString()}</p>
            </div>
            <div className={`px-4 py-2 rounded-lg font-bold ${
              userProfile?.tier === 'pro'
                ? 'bg-gradient-vibe'
                : 'bg-dark-surface border border-dark-surface'
            }`}>
              {userProfile?.tier === 'pro' ? '⭐ Pro' : '💜 Free'}
            </div>
          </div>

          {userProfile?.tier === 'free' && (
            <div className="bg-purple-500/10 border border-purple-500 rounded-lg p-4 mb-4">
              <p className="text-purple-400 mb-4">
                Uploads today: {userProfile?.uploads_today}/3
              </p>
              <Link
                href="/upgrade"
                className="inline-block px-6 py-2 bg-gradient-vibe rounded-lg font-bold hover:opacity-90"
              >
                Upgrade to Pro
              </Link>
            </div>
          )}
        </div>

        {/* Stats */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <div className="bg-dark-card border border-dark-surface rounded-lg p-6">
            <div className="text-3xl font-bold mb-2">{userVibes.length}</div>
            <p className="text-gray-400">Vibes Shared</p>
          </div>
          <div className="bg-dark-card border border-dark-surface rounded-lg p-6">
            <div className="text-3xl font-bold mb-2">
              {userVibes.reduce((sum, v) => sum + (v.play_count || 0), 0)}
            </div>
            <p className="text-gray-400">Total Plays</p>
          </div>
          <div className="bg-dark-card border border-dark-surface rounded-lg p-6">
            <div className="text-3xl font-bold mb-2">
              {userProfile?.tier === 'pro' ? '∞' : `${3 - (userProfile?.uploads_today || 0)}`}
            </div>
            <p className="text-gray-400">Uploads Left</p>
          </div>
        </div>

        {/* User Vibes */}
        <div className="bg-dark-card border border-dark-surface rounded-lg p-8">
          <h2 className="text-2xl font-bold mb-6">Your Vibes</h2>

          {userVibes.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-400 mb-4">No vibes yet. Start sharing!</p>
              <Link
                href="/upload"
                className="inline-block px-6 py-2 bg-gradient-vibe rounded-lg font-bold hover:opacity-90"
              >
                Record Your First Vibe
              </Link>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {userVibes.map((vibe) => (
                <div
                  key={vibe.id}
                  className="bg-dark-surface rounded-lg overflow-hidden hover:border-purple-500/50 border border-dark-surface transition"
                >
                  <img
                    src={vibe.photo_url}
                    alt="Vibe"
                    className="w-full h-40 object-cover"
                  />
                  <div className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-2xl">
                        {{
                          peace: '☮️',
                          joy: '😊',
                          chaos: '🎭',
                          love: '💜',
                          tired: '😴',
                          hype: '🔥',
                        }[vibe.vibe_type as string]}
                      </span>
                      <span className="text-sm text-gray-400">
                        {vibe.play_count} plays
                      </span>
                    </div>
                    <p className="text-sm text-gray-400">
                      {vibe.caption}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </main>
  )
}
