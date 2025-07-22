import React, { useState, useEffect } from 'react';
import { PackageCheck, Plus, Search, Truck, Eye, Edit, Trash2, RefreshCw, Calendar, MapPin, Package } from 'lucide-react';
import { AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogAction, AlertDialogCancel } from "@/components/ui/alert-dialog";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { useToast } from "@/components/ui/use-toast";
import { motion } from "framer-motion";
import { supabase } from "@/lib/supabaseClient";

// Interface for ready to ship inventory
interface ReadyToShipInventory {
  id: string;
  base_sku: string;
  website_sku: string | null;
  category: string | null;
  store_name: string | null;
  customization_details: string | null;
  design_code: string | null;
  sequence_number: number | null;
  location: string | null;
  stock_date: string | null;
  order_qty: number | null;
  storage_location: string | null;
  image_url: string | null;
  created_at: string;
  updated_at: string;
}

const ReadyInventory = () => {
  const [inventory, setInventory] = useState<ReadyToShipInventory[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedItem, setSelectedItem] = useState<ReadyToShipInventory | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);
  const [newItem, setNewItem] = useState({
    base_sku: '',
    website_sku: '',
    category: '',
    store_name: '',
    customization_details: '',
    design_code: '',
    sequence_number: '',
    location: '',
    stock_date: '',
    order_qty: '',
    storage_location: '',
    image_url: ''
  });
  const [editItem, setEditItem] = useState({
    base_sku: '',
    website_sku: '',
    category: '',
    store_name: '',
    customization_details: '',
    design_code: '',
    sequence_number: '',
    location: '',
    stock_date: '',
    order_qty: '',
    storage_location: '',
    image_url: ''
  });
  const { toast } = useToast();

  // Fetch inventory data from Supabase
  const fetchInventory = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .schema('oms_offineeds')
        .from('ready_to_ship_inventory')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching ready inventory:', error);
        toast({
          title: "Error",
          description: "Failed to fetch inventory data",
          variant: "destructive"
        });
        return;
      }

      setInventory(data || []);
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
    fetchInventory();
  }, []);

  // Filter inventory based on search term
  const filteredInventory = inventory.filter(item =>
    item.base_sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.website_sku?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.category?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.store_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.location?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleViewDetails = (item: ReadyToShipInventory) => {
    setSelectedItem(item);
    setShowDetailsModal(true);
  };

  const handleEdit = (item: ReadyToShipInventory) => {
    setSelectedItem(item);
    setEditItem({
      base_sku: item.base_sku || '',
      website_sku: item.website_sku || '',
      category: item.category || '',
      store_name: item.store_name || '',
      customization_details: item.customization_details || '',
      design_code: item.design_code || '',
      sequence_number: item.sequence_number?.toString() || '',
      location: item.location || '',
      stock_date: item.stock_date || '',
      order_qty: item.order_qty?.toString() || '',
      storage_location: item.storage_location || '',
      image_url: item.image_url || ''
    });
    setShowEditDialog(true);
  };

  const handleCreateItem = () => {
    if (!newItem.base_sku.trim()) {
      toast({
        title: "Error",
        description: "Base SKU is required",
        variant: "destructive"
      });
      return;
    }

    const newInventoryItem: ReadyToShipInventory = {
      id: `INV-${Date.now()}`,
      base_sku: newItem.base_sku,
      website_sku: newItem.website_sku || null,
      category: newItem.category || null,
      store_name: newItem.store_name || null,
      customization_details: newItem.customization_details || null,
      design_code: newItem.design_code || null,
      sequence_number: newItem.sequence_number ? parseInt(newItem.sequence_number) : null,
      location: newItem.location || null,
      stock_date: newItem.stock_date || null,
      order_qty: newItem.order_qty ? parseInt(newItem.order_qty) : null,
      storage_location: newItem.storage_location || null,
      image_url: newItem.image_url || null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    setInventory(prev => [newInventoryItem, ...prev]);
    setNewItem({
      base_sku: '',
      website_sku: '',
      category: '',
      store_name: '',
      customization_details: '',
      design_code: '',
      sequence_number: '',
      location: '',
      stock_date: '',
      order_qty: '',
      storage_location: '',
      image_url: ''
    });
    setShowCreateDialog(false);
    
    toast({
      title: "Success",
      description: "Inventory item created successfully",
    });
  };

  const handleUpdateItem = () => {
    if (!selectedItem || !editItem.base_sku.trim()) {
      toast({
        title: "Error",
        description: "Base SKU is required",
        variant: "destructive"
      });
      return;
    }

    setInventory(prev => prev.map(item => 
      item.id === selectedItem.id 
        ? { 
            ...item, 
            base_sku: editItem.base_sku,
            website_sku: editItem.website_sku || null,
            category: editItem.category || null,
            store_name: editItem.store_name || null,
            customization_details: editItem.customization_details || null,
            design_code: editItem.design_code || null,
            sequence_number: editItem.sequence_number ? parseInt(editItem.sequence_number) : null,
            location: editItem.location || null,
            stock_date: editItem.stock_date || null,
            order_qty: editItem.order_qty ? parseInt(editItem.order_qty) : null,
            storage_location: editItem.storage_location || null,
            image_url: editItem.image_url || null,
            updated_at: new Date().toISOString()
          }
        : item
    ));
    
    setShowEditDialog(false);
    setSelectedItem(null);
    
    toast({
      title: "Success",
      description: "Inventory item updated successfully",
    });
  };

  const handleDelete = (itemId: string) => {
    setPendingDeleteId(itemId);
  };

  const confirmDelete = () => {
    if (pendingDeleteId) {
      setInventory(prev => prev.filter(item => item.id !== pendingDeleteId));
      setPendingDeleteId(null);
      toast({
        title: "Deleted",
        description: "Item has been deleted successfully",
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

  const getStatusBadge = (item: ReadyToShipInventory) => {
    // Simple status logic based on stock_date
    const today = new Date();
    const stockDate = item.stock_date ? new Date(item.stock_date) : null;
    
    if (!stockDate) {
      return <Badge variant="secondary">Pending</Badge>;
    }
    
    if (stockDate <= today) {
      return <Badge className="bg-green-100 text-green-800">Ready</Badge>;
    } else {
      return <Badge className="bg-yellow-100 text-yellow-800">Scheduled</Badge>;
    }
  };

  // Remove any full-page loading spinner. Render ready inventory content immediately, and use skeletons or partial loading indicators for sections if needed.

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mt-16 sm:mt-0">
            Ready Inventory
          </h1>
          <p className="text-gray-600 mt-1">Manage items ready for shipment</p>
        </div>
        
        <div className="flex gap-2">
          <Button onClick={() => setShowCreateDialog(true)} className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Create New Item
          </Button>
          <Button onClick={fetchInventory} variant="outline" size="sm">
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
                <p className="text-sm font-medium text-gray-600">Total Items</p>
                <p className="text-2xl font-bold text-gray-900">{inventory.length}</p>
              </div>
              <Package className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Quantity</p>
                <p className="text-2xl font-bold text-gray-900">
                  {inventory.reduce((sum, item) => sum + (item.order_qty || 0), 0)}
                </p>
              </div>
              <PackageCheck className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Categories</p>
                <p className="text-2xl font-bold text-gray-900">
                  {new Set(inventory.map(item => item.category).filter(Boolean)).size}
                </p>
              </div>
              <Truck className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Locations</p>
                <p className="text-2xl font-bold text-gray-900">
                  {new Set(inventory.map(item => item.storage_location).filter(Boolean)).size}
                </p>
              </div>
              <MapPin className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search by SKU, category, store, or location..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Ready to Ship Table */}
      <Card>
        <CardHeader>
          <CardTitle>Ready to Ship Items ({filteredInventory.length})</CardTitle>
          <CardDescription>
            Items that are ready for shipment or scheduled to be ready
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">
              <RefreshCw className="h-12 w-12 text-gray-400 mx-auto mb-4 animate-spin" />
              <p className="text-gray-600">Loading inventory items...</p>
            </div>
          ) : filteredInventory.length === 0 ? (
            <div className="text-center py-8">
              <PackageCheck className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No inventory found</h3>
              <p className="text-gray-600">
                {searchTerm ? "Try adjusting your search criteria" : "No items in ready inventory"}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-48">Base SKU</th>
                    <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-48">Website SKU</th>
                    <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-32">Category</th>
                    <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-48">Store</th>
                    <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-20">Quantity</th>
                    <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-28">Stock Date</th>
                    <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-24">Status</th>
                    <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-40">Location</th>
                    <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-20">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredInventory.map((item) => (
                    <tr key={item.id} className="hover:bg-gray-50">
                      <td className="px-3 py-3 text-sm font-medium text-gray-900">
                        <div className="break-words" title={item.base_sku}>
                          {item.base_sku}
                        </div>
                      </td>
                      <td className="px-3 py-3 text-sm text-gray-900">
                        <div className="break-words" title={item.website_sku || 'N/A'}>
                          {item.website_sku || 'N/A'}
                        </div>
                      </td>
                      <td className="px-3 py-3 text-sm text-gray-900">
                        {item.category ? (
                          <Badge variant="outline" className="text-xs">
                            <div className="break-words" title={item.category}>
                              {item.category}
                            </div>
                          </Badge>
                        ) : (
                          <span className="text-gray-400">N/A</span>
                        )}
                      </td>
                      <td className="px-3 py-3 text-sm text-gray-900">
                        <div className="break-words" title={item.store_name || 'N/A'}>
                          {item.store_name || 'N/A'}
                        </div>
                      </td>
                      <td className="px-3 py-3 text-sm text-gray-900">{item.order_qty || 0}</td>
                      <td className="px-3 py-3 text-sm text-gray-900">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-4 w-4 text-gray-400" />
                          {formatDate(item.stock_date)}
                        </div>
                      </td>
                      <td className="px-3 py-3 text-sm">{getStatusBadge(item)}</td>
                      <td className="px-3 py-3 text-sm text-gray-900">
                        <div className="flex items-center gap-1">
                          <MapPin className="h-4 w-4 text-gray-400" />
                          <div className="break-words" title={item.storage_location || item.location || 'N/A'}>
                            {item.storage_location || item.location || 'N/A'}
                          </div>
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
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Inventory Item Details</DialogTitle>
            <DialogDescription>
              Detailed information for {selectedItem?.base_sku}
            </DialogDescription>
          </DialogHeader>
          
          {selectedItem && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-600">Base SKU</label>
                  <p className="text-sm text-gray-900">{selectedItem.base_sku}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Website SKU</label>
                  <p className="text-sm text-gray-900">{selectedItem.website_sku || 'N/A'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Category</label>
                  <p className="text-sm text-gray-900">{selectedItem.category || 'N/A'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Store Name</label>
                  <p className="text-sm text-gray-900">{selectedItem.store_name || 'N/A'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Design Code</label>
                  <p className="text-sm text-gray-900">{selectedItem.design_code || 'N/A'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Sequence Number</label>
                  <p className="text-sm text-gray-900">{selectedItem.sequence_number || 'N/A'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Order Quantity</label>
                  <p className="text-sm text-gray-900">{selectedItem.order_qty || 0}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Stock Date</label>
                  <p className="text-sm text-gray-900">{formatDate(selectedItem.stock_date)}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Location</label>
                  <p className="text-sm text-gray-900">{selectedItem.location || 'N/A'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Storage Location</label>
                  <p className="text-sm text-gray-900">{selectedItem.storage_location || 'N/A'}</p>
                </div>
              </div>
              
              {selectedItem.customization_details && (
                <div>
                  <label className="text-sm font-medium text-gray-600">Customization Details</label>
                  <p className="text-sm text-gray-900 mt-1">{selectedItem.customization_details}</p>
                </div>
              )}
              
              {selectedItem.image_url && (
                <div>
                  <label className="text-sm font-medium text-gray-600">Product Image</label>
                  <img 
                    src={selectedItem.image_url} 
                    alt={selectedItem.base_sku}
                    className="mt-2 max-w-full h-48 object-cover rounded-lg"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                    }}
                  />
                </div>
              )}
              
              <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                <div>
                  <label className="text-sm font-medium text-gray-600">Created At</label>
                  <p className="text-sm text-gray-900">{formatDate(selectedItem.created_at)}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Updated At</label>
                  <p className="text-sm text-gray-900">{formatDate(selectedItem.updated_at)}</p>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Create Inventory Item Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create New Inventory Item</DialogTitle>
            <DialogDescription>
              Add a new item to ready inventory
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="base_sku" className="text-sm">Base SKU *</Label>
                <Input
                  id="base_sku"
                  value={newItem.base_sku}
                  onChange={(e) => setNewItem(prev => ({ ...prev, base_sku: e.target.value }))}
                  placeholder="Enter base SKU"
                  className="h-9"
                />
              </div>
              <div>
                <Label htmlFor="website_sku">Website SKU</Label>
                <Input
                  id="website_sku"
                  value={newItem.website_sku}
                  onChange={(e) => setNewItem(prev => ({ ...prev, website_sku: e.target.value }))}
                  placeholder="Enter website SKU"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="category">Category</Label>
                <Input
                  id="category"
                  value={newItem.category}
                  onChange={(e) => setNewItem(prev => ({ ...prev, category: e.target.value }))}
                  placeholder="Enter category"
                />
              </div>
              <div>
                <Label htmlFor="store_name">Store Name</Label>
                <Input
                  id="store_name"
                  value={newItem.store_name}
                  onChange={(e) => setNewItem(prev => ({ ...prev, store_name: e.target.value }))}
                  placeholder="Enter store name"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="design_code">Design Code</Label>
                <Input
                  id="design_code"
                  value={newItem.design_code}
                  onChange={(e) => setNewItem(prev => ({ ...prev, design_code: e.target.value }))}
                  placeholder="Enter design code"
                />
              </div>
              <div>
                <Label htmlFor="sequence_number">Sequence Number</Label>
                <Input
                  id="sequence_number"
                  type="number"
                  value={newItem.sequence_number}
                  onChange={(e) => setNewItem(prev => ({ ...prev, sequence_number: e.target.value }))}
                  placeholder="Enter sequence number"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="order_qty">Order Quantity</Label>
                <Input
                  id="order_qty"
                  type="number"
                  value={newItem.order_qty}
                  onChange={(e) => setNewItem(prev => ({ ...prev, order_qty: e.target.value }))}
                  placeholder="Enter order quantity"
                />
              </div>
              <div>
                <Label htmlFor="stock_date">Stock Date</Label>
                <Input
                  id="stock_date"
                  type="date"
                  value={newItem.stock_date}
                  onChange={(e) => setNewItem(prev => ({ ...prev, stock_date: e.target.value }))}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="location">Location</Label>
                <Input
                  id="location"
                  value={newItem.location}
                  onChange={(e) => setNewItem(prev => ({ ...prev, location: e.target.value }))}
                  placeholder="Enter location"
                />
              </div>
              <div>
                <Label htmlFor="storage_location">Storage Location</Label>
                <Input
                  id="storage_location"
                  value={newItem.storage_location}
                  onChange={(e) => setNewItem(prev => ({ ...prev, storage_location: e.target.value }))}
                  placeholder="Enter storage location"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="image_url">Image URL</Label>
              <Input
                id="image_url"
                value={newItem.image_url}
                onChange={(e) => setNewItem(prev => ({ ...prev, image_url: e.target.value }))}
                placeholder="Enter image URL"
              />
            </div>

            <div>
              <Label htmlFor="customization_details">Customization Details</Label>
              <Textarea
                id="customization_details"
                value={newItem.customization_details}
                onChange={(e) => setNewItem(prev => ({ ...prev, customization_details: e.target.value }))}
                placeholder="Enter customization details"
                rows={3}
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateItem} disabled={!newItem.base_sku.trim()}>
              Create Item
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Inventory Item Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Inventory Item</DialogTitle>
            <DialogDescription>
              Update inventory item information
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit_base_sku">Base SKU *</Label>
                <Input
                  id="edit_base_sku"
                  value={editItem.base_sku}
                  onChange={(e) => setEditItem(prev => ({ ...prev, base_sku: e.target.value }))}
                  placeholder="Enter base SKU"
                />
              </div>
              <div>
                <Label htmlFor="edit_website_sku">Website SKU</Label>
                <Input
                  id="edit_website_sku"
                  value={editItem.website_sku}
                  onChange={(e) => setEditItem(prev => ({ ...prev, website_sku: e.target.value }))}
                  placeholder="Enter website SKU"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit_category">Category</Label>
                <Input
                  id="edit_category"
                  value={editItem.category}
                  onChange={(e) => setEditItem(prev => ({ ...prev, category: e.target.value }))}
                  placeholder="Enter category"
                />
              </div>
              <div>
                <Label htmlFor="edit_store_name">Store Name</Label>
                <Input
                  id="edit_store_name"
                  value={editItem.store_name}
                  onChange={(e) => setEditItem(prev => ({ ...prev, store_name: e.target.value }))}
                  placeholder="Enter store name"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit_design_code">Design Code</Label>
                <Input
                  id="edit_design_code"
                  value={editItem.design_code}
                  onChange={(e) => setEditItem(prev => ({ ...prev, design_code: e.target.value }))}
                  placeholder="Enter design code"
                />
              </div>
              <div>
                <Label htmlFor="edit_sequence_number">Sequence Number</Label>
                <Input
                  id="edit_sequence_number"
                  type="number"
                  value={editItem.sequence_number}
                  onChange={(e) => setEditItem(prev => ({ ...prev, sequence_number: e.target.value }))}
                  placeholder="Enter sequence number"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit_order_qty">Order Quantity</Label>
                <Input
                  id="edit_order_qty"
                  type="number"
                  value={editItem.order_qty}
                  onChange={(e) => setEditItem(prev => ({ ...prev, order_qty: e.target.value }))}
                  placeholder="Enter order quantity"
                />
              </div>
              <div>
                <Label htmlFor="edit_stock_date">Stock Date</Label>
                <Input
                  id="edit_stock_date"
                  type="date"
                  value={editItem.stock_date}
                  onChange={(e) => setEditItem(prev => ({ ...prev, stock_date: e.target.value }))}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit_location">Location</Label>
                <Input
                  id="edit_location"
                  value={editItem.location}
                  onChange={(e) => setEditItem(prev => ({ ...prev, location: e.target.value }))}
                  placeholder="Enter location"
                />
              </div>
              <div>
                <Label htmlFor="edit_storage_location">Storage Location</Label>
                <Input
                  id="edit_storage_location"
                  value={editItem.storage_location}
                  onChange={(e) => setEditItem(prev => ({ ...prev, storage_location: e.target.value }))}
                  placeholder="Enter storage location"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="edit_image_url">Image URL</Label>
              <Input
                id="edit_image_url"
                value={editItem.image_url}
                onChange={(e) => setEditItem(prev => ({ ...prev, image_url: e.target.value }))}
                placeholder="Enter image URL"
              />
            </div>

            <div>
              <Label htmlFor="edit_customization_details">Customization Details</Label>
              <Textarea
                id="edit_customization_details"
                value={editItem.customization_details}
                onChange={(e) => setEditItem(prev => ({ ...prev, customization_details: e.target.value }))}
                placeholder="Enter customization details"
                rows={3}
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button variant="outline" onClick={() => setShowEditDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleUpdateItem} disabled={!editItem.base_sku.trim()}>
              Update Item
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!pendingDeleteId} onOpenChange={() => setPendingDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the inventory item.
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
}

export default ReadyInventory;