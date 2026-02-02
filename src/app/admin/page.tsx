import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import AdminDashboard from '@/components/admin/AdminDashboard'

const ADMIN_EMAIL = 'hello@fourxclub.in'

export default async function AdminPage() {
  const session = await auth()

  // Check if user is authenticated
  if (!session) {
    redirect('/auth/signin?callbackUrl=/admin')
  }

  const userEmail = session.user?.email

  // Check if user is admin
  if (userEmail !== ADMIN_EMAIL) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white p-8 rounded-xl shadow-lg text-center max-w-md">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h1>
          <p className="text-gray-600 mb-6">You do not have permission to access the admin dashboard.</p>
          <Link
            href="/"
            className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Go to Homepage
          </Link>
        </div>
      </div>
    )
  }

  return <AdminDashboard />
}

export const metadata = {
  title: 'Admin Dashboard - FourXClub',
  description: 'Manage users, revenue, and analytics',
}