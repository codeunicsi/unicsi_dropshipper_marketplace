'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { useRouter } from 'next/navigation'

export default function SuccessPage() {
  const router = useRouter()
  const [shopName, setShopName] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Get shop info from cookies or API
    const getShopInfo = async () => {
      try {
        const response = await fetch('/api/shopify/shop')
        if (response.ok) {
          const data = await response.json()
          setShopName(data.shop)
        }
      } catch (error) {
        console.error('Failed to fetch shop info:', error)
      } finally {
        setIsLoading(false)
      }
    }

    getShopInfo()
  }, [])

  return (
    <main className="min-h-screen bg-gradient-to-b from-background to-secondary/20 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Card className="p-8 shadow-lg border-border/50">
          <div className="text-center space-y-6">
            {/* Success Icon */}
            <div className="flex justify-center">
              <div className="w-16 h-16 my-button rounded-full flex items-center justify-center">
                <svg
                  className="w-8 h-8 text-primary-foreground"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
            </div>

            {/* Success Message */}
            <div>
              <h1 className="text-2xl font-bold text-foreground mb-2">
                Connection Successful!
              </h1>
              <p className="text-muted-foreground">
                {isLoading ? (
                  'Loading your store information...'
                ) : shopName ? (
                  <>
                    Your Shopify store <span className="font-semibold text-foreground">{shopName}</span> has been
                    successfully connected.
                  </>
                ) : (
                  'Your Shopify store has been successfully connected.'
                )}
              </p>
            </div>

            {/* Info Box */}
            <div className="bg-secondary/30 border border-secondary rounded-lg p-4 text-left">
              <h3 className="font-semibold text-foreground mb-2">What's next?</h3>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li className="flex gap-2">
                  <span className="text-accent">✓</span>
                  <span>Access token securely stored</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-accent">✓</span>
                  <span>Ready to manage your products</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-accent">✓</span>
                  <span>Can view your orders and inventory</span>
                </li>
              </ul>
            </div>

            {/* Action Buttons */}
            <div className="space-y-2">
              <Button className="w-full h-11 text-base font-semibold my-button hover:bg-primary/90 text-primary-foreground" onClick={() => router.push('/')}>
                  Go to Marketplace
                </Button>
              <Button
                variant="outline"
                  className="w-full h-11 text-base font-semibold"
                >
                  Connect Another Store
                </Button>
            </div>
          </div>
        </Card>

        {/* Footer Info */}
        <p className="text-center text-xs text-muted-foreground mt-6">
          Your access token is stored securely and will be used to authenticate future requests to your Shopify store.
        </p>
      </div>
    </main>
  )
}
