'use client'

import { useState, useEffect, useRef } from 'react'
import { MessageSquare, User, Send, Loader2, Search, CheckCheck, RefreshCw, Bot } from 'lucide-react'

export default function AdminChatPage() {
  const [sessions, setSessions] = useState<any[]>([])
  const [selectedSessionId, setSelectedSessionId] = useState<string | null>(null)
  const [messages, setMessages] = useState<any[]>([])
  const [replyInput, setReplyInput] = useState('')
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const [search, setSearch] = useState('')

  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Fetch all chat sessions
  const fetchSessions = async () => {
    try {
      const res = await fetch('/api/admin/chat')
      if (res.ok) {
        const data = await res.json()
        setSessions(data.sessions || [])
        if (!selectedSessionId && data.sessions?.length > 0) {
          setSelectedSessionId(data.sessions[0].id)
          setMessages(data.sessions[0].messages || [])
        }
      }
    } catch (error) {
      console.error('Fetch admin chat sessions error', error)
    } finally {
      setLoading(false)
    }
  }

  // Poll chat sessions every 3 seconds
  useEffect(() => {
    fetchSessions()
    const interval = setInterval(fetchSessions, 3000)
    return () => clearInterval(interval)
  }, [selectedSessionId])

  // Sync active session messages
  useEffect(() => {
    if (!selectedSessionId) return
    const active = sessions.find((s) => s.id === selectedSessionId)
    if (active) {
      setMessages(active.messages || [])
    }
  }, [sessions, selectedSessionId])

  // Auto scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSendReply = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!replyInput.trim() || !selectedSessionId || sending) return

    const text = replyInput.trim()
    setReplyInput('')
    setSending(true)

    try {
      await fetch('/api/chat/message', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId: selectedSessionId,
          sender: 'ADMIN',
          senderName: 'CS Raxie Admin',
          message: text,
        }),
      })
      fetchSessions()
    } catch (error) {
      console.error('Send reply error', error)
    } finally {
      setSending(false)
    }
  }

  const selectedSession = sessions.find((s) => s.id === selectedSessionId)
  const filteredSessions = sessions.filter(
    (s) =>
      s.customerName?.toLowerCase().includes(search.toLowerCase()) ||
      s.customerEmail?.toLowerCase().includes(search.toLowerCase()) ||
      s.customerPhone?.includes(search)
  )

  return (
    <div className="h-[calc(100vh-100px)] flex flex-col space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-serif text-2xl font-bold text-slate-800 dark:text-foreground flex items-center gap-2">
            <MessageSquare className="w-6 h-6 text-amber-500" /> Live Chat CS Center
          </h1>
          <p className="text-sm text-slate-500">Melayani pertanyaan pelanggan & pengunjung store secara real-time</p>
        </div>
        <button
          onClick={fetchSessions}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg border border-slate-200 transition-colors"
        >
          <RefreshCw className="w-3.5 h-3.5" /> Refresh
        </button>
      </div>

      {/* Main Container */}
      <div className="flex-1 bg-white dark:bg-card border border-slate-200 dark:border-border rounded-2xl shadow-sm overflow-hidden flex flex-col md:flex-row">
        {/* Left Sessions List */}
        <div className="w-full md:w-80 border-r border-slate-200 dark:border-border flex flex-col bg-slate-50/50 dark:bg-muted/30">
          <div className="p-3 border-b border-slate-200 dark:border-border">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Cari nama / email..."
                className="w-full pl-9 pr-3 py-2 text-xs bg-white dark:bg-muted border border-slate-200 dark:border-border rounded-lg focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto divide-y divide-slate-100 dark:divide-border">
            {loading ? (
              <div className="flex justify-center items-center py-10">
                <Loader2 className="w-6 h-6 animate-spin text-amber-500" />
              </div>
            ) : filteredSessions.length === 0 ? (
              <div className="text-center py-12 px-4 text-slate-400 text-xs">
                Belum ada percakapan live chat.
              </div>
            ) : (
              filteredSessions.map((s) => {
                const isActive = s.id === selectedSessionId
                const lastMsg = s.messages?.[s.messages.length - 1]?.message || 'Tidak ada pesan'
                return (
                  <button
                    key={s.id}
                    onClick={() => setSelectedSessionId(s.id)}
                    className={`w-full p-3 text-left flex items-start gap-3 transition-colors ${
                      isActive
                        ? 'bg-amber-500/10 border-l-4 border-amber-500'
                        : 'hover:bg-slate-100 dark:hover:bg-muted/50'
                    }`}
                  >
                    <div className="w-9 h-9 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-slate-700 dark:text-slate-200 font-bold text-xs shrink-0 mt-0.5">
                      {s.customerName?.[0]?.toUpperCase() ?? 'U'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className="font-semibold text-xs text-slate-800 dark:text-foreground truncate">{s.customerName}</p>
                        {s.unreadAdmin > 0 && (
                          <span className="bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                            {s.unreadAdmin}
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-500 truncate mt-0.5">{lastMsg}</p>
                      <p className="text-[9px] text-slate-400 mt-1">
                        {new Date(s.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </button>
                )
              })
            )}
          </div>
        </div>

        {/* Right Active Chat Window */}
        {selectedSession ? (
          <div className="flex-1 flex flex-col bg-white dark:bg-card">
            {/* Header */}
            <div className="p-4 border-b border-slate-200 dark:border-border flex items-center justify-between bg-slate-50/50 dark:bg-muted/20">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-slate-800 text-amber-400 flex items-center justify-center font-bold text-sm">
                  {selectedSession.customerName?.[0]?.toUpperCase() ?? 'U'}
                </div>
                <div>
                  <h3 className="font-bold text-sm text-slate-800 dark:text-foreground">{selectedSession.customerName}</h3>
                  <p className="text-xs text-slate-500">
                    {selectedSession.customerPhone || selectedSession.customerEmail || 'Pengunjung Store'}
                  </p>
                </div>
              </div>
              <span className="text-[10px] font-bold uppercase tracking-wider bg-emerald-100 text-emerald-700 px-2.5 py-1 rounded-full border border-emerald-200">
                Active Session
              </span>
            </div>

            {/* Messages Body */}
            <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-slate-50/30 dark:bg-muted/10">
              {messages.map((msg) => {
                const isAdmin = msg.sender === 'ADMIN'
                return (
                  <div
                    key={msg.id}
                    className={`flex flex-col ${isAdmin ? 'items-end' : 'items-start'}`}
                  >
                    <span className="text-[10px] text-slate-400 mb-1 px-1 font-medium">{msg.senderName}</span>
                    <div
                      className={`max-w-[75%] px-4 py-2.5 rounded-2xl text-xs leading-relaxed shadow-sm ${
                        isAdmin
                          ? 'bg-slate-900 text-white rounded-tr-none'
                          : 'bg-amber-100 text-slate-900 border border-amber-200 rounded-tl-none font-medium'
                      }`}
                    >
                      {msg.message}
                    </div>
                    <span className="text-[9px] text-slate-400 mt-1 px-1 flex items-center gap-1">
                      {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      {isAdmin && <CheckCheck className="w-3.5 h-3.5 text-blue-500" />}
                    </span>
                  </div>
                )
              })}
              <div ref={messagesEndRef} />
            </div>

            {/* Reply Input Box */}
            <form onSubmit={handleSendReply} className="p-3 border-t border-slate-200 dark:border-border flex items-center gap-2 bg-white dark:bg-card">
              <input
                type="text"
                value={replyInput}
                onChange={(e) => setReplyInput(e.target.value)}
                placeholder="Balas pesan pelanggan..."
                className="flex-1 px-4 py-2.5 bg-slate-50 dark:bg-muted border border-slate-200 dark:border-border rounded-xl text-xs focus:outline-none focus:border-amber-500 transition-colors"
              />
              <button
                type="submit"
                disabled={!replyInput.trim() || sending}
                className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white text-xs font-bold rounded-xl flex items-center gap-2 transition-all shadow"
              >
                {sending ? <Loader2 className="w-4 h-4 animate-spin text-amber-400" /> : <Send className="w-4 h-4 text-amber-400" />} Balas
              </button>
            </form>
          </div>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-slate-400 text-sm p-8">
            <MessageSquare className="w-12 h-12 text-slate-300 mb-3" />
            <p>Pilih percakapan di sebelah kiri untuk mulai membalas chat pelanggan.</p>
          </div>
        )}
      </div>
    </div>
  )
}
