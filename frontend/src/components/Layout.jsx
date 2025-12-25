import Sidebar from './Sidebar'
import Navbar from './Navbar'

export default function Layout({ children }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Animated background elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-96 h-96 bg-indigo-200 rounded-full mix-blend-multiply filter blur-3xl opacity-15 animate-blob"></div>
        <div className="absolute top-40 right-10 w-80 h-80 bg-purple-200 rounded-full mix-blend-multiply filter blur-3xl opacity-15 animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-8 left-1/2 w-96 h-96 bg-pink-200 rounded-full mix-blend-multiply filter blur-3xl opacity-15 animate-blob" style={{ animationDelay: '4s' }}></div>
      </div>
      
      <Sidebar />
      <Navbar />
      <main className="ml-64 mt-16 p-8 relative z-10">
        <div className="max-w-[1600px] mx-auto">
          {children}
        </div>
      </main>
    </div>
  )
}
