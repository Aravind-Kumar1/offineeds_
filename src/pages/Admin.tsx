import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogAction, AlertDialogCancel } from "@/components/ui/alert-dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { 
  Users, 
  Shield, 
  Settings, 
  Plus, 
  Edit, 
  Trash2, 
  Eye, 
  Search, 
  Filter,
  UserPlus,
  Key,
  Lock,
  Unlock,
  AlertCircle,
  CheckCircle,
  Clock
} from "lucide-react";
import { useAuthStore } from '@/store/authStore';
import { rbacService, UserWithAccess, UserRole, UserModule, AccessLevel } from '@/lib/rbacService';
import { toast } from '@/hooks/use-toast';

interface UserFormData {
  name: string;
  email: string;
  Employee_ID: string;
  roleId: number;
  modules: string[];
  accessLevel: AccessLevel;
}

const Admin = () => {
  const [users, setUsers] = useState<UserWithAccess[]>([]);
  const [roles, setRoles] = useState<UserRole[]>([]);
  const [modules, setModules] = useState<UserModule[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterRole, setFilterRole] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  
  // Dialog states
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showViewDialog, setShowViewDialog] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserWithAccess | null>(null);
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);
  
  // Form data
  const [userForm, setUserForm] = useState<UserFormData>({
    name: '',
    email: '',
    Employee_ID: '',
    roleId: 3, // Default to viewer
    modules: ['Dashboard', 'ProductLibrary'],
    accessLevel: 'read'
  });

  // Define dynamic roles
  const dynamicRoles = [
    { Role_ID: 1, Role_Name: 'Admin' },
    { Role_ID: 2, Role_Name: 'Developer' },
    { Role_ID: 3, Role_Name: 'User' },
  ];

  // Check permissions
  // Remove all uses of canViewUsers and canManageUsers
  // Always render the UI, do not block on permissions
  // In the users table and dropdowns, only render user.role.Role_Name or similar string fields

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const [usersData, rolesData, modulesData] = await Promise.all([
          rbacService.getAllUsersWithAccess(),
          rbacService.getRoles(),
          rbacService.getModules()
        ]);
        
        setUsers(usersData);
        setRoles(rolesData);
        setModules(modulesData);
      } catch (err) {
        setError('Failed to load admin data');
        console.error('Admin data fetch error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const filteredUsers = users.filter(user => {
    const matchesSearch = 
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.Employee_ID.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesRole = filterRole === "all" || user.role.Role_Name.toLowerCase() === filterRole.toLowerCase();
    const matchesStatus = filterStatus === "all" || user.status === filterStatus;
    
    return matchesSearch && matchesRole && matchesStatus;
  });

  const handleCreateUser = () => {
    setUserForm({
      name: '',
      email: '',
      Employee_ID: '',
      roleId: 3,
      modules: ['Dashboard', 'ProductLibrary'],
      accessLevel: 'read'
    });
    setShowCreateDialog(true);
  };

  const handleEditUser = (user: UserWithAccess) => {
    setSelectedUser(user);
    setUserForm({
      name: user.name,
      email: user.email,
      Employee_ID: user.Employee_ID,
      roleId: user.role.Role_ID,
      modules: user.modules.map(m => m.module.module_name),
      accessLevel: user.modules[0]?.access_level || 'read'
    });
    setShowEditDialog(true);
  };

  const handleViewUser = (user: UserWithAccess) => {
    setSelectedUser(user);
    setShowViewDialog(true);
  };

  const handleDeleteUser = (userId: string) => {
    setPendingDeleteId(userId);
  };

  const confirmDelete = async () => {
    if (!pendingDeleteId) return;
    
    try {
      const success = await rbacService.deleteUserAccess(pendingDeleteId);
      if (success) {
        setUsers(prev => prev.filter(user => user.id !== pendingDeleteId));
        toast({
          title: "Success",
          description: "User access deleted successfully",
        });
      } else {
        toast({
          title: "Error",
          description: "Failed to delete user access",
          variant: "destructive"
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An error occurred while deleting user access",
        variant: "destructive"
      });
    } finally {
      setPendingDeleteId(null);
    }
  };

  // Update handleRoleChange to accept string and parseInt
  const handleRoleChange = (roleIdStr: string) => {
    const roleId = parseInt(roleIdStr, 10);
    const role = dynamicRoles.find(r => r.Role_ID === roleId);
    if (role) {
      const defaultAccess = rbacService.getDefaultAccessForRole(role.Role_Name);
      setUserForm(prev => ({
        ...prev,
        roleId,
        modules: defaultAccess.modules,
        accessLevel: defaultAccess.accessLevel
      }));
    }
  };

  const handleModuleToggle = (moduleName: string, checked: boolean) => {
    setUserForm(prev => ({
      ...prev,
      modules: checked 
        ? [...prev.modules, moduleName]
        : prev.modules.filter(m => m !== moduleName)
    }));
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-500 text-white">Active</Badge>;
      case 'inactive':
        return <Badge variant="secondary">Inactive</Badge>;
      case 'suspended':
        return <Badge variant="destructive">Suspended</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getAccessLevelBadge = (level: AccessLevel) => {
    switch (level) {
      case 'admin':
        return <Badge className="bg-red-500 text-white">Admin</Badge>;
      case 'write':
        return <Badge className="bg-blue-500 text-white">Write</Badge>;
      case 'read':
        return <Badge className="bg-green-500 text-white">Read</Badge>;
      default:
        return <Badge variant="outline">{level}</Badge>;
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
        <div>
          <h1 className="text-4xl font-bold text-black mt-16 sm:mt-0">Admin Panel</h1>
          <p className="text-gray-600 mt-2 text-lg">Manage users, roles, and system permissions</p>
        </div>
        <Button 
          onClick={handleCreateUser}
          className="bg-gradient-to-r from-purple-600 to-indigo-700 hover:from-purple-700 hover:to-indigo-800 text-white shadow-lg hover:shadow-xl transition-all duration-300"
        >
          <UserPlus className="h-4 w-4 mr-2" />
          Add User
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="border-0 bg-gradient-to-r from-blue-50 to-indigo-50 shadow-lg">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center text-sm font-medium text-gray-700">
              <div className="p-3 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-xl mr-3">
                <Users className="h-5 w-5 text-white" />
              </div>
              Total Users
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-2">
              {users.length}
            </div>
            <p className="text-sm text-gray-600">Registered users</p>
          </CardContent>
        </Card>

        <Card className="border-0 bg-gradient-to-r from-green-50 to-emerald-50 shadow-lg">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center text-sm font-medium text-gray-700">
              <div className="p-3 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl mr-3">
                <CheckCircle className="h-5 w-5 text-white" />
              </div>
              Active Users
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent mb-2">
              {users.filter(u => u.status === 'active').length}
            </div>
            <p className="text-sm text-gray-600">Currently active</p>
          </CardContent>
        </Card>

        <Card className="border-0 bg-gradient-to-r from-purple-50 to-pink-50 shadow-lg">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center text-sm font-medium text-gray-700">
              <div className="p-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl mr-3">
                <Shield className="h-5 w-5 text-white" />
              </div>
              Roles
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-2">
              {dynamicRoles.length}
            </div>
            <p className="text-sm text-gray-600">Available roles</p>
          </CardContent>
        </Card>

        <Card className="border-0 bg-gradient-to-r from-orange-50 to-red-50 shadow-lg">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center text-sm font-medium text-gray-700">
              <div className="p-3 bg-gradient-to-r from-orange-500 to-red-500 rounded-xl mr-3">
                <Settings className="h-5 w-5 text-white" />
              </div>
              Modules
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent mb-2">
              {modules.length}
            </div>
            <p className="text-sm text-gray-600">System modules</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="border-0 bg-white/80 backdrop-blur-sm">
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search users by name, email, or employee ID..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 border-gray-200 focus:border-purple-500 focus:ring-purple-500"
                />
              </div>
            </div>
            <div className="sm:w-48">
              <Select value={filterRole} onValueChange={setFilterRole}>
                <SelectTrigger className="border-gray-200 focus:border-purple-500 focus:ring-purple-500">
                  <SelectValue placeholder="Filter by role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Roles</SelectItem>
                  {dynamicRoles.map(role => (
                    <SelectItem key={role.Role_ID} value={role.Role_Name.toLowerCase()}>
                      {role.Role_Name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="sm:w-48">
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="border-gray-200 focus:border-purple-500 focus:ring-purple-500">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                  <SelectItem value="suspended">Suspended</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Users Table */}
      <Card className="border-0 bg-white/80 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center">
              <Users className="h-5 w-5 mr-2 text-purple-600" />
              Users ({filteredUsers.length})
            </span>
          </CardTitle>
          <CardDescription>Manage user access and permissions</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                  <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Employee ID</th>
                  <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                  <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Access Level</th>
                  <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Modules</th>
                  <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="text-center py-8 text-gray-500">No users found.</td>
                  </tr>
                ) : (
                  filteredUsers.map(user => (
                    <tr key={user.id} className="hover:bg-gray-50">
                      <td className="px-3 py-4">
                        <div>
                          <div className="font-semibold text-gray-900">{user.name}</div>
                          <div className="text-sm text-gray-500">{user.email}</div>
                        </div>
                      </td>
                      <td className="px-3 py-4 text-sm text-gray-900">{user.Employee_ID || '-'}</td>
                      <td className="px-3 py-4">
                        <Badge variant="outline" className="text-xs">
                          {user.role.Role_Name}
                        </Badge>
                      </td>
                      <td className="px-3 py-4">
                        {getAccessLevelBadge(user.modules[0]?.access_level || 'read')}
                      </td>
                      <td className="px-3 py-4">
                        <div className="flex flex-wrap gap-1">
                          {user.modules.slice(0, 3).map(module => (
                            <Badge key={module.module.Module_ID} variant="secondary" className="text-xs">
                              {module.module.module_name}
                            </Badge>
                          ))}
                          {user.modules.length > 3 && (
                            <Badge variant="outline" className="text-xs">
                              +{user.modules.length - 3} more
                            </Badge>
                          )}
                        </div>
                      </td>
                      <td className="px-3 py-4">
                        {getStatusBadge(user.status)}
                      </td>
                      <td className="px-3 py-4">
                        <div className="flex gap-1">
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleViewUser(user)}
                            className="hover:bg-blue-50 h-8 w-8 p-0"
                          >
                            <Eye className="h-3 w-3" />
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleEditUser(user)}
                            className="hover:bg-green-50 h-8 w-8 p-0"
                          >
                            <Edit className="h-3 w-3" />
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleDeleteUser(user.id)}
                            className="hover:bg-red-50 h-8 w-8 p-0"
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!pendingDeleteId} onOpenChange={() => setPendingDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete User Access</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this user's access? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-red-600 hover:bg-red-700">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* In the dialog for creating a user (showCreateDialog), after the form fields: */}
      {showCreateDialog && (
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add User</DialogTitle>
              <DialogDescription>Fill in the details to add a new user.</DialogDescription>
            </DialogHeader>
            {/* Form fields for name, email, Employee_ID, role, etc. */}
            <div className="grid gap-4">
              <div>
                <Label htmlFor="name" className="text-sm font-medium text-gray-700">Name</Label>
                <Input
                  id="name"
                  value={userForm.name}
                  onChange={(e) => setUserForm(prev => ({ ...prev, name: e.target.value }))}
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="email" className="text-sm font-medium text-gray-700">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={userForm.email}
                  onChange={(e) => setUserForm(prev => ({ ...prev, email: e.target.value }))}
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="employeeId" className="text-sm font-medium text-gray-700">Employee ID</Label>
                <Input
                  id="employeeId"
                  value={userForm.Employee_ID}
                  onChange={(e) => setUserForm(prev => ({ ...prev, Employee_ID: e.target.value }))}
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="role" className="text-sm font-medium text-gray-700">Role</Label>
                <Select value={String(userForm.roleId)} onValueChange={handleRoleChange}>
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Select a role" />
                  </SelectTrigger>
                  <SelectContent>
                    {dynamicRoles.map(role => (
                      <SelectItem key={role.Role_ID} value={String(role.Role_ID)}>
                        {role.Role_Name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                <div className="font-semibold text-gray-700 mb-1">User Preview</div>
                <div className="text-sm text-gray-800">Email: <span className="font-mono">{userForm.email || '—'}</span></div>
                <div className="text-sm text-gray-800">Role: <span className="font-semibold">{dynamicRoles.find(r => r.Role_ID === userForm.roleId)?.Role_Name || '—'}</span></div>
              </div>
            </div>
            <div className="flex justify-end gap-2 mt-6">
              <Button variant="outline" onClick={() => setShowCreateDialog(false)}>Cancel</Button>
              <Button onClick={() => {
                // Create a new user object from userForm, ensuring role matches UserRole type
                const roleObj = dynamicRoles.find(r => r.Role_ID === userForm.roleId);
                const newUser = {
                  id: `user-${Date.now()}`,
                  name: userForm.name,
                  email: userForm.email,
                  Employee_ID: userForm.Employee_ID,
                  role: {
                    Role_ID: userForm.roleId,
                    Role_Name: roleObj?.Role_Name || 'User',
                    Role_Description: '', // default or empty
                    Is_Active: true,      // default to true
                  },
                  modules: userForm.modules.map(moduleName => ({
                    module: { Module_ID: moduleName, module_name: moduleName },
                    access_level: userForm.accessLevel
                  })),
                  status: 'active',
                };
                setUsers(prev => [newUser, ...prev]);
                setShowCreateDialog(false);
              }}>
                Add User
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default Admin;