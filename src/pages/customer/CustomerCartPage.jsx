// src/pages/customer/CustomerCartPage.jsx
import React, { useContext } from 'react'; // Removed useState, useEffect as data comes from context
import { List, Avatar, Button, Typography, Row, Col, Card, InputNumber, Divider, Empty, message, Popconfirm, Spin } from 'antd';
import { DeleteOutlined, ShoppingCartOutlined, MinusOutlined, PlusOutlined, ArrowLeftOutlined } from '@ant-design/icons';
import { Link } from 'react-router-dom';
import { ThemeContext } from '../../contexts/ThemeContext';
import { useCart } from '../../contexts/CartContext'; // Import useCart
import './CustomerCartPage.css';

const { Title, Text } = Typography;

const CustomerCartPage = () => {
  const { cartItems, updateQuantity, removeFromCart, clearCart, getCartSubtotal } = useCart();
  const { accentColor } = useContext(ThemeContext);
  const [loading, setLoading] = React.useState(false); // For checkout simulation

  const subtotal = getCartSubtotal();
  const taxRate = 0.08; // 8% tax
  const taxAmount = subtotal * taxRate;
  const total = subtotal + taxAmount;

  const handleProceedToCheckout = () => {
    setLoading(true);
    message.loading({ content: 'Processing your order...', key: 'checkout' });
    // Simulate API call for checkout
    setTimeout(() => {
        message.success({ content: 'Order placed successfully! (Mock)', key: 'checkout', duration: 2 });
        clearCart(); // Clear cart after successful mock order
        setLoading(false);
        // Potentially navigate to an order confirmation page
    }, 2000);
  };


  return (
    <div className="customer-cart-page">
      <Title level={2} style={{ marginBottom: '24px' }}>
        <ShoppingCartOutlined style={{ marginRight: '10px', color: accentColor }} />
        Your Shopping Cart
      </Title>

      {cartItems.length === 0 ? (
        <Empty
          image={<ShoppingCartOutlined style={{ fontSize: '64px', color: '#ccc' }}/>}
          description={
            <>
              <Title level={4}>Your cart is empty!</Title>
              <Text>Looks like you haven't added anything to your cart yet.</Text>
              <br/>
              <Button type="primary" style={{ marginTop: '20px' }} icon={<ArrowLeftOutlined />}>
                <Link to="/customer/menu">Continue Shopping</Link>
              </Button>
            </>
          }
        />
      ) : (
        <Row gutter={[24, 24]}>
          <Col xs={24} lg={16}>
            <Card bordered={false} className="cart-items-card">
              <List
                itemLayout="horizontal"
                dataSource={cartItems}
                renderItem={item => (
                  <List.Item
                    actions={[
                        <Popconfirm
                            title="Remove this item?"
                            onConfirm={() => removeFromCart(item.id)}
                            okText="Yes"
                            cancelText="No"
                        >
                            <Button type="text" danger icon={<DeleteOutlined />} />
                        </Popconfirm>
                    ]}
                  >
                    <List.Item.Meta
                      avatar={<Avatar shape="square" size={64} src={item.image_url} />}
                      title={<Link to={`/customer/menu`} /* Could link to item detail page */ style={{color: accentColor, fontWeight: 'bold'}}>{item.name}</Link>}
                      description={`Price: $${item.price.toFixed(2)}`}
                    />
                    <div className="cart-item-quantity-controls">
                      <Button
                        size="small"
                        icon={<MinusOutlined />}
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        disabled={item.quantity <= 0} // updateQuantity handles 0 to remove
                      />
                      <InputNumber
                        size="small"
                        min={0}
                        value={item.quantity}
                        onChange={(value) => updateQuantity(item.id, value)}
                        style={{ margin: '0 8px', width: '50px' }}
                        readOnly
                      />
                      <Button
                        size="small"
                        icon={<PlusOutlined />}
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      />
                    </div>
                    <div className="cart-item-subtotal">
                      <Text strong>${(item.price * item.quantity).toFixed(2)}</Text>
                    </div>
                  </List.Item>
                )}
              />
              <Divider />
                <Row justify="space-between">
                    <Col>
                        <Button icon={<ArrowLeftOutlined />}>
                            <Link to="/customer/menu">Continue Shopping</Link>
                        </Button>
                    </Col>
                    <Col>
                        <Popconfirm
                            title="Are you sure you want to clear your cart?"
                            onConfirm={clearCart}
                            okText="Yes, Clear It"
                            cancelText="No"
                            placement="topRight"
                        >
                            <Button type="dashed" danger icon={<DeleteOutlined />}>
                                Clear Cart
                            </Button>
                        </Popconfirm>
                    </Col>
                </Row>
            </Card>
          </Col>

          <Col xs={24} lg={8}>
            <Card title="Order Summary" bordered={false} className="order-summary-card">
              <Row justify="space-between" className="summary-row">
                <Col><Text>Subtotal:</Text></Col>
                <Col><Text strong>${subtotal.toFixed(2)}</Text></Col>
              </Row>
              <Row justify="space-between" className="summary-row">
                <Col><Text>Estimated Tax ({(taxRate * 100).toFixed(0)}%):</Text></Col>
                <Col><Text strong>${taxAmount.toFixed(2)}</Text></Col>
              </Row>
              <Divider style={{ margin: '12px 0'}}/>
              <Row justify="space-between" className="summary-row total-row">
                <Col><Title level={4} style={{margin:0}}>Total:</Title></Col>
                <Col><Title level={4} style={{margin:0, color: accentColor}}>${total.toFixed(2)}</Title></Col>
              </Row>
              <Button
                type="primary"
                block
                size="large"
                style={{ marginTop: '24px' }}
                icon={<ShoppingCartOutlined />}
                onClick={handleProceedToCheckout}
                loading={loading}
                disabled={cartItems.length === 0}
              >
                Proceed to Checkout
              </Button>
            </Card>
          </Col>
        </Row>
      )}
    </div>
  );
};

export default CustomerCartPage;