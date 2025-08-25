import React, { useState, useContext } from 'react';
import { Form, Input, Button, Typography, Card, Divider, Alert, Space, Checkbox } from 'antd';
import { UserOutlined, LockOutlined, MailOutlined, EyeInvisibleOutlined, EyeTwoTone } from '@ant-design/icons';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { ThemeContext } from '../../contexts/ThemeContext';
import './AuthPages.css';

const { Title, Text, Paragraph } = Typography;

const LoginPage = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { signIn } = useAuth();
  const { accentColor, isDarkMode } = useContext(ThemeContext);
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || '/';

  const handleLogin = async (values) => {
    try {
      setLoading(true);
      setError('');
      
      const { data, error: authError } = await signIn(values.email, values.password);
      
      if (authError) {
        setError(authError);
        return;
      }

      // Redirect based on user role
      const user = data.user;
      if (user.role === 'customer') {
        navigate('/customer/home', { replace: true });
      } else {
        const adminPath = user.role === 'manager' ? '/admin/dashboard' : 
                         user.role === 'waiter' ? '/admin/tables' : '/admin/orders';
        navigate(adminPath, { replace: true });
      }
    } catch (err) {
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = (role) => {
    const demoCredentials = {
      customer: 'customer@example.com',
      manager: 'manager@example.com',
      chef: 'chef@example.com',
      waiter: 'waiter@example.com'
    };
    
    form.setFieldsValue({
      email: demoCredentials[role],
      password: 'demo123'
    });
  };

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
                RestauFlow
              </Title>
            </div>
            <Paragraph type="secondary" style={{ textAlign: 'center', marginBottom: 0 }}>
              Welcome back! Please sign in to your account
            </Paragraph>
          </div>

          {error && (
            <Alert
              message="Login Failed"
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
            name="login"
            onFinish={handleLogin}
            layout="vertical"
            size="large"
            className="auth-form"
          >
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
              name="password"
              label="Password"
              rules={[{ required: true, message: 'Please enter your password!' }]}
            >
              <Input.Password
                prefix={<LockOutlined />}
                placeholder="Enter your password"
                iconRender={(visible) => (visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />)}
                autoComplete="current-password"
              />
            </Form.Item>

            <Form.Item>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Form.Item name="remember" valuePropName="checked" noStyle>
                  <Checkbox>Remember me</Checkbox>
                </Form.Item>
                <Link to="/auth/forgot-password" style={{ color: accentColor }}>
                  Forgot password?
                </Link>
              </div>
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
                Sign In
              </Button>
            </Form.Item>
          </Form>

          <Divider>
            <Text type="secondary">Quick Demo Access</Text>
          </Divider>

          <div className="demo-buttons">
            <Space direction="vertical" style={{ width: '100%' }} size="small">
              <Button 
                block 
                onClick={() => handleDemoLogin('customer')}
                icon={<UserOutlined />}
                style={{ borderColor: accentColor, color: accentColor }}
              >
                Demo as Customer
              </Button>
              <Space style={{ width: '100%' }}>
                <Button 
                  style={{ flex: 1, borderColor: accentColor, color: accentColor }}
                  onClick={() => handleDemoLogin('manager')}
                >
                  Manager
                </Button>
                <Button 
                  style={{ flex: 1, borderColor: accentColor, color: accentColor }}
                  onClick={() => handleDemoLogin('chef')}
                >
                  Chef
                </Button>
                <Button 
                  style={{ flex: 1, borderColor: accentColor, color: accentColor }}
                  onClick={() => handleDemoLogin('waiter')}
                >
                  Waiter
                </Button>
              </Space>
            </Space>
          </div>

          <div className="auth-footer">
            <Text type="secondary">
              Don't have an account?{' '}
              <Link to="/auth/signup" style={{ color: accentColor, fontWeight: '600' }}>
                Sign up now
              </Link>
            </Text>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default LoginPage;