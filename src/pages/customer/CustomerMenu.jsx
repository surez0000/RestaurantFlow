// src/pages/customer/CustomerMenuPage.jsx
import React, { useState, useEffect, useContext } from 'react';
import { Card, Row, Col, Typography, Button, Tag, Input, Select, Spin, Badge, message, Empty, Alert } from 'antd';
import { ShoppingCartOutlined, PlusOutlined, MinusOutlined, FilterOutlined, TagOutlined } from '@ant-design/icons';
import { ThemeContext } from '../../contexts/ThemeContext';
import { useCart } from '../../contexts/CartContext';
import { useLocation, Link as RouterLink } from 'react-router-dom';
import './CustomerMenu.css'; // Ensure this CSS file exists

const { Title, Text, Paragraph } = Typography;
const { Search } = Input;
const { Option } = Select;

const mockMenuItemsData = [ // This is for displaying the menu, not the cart
  { id: 1, category: 'Appetizers', name: 'Spring Rolls (VG)', description: 'Crispy vegetarian spring rolls served with sweet chili sauce.', price: 8.99, image_url: 'https://images.unsplash.com/photo-1556761223-4c4282c73f77?q=80&w=300&auto=format&fit=crop', is_veg: true, tags: ['popular', 'vegetarian'], availability: true },
  { id: 2, category: 'Appetizers', name: 'Chicken Wings (6pcs)', description: 'Spicy buffalo chicken wings with a side of blue cheese dip.', price: 12.50, image_url: 'https://images.unsplash.com/photo-1582640140098-a02f10350E53?q=80&w=300&auto=format&fit=crop', is_veg: false, tags: ['spicy', 'non-veg'], availability: true },
  { id: 3, category: 'Main Course', name: 'Margherita Pizza (VG)', description: 'Classic Italian pizza with fresh tomatoes, mozzarella, and basil on a thin crust.', price: 15.00, image_url: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?q=80&w=300&auto=format&fit=crop', is_veg: true, tags: ['vegetarian', 'bestseller'], availability: true },
  { id: 4, category: 'Main Course', name: 'Angus Beef Burger', description: 'Juicy Angus beef patty, cheddar cheese, lettuce, tomato, and our secret sauce in a brioche bun. Served with fries.', price: 14.00, image_url: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?q=80&w=300&auto=format&fit=crop', is_veg: false, tags: ['non-veg'], availability: false },
  { id: 5, category: 'Desserts', name: 'Chocolate Lava Cake (VG)', description: 'Warm dark chocolate cake with a gooey molten center, served with vanilla ice cream.', price: 9.50, image_url: 'https://images.unsplash.com/photo-1606890737304-57a1ca8a5b82?q=80&w=300&auto=format&fit=crop', is_veg: true, tags: ['sweet', 'vegetarian'], availability: true },
  { id: 6, category: 'Drinks', name: 'Fresh Lemonade', description: 'Refreshing house-made lemonade with a hint of mint.', price: 4.50, image_url: 'https://images.unsplash.com/photo-1598838073192-05906813520b?q=80&w=300&auto=format&fit=crop', is_veg: true, tags: [], availability: true },
  { id: 7, category: 'Drinks', name: 'Coca-Cola Classic', description: 'Chilled 330ml can of Coca-Cola.', price: 2.50, image_url: 'https://images.unsplash.com/photo-1554866585-cd94860890b7?q=80&w=300&auto=format&fit=crop', is_veg: true, tags: [], availability: true },
  { id: 8, category: 'Main Course', name: 'Grilled Salmon', description: 'Perfectly grilled salmon fillet served with roasted vegetables and a lemon-dill sauce.', price: 22.00, image_url: 'https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?q=80&w=300&auto=format&fit=crop', is_veg: false, tags: ['healthy', 'bestseller', 'non-veg'], availability: true },
];
const mockCategories = ['All', 'Appetizers', 'Main Course', 'Desserts', 'Drinks'];


const CustomerMenu = () => {
  const [menuItems, setMenuItems] = useState([]);
  const [filteredItems, setFilteredItems] = useState([]);
  const [categories] = useState(mockCategories);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  const { accentColor } = useContext(ThemeContext);
  const { cartItems, addToCart, updateQuantity, getCartTotalItems, getCartSubtotal } = useCart();
  const location = useLocation();
  const [tableIdentifier, setTableIdentifier] = useState(null);

  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const tableIdFromQuery = queryParams.get('table');
    if (tableIdFromQuery) {
      setTableIdentifier(tableIdFromQuery);
      // message.info(`Ordering for Table: ${tableIdFromQuery}. Your order will be linked to this table.`, 3);
    }
  }, [location.search]);

  useEffect(() => {
    setLoading(true);
    setTimeout(() => {
      setMenuItems(mockMenuItemsData.filter(item => item.availability));
      setLoading(false);
    }, 500);
  }, []);

  useEffect(() => {
    let items = menuItems;
    if (selectedCategory !== 'All') {
      items = items.filter(item => item.category === selectedCategory);
    }
    if (searchTerm) {
      items = items.filter(item =>
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    setFilteredItems(items);
  }, [searchTerm, selectedCategory, menuItems]);

  const getItemQuantityInCart = (itemId) => {
    const cartItem = cartItems.find(ci => ci.id === itemId);
    return cartItem ? cartItem.quantity : 0;
  };

  if (loading) {
    return <div style={{ textAlign: 'center', padding: '50px' }}><Spin size="large" tip="Loading Menu..." /></div>;
  }

  return (
    <div className="customer-menu-page">
        {tableIdentifier && (
            <Alert
                message={`You are ordering for Table ${tableIdentifier}`}
                description="Items added to your cart will be associated with this table."
                type="info"
                showIcon
                closable
                style={{marginBottom: '20px'}}
            />
        )}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }} align="middle" justify="space-between">
        <Col xs={24} md={12}>
          <Title level={2} style={{ margin: 0 }}>Discover Our Delicious Menu</Title>
        </Col>
        <Col xs={24} md={12} style={{ textAlign: 'right' }}>
            <Badge count={getCartTotalItems()} offset={[-5,5]} color={accentColor}>
                <Button type="primary" icon={<ShoppingCartOutlined />} size="large" component={RouterLink} to="/customer/cart">
                    View Cart (${getCartSubtotal().toFixed(2)})
                </Button>
            </Badge>
        </Col>
      </Row>
        <Row gutter={[16, 16]} style={{ marginBottom: 24 }} align="middle">
        <Col xs={24} sm={12} md={10}>
          <Search
            placeholder="Search by name or description..."
            allowClear
            onSearch={value => setSearchTerm(value)}
            onChange={(e) => setSearchTerm(e.target.value)}
            enterButton
            style={{ width: '100%' }}
          />
        </Col>
        <Col xs={24} sm={12} md={8}>
          <Select
            defaultValue="All"
            style={{ width: '100%' }}
            onChange={setSelectedCategory}
            suffixIcon={<FilterOutlined />}
          >
            {categories.map(cat => <Option key={cat} value={cat}>{cat}</Option>)}
          </Select>
        </Col>
      </Row>

      {filteredItems.length === 0 && !loading ? (
         <Empty description="No menu items match your current filters. Try adjusting your search or category!" style={{marginTop: 50}} />
      ) : (
        <Row gutter={[16, 24]}>
            {filteredItems.map(item => {
              const quantityInCart = getItemQuantityInCart(item.id);
              return (
                <Col xs={24} sm={12} md={8} lg={6} key={item.id}>
                    <Card
                    hoverable
                    className="menu-item-card"
                    cover={<img alt={item.name} src={item.image_url || 'https://via.placeholder.com/300x200.png?text=No+Image'} className="menu-item-image" />}
                    actions={
                        quantityInCart > 0 ?
                        [
                            <Button shape="circle" icon={<MinusOutlined />} onClick={() => updateQuantity(item.id, quantityInCart - 1)} key="minus" />,
                            <Text strong style={{color: accentColor, fontSize: '1.1em'}}>{quantityInCart}</Text>,
                            <Button shape="circle" icon={<PlusOutlined />} onClick={() => updateQuantity(item.id, quantityInCart + 1)} key="plus" />
                        ]
                        :
                        [<Button type="primary" icon={<ShoppingCartOutlined />} onClick={() => addToCart(item)} key="add" block>Add to Cart</Button>]
                    }
                    >
                    <Card.Meta
                        title={<Title level={5} ellipsis={{tooltip: item.name}}>{item.name}</Title>}
                        description={
                        <>
                            <Paragraph className="menu-item-description" ellipsis={{ rows: 2, expandable: true, symbol: 'more' }}>
                            {item.description}
                            </Paragraph>
                            <Text strong style={{ fontSize: '1.3em', color: accentColor }}>${item.price.toFixed(2)}</Text>
                        </>
                        }
                    />
                    <div style={{ marginTop: 10, minHeight: '24px' }}>
                        {item.is_veg && <Tag color="green" icon={<TagOutlined />}>Vegetarian</Tag>}
                        {item.tags?.filter(tag => tag !== 'vegetarian' && tag !== 'non-veg').map(tag => <Tag key={tag} color="blue" style={{textTransform: 'capitalize'}}>{tag}</Tag>)}
                    </div>
                    </Card>
                </Col>
            )})}
        </Row>
      )}
    </div>
  );
};

export default CustomerMenu;