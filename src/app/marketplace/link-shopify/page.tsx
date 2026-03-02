'use client'

import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

export default function Page() {
  const router = useRouter()
  const [isConnected, setIsConnected] = useState(false)
  const [shop, setShop] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Check if user has a connected Shopify store
    const checkConnection = async () => {
      try {
        const response = await fetch('/api/shopify/shop')
        if (response.ok) {
          const data = await response.json()
          setIsConnected(true)
          setShop(data.shop)
        }
      } catch (error) {
        console.error('Failed to check connection:', error)
      } finally {
        setIsLoading(false)
      }
    }

    checkConnection()
  }, [])

  return (
    <main className="min-h-screen bg-gradient-to-b from-background to-secondary/20">
      <div className="container mx-auto px-4 py-12">
        {/* Header */}
        <div className="mb-12 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 my-button rounded-full mb-6">
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
                d="M13 10V3L4 14h7v7l9-11h-7z"
              />
            </svg>
          </div>
          <h1 className="text-4xl font-bold text-foreground mb-3">Shopify Store Manager</h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Manage your Shopify store seamlessly with secure OAuth authentication
          </p>
        </div>

        {/* Main Content */}
        <div className="max-w-2xl mx-auto">
          {isLoading ? (
            <Card className="p-8 text-center">
              <div className="inline-block w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin mb-4" />
              <p className="text-muted-foreground">Loading...</p>
            </Card>
          ) : isConnected ? (
            <Card className="p-8 shadow-lg border-border/50">
              <div className="text-center space-y-6">
                {/* Connected Status */}
                <div className="flex justify-center">
                  <div className="w-16 h-16 bg-accent/20 rounded-full flex items-center justify-center">
                    <svg
                      className="w-8 h-8 text-accent"
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

                <div>
                  <h2 className="text-2xl font-bold text-foreground mb-2">Connected</h2>
                  <p className="text-muted-foreground">
                    {shop && <span>Your store <span className="font-semibold text-foreground">{shop}</span> is connected and ready to use.</span>}
                  </p>
                </div>

                {/* Features */}
                <div className="grid grid-cols-1 gap-4 text-left">
                  <div className="flex gap-3 p-3 bg-secondary/30 rounded-lg">
                    <span className="text-accent font-bold">✓</span>
                    <div>
                      <h3 className="font-semibold text-foreground text-sm">Secure Authentication</h3>
                      <p className="text-xs text-muted-foreground">OAuth 2.0 with state validation</p>
                    </div>
                  </div>
                  <div className="flex gap-3 p-3 bg-secondary/30 rounded-lg">
                    <span className="text-accent font-bold">✓</span>
                    <div>
                      <h3 className="font-semibold text-foreground text-sm">Token Storage</h3>
                      <p className="text-xs text-muted-foreground">Access token securely saved</p>
                    </div>
                  </div>
                  <div className="flex gap-3 p-3 bg-secondary/30 rounded-lg">
                    <span className="text-accent font-bold">✓</span>
                    <div>
                      <h3 className="font-semibold text-foreground text-sm">Ready to Integrate</h3>
                      <p className="text-xs text-muted-foreground">Use token for API calls</p>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="space-y-2 pt-4">
                  <Button className="w-full h-11 text-base font-semibold bg-accent hover:bg-accent/90 text-accent-foreground">
                    View Connected Stores
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full h-11 text-base font-semibold"
                    onClick={() => router.push('/marketplace/connect')}
                  >
                    Connect Another Store
                  </Button>
                </div>
              </div>
            </Card>
          ) : (
            <Card className="p-8 shadow-lg border-border/50">
              <div className="text-center space-y-6">
                {/* Empty State */}
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
                        d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.658 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"
                      />
                    </svg>
                  </div>
                </div>

                <div>
                  <h2 className="text-2xl font-bold text-foreground mb-2">No Store Connected Yet</h2>
                  <p className="text-muted-foreground">
                    Connect your Shopify store to get started managing your products and orders.
                  </p>
                </div>

                {/* Setup Steps */}
                <div className="space-y-3 text-left">
                  <div className="flex gap-3">
                    <div className="flex items-center justify-center w-8 h-8 rounded-full my-button text-primary-foreground font-bold text-sm">
                      1
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground">Enter Store URL</h3>
                      <p className="text-sm text-muted-foreground">Provide your Shopify store domain</p>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <div className="flex items-center justify-center w-8 h-8 rounded-full my-button text-primary-foreground font-bold text-sm">
                      2
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground">Authorize with Shopify</h3>
                      <p className="text-sm text-muted-foreground">Securely authenticate with your store</p>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <div className="flex items-center justify-center w-8 h-8 rounded-full my-button text-primary-foreground font-bold text-sm">
                      3
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground">Token Saved</h3>
                      <p className="text-sm text-muted-foreground">Your access token is stored securely</p>
                    </div>
                  </div>
                </div>

                {/* CTA Button */}
                <Button className="w-full h-11 text-base font-semibold my-button text-primary-foreground" onClick={() => router.push('/marketplace/connect')}>
                  Connect Your Shopify Store
                </Button>
              </div>
            </Card>
          )}
        </div>

        {/* Footer Info */}
        <div className="mt-12 max-w-2xl mx-auto text-center">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <h3 className="font-semibold text-foreground mb-2">Secure OAuth 2.0</h3>
              <p className="text-sm text-muted-foreground">Enterprise-grade authentication with state validation and CSRF protection</p>
            </div>
            <div>
              <h3 className="font-semibold text-foreground mb-2">Token Management</h3>
              <p className="text-sm text-muted-foreground">Access tokens stored securely for seamless API integration</p>
            </div>
            <div>
              <h3 className="font-semibold text-foreground mb-2">Developer Friendly</h3>
              <p className="text-sm text-muted-foreground">Easy to extend with your own custom features</p>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
