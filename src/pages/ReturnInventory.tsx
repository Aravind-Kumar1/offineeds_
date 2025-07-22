import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Package2, Search, Eye, RefreshCw, Calendar, MapPin, RotateCcw, AlertTriangle, ShoppingCart, Edit, Trash2 } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogAction, AlertDialogCancel } from "@/components/ui/alert-dialog";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/lib/supabaseClient";

// Interface for return inventory
interface ReturnInventory {
  id: string;
  return_id: string;
  order_id: string;
  base_sku: string;
  website_sku: string | null;
  category: string | null;
  store_name: string | null;
  customization_details: string | null;
  design_code: string | null;
  sequence_number: number | null;
  location: string | null;
  return_date: string | null;
  return_reason: string | null;
  is_resellable: boolean | null;
  rebook_order: boolean | null;
  storage_location: string | null;
  image_url: string | null;
  quantity: number;
  created_at: string;
  updated_at: string;
  created_by?: string | null;
  updated_by?: string | null;
  received_by?: string | null;
}

const ReturnInventory = () => {
  const [returns, setReturns] = useState<ReturnInventory[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedItem, setSelectedItem] = useState<ReturnInventory | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);
  const { toast } = useToast();

  // --- Add state for create and edit dialogs ---
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [newItem, setNewItem] = useState({
    return_id: '',
    order_id: '',
    base_sku: '',
    website_sku: '',
    category: '',
    store_name: '',
    customization_details: '',
    design_code: '',
    sequence_number: '',
    location: '',
    return_date: '',
    return_reason: '',
    is_resellable: false,
    rebook_order: false,
    storage_location: '',
    image_url: '',
    quantity: '',
  });
  const [editItem, setEditItem] = useState({
    id: '',
    return_id: '',
    order_id: '',
    base_sku: '',
    website_sku: '',
    category: '',
    store_name: '',
    customization_details: '',
    design_code: '',
    sequence_number: '',
    location: '',
    return_date: '',
    return_reason: '',
    is_resellable: false,
    rebook_order: false,
    storage_location: '',
    image_url: '',
    quantity: '',
  });

  // Fetch return inventory data from Supabase
  const fetchReturns = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .schema('oms_offineeds')
        .from('return_inventory')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching return inventory:', error);
        toast({
          title: "Error",
          description: "Failed to fetch return inventory data",
          variant: "destructive"
        });
        return;
      }

      setReturns(data || []);
    } catch (error) {
      console.error('Error:', error);
      toast({
        title: "Error",
        description: "Failed to connect to database",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReturns();
  }, []);

  // Filter returns based on search term
  const filteredReturns = returns.filter(item =>
    item.return_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.order_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.base_sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.website_sku?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.return_reason?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.category?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleViewDetails = (item: ReturnInventory) => {
    setSelectedItem(item);
    setShowDetailsModal(true);
  };

  // --- Add create, edit, and update handlers ---
  const handleCreateItem = () => {
    if (!newItem.return_id.trim() || !newItem.base_sku.trim()) {
      toast({ title: 'Error', description: 'Return ID and Base SKU are required', variant: 'destructive' });
      return;
    }
    const newReturn: ReturnInventory = {
      id: `RET-${Date.now()}`,
      return_id: newItem.return_id,
      order_id: newItem.order_id,
      base_sku: newItem.base_sku,
      website_sku: newItem.website_sku || null,
      category: newItem.category || null,
      store_name: newItem.store_name || null,
      customization_details: newItem.customization_details || null,
      design_code: newItem.design_code || null,
      sequence_number: newItem.sequence_number ? parseInt(newItem.sequence_number) : null,
      location: newItem.location || null,
      return_date: newItem.return_date || null,
      return_reason: newItem.return_reason || null,
      is_resellable: !!newItem.is_resellable,
      rebook_order: !!newItem.rebook_order,
      storage_location: newItem.storage_location || null,
      image_url: newItem.image_url || null,
      quantity: newItem.quantity ? parseInt(newItem.quantity) : 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    setReturns(prev => [newReturn, ...prev]);
    setShowCreateDialog(false);
    setNewItem({
      return_id: '', order_id: '', base_sku: '', website_sku: '', category: '', store_name: '', customization_details: '', design_code: '', sequence_number: '', location: '', return_date: '', return_reason: '', is_resellable: false, rebook_order: false, storage_location: '', image_url: '', quantity: '',
    });
    toast({ title: 'Success', description: 'Return item created successfully' });
  };
  const handleEdit = (item: ReturnInventory) => {
    setSelectedItem(item);
    setEditItem({
      id: item.id,
      return_id: item.return_id,
      order_id: item.order_id,
      base_sku: item.base_sku,
      website_sku: item.website_sku || '',
      category: item.category || '',
      store_name: item.store_name || '',
      customization_details: item.customization_details || '',
      design_code: item.design_code || '',
      sequence_number: item.sequence_number?.toString() || '',
      location: item.location || '',
      return_date: item.return_date || '',
      return_reason: item.return_reason || '',
      is_resellable: !!item.is_resellable,
      rebook_order: !!item.rebook_order,
      storage_location: item.storage_location || '',
      image_url: item.image_url || '',
      quantity: item.quantity?.toString() || '',
    });
    setShowEditDialog(true);
  };
  const handleUpdateItem = () => {
    if (!editItem.return_id.trim() || !editItem.base_sku.trim()) {
      toast({ title: 'Error', description: 'Return ID and Base SKU are required', variant: 'destructive' });
      return;
    }
    setReturns(prev => prev.map(item =>
      item.id === editItem.id
        ? {
            ...item,
            return_id: editItem.return_id,
            order_id: editItem.order_id,
            base_sku: editItem.base_sku,
            website_sku: editItem.website_sku || null,
            category: editItem.category || null,
            store_name: editItem.store_name || null,
            customization_details: editItem.customization_details || null,
            design_code: editItem.design_code || null,
            sequence_number: editItem.sequence_number ? parseInt(editItem.sequence_number) : null,
            location: editItem.location || null,
            return_date: editItem.return_date || null,
            return_reason: editItem.return_reason || null,
            is_resellable: !!editItem.is_resellable,
            rebook_order: !!editItem.rebook_order,
            storage_location: editItem.storage_location || null,
            image_url: editItem.image_url || null,
            quantity: editItem.quantity ? parseInt(editItem.quantity) : 0,
            updated_at: new Date().toISOString(),
          }
        : item
    ));
    setShowEditDialog(false);
    setSelectedItem(null);
    toast({ title: 'Success', description: 'Return item updated successfully' });
  };

  const handleDelete = (itemId: string) => {
    setPendingDeleteId(itemId);
  };

  const confirmDelete = () => {
    if (pendingDeleteId) {
      setReturns(prev => prev.filter(item => item.id !== pendingDeleteId));
      setPendingDeleteId(null);
      toast({
        title: "Deleted",
        description: "Return item has been deleted successfully",
      });
    }
  };

  const cancelDelete = () => {
    setPendingDeleteId(null);
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString();
  };

  const getResellableBadge = (isResellable: boolean | null) => {
    if (isResellable === null) return <Badge variant="secondary">Unknown</Badge>;
    return isResellable ? 
      <Badge className="bg-green-100 text-green-800">Resellable</Badge> : 
      <Badge className="bg-red-100 text-red-800">Not Resellable</Badge>;
  };

  const getRebookBadge = (rebookOrder: boolean | null) => {
    if (rebookOrder === null) return <Badge variant="secondary">N/A</Badge>;
    return rebookOrder ? 
      <Badge className="bg-blue-100 text-blue-800">Rebook</Badge> : 
      <Badge variant="outline">No Rebook</Badge>;
  };

  // Remove any full-page loading spinner. Render return inventory content immediately, and use skeletons or partial loading indicators for sections if needed.
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Return Inventory
          </h1>
          <p className="text-gray-600 mt-1">Manage returned items and processing</p>
        </div>
        
        <div className="flex gap-2">
          <Button onClick={() => setShowCreateDialog(true)} className="flex items-center gap-2">
            <Package2 className="h-4 w-4" />
            Create New Item
          </Button>
          <Button onClick={fetchReturns} variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Returns</p>
                <p className="text-2xl font-bold text-gray-900">{returns.length}</p>
              </div>
              <Package2 className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Quantity</p>
                <p className="text-2xl font-bold text-gray-900">
                  {returns.reduce((sum, item) => sum + item.quantity, 0)}
                </p>
              </div>
              <RotateCcw className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Resellable Items</p>
                <p className="text-2xl font-bold text-gray-900">
                  {returns.filter(item => item.is_resellable === true).length}
                </p>
              </div>
              <Package2 className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Rebook Orders</p>
                <p className="text-2xl font-bold text-gray-900">
                  {returns.filter(item => item.rebook_order === true).length}
                </p>
              </div>
              <ShoppingCart className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search by return ID, order ID, SKU, or reason..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Returns Table */}
      <Card>
        <CardHeader>
          <CardTitle>Return Items ({filteredReturns.length})</CardTitle>
          <CardDescription>
            Items that have been returned and are being processed
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">
              <RotateCcw className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Loading return inventory...</h3>
              <p className="text-gray-600">
                Please wait while we fetch the return inventory data.
              </p>
            </div>
          ) : filteredReturns.length === 0 ? (
            <div className="text-center py-8">
              <RotateCcw className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No returns found</h3>
              <p className="text-gray-600">
                {searchTerm ? "Try adjusting your search criteria" : "No items in return inventory"}
              </p>
            </div>
          ) : (
            <div className="w-full overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-32 whitespace-nowrap">Return ID</th>
                    <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-32 whitespace-nowrap">Order ID</th>
                    <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-32 whitespace-nowrap">Base SKU</th>
                    <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-36 whitespace-nowrap">Website SKU</th>
                    <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-28 whitespace-nowrap">Category</th>
                    <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-40 whitespace-nowrap">Store Name</th>
                    <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-40 whitespace-nowrap">Customization</th>
                    <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-28 whitespace-nowrap">Design Code</th>
                    <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-20 whitespace-nowrap">Seq No</th>
                    <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-28 whitespace-nowrap">Location</th>
                    <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-24 whitespace-nowrap">Return Date</th>
                    <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-48 whitespace-nowrap">Return Reason</th>
                    <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-20 whitespace-nowrap">Resellable</th>
                    <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-20 whitespace-nowrap">Rebook</th>
                    <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-36 whitespace-nowrap">Storage Location</th>
                    <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-16 whitespace-nowrap">Image</th>
                    <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-16 whitespace-nowrap">Qty</th>
                    <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-24 whitespace-nowrap">Created At</th>
                    <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-24 whitespace-nowrap">Updated At</th>
                    <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-20 whitespace-nowrap">Created By</th>
                    <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-20 whitespace-nowrap">Updated By</th>
                    <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-20 whitespace-nowrap">Received By</th>
                    <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-16 whitespace-nowrap">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredReturns.map((item) => (
                    <tr key={item.id} className="hover:bg-gray-50">
                      <td className="px-3 py-3 text-sm font-medium text-gray-900">
                        <div className="truncate" title={item.return_id || '-'}>
                          {item.return_id || '-'}
                        </div>
                      </td>
                      <td className="px-3 py-3 text-sm text-gray-900">
                        <div className="truncate" title={item.order_id || '-'}>
                          {item.order_id || '-'}
                        </div>
                      </td>
                      <td className="px-3 py-3 text-sm text-gray-900">
                        <div className="break-words" title={item.base_sku || '-'}>
                          {item.base_sku || '-'}
                        </div>
                      </td>
                      <td className="px-3 py-3 text-sm text-gray-900">
                        <div className="break-words" title={item.website_sku || '-'}>
                          {item.website_sku || '-'}
                        </div>
                      </td>
                      <td className="px-3 py-3 text-sm text-gray-900">
                        <div className="break-words" title={item.category || '-'}>
                          {item.category || '-'}
                        </div>
                      </td>
                      <td className="px-3 py-3 text-sm text-gray-900">
                        <div className="break-words" title={item.store_name || '-'}>
                          {item.store_name || '-'}
                        </div>
                      </td>
                      <td className="px-3 py-3 text-sm text-gray-900">
                        <div className="break-words" title={item.customization_details || '-'}>
                          {item.customization_details || '-'}
                        </div>
                      </td>
                      <td className="px-3 py-3 text-sm text-gray-900">
                        <div className="break-words" title={item.design_code || '-'}>
                          {item.design_code || '-'}
                        </div>
                      </td>
                      <td className="px-3 py-3 text-sm text-gray-900">{item.sequence_number ?? '-'}</td>
                      <td className="px-3 py-3 text-sm text-gray-900">
                        <div className="break-words" title={item.location || '-'}>
                          {item.location || '-'}
                        </div>
                      </td>
                      <td className="px-3 py-3 text-sm text-gray-900">
                        {item.return_date ? formatDate(item.return_date) : '-'}
                      </td>
                      <td className="px-3 py-3 text-sm text-gray-900">
                        <div className="break-words" title={item.return_reason || '-'}>
                          {item.return_reason || '-'}
                        </div>
                      </td>
                      <td className="px-3 py-3 text-sm">{getResellableBadge(item.is_resellable)}</td>
                      <td className="px-3 py-3 text-sm">{getRebookBadge(item.rebook_order)}</td>
                      <td className="px-3 py-3 text-sm text-gray-900">
                        <div className="break-words" title={item.storage_location || '-'}>
                          {item.storage_location || '-'}
                        </div>
                      </td>
                      <td className="px-3 py-3 text-sm">
                        {item.image_url ? (
                          <img src={item.image_url} alt={item.base_sku} className="h-8 w-8 object-cover rounded" />
                        ) : (
                          <span className="text-gray-400 text-xs">No Image</span>
                        )}
                      </td>
                      <td className="px-3 py-3 text-sm text-gray-900">{item.quantity ?? '-'}</td>
                      <td className="px-3 py-3 text-sm text-gray-900">
                        {item.created_at ? formatDate(item.created_at) : '-'}
                      </td>
                      <td className="px-3 py-3 text-sm text-gray-900">
                        {item.updated_at ? formatDate(item.updated_at) : '-'}
                      </td>
                      <td className="px-3 py-3 text-sm text-gray-900">
                        <div className="break-words" title={item.created_by || '-'}>
                          {item.created_by || '-'}
                        </div>
                      </td>
                      <td className="px-3 py-3 text-sm text-gray-900">
                        <div className="break-words" title={item.updated_by || '-'}>
                          {item.updated_by || '-'}
                        </div>
                      </td>
                      <td className="px-3 py-3 text-sm text-gray-900">
                        <div className="break-words" title={item.received_by || '-'}>
                          {item.received_by || '-'}
                        </div>
                      </td>
                      <td className="px-3 py-3 text-sm">
                        <div className="flex gap-1">
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleViewDetails(item)}
                            className="hover:bg-blue-50 h-8 w-8 p-0"
                          >
                            <Eye className="h-3 w-3" />
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleEdit(item)}
                            className="hover:bg-green-50 h-8 w-8 p-0"
                          >
                            <Edit className="h-3 w-3" />
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleDelete(item.id)}
                            className="hover:bg-red-50 h-8 w-8 p-0"
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Details Modal */}
      <Dialog open={showDetailsModal} onOpenChange={setShowDetailsModal}>
        <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Return Item Details</DialogTitle>
            <DialogDescription>
              Detailed information for return {selectedItem?.return_id}
            </DialogDescription>
          </DialogHeader>
          
          {selectedItem && (
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-gray-600">Return ID</label>
                  <p className="text-sm text-gray-900">{selectedItem.return_id}</p>
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-600">Order ID</label>
                  <p className="text-sm text-gray-900">{selectedItem.order_id}</p>
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-600">Base SKU</label>
                  <p className="text-sm text-gray-900">{selectedItem.base_sku}</p>
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-600">Website SKU</label>
                  <p className="text-sm text-gray-900">{selectedItem.website_sku || 'N/A'}</p>
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-600">Category</label>
                  <p className="text-sm text-gray-900">{selectedItem.category || 'N/A'}</p>
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-600">Store Name</label>
                  <p className="text-sm text-gray-900">{selectedItem.store_name || 'N/A'}</p>
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-600">Design Code</label>
                  <p className="text-sm text-gray-900">{selectedItem.design_code || 'N/A'}</p>
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-600">Sequence Number</label>
                  <p className="text-sm text-gray-900">{selectedItem.sequence_number || 'N/A'}</p>
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-600">Quantity</label>
                  <p className="text-sm text-gray-900">{selectedItem.quantity}</p>
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-600">Return Date</label>
                  <p className="text-sm text-gray-900">{formatDate(selectedItem.return_date)}</p>
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-600">Location</label>
                  <p className="text-sm text-gray-900">{selectedItem.location || 'N/A'}</p>
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-600">Storage Location</label>
                  <p className="text-sm text-gray-900">{selectedItem.storage_location || 'N/A'}</p>
                </div>
              </div>
              
              {selectedItem.return_reason && (
                <div>
                  <label className="text-xs font-medium text-gray-600">Return Reason</label>
                  <p className="text-sm text-gray-900 mt-1">{selectedItem.return_reason}</p>
                </div>
              )}
              
              {selectedItem.customization_details && (
                <div>
                  <label className="text-xs font-medium text-gray-600">Customization Details</label>
                  <p className="text-sm text-gray-900 mt-1">{selectedItem.customization_details}</p>
                </div>
              )}
              
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-gray-600">Resellable Status</label>
                  <div className="mt-1">{getResellableBadge(selectedItem.is_resellable)}</div>
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-600">Rebook Order</label>
                  <div className="mt-1">{getRebookBadge(selectedItem.rebook_order)}</div>
                </div>
              </div>
              
              {selectedItem.image_url && (
                <div>
                  <label className="text-xs font-medium text-gray-600">Product Image</label>
                  <img 
                    src={selectedItem.image_url} 
                    alt={selectedItem.base_sku}
                    className="mt-2 max-w-full h-32 object-cover rounded-lg"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                    }}
                  />
                </div>
              )}
              
              <div className="grid grid-cols-2 gap-3 pt-3 border-t">
                <div>
                  <label className="text-xs font-medium text-gray-600">Created At</label>
                  <p className="text-sm text-gray-900">{formatDate(selectedItem.created_at)}</p>
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-600">Updated At</label>
                  <p className="text-sm text-gray-900">{formatDate(selectedItem.updated_at)}</p>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Create Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create New Return Item</DialogTitle>
            <DialogDescription>Add a new item to return inventory</DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-sm">Return ID *</label>
                <Input value={newItem.return_id} onChange={e => setNewItem(prev => ({ ...prev, return_id: e.target.value }))} placeholder="Enter return ID" className="h-9" />
              </div>
              <div>
                <label className="text-sm">Order ID</label>
                <Input value={newItem.order_id} onChange={e => setNewItem(prev => ({ ...prev, order_id: e.target.value }))} placeholder="Enter order ID" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-sm">Base SKU *</label>
                <Input value={newItem.base_sku} onChange={e => setNewItem(prev => ({ ...prev, base_sku: e.target.value }))} placeholder="Enter base SKU" />
              </div>
              <div>
                <label className="text-sm">Website SKU</label>
                <Input value={newItem.website_sku} onChange={e => setNewItem(prev => ({ ...prev, website_sku: e.target.value }))} placeholder="Enter website SKU" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-sm">Category</label>
                <Input value={newItem.category} onChange={e => setNewItem(prev => ({ ...prev, category: e.target.value }))} placeholder="Enter category" />
              </div>
              <div>
                <label className="text-sm">Store Name</label>
                <Input value={newItem.store_name} onChange={e => setNewItem(prev => ({ ...prev, store_name: e.target.value }))} placeholder="Enter store name" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-sm">Design Code</label>
                <Input value={newItem.design_code} onChange={e => setNewItem(prev => ({ ...prev, design_code: e.target.value }))} placeholder="Enter design code" />
              </div>
              <div>
                <label className="text-sm">Sequence Number</label>
                <Input type="number" value={newItem.sequence_number} onChange={e => setNewItem(prev => ({ ...prev, sequence_number: e.target.value }))} placeholder="Enter sequence number" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-sm">Quantity</label>
                <Input type="number" value={newItem.quantity} onChange={e => setNewItem(prev => ({ ...prev, quantity: e.target.value }))} placeholder="Enter quantity" />
              </div>
              <div>
                <label className="text-sm">Return Date</label>
                <Input type="date" value={newItem.return_date} onChange={e => setNewItem(prev => ({ ...prev, return_date: e.target.value }))} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-sm">Location</label>
                <Input value={newItem.location} onChange={e => setNewItem(prev => ({ ...prev, location: e.target.value }))} placeholder="Enter location" />
              </div>
              <div>
                <label className="text-sm">Storage Location</label>
                <Input value={newItem.storage_location} onChange={e => setNewItem(prev => ({ ...prev, storage_location: e.target.value }))} placeholder="Enter storage location" />
              </div>
            </div>
            <div>
              <label className="text-sm">Image URL</label>
              <Input value={newItem.image_url} onChange={e => setNewItem(prev => ({ ...prev, image_url: e.target.value }))} placeholder="Enter image URL" />
            </div>
            <div>
              <label className="text-sm">Customization Details</label>
              <Input value={newItem.customization_details} onChange={e => setNewItem(prev => ({ ...prev, customization_details: e.target.value }))} placeholder="Enter customization details" />
            </div>
            <div>
              <label className="text-sm">Return Reason</label>
              <Input value={newItem.return_reason} onChange={e => setNewItem(prev => ({ ...prev, return_reason: e.target.value }))} placeholder="Enter return reason" />
            </div>
            <div className="flex gap-4">
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" checked={!!newItem.is_resellable} onChange={e => setNewItem(prev => ({ ...prev, is_resellable: e.target.checked }))} />
                Resellable
              </label>
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" checked={!!newItem.rebook_order} onChange={e => setNewItem(prev => ({ ...prev, rebook_order: e.target.checked }))} />
                Rebook Order
              </label>
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-4">
            <Button variant="outline" onClick={() => setShowCreateDialog(false)}>Cancel</Button>
            <Button onClick={handleCreateItem} disabled={!newItem.return_id.trim() || !newItem.base_sku.trim()}>Create Item</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Return Item</DialogTitle>
            <DialogDescription>Update return item information</DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-sm">Return ID *</label>
                <Input value={editItem.return_id} onChange={e => setEditItem(prev => ({ ...prev, return_id: e.target.value }))} placeholder="Enter return ID" className="h-9" />
              </div>
              <div>
                <label className="text-sm">Order ID</label>
                <Input value={editItem.order_id} onChange={e => setEditItem(prev => ({ ...prev, order_id: e.target.value }))} placeholder="Enter order ID" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-sm">Base SKU *</label>
                <Input value={editItem.base_sku} onChange={e => setEditItem(prev => ({ ...prev, base_sku: e.target.value }))} placeholder="Enter base SKU" />
              </div>
              <div>
                <label className="text-sm">Website SKU</label>
                <Input value={editItem.website_sku} onChange={e => setEditItem(prev => ({ ...prev, website_sku: e.target.value }))} placeholder="Enter website SKU" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-sm">Category</label>
                <Input value={editItem.category} onChange={e => setEditItem(prev => ({ ...prev, category: e.target.value }))} placeholder="Enter category" />
              </div>
              <div>
                <label className="text-sm">Store Name</label>
                <Input value={editItem.store_name} onChange={e => setEditItem(prev => ({ ...prev, store_name: e.target.value }))} placeholder="Enter store name" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-sm">Design Code</label>
                <Input value={editItem.design_code} onChange={e => setEditItem(prev => ({ ...prev, design_code: e.target.value }))} placeholder="Enter design code" />
              </div>
              <div>
                <label className="text-sm">Sequence Number</label>
                <Input type="number" value={editItem.sequence_number} onChange={e => setEditItem(prev => ({ ...prev, sequence_number: e.target.value }))} placeholder="Enter sequence number" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-sm">Quantity</label>
                <Input type="number" value={editItem.quantity} onChange={e => setEditItem(prev => ({ ...prev, quantity: e.target.value }))} placeholder="Enter quantity" />
              </div>
              <div>
                <label className="text-sm">Return Date</label>
                <Input type="date" value={editItem.return_date} onChange={e => setEditItem(prev => ({ ...prev, return_date: e.target.value }))} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-sm">Location</label>
                <Input value={editItem.location} onChange={e => setEditItem(prev => ({ ...prev, location: e.target.value }))} placeholder="Enter location" />
              </div>
              <div>
                <label className="text-sm">Storage Location</label>
                <Input value={editItem.storage_location} onChange={e => setEditItem(prev => ({ ...prev, storage_location: e.target.value }))} placeholder="Enter storage location" />
              </div>
            </div>
            <div>
              <label className="text-sm">Image URL</label>
              <Input value={editItem.image_url} onChange={e => setEditItem(prev => ({ ...prev, image_url: e.target.value }))} placeholder="Enter image URL" />
            </div>
            <div>
              <label className="text-sm">Customization Details</label>
              <Input value={editItem.customization_details} onChange={e => setEditItem(prev => ({ ...prev, customization_details: e.target.value }))} placeholder="Enter customization details" />
            </div>
            <div>
              <label className="text-sm">Return Reason</label>
              <Input value={editItem.return_reason} onChange={e => setEditItem(prev => ({ ...prev, return_reason: e.target.value }))} placeholder="Enter return reason" />
            </div>
            <div className="flex gap-4">
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" checked={!!editItem.is_resellable} onChange={e => setEditItem(prev => ({ ...prev, is_resellable: e.target.checked }))} />
                Resellable
              </label>
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" checked={!!editItem.rebook_order} onChange={e => setEditItem(prev => ({ ...prev, rebook_order: e.target.checked }))} />
                Rebook Order
              </label>
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-4">
            <Button variant="outline" onClick={() => setShowEditDialog(false)}>Cancel</Button>
            <Button onClick={handleUpdateItem} disabled={!editItem.return_id.trim() || !editItem.base_sku.trim()}>Update Item</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!pendingDeleteId} onOpenChange={() => setPendingDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the return item.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={cancelDelete}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-red-600 hover:bg-red-700">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default ReturnInventory;
