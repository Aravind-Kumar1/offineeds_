import { supabase } from './supabaseClient';

export interface UserRole {
  Role_ID: number;
  Role_Name: string;
  Role_Description: string;
  Is_Active: boolean;
}

export interface UserModule {
  Module_ID: number;
  module_name: string;
  Module_Description: string;
  Is_Active: boolean;
}

export interface UserAccess {
  id: string;
  user_id: string;
  role_id: number;
  module_id: string;
  access_level: 'read' | 'write' | 'admin';
  status: string;
  created_at: string;
  created_by?: string;
  updated_at: string;
  updated_by?: string;
}

export interface UserWithAccess {
  id: string;
  name: string;
  email: string;
  Employee_ID: string;
  status: string;
  role: UserRole;
  modules: Array<{
    module: UserModule;
    access_level: 'read' | 'write' | 'admin';
  }>;
}

export type AccessLevel = 'read' | 'write' | 'admin';

class RBACService {
  private static instance: RBACService;
  private userAccessCache: Map<string, UserWithAccess> = new Map();

  static getInstance(): RBACService {
    if (!RBACService.instance) {
      RBACService.instance = new RBACService();
    }
    return RBACService.instance;
  }

  // Get all roles
  async getRoles(): Promise<UserRole[]> {
    try {
      const { data, error } = await supabase
        .schema('oms_offineeds')
        .from('User_roles')
        .select('*')
        .eq('Is_Active', true)
        .order('Role_ID');

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching roles:', error);
      return [];
    }
  }

  // Get all modules
  async getModules(): Promise<UserModule[]> {
    try {
      const { data, error } = await supabase
        .schema('oms_offineeds')
        .from('User_modules')
        .select('*')
        .eq('Is_Active', true)
        .order('Module_ID');

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching modules:', error);
      return [];
    }
  }

  // Get user with full access details
  async getUserWithAccess(userId: string): Promise<UserWithAccess | null> {
    // Check cache first
    if (this.userAccessCache.has(userId)) {
      return this.userAccessCache.get(userId)!;
    }

    try {
      // Get user details
      const { data: user, error: userError } = await supabase
        .schema('oms_offineeds')
        .from('users')
        .select('*')
        .eq('id', userId)
        .single();

      if (userError || !user) {
        console.error('User not found:', userId);
        return null;
      }

      // Get user access records
      const { data: accessRecords, error: accessError } = await supabase
        .schema('oms_offineeds')
        .from('user_access')
        .select(`
          *,
          User_roles!inner(Role_ID, Role_Name, Role_Description, Is_Active),
          User_modules!inner(Module_ID, module_name, Module_Description, Is_Active)
        `)
        .eq('user_id', userId)
        .eq('status', 'active');

      if (accessError) {
        console.error('Error fetching user access:', accessError);
        return null;
      }

      if (!accessRecords || accessRecords.length === 0) {
        console.log('No access records found for user:', userId);
        return null;
      }

      // Group by role and modules
      const role = accessRecords[0].User_roles;
      const modules = accessRecords.map(record => ({
        module: record.User_modules,
        access_level: record.access_level
      }));

      const userWithAccess: UserWithAccess = {
        id: user.id,
        name: user.name,
        email: user.email,
        Employee_ID: user.Employee_ID,
        status: user.status,
        role,
        modules
      };

      // Cache the result
      this.userAccessCache.set(userId, userWithAccess);
      return userWithAccess;
    } catch (error) {
      console.error('Error getting user with access:', error);
      return null;
    }
  }

  // Get user access by email
  async getUserAccessByEmail(email: string): Promise<UserWithAccess | null> {
    try {
      // First get user by email
      const { data: user, error: userError } = await supabase
        .schema('oms_offineeds')
        .from('users')
        .select('*')
        .eq('email', email)
        .single();

      if (userError || !user) {
        console.error('User not found by email:', email);
        return null;
      }

      return await this.getUserWithAccess(user.id);
    } catch (error) {
      console.error('Error getting user access by email:', error);
      return null;
    }
  }

  // Check if user can access a specific module
  canAccessModule(userAccess: UserWithAccess | null, moduleName: string): boolean {
    if (!userAccess || userAccess.status !== 'active' || !userAccess.modules) return false;
    
    const moduleAccess = userAccess.modules.find(m => m.module.module_name === moduleName);
    return !!moduleAccess;
  }

  // Check if user has specific permission level for a module
  hasPermission(userAccess: UserWithAccess | null, moduleName: string, level: AccessLevel): boolean {
    if (!userAccess || userAccess.status !== 'active' || !userAccess.modules) return false;
    
    const moduleAccess = userAccess.modules.find(m => m.module.module_name === moduleName);
    if (!moduleAccess) return false;

    const levels: AccessLevel[] = ['read', 'write', 'admin'];
    const userLevel = levels.indexOf(moduleAccess.access_level);
    const requiredLevel = levels.indexOf(level);

    return userLevel >= requiredLevel;
  }

  // Create user access record
  async createUserAccess(
    userId: string, 
    roleId: number, 
    moduleIds: string[], 
    accessLevel: AccessLevel = 'read',
    createdBy?: string
  ): Promise<boolean> {
    try {
      const accessRecords = moduleIds.map(moduleId => ({
        user_id: userId,
        role_id: roleId,
        module_id: moduleId,
        access_level: accessLevel,
        status: 'active',
        created_by: createdBy,
        updated_by: createdBy
      }));

      const { error } = await supabase
        .schema('oms_offineeds')
        .from('user_access')
        .insert(accessRecords);

      if (error) {
        console.error('Error creating user access:', error);
        return false;
      }

      // Clear cache for this user
      this.userAccessCache.delete(userId);
      return true;
    } catch (error) {
      console.error('Error creating user access:', error);
      return false;
    }
  }

  // Update user access
  async updateUserAccess(
    userId: string,
    moduleId: string,
    accessLevel: AccessLevel,
    updatedBy?: string
  ): Promise<boolean> {
    try {
      const { error } = await supabase
        .schema('oms_offineeds')
        .from('user_access')
        .update({
          access_level: accessLevel,
          updated_at: new Date().toISOString(),
          updated_by: updatedBy
        })
        .eq('user_id', userId)
        .eq('module_id', moduleId);

      if (error) {
        console.error('Error updating user access:', error);
        return false;
      }

      // Clear cache for this user
      this.userAccessCache.delete(userId);
      return true;
    } catch (error) {
      console.error('Error updating user access:', error);
      return false;
    }
  }

  // Delete user access
  async deleteUserAccess(userId: string, moduleId?: string): Promise<boolean> {
    try {
      let query = supabase
        .schema('oms_offineeds')
        .from('user_access')
        .delete();

      if (moduleId) {
        query = query.eq('user_id', userId).eq('module_id', moduleId);
      } else {
        query = query.eq('user_id', userId);
      }

      const { error } = await query;

      if (error) {
        console.error('Error deleting user access:', error);
        return false;
      }

      // Clear cache for this user
      this.userAccessCache.delete(userId);
      return true;
    } catch (error) {
      console.error('Error deleting user access:', error);
      return false;
    }
  }

  // Get all users with their access
  async getAllUsersWithAccess(): Promise<UserWithAccess[]> {
    try {
      const { data: users, error: usersError } = await supabase
        .schema('oms_offineeds')
        .from('users')
        .select('*')
        .eq('status', 'active')
        .order('name');

      if (usersError) throw usersError;

      const usersWithAccess: UserWithAccess[] = [];
      
      for (const user of users || []) {
        const userAccess = await this.getUserWithAccess(user.id);
        if (userAccess) {
          usersWithAccess.push(userAccess);
        }
      }

      return usersWithAccess;
    } catch (error) {
      console.error('Error getting all users with access:', error);
      return [];
    }
  }

  // Clear cache
  clearCache(userId?: string): void {
    if (userId) {
      this.userAccessCache.delete(userId);
    } else {
      this.userAccessCache.clear();
    }
  }

  // Get default access for a role
  getDefaultAccessForRole(roleName: string): { roleId: number; modules: string[]; accessLevel: AccessLevel } {
    switch (roleName.toLowerCase()) {
      case 'admin':
        return {
          roleId: 1,
          modules: ['Dashboard', 'JobCards', 'ProductLibrary', 'ReturnInventory', 'ReadyInventory', 'PurchaseOrders', 'Admin', 'AdminOnboarding'],
          accessLevel: 'admin'
        };
      case 'editor':
        return {
          roleId: 2,
          modules: ['Dashboard', 'JobCards', 'ReturnInventory', 'ReadyInventory', 'PurchaseOrders', 'ProductLibrary'],
          accessLevel: 'write'
        };
      case 'viewer':
      default:
        return {
          roleId: 3,
          modules: ['Dashboard', 'ProductLibrary'],
          accessLevel: 'read'
        };
    }
  }
}

export const rbacService = RBACService.getInstance(); 