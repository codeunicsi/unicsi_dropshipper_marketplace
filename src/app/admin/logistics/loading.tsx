'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'

async function simulateDataFetch() {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        title: 'Welcome to Your App',
        items: [
          { id: 1, name: 'Item 1', description: 'This is the first item' },
          { id: 2, name: 'Item 2', description: 'This is the second item' },
          { id: 3, name: 'Item 3', description: 'This is the third item' },
          { id: 4, name: 'Item 4', description: 'This is the fourth item' },
          { id: 5, name: 'Item 5', description: 'This is the fifth item' },
          { id: 6, name: 'Item 6', description: 'This is the sixth item' },
        ],
      })
    }, 2000)
  })
}

export default function Loading() {
  const [isLoading, setIsLoading] = useState(false)

  const handleNavigation = async () => {
    setIsLoading(true)
    await simulateDataFetch()
    setIsLoading(false)
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background p-6 md:p-8 space-y-8 animate-pulse">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="w-1/4 h-8 bg-muted rounded-md" />
            <div className="w-20 h-10 bg-muted rounded-md" />
          </div>
          <div className="w-full h-2 bg-muted rounded-full" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="bg-card border border-border rounded-lg p-6 space-y-4">
              <div className="w-3/4 h-6 bg-muted rounded-md" />
              <div className="w-full h-4 bg-muted rounded-md" />
              <div className="w-5/6 h-4 bg-muted rounded-md" />
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <main className="min-h-screen bg-background p-6 md:p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-foreground">Welcome to Your App</h1>
            <p className="text-muted-foreground mt-2">Click the button below to see the loading skeleton</p>
          </div>
          <Button onClick={handleNavigation} className="bg-primary text-primary-foreground hover:bg-primary/90">
            Simulate Loading
          </Button>
        </div>

        <div className="w-full h-1 bg-border rounded-full" />

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((item) => (
            <Card key={item} className="p-6 hover:shadow-lg transition-shadow">
              <div className="space-y-4">
                <h3 className="text-xl font-semibold text-card-foreground">Item {item}</h3>
                <p className="text-muted-foreground">This is a loading skeleton.</p>
                <Button variant="outline" className="w-full bg-transparent">
                  Learn More
                </Button>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </main>
  )
}