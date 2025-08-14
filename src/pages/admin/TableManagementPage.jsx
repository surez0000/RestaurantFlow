// src/pages/admin/TableManagementPage.jsx
import React, { useState, useEffect, useContext, useRef } from 'react';
import { Card, Row, Col, Typography, Button, Select, Space, Modal, Form, Input, InputNumber, message, Tag, Tabs, Switch, Tooltip, Popover, Badge } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, DragOutlined, ExpandOutlined, CompressOutlined, EyeOutlined, SettingOutlined, TableOutlined, UserOutlined, MinusOutlined, DollarOutlined, ClockCircleOutlined } from '@ant-design/icons';
import { ThemeContext } from '../../contexts/ThemeContext';
import './TableManagementPage.css';

const { Title, Text } = Typography;
const { Option } = Select;
const { TabPane } = Tabs;

// Mock data for tables
const mockTablesData = {
  'main-floor': [
    { id: 'T1', name: 'T1', code: 'T1', capacity: 4, x: 100, y: 100, width: 80, height: 80, status: 'Available', customerName: null, billAmount: 0, duration: null, shape: 'square' },
    { id: 'T2', name: 'T2', code: 'T2', capacity: 4, x: 250, y: 100, width: 80, height: 80, status: 'Available', customerName: null, billAmount: 0, duration: null, shape: 'square' },
    { id: 'T3', name: 'T3', code: 'T3', capacity: 4, x: 400, y: 100, width: 80, height: 80, status: 'Available', customerName: null, billAmount: 0, duration: null, shape: 'square' },
    { id: 'T4', name: 'T4', code: 'T4', capacity: 4, x: 550, y: 50, width: 100, height: 100, status: 'Occupied', customerName: 'John Doe', billAmount: 345.60, duration: '1:10h', shape: 'round' },
    { id: 'T5', name: 'T5', code: 'T5', capacity: 4, x: 100, y: 250, width: 80, height: 80, status: 'Available', customerName: null, billAmount: 0, duration: null, shape: 'square' },
    { id: 'T6', name: 'T6', code: 'T6', capacity: 6, x: 750, y: 50, width: 120, height: 200, status: 'Occupied', customerName: 'Jane Smith', billAmount: 23.00, duration: '0:23h', shape: 'rectangle' },
    { id: 'T7', name: 'T7', code: 'T7', capacity: 4, x: 250, y: 250, width: 80, height: 80, status: 'Available', customerName: null, billAmount: 0, duration: null, shape: 'square' },
    { id: 'T8', name: 'T8', code: 'T8', capacity: 4, x: 400, y: 250, width: 80, height: 80, status: 'Available', customerName: null, billAmount: 0, duration: null, shape: 'square' },
    { id: 'T9', name: 'T9', code: 'T9', capacity: 4, x: 550, y: 200, width: 100, height: 100, status: 'Occupied', customerName: 'Mike Johnson', billAmount: 76.00, duration: '0:17h', shape: 'round' },
    { id: 'T10', name: 'T10', code: 'T10', capacity: 4, x: 700, y: 250, width: 80, height: 80, status: 'Available', customerName: null, billAmount: 0, duration: null, shape: 'square' },
    { id: 'T11', name: 'T11', code: 'T11', capacity: 4, x: 100, y: 400, width: 100, height: 100, status: 'Occupied', customerName: 'Sarah Wilson', billAmount: 34.00, duration: '0:10h', shape: 'round' },
    { id: 'T12', name: 'T12', code: 'T12', capacity: 4, x: 250, y: 400, width: 80, height: 80, status: 'Available', customerName: null, billAmount: 0, duration: null, shape: 'square' },
    { id: 'T13', name: 'T13', code: 'T13', capacity: 4, x: 400, y: 400, width: 100, height: 100, status: 'Occupied', customerName: 'Tom Brown', billAmount: 34.00, duration: '0:45h', shape: 'round' },
    { id: 'T14', name: 'T14', code: 'T14', capacity: 4, x: 550, y: 400, width: 80, height: 80, status: 'Available', customerName: null, billAmount: 0, duration: null, shape: 'square' },
    { id: 'T15', name: 'T15', code: 'T15', capacity: 4, x: 700, y: 400, width: 80, height: 80, status: 'Available', customerName: null, billAmount: 0, duration: null, shape: 'square' },
    { id: 'T16', name: 'T16', code: 'T16', capacity: 4, x: 850, y: 400, width: 100, height: 100, status: 'Occupied', customerName: 'Lisa Davis', billAmount: 45.00, duration: '1:32h', shape: 'round' },
  ],
  '2nd-floor': [
    { id: '201', name: '201', code: '201', capacity: 4, x: 100, y: 100, width: 100, height: 100, status: 'Occupied', customerName: 'Alex Johnson', billAmount: 60.00, duration: '0:05h', shape: 'round' },
    { id: '202', name: '202', code: '202', capacity: 4, x: 250, y: 100, width: 80, height: 80, status: 'Available', customerName: null, billAmount: 0, duration: null, shape: 'square' },
    { id: '203', name: '203', code: '203', capacity: 4, x: 400, y: 100, width: 100, height: 100, status: 'Occupied', customerName: 'Emma Wilson', billAmount: 45.00, duration: '0:28h', shape: 'round' },
    { id: '204', name: '204', code: '204', capacity: 4, x: 550, y: 100, width: 80, height: 80, status: 'Available', customerName: null, billAmount: 0, duration: null, shape: 'square' },
    { id: '205', name: '205', code: '205', capacity: 4, x: 700, y: 100, width: 80, height: 80, status: 'Available', customerName: null, billAmount: 0, duration: null, shape: 'square' },
    { id: '206', name: '206', code: '206', capacity: 4, x: 850, y: 100, width: 80, height: 80, status: 'Available', customerName: null, billAmount: 0, duration: null, shape: 'square' },
    { id: '207', name: '207', code: '207', capacity: 4, x: 1000, y: 100, width: 80, height: 80, status: 'Available', customerName: null, billAmount: 0, duration: null, shape: 'square' },
    { id: '208', name: '208', code: '208', capacity: 4, x: 1150, y: 100, width: 100, height: 100, status: 'Occupied', customerName: 'David Lee', billAmount: 15.00, duration: '0:30h', shape: 'round' },
    { id: '209', name: '209', code: '209', capacity: 4, x: 100, y: 300, width: 80, height: 80, status: 'Available', customerName: null, billAmount: 0, duration: null, shape: 'square' },
    { id: '210', name: '210', code: '210', capacity: 4, x: 250, y: 300, width: 80, height: 80, status: 'Available', customerName: null, billAmount: 0, duration: null, shape: 'square' },
    { id: '211', name: '211', code: '211', capacity: 4, x: 400, y: 300, width: 80, height: 80, status: 'Available', customerName: null, billAmount: 0, duration: null, shape: 'square' },
    { id: '212', name: '212', code: '212', capacity: 4, x: 550, y: 300, width: 80, height: 80, status: 'Available', customerName: null, billAmount: 0, duration: null, shape: 'square' },
  ],
  'rooftop': [
    { id: 'R1', name: 'R1', code: 'R1', capacity: 2, x: 100, y: 100, width: 60, height: 60, status: 'Available', customerName: null, billAmount: 0, duration: null, shape: 'square' },
    { id: 'R2', name: 'R2', code: 'R2', capacity: 2, x: 200, y: 100, width: 60, height: 60, status: 'Available', customerName: null, billAmount: 0, duration: null, shape: 'square' },
    { id: 'R3', name: 'R3', code: 'R3', capacity: 4, x: 300, y: 100, width: 80, height: 80, status: 'Reserved', customerName: 'Reserved Party', billAmount: 0, duration: null, shape: 'square' },
  ],
  'patio': [
    { id: 'P1', name: 'P1', code: 'P1', capacity: 6, x: 100, y: 100, width: 120, height: 80, status: 'Available', customerName: null, billAmount: 0, duration: null, shape: 'rectangle' },
    { id: 'P2', name: 'P2', code: 'P2', capacity: 8, x: 300, y: 100, width: 140, height: 100, status: 'Available', customerName: null, billAmount: 0, duration: null, shape: 'rectangle' },
  ]
};

const floors = [
  { key: 'main-floor', label: 'Main floor', color: '#ff4d4f' },
  { key: '2nd-floor', label: '2nd floor', color: '#1890ff' },
  { key: 'rooftop', label: 'Rooftop', color: '#ff7a45' },
  { key: 'patio', label: 'Patio', color: '#52c41a' }
];

const TableManagementPage = () => {
  const [viewMode, setViewMode] = useState('designer'); // 'designer' or 'grid'
  const [activeFloor, setActiveFloor] = useState('main-floor');
  const [tables, setTables] = useState(mockTablesData);
  const [selectedTable, setSelectedTable] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [draggedTable, setDraggedTable] = useState(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [isResizing, setIsResizing] = useState(false);
  const [form] = Form.useForm();
  const canvasRef = useRef(null);
  const { accentColor, isDarkMode } = useContext(ThemeContext);

  const getStatusColor = (status) => {
    switch (status) {
      case 'Available': return '#52c41a';
      case 'Occupied': return '#ff4d4f';
      case 'Reserved': return '#faad14';
      case 'Cleaning': return '#722ed1';
      case 'Out of Order': return '#8c8c8c';
      default: return '#d9d9d9';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'Available': return null;
      case 'Occupied': return '●';
      case 'Reserved': return '◐';
      case 'Cleaning': return '◯';
      case 'Out of Order': return '✕';
      default: return null;
    }
  };

  const handleTableClick = (table) => {
    setSelectedTable(table);
    form.setFieldsValue(table);
    setIsModalVisible(true);
  };

  const handleTableSave = (values) => {
    const updatedTables = { ...tables };
    const floorTables = updatedTables[activeFloor];
    const tableIndex = floorTables.findIndex(t => t.id === selectedTable.id);
    
    if (tableIndex !== -1) {
      updatedTables[activeFloor][tableIndex] = { ...selectedTable, ...values };
      setTables(updatedTables);
      message.success('Table updated successfully');
    }
    
    setIsModalVisible(false);
    setSelectedTable(null);
  };

  const handleAddTable = () => {
    const newTable = {
      id: `NEW_${Date.now()}`,
      name: `Table ${tables[activeFloor].length + 1}`,
      code: `T${tables[activeFloor].length + 1}`,
      capacity: 4,
      x: 100,
      y: 100,
      width: 80,
      height: 80,
      status: 'Available',
      customerName: null,
      billAmount: 0,
      duration: null,
      shape: 'square'
    };
    
    const updatedTables = { ...tables };
    updatedTables[activeFloor] = [...updatedTables[activeFloor], newTable];
    setTables(updatedTables);
    message.success('New table added');
  };

  const handleDeleteTable = (tableId) => {
    const updatedTables = { ...tables };
    updatedTables[activeFloor] = updatedTables[activeFloor].filter(t => t.id !== tableId);
    setTables(updatedTables);
    message.success('Table deleted');
  };

  const handleMouseDown = (e, table) => {
    if (viewMode !== 'designer') return;
    
    const rect = canvasRef.current.getBoundingClientRect();
    const offsetX = e.clientX - rect.left - table.x;
    const offsetY = e.clientY - rect.top - table.y;
    
    setDraggedTable(table);
    setDragOffset({ x: offsetX, y: offsetY });
  };

  const handleMouseMove = (e) => {
    if (!draggedTable || viewMode !== 'designer') return;
    
    const rect = canvasRef.current.getBoundingClientRect();
    const newX = e.clientX - rect.left - dragOffset.x;
    const newY = e.clientY - rect.top - dragOffset.y;
    
    const updatedTables = { ...tables };
    const floorTables = updatedTables[activeFloor];
    const tableIndex = floorTables.findIndex(t => t.id === draggedTable.id);
    
    if (tableIndex !== -1) {
      updatedTables[activeFloor][tableIndex] = {
        ...draggedTable,
        x: Math.max(0, Math.min(newX, 1200 - draggedTable.width)),
        y: Math.max(0, Math.min(newY, 600 - draggedTable.height))
      };
      setTables(updatedTables);
      setDraggedTable(updatedTables[activeFloor][tableIndex]);
    }
  };

  const handleMouseUp = () => {
    setDraggedTable(null);
    setDragOffset({ x: 0, y: 0 });
  };

  const renderTable = (table) => {
    const isOccupied = table.status === 'Occupied';
    const statusColor = getStatusColor(table.status);
    const statusIcon = getStatusIcon(table.status);
    
    return (
      <div
        key={table.id}
        className={`table-item ${table.shape} ${table.status.toLowerCase().replace(' ', '-')}`}
        style={{
          position: 'absolute',
          left: table.x,
          top: table.y,
          width: table.width,
          height: table.height,
          backgroundColor: statusColor,
          opacity: table.status === 'Available' ? 0.7 : 1,
          cursor: viewMode === 'designer' ? 'move' : 'pointer',
          borderRadius: table.shape === 'round' ? '50%' : table.shape === 'rectangle' ? '8px' : '4px',
          border: `2px solid ${statusColor}`,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'white',
          fontSize: '12px',
          fontWeight: 'bold',
          textAlign: 'center',
          boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
          transition: 'all 0.3s ease'
        }}
        onMouseDown={(e) => handleMouseDown(e, table)}
        onClick={() => viewMode === 'grid' && handleTableClick(table)}
      >
        {statusIcon && (
          <div style={{ position: 'absolute', top: '5px', right: '5px', fontSize: '8px' }}>
            {statusIcon}
          </div>
        )}
        <div style={{ fontSize: '14px', fontWeight: 'bold' }}>{table.name}</div>
        {isOccupied && (
          <>
            <div style={{ fontSize: '10px', marginTop: '2px' }}>
              💰 {table.billAmount}€
            </div>
            <div style={{ fontSize: '10px' }}>
              ⏱️ {table.duration}
            </div>
          </>
        )}
      </div>
    );
  };

  const renderGridView = () => {
    const currentFloorTables = tables[activeFloor] || [];
    
    return (
      <Row gutter={[16, 16]}>
        {currentFloorTables.map(table => (
          <Col xs={24} sm={12} md={8} lg={6} key={table.id}>
            <Card
              hoverable
              className="table-grid-card"
              style={{ 
                borderColor: getStatusColor(table.status),
                borderWidth: '2px'
              }}
              onClick={() => handleTableClick(table)}
            >
              <div className="table-grid-header">
                <Title level={4} style={{ margin: 0, color: getStatusColor(table.status) }}>
                  {table.name}
                </Title>
                <Tag color={getStatusColor(table.status)}>{table.status}</Tag>
              </div>
              <div className="table-grid-content">
                <Space direction="vertical" size="small" style={{ width: '100%' }}>
                  <div>
                    <UserOutlined /> Capacity: {table.capacity}
                  </div>
                  {table.status === 'Occupied' && (
                    <>
                      <div>
                        <Text strong>{table.customerName}</Text>
                      </div>
                      <div>
                        <DollarOutlined /> €{table.billAmount.toFixed(2)}
                      </div>
                      <div>
                        <ClockCircleOutlined /> {table.duration}
                      </div>
                    </>
                  )}
                </Space>
              </div>
            </Card>
          </Col>
        ))}
      </Row>
    );
  };

  const renderDesignerView = () => (
    <div
      ref={canvasRef}
      className="table-designer-canvas"
      style={{
        position: 'relative',
        width: '100%',
        height: '600px',
        backgroundColor: isDarkMode ? '#1f1f1f' : '#f5f5f5',
        border: `1px solid ${isDarkMode ? '#434343' : '#d9d9d9'}`,
        borderRadius: '8px',
        overflow: 'hidden'
      }}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    >
      {(tables[activeFloor] || []).map(renderTable)}
      
      {/* Floor controls */}
      <div className="floor-controls" style={{
        position: 'absolute',
        bottom: '20px',
        left: '50%',
        transform: 'translateX(-50%)',
        display: 'flex',
        gap: '8px',
        backgroundColor: 'rgba(0,0,0,0.8)',
        padding: '8px 16px',
        borderRadius: '20px'
      }}>
        {floors.map(floor => (
          <Button
            key={floor.key}
            type={activeFloor === floor.key ? 'primary' : 'default'}
            size="small"
            onClick={() => setActiveFloor(floor.key)}
            style={{
              backgroundColor: activeFloor === floor.key ? floor.color : 'transparent',
              borderColor: floor.color,
              color: activeFloor === floor.key ? 'white' : floor.color
            }}
          >
            {floor.label}
          </Button>
        ))}
      </div>
      
      {/* Zoom controls */}
      <div className="zoom-controls" style={{
        position: 'absolute',
        top: '20px',
        left: '20px',
        display: 'flex',
        flexDirection: 'column',
        gap: '8px'
      }}>
        <Button icon={<PlusOutlined />} size="small" />
        <Button icon={<MinusOutlined />} size="small" />
        <Button icon={<ExpandOutlined />} size="small" title="Scaled to fit" />
      </div>
    </div>
  );

  return (
    <div className="table-management-page">
      <Row justify="space-between" align="middle" style={{ marginBottom: 24 }}>
        <Col>
          <Title level={2} style={{ margin: 0 }}>
            <TableOutlined style={{ marginRight: 8, color: accentColor }} />
            Table Management
          </Title>
        </Col>
        <Col>
          <Space>
            <Select
              value={viewMode}
              onChange={setViewMode}
              style={{ width: 150 }}
            >
              <Option value="designer">Designer View</Option>
              <Option value="grid">Grid View</Option>
            </Select>
            {viewMode === 'designer' && (
              <Button type="primary" icon={<PlusOutlined />} onClick={handleAddTable}>
                Add Table
              </Button>
            )}
          </Space>
        </Col>
      </Row>

      {/* Floor tabs for grid view */}
      {viewMode === 'grid' && (
        <Tabs activeKey={activeFloor} onChange={setActiveFloor} style={{ marginBottom: 24 }}>
          {floors.map(floor => (
            <TabPane tab={floor.label} key={floor.key} />
          ))}
        </Tabs>
      )}

      {/* Main content */}
      <Card bordered={false} style={{ minHeight: '600px' }}>
        {viewMode === 'designer' ? renderDesignerView() : renderGridView()}
      </Card>

      {/* Table Edit Modal */}
      <Modal
        title={`Edit Table: ${selectedTable?.name}`}
        open={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        footer={null}
        width={600}
      >
        {selectedTable && (
          <Form
            form={form}
            layout="vertical"
            onFinish={handleTableSave}
            initialValues={selectedTable}
          >
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item name="name" label="Table Name" rules={[{ required: true }]}>
                  <Input />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item name="code" label="Table Code" rules={[{ required: true }]}>
                  <Input />
                </Form.Item>
              </Col>
            </Row>
            
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item name="capacity" label="Capacity" rules={[{ required: true }]}>
                  <Select>
                    <Option value={2}>2 People</Option>
                    <Option value={4}>4 People</Option>
                    <Option value={6}>6 People</Option>
                    <Option value={8}>8 People</Option>
                  </Select>
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item name="shape" label="Shape">
                  <Select>
                    <Option value="square">Square</Option>
                    <Option value="round">Round</Option>
                    <Option value="rectangle">Rectangle</Option>
                  </Select>
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={16}>
              <Col span={12}>
                <Form.Item name="status" label="Status">
                  <Select>
                    <Option value="Available">Available</Option>
                    <Option value="Occupied">Occupied</Option>
                    <Option value="Reserved">Reserved</Option>
                    <Option value="Cleaning">Cleaning</Option>
                    <Option value="Out of Order">Out of Order</Option>
                  </Select>
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item name="customerName" label="Customer Name">
                  <Input placeholder="Only for occupied tables" />
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={16}>
              <Col span={12}>
                <Form.Item name="billAmount" label="Bill Amount (€)">
                  <InputNumber style={{ width: '100%' }} min={0} precision={2} />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item name="duration" label="Duration">
                  <Input placeholder="e.g., 1:30h" />
                </Form.Item>
              </Col>
            </Row>

            <Form.Item style={{ textAlign: 'right', marginTop: 24 }}>
              <Space>
                <Button onClick={() => setIsModalVisible(false)}>Cancel</Button>
                <Button 
                  danger 
                  onClick={() => {
                    handleDeleteTable(selectedTable.id);
                    setIsModalVisible(false);
                  }}
                >
                  Delete Table
                </Button>
                <Button type="primary" htmlType="submit">
                  Save Changes
                </Button>
              </Space>
            </Form.Item>
          </Form>
        )}
      </Modal>
    </div>
  );
};

export default TableManagementPage;