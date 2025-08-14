// src/pages/admin/AdminSettingsPage.jsx
import React, { useState, useEffect, useContext } from 'react';
import { Form, Input, InputNumber, Button, Typography, Card, Row, Col, Switch, message, Spin, Tabs, Divider, Alert } from 'antd';
import { SaveOutlined, ShopOutlined, PercentageOutlined, DollarOutlined, BellOutlined, KeyOutlined } from '@ant-design/icons';
import { ThemeContext } from '../../contexts/ThemeContext';
// import './AdminSettingsPage.css'; // Create if needed

const { Title, Text } = Typography;
const { TabPane } = Tabs;

const AdminSettingsPage = () => {
  const [formRestaurant] = Form.useForm();
  const [formFinancial] = Form.useForm();
  const [formNotifications] = Form.useForm();
  const [formIntegrations] = Form.useForm();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { accentColor } = useContext(ThemeContext);

  // Mock current settings - In a real app, fetch these
  const mockSettings = {
    restaurantName: 'The Delicious Place',
    address: '123 Foodie Lane, Gourmet City, FC 54321',
    phone: '555-FOOD-NOW',
    email: 'contact@deliciousplace.com',
    taxRate: 8.5, // Percentage
    currencySymbol: '$',
    currencyCode: 'USD',
    enableEmailNotifications: true,
    enableSmsNotifications: false,
    adminEmailForNotifications: 'admin@deliciousplace.com',
    paymentGatewayApiKey: 'sk_test_xxxxxxxxxxxxxxxxx_mock',
    deliveryPlatformApiKey: 'dp_live_yyyyyyyyyyyyyyyyy_mock',
  };

  useEffect(() => {
    setLoading(true);
    // Simulate fetching settings
    setTimeout(() => {
      formRestaurant.setFieldsValue({
        restaurantName: mockSettings.restaurantName,
        address: mockSettings.address,
        phone: mockSettings.phone,
        email: mockSettings.email,
      });
      formFinancial.setFieldsValue({
        taxRate: mockSettings.taxRate,
        currencySymbol: mockSettings.currencySymbol,
        currencyCode: mockSettings.currencyCode,
      });
      formNotifications.setFieldsValue({
        enableEmailNotifications: mockSettings.enableEmailNotifications,
        enableSmsNotifications: mockSettings.enableSmsNotifications,
        adminEmailForNotifications: mockSettings.adminEmailForNotifications,
      });
      formIntegrations.setFieldsValue({
        paymentGatewayApiKey: mockSettings.paymentGatewayApiKey,
        deliveryPlatformApiKey: mockSettings.deliveryPlatformApiKey,
      });
      setLoading(false);
    }, 1000);
  }, [formRestaurant, formFinancial, formNotifications, formIntegrations]);

  const handleSaveSettings = async (formName, values) => {
    setSaving(true);
    message.loading({ content: 'Saving settings...', key: 'saveSettings' });
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    console.log(`Settings Updated (${formName}):`, values);
    // Update mockSettings (or refetch in real app)
    Object.assign(mockSettings, values);
    message.success({ content: 'Settings saved successfully!', key: 'saveSettings' });
    setSaving(false);
  };

  if (loading) {
    return <div style={{ textAlign: 'center', padding: '50px' }}><Spin size="large" tip="Loading Settings..." /></div>;
  }

  return (
    <div className="admin-settings-page" style={{ padding: '20px' }}>
      <Title level={2} style={{ marginBottom: 24 }}>Restaurant Settings</Title>
      <Tabs defaultActiveKey="1" tabPosition="top">
        <TabPane tab={<><ShopOutlined /> Restaurant Info</>} key="1">
          <Card title="Basic Restaurant Information">
            <Form form={formRestaurant} layout="vertical" onFinish={(values) => handleSaveSettings('Restaurant', values)}>
              <Form.Item name="restaurantName" label="Restaurant Name" rules={[{ required: true }]}>
                <Input placeholder="Your restaurant's official name" />
              </Form.Item>
              <Form.Item name="address" label="Full Address">
                <Input.TextArea rows={2} placeholder="Street, City, State, Zip Code" />
              </Form.Item>
              <Row gutter={16}>
                <Col xs={24} sm={12}>
                  <Form.Item name="phone" label="Contact Phone" rules={[{ required: true }]}>
                    <Input placeholder="Main contact number" />
                  </Form.Item>
                </Col>
                <Col xs={24} sm={12}>
                  <Form.Item name="email" label="Contact Email" rules={[{ type: 'email' }]}>
                    <Input placeholder="Public contact email" />
                  </Form.Item>
                </Col>
              </Row>
              <Form.Item>
                <Button type="primary" htmlType="submit" icon={<SaveOutlined />} loading={saving}>Save Restaurant Info</Button>
              </Form.Item>
            </Form>
          </Card>
        </TabPane>

        <TabPane tab={<><DollarOutlined /> Financial</>} key="2">
          <Card title="Financial Settings">
            <Form form={formFinancial} layout="vertical" onFinish={(values) => handleSaveSettings('Financial', values)}>
              <Row gutter={16}>
                <Col xs={24} sm={8}>
                  <Form.Item name="taxRate" label="Default Tax Rate (%)" rules={[{ required: true, type: 'number', min: 0, max: 100 }]}>
                    <InputNumber style={{ width: '100%' }} addonAfter={<PercentageOutlined />} />
                  </Form.Item>
                </Col>
                <Col xs={24} sm={8}>
                  <Form.Item name="currencySymbol" label="Currency Symbol" rules={[{ required: true }]}>
                    <Input placeholder="e.g., $, €, £, ₹" />
                  </Form.Item>
                </Col>
                <Col xs={24} sm={8}>
                  <Form.Item name="currencyCode" label="Currency Code (ISO)" rules={[{ required: true }]}>
                    <Input placeholder="e.g., USD, EUR, GBP, INR" />
                  </Form.Item>
                </Col>
              </Row>
              <Form.Item>
                <Button type="primary" htmlType="submit" icon={<SaveOutlined />} loading={saving}>Save Financial Settings</Button>
              </Form.Item>
            </Form>
          </Card>
        </TabPane>

        <TabPane tab={<><BellOutlined /> Notifications</>} key="3">
          <Card title="Notification Settings">
            <Form form={formNotifications} layout="vertical" onFinish={(values) => handleSaveSettings('Notifications', values)}>
              <Form.Item name="adminEmailForNotifications" label="Admin Email for Important Alerts" rules={[{ required: true, type: 'email'}]}>
                <Input placeholder="Email for system notifications, new high-value orders, etc."/>
              </Form.Item>
              <Form.Item name="enableEmailNotifications" label="Enable Email Notifications to Customers (Order Status, etc.)" valuePropName="checked">
                <Switch />
              </Form.Item>
              <Form.Item name="enableSmsNotifications" label="Enable SMS Notifications to Customers (Requires SMS Gateway)" valuePropName="checked">
                <Switch />
              </Form.Item>
              <Alert message="SMS notifications require integration with an SMS gateway service (not configured here)." type="info" showIcon style={{marginBottom: 16}}/>
              <Form.Item>
                <Button type="primary" htmlType="submit" icon={<SaveOutlined />} loading={saving}>Save Notification Settings</Button>
              </Form.Item>
            </Form>
          </Card>
        </TabPane>

        <TabPane tab={<><KeyOutlined /> Integrations</>} key="4">
          <Card title="Third-Party Integrations (API Keys)">
            <Alert message="Warning: API keys are sensitive. Store and handle them securely on your backend. These are placeholders." type="warning" showIcon style={{marginBottom: 24}}/>
            <Form form={formIntegrations} layout="vertical" onFinish={(values) => handleSaveSettings('Integrations', values)}>
              <Form.Item name="paymentGatewayApiKey" label="Payment Gateway API Key (e.g., Stripe Secret Key)">
                <Input.Password placeholder="sk_test_xxxxxxxxxxxxxxxxx" />
              </Form.Item>
               <Text type="secondary">This key will be used by your backend to process payments.</Text>
               <Divider/>
              <Form.Item name="deliveryPlatformApiKey" label="Food Delivery Platform API Key (e.g., Swiggy/Zomato Partner Key)">
                <Input.Password placeholder="partner_xxxxxxxxxxxxxxxxx" />
              </Form.Item>
              <Text type="secondary">This key allows your system to interact with delivery platforms (if supported).</Text>
              <Divider/>
              <Form.Item>
                <Button type="primary" htmlType="submit" icon={<SaveOutlined />} loading={saving}>Save Integration Keys</Button>
              </Form.Item>
            </Form>
          </Card>
        </TabPane>
      </Tabs>
    </div>
  );
};

export default AdminSettingsPage;