// Mock authentication hook for frontend-only application
import { useState, useEffect } from 'react'
import { mockDelay } from '../lib/supabase'

// Mock user data
const mockUsers = {
  'customer@example.com': {
    id: 'user-1',
    email: 'customer@example.com',
    role: 'customer',
    name: 'Customer User',
    full_name: 'Customer User',
    phone: '555-0001',
    avatar_url: null
  },
  'manager@example.com': {
    id: 'user-2',
    email: 'manager@example.com',
    role: 'manager',
    name: 'Manager User',
    full_name: 'Manager User',
    phone: '555-0002',
    avatar_url: null
  },
  'chef@example.com': {
    id: 'user-3',
    email: 'chef@example.com',
    role: 'chef',
    name: 'Chef User',
    full_name: 'Chef User',
    phone: '555-0003',
    avatar_url: null
  },
  'waiter@example.com': {
    id: 'user-4',
    email: 'waiter@example.com',
    role: 'waiter',
    name: 'Waiter User',
    full_name: 'Waiter User',
    phone: '555-0004',
    avatar_url: null
  }
}

export const useAuth = () => {
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('restauflow-auth-user')
    return savedUser ? JSON.parse(savedUser) : null
  })
  const [profile, setProfile] = useState(() => {
    const savedProfile = localStorage.getItem('restauflow-auth-profile')
    return savedProfile ? JSON.parse(savedProfile) : null
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (user) {
      localStorage.setItem('restauflow-auth-user', JSON.stringify(user))
    } else {
      localStorage.removeItem('restauflow-auth-user')
    }
  }, [user])

  useEffect(() => {
    if (profile) {
      localStorage.setItem('restauflow-auth-profile', JSON.stringify(profile))
    } else {
      localStorage.removeItem('restauflow-auth-profile')
    }
  }, [profile])

  const signUp = async (email, password, userData = {}) => {
    try {
      setLoading(true)
      setError(null)
      await mockDelay(1000)

      // Simulate user creation
      const newUser = {
        id: `user-${Date.now()}`,
        email,
        role: userData.role || 'customer',
        name: userData.full_name || email.split('@')[0],
        full_name: userData.full_name || '',
        phone: userData.phone || '',
        avatar_url: null,
        restaurant_name: userData.restaurant_name || null
      }

      setUser(newUser)
      setProfile(newUser)

      return { data: { user: newUser }, error: null }
    } catch (error) {
      setError(error.message)
      return { data: null, error: error.message }
    } finally {
      setLoading(false)
    }
  }

  const signIn = async (email, password) => {
    try {
      setLoading(true)
      setError(null)
      await mockDelay(1000)

      // Check if user exists in mock data
      const mockUser = mockUsers[email]
      if (!mockUser) {
        throw new Error('Invalid email or password')
      }

      setUser(mockUser)

      return { data: { user: mockUser }, error: null }
    } catch (error) {
      setError(error.message)
      return { data: null, error: error.message }
    } finally {
      setLoading(false)
    }
  }

  const signOut = async () => {
    try {
      setLoading(true)
      await mockDelay(500)
      
      setUser(null)
      setProfile(null)
    } catch (error) {
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }

  const updateProfile = async (updates) => {
    try {
      setLoading(true)
      setError(null)
      await mockDelay(800)

      const updatedProfile = { ...profile, ...updates }
      setProfile(updatedProfile)
      setUser(updatedProfile)
      
      return { data: updatedProfile, error: null }
    } catch (error) {
      setError(error.message)
      return { data: null, error: error.message }
    } finally {
      setLoading(false)
    }
  }

  const hasPermission = (permission) => {
    // Mock permission check based on role
    if (!profile) return false
    
    const rolePermissions = {
      'customer': [],
      'waiter': ['orders.view', 'orders.create', 'tables.view', 'menu.view'],
      'chef': ['orders.view', 'orders.kitchen_display', 'menu.availability', 'inventory.view'],
      'manager': ['dashboard.view', 'orders.manage', 'menu.manage', 'staff.manage', 'inventory.manage', 'tables.manage', 'reservations.manage', 'settings.view'],
      'admin': ['*'] // All permissions
    }
    
    const userPermissions = rolePermissions[profile.role] || []
    return userPermissions.includes('*') || userPermissions.includes(permission)
  }

  const hasRole = (roleName) => {
    return profile?.role === roleName
  }

  return {
    user,
    profile,
    loading,
    error,
    signUp,
    signIn,
    signOut,
    updateProfile,
    hasPermission,
    hasRole,
    isAuthenticated: !!user,
    isCustomer: profile?.role === 'customer',
    isStaff: ['staff', 'manager', 'admin', 'waiter', 'chef'].includes(profile?.role)
  }
}