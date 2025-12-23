import { useEffect, useState } from 'react'
import { Users, Clock, Award, Sparkles } from 'lucide-react'
import api from '../api/client'

export default function Programs() {
  const [programs, setPrograms] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    const fetchPrograms = async () => {
      setLoading(true)
      setError('')
      try {
        const { data } = await api.get('/programs/joined')
        setPrograms(data?.data || [])
      } catch (err) {
        console.error('Failed to load programs', err)
        setError('Could not load your programs right now.')
      } finally {
        setLoading(false)
      }
    }

    fetchPrograms()
  }, [])

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold text-gray-900 mb-1">My Programs</h1>
          <p className="text-lg text-gray-600">See programs you organize or joined.</p>
        </div>
      </div>

      {error && (
        <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">{error}</div>
      )}

      {loading ? (
        <div className="text-gray-500">Loading programs...</div>
      ) : programs.length === 0 ? (
        <div className="text-gray-500">You have not joined any programs yet.</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {programs.map((p) => (
            <div key={p._id} className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm hover:shadow-md transition">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="text-lg font-bold text-gray-900">{p.title}</h3>
                  <p className="text-sm text-indigo-600 font-medium capitalize">{p.category || 'other'}</p>
                </div>
                <div className={`px-3 py-1 rounded-full text-xs font-semibold ${p.currentUserRole === 'organizer' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'}`}>
                  {p.currentUserRole === 'organizer' ? 'Organizer' : 'Participant'}
                </div>
              </div>

              <p className="text-sm text-gray-600 mb-4 line-clamp-3">{p.description || 'No description provided.'}</p>

              <div className="space-y-2 text-sm text-gray-700">
                <div className="flex items-center gap-2">
                  <Sparkles size={16} className="text-indigo-600" />
                  <span className="font-semibold text-gray-900">Organizer:</span>
                  <span>{p.organizer?.displayName || 'Organizer'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Users size={16} className="text-green-600" />
                  <span className="font-semibold text-gray-900">Participants:</span>
                  <span>{p.participants?.length || 0}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Award size={16} className="text-yellow-500" />
                  <span className="font-semibold text-gray-900">Organizer reward:</span>
                  <span>{p.rewardHours || 10} hrs</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock size={16} className="text-gray-500" />
                  <span className="font-semibold text-gray-900">Created:</span>
                  <span>{new Date(p.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
