import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent as BaseDialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { ClipboardList, Plus, Search, Filter, Edit, Trash2, Eye, Calendar, User, AlertCircle, Clock, MapPin } from "lucide-react";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogAction, AlertDialogCancel } from "@/components/ui/alert-dialog";
import { useToast } from "@/components/ui/use-toast";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { supabase } from "@/lib/supabaseClient";

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 }
};

const modalVariants = {
  hidden: { 
    opacity: 0, 
    scale: 0.8,
    y: -50
  },
  show: { 
    opacity: 1, 
    scale: 1,
    y: 0,
    transition: {
      type: "spring" as const,
      stiffness: 300,
      damping: 25
    }
  },
  exit: { 
    opacity: 0, 
    scale: 0.8,
    y: -50,
    transition: {
      duration: 0.2
    }
  }
};

// DB fields for production_records
interface JobCard {
  id: string;
  order_id: string;
  child_order_id?: string;
  website_sku?: string;
  category?: string;
  store_name?: string;
  customization_code?: string;
  design_code?: string;
  sequence_number?: number;
  location?: string;
  website_sku_description?: string;
  image_url?: string;
  order_date?: string;
  assigned_to?: string; // uuid as string
  assigned_by?: string; // uuid as string
  order_status: string;
  reason?: string;
  production_sla?: number;
  updated_by?: string;
  updated_at?: string;
  created_at?: string;
  created_by?: string;
  quantity: number;
}

// Patch DialogContent to add scroll and max height for popup
const DialogContent = (props: any) => (
  <BaseDialogContent {...props} className={(props.className || "") + " max-h-[80vh] overflow-y-auto"} />
);

// Map truncated DB row to JobCard
function mapDbRowToJobCard(row: any): JobCard {
  return {
    id: row.id,
    order_id: row.order_id,
    child_order_id: row.child_order_id,
    website_sku: row.website_sku,
    category: row.category,
    store_name: row.store_name,
    customization_code: row.customization_code,
    design_code: row.design_code,
    sequence_number: row.sequence_number,
    location: row.location,
    website_sku_description: row.website_sku_description,
    image_url: row.image_url,
    order_date: row.order_date,
    assigned_to: row.assigned_to,
    assigned_by: row.assigned_by,
    order_status: row.order_status,
    reason: row.reason,
    production_sla: row.production_sla,
    updated_by: row.updated_by,
    updated_at: row.updated_at,
    created_at: row.created_at,
    created_by: row.created_by,
    quantity: row.quantity,
  };
}

export default function JobCards() {
  const [jobCards, setJobCards] = useState<JobCard[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [selectedJobCard, setSelectedJobCard] = useState<JobCard | null>(null);
  const [formData, setFormData] = useState({
    order_id: "",
    child_order_id: "",
    website_sku: "",
    category: "",
    store_name: "",
    customization_code: "",
    design_code: "",
    sequence_number: undefined,
    location: "",
    website_sku_description: "",
    image_url: "",
    order_date: "",
    assigned_to: "",
    assigned_by: "",
    order_status: "new",
    reason: "",
    production_sla: undefined,
    updated_by: "",
    created_by: "",
    quantity: 1,
  });
  const { toast } = useToast();
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");

  useEffect(() => {
    fetchJobCards();
    // Insert 5 sample job cards if none exist
    (async () => {
      const { data } = await supabase.schema("oms_offineeds").from("production_records").select("id");
      if (data && data.length === 0) {
        const now = new Date();
        const base = [1, 2, 3, 4, 5].map(i => ({
          order_id: `ORD-00${i}`,
          child_order_id: `CHILD-00${i}`,
          website_sku: `SKU-00${i}`,
          category: i === 1 ? "Embroidery" : i === 2 ? "DTF" : i === 3 ? "Digital Printing" : i === 4 ? "Sublimation" : "UV Printing",
          store_name: `Store ${i}`,
          customization_code: `CUST${i}`,
          design_code: `DESIGN${i}`,
          sequence_number: i,
          location: `Location ${i}`,
          website_sku_description: `Description for SKU-00${i}`,
          order_date: now.toISOString().split('T')[0],
          assigned_to: `user${i}@example.com`,
          assigned_by: `admin${i}@example.com`,
          order_status: i % 3 === 0 ? "done" : i % 2 === 0 ? "in_progress" : "new",
          reason: `Reason ${i}`,
          production_sla: 3 + i,
          quantity: 10 * i,
          description: `Full description for job card ${i}`
        }));
        await supabase.schema("oms_offineeds").from("production_records").insert(base);
        fetchJobCards();
      }
    })();
  }, []);

  async function fetchJobCards() {
    setLoading(true);
    setError("");
    const { data, error } = await supabase
      .schema("oms_offineeds")
      .from("production_records")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) {
      setError("Failed to load job cards: " + error.message);
      setJobCards([]);
    } else {
      setJobCards((data || []).map(mapDbRowToJobCard));
    }
    setLoading(false);
  }

  async function handleCreate() {
    // Validation
    if (!formData.order_id || formData.order_id.trim() === "") {
      toast({ title: "Order ID is required", description: "Please enter an Order ID.", variant: "destructive" });
      return;
    }
    if (!formData.quantity || formData.quantity <= 0) {
      toast({ title: "Quantity must be positive", description: "Please enter a valid quantity.", variant: "destructive" });
      return;
    }
    const dbInsertData = {
      order_id: formData.order_id,
      child_order_id: formData.child_order_id || null,
      website_sku: formData.website_sku || null,
      category: formData.category || null,
      store_name: formData.store_name || null,
      customization_code: formData.customization_code || null,
      design_code: formData.design_code || null,
      sequence_number: formData.sequence_number || null,
      location: formData.location || null,
      website_sku_description: formData.website_sku_description || null,
      image_url: formData.image_url || null,
      order_date: formData.order_date || null,
      assigned_to: formData.assigned_to || null,
      assigned_by: formData.assigned_by || null,
      order_status: formData.order_status,
      reason: formData.reason || null,
      production_sla: formData.production_sla || null,
      updated_by: formData.updated_by || null,
      created_by: formData.created_by || null,
      quantity: formData.quantity,
    };
    const { error } = await supabase.schema("oms_offineeds").from("production_records").insert([
      dbInsertData,
    ]);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Job Card Created", description: "The job card was created successfully." });
      setIsCreateOpen(false);
      setFormData({
        order_id: "",
        child_order_id: "",
        website_sku: "",
        category: "",
        store_name: "",
        customization_code: "",
        design_code: "",
        sequence_number: undefined,
        location: "",
        website_sku_description: "",
        image_url: "",
        order_date: "",
        assigned_to: "",
        assigned_by: "",
        order_status: "new",
        reason: "",
        production_sla: undefined,
        updated_by: "",
        created_by: "",
        quantity: 1,
      });
      fetchJobCards();
    }
  }

  async function handleEdit() {
    if (!selectedJobCard) return;
    const dbUpdateData = {
      order_id: formData.order_id,
      website_sku: formData.website_sku,
      category: formData.category,
      location: formData.location,
      order_status: formData.order_status,
      quantity: formData.quantity,
      website_sku_description: formData.website_sku_description,
    };
    const { error } = await supabase.schema("oms_offineeds").from("production_records").update(dbUpdateData).eq("id", selectedJobCard.id);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Job Card Updated", description: "The job card was updated successfully." });
      setIsEditOpen(false);
      setSelectedJobCard(null);
      fetchJobCards();
    }
  }

  async function handleDelete(jobId: string) {
    setPendingDeleteId(jobId);
  }
  async function confirmDelete() {
    if (!pendingDeleteId) return;
    const { error } = await supabase.schema("oms_offineeds").from("production_records").delete().eq("id", pendingDeleteId);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Job Card Deleted", description: "The job card was deleted successfully." });
      fetchJobCards();
    }
    setPendingDeleteId(null);
  }
  function cancelDelete() {
    setPendingDeleteId(null);
  }

  function openEdit(jobCard: JobCard) {
    setSelectedJobCard(jobCard);
    setFormData({
      order_id: jobCard.order_id,
      child_order_id: jobCard.child_order_id || "",
      website_sku: jobCard.website_sku || "",
      category: jobCard.category || "",
      store_name: jobCard.store_name || "",
      customization_code: jobCard.customization_code || "",
      design_code: jobCard.design_code || "",
      sequence_number: jobCard.sequence_number ?? undefined,
      location: jobCard.location || "",
      website_sku_description: jobCard.website_sku_description || "",
      image_url: jobCard.image_url || "",
      order_date: jobCard.order_date || "",
      assigned_to: jobCard.assigned_to || "",
      assigned_by: jobCard.assigned_by || "",
      order_status: jobCard.order_status,
      reason: jobCard.reason || "",
      production_sla: jobCard.production_sla ?? undefined,
      updated_by: jobCard.updated_by || "",
      created_by: jobCard.created_by || "",
      quantity: jobCard.quantity,
    });
    setIsEditOpen(true);
  }

  function openView(jobCard: JobCard) {
    setSelectedJobCard(jobCard);
    setIsViewOpen(true);
  }

  // Get unique categories and locations for filter dropdowns
  const uniqueCategories = Array.from(new Set(jobCards.map(j => j.category).filter(Boolean)));

  const filteredJobCards = jobCards.filter(job =>
    (job.order_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (job.child_order_id || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (job.website_sku || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (job.category || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (job.store_name || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (job.customization_code || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (job.design_code || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (job.location || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (job.website_sku_description || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (job.assigned_to || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (job.assigned_by || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (job.reason || "").toLowerCase().includes(searchTerm.toLowerCase())) &&
    (categoryFilter === "all" || job.category === categoryFilter) &&
    (statusFilter === "all" || job.order_status === statusFilter) &&
    (priorityFilter === "all" || getPriorityBadge(job.order_status).props.children.toLowerCase() === priorityFilter)
  );

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'High':
        return <Badge variant="destructive" className="shadow-sm">High</Badge>;
      case 'Medium':
        return <Badge variant="secondary" className="bg-yellow-500 text-white shadow-sm">Medium</Badge>;
      case 'Low':
        return <Badge variant="secondary" className="bg-green-600 text-white shadow-sm">Low</Badge>;
      default:
        return <Badge variant="secondary">{priority}</Badge>;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Pending':
        return <Badge variant="secondary" className="bg-orange-500 text-white shadow-sm">Pending</Badge>;
      case 'In Progress':
        return <Badge variant="secondary" className="bg-blue-500 text-white shadow-sm">In Progress</Badge>;
      case 'Done':
        return <Badge variant="secondary" className="bg-green-500 text-white shadow-sm">Done</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'High':
        return 'text-red-600';
      case 'Medium':
        return 'text-yellow-600';
      case 'Low':
        return 'text-green-600';
      default:
        return 'text-gray-600';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Pending':
        return 'text-orange-600';
      case 'In Progress':
        return 'text-blue-600';
      case 'Done':
        return 'text-green-600';
      default:
        return 'text-gray-600';
    }
  };

  const handleStatusChange = (jobId: string, newStatus: string) => {
    setJobCards(prev => 
      prev.map(job => 
        job.id === jobId ? { ...job, order_status: newStatus } : job
      )
    );
  };

  const getDaysUntilDue = (dueDate: string) => {
    const today = new Date();
    const due = new Date(dueDate);
    const diffTime = due.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  return (
    <motion.div 
      className="space-y-8"
      variants={containerVariants}
      initial="hidden"
      animate="show"
    >
      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-center" role="alert">
          <AlertCircle className="h-5 w-5 text-red-500 mr-3" />
          <span className="text-red-700">{error}</span>
        </div>
      )}

      {/* Header */}
      <motion.div variants={itemVariants}>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
          <div>
            <h1 className="text-3xl font-bold text-black">Job Cards</h1>
            <p className="text-gray-600 mt-2 text-lg">Manage and track production job cards efficiently</p>
          </div>
        </div>
      </motion.div>

      {/* Filters */}
      <motion.div variants={itemVariants}>
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="text-lg font-semibold">Filters</CardTitle>
            <CardDescription>Filter job cards by status, category, and search terms</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col lg:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search job cards..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <div className="flex gap-3 flex-wrap">
                {/* Status Filter */}
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-36">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="new">New</SelectItem>
                    <SelectItem value="in_progress">In Progress</SelectItem>
                    <SelectItem value="done">Done</SelectItem>
                  </SelectContent>
                </Select>
                {/* Category Filter */}
                <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                  <SelectTrigger className="w-44">
                    <SelectValue placeholder="Category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    <SelectItem value="Embroidery">Embroidery</SelectItem>
                    <SelectItem value="DTF">DTF</SelectItem>
                    <SelectItem value="Digital Printing">Digital Printing</SelectItem>
                    <SelectItem value="Sublimation">Sublimation</SelectItem>
                    <SelectItem value="UV Printing">UV Printing</SelectItem>
                    {uniqueCategories.filter(cat => !['Embroidery', 'DTF', 'Digital Printing', 'Sublimation', 'UV Printing'].includes(cat)).map((cat) => (
                      <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {/* Priority Filter */}
                <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                  <SelectTrigger className="w-36">
                    <SelectValue placeholder="Priority" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Priority</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="low">Low</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Job Cards Table */}
      <motion.div variants={itemVariants}>
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle>Active Job Cards</CardTitle>
            <CardDescription>
              {filteredJobCards.length} job cards found
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-32 whitespace-nowrap">Order ID</th>
                    <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-32 whitespace-nowrap">Child Order</th>
                    <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-36 whitespace-nowrap">Website SKU</th>
                    <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-32 whitespace-nowrap">Category</th>
                    <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-[240px] whitespace-normal">Store Name</th>
                    <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-36 whitespace-nowrap">Customization</th>
                    <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-32 whitespace-nowrap">Design Code</th>
                    <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-20 whitespace-nowrap">Seq #</th>
                    <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-32 whitespace-nowrap">Location</th>
                    <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-48 whitespace-nowrap">SKU Description</th>
                    <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-24 whitespace-nowrap">Image</th>
                    <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-24 whitespace-nowrap">Order Date</th>
                    <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-28 whitespace-nowrap">Assigned To</th>
                    <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-28 whitespace-nowrap">Assigned By</th>
                    <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-24 whitespace-nowrap">Status</th>
                    <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-[320px] whitespace-normal">Reason</th>
                    <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-20 whitespace-nowrap">SLA</th>
                    <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-20 whitespace-nowrap">Qty</th>
                    <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-24 whitespace-nowrap">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {loading ? (
                    <tr>
                      <td colSpan={19} className="text-center py-8">
                        <div className="flex flex-col items-center justify-center gap-2">
                          <svg className="animate-spin h-6 w-6 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path>
                          </svg>
                          <span>Loading job cards...</span>
                        </div>
                      </td>
                    </tr>
                  ) : filteredJobCards.length === 0 ? (
                    <tr>
                      <td colSpan={19} className="text-center py-8 text-gray-500">
                        No job cards found.
                      </td>
                    </tr>
                  ) : (
                    filteredJobCards.map((job) => (
                      <tr key={job.id} className="hover:bg-gray-50">
                        <td className="px-3 py-3 text-sm font-medium text-gray-900">
                          <div className="break-words" title={job.order_id}>
                            {job.order_id}
                          </div>
                        </td>
                        <td className="px-3 py-3 text-sm text-gray-900">
                          <div className="break-words" title={job.child_order_id || "-"}>
                            {job.child_order_id || "-"}
                          </div>
                        </td>
                        <td className="px-3 py-3 text-sm text-gray-900">
                          <div className="break-words" title={job.website_sku || "-"}>
                            {job.website_sku || "-"}
                          </div>
                        </td>
                        <td className="px-3 py-3 text-sm text-gray-900">
                          {job.category ? (
                            <Badge variant="outline" className="text-xs">
                              <div className="break-words" title={job.category}>
                                {job.category}
                              </div>
                            </Badge>
                          ) : (
                            <span className="text-gray-400">-</span>
                          )}
                        </td>
                        <td className="px-3 py-3 text-sm text-gray-900 align-top">
                          <div className="whitespace-pre-line break-words" title={job.store_name || "-"}>
                            {job.store_name || "-"}
                          </div>
                        </td>
                        <td className="px-3 py-3 text-sm text-gray-900">
                          <div className="break-words" title={job.customization_code || "-"}>
                            {job.customization_code || "-"}
                          </div>
                        </td>
                        <td className="px-3 py-3 text-sm text-gray-900">
                          <div className="break-words" title={job.design_code || "-"}>
                            {job.design_code || "-"}
                          </div>
                        </td>
                        <td className="px-3 py-3 text-sm text-gray-900">{job.sequence_number ?? "-"}</td>
                        <td className="px-3 py-3 text-sm text-gray-900">
                          <div className="flex items-center gap-1">
                            <MapPin className="h-4 w-4 text-gray-400" />
                            <div className="break-words" title={job.location || "-"}>
                              {job.location || "-"}
                            </div>
                          </div>
                        </td>
                        <td className="px-3 py-3 text-sm text-gray-900">
                          <div className="break-words" title={job.website_sku_description || "-"}>
                            {job.website_sku_description || "-"}
                          </div>
                        </td>
                        <td className="px-3 py-3 text-sm text-gray-900">
                          {job.image_url ? (
                            <a 
                              href={job.image_url} 
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
                          <div className="flex items-center gap-1">
                            <Calendar className="h-4 w-4 text-gray-400" />
                            {job.order_date ? new Date(job.order_date).toLocaleDateString('en-IN') : "-"}
                          </div>
                        </td>
                        <td className="px-3 py-3 text-sm text-gray-900">
                          <div className="break-words" title={job.assigned_to || "-"}>
                            {job.assigned_to || "-"}
                          </div>
                        </td>
                        <td className="px-3 py-3 text-sm text-gray-900">
                          <div className="break-words" title={job.assigned_by || "-"}>
                            {job.assigned_by || "-"}
                          </div>
                        </td>
                        <td className="px-3 py-3 text-sm">{getStatusBadge(job.order_status)}</td>
                        <td className="px-3 py-3 text-sm text-gray-900 align-top">
                          <div className="whitespace-pre-line break-words" title={job.reason || "-"}>
                            {job.reason || "-"}
                          </div>
                        </td>
                        <td className="px-3 py-3 text-sm text-gray-900">{job.production_sla ?? "-"}</td>
                        <td className="px-3 py-3 text-sm text-gray-900">{job.quantity}</td>
                        <td className="px-3 py-3 text-sm">
                          <div className="flex gap-1">
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => openView(job)}
                              className="hover:bg-blue-50 h-8 w-8 p-0"
                            >
                              <Eye className="h-3 w-3" />
                            </Button>
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => openEdit(job)}
                              className="hover:bg-green-50 h-8 w-8 p-0"
                            >
                              <Edit className="h-3 w-3" />
                            </Button>
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => handleDelete(job.id)}
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
      </motion.div>

      {/* Edit Dialog */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Edit Job Card</DialogTitle>
            <DialogDescription>
              Update job card details.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="edit-order_id">Order ID</Label>
              <Input
                id="edit-order_id"
                value={formData.order_id}
                onChange={(e) => setFormData(prev => ({ ...prev, order_id: e.target.value }))}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-website_sku">Website SKU</Label>
              <Input
                id="edit-website_sku"
                value={formData.website_sku}
                onChange={(e) => setFormData(prev => ({ ...prev, website_sku: e.target.value }))}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-category">Category</Label>
              <Input
                id="edit-category"
                value={formData.category}
                onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-location">Location</Label>
              <Input
                id="edit-location"
                value={formData.location}
                onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="edit-order_status">Status</Label>
                <Select value={formData.order_status} onValueChange={(value) => setFormData(prev => ({ ...prev, order_status: value }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="new">New</SelectItem>
                    <SelectItem value="in_progress">In Progress</SelectItem>
                    <SelectItem value="done">Done</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-quantity">Quantity</Label>
                <Input
                  id="edit-quantity"
                  type="number"
                  value={formData.quantity}
                  onChange={(e) => setFormData(prev => ({ ...prev, quantity: parseInt(e.target.value, 10) || 0 }))}
                />
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-website_sku_description">Description</Label>
              <Textarea
                id="edit-website_sku_description"
                value={formData.website_sku_description}
                onChange={(e) => setFormData(prev => ({ ...prev, website_sku_description: e.target.value }))}
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleEdit}>Update Job Card</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Enhanced View Dialog - Popup Style */}
      
        {isViewOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={() => setIsViewOpen(false)}
          >
            <motion.div
              variants={modalVariants}
              initial="hidden"
              animate="show"
              exit="exit"
              className="bg-white rounded-xl shadow-2xl max-w-2xl w-full overflow-visible p-0"
              onClick={(e) => e.stopPropagation()}
            >
              {selectedJobCard && (
                <div className="flex flex-col h-full">
                  {/* Header */}
                  <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <h2 className="text-lg font-bold mb-1">Job Card Details</h2>
                        <p className="text-xs text-blue-100 opacity-90">Complete job information and status</p>
                      </div>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => setIsViewOpen(false)}
                        className="text-white hover:bg-white/20"
                      >
                        ✕
                      </Button>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="flex-1 p-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label className="text-xs font-medium text-gray-700">Order ID</Label>
                        <div className="text-sm text-gray-900">{selectedJobCard.order_id || '-'}</div>
                      </div>
                      <div>
                        <Label className="text-xs font-medium text-gray-700">Child Order ID</Label>
                        <div className="text-sm text-gray-900">{selectedJobCard.child_order_id || '-'}</div>
                      </div>
                      <div>
                        <Label className="text-xs font-medium text-gray-700">Website SKU</Label>
                        <div className="text-sm text-gray-900">{selectedJobCard.website_sku || '-'}</div>
                      </div>
                      <div>
                        <Label className="text-xs font-medium text-gray-700">Category</Label>
                        <div className="text-sm text-gray-900">{selectedJobCard.category || '-'}</div>
                      </div>
                      <div>
                        <Label className="text-xs font-medium text-gray-700">Store Name</Label>
                        <div className="text-sm text-gray-900">{selectedJobCard.store_name || '-'}</div>
                      </div>
                      <div>
                        <Label className="text-xs font-medium text-gray-700">Customization Code</Label>
                        <div className="text-sm text-gray-900">{selectedJobCard.customization_code || '-'}</div>
                      </div>
                      <div>
                        <Label className="text-xs font-medium text-gray-700">Design Code</Label>
                        <div className="text-sm text-gray-900">{selectedJobCard.design_code || '-'}</div>
                      </div>
                      <div>
                        <Label className="text-xs font-medium text-gray-700">Sequence Number</Label>
                        <div className="text-sm text-gray-900">{selectedJobCard.sequence_number ?? '-'}</div>
                      </div>
                      <div>
                        <Label className="text-xs font-medium text-gray-700">Location</Label>
                        <div className="text-sm text-gray-900">{selectedJobCard.location || '-'}</div>
                      </div>
                      <div>
                        <Label className="text-xs font-medium text-gray-700">SKU Description</Label>
                        <div className="text-sm text-gray-900">{selectedJobCard.website_sku_description || '-'}</div>
                      </div>
                      <div>
                        <Label className="text-xs font-medium text-gray-700">Image URL</Label>
                        <div className="text-sm text-gray-900">{selectedJobCard.image_url || '-'}</div>
                      </div>
                      <div>
                        <Label className="text-xs font-medium text-gray-700">Order Date</Label>
                        <div className="text-sm text-gray-900">{selectedJobCard.order_date ? new Date(selectedJobCard.order_date).toLocaleDateString('en-IN') : '-'}</div>
                      </div>
                      <div>
                        <Label className="text-xs font-medium text-gray-700">Assigned To</Label>
                        <div className="text-sm text-gray-900">{selectedJobCard.assigned_to || '-'}</div>
                      </div>
                      <div>
                        <Label className="text-xs font-medium text-gray-700">Assigned By</Label>
                        <div className="text-sm text-gray-900">{selectedJobCard.assigned_by || '-'}</div>
                      </div>
                      <div>
                        <Label className="text-xs font-medium text-gray-700">Status</Label>
                        <div className="text-sm text-gray-900">{getStatusBadge(selectedJobCard.order_status)}</div>
                      </div>
                      <div>
                        <Label className="text-xs font-medium text-gray-700">Reason</Label>
                        <div className="text-sm text-gray-900">{selectedJobCard.reason || '-'}</div>
                      </div>
                      <div>
                        <Label className="text-xs font-medium text-gray-700">Production SLA</Label>
                        <div className="text-sm text-gray-900">{selectedJobCard.production_sla ?? '-'}</div>
                      </div>
                      <div>
                        <Label className="text-xs font-medium text-gray-700">Quantity</Label>
                        <div className="text-sm text-gray-900">{selectedJobCard.quantity}</div>
                      </div>
                    </div>
                    {/* Description */}
                    {selectedJobCard.website_sku_description && (
                      <div className="bg-gray-50 p-2 rounded-lg mt-4">
                        <Label className="text-xs font-medium text-gray-700 mb-1 block">Job Description</Label>
                        <div className="bg-white p-1 rounded border">
                          <p className="text-xs text-gray-900 leading-snug whitespace-pre-wrap break-words">{selectedJobCard.website_sku_description}</p>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Footer */}
                  <div className="border-t bg-gray-50 p-2 flex justify-between items-center">
                    <p className="text-sm text-gray-500">
                      Last updated: {selectedJobCard.created_at ? new Date(selectedJobCard.created_at).toLocaleDateString('en-IN') : "N/A"}
                    </p>
                    <div className="flex gap-2">
                      <Button 
                        variant="outline" 
                        onClick={() => {
                          setIsViewOpen(false);
                          openEdit(selectedJobCard);
                        }}
                      >
                        <Edit className="h-4 w-4 mr-2" />
                        Edit
                      </Button>
                      <Button onClick={() => setIsViewOpen(false)}>
                        Close
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}

      <AlertDialog open={!!pendingDeleteId} onOpenChange={cancelDelete}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the job card.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={cancelDelete}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-red-600 hover:bg-red-700">Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </motion.div>
  );
}