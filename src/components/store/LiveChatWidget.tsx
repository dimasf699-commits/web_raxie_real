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
  Phone,
  RotateCcw,
  AlertCircle,
  WifiOff,
  RefreshCw
} from 'lucide-react'

interface PendingAttachment {
  file: File
  previewUrl: string
  name: string
  type: string
  size: number
}

export function LiveChatWidget() {
  const { data: session } = useSession()
  const [isOpen, setIsOpen] = useState(false)
  const [conversationId, setConversationId] = useState<string | null>(null)
  const [messages, setMessages] = useState<any[]>([])
  const [inputMessage, setInputMessage] = useState('')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')

  // Validation States
  const [formError, setFormError] = useState('')
  const [errorField, setErrorField] = useState<'name' | 'email' | 'phone' | null>(null)

  const [isInitialized, setIsInitialized] = useState(false)
  const [sending, setSending] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [unreadCount, setUnreadCount] = useState(0)
  const [isOnline, setIsOnline] = useState(true)

  // Attachment Preview Before Upload
  const [pendingAttachment, setPendingAttachment] = useState<PendingAttachment | null>(null)

  const messagesEndRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const nameInputRef = useRef<HTMLInputElement>(null)

  // Online / Offline listener
  useEffect(() => {
    const handleOnline = () => setIsOnline(true)
    const handleOffline = () => setIsOnline(false)
    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)
    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  // Load persistent conversation & guest UUID
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

    const storedConvId = localStorage.getItem('raxie_chat_conv_id')
    if (storedConvId) {
      setConversationId(storedConvId)
      fetchConversation(storedConvId)
    }
  }, [session])

  // Realtime Auto-poll every 2.5s
  useEffect(() => {
    if (!conversationId || !isInitialized) return
    const interval = setInterval(() => {
      fetchConversation(conversationId)
    }, 2500)
    return () => clearInterval(interval)
  }, [conversationId, isInitialized, isOpen])

  // Auto scroll
  useEffect(() => {
    if (isOpen && isInitialized) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }
  }, [messages, isOpen, isInitialized])

  const fetchConversation = async (id: string) => {
    try {
      const res = await fetch(`/api/chat/conversations/${id}`)
      if (res.ok) {
        const data = await res.json()
        if (data.conversation) {
          setMessages(data.conversation.messages || [])
          setIsInitialized(true)
          if (data.conversation.customerName) {
            setName(data.conversation.customerName)
          }
          if (data.conversation.unreadUser) {
            setUnreadCount(data.conversation.unreadUser)
          }
        }
      }
    } catch (error) {
      console.error('Fetch conversation error', error)
    }
  }

  // Handle Form Validation & Conversation Creation
  const handleStartChat = async (e: React.FormEvent) => {
    e.preventDefault()
    setFormError('')
    setErrorField(null)

    // Mandatory Name Validation
    if (!name || !name.trim()) {
      setFormError('Nama Lengkap wajib diisi untuk memulai chat.')
      setErrorField('name')
      nameInputRef.current?.focus()
      return
    }

    // Optional Email Validation
    if (email && email.trim()) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(email.trim())) {
        setFormError('Format alamat Email tidak valid. (Contoh: nama@domain.com)')
        setErrorField('email')
        return
      }
    }

    // Optional Phone Validation
    if (phone && phone.trim()) {
      const phoneClean = phone.replace(/\D/g, '')
      if (phoneClean.length < 8 || phoneClean.length > 15) {
        setFormError('Nomor WhatsApp/HP harus antara 8-15 digit angka.')
        setErrorField('phone')
        return
      }
    }

    setSending(true)
    try {
      const guestId = localStorage.getItem('raxie_guest_uuid')
      const res = await fetch('/api/chat/conversations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          conversationId,
          customerName: name.trim(),
          customerEmail: email.trim() || null,
          customerPhone: phone.trim() || null,
          guestId,
          userId: (session?.user as any)?.id || null,
        }),
      })
      const data = await res.json()

      if (!res.ok) {
        setFormError(data.error || 'Gagal memulai percakapan.')
        if (data.field) setErrorField(data.field)
        return
      }

      if (data.conversation) {
        setConversationId(data.conversation.id)
        localStorage.setItem('raxie_chat_conv_id', data.conversation.id)
        setMessages(data.conversation.messages || [])
        setIsInitialized(true)
      }
    } catch (error) {
      console.error('Start chat error', error)
      setFormError('Terjadi gangguan koneksi. Harap periksa jaringan Anda.')
    } finally {
      setSending(false)
    }
  }

  // Handle Select File (Preview before upload)
  const handleSelectFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Limit 10MB
    if (file.size > 10 * 1024 * 1024) {
      alert('Ukuran file melebihi batas maksimal 10 MB.')
      if (fileInputRef.current) fileInputRef.current.value = ''
      return
    }

    const isImage = file.type.startsWith('image/')
    const previewUrl = isImage ? URL.createObjectURL(file) : ''

    setPendingAttachment({
      file,
      previewUrl,
      name: file.name,
      type: isImage ? 'IMAGE' : 'FILE',
      size: file.size,
    })
  }

  // Handle Send Message & Upload
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if ((!inputMessage.trim() && !pendingAttachment) || sending || !conversationId) return

    const text = inputMessage.trim()
    const currentAttachment = pendingAttachment

    setSending(true)

    try {
      let uploadedAttachments: any[] = []

      // Step 1: Upload file if pending
      if (currentAttachment) {
        setUploading(true)
        const formData = new FormData()
        formData.append('file', currentAttachment.file)

        const uploadRes = await fetch('/api/chat/upload', {
          method: 'POST',
          body: formData,
        })
        const uploadData = await uploadRes.json()

        if (!uploadRes.ok) {
          alert(uploadData.error || 'Gagal mengunggah gambar/file.')
          setSending(false)
          setUploading(false)
          return
        }

        uploadedAttachments.push({
          url: uploadData.url,
          fileName: uploadData.fileName,
          fileType: uploadData.fileType,
          mimeType: uploadData.mimeType,
          fileSize: currentAttachment.size,
        })

        setPendingAttachment(null)
        if (fileInputRef.current) fileInputRef.current.value = ''
        setUploading(false)
      }

      // Step 2: Optimistic UI
      const tempId = `temp_${Date.now()}`
      const tempMsg = {
        id: tempId,
        sender: 'USER',
        senderName: name.trim() || 'Saya',
        message: text,
        status: 'Sending',
        isRead: false,
        createdAt: new Date().toISOString(),
        attachments: uploadedAttachments.map((a) => ({
          id: `att_${Date.now()}`,
          fileUrl: a.url,
          fileName: a.fileName,
          fileType: a.fileType,
        })),
      }
      setMessages((prev) => [...prev, tempMsg])
      setInputMessage('')

      // Step 3: Send to API
      const sendRes = await fetch('/api/chat/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          conversationId,
          sender: 'USER',
          senderName: name.trim() || 'Pelanggan',
          message: text,
          attachments: uploadedAttachments,
        }),
      })

      if (!sendRes.ok) {
        const sendData = await sendRes.json()
        alert(sendData.error || 'Gagal mengirim pesan.')
        // Keep message in input box if failed
        setInputMessage(text)
      }

      fetchConversation(conversationId)
    } catch (error) {
      console.error('Send message error', error)
      alert('Terjadi kendala saat mengirim pesan. Harap periksa jaringan.')
      setInputMessage(text)
    } finally {
      setSending(false)
    }
  }

  const handleResetSession = () => {
    if (confirm('Apakah Anda yakin ingin memulai sesi percakapan baru?')) {
      localStorage.removeItem('raxie_chat_conv_id')
      setConversationId(null)
      setIsInitialized(false)
      setMessages([])
    }
  }

  return (
    <>
      {/* Floating Trigger Button */}
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

      {/* Live Chat Modal Window */}
      {isOpen && (
        <div className="fixed bottom-24 right-4 sm:bottom-24 sm:right-8 z-50 w-[92vw] sm:w-[410px] h-[560px] bg-slate-950 border-2 border-slate-800 rounded-3xl shadow-2xl flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-5">
          {/* Header */}
          <div className="bg-slate-900 px-5 py-3.5 border-b border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-9 h-9 rounded-full bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 font-bold">
                  <Bot className="w-5 h-5" />
                </div>
                <span className={`absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border-2 border-slate-900 ${isOnline ? 'bg-emerald-500' : 'bg-rose-500'}`}></span>
              </div>
              <div>
                <h3 className="font-serif font-bold text-sm text-white">CS RAXIE Official</h3>
                <p className="text-[10px] font-medium flex items-center gap-1">
                  {isOnline ? (
                    <span className="text-emerald-400 flex items-center gap-1">
                      <Circle className="w-2 h-2 fill-emerald-400 animate-pulse" /> Online Realtime
                    </span>
                  ) : (
                    <span className="text-rose-400 flex items-center gap-1">
                      <WifiOff className="w-3 h-3" /> Offline (Mencari Koneksi...)
                    </span>
                  )}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1">
              {isInitialized && (
                <button
                  onClick={handleResetSession}
                  className="text-slate-400 hover:text-amber-400 p-1.5 rounded-lg hover:bg-slate-800 transition-colors"
                  title="Mulai Sesi Chat Baru"
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

          {/* Offline Warning Banner */}
          {!isOnline && (
            <div className="bg-rose-900/90 text-rose-100 px-4 py-1.5 text-[11px] font-semibold text-center flex items-center justify-center gap-2">
              <WifiOff className="w-3.5 h-3.5" /> Koneksi terputus. Pesan akan terkirim otomatis saat online.
            </div>
          )}

          {/* Form Identitas Customer (Jika Belum Inisialisasi) */}
          {!isInitialized ? (
            <form onSubmit={handleStartChat} className="flex-1 p-6 flex flex-col justify-center space-y-4 bg-slate-950 overflow-y-auto">
              <div className="text-center mb-1">
                <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-500/40 text-amber-400 flex items-center justify-center mx-auto mb-2">
                  <MessageSquare className="w-6 h-6" />
                </div>
                <h3 className="font-serif font-bold text-lg text-white">Mulai Live Chat Raxie</h3>
                <p className="text-xs text-slate-400 mt-1">Harap isi identitas Anda untuk terhubung langsung dengan tim CS kami.</p>
              </div>

              {/* Error Message Box */}
              {formError && (
                <div className="p-3 bg-rose-950/80 border border-rose-800 rounded-xl text-rose-200 text-xs flex items-start gap-2.5 animate-in fade-in">
                  <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                  <span>{formError}</span>
                </div>
              )}

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">
                  Nama Lengkap <span className="text-amber-400">* (Wajib)</span>
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <input
                    ref={nameInputRef}
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Contoh: Dimas Febriansyah"
                    className={`w-full pl-9 pr-3 py-2.5 bg-slate-900 border rounded-xl text-xs text-white focus:outline-none transition-colors ${
                      errorField === 'name' ? 'border-rose-500 focus:border-rose-500' : 'border-slate-800 focus:border-amber-500'
                    }`}
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">Alamat Email (Opsional)</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="nama@domain.com"
                    className={`w-full pl-9 pr-3 py-2.5 bg-slate-900 border rounded-xl text-xs text-white focus:outline-none transition-colors ${
                      errorField === 'email' ? 'border-rose-500 focus:border-rose-500' : 'border-slate-800 focus:border-amber-500'
                    }`}
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">No. WhatsApp / HP (Opsional)</label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="081234567890"
                    className={`w-full pl-9 pr-3 py-2.5 bg-slate-900 border rounded-xl text-xs text-white focus:outline-none transition-colors ${
                      errorField === 'phone' ? 'border-rose-500 focus:border-rose-500' : 'border-slate-800 focus:border-amber-500'
                    }`}
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={sending}
                className="w-full py-3 bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-slate-950 rounded-xl text-xs font-extrabold shadow-lg transition-all flex items-center justify-center gap-2 mt-2"
              >
                {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Mulai Chat Sekarang ➔'}
              </button>
            </form>
          ) : (
            /* Active Chat Window */
            <>
              {/* Messages History */}
              <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-slate-950">
                {messages.map((msg) => {
                  const isAdmin = msg.sender === 'ADMIN'
                  const isRead = msg.isRead || msg.status === 'Read'
                  const isSending = msg.status === 'Sending'

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
                        {/* Attachments */}
                        {msg.attachments && msg.attachments.length > 0 && (
                          <div className="mb-2 space-y-2">
                            {msg.attachments.map((att: any) => (
                              <div key={att.id}>
                                {att.fileType === 'IMAGE' ? (
                                  <a href={att.fileUrl} target="_blank" rel="noopener noreferrer" className="block rounded-xl overflow-hidden border border-black/10">
                                    <img src={att.fileUrl} alt="Attachment" className="max-h-48 object-cover w-full" />
                                  </a>
                                ) : (
                                  <a
                                    href={att.fileUrl}
                                    target="_blank"
                                    download
                                    className="flex items-center gap-2 p-2 bg-black/20 rounded-lg text-[11px] hover:underline"
                                  >
                                    <FileText className="w-4 h-4 shrink-0" />
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

                      {/* Status Badges & Timestamps */}
                      <span className="text-[8px] text-slate-500 mt-1 px-1 flex items-center gap-1">
                        {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        {!isAdmin && (
                          isSending ? (
                            <span className="text-amber-400 animate-pulse">Sending...</span>
                          ) : isRead ? (
                            <span title="Read"><CheckCheck className="w-3.5 h-3.5 text-blue-400" /></span>
                          ) : (
                            <span title="Sent"><Check className="w-3.5 h-3.5 text-slate-400" /></span>
                          )
                        )}
                      </span>
                    </div>
                  )
                })}

                <div ref={messagesEndRef} />
              </div>

              {/* Preview Image Overlay Before Upload */}
              {pendingAttachment && (
                <div className="p-3 bg-slate-900 border-t border-slate-800 flex items-center justify-between animate-in fade-in">
                  <div className="flex items-center gap-3 overflow-hidden">
                    {pendingAttachment.type === 'IMAGE' ? (
                      <img src={pendingAttachment.previewUrl} alt="Preview" className="w-12 h-12 rounded-lg object-cover border border-amber-500/40" />
                    ) : (
                      <div className="w-12 h-12 rounded-lg bg-slate-800 flex items-center justify-center text-amber-400">
                        <FileText className="w-6 h-6" />
                      </div>
                    )}
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-white truncate">{pendingAttachment.name}</p>
                      <p className="text-[10px] text-slate-400">{(pendingAttachment.size / 1024 / 1024).toFixed(2)} MB</p>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      setPendingAttachment(null)
                      if (fileInputRef.current) fileInputRef.current.value = ''
                    }}
                    className="p-1 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded-lg transition-colors"
                    title="Hapus gambar"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              )}

              {/* Chat Footer Input */}
              <form onSubmit={handleSendMessage} className="p-3 bg-slate-900 border-t border-slate-800 flex items-center gap-2">
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleSelectFile}
                  accept="image/*,application/pdf"
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading || sending}
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
                  disabled={(!inputMessage.trim() && !pendingAttachment) || sending}
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
