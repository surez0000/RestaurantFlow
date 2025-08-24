import React, { createContext, useContext, useState, useEffect } from 'react';

// Permission categories and actions
export const PERMISSIONS = {
  // Dashboard & Analytics
  DASHBOARD: {
    VIEW_DASHBOARD: 'dashboard.view',
    VIEW_ANALYTICS: 'dashboard.analytics',
    EXPORT_REPORTS: 'dashboard.export',
  },
  
  // Order Management
  ORDERS: {
    VIEW_ORDERS: 'orders.view',
    CREATE_ORDERS: 'orders.create',
    UPDATE_ORDERS: 'orders.update',
    DELETE_ORDERS: 'orders.delete',
    MANAGE_STATUS: 'orders.status',
    VIEW_KITCHEN_DISPLAY: 'orders.kitchen_display',
  },
  
  // Menu Management
  MENU: {
    VIEW_MENU: 'menu.view',
    CREATE_ITEMS: 'menu.create',
    UPDATE_ITEMS: 'menu.update',
    DELETE_ITEMS: 'menu.delete',
    MANAGE_CATEGORIES: 'menu.categories',
    SET_AVAILABILITY: 'menu.availability',
    MANAGE_PRICING: 'menu.pricing',
  },
  
  // Inventory Management
  INVENTORY: {
    VIEW_INVENTORY: 'inventory.view',
    CREATE_ITEMS: 'inventory.create',
    UPDATE_ITEMS: 'inventory.update',
    DELETE_ITEMS: 'inventory.delete',
    ADJUST_STOCK: 'inventory.adjust',
    VIEW_MOVEMENTS: 'inventory.movements',
    MANAGE_SUPPLIERS: 'inventory.suppliers',
  },
  
  // Staff Management
  STAFF: {
    VIEW_STAFF: 'staff.view',
    CREATE_STAFF: 'staff.create',
    UPDATE_STAFF: 'staff.update',
    DELETE_STAFF: 'staff.delete',
    MANAGE_ROLES: 'staff.roles',
    VIEW_SCHEDULES: 'staff.schedules',
    MANAGE_SCHEDULES: 'staff.schedules.manage',
  },
  
  // Table Management
  TABLES: {
    VIEW_TABLES: 'tables.view',
    CREATE_TABLES: 'tables.create',
    UPDATE_TABLES: 'tables.update',
    DELETE_TABLES: 'tables.delete',
    MANAGE_LAYOUT: 'tables.layout',
    ASSIGN_ORDERS: 'tables.assign',
  },
  
  // Customer Management
  CUSTOMERS: {
    VIEW_CUSTOMERS: 'customers.view',
    CREATE_CUSTOMERS: 'customers.create',
    UPDATE_CUSTOMERS: 'customers.update',
    DELETE_CUSTOMERS: 'customers.delete',
    MANAGE_LOYALTY: 'customers.loyalty',
  },
  
  // Reservations
  RESERVATIONS: {
    VIEW_RESERVATIONS: 'reservations.view',
    CREATE_RESERVATIONS: 'reservations.create',
    UPDATE_RESERVATIONS: 'reservations.update',
    DELETE_RESERVATIONS: 'reservations.delete',
    CONFIRM_RESERVATIONS: 'reservations.confirm',
  },
  
  // Financial
  FINANCIAL: {
    VIEW_REPORTS: 'financial.reports',
    VIEW_TRANSACTIONS: 'financial.transactions',
    PROCESS_REFUNDS: 'financial.refunds',
    MANAGE_PRICING: 'financial.pricing',
    EXPORT_DATA: 'financial.export',
  },
  
  // Settings
  SETTINGS: {
    VIEW_SETTINGS: 'settings.view',
    UPDATE_RESTAURANT_INFO: 'settings.restaurant',
    MANAGE_INTEGRATIONS: 'settings.integrations',
    MANAGE_NOTIFICATIONS: 'settings.notifications',
    SYSTEM_SETTINGS: 'settings.system',
  },
  
  // Multi-location
  LOCATIONS: {
    VIEW_ALL_LOCATIONS: 'locations.view_all',
    CREATE_LOCATIONS: 'locations.create',
    UPDATE_LOCATIONS: 'locations.update',
    DELETE_LOCATIONS: 'locations.delete',
    SWITCH_LOCATIONS: 'locations.switch',
  }
};

// Predefined roles with permissions
export const DEFAULT_ROLES = {
  // Customer role
  customer: {
    id: 'customer',
    name: 'Customer',
    description: 'Restaurant customers who can place orders',
    permissions: [],
    isSystemRole: true,
    locations: ['all']
  },
  
  // Super Admin - Full access
  super_admin: {
    id: 'super_admin',
    name: 'Super Administrator',
    description: 'Full system access across all locations',
    permissions: Object.values(PERMISSIONS).flatMap(category => Object.values(category)),
    isSystemRole: true,
    locations: ['all']
  },
  
  // Restaurant Manager - Location-specific full access
  manager: {
    id: 'manager',
    name: 'Restaurant Manager',
    description: 'Full restaurant operations management',
    permissions: [
      ...Object.values(PERMISSIONS.DASHBOARD),
      ...Object.values(PERMISSIONS.ORDERS),
      ...Object.values(PERMISSIONS.MENU),
      ...Object.values(PERMISSIONS.INVENTORY),
      ...Object.values(PERMISSIONS.STAFF),
      ...Object.values(PERMISSIONS.TABLES),
      ...Object.values(PERMISSIONS.CUSTOMERS),
      ...Object.values(PERMISSIONS.RESERVATIONS),
      ...Object.values(PERMISSIONS.FINANCIAL),
      ...Object.values(PERMISSIONS.SETTINGS),
    ],
    isSystemRole: true,
    locations: ['assigned']
  },
  
  // Head Chef - Kitchen operations
  head_chef: {
    id: 'head_chef',
    name: 'Head Chef',
    description: 'Kitchen operations and menu management',
    permissions: [
      PERMISSIONS.DASHBOARD.VIEW_DASHBOARD,
      ...Object.values(PERMISSIONS.ORDERS),
      PERMISSIONS.MENU.VIEW_MENU,
      PERMISSIONS.MENU.SET_AVAILABILITY,
      ...Object.values(PERMISSIONS.INVENTORY),
      PERMISSIONS.STAFF.VIEW_STAFF,
      PERMISSIONS.STAFF.VIEW_SCHEDULES,
    ],
    isSystemRole: true,
    locations: ['assigned']
  },
  
  // Chef - Kitchen operations
  chef: {
    id: 'chef',
    name: 'Chef',
    description: 'Kitchen operations and order preparation',
    permissions: [
      PERMISSIONS.ORDERS.VIEW_ORDERS,
      PERMISSIONS.ORDERS.MANAGE_STATUS,
      PERMISSIONS.ORDERS.VIEW_KITCHEN_DISPLAY,
      PERMISSIONS.MENU.VIEW_MENU,
      PERMISSIONS.MENU.SET_AVAILABILITY,
      PERMISSIONS.INVENTORY.VIEW_INVENTORY,
      PERMISSIONS.INVENTORY.ADJUST_STOCK,
    ],
    isSystemRole: true,
    locations: ['assigned']
  },
  
  // Waiter/Server
  waiter: {
    id: 'waiter',
    name: 'Waiter/Server',
    description: 'Table service and order management',
    permissions: [
      PERMISSIONS.ORDERS.VIEW_ORDERS,
      PERMISSIONS.ORDERS.CREATE_ORDERS,
      PERMISSIONS.ORDERS.UPDATE_ORDERS,
      PERMISSIONS.ORDERS.MANAGE_STATUS,
      PERMISSIONS.MENU.VIEW_MENU,
      ...Object.values(PERMISSIONS.TABLES),
      PERMISSIONS.CUSTOMERS.VIEW_CUSTOMERS,
      PERMISSIONS.RESERVATIONS.VIEW_RESERVATIONS,
      PERMISSIONS.RESERVATIONS.UPDATE_RESERVATIONS,
    ],
    isSystemRole: true,
    locations: ['assigned']
  },
  
  // Cashier
  cashier: {
    id: 'cashier',
    name: 'Cashier',
    description: 'Order processing and payment handling',
    permissions: [
      PERMISSIONS.ORDERS.VIEW_ORDERS,
      PERMISSIONS.ORDERS.CREATE_ORDERS,
      PERMISSIONS.ORDERS.UPDATE_ORDERS,
      PERMISSIONS.MENU.VIEW_MENU,
      PERMISSIONS.CUSTOMERS.VIEW_CUSTOMERS,
      PERMISSIONS.CUSTOMERS.CREATE_CUSTOMERS,
      PERMISSIONS.FINANCIAL.VIEW_TRANSACTIONS,
      PERMISSIONS.FINANCIAL.PROCESS_REFUNDS,
    ],
    isSystemRole: true,
    locations: ['assigned']
  },
  
  // Inventory Manager
  inventory_manager: {
    id: 'inventory_manager',
    name: 'Inventory Manager',
    description: 'Inventory and supplier management',
    permissions: [
      PERMISSIONS.DASHBOARD.VIEW_DASHBOARD,
      ...Object.values(PERMISSIONS.INVENTORY),
      PERMISSIONS.MENU.VIEW_MENU,
      PERMISSIONS.FINANCIAL.VIEW_REPORTS,
    ],
    isSystemRole: true,
    locations: ['assigned']
  }
};

export const RoleContext = createContext();

export const RoleProvider = ({ children }) => {
  const [roles, setRoles] = useState(() => {
    const savedRoles = localStorage.getItem('restauflow-roles');
    return savedRoles ? JSON.parse(savedRoles) : DEFAULT_ROLES;
  });
  
  const [userRoleAssignments, setUserRoleAssignments] = useState(() => {
    const savedAssignments = localStorage.getItem('restauflow-role-assignments');
    return savedAssignments ? JSON.parse(savedAssignments) : {};
  });

  useEffect(() => {
    localStorage.setItem('restauflow-roles', JSON.stringify(roles));
  }, [roles]);

  useEffect(() => {
    localStorage.setItem('restauflow-role-assignments', JSON.stringify(userRoleAssignments));
  }, [userRoleAssignments]);

  // Create custom role
  const createRole = (roleData) => {
    const newRole = {
      id: `custom_${Date.now()}`,
      ...roleData,
      isSystemRole: false,
      createdAt: new Date().toISOString(),
    };
    setRoles(prev => ({ ...prev, [newRole.id]: newRole }));
    return newRole;
  };

  // Update role
  const updateRole = (roleId, updates) => {
    if (roles[roleId]?.isSystemRole) {
      throw new Error('Cannot modify system roles');
    }
    setRoles(prev => ({
      ...prev,
      [roleId]: { ...prev[roleId], ...updates, updatedAt: new Date().toISOString() }
    }));
  };

  // Delete role
  const deleteRole = (roleId) => {
    if (roles[roleId]?.isSystemRole) {
      throw new Error('Cannot delete system roles');
    }
    setRoles(prev => {
      const newRoles = { ...prev };
      delete newRoles[roleId];
      return newRoles;
    });
    // Remove role assignments
    setUserRoleAssignments(prev => {
      const newAssignments = { ...prev };
      Object.keys(newAssignments).forEach(userId => {
        newAssignments[userId] = newAssignments[userId].filter(assignment => assignment.roleId !== roleId);
      });
      return newAssignments;
    });
  };

  // Assign role to user
  const assignRole = (userId, roleId, locationIds = ['all']) => {
    setUserRoleAssignments(prev => ({
      ...prev,
      [userId]: [
        ...(prev[userId] || []).filter(assignment => assignment.roleId !== roleId),
        { roleId, locationIds, assignedAt: new Date().toISOString() }
      ]
    }));
  };

  // Remove role from user
  const removeRole = (userId, roleId) => {
    setUserRoleAssignments(prev => ({
      ...prev,
      [userId]: (prev[userId] || []).filter(assignment => assignment.roleId !== roleId)
    }));
  };

  // Check if user has permission
  const hasPermission = (userId, permission, locationId = null) => {
    const assignments = userRoleAssignments[userId] || [];
    
    for (const assignment of assignments) {
      const role = roles[assignment.roleId];
      if (!role) continue;
      
      // Check location access
      if (locationId && !assignment.locationIds.includes('all') && !assignment.locationIds.includes(locationId)) {
        continue;
      }
      
      // Check permission
      if (role.permissions.includes(permission)) {
        return true;
      }
    }
    
    return false;
  };

  // Get user roles
  const getUserRoles = (userId) => {
    const assignments = userRoleAssignments[userId] || [];
    return assignments.map(assignment => ({
      ...roles[assignment.roleId],
      locationIds: assignment.locationIds,
      assignedAt: assignment.assignedAt
    })).filter(Boolean);
  };

  // Get user permissions
  const getUserPermissions = (userId, locationId = null) => {
    const assignments = userRoleAssignments[userId] || [];
    const permissions = new Set();
    
    assignments.forEach(assignment => {
      const role = roles[assignment.roleId];
      if (!role) return;
      
      // Check location access
      if (locationId && !assignment.locationIds.includes('all') && !assignment.locationIds.includes(locationId)) {
        return;
      }
      
      role.permissions.forEach(permission => permissions.add(permission));
    });
    
    return Array.from(permissions);
  };

  // Check if user has any of the specified roles
  const hasAnyRole = (userId, roleIds) => {
    const assignments = userRoleAssignments[userId] || [];
    return assignments.some(assignment => roleIds.includes(assignment.roleId));
  };

  // Get all available permissions
  const getAllPermissions = () => {
    const allPermissions = [];
    Object.entries(PERMISSIONS).forEach(([category, permissions]) => {
      Object.entries(permissions).forEach(([key, permission]) => {
        allPermissions.push({
          id: permission,
          category,
          name: key.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase()),
          description: `${category.toLowerCase().replace(/_/g, ' ')} - ${key.replace(/_/g, ' ').toLowerCase()}`
        });
      });
    });
    return allPermissions;
  };

  const value = {
    roles,
    userRoleAssignments,
    createRole,
    updateRole,
    deleteRole,
    assignRole,
    removeRole,
    hasPermission,
    getUserRoles,
    getUserPermissions,
    hasAnyRole,
    getAllPermissions,
    PERMISSIONS,
    DEFAULT_ROLES
  };

  return (
    <RoleContext.Provider value={value}>
      {children}
    </RoleContext.Provider>
  );
};

export const useRole = () => {
  const context = useContext(RoleContext);
  if (!context) {
    throw new Error('useRole must be used within a RoleProvider');
  }
  return context;
};

// Higher-order component for permission-based rendering
export const withPermission = (permission, fallback = null) => (Component) => {
  return (props) => {
    const { hasPermission } = useRole();
    const { user } = props; // Assuming user is passed as prop
    
    if (!user || !hasPermission(user.id, permission)) {
      return fallback;
    }
    
    return <Component {...props} />;
  };
};

// Hook for permission checking
export const usePermission = (permission, userId = null) => {
  const { hasPermission } = useRole();
  // In real app, get current user from auth context
  return hasPermission(userId, permission);
};