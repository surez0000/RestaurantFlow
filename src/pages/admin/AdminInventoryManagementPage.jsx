import React, { useState, useEffect, useContext } from 'react';
import { Table, Button, Modal, Form, Input, InputNumber, Select, Tag, Space, Typography, Card, Row, Col, message, Popconfirm, Spin, Alert, Progress, Tabs, DatePicker, Statistic, Tooltip } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, WarningOutlined, ShoppingCartOutlined, BarChartOutlined, ReloadOutlined, ExportOutlined, ImportOutlined, BellOutlined, CheckCircleOutlined, CloseCircleOutlined } from '@ant-design/icons';
import { ThemeContext } from '../../contexts/ThemeContext';
import dayjs from 'dayjs';

const { Title, Text } = Typography;
const { Option } = Select;
const { TabPane } = Tabs;
const { RangePicker } = DatePicker;

// Mock data for inventory items
const mockInventoryData = [
  { id: 'inv001', name: 'Tomatoes', category: 'Vegetables', currentStock: 15, unit: 'kg', minStock: 20, maxStock: 100, costPerUnit: 2.50, supplier: 'Fresh Farm Co.', lastRestocked: '2024-03-15T10:00:00Z', expiryDate: '2024-03-25T00:00:00Z', status: 'Low Stock', linkedMenuItems: ['Margherita Pizza', 'Pasta Marinara'] },
  { id: 'inv002', name: 'Chicken Breast', category: 'Meat', currentStock: 25, unit: 'kg', minStock: 10, maxStock: 50, costPerUnit: 8.50, supplier: 'Premium Meats Ltd.', lastRestocked: '2024-03-14T14:30:00Z', expiryDate: '2024-03-20T00:00:00Z', status: 'In Stock', linkedMenuItems: ['Chicken Wings', 'Grilled Chicken'] },
  { id: 'inv003', name: 'Mozzarella Cheese', category: 'Dairy', currentStock: 5, unit: 'kg', minStock: 8, maxStock: 30, costPerUnit: 12.00, supplier: 'Dairy Fresh Inc.', lastRestocked: '2024-03-12T09:15:00Z', expiryDate: '2024-03-22T00:00:00Z', status: 'Critical', linkedMenuItems: ['Margherita Pizza', 'Cheese Burger'] },
  { id: 'inv004', name: 'Olive Oil', category: 'Oils & Condiments', currentStock: 8, unit: 'liters', minStock: 5, maxStock: 20, costPerUnit: 15.00, supplier: 'Mediterranean Oils', lastRestocked: '2024-03-10T16:45:00Z', expiryDate: '2024-12-31T00:00:00Z', status: 'In Stock', linkedMenuItems: ['Salads', 'Pasta dishes'] },
  { id: 'inv005', name: 'Flour', category: 'Baking', currentStock: 2, unit: 'kg', minStock: 10, maxStock: 50, costPerUnit: 1.20, supplier: 'Baker\'s Choice', lastRestocked: '2024-03-08T11:20:00Z', expiryDate: '2024-06-15T00:00:00Z', status: 'Critical', linkedMenuItems: ['Pizza Base', 'Bread', 'Desserts'] },
  { id: 'inv006', name: 'Coca-Cola Syrup', category: 'Beverages', currentStock: 12, unit: 'liters', minStock: 8, maxStock: 25, costPerUnit: 25.00, supplier: 'Beverage Distributors', lastRestocked: '2024-03-16T13:00:00Z', expiryDate: '2024-08-30T00:00:00Z', status: 'In Stock', linkedMenuItems: ['Coca-Cola Classic'] },
];

// Mock suppliers data
const mockSuppliersData = [
  { id: 'sup001', name: 'Fresh Farm Co.', contact: '+1-555-0101', email: 'orders@freshfarm.com', category: 'Vegetables & Fruits', rating: 4.5 },
  { id: 'sup002', name: 'Premium Meats Ltd.', contact: '+1-555-0102', email: 'sales@premiummeats.com', category: 'Meat & Poultry', rating: 4.8 },
  { id: 'sup003', name: 'Dairy Fresh Inc.', contact: '+1-555-0103', email: 'orders@dairyfresh.com', category: 'Dairy Products', rating: 4.3 },
  { id: 'sup004', name: 'Mediterranean Oils', contact: '+1-555-0104', email: 'info@medoils.com', category: 'Oils & Condiments', rating: 4.6 },
  { id: 'sup005', name: 'Baker\'s Choice', contact: '+1-555-0105', email: 'supply@bakerschoice.com', category: 'Baking Supplies', rating: 4.4 },
];

// Mock stock movements data
const mockStockMovements = [
  { id: 'mov001', itemId: 'inv001', itemName: 'Tomatoes', type: 'IN', quantity: 20, unit: 'kg', reason: 'Purchase Order #PO001', date: '2024-03-15T10:00:00Z', user: 'John Manager' },
  { id: 'mov002', itemId: 'inv001', itemName: 'Tomatoes', type: 'OUT', quantity: 5, unit: 'kg', reason: 'Used for Margherita Pizza', date: '2024-03-16T14:30:00Z', user: 'Kitchen Staff' },
  { id: 'mov003', itemId: 'inv003', itemName: 'Mozzarella Cheese', type: 'OUT', quantity: 3, unit: 'kg', reason: 'Used for Pizza orders', date: '2024-03-16T18:45:00Z', user: 'Kitchen Staff' },
  { id: 'mov004', itemId: 'inv005', itemName: 'Flour', type: 'OUT', quantity: 8, unit: 'kg', reason: 'Pizza base preparation', date: '2024-03-16T12:15:00Z', user: 'Kitchen Staff' },
];

const categories = ['Vegetables', 'Meat', 'Dairy', 'Oils & Condiments', 'Baking', 'Beverages', 'Spices', 'Frozen Items'];
const units = ['kg', 'liters', 'pieces', 'boxes', 'bottles', 'cans', 'packets'];

const AdminInventoryManagementPage = () => {
  const [inventory, setInventory] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [stockMovements, setStockMovements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isSupplierModalVisible, setIsSupplierModalVisible] = useState(false);
  const [isStockAdjustModalVisible, setIsStockAdjustModalVisible] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [editingSupplier, setEditingSupplier] = useState(null);
  const [selectedItem, setSelectedItem] = useState(null);
  const [form] = Form.useForm();
  const [supplierForm] = Form.useForm();
  const [stockAdjustForm] = Form.useForm();
  const { accentColor } = useContext(ThemeContext);

  // Filters
  const [categoryFilter, setCategoryFilter] = useState(null);
  const [statusFilter, setStatusFilter] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = () => {
    setLoading(true);
    setTimeout(() => {
      setInventory(mockInventoryData);
      setSuppliers(mockSuppliersData);
      setStockMovements(mockStockMovements);
      setLoading(false);
    }, 800);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'In Stock': return 'success';
      case 'Low Stock': return 'warning';
      case 'Critical': return 'error';
      case 'Out of Stock': return 'default';
      default: return 'default';
    }
  };

  const getStockStatus = (currentStock, minStock) => {
    if (currentStock === 0) return 'Out of Stock';
    if (currentStock <= minStock * 0.5) return 'Critical';
    if (currentStock <= minStock) return 'Low Stock';
    return 'In Stock';
  };

  const getStockPercentage = (currentStock, maxStock) => {
    return Math.min((currentStock / maxStock) * 100, 100);
  };

  const filteredInventory = inventory.filter(item => {
    const matchesCategory = categoryFilter ? item.category === categoryFilter : true;
    const matchesStatus = statusFilter ? item.status === statusFilter : true;
    const matchesSearch = searchTerm ? 
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.supplier.toLowerCase().includes(searchTerm.toLowerCase()) : true;
    return matchesCategory && matchesStatus && matchesSearch;
  });

  const lowStockItems = inventory.filter(item => item.status === 'Low Stock' || item.status === 'Critical');
  const totalInventoryValue = inventory.reduce((sum, item) => sum + (item.currentStock * item.costPerUnit), 0);

  const handleOpenModal = (item = null) => {
    setEditingItem(item);
    if (item) {
      form.setFieldsValue({
        ...item,
        expiryDate: item.expiryDate ? dayjs(item.expiryDate) : null,
      });
    } else {
      form.resetFields();
    }
    setIsModalVisible(true);
  };

  const handleOpenSupplierModal = (supplier = null) => {
    setEditingSupplier(supplier);
    if (supplier) {
      supplierForm.setFieldsValue(supplier);
    } else {
      supplierForm.resetFields();
    }
    setIsSupplierModalVisible(true);
  };

  const handleOpenStockAdjustModal = (item) => {
    setSelectedItem(item);
    stockAdjustForm.setFieldsValue({
      currentStock: item.currentStock,
      adjustmentType: 'IN',
      quantity: 0,
      reason: '',
    });
    setIsStockAdjustModalVisible(true);
  };

  const handleSubmitInventoryItem = (values) => {
    setLoading(true);
    message.loading({ content: editingItem ? 'Updating item...' : 'Adding item...', key: 'inventorySubmit' });
    
    setTimeout(() => {
      const itemData = {
        ...values,
        expiryDate: values.expiryDate ? values.expiryDate.toISOString() : null,
        status: getStockStatus(values.currentStock, values.minStock),
        lastRestocked: new Date().toISOString(),
      };

      if (editingItem) {
        setInventory(prev => prev.map(item => 
          item.id === editingItem.id ? { ...item, ...itemData } : item
        ));
        message.success({ content: `${values.name} updated successfully!`, key: 'inventorySubmit' });
      } else {
        const newItem = {
          id: `inv${Date.now()}`,
          ...itemData,
          linkedMenuItems: [],
        };
        setInventory(prev => [newItem, ...prev]);
        message.success({ content: `${values.name} added successfully!`, key: 'inventorySubmit' });
      }
      
      setLoading(false);
      setIsModalVisible(false);
      setEditingItem(null);
    }, 1000);
  };

  const handleSubmitSupplier = (values) => {
    setLoading(true);
    message.loading({ content: editingSupplier ? 'Updating supplier...' : 'Adding supplier...', key: 'supplierSubmit' });
    
    setTimeout(() => {
      if (editingSupplier) {
        setSuppliers(prev => prev.map(supplier => 
          supplier.id === editingSupplier.id ? { ...supplier, ...values } : supplier
        ));
        message.success({ content: `${values.name} updated successfully!`, key: 'supplierSubmit' });
      } else {
        const newSupplier = {
          id: `sup${Date.now()}`,
          ...values,
          rating: 0,
        };
        setSuppliers(prev => [newSupplier, ...prev]);
        message.success({ content: `${values.name} added successfully!`, key: 'supplierSubmit' });
      }
      
      setLoading(false);
      setIsSupplierModalVisible(false);
      setEditingSupplier(null);
    }, 1000);
  };

  const handleStockAdjustment = (values) => {
    setLoading(true);
    message.loading({ content: 'Adjusting stock...', key: 'stockAdjust' });
    
    setTimeout(() => {
      const adjustment = values.adjustmentType === 'IN' ? values.quantity : -values.quantity;
      const newStock = selectedItem.currentStock + adjustment;
      
      // Update inventory
      setInventory(prev => prev.map(item => 
        item.id === selectedItem.id ? { 
          ...item, 
          currentStock: Math.max(0, newStock),
          status: getStockStatus(Math.max(0, newStock), item.minStock),
          lastRestocked: values.adjustmentType === 'IN' ? new Date().toISOString() : item.lastRestocked,
        } : item
      ));

      // Add stock movement record
      const movement = {
        id: `mov${Date.now()}`,
        itemId: selectedItem.id,
        itemName: selectedItem.name,
        type: values.adjustmentType,
        quantity: values.quantity,
        unit: selectedItem.unit,
        reason: values.reason,
        date: new Date().toISOString(),
        user: 'Current User', // In real app, get from auth context
      };
      setStockMovements(prev => [movement, ...prev]);
      
      message.success({ content: 'Stock adjusted successfully!', key: 'stockAdjust' });
      setLoading(false);
      setIsStockAdjustModalVisible(false);
      setSelectedItem(null);
    }, 1000);
  };

  const handleDeleteItem = (itemId) => {
    setLoading(true);
    setTimeout(() => {
      setInventory(prev => prev.filter(item => item.id !== itemId));
      message.success('Item deleted successfully!');
      setLoading(false);
    }, 500);
  };

  const handleDeleteSupplier = (supplierId) => {
    setLoading(true);
    setTimeout(() => {
      setSuppliers(prev => prev.filter(supplier => supplier.id !== supplierId));
      message.success('Supplier deleted successfully!');
      setLoading(false);
    }, 500);
  };

  const inventoryColumns = [
    { 
      title: 'Item Name', 
      dataIndex: 'name', 
      key: 'name', 
      sorter: (a, b) => a.name.localeCompare(b.name),
      render: (text, record) => (
        <div>
          <Text strong>{text}</Text>
          <br />
          <Text type="secondary" style={{ fontSize: '0.85em' }}>
            {record.linkedMenuItems.length > 0 ? 
              `Used in: ${record.linkedMenuItems.slice(0, 2).join(', ')}${record.linkedMenuItems.length > 2 ? '...' : ''}` : 
              'Not linked to menu items'
            }
          </Text>
        </div>
      )
    },
    { 
      title: 'Category', 
      dataIndex: 'category', 
      key: 'category', 
      filters: categories.map(cat => ({ text: cat, value: cat })),
      onFilter: (value, record) => record.category === value,
    },
    { 
      title: 'Current Stock', 
      dataIndex: 'currentStock', 
      key: 'currentStock', 
      sorter: (a, b) => a.currentStock - b.currentStock,
      render: (stock, record) => (
        <div>
          <Text strong style={{ color: record.status === 'Critical' ? '#ff4d4f' : record.status === 'Low Stock' ? '#faad14' : '#52c41a' }}>
            {stock} {record.unit}
          </Text>
          <br />
          <Progress 
            percent={getStockPercentage(stock, record.maxStock)} 
            size="small" 
            status={record.status === 'Critical' ? 'exception' : record.status === 'Low Stock' ? 'active' : 'success'}
            showInfo={false}
          />
        </div>
      )
    },
    { 
      title: 'Min/Max Stock', 
      key: 'stockLimits', 
      render: (_, record) => (
        <div>
          <Text>Min: {record.minStock} {record.unit}</Text>
          <br />
          <Text>Max: {record.maxStock} {record.unit}</Text>
        </div>
      )
    },
    { 
      title: 'Status', 
      dataIndex: 'status', 
      key: 'status', 
      filters: [
        { text: 'In Stock', value: 'In Stock' },
        { text: 'Low Stock', value: 'Low Stock' },
        { text: 'Critical', value: 'Critical' },
        { text: 'Out of Stock', value: 'Out of Stock' },
      ],
      onFilter: (value, record) => record.status === value,
      render: (status) => <Tag color={getStatusColor(status)}>{status}</Tag>
    },
    { 
      title: 'Cost per Unit', 
      dataIndex: 'costPerUnit', 
      key: 'costPerUnit', 
      sorter: (a, b) => a.costPerUnit - b.costPerUnit,
      render: (cost) => `€${cost.toFixed(2)}`
    },
    { 
      title: 'Total Value', 
      key: 'totalValue', 
      sorter: (a, b) => (a.currentStock * a.costPerUnit) - (b.currentStock * b.costPerUnit),
      render: (_, record) => `€${(record.currentStock * record.costPerUnit).toFixed(2)}`
    },
    { 
      title: 'Supplier', 
      dataIndex: 'supplier', 
      key: 'supplier',
    },
    { 
      title: 'Expiry Date', 
      dataIndex: 'expiryDate', 
      key: 'expiryDate', 
      sorter: (a, b) => dayjs(a.expiryDate).unix() - dayjs(b.expiryDate).unix(),
      render: (date) => {
        if (!date) return 'N/A';
        const expiryDate = dayjs(date);
        const daysUntilExpiry = expiryDate.diff(dayjs(), 'days');
        const isExpiringSoon = daysUntilExpiry <= 7;
        return (
          <div>
            <Text style={{ color: isExpiringSoon ? '#ff4d4f' : 'inherit' }}>
              {expiryDate.format('DD MMM YYYY')}
            </Text>
            {isExpiringSoon && (
              <>
                <br />
                <Text type="danger" style={{ fontSize: '0.85em' }}>
                  {daysUntilExpiry <= 0 ? 'Expired' : `${daysUntilExpiry} days left`}
                </Text>
              </>
            )}
          </div>
        );
      }
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 200,
      fixed: 'right',
      render: (_, record) => (
        <Space size="small">
          <Tooltip title="Adjust Stock">
            <Button 
              type="primary" 
              ghost 
              icon={<BarChartOutlined />} 
              size="small"
              onClick={() => handleOpenStockAdjustModal(record)}
            >
              Adjust
            </Button>
          </Tooltip>
          <Button 
            type="primary" 
            ghost 
            icon={<EditOutlined />} 
            size="small"
            onClick={() => handleOpenModal(record)}
          >
            Edit
          </Button>
          <Popconfirm
            title="Delete this item?"
            onConfirm={() => handleDeleteItem(record.id)}
            okText="Yes"
            cancelText="No"
          >
            <Button danger icon={<DeleteOutlined />} size="small">Delete</Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  const supplierColumns = [
    { title: 'Name', dataIndex: 'name', key: 'name', sorter: (a, b) => a.name.localeCompare(b.name) },
    { title: 'Category', dataIndex: 'category', key: 'category' },
    { title: 'Contact', dataIndex: 'contact', key: 'contact' },
    { title: 'Email', dataIndex: 'email', key: 'email' },
    { 
      title: 'Rating', 
      dataIndex: 'rating', 
      key: 'rating', 
      sorter: (a, b) => a.rating - b.rating,
      render: (rating) => `${rating}/5.0`
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Space size="small">
          <Button 
            type="primary" 
            ghost 
            icon={<EditOutlined />} 
            size="small"
            onClick={() => handleOpenSupplierModal(record)}
          >
            Edit
          </Button>
          <Popconfirm
            title="Delete this supplier?"
            onConfirm={() => handleDeleteSupplier(record.id)}
            okText="Yes"
            cancelText="No"
          >
            <Button danger icon={<DeleteOutlined />} size="small">Delete</Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  const movementColumns = [
    { 
      title: 'Date', 
      dataIndex: 'date', 
      key: 'date', 
      sorter: (a, b) => dayjs(a.date).unix() - dayjs(b.date).unix(),
      render: (date) => dayjs(date).format('DD MMM YYYY, HH:mm')
    },
    { title: 'Item', dataIndex: 'itemName', key: 'itemName' },
    { 
      title: 'Type', 
      dataIndex: 'type', 
      key: 'type', 
      render: (type) => (
        <Tag color={type === 'IN' ? 'success' : 'error'} icon={type === 'IN' ? <CheckCircleOutlined /> : <CloseCircleOutlined />}>
          {type === 'IN' ? 'Stock In' : 'Stock Out'}
        </Tag>
      )
    },
    { 
      title: 'Quantity', 
      key: 'quantity', 
      render: (_, record) => `${record.quantity} ${record.unit}`
    },
    { title: 'Reason', dataIndex: 'reason', key: 'reason' },
    { title: 'User', dataIndex: 'user', key: 'user' },
  ];

  if (loading && inventory.length === 0) {
    return <div style={{ textAlign: 'center', padding: '50px' }}><Spin size="large" tip="Loading inventory..." /></div>;
  }

  return (
    <div style={{ padding: '20px' }}>
      <Row justify="space-between" align="middle" style={{ marginBottom: 24 }}>
        <Col>
          <Title level={2} style={{ margin: 0 }}>
            <ShoppingCartOutlined style={{ marginRight: 8, color: accentColor }} />
            Inventory Management
          </Title>
        </Col>
        <Col>
          <Space>
            <Button icon={<ReloadOutlined />} onClick={fetchData} loading={loading}>
              Refresh
            </Button>
            <Button icon={<ExportOutlined />}>
              Export
            </Button>
            <Button icon={<ImportOutlined />}>
              Import
            </Button>
          </Space>
        </Col>
      </Row>

      {/* Statistics Cards */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Total Items"
              value={inventory.length}
              prefix={<ShoppingCartOutlined />}
              valueStyle={{ color: accentColor }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Low Stock Alerts"
              value={lowStockItems.length}
              prefix={<WarningOutlined />}
              valueStyle={{ color: lowStockItems.length > 0 ? '#ff4d4f' : '#52c41a' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Total Inventory Value"
              value={totalInventoryValue}
              precision={2}
              prefix="€"
              valueStyle={{ color: '#3f8600' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Suppliers"
              value={suppliers.length}
              valueStyle={{ color: accentColor }}
            />
          </Card>
        </Col>
      </Row>

      {/* Low Stock Alert */}
      {lowStockItems.length > 0 && (
        <Alert
          message={`${lowStockItems.length} items need attention`}
          description={
            <div>
              <Text>Critical/Low stock items: </Text>
              {lowStockItems.slice(0, 3).map(item => (
                <Tag key={item.id} color={getStatusColor(item.status)} style={{ margin: '2px' }}>
                  {item.name} ({item.currentStock} {item.unit})
                </Tag>
              ))}
              {lowStockItems.length > 3 && <Text>and {lowStockItems.length - 3} more...</Text>}
            </div>
          }
          type="warning"
          showIcon
          icon={<BellOutlined />}
          style={{ marginBottom: 24 }}
        />
      )}

      <Tabs defaultActiveKey="inventory">
        <TabPane tab="Inventory Items" key="inventory">
          <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
            <Col xs={24} md={8} lg={6}>
              <Input.Search
                placeholder="Search items or suppliers..."
                allowClear
                onSearch={setSearchTerm}
                onChange={e => setSearchTerm(e.target.value)}
              />
            </Col>
            <Col xs={12} md={6} lg={4}>
              <Select
                placeholder="Filter by Category"
                value={categoryFilter}
                onChange={setCategoryFilter}
                allowClear
                style={{ width: '100%' }}
              >
                {categories.map(cat => <Option key={cat} value={cat}>{cat}</Option>)}
              </Select>
            </Col>
            <Col xs={12} md={6} lg={4}>
              <Select
                placeholder="Filter by Status"
                value={statusFilter}
                onChange={setStatusFilter}
                allowClear
                style={{ width: '100%' }}
              >
                <Option value="In Stock">In Stock</Option>
                <Option value="Low Stock">Low Stock</Option>
                <Option value="Critical">Critical</Option>
                <Option value="Out of Stock">Out of Stock</Option>
              </Select>
            </Col>
            <Col xs={24} md={4} lg={4} style={{ textAlign: 'right' }}>
              <Button type="primary" icon={<PlusOutlined />} onClick={() => handleOpenModal()}>
                Add Item
              </Button>
            </Col>
          </Row>

          <Table
            columns={inventoryColumns}
            dataSource={filteredInventory}
            rowKey="id"
            loading={loading}
            pagination={{ pageSize: 10, showSizeChanger: true }}
            scroll={{ x: 1400 }}
            size="middle"
          />
        </TabPane>

        <TabPane tab="Suppliers" key="suppliers">
          <Row justify="space-between" align="middle" style={{ marginBottom: 24 }}>
            <Col>
              <Title level={4}>Supplier Management</Title>
            </Col>
            <Col>
              <Button type="primary" icon={<PlusOutlined />} onClick={() => handleOpenSupplierModal()}>
                Add Supplier
              </Button>
            </Col>
          </Row>

          <Table
            columns={supplierColumns}
            dataSource={suppliers}
            rowKey="id"
            loading={loading}
            pagination={{ pageSize: 10 }}
            size="middle"
          />
        </TabPane>

        <TabPane tab="Stock Movements" key="movements">
          <Row justify="space-between" align="middle" style={{ marginBottom: 24 }}>
            <Col>
              <Title level={4}>Stock Movement History</Title>
            </Col>
            <Col>
              <RangePicker />
            </Col>
          </Row>

          <Table
            columns={movementColumns}
            dataSource={stockMovements}
            rowKey="id"
            loading={loading}
            pagination={{ pageSize: 15 }}
            size="middle"
          />
        </TabPane>
      </Tabs>

      {/* Add/Edit Inventory Item Modal */}
      <Modal
        title={editingItem ? `Edit: ${editingItem.name}` : 'Add New Inventory Item'}
        open={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        footer={null}
        width={700}
        destroyOnClose
      >
        <Form form={form} layout="vertical" onFinish={handleSubmitInventoryItem}>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="name" label="Item Name" rules={[{ required: true }]}>
                <Input />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="category" label="Category" rules={[{ required: true }]}>
                <Select>
                  {categories.map(cat => <Option key={cat} value={cat}>{cat}</Option>)}
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={8}>
              <Form.Item name="currentStock" label="Current Stock" rules={[{ required: true, type: 'number', min: 0 }]}>
                <InputNumber style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="minStock" label="Minimum Stock" rules={[{ required: true, type: 'number', min: 0 }]}>
                <InputNumber style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="maxStock" label="Maximum Stock" rules={[{ required: true, type: 'number', min: 0 }]}>
                <InputNumber style={{ width: '100%' }} />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={8}>
              <Form.Item name="unit" label="Unit" rules={[{ required: true }]}>
                <Select>
                  {units.map(unit => <Option key={unit} value={unit}>{unit}</Option>)}
                </Select>
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="costPerUnit" label="Cost per Unit (€)" rules={[{ required: true, type: 'number', min: 0 }]}>
                <InputNumber style={{ width: '100%' }} precision={2} />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="expiryDate" label="Expiry Date">
                <DatePicker style={{ width: '100%' }} />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item name="supplier" label="Supplier" rules={[{ required: true }]}>
            <Select>
              {suppliers.map(supplier => <Option key={supplier.id} value={supplier.name}>{supplier.name}</Option>)}
            </Select>
          </Form.Item>

          <Form.Item name="linkedMenuItems" label="Linked Menu Items">
            <Select mode="tags" style={{ width: '100%' }} placeholder="Enter menu items that use this ingredient">
              <Option value="Margherita Pizza">Margherita Pizza</Option>
              <Option value="Chicken Wings">Chicken Wings</Option>
              <Option value="Pasta Marinara">Pasta Marinara</Option>
              <Option value="Caesar Salad">Caesar Salad</Option>
            </Select>
          </Form.Item>

          <Form.Item style={{ textAlign: 'right', marginTop: 24 }}>
            <Button onClick={() => setIsModalVisible(false)} style={{ marginRight: 8 }}>
              Cancel
            </Button>
            <Button type="primary" htmlType="submit" loading={loading}>
              {editingItem ? 'Update Item' : 'Add Item'}
            </Button>
          </Form.Item>
        </Form>
      </Modal>

      {/* Add/Edit Supplier Modal */}
      <Modal
        title={editingSupplier ? `Edit: ${editingSupplier.name}` : 'Add New Supplier'}
        open={isSupplierModalVisible}
        onCancel={() => setIsSupplierModalVisible(false)}
        footer={null}
        width={600}
        destroyOnClose
      >
        <Form form={supplierForm} layout="vertical" onFinish={handleSubmitSupplier}>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="name" label="Supplier Name" rules={[{ required: true }]}>
                <Input />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="category" label="Category" rules={[{ required: true }]}>
                <Select>
                  {categories.map(cat => <Option key={cat} value={cat}>{cat}</Option>)}
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="contact" label="Contact Number" rules={[{ required: true }]}>
                <Input />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="email" label="Email" rules={[{ required: true, type: 'email' }]}>
                <Input />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item name="rating" label="Rating (0-5)" rules={[{ type: 'number', min: 0, max: 5 }]}>
            <InputNumber style={{ width: '100%' }} step={0.1} precision={1} />
          </Form.Item>

          <Form.Item style={{ textAlign: 'right', marginTop: 24 }}>
            <Button onClick={() => setIsSupplierModalVisible(false)} style={{ marginRight: 8 }}>
              Cancel
            </Button>
            <Button type="primary" htmlType="submit" loading={loading}>
              {editingSupplier ? 'Update Supplier' : 'Add Supplier'}
            </Button>
          </Form.Item>
        </Form>
      </Modal>

      {/* Stock Adjustment Modal */}
      <Modal
        title={`Adjust Stock: ${selectedItem?.name}`}
        open={isStockAdjustModalVisible}
        onCancel={() => setIsStockAdjustModalVisible(false)}
        footer={null}
        width={500}
        destroyOnClose
      >
        {selectedItem && (
          <Form form={stockAdjustForm} layout="vertical" onFinish={handleStockAdjustment}>
            <Alert
              message={`Current Stock: ${selectedItem.currentStock} ${selectedItem.unit}`}
              type="info"
              style={{ marginBottom: 16 }}
            />

            <Row gutter={16}>
              <Col span={12}>
                <Form.Item name="adjustmentType" label="Adjustment Type" rules={[{ required: true }]}>
                  <Select>
                    <Option value="IN">Stock In (+)</Option>
                    <Option value="OUT">Stock Out (-)</Option>
                  </Select>
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item name="quantity" label="Quantity" rules={[{ required: true, type: 'number', min: 0.01 }]}>
                  <InputNumber style={{ width: '100%' }} addonAfter={selectedItem.unit} />
                </Form.Item>
              </Col>
            </Row>

            <Form.Item name="reason" label="Reason" rules={[{ required: true }]}>
              <Input.TextArea rows={3} placeholder="Enter reason for stock adjustment..." />
            </Form.Item>

            <Form.Item style={{ textAlign: 'right', marginTop: 24 }}>
              <Button onClick={() => setIsStockAdjustModalVisible(false)} style={{ marginRight: 8 }}>
                Cancel
              </Button>
              <Button type="primary" htmlType="submit" loading={loading}>
                Adjust Stock
              </Button>
            </Form.Item>
          </Form>
        )}
      </Modal>
    </div>
  );
};

export default AdminInventoryManagementPage;