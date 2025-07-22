import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
// Table components are built-in with Tailwind classes
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ShoppingCart, Plus, Search, Filter, AlertTriangle, Edit, Eye, Trash2 } from "lucide-react";
import { AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogAction, AlertDialogCancel } from "@/components/ui/alert-dialog";
import { useState } from "react";
import { motion } from "framer-motion";

import { useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";

export default function PurchaseOrders() {
  const [purchaseOrders, setPurchaseOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchPurchaseOrders() {
      setLoading(true);
      setError("");
      const { data, error } = await supabase
        .schema("oms_offineeds")
        .from("purchase_orders")
        .select("id, po_number, base_sku, vendor_sku, quantity, category, color, status, vendor_name, po_details, updated_by, updated_at, created_at, created_by")
        .order("created_at", { ascending: false });
      if (error) {
        setError("Failed to load purchase orders: " + error.message);
        setPurchaseOrders([]);
      } else {
        setPurchaseOrders((data || []).map(row => ({
          id: row.po_number || row.id,
          base_sku: row.base_sku,
          vendor_sku: row.vendor_sku,
          quantity: row.quantity,
          category: row.category,
          color: row.color,
          status: row.status,
          vendor_name: row.vendor_name,
          po_details: row.po_details,
          updated_by: row.updated_by,
          updated_at: row.updated_at,
          created_at: row.created_at,
          created_by: row.created_by
        })));
      }
      setLoading(false);
    }
    fetchPurchaseOrders();
  }, []);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [slaFilter, setSlaFilter] = useState("all");
  const [showFieldAlert, setShowFieldAlert] = useState(false);
  const [pendingDeleteId, setPendingDeleteId] = useState(null);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showViewDialog, setShowViewDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [selectedPO, setSelectedPO] = useState(null);
  const [newPO, setNewPO] = useState({
    po_number: '',
    base_sku: '',
    vendor_sku: '',
    quantity: '',
    category: '',
    color: '',
    status: 'pending',
    vendor_name: '',
    po_details: ''
  });
  const [editPO, setEditPO] = useState({
    po_number: '',
    base_sku: '',
    vendor_sku: '',
    quantity: '',
    category: '',
    color: '',
    status: 'pending',
    vendor_name: '',
    po_details: ''
  });

  const getStatusBadge = (status) => {
    switch (status) {
      case 'pending':
        return <Badge variant="secondary" className="bg-yellow-500 text-white">Pending</Badge>;
      case 'approved':
        return <Badge variant="secondary" className="bg-green-500 text-white">Approved</Badge>;
      case 'delayed':
        return <Badge variant="destructive">Delayed</Badge>;
      case 'received':
        return <Badge variant="secondary" className="bg-blue-500 text-white">Received</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getSLABadge = (sla) => {
    if (sla <= 1) return <Badge variant="destructive" className="flex items-center gap-1">
      <AlertTriangle className="h-3 w-3" />
      Urgent
    </Badge>;
    if (sla <= 3) return <Badge variant="secondary" className="bg-orange-500 text-white">Due Soon</Badge>;
    return <Badge variant="secondary" className="bg-green-500 text-white">On Track</Badge>;
  };

  const handleStatusChange = (poId, newStatus) => {
    setPurchaseOrders(prev => 
      prev.map(po => 
        po.id === poId ? { ...po, status: newStatus } : po
      )
    );
  };

  const handleCreatePO = () => {
    if (!newPO.po_number || !newPO.base_sku || !newPO.vendor_name) {
      setShowFieldAlert(true);
      return;
    }

    const newPurchaseOrder = {
      id: newPO.po_number,
      po_number: newPO.po_number,
      base_sku: newPO.base_sku,
      vendor_sku: newPO.vendor_sku,
      quantity: parseInt(newPO.quantity) || 0,
      category: newPO.category,
      color: newPO.color,
      status: newPO.status,
      vendor_name: newPO.vendor_name,
      po_details: newPO.po_details,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    setPurchaseOrders(prev => [newPurchaseOrder, ...prev]);
    setNewPO({
      po_number: '',
      base_sku: '',
      vendor_sku: '',
      quantity: '',
      category: '',
      color: '',
      status: 'pending',
      vendor_name: '',
      po_details: ''
    });
    setShowCreateDialog(false);
  };

  const handleEditPO = (po) => {
    setSelectedPO(po);
    setEditPO({
      po_number: po.po_number || po.id || '',
      base_sku: po.base_sku || '',
      vendor_sku: po.vendor_sku || '',
      quantity: po.quantity?.toString() || '',
      category: po.category || '',
      color: po.color || '',
      status: po.status || 'pending',
      vendor_name: po.vendor_name || '',
      po_details: po.po_details || ''
    });
    setShowEditDialog(true);
  };

  const handleUpdatePO = () => {
    if (!editPO.po_number || !editPO.base_sku || !editPO.vendor_name) {
      setShowFieldAlert(true);
      return;
    }

    setPurchaseOrders(prev => 
      prev.map(po => 
        po.id === selectedPO.id ? {
          ...po,
          po_number: editPO.po_number,
          base_sku: editPO.base_sku,
          vendor_sku: editPO.vendor_sku,
          quantity: parseInt(editPO.quantity) || 0,
          category: editPO.category,
          color: editPO.color,
          status: editPO.status,
          vendor_name: editPO.vendor_name,
          po_details: editPO.po_details,
          updated_at: new Date().toISOString()
        } : po
      )
    );

    setShowEditDialog(false);
    setSelectedPO(null);
  };

  const handleViewPO = (po) => {
    setSelectedPO(po);
    setShowViewDialog(true);
  };

  const handleDeletePO = (poId) => {
    setPendingDeleteId(poId);
  };
  const confirmDeletePO = () => {
    setPurchaseOrders(prev => prev.filter(po => po.id !== pendingDeleteId));
    setPendingDeleteId(null);
  };
  const cancelDeletePO = () => {
    setPendingDeleteId(null);
  };

  const filteredPOs = purchaseOrders.filter(po => {
    // Always match if search is empty
    if (!searchTerm.trim()) return statusFilter === "all" || po.status === statusFilter;
    const matchesSearch = (po.vendor_name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (po.id || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (po.po_number || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (po.base_sku || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (po.category || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || po.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="space-y-6"
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl sm:text-3xl font-bold tracking-tight">
            Purchase Orders
          </h1>
          <p className="text-xs sm:text-base text-muted-foreground">
            Manage supplier purchase orders and procurement workflow.
          </p>
        </div>
      </div>
      {/* Table */}
      <Card>
        <CardHeader>
          <CardTitle>Purchase Orders</CardTitle>
          <CardDescription>{filteredPOs.length} orders found</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="w-full overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-32 whitespace-nowrap">ID</th>
                  <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-40 whitespace-nowrap">PO Number</th>
                  <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-40 whitespace-nowrap">Base SKU</th>
                  <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-40 whitespace-nowrap">Vendor SKU</th>
                  <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-20 whitespace-nowrap">Quantity</th>
                  <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-32 whitespace-nowrap">Category</th>
                  <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-24 whitespace-nowrap">Color</th>
                  <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-24 whitespace-nowrap">Status</th>
                  <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-48 whitespace-nowrap">Vendor Name</th>
                  <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-40 whitespace-nowrap">PO Details</th>
                  <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-24 whitespace-nowrap">Created By</th>
                  <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-24 whitespace-nowrap">Updated By</th>
                  <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-28 whitespace-nowrap">Created At</th>
                  <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-28 whitespace-nowrap">Updated At</th>
                  <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-24 whitespace-nowrap">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredPOs.length === 0 ? (
                  <tr>
                    <td colSpan={14} className="text-center py-8 text-gray-500">No purchase orders found.</td>
                  </tr>
                ) : (
                  filteredPOs.map((po, index) => (
                    <tr key={po.id} className="hover:bg-gray-50">
                      <td className="px-3 py-3 text-sm font-medium text-gray-900">
                        <div className="truncate" title={`${index + 1}`}>
                          {index + 1}
                        </div>
                      </td>
                      <td className="px-3 py-3 text-sm font-medium text-gray-900">
                        <div className="truncate" title={po.po_number || po.id || '-'}>
                          {po.po_number || po.id || '-'}
                        </div>
                      </td>
                      <td className="px-3 py-3 text-sm text-gray-900">
                        <div className="break-words" title={po.base_sku || '-'}>
                          {po.base_sku || '-'}
                        </div>
                      </td>
                      <td className="px-3 py-3 text-sm text-gray-900">
                        <div className="break-words" title={po.vendor_sku || '-'}>
                          {po.vendor_sku || '-'}
                        </div>
                      </td>
                      <td className="px-3 py-3 text-sm text-gray-900">{po.quantity ?? '-'}</td>
                      <td className="px-3 py-3 text-sm text-gray-900">
                        <div className="break-words" title={po.category || '-'}>
                          {po.category || '-'}
                        </div>
                      </td>
                      <td className="px-3 py-3 text-sm text-gray-900">
                        <div className="break-words" title={po.color || '-'}>
                          {po.color || '-'}
                        </div>
                      </td>
                      <td className="px-3 py-3 text-sm">
                        <Badge variant="secondary" className="text-xs">
                          {po.status || '-'}
                        </Badge>
                      </td>
                      <td className="px-3 py-3 text-sm text-gray-900">
                        <div className="break-words" title={po.vendor_name || '-'}>
                          {po.vendor_name || '-'}
                        </div>
                      </td>
                      <td className="px-3 py-3 text-sm text-gray-900">
                        {po.po_details ? (
                          <div className="max-w-36">
                            <details className="text-xs">
                              <summary className="cursor-pointer text-blue-600 hover:text-blue-800">
                                View
                              </summary>
                              <pre className="mt-1 p-2 bg-gray-50 rounded text-xs overflow-auto max-h-20">
                                {JSON.stringify(po.po_details, null, 2)}
                              </pre>
                            </details>
                          </div>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </td>
                      <td className="px-3 py-3 text-sm text-gray-900">
                        <div className="break-words" title={po.created_by || '-'}>
                          {po.created_by ? po.created_by.substring(0, 8) + '...' : '-'}
                        </div>
                      </td>
                      <td className="px-3 py-3 text-sm text-gray-900">
                        <div className="break-words" title={po.updated_by || '-'}>
                          {po.updated_by ? po.updated_by.substring(0, 8) + '...' : '-'}
                        </div>
                      </td>
                      <td className="px-3 py-3 text-sm text-gray-900">
                        {po.created_at ? new Date(po.created_at).toLocaleDateString() : '-'}
                      </td>
                      <td className="px-3 py-3 text-sm text-gray-900">
                        {po.updated_at ? new Date(po.updated_at).toLocaleDateString() : '-'}
                      </td>
                      <td className="px-3 py-3 text-sm">
                        <div className="flex gap-1">
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleViewPO(po)}
                            className="hover:bg-blue-50 h-8 w-8 p-0"
                          >
                            <Eye className="h-3 w-3" />
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleEditPO(po)}
                            className="hover:bg-green-50 h-8 w-8 p-0"
                          >
                            <Edit className="h-3 w-3" />
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleDeletePO(po.id)}
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

      {/* Create Purchase Order Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create New Purchase Order</DialogTitle>
            <DialogDescription>
              Add a new purchase order
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="po_number" className="text-sm">PO Number *</Label>
                <Input
                  id="po_number"
                  value={newPO.po_number}
                  onChange={(e) => setNewPO(prev => ({ ...prev, po_number: e.target.value }))}
                  placeholder="Enter PO number"
                  className="h-9"
                />
              </div>
              <div>
                <Label htmlFor="status" className="text-sm">Status</Label>
                <Select value={newPO.status} onValueChange={(value) => setNewPO(prev => ({ ...prev, status: value }))}>
                  <SelectTrigger className="h-9">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="approved">Approved</SelectItem>
                    <SelectItem value="delayed">Delayed</SelectItem>
                    <SelectItem value="received">Received</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="base_sku" className="text-sm">Base SKU *</Label>
                <Input
                  id="base_sku"
                  value={newPO.base_sku}
                  onChange={(e) => setNewPO(prev => ({ ...prev, base_sku: e.target.value }))}
                  placeholder="Enter base SKU"
                  className="h-9"
                />
              </div>
              <div>
                <Label htmlFor="vendor_sku" className="text-sm">Vendor SKU</Label>
                <Input
                  id="vendor_sku"
                  value={newPO.vendor_sku}
                  onChange={(e) => setNewPO(prev => ({ ...prev, vendor_sku: e.target.value }))}
                  placeholder="Enter vendor SKU"
                  className="h-9"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="quantity" className="text-sm">Quantity</Label>
                <Input
                  id="quantity"
                  type="number"
                  value={newPO.quantity}
                  onChange={(e) => setNewPO(prev => ({ ...prev, quantity: e.target.value }))}
                  placeholder="Enter quantity"
                  className="h-9"
                />
              </div>
              <div>
                <Label htmlFor="category" className="text-sm">Category</Label>
                <Input
                  id="category"
                  value={newPO.category}
                  onChange={(e) => setNewPO(prev => ({ ...prev, category: e.target.value }))}
                  placeholder="Enter category"
                  className="h-9"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="color" className="text-sm">Color</Label>
                <Input
                  id="color"
                  value={newPO.color}
                  onChange={(e) => setNewPO(prev => ({ ...prev, color: e.target.value }))}
                  placeholder="Enter color"
                  className="h-9"
                />
              </div>
              <div>
                <Label htmlFor="vendor_name" className="text-sm">Vendor Name *</Label>
                <Input
                  id="vendor_name"
                  value={newPO.vendor_name}
                  onChange={(e) => setNewPO(prev => ({ ...prev, vendor_name: e.target.value }))}
                  placeholder="Enter vendor name"
                  className="h-9"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="po_details" className="text-sm">PO Details</Label>
              <Textarea
                id="po_details"
                value={newPO.po_details}
                onChange={(e) => setNewPO(prev => ({ ...prev, po_details: e.target.value }))}
                placeholder="Enter PO details"
                rows={2}
                className="min-h-[60px]"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreatePO} disabled={!newPO.po_number.trim() || !newPO.base_sku.trim() || !newPO.vendor_name.trim()}>
              Create PO
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* View Purchase Order Dialog */}
      <Dialog open={showViewDialog} onOpenChange={setShowViewDialog}>
        <DialogContent className="sm:max-w-[700px] max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Purchase Order Details</DialogTitle>
            <DialogDescription>
              Detailed information for {selectedPO?.po_number || selectedPO?.id}
            </DialogDescription>
          </DialogHeader>
          
          {selectedPO && (
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-gray-600">PO Number</label>
                  <p className="text-sm text-gray-900">{selectedPO.po_number || selectedPO.id}</p>
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-600">Status</label>
                  <div className="mt-1">{getStatusBadge(selectedPO.status)}</div>
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-600">Base SKU</label>
                  <p className="text-sm text-gray-900">{selectedPO.base_sku || 'N/A'}</p>
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-600">Vendor SKU</label>
                  <p className="text-sm text-gray-900">{selectedPO.vendor_sku || 'N/A'}</p>
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-600">Quantity</label>
                  <p className="text-sm text-gray-900">{selectedPO.quantity || 'N/A'}</p>
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-600">Category</label>
                  <p className="text-sm text-gray-900">{selectedPO.category || 'N/A'}</p>
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-600">Color</label>
                  <p className="text-sm text-gray-900">{selectedPO.color || 'N/A'}</p>
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-600">Vendor Name</label>
                  <p className="text-sm text-gray-900">{selectedPO.vendor_name || 'N/A'}</p>
                </div>
              </div>
              
              {selectedPO.po_details && (
                <div>
                  <label className="text-xs font-medium text-gray-600">PO Details</label>
                  <p className="text-sm text-gray-900 mt-1">{selectedPO.po_details}</p>
                </div>
              )}
              
              <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                <div>
                  <label className="text-xs font-medium text-gray-600">Created At</label>
                  <p className="text-sm text-gray-900">
                    {selectedPO.created_at ? new Date(selectedPO.created_at).toLocaleDateString() : 'N/A'}
                  </p>
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-600">Updated At</label>
                  <p className="text-sm text-gray-900">
                    {selectedPO.updated_at ? new Date(selectedPO.updated_at).toLocaleDateString() : 'N/A'}
                  </p>
                </div>
              </div>
            </div>
          )}
          
          <div className="flex justify-end pt-4">
            <Button variant="outline" onClick={() => setShowViewDialog(false)}>
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Purchase Order Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Purchase Order</DialogTitle>
            <DialogDescription>
              Update purchase order information
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="edit_po_number" className="text-sm">PO Number *</Label>
                <Input
                  id="edit_po_number"
                  value={editPO.po_number}
                  onChange={(e) => setEditPO(prev => ({ ...prev, po_number: e.target.value }))}
                  placeholder="Enter PO number"
                  className="h-9"
                />
              </div>
              <div>
                <Label htmlFor="edit_status" className="text-sm">Status</Label>
                <Select value={editPO.status} onValueChange={(value) => setEditPO(prev => ({ ...prev, status: value }))}>
                  <SelectTrigger className="h-9">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="approved">Approved</SelectItem>
                    <SelectItem value="delayed">Delayed</SelectItem>
                    <SelectItem value="received">Received</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="edit_base_sku" className="text-sm">Base SKU *</Label>
                <Input
                  id="edit_base_sku"
                  value={editPO.base_sku}
                  onChange={(e) => setEditPO(prev => ({ ...prev, base_sku: e.target.value }))}
                  placeholder="Enter base SKU"
                  className="h-9"
                />
              </div>
              <div>
                <Label htmlFor="edit_vendor_sku" className="text-sm">Vendor SKU</Label>
                <Input
                  id="edit_vendor_sku"
                  value={editPO.vendor_sku}
                  onChange={(e) => setEditPO(prev => ({ ...prev, vendor_sku: e.target.value }))}
                  placeholder="Enter vendor SKU"
                  className="h-9"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="edit_quantity" className="text-sm">Quantity</Label>
                <Input
                  id="edit_quantity"
                  type="number"
                  value={editPO.quantity}
                  onChange={(e) => setEditPO(prev => ({ ...prev, quantity: e.target.value }))}
                  placeholder="Enter quantity"
                  className="h-9"
                />
              </div>
              <div>
                <Label htmlFor="edit_category" className="text-sm">Category</Label>
                <Input
                  id="edit_category"
                  value={editPO.category}
                  onChange={(e) => setEditPO(prev => ({ ...prev, category: e.target.value }))}
                  placeholder="Enter category"
                  className="h-9"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="edit_color" className="text-sm">Color</Label>
                <Input
                  id="edit_color"
                  value={editPO.color}
                  onChange={(e) => setEditPO(prev => ({ ...prev, color: e.target.value }))}
                  placeholder="Enter color"
                  className="h-9"
                />
              </div>
              <div>
                <Label htmlFor="edit_vendor_name" className="text-sm">Vendor Name *</Label>
                <Input
                  id="edit_vendor_name"
                  value={editPO.vendor_name}
                  onChange={(e) => setEditPO(prev => ({ ...prev, vendor_name: e.target.value }))}
                  placeholder="Enter vendor name"
                  className="h-9"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="edit_po_details" className="text-sm">PO Details</Label>
              <Textarea
                id="edit_po_details"
                value={editPO.po_details}
                onChange={(e) => setEditPO(prev => ({ ...prev, po_details: e.target.value }))}
                placeholder="Enter PO details"
                rows={2}
                className="min-h-[60px]"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button variant="outline" onClick={() => setShowEditDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleUpdatePO} disabled={!editPO.po_number.trim() || !editPO.base_sku.trim() || !editPO.vendor_name.trim()}>
              Update PO
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
              This action cannot be undone. This will permanently delete the purchase order.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={cancelDeletePO}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDeletePO} className="bg-red-600 hover:bg-red-700">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </motion.div>
  );
}