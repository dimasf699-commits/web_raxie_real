'use client'

import { useState, useEffect, useRef } from 'react'
import {
  MessageSquare,
  User,
  Send,
  Loader2,
  Search,
  Check,
  CheckCheck,
  RefreshCw,
  Paperclip,
  Image as ImageIcon,
  FileText,
  Lock,
  Unlock,
  Printer,
  Circle,
  Download,
  X,
  ChevronDown
} from 'lucide-react'

export default function AdminChatPage() {
  const [conversations, setConversations] = useState<any[]>([])
  const [selectedConvId, setSelectedConvId] = useState<string | null>(null)
  const [messages, setMessages] = useState<any[]>([])
  const [replyInput, setReplyInput] = useState('')
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState<'all' | 'unread' | 'today'>('all')
  const [statusFilter, setStatusFilter] = useState<string>('ALL')

  // Lightbox modal for full size image preview
  const [lightboxImage, setLightboxImage] = useState<string | null>(null)

  const messagesEndRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Fetch all chat conversations
  const fetchConversations = async () => {
    try {
      const res = await fetch(`/api/chat/conversations?search=${encodeURIComponent(search)}&filter=${filter}&status=${statusFilter}`)
      if (res.ok) {
        const data = await res.json()
        const fetched = data.conversations || []
        setConversations(fetched)
        if (!selectedConvId && fetched.length > 0) {
          setSelectedConvId(fetched[0].id)
          setMessages(fetched[0].messages || [])
        }
      }
    } catch (error) {
      console.error('Fetch admin chat error', error)
    } finally {
      setLoading(false)
    }
  }

  // Poll conversations every 2.5 seconds
  useEffect(() => {
    fetchConversations()
    const interval = setInterval(fetchConversations, 2500)
    return () => clearInterval(interval)
  }, [search, filter, statusFilter, selectedConvId])

  // Sync active conversation messages & mark as read
  useEffect(() => {
    if (!selectedConvId) return
    const active = conversations.find((c) => c.id === selectedConvId)
    if (active) {
      setMessages(active.messages || [])
      if (active.unreadAdmin > 0) {
        markAsRead(selectedConvId)
      }
    }
  }, [conversations, selectedConvId])

  // Auto scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const markAsRead = async (id: string) => {
    try {
      await fetch('/api/chat/read', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ conversationId: id, role: 'ADMIN' }),
      })
    } catch (e) {
      console.error(e)
    }
  }

  const handleSendReply = async (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    if (!replyInput.trim() || !selectedConvId || sending) return

    const text = replyInput.trim()
    setReplyInput('')
    setSending(true)

    try {
      await fetch('/api/chat/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          conversationId: selectedConvId,
          sender: 'ADMIN',
          senderName: 'CS Raxie Official',
          message: text,
        }),
      })
      fetchConversations()
    } catch (error) {
      console.error('Send reply error', error)
    } finally {
      setSending(false)
    }
  }

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !selectedConvId) return

    if (file.size > 10 * 1024 * 1024) {
      alert('Ukuran file melebihi batas maksimal 10 MB.')
      if (fileInputRef.current) fileInputRef.current.value = ''
      return
    }

    setUploading(true)
    const formData = new FormData()
    formData.append('file', file)

    try {
      const uploadRes = await fetch('/api/chat/upload', {
        method: 'POST',
        body: formData,
      })
      const uploadData = await uploadRes.json()

      if (!uploadRes.ok) {
        alert(uploadData.error || 'Gagal mengunggah file')
        return
      }

      await fetch('/api/chat/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          conversationId: selectedConvId,
          sender: 'ADMIN',
          senderName: 'CS Raxie Official',
          message: uploadData.fileType === 'IMAGE' ? '[Gambar]' : `[File: ${uploadData.fileName}]`,
          attachments: [
            {
              url: uploadData.url,
              fileName: uploadData.fileName,
              fileType: uploadData.fileType,
              mimeType: uploadData.mimeType,
              fileSize: uploadData.fileSize,
            },
          ],
        }),
      })
      fetchConversations()
    } catch (error) {
      console.error('Admin file upload error', error)
      alert('Gagal mengunggah file')
    } finally {
      setUploading(false)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  const handleStatusChange = async (newStatus: string) => {
    if (!selectedConvId) return
    try {
      await fetch(`/api/chat/conversations/${selectedConvId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      })
      fetchConversations()
    } catch (e) {
      console.error(e)
    }
  }

  const handlePrintExport = () => {
    window.print()
  }

  const selectedConv = conversations.find((c) => c.id === selectedConvId)

  return (
    <div className="h-[calc(100vh-100px)] flex flex-col space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-serif text-2xl font-bold text-slate-800 dark:text-foreground flex items-center gap-2">
            <MessageSquare className="w-6 h-6 text-amber-500" /> Customer Support Center
          </h1>
          <p className="text-sm text-slate-500">Kelola obrolan pelanggan real-time, status percakapan, dan pengiriman gambar</p>
        </div>
        <button
          onClick={fetchConversations}
          className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-700 bg-white dark:bg-card border border-slate-200 dark:border-border hover:bg-slate-50 rounded-xl transition-colors shadow-sm"
        >
          <RefreshCw className="w-3.5 h-3.5" /> Refresh Data
        </button>
      </div>

      {/* Main Split Layout */}
      <div className="flex-1 bg-white dark:bg-card border border-slate-200 dark:border-border rounded-2xl shadow-sm overflow-hidden flex flex-col md:flex-row">
        {/* Kolom Kiri - List Customer Conversations */}
        <div className="w-full md:w-80 border-r border-slate-200 dark:border-border flex flex-col bg-slate-50/50 dark:bg-muted/20">
          {/* Search & Status Filters */}
          <div className="p-3 border-b border-slate-200 dark:border-border space-y-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Cari nama / WA / email..."
                className="w-full pl-9 pr-3 py-2 text-xs bg-white dark:bg-muted border border-slate-200 dark:border-border rounded-xl focus:outline-none focus:border-amber-500"
              />
            </div>

            {/* Tabs */}
            <div className="flex items-center justify-between gap-1 text-[11px] font-semibold text-slate-600 dark:text-slate-400 pt-1">
              <button
                onClick={() => setFilter('all')}
                className={`flex-1 py-1 text-center rounded-lg transition-colors ${filter === 'all' ? 'bg-amber-500 text-slate-950 font-bold' : 'hover:bg-slate-200 dark:hover:bg-muted'}`}
              >
                Semua
              </button>
              <button
                onClick={() => setFilter('unread')}
                className={`flex-1 py-1 text-center rounded-lg transition-colors ${filter === 'unread' ? 'bg-amber-500 text-slate-950 font-bold' : 'hover:bg-slate-200 dark:hover:bg-muted'}`}
              >
                Unread
              </button>
              <button
                onClick={() => setFilter('today')}
                className={`flex-1 py-1 text-center rounded-lg transition-colors ${filter === 'today' ? 'bg-amber-500 text-slate-950 font-bold' : 'hover:bg-slate-200 dark:hover:bg-muted'}`}
              >
                Hari Ini
              </button>
            </div>
          </div>

          {/* List Item */}
          <div className="flex-1 overflow-y-auto divide-y divide-slate-100 dark:divide-border">
            {loading ? (
              <div className="flex justify-center items-center py-10">
                <Loader2 className="w-6 h-6 animate-spin text-amber-500" />
              </div>
            ) : conversations.length === 0 ? (
              <div className="text-center py-12 px-4 text-slate-400 text-xs">
                Belum ada percakapan live chat.
              </div>
            ) : (
              conversations.map((c) => {
                const isActive = c.id === selectedConvId
                const lastMsgObj = c.messages?.[c.messages.length - 1]
                const lastMsg = lastMsgObj?.message || 'Tidak ada pesan'
                return (
                  <button
                    key={c.id}
                    onClick={() => setSelectedConvId(c.id)}
                    className={`w-full p-3 text-left flex items-start gap-3 transition-colors ${
                      isActive
                        ? 'bg-amber-500/10 border-l-4 border-amber-500'
                        : 'hover:bg-slate-100 dark:hover:bg-muted/50'
                    }`}
                  >
                    <div className="relative">
                      <div className="w-9 h-9 rounded-full bg-slate-900 text-amber-400 flex items-center justify-center font-bold text-xs shrink-0">
                        {c.customerName?.[0]?.toUpperCase() ?? 'U'}
                      </div>
                      <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 rounded-full border border-white"></span>
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className="font-semibold text-xs text-slate-800 dark:text-foreground truncate">{c.customerName}</p>
                        {c.unreadAdmin > 0 && (
                          <span className="bg-red-500 text-white text-[10px] font-extrabold px-1.5 py-0.5 rounded-full">
                            {c.unreadAdmin}
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-500 truncate mt-0.5">{lastMsg}</p>
                      <div className="flex items-center justify-between mt-1">
                        <span className="text-[9px] text-slate-400">
                          {new Date(c.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                        <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${
                          c.status === 'Closed' ? 'bg-slate-200 text-slate-600' :
                          c.status === 'Resolved' ? 'bg-emerald-100 text-emerald-700' :
                          c.status === 'Customer Reply' ? 'bg-blue-100 text-blue-700' :
                          c.status === 'Admin Reply' ? 'bg-amber-100 text-amber-800' :
                          'bg-amber-500/20 text-amber-700'
                        }`}>
                          {c.status}
                        </span>
                      </div>
                    </div>
                  </button>
                )
              })
            )}
          </div>
        </div>

        {/* Kolom Kanan - Percakapan & Kontrol Admin */}
        {selectedConv ? (
          <div className="flex-1 flex flex-col bg-white dark:bg-card">
            {/* Customer Header & Controls */}
            <div className="p-3.5 border-b border-slate-200 dark:border-border flex items-center justify-between bg-slate-50/50 dark:bg-muted/20">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-slate-900 text-amber-400 flex items-center justify-center font-bold text-sm">
                  {selectedConv.customerName?.[0]?.toUpperCase() ?? 'U'}
                </div>
                <div>
                  <h3 className="font-bold text-sm text-slate-800 dark:text-foreground flex items-center gap-2">
                    {selectedConv.customerName}
                    <span className="text-[10px] font-bold text-emerald-600 bg-emerald-100 px-2 py-0.5 rounded-full flex items-center gap-1">
                      <Circle className="w-2 h-2 fill-emerald-500" /> Online
                    </span>
                  </h3>
                  <p className="text-xs text-slate-500">
                    {selectedConv.customerPhone ? `WA: ${selectedConv.customerPhone}` : ''} {selectedConv.customerEmail ? `| Email: ${selectedConv.customerEmail}` : ''} {!selectedConv.customerPhone && !selectedConv.customerEmail && 'Pengunjung Website (Guest Session)'}
                  </p>
                </div>
              </div>

              {/* Status Selector & Print */}
              <div className="flex items-center gap-2">
                <button
                  onClick={handlePrintExport}
                  className="px-3 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-muted hover:bg-slate-200 rounded-lg flex items-center gap-1.5 transition-colors"
                  title="Cetak / Export Chat ke PDF"
                >
                  <Printer className="w-3.5 h-3.5" /> Export PDF
                </button>

                {/* Status Dropdown */}
                <div className="relative">
                  <select
                    value={selectedConv.status}
                    onChange={(e) => handleStatusChange(e.target.value)}
                    className="text-xs font-bold px-3 py-1.5 rounded-lg border border-slate-300 dark:border-border bg-white dark:bg-muted text-slate-800 dark:text-foreground focus:outline-none focus:border-amber-500 cursor-pointer"
                  >
                    <option value="Waiting">Waiting</option>
                    <option value="Customer Reply">Customer Reply</option>
                    <option value="Admin Reply">Admin Reply</option>
                    <option value="Resolved">Resolved</option>
                    <option value="Closed">Closed</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Chat Messages Body */}
            <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-slate-50/40 dark:bg-muted/10">
              {messages.map((msg) => {
                const isAdmin = msg.sender === 'ADMIN'
                const isRead = msg.isRead || msg.status === 'Read'
                return (
                  <div key={msg.id} className={`flex flex-col ${isAdmin ? 'items-end' : 'items-start'}`}>
                    <span className="text-[10px] text-slate-400 mb-1 px-1 font-medium">{msg.senderName}</span>
                    <div
                      className={`max-w-[75%] p-3.5 rounded-2xl text-xs leading-relaxed shadow-sm ${
                        isAdmin
                          ? 'bg-slate-900 text-white rounded-tr-none'
                          : 'bg-amber-100 text-slate-900 border border-amber-200 rounded-tl-none font-medium'
                      }`}
                    >
                      {/* Attachments */}
                      {msg.attachments && msg.attachments.length > 0 && (
                        <div className="mb-2 space-y-2">
                          {msg.attachments.map((att: any) => (
                            <div key={att.id}>
                              {att.fileType === 'IMAGE' ? (
                                <button
                                  type="button"
                                  onClick={() => setLightboxImage(att.fileUrl)}
                                  className="block rounded-xl overflow-hidden border border-black/10 text-left"
                                >
                                  <img src={att.fileUrl} alt="Attachment" className="max-h-56 object-cover w-full hover:scale-105 transition-transform" />
                                </button>
                              ) : (
                                <a
                                  href={att.fileUrl}
                                  target="_blank"
                                  download
                                  className="flex items-center gap-2 p-2 bg-black/10 rounded-lg text-[11px] hover:underline"
                                >
                                  <FileText className="w-4 h-4 shrink-0 text-amber-600" />
                                  <span className="truncate flex-1 font-semibold">{att.fileName || 'Dokumen PDF'}</span>
                                  <Download className="w-3.5 h-3.5 shrink-0" />
                                </a>
                              )}
                            </div>
                          ))}
                        </div>
                      )}

                      {msg.message && <p className="whitespace-pre-wrap">{msg.message}</p>}
                    </div>

                    <span className="text-[9px] text-slate-400 mt-1 px-1 flex items-center gap-1">
                      {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      {isAdmin && (
                        isRead ? <CheckCheck className="w-3.5 h-3.5 text-blue-500" title="Dibaca" /> : <Check className="w-3.5 h-3.5 text-slate-400" title="Terkirim" />
                      )}
                    </span>
                  </div>
                )
              })}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Bar */}
            <form onSubmit={handleSendReply} className="p-3 border-t border-slate-200 dark:border-border flex items-center gap-2 bg-white dark:bg-card">
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileUpload}
                accept="image/*,application/pdf"
                className="hidden"
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                className="p-2.5 text-slate-500 hover:text-amber-500 hover:bg-slate-100 dark:hover:bg-muted rounded-xl transition-colors shrink-0"
                title="Unggah Gambar / PDF (Maks 10MB)"
              >
                {uploading ? <Loader2 className="w-4 h-4 animate-spin text-amber-500" /> : <Paperclip className="w-4 h-4" />}
              </button>

              <input
                type="text"
                value={replyInput}
                onChange={(e) => setReplyInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault()
                    handleSendReply(e)
                  }
                }}
                placeholder="Balas pesan pelanggan... (Enter untuk kirim, Shift+Enter baris baru)"
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
            <p>Pilih percakapan di sebelah kiri untuk melayani live chat pelanggan.</p>
          </div>
        )}
      </div>

      {/* Lightbox Modal for Full Size Image */}
      {lightboxImage && (
        <div
          onClick={() => setLightboxImage(null)}
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in"
        >
          <div className="relative max-w-4xl max-h-[90vh] overflow-hidden rounded-2xl bg-black">
            <button
              onClick={() => setLightboxImage(null)}
              className="absolute top-3 right-3 p-2 bg-black/60 hover:bg-black text-white rounded-full transition-colors z-10"
            >
              <X className="w-5 h-5" />
            </button>
            <img src={lightboxImage} alt="Full Size" className="max-h-[85vh] w-auto object-contain mx-auto" />
          </div>
        </div>
      )}
    </div>
  )
}
