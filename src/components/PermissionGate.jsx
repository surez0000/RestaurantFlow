import React from 'react';
import { useRole } from '../contexts/RoleContext';
import { Result, Button } from 'antd';
import { LockOutlined } from '@ant-design/icons';

// Component to conditionally render based on permissions
const PermissionGate = ({ 
  permission, 
  permissions = [], 
  requireAll = false, 
  userId = null, 
  locationId = null,
  fallback = null,
  showFallback = true,
  children 
}) => {
  const { hasPermission, getUserPermissions } = useRole();
  
  // Get current user ID (in real app, from auth context)
  const currentUserId = userId || 'current-user-id'; // Replace with actual user ID
  
  let hasAccess = false;
  
  if (permission) {
    // Single permission check
    hasAccess = hasPermission(currentUserId, permission, locationId);
  } else if (permissions.length > 0) {
    // Multiple permissions check
    const userPermissions = getUserPermissions(currentUserId, locationId);
    
    if (requireAll) {
      // User must have ALL specified permissions
      hasAccess = permissions.every(perm => userPermissions.includes(perm));
    } else {
      // User must have ANY of the specified permissions
      hasAccess = permissions.some(perm => userPermissions.includes(perm));
    }
  }
  
  if (hasAccess) {
    return children;
  }
  
  // Show custom fallback if provided
  if (fallback) {
    return fallback;
  }
  
  // Show default access denied message
  if (showFallback) {
    return (
      <Result
        status="403"
        title="Access Denied"
        subTitle="You don't have permission to access this feature."
        icon={<LockOutlined />}
        extra={
          <Button type="primary" onClick={() => window.history.back()}>
            Go Back
          </Button>
        }
      />
    );
  }
  
  // Don't render anything
  return null;
};

export default PermissionGate;

// Convenience components for common use cases
export const AdminOnly = ({ children, fallback, showFallback = false }) => (
  <PermissionGate 
    permissions={['dashboard.view', 'settings.view']} 
    fallback={fallback}
    showFallback={showFallback}
  >
    {children}
  </PermissionGate>
);

export const ManagerOnly = ({ children, fallback, showFallback = false }) => (
  <PermissionGate 
    permissions={['staff.manage', 'financial.reports']} 
    fallback={fallback}
    showFallback={showFallback}
  >
    {children}
  </PermissionGate>
);

export const KitchenOnly = ({ children, fallback, showFallback = false }) => (
  <PermissionGate 
    permission="orders.kitchen_display"
    fallback={fallback}
    showFallback={showFallback}
  >
    {children}
  </PermissionGate>
);

export const WaiterOnly = ({ children, fallback, showFallback = false }) => (
  <PermissionGate 
    permissions={['tables.view', 'orders.create']} 
    fallback={fallback}
    showFallback={showFallback}
  >
    {children}
  </PermissionGate>
);