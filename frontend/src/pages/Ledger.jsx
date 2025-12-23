import { TrendingUp, TrendingDown, Clock, User, Download, FileText } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import api from '../api/client'

export default function Ledger() {
  const [filterType, setFilterType] = useState('all')
  const [transactions, setTransactions] = useState([])
  const [stats, setStats] = useState({ totalEarned: 0, totalSpent: 0, balance: 0, totalTransactions: 0 })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [earnForm, setEarnForm] = useState({ skill: '', amount: '' })
  const [spendForm, setSpendForm] = useState({ skill: '', amount: '' })
  const [submitting, setSubmitting] = useState(false)
  const [selected, setSelected] = useState(null)

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      setError('')
      try {
        const [txRes, statsRes] = await Promise.all([
          api.get('/transactions'),
          api.get('/transactions/stats')
        ])

        const txs = (txRes?.data?.data || []).map((t) => ({
          id: t._id,
          type: t.type,
          skill: t.skill,
          partner: t.to?.displayName || t.from?.displayName || 'Partner',
          hours: t.amount,
          date: new Date(t.createdAt).toLocaleDateString(),
          time: new Date(t.createdAt).toLocaleTimeString(),
          status: t.status,
          description: t.description || ''
        }))

        setTransactions(txs)

        setStats({
          totalEarned: statsRes?.data?.data?.earned?.total || 0,
          totalSpent: statsRes?.data?.data?.spent?.total || 0,
          balance: statsRes?.data?.data?.balance || 0,
          totalTransactions: txs.length
        })
      } catch (err) {
        console.error('Failed to load ledger data', err)
        setError('Could not load ledger data right now.')
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  const refreshData = async () => {
    try {
      const [txRes, statsRes] = await Promise.all([
        api.get('/transactions'),
        api.get('/transactions/stats')
      ])
      const txs = (txRes?.data?.data || []).map((t) => ({
        id: t._id,
        type: t.type,
        skill: t.skill,
        partner: t.to?.displayName || t.from?.displayName || 'Partner',
        hours: t.amount,
        date: new Date(t.createdAt).toLocaleDateString(),
        time: new Date(t.createdAt).toLocaleTimeString(),
        status: t.status,
        description: t.description || ''
      }))
      setTransactions(txs)
      setStats({
        totalEarned: statsRes?.data?.data?.earned?.total || 0,
        totalSpent: statsRes?.data?.data?.spent?.total || 0,
        balance: statsRes?.data?.data?.balance || 0,
        totalTransactions: txs.length
      })
    } catch (err) {
      console.error('Failed to refresh ledger data', err)
    }
  }

  const submitManual = async (type) => {
    const form = type === 'earned' ? earnForm : spendForm
    const amount = parseFloat(form.amount)
    if (!form.skill.trim() || !amount || amount <= 0) {
      setError('Please provide a valid skill and amount (hours).')
      return
    }
    setSubmitting(true)
    setError('')
    try {
      await api.post('/transactions/manual', {
        type,
        amount,
        skill: form.skill,
        description: type === 'earned' ? 'Manual earning' : 'Manual spending'
      })
      // Clear form and refresh
      if (type === 'earned') setEarnForm({ skill: '', amount: '' })
      else setSpendForm({ skill: '', amount: '' })
      await refreshData()
    } catch (err) {
      console.error('Manual transaction failed', err)
      setError(err?.response?.data?.message || 'Could not submit the transaction.')
    } finally {
      setSubmitting(false)
    }
  }

  const filteredTransactions = useMemo(() => {
    if (filterType === 'all') return transactions
    return transactions.filter((t) => t.type === filterType)
  }, [transactions, filterType])

  const exportPdf = async () => {
    try {
      await api.get('/transactions/export')
      alert('Export coming soon (stub).')
    } catch (err) {
      alert('Could not export right now.')
    }
  }

  return (
    <div className="space-y-8">
      {/* Header and balance hero */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Ledger</h1>
          <p className="text-lg text-gray-600">Track all your skill exchange transactions</p>
        </div>
        <div className="flex gap-2">
          <button onClick={exportPdf} className="px-5 py-2.5 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition flex items-center gap-2 font-medium">
            <FileText size={18} />
            Proof of Work
          </button>
          <button className="px-5 py-2.5 bg-gray-100 text-gray-800 rounded-xl hover:bg-gray-200 transition flex items-center gap-2 font-medium">
            <Download size={18} />
            Export CSV
          </button>
        </div>
      </div>

      <div className="bg-white border-2 border-gray-200 rounded-2xl p-6 flex items-center justify-between flex-wrap gap-4">
        <div>
          <p className="text-sm text-gray-500">Time Balance</p>
          <p className="text-4xl font-bold text-indigo-700">{stats.balance} hrs</p>
          <p className="text-xs text-gray-500">Earn by teaching, spend by learning</p>
        </div>
        <div className="flex gap-3">
          <div className="bg-green-50 text-green-700 px-4 py-3 rounded-xl border border-green-100">
            <p className="text-xs uppercase tracking-wide">Earned</p>
            <p className="text-xl font-bold">{stats.totalEarned} hrs</p>
          </div>
          <div className="bg-red-50 text-red-700 px-4 py-3 rounded-xl border border-red-100">
            <p className="text-xs uppercase tracking-wide">Spent</p>
            <p className="text-xl font-bold">{stats.totalSpent} hrs</p>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
        <div className="bg-white p-6 rounded-2xl border-2 border-gray-200">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
              <TrendingUp className="text-green-600" size={20} />
            </div>
            <p className="text-gray-600 font-medium">Earned</p>
          </div>
          <p className="text-3xl font-bold text-gray-900">{stats.totalEarned}</p>
          <p className="text-sm text-gray-500 mt-1">hours</p>
        </div>

        <div className="bg-white p-6 rounded-2xl border-2 border-gray-200">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center">
              <TrendingDown className="text-red-600" size={20} />
            </div>
            <p className="text-gray-600 font-medium">Spent</p>
          </div>
          <p className="text-3xl font-bold text-gray-900">{stats.totalSpent}</p>
          <p className="text-sm text-gray-500 mt-1">hours</p>
        </div>

        <div className="bg-white p-6 rounded-2xl border-2 border-indigo-200 bg-gradient-to-br from-indigo-50 to-white">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center">
              <Clock className="text-white" size={20} />
            </div>
            <p className="text-gray-700 font-medium">Balance</p>
          </div>
          <p className="text-3xl font-bold text-indigo-600">{stats.balance}</p>
          <p className="text-sm text-gray-600 mt-1">hours</p>
        </div>

        <div className="bg-white p-6 rounded-2xl border-2 border-gray-200">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center">
              <User className="text-purple-600" size={20} />
            </div>
            <p className="text-gray-600 font-medium">Transactions</p>
          </div>
          <p className="text-3xl font-bold text-gray-900">{stats.totalTransactions}</p>
          <p className="text-sm text-gray-500 mt-1">all time</p>
        </div>
      </div>

      {/* Manual Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div className="bg-white p-6 rounded-2xl border-2 border-gray-200">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Earn Hours</h3>
          <div className="space-y-3">
            <input
              type="text"
              value={earnForm.skill}
              onChange={(e) => setEarnForm({ ...earnForm, skill: e.target.value })}
              placeholder="Skill (e.g., Teaching React)"
              className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <input
              type="number"
              step="0.5"
              min="0.5"
              value={earnForm.amount}
              onChange={(e) => setEarnForm({ ...earnForm, amount: e.target.value })}
              placeholder="Hours (e.g., 1.5)"
              className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <button
              disabled={submitting}
              onClick={() => submitManual('earned')}
              className="px-5 py-2.5 bg-green-600 text-white rounded-xl hover:bg-green-700 transition disabled:opacity-50"
            >
              Add Earned Hours
            </button>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border-2 border-gray-200">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Spend Hours</h3>
          <div className="space-y-3">
            <input
              type="text"
              value={spendForm.skill}
              onChange={(e) => setSpendForm({ ...spendForm, skill: e.target.value })}
              placeholder="Skill (e.g., Learning Spanish)"
              className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <input
              type="number"
              step="0.5"
              min="0.5"
              value={spendForm.amount}
              onChange={(e) => setSpendForm({ ...spendForm, amount: e.target.value })}
              placeholder="Hours (e.g., 1.0)"
              className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <button
              disabled={submitting}
              onClick={() => submitManual('spent')}
              className="px-5 py-2.5 bg-red-600 text-white rounded-xl hover:bg-red-700 transition disabled:opacity-50"
            >
              Add Spent Hours
            </button>
          </div>
          {error && (
            <p className="text-sm text-red-600 mt-3">{error}</p>
          )}
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-2">
        {['all', 'earned', 'spent', 'pending'].map((type) => (
          <button
            key={type}
            onClick={() => setFilterType(type)}
            className={`px-5 py-2.5 rounded-xl font-medium transition-all ${
              filterType === type
                ? 'bg-indigo-600 text-white shadow-md'
                : 'bg-white text-gray-700 border-2 border-gray-200 hover:border-gray-300'
            }`}
          >
            {type.charAt(0).toUpperCase() + type.slice(1)}
          </button>
        ))}
      </div>

      {/* Transactions Table */}
      <div className="bg-white rounded-2xl border-2 border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b-2 border-gray-200">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Transaction ID</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Type</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Skill</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Partner</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Hours</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Date & Time</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Status</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredTransactions.map((transaction) => (
                <tr key={transaction.id} className="hover:bg-gray-50/50 transition cursor-pointer" onClick={() => setSelected(transaction)}>
                  <td className="px-6 py-4">
                    <span className="font-mono text-sm text-gray-900">{transaction.id}</span>
                  </td>
                  <td className="px-6 py-4">
                    {transaction.type === 'earned' && (
                      <span className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-semibold">
                        <TrendingUp size={14} />
                        Earned
                      </span>
                    )}
                    {transaction.type === 'spent' && (
                      <span className="inline-flex items-center gap-1 px-3 py-1 bg-red-100 text-red-700 rounded-full text-xs font-semibold">
                        <TrendingDown size={14} />
                        Spent
                      </span>
                    )}
                    {transaction.type === 'pending' && (
                      <span className="inline-flex items-center gap-1 px-3 py-1 bg-yellow-100 text-yellow-700 rounded-full text-xs font-semibold">
                        <Clock size={14} />
                        Pending
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <div>
                      <p className="font-medium text-gray-900">{transaction.skill}</p>
                      <p className="text-xs text-gray-500">{transaction.description}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-full flex items-center justify-center">
                        <User size={14} className="text-white" />
                      </div>
                      <span className="text-gray-900">{transaction.partner}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`font-bold ${transaction.type === 'earned' ? 'text-green-600' : transaction.type === 'spent' ? 'text-red-600' : 'text-gray-600'}`}>
                      {transaction.type === 'earned' ? '+' : transaction.type === 'spent' ? '-' : ''}{transaction.hours} hrs
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div>
                      <p className="text-sm text-gray-900">{transaction.date}</p>
                      <p className="text-xs text-gray-500">{transaction.time}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      transaction.status === 'completed' 
                        ? 'bg-blue-100 text-blue-700' 
                        : 'bg-yellow-100 text-yellow-700'
                    }`}>
                      {transaction.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <button className="text-indigo-600 hover:text-indigo-700 font-medium text-sm">
                      View Details
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Audit Modal */}
      {selected && (
        <div className="fixed inset-0 z-40 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/30" onClick={() => setSelected(null)}></div>
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl p-6 z-50">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-gray-900">Transaction Details</h3>
              <button onClick={() => setSelected(null)} className="text-gray-500 hover:text-gray-700">Close</button>
            </div>
            <div className="grid grid-cols-2 gap-4 text-sm text-gray-700">
              <div><span className="font-semibold">ID:</span> {selected.id}</div>
              <div><span className="font-semibold">Type:</span> {selected.type}</div>
              <div><span className="font-semibold">Skill:</span> {selected.skill}</div>
              <div><span className="font-semibold">Partner:</span> {selected.partner}</div>
              <div><span className="font-semibold">Hours:</span> {selected.hours}</div>
              <div><span className="font-semibold">Status:</span> {selected.status}</div>
              <div><span className="font-semibold">Date:</span> {selected.date} {selected.time}</div>
              <div><span className="font-semibold">Description:</span> {selected.description || '—'}</div>
            </div>
            <div className="mt-4 text-sm text-indigo-600">
              Knowledge Capsule and Meet link integrations can be surfaced here.
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
