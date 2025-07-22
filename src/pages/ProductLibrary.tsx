import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Plus, Search, Package, Edit, Trash2, Eye, BookOpen, Filter, AlertCircle } from "lucide-react";
import { AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogAction, AlertDialogCancel } from "@/components/ui/alert-dialog";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabaseClient";
import { useAuthStore } from "@/store/authStore";

interface Product {
  sl_no: number;
  product_name: string;
  product_link?: string;
  blank_sku?: string;
  design_sku?: string;
  final_sku?: string;
  customization_type?: string;
  artwork_link?: string;
  dimension?: string;
  remarks?: string;
  status?: string;
  created_at?: string;
  created_by?: string;
  updated_at?: string;
  updated_by?: string;
}

const ProductLibrary = () => {
  const { role } = useAuthStore();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [pendingDeleteId, setPendingDeleteId] = useState<number | null>(null);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showViewDialog, setShowViewDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [newProduct, setNewProduct] = useState({
    product_name: '',
    product_link: '',
    blank_sku: '',
    design_sku: '',
    final_sku: '',
    customization_type: '',
    artwork_link: '',
    dimension: '',
    remarks: '',
    status: 'active'
  });
  const [editProduct, setEditProduct] = useState({
    product_name: '',
    product_link: '',
    blank_sku: '',
    design_sku: '',
    final_sku: '',
    customization_type: '',
    artwork_link: '',
    dimension: '',
    remarks: '',
    status: 'active'
  });

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const { data, error } = await supabase
          .schema("oms_offineeds")
          .from("product_library")
          .select("*")
          .order("created_at", { ascending: false });
        
        if (error) {
          setError(`Database error: ${error.message}`);
          setProducts([]);
        } else {
          setProducts(data || []);
          setError(null);
        }
      } catch (err) {
        setError(`Unexpected error: ${err instanceof Error ? err.message : 'Unknown error'}`);
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };
    
    fetchProducts();
  }, []);

  const filteredProducts = products.filter(product => {
    const matchesSearch =
      (product.product_name || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (product.blank_sku || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (product.design_sku || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (product.final_sku || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (product.customization_type || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (product.status || "").toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === "all" || product.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const handleView = (product: Product) => {
    setSelectedProduct(product);
    setShowViewDialog(true);
  };

  const handleEdit = (product: Product) => {
    setSelectedProduct(product);
    setEditProduct({
      product_name: product.product_name || '',
      product_link: product.product_link || '',
      blank_sku: product.blank_sku || '',
      design_sku: product.design_sku || '',
      final_sku: product.final_sku || '',
      customization_type: product.customization_type || '',
      artwork_link: product.artwork_link || '',
      dimension: product.dimension || '',
      remarks: product.remarks || '',
      status: product.status || 'active'
    });
    setShowEditDialog(true);
  };

  const handleDelete = (productId: number) => {
    setPendingDeleteId(productId);
  };

  const confirmDelete = () => {
    if (pendingDeleteId) {
      setProducts(prev => prev.filter(product => product.sl_no !== pendingDeleteId));
      setPendingDeleteId(null);
      toast({
        title: "Deleted",
        description: "Product has been deleted successfully",
      });
    }
  };

  const cancelDelete = () => {
    setPendingDeleteId(null);
  };

  const handleCreateProduct = () => {
    setShowCreateDialog(true);
  };

  const handleCreateSubmit = async () => {
    try {
      // Create new product object with auto-generated sl_no
      const productToCreate = {
        ...newProduct,
        sl_no: Math.max(...products.map(p => p.sl_no), 0) + 1,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      // Add to local state
      setProducts(prev => [productToCreate, ...prev]);
      
      // Reset form
      setNewProduct({
        product_name: '',
        product_link: '',
        blank_sku: '',
        design_sku: '',
        final_sku: '',
        customization_type: '',
        artwork_link: '',
        dimension: '',
        remarks: '',
        status: 'active'
      });
      
      setShowCreateDialog(false);
      
      toast({
        title: "Success",
        description: "Product created successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create product",
        variant: "destructive"
      });
    }
  };

  const handleCreateCancel = () => {
    setShowCreateDialog(false);
    setNewProduct({
      product_name: '',
      product_link: '',
      blank_sku: '',
      design_sku: '',
      final_sku: '',
      customization_type: '',
      artwork_link: '',
      dimension: '',
      remarks: '',
      status: 'active'
    });
  };

  const handleEditSubmit = async () => {
    try {
      // Update product in local state
      setProducts(prev => prev.map(product => 
        product.sl_no === selectedProduct?.sl_no 
          ? { ...product, ...editProduct, updated_at: new Date().toISOString() }
          : product
      ));
      
      setShowEditDialog(false);
      setSelectedProduct(null);
      
      toast({
        title: "Success",
        description: "Product updated successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update product",
        variant: "destructive"
      });
    }
  };

  const handleEditCancel = () => {
    setShowEditDialog(false);
    setSelectedProduct(null);
  };

  const handleViewClose = () => {
    setShowViewDialog(false);
    setSelectedProduct(null);
  };

  // Remove any full-page loading spinner. Render product library content immediately, and use skeletons or partial loading indicators for sections if needed.

  if (error) return (
    <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-center">
      <AlertCircle className="h-5 w-5 text-red-500 mr-3" />
      <span className="text-red-700">Error: {error}</span>
    </div>
  );

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
        <div>
          <h1 className="text-3xl font-bold text-black mt-16 sm:mt-0">Product Library</h1>
          <p className="text-gray-600 mt-2 text-lg">
            Browse and manage your product library
          </p>
        </div>
        <Button 
          onClick={handleCreateProduct} 
          className="bg-gradient-to-r from-indigo-600 to-purple-700 hover:from-indigo-700 hover:to-purple-800 text-white shadow-lg hover:shadow-xl transition-all duration-300"
        >
          <Plus className="h-4 w-4 mr-2" />
          Create New Product
        </Button>
      </div>

      {/* Stats Card */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border-0 bg-gradient-to-r from-indigo-50 to-purple-50 shadow-lg">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center text-sm font-medium text-gray-700">
              <div className="p-3 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-xl mr-3">
                <BookOpen className="h-5 w-5 text-white" />
              </div>
              Total Products
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-black mb-2">
              {products.length}
            </div>
            <p className="text-sm text-gray-600">Products in library</p>
          </CardContent>
        </Card>

        <Card className="border-0 bg-gradient-to-r from-green-50 to-emerald-50 shadow-lg">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center text-sm font-medium text-gray-700">
              <div className="p-3 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl mr-3">
                <Package className="h-5 w-5 text-white" />
              </div>
              Active Products
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent mb-2">
              {products.filter(p => p.status === 'active').length}
            </div>
            <p className="text-sm text-gray-600">Currently active</p>
          </CardContent>
        </Card>

        <Card className="border-0 bg-gradient-to-r from-blue-50 to-indigo-50 shadow-lg">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center text-sm font-medium text-gray-700">
              <div className="p-3 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-xl mr-3">
                <Filter className="h-5 w-5 text-white" />
              </div>
              Filtered Results
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-2">
              {filteredProducts.length}
            </div>
            <p className="text-sm text-gray-600">Matching your search</p>
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
                  placeholder="Search products by name, SKU, or type..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 border-gray-200 focus:border-indigo-500 focus:ring-indigo-500"
                />
              </div>
            </div>
            <div className="sm:w-48">
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="border-gray-200 focus:border-indigo-500 focus:ring-indigo-500">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                  <SelectItem value="new">New</SelectItem>
                  <SelectItem value="deactivated">Deactivated</SelectItem>
                  <SelectItem value="archived">Archived</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Product Table */}
      <Card className="border-0 bg-white/80 backdrop-blur-sm">
        <CardHeader>
          <CardTitle>Products</CardTitle>
          <CardDescription>{filteredProducts.length} products found</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-16">SL No</th>
                  <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-80">Product Name</th>
                  <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-48">Blank SKU</th>
                  <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-48">Design SKU</th>
                  <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-48">Final SKU</th>
                  <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-48">Customization</th>
                  <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-24">Artwork</th>
                  <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-32">Dimension</th>
                  <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-24">Product</th>
                  <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-24">Status</th>
                  <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-24">Remarks</th>
                  <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-28">Created</th>
                  <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-28">Updated</th>
                  <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-24">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredProducts.length === 0 ? (
                  <tr>
                    <td colSpan={13} className="text-center py-8 text-gray-500">No products found.</td>
                  </tr>
                ) : (
                  filteredProducts.map(product => (
                    <tr key={product.sl_no} className="hover:bg-gray-50">
                      <td className="px-3 py-3 text-sm font-medium text-gray-900">{product.sl_no}</td>
                      <td className="px-3 py-3 text-sm text-gray-900">
                        <div className="break-words" title={product.product_name}>
                          {product.product_name}
                        </div>
                      </td>
                      <td className="px-3 py-3 text-sm text-gray-900">
                        <div className="break-words" title={product.blank_sku || '-'}>
                          {product.blank_sku || '-'}
                        </div>
                      </td>
                      <td className="px-3 py-3 text-sm text-gray-900">
                        <div className="break-words" title={product.design_sku || '-'}>
                          {product.design_sku || '-'}
                        </div>
                      </td>
                      <td className="px-3 py-3 text-sm text-gray-900">
                        <div className="break-words" title={product.final_sku || '-'}>
                          {product.final_sku || '-'}
                        </div>
                      </td>
                      <td className="px-3 py-3 text-sm text-gray-900">
                        <div className="break-words" title={product.customization_type || '-'}>
                          {product.customization_type || '-'}
                        </div>
                      </td>
                      <td className="px-3 py-3 text-sm text-gray-900">
                        {product.artwork_link ? (
                          <a 
                            href={product.artwork_link} 
                            target="_blank" 
                            rel="noopener noreferrer" 
                            className="text-blue-600 hover:text-blue-800 hover:underline text-xs"
                          >
                            View
                          </a>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </td>
                      <td className="px-3 py-3 text-sm text-gray-900">
                        <div className="break-words" title={product.dimension || '-'}>
                          {product.dimension || '-'}
                        </div>
                      </td>
                      <td className="px-3 py-3 text-sm text-gray-900">
                        {product.product_link ? (
                          <a 
                            href={product.product_link} 
                            target="_blank" 
                            rel="noopener noreferrer" 
                            className="text-blue-600 hover:text-blue-800 hover:underline text-xs"
                          >
                            View
                          </a>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </td>
                      <td className="px-3 py-3 text-sm">
                        <Badge variant="secondary" className="text-xs">
                          {product.status || '-'}
                        </Badge>
                      </td>
                      <td className="px-3 py-3 text-sm">
                        <Badge variant="outline" className="text-xs">
                          {product.remarks || '-'}
                        </Badge>
                      </td>
                      <td className="px-3 py-3 text-sm text-gray-900">
                        {product.created_at ? new Date(product.created_at).toLocaleDateString() : '-'}
                      </td>
                      <td className="px-3 py-3 text-sm text-gray-900">
                        {product.updated_at ? new Date(product.updated_at).toLocaleDateString() : '-'}
                      </td>
                      <td className="px-3 py-3 text-sm">
                        <div className="flex gap-1">
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleView(product)}
                            className="hover:bg-blue-50 h-8 w-8 p-0"
                          >
                            <Eye className="h-3 w-3" />
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleEdit(product)}
                            className="hover:bg-green-50 h-8 w-8 p-0"
                          >
                            <Edit className="h-3 w-3" />
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleDelete(product.sl_no)}
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

      {/* Create Product Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create New Product</DialogTitle>
            <DialogDescription>
              Add a new product to your library
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="product_name" className="text-sm">Product Name *</Label>
                <Input
                  id="product_name"
                  value={newProduct.product_name}
                  onChange={(e) => setNewProduct(prev => ({ ...prev, product_name: e.target.value }))}
                  placeholder="Enter product name"
                  className="h-9"
                />
              </div>
              <div>
                <Label htmlFor="status">Status</Label>
                <Select value={newProduct.status} onValueChange={(value) => setNewProduct(prev => ({ ...prev, status: value }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                    <SelectItem value="new">New</SelectItem>
                    <SelectItem value="deactivated">Deactivated</SelectItem>
                    <SelectItem value="archived">Archived</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="blank_sku">Blank SKU</Label>
                <Input
                  id="blank_sku"
                  value={newProduct.blank_sku}
                  onChange={(e) => setNewProduct(prev => ({ ...prev, blank_sku: e.target.value }))}
                  placeholder="Enter blank SKU"
                />
              </div>
              <div>
                <Label htmlFor="design_sku">Design SKU</Label>
                <Input
                  id="design_sku"
                  value={newProduct.design_sku}
                  onChange={(e) => setNewProduct(prev => ({ ...prev, design_sku: e.target.value }))}
                  placeholder="Enter design SKU"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="final_sku">Final SKU</Label>
                <Input
                  id="final_sku"
                  value={newProduct.final_sku}
                  onChange={(e) => setNewProduct(prev => ({ ...prev, final_sku: e.target.value }))}
                  placeholder="Enter final SKU"
                />
              </div>
              <div>
                <Label htmlFor="customization_type">Customization Type</Label>
                <Input
                  id="customization_type"
                  value={newProduct.customization_type}
                  onChange={(e) => setNewProduct(prev => ({ ...prev, customization_type: e.target.value }))}
                  placeholder="Enter customization type"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="dimension">Dimension</Label>
                <Input
                  id="dimension"
                  value={newProduct.dimension}
                  onChange={(e) => setNewProduct(prev => ({ ...prev, dimension: e.target.value }))}
                  placeholder="Enter dimensions"
                />
              </div>
              <div>
                <Label htmlFor="product_link">Product Link</Label>
                <Input
                  id="product_link"
                  value={newProduct.product_link}
                  onChange={(e) => setNewProduct(prev => ({ ...prev, product_link: e.target.value }))}
                  placeholder="Enter product URL"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="artwork_link">Artwork Link</Label>
              <Input
                id="artwork_link"
                value={newProduct.artwork_link}
                onChange={(e) => setNewProduct(prev => ({ ...prev, artwork_link: e.target.value }))}
                placeholder="Enter artwork URL"
              />
            </div>

            <div>
              <Label htmlFor="remarks">Remarks</Label>
              <Textarea
                id="remarks"
                value={newProduct.remarks}
                onChange={(e) => setNewProduct(prev => ({ ...prev, remarks: e.target.value }))}
                placeholder="Enter any remarks or notes"
                rows={3}
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button variant="outline" onClick={handleCreateCancel}>
              Cancel
            </Button>
            <Button onClick={handleCreateSubmit} disabled={!newProduct.product_name.trim()}>
              Create Product
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* View Product Dialog */}
      <Dialog open={showViewDialog} onOpenChange={setShowViewDialog}>
        <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Product Details</DialogTitle>
            <DialogDescription>
              Detailed information for {selectedProduct?.product_name}
            </DialogDescription>
          </DialogHeader>
          
          {selectedProduct && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-medium text-gray-600">SL No</label>
                  <p className="text-sm text-gray-900">{selectedProduct.sl_no}</p>
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-600">Product Name</label>
                  <p className="text-sm text-gray-900">{selectedProduct.product_name}</p>
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-600">Status</label>
                  <div className="mt-1">
                    <Badge variant="secondary" className="text-xs">
                      {selectedProduct.status || 'N/A'}
                    </Badge>
                  </div>
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-600">Blank SKU</label>
                  <p className="text-sm text-gray-900">{selectedProduct.blank_sku || 'N/A'}</p>
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-600">Design SKU</label>
                  <p className="text-sm text-gray-900">{selectedProduct.design_sku || 'N/A'}</p>
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-600">Final SKU</label>
                  <p className="text-sm text-gray-900">{selectedProduct.final_sku || 'N/A'}</p>
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-600">Customization Type</label>
                  <p className="text-sm text-gray-900">{selectedProduct.customization_type || 'N/A'}</p>
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-600">Dimension</label>
                  <p className="text-sm text-gray-900">{selectedProduct.dimension || 'N/A'}</p>
                </div>
              </div>
              
              {selectedProduct.product_link && (
                <div>
                  <label className="text-xs font-medium text-gray-600">Product Link</label>
                  <a 
                    href={selectedProduct.product_link} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="text-blue-600 hover:text-blue-800 hover:underline text-sm block mt-1"
                  >
                    View Product
                  </a>
                </div>
              )}
              
              {selectedProduct.artwork_link && (
                <div>
                  <label className="text-xs font-medium text-gray-600">Artwork Link</label>
                  <a 
                    href={selectedProduct.artwork_link} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="text-blue-600 hover:text-blue-800 hover:underline text-sm block mt-1"
                  >
                    View Artwork
                  </a>
                </div>
              )}
              
              {selectedProduct.remarks && (
                <div>
                  <label className="text-xs font-medium text-gray-600">Remarks</label>
                  <p className="text-sm text-gray-900 mt-1">{selectedProduct.remarks}</p>
                </div>
              )}
              
              <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                <div>
                  <label className="text-xs font-medium text-gray-600">Created At</label>
                  <p className="text-sm text-gray-900">
                    {selectedProduct.created_at ? new Date(selectedProduct.created_at).toLocaleDateString() : 'N/A'}
                  </p>
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-600">Updated At</label>
                  <p className="text-sm text-gray-900">
                    {selectedProduct.updated_at ? new Date(selectedProduct.updated_at).toLocaleDateString() : 'N/A'}
                  </p>
                </div>
              </div>
            </div>
          )}
          
          <div className="flex justify-end pt-4">
            <Button variant="outline" onClick={handleViewClose}>
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Product Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Product</DialogTitle>
            <DialogDescription>
              Update product information
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit_product_name">Product Name *</Label>
                <Input
                  id="edit_product_name"
                  value={editProduct.product_name}
                  onChange={(e) => setEditProduct(prev => ({ ...prev, product_name: e.target.value }))}
                  placeholder="Enter product name"
                />
              </div>
              <div>
                <Label htmlFor="edit_status">Status</Label>
                <Select value={editProduct.status} onValueChange={(value) => setEditProduct(prev => ({ ...prev, status: value }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                    <SelectItem value="new">New</SelectItem>
                    <SelectItem value="deactivated">Deactivated</SelectItem>
                    <SelectItem value="archived">Archived</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit_blank_sku">Blank SKU</Label>
                <Input
                  id="edit_blank_sku"
                  value={editProduct.blank_sku}
                  onChange={(e) => setEditProduct(prev => ({ ...prev, blank_sku: e.target.value }))}
                  placeholder="Enter blank SKU"
                />
              </div>
              <div>
                <Label htmlFor="edit_design_sku">Design SKU</Label>
                <Input
                  id="edit_design_sku"
                  value={editProduct.design_sku}
                  onChange={(e) => setEditProduct(prev => ({ ...prev, design_sku: e.target.value }))}
                  placeholder="Enter design SKU"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit_final_sku">Final SKU</Label>
                <Input
                  id="edit_final_sku"
                  value={editProduct.final_sku}
                  onChange={(e) => setEditProduct(prev => ({ ...prev, final_sku: e.target.value }))}
                  placeholder="Enter final SKU"
                />
              </div>
              <div>
                <Label htmlFor="edit_customization_type">Customization Type</Label>
                <Input
                  id="edit_customization_type"
                  value={editProduct.customization_type}
                  onChange={(e) => setEditProduct(prev => ({ ...prev, customization_type: e.target.value }))}
                  placeholder="Enter customization type"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit_dimension">Dimension</Label>
                <Input
                  id="edit_dimension"
                  value={editProduct.dimension}
                  onChange={(e) => setEditProduct(prev => ({ ...prev, dimension: e.target.value }))}
                  placeholder="Enter dimensions"
                />
              </div>
              <div>
                <Label htmlFor="edit_product_link">Product Link</Label>
                <Input
                  id="edit_product_link"
                  value={editProduct.product_link}
                  onChange={(e) => setEditProduct(prev => ({ ...prev, product_link: e.target.value }))}
                  placeholder="Enter product URL"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="edit_artwork_link">Artwork Link</Label>
              <Input
                id="edit_artwork_link"
                value={editProduct.artwork_link}
                onChange={(e) => setEditProduct(prev => ({ ...prev, artwork_link: e.target.value }))}
                placeholder="Enter artwork URL"
              />
            </div>

            <div>
              <Label htmlFor="edit_remarks">Remarks</Label>
              <Textarea
                id="edit_remarks"
                value={editProduct.remarks}
                onChange={(e) => setEditProduct(prev => ({ ...prev, remarks: e.target.value }))}
                placeholder="Enter any remarks or notes"
                rows={3}
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button variant="outline" onClick={handleEditCancel}>
              Cancel
            </Button>
            <Button onClick={handleEditSubmit} disabled={!editProduct.product_name.trim()}>
              Update Product
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
              This action cannot be undone. This will permanently delete the product.
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

export default ProductLibrary;
