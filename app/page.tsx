'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'

export default function Home() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)
      setLoading(false)
    }
    checkAuth()
  }, [])

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
          <h1 className="text-2xl font-bold gradient-text">🎵 Vibe Passport</h1>
          <div className="flex gap-4">
            {user ? (
              <>
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
              </>
            ) : null}
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 py-20 md:py-32">
        <div className="text-center">
          <h2 className="text-4xl md:text-6xl font-bold mb-6">
            Share Your <span className="gradient-text">Vibe</span> with the World
          </h2>
          <p className="text-xl text-gray-300 mb-12 max-w-2xl mx-auto">
            Record a 5-second audio clip, capture the moment, and discover what others are feeling around the globe.
          </p>

          {user ? (
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/upload"
                className="px-8 py-4 bg-gradient-vibe rounded-lg font-bold text-lg hover:opacity-90 transition"
              >
                🎤 Record Your Vibe
              </Link>
              <Link
                href="/feed"
                className="px-8 py-4 border-2 border-purple-500 rounded-lg font-bold text-lg hover:bg-purple-500/10 transition"
              >
                🌍 Explore Vibes
              </Link>
            </div>
          ) : (
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/auth/login"
                className="px-8 py-4 bg-gradient-vibe rounded-lg font-bold text-lg hover:opacity-90 transition"
              >
                Get Started
              </Link>
              <Link
                href="/auth/signup"
                className="px-8 py-4 border-2 border-purple-500 rounded-lg font-bold text-lg hover:bg-purple-500/10 transition"
              >
                Sign Up
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* Features Section */}
      <section className="max-w-7xl mx-auto px-4 py-20">
        <h3 className="text-3xl font-bold text-center mb-16">Why Vibe Passport?</h3>
        <div className="grid md:grid-cols-3 gap-8">
          {[
            {
              icon: '🎤',
              title: '5-Second Audio',
              desc: 'Quick, authentic, and real. No long speeches needed.',
            },
            {
              icon: '🌍',
              title: 'Global Community',
              desc: 'Connect with people sharing their vibes worldwide.',
            },
            {
              icon: '🗺️',
              title: 'World Map',
              desc: 'See vibes pinned on an interactive map by location.',
            },
            {
              icon: '💜',
              title: 'Dark & Beautiful',
              desc: 'Purple/blue gradient design. Easy on the eyes.',
            },
            {
              icon: '📱',
              title: 'Mobile First',
              desc: 'Optimized for phone. Share on the go.',
            },
            {
              icon: '⭐',
              title: 'Pro Features',
              desc: 'Unlimited uploads & save favorites for $4.99/mo.',
            },
          ].map((feature, i) => (
            <div
              key={i}
              className="bg-dark-card border border-dark-surface rounded-lg p-6 hover:border-purple-500/50 transition"
            >
              <div className="text-4xl mb-4">{feature.icon}</div>
              <h4 className="text-xl font-bold mb-2">{feature.title}</h4>
              <p className="text-gray-400">{feature.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Pricing Section */}
      <section className="max-w-7xl mx-auto px-4 py-20">
        <h3 className="text-3xl font-bold text-center mb-16">Simple Pricing</h3>
        <div className="grid md:grid-cols-2 gap-8 max-w-2xl mx-auto">
          {[
            {
              name: 'Free',
              price: '$0',
              desc: 'Perfect to get started',
              features: ['3 uploads per day', 'Access to feed', 'View world map', 'No credit card needed'],
            },
            {
              name: 'Pro',
              price: '$4.99',
              desc: '/month, unlimited everything',
              features: ['Unlimited uploads', 'Save favorites', 'Priority support', 'Cancel anytime'],
              highlight: true,
            },
          ].map((plan, i) => (
            <div
              key={i}
              className={`rounded-lg p-8 border ${
                plan.highlight
                  ? 'bg-gradient-vibe border-purple-500'
                  : 'bg-dark-card border-dark-surface'
              }`}
            >
              <h4 className="text-2xl font-bold mb-2">{plan.name}</h4>
              <div className="mb-2">
                <span className="text-3xl font-bold">{plan.price}</span>
                <span className="text-gray-400 ml-2">{plan.desc}</span>
              </div>
              <ul className="space-y-3 mt-6">
                {plan.features.map((f, j) => (
                  <li key={j} className="flex items-center gap-3">
                    <span className="text-purple-400">✓</span>
                    {f}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-dark-card bg-dark-surface/50 py-8 mt-20">
        <div className="max-w-7xl mx-auto px-4 text-center text-gray-400">
          <p>&copy; 2024 Vibe Passport. Made with 💜</p>
        </div>
      </footer>
    </main>
  )
}
