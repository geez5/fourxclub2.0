'use client';

import { useState, useEffect, Suspense, useCallback } from 'react';
import { useSession, signIn, signOut } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import RazorpayCheckout from '@/components/RazorpayCheckout';

const bgPrimary = '#0a0a0a';
const bgCard = '#151515';
const greenColor = '#3D8C3C';
const purpleColor = '#6B4A9E';
const textLight = '#ffffff';
const textMuted = '#888888';
const borderColor = '#3a3a3a';



interface UserStatus {
    user: { id: string; email: string; name: string; referralCode: string; discordId: string | null; };
    courseAccess: { hasAccess: boolean; purchasedAt: string | null; expiresAt: string | null; status: string; };
    communityAccess: { hasAccess: boolean; subscribedAt: string | null; expiresAt: string | null; autoRenew: boolean; status: string; };
    referrals: { code: string; count: number; };
}

function DashboardContent() {
    const { data: session, status } = useSession();
    const [userStatus, setUserStatus] = useState<UserStatus | null>(null);
    const [loading, setLoading] = useState(true);
    const [showReferralModal, setShowReferralModal] = useState(false);
    const [referralInput, setReferralInput] = useState('');
    const [referralMessage, setReferralMessage] = useState('');
    const router = useRouter();
    const searchParams = useSearchParams();

    const fetchUserStatus = useCallback(async () => {
        try {
            const res = await fetch(`/api/user/status`, {
                credentials: 'include',
            });
            const data = await res.json();
            if (data.success) setUserStatus(data);
        } catch (e) {
            console.error('Error fetching user status:', e);
        }
    }, []);

    // Initial load and auth check
    useEffect(() => {
        if (status === 'loading') return;

        if (status === 'unauthenticated') {
            signIn('google');
            return;
        }

        if (status === 'authenticated') {
            fetchUserStatus().then(() => setLoading(false));
        }
    }, [status, router, fetchUserStatus]);

    // Handle search params separately
    useEffect(() => {
        const payment = searchParams.get('payment');

        if (payment === 'success') {
            Promise.resolve().then(() => {
                fetchUserStatus();
                router.replace('/dashboard');
            });
        }
    }, [searchParams, router, fetchUserStatus]);

    const handleSignOut = async () => {
        await signOut({ callbackUrl: '/' });
    };

    const copyReferralCode = () => {
        if (userStatus?.referrals.code) {
            if (typeof window !== 'undefined') {
                navigator.clipboard.writeText(userStatus.referrals.code);
                alert('Copied!');
            }
        }
    };

    const applyReferralCode = async () => {
        try {
            const res = await fetch(`/api/referral/apply`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ code: referralInput }),
                credentials: 'include',
            });
            const data = await res.json();
            setReferralMessage(data.success ? '✅ Applied!' : '❌ Failed');
            if (data.success) setTimeout(() => setShowReferralModal(false), 1500);
        } catch {
            setReferralMessage('❌ Failed');
        }
    };

    if (loading || status === 'loading') {
        return (
            <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: bgPrimary }}>
                <div className="animate-spin rounded-full h-12 w-12 border-b-2" style={{ borderColor: greenColor }}></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen" style={{ backgroundColor: bgPrimary, color: textLight }}>
            <nav style={{ backgroundColor: bgCard, borderBottom: `1px solid ${borderColor}` }}>
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between h-16 items-center">
                        <div className="flex items-center gap-4">
                            <Link href="/" className="flex items-center gap-2">
                                <div className="w-10 h-10 rounded-full overflow-hidden" style={{ border: `2px solid ${greenColor}` }}>
                                    <img src="/fxclogo.webp" alt="Logo" className="w-full h-full object-cover" />
                                </div>
                                <span className="font-bold text-xl" style={{ color: greenColor }}>FourXclub</span>
                            </Link>
                            <Link href="/" className="ml-4 px-4 py-2 text-sm" style={{ color: purpleColor }}>← Home</Link>
                        </div>
                        <div className="flex items-center gap-4">
                            <span className="text-sm" style={{ color: textMuted }}>{session?.user?.email}</span>
                            <button onClick={handleSignOut} className="px-4 py-2 text-sm rounded-lg" style={{ border: `1px solid ${borderColor}`, color: textLight }}>Sign Out</button>
                        </div>
                    </div>
                </div>
            </nav>
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold" style={{ color: greenColor }}>Welcome, {userStatus?.user.name || session?.user?.name || session?.user?.email?.split('@')[0]}!</h1>
                    <p className="mt-2" style={{ color: textMuted }}>Your dashboard</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="rounded-xl p-6" style={{ backgroundColor: bgCard, border: `1px solid ${borderColor}` }}>
                        <div className="flex justify-between mb-4">
                            <h2 style={{ color: purpleColor }}>Base Course</h2>
                            <span className="px-3 py-1 rounded-full text-sm" style={userStatus?.courseAccess.hasAccess ? { backgroundColor: `${greenColor}20`, color: greenColor } : { backgroundColor: `${purpleColor}20`, color: purpleColor }}>{userStatus?.courseAccess.hasAccess ? 'Active' : 'Locked'}</span>
                        </div>
                        <p className="mb-4" style={{ color: textMuted }}>Structured lessons + 1 session</p>
                        {userStatus?.courseAccess.hasAccess ? (
                            <Link href="/course" className="px-4 py-2 rounded-lg inline-block" style={{ backgroundColor: greenColor, color: bgPrimary }}>View</Link>
                        ) : (
                            <RazorpayCheckout
                                type="course"
                                buttonText="₹1,499"
                                className="px-4 py-2 rounded-lg font-bold"
                                onSuccess={fetchUserStatus}
                            />
                        )}
                    </div>
                    <div className="rounded-xl p-6" style={{ backgroundColor: bgCard, border: `1px solid ${borderColor}` }}>
                        <div className="flex justify-between mb-4">
                            <h2 style={{ color: purpleColor }}>Intermediate</h2>
                            <span className="px-3 py-1 rounded-full text-sm" style={userStatus?.communityAccess.hasAccess ? { backgroundColor: `${greenColor}20`, color: greenColor } : { backgroundColor: `${textMuted}30`, color: textMuted }}>{userStatus?.communityAccess.hasAccess ? 'Active' : 'Locked'}</span>
                        </div>
                        <p className="mb-4" style={{ color: textMuted }}>Base + 3 sessions + 1 month live access</p>
                        {userStatus?.communityAccess.hasAccess ? (
                            <a href="https://discord.gg/aAUk8d73KD" target="_blank" className="px-4 py-2 rounded-lg inline-block" style={{ backgroundColor: purpleColor, color: textLight }}>Discord</a>
                        ) : (
                            <RazorpayCheckout
                                type="combo"
                                buttonText="₹2,499"
                                className="px-4 py-2 rounded-lg font-bold"
                                onSuccess={fetchUserStatus}
                            />
                        )}
                    </div>
                    <div className="rounded-xl p-6" style={{ backgroundColor: bgCard, border: `1px solid ${borderColor}` }}>
                        <div className="flex justify-between mb-4">
                            <h2 style={{ color: purpleColor }}>Pro Mentorship</h2>
                            <span className="px-3 py-1 rounded-full text-sm" style={{ backgroundColor: `${greenColor}20`, color: greenColor }}>{userStatus?.referrals.count || 0} referrals</span>
                        </div>
                        <p className="mb-4" style={{ color: textMuted }}>All access + 8 sessions + 3 months live</p>
                        <RazorpayCheckout
                            type="pro"
                            buttonText="₹4,999"
                            className="px-4 py-2 rounded-lg font-bold"
                            onSuccess={fetchUserStatus}
                        />
                    </div>
                </div>
            </main>
            {showReferralModal && (
                <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
                    <div className="rounded-xl p-6 max-w-md w-full mx-4" style={{ backgroundColor: bgCard }}>
                        <h3 className="text-lg font-semibold mb-4" style={{ color: greenColor }}>Referral Code</h3>
                        <input
                            type="text"
                            value={referralInput}
                            onChange={e => setReferralInput(e.target.value.toUpperCase())}
                            className="w-full px-4 py-2 rounded-lg mb-4"
                            style={{ backgroundColor: bgPrimary, border: `1px solid ${borderColor}`, color: textLight }}
                        />
                        {referralMessage && <p className={`text-sm mb-4 ${referralMessage.startsWith('✅') ? 'text-green-400' : 'text-red-400'}`}>{referralMessage}</p>}
                        <div className="flex gap-3">
                            <button onClick={() => setShowReferralModal(false)} className="flex-1 px-4 py-2 rounded-lg" style={{ border: `1px solid ${borderColor}`, color: textLight }}>Cancel</button>
                            <button onClick={applyReferralCode} className="flex-1 px-4 py-2 rounded-lg" style={{ backgroundColor: greenColor, color: bgPrimary }}>Apply</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default function DashboardPage() {
    return (
        <Suspense fallback={<div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: bgPrimary }}><div className="animate-spin rounded-full h-12 w-12 border-b-2" style={{ borderColor: greenColor }}></div></div>}>
            <DashboardContent />
        </Suspense>
    );
}
