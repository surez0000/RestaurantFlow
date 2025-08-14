// src/pages/customer/CustomerProfilePage.jsx
import React, { useState, useEffect, useContext } from 'react';
import { Row, Col, Card, Avatar, Typography, Descriptions, Tag, List, Divider, Spin, Button, Form, Input, message, Modal } from 'antd';
import { UserOutlined, MailOutlined, PhoneOutlined, EnvironmentOutlined, EditOutlined, GiftOutlined, StarOutlined } from '@ant-design/icons';
import { ThemeContext } from '../../contexts/ThemeContext';
// import './CustomerProfilePage.css'; // Create if needed

const { Title, Text, Paragraph } = Typography;

const mockUserData = {
  name: 'Alice Customer',
  email: 'alice.c@example.com',
  phone: '555-1234',
  address: '42 Wallaby Way, Sydney',
  joinDate: '2023-01-15',
  preferences: ['Vegetarian', 'Spicy Food'],
  loyaltyPoints: 1250,
  loyaltyTier: 'Gold Member',
  recentLoyaltyActivity: [
    { date: '2024-03-10', description: 'Order #ORDCUST001', points: '+55 Pts' },
    { date: '2024-02-25', description: 'Birthday Bonus', points: '+100 Pts' },
    { date: '2024-02-15', description: 'Order #ORDCUST000', points: '+30 Pts' },
  ],
};


const CustomerProfilePage = () => {
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [form] = Form.useForm();
  const { accentColor } = useContext(ThemeContext);
  // const { user: authUser } = useAuthHook(); // Assuming you have user context for name

  useEffect(() => {
    setLoading(true);
    setTimeout(() => {
      // In a real app, fetch user data based on logged-in user
      // setUserData({ ...mockUserData, name: authUser?.name || mockUserData.name });
      setUserData(mockUserData);
      setLoading(false);
    }, 800);
  }, []); // [authUser]

  const showEditModal = () => {
    form.setFieldsValue({
        name: userData.name,
        email: userData.email,
        phone: userData.phone,
        address: userData.address,
    });
    setIsEditModalVisible(true);
  };

  const handleEditFormSubmit = (values) => {
    message.loading({content: 'Updating profile...', key: 'updateProfile'});
    // Simulate API call
    setTimeout(() => {
        setUserData(prev => ({...prev, ...values}));
        message.success({content: 'Profile updated successfully!', key: 'updateProfile'});
        setIsEditModalVisible(false);
    }, 1000);
  };

  if (loading || !userData) {
    return <div style={{ textAlign: 'center', padding: '50px' }}><Spin size="large" tip="Loading Profile..." /></div>;
  }

  return (
    <div className="customer-profile-page" style={{ padding: '20px' }}>
      <Title level={2} style={{ marginBottom: 24 }}>My Profile & Loyalty</Title>
      <Row gutter={[24, 24]}>
        <Col xs={24} md={8}>
          <Card>
            <div style={{ textAlign: 'center', marginBottom: 20 }}>
              <Avatar size={128} style={{ backgroundColor: accentColor }} icon={<UserOutlined />} />
              <Title level={3} style={{ marginTop: 10 }}>{userData.name}</Title>
              <Tag color={accentColor} icon={<StarOutlined />} style={{fontSize: '1em', padding: '5px 10px'}}>{userData.loyaltyTier}</Tag>
            </div>
            <Descriptions column={1} bordered size="small">
              <Descriptions.Item label={<><MailOutlined /> Email</>}>{userData.email}</Descriptions.Item>
              <Descriptions.Item label={<><PhoneOutlined /> Phone</>}>{userData.phone}</Descriptions.Item>
              <Descriptions.Item label={<><EnvironmentOutlined /> Address</>}>{userData.address || 'Not set'}</Descriptions.Item>
              <Descriptions.Item label="Joined On">{new Date(userData.joinDate).toLocaleDateString()}</Descriptions.Item>
            </Descriptions>
            <Button type="primary" icon={<EditOutlined />} block style={{ marginTop: 20 }} onClick={showEditModal}>
              Edit Profile
            </Button>
          </Card>
        </Col>

        <Col xs={24} md={16}>
          <Card title={<><GiftOutlined style={{color: accentColor}}/> Loyalty Program</>}>
            <Row align="middle" justify="center" style={{textAlign: 'center', marginBottom: 20}}>
                <Col>
                    <Text>Your Loyalty Points</Text>
                    <Title level={1} style={{color: accentColor, margin: '5px 0'}}>{userData.loyaltyPoints} <Text style={{fontSize: '0.5em'}}>Pts</Text></Title>
                    <Paragraph type="secondary">Keep ordering to earn more rewards!</Paragraph>
                </Col>
            </Row>
            <Divider>Recent Activity</Divider>
            <List
              itemLayout="horizontal"
              dataSource={userData.recentLoyaltyActivity}
              renderItem={item => (
                <List.Item>
                  <List.Item.Meta
                    title={item.description}
                    description={new Date(item.date).toLocaleDateString()}
                  />
                  <Tag color={item.points.startsWith('+') ? 'green' : 'red'}>{item.points}</Tag>
                </List.Item>
              )}
            />
          </Card>
          <Card title="My Preferences" style={{marginTop: 24}}>
            {userData.preferences.length > 0 ? userData.preferences.map(pref => <Tag key={pref} color="blue" style={{margin: '5px'}}>{pref}</Tag>) : <Text type="secondary">No preferences set yet.</Text>}
             {/* Could add an edit button for preferences too */}
          </Card>
        </Col>
      </Row>
      <Modal
        title="Edit Profile Information"
        open={isEditModalVisible}
        onCancel={() => setIsEditModalVisible(false)}
        footer={null} // Custom footer in form
        destroyOnClose
      >
        <Form form={form} layout="vertical" onFinish={handleEditFormSubmit}>
            <Form.Item name="name" label="Full Name" rules={[{required: true}]}>
                <Input prefix={<UserOutlined />} />
            </Form.Item>
            <Form.Item name="email" label="Email" rules={[{required: true, type: 'email'}]}>
                <Input prefix={<MailOutlined />} />
            </Form.Item>
            <Form.Item name="phone" label="Phone Number">
                <Input prefix={<PhoneOutlined />} />
            </Form.Item>
            <Form.Item name="address" label="Address">
                <Input.TextArea prefix={<EnvironmentOutlined />} rows={2} />
            </Form.Item>
            <Form.Item style={{textAlign: 'right', marginTop: 16}}>
                <Button onClick={() => setIsEditModalVisible(false)} style={{marginRight: 8}}>Cancel</Button>
                <Button type="primary" htmlType="submit">Save Changes</Button>
            </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default CustomerProfilePage;