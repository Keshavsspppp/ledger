import { Star, Clock, Filter, Search, Send } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { useLocation } from 'react-router-dom'
import api from '../api/client'

const categories = ['all', 'programming', 'languages', 'music', 'design', 'fitness']
const availabilityOptions = ['any', 'weekday', 'weekend']
const languageOptions = ['any', 'english', 'hindi']

const sortOptions = {
  rating: '-rating.average',
  reviews: '-rating.count',
  rate: 'hourlyRate'
}

export default function Marketplace() {
  const [filterCategory, setFilterCategory] = useState('all')
  const [sortBy, setSortBy] = useState('rating')
  const [tutors, setTutors] = useState([])
  const [programs, setPrograms] = useState([])
  const [creating, setCreating] = useState(false)
  const [programForm, setProgramForm] = useState({ title: '', category: 'other', description: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [availability, setAvailability] = useState('any')
  const [language, setLanguage] = useState('any')
  const [requestingTutor, setRequestingTutor] = useState(null)
  const [requestMessage, setRequestMessage] = useState('')
  const [requesting, setRequesting] = useState(false)

  const location = useLocation()
  const searchTerm = useMemo(() => new URLSearchParams(location.search).get('search') || '', [location.search])

  useEffect(() => {
    const fetchTutors = async () => {
      setLoading(true)
      setError('')
      try {
        const [tutorsRes, programsRes] = await Promise.all([
          api.get('/tutors', {
          params: {
            category: filterCategory !== 'all' ? filterCategory : undefined,
            search: searchTerm || undefined,
            available: true,
              availability: availability !== 'any' ? availability : undefined,
              language: language !== 'any' ? language : undefined,
            sortBy: sortOptions[sortBy]
          }
          }),
          api.get('/programs', {
            params: {
              category: filterCategory !== 'all' ? filterCategory : undefined
            }
          })
        ])

        const mappedTutors = (tutorsRes?.data?.data || []).map((tutor) => ({
          id: tutor._id,
          name: tutor.user?.displayName || 'Tutor',
          avatar: '👤',
          skill: tutor.expertise?.[0]?.name || 'Skill',
          rating: tutor.rating?.average?.toFixed?.(1) || '0.0',
          reviews: tutor.rating?.count || 0,
          rate: `${tutor.hourlyRate || 1} hrs`,
          expertise: tutor.expertise?.map((e) => e.name) || [],
          bio: tutor.bio || '—',
          available: tutor.availability?.isAvailable ?? true
        }))
        setTutors(mappedTutors)

        const mappedPrograms = (programsRes?.data?.data || []).map((p) => ({
          id: p._id,
          title: p.title,
          category: p.category || 'other',
          description: p.description || '—',
          organizer: p.organizer?.displayName || 'Organizer',
          participants: (p.participants || []).length,
          rewardHours: p.rewardHours || 10
        }))
        setPrograms(mappedPrograms)
      } catch (err) {
        console.error('Failed to load tutors', err)
        setError('Could not load marketplace data right now.')
      } finally {
        setLoading(false)
      }
    }

    fetchTutors()
  }, [filterCategory, sortBy, searchTerm, availability, language])

  const createProgram = async () => {
    if (!programForm.title.trim()) {
      setError('Program title is required.')
      return
    }
    setCreating(true)
    setError('')
    try {
      await api.post('/programs', {
        title: programForm.title,
        category: programForm.category,
        description: programForm.description
      })
      setProgramForm({ title: '', category: 'other', description: '' })
      // refresh programs
      const { data } = await api.get('/programs', {
        params: { category: filterCategory !== 'all' ? filterCategory : undefined }
      })
      const mappedPrograms = (data?.data || []).map((p) => ({
        id: p._id,
        title: p.title,
        category: p.category || 'other',
        description: p.description || '—',
        organizer: p.organizer?.displayName || 'Organizer',
        participants: (p.participants || []).length,
        rewardHours: p.rewardHours || 10
      }))
      setPrograms(mappedPrograms)
    } catch (err) {
      console.error('Failed to create program', err)
      setError(err?.response?.data?.message || 'Could not create program.')
    } finally {
      setCreating(false)
    }
  }

  const joinProgram = async (id) => {
    try {
      await api.post(`/programs/${id}/join`)
      // refresh programs
      const { data } = await api.get('/programs', {
        params: { category: filterCategory !== 'all' ? filterCategory : undefined }
      })
      const mappedPrograms = (data?.data || []).map((p) => ({
        id: p._id,
        title: p.title,
        category: p.category || 'other',
        description: p.description || '—',
        organizer: p.organizer?.displayName || 'Organizer',
        participants: (p.participants || []).length,
        rewardHours: p.rewardHours || 10
      }))
      setPrograms(mappedPrograms)
    } catch (err) {
      console.error('Failed to join program', err)
      setError(err?.response?.data?.message || 'Could not join program.')
    }
  }

  return (
    <div className="space-y-8">
      {/* Header + Smart search */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
        <div className="flex flex-col gap-3">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 mb-1">Marketplace</h1>
            <p className="text-lg text-gray-600">Discover talented peers and learn new skills</p>
            {searchTerm && <p className="text-sm text-gray-500 mt-1">Showing results for “{searchTerm}”</p>}
          </div>
          <div className="flex flex-col md:flex-row gap-3">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="text"
                value={searchTerm}
                onChange={() => {}}
                placeholder="Ask in natural language, e.g., ‘Need help with Java lab’"
                className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                readOnly
              />
            </div>
            <div className="flex gap-2 flex-wrap">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-sm"
              >
                <option value="rating">Highest Rated</option>
                <option value="reviews">Most Reviews</option>
                <option value="rate">Lowest Rate</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl border border-gray-200 p-4 shadow-sm flex flex-wrap gap-3 items-center">
        <div className="flex items-center gap-2 text-gray-600 font-semibold"><Filter size={16} /> Filters</div>
        <div className="flex gap-2 flex-wrap">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setFilterCategory(category)}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                filterCategory === category
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'bg-gray-50 text-gray-700 hover:bg-gray-100 border border-gray-200'
              }`}
            >
              {category.charAt(0).toUpperCase() + category.slice(1)}
            </button>
          ))}
        </div>
        <select
          value={availability}
          onChange={(e) => setAvailability(e.target.value)}
          className="px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm"
        >
          {availabilityOptions.map((a) => (<option key={a} value={a}>{a.charAt(0).toUpperCase() + a.slice(1)}</option>))}
        </select>
        <select
          value={language}
          onChange={(e) => setLanguage(e.target.value)}
          className="px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm"
        >
          {languageOptions.map((l) => (<option key={l} value={l}>{l.charAt(0).toUpperCase() + l.slice(1)}</option>))}
        </select>
      </div>

      {/* Create Program */}
      <div className="bg-white rounded-2xl p-6 border border-gray-200">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Create a Program (Earn {programForm.rewardHours || 10} hrs per join)</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <input
            type="text"
            value={programForm.title}
            onChange={(e) => setProgramForm({ ...programForm, title: e.target.value })}
            placeholder="Program title (e.g., Intro to React)"
            className="px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <select
            value={programForm.category}
            onChange={(e) => setProgramForm({ ...programForm, category: e.target.value })}
            className="px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg"
          >
            {['other', ...categories.filter(c => c !== 'all')].map((c) => (
              <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>
            ))}
          </select>
          <div className="flex gap-2">
            <input
              type="text"
              value={programForm.description}
              onChange={(e) => setProgramForm({ ...programForm, description: e.target.value })}
              placeholder="Brief description"
              className="flex-1 px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <button
              disabled={creating}
              onClick={createProgram}
              className="px-5 py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition disabled:opacity-50"
            >
              Create
            </button>
          </div>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
          {error}
        </div>
      )}

      {loading ? (
        <div className="text-center text-gray-500 py-10">Loading tutors...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {tutors.map((tutor) => (
            <div
              key={tutor.id}
              className="bg-white rounded-2xl p-6 border border-gray-200 hover:border-indigo-300 hover:shadow-lg transition-all duration-300 group"
            >
              {/* Header */}
              <div className="flex items-start gap-4 mb-4">
                <div className="text-5xl">{tutor.avatar}</div>
                <div className="flex-1">
                  <h3 className="font-bold text-lg text-gray-900 mb-1">{tutor.name}</h3>
                  <p className="text-indigo-600 font-medium text-sm">{tutor.skill}</p>
                  {tutor.available && (
                    <div className="flex items-center gap-1.5 mt-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                      <span className="text-xs text-green-600 font-medium">Available</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Stats */}
              <div className="flex items-center gap-4 mb-4 pb-4 border-b border-gray-100">
                <div className="flex items-center gap-1">
                  <Star className="text-yellow-500 fill-yellow-500" size={16} />
                  <span className="font-bold text-gray-900">{tutor.rating}</span>
                  <span className="text-gray-400 text-sm">({tutor.reviews})</span>
                </div>
                <div className="flex items-center gap-1.5 text-gray-600">
                  <Clock size={16} />
                  <span className="font-semibold text-sm">{tutor.rate}</span>
                </div>
              </div>

              {/* Bio */}
              <p className="text-gray-600 text-sm mb-4 line-clamp-3">{tutor.bio}</p>

              {/* Skills */}
              <div className="flex flex-wrap gap-2 mb-5">
                {tutor.expertise.map((skill, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-gray-50 text-gray-700 text-xs rounded-full font-medium"
                  >
                    {skill}
                  </span>
                ))}
              </div>

              {/* Action */}
              <button
                disabled={!tutor.available}
                onClick={() => setRequestingTutor(tutor)}
                className={`w-full py-3 rounded-xl font-semibold transition-all ${
                  tutor.available
                    ? 'bg-indigo-600 text-white hover:bg-indigo-700 hover:shadow-md'
                    : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                }`}
              >
                {tutor.available ? 'Request Session' : 'Unavailable'}
              </button>
            </div>
          ))}
          {/* Programs List */}
          {programs.map((p) => (
            <div key={p.id} className="bg-white rounded-2xl p-6 border border-gray-200 hover:border-indigo-300 hover:shadow-lg transition-all duration-300">
              <div className="mb-2">
                <h3 className="font-bold text-lg text-gray-900">{p.title}</h3>
                <p className="text-indigo-600 text-sm font-medium">{p.category}</p>
              </div>
              <p className="text-gray-600 text-sm mb-4 line-clamp-3">{p.description}</p>
              <div className="flex items-center justify-between mb-4">
                <span className="text-sm text-gray-500">Organizer: <span className="font-semibold text-gray-900">{p.organizer}</span></span>
                <span className="text-sm text-gray-500">Participants: <span className="font-semibold text-gray-900">{p.participants}</span></span>
              </div>
              <button
                onClick={() => joinProgram(p.id)}
                className="w-full py-3 rounded-xl font-semibold bg-green-600 text-white hover:bg-green-700 transition"
              >
                Join Program (credits {p.rewardHours} hrs to organizer)
              </button>
            </div>
          ))}

          {!tutors.length && !loading && (
            <div className="col-span-full text-center text-gray-500 py-10">No tutors found.</div>
          )}
        </div>
      )}

      {/* Request Session Modal */}
      {requestingTutor && (
        <div className="fixed inset-0 z-40 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/30" onClick={() => setRequestingTutor(null)}></div>
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg p-6 z-50">
            <h3 className="text-xl font-bold text-gray-900 mb-2">Request a session</h3>
            <p className="text-sm text-gray-600 mb-4">Describe what you need from {requestingTutor.name}.</p>
            <textarea
              value={requestMessage}
              onChange={(e) => setRequestMessage(e.target.value)}
              rows={4}
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="I need help with..."
            />
            <div className="flex justify-end gap-2 mt-4">
              <button onClick={() => setRequestingTutor(null)} className="px-4 py-2 rounded-lg border border-gray-200 text-gray-700">Cancel</button>
              <button
                disabled={requesting}
                onClick={async () => {
                  if (!requestMessage.trim()) {
                    setError('Please describe your request.')
                    return
                  }
                  try {
                    setRequesting(true)
                    await api.post('/sessions/request', {
                      tutorId: requestingTutor.id,
                      skill: requestingTutor.skill,
                      message: requestMessage
                    })
                    setRequestMessage('')
                    setRequestingTutor(null)
                    setError('')
                    alert('Request sent!')
                  } catch (err) {
                    console.error('Failed to send request', err)
                    setError(err?.response?.data?.message || 'Could not send request.')
                  } finally {
                    setRequesting(false)
                  }
                }}
                className="px-4 py-2 rounded-lg bg-indigo-600 text-white flex items-center gap-2 disabled:opacity-50"
              >
                <Send size={16} /> Send Request
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
