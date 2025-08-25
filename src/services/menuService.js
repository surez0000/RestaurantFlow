// Mock menu service for frontend-only application
import { mockDelay, handleMockSuccess, handleMockError } from '../lib/supabase'

// Mock menu data
const mockCategories = [
  { id: 'cat1', name: 'Appetizers', sort_order: 1, is_active: true },
  { id: 'cat2', name: 'Main Course', sort_order: 2, is_active: true },
  { id: 'cat3', name: 'Desserts', sort_order: 3, is_active: true },
  { id: 'cat4', name: 'Drinks', sort_order: 4, is_active: true }
]

const mockMenuItems = [
  {
    id: 'item1',
    name: 'Spring Rolls',
    description: 'Crispy vegetarian spring rolls served with sweet chili sauce',
    base_price: 8.99,
    category_id: 'cat1',
    is_available: true,
    is_vegetarian: true,
    image_url: 'https://images.unsplash.com/photo-1556761223-4c4282c73f77?q=80&w=300&auto=format&fit=crop',
    prep_time_minutes: 10
  },
  {
    id: 'item2',
    name: 'Margherita Pizza',
    description: 'Classic Italian pizza with fresh tomatoes, mozzarella, and basil',
    base_price: 15.00,
    category_id: 'cat2',
    is_available: true,
    is_vegetarian: true,
    image_url: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?q=80&w=300&auto=format&fit=crop',
    prep_time_minutes: 20
  },
  {
    id: 'item3',
    name: 'Chocolate Lava Cake',
    description: 'Warm dark chocolate cake with molten center',
    base_price: 9.50,
    category_id: 'cat3',
    is_available: true,
    is_vegetarian: true,
    image_url: 'https://images.unsplash.com/photo-1606890737304-57a1ca8a5b82?q=80&w=300&auto=format&fit=crop',
    prep_time_minutes: 15
  },
  {
    id: 'item4',
    name: 'Fresh Lemonade',
    description: 'Refreshing house-made lemonade with mint',
    base_price: 4.50,
    category_id: 'cat4',
    is_available: true,
    is_vegetarian: true,
    image_url: 'https://images.unsplash.com/photo-1598838073192-05906813520b?q=80&w=300&auto=format&fit=crop',
    prep_time_minutes: 5
  }
]

export const menuService = {
  // Get all menu categories for a restaurant
  async getCategories(restaurantId) {
    try {
      await mockDelay(300)
      return handleMockSuccess(mockCategories)
    } catch (error) {
      return handleMockError(error.message)
    }
  },

  // Get all menu items with variants and modifiers
  async getMenuItems(restaurantId, categoryId = null) {
    try {
      await mockDelay(500)
      let items = mockMenuItems
      
      if (categoryId) {
        items = items.filter(item => item.category_id === categoryId)
      }
      
      return handleMockSuccess(items)
    } catch (error) {
      return handleMockError(error.message)
    }
  },

  // Get single menu item with full details
  async getMenuItem(itemId) {
    try {
      await mockDelay(300)
      const item = mockMenuItems.find(item => item.id === itemId)
      
      if (!item) {
        throw new Error('Menu item not found')
      }
      
      return handleMockSuccess(item)
    } catch (error) {
      return handleMockError(error.message)
    }
  },

  // Create new menu item
  async createMenuItem(itemData) {
    try {
      await mockDelay(800)
      const newItem = {
        id: `item_${Date.now()}`,
        ...itemData,
        created_at: new Date().toISOString()
      }
      
      mockMenuItems.push(newItem)
      return handleMockSuccess(newItem)
    } catch (error) {
      return handleMockError(error.message)
    }
  },

  // Update menu item
  async updateMenuItem(itemId, updates) {
    try {
      await mockDelay(600)
      const itemIndex = mockMenuItems.findIndex(item => item.id === itemId)
      
      if (itemIndex === -1) {
        throw new Error('Menu item not found')
      }
      
      mockMenuItems[itemIndex] = {
        ...mockMenuItems[itemIndex],
        ...updates,
        updated_at: new Date().toISOString()
      }
      
      return handleMockSuccess(mockMenuItems[itemIndex])
    } catch (error) {
      return handleMockError(error.message)
    }
  },

  // Delete menu item
  async deleteMenuItem(itemId) {
    try {
      await mockDelay(400)
      const itemIndex = mockMenuItems.findIndex(item => item.id === itemId)
      
      if (itemIndex === -1) {
        throw new Error('Menu item not found')
      }
      
      mockMenuItems.splice(itemIndex, 1)
      return handleMockSuccess({ id: itemId })
    } catch (error) {
      return handleMockError(error.message)
    }
  },

  // Update item availability
  async updateAvailability(itemId, isAvailable) {
    try {
      await mockDelay(300)
      const itemIndex = mockMenuItems.findIndex(item => item.id === itemId)
      
      if (itemIndex === -1) {
        throw new Error('Menu item not found')
      }
      
      mockMenuItems[itemIndex].is_available = isAvailable
      mockMenuItems[itemIndex].updated_at = new Date().toISOString()
      
      return handleMockSuccess(mockMenuItems[itemIndex])
    } catch (error) {
      return handleMockError(error.message)
    }
  }
}