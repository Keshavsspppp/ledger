import { Send, User, Bot, Star } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import api from '../api/client'

export default function Matchmaker() {
  const { currentUser } = useAuth()
  const [messages, setMessages] = useState([
    {
      id: 1,
      type: 'ai',
      content: "👋 Hi! I'm your AI Matchmaker. Tell me what you'd like to learn, and I'll recommend the perfect tutors for you!",
      timestamp: new Date().toISOString()
    }
  ])
  const [inputValue, setInputValue] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [promoteMe, setPromoteMe] = useState(false)
  const seenProgramsRef = useRef(new Set())

  // Sample tutor recommendations
  const handleSendMessage = async () => {
    if (!inputValue.trim()) return

    const userMessage = {
      id: messages.length + 1,
      type: 'user',
      content: inputValue,
      timestamp: new Date().toISOString()
    }
    setMessages([...messages, userMessage])
    setInputValue('')
    setIsTyping(true)

    try {
      const { data } = await api.post('/matchmaker/recommend', {
        query: userMessage.content
      })

      const recommendations = data?.data?.map(({ tutor, matchScore, reason }) => ({
        name: tutor?.user?.displayName || 'Tutor',
        avatar: '👤',
        skill: tutor?.expertise?.[0]?.name || 'Skill',
        rating: tutor?.rating?.average?.toFixed?.(1) || '0.0',
        matchScore: matchScore || 0,
        reason: reason || 'Great fit for your query'
      })) || []

      if (promoteMe) {
        const myName = currentUser?.displayName || currentUser?.email?.split('@')[0] || 'You'
        recommendations.unshift({
          name: myName,
          avatar: '🫵',
          skill: 'Offer your own help',
          rating: '5.0',
          matchScore: 99,
          reason: 'You can take this request yourself—share your availability to earn hours.'
        })
      }

      const aiResponse = {
        id: messages.length + 2,
        type: 'ai',
        content: `Great! I found some excellent tutors for "${userMessage.content}". Here are my top recommendations:`,
        recommendations,
        timestamp: new Date().toISOString()
      }
      setMessages(prev => [...prev, aiResponse])
    } catch (error) {
      console.error('Failed to get recommendations', error)
      const fallbackResponse = {
        id: messages.length + 2,
        type: 'ai',
        content: 'Sorry, I could not fetch recommendations right now. Please try again in a moment.',
        recommendations: [],
        timestamp: new Date().toISOString()
      }
      setMessages(prev => [...prev, fallbackResponse])
    } finally {
      setIsTyping(false)
    }
  }

  const quickPrompts = [
    "I want to learn React",
    "Need help with Spanish",
    "Looking for a guitar teacher",
    "Want to improve my design skills"
  ]

  // Poll for new programs and surface them as AI updates
  useEffect(() => {
    let active = true

    const fetchPrograms = async () => {
      try {
        const { data } = await api.get('/programs')
        const list = data?.data || []
        const newOnes = list.filter((p) => !seenProgramsRef.current.has(p._id))

        list.forEach((p) => seenProgramsRef.current.add(p._id))

        if (active && newOnes.length) {
          setMessages((prev) => [
            ...prev,
            {
              id: Date.now(),
              type: 'ai',
              content: `New programs just landed: ${newOnes
                .map((p) => `${p.title} (${p.category || 'other'}) earning ${p.rewardHours || 10} hrs to organizers`)
                .join('; ')}. Want to check one out?`,
              timestamp: new Date().toISOString()
            }
          ])
        }
      } catch (err) {
        // avoid noisy UI; silently ignore
        console.error('Failed to fetch programs for matchmaker', err)
      }
    }

    fetchPrograms()
    const interval = setInterval(fetchPrograms, 15000)
    return () => {
      active = false
      clearInterval(interval)
    }
  }, [])

  return (
    <div className="h-[calc(100vh-8rem)] flex flex-col">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">AI Matchmaker</h1>
        <p className="text-lg text-gray-600">Find your perfect tutor with AI-powered recommendations</p>
      </div>

      {/* Chat Container */}
      <div className="flex-1 bg-white rounded-xl shadow-sm border border-gray-200 flex flex-col overflow-hidden">
        <div className="flex items-center justify-between px-6 py-3 border-b border-gray-100 bg-gray-50">
          <p className="text-sm text-gray-700">Let AI recommend you as a tutor</p>
          <label className="inline-flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
            <input
              type="checkbox"
              checked={promoteMe}
              onChange={(e) => setPromoteMe(e.target.checked)}
              className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
            />
            <span className="font-medium">Promote me</span>
          </label>
        </div>
        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {messages.map((message) => (
            <div key={message.id}>
              {message.type === 'ai' ? (
                <div className="flex gap-3 items-start">
                  <div className="w-9 h-9 bg-indigo-600 rounded-full flex items-center justify-center flex-shrink-0">
                    <Bot className="text-white" size={18} />
                  </div>
                  <div className="flex-1">
                    <div className="bg-gray-100 rounded-2xl rounded-tl-sm p-4 max-w-2xl">
                      <p className="text-gray-900">{message.content}</p>
                    </div>
                    
                    {/* Recommendations */}
                    {message.recommendations && (
                      <div className="mt-4 space-y-3">
                        {message.recommendations.map((tutor, index) => (
                          <div
                            key={index}
                            className="bg-white border-2 border-gray-200 rounded-xl p-5 hover:border-indigo-300 hover:shadow-md transition-all"
                          >
                            <div className="flex items-start gap-4">
                              <div className="text-4xl">{tutor.avatar}</div>
                              <div className="flex-1">
                                <div className="flex items-start justify-between mb-2">
                                  <div>
                                    <h4 className="font-bold text-gray-900 text-lg">{tutor.name}</h4>
                                    <p className="text-indigo-600 font-medium">{tutor.skill}</p>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <div className="px-2.5 py-1 bg-green-100 text-green-700 rounded-lg text-sm font-bold">
                                      {tutor.matchScore}%
                                    </div>
                                    <div className="flex items-center gap-1">
                                      <Star className="text-yellow-500 fill-yellow-500" size={16} />
                                      <span className="text-sm font-bold text-gray-900">{tutor.rating}</span>
                                    </div>
                                  </div>
                                </div>
                                <p className="text-gray-600 mb-3">{tutor.reason}</p>
                                <button className="px-5 py-2.5 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 transition">
                                  Book Session
                                </button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                    
                    <p className="text-xs text-gray-400 mt-2">
                      {new Date(message.timestamp).toLocaleTimeString()}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="flex gap-3 items-start justify-end">
                  <div className="flex-1 flex justify-end">
                    <div className="bg-indigo-600 text-white rounded-2xl rounded-tr-sm p-4 max-w-2xl">
                      <p>{message.content}</p>
                    </div>
                  </div>
                  <div className="w-9 h-9 bg-gray-300 rounded-full flex items-center justify-center flex-shrink-0">
                    <User className="text-gray-700" size={18} />
                  </div>
                </div>
              )}
            </div>
          ))}

          {/* Typing Indicator */}
          {isTyping && (
            <div className="flex gap-3 items-start">
              <div className="w-9 h-9 bg-indigo-600 rounded-full flex items-center justify-center">
                <Bot className="text-white" size={18} />
              </div>
              <div className="bg-gray-100 rounded-2xl rounded-tl-sm p-4">
                <div className="flex gap-1.5">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Quick Prompts */}
        {messages.length === 1 && (
          <div className="px-6 pb-4">
            <p className="text-sm font-medium text-gray-600 mb-3">Quick prompts:</p>
            <div className="grid grid-cols-2 gap-2.5">
              {quickPrompts.map((prompt, index) => (
                <button
                  key={index}
                  onClick={() => setInputValue(prompt)}
                  className="text-left p-3 bg-gray-50 border border-gray-200 rounded-lg hover:bg-gray-100 hover:border-gray-300 transition text-sm text-gray-700"
                >
                  {prompt}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Input Area */}
        <div className="border-t border-gray-200 p-4 bg-white">
          <div className="flex gap-3">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
              placeholder="Describe what you want to learn..."
              className="flex-1 px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white"
            />
            <button
              onClick={handleSendMessage}
              disabled={!inputValue.trim()}
              className="px-6 py-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Send size={20} />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
