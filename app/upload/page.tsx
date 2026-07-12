'use client'

import { useEffect, useRef, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

type VibeType = 'peace' | 'joy' | 'chaos' | 'love' | 'tired' | 'hype'

const VIBE_OPTIONS: { type: VibeType; emoji: string; label: string }[] = [
  { type: 'peace', emoji: '☮️', label: 'Peace' },
  { type: 'joy', emoji: '😊', label: 'Joy' },
  { type: 'chaos', emoji: '🎭', label: 'Chaos' },
  { type: 'love', emoji: '💜', label: 'Love' },
  { type: 'tired', emoji: '😴', label: 'Tired' },
  { type: 'hype', emoji: '🔥', label: 'Hype' },
]

export default function UploadPage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)

  // Audio recording
  const [isRecording, setIsRecording] = useState(false)
  const [recordedAudio, setRecordedAudio] = useState<Blob | null>(null)
  const [recordingTime, setRecordingTime] = useState(0)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioChunksRef = useRef<Blob[]>([])
  const recordingIntervalRef = useRef<NodeJS.Timeout | null>(null)

  // Photo capture
  const [photoBlob, setPhotoBlob] = useState<Blob | null>(null)
  const [photoPreview, setPhotoPreview] = useState('')
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  // Vibe selection
  const [selectedVibe, setSelectedVibe] = useState<VibeType>('joy')
  const [location, setLocation] = useState('')
  const [error, setError] = useState('')

  // Check auth and get user
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

  // Initialize camera
  useEffect(() => {
    if (user && videoRef.current && !photoPreview) {
      navigator.mediaDevices
        .getUserMedia({ video: { facingMode: 'user' } })
        .then((stream) => {
          if (videoRef.current) {
            videoRef.current.srcObject = stream
          }
        })
        .catch((err) => {
          setError('Camera access denied. Please check permissions.')
          console.error(err)
        })
    }

    return () => {
      if (videoRef.current?.srcObject) {
        const tracks = (videoRef.current.srcObject as MediaStream).getTracks()
        tracks.forEach((track) => track.stop())
      }
    }
  }, [user, photoPreview])

  // Start recording audio
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      mediaRecorderRef.current = new MediaRecorder(stream)
      audioChunksRef.current = []

      mediaRecorderRef.current.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data)
      }

      mediaRecorderRef.current.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' })
        setRecordedAudio(audioBlob)
        stream.getTracks().forEach((track) => track.stop())
      }

      mediaRecorderRef.current.start()
      setIsRecording(true)
      setRecordingTime(0)

      recordingIntervalRef.current = setInterval(() => {
        setRecordingTime((prev) => {
          if (prev >= 5) {
            stopRecording()
            return 5
          }
          return prev + 1
        })
      }, 1000)
    } catch (err) {
      setError('Microphone access denied')
      console.error(err)
    }
  }

  // Stop recording audio
  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop()
      setIsRecording(false)
      if (recordingIntervalRef.current) {
        clearInterval(recordingIntervalRef.current)
      }
    }
  }

  // Capture photo
  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const context = canvasRef.current.getContext('2d')
      if (context) {
        canvasRef.current.width = videoRef.current.videoWidth
        canvasRef.current.height = videoRef.current.videoHeight
        context.drawImage(videoRef.current, 0, 0)

        canvasRef.current.toBlob((blob) => {
          if (blob) {
            setPhotoBlob(blob)
            setPhotoPreview(canvasRef.current!.toDataURL())
          }
        })
      }
    }
  }

  // Reset photo
  const retakePhoto = () => {
    setPhotoBlob(null)
    setPhotoPreview('')
  }

  // Get user location
  const getLocation = () => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(async (position) => {
        try {
          const { latitude, longitude } = position.coords
          // Use reverse geocoding (you'd need an API for this)
          setLocation(`${latitude.toFixed(4)}, ${longitude.toFixed(4)}`)
        } catch (err) {
          setError('Could not get location')
        }
      })
    }
  }

  // Submit vibe
  const handleSubmit = async () => {
    if (!recordedAudio || !photoBlob) {
      setError('Please record audio and capture a photo')
      return
    }

    setUploading(true)
    setError('')

    try {
      const audioFile = `${user.id}_${Date.now()}_audio.webm`
      const photoFile = `${user.id}_${Date.now()}_photo.jpg`

      // Upload audio
      const { error: audioError } = await supabase.storage
        .from('vibes')
        .upload(audioFile, recordedAudio, { contentType: 'audio/webm' })

      if (audioError) throw audioError

      // Upload photo
      const { error: photoError } = await supabase.storage
        .from('vibes')
        .upload(photoFile, photoBlob, { contentType: 'image/jpeg' })

      if (photoError) throw photoError

      // Get public URLs
      const { data: audioData } = supabase.storage
        .from('vibes')
        .getPublicUrl(audioFile)
      const { data: photoData } = supabase.storage
        .from('vibes')
        .getPublicUrl(photoFile)

      // Create vibe record
      const { error: dbError } = await supabase.from('vibes').insert({
        user_id: user.id,
        audio_url: audioData.publicUrl,
        photo_url: photoData.publicUrl,
        vibe_type: selectedVibe,
        location: location || 'Unknown',
        caption: `Vibe from ${location || 'Earth'} - just now`,
      })

      if (dbError) throw dbError

      // Reset form
      setRecordedAudio(null)
      setPhotoBlob(null)
      setPhotoPreview('')
      setRecordingTime(0)
      setLocation('')

      // Show success and redirect
      router.push('/feed?success=true')
    } catch (err: any) {
      setError(err.message)
    } finally {
      setUploading(false)
    }
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
          <Link
            href="/dashboard"
            className="px-4 py-2 border border-purple-500 rounded-lg hover:bg-purple-500/10"
          >
            Dashboard
          </Link>
        </div>
      </nav>

      {/* Upload Form */}
      <div className="max-w-2xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Share Your Vibe 🎤</h1>

        {error && (
          <div className="bg-red-500/10 border border-red-500 rounded-lg p-4 text-red-400 mb-6">
            {error}
          </div>
        )}

        {/* Audio Recording Section */}
        <div className="bg-dark-card border border-dark-surface rounded-lg p-8 mb-6">
          <h2 className="text-xl font-bold mb-6">Step 1: Record Audio (5 seconds)</h2>

          {!recordedAudio ? (
            <div className="text-center">
              <button
                onClick={isRecording ? stopRecording : startRecording}
                disabled={uploading}
                className={`w-20 h-20 rounded-full mx-auto mb-4 flex items-center justify-center text-3xl font-bold transition ${
                  isRecording
                    ? 'bg-red-500 hover:bg-red-600 play-button'
                    : 'bg-gradient-vibe hover:opacity-90'
                } disabled:opacity-50`}
              >
                {isRecording ? '⏹' : '🎤'}
              </button>

              <p className="text-lg font-semibold mb-2">
                {isRecording ? `Recording... ${recordingTime}s` : 'Ready to record?'}
              </p>
              <p className="text-gray-400">
                {isRecording
                  ? 'Speak freely, you have 5 seconds'
                  : 'Click the button to start recording'}
              </p>
            </div>
          ) : (
            <div className="text-center">
              <div className="bg-green-500/10 border border-green-500 rounded-lg p-4 mb-4">
                <p className="text-green-400 font-semibold">✓ Audio recorded!</p>
              </div>
              <button
                onClick={() => setRecordedAudio(null)}
                className="px-4 py-2 border border-purple-500 rounded-lg hover:bg-purple-500/10"
              >
                Re-record
              </button>
            </div>
          )}
        </div>

        {/* Photo Capture Section */}
        <div className="bg-dark-card border border-dark-surface rounded-lg p-8 mb-6">
          <h2 className="text-xl font-bold mb-6">Step 2: Capture Photo</h2>

          {!photoPreview ? (
            <div>
              <video
                ref={videoRef}
                autoPlay
                playsInline
                className="w-full rounded-lg mb-4 bg-black"
              />
              <div className="flex gap-4">
                <button
                  onClick={capturePhoto}
                  disabled={uploading || !recordedAudio}
                  className="flex-1 px-4 py-3 bg-gradient-vibe rounded-lg font-bold hover:opacity-90 disabled:opacity-50 transition"
                >
                  📸 Capture Photo
                </button>
                <button
                  onClick={getLocation}
                  disabled={uploading}
                  className="flex-1 px-4 py-3 border border-purple-500 rounded-lg font-bold hover:bg-purple-500/10 disabled:opacity-50 transition"
                >
                  📍 Get Location
                </button>
              </div>
            </div>
          ) : (
            <div>
              <img src={photoPreview} alt="Captured" className="w-full rounded-lg mb-4" />
              {location && (
                <p className="text-sm text-gray-400 mb-4">📍 Location: {location}</p>
              )}
              <button
                onClick={retakePhoto}
                className="w-full px-4 py-2 border border-purple-500 rounded-lg hover:bg-purple-500/10"
              >
                Retake Photo
              </button>
            </div>
          )}
        </div>

        {/* Vibe Selection */}
        <div className="bg-dark-card border border-dark-surface rounded-lg p-8 mb-6">
          <h2 className="text-xl font-bold mb-6">Step 3: Choose Your Vibe</h2>

          <div className="grid grid-cols-3 md:grid-cols-6 gap-4">
            {VIBE_OPTIONS.map((vibe) => (
              <button
                key={vibe.type}
                onClick={() => setSelectedVibe(vibe.type)}
                className={`p-4 rounded-lg border-2 transition ${
                  selectedVibe === vibe.type
                    ? 'border-purple-500 bg-purple-500/20'
                    : 'border-dark-surface hover:border-purple-500/50'
                }`}
              >
                <div className="text-3xl mb-2">{vibe.emoji}</div>
                <div className="text-sm font-semibold">{vibe.label}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Submit Button */}
        <button
          onClick={handleSubmit}
          disabled={!recordedAudio || !photoBlob || uploading}
          className="w-full px-6 py-4 bg-gradient-vibe rounded-lg font-bold text-lg hover:opacity-90 disabled:opacity-50 transition"
        >
          {uploading ? 'Uploading Vibe...' : '🚀 Share Your Vibe'}
        </button>

        <canvas ref={canvasRef} className="hidden" />
      </div>
    </main>
  )
}
