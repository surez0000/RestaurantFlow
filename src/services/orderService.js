import { supabase, handleSupabaseError, handleSupabaseSuccess } from '../lib/supabase'

export const orderService = {
  // Create new order
  async createOrder(orderData) {
    try {
      // Start a transaction
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert({
          ...orderData,
          order_number: await this.generateOrderNumber(orderData.restaurant_id)
        })
        .select()
        .single()

      if (orderError) throw orderError

      // Add order items
      if (orderData.items && orderData.items.length > 0) {
        const orderItems = orderData.items.map(item => ({
          order_id: order.id,
          menu_item_id: item.menu_item_id,
          variant_id: item.variant_id || null,
          quantity: item.quantity,
          unit_price: item.unit_price,
          total_price: item.total_price,
          special_instructions: item.special_instructions || null
        }))

        const { data: items, error: itemsError } = await supabase
          .from('order_items')
          .insert(orderItems)
          .select()

        if (itemsError) throw itemsError

        // Add modifiers for each item
        for (const item of orderData.items) {
          if (item.modifiers && item.modifiers.length > 0) {
            const orderItem = items.find(oi => oi.menu_item_id === item.menu_item_id)
            
            const modifiers = item.modifiers.map(mod => ({
              order_item_id: orderItem.id,
              modifier_id: mod.modifier_id,
              quantity: mod.quantity || 1,
              unit_price: mod.unit_price,
              total_price: mod.total_price
            }))

            const { error: modifiersError } = await supabase
              .from('order_item_modifiers')
              .insert(modifiers)

            if (modifiersError) throw modifiersError
          }
        }
      }

      return handleSupabaseSuccess(order)
    } catch (error) {
      return handleSupabaseError(error)
    }
  },

  // Generate unique order number
  async generateOrderNumber(restaurantId) {
    const today = new Date().toISOString().split('T')[0].replace(/-/g, '')
    
    const { data, error } = await supabase
      .from('orders')
      .select('order_number')
      .eq('restaurant_id', restaurantId)
      .like('order_number', `${today}%`)
      .order('created_at', { ascending: false })
      .limit(1)

    if (error) throw error

    let sequence = 1
    if (data && data.length > 0) {
      const lastNumber = data[0].order_number
      sequence = parseInt(lastNumber.slice(-3)) + 1
    }

    return `${today}${sequence.toString().padStart(3, '0')}`
  },

  // Get orders for a restaurant
  async getOrders(restaurantId, filters = {}) {
    try {
      let query = supabase
        .from('orders')
        .select(`
          *,
          restaurant_tables (
            table_number
          ),
          user_profiles (
            full_name,
            email
          ),
          order_items (
            *,
            menu_items (
              name,
              image_url
            ),
            menu_item_variants (
              name
            ),
            order_item_modifiers (
              *,
              modifiers (
                name
              )
            )
          )
        `)
        .eq('restaurant_id', restaurantId)

      // Apply filters
      if (filters.status) {
        query = query.eq('status', filters.status)
      }
      if (filters.order_type) {
        query = query.eq('order_type', filters.order_type)
      }
      if (filters.date_from) {
        query = query.gte('created_at', filters.date_from)
      }
      if (filters.date_to) {
        query = query.lte('created_at', filters.date_to)
      }

      const { data, error } = await query
        .order('created_at', { ascending: false })

      if (error) throw error
      return handleSupabaseSuccess(data)
    } catch (error) {
      return handleSupabaseError(error)
    }
  },

  // Get single order with full details
  async getOrder(orderId) {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          restaurant_tables (
            table_number
          ),
          user_profiles (
            full_name,
            email,
            phone
          ),
          order_items (
            *,
            menu_items (
              name,
              image_url
            ),
            menu_item_variants (
              name
            ),
            order_item_modifiers (
              *,
              modifiers (
                name
              )
            )
          )
        `)
        .eq('id', orderId)
        .single()

      if (error) throw error
      return handleSupabaseSuccess(data)
    } catch (error) {
      return handleSupabaseError(error)
    }
  },

  // Update order status
  async updateOrderStatus(orderId, status) {
    try {
      const { data, error } = await supabase
        .from('orders')
        .update({ 
          status,
          updated_at: new Date().toISOString()
        })
        .eq('id', orderId)
        .select()
        .single()

      if (error) throw error
      return handleSupabaseSuccess(data)
    } catch (error) {
      return handleSupabaseError(error)
    }
  },

  // Update order item status
  async updateOrderItemStatus(orderItemId, status) {
    try {
      const { data, error } = await supabase
        .from('order_items')
        .update({ status })
        .eq('id', orderItemId)
        .select()
        .single()

      if (error) throw error
      return handleSupabaseSuccess(data)
    } catch (error) {
      return handleSupabaseError(error)
    }
  },

  // Get real-time orders subscription
  subscribeToOrders(restaurantId, callback) {
    return supabase
      .channel(`orders:restaurant_id=eq.${restaurantId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'orders',
          filter: `restaurant_id=eq.${restaurantId}`
        },
        callback
      )
      .subscribe()
  },

  // Get kitchen display orders (preparing status)
  async getKitchenOrders(restaurantId) {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          restaurant_tables (
            table_number
          ),
          order_items (
            *,
            menu_items (
              name,
              prep_time_minutes
            ),
            menu_item_variants (
              name
            ),
            order_item_modifiers (
              *,
              modifiers (
                name
              )
            )
          )
        `)
        .eq('restaurant_id', restaurantId)
        .in('status', ['confirmed', 'preparing'])
        .order('created_at', { ascending: true })

      if (error) throw error
      return handleSupabaseSuccess(data)
    } catch (error) {
      return handleSupabaseError(error)
    }
  }
}