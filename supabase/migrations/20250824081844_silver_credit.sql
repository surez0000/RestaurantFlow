/*
  # RestauFlow Initial Database Schema
  
  1. Authentication & User Management
    - Custom user profiles linked to auth.users
    - Role-based access control
    - Multi-location support
  
  2. Restaurant Management
    - Restaurant/location information
    - Staff management with roles
    - Table management
  
  3. Menu System
    - Categories and items
    - Variants and modifiers
    - Pricing and availability
  
  4. Order Management
    - Orders with items
    - Order status tracking
    - Real-time updates
  
  5. Inventory System
    - Inventory items
    - Stock movements
    - Supplier management
*/

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- =============================================
-- 1. AUTHENTICATION & USER MANAGEMENT
-- =============================================

-- User profiles (extends auth.users)
CREATE TABLE IF NOT EXISTS user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  phone TEXT,
  avatar_url TEXT,
  role TEXT NOT NULL DEFAULT 'customer' CHECK (role IN ('customer', 'staff', 'manager', 'admin')),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Custom roles and permissions
CREATE TABLE IF NOT EXISTS custom_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  permissions JSONB DEFAULT '[]'::jsonb,
  is_system_role BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- User role assignments (many-to-many)
CREATE TABLE IF NOT EXISTS user_role_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
  role_id UUID REFERENCES custom_roles(id) ON DELETE CASCADE,
  location_ids TEXT[] DEFAULT ARRAY['all'],
  assigned_at TIMESTAMPTZ DEFAULT NOW(),
  assigned_by UUID REFERENCES user_profiles(id),
  UNIQUE(user_id, role_id)
);

-- =============================================
-- 2. RESTAURANT MANAGEMENT
-- =============================================

-- Restaurant locations
CREATE TABLE IF NOT EXISTS restaurants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  address TEXT,
  phone TEXT,
  email TEXT,
  timezone TEXT DEFAULT 'UTC',
  currency TEXT DEFAULT 'USD',
  tax_rate DECIMAL(5,4) DEFAULT 0.0800,
  is_active BOOLEAN DEFAULT true,
  settings JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Staff assignments to restaurants
CREATE TABLE IF NOT EXISTS restaurant_staff (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  restaurant_id UUID REFERENCES restaurants(id) ON DELETE CASCADE,
  user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
  position TEXT,
  hourly_rate DECIMAL(10,2),
  is_active BOOLEAN DEFAULT true,
  hired_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(restaurant_id, user_id)
);

-- Tables management
CREATE TABLE IF NOT EXISTS restaurant_tables (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  restaurant_id UUID REFERENCES restaurants(id) ON DELETE CASCADE,
  table_number TEXT NOT NULL,
  capacity INTEGER NOT NULL DEFAULT 4,
  position_x INTEGER DEFAULT 0,
  position_y INTEGER DEFAULT 0,
  shape TEXT DEFAULT 'square' CHECK (shape IN ('square', 'round', 'rectangle')),
  status TEXT DEFAULT 'available' CHECK (status IN ('available', 'occupied', 'reserved', 'cleaning', 'out_of_order')),
  qr_code TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(restaurant_id, table_number)
);

-- =============================================
-- 3. MENU SYSTEM
-- =============================================

-- Menu categories
CREATE TABLE IF NOT EXISTS menu_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  restaurant_id UUID REFERENCES restaurants(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  sort_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Menu items
CREATE TABLE IF NOT EXISTS menu_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  restaurant_id UUID REFERENCES restaurants(id) ON DELETE CASCADE,
  category_id UUID REFERENCES menu_categories(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  description TEXT,
  base_price DECIMAL(10,2) NOT NULL,
  image_url TEXT,
  is_vegetarian BOOLEAN DEFAULT false,
  is_vegan BOOLEAN DEFAULT false,
  is_gluten_free BOOLEAN DEFAULT false,
  allergens TEXT[],
  prep_time_minutes INTEGER DEFAULT 15,
  calories INTEGER,
  is_available BOOLEAN DEFAULT true,
  tags TEXT[],
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Menu item variants (sizes, etc.)
CREATE TABLE IF NOT EXISTS menu_item_variants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  menu_item_id UUID REFERENCES menu_items(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  price_modifier DECIMAL(10,2) DEFAULT 0,
  is_default BOOLEAN DEFAULT false,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Modifier groups (toppings, sides, etc.)
CREATE TABLE IF NOT EXISTS modifier_groups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  menu_item_id UUID REFERENCES menu_items(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  selection_type TEXT DEFAULT 'single' CHECK (selection_type IN ('single', 'multiple')),
  is_required BOOLEAN DEFAULT false,
  min_selections INTEGER DEFAULT 0,
  max_selections INTEGER,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Individual modifiers
CREATE TABLE IF NOT EXISTS modifiers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  modifier_group_id UUID REFERENCES modifier_groups(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  price_modifier DECIMAL(10,2) DEFAULT 0,
  is_available BOOLEAN DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- 4. ORDER MANAGEMENT
-- =============================================

-- Orders
CREATE TABLE IF NOT EXISTS orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  restaurant_id UUID REFERENCES restaurants(id) ON DELETE CASCADE,
  customer_id UUID REFERENCES user_profiles(id) ON DELETE SET NULL,
  table_id UUID REFERENCES restaurant_tables(id) ON DELETE SET NULL,
  order_number TEXT NOT NULL,
  order_type TEXT NOT NULL CHECK (order_type IN ('dine_in', 'takeaway', 'delivery')),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'preparing', 'ready', 'completed', 'cancelled')),
  subtotal DECIMAL(10,2) NOT NULL DEFAULT 0,
  tax_amount DECIMAL(10,2) NOT NULL DEFAULT 0,
  total_amount DECIMAL(10,2) NOT NULL DEFAULT 0,
  payment_status TEXT DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'failed', 'refunded')),
  payment_method TEXT,
  special_instructions TEXT,
  estimated_prep_time INTEGER,
  customer_name TEXT,
  customer_phone TEXT,
  delivery_address TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Order items
CREATE TABLE IF NOT EXISTS order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
  menu_item_id UUID REFERENCES menu_items(id) ON DELETE RESTRICT,
  variant_id UUID REFERENCES menu_item_variants(id) ON DELETE SET NULL,
  quantity INTEGER NOT NULL DEFAULT 1,
  unit_price DECIMAL(10,2) NOT NULL,
  total_price DECIMAL(10,2) NOT NULL,
  special_instructions TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'preparing', 'ready', 'served')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Order item modifiers
CREATE TABLE IF NOT EXISTS order_item_modifiers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_item_id UUID REFERENCES order_items(id) ON DELETE CASCADE,
  modifier_id UUID REFERENCES modifiers(id) ON DELETE RESTRICT,
  quantity INTEGER DEFAULT 1,
  unit_price DECIMAL(10,2) NOT NULL,
  total_price DECIMAL(10,2) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- 5. INVENTORY SYSTEM
-- =============================================

-- Suppliers
CREATE TABLE IF NOT EXISTS suppliers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  restaurant_id UUID REFERENCES restaurants(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  contact_person TEXT,
  email TEXT,
  phone TEXT,
  address TEXT,
  category TEXT,
  rating DECIMAL(3,2) DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Inventory items
CREATE TABLE IF NOT EXISTS inventory_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  restaurant_id UUID REFERENCES restaurants(id) ON DELETE CASCADE,
  supplier_id UUID REFERENCES suppliers(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  category TEXT,
  unit TEXT NOT NULL,
  current_stock DECIMAL(10,3) DEFAULT 0,
  min_stock DECIMAL(10,3) DEFAULT 0,
  max_stock DECIMAL(10,3) DEFAULT 0,
  cost_per_unit DECIMAL(10,2) DEFAULT 0,
  expiry_date DATE,
  last_restocked_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Stock movements
CREATE TABLE IF NOT EXISTS stock_movements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  inventory_item_id UUID REFERENCES inventory_items(id) ON DELETE CASCADE,
  movement_type TEXT NOT NULL CHECK (movement_type IN ('in', 'out', 'adjustment')),
  quantity DECIMAL(10,3) NOT NULL,
  unit_cost DECIMAL(10,2),
  total_cost DECIMAL(10,2),
  reason TEXT,
  reference_id UUID, -- Could reference order_id, purchase_order_id, etc.
  created_by UUID REFERENCES user_profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- 6. RESERVATIONS
-- =============================================

-- Table reservations
CREATE TABLE IF NOT EXISTS reservations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  restaurant_id UUID REFERENCES restaurants(id) ON DELETE CASCADE,
  customer_id UUID REFERENCES user_profiles(id) ON DELETE SET NULL,
  table_id UUID REFERENCES restaurant_tables(id) ON DELETE SET NULL,
  customer_name TEXT NOT NULL,
  customer_phone TEXT NOT NULL,
  customer_email TEXT,
  party_size INTEGER NOT NULL,
  reservation_date DATE NOT NULL,
  reservation_time TIME NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'seated', 'completed', 'cancelled', 'no_show')),
  special_requests TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- INDEXES FOR PERFORMANCE
-- =============================================

-- User profiles indexes
CREATE INDEX IF NOT EXISTS idx_user_profiles_email ON user_profiles(email);
CREATE INDEX IF NOT EXISTS idx_user_profiles_role ON user_profiles(role);

-- Orders indexes
CREATE INDEX IF NOT EXISTS idx_orders_restaurant_id ON orders(restaurant_id);
CREATE INDEX IF NOT EXISTS idx_orders_customer_id ON orders(customer_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at);
CREATE INDEX IF NOT EXISTS idx_orders_order_number ON orders(order_number);

-- Menu items indexes
CREATE INDEX IF NOT EXISTS idx_menu_items_restaurant_id ON menu_items(restaurant_id);
CREATE INDEX IF NOT EXISTS idx_menu_items_category_id ON menu_items(category_id);
CREATE INDEX IF NOT EXISTS idx_menu_items_is_available ON menu_items(is_available);

-- Inventory indexes
CREATE INDEX IF NOT EXISTS idx_inventory_items_restaurant_id ON inventory_items(restaurant_id);
CREATE INDEX IF NOT EXISTS idx_stock_movements_inventory_item_id ON stock_movements(inventory_item_id);
CREATE INDEX IF NOT EXISTS idx_stock_movements_created_at ON stock_movements(created_at);

-- =============================================
-- ROW LEVEL SECURITY (RLS)
-- =============================================

-- Enable RLS on all tables
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE custom_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_role_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE restaurants ENABLE ROW LEVEL SECURITY;
ALTER TABLE restaurant_staff ENABLE ROW LEVEL SECURITY;
ALTER TABLE restaurant_tables ENABLE ROW LEVEL SECURITY;
ALTER TABLE menu_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE menu_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE menu_item_variants ENABLE ROW LEVEL SECURITY;
ALTER TABLE modifier_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE modifiers ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_item_modifiers ENABLE ROW LEVEL SECURITY;
ALTER TABLE suppliers ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE stock_movements ENABLE ROW LEVEL SECURITY;
ALTER TABLE reservations ENABLE ROW LEVEL SECURITY;

-- =============================================
-- BASIC RLS POLICIES
-- =============================================

-- User profiles: Users can read/update their own profile
CREATE POLICY "Users can view own profile" ON user_profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON user_profiles
  FOR UPDATE USING (auth.uid() = id);

-- Public read access for menu items (for customers)
CREATE POLICY "Anyone can view available menu items" ON menu_items
  FOR SELECT USING (is_available = true);

CREATE POLICY "Anyone can view menu categories" ON menu_categories
  FOR SELECT USING (is_active = true);

-- Orders: Customers can view their own orders
CREATE POLICY "Customers can view own orders" ON orders
  FOR SELECT USING (auth.uid() = customer_id);

CREATE POLICY "Customers can create orders" ON orders
  FOR INSERT WITH CHECK (auth.uid() = customer_id);

-- More specific policies will be added based on roles and permissions