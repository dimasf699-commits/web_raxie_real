'use client'

import React, { useState, useEffect, useRef } from 'react'
import { MessageSquare, X, Send, User, Bot, Loader2, Minimize2, CheckCheck } from 'lucide-react'

export function LiveChatWidget() {
  const [isOpen, setIsOpen] = useState(false)
  const [sessionId, setSessionId] = useState<string | null>(null)
  const [messages, setMessages] = useState<any[]>([])
  const [inputMessage, setInputMessage] = useState('')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [isInitialized, setIsInitialized] = useState(false)
  const [sending, setSending] = useState(false)
  const [unreadCount, setUnreadCount] = useState(0)

  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Initialize session from localStorage
  useEffect(() => {
    const storedId = localStorage.getItem('raxie_chat_session_id')
    if (storedId) {
      setSessionId(storedId)
      fetchSession(storedId)
    }
  }, [])

  // Auto poll messages every 3 seconds when open or initialized
  useEffect(() => {
    if (!sessionId) return
    const interval = setInterval(() => {
      fetchSession(sessionId)
    }, 3000)
    return () => clearInterval(interval)
  }, [sessionId, isOpen])

  // Scroll to bottom on new message
  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }
  }, [messages, isOpen])

  const fetchSession = async (id: string) => {
    try {
      const res = await fetch(`/api/chat/session?sessionId=${id}`)
      if (res.ok) {
        const data = await res.json()
        setMessages(data.session?.messages || [])
        setIsInitialized(true)
        if (data.session?.unreadUser) {
          setUnreadCount(data.session.unreadUser)
        }
      }
    } catch (error) {
      console.error('Fetch chat error', error)
    }
  }

  const handleStartChat = async (e: React.FormEvent) => {
    e.preventDefault()
    setSending(true)
    try {
      const res = await fetch('/api/chat/session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId,
          customerName: name || 'Pelanggan',
          customerEmail: email || null,
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
      console.error(error)
    } finally {
      setSending(false)
    }
  }

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!inputMessage.trim() || !sessionId || sending) return

    const text = inputMessage.trim()
    setInputMessage('')
    setSending(true)

    // Optimistic UI update
    const tempMsg = {
      id: Date.now().toString(),
      sender: 'USER',
      senderName: name || 'Saya',
      message: text,
      createdAt: new Date().toISOString(),
    }
    setMessages((prev) => [...prev, tempMsg])

    try {
      await fetch('/api/chat/message', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId,
          sender: 'USER',
          senderName: name || 'Pelanggan',
          message: text,
        }),
      })
      fetchSession(sessionId)
    } catch (error) {
      console.error('Send message error', error)
    } finally {
      setSending(false)
    }
  }

  return (
    <>
      {/* Floating Chat Button */}
      <button
        onClick={() => {
          setIsOpen(!isOpen)
          setUnreadCount(0)
        }}
        className="fixed bottom-20 right-20 sm:bottom-6 sm:right-24 z-40 flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-amber-400 border border-amber-500/40 px-4 py-3 rounded-full shadow-2xl hover:scale-105 transition-all duration-300 group"
        aria-label="Live Chat CS Raxie"
      >
        <div className="relative">
          <MessageSquare className="w-5 h-5 text-amber-400 group-hover:rotate-12 transition-transform" />
          {unreadCount > 0 && (
            <span className="absolute -top-2 -right-2 bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full animate-bounce">
              {unreadCount}
            </span>
          )}
        </div>
        <span className="text-xs font-bold text-slate-100 hidden sm:inline">Live CS Chat</span>
      </button>

      {/* Chat Window Popup */}
      {isOpen && (
        <div className="fixed bottom-24 right-4 sm:bottom-24 sm:right-8 z-50 w-[92vw] sm:w-[380px] h-[520px] bg-slate-950 border-2 border-slate-800 rounded-3xl shadow-2xl flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-5">
          {/* Header */}
          <div className="bg-slate-900 px-5 py-4 border-b border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 font-bold text-sm">
                <Bot className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-serif font-bold text-sm text-white">CS RAXIE Official</h3>
                <p className="text-[10px] text-emerald-400 font-medium flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span> Online Real-time
                </p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
            >
              <Minimize2 className="w-4 h-4" />
            </button>
          </div>

          {/* Body */}
          {!isInitialized && !sessionId ? (
            /* Start Chat Form */
            <form onSubmit={handleStartChat} className="p-6 flex-1 flex flex-col justify-center space-y-4">
              <div className="text-center mb-2">
                <p className="font-serif text-lg font-bold text-white">Mulai Diskusi Chat</p>
                <p className="text-xs text-slate-400 mt-1">Tim Customer Service Raxie siap membantu pertanyaan kamu mengenai produk & pesanan.</p>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">Nama Kamu (Opsional)</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Contoh: Dimas"
                  className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-amber-500 transition-colors"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">WhatsApp / Email (Opsional)</label>
                <input
                  type="text"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="08123456789 / email@gmail.com"
                  className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-amber-500 transition-colors"
                />
              </div>

              <button
                type="submit"
                disabled={sending}
                className="w-full py-3 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-xl text-xs font-bold shadow-lg transition-all flex items-center justify-center gap-2 mt-2"
              >
                {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Mulai Chat Sekarang'}
              </button>
            </form>
          ) : (
            /* Messages Container */
            <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-slate-950">
              {messages.map((msg) => {
                const isAdmin = msg.sender === 'ADMIN'
                return (
                  <div
                    key={msg.id}
                    className={`flex flex-col ${isAdmin ? 'items-start' : 'items-end'}`}
                  >
                    <span className="text-[9px] text-slate-500 mb-1 px-1">{msg.senderName}</span>
                    <div
                      className={`max-w-[82%] px-3.5 py-2.5 rounded-2xl text-xs leading-relaxed ${
                        isAdmin
                          ? 'bg-slate-900 text-slate-100 border border-slate-800 rounded-tl-none'
                          : 'bg-amber-500 text-slate-950 font-medium rounded-tr-none shadow'
                      }`}
                    >
                      {msg.message}
                    </div>
                    <span className="text-[8px] text-slate-500 mt-1 px-1 flex items-center gap-1">
                      {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      {!isAdmin && <CheckCheck className="w-3 h-3 text-amber-500" />}
                    </span>
                  </div>
                )
              })}
              <div ref={messagesEndRef} />
            </div>
          )}

          {/* Footer Input Box */}
          {isInitialized && (
            <form onSubmit={handleSendMessage} className="p-3 bg-slate-900 border-t border-slate-800 flex items-center gap-2">
              <input
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                placeholder="Tulis pesan kamu..."
                className="flex-1 px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-amber-500 transition-colors"
              />
              <button
                type="submit"
                disabled={!inputMessage.trim() || sending}
                className="w-10 h-10 bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-slate-950 rounded-xl flex items-center justify-center transition-all shrink-0"
              >
                {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              </button>
            </form>
          )}
        </div>
      )}
    </>
  )
}
