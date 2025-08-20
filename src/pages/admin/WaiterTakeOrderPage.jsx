// src/pages/admin/WaiterTakeOrderPage.jsx
import React, { useState, useEffect, useContext } from 'react';
import { Row, Col, Card, Typography, Select, Input, Button, List, Avatar, InputNumber, Divider, Empty, message, Spin, Tag, Popconfirm, Tabs, Tooltip, Form, Modal } from 'antd';
import { PlusOutlined, MinusOutlined, DeleteOutlined, SendOutlined, UserOutlined, PercentageOutlined, EditOutlined, TagsOutlined, InfoCircleOutlined } from '@ant-design/icons';
import { useLocation, useNavigate } from 'react-router-dom';
import { ThemeContext } from '../../contexts/ThemeContext';
import { useCart } from '../../contexts/CartContext'; // We can use its structure for inspiration but this is a separate order
import './WaiterTakeOrderPage.css'; // Create this CSS file

const { Title, Text, Paragraph } = Typography;
const { Option } = Select;
const { TabPane } = Tabs;

// Mock Data - In a real app, this would come from APIs
const mockTablesData = [
  { id: 'T1', number: '1', status: 'Available' }, { id: 'T2', number: '2', status: 'Occupied' },
  { id: 'T3', number: '3', status: 'Available' }, { id: 'T4', number: '4', status: 'Reserved' },
  { id: 'T5', number: '5', status: 'Available' },
];

const mockMenuData = {
  categories: [
    { id: 'cat1', name: 'Appetizers' }, { id: 'cat2', name: 'Main Courses' },
    { id: 'cat3', name: 'Pizzas' }, { id: 'cat4', name: 'Desserts' }, { id: 'cat5', name: 'Drinks' },
  ],
  items: [
    { id: 'item1', categoryId: 'cat1', name: 'Spring Rolls', price: 8.99, image_url: 'https://images.unsplash.com/photo-1556761223-4c4282c73f77?q=80&w=150&auto=format&fit=crop', variants: [], modifiers: [] },
    { id: 'item2', categoryId: 'cat1', name: 'Garlic Bread', price: 6.50, image_url: 'https://images.unsplash.com/photo-1604890915005-3531909f1802?q=80&w=150&auto=format&fit=crop', variants: [], modifiers: [] },
    { id: 'item3', categoryId: 'cat2', name: 'Grilled Salmon', price: 22.00, image_url: 'https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?q=80&w=150&auto=format&fit=crop', variants: [], modifiers: [] },
    { id: 'item4', categoryId: 'cat2', name: 'Steak Frites', price: 28.50, image_url: 'https://images.unsplash.com/photo-1546964083-039199056092?q=80&w=150&auto=format&fit=crop', variants: [], modifiers: [] },
    { id: 'item5', categoryId: 'cat3', name: 'Margherita Pizza', price: 15.00, image_url: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?q=80&w=150&auto=format&fit=crop',
      variants: [ {name: 'Regular', priceModifier: 0}, {name: 'Large', priceModifier: 5.00} ],
      modifiers: [ {groupName: 'Crust', type: 'select_one', options: [{name: 'Thin', price: 0}, {name: 'Thick', price: 1.00}]}, {groupName: 'Toppings', type: 'select_many', options: [{name: 'Olives', price: 1.50}, {name: 'Mushrooms', price: 1.50}, {name: 'Pepperoni', price: 2.00}]} ]
    },
    { id: 'item6', categoryId: 'cat4', name: 'Lava Cake', price: 9.50, image_url: 'https://images.unsplash.com/photo-1606890737304-57a1ca8a5b82?q=80&w=150&auto=format&fit=crop', variants: [], modifiers: [] },
    { id: 'item7', categoryId: 'cat5', name: 'Coke', price: 2.50, image_url: 'https://images.unsplash.com/photo-1554866585-cd94860890b7?q=80&w=150&auto=format&fit=crop', variants: [], modifiers: [] },
  ],
};

const WaiterTakeOrderPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { accentColor } = useContext(ThemeContext);

  const [tables, setTables] = useState([]);
  const [menu, setMenu] = useState({ categories: [], items: [] });
  const [loading, setLoading] = useState(true);

  const [selectedTable, setSelectedTable] = useState(null);
  const [customerCount, setCustomerCount] = useState(1);
  const [orderNotes, setOrderNotes] = useState('');

  const [currentOrderItems, setCurrentOrderItems] = useState([]); // { itemId, name, price, quantity, notes, variant, selectedModifiers }
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  // Item Detail Modal
  const [isItemDetailModalVisible, setIsItemDetailModalVisible] = useState(false);
  const [currentItemForDetail, setCurrentItemForDetail] = useState(null);
  const [currentItemQuantity, setCurrentItemQuantity] = useState(1);
  const [currentItemVariant, setCurrentItemVariant] = useState(null);
  const [currentItemModifiers, setCurrentItemModifiers] = useState({}); // { groupName: selectedOptionName or [selectedOptionNames] }
  const [currentItemNotes, setCurrentItemNotes] = useState('');

  useEffect(() => {
    // Check for pre-selected table from query params (e.g., from Table View)
    const queryParams = new URLSearchParams(location.search);
    const tableIdFromQuery = queryParams.get('table');
    if (tableIdFromQuery) {
      setSelectedTable(tableIdFromQuery);
    }
    // Simulate fetching tables and menu
    setLoading(true);
    setTimeout(() => {
      setTables(mockTablesData);
      setMenu(mockMenuData);
      setLoading(false);
    }, 800);
  }, [location.search]);

  const filteredMenuItems = menu.items.filter(item =>
    (selectedCategory === 'all' || item.categoryId === selectedCategory) &&
    (item.name.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleShowItemDetail = (item) => {
    setCurrentItemForDetail(item);
    setCurrentItemQuantity(1);
    setCurrentItemVariant(item.variants?.length > 0 ? item.variants[0].name : null); // Default to first variant
    setCurrentItemModifiers({}); // Reset modifiers
    setCurrentItemNotes('');
    setIsItemDetailModalVisible(true);
  };
  
  const calculateItemPriceWithSelections = (item, variantName, modifierSelections) => {
    if (!item) return 0;
    let basePrice = item.price;
    if (variantName && item.variants) {
        const variant = item.variants.find(v => v.name === variantName);
        if (variant) basePrice += variant.priceModifier;
    }
    if (item.modifiers && modifierSelections) {
        item.modifiers.forEach(group => {
            const selectionsForGroup = modifierSelections[group.groupName];
            if (selectionsForGroup) {
                if (Array.isArray(selectionsForGroup)) { // select_many
                    selectionsForGroup.forEach(selName => {
                        const opt = group.options.find(o => o.name === selName);
                        if (opt) basePrice += opt.price;
                    });
                } else { // select_one
                    const opt = group.options.find(o => o.name === selectionsForGroup);
                    if (opt) basePrice += opt.price;
                }
            }
        });
    }
    return basePrice;
  };


  const handleAddItemToOrderFromModal = () => {
    if (!currentItemForDetail) return;
    
    const finalPrice = calculateItemPriceWithSelections(currentItemForDetail, currentItemVariant, currentItemModifiers);

    const orderItem = {
      id: `${currentItemForDetail.id}-${Date.now()}`, // Unique ID for the order item instance
      itemId: currentItemForDetail.id,
      name: currentItemForDetail.name,
      quantity: currentItemQuantity,
      price: finalPrice, // Price with variant and modifiers
      basePrice: currentItemForDetail.price, // Original item price
      notes: currentItemNotes,
      variant: currentItemVariant,
      selectedModifiers: {...currentItemModifiers},
      image_url: currentItemForDetail.image_url,
    };

    // Check if a similar item (same itemId, variant, and modifiers) already exists
    const existingItemIndex = currentOrderItems.findIndex(
      (item) =>
        item.itemId === orderItem.itemId &&
        item.variant === orderItem.variant &&
        JSON.stringify(item.selectedModifiers) === JSON.stringify(orderItem.selectedModifiers) &&
        item.notes === orderItem.notes // Consider notes for uniqueness too, or merge quantities
    );

    if (existingItemIndex > -1) {
      const updatedOrderItems = [...currentOrderItems];
      updatedOrderItems[existingItemIndex].quantity += orderItem.quantity;
      setCurrentOrderItems(updatedOrderItems);
    } else {
      setCurrentOrderItems(prev => [...prev, orderItem]);
    }

    message.success(`${currentItemForDetail.name} added to order!`);
    setIsItemDetailModalVisible(false);
  };


  const updateOrderItemQuantity = (orderItemId, newQuantity) => {
    if (newQuantity < 1) {
      setCurrentOrderItems(prev => prev.filter(item => item.id !== orderItemId));
    } else {
      setCurrentOrderItems(prev =>
        prev.map(item => (item.id === orderItemId ? { ...item, quantity: newQuantity } : item))
      );
    }
  };

  const removeOrderItem = (orderItemId) => {
    setCurrentOrderItems(prev => prev.filter(item => item.id !== orderItemId));
  };

  const calculateOrderTotal = () => {
    return currentOrderItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  };

  const handleSendOrder = () => {
    if (!selectedTable) {
      message.error('Please select a table.');
      return;
    }
    if (currentOrderItems.length === 0) {
      message.error('Cannot send an empty order.');
      return;
    }
    setLoading(true);
    message.loading({ content: 'Sending order to kitchen...', key: 'sendOrder' });
    // Simulate API call
    setTimeout(() => {
      console.log('Order Sent:', {
        table: selectedTable,
        customerCount,
        items: currentOrderItems,
        total: calculateOrderTotal(),
        notes: orderNotes,
      });
      message.success({ content: 'Order sent to kitchen successfully!', key: 'sendOrder' });
      // Reset state
      setCurrentOrderItems([]);
      setOrderNotes('');
      // setSelectedTable(null); // Or keep table selected for next order
      setLoading(false);
      // navigate('/admin/tables'); // Optionally navigate back
    }, 1500);
  };
  
  const currentItemPriceInModal = currentItemForDetail ? calculateItemPriceWithSelections(currentItemForDetail, currentItemVariant, currentItemModifiers) : 0;


  if (loading && !selectedTable) { // Show initial loading only if table isn't pre-selected
    return <div style={{ textAlign: 'center', padding: '50px' }}><Spin size="large" tip="Loading order system..." /></div>;
  }

  return (
    <div className="waiter-take-order-page">
      <Title level={2} style={{ marginBottom: '24px' }}>Take New Order</Title>
      <Row gutter={[24, 24]}>
        {/* Left Column: Menu Items */}
        <Col xs={24} md={14} lg={15}>
          <Card title="Select Menu Items" bordered={false}>
            <Row gutter={[16, 16]} style={{ marginBottom: 20 }}>
              <Col xs={24} sm={12}>
                <Input.Search
                  placeholder="Search menu items..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  allowClear
                />
              </Col>
              <Col xs={24} sm={12}>
                <Select
                  value={selectedCategory}
                  onChange={(value) => setSelectedCategory(value)}
                  style={{ width: '100%' }}
                >
                  <Option value="all">All Categories</Option>
                  {menu.categories.map(cat => (
                    <Option key={cat.id} value={cat.id}>{cat.name}</Option>
                  ))}
                </Select>
              </Col>
            </Row>
            {loading ? <Spin /> : (
                filteredMenuItems.length === 0 ? <Empty description="No items match your search/filter." /> :
                <List
                    grid={{ gutter: 16, xs: 1, sm: 2, md: 2, lg: 3, xl: 4 }}
                    dataSource={filteredMenuItems}
                    renderItem={item => (
                    <List.Item>
                        <Card
                            hoverable
                            className="menu-item-order-card"
                            cover={<img alt={item.name} src={item.image_url || 'https://via.placeholder.com/150?text=N/A'} />}
                            onClick={() => handleShowItemDetail(item)}
                        >
                        <Card.Meta
                            title={<Text ellipsis={{tooltip: item.name}} style={{fontWeight: 500}}>{item.name}</Text>}
                            description={`$${item.price.toFixed(2)}`}
                        />
                        {(item.variants?.length > 0 || item.modifiers?.length > 0) && 
                            <Tooltip title="This item has options (variants/modifiers)">
                                <TagsOutlined style={{position: 'absolute', top: 8, right: 8, color: accentColor}}/>
                            </Tooltip>
                        }
                        </Card>
                    </List.Item>
                    )}
                />
            )}
          </Card>
        </Col>

        {/* Right Column: Order Details */}
        <Col xs={24} md={10} lg={9}>
          <Card title="Current Order" bordered={false} className="current-order-card">
            <Form layout="vertical">
              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item label="Select Table" required>
                    <Select
                      value={selectedTable}
                      onChange={(value) => setSelectedTable(value)}
                      placeholder="Choose table"
                      showSearch
                      optionFilterProp="children"
                    >
                      {tables.map(table => (
                        <Option key={table.id} value={table.id} disabled={table.status === 'Occupied' || table.status === 'Reserved'}>
                          Table {table.number} ({table.status})
                        </Option>
                      ))}
                    </Select>
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item label="Guests" required>
                    <InputNumber min={1} value={customerCount} onChange={setCustomerCount} style={{ width: '100%' }} />
                  </Form.Item>
                </Col>
              </Row>
            </Form>
            <Divider style={{margin: '12px 0'}}/>
            {currentOrderItems.length === 0 ? (
              <Empty description="No items added to order yet." image={Empty.PRESENTED_IMAGE_SIMPLE} />
            ) : (
              <List
                dataSource={currentOrderItems}
                className="order-item-list"
                renderItem={item => (
                  <List.Item
                    actions={[
                      <Popconfirm title="Remove this item?" onConfirm={() => removeOrderItem(item.id)}>
                        <Button type="text" danger icon={<DeleteOutlined />} size="small" />
                      </Popconfirm>
                    ]}
                  >
                    <List.Item.Meta
                      avatar={<Avatar src={item.image_url} shape="square" />}
                      title={<Text strong>{item.name} {item.variant ? `(${item.variant})` : ''}</Text>}
                      description={
                        <>
                            <Text type="secondary" style={{fontSize: '0.9em'}}>
                                {Object.entries(item.selectedModifiers || {}).map(([group, sel]) => 
                                    `${group}: ${Array.isArray(sel) ? sel.join(', ') : sel}`
                                ).join('; ') || 'No modifiers'}
                            </Text>
                            {item.notes && <Paragraph italic type="secondary" style={{fontSize: '0.8em', margin: '2px 0 0 0'}}>Notes: {item.notes}</Paragraph>}
                        </>
                      }
                    />
                    <div className="order-item-controls">
                      <Button icon={<MinusOutlined />} size="small" onClick={() => updateOrderItemQuantity(item.id, item.quantity - 1)} />
                      <InputNumber value={item.quantity} size="small" min={1} onChange={(val) => updateOrderItemQuantity(item.id, val)} style={{width: 45, margin: '0 5px'}} readOnly/>
                      <Button icon={<PlusOutlined />} size="small" onClick={() => updateOrderItemQuantity(item.id, item.quantity + 1)} />
                    </div>
                    <Text strong style={{ minWidth: 60, textAlign: 'right' }}>${(item.price * item.quantity).toFixed(2)}</Text>
                  </List.Item>
                )}
              />
            )}
            <Divider style={{margin: '12px 0'}}/>
            <Form.Item label="Order Notes (Optional)">
                <Input.TextArea value={orderNotes} onChange={(e) => setOrderNotes(e.target.value)} rows={2} placeholder="E.g., Allergy information, make it quick!" />
            </Form.Item>
            <Row justify="space-between" align="middle" style={{ marginTop: 16 }}>
              <Title level={4} style={{ margin: 0 }}>Total:</Title>
              <Title level={3} style={{ margin: 0, color: accentColor }}>
                ${calculateOrderTotal().toFixed(2)}
              </Title>
            </Row>
            <Button
              type="primary"
              block
              size="large"
              icon={<SendOutlined />}
              onClick={handleSendOrder}
              style={{ marginTop: 20 }}
              disabled={currentOrderItems.length === 0 || !selectedTable || loading}
              loading={loading}
            >
              Send Order to Kitchen
            </Button>
          </Card>
        </Col>
      </Row>

      {/* Item Detail Modal */}
        <Modal
            title={currentItemForDetail?.name || "Item Options"}
            open={isItemDetailModalVisible}
            onCancel={() => setIsItemDetailModalVisible(false)}
            onOk={handleAddItemToOrderFromModal}
            okText="Add to Order"
            width={600}
            destroyOnClose
        >
            {currentItemForDetail && (
            <Spin spinning={!currentItemForDetail}> {/* Show spinner if item details are not ready */}
                <Row gutter={16}>
                    <Col span={8}>
                        <img src={currentItemForDetail.image_url || 'https://via.placeholder.com/150?text=N/A'} alt={currentItemForDetail.name} style={{width: '100%', borderRadius: '4px'}}/>
                    </Col>
                    <Col span={16}>
                        <Title level={4}>{currentItemForDetail.name}</Title>
                        <Paragraph type="secondary">{currentItemForDetail.description || 'No description available.'}</Paragraph>
                        <Text strong style={{fontSize: '1.2em', color: accentColor}}>Price: ${currentItemPriceInModal.toFixed(2)}</Text>
                    </Col>
                </Row>
                <Divider/>
                <Form layout="vertical">
                    {currentItemForDetail.variants && currentItemForDetail.variants.length > 0 && (
                        <Form.Item label="Select Variant">
                            <Select value={currentItemVariant} onChange={setCurrentItemVariant} style={{width: '100%'}}>
                                {currentItemForDetail.variants.map(v => (
                                    <Option key={v.name} value={v.name}>
                                        {v.name} {v.priceModifier !== 0 ? `(${v.priceModifier > 0 ? '+' : ''}$${v.priceModifier.toFixed(2)})` : ''}
                                    </Option>
                                ))}
                            </Select>
                        </Form.Item>
                    )}

                    {currentItemForDetail.modifiers && currentItemForDetail.modifiers.map(group => (
                        <Form.Item label={group.groupName} key={group.groupName}>
                            {group.type === 'select_one' && (
                                <Select 
                                    placeholder={`Choose ${group.groupName}`}
                                    value={currentItemModifiers[group.groupName]}
                                    onChange={val => setCurrentItemModifiers(prev => ({...prev, [group.groupName]: val}))}
                                    style={{width: '100%'}}
                                >
                                    {group.options.map(opt => (
                                        <Option key={opt.name} value={opt.name}>
                                            {opt.name} {opt.price !== 0 ? `(${opt.price > 0 ? '+' : ''}$${opt.price.toFixed(2)})` : ''}
                                        </Option>
                                    ))}
                                </Select>
                            )}
                            {group.type === 'select_many' && (
                                <Select 
                                    mode="multiple"
                                    placeholder={`Select ${group.groupName} (multiple allowed)`}
                                    value={currentItemModifiers[group.groupName] || []}
                                    onChange={vals => setCurrentItemModifiers(prev => ({...prev, [group.groupName]: vals}))}
                                    style={{width: '100%'}}
                                >
                                    {group.options.map(opt => (
                                        <Option key={opt.name} value={opt.name}>
                                            {opt.name} {opt.price !== 0 ? `(${opt.price > 0 ? '+' : ''}$${opt.price.toFixed(2)})` : ''}
                                        </Option>
                                    ))}
                                </Select>
                            )}
                        </Form.Item>
                    ))}
                    
                    <Form.Item label="Quantity">
                        <InputNumber min={1} value={currentItemQuantity} onChange={setCurrentItemQuantity} style={{width: '100px'}} />
                    </Form.Item>
                    <Form.Item label="Notes for this item (optional)">
                        <Input.TextArea value={currentItemNotes} onChange={e => setCurrentItemNotes(e.target.value)} rows={2} placeholder="E.g., Extra spicy, no onions"/>
                    </Form.Item>
                </Form>
            </Spin>
            )}
        </Modal>
    </div>
  );
};

export default WaiterTakeOrderPage;