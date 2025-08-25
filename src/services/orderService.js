// Mock order service for frontend-only application
import { mockDelay, handleMockSuccess, handleMockError } from '../lib/supabase'

// Mock orders data
let mockOrders = [
  {
    id: 'order1',
    order_number: 'ORD2024001',
    customer_name: 'Alice Wonderland',
    order_type: 'dine_in',
    table_number: 'T5',
    status: 'preparing',
    subtotal: 45.50,
    tax_amount: 3.64,
    total_amount: 49.14,
    payment_status: 'paid',
    payment_method: 'card',
    created_at: new Date(Date.now() - 5 * 60000).toISOString(), // 5 minutes ago
    items: [
      { id: 'item1', name: 'Margherita Pizza', quantity: 1, unit_price: 15.00, total_price: 15.00, special_instructions: 'Extra basil' },
      { id: 'item2', name: 'Coca-Cola', quantity: 2, unit_price: 2.50, total_price: 5.00 }
    ]
  },
  {
    id: 'order2',
    order_number: 'ORD2024002',
    customer_name: 'Bob Builder',
    order_type: 'takeaway',
    status: 'ready',
    subtotal: 22.00,
    tax_amount: 1.76,
    total_amount: 23.76,
    payment_status: 'pending',
    created_at: new Date(Date.now() - 3 * 60000).toISOString(), // 3 minutes ago
    items: [
      { id: 'item3', name: 'Angus Beef Burger', quantity: 1, unit_price: 14.00, total_price: 14.00 },
      { id: 'item4', name: 'Fries', quantity: 1, unit_price: 4.00, total_price: 4.00 }
    ]
  }
]

let orderCounter = 3

export const orderService = {
  // Create new order
  async createOrder(orderData) {
    try {
      await mockDelay(1000)
      
      const newOrder = {
        id: `order${Date.now()}`,
        order_number: await this.generateOrderNumber(),
        ...orderData,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
      
      mockOrders.unshift(newOrder)
      return handleMockSuccess(newOrder)
    } catch (error) {
      return handleMockError(error.message)
    }
  },

  // Generate unique order number
  async generateOrderNumber() {
    const today = new Date().toISOString().split('T')[0].replace(/-/g, '')
    const sequence = orderCounter++
    return `${today}${sequence.toString().padStart(3, '0')}`
  },

  // Get orders for a restaurant
  async getOrders(restaurantId, filters = {}) {
    try {
      await mockDelay(500)
      let filteredOrders = [...mockOrders]
      
      // Apply filters
      if (filters.status) {
        filteredOrders = filteredOrders.filter(order => order.status === filters.status)
      }
      if (filters.order_type) {
        filteredOrders = filteredOrders.filter(order => order.order_type === filters.order_type)
      }
      if (filters.date_from) {
        filteredOrders = filteredOrders.filter(order => new Date(order.created_at) >= new Date(filters.date_from))
      }
      if (filters.date_to) {
        filteredOrders = filteredOrders.filter(order => new Date(order.created_at) <= new Date(filters.date_to))
      }
      
      return handleMockSuccess(filteredOrders)
    } catch (error) {
      return handleMockError(error.message)
    }
  },

  // Get single order with full details
  async getOrder(orderId) {
    try {
      await mockDelay(300)
      const order = mockOrders.find(order => order.id === orderId)
      
      if (!order) {
        throw new Error('Order not found')
      }
      
      return handleMockSuccess(order)
    } catch (error) {
      return handleMockError(error.message)
    }
  },

  // Update order status
  async updateOrderStatus(orderId, status) {
    try {
      await mockDelay(400)
      const orderIndex = mockOrders.findIndex(order => order.id === orderId)
      
      if (orderIndex === -1) {
        throw new Error('Order not found')
      }
      
      mockOrders[orderIndex].status = status
      mockOrders[orderIndex].updated_at = new Date().toISOString()
      
      return handleMockSuccess(mockOrders[orderIndex])
    } catch (error) {
      return handleMockError(error.message)
    }
  },

  // Update order item status
  async updateOrderItemStatus(orderItemId, status) {
    try {
      await mockDelay(300)
      // Find order containing the item
      for (let order of mockOrders) {
        const itemIndex = order.items?.findIndex(item => item.id === orderItemId)
        if (itemIndex !== -1) {
          order.items[itemIndex].status = status
          return handleMockSuccess(order.items[itemIndex])
        }
      }
      
      throw new Error('Order item not found')
    } catch (error) {
      return handleMockError(error.message)
    }
  },

  // Mock real-time orders subscription
  subscribeToOrders(restaurantId, callback) {
    // Simulate real-time updates every 30 seconds
    const interval = setInterval(() => {
      // Randomly update an order status
      if (mockOrders.length > 0) {
        const randomOrder = mockOrders[Math.floor(Math.random() * mockOrders.length)]
        const statuses = ['pending', 'confirmed', 'preparing', 'ready', 'completed']
        const currentIndex = statuses.indexOf(randomOrder.status)
        if (currentIndex < statuses.length - 1) {
          randomOrder.status = statuses[currentIndex + 1]
          callback({ eventType: 'UPDATE', new: randomOrder })
        }
      }
    }, 30000)
    
    return {
      unsubscribe: () => clearInterval(interval)
    }
  },

  // Get kitchen display orders (preparing status)
  async getKitchenOrders(restaurantId) {
    try {
      await mockDelay(400)
      const kitchenOrders = mockOrders.filter(order => 
        ['confirmed', 'preparing'].includes(order.status)
      )
      
      return handleMockSuccess(kitchenOrders)
    } catch (error) {
      return handleMockError(error.message)
    }
  }
}