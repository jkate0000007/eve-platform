"use client"

import React from "react"
import { Button } from "@/components/ui/button"
import { AlertTriangle, RefreshCw } from "lucide-react"

interface ErrorBoundaryState {
  hasError: boolean
  error?: Error
}

interface ErrorBoundaryProps {
  children: React.ReactNode
  fallback?: React.ComponentType<{ error: Error; resetError: () => void }>
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    // Check if it's a storage error
    if (error.message.includes("Object not found") || error.message.includes("StorageApiError")) {
      console.warn("Storage error caught by boundary:", error.message)
      return { hasError: true, error }
    }
    
    // For other errors, still show the boundary
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("Error caught by boundary:", error, errorInfo)
  }

  resetError = () => {
    this.setState({ hasError: false, error: undefined })
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return <this.props.fallback error={this.state.error!} resetError={this.resetError} />
      }

      return (
        <div className="flex flex-col items-center justify-center min-h-[200px] p-6 bg-muted/50 rounded-lg">
          <AlertTriangle className="h-8 w-8 text-destructive mb-4" />
          <h3 className="text-lg font-semibold mb-2">Something went wrong</h3>
          <p className="text-sm text-muted-foreground text-center mb-4">
            {this.state.error?.message.includes("Object not found") 
              ? "Content is temporarily unavailable"
              : "An unexpected error occurred"
            }
          </p>
          <Button onClick={this.resetError} variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Try again
          </Button>
        </div>
      )
    }

    return this.props.children
  }
}

// Hook for functional components to handle errors
export function useErrorHandler() {
  const [error, setError] = React.useState<Error | null>(null)

  const handleError = React.useCallback((error: Error) => {
    console.error("Error handled by hook:", error)
    setError(error)
  }, [])

  const resetError = React.useCallback(() => {
    setError(null)
  }, [])

  return { error, handleError, resetError }
} 