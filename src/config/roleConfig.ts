export const roleConfig = {
  admin: {
    name: 'Admin',
    description: 'Full system access with user management capabilities',
    permissions: {
      Dashboard: ['read', 'write', 'admin'] as const,
      JobCards: ['read', 'write', 'admin'] as const,
      ReturnInventory: ['read', 'write', 'admin'] as const,
      ReadyInventory: ['read', 'write', 'admin'] as const,
      PurchaseOrders: ['read', 'write', 'admin'] as const,
      ProductLibrary: ['read', 'write', 'admin'] as const,
      Admin: ['read', 'write', 'admin'] as const,
      AdminOnboarding: ['read', 'write', 'admin'] as const
    },
    resources: ['production', 'inventory', 'logistics', 'procurement', 'quality', 'reports', 'users', 'finance', 'sales']
  },
  editor: {
    name: 'Editor',
    description: 'Can edit and manage operational data',
    permissions: {
      Dashboard: ['read', 'write'] as const,
      JobCards: ['read', 'write'] as const,
      ReturnInventory: ['read', 'write'] as const,
      ReadyInventory: ['read', 'write'] as const,
      PurchaseOrders: ['read', 'write'] as const,
      ProductLibrary: ['read', 'write'] as const
    },
    resources: ['production', 'inventory', 'logistics', 'procurement']
  },
  viewer: {
    name: 'Viewer',
    description: 'Read-only access to view data',
    permissions: {
      Dashboard: ['read'] as const,
      ProductLibrary: ['read'] as const
    },
    resources: ['production', 'productlibrary']
  }
};

export const getRolePermissions = (role: string) => {
  return roleConfig[role as keyof typeof roleConfig]?.permissions || {};
};

export const getRoleResources = (role: string) => {
  return roleConfig[role as keyof typeof roleConfig]?.resources || [];
};

export const canAccessComponent = (role: string, component: string) => {
  const permissions = getRolePermissions(role);
  return !!permissions[component as keyof typeof permissions];
};

export const hasPermission = (role: string, component: string, action: 'read' | 'write' | 'admin') => {
  const permissions = getRolePermissions(role);
  const componentPermissions = permissions[component as keyof typeof permissions];
  
  if (!componentPermissions) return false;
  
  const permissionsArray = Array.isArray(componentPermissions) ? componentPermissions : [];
  
  switch (action) {
    case 'read':
      return permissionsArray.includes('read') || permissionsArray.includes('write') || permissionsArray.includes('admin');
    case 'write':
      return permissionsArray.includes('write') || permissionsArray.includes('admin');
    case 'admin':
      return permissionsArray.includes('admin');
    default:
      return false;
  }
};