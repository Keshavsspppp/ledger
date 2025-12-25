import { Bell, Search, User, Clock, LogOut, Settings, ChevronDown } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { useNavigate } from 'react-router-dom'
import api from '../api/client'

export default function Navbar() {
  const [timeWallet, setTimeWallet] = useState(0)
  const [showUserMenu, setShowUserMenu] = useState(false)
  const [showNotificationsPanel, setShowNotificationsPanel] = useState(false)
  const [notifications, setNotifications] = useState([])
  const [notificationsLoading, setNotificationsLoading] = useState(false)
  const [notificationsError, setNotificationsError] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  
  const { currentUser, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = async () => {
    try {
      await logout()
      navigate('/login')
    } catch (error) {
      console.error('Failed to log out', error)
    }
  }

  const getUserDisplayName = () => {
    if (currentUser?.displayName) return currentUser.displayName
    if (currentUser?.email) return currentUser.email.split('@')[0]
    return 'User'
  }

  const getUserInitials = () => {
    const name = getUserDisplayName()
    return name.substring(0, 2).toUpperCase()
  }

  useEffect(() => {
    const fetchWallet = async () => {
      try {
        const { data } = await api.get('/wallet')
        setTimeWallet(data?.data?.balance ?? 0)
      } catch (err) {
        console.error('Failed to load wallet balance', err)
      }
    }

    if (currentUser) fetchWallet()
  }, [currentUser])

  const fetchNotifications = async () => {
    setNotificationsLoading(true)
    setNotificationsError('')
    try {
      const [sessionsRes, txRes] = await Promise.all([
        api.get('/sessions', { params: { upcoming: true, limit: 5 } }),
        api.get('/transactions', { params: { limit: 5 } })
      ])

      const sessionNotifs = (sessionsRes?.data?.data || []).map((s) => ({
        id: `s_${s._id}`,
        title: `Upcoming: ${s.skill || 'Session'}`,
        subtitle: `with ${s.tutor?.displayName || 'Tutor'}`,
        time: new Date(s.scheduledDate).toLocaleString(),
        type: 'session',
        unread: s.status !== 'completed'
      }))

      const txNotifs = (txRes?.data?.data || []).map((t) => ({
        id: `t_${t._id}`,
        title:
          t.status === 'completed'
            ? t.type === 'earned' ? 'Earned hours' : 'Spent hours'
            : 'Session update',
        subtitle: `${t.skill || 'Skill'} with ${(t.to?.displayName || t.from?.displayName || 'Partner')}`,
        time: new Date(t.createdAt).toLocaleString(),
        type: 'transaction',
        unread: t.status !== 'completed'
      }))

      const all = [...sessionNotifs, ...txNotifs].sort((a, b) => new Date(b.time) - new Date(a.time))
      setNotifications(all)
    } catch (err) {
      console.error('Failed to load notifications', err)
      setNotificationsError('Could not load notifications.')
    } finally {
      setNotificationsLoading(false)
    }
  }

  const handleSearch = (e) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      navigate(`/marketplace?search=${encodeURIComponent(searchQuery)}`)
    }
  }

  const handleNotifications = async () => {
    const next = !showNotificationsPanel
    setShowNotificationsPanel(next)
    if (next) {
      await fetchNotifications()
    }
  }

  const handleTimeWallet = () => {
    navigate('/ledger')
  }

  const handleProfile = () => {
    setShowUserMenu(false)
    alert('Profile page coming soon!')
  }

  const handleSettings = () => {
    setShowUserMenu(false)
    alert('Settings page coming soon!')
  }

  return (
    <nav className="fixed top-0 left-64 right-0 h-16 bg-white/80 backdrop-blur-xl border-b border-gray-100 z-30 shadow-sm">
      <div className="h-full px-8 flex items-center justify-between">
        {/* Search Bar */}
        <div className="flex-1 max-w-2xl group">
          <form onSubmit={handleSearch} className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-indigo-500 transition" size={20} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search for skills, tutors, or sessions..."
              className="w-full pl-12 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all text-sm"
            />
          </form>
        </div>

        {/* Right Side */}
        <div className="flex items-center gap-5 ml-8">
          {/* Time Wallet */}
          <button 
            onClick={handleTimeWallet}
            className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-br from-indigo-50 to-purple-50 hover:from-indigo-100 hover:to-purple-100 rounded-xl transition-all shadow-sm hover:shadow-md cursor-pointer border border-indigo-100"
            title="View Ledger"
          >
            <Clock className="text-indigo-600" size={18} />
            <div className="text-right">
              <p className="text-xs text-gray-600 leading-none font-medium">Balance</p>
              <p className="text-sm font-bold text-indigo-600">{timeWallet.toFixed(1)}h</p>
            </div>
          </button>

          {/* Notifications */}
          <div className="relative">
            <button 
              onClick={handleNotifications}
              className="relative p-2 hover:bg-gray-100 rounded-lg transition"
              title="Notifications"
            >
              <Bell size={20} className="text-gray-600" />
              {notifications.some(n => n.unread) && (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full"></span>
              )}
            </button>

            {showNotificationsPanel && (
              <>
                <div 
                  className="fixed inset-0 z-10" 
                  onClick={() => setShowNotificationsPanel(false)}
                ></div>
                <div className="absolute right-0 mt-2 w-96 bg-white rounded-lg shadow-xl border border-gray-200 py-2 z-20">
                  <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
                    <p className="text-sm font-semibold text-gray-900">Notifications</p>
                    <span className="text-xs text-gray-500">{notifications.filter(n => n.unread).length} unread</span>
                  </div>

                  {notificationsLoading ? (
                    <div className="px-4 py-6 text-gray-500 text-sm">Loading...</div>
                  ) : notificationsError ? (
                    <div className="px-4 py-6 text-red-600 text-sm">{notificationsError}</div>
                  ) : notifications.length === 0 ? (
                    <div className="px-4 py-6 text-gray-500 text-sm">No notifications.</div>
                  ) : (
                    <div className="max-h-80 overflow-y-auto">
                      {notifications.map((n) => (
                        <div key={n.id} className="px-4 py-3 hover:bg-gray-50 transition flex items-start gap-3">
                          <div className={`w-2 h-2 rounded-full mt-2 ${n.unread ? 'bg-indigo-600' : 'bg-gray-300'}`}></div>
                          <div className="flex-1">
                            <p className="text-sm font-semibold text-gray-900">{n.title}</p>
                            <p className="text-xs text-gray-600">{n.subtitle}</p>
                            <p className="text-xs text-gray-400 mt-0.5">{n.time}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </>
            )}
          </div>

          {/* User Menu */}
          <div className="relative">
            <button 
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center gap-3 hover:bg-gray-50 rounded-lg px-2 py-1.5 transition"
            >
              {currentUser?.photoURL ? (
                <img 
                  src={currentUser.photoURL} 
                  alt={getUserDisplayName()}
                  className="w-8 h-8 rounded-full"
                />
              ) : (
                <div className="w-8 h-8 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-full flex items-center justify-center">
                  <span className="text-white text-xs font-semibold">{getUserInitials()}</span>
                </div>
              )}
              <span className="text-sm font-medium text-gray-700">{getUserDisplayName()}</span>
              <ChevronDown size={16} className="text-gray-400" />
            </button>

            {showUserMenu && (
              <>
                <div 
                  className="fixed inset-0 z-10" 
                  onClick={() => setShowUserMenu(false)}
                ></div>
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-xl border border-gray-200 py-1 z-20">
                  <div className="px-4 py-3 border-b border-gray-100">
                    <p className="text-sm font-semibold text-gray-900">{getUserDisplayName()}</p>
                    <p className="text-xs text-gray-500 truncate">{currentUser?.email}</p>
                  </div>
                  
                  <button 
                    onClick={handleProfile}
                    className="w-full px-4 py-2.5 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-3 transition"
                  >
                    <User size={16} />
                    <span>Profile</span>
                  </button>
                  
                  <button 
                    onClick={handleSettings}
                    className="w-full px-4 py-2.5 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-3 transition"
                  >
                    <Settings size={16} />
                    <span>Settings</span>
                  </button>
                  
                  <div className="border-t border-gray-100 my-1"></div>
                  
                  <button 
                    onClick={handleLogout}
                    className="w-full px-4 py-2.5 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-3 transition"
                  >
                    <LogOut size={16} />
                    <span>Logout</span>
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}
