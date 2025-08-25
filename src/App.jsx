// src/App.jsx
import React, { useContext, useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, Navigate, useLocation } from 'react-router-dom';
import { Layout, Menu, Switch, ColorPicker, Typography, Space, Button, Spin, Result, Badge } from 'antd';
import {
  HomeOutlined, MenuOutlined as MenuIcon, ShoppingCartOutlined, UserOutlined,
  DesktopOutlined, ShopOutlined, SolutionOutlined, HistoryOutlined, TableOutlined,
  TeamOutlined, CalendarOutlined, InboxOutlined, SafetyOutlined, LogoutOutlined, DashboardOutlined, SettingOutlined // Added SafetyOutlined for roles
} from '@ant-design/icons';

import { ThemeProvider, ThemeContext } from './contexts/ThemeContext';
import { CartProvider, useCart } from './contexts/CartContext';
import { RoleProvider } from './contexts/RoleContext';
import { useAuth } from './hooks/useAuth';
import ThemeControls from './components/ThemeControls';

// Import Auth Pages
import LoginPage from './pages/auth/LoginPage';
import SignupPage from './pages/auth/SignupPage';

// Import Pages
import CustomerMenu from './pages/customer/CustomerMenu'; // Renamed for consistency
import CustomerCartPage from './pages/customer/CustomerCartPage';
import CustomerOrdersPage from './pages/customer/CustomerOrdersPage';
import CustomerProfilePage from './pages/customer/CustomerProfilePage'; // New
import CustomerReservationPage from './pages/customer/CustomerReservationPage'; // New

import AdminDashboardPage from './pages/admin/AdminDashboard';
import AdminOrderManagementPage from './pages/admin/AdminOrders';
import AdminMenuManagementPage from './pages/admin/AdminMenuManagementPage';
import WaiterTableViewPage from './pages/admin/WaiterTableViewPage';
import AdminStaffManagementPage from './pages/admin/AdminStaffManagementPage'; // New
import AdminReservationManagementPage from './pages/admin/AdminReservationManagementPage'; // New
import TableManagementPage from './pages/admin/TableManagementPage'; // New
import AdminInventoryManagementPage from './pages/admin/AdminInventoryManagementPage'; // New
import AdminSettingsPage from './pages/admin/AdminSettingsPage';
import WaiterTakeOrderPage from './pages/admin/WaiterTakeOrderPage';
import KitchenDisplaySystem from './pages/admin/KitchenDisplaySystem'; // New
import RoleManagementPage from './pages/admin/RoleManagementPage'; // New

import './App.css';

// Mock Pages (Placeholders for future full components)
const CustomerHomePage = () => <Typography.Title level={2} style={{textAlign: 'center', marginTop: 20}}>Welcome to RestauFlow!</Typography.Title>;
//const AdminSettingsPage = () => <Typography.Title level={2} style={{textAlign: 'center', marginTop: 20}}>Restaurant Settings (Admin)</Typography.Title>;
const ChefMenuAvailabilityPage = () => <Typography.Title level={2} style={{textAlign: 'center', marginTop: 20}}>Menu Item Availability (Chef)</Typography.Title>;
//const WaiterTakeOrderPage = () => <Typography.Title level={2} style={{textAlign: 'center', marginTop: 20}}>Take Order / New KOT (Waiter)</Typography.Title>;


const AppContent = () => {
  const { user, profile, loading: loadingAuth, signOut } = useAuth();
  const location = useLocation();

  const currentUser = user;

  // Show loading spinner during authentication
  if (loadingAuth) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <Spin size="large" tip="Loading..." />
      </div>
    );
  }

  // Redirect unauthenticated users to login
  if (!currentUser && !location.pathname.startsWith('/auth')) {
    return <Navigate to="/auth/login" replace />;
  }
  
  // Redirect authenticated users away from auth pages
  if (currentUser && location.pathname.startsWith('/auth')) {
    const redirectPath = currentUser.role === 'customer' 
      ? '/customer/home' 
      : currentUser.role === 'manager' 
        ? '/admin/dashboard'
        : currentUser.role === 'waiter'
          ? '/admin/tables'
          : currentUser.role === 'chef'
            ? '/admin/orders'
            : '/admin/dashboard';
    return <Navigate to={redirectPath} replace />;
  }
  
  // Show auth pages for unauthenticated users
  if (!currentUser && location.pathname.startsWith('/auth')) {
    return (
      <Routes>
        <Route path="/auth/login" element={<LoginPage />} />
        <Route path="/auth/signup" element={<SignupPage />} />
        <Route path="/auth/*" element={<Navigate to="/auth/login" replace />} />
      </Routes>
    );
  }

  // Role-based route protection
  if (currentUser) {
    if (currentUser.role === 'customer' && location.pathname.startsWith('/admin')) {
      return <Navigate to="/customer/home" replace />;
    }
    if (['manager', 'chef', 'waiter'].includes(currentUser.role) && location.pathname.startsWith('/customer')) {
      const adminPath = currentUser.role === 'manager' 
        ? 'dashboard' 
        : currentUser.role === 'waiter' 
          ? 'tables' 
          : 'orders';
      return <Navigate to={`/admin/${adminPath}`} replace />;
    }
  }

  return (
    <Routes>
      <Route path="/auth/login" element={<LoginPage />} />
      <Route path="/auth/signup" element={<SignupPage />} />
      <Route 
        path="/customer/*" 
        element={
          currentUser?.role === 'customer' 
            ? <CustomerLayout user={currentUser} onLogout={signOut} /> 
            : <Navigate to="/auth/login" replace />
        } 
      />
      <Route 
        path="/admin/*" 
        element={
          currentUser && ['manager', 'chef', 'waiter'].includes(currentUser.role) 
            ? <AdminLayout user={currentUser} onLogout={signOut} /> 
            : <Navigate to="/auth/login" replace />
        } 
      />
      <Route 
        path="*" 
        element={
          <Navigate 
            to={
              currentUser 
                ? (currentUser.role === 'customer' 
                    ? "/customer/home" 
                    : `/admin/${currentUser.role === 'manager' ? 'dashboard' : (currentUser.role === 'waiter' ? 'tables' : 'orders')}`
                  )
                : "/auth/login"
            } 
            replace 
          />
        } 
      />
    </Routes>
  );
};


const CustomerLayout = ({ user, onLogout }) => {
  const { Header, Content, Footer } = Layout;
  const { getCartTotalItems } = useCart();
  const { isDarkMode } = useContext(ThemeContext);
  const location = useLocation();

  const getSelectedKeys = () => {
    const path = location.pathname.replace('/customer/', '');
    if (path.startsWith('menu')) return ['menu'];
    if (path.startsWith('cart')) return ['cart'];
    if (path.startsWith('orders')) return ['orders'];
    if (path.startsWith('profile')) return ['profile'];
    if (path.startsWith('reservations')) return ['reservations'];
    return ['home'];
  };

  return (
    <Layout className="layout customer-layout">
      <Header style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 20px', position: 'sticky', top: 0, zIndex: 10, width: '100%' }}>
        <Typography.Title level={3} style={{ color: 'white', margin: 0, flexShrink: 0 }}>RestauFlow</Typography.Title>
        <Menu theme="dark" mode="horizontal" selectedKeys={getSelectedKeys()} style={{ flexGrow: 1, minWidth: 0, justifyContent: 'center' }}>
          <Menu.Item key="home" icon={<HomeOutlined />}><Link to="home">Home</Link></Menu.Item>
          <Menu.Item key="menu" icon={<MenuIcon />}><Link to="menu">Menu</Link></Menu.Item>
          <Menu.Item key="reservations" icon={<CalendarOutlined />}><Link to="reservations">Book a Table</Link></Menu.Item>
          <Menu.Item key="cart" icon={
            <Badge count={getCartTotalItems()} size="small" offset={[2, -3]}>
              <ShoppingCartOutlined />
            </Badge>}
          >
            <Link to="cart">Cart</Link>
          </Menu.Item>
          <Menu.Item key="orders" icon={<HistoryOutlined />}><Link to="orders">My Orders</Link></Menu.Item>
          <Menu.Item key="profile" icon={<UserOutlined />}><Link to="profile">My Profile</Link></Menu.Item>
        </Menu>
        <div style={{flexShrink: 0}}>
            <ThemeControls />
            <Button type="text" icon={<LogoutOutlined />} onClick={onLogout} style={{color: 'white'}}>Logout</Button>
        </div>
      </Header>
      <Content style={{ padding: '0 20px', marginTop: '20px' }}>
        <div className="site-layout-content" style={{ background: isDarkMode ? '#141414' : '#fff', minHeight: 'calc(100vh - 170px)' }}>
          <Routes>
            <Route path="home" element={<CustomerHomePage />} />
            <Route path="menu" element={<CustomerMenu />} />
            <Route path="cart" element={<CustomerCartPage />} />
            <Route path="orders" element={<CustomerOrdersPage />} />
            <Route path="profile" element={<CustomerProfilePage />} />
            <Route path="reservations" element={<CustomerReservationPage />} />
            <Route path="*" element={<Result status="404" title="404" subTitle="Sorry, the page you visited does not exist." extra={<Button type="primary"><Link to="home">Back Home</Link></Button>} />} />
          </Routes>
        </div>
      </Content>
      <Footer style={{ textAlign: 'center' }}>RestauFlow ©2024 Created with Ant Design</Footer>
    </Layout>
  );
};

const AdminLayout = ({ user, onLogout }) => {
  const { Sider, Header, Content, Footer } = Layout;
  const { isDarkMode } = useContext(ThemeContext);
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();

  const getAdminMenuItems = (role) => {
  const baseItems = [];

  if (role === 'manager') {
    baseItems.push(
      { key: 'dashboard', icon: <DashboardOutlined />, label: <Link to="dashboard">Dashboard</Link> },
      { key: 'kitchen-display', icon: <DesktopOutlined />, label: <Link to="kitchen-display">Kitchen Display</Link> },
      { key: 'orders', icon: <ShoppingCartOutlined />, label: <Link to="orders">Order Management</Link> },
      { key: 'menu-mgmt', icon: <MenuIcon />, label: <Link to="menu-mgmt">Menu Management</Link> },
      { key: 'inventory-mgmt', icon: <InboxOutlined />, label: <Link to="inventory-mgmt">Inventory Management</Link> },
      { key: 'tables', icon: <DesktopOutlined />, label: <Link to="tables">Table View</Link> },
      { key: 'table-mgmt', icon: <TableOutlined />, label: <Link to="table-mgmt">Table Management</Link> },
      { key: 'reservations-mgmt', icon: <CalendarOutlined />, label: <Link to="reservations-mgmt">Reservations</Link> },
      { key: 'staff-mgmt', icon: <TeamOutlined />, label: <Link to="staff-mgmt">Staff Management</Link> },
      { key: 'role-mgmt', icon: <SafetyOutlined />, label: <Link to="role-mgmt">Role Management</Link> },
      { key: 'settings', icon: <SettingOutlined />, label: <Link to="settings">Settings</Link> },
    );
  } else if (role === 'chef') {
    baseItems.push(
      { key: 'kitchen-display', icon: <DesktopOutlined />, label: <Link to="kitchen-display">Kitchen Display</Link> },
      { key: 'orders', icon: <ShoppingCartOutlined />, label: <Link to="orders">Kitchen Orders</Link> },
      { key: 'inventory-mgmt', icon: <InboxOutlined />, label: <Link to="inventory-mgmt">Inventory</Link> },
      { key: 'menu-availability', icon: <MenuIcon />, label: <Link to="menu-availability">Menu Availability</Link> },
    );
  } else if (role === 'waiter') {
    baseItems.push(
      { key: 'tables', icon: <DesktopOutlined />, label: <Link to="tables">Table View</Link> },
      { key: 'take-order', icon: <ShopOutlined />, label: <Link to="take-order">Take Order</Link> },
      { key: 'orders', icon: <ShoppingCartOutlined />, label: <Link to="orders">Current Orders</Link> },
    );
  }

  return baseItems;
};


  const getSelectedKeys = () => {
    const currentPath = location.pathname.replace('/admin/', '');
    const items = getAdminMenuItems(user.role);
    let bestMatch = items.length > 0 ? items[0].key : '';
    let highestMatchLength = 0;
    for (const item of items) {
        const itemKey = item.key; //.replace('/admin/', ''); // No need to replace here as key is already relative for matching
        if (currentPath === itemKey) return [item.key];
        if (currentPath.startsWith(itemKey) && itemKey.length > highestMatchLength) {
            bestMatch = item.key;
            highestMatchLength = itemKey.length;
        }
    }
    return [bestMatch];
  };

  return (
    <Layout style={{ minHeight: '100vh' }} className="admin-layout">
      <Sider collapsible collapsed={collapsed} onCollapse={(value) => setCollapsed(value)}
        style={{overflow: 'auto', height: '100vh', position: 'fixed', left: 0, top: 0, bottom: 0, zIndex: 11 }} // Ensure Sider is above content
      >
        <div style={{ height: '32px', margin: '16px', background: 'rgba(255, 255, 255, 0.2)', textAlign:'center', lineHeight:'32px', color:'white', fontWeight:'bold', borderRadius: '4px', overflow: 'hidden' }}>
          {collapsed ? 'RF' : 'RestauFlow Admin'}
        </div>
        <Menu theme="dark" selectedKeys={getSelectedKeys()} mode="inline" items={getAdminMenuItems(user.role)} />
      </Sider>
      <Layout style={{ marginLeft: collapsed ? 80 : 200, transition: 'margin-left 0.2s' }}>
        <Header style={{ padding: '0 16px', background: isDarkMode ? '#1f1f1f' : '#fff', display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'sticky', top: 0, zIndex: 10, width: '100%' }}>
            <Typography.Title level={4} style={{margin:0, color: isDarkMode ? 'white' : 'inherit'}}>Welcome, {user.name}</Typography.Title>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <ThemeControls />
                <Button type="text" icon={<LogoutOutlined />} onClick={onLogout} style={{color: isDarkMode ? 'white' : 'inherit'}}>Logout</Button>
            </div>
        </Header>
        <Content style={{ margin: '24px 16px 0', overflow: 'initial' }}>
          <div style={{ padding: 24, background: isDarkMode ? '#141414' : '#fff', minHeight: 'calc(100vh - 160px)', borderRadius: '8px' }}>
            <Routes>
              {user.role === 'manager' && <Route path="dashboard" element={<AdminDashboardPage />} />}
              {(user.role === 'manager' || user.role === 'chef') && <Route path="kitchen-display" element={<KitchenDisplaySystem />} />}
              {user.role === 'manager' && <Route path="menu-mgmt" element={<AdminMenuManagementPage />} />}
              {(user.role === 'manager' || user.role === 'chef') && <Route path="inventory-mgmt" element={<AdminInventoryManagementPage />} />}
              {user.role === 'manager' && <Route path="staff-mgmt" element={<AdminStaffManagementPage />} />}
              {user.role === 'manager' && <Route path="reservations-mgmt" element={<AdminReservationManagementPage />} />}
              {user.role === 'manager' && <Route path="table-mgmt" element={<TableManagementPage />} />}
              {user.role === 'manager' && <Route path="settings" element={<AdminSettingsPage />} />}
              {user.role === 'manager' && <Route path="role-mgmt" element={<RoleManagementPage />} />}

              {user.role === 'chef' && <Route path="menu-availability" element={<ChefMenuAvailabilityPage />} />}

              {(user.role === 'waiter' || user.role === 'manager') && <Route path="take-order" element={<WaiterTakeOrderPage />} />}
              
              {(user.role === 'manager' || user.role === 'chef' || user.role === 'waiter') &&
                <Route path="orders" element={<AdminOrderManagementPage />} />
              }
              {(user.role === 'manager' || user.role === 'waiter') &&
                <Route path="tables" element={<WaiterTableViewPage />} />
              }
              <Route path="*" element={<Result status="404" title="404" subTitle="Sorry, this admin page does not exist or you don't have access." extra={<Button type="primary"><Link to={user.role === 'manager' ? 'dashboard' : (user.role === 'waiter' ? 'tables' : 'orders')}>Back to Main</Link></Button>} />} />
            </Routes>
          </div>
        </Content>
        <Footer style={{ textAlign: 'center' }}>RestauFlow Admin Panel ©2024</Footer>
      </Layout>
    </Layout>
  );
};

function App() {
  return (
    <ThemeProvider>
      <RoleProvider>
        <CartProvider>
          <Router>
            <AppContent />
          </Router>
        </CartProvider>
      </RoleProvider>
    </ThemeProvider>
  );
}
export default App;