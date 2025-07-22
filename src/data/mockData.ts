// Mock data for the OMS dashboard - Indian Rupees

export const mockOrdersChart = [
  { date: '2024-01-01', orders: 45, revenue: 850000 },
  { date: '2024-01-02', orders: 52, revenue: 972000 },
  { date: '2024-01-03', orders: 38, revenue: 761000 },
  { date: '2024-01-04', orders: 61, revenue: 1142000 },
  { date: '2024-01-05', orders: 55, revenue: 1045000 },
  { date: '2024-01-06', orders: 67, revenue: 1285000 },
  { date: '2024-01-07', orders: 71, revenue: 1325000 },
  { date: '2024-01-08', orders: 48, revenue: 924000 },
  { date: '2024-01-09', orders: 59, revenue: 1101000 },
  { date: '2024-01-10', orders: 63, revenue: 1210000 },
  { date: '2024-01-11', orders: 56, revenue: 1080000 },
  { date: '2024-01-12', orders: 74, revenue: 1374000 },
  { date: '2024-01-13', orders: 69, revenue: 1270000 },
];

export const mockKPIs = {
  totalInventoryByStore: 1250,
  totalRevenue: 6085000,
  holdRevenue: 836000,
  pendingOrders: 23,
  completedOrders: 156,
};

export const mockPendingOrders = [
  { id: 'ORD-001', customer: 'Acme Corp', items: 12, value: 159500, sla: 2, status: 'pending' },
  { id: 'ORD-002', customer: 'TechStart Inc', items: 8, value: 128400, sla: 1, status: 'delayed' },
  { id: 'ORD-003', customer: 'Global Solutions', items: 15, value: 220300, sla: 4, status: 'pending' },
  { id: 'ORD-004', customer: 'Office Plus', items: 6, value: 76100, sla: 3, status: 'pending' },
  { id: 'ORD-005', customer: 'Business Hub', items: 21, value: 306000, sla: 1, status: 'delayed' },
];

export const mockPurchaseOrders = [
  { id: 'PO-001', supplier: 'Office Supplies Co', items: 50, value: 578000, sla: 5, status: 'pending' },
  { id: 'PO-002', supplier: 'Tech Equipment Ltd', items: 25, value: 836400, sla: 2, status: 'delayed' },
  { id: 'PO-003', supplier: 'Furniture Direct', items: 12, value: 455500, sla: 7, status: 'approved' },
  { id: 'PO-004', supplier: 'Stationery World', items: 75, value: 231200, sla: 4, status: 'pending' },
];

export const mockJobCards = [
  { id: 'JC-001', title: 'Assembly Workstation Setup', assignee: 'John Smith', priority: 'High', status: 'Pending', dueDate: '2024-01-15' },
  { id: 'JC-002', title: 'Inventory Count - Warehouse A', assignee: 'Sarah Johnson', priority: 'Medium', status: 'In Progress', dueDate: '2024-01-16' },
  { id: 'JC-003', title: 'Equipment Maintenance', assignee: 'Mike Davis', priority: 'Low', status: 'Done', dueDate: '2024-01-14' },
  { id: 'JC-004', title: 'Quality Check - Batch 204', assignee: 'Emily Wilson', priority: 'High', status: 'Pending', dueDate: '2024-01-17' },
  { id: 'JC-005', title: 'Packaging Process Review', assignee: 'David Brown', priority: 'Medium', status: 'In Progress', dueDate: '2024-01-18' },
];

export const mockReturnInventory = [
  { id: 'RET-001', item: 'Office Chair - Ergonomic', reason: 'Defective', quantity: 5, returnDate: '2024-01-10', status: 'Pending' },
  { id: 'RET-002', item: 'Laptop Stand - Adjustable', reason: 'Wrong Size', quantity: 3, returnDate: '2024-01-11', status: 'Processing' },
  { id: 'RET-003', item: 'Desk Lamp - LED', reason: 'Customer Change', quantity: 8, returnDate: '2024-01-12', status: 'Completed' },
  { id: 'RET-004', item: 'Monitor - 24 inch', reason: 'Damaged in Transit', quantity: 2, returnDate: '2024-01-13', status: 'Pending' },
];

export const mockReadyInventory = [
  { id: 'INV-001', item: 'Office Desk - Executive', quantity: 15, location: 'Warehouse A', readyDate: '2024-01-14', status: 'Ready' },
  { id: 'INV-002', item: 'Filing Cabinet - 4 Drawer', quantity: 22, location: 'Warehouse B', readyDate: '2024-01-15', status: 'Ready' },
  { id: 'INV-003', item: 'Conference Table - 8 Seater', quantity: 8, location: 'Warehouse A', readyDate: '2024-01-16', status: 'Ready' },
  { id: 'INV-004', item: 'Printer - Multifunction', quantity: 12, location: 'Warehouse C', readyDate: '2024-01-17', status: 'Ready' },
];

export const mockUsers = [
  { id: 1, name: 'John Smith', email: 'john@offineedsoms.com', role: 'admin', status: 'active', lastLogin: '2024-01-14' },
  { id: 2, name: 'Sarah Johnson', email: 'sarah@offineedsoms.com', role: 'production', status: 'active', lastLogin: '2024-01-14' },
  { id: 3, name: 'Mike Davis', email: 'mike@offineedsoms.com', role: 'logistics', status: 'active', lastLogin: '2024-01-13' },
  { id: 4, name: 'Emily Wilson', email: 'emily@offineedsoms.com', role: 'procurement', status: 'inactive', lastLogin: '2024-01-10' },
  { id: 5, name: 'David Brown', email: 'david@offineedsoms.com', role: 'production', status: 'active', lastLogin: '2024-01-14' },
];