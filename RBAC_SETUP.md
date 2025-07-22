# RBAC (Role-Based Access Control) Setup Guide

This guide will help you set up the complete role-based access control system for the OffiNeeds OMS application.

## 🚀 Quick Start

### 1. Database Setup

First, run the SQL setup script in your Supabase database:

1. Go to your Supabase dashboard
2. Navigate to the SQL Editor
3. Copy and paste the contents of `setup-rbac.sql`
4. Execute the script

This will create:
- `User_roles` table with default roles (admin, editor, viewer)
- `User_modules` table with all system modules
- `user_access` table for user permissions
- Necessary indexes and triggers

### 2. Frontend Setup

The frontend is already configured with the new RBAC system. The following files have been updated:

- `src/lib/rbacService.ts` - Core RBAC service
- `src/store/authStore.ts` - Updated auth store
- `src/pages/Admin.tsx` - Admin panel for user management
- `src/pages/Dashboard.tsx` - Role-aware dashboard
- `src/pages/ProductLibrary.tsx` - Role-aware product library

## 📋 System Overview

### Roles

1. **Admin** (Role_ID: 1)
   - Full system access
   - Can manage users and roles
   - Access to all modules with admin permissions

2. **Editor** (Role_ID: 2)
   - Read and write access to most modules
   - Cannot access admin functions
   - Can create, edit, and delete records

3. **Viewer** (Role_ID: 3)
   - Read-only access to limited modules
   - Can only view Dashboard and ProductLibrary
   - Cannot modify any data

### Modules

- **Dashboard** - Main overview page
- **JobCards** - Production job management
- **ProductLibrary** - Product catalog
- **ReturnInventory** - Return management
- **ReadyInventory** - Ready-to-ship inventory
- **PurchaseOrders** - Purchase order management
- **Admin** - System administration
- **AdminOnboarding** - Employee onboarding

### Access Levels

- **read** - Can view data only
- **write** - Can create, edit, and delete data
- **admin** - Full administrative access

## 🔧 Configuration

### Adding New Roles

1. Insert into `User_roles` table:
```sql
INSERT INTO oms_offineeds."User_roles" ("Role_ID", "Role_Name", "Role_Description") 
VALUES (4, 'manager', 'Department manager with specific permissions');
```

2. Update the `getDefaultAccessForRole` method in `rbacService.ts`

### Adding New Modules

1. Insert into `User_modules` table:
```sql
INSERT INTO oms_offineeds."User_modules" ("Module_ID", "module_name", "Module_Description") 
VALUES (9, 'Reports', 'System reports and analytics');
```

2. Update the component mapping in your frontend

### Granting User Access

Use the Admin panel or programmatically:

```typescript
import { rbacService } from '@/lib/rbacService';

// Grant admin access to a user
await rbacService.createUserAccess(
  userId,
  1, // admin role ID
  ['Dashboard', 'JobCards', 'ProductLibrary', 'Admin'],
  'admin',
  currentUserId
);
```

## 🛡️ Security Features

### Automatic Access Creation

- New users automatically get viewer access
- Trigger-based automatic access creation
- Timestamp tracking for all changes

### Permission Checking

```typescript
// Check if user can access a module
const canAccess = rbacService.canAccessModule(userAccess, 'JobCards');

// Check if user has specific permission level
const canEdit = rbacService.hasPermission(userAccess, 'JobCards', 'write');
```

### Frontend Protection

```typescript
// In components
const { hasPermission, canAccess } = useAuthStore();

if (!canAccess('Admin')) {
  return <AccessDenied />;
}

if (!hasPermission('JobCards', 'write')) {
  return <ReadOnlyView />;
}
```

## 📊 Admin Panel Features

The Admin panel (`/admin`) provides:

- **User Management**: View, create, edit, and delete users
- **Role Assignment**: Assign roles and modules to users
- **Permission Management**: Set access levels for each module
- **User Statistics**: Overview of user distribution and activity
- **Search and Filter**: Find users by name, email, role, or status

### Admin Panel Access

Only users with admin permissions can access the Admin panel:

```typescript
const canManageUsers = hasPermission('Admin', 'admin');
const canViewUsers = hasPermission('Admin', 'read');
```

## 🔄 Migration from Old System

If you're migrating from the old role system:

1. **Backup your data** before running the setup script
2. **Run the setup script** to create new tables
3. **Migrate existing users**:

```sql
-- Example migration for existing users
INSERT INTO oms_offineeds.user_access (user_id, role_id, module_id, access_level, status)
SELECT 
  u.id,
  CASE 
    WHEN u.role = 'admin' THEN 1
    WHEN u.role = 'editor' THEN 2
    ELSE 3
  END as role_id,
  'Dashboard' as module_id,
  CASE 
    WHEN u.role = 'admin' THEN 'admin'
    WHEN u.role = 'editor' THEN 'write'
    ELSE 'read'
  END as access_level,
  'active' as status
FROM oms_offineeds.users u
WHERE u.role IS NOT NULL;
```

## 🐛 Troubleshooting

### Common Issues

1. **"User not found" errors**
   - Ensure users exist in the `users` table
   - Check that user IDs match between auth and users tables

2. **Permission denied errors**
   - Verify user has access to the module
   - Check access level permissions
   - Ensure user status is 'active'

3. **Database connection issues**
   - Verify Supabase connection
   - Check table permissions
   - Ensure schema name is correct

### Debug Mode

Enable debug logging:

```typescript
// In your component
console.log('User access:', userAccess);
console.log('Can access Admin:', canAccess('Admin'));
console.log('Has write permission:', hasPermission('JobCards', 'write'));
```

## 📈 Performance Considerations

- **Caching**: User access is cached to reduce database queries
- **Indexes**: Database indexes on frequently queried columns
- **Lazy Loading**: Permissions checked only when needed
- **Batch Operations**: Multiple access records created in single transaction

## 🔮 Future Enhancements

Potential improvements:

1. **Dynamic Role Creation**: Allow admins to create custom roles
2. **Module Permissions**: Granular permissions within modules
3. **Audit Logging**: Track all permission changes
4. **Time-based Access**: Temporary access grants
5. **Group-based Access**: Assign permissions to groups

## 📞 Support

For issues or questions:

1. Check the troubleshooting section
2. Review the database schema
3. Test with different user roles
4. Check browser console for errors

---

**Note**: This RBAC system is designed to be secure, scalable, and maintainable. Always test thoroughly in a development environment before deploying to production. 