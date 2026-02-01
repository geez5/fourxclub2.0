'use client';

import { useState, useEffect, Suspense, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { User } from '@supabase/supabase-js';
import RazorpayCheckout from '@/components/RazorpayCheckout';

const bgPrimary = '#0a0a0a';
const bgCard = '#151515';
const greenColor = '#6BBF6A';
const purpleColor = '#9B7BD3';
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
    const [user, setUser] = useState<User | null>(null);
    const [userStatus, setUserStatus] = useState<UserStatus | null>(null);
    const [loading, setLoading] = useState(true);
    const [showReferralModal, setShowReferralModal] = useState(false);
    const [referralInput, setReferralInput] = useState('');
    const [referralMessage, setReferralMessage] = useState('');
    const router = useRouter();
    const searchParams = useSearchParams();
    const supabase = createClient();

    const fetchUserStatus = useCallback(async () => {
        try {
            const res = await fetch('/api/user/status');
            const data = await res.json();
            if (data.success) setUserStatus(data);
        } catch (e) {
            console.error('Error fetching user status:', e);
        }
    }, []);

    // Initial load and auth change
    useEffect(() => {
        const getUser = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) {
                router.push('/auth/signin');
                return;
            }
            setUser(session.user);
            await fetchUserStatus();
            setLoading(false);
        };
        getUser();

        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            if (!session) router.push('/auth/signin');
            else setUser(session.user);
        });
        return () => subscription.unsubscribe();
    }, [router, supabase.auth, fetchUserStatus]);

    // Handle search params separately
    useEffect(() => {
        const payment = searchParams.get('payment');
        const pdfRequest = searchParams.get('pdf');

        if (payment === 'success') {
            // Use a microtask to avoid synchronous state update in effect
            Promise.resolve().then(() => {
                fetchUserStatus();
                // Clear the params
                router.replace('/dashboard');
            });
        }

        if (pdfRequest === 'true') {
            Promise.resolve().then(() => {
                fetch('/api/pdf/send', { method: 'POST' })
                    .then(r => r.json())
                    .then(d => {
                        if (d.success) {
                            if (typeof window !== 'undefined') alert('🎉 Your free PDF has been sent to your email!');
                        }
                    })
                    .catch(console.error);
                router.replace('/dashboard');
            });
        }
    }, [searchParams, router, fetchUserStatus]);

    const handleSignOut = async () => {
        await supabase.auth.signOut();
        router.push('/');
    };

    const copyReferralCode = () => {
        if (userStatus?.referrals.code) {
            if (typeof window !== 'undefined') {
                navigator.clipboard.writeText(userStatus.referrals.code);
                alert('Copied!');
            }
        }
    };

    if (loading) return <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: bgPrimary }}><div className="animate-spin rounded-full h-12 w-12 border-b-2" style={{ borderColor: greenColor }}></div></div>;

    return (
        <div className="min-h-screen" style={{ backgroundColor: bgPrimary, color: textLight }}>
            <nav style={{ backgroundColor: bgCard, borderBottom: `1px solid ${borderColor}` }}>
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"><div className="flex justify-between h-16 items-center">
                    <div className="flex items-center gap-4">
                        <Link href="/" className="flex items-center gap-2"><div className="w-10 h-10 rounded-full overflow-hidden" style={{ border: `2px solid ${greenColor}` }}><img src="/fxclogo.webp" alt="Logo" className="w-full h-full object-cover" /></div><span className="font-bold text-xl" style={{ color: greenColor }}>FourXclub</span></Link>
                        <Link href="/" className="ml-4 px-4 py-2 text-sm" style={{ color: purpleColor }}>← Home</Link>
                    </div>
                    <div className="flex items-center gap-4"><span className="text-sm" style={{ color: textMuted }}>{user?.email}</span><button onClick={handleSignOut} className="px-4 py-2 text-sm rounded-lg" style={{ border: `1px solid ${borderColor}`, color: textLight }}>Sign Out</button></div>
                </div></div>
            </nav>
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="mb-8"><h1 className="text-3xl font-bold" style={{ color: greenColor }}>Welcome, {userStatus?.user.name || user?.email?.split('@')[0]}!</h1><p className="mt-2" style={{ color: textMuted }}>Your dashboard</p></div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="rounded-xl p-6" style={{ backgroundColor: bgCard, border: `1px solid ${borderColor}` }}>
                        <div className="flex justify-between mb-4"><h2 style={{ color: purpleColor }}>Course</h2><span className="px-3 py-1 rounded-full text-sm" style={userStatus?.courseAccess.hasAccess ? { backgroundColor: `${greenColor}20`, color: greenColor } : { backgroundColor: `${purpleColor}20`, color: purpleColor }}>{userStatus?.courseAccess.hasAccess ? 'Active' : 'Locked'}</span></div>
                        <p className="mb-4" style={{ color: textMuted }}>10 premium video lessons</p>
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
                        <div className="flex justify-between mb-4"><h2 style={{ color: purpleColor }}>Community</h2><span className="px-3 py-1 rounded-full text-sm" style={userStatus?.communityAccess.hasAccess ? { backgroundColor: `${greenColor}20`, color: greenColor } : { backgroundColor: `${textMuted}30`, color: textMuted }}>{userStatus?.communityAccess.hasAccess ? 'Active' : 'Inactive'}</span></div>
                        <p className="mb-4" style={{ color: textMuted }}>Discord access</p>
                        {userStatus?.communityAccess.hasAccess ? (
                            <a href="https://discord.gg/aAUk8d73KD" target="_blank" className="px-4 py-2 rounded-lg inline-block" style={{ backgroundColor: purpleColor, color: textLight }}>Discord</a>
                        ) : (
                            <RazorpayCheckout
                                type="discord_subscription"
                                buttonText="₹2,000/mo"
                                className="px-4 py-2 rounded-lg font-bold"
                                onSuccess={fetchUserStatus}
                            />
                        )}
                    </div>
                    <div className="rounded-xl p-6" style={{ backgroundColor: bgCard, border: `1px solid ${borderColor}` }}>
                        <div className="flex justify-between mb-4"><h2 style={{ color: purpleColor }}>Referrals</h2><span className="px-3 py-1 rounded-full text-sm" style={{ backgroundColor: `${greenColor}20`, color: greenColor }}>{userStatus?.referrals.count || 0}</span></div>
                        <div className="mb-4 p-3 rounded-lg" style={{ backgroundColor: bgPrimary }}><p className="text-xs" style={{ color: textMuted }}>Your Code:</p><div className="flex items-center gap-2"><span className="font-mono font-bold" style={{ color: greenColor }}>{userStatus?.referrals.code || '...'}</span><button onClick={copyReferralCode} className="text-sm" style={{ color: purpleColor }}>Copy</button></div></div>
                        <button onClick={() => setShowReferralModal(true)} className="px-4 py-2 rounded-lg text-sm" style={{ border: `1px solid ${borderColor}`, color: textLight }}>Use Code</button>
                    </div>
                </div>
            </main>
            {showReferralModal && <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50"><div className="rounded-xl p-6 max-w-md w-full mx-4" style={{ backgroundColor: bgCard }}><h3 className="text-lg font-semibold mb-4" style={{ color: greenColor }}>Referral Code</h3><input type="text" value={referralInput} onChange={e => setReferralInput(e.target.value.toUpperCase())} className="w-full px-4 py-2 rounded-lg mb-4" style={{ backgroundColor: bgPrimary, border: `1px solid ${borderColor}`, color: textLight }} />{referralMessage && <p className={`text-sm mb-4 ${referralMessage.startsWith('✅') ? 'text-green-400' : 'text-red-400'}`}>{referralMessage}</p>}<div className="flex gap-3"><button onClick={() => setShowReferralModal(false)} className="flex-1 px-4 py-2 rounded-lg" style={{ border: `1px solid ${borderColor}`, color: textLight }}>Cancel</button><button onClick={async () => { const res = await fetch('/api/referral/apply', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ code: referralInput }) }); const data = await res.json(); setReferralMessage(data.success ? '✅ Applied!' : '❌ Failed'); if (data.success) setTimeout(() => setShowReferralModal(false), 1500); }} className="flex-1 px-4 py-2 rounded-lg" style={{ backgroundColor: greenColor, color: bgPrimary }}>Apply</button></div></div></div>}
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
