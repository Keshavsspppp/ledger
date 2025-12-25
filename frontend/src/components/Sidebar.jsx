import { Link, useLocation } from 'react-router-dom'
import { LayoutDashboard, ShoppingBag, GitBranch, Sparkles, TrendingUp, FolderGit2 } from 'lucide-react'

export default function Sidebar() {
  const location = useLocation()
  
  const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard, gradient: 'from-blue-500 to-cyan-500' },
    { name: 'Marketplace', path: '/marketplace', icon: ShoppingBag, gradient: 'from-purple-500 to-pink-500' },
    { name: 'Matchmaker', path: '/matchmaker', icon: Sparkles, gradient: 'from-orange-500 to-red-500' },
    { name: 'Programs', path: '/programs', icon: FolderGit2, gradient: 'from-indigo-500 to-blue-500' },
    { name: 'Ledger', path: '/ledger', icon: GitBranch, gradient: 'from-green-500 to-emerald-500' }
  ]

  const isActive = (path) => location.pathname === path

  return (
    <aside className="fixed left-0 top-0 h-full w-64 bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900 border-r border-gray-700 shadow-2xl z-40">
      {/* Logo */}
      <div className="p-6 border-b border-gray-700 bg-gradient-to-r from-indigo-900/60 to-purple-900/60 backdrop-blur-sm">
        <Link to="/" className="flex items-center gap-3 group">
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-xl blur opacity-75 group-hover:opacity-100 transition"></div>
            <div className="relative w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300 cursor-pointer">
              <Sparkles className="text-white" size={24} />
            </div>
          </div>
          <div>
            <h1 className="text-xl font-bold text-white group-hover:text-indigo-300 transition">
              Skill-Share
            </h1>
            <p className="text-xs text-gray-400 font-medium">Community</p>
          </div>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="p-4 space-y-2 mt-2">
        {navItems.map((item) => {
          const Icon = item.icon
          const active = isActive(item.path)
          return (
            <Link
              key={item.path}
              to={item.path}
              className="group relative block mx-2"
            >
              {active && (
                <div className={`absolute inset-0 bg-gradient-to-r ${item.gradient} rounded-xl blur opacity-50`}></div>
              )}
              <div className={`relative flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all duration-300 ${
                active
                  ? `bg-gradient-to-r ${item.gradient} text-white shadow-lg scale-105 font-semibold`
                  : 'text-gray-400 hover:text-white hover:bg-gray-700/40'
              }`}>
                <Icon size={20} className={active ? 'drop-shadow-lg' : 'group-hover:scale-110 transition-transform'} />
                <span className="font-medium">{item.name}</span>
                {active && (
                  <div className="ml-auto w-2 h-2 bg-white rounded-full animate-pulse"></div>
                )}
              </div>
            </Link>
          )
        })}
      </nav>

      {/* Quick Stats with Glass Effect */}
      <div className="absolute bottom-0 left-0 right-0 p-4">
        <div className="bg-gradient-to-br from-indigo-900/40 to-purple-900/40 backdrop-blur-xl rounded-2xl border border-indigo-500/30 p-5 shadow-xl">
          <div className="text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <TrendingUp className="text-green-400" size={18} />
              <p className="text-xs text-gray-300 font-medium">Your Performance</p>
            </div>
            <div className="flex items-baseline justify-center gap-1 mb-1">
              <span className="text-3xl font-bold bg-gradient-to-r from-yellow-400 to-orange-400 bg-clip-text text-transparent">4.8</span>
              <span className="text-2xl">⭐</span>
            </div>
            <p className="text-xs text-gray-400 mb-3">Based on 127 reviews</p>
            
            {/* Progress bar */}
            <div className="w-full bg-gray-700 rounded-full h-2 mb-2">
              <div className="bg-gradient-to-r from-yellow-400 to-orange-400 h-2 rounded-full shadow-lg" style={{ width: '96%' }}></div>
            </div>
            <p className="text-xs text-gray-400">Top 4% in your category</p>
          </div>
        </div>
      </div>
    </aside>
  )
}
