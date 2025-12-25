import { useEffect, useState } from 'react'
import { Calendar, Clock, TrendingUp, Award, Users, Sparkles, ArrowUpRight, Play } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import api from '../api/client'

export default function Dashboard() {
  const { currentUser } = useAuth()
  const [upcomingSessions, setUpcomingSessions] = useState([])
  const [recentActivity, setRecentActivity] = useState([])
  const [stats, setStats] = useState({
    skillsLearned: 0,
    hoursTaught: 0,
    activeSessions: 0,
    totalHours: 0
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    const fetchDashboard = async () => {
      setLoading(true)
      setError('')
      try {
        const [sessionsRes, statsRes, txRes] = await Promise.all([
          api.get('/sessions', { params: { upcoming: true, limit: 3 } }),
          api.get('/transactions/stats'),
          api.get('/transactions', { params: { limit: 5 } })
        ])

        const upcoming = (sessionsRes?.data?.data || []).map((s) => ({
          id: s._id,
          skill: s.skill || 'Session',
          tutor: s.tutor?.displayName || 'Tutor',
          date: new Date(s.scheduledDate).toLocaleDateString(),
          time: s.scheduledTime || new Date(s.scheduledDate).toLocaleTimeString(),
          duration: `${s.duration || 1} hrs`,
          type: s.meetingLink ? 'Video Call' : 'Scheduled',
          avatar: '📚',
          color: 'from-indigo-500 to-purple-500'
        }))

        setUpcomingSessions(upcoming)

        const earned = statsRes?.data?.data?.earned?.total || 0
        const spent = statsRes?.data?.data?.spent?.total || 0
        const balance = statsRes?.data?.data?.balance || 0

        setStats({
          skillsLearned: 0, // optional: compute from completed sessions if needed
          hoursTaught: earned,
          activeSessions: upcoming.length,
          totalHours: earned + spent // total flow through account
        })

        const recent = (txRes?.data?.data || []).map((t) => ({
          action:
            t.status === 'completed'
              ? t.type === 'earned'
                ? 'Earned hours'
                : 'Spent hours'
              : 'Session update',
          detail: `${t.skill || 'Skill'} with ${(t.to?.displayName || t.from?.displayName || 'Partner')}`,
          time: new Date(t.createdAt).toLocaleString(),
          icon: t.type === 'earned' ? '💰' : t.type === 'spent' ? '⏳' : '📅',
          color: t.type === 'earned' ? 'text-green-600' : t.type === 'spent' ? 'text-yellow-600' : 'text-blue-600'
        }))

        setRecentActivity(recent)
      } catch (err) {
        console.error('Failed to load dashboard', err)
        setError('Could not load dashboard right now.')
      } finally {
        setLoading(false)
      }
    }

    fetchDashboard()
  }, [])

  return (
    <div className="space-y-8">
      {/* Header with Gradient */}
      <div className="relative overflow-hidden bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 rounded-3xl p-8 shadow-2xl">
        <div className="absolute inset-0 bg-black/10 backdrop-blur-sm"></div>
        <div className="relative flex items-center justify-between">
          <div>
            <h1 className="text-5xl font-bold text-white flex items-center gap-3 drop-shadow-lg">
              Welcome back, {currentUser?.displayName || currentUser?.email?.split('@')[0] || 'Learner'}! 
              <span className="text-5xl animate-wave inline-block">👋</span>
            </h1>
            <p className="text-white/90 mt-3 text-lg font-medium">Here's what's happening with your learning journey today.</p>
          </div>
          <Sparkles className="text-white/30" size={80} />
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'Skills Learned', value: stats.skillsLearned, icon: Award, gradient: 'from-blue-500 to-cyan-500', color: 'text-blue-600' },
          { label: 'Hours Taught', value: stats.hoursTaught, icon: TrendingUp, gradient: 'from-purple-500 to-pink-500', color: 'text-purple-600' },
          { label: 'Active Sessions', value: stats.activeSessions, icon: Users, gradient: 'from-orange-500 to-yellow-500', color: 'text-orange-600' },
          { label: 'Total Hours', value: stats.totalHours, icon: Clock, gradient: 'from-green-500 to-emerald-500', color: 'text-green-600' }
        ].map((stat, index) => {
          const Icon = stat.icon
          return (
            <div
              key={index}
              className="group relative bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden hover:-translate-y-1"
            >
              <div className={`absolute inset-0 bg-gradient-to-br ${stat.gradient} opacity-5 group-hover:opacity-10 transition`}></div>
              <div className="relative p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${stat.gradient} flex items-center justify-center shadow-lg transform group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300`}>
                    <Icon className="text-white drop-shadow-lg" size={28} />
                  </div>
                  <ArrowUpRight className="text-gray-400 group-hover:text-green-500 transition" size={20} />
                </div>
                <p className="text-gray-600 text-sm font-medium mb-1">{stat.label}</p>
                <div className="flex items-baseline gap-2">
                  <p className={`text-4xl font-bold ${stat.color}`}>{stat.value}</p>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Upcoming Sessions */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
              <div className="p-6 border-b border-gray-100 bg-gradient-to-r from-indigo-50 via-purple-50 to-pink-50">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-xl flex items-center justify-center">
                    <Calendar className="text-white" size={20} />
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900">Upcoming Sessions</h2>
                </div>
                <span className="px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-sm font-bold rounded-full shadow-lg">
                  {upcomingSessions.length} Sessions
                </span>
              </div>
            </div>
            
            <div className="divide-y divide-gray-100">
              {upcomingSessions.map((session) => (
                <div
                  key={session.id}
                  className="p-6 hover:bg-gradient-to-r hover:from-gray-50 hover:to-transparent transition-all cursor-pointer group"
                >
                  <div className="flex items-start gap-4">
                    <div className="relative">
                      <div className={`absolute inset-0 bg-gradient-to-br ${session.color} rounded-2xl blur opacity-40`}></div>
                      <div className="relative text-5xl transform group-hover:scale-110 transition-transform">{session.avatar}</div>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h3 className="font-bold text-gray-900 text-lg group-hover:text-indigo-600 transition">{session.skill}</h3>
                          <p className="text-gray-600 text-sm mt-1">with {session.tutor}</p>
                        </div>
                        <span className={`px-3 py-1.5 bg-gradient-to-r ${session.color} text-white text-xs font-bold rounded-full shadow-md`}>
                          {session.type}
                        </span>
                      </div>
                      
                      <div className="flex items-center gap-4 mt-3 text-sm text-gray-600">
                        <div className="flex items-center gap-1.5 bg-gray-100 px-3 py-1.5 rounded-lg">
                          <Calendar size={14} />
                          <span className="font-medium">{session.date}</span>
                        </div>
                        <div className="flex items-center gap-1.5 bg-gray-100 px-3 py-1.5 rounded-lg">
                          <Clock size={14} />
                          <span className="font-medium">{session.time} ({session.duration})</span>
                        </div>
                      </div>
                      
                      <div className="flex gap-2 mt-4">
                        <button className="px-5 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-sm font-bold rounded-xl hover:shadow-xl transition-all flex items-center gap-2 group-hover:scale-105">
                          <Play size={16} className="fill-white" />
                          Join Session
                        </button>
                        <button className="px-5 py-2.5 border-2 border-gray-300 text-gray-700 text-sm font-semibold rounded-xl hover:bg-gray-50 hover:border-gray-400 transition-all">
                          Reschedule
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              {upcomingSessions.length === 0 && (
                <div className="p-6 text-gray-500">No upcoming sessions.</div>
              )}
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden sticky top-24">
            <div className="p-6 border-b border-gray-100 bg-gradient-to-br from-purple-50 to-pink-50">
              <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                <TrendingUp className="text-purple-600" size={24} />
                Recent Activity
              </h2>
            </div>
            
            <div className="p-6 space-y-4 max-h-[500px] overflow-y-auto">
              {recentActivity.map((activity, index) => (
                <div key={index} className="flex gap-3 group cursor-pointer">
                  <div className="text-2xl flex-shrink-0">{activity.icon}</div>
                  <div className="flex-1">
                    <p className={`font-semibold text-sm ${activity.color} group-hover:underline`}>{activity.action}</p>
                    <p className="text-gray-600 text-sm mt-0.5">{activity.detail}</p>
                    <p className="text-gray-400 text-xs mt-1">{activity.time}</p>
                  </div>
                </div>
              ))}
              {recentActivity.length === 0 && (
                <div className="text-gray-500 text-sm">No recent activity.</div>
              )}
            </div>
            
            <div className="p-4 border-t border-gray-100 bg-gray-50">
              <button className="w-full text-center text-indigo-600 font-bold text-sm hover:text-indigo-700 transition py-2">
                View All Activity →
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
