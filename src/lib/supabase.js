// Mock data utilities for frontend-only application

// Helper function to simulate API success responses
export const handleMockSuccess = (data) => {
  return {
    success: true,
    data
  }
}

// Helper function to simulate API error responses
export const handleMockError = (message) => {
  console.error('Mock API Error:', message)
  return {
    success: false,
    error: message || 'An unexpected error occurred'
  }
}

// Simulate async operations with delays
export const mockDelay = (ms = 500) => {
  return new Promise(resolve => setTimeout(resolve, ms))
}