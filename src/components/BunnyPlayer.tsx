'use client'

import { useState, useEffect } from 'react'

interface BunnyPlayerProps {
    videoId: number
    onError?: (error: string) => void
    onLoad?: () => void
    className?: string
}

interface VideoData {
    id: number
    title: string
    description: string
    duration: string
    embedUrl: string
    thumbnail?: string
}

export default function BunnyPlayer({
    videoId,
    onError,
    onLoad,
    className = '',
}: BunnyPlayerProps) {
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [videoData, setVideoData] = useState<VideoData | null>(null)

    useEffect(() => {
        const fetchVideo = async () => {
            setLoading(true)
            setError(null)

            try {
                const response = await fetch(`/api/videos/${videoId}`)
                const data = await response.json()

                if (!response.ok) {
                    throw new Error(data.error || 'Failed to load video')
                }

                setVideoData(data.video)
                onLoad?.()
            } catch (err) {
                const errorMessage = err instanceof Error ? err.message : 'Failed to load video'
                setError(errorMessage)
                onError?.(errorMessage)
            } finally {
                setLoading(false)
            }
        }

        fetchVideo()
    }, [videoId, onError, onLoad])

    if (loading) {
        return (
            <div className={`aspect-video bg-gray-900 rounded-xl flex items-center justify-center ${className}`}>
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mx-auto mb-4"></div>
                    <p className="text-gray-400">Loading video...</p>
                </div>
            </div>
        )
    }

    if (error) {
        return (
            <div className={`aspect-video bg-gray-900 rounded-xl flex items-center justify-center ${className}`}>
                <div className="text-center px-4">
                    <svg
                        className="w-16 h-16 mx-auto mb-4 text-red-500"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                        />
                    </svg>
                    <p className="text-red-400 font-medium mb-2">Unable to load video</p>
                    <p className="text-gray-500 text-sm">{error}</p>
                </div>
            </div>
        )
    }

    if (!videoData) {
        return null
    }

    return (
        <div className={className}>
            <div className="relative aspect-video rounded-xl overflow-hidden bg-black shadow-2xl">
                <iframe
                    src={videoData.embedUrl}
                    className="absolute top-0 left-0 w-full h-full"
                    allow="autoplay; fullscreen; picture-in-picture;"
                    allowFullScreen
                    title={videoData.title}
                    style={{ border: 'none' }}
                />
            </div>
            <div className="mt-6">
                <h2 className="text-2xl font-bold bg-gradient-to-r from-green-400 to-green-600 bg-clip-text text-transparent">
                    {videoData.title}
                </h2>
                <p className="text-gray-400 mt-2 leading-relaxed">{videoData.description}</p>
                <div className="flex items-center gap-4 mt-4 text-sm text-gray-500">
                    <span className="flex items-center gap-1">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                        {videoData.duration}
                    </span>
                    <span className="flex items-center gap-1">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
                        Protected Access
                    </span>
                </div>
            </div>
        </div>
    )
}
