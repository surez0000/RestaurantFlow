import React, { useState, useEffect, useContext, useMemo } from 'react';
import { Table, Tag, Space, Button, Select, Typography, Modal, List, Input, DatePicker, Row, Col, Card, Avatar, Divider } from 'antd';
import { EyeOutlined, CheckCircleOutlined, HourglassOutlined, CarOutlined, CloseCircleOutlined, PrinterOutlined, ReloadOutlined } from '@ant-design/icons';
import { ThemeContext } from '../../contexts/ThemeContext';
import dayjs from 'dayjs';

const { Option } = Select;
const { Title, Text, Paragraph } = Typography;
const { RangePicker } = DatePicker;

const mockOrdersInitial = [
  { id: 'ORD2024001', customerName: 'Alice Wonderland', customerAvatar: 'A', type: 'Dine-in', table: 'T5', status: 'Preparing', total: 45.50, items: [{id:1, name: 'Margherita Pizza', qty: 1, price: 15.00, notes: "Extra Basil"}, {id:2, name: 'Coca-Cola', qty:2, price: 2.50}], created_at: '2024-03-15T10:30:00Z', paymentStatus: 'Paid', paymentMethod: 'Card' },
  { id: 'ORD2024002', customerName: 'Bob The Builder', customerAvatar: 'B', type: 'Takeaway', status: 'Ready for Pickup', total: 22.00, items: [{id:3, name: 'Angus Beef Burger', qty: 1, price: 14.00}, {id:4, name: 'Fries', qty:1, price: 4.00}, {id: 5, name: 'Sprite', qty:1, price:2.50}], created_at: '2024-03-15T10:35:00Z', paymentStatus: 'Pending', paymentMethod: null },
  { id: 'ORD2024003', customerName: 'Charlie Brown', customerAvatar: 'C', type: 'Delivery', status: 'Out for Delivery', total: 30.75, items: [{id:6, name: 'Grilled Salmon', qty: 1, price: 22.00}, {id:7, name: 'Fresh Lemonade', qty:1, price:4.50}], deliveryAddress: '123 Peanut Street', created_at: '2024-03-15T10:40:00Z', paymentStatus: 'Paid', paymentMethod: 'Online' },
  { id: 'ORD2024004', customerName: 'Diana Prince', customerAvatar: 'D', type: 'Dine-in', table: 'T2', status: 'Confirmed', total: 15.00, items: [{id:8, name: 'Spring Rolls', qty: 1, price: 8.99}, {id:9, name: 'Iced Tea', qty:1, price:3.50}], created_at: '2024-03-16T11:42:00Z', paymentStatus: 'Pending', paymentMethod: null },
  { id: 'ORD2024005', customerName: 'Edward Scissorhands', customerAvatar: 'E', type: 'Takeaway', status: 'Cancelled', total: 18.00, items: [{id:10, name: 'Chicken Sandwich', qty: 1, price: 12.00}], created_at: '2024-03-16T09:20:00Z', paymentStatus: 'Refunded', paymentMethod: 'Card' },
  { id: 'ORD2024006', customerName: 'Fiona Gallagher', customerAvatar: 'F', type: 'Dine-in', table: 'T1', status: 'Completed', total: 65.20, items: [{name: 'Steak', qty: 2, price: 25.00}, {name: 'Red Wine', qty:1, price:15.20}], created_at: '2024-03-14T19:50:00Z', paymentStatus: 'Paid', paymentMethod: 'Cash' },
];

const orderStatusOptions = ['Pending', 'Confirmed', 'Preparing', 'Ready for Pickup', 'Out for Delivery', 'Completed', 'Cancelled'];
const orderTypeOptions = ['All', 'Dine-in', 'Takeaway', 'Delivery'];

const AdminOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const { accentColor, isDarkMode } = useContext(ThemeContext);

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState(null);
  const [typeFilter, setTypeFilter] = useState('All');
  const [dateRangeFilter, setDateRangeFilter] = useState(null);

  const fetchOrders = () => {
    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      setOrders(mockOrdersInitial);
      setLoading(false);
    }, 700);
  }

  useEffect(() => {
    fetchOrders();
  }, []);

  const filteredOrders = useMemo(() => {
    return orders.filter(order => {
      const orderDate = dayjs(order.created_at);
      const matchesSearch = searchTerm ? (
        order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (order.table && order.table.toLowerCase().includes(searchTerm.toLowerCase()))
      ) : true;
      const matchesStatus = statusFilter ? order.status === statusFilter : true;
      const matchesType = typeFilter !== 'All' ? order.type === typeFilter : true;
      const matchesDate = dateRangeFilter ?
        (orderDate.isAfter(dateRangeFilter[0]) && orderDate.isBefore(dateRangeFilter[1].endOf('day')))
        : true;

      return matchesSearch && matchesStatus && matchesType && matchesDate;
    });
  }, [orders, searchTerm, statusFilter, typeFilter, dateRangeFilter]);


  const handleViewOrder = (order) => {
    setSelectedOrder(order);
    setIsModalVisible(true);
  };

  const handleStatusChange = (orderId, newStatus) => {
    // Simulate API call to update status
    setOrders(prevOrders =>
      prevOrders.map(order =>
        order.id === orderId ? { ...order, status: newStatus, updatedAt: new Date().toISOString() } : order
      )
    );
    // In a real app, you'd refetch or update based on API response.
  };

  const getStatusTag = (status) => {
    let color;
    let icon;
    switch (status?.toLowerCase()) {
      case 'pending': color = 'gold'; icon = <HourglassOutlined />; break;
      case 'confirmed': color = 'cyan'; icon = <CheckCircleOutlined />; break;
      case 'preparing': color = 'processing'; icon = <HourglassOutlined spin/>; break;
      case 'ready for pickup': color = 'lime'; icon = <CheckCircleOutlined />; break;
      case 'out for delivery': color = 'geekblue'; icon = <CarOutlined />; break;
      case 'completed': color = 'success'; icon = <CheckCircleOutlined />; break;
      case 'cancelled': color = 'error'; icon = <CloseCircleOutlined />; break;
      default: color = 'default';
    }
    return <Tag color={color} icon={icon} style={{marginRight: 0}}>{status}</Tag>;
  };

  const columns = [
    { title: 'Order ID', dataIndex: 'id', key: 'id', sorter: (a, b) => a.id.localeCompare(b.id), width: 150, fixed: 'left' },
    { title: 'Customer', dataIndex: 'customerName', key: 'customer', render: (text, record) => (
        <Space><Avatar style={{backgroundColor: accentColor}}>{record.customerAvatar || text[0]}</Avatar> <Text>{text}</Text></Space>
    ), width: 200 },
    { title: 'Type', dataIndex: 'type', key: 'type', width: 120, render: (type, record) => (
      <Tag color={type === 'Dine-in' ? 'blue' : type === 'Takeaway' ? 'orange' : 'purple'}>
        {type} {record.type === 'Dine-in' && record.table ? `(${record.table})` : ''}
      </Tag>
    )},
    { title: 'Status', dataIndex: 'status', key: 'status', width: 180, render: (status, record) => (
        <Select
            value={status}
            size="small"
            style={{ width: '100%' }}
            onChange={(value) => handleStatusChange(record.id, value)}
            disabled={['Completed', 'Cancelled'].includes(status)}
            bordered={false}
        >
            {orderStatusOptions.map(opt => <Option key={opt} value={opt}>{getStatusTag(opt)} {opt}</Option>)}
        </Select>
    )},
    { title: 'Total', dataIndex: 'total', key: 'total', width: 100, render: total => <Text strong>${total.toFixed(2)}</Text>, sorter: (a,b) => a.total - b.total },
    { title: 'Payment', dataIndex: 'paymentStatus', key: 'paymentStatus', width: 120, render: (status) => {
        let color;
        if (status === 'Paid') color = 'green';
        else if (status === 'Pending') color = 'orange';
        else if (status === 'Refunded') color = 'red';
        else color = 'default';
        return <Tag color={color}>{status}</Tag>;
    }},
    { title: 'Created At', dataIndex: 'created_at', key: 'created_at', width: 180, sorter: (a,b) => dayjs(a.created_at).unix() - dayjs(b.created_at).unix(), render: (date) => dayjs(date).format('DD MMM YYYY, HH:mm') },
    {
      title: 'Actions',
      key: 'actions',
      width: 100,
      fixed: 'right',
      render: (_, record) => (
        <Space size="small">
          <Button type="primary" ghost icon={<EyeOutlined />} onClick={() => handleViewOrder(record)} size="small">View</Button>
          {/* <Button icon={<EditOutlined />} size="small" disabled={['Completed', 'Cancelled'].includes(record.status)}>Edit</Button> */}
        </Space>
      ),
    },
  ];

  return (
    <Card bordered={false}>
      <Row justify="space-between" align="middle" style={{ marginBottom: 24 }}>
        <Col>
            <Title level={3} style={{ margin: 0 }}>Order Management</Title>
        </Col>
        <Col>
            <Button icon={<ReloadOutlined />} onClick={fetchOrders} loading={loading}>Refresh Orders</Button>
        </Col>
      </Row>
      <Row gutter={[16,16]} style={{ marginBottom: 24 }}>
        <Col xs={24} md={8} lg={6}>
            <Input.Search
                placeholder="Search ID, Customer, Table..."
                allowClear
                onSearch={setSearchTerm}
                onChange={e => setSearchTerm(e.target.value)}
            />
        </Col>
        <Col xs={24} sm={12} md={5} lg={4}>
            <Select placeholder="Filter by Status" value={statusFilter} onChange={setStatusFilter} allowClear style={{width: '100%'}}>
                {orderStatusOptions.map(opt => <Option key={opt} value={opt}>{opt}</Option>)}
            </Select>
        </Col>
        <Col xs={24} sm={12} md={5} lg={4}>
            <Select placeholder="Filter by Type" value={typeFilter} onChange={setTypeFilter} style={{width: '100%'}}>
                 {orderTypeOptions.map(opt => <Option key={opt} value={opt}>{opt}</Option>)}
            </Select>
        </Col>
        <Col xs={24} md={6} lg={6}>
            <RangePicker style={{width: '100%'}} onChange={(dates) => setDateRangeFilter(dates)} />
        </Col>
         <Col xs={24} md={24} lg={4} style={{textAlign: 'right'}}>
            <Text>{filteredOrders.length} orders found</Text>
        </Col>
      </Row>
      <Table
        columns={columns}
        dataSource={filteredOrders}
        rowKey="id"
        loading={loading}
        pagination={{ pageSize: 10, showSizeChanger: true, pageSizeOptions: ['10', '20', '50'] }}
        scroll={{ x: 1200 }} // For horizontal scroll on smaller screens
        size="middle"
      />
      <Modal
        title={<Title level={4} style={{margin:0}}>Order Details: {selectedOrder?.id}</Title>}
        open={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        width={700}
        footer={[
            <Button key="print" icon={<PrinterOutlined />}>Print KOT</Button>,
            <Button key="close" type="primary" onClick={() => setIsModalVisible(false)}>Close</Button>
        ]}
      >
        {selectedOrder && (
          <>
            <Row gutter={16}>
                <Col span={12}>
                    <Paragraph><Text strong>Customer:</Text> {selectedOrder.customerName}</Paragraph>
                    <Paragraph><Text strong>Type:</Text> {selectedOrder.type} {selectedOrder.table ? `(Table: ${selectedOrder.table})` : ''}</Paragraph>
                    {selectedOrder.type === 'Delivery' && <Paragraph><Text strong>Address:</Text> {selectedOrder.deliveryAddress}</Paragraph>}
                </Col>
                <Col span={12}>
                    <Paragraph><Text strong>Status:</Text> {getStatusTag(selectedOrder.status)}</Paragraph>
                    <Paragraph><Text strong>Payment:</Text> {selectedOrder.paymentStatus} ({selectedOrder.paymentMethod || 'N/A'})</Paragraph>
                    <Paragraph><Text strong>Created:</Text> {dayjs(selectedOrder.created_at).format('DD MMM YYYY, HH:mm:ss')}</Paragraph>
                </Col>
            </Row>
            <Divider>Items</Divider>
            <List
                itemLayout="horizontal"
                dataSource={selectedOrder.items}
                renderItem={item => (
                    <List.Item>
                        <List.Item.Meta
                            title={<Text strong>{item.name} (x{item.qty})</Text>}
                            description={item.notes ? `Notes: ${item.notes}` : "No special instructions"}
                        />
                        <div>${(item.price * item.qty).toFixed(2)}</div>
                    </List.Item>
                )}
            />
            <Divider />
            <Row justify="end">
                <Col>
                    <Title level={5}>Total: ${selectedOrder.total.toFixed(2)}</Title>
                </Col>
            </Row>
          </>
        )}
      </Modal>
    </Card>
  );
};

export default AdminOrders;