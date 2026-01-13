'use client'

import { useState, useEffect } from 'react'
import { 
  BarChart3, Users, DollarSign, TrendingUp, Video, 
  MessageSquare, Gift, Search, Download, MoreVertical,
  Check, X, Ban, RefreshCw 
} from 'lucide-react'

interface DashboardStats {
  totalRevenue: { inr: number; usd: number }
  totalUsers: number
  coursePurchases: number
  activeSubscriptions: number
  totalReferrals: number
  avgCourseCompletion: number
  recentUsers: Array<{ 
    name: string
    email: string
    joinedDate: string
    hasPurchased: boolean 
  }>
  recentPurchases: Array<{ 
    product: string
    user: string
    amount: number
    currency: string
    date: string 
  }>
}

interface User {
  id: string
  clerkId: string
  email: string
  fullName: string
  discordId?: string
  createdAt: string
  coursePurchased: boolean
  coursePurchaseDate?: string
  courseAmount?: number
  courseCurrency?: string
  discordSubscribed: boolean
  discordStatus?: string
  discordEndDate?: string
  referralCode?: string
  referralUses: number
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'overview' | 'users'>('overview')
  const [searchTerm, setSearchTerm] = useState('')
  const [timeRange, setTimeRange] = useState('30d')
  
  useEffect(() => {
    if (activeTab === 'overview') {
      fetchDashboardData()
    } else if (activeTab === 'users') {
      fetchUsers()
    }
  }, [activeTab, timeRange])

  const fetchDashboardData = async () => {
    setLoading(true)
    try {
      const response = await fetch(`/api/admin/dashboard?range=${timeRange}`)
      const data = await response.json()
      setStats(data)
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error)
    }
    setLoading(false)
  }

  const fetchUsers = async () => {
    setLoading(true)
    try {
      const response = await fetch(`/api/admin/users?search=${searchTerm}`)
      const data = await response.json()
      setUsers(data.users || [])
    } catch (error) {
      console.error('Failed to fetch users:', error)
    }
    setLoading(false)
  }

  const handleExport = async () => {
    try {
      const response = await fetch('/api/admin/dashboard', { method: 'POST' })
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `fourxclub-export-${Date.now()}.csv`
      a.click()
    } catch (error) {
      console.error('Export failed:', error)
    }
  }

  const formatCurrency = (amount: number, currency: string): string => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: currency === 'inr' ? 'INR' : 'USD'
    }).format(amount / 100)
  }

  if (loading && !stats) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">FourXClub Admin</h1>
              <p className="text-sm text-gray-600">hello@fourxclub.in</p>
            </div>
            <div className="flex items-center space-x-4">
              {activeTab === 'overview' && (
                <select 
                  value={timeRange}
                  onChange={(e) => setTimeRange(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="7d">Last 7 days</option>
                  <option value="30d">Last 30 days</option>
                  <option value="90d">Last 90 days</option>
                  <option value="1y">Last year</option>
                  <option value="all">All time</option>
                </select>
              )}
              <button 
                onClick={handleExport}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center"
              >
                <Download className="w-4 h-4 mr-2" />
                Export
              </button>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex space-x-6 mt-6">
            <button
              onClick={() => setActiveTab('overview')}
              className={`pb-4 px-1 border-b-2 font-medium transition-colors ${
                activeTab === 'overview'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Overview
            </button>
            <button
              onClick={() => setActiveTab('users')}
              className={`pb-4 px-1 border-b-2 font-medium transition-colors ${
                activeTab === 'users'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Users
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'overview' && stats && (
          <>
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <StatCard
                icon={DollarSign}
                title="Total Revenue (INR)"
                value={formatCurrency(stats.totalRevenue.inr, 'inr')}
                subtitle={`${formatCurrency(stats.totalRevenue.usd, 'usd')} USD`}
                color="bg-green-600"
              />
              <StatCard
                icon={Users}
                title="Total Users"
                value={stats.totalUsers.toLocaleString()}
                subtitle={`${stats.coursePurchases} paid`}
                color="bg-blue-600"
              />
              <StatCard
                icon={MessageSquare}
                title="Active Subscriptions"
                value={stats.activeSubscriptions.toString()}
                subtitle="Discord premium"
                color="bg-purple-600"
              />
              <StatCard
                icon={Gift}
                title="Total Referrals"
                value={stats.totalReferrals.toString()}
                subtitle="Codes used"
                color="bg-orange-600"
              />
            </div>

            {/* Course Completion */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 mb-8">
              <h2 className="text-xl font-bold text-gray-900 flex items-center mb-4">
                <Video className="w-5 h-5 mr-2 text-blue-600" />
                Course Performance
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 bg-blue-50 rounded-lg">
                  <p className="text-sm text-blue-600 font-medium mb-1">Avg. Completion</p>
                  <p className="text-3xl font-bold text-blue-900">{stats.avgCourseCompletion}%</p>
                </div>
                <div className="p-4 bg-green-50 rounded-lg">
                  <p className="text-sm text-green-600 font-medium mb-1">Completed</p>
                  <p className="text-3xl font-bold text-green-900">
                    {Math.round(stats.coursePurchases * (stats.avgCourseCompletion / 100))}
                  </p>
                </div>
                <div className="p-4 bg-purple-50 rounded-lg">
                  <p className="text-sm text-purple-600 font-medium mb-1">In Progress</p>
                  <p className="text-3xl font-bold text-purple-900">
                    {stats.coursePurchases - Math.round(stats.coursePurchases * (stats.avgCourseCompletion / 100))}
                  </p>
                </div>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Recent Users */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-100">
                <div className="p-6 border-b border-gray-200">
                  <h2 className="text-xl font-bold text-gray-900">Recent Users</h2>
                </div>
                <div className="p-6 space-y-3">
                  {stats.recentUsers.map((user, idx) => (
                    <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold">
                          {user.name.charAt(0)}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{user.name}</p>
                          <p className="text-sm text-gray-500">{user.email}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-gray-500">{user.joinedDate}</p>
                        {user.hasPurchased && (
                          <span className="inline-block mt-1 px-2 py-1 bg-green-100 text-green-700 text-xs font-medium rounded">
                            Paid
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Recent Purchases */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-100">
                <div className="p-6 border-b border-gray-200">
                  <h2 className="text-xl font-bold text-gray-900">Recent Purchases</h2>
                </div>
                <div className="p-6 space-y-3">
                  {stats.recentPurchases.map((purchase, idx) => (
                    <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-medium text-gray-900">{purchase.product}</p>
                        <p className="text-sm text-gray-500">{purchase.user}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-gray-900">{formatCurrency(purchase.amount, purchase.currency)}</p>
                        <p className="text-xs text-gray-500">{purchase.date}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </>
        )}

        {activeTab === 'users' && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-900">User Management</h2>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    placeholder="Search users..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && fetchUsers()}
                    className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent w-80"
                  />
                </div>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">User</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Course</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Discord</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Referrals</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Joined</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {users.map((user) => (
                    <tr key={user.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div>
                          <p className="font-medium text-gray-900">{user.fullName || 'N/A'}</p>
                          <p className="text-sm text-gray-500">{user.email}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        {user.coursePurchased ? (
                          <span className="flex items-center text-green-600">
                            <Check className="w-4 h-4 mr-1" />
                            Purchased
                          </span>
                        ) : (
                          <span className="flex items-center text-gray-400">
                            <X className="w-4 h-4 mr-1" />
                            No access
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        {user.discordSubscribed ? (
                          <span className="px-2 py-1 bg-purple-100 text-purple-700 text-xs font-medium rounded">
                            {user.discordStatus}
                          </span>
                        ) : (
                          <span className="text-gray-400 text-sm">Not subscribed</span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm text-gray-900">{user.referralUses || 0}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm text-gray-500">
                          {new Date(user.createdAt).toLocaleDateString()}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button className="text-gray-400 hover:text-gray-600">
                          <MoreVertical className="w-5 h-5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

interface StatCardProps {
  icon: React.ComponentType<{ className?: string }>
  title: string
  value: string | number
  subtitle?: string
  color: string
}

function StatCard({ icon: Icon, title, value, subtitle, color }: StatCardProps) {
  return (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between mb-4">
        <div className={`p-3 rounded-lg ${color}`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
      </div>
      <h3 className="text-gray-600 text-sm font-medium mb-1">{title}</h3>
      <p className="text-3xl font-bold text-gray-900">{value}</p>
      {subtitle && <p className="text-sm text-gray-500 mt-1">{subtitle}</p>}
    </div>
  )
}