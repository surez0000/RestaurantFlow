/*
  # Advanced Row Level Security Policies
  
  1. Role-based access control policies
  2. Restaurant-specific data isolation
  3. Staff permissions based on assignments
  4. Customer data protection
*/

-- =============================================
-- HELPER FUNCTIONS FOR RLS
-- =============================================

-- Function to check if user has specific permission
CREATE OR REPLACE FUNCTION has_permission(permission_name TEXT)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM user_role_assignments ura
    JOIN custom_roles cr ON ura.role_id = cr.id
    WHERE ura.user_id = auth.uid()
    AND cr.permissions ? permission_name
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get user's restaurant IDs
CREATE OR REPLACE FUNCTION get_user_restaurant_ids()
RETURNS UUID[] AS $$
DECLARE
  restaurant_ids UUID[];
BEGIN
  SELECT ARRAY_AGG(DISTINCT rs.restaurant_id)
  INTO restaurant_ids
  FROM restaurant_staff rs
  WHERE rs.user_id = auth.uid() AND rs.is_active = true;
  
  RETURN COALESCE(restaurant_ids, ARRAY[]::UUID[]);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check if user is staff at restaurant
CREATE OR REPLACE FUNCTION is_restaurant_staff(restaurant_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM restaurant_staff rs
    WHERE rs.user_id = auth.uid() 
    AND rs.restaurant_id = $1 
    AND rs.is_active = true
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================
-- RESTAURANT POLICIES
-- =============================================

-- Staff can view restaurants they're assigned to
CREATE POLICY "Staff can view assigned restaurants" ON restaurants
  FOR SELECT USING (
    id = ANY(get_user_restaurant_ids()) OR
    has_permission('restaurants.view_all')
  );

-- Only admins can manage restaurants
CREATE POLICY "Admins can manage restaurants" ON restaurants
  FOR ALL USING (has_permission('restaurants.manage'));

-- =============================================
-- MENU MANAGEMENT POLICIES
-- =============================================

-- Staff can manage menu for their restaurants
CREATE POLICY "Staff can manage restaurant menu categories" ON menu_categories
  FOR ALL USING (
    is_restaurant_staff(restaurant_id) AND 
    has_permission('menu.manage')
  );

CREATE POLICY "Staff can manage restaurant menu items" ON menu_items
  FOR ALL USING (
    is_restaurant_staff(restaurant_id) AND 
    has_permission('menu.manage')
  );

-- Menu variants and modifiers follow parent item permissions
CREATE POLICY "Staff can manage menu variants" ON menu_item_variants
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM menu_items mi 
      WHERE mi.id = menu_item_id 
      AND is_restaurant_staff(mi.restaurant_id)
      AND has_permission('menu.manage')
    )
  );

CREATE POLICY "Staff can manage modifier groups" ON modifier_groups
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM menu_items mi 
      WHERE mi.id = menu_item_id 
      AND is_restaurant_staff(mi.restaurant_id)
      AND has_permission('menu.manage')
    )
  );

CREATE POLICY "Staff can manage modifiers" ON modifiers
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM modifier_groups mg
      JOIN menu_items mi ON mg.menu_item_id = mi.id
      WHERE mg.id = modifier_group_id 
      AND is_restaurant_staff(mi.restaurant_id)
      AND has_permission('menu.manage')
    )
  );

-- =============================================
-- ORDER MANAGEMENT POLICIES
-- =============================================

-- Customers can create orders
CREATE POLICY "Customers can create orders" ON orders
  FOR INSERT WITH CHECK (
    auth.uid() = customer_id OR
    (customer_id IS NULL AND auth.uid() IS NOT NULL)
  );

-- Staff can view and manage orders for their restaurants
CREATE POLICY "Staff can manage restaurant orders" ON orders
  FOR ALL USING (
    is_restaurant_staff(restaurant_id) AND 
    has_permission('orders.manage')
  );

-- Order items follow parent order permissions
CREATE POLICY "Order items follow parent order permissions" ON order_items
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM orders o 
      WHERE o.id = order_id 
      AND (
        auth.uid() = o.customer_id OR
        (is_restaurant_staff(o.restaurant_id) AND has_permission('orders.manage'))
      )
    )
  );

CREATE POLICY "Order modifiers follow parent order permissions" ON order_item_modifiers
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM order_items oi
      JOIN orders o ON oi.order_id = o.id
      WHERE oi.id = order_item_id 
      AND (
        auth.uid() = o.customer_id OR
        (is_restaurant_staff(o.restaurant_id) AND has_permission('orders.manage'))
      )
    )
  );

-- =============================================
-- INVENTORY POLICIES
-- =============================================

-- Staff can manage inventory for their restaurants
CREATE POLICY "Staff can manage restaurant inventory" ON inventory_items
  FOR ALL USING (
    is_restaurant_staff(restaurant_id) AND 
    has_permission('inventory.manage')
  );

CREATE POLICY "Staff can manage restaurant suppliers" ON suppliers
  FOR ALL USING (
    is_restaurant_staff(restaurant_id) AND 
    has_permission('inventory.manage')
  );

CREATE POLICY "Staff can view stock movements" ON stock_movements
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM inventory_items ii
      WHERE ii.id = inventory_item_id
      AND is_restaurant_staff(ii.restaurant_id)
      AND has_permission('inventory.view')
    )
  );

CREATE POLICY "Staff can create stock movements" ON stock_movements
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM inventory_items ii
      WHERE ii.id = inventory_item_id
      AND is_restaurant_staff(ii.restaurant_id)
      AND has_permission('inventory.manage')
    )
  );

-- =============================================
-- TABLE MANAGEMENT POLICIES
-- =============================================

-- Staff can manage tables for their restaurants
CREATE POLICY "Staff can manage restaurant tables" ON restaurant_tables
  FOR ALL USING (
    is_restaurant_staff(restaurant_id) AND 
    has_permission('tables.manage')
  );

-- Customers can view available tables (for QR code orders)
CREATE POLICY "Anyone can view available tables" ON restaurant_tables
  FOR SELECT USING (status = 'available');

-- =============================================
-- RESERVATION POLICIES
-- =============================================

-- Customers can create and view their own reservations
CREATE POLICY "Customers can manage own reservations" ON reservations
  FOR ALL USING (auth.uid() = customer_id);

-- Staff can manage reservations for their restaurants
CREATE POLICY "Staff can manage restaurant reservations" ON reservations
  FOR ALL USING (
    is_restaurant_staff(restaurant_id) AND 
    has_permission('reservations.manage')
  );

-- =============================================
-- STAFF MANAGEMENT POLICIES
-- =============================================

-- Users can view their own staff assignments
CREATE POLICY "Users can view own staff assignments" ON restaurant_staff
  FOR SELECT USING (auth.uid() = user_id);

-- Managers can manage staff for their restaurants
CREATE POLICY "Managers can manage restaurant staff" ON restaurant_staff
  FOR ALL USING (
    is_restaurant_staff(restaurant_id) AND 
    has_permission('staff.manage')
  );

-- =============================================
-- ROLE MANAGEMENT POLICIES
-- =============================================

-- Users can view their own role assignments
CREATE POLICY "Users can view own role assignments" ON user_role_assignments
  FOR SELECT USING (auth.uid() = user_id);

-- Only admins can manage roles
CREATE POLICY "Admins can manage roles" ON custom_roles
  FOR ALL USING (has_permission('roles.manage'));

CREATE POLICY "Admins can manage role assignments" ON user_role_assignments
  FOR ALL USING (has_permission('roles.manage'));