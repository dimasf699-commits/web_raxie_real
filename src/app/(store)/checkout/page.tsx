'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowLeft, ArrowRight, CircleCheck, ShieldCheck, MapPin, Truck, CreditCard } from 'lucide-react'
import { useCartStore } from '@/store/cart.store'
import { Button } from '@/components/ui/Button'
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
  const [paymentMethod, setPaymentMethod] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')
  const [shippingRates, setShippingRates] = useState<any[]>([])
  const [isLoadingRates, setIsLoadingRates] = useState(false)
  
  // Area Autocomplete State
  const [searchArea, setSearchArea] = useState('')
  const [areaResults, setAreaResults] = useState<any[]>([])
  const [isSearchingArea, setIsSearchingArea] = useState(false)
  const [showAreaDropdown, setShowAreaDropdown] = useState(false)

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
  }, [searchArea])

  useEffect(() => {
    setMounted(true)
    // Redirect if cart empty
    if (useCartStore.getState().items.length === 0) {
      router.push('/cart')
    }
  }, [router])

  if (!mounted || cartItems.length === 0) return null

  const handleNext = async () => {
    if (step === 1) {
      setIsLoadingRates(true)
      try {
        // Calculate total weight (mock 500g per item for now)
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

  const handleBack = () => {
    if (step > 1) setStep((s) => (s - 1) as CheckoutStep)
    else router.push('/cart')
  }

  const handleCheckout = async () => {
    setIsProcessing(true)
    setErrorMsg('')
    
    try {
      // Setup payload for API
      const payload = {
        items: cartItems,
        shipping: address,
        shippingCost,
        courierName: courierName || 'Reguler',
        paymentMethod
      }

      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Gagal memproses pesanan')
      }

      // If Midtrans Snap is ready
      if (data.snapToken && (window as any).snap) {
        (window as any).snap.pay(data.snapToken, {
          onSuccess: function (result: any) {
            clearCart()
            router.push(`/checkout/success?order=${data.orderNumber}`)
          },
          onPending: function (result: any) {
            clearCart()
            router.push(`/checkout/success?order=${data.orderNumber}&status=pending`)
          },
          onError: function (result: any) {
            clearCart()
            router.push(`/checkout/success?order=${data.orderNumber}&status=failed`)
          },
          onClose: function () {
            clearCart()
            router.push(`/checkout/success?order=${data.orderNumber}&status=pending`)
          }
        })
      } else {
        // Fallback for payment methods that don't use Midtrans (if any) or if token is missing
        clearCart()
        router.push(`/checkout/success?order=${data.orderNumber}&status=pending`)
      }
    } catch (err: any) {
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
      <Script src={snapScriptUrl} data-client-key={clientKey} strategy="lazyOnload" />
      <div className="container-raxie py-8 md:py-12 bg-[#FDFCFB] min-h-screen">
      <div className="max-w-6xl mx-auto flex flex-col lg:flex-row gap-8 lg:gap-12">
        
        {/* Left Col - Steps */}
        <div className="flex-1 w-full order-2 lg:order-1">
          {/* Breadcrumb Steps */}
          <div className="flex items-center gap-2 mb-8 text-sm md:text-base font-medium overflow-x-auto pb-2">
            <button onClick={handleBack} className="text-muted-foreground mr-2 hover:text-foreground">
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div className={cn("flex items-center gap-2 whitespace-nowrap", step >= 1 ? "text-foreground" : "text-muted-foreground")}>
              <div className={cn("w-6 h-6 rounded-full flex items-center justify-center text-xs text-white", step >= 1 ? "bg-tan-500" : "bg-muted")}>1</div>
              <span>Info Pengiriman</span>
            </div>
            <div className="w-8 h-[1px] bg-border mx-2"></div>
            <div className={cn("flex items-center gap-2 whitespace-nowrap", step >= 2 ? "text-foreground" : "text-muted-foreground")}>
              <div className={cn("w-6 h-6 rounded-full flex items-center justify-center text-xs text-white", step >= 2 ? "bg-tan-500" : "bg-muted")}>2</div>
              <span>Opsi Kurir</span>
            </div>
            <div className="w-8 h-[1px] bg-border mx-2"></div>
            <div className={cn("flex items-center gap-2 whitespace-nowrap", step >= 3 ? "text-foreground" : "text-muted-foreground")}>
              <div className={cn("w-6 h-6 rounded-full flex items-center justify-center text-xs text-white", step >= 3 ? "bg-tan-500" : "bg-muted")}>3</div>
              <span>Pembayaran</span>
            </div>
          </div>

          <AnimatePresence mode="wait">
            {/* STEP 1: ADDRESS */}
            {step === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <h2 className="font-serif text-2xl font-bold text-foreground">Informasi Kontak & Pengiriman</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Nama Lengkap</label>
                    <input 
                      type="text" 
                      value={address.name}
                      onChange={(e) => setAddress({...address, name: e.target.value})}
                      className="w-full bg-card border border-border rounded-lg px-4 py-3 focus:outline-none focus:border-tan-400 focus:ring-1 focus:ring-tan-400" 
                      placeholder="John Doe" 
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Email</label>
                    <input 
                      type="email" 
                      value={address.email}
                      onChange={(e) => setAddress({...address, email: e.target.value})}
                      className="w-full bg-card border border-border rounded-lg px-4 py-3 focus:outline-none focus:border-tan-400 focus:ring-1 focus:ring-tan-400" 
                      placeholder="john@example.com" 
                    />
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <label className="text-sm font-medium">Nomor WhatsApp</label>
                    <input 
                      type="tel" 
                      value={address.phone}
                      onChange={(e) => setAddress({...address, phone: e.target.value})}
                      className="w-full bg-card border border-border rounded-lg px-4 py-3 focus:outline-none focus:border-tan-400 focus:ring-1 focus:ring-tan-400" 
                      placeholder="08123456789" 
                    />
                  </div>
                  <div className="space-y-2 md:col-span-2 relative">
                    <label className="text-sm font-medium">Kecamatan Tujuan</label>
                    <input 
                      type="text" 
                      value={searchArea}
                      onChange={(e) => {
                        setSearchArea(e.target.value)
                        if (address.areaId) setAddress({...address, areaId: '', areaName: '', postalCode: ''})
                      }}
                      onFocus={() => { if(areaResults.length > 0) setShowAreaDropdown(true) }}
                      className="w-full bg-card border border-border rounded-lg px-4 py-3 focus:outline-none focus:border-tan-400 focus:ring-1 focus:ring-tan-400" 
                      placeholder="Ketik nama kecamatan..." 
                    />
                    {isSearchingArea && <p className="text-xs text-muted-foreground mt-1 absolute right-3 top-10">Mencari...</p>}
                    
                    {showAreaDropdown && areaResults.length > 0 && (
                      <div className="absolute z-50 w-full mt-1 bg-card border border-border rounded-lg shadow-lg max-h-60 overflow-y-auto">
                        {areaResults.map((area) => (
                          <div 
                            key={area.id}
                            className="px-4 py-3 hover:bg-muted cursor-pointer border-b border-border last:border-0"
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
                            <p className="font-medium text-sm">{area.name}</p>
                            <p className="text-xs text-muted-foreground">
                              {area.administrative_division_level_2_name}, {area.administrative_division_level_1_name} {area.postal_code}
                            </p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <label className="text-sm font-medium">Alamat Lengkap</label>
                    <textarea 
                      rows={3} 
                      value={address.detail}
                      onChange={(e) => setAddress({...address, detail: e.target.value})}
                      className="w-full bg-card border border-border rounded-lg px-4 py-3 focus:outline-none focus:border-tan-400 focus:ring-1 focus:ring-tan-400" 
                      placeholder="Jl. Sudirman No. 123, Kec. Kebayoran Baru, Jakarta Selatan, 12190"
                    ></textarea>
                  </div>
                </div>
                <Button 
                  onClick={handleNext} 
                  disabled={!address.name || !address.email || !address.detail || !address.areaId || isLoadingRates}
                  loading={isLoadingRates}
                  className="w-full md:w-auto"
                >
                  Lanjut ke Pengiriman
                </Button>
              </motion.div>
            )}

            {/* STEP 2: SHIPPING */}
            {step === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <h2 className="font-serif text-2xl font-bold text-foreground">Pilih Ekspedisi</h2>
                
                <div className="space-y-4">
                  {shippingRates.length === 0 ? (
                    <p className="text-muted-foreground text-sm py-4">Gagal memuat tarif pengiriman. Silakan kembali dan cek alamat Anda.</p>
                  ) : (
                    shippingRates.map((courier) => (
                      <label key={courier.id} className={cn(
                        "flex items-center justify-between p-4 border rounded-xl cursor-pointer transition-all",
                        shippingCost === courier.price && courierName === courier.name ? "border-tan-500 bg-tan-50/30" : "border-border hover:border-tan-300"
                      )}>
                        <div className="flex items-center gap-4">
                          <input 
                            type="radio" 
                            name="courier" 
                            className="w-5 h-5 text-tan-500 focus:ring-tan-500"
                            checked={shippingCost === courier.price && courierName === courier.name}
                            onChange={() => {
                              setShippingCost(courier.price)
                              setCourierName(courier.name)
                            }}
                          />
                          <div>
                            <p className="font-semibold text-foreground">{courier.name}</p>
                            <p className="text-sm text-muted-foreground">{courier.courier}</p>
                          </div>
                        </div>
                        <span className="font-bold">{formatPrice(courier.price)}</span>
                      </label>
                    ))
                  )}
                </div>

                <Button 
                  onClick={handleNext} 
                  disabled={!courierName}
                  className="w-full md:w-auto"
                >
                  Lanjut ke Pembayaran
                </Button>
              </motion.div>
            )}

            {/* STEP 3: PAYMENT */}
            {step === 3 && (
              <motion.div
                key="step3"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <h2 className="font-serif text-2xl font-bold text-foreground">Pilih Metode Pembayaran</h2>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {[
                    { id: 'qris', name: 'QRIS', icon: <CreditCard className="w-6 h-6" /> },
                    { id: 'bca', name: 'BCA Virtual Account', icon: <CreditCard className="w-6 h-6" /> },
                    { id: 'mandiri', name: 'Mandiri Virtual Account', icon: <CreditCard className="w-6 h-6" /> },
                    { id: 'cc', name: 'Kartu Kredit / Debit', icon: <CreditCard className="w-6 h-6" /> },
                  ].map((method) => (
                    <label key={method.id} className={cn(
                      "flex items-center gap-4 p-4 border rounded-xl cursor-pointer transition-all",
                      paymentMethod === method.id ? "border-tan-500 bg-tan-50/30 ring-1 ring-tan-500" : "border-border hover:border-tan-300"
                    )}>
                      <input 
                        type="radio" 
                        name="payment" 
                        className="sr-only"
                        checked={paymentMethod === method.id}
                        onChange={() => setPaymentMethod(method.id)}
                      />
                      <div className={cn("p-2 rounded-lg bg-card border", paymentMethod === method.id ? "text-tan-600 border-tan-200" : "text-muted-foreground")}>
                        {method.icon}
                      </div>
                      <span className="font-semibold text-foreground">{method.name}</span>
                    </label>
                  ))}
                </div>

                <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-900/50 rounded-xl flex items-start gap-3 mt-6">
                  <ShieldCheck className="w-6 h-6 text-yellow-600 shrink-0 mt-0.5" />
                  <p className="text-sm text-yellow-800 dark:text-yellow-200/80">
                    Pembayaran Anda diamankan oleh enkripsi tingkat bank. Raxie tidak pernah menyimpan data kartu kredit Anda.
                  </p>
                </div>

                {errorMsg && (
                  <p className="text-sm text-red-500 bg-red-50 dark:bg-red-950/30 px-3 py-2 rounded-lg mt-4">
                    {errorMsg}
                  </p>
                )}

                <Button 
                  onClick={handleCheckout} 
                  disabled={!paymentMethod || isProcessing}
                  className="w-full py-6 text-lg font-bold mt-4"
                >
                  {isProcessing ? 'Memproses Pesanan...' : `Bayar ${formatPrice(totalPrice + shippingCost)}`}
                </Button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Right Col - Order Summary Sidebar */}
        <div className="w-full lg:w-[400px] order-1 lg:order-2">
          <div className="bg-card border border-border shadow-sm rounded-2xl p-6 sticky top-24">
            <h3 className="font-serif font-bold text-lg text-foreground mb-4">Ringkasan Pesanan</h3>
            
            <div className="space-y-4 mb-6 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
              {cartItems.map((item) => (
                <div key={item.id} className="flex gap-4">
                  <div className="relative w-16 h-16 rounded-lg overflow-hidden bg-muted flex-shrink-0 border border-border">
                    <Image src={item.image} alt={item.name} fill className="object-cover" />
                    <div className="absolute -top-2 -right-2 w-5 h-5 bg-tan-500 text-white rounded-full flex items-center justify-center text-[10px] font-bold z-10 border-2 border-card">
                      {item.quantity}
                    </div>
                  </div>
                  <div className="flex-1 min-w-0 py-1">
                    <p className="font-semibold text-sm text-foreground truncate">{item.name}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{item.variantName}</p>
                    <p className="font-medium text-sm mt-1">{formatPrice(item.price)}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="space-y-3 text-sm border-t border-border pt-4 mb-4">
              <div className="flex justify-between text-muted-foreground">
                <span>Subtotal produk</span>
                <span className="font-medium text-foreground">{formatPrice(totalPrice)}</span>
              </div>
              <div className="flex justify-between text-muted-foreground">
                <span>Ongkos Kirim</span>
                <span className="font-medium text-foreground">
                  {shippingCost > 0 ? formatPrice(shippingCost) : '-'}
                </span>
              </div>
            </div>

            <div className="flex justify-between items-end border-t border-border pt-4">
              <span className="font-bold text-foreground">Total Keseluruhan</span>
              <span className="font-bold text-2xl text-tan-600 dark:text-tan-400">
                {formatPrice(totalPrice + shippingCost)}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
    </>
  )
}
