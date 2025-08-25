import React, { useState, useContext } from 'react';
import { Form, Input, Button, Typography, Card, Alert, Select, Row, Col, Checkbox } from 'antd';
import { UserOutlined, LockOutlined, MailOutlined, PhoneOutlined, EyeInvisibleOutlined, EyeTwoTone, ShopOutlined } from '@ant-design/icons';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { ThemeContext } from '../../contexts/ThemeContext';
import './AuthPages.css';

const { Title, Text, Paragraph } = Typography;
const { Option } = Select;

const SignupPage = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const { signUp } = useAuth();
  const { accentColor } = useContext(ThemeContext);
  const navigate = useNavigate();

  const handleSignup = async (values) => {
    try {
      setLoading(true);
      setError('');
      
      const { data, error: authError } = await signUp(values.email, values.password, {
        full_name: values.full_name,
        phone: values.phone,
        role: values.role || 'customer',
        restaurant_name: values.restaurant_name
      });
      
      if (authError) {
        setError(authError);
        return;
      }

      setSuccess(true);
      
      // Auto redirect after successful signup
      setTimeout(() => {
        const user = data.user;
        if (user.role === 'customer') {
          navigate('/customer/home', { replace: true });
        } else {
          navigate('/admin/dashboard', { replace: true });
        }
      }, 2000);
      
    } catch (err) {
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const validatePassword = (_, value) => {
    if (!value) {
      return Promise.reject(new Error('Please enter your password!'));
    }
    if (value.length < 6) {
      return Promise.reject(new Error('Password must be at least 6 characters!'));
    }
    return Promise.resolve();
  };

  const validateConfirmPassword = (_, value) => {
    if (!value) {
      return Promise.reject(new Error('Please confirm your password!'));
    }
    if (value !== form.getFieldValue('password')) {
      return Promise.reject(new Error('Passwords do not match!'));
    }
    return Promise.resolve();
  };

  if (success) {
    return (
      <div className="auth-container">
        <div className="auth-background">
          <div className="auth-overlay" />
        </div>
        
        <div className="auth-content">
          <Card className="auth-card" bordered={false}>
            <div className="auth-header">
              <div className="auth-logo">
                <div className="logo-icon" style={{ backgroundColor: accentColor }}>
                  ✅
                </div>
                <Title level={2} style={{ margin: 0, color: accentColor }}>
                  Welcome to RestauFlow!
                </Title>
              </div>
              <Paragraph type="secondary" style={{ textAlign: 'center' }}>
                Your account has been created successfully. Redirecting you to the dashboard...
              </Paragraph>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-container">
      <div className="auth-background">
        <div className="auth-overlay" />
      </div>
      
      <div className="auth-content">
        <Card className="auth-card" bordered={false}>
          <div className="auth-header">
            <div className="auth-logo">
              <div className="logo-icon" style={{ backgroundColor: accentColor }}>
                🍽️
              </div>
              <Title level={2} style={{ margin: 0, color: accentColor }}>
                Join RestauFlow
              </Title>
            </div>
            <Paragraph type="secondary" style={{ textAlign: 'center', marginBottom: 0 }}>
              Create your account to get started
            </Paragraph>
          </div>

          {error && (
            <Alert
              message="Registration Failed"
              description={error}
              type="error"
              showIcon
              style={{ marginBottom: 24 }}
              closable
              onClose={() => setError('')}
            />
          )}

          <Form
            form={form}
            name="signup"
            onFinish={handleSignup}
            layout="vertical"
            size="large"
            className="auth-form"
            initialValues={{ role: 'customer' }}
          >
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  name="full_name"
                  label="Full Name"
                  rules={[{ required: true, message: 'Please enter your full name!' }]}
                >
                  <Input
                    prefix={<UserOutlined />}
                    placeholder="Enter your full name"
                    autoComplete="name"
                  />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="phone"
                  label="Phone Number"
                  rules={[{ required: true, message: 'Please enter your phone number!' }]}
                >
                  <Input
                    prefix={<PhoneOutlined />}
                    placeholder="Enter your phone"
                    autoComplete="tel"
                  />
                </Form.Item>
              </Col>
            </Row>

            <Form.Item
              name="email"
              label="Email Address"
              rules={[
                { required: true, message: 'Please enter your email!' },
                { type: 'email', message: 'Please enter a valid email!' }
              ]}
            >
              <Input
                prefix={<MailOutlined />}
                placeholder="Enter your email"
                autoComplete="email"
              />
            </Form.Item>

            <Form.Item
              name="role"
              label="Account Type"
              rules={[{ required: true, message: 'Please select your role!' }]}
            >
              <Select placeholder="Select your role">
                <Option value="customer">Customer - Order food and make reservations</Option>
                <Option value="manager">Restaurant Manager - Full restaurant management</Option>
                <Option value="chef">Chef - Kitchen operations and menu management</Option>
                <Option value="waiter">Waiter/Server - Table service and orders</Option>
              </Select>
            </Form.Item>

            <Form.Item
              noStyle
              shouldUpdate={(prevValues, currentValues) => prevValues.role !== currentValues.role}
            >
              {({ getFieldValue }) =>
                getFieldValue('role') && getFieldValue('role') !== 'customer' ? (
                  <Form.Item
                    name="restaurant_name"
                    label="Restaurant Name"
                    rules={[{ required: true, message: 'Please enter your restaurant name!' }]}
                  >
                    <Input
                      prefix={<ShopOutlined />}
                      placeholder="Enter your restaurant name"
                    />
                  </Form.Item>
                ) : null
              }
            </Form.Item>

            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  name="password"
                  label="Password"
                  rules={[{ validator: validatePassword }]}
                >
                  <Input.Password
                    prefix={<LockOutlined />}
                    placeholder="Create a password"
                    iconRender={(visible) => (visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />)}
                    autoComplete="new-password"
                  />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="confirm_password"
                  label="Confirm Password"
                  rules={[{ validator: validateConfirmPassword }]}
                >
                  <Input.Password
                    prefix={<LockOutlined />}
                    placeholder="Confirm your password"
                    iconRender={(visible) => (visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />)}
                    autoComplete="new-password"
                  />
                </Form.Item>
              </Col>
            </Row>

            <Form.Item
              name="agree"
              valuePropName="checked"
              rules={[
                {
                  validator: (_, value) =>
                    value ? Promise.resolve() : Promise.reject(new Error('Please accept the terms and conditions!')),
                },
              ]}
            >
              <Checkbox>
                I agree to the{' '}
                <Link to="/terms" style={{ color: accentColor }}>
                  Terms of Service
                </Link>{' '}
                and{' '}
                <Link to="/privacy" style={{ color: accentColor }}>
                  Privacy Policy
                </Link>
              </Checkbox>
            </Form.Item>

            <Form.Item>
              <Button
                type="primary"
                htmlType="submit"
                loading={loading}
                block
                style={{ 
                  height: '48px',
                  backgroundColor: accentColor,
                  borderColor: accentColor,
                  fontSize: '16px',
                  fontWeight: '600'
                }}
              >
                Create Account
              </Button>
            </Form.Item>
          </Form>

          <div className="auth-footer">
            <Text type="secondary">
              Already have an account?{' '}
              <Link to="/auth/login" style={{ color: accentColor, fontWeight: '600' }}>
                Sign in here
              </Link>
            </Text>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default SignupPage;