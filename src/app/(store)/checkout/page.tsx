'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowLeft, ArrowRight, MapPin, Tag, CheckCircle2 } from 'lucide-react'
import { useCartStore } from '@/store/cart.store'
import { Button } from '@/components/ui/Button'
import { toast } from '@/components/ui/Toaster'
import { cn, formatPrice } from '@/lib/utils'
import Script from 'next/script'

type CheckoutStep = 1 | 2 | 3

export default function CheckoutPage() {
  const router = useRouter()
  const [mounted, setMounted] = useState(false)
  const cartItems = useCartStore((s) => s.items)
  const totalPrice = useCartStore((s) => s.totalPrice())
  const clearCart = useCartStore((s) => s.clearCart)
  
  const [step, setStep] = useState<CheckoutStep>(1)
  
  const [address, setAddress] = useState({ name: '', email: '', phone: '', detail: '', areaId: '', postalCode: '', areaName: '' })
  const [shippingCost, setShippingCost] = useState(0)
  const [courierName, setCourierName] = useState('')
  const [paymentMethod] = useState('midtrans')
  const [isProcessing, setIsProcessing] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')
  const [shippingRates, setShippingRates] = useState<any[]>([])
  const [isLoadingRates, setIsLoadingRates] = useState(false)
  
  // Area Autocomplete State
  const [searchArea, setSearchArea] = useState('')
  const [areaResults, setAreaResults] = useState<any[]>([])
  const [isSearchingArea, setIsSearchingArea] = useState(false)
  const [showAreaDropdown, setShowAreaDropdown] = useState(false)

  // Saved Addresses State
  const [savedAddresses, setSavedAddresses] = useState<any[]>([])
  const [selectedSavedId, setSelectedSavedId] = useState<string>('')

  // Voucher State
  const [voucherCode, setVoucherCode] = useState('')
  const [appliedVoucher, setAppliedVoucher] = useState<{ id: string; code: string; name: string; discountAmount: number } | null>(null)
  const [isValidatingVoucher, setIsValidatingVoucher] = useState(false)

  const handleApplyVoucher = async () => {
    if (!voucherCode) return
    setIsValidatingVoucher(true)
    try {
      const res = await fetch('/api/vouchers/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: voucherCode, cartSubtotal: totalPrice }),
      })
      const data = await res.json()
      if (res.ok && data.success) {
        setAppliedVoucher(data.voucher)
        toast.success('Voucher Berhasil Dipasang!', `Potongan ${formatPrice(data.voucher.discountAmount)}`)
      } else {
        toast.error('Voucher Gagal', data.error || 'Voucher tidak valid')
      }
    } catch {
      toast.error('Gagal memproses voucher')
    } finally {
      setIsValidatingVoucher(false)
    }
  }

  const handleRemoveVoucher = () => {
    setAppliedVoucher(null)
    setVoucherCode('')
  }

  useEffect(() => {
    fetch('/api/account/addresses')
      .then((res) => res.json())
      .then((data) => {
        if (data.addresses && data.addresses.length > 0) {
          setSavedAddresses(data.addresses)
          const def = data.addresses.find((a: any) => a.isDefault) || data.addresses[0]
          if (def) {
            setSelectedSavedId(def.id)
            const areaLabel = `${def.district ? def.district + ', ' : ''}${def.city}, ${def.province}`
            setAddress((prev) => ({
              ...prev,
              name: def.recipientName,
              phone: def.phone,
              detail: def.street,
              areaId: def.areaId || '',
              postalCode: def.postalCode || '',
              areaName: areaLabel,
            }))
            setSearchArea(areaLabel)
          }
        }
      })
      .catch(() => {})
  }, [])

  // Debounced search for Biteship Areas
  useEffect(() => {
    if (searchArea.length < 3 || address.areaName === searchArea) {
      setAreaResults([])
      return
    }
    
    const delayDebounceFn = setTimeout(async () => {
      setIsSearchingArea(true)
      try {
        const res = await fetch(`/api/shipping/locations?q=${encodeURIComponent(searchArea)}`)
        const data = await res.json()
        setAreaResults(data.locations || [])
        setShowAreaDropdown(true)
      } catch (err) {
        console.error(err)
      } finally {
        setIsSearchingArea(false)
      }
    }, 500)

    return () => clearTimeout(delayDebounceFn)
  }, [searchArea, address.areaName])

  useEffect(() => {
    setMounted(true)
    const currentItems = useCartStore.getState().items
    if (currentItems.length === 0) {
      router.push('/cart')
    }
  }, [router])

  if (!mounted || cartItems.length === 0) return null

  const handleNext = async () => {
    if (step === 1) {
      setIsLoadingRates(true)
      try {
        const totalWeight = cartItems.reduce((acc, item) => acc + (500 * item.quantity), 0)
        const res = await fetch('/api/shipping/rates', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            destination_area_id: address.areaId,
            weight: totalWeight,
            items: cartItems
          })
        })
        const data = await res.json()
        if (data.rates) {
          setShippingRates(data.rates)
        }
      } catch (err) {
        console.error('Failed to fetch rates', err)
      } finally {
        setIsLoadingRates(false)
        setStep(2)
      }
    } else if (step < 3) {
      setStep((s) => (s + 1) as CheckoutStep)
    }
  }

  const handleCheckout = async () => {
    setIsProcessing(true)
    setErrorMsg('')
    
    try {
      const payload = {
        items: cartItems,
        shipping: address,
        shippingCost,
        courierName: courierName || 'Reguler',
        paymentMethod,
        voucherId: appliedVoucher?.id || undefined,
        discountAmount: appliedVoucher?.discountAmount || undefined,
      }

      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Gagal memproses pesanan')

      if (data.snapToken && (window as any).snap) {
        (window as any).snap.pay(data.snapToken, {
          onSuccess: async function () {
            try {
              await fetch('/api/orders/confirm-payment', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ orderNumber: data.orderNumber }),
              })
            } catch (e) {}
            clearCart()
            toast.success('Pembayaran Berhasil!', 'Pesanan Anda sedang diproses.')
            router.push(`/checkout/success?order=${data.orderNumber}`)
          },
          onPending: function () {
            clearCart()
            toast.info('Menunggu Pembayaran', 'Selesaikan pembayaran Anda segera.')
            router.push(`/checkout/success?order=${data.orderNumber}&status=pending`)
          },
          onError: function () {
            clearCart()
            toast.error('Pembayaran Gagal', 'Terjadi kesalahan saat memproses pembayaran.')
            router.push(`/checkout/success?order=${data.orderNumber}&status=failed`)
          },
          onClose: function () {
            clearCart()
            toast.warning('Pembayaran Dibatalkan', 'Silakan coba bayar lagi dari riwayat pesanan.')
            router.push(`/checkout/success?order=${data.orderNumber}&status=pending`)
          }
        })
      } else {
        clearCart()
        toast.success('Pesanan Dibuat', 'Silakan lanjutkan pembayaran.')
        router.push(`/checkout/success?order=${data.orderNumber}&status=pending`)
      }
    } catch (err: any) {
      toast.error('Gagal', err.message || 'Terjadi kesalahan')
      setErrorMsg(err.message || 'Terjadi kesalahan')
      setIsProcessing(false)
    }
  }

  const isProduction = process.env.NEXT_PUBLIC_MIDTRANS_IS_PRODUCTION === 'true'
  const snapScriptUrl = isProduction 
    ? 'https://app.midtrans.com/snap/snap.js'
    : 'https://app.sandbox.midtrans.com/snap/snap.js'
  const clientKey = process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY || ''

  return (
    <>
      <Script
        id="midtrans-script"
        src={snapScriptUrl}
        data-client-key={clientKey}
        strategy="lazyOnload"
      />

      <div className="bg-[#FAF9F6] dark:bg-[#121212] text-black dark:text-white min-h-screen py-10 transition-colors duration-300">
        <div className="container-raxie">
          {/* Header */}
          <div className="flex items-center gap-4 mb-8">
            <Link href="/cart" className="text-neutral-500 dark:text-neutral-400 hover:text-black dark:hover:text-white transition-colors">
              <ArrowLeft className="w-6 h-6" />
            </Link>
            <h1 className="font-serif text-3xl md:text-4xl font-extrabold uppercase tracking-tight text-black dark:text-white">CHECKOUT PESANAN</h1>
          </div>

          {/* Step Indicator */}
          <div className="flex items-center justify-between max-w-xl mx-auto mb-6 lg:mb-10 pb-3 border-b border-neutral-200 dark:border-neutral-800">
            {[
              { num: 1, label: 'ALAMAT' },
              { num: 2, label: 'PENGIRIMAN' },
              { num: 3, label: 'PEMBAYARAN' }
            ].map((s) => (
              <div key={s.num} className="flex items-center gap-1.5 sm:gap-2">
                <div className={cn(
                  "w-6 h-6 sm:w-7 sm:h-7 rounded-full flex items-center justify-center font-bold text-[10px] sm:text-xs shrink-0",
                  step >= s.num ? "bg-[#C19A6B] text-white" : "bg-neutral-200 dark:bg-neutral-800 text-neutral-500 dark:text-neutral-400"
                )}>
                  {s.num}
                </div>
                <span className={cn("text-[9px] sm:text-[11px] font-bold tracking-wider uppercase", step >= s.num ? "text-black dark:text-white" : "text-neutral-500 dark:text-neutral-400")}>
                  {s.label}
                </span>
              </div>
            ))}
          </div>

          <div className="flex flex-col lg:flex-row gap-10 items-start">
            {/* Left Main Section */}
            <div className="flex-1 w-full bg-white dark:bg-[#151515] p-6 md:p-8 rounded-sm border border-neutral-200 dark:border-neutral-800 space-y-6 shadow-sm">
              <AnimatePresence mode="wait">
                {/* STEP 1: ALAMAT */}
                {step === 1 && (
                  <motion.div
                    key="step1"
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 10 }}
                    className="space-y-5"
                  >
                    <h2 className="font-serif font-bold text-sm uppercase tracking-wider text-[#C19A6B]">INFORMASI PENGIRIMAN</h2>

                    {savedAddresses.length > 0 && (
                      <div className="p-5 bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-sm space-y-3">
                        <label className="text-[11px] font-bold text-[#C19A6B] flex items-center gap-2 uppercase tracking-wider">
                          <MapPin className="w-4 h-4 text-[#C19A6B]" />
                          Alamat Tersimpan
                        </label>
                        <select
                          value={selectedSavedId}
                          onChange={(e) => {
                            const id = e.target.value
                            setSelectedSavedId(id)
                            const selected = savedAddresses.find((a) => a.id === id)
                            if (selected) {
                              const areaLabel = `${selected.district ? selected.district + ', ' : ''}${selected.city}, ${selected.province}`
                              setAddress((prev) => ({
                                ...prev,
                                name: selected.recipientName,
                                phone: selected.phone,
                                detail: selected.street,
                                areaId: selected.areaId || '',
                                postalCode: selected.postalCode || '',
                                areaName: areaLabel,
                              }))
                              setSearchArea(areaLabel)
                            }
                          }}
                          className="w-full bg-white dark:bg-black border border-neutral-300 dark:border-neutral-700 rounded-sm px-4 py-3 text-xs text-black dark:text-white focus:outline-none focus:border-[#C19A6B] transition-colors"
                        >
                          {savedAddresses.map((a) => (
                            <option key={a.id} value={a.id}>
                              [{a.label}] {a.recipientName} - {a.street.substring(0, 40)}... ({a.city})
                            </option>
                          ))}
                        </select>
                      </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="text-[10px] uppercase font-bold text-neutral-500 dark:text-neutral-400 block mb-2">NAMA LENGKAP</label>
                        <input
                          type="text"
                          placeholder="Nama Lengkap Anda"
                          value={address.name}
                          onChange={(e) => setAddress({ ...address, name: e.target.value })}
                          className="w-full bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-sm px-4 py-3 text-xs text-black dark:text-white placeholder:text-neutral-400 focus:outline-none focus:border-[#C19A6B] transition-colors"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] uppercase font-bold text-neutral-500 dark:text-neutral-400 block mb-2">NOMOR WHATSAPP / TELEPON</label>
                        <input
                          type="text"
                          placeholder="08123456789"
                          value={address.phone}
                          onChange={(e) => setAddress({ ...address, phone: e.target.value })}
                          className="w-full bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-sm px-4 py-3 text-xs text-black dark:text-white placeholder:text-neutral-400 focus:outline-none focus:border-[#C19A6B] transition-colors"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="text-[10px] uppercase font-bold text-neutral-500 dark:text-neutral-400 block mb-2">EMAIL PESANAN</label>
                      <input
                        type="email"
                        placeholder="email@domain.com"
                        value={address.email}
                        onChange={(e) => setAddress({ ...address, email: e.target.value })}
                        className="w-full bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-sm px-4 py-3 text-xs text-black dark:text-white placeholder:text-neutral-400 focus:outline-none focus:border-[#C19A6B] transition-colors"
                      />
                    </div>

                    <div className="relative">
                      <label className="text-[10px] uppercase font-bold text-neutral-500 dark:text-neutral-400 block mb-2">KECAMATAN / KOTA TUJUAN</label>
                      <input
                        type="text"
                        placeholder="Ketik nama kecamatan..."
                        value={searchArea}
                        onChange={(e) => {
                          setSearchArea(e.target.value)
                          if (address.areaId) setAddress({ ...address, areaId: '', areaName: '', postalCode: '' })
                        }}
                        onFocus={() => { if (areaResults.length > 0) setShowAreaDropdown(true) }}
                        className="w-full bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-sm px-4 py-3 text-xs text-black dark:text-white placeholder:text-neutral-400 focus:outline-none focus:border-[#C19A6B] transition-colors"
                      />
                      {isSearchingArea && <p className="text-[10px] text-[#C19A6B] mt-1 absolute right-3 top-8">Mencari...</p>}
                      
                      {showAreaDropdown && areaResults.length > 0 && (
                        <div className="absolute z-50 w-full mt-1 bg-white dark:bg-[#151515] border border-neutral-200 dark:border-neutral-800 rounded-sm shadow-2xl max-h-56 overflow-y-auto">
                          {areaResults.map((area) => (
                            <div
                              key={area.id}
                              className="px-4 py-3 hover:bg-neutral-50 dark:hover:bg-neutral-900 cursor-pointer border-b border-neutral-200 dark:border-neutral-800 text-xs transition-colors"
                              onClick={() => {
                                const fullName = `${area.name}, ${area.administrative_division_level_2_name}, ${area.administrative_division_level_1_name}`
                                setSearchArea(fullName)
                                setAddress({
                                  ...address,
                                  areaId: area.id,
                                  areaName: fullName,
                                  postalCode: area.postal_code || ''
                                })
                                setShowAreaDropdown(false)
                              }}
                            >
                              <p className="font-bold text-black dark:text-white">{area.name}</p>
                              <p className="text-[10px] text-neutral-500 dark:text-neutral-400 mt-1">{area.administrative_division_level_2_name}, {area.administrative_division_level_1_name} {area.postal_code}</p>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    <div>
                      <label className="text-[10px] uppercase font-bold text-neutral-500 dark:text-neutral-400 block mb-2">ALAMAT LENGKAP</label>
                      <textarea
                        rows={3}
                        placeholder="Nama jalan, nomor rumah, RT/RW, patokan..."
                        value={address.detail}
                        onChange={(e) => setAddress({ ...address, detail: e.target.value })}
                        className="w-full bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-sm px-4 py-3 text-xs text-black dark:text-white placeholder:text-neutral-400 focus:outline-none focus:border-[#C19A6B] transition-colors resize-none"
                      />
                    </div>

                    <div className="pt-2">
                      <Button
                        onClick={handleNext}
                        disabled={!address.name || !address.email || !address.detail || !address.areaId || isLoadingRates}
                        className="bg-[#121212] dark:bg-white hover:bg-black dark:hover:bg-neutral-200 text-white dark:text-black font-bold text-[11px] uppercase tracking-wider px-8 py-4 rounded-sm flex items-center gap-2 transition-colors"
                      >
                        {isLoadingRates ? 'MEMUAT ONGKIR...' : 'LANJUT PILIH KURIR'} <ArrowRight className="w-4 h-4" />
                      </Button>
                    </div>
                  </motion.div>
                )}

                {/* STEP 2: PENGIRIMAN */}
                {step === 2 && (
                  <motion.div
                    key="step2"
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 10 }}
                    className="space-y-5"
                  >
                    <h2 className="font-serif font-bold text-sm uppercase tracking-wider text-[#C19A6B]">PILIH EKSPEDISI / KURIR</h2>

                    <div className="space-y-3">
                      {shippingRates.length === 0 ? (
                        <p className="text-xs text-neutral-500 dark:text-neutral-400 py-4">Gagal memuat tarif pengiriman. Silakan kembali dan cek kecamatan alamat Anda.</p>
                      ) : (
                        shippingRates.map((courier: any) => (
                          <label
                            key={courier.id}
                            className={cn(
                              "flex items-center justify-between p-4 rounded-sm border cursor-pointer transition-colors text-xs",
                              courierName === courier.name ? "border-[#C19A6B] bg-neutral-50 dark:bg-neutral-900" : "border-neutral-200 dark:border-neutral-800 bg-white dark:bg-[#151515] hover:border-black dark:hover:border-white"
                            )}
                          >
                            <div className="flex items-center gap-3">
                              <input
                                type="radio"
                                name="courier"
                                className="accent-[#C19A6B]"
                                checked={courierName === courier.name}
                                onChange={() => {
                                  setShippingCost(courier.price)
                                  setCourierName(courier.name)
                                }}
                              />
                              <div>
                                <p className="font-bold text-black dark:text-white uppercase">{courier.name}</p>
                                <p className="text-[11px] text-neutral-500 dark:text-neutral-400 mt-1">{courier.courier} - {courier.estimated}</p>
                              </div>
                            </div>
                            <span className="font-bold text-[#C19A6B]">{formatPrice(courier.price)}</span>
                          </label>
                        ))
                      )}
                    </div>

                    <div className="flex items-center gap-4 pt-4 border-t border-neutral-200 dark:border-neutral-800">
                      <Button variant="outline" onClick={() => setStep(1)} className="border-neutral-300 dark:border-neutral-700 bg-transparent hover:bg-neutral-100 dark:hover:bg-neutral-800 text-black dark:text-white text-[11px] font-bold uppercase tracking-wider py-4 px-6 rounded-sm">
                        KEMBALI
                      </Button>
                      <Button
                        onClick={handleNext}
                        disabled={!courierName}
                        className="bg-[#121212] dark:bg-white hover:bg-black dark:hover:bg-neutral-200 text-white dark:text-black font-bold text-[11px] uppercase tracking-wider px-8 py-4 rounded-sm flex items-center gap-2 transition-colors"
                      >
                        LANJUT PEMBAYARAN <ArrowRight className="w-4 h-4" />
                      </Button>
                    </div>
                  </motion.div>
                )}

                {/* STEP 3: PEMBAYARAN */}
                {step === 3 && (
                  <motion.div
                    key="step3"
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 10 }}
                    className="space-y-5"
                  >
                    <h2 className="font-serif font-bold text-sm uppercase tracking-wider text-[#C19A6B]">PEMBAYARAN SECURE MIDTRANS</h2>

                    <div className="p-5 bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-sm space-y-3 text-xs">
                      <div className="flex items-center gap-2 text-[#C19A6B]">
                        <CheckCircle2 className="w-5 h-5" />
                        <span className="font-bold uppercase tracking-wider">PEMBAYARAN OTOMATIS & 100% AMAN</span>
                      </div>
                      <p className="text-neutral-500 dark:text-neutral-400 leading-relaxed font-medium">
                        Anda dapat memilih metode pembayaran seperti <strong>QRIS, Virtual Account BCA/Mandiri/BRI, Kartu Kredit, GoPay, atau ShopeePay</strong> secara langsung melalui pop-up transaksi Midtrans yang aman.
                      </p>
                    </div>

                    {errorMsg && (
                      <p className="text-xs text-red-500 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800/50 p-4 rounded-sm font-bold">
                        {errorMsg}
                      </p>
                    )}

                    <div className="flex items-center gap-4 pt-4 border-t border-neutral-200 dark:border-neutral-800">
                      <Button variant="outline" onClick={() => setStep(2)} className="border-neutral-300 dark:border-neutral-700 bg-transparent hover:bg-neutral-100 dark:hover:bg-neutral-800 text-black dark:text-white text-[11px] font-bold uppercase tracking-wider py-4 px-6 rounded-sm">
                        KEMBALI
                      </Button>
                      <Button
                        onClick={handleCheckout}
                        disabled={isProcessing}
                        className="bg-[#121212] dark:bg-white hover:bg-black dark:hover:bg-neutral-200 text-white dark:text-black font-bold text-[11px] uppercase tracking-wider py-4 rounded-sm flex-1 transition-colors"
                      >
                        {isProcessing ? 'MEMPROSES PESANAN...' : `BAYAR ${formatPrice(Math.max(0, totalPrice + shippingCost - (appliedVoucher?.discountAmount || 0)))}`}
                      </Button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Right Sidebar - Order Summary */}
            <div className="w-full lg:w-[360px] bg-white dark:bg-[#151515] border border-neutral-200 dark:border-neutral-800 rounded-sm p-6 sticky top-24 space-y-5 shadow-sm">
              <h3 className="font-serif font-bold text-sm uppercase tracking-wider text-[#C19A6B] pb-4 border-b border-neutral-200 dark:border-neutral-800">
                RINGKASAN ITEM
              </h3>

              <div className="space-y-4 max-h-[260px] overflow-y-auto pr-2 custom-scrollbar">
                {cartItems.map((item) => (
                  <div key={item.id} className="flex items-center gap-4 text-xs">
                    <div className="relative w-14 h-14 rounded-sm bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 overflow-hidden shrink-0">
                      <Image src={item.image || '/placeholder.jpg'} alt={item.name} fill className="object-cover" />
                    </div>
                    <div className="flex-1 min-w-0 space-y-1">
                      <p className="font-bold text-black dark:text-white truncate uppercase tracking-wider text-[11px]">{item.name}</p>
                      <p className="text-[10px] font-medium text-neutral-500 dark:text-neutral-400">{item.quantity}x @ {formatPrice(item.price)}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Voucher Input */}
              <div className="pt-4 border-t border-neutral-200 dark:border-neutral-800 space-y-3">
                <label className="text-[10px] font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400 flex items-center gap-1.5">
                  <Tag className="w-3.5 h-3.5 text-[#C19A6B]" /> KODE VOUCHER
                </label>
                {appliedVoucher ? (
                  <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 rounded-sm text-xs">
                    <div>
                      <span className="font-bold text-green-600 dark:text-green-500 uppercase tracking-wider">{appliedVoucher.code}</span>
                      <p className="text-[10px] text-green-700/80 dark:text-green-400/80 font-medium">Potongan {formatPrice(appliedVoucher.discountAmount)}</p>
                    </div>
                    <button onClick={handleRemoveVoucher} className="text-[10px] text-red-500 hover:text-red-600 font-bold uppercase tracking-wider">Hapus</button>
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={voucherCode}
                      onChange={(e) => setVoucherCode(e.target.value.toUpperCase())}
                      placeholder="KODE VOUCHER"
                      className="flex-1 bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-sm px-4 py-2.5 text-xs text-black dark:text-white placeholder:text-neutral-400 focus:outline-none focus:border-[#C19A6B] uppercase font-mono transition-colors"
                    />
                    <button
                      type="button"
                      onClick={handleApplyVoucher}
                      disabled={!voucherCode || isValidatingVoucher}
                      className="bg-[#121212] dark:bg-white text-white dark:text-black font-bold text-[11px] uppercase tracking-wider px-4 py-2.5 rounded-sm hover:bg-black dark:hover:bg-neutral-200 disabled:opacity-50 transition-colors"
                    >
                      {isValidatingVoucher ? '...' : 'GUNAKAN'}
                    </button>
                  </div>
                )}
              </div>

              <div className="space-y-3 text-xs font-medium border-t border-neutral-200 dark:border-neutral-800 pt-4">
                <div className="flex justify-between text-neutral-500 dark:text-neutral-400">
                  <span>Subtotal</span>
                  <span className="font-bold text-black dark:text-white">{formatPrice(totalPrice)}</span>
                </div>
                <div className="flex justify-between text-neutral-500 dark:text-neutral-400">
                  <span>Ongkir ({courierName || 'Belum dipilih'})</span>
                  <span className="font-bold text-black dark:text-white">{shippingCost > 0 ? formatPrice(shippingCost) : '-'}</span>
                </div>
                {appliedVoucher && (
                  <div className="flex justify-between text-green-600 dark:text-green-500 font-bold">
                    <span>Voucher ({appliedVoucher.code})</span>
                    <span>-{formatPrice(appliedVoucher.discountAmount)}</span>
                  </div>
                )}
                <div className="flex justify-between items-center border-t border-neutral-200 dark:border-neutral-800 pt-4 text-sm">
                  <span className="font-bold text-black dark:text-white uppercase tracking-wider">TOTAL</span>
                  <span className="font-bold text-xl text-[#C19A6B]">
                    {formatPrice(Math.max(0, totalPrice + shippingCost - (appliedVoucher?.discountAmount || 0)))}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
