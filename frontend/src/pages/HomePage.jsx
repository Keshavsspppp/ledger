import { ArrowRight, Share2, BookOpen, Users, Sparkles, Award, TrendingUp } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { useEffect } from 'react'

export default function HomePage() {
  const { currentUser } = useAuth()
  const navigate = useNavigate()

  // Redirect to dashboard if already logged in
  useEffect(() => {
    if (currentUser) {
      navigate('/dashboard')
    }
  }, [currentUser, navigate])

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50">
      {/* Navigation */}
      <nav className="bg-white/80 backdrop-blur-md shadow-lg fixed w-full z-50 border-b border-indigo-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Sparkles className="text-indigo-600" size={28} />
            <h1 className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
              Skill-Share Open Ledger
            </h1>
          </div>
          <div className="space-x-4 flex items-center">
            <button className="px-4 py-2 text-gray-700 hover:text-indigo-600 transition-all font-medium">
              About
            </button>
            <Link to="/login">
              <button className="px-4 py-2 text-gray-700 hover:text-indigo-600 transition-all font-medium">
                Login
              </button>
            </Link>
            <Link to="/signup">
              <button className="px-6 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-full hover:shadow-lg hover:scale-105 transition-all duration-300 font-medium">
                Get Started
              </button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-32 pt-40">
        <div className="text-center relative">
          {/* Decorative elements */}
          <div className="absolute top-0 left-1/4 w-72 h-72 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
          <div className="absolute top-0 right-1/4 w-72 h-72 bg-indigo-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>
          
          <div className="relative">
            <div className="inline-block mb-4 px-4 py-2 bg-indigo-100 rounded-full">
              <span className="text-indigo-600 font-semibold text-sm">🎯 Build Your Learning Network</span>
            </div>
            
            <h2 className="text-6xl md:text-7xl font-extrabold text-gray-900 mb-6 leading-tight">
              Share Skills,<br />
              <span className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                Build Community
              </span>
            </h2>
            
            <p className="text-xl md:text-2xl text-gray-600 mb-10 max-w-3xl mx-auto leading-relaxed">
              An open, transparent ledger for skill-sharing. Connect with others, exchange knowledge, and grow together in a 
              <span className="font-semibold text-indigo-600"> decentralized learning ecosystem</span>.
            </p>
            
            <div className="flex gap-4 justify-center flex-wrap">
              <Link to="/marketplace">
                <button className="group px-8 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-full hover:shadow-2xl transition-all duration-300 flex items-center gap-2 font-semibold text-lg hover:scale-105">
                  Explore Now 
                  <ArrowRight className="group-hover:translate-x-1 transition-transform" size={20} />
                </button>
              </Link>
              <button className="px-8 py-4 border-2 border-indigo-600 text-indigo-600 rounded-full hover:bg-indigo-600 hover:text-white transition-all duration-300 font-semibold text-lg hover:scale-105">
                Learn More
              </button>
            </div>

            {/* Stats Section */}
            <div className="mt-16 grid grid-cols-3 gap-8 max-w-2xl mx-auto">
              <div className="text-center">
                <div className="text-4xl font-bold text-indigo-600">10K+</div>
                <div className="text-gray-600 mt-1">Active Users</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-purple-600">500+</div>
                <div className="text-gray-600 mt-1">Skills Shared</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-pink-600">100K+</div>
                <div className="text-gray-600 mt-1">Exchanges</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="bg-white py-24 relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-indigo-50/30 to-transparent"></div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="text-center mb-16">
            <h3 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Why Choose <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">Skill-Share?</span>
            </h3>
            <p className="text-gray-600 text-lg max-w-2xl mx-auto">
              Experience the future of collaborative learning with our innovative platform
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="group p-8 border-2 border-indigo-100 rounded-2xl hover:shadow-2xl hover:border-indigo-300 transition-all duration-300 bg-gradient-to-br from-white to-indigo-50/50 hover:-translate-y-2">
              <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                <Share2 className="text-white" size={32} />
              </div>
              <h4 className="text-2xl font-bold text-gray-900 mb-3">Transparent Sharing</h4>
              <p className="text-gray-600 leading-relaxed">
                All skill exchanges are recorded on an open ledger, ensuring complete transparency and accountability in every transaction.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="group p-8 border-2 border-purple-100 rounded-2xl hover:shadow-2xl hover:border-purple-300 transition-all duration-300 bg-gradient-to-br from-white to-purple-50/50 hover:-translate-y-2">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                <BookOpen className="text-white" size={32} />
              </div>
              <h4 className="text-2xl font-bold text-gray-900 mb-3">Diverse Skills</h4>
              <p className="text-gray-600 leading-relaxed">
                Learn and teach anything from coding and design to languages, music, cooking, and everything in between.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="group p-8 border-2 border-pink-100 rounded-2xl hover:shadow-2xl hover:border-pink-300 transition-all duration-300 bg-gradient-to-br from-white to-pink-50/50 hover:-translate-y-2">
              <div className="w-16 h-16 bg-gradient-to-br from-pink-500 to-rose-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                <Users className="text-white" size={32} />
              </div>
              <h4 className="text-2xl font-bold text-gray-900 mb-3">Community Driven</h4>
              <p className="text-gray-600 leading-relaxed">
                Join a vibrant global community of learners and teachers dedicated to peer-to-peer education and growth.
              </p>
            </div>
          </div>

          {/* Additional Features */}
          <div className="mt-16 grid md:grid-cols-3 gap-6">
            <div className="flex items-start gap-4 p-6 bg-white rounded-xl border border-gray-200 hover:border-indigo-300 transition-all">
              <Award className="text-indigo-600 flex-shrink-0" size={24} />
              <div>
                <h5 className="font-semibold text-gray-900 mb-1">Earn Recognition</h5>
                <p className="text-sm text-gray-600">Get badges and certifications for your contributions</p>
              </div>
            </div>
            
            <div className="flex items-start gap-4 p-6 bg-white rounded-xl border border-gray-200 hover:border-purple-300 transition-all">
              <TrendingUp className="text-purple-600 flex-shrink-0" size={24} />
              <div>
                <h5 className="font-semibold text-gray-900 mb-1">Track Progress</h5>
                <p className="text-sm text-gray-600">Monitor your learning journey with detailed analytics</p>
              </div>
            </div>
            
            <div className="flex items-start gap-4 p-6 bg-white rounded-xl border border-gray-200 hover:border-pink-300 transition-all">
              <Sparkles className="text-pink-600 flex-shrink-0" size={24} />
              <div>
                <h5 className="font-semibold text-gray-900 mb-1">Smart Matching</h5>
                <p className="text-sm text-gray-600">AI-powered connections with perfect learning partners</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative py-24 overflow-hidden">
        {/* Gradient background */}
        <div className="absolute inset-0 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600"></div>
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS1vcGFjaXR5PSIwLjEiIHN0cm9rZS13aWR0aD0iMSIvPjwvcGF0dGVybj48L2RlZnM+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0idXJsKCNncmlkKSIvPjwvc3ZnPg==')] opacity-20"></div>
        
        <div className="max-w-4xl mx-auto text-center px-4 relative z-10">
          <div className="inline-block mb-6 px-6 py-2 bg-white/20 backdrop-blur-sm rounded-full border border-white/30">
            <span className="text-white font-semibold">✨ Join the Movement</span>
          </div>
          
          <h3 className="text-4xl md:text-5xl font-bold mb-6 text-white leading-tight">
            Ready to Start Sharing<br />Your Skills?
          </h3>
          
          <p className="text-xl mb-10 text-white/90 max-w-2xl mx-auto leading-relaxed">
            Join thousands of skill-sharers today and be part of the learning revolution. Your next skill adventure awaits!
          </p>
          
          <div className="flex gap-4 justify-center flex-wrap">
            <Link to="/dashboard">
              <button className="group px-10 py-4 bg-white text-indigo-600 font-bold rounded-full hover:bg-gray-50 transition-all duration-300 shadow-2xl hover:shadow-white/50 hover:scale-105 flex items-center gap-2">
                Create Your Profile
                <ArrowRight className="group-hover:translate-x-1 transition-transform" size={20} />
              </button>
            </Link>
            <Link to="/matchmaker">
              <button className="px-10 py-4 border-2 border-white text-white font-bold rounded-full hover:bg-white/10 backdrop-blur-sm transition-all duration-300 hover:scale-105">
                Try Matchmaker
              </button>
            </Link>
          </div>

          {/* Trust indicators */}
          <div className="mt-12 flex items-center justify-center gap-8 flex-wrap text-white/80 text-sm">
            <div className="flex items-center gap-2">
              <span className="text-2xl">🔒</span>
              <span>Secure Platform</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-2xl">⚡</span>
              <span>Lightning Fast</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-2xl">🌍</span>
              <span>Global Community</span>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-300 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div className="col-span-2">
              <div className="flex items-center gap-2 mb-4">
                <Sparkles className="text-indigo-400" size={24} />
                <h3 className="text-xl font-bold text-white">Skill-Share Open Ledger</h3>
              </div>
              <p className="text-gray-400 max-w-md">
                Building the future of decentralized learning and skill exchange, one connection at a time.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold text-white mb-4">Quick Links</h4>
              <ul className="space-y-2">
                <li><a href="#" className="hover:text-indigo-400 transition">About Us</a></li>
                <li><a href="#" className="hover:text-indigo-400 transition">How It Works</a></li>
                <li><a href="#" className="hover:text-indigo-400 transition">Community</a></li>
                <li><a href="#" className="hover:text-indigo-400 transition">Blog</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold text-white mb-4">Support</h4>
              <ul className="space-y-2">
                <li><a href="#" className="hover:text-indigo-400 transition">Help Center</a></li>
                <li><a href="#" className="hover:text-indigo-400 transition">Terms of Service</a></li>
                <li><a href="#" className="hover:text-indigo-400 transition">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-indigo-400 transition">Contact</a></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-800 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-gray-400">&copy; 2025 Skill-Share Open Ledger. All rights reserved.</p>
            <div className="flex gap-6">
              <a href="#" className="hover:text-indigo-400 transition">Twitter</a>
              <a href="#" className="hover:text-indigo-400 transition">GitHub</a>
              <a href="#" className="hover:text-indigo-400 transition">Discord</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
