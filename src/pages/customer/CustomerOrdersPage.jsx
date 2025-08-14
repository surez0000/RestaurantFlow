// src/pages/customer/CustomerOrdersPage.jsx
import React, { useState, useEffect, useContext } from 'react';
import { List, Button, Typography, Tag, Modal, Descriptions, Divider, Spin, Empty, Card, Space, Rate, Form as AntForm, Input, message } from 'antd';
import { EyeOutlined, HistoryOutlined, ShoppingOutlined, MessageOutlined, CheckCircleOutlined } from '@ant-design/icons';
import { ThemeContext } from '../../contexts/ThemeContext';
import dayjs from 'dayjs';
import './CustomerOrdersPage.css'; // Create this CSS file if it doesn't exist

const { Title, Text } = Typography;

const mockPastOrdersData = [ // Renamed for clarity
  {
    id: 'ORDCUST001',
    date: '2024-03-10T14:30:00Z',
    status: 'Completed',
    totalAmount: 55.50,
    items: [
      { id: 1, name: 'Margherita Pizza', quantity: 1, price: 15.00 },
      { id: 2, name: 'Chicken Wings', quantity: 2, price: 12.50 },
      { id: 3, name: 'Coca-Cola', quantity: 2, price: 2.50 },
    ],
    deliveryAddress: '123 Main St, Anytown, USA',
    paymentMethod: 'Credit Card',
    type: 'Delivery',
    feedbackSubmitted: true, // Added for demo
  },
  {
    id: 'ORDCUST002',
    date: '2024-03-05T18:00:00Z',
    status: 'Completed',
    totalAmount: 22.00,
    items: [
      { id: 4, name: 'Angus Beef Burger', quantity: 1, price: 14.00 },
      { id: 5, name: 'Fries', quantity: 1, price: 4.00 },
      { id: 6, name: 'Sprite', quantity: 1, price: 2.50 },
    ],
    type: 'Takeaway',
    feedbackSubmitted: false,
  },
  {
    id: 'ORDCUST003',
    date: '2024-02-20T12:15:00Z',
    status: 'Cancelled',
    totalAmount: 18.50,
    items: [{ id: 7, name: 'Spring Rolls', quantity: 1, price: 8.99 }, { id: 8, name: 'Iced Tea', quantity: 1, price: 3.50 }],
    type: 'Dine-in',
    table: 'T3',
    feedbackSubmitted: false,
  },
];

const getStatusTagColor = (status) => {
  switch (status?.toLowerCase()) {
    case 'pending': return 'gold';
    case 'confirmed': return 'cyan';
    case 'preparing': return 'processing';
    case 'ready for pickup': return 'lime';
    case 'out for delivery': return 'geekblue';
    case 'completed': return 'success';
    case 'delivered': return 'success'; // Alias for completed if used
    case 'cancelled': return 'error';
    default: return 'default';
  }
};

const CustomerOrdersPage = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isDetailsModalVisible, setIsDetailsModalVisible] = useState(false);
  const [isFeedbackModalVisible, setIsFeedbackModalVisible] = useState(false);
  const [feedbackOrder, setFeedbackOrder] = useState(null);
  const [feedbackForm] = AntForm.useForm();
  const [submitFeedbackLoading, setSubmitFeedbackLoading] = useState(false);
  const { accentColor } = useContext(ThemeContext);

  useEffect(() => {
    setLoading(true);
    setTimeout(() => {
      setOrders(mockPastOrdersData);
      setLoading(false);
    }, 1000);
  }, []);

  const handleViewOrderDetails = (order) => {
    setSelectedOrder(order);
    setIsDetailsModalVisible(true);
  };

  const handleCloseDetailsModal = () => {
    setIsDetailsModalVisible(false);
    setSelectedOrder(null);
  };

  const handleOpenFeedbackModal = (order) => {
    setFeedbackOrder(order);
    feedbackForm.resetFields();
    setIsFeedbackModalVisible(true);
  };

  const handleCloseFeedbackModal = () => {
      setIsFeedbackModalVisible(false);
      setFeedbackOrder(null);
  }

  const handleFeedbackSubmit = (values) => {
    setSubmitFeedbackLoading(true);
    message.loading({content: 'Submitting feedback...', key: 'feedbackSubmit'})
    setTimeout(() => {
      console.log('Feedback Submitted for Order:', feedbackOrder.id, values);
      message.success({content: 'Thank you for your feedback!', key: 'feedbackSubmit'});
      setIsFeedbackModalVisible(false);
      setFeedbackOrder(null);
      setSubmitFeedbackLoading(false);
      setOrders(prevOrders => prevOrders.map(o => o.id === feedbackOrder.id ? {...o, feedbackSubmitted: true} : o))
    }, 1500);
  };

  if (loading) {
    return <div style={{ textAlign: 'center', padding: '50px' }}><Spin size="large" tip="Loading Your Orders..." /></div>;
  }

  return (
    <div className="customer-orders-page">
      <Title level={2} style={{ marginBottom: '24px' }}>
        <HistoryOutlined style={{ marginRight: '10px', color: accentColor }} /> My Order History
      </Title>

      {orders.length === 0 ? (
        <Empty
          image={<ShoppingOutlined style={{ fontSize: '64px', color: '#ccc' }} />}
          description={
            <>
              <Title level={4}>No orders yet!</Title>
              <Text>You haven't placed any orders with us. Time to explore the menu!</Text>
            </>
          }
        />
      ) : (
        <List
          grid={{ gutter: 16, xs: 1, sm: 1, md: 2, lg: 2, xl: 3, xxl: 3 }}
          dataSource={orders}
          renderItem={order => (
            <List.Item>
                <Card 
                    hoverable 
                    className="order-history-card"
                    title={<Text strong>Order ID: {order.id}</Text>}
                    extra={<Tag color={getStatusTagColor(order.status)}>{order.status}</Tag>}
                >
                    <Descriptions column={1} size="small" layout="horizontal" colon={false}>
                        <Descriptions.Item label="Date">{dayjs(order.date).format('DD MMM YYYY, hh:mm A')}</Descriptions.Item>
                        <Descriptions.Item label="Type">{order.type} {order.table ? `(Table ${order.table})`: ''}</Descriptions.Item>
                        <Descriptions.Item label="Total"><Text strong style={{color: accentColor}}>${order.totalAmount.toFixed(2)}</Text></Descriptions.Item>
                    </Descriptions>
                    <Space direction="vertical" style={{width: '100%', marginTop: '10px'}}>
                        <Button 
                            type="primary" 
                            ghost 
                            icon={<EyeOutlined />} 
                            onClick={() => handleViewOrderDetails(order)}
                            block
                        >
                            View Details
                        </Button>
                        {order.status === 'Completed' && !order.feedbackSubmitted && (
                             <Button 
                                icon={<MessageOutlined />} 
                                onClick={() => handleOpenFeedbackModal(order)}
                                block
                            >
                                Leave Feedback
                            </Button>
                        )}
                        {order.feedbackSubmitted && (
                            <Button icon={<CheckCircleOutlined />} disabled block type="dashed">Feedback Submitted</Button>
                        )}
                    </Space>
              </Card>
            </List.Item>
          )}
        />
      )}

      <Modal
        title={`Order Details: ${selectedOrder?.id}`}
        open={isDetailsModalVisible}
        onCancel={handleCloseDetailsModal}
        footer={<Button type="primary" onClick={handleCloseDetailsModal}>Close</Button>}
        width={600}
      >
        {selectedOrder && (
          <>
            <Descriptions bordered column={1} size="small">
              <Descriptions.Item label="Order ID">{selectedOrder.id}</Descriptions.Item>
              <Descriptions.Item label="Date">{dayjs(selectedOrder.date).format('DD MMM YYYY, hh:mm A')}</Descriptions.Item>
              <Descriptions.Item label="Status"><Tag color={getStatusTagColor(selectedOrder.status)}>{selectedOrder.status}</Tag></Descriptions.Item>
              <Descriptions.Item label="Order Type">{selectedOrder.type} {selectedOrder.table ? `(Table ${selectedOrder.table})`: ''}</Descriptions.Item>
              {selectedOrder.type === 'Delivery' && <Descriptions.Item label="Delivery Address">{selectedOrder.deliveryAddress}</Descriptions.Item>}
              <Descriptions.Item label="Payment Method">{selectedOrder.paymentMethod || 'N/A'}</Descriptions.Item>
              <Descriptions.Item label="Total Amount"><Text strong style={{color: accentColor}}>${selectedOrder.totalAmount.toFixed(2)}</Text></Descriptions.Item>
            </Descriptions>
            <Divider>Items Ordered</Divider>
            <List
              dataSource={selectedOrder.items}
              renderItem={item => (
                <List.Item>
                  <List.Item.Meta
                    title={item.name}
                    description={`Quantity: ${item.quantity} @ $${item.price.toFixed(2)} each`}
                  />
                  <div>${(item.quantity * item.price).toFixed(2)}</div>
                </List.Item>
              )}
            />
          </>
        )}
      </Modal>

      <Modal
        title={`Leave Feedback for Order: ${feedbackOrder?.id}`}
        open={isFeedbackModalVisible}
        onCancel={handleCloseFeedbackModal}
        confirmLoading={submitFeedbackLoading}
        onOk={() => feedbackForm.submit()}
        okText="Submit Feedback"
        destroyOnClose // Ensures form is fresh each time
      >
        {feedbackOrder && (
          <AntForm form={feedbackForm} layout="vertical" onFinish={handleFeedbackSubmit}>
            <AntForm.Item name="ratingFood" label="Food Quality" rules={[{ required: true, message: 'Please rate the food' }]}>
              <Rate allowHalf />
            </AntForm.Item>
            <AntForm.Item name="ratingService" label="Service Quality">
              <Rate allowHalf />
            </AntForm.Item>
             <AntForm.Item name="ratingAmbiance" label="Ambiance">
              <Rate allowHalf />
            </AntForm.Item>
            <AntForm.Item name="comment" label="Additional Comments">
              <Input.TextArea rows={3} placeholder="Tell us more about your experience..." />
            </AntForm.Item>
          </AntForm>
        )}
      </Modal>
    </div>
  );
};

export default CustomerOrdersPage;