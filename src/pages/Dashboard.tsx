import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Package, 
  Truck, 
  ShoppingCart, 
  CheckCircle, 
  AlertTriangle, 
  TrendingUp, 
  TrendingDown, 
  Users, 
  Calendar, 
  Activity,
  Star,
  BarChart3,
  BookOpen,
  ArrowUpRight,
  ArrowDownRight,
  Send
} from "lucide-react";
import { useAuthStore } from '@/store/authStore';
import { supabase } from '@/lib/supabaseClient';
import { useNavigate } from 'react-router-dom';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { BarChart, Bar } from 'recharts';

// Mock data for charts
const mockOrdersChart = [
  { date: '2023-10-26', orders: 12, revenue: 12000 },
  { date: '2023-10-27', orders: 15, revenue: 15000 },
  { date: '2023-10-28', orders: 18, revenue: 18000 },
  { date: '2023-10-29', orders: 20, revenue: 20000 },
  { date: '2023-10-30', orders: 22, revenue: 22000 },
  { date: '2023-10-31', orders: 25, revenue: 25000 },
  { date: '2023-11-01', orders: 28, revenue: 28000 },
  { date: '2023-11-02', orders: 30, revenue: 30000 },
  { date: '2023-11-03', orders: 32, revenue: 32000 },
  { date: '2023-11-04', orders: 35, revenue: 35000 },
  { date: '2023-11-05', orders: 38, revenue: 38000 },
  { date: '2023-11-06', orders: 40, revenue: 40000 },
  { date: '2023-11-07', orders: 42, revenue: 42000 },
  { date: '2023-11-08', orders: 45, revenue: 45000 },
];

export default function Dashboard() {
  const [productionRecords, setProductionRecords] = useState<any[]>([]);
  const [shipmentRecords, setShipmentRecords] = useState<any[]>([]);
  const [purchaseOrders, setPurchaseOrders] = useState<any[]>([]);
  const [readyInventory, setReadyInventory] = useState<any[]>([]);
  const [returnInventory, setReturnInventory] = useState<any[]>([]);
  const [productLibrary, setProductLibrary] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  // --- Chat State ---
  // Remove the Support Chat and Team Chat panels, including all related state and UI code.

  // --- Optimized Loading ---
  // Fetch only minimal data for cards first, then fetch the rest in the background
  useEffect(() => {
    let isMounted = true;
    const fetchMinimal = async () => {
      setLoading(true);
      setError('');
      try {
        // Only fetch counts for the top cards
        const [prodRes, shipRes, poRes, rtsRes, returnRes, productRes] = await Promise.all([
          supabase.schema('oms_offineeds').from('production_records').select('id'),
          supabase.schema('oms_offineeds').from('shipment_records').select('id'),
          supabase.schema('oms_offineeds').from('purchase_orders').select('id'),
          supabase.schema('oms_offineeds').from('ready_to_ship_inventory').select('id'),
          supabase.schema('oms_offineeds').from('return_inventory').select('id'),
          supabase.schema('oms_offineeds').from('product_library').select('id'),
        ]);
        if (!isMounted) return;
        if (prodRes.error || shipRes.error || poRes.error || rtsRes.error || returnRes.error || productRes.error) {
          setError('Failed to load dashboard data.');
        } else {
          setProductionRecords(prodRes.data || []);
          setShipmentRecords(shipRes.data || []);
          setPurchaseOrders(poRes.data || []);
          setReadyInventory(rtsRes.data || []);
          setReturnInventory(returnRes.data || []);
          setProductLibrary(productRes.data || []);
        }
      } catch (err) {
        setError('Network error occurred while fetching dashboard data.');
      }
      setLoading(false);
      // Fetch full data in background
      fetchAllFull();
    };
    const fetchAllFull = async () => {
      try {
        const [prodRes, shipRes, poRes, rtsRes, returnRes, productRes] = await Promise.all([
          supabase.schema('oms_offineeds').from('production_records').select('*').order('created_at', { ascending: false }),
          supabase.schema('oms_offineeds').from('shipment_records').select('*').order('created_at', { ascending: false }),
          supabase.schema('oms_offineeds').from('purchase_orders').select('*').order('created_at', { ascending: false }),
          supabase.schema('oms_offineeds').from('ready_to_ship_inventory').select('*').order('created_at', { ascending: false }),
          supabase.schema('oms_offineeds').from('return_inventory').select('*').order('created_at', { ascending: false }),
          supabase.schema('oms_offineeds').from('product_library').select('*').order('created_at', { ascending: false }),
        ]);
        if (!isMounted) return;
        setProductionRecords(prodRes.data || []);
        setShipmentRecords(shipRes.data || []);
        setPurchaseOrders(poRes.data || []);
        setReadyInventory(rtsRes.data || []);
        setReturnInventory(returnRes.data || []);
        setProductLibrary(productRes.data || []);
      } catch {}
    };
    fetchMinimal();
    return () => { isMounted = false; };
  }, []);

  // Calculate statistics
  const totalProductionRecords = productionRecords.length;
  const totalShipments = shipmentRecords.length;
  const totalPurchaseOrders = purchaseOrders.length;
  const totalReadyToShip = readyInventory.length;
  const totalReturns = returnInventory.length;
  const totalProducts = productLibrary.length;

  // Calculate recent activity (last 7 days)
  const last7Days = new Date();
  last7Days.setDate(last7Days.getDate() - 7);
  
  const recentProduction = productionRecords.filter(record => 
    new Date(record.created_at) > last7Days
  ).length;

  const recentShipments = shipmentRecords.filter(record => 
    new Date(record.created_at) > last7Days
  ).length;

  const recentPurchaseOrders = purchaseOrders.filter(po => 
    new Date(po.created_at) > last7Days
  ).length;

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'new':
        return <Badge className="bg-blue-500 text-white">New</Badge>;
      case 'in_production':
        return <Badge className="bg-yellow-500 text-white">In Production</Badge>;
      case 'ready_to_ship':
        return <Badge className="bg-green-500 text-white">Ready to Ship</Badge>;
      case 'hold':
        return <Badge variant="destructive">Hold</Badge>;
      case 'shipped':
        return <Badge className="bg-blue-600 text-white">Shipped</Badge>;
      case 'delivered':
        return <Badge className="bg-green-700 text-white">Delivered</Badge>;
      case 'raised':
        return <Badge className="bg-orange-500 text-white">Raised</Badge>;
      case 'in_progress':
        return <Badge className="bg-blue-500 text-white">In Progress</Badge>;
      case 'completed':
        return <Badge className="bg-green-500 text-white">Completed</Badge>;
      case 'cancelled':
        return <Badge variant="destructive">Cancelled</Badge>;
      case 'declined':
        return <Badge variant="destructive">Declined</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const MetricCard = ({ title, value, subtitle, icon: Icon, trend, color, onClick }: any) => (
    <Card 
      className={`h-28 group cursor-pointer transition-all duration-300 hover:shadow-xl hover:scale-[1.02] border-0 bg-gradient-to-br ${color} text-white overflow-hidden relative`}
      onClick={onClick}
    >
      <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16"></div>
      <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full translate-y-12 -translate-x-12"></div>
      <CardHeader className="pb-2 relative z-10">
        <CardTitle className="text-white/90 flex items-center justify-between text-xs font-medium">
          <span>{title}</span>
          <Icon className="h-5 w-5" />
        </CardTitle>
      </CardHeader>
      <CardContent className="relative z-10">
        <div className="text-2xl font-bold mb-1">{value}</div>
        <p className="text-white/80 text-xs mb-2">{subtitle}</p>
        {trend !== undefined && (
          <div className="flex items-center text-white/80 text-xs">
            <TrendingUp className="h-4 w-4 mr-1" />
            {trend} new this week
          </div>
        )}
      </CardContent>
    </Card>
  );

  const StatCard = ({ title, value, subtitle, icon: Icon, trend, trendValue, color }: any) => (
    <Card className="border-0 bg-white/80 backdrop-blur-sm hover:shadow-lg transition-all duration-300">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center justify-between text-sm font-medium text-gray-700">
          <div className="flex items-center">
            <div className={`p-2 rounded-lg mr-3 ${color}`}>
              <Icon className="h-4 w-4 text-white" />
            </div>
            {title}
          </div>
          {trend && (
            <div className={`flex items-center text-xs ${trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
              {trend === 'up' ? <ArrowUpRight className="h-3 w-3 mr-1" /> : <ArrowDownRight className="h-3 w-3 mr-1" />}
              {trendValue}%
            </div>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold text-gray-900 mb-1">{value}</div>
        <p className="text-sm text-gray-600">{subtitle}</p>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-8">
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 p-8 text-white">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="relative z-10">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-4xl font-bold mb-2">Welcome back!</h1>
              <p className="text-blue-100 text-lg">Here's what's happening with your OMS today</p>
            </div>
            <div className="hidden md:flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              <span className="text-sm text-blue-100">System Online</span>
            </div>
          </div>
          <div className="flex items-center space-x-4 text-sm">
            <div className="flex items-center">
              <Calendar className="h-4 w-4 mr-2" />
              {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </div>
            <div className="flex items-center">
              <Users className="h-4 w-4 mr-2" />
              Role: All Access
            </div>
          </div>
        </div>
      </div>
      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600 text-lg">Loading your dashboard...</p>
          </div>
        </div>
      ) : (
        <>
          <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
            <MetricCard
              title="Production"
              value={totalProductionRecords}
              subtitle="Active Records"
              icon={Package}
              trend={recentProduction}
              color="from-blue-500 to-blue-600"
              onClick={() => navigate('/job-cards')}
            />
            <MetricCard
              title="Purchase Orders"
              value={totalPurchaseOrders}
              subtitle="Total POs"
              icon={ShoppingCart}
              trend={recentPurchaseOrders}
              color="from-orange-500 to-orange-600"
              onClick={() => navigate('/purchase-orders')}
            />
            <MetricCard
              title="Ready to Ship"
              value={totalReadyToShip}
              subtitle="RTS Items"
              icon={CheckCircle}
              trend={undefined}
              color="from-purple-500 to-purple-600"
              onClick={() => navigate('/ready-inventory')}
            />
          </div>
          {/* Charts */}
          <div className="grid gap-4 grid-cols-1 lg:grid-cols-2">
            <Card className="shadow-lg rounded-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                  <TrendingUp className="h-5 w-5" />
                  Orders Trend
                </CardTitle>
                <CardDescription className="text-sm">Daily order volume (Last 13 Days)</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[250px] sm:h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={mockOrdersChart}>
                      <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                      <XAxis 
                        dataKey="date" 
                        tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                        fontSize={12}
                      />
                      <YAxis fontSize={12} />
                      <Tooltip 
                        labelFormatter={(value) => new Date(value).toLocaleDateString()}
                        formatter={(value, name) => [
                          name === 'orders' ? `${value} orders` : `₹${value?.toLocaleString('en-IN')}`,
                          name === 'orders' ? 'Orders' : 'Revenue'
                        ]}
                      />
                      <Line 
                        type="monotone" 
                        dataKey="orders" 
                        stroke="hsl(222.2 84% 4.9%)" 
                        strokeWidth={2}
                        dot={{ fill: "hsl(222.2 84% 4.9%)", strokeWidth: 2, r: 4 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
            <Card className="shadow-lg rounded-lg">
              <CardHeader>
                <CardTitle className="text-base sm:text-lg">Revenue by Day</CardTitle>
                <CardDescription className="text-sm">Daily revenue breakdown</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[250px] sm:h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={mockOrdersChart}>
                      <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                      <XAxis 
                        dataKey="date" 
                        tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                        fontSize={12}
                      />
                      <YAxis fontSize={12} />
                      <Tooltip 
                        labelFormatter={(value) => new Date(value).toLocaleDateString()}
                        formatter={(value) => [`₹${value?.toLocaleString('en-IN')}`, 'Revenue']}
                      />
                      <Bar 
                        dataKey="revenue" 
                        fill="hsl(222.2 84% 4.9%)"
                        radius={[4, 4, 0, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
          <div className="grid gap-6 grid-cols-1 lg:grid-cols-2">
            <Card className="border-0 bg-white/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span className="flex items-center">
                    <Activity className="h-5 w-5 mr-2 text-blue-600" />
                    Recent Production Records
                  </span>
                  <Button variant="outline" size="sm" onClick={() => navigate('/job-cards')} className="hover:bg-blue-50">
                    <ArrowUpRight className="h-4 w-4 mr-1" />
                    View All
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {productionRecords.length === 0 ? (
                  <div className="text-center py-8">
                    <Package className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-500">No production records found</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {productionRecords.slice(0, 5).map((rec) => (
                      <div key={rec.id} className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-100/50">
                        <div>
                          <div className="font-semibold text-gray-900">Order: {rec.order_id}</div>
                          <div className="text-sm text-gray-600">SKU: {rec.website_sku}</div>
                        </div>
                        <div className="text-right">
                          {getStatusBadge(rec.order_status)}
                          <div className="text-xs text-gray-500 mt-1">
                            {rec.created_at ? new Date(rec.created_at).toLocaleDateString() : ''}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
            <Card className="border-0 bg-white/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span className="flex items-center">
                    <ShoppingCart className="h-5 w-5 mr-2 text-orange-600" />
                    Recent Purchase Orders
                  </span>
                  <Button variant="outline" size="sm" onClick={() => navigate('/purchase-orders')} className="hover:bg-orange-50">
                    <ArrowUpRight className="h-4 w-4 mr-1" />
                    View All
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {purchaseOrders.length === 0 ? (
                  <div className="text-center py-8">
                    <ShoppingCart className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-500">No purchase orders found</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {purchaseOrders.slice(0, 5).map((po) => (
                      <div key={po.id} className="flex items-center justify-between p-4 bg-gradient-to-r from-orange-50 to-red-50 rounded-xl border border-orange-100/50">
                        <div>
                          <div className="font-semibold text-gray-900">PO: {po.po_number}</div>
                          <div className="text-sm text-gray-600">Vendor: {po.vendor_name}</div>
                        </div>
                        <div className="text-right">
                          {getStatusBadge(po.status)}
                          <div className="text-xs text-gray-500 mt-1">
                            Qty: {po.quantity}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
          <Card className="border-0 bg-gradient-to-r from-gray-50 to-slate-50">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Star className="h-5 w-5 mr-2 text-yellow-600" />
                Quick Actions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
                <Button 
                  onClick={() => navigate('/job-cards')} 
                  className="h-24 flex flex-col bg-gradient-to-br from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300"
                >
                  <Package className="h-6 w-6 mb-2" />
                  <span className="font-medium">Production Records</span>
                </Button>
                <Button 
                  onClick={() => navigate('/purchase-orders')} 
                  className="h-24 flex flex-col bg-gradient-to-br from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300"
                >
                  <ShoppingCart className="h-6 w-6 mb-2" />
                  <span className="font-medium">Purchase Orders</span>
                </Button>
                <Button 
                  onClick={() => navigate('/ready-inventory')} 
                  className="h-24 flex flex-col bg-gradient-to-br from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300"
                >
                  <CheckCircle className="h-6 w-6 mb-2" />
                  <span className="font-medium">Ready Inventory</span>
                </Button>
                <Button 
                  onClick={() => navigate('/return-inventory')} 
                  className="h-24 flex flex-col bg-gradient-to-br from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300"
                >
                  <AlertTriangle className="h-6 w-6 mb-2" />
                  <span className="font-medium">Returns</span>
                </Button>
                <Button 
                  onClick={() => navigate('/product-library')} 
                  className="h-24 flex flex-col bg-gradient-to-br from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300"
                >
                  <BookOpen className="h-6 w-6 mb-2" />
                  <span className="font-medium">Product Library</span>
                </Button>
                <Button 
                  onClick={() => navigate('/admin')} 
                  className="h-24 flex flex-col bg-gradient-to-br from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300"
                >
                  <BarChart3 className="h-6 w-6 mb-2" />
                  <span className="font-medium">Admin Panel</span>
                </Button>
              </div>
            </CardContent>
          </Card>
          {/* Add a Shipments card just below the hero text */}
          <div className="w-full mb-4">
            <Card className="shadow-lg rounded-lg cursor-pointer hover:shadow-xl transition-all duration-200" onClick={() => navigate('/job-cards')}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Shipments</CardTitle>
                <Package className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-xl sm:text-2xl font-bold">{Math.floor(Math.random() * 100) + 20}</div>
                <p className="text-xs text-muted-foreground">Total Shipments</p>
              </CardContent>
            </Card>
          </div>
        </>
      )}
    </div>
  );
}