'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import BunnyPlayer from '@/components/BunnyPlayer';
import RazorpayCheckout from '@/components/RazorpayCheckout';

const bgPrimary = '#0a0a0a';
const bgCard = '#151515';
const greenColor = '#6BBF6A';
const purpleColor = '#9B7BD3';
const textLight = '#ffffff';
const textMuted = '#888888';
const borderColor = '#3a3a3a';

interface CourseVideo {
    id: number;
    title: string;
    description: string;
    duration: string;
}

const COURSE_VIDEOS: CourseVideo[] = [
    { id: 1, title: 'Introduction to Forex Trading', description: 'Basics of forex trading and market fundamentals', duration: '15:30' },
    { id: 2, title: 'Understanding Currency Pairs', description: 'Major, minor, and exotic currency pairs explained', duration: '22:45' },
    { id: 3, title: 'Technical Analysis Basics', description: 'Charts, candlesticks, and reading market data', duration: '28:00' },
    { id: 4, title: 'Support and Resistance', description: 'Identifying key levels for entry and exit', duration: '20:15' },
    { id: 5, title: 'Trend Trading Strategies', description: 'How to identify and trade with the trend', duration: '25:30' },
    { id: 6, title: 'Risk Management', description: 'Position sizing and protecting your capital', duration: '18:45' },
    { id: 7, title: 'Trading Psychology', description: 'Managing emotions and maintaining discipline', duration: '24:00' },
    { id: 8, title: 'Advanced Chart Patterns', description: 'Head & shoulders, triangles, and more patterns', duration: '30:15' },
    { id: 9, title: 'Building Your Trading Plan', description: 'Creating a systematic trading approach', duration: '22:00' },
    { id: 10, title: 'Live Trading Session', description: 'Real trades with detailed commentary', duration: '45:00' },
];

// Define PurchaseModal outside to avoid "Cannot create components during render"
const PurchaseModal = ({
    onClose,
    onSuccess
}: {
    onClose: () => void,
    onSuccess: () => void
}) => (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
        <div className="rounded-2xl max-w-md w-full p-8 shadow-2xl animate-in zoom-in duration-300" style={{ backgroundColor: bgCard, border: `1px solid ${borderColor}` }}>
            <div className="text-center">
                <div className="w-20 h-20 rounded-full mx-auto mb-6 flex items-center justify-center" style={{ backgroundColor: `${purpleColor}20` }}>
                    <svg className="w-10 h-10" style={{ color: purpleColor }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                </div>
                <h2 className="text-2xl font-bold mb-4" style={{ color: greenColor }}>Unlock Full Course</h2>
                <p className="mb-6" style={{ color: textMuted }}>
                    Get lifetime access to all 10 professional trading lessons and start your journey to becoming a successful trader.
                </p>
                <div className="mb-6 p-4 rounded-xl" style={{ backgroundColor: bgPrimary }}>
                    <div className="text-3xl font-bold" style={{ color: textLight }}>₹1,499</div>
                    <div className="text-sm" style={{ color: textMuted }}>One-time payment • Lifetime access</div>
                </div>
                <RazorpayCheckout
                    type="course"
                    buttonText="Buy Course - ₹1,499"
                    className="w-full py-4 rounded-xl font-semibold text-lg mb-4"
                    onSuccess={onSuccess}
                />
                <button
                    onClick={onClose}
                    className="w-full py-3 rounded-xl font-medium transition-colors hover:text-white"
                    style={{ color: textMuted, border: `1px solid ${borderColor}` }}
                >
                    Maybe Later
                </button>
            </div>
        </div>
    </div>
);

export default function CoursePage() {
    const [hasAccess, setHasAccess] = useState(false);
    const [loading, setLoading] = useState(true);
    const [selectedVideo, setSelectedVideo] = useState<CourseVideo | null>(null);
    const [showPurchaseModal, setShowPurchaseModal] = useState(false);
    const router = useRouter();
    const supabase = createClient();

    useEffect(() => {
        const checkAccess = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) {
                router.push('/auth/signin');
                return;
            }
            try {
                const res = await fetch('/api/user/status');
                const data = await res.json();
                if (data.success) {
                    setHasAccess(data.courseAccess?.hasAccess || false);
                }
            } catch (e) {
                console.error('Error checking access:', e);
            }
            setLoading(false);
        };
        checkAccess();
    }, [router, supabase.auth]);

    const handleVideoSelect = (video: CourseVideo) => {
        if (hasAccess) {
            setSelectedVideo(video);
        } else {
            setShowPurchaseModal(true);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: bgPrimary }}>
                <div className="animate-spin rounded-full h-12 w-12 border-b-2" style={{ borderColor: greenColor }}></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen" style={{ backgroundColor: bgPrimary, color: textLight }}>
            {/* Header */}
            <header className="sticky top-0 z-40 backdrop-blur-md" style={{ backgroundColor: `${bgCard}ee`, borderBottom: `1px solid ${borderColor}` }}>
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                    <div className="flex items-center justify-between">
                        <Link href="/dashboard" className="flex items-center gap-2 transition-transform hover:scale-105">
                            <div className="w-10 h-10 rounded-full overflow-hidden" style={{ border: `2px solid ${greenColor}` }}>
                                <img src="/fxclogo.webp" alt="Logo" className="w-full h-full object-cover" />
                            </div>
                            <span className="font-bold text-xl tracking-tight" style={{ color: greenColor }}>FourXclub Course</span>
                        </Link>
                        <div className="flex items-center gap-4">
                            {hasAccess ? (
                                <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider" style={{ backgroundColor: `${greenColor}20`, color: greenColor, border: `1px solid ${greenColor}40` }}>
                                    <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                                    Full Access
                                </div>
                            ) : (
                                <button
                                    onClick={() => setShowPurchaseModal(true)}
                                    className="px-4 py-2 rounded-lg font-bold text-sm transition-all hover:brightness-110 active:scale-95 shadow-lg shadow-green-500/20"
                                    style={{ backgroundColor: greenColor, color: bgPrimary }}
                                >
                                    Unlock Course
                                </button>
                            )}
                            <Link href="/dashboard" className="text-sm font-medium transition-colors hover:text-white" style={{ color: textMuted }}>
                                ← Dashboard
                            </Link>
                        </div>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
                    {/* Left Column: Player & Current Video Info */}
                    <div className="lg:col-span-2 space-y-6">
                        {selectedVideo && hasAccess ? (
                            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                                <BunnyPlayer
                                    videoId={selectedVideo.id}
                                    onError={(error) => console.error('Video error:', error)}
                                    className="w-full"
                                />
                            </div>
                        ) : selectedVideo ? (
                            <div className="space-y-6">
                                <div className="aspect-video rounded-3xl group relative overflow-hidden flex items-center justify-center cursor-pointer shadow-2xl"
                                    style={{ backgroundColor: bgCard, border: `1px solid ${borderColor}` }}
                                    onClick={() => setShowPurchaseModal(true)}>
                                    <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-transparent opacity-50 group-hover:opacity-100 transition-opacity"></div>
                                    <div className="relative text-center p-8">
                                        <div className="w-24 h-24 rounded-full mx-auto mb-6 flex items-center justify-center bg-black/40 backdrop-blur-md group-hover:scale-110 transition-transform border border-white/10">
                                            <svg className="w-12 h-12" style={{ color: purpleColor }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                            </svg>
                                        </div>
                                        <p className="text-2xl font-bold mb-2" style={{ color: greenColor }}>Module Locked</p>
                                        <p className="text-gray-400 mb-6 max-w-xs mx-auto">Purchase the course to unlock &quot;{selectedVideo.title}&quot; and all other modules.</p>
                                        <button
                                            className="px-8 py-3 rounded-xl font-bold transition-all hover:scale-105 active:scale-95"
                                            style={{ backgroundColor: greenColor, color: bgPrimary }}
                                        >
                                            Unlock Now - ₹1,499
                                        </button>
                                    </div>
                                </div>
                                <div className="space-y-4">
                                    <h2 className="text-3xl font-extrabold" style={{ color: textLight }}>{selectedVideo.title}</h2>
                                    <p className="text-lg leading-relaxed" style={{ color: textMuted }}>{selectedVideo.description}</p>
                                </div>
                            </div>
                        ) : (
                            <div className="aspect-video rounded-3xl flex items-center justify-center text-center p-12 border-2 border-dashed border-gray-800" style={{ backgroundColor: `${bgCard}50` }}>
                                <div>
                                    <div className="w-20 h-20 rounded-full mx-auto mb-6 flex items-center justify-center bg-gray-900 border border-gray-800">
                                        <svg className="w-10 h-10 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                    </div>
                                    <h2 className="text-2xl font-bold mb-2 text-gray-500">Pick a Module</h2>
                                    <p className="text-gray-600 max-w-xs mx-auto">Select a video lesson from the curriculum to start learning.</p>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Right Column: Curriculum */}
                    <div className="lg:sticky lg:top-24 space-y-6">
                        <div className="p-6 rounded-3xl" style={{ backgroundColor: bgCard, border: `1px solid ${borderColor}` }}>
                            <div className="flex items-center justify-between mb-8">
                                <h3 className="text-xl font-bold tracking-tight" style={{ color: purpleColor }}>
                                    Curriculum
                                </h3>
                                <span className="text-[10px] font-bold uppercase tracking-widest px-2 py-1 rounded bg-white/5 text-gray-400">
                                    {COURSE_VIDEOS.length} Modules
                                </span>
                            </div>

                            <div className="space-y-3">
                                {COURSE_VIDEOS.map((video) => (
                                    <button
                                        key={video.id}
                                        onClick={() => handleVideoSelect(video)}
                                        className={`group w-full flex items-center gap-4 p-4 rounded-2xl text-left transition-all relative overflow-hidden ${selectedVideo?.id === video.id
                                            ? 'shadow-lg shadow-purple-500/10'
                                            : 'hover:bg-white/5 active:scale-98'
                                            }`}
                                        style={{
                                            backgroundColor: selectedVideo?.id === video.id ? `${purpleColor}20` : 'transparent',
                                            border: `1px solid ${selectedVideo?.id === video.id ? purpleColor : borderColor}`,
                                        }}
                                    >
                                        {/* Activity Indicator for Selected */}
                                        {selectedVideo?.id === video.id && (
                                            <div className="absolute left-0 top-0 bottom-0 w-1 bg-purple-500"></div>
                                        )}

                                        <div
                                            className="flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center relative font-black text-sm transition-transform group-hover:scale-110"
                                            style={{
                                                backgroundColor: selectedVideo?.id === video.id ? purpleColor : `${greenColor}15`,
                                                color: selectedVideo?.id === video.id ? '#fff' : greenColor
                                            }}
                                        >
                                            {!hasAccess && (
                                                <div className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-gray-950 flex items-center justify-center p-1 border border-white/10">
                                                    <svg className="w-full h-full text-purple-400" fill="currentColor" viewBox="0 0 24 24">
                                                        <path d="M12 1C8.676 1 6 3.676 6 7v1H5a2 2 0 00-2 2v10a2 2 0 002 2h14a2 2 0 002-2V10a2 2 0 00-2-2h-1V7c0-3.324-2.676-6-6-6zm0 2c2.276 0 4 1.724 4 4v1H8V7c0-2.276 1.724-4 4-4z" />
                                                    </svg>
                                                </div>
                                            )}
                                            {video.id}
                                        </div>

                                        <div className="flex-1 min-w-0">
                                            <h4 className={`font-bold text-sm truncate uppercase tracking-wide transition-colors ${selectedVideo?.id === video.id ? 'text-white' : 'text-gray-300'
                                                }`}>
                                                {video.title}
                                            </h4>
                                            <div className="flex items-center gap-2 mt-1">
                                                <span className="text-[10px] text-gray-500 font-medium">{video.duration}</span>
                                                <span className="text-[10px] text-gray-700">•</span>
                                                <span className="text-[10px] text-gray-500 font-medium uppercase tracking-tighter">HD 1080p</span>
                                            </div>
                                        </div>

                                        <div className={`transition-opacity ${selectedVideo?.id === video.id ? 'opacity-100' : 'opacity-0'}`}>
                                            <div className="w-2 h-2 rounded-full bg-purple-500 shadow-[0_0_8px_rgba(155,123,211,0.5)]"></div>
                                        </div>
                                    </button>
                                ))}
                            </div>

                        </div>

                        {/* Stats/Badge Card */}
                        <div className="p-6 rounded-3xl bg-gradient-to-br from-purple-500 to-indigo-600 shadow-xl overflow-hidden relative">
                            <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full -mr-12 -mt-12 blur-2xl"></div>
                            <div className="relative z-10 flex items-center gap-4">
                                <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center backdrop-blur-md">
                                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
                                </div>
                                <div>
                                    <p className="text-xs font-bold text-white/70 uppercase tracking-widest">Certificate</p>
                                    <h4 className="text-lg font-bold text-white leading-tight">Professional Certification</h4>
                                </div>
                            </div>
                            <p className="mt-4 text-xs text-white/60 leading-relaxed font-medium">
                                Graduate from the FourXclub academy and receive your verified blockchain credential.
                            </p>
                        </div>
                    </div>
                </div>
            </main>

            {/* Purchase Modal */}
            {showPurchaseModal && (
                <PurchaseModal
                    onClose={() => setShowPurchaseModal(false)}
                    onSuccess={() => {
                        setHasAccess(true);
                        setShowPurchaseModal(false);
                    }}
                />
            )}

            {/* Background Decorations */}
            <div className="fixed top-1/4 -right-24 w-96 h-96 bg-purple-600/10 rounded-full blur-[120px] pointer-events-none -z-10"></div>
            <div className="fixed bottom-1/4 -left-24 w-96 h-96 bg-green-600/5 rounded-full blur-[120px] pointer-events-none -z-10"></div>
        </div>
    );
}
