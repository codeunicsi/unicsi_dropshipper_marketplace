'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'
import { useRouter } from 'next/navigation'
import { apiClient } from '@/lib/api-client'

export default function ConnectPage() {
  const router = useRouter()
  
  const [storeUrl, setStoreUrl] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  const handleConnect = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    console.log("storeUrl ==>", storeUrl);

    // Validate store URL format
    if (!storeUrl.trim()) {
      setError('Please enter your Shopify store URL')
      return
    }

    // Normalize the store URL
    let normalizedUrl = storeUrl.trim().toLowerCase()
    
    // Remove protocol if present
    if (normalizedUrl.startsWith('http://')) {
      normalizedUrl = normalizedUrl.replace('http://', '')
    } else if (normalizedUrl.startsWith('https://')) {
      normalizedUrl = normalizedUrl.replace('https://', '')
    }

    // Ensure it ends with .myshopify.com
    if (!normalizedUrl.includes('.myshopify.com')) {
      if (!normalizedUrl.includes('.')) {
        normalizedUrl = `${normalizedUrl}.myshopify.com`
      } else {
        setError('Please enter a valid Shopify store URL (e.g., your-store.myshopify.com)')
        return
      }
    }

    setIsLoading(true)

    try {
      // Call the OAuth initiation endpoint
      // const response = await fetch('/api/shopify/auth', {
      //   method: 'POST',
      //   headers: {
      //     'Content-Type': 'application/json',
      //   },
      //   body: JSON.stringify({ storeUrl: normalizedUrl }),
      // })

    
     console.log("normalizedUrl ==>", normalizedUrl);
      // const response = useShopify(normalizedUrl);
      const response = await apiClient.get(`dropshipper/shopify/connect?shop=${normalizedUrl}`)

      console.log("response ==>shopify",  response);

      if (!response.installUrl) {
        throw new Error('Failed to initiate OAuth flow')
      }

      const data = response.installUrl
      
      // Redirect to Shopify OAuth
      if (data) {
        window.location.href = data
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred. Please try again.')
      setIsLoading(false)
    }
  }
  console.log("storeUrl ==>", storeUrl);

  return (
    <main className="min-h-screen bg-gradient-to-b from-background to-secondary/20">
      <div className="container mx-auto px-4 py-12">
        {/* Header */}
        <div className="mb-12 text-center">
          <Button onClick={() => router.back()} className="inline-flex items-center gap-2 mb-6 text-white hover:text-white/80 my-button">
            <span>←</span>
            <span>Back</span>
          </Button>
          <h1 className="text-4xl font-bold text-foreground mb-3">Connect Your Shopify Store</h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Link your Shopify store to get started. We'll securely authenticate with your store and manage your inventory.
          </p>
        </div>

        {/* Form Card */}
        <div className="max-w-md mx-auto">
          <Card className="p-8 shadow-lg border-border/50">
            <form onSubmit={handleConnect} className="space-y-6">
              <div className="space-y-2">
                <label htmlFor="storeUrl" className="block text-sm font-medium text-foreground">
                  Shopify Store URL
                </label>
                <Input
                  id="storeUrl"
                  type="text"
                  placeholder="your-store.myshopify.com"
                  value={storeUrl}
                  onChange={(e) => setStoreUrl(e.target.value)}
                  disabled={isLoading}
                  className="h-11 text-base"
                />
                <p className="text-xs text-muted-foreground mt-2">
                  Enter your Shopify store domain. It usually looks like "your-store.myshopify.com"
                </p>
              </div>

              {error && (
                <div className="bg-destructive/10 border border-destructive/20 rounded-md p-3">
                  <p className="text-sm text-destructive">{error}</p>
                </div>
              )}

              <Button
                type="submit"
                disabled={isLoading}
                className="w-full h-11 text-base font-semibold bg-primary hover:bg-primary/90 my-button"
              >
                {isLoading ? (
                  <span className="flex items-center gap-2">
                    <span className="inline-block w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                    Connecting...
                  </span>
                ) : (
                  'Connect with Shopify'
                )}
              </Button>

              <div className="pt-4 border-t border-border">
                <p className="text-xs text-muted-foreground text-center">
                  This will redirect you to Shopify to authorize this app.
                </p>
              </div>
            </form>
          </Card>

          {/* Info Section */}
          <div className="mt-8 space-y-4">
            <div className="bg-secondary/30 border border-secondary rounded-lg p-4">
              <h3 className="font-semibold text-foreground mb-2">How it works</h3>
              <ol className="text-sm text-muted-foreground space-y-1 list-decimal list-inside">
                <li>Enter your store URL above</li>
                <li>You'll be redirected to Shopify to authorize</li>
                <li>Shopify returns a secure access token</li>
                <li>Your token is saved and ready to use</li>
              </ol>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
