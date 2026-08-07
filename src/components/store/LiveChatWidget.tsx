'use client'

import React, { useState, useEffect, useRef } from 'react'
import { useSession } from 'next-auth/react'
import {
  MessageSquare,
  X,
  Send,
  Paperclip,
  Image as ImageIcon,
  FileText,
  Loader2,
  Minimize2,
  Check,
  CheckCheck,
  Bot,
  Circle,
  Download,
  User,
  Mail,
  RotateCcw
} from 'lucide-react'

export function LiveChatWidget() {
  const { data: session } = useSession()
  const [isOpen, setIsOpen] = useState(false)
  const [sessionId, setSessionId] = useState<string | null>(null)
  const [messages, setMessages] = useState<any[]>([])
  const [inputMessage, setInputMessage] = useState('')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [isInitialized, setIsInitialized] = useState(false)
  const [sending, setSending] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [unreadCount, setUnreadCount] = useState(0)
  const [isTypingAdmin, setIsTypingAdmin] = useState(false)

  const messagesEndRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Initialize session from localStorage or session
  useEffect(() => {
    let guestId = localStorage.getItem('raxie_guest_uuid')
    if (!guestId) {
      guestId = `guest_${Math.random().toString(36).substring(2, 9)}`
      localStorage.setItem('raxie_guest_uuid', guestId)
    }

    if (session?.user) {
      if (session.user.name) setName(session.user.name)
      if (session.user.email) setEmail(session.user.email)
    }

    const storedSessionId = localStorage.getItem('raxie_chat_session_id')
    if (storedSessionId) {
      setSessionId(storedSessionId)
      fetchSession(storedSessionId)
    }
  }, [session])

  // Auto-poll messages every 2.5 seconds
  useEffect(() => {
    if (!sessionId || !isInitialized) return
    const interval = setInterval(() => {
      fetchSession(sessionId)
    }, 2500)
    return () => clearInterval(interval)
  }, [sessionId, isInitialized, isOpen])

  // Auto scroll
  useEffect(() => {
    if (isOpen && isInitialized) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }
  }, [messages, isOpen, isInitialized])

  const fetchSession = async (id: string) => {
    try {
      const res = await fetch(`/api/chat/session?sessionId=${id}`)
      if (res.ok) {
        const data = await res.json()
        if (data.session) {
          setMessages(data.session.messages || [])
          setIsInitialized(true)
          setIsTypingAdmin(data.session.isTypingAdmin || false)
          if (data.session.customerName && data.session.customerName !== 'Pengunjung Store') {
            setName(data.session.customerName)
          }
          if (data.session.unreadUser) {
            setUnreadCount(data.session.unreadUser)
          }
        }
      }
    } catch (error) {
      console.error('Fetch chat session error', error)
    }
  }

  const handleStartChat = async (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    setSending(true)
    try {
      const guestId = localStorage.getItem('raxie_guest_uuid')
      const customerName = name.trim() || session?.user?.name || 'Pelanggan Raxie'
      const customerEmail = email.trim() || session?.user?.email || null

      const res = await fetch('/api/chat/session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId,
          customerName,
          customerEmail,
          guestId,
          userId: (session?.user as any)?.id || null,
        }),
      })
      const data = await res.json()
      if (data.session) {
        setSessionId(data.session.id)
        localStorage.setItem('raxie_chat_session_id', data.session.id)
        setMessages(data.session.messages || [])
        setIsInitialized(true)
      }
    } catch (error) {
      console.error('Start chat error', error)
      alert('Gagal memulai live chat. Silakan coba lagi.')
    } finally {
      setSending(false)
    }
  }

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    const text = inputMessage.trim()
    if (!text || sending) return

    setSending(true)
    setInputMessage('')

    try {
      let activeSessionId = sessionId
      if (!activeSessionId || !isInitialized) {
        const guestId = localStorage.getItem('raxie_guest_uuid')
        const initRes = await fetch('/api/chat/session', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            customerName: name.trim() || session?.user?.name || 'Pelanggan Raxie',
            customerEmail: email.trim() || session?.user?.email || null,
            guestId,
            userId: (session?.user as any)?.id || null,
          }),
        })
        const initData = await initRes.json()
        if (initData.session) {
          activeSessionId = initData.session.id
          setSessionId(activeSessionId)
          localStorage.setItem('raxie_chat_session_id', activeSessionId)
          setIsInitialized(true)
        } else {
          throw new Error('Gagal inisialisasi sesi')
        }
      }

      // Optimistic UI
      const tempMsg = {
        id: Date.now().toString(),
        sender: 'USER',
        senderName: name.trim() || session?.user?.name || 'Saya',
        message: text,
        type: 'TEXT',
        isRead: false,
        createdAt: new Date().toISOString(),
      }
      setMessages((prev) => [...prev, tempMsg])

      await fetch('/api/chat/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId: activeSessionId,
          sender: 'USER',
          senderName: name.trim() || session?.user?.name || 'Pelanggan',
          message: text,
          type: 'TEXT',
        }),
      })

      fetchSession(activeSessionId)
    } catch (error) {
      console.error('Send chat error', error)
      alert('Gagal mengirim pesan')
    } finally {
      setSending(false)
    }
  }

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploading(true)

    try {
      let activeSessionId = sessionId
      if (!activeSessionId || !isInitialized) {
        const guestId = localStorage.getItem('raxie_guest_uuid')
        const initRes = await fetch('/api/chat/session', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            customerName: name.trim() || session?.user?.name || 'Pelanggan Raxie',
            customerEmail: email.trim() || session?.user?.email || null,
            guestId,
            userId: (session?.user as any)?.id || null,
          }),
        })
        const initData = await initRes.json()
        if (initData.session) {
          activeSessionId = initData.session.id
          setSessionId(activeSessionId)
          localStorage.setItem('raxie_chat_session_id', activeSessionId)
          setIsInitialized(true)
        }
      }

      if (!activeSessionId) throw new Error('Session null')

      const formData = new FormData()
      formData.append('file', file)

      const uploadRes = await fetch('/api/chat/upload', {
        method: 'POST',
        body: formData,
      })
      const uploadData = await uploadRes.json()

      if (!uploadRes.ok) {
        alert(uploadData.error || 'Gagal mengunggah file')
        return
      }

      await fetch('/api/chat/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId: activeSessionId,
          sender: 'USER',
          senderName: name.trim() || session?.user?.name || 'Pelanggan',
          message: uploadData.fileType === 'IMAGE' ? '[Gambar]' : `[File: ${uploadData.fileName}]`,
          type: uploadData.fileType,
          attachmentUrl: uploadData.url,
          attachmentType: uploadData.mimeType,
          attachmentName: uploadData.fileName,
        }),
      })

      fetchSession(activeSessionId)
    } catch (error) {
      console.error('Upload error', error)
      alert('Gagal mengunggah file')
    } finally {
      setUploading(false)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  const handleResetSession = () => {
    localStorage.removeItem('raxie_chat_session_id')
    setSessionId(null)
    setIsInitialized(false)
    setMessages([])
  }

  return (
    <>
      {/* Floating Chat Trigger Button */}
      <button
        onClick={() => {
          setIsOpen(!isOpen)
          setUnreadCount(0)
        }}
        className="fixed bottom-20 right-20 sm:bottom-6 sm:right-24 z-40 flex items-center gap-2.5 bg-slate-950 hover:bg-slate-900 text-amber-400 border border-amber-500/40 px-4 py-3.5 rounded-full shadow-2xl hover:scale-105 transition-all duration-300 group"
        aria-label="Live Chat CS Raxie"
      >
        <div className="relative">
          <MessageSquare className="w-5 h-5 text-amber-400 group-hover:rotate-12 transition-transform" />
          {unreadCount > 0 && (
            <span className="absolute -top-2.5 -right-2.5 bg-red-500 text-white text-[10px] font-extrabold px-2 py-0.5 rounded-full animate-bounce shadow">
              {unreadCount}
            </span>
          )}
        </div>
        <span className="text-xs font-bold text-slate-100 hidden sm:inline tracking-wide">Live Chat CS</span>
      </button>

      {/* Live Chat Popup Window */}
      {isOpen && (
        <div className="fixed bottom-24 right-4 sm:bottom-24 sm:right-8 z-50 w-[92vw] sm:w-[400px] h-[550px] bg-slate-950 border-2 border-slate-800 rounded-3xl shadow-2xl flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-5">
          {/* Header */}
          <div className="bg-slate-900 px-5 py-3.5 border-b border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-9 h-9 rounded-full bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 font-bold">
                  <Bot className="w-5 h-5" />
                </div>
                <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 rounded-full border-2 border-slate-900"></span>
              </div>
              <div>
                <h3 className="font-serif font-bold text-sm text-white">CS RAXIE Official</h3>
                <p className="text-[10px] text-emerald-400 font-medium flex items-center gap-1">
                  <Circle className="w-2 h-2 fill-emerald-400 text-emerald-400 animate-pulse" /> Online Real-time
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1">
              {isInitialized && (
                <button
                  onClick={handleResetSession}
                  className="text-slate-400 hover:text-amber-400 p-1.5 rounded-lg hover:bg-slate-800 transition-colors"
                  title="Mulai Diskusi Baru / Ubah Nama"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
              )}
              <button
                onClick={() => setIsOpen(false)}
                className="text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-slate-800 transition-colors"
              >
                <Minimize2 className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Form Masukkan Nama (Jika Belum Inisialisasi) */}
          {!isInitialized ? (
            <form onSubmit={handleStartChat} className="flex-1 p-6 flex flex-col justify-center space-y-4 bg-slate-950">
              <div className="text-center mb-2">
                <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-500/40 text-amber-400 flex items-center justify-center mx-auto mb-3">
                  <MessageSquare className="w-6 h-6" />
                </div>
                <h3 className="font-serif font-bold text-lg text-white">Mulai Live Chat Raxie</h3>
                <p className="text-xs text-slate-400 mt-1">Masukkan nama dan kontak kamu agar CS Raxie dapat melayani pertanyaan kamu dengan cepat.</p>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">Nama Lengkap *</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Contoh: Dimas Febriansyah"
                    className="w-full pl-9 pr-3 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-amber-500 transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">No. WhatsApp / Email (Opsional)</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <input
                    type="text"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="08123456789 / email@gmail.com"
                    className="w-full pl-9 pr-3 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-amber-500 transition-colors"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={sending || !name.trim()}
                className="w-full py-3 bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-slate-950 rounded-xl text-xs font-extrabold shadow-lg transition-all flex items-center justify-center gap-2 mt-3"
              >
                {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Mulai Chat Sekarang ➔'}
              </button>
            </form>
          ) : (
            /* Area Pesan Chat */
            <>
              <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-slate-950">
                {messages.map((msg) => {
                  const isAdmin = msg.sender === 'ADMIN'
                  return (
                    <div key={msg.id} className={`flex flex-col ${isAdmin ? 'items-start' : 'items-end'}`}>
                      <span className="text-[9px] text-slate-500 mb-1 px-1">{msg.senderName}</span>

                      <div
                        className={`max-w-[85%] p-3 rounded-2xl text-xs leading-relaxed ${
                          isAdmin
                            ? 'bg-slate-900 text-slate-100 border border-slate-800 rounded-tl-none'
                            : 'bg-amber-500 text-slate-950 font-semibold rounded-tr-none shadow'
                        }`}
                      >
                        {/* Attachment Render */}
                        {msg.attachmentUrl && (
                          <div className="mb-2">
                            {msg.type === 'IMAGE' ? (
                              <a href={msg.attachmentUrl} target="_blank" rel="noopener noreferrer" className="block rounded-xl overflow-hidden border border-black/10">
                                <img src={msg.attachmentUrl} alt="Attachment" className="max-h-48 object-cover w-full" />
                              </a>
                            ) : (
                              <a
                                href={msg.attachmentUrl}
                                target="_blank"
                                download
                                className="flex items-center gap-2 p-2 bg-black/20 rounded-lg text-[11px] hover:underline"
                              >
                                <FileText className="w-4 h-4 shrink-0" />
                                <span className="truncate flex-1 font-semibold">{msg.attachmentName || 'Dokumen PDF'}</span>
                                <Download className="w-3.5 h-3.5 shrink-0" />
                              </a>
                            )}
                          </div>
                        )}

                        {msg.message && <p>{msg.message}</p>}
                      </div>

                      <span className="text-[8px] text-slate-500 mt-1 px-1 flex items-center gap-1">
                        {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        {!isAdmin && (
                          msg.isRead ? <CheckCheck className="w-3 h-3 text-blue-400" /> : <Check className="w-3 h-3 text-slate-400" />
                        )}
                      </span>
                    </div>
                  )
                })}

                {isTypingAdmin && (
                  <div className="flex items-center gap-2 text-xs text-amber-400 italic font-medium bg-slate-900/60 px-3 py-1.5 rounded-full w-fit">
                    <Loader2 className="w-3 h-3 animate-spin" /> CS Raxie sedang mengetik...
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>

              {/* Input Pesan & Upload */}
              <form onSubmit={handleSendMessage} className="p-3 bg-slate-900 border-t border-slate-800 flex items-center gap-2">
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
                  className="p-2.5 text-slate-400 hover:text-amber-400 hover:bg-slate-800 rounded-xl transition-colors shrink-0"
                  title="Unggah Gambar / PDF (Maks 10MB)"
                >
                  {uploading ? <Loader2 className="w-4 h-4 animate-spin text-amber-400" /> : <Paperclip className="w-4 h-4" />}
                </button>

                <input
                  type="text"
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault()
                      handleSendMessage(e)
                    }
                  }}
                  placeholder="Tulis pesan kamu..."
                  className="flex-1 px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-amber-500 transition-colors"
                />

                <button
                  type="submit"
                  disabled={!inputMessage.trim() || sending}
                  className="w-9 h-9 bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-slate-950 rounded-xl flex items-center justify-center transition-all shrink-0 font-bold shadow"
                >
                  {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                </button>
              </form>
            </>
          )}
        </div>
      )}
    </>
  )
}
