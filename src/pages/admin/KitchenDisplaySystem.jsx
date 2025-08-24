// src/pages/admin/KitchenDisplaySystem.jsx
import React, { useState, useEffect, useContext, useRef } from 'react';
import { Card, Tag, Button, Typography, Row, Col, Space, Avatar, Progress, Modal, List, Divider, Badge, Alert, Switch, Select, Tooltip } from 'antd';
import { ClockCircleOutlined, FireOutlined, CheckCircleOutlined, WarningOutlined, SoundOutlined, FullscreenOutlined, FullscreenExitOutlined, SettingOutlined, ReloadOutlined, WifiOutlined, DisconnectOutlined } from '@ant-design/icons';
import { ThemeContext } from '../../contexts/ThemeContext';
import './KitchenDisplaySystem.css';

const { Title, Text } = Typography;
const { Option } = Select;

// Mock data for kitchen orders
const mockKitchenOrders = [
  {
    id: 'ORD2024001',
    orderNumber: '001',
    type: 'Dine-in',
    table: 'T5',
    customerName: 'Alice W.',
    orderTime: new Date(Date.now() - 5 * 60000), // 5 minutes ago
    estimatedTime: 15,
    priority: 'normal',
    status: 'preparing',
    station: 'hot',
    items: [
      { id: 1, name: 'Margherita Pizza', quantity: 1, notes: 'Extra basil', station: 'hot', prepTime: 12, status: 'preparing' },
      { id: 2, name: 'Caesar Salad', quantity: 1, notes: 'No croutons', station: 'cold', prepTime: 5, status: 'ready' },
      { id: 3, name: 'Garlic Bread', quantity: 2, notes: '', station: 'hot', prepTime: 8, status: 'preparing' }
    ],
    specialInstructions: 'Customer has nut allergy',
    allergens: ['nuts']
  },
  {
    id: 'ORD2024002',
    orderNumber: '002',
    type: 'Takeaway',
    customerName: 'Bob T.',
    orderTime: new Date(Date.now() - 3 * 60000), // 3 minutes ago
    estimatedTime: 20,
    priority: 'rush',
    status: 'new',
    station: 'hot',
    items: [
      { id: 4, name: 'Beef Burger', quantity: 1, notes: 'Medium rare', station: 'hot', prepTime: 15, status: 'new' },
      { id: 5, name: 'French Fries', quantity: 1, notes: 'Extra crispy', station: 'hot', prepTime: 8, status: 'new' },
      { id: 6, name: 'Chocolate Shake', quantity: 1, notes: '', station: 'cold', prepTime: 3, status: 'new' }
    ],
    specialInstructions: '',
    allergens: []
  },
  {
    id: 'ORD2024003',
    orderNumber: '003',
    type: 'Delivery',
    customerName: 'Charlie D.',
    orderTime: new Date(Date.now() - 12 * 60000), // 12 minutes ago
    estimatedTime: 25,
    priority: 'overdue',
    status: 'ready',
    station: 'hot',
    items: [
      { id: 7, name: 'Grilled Salmon', quantity: 1, notes: 'Well done', station: 'hot', prepTime: 18, status: 'ready' },
      { id: 8, name: 'Steamed Vegetables', quantity: 1, notes: '', station: 'hot', prepTime: 10, status: 'ready' },
      { id: 9, name: 'Rice Pilaf', quantity: 1, notes: '', station: 'hot', prepTime: 12, status: 'ready' }
    ],
    specialInstructions: 'Delivery address: 123 Main St',
    allergens: []
  },
  {
    id: 'ORD2024004',
    orderNumber: '004',
    type: 'Dine-in',
    table: 'T2',
    customerName: 'Diana P.',
    orderTime: new Date(Date.now() - 1 * 60000), // 1 minute ago
    estimatedTime: 10,
    priority: 'normal',
    status: 'new',
    station: 'cold',
    items: [
      { id: 10, name: 'Greek Salad', quantity: 1, notes: 'Extra feta', station: 'cold', prepTime: 6, status: 'new' },
      { id: 11, name: 'Hummus Platter', quantity: 1, notes: '', station: 'cold', prepTime: 4, status: 'new' }
    ],
    specialInstructions: '',
    allergens: []
  },
  {
    id: 'ORD2024005',
    orderNumber: '005',
    type: 'Dine-in',
    table: 'T8',
    customerName: 'Edward S.',
    orderTime: new Date(Date.now() - 8 * 60000), // 8 minutes ago
    estimatedTime: 18,
    priority: 'normal',
    status: 'preparing',
    station: 'hot',
    items: [
      { id: 12, name: 'Chicken Parmesan', quantity: 1, notes: '', station: 'hot', prepTime: 16, status: 'preparing' },
      { id: 13, name: 'Spaghetti', quantity: 1, notes: 'Al dente', station: 'hot', prepTime: 12, status: 'ready' },
      { id: 14, name: 'Tiramisu', quantity: 1, notes: '', station: 'dessert', prepTime: 2, status: 'new' }
    ],
    specialInstructions: 'Birthday celebration - add candle to dessert',
    allergens: ['dairy', 'gluten']
  }
];

const stations = [
  { key: 'all', label: 'All Stations', color: '#1890ff' },
  { key: 'hot', label: 'Hot Kitchen', color: '#ff4d4f' },
  { key: 'cold', label: 'Cold Station', color: '#52c41a' },
  { key: 'dessert', label: 'Dessert', color: '#722ed1' },
  { key: 'drinks', label: 'Beverages', color: '#fa8c16' }
];

const KitchenDisplaySystem = () => {
  const [orders, setOrders] = useState(mockKitchenOrders);
  const [selectedStation, setSelectedStation] = useState('all');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [isOnline, setIsOnline] = useState(true);
  const [showSettings, setShowSettings] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const { accentColor, isDarkMode } = useContext(ThemeContext);
  const audioRef = useRef(null);
  const containerRef = useRef(null);

  // Update current time every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Auto refresh orders every 30 seconds
  useEffect(() => {
    if (!autoRefresh) return;
    const interval = setInterval(() => {
      // In real app, this would fetch from API
      console.log('Auto-refreshing orders...');
    }, 30000);
    return () => clearInterval(interval);
  }, [autoRefresh]);

  // Simulate network status
  useEffect(() => {
    const interval = setInterval(() => {
      setIsOnline(Math.random() > 0.1); // 90% uptime simulation
    }, 10000);
    return () => clearInterval(interval);
  }, []);

  // Play notification sound for new orders
  const playNotificationSound = () => {
    if (soundEnabled && audioRef.current) {
      audioRef.current.play().catch(e => console.log('Audio play failed:', e));
    }
  };

  // Filter orders by station
  const filteredOrders = orders.filter(order => {
    if (selectedStation === 'all') return true;
    return order.items.some(item => item.station === selectedStation);
  });

  // Get order priority color
  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'rush': return '#ff4d4f';
      case 'overdue': return '#ff7875';
      case 'normal': return '#52c41a';
      default: return '#d9d9d9';
    }
  };

  // Get status color
  const getStatusColor = (status) => {
    switch (status) {
      case 'new': return '#1890ff';
      case 'preparing': return '#faad14';
      case 'ready': return '#52c41a';
      case 'completed': return '#d9d9d9';
      default: return '#d9d9d9';
    }
  };

  // Calculate elapsed time
  const getElapsedTime = (orderTime) => {
    const elapsed = Math.floor((currentTime - orderTime) / 60000);
    return elapsed;
  };

  // Handle item completion
  const handleItemComplete = (orderId, itemId) => {
    setOrders(prevOrders =>
      prevOrders.map(order =>
        order.id === orderId
          ? {
              ...order,
              items: order.items.map(item =>
                item.id === itemId ? { ...item, status: 'ready' } : item
              )
            }
          : order
      )
    );
  };

  // Handle order completion (bump)
  const handleOrderComplete = (orderId) => {
    setOrders(prevOrders =>
      prevOrders.map(order =>
        order.id === orderId ? { ...order, status: 'completed' } : order
      )
    );
    // In real app, this would update the backend
  };

  // Handle order start
  const handleOrderStart = (orderId) => {
    setOrders(prevOrders =>
      prevOrders.map(order =>
        order.id === orderId ? { ...order, status: 'preparing' } : order
      )
    );
  };

  // Toggle fullscreen
  const toggleFullscreen = () => {
    if (!isFullscreen) {
      if (containerRef.current?.requestFullscreen) {
        containerRef.current.requestFullscreen();
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
    }
    setIsFullscreen(!isFullscreen);
  };

  // Render order card
  const renderOrderCard = (order) => {
    const elapsedTime = getElapsedTime(order.orderTime);
    const isOverdue = elapsedTime > order.estimatedTime;
    const completedItems = order.items.filter(item => item.status === 'ready').length;
    const totalItems = order.items.length;
    const progress = (completedItems / totalItems) * 100;

    return (
      <Card
        key={order.id}
        className={`kds-order-card ${order.priority} ${order.status}`}
        style={{
          borderColor: getPriorityColor(order.priority),
          borderWidth: '3px',
          borderStyle: 'solid'
        }}
        title={
          <div className="kds-order-header">
            <Space>
              <Badge count={order.orderNumber} style={{ backgroundColor: getPriorityColor(order.priority) }} />
              <Text strong style={{ fontSize: '18px' }}>
                {order.type === 'Dine-in' ? `Table ${order.table}` : order.type}
              </Text>
              {order.customerName && <Text type="secondary">({order.customerName})</Text>}
            </Space>
            <Space>
              {isOverdue && <WarningOutlined style={{ color: '#ff4d4f', fontSize: '20px' }} />}
              <Text strong style={{ color: isOverdue ? '#ff4d4f' : '#52c41a', fontSize: '16px' }}>
                {elapsedTime}m / {order.estimatedTime}m
              </Text>
            </Space>
          </div>
        }
        extra={
          <Space>
            {order.status === 'new' && (
              <Button
                type="primary"
                icon={<FireOutlined />}
                onClick={() => handleOrderStart(order.id)}
                size="large"
              >
                START
              </Button>
            )}
            {order.status === 'preparing' && progress === 100 && (
              <Button
                type="primary"
                icon={<CheckCircleOutlined />}
                onClick={() => handleOrderComplete(order.id)}
                size="large"
                style={{ backgroundColor: '#52c41a', borderColor: '#52c41a' }}
              >
                COMPLETE
              </Button>
            )}
          </Space>
        }
      >
        {/* Progress Bar */}
        <Progress
          percent={progress}
          strokeColor={getStatusColor(order.status)}
          style={{ marginBottom: '16px' }}
          size="small"
        />

        {/* Order Items */}
        <List
          dataSource={order.items.filter(item => selectedStation === 'all' || item.station === selectedStation)}
          renderItem={item => (
            <List.Item
              className={`kds-item ${item.status}`}
              actions={[
                item.status !== 'ready' && (
                  <Button
                    type="primary"
                    ghost
                    size="small"
                    icon={<CheckCircleOutlined />}
                    onClick={() => handleItemComplete(order.id, item.id)}
                  >
                    Ready
                  </Button>
                )
              ]}
            >
              <List.Item.Meta
                avatar={
                  <Avatar
                    style={{
                      backgroundColor: getStatusColor(item.status),
                      fontSize: '16px',
                      width: '40px',
                      height: '40px'
                    }}
                  >
                    {item.quantity}
                  </Avatar>
                }
                title={
                  <Text
                    strong
                    style={{
                      fontSize: '16px',
                      textDecoration: item.status === 'ready' ? 'line-through' : 'none',
                      color: item.status === 'ready' ? '#52c41a' : 'inherit'
                    }}
                  >
                    {item.name}
                  </Text>
                }
                description={
                  <div>
                    {item.notes && (
                      <Text type="warning" style={{ fontSize: '14px', fontWeight: 'bold' }}>
                        Note: {item.notes}
                      </Text>
                    )}
                    <br />
                    <Text type="secondary">Prep time: {item.prepTime}m</Text>
                  </div>
                }
              />
            </List.Item>
          )}
        />

        {/* Special Instructions & Allergens */}
        {(order.specialInstructions || order.allergens.length > 0) && (
          <>
            <Divider style={{ margin: '12px 0' }} />
            {order.specialInstructions && (
              <Alert
                message="Special Instructions"
                description={order.specialInstructions}
                type="info"
                showIcon
                style={{ marginBottom: '8px', fontSize: '14px' }}
              />
            )}
            {order.allergens.length > 0 && (
              <Alert
                message="Allergen Alert"
                description={
                  <Space wrap>
                    {order.allergens.map(allergen => (
                      <Tag key={allergen} color="red" style={{ fontSize: '12px' }}>
                        {allergen.toUpperCase()}
                      </Tag>
                    ))}
                  </Space>
                }
                type="error"
                showIcon
                style={{ fontSize: '14px' }}
              />
            )}
          </>
        )}
      </Card>
    );
  };

  return (
    <div ref={containerRef} className={`kds-container ${isFullscreen ? 'fullscreen' : ''}`}>
      {/* Hidden audio element for notifications */}
      <audio ref={audioRef} preload="auto">
        <source src="/notification.mp3" type="audio/mpeg" />
      </audio>

      {/* Header */}
      <div className="kds-header">
        <Row justify="space-between" align="middle">
          <Col>
            <Space size="large">
              <Title level={2} style={{ margin: 0, color: 'white' }}>
                🍳 Kitchen Display
              </Title>
              <Text style={{ color: 'white', fontSize: '18px' }}>
                {currentTime.toLocaleTimeString()}
              </Text>
              <Badge
                status={isOnline ? 'success' : 'error'}
                text={
                  <Text style={{ color: 'white' }}>
                    {isOnline ? 'Online' : 'Offline'}
                  </Text>
                }
              />
            </Space>
          </Col>
          <Col>
            <Space>
              {/* Station Filter */}
              <Select
                value={selectedStation}
                onChange={setSelectedStation}
                style={{ width: 150 }}
                size="large"
              >
                {stations.map(station => (
                  <Option key={station.key} value={station.key}>
                    <Space>
                      <div
                        style={{
                          width: '12px',
                          height: '12px',
                          borderRadius: '50%',
                          backgroundColor: station.color
                        }}
                      />
                      {station.label}
                    </Space>
                  </Option>
                ))}
              </Select>

              {/* Controls */}
              <Tooltip title="Settings">
                <Button
                  icon={<SettingOutlined />}
                  onClick={() => setShowSettings(true)}
                  size="large"
                  style={{ color: 'white', borderColor: 'white' }}
                  ghost
                />
              </Tooltip>
              <Tooltip title="Refresh">
                <Button
                  icon={<ReloadOutlined />}
                  onClick={() => window.location.reload()}
                  size="large"
                  style={{ color: 'white', borderColor: 'white' }}
                  ghost
                />
              </Tooltip>
              <Tooltip title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}>
                <Button
                  icon={isFullscreen ? <FullscreenExitOutlined /> : <FullscreenOutlined />}
                  onClick={toggleFullscreen}
                  size="large"
                  style={{ color: 'white', borderColor: 'white' }}
                  ghost
                />
              </Tooltip>
            </Space>
          </Col>
        </Row>
      </div>

      {/* Order Statistics */}
      <div className="kds-stats">
        <Row gutter={16}>
          <Col span={6}>
            <Card size="small" className="kds-stat-card">
              <div className="kds-stat">
                <Text type="secondary">New Orders</Text>
                <Title level={3} style={{ margin: 0, color: '#1890ff' }}>
                  {orders.filter(o => o.status === 'new').length}
                </Title>
              </div>
            </Card>
          </Col>
          <Col span={6}>
            <Card size="small" className="kds-stat-card">
              <div className="kds-stat">
                <Text type="secondary">Preparing</Text>
                <Title level={3} style={{ margin: 0, color: '#faad14' }}>
                  {orders.filter(o => o.status === 'preparing').length}
                </Title>
              </div>
            </Card>
          </Col>
          <Col span={6}>
            <Card size="small" className="kds-stat-card">
              <div className="kds-stat">
                <Text type="secondary">Ready</Text>
                <Title level={3} style={{ margin: 0, color: '#52c41a' }}>
                  {orders.filter(o => o.status === 'ready').length}
                </Title>
              </div>
            </Card>
          </Col>
          <Col span={6}>
            <Card size="small" className="kds-stat-card">
              <div className="kds-stat">
                <Text type="secondary">Overdue</Text>
                <Title level={3} style={{ margin: 0, color: '#ff4d4f' }}>
                  {orders.filter(o => o.priority === 'overdue').length}
                </Title>
              </div>
            </Card>
          </Col>
        </Row>
      </div>

      {/* Orders Grid */}
      <div className="kds-orders">
        <Row gutter={[16, 16]}>
          {filteredOrders.map(order => (
            <Col xs={24} sm={12} lg={8} xl={6} key={order.id}>
              {renderOrderCard(order)}
            </Col>
          ))}
        </Row>
      </div>

      {/* Settings Modal */}
      <Modal
        title="Kitchen Display Settings"
        open={showSettings}
        onCancel={() => setShowSettings(false)}
        footer={null}
        width={500}
      >
        <Space direction="vertical" style={{ width: '100%' }} size="large">
          <div>
            <Text strong>Sound Notifications</Text>
            <br />
            <Switch
              checked={soundEnabled}
              onChange={setSoundEnabled}
              checkedChildren={<SoundOutlined />}
              unCheckedChildren="OFF"
            />
            <Text type="secondary" style={{ marginLeft: 8 }}>
              Play sound for new orders
            </Text>
          </div>
          
          <div>
            <Text strong>Auto Refresh</Text>
            <br />
            <Switch
              checked={autoRefresh}
              onChange={setAutoRefresh}
              checkedChildren="ON"
              unCheckedChildren="OFF"
            />
            <Text type="secondary" style={{ marginLeft: 8 }}>
              Automatically refresh orders every 30 seconds
            </Text>
          </div>

          <div>
            <Text strong>Network Status</Text>
            <br />
            <Badge
              status={isOnline ? 'success' : 'error'}
              text={isOnline ? 'Connected' : 'Disconnected'}
            />
            {isOnline ? <WifiOutlined style={{ marginLeft: 8, color: '#52c41a' }} /> : <DisconnectOutlined style={{ marginLeft: 8, color: '#ff4d4f' }} />}
          </div>
        </Space>
      </Modal>
    </div>
  );
};

export default KitchenDisplaySystem;