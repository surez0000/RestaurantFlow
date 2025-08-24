import { supabase, handleSupabaseError, handleSupabaseSuccess } from '../lib/supabase'

export const menuService = {
  // Get all menu categories for a restaurant
  async getCategories(restaurantId) {
    try {
      const { data, error } = await supabase
        .from('menu_categories')
        .select('*')
        .eq('restaurant_id', restaurantId)
        .eq('is_active', true)
        .order('sort_order', { ascending: true })

      if (error) throw error
      return handleSupabaseSuccess(data)
    } catch (error) {
      return handleSupabaseError(error)
    }
  },

  // Get all menu items with variants and modifiers
  async getMenuItems(restaurantId, categoryId = null) {
    try {
      let query = supabase
        .from('menu_items')
        .select(`
          *,
          menu_categories (
            id,
            name
          ),
          menu_item_variants (
            id,
            name,
            price_modifier,
            is_default,
            sort_order
          ),
          modifier_groups (
            id,
            name,
            selection_type,
            is_required,
            min_selections,
            max_selections,
            sort_order,
            modifiers (
              id,
              name,
              price_modifier,
              is_available,
              sort_order
            )
          )
        `)
        .eq('restaurant_id', restaurantId)
        .eq('is_available', true)

      if (categoryId) {
        query = query.eq('category_id', categoryId)
      }

      const { data, error } = await query.order('name', { ascending: true })

      if (error) throw error
      return handleSupabaseSuccess(data)
    } catch (error) {
      return handleSupabaseError(error)
    }
  },

  // Get single menu item with full details
  async getMenuItem(itemId) {
    try {
      const { data, error } = await supabase
        .from('menu_items')
        .select(`
          *,
          menu_categories (
            id,
            name
          ),
          menu_item_variants (
            id,
            name,
            price_modifier,
            is_default,
            sort_order
          ),
          modifier_groups (
            id,
            name,
            selection_type,
            is_required,
            min_selections,
            max_selections,
            sort_order,
            modifiers (
              id,
              name,
              price_modifier,
              is_available,
              sort_order
            )
          )
        `)
        .eq('id', itemId)
        .single()

      if (error) throw error
      return handleSupabaseSuccess(data)
    } catch (error) {
      return handleSupabaseError(error)
    }
  },

  // Create new menu item
  async createMenuItem(itemData) {
    try {
      const { data, error } = await supabase
        .from('menu_items')
        .insert(itemData)
        .select()
        .single()

      if (error) throw error
      return handleSupabaseSuccess(data)
    } catch (error) {
      return handleSupabaseError(error)
    }
  },

  // Update menu item
  async updateMenuItem(itemId, updates) {
    try {
      const { data, error } = await supabase
        .from('menu_items')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', itemId)
        .select()
        .single()

      if (error) throw error
      return handleSupabaseSuccess(data)
    } catch (error) {
      return handleSupabaseError(error)
    }
  },

  // Delete menu item
  async deleteMenuItem(itemId) {
    try {
      const { error } = await supabase
        .from('menu_items')
        .delete()
        .eq('id', itemId)

      if (error) throw error
      return handleSupabaseSuccess({ id: itemId })
    } catch (error) {
      return handleSupabaseError(error)
    }
  },

  // Update item availability
  async updateAvailability(itemId, isAvailable) {
    try {
      const { data, error } = await supabase
        .from('menu_items')
        .update({ 
          is_available: isAvailable,
          updated_at: new Date().toISOString()
        })
        .eq('id', itemId)
        .select()
        .single()

      if (error) throw error
      return handleSupabaseSuccess(data)
    } catch (error) {
      return handleSupabaseError(error)
    }
  }
}