// src/pages/admin/AdminMenuManagementPage.jsx
import React, { useState, useEffect, useContext } from 'react';
import { Table, Button, Modal, Form, Input, InputNumber, Select, Switch, Tag, Space, Typography, Upload, message, Popconfirm, Spin, Card, Row, Col, Divider, Tooltip, Checkbox, Avatar, Tabs } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, UploadOutlined, FilterOutlined, TagsOutlined, MinusCircleOutlined } from '@ant-design/icons';
import { ThemeContext } from '../../contexts/ThemeContext';
import './AdminMenuManagement.css'; // Ensure this CSS file exists or create it

const { Title, Text, Paragraph } = Typography;
const { Option } = Select;

// Mock data - In a real app, this would come from an API
const mockInitialMenuItems = [
  { id: 1, category: 'Appetizers', name: 'Spring Rolls (VG)', description: 'Crispy vegetarian spring rolls.', price: 8.99, image_url: 'https://images.unsplash.com/photo-1556761223-4c4282c73f77?q=80&w=300', is_available: true, is_veg: true, tags: ['popular', 'vegetarian'], prep_time: 10, variants: [], modifierGroups: [] },
  { id: 3, category: 'Main Course', name: 'Margherita Pizza (VG)', description: 'Classic pizza with tomato, mozzarella, and basil.', price: 15.00, image_url: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?q=80&w=300', is_available: true, is_veg: true, tags: ['vegetarian', 'bestseller'], prep_time: 20,
    variants: [
        { name: 'Regular 10"', priceModifier: 0, default: true },
        { name: 'Large 14"', priceModifier: 5.00 }
    ],
    modifierGroups: [
        { groupName: 'Crust Options', selectionType: 'single', required: true, modifiers: [{ name: 'Thin Crust', priceChange: 0 }, { name: 'Thick Crust', priceChange: 1.00 }, { name: 'Stuffed Crust', priceChange: 2.50 }] },
        { groupName: 'Extra Toppings', selectionType: 'multiple', required: false, modifiers: [{ name: 'Olives', priceChange: 1.50 }, { name: 'Mushrooms', priceChange: 1.50 }, { name: 'Pepperoni', priceChange: 2.00 }, { name: 'Extra Cheese', priceChange: 1.75 }] }
    ]
  },
  { id: 'item_coffee', category: 'Drinks', name: 'Coffee', description: 'Freshly brewed coffee.', price: 3.00, image_url: 'https://images.unsplash.com/photo-1511920183353-360d3599582a?q=80&w=300', is_available: true, is_veg: true, tags: [], prep_time: 5,
    variants: [ {name: 'Small', priceModifier: 0}, {name: 'Medium', priceModifier: 0.50}, {name: 'Large', priceModifier: 1.00} ],
    modifierGroups: [ {groupName: 'Milk Options', selectionType: 'single', required: false, modifiers: [{name: 'Dairy Milk', priceChange: 0}, {name: 'Oat Milk', priceChange: 0.75}, {name: 'Almond Milk', priceChange: 0.75}]}, {groupName: 'Add-ins', selectionType: 'multiple', required: false, modifiers: [{name: 'Sugar Sachet', priceChange: 0}, {name: 'Vanilla Syrup', priceChange: 0.50}]} ]
  },
];

const mockCategories = ['Appetizers', 'Main Course', 'Pizzas', 'Salads', 'Desserts', 'Drinks', 'Sides'];
const mockTags = ['popular', 'vegetarian', 'non-veg', 'spicy', 'bestseller', 'new', 'healthy', 'gluten-free', 'vegan'];


const AdminMenuManagementPage = () => {
  const [menuItems, setMenuItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [form] = Form.useForm();
  const { accentColor } = useContext(ThemeContext);

  const [categoryFilter, setCategoryFilter] = useState(null);
  const [availabilityFilter, setAvailabilityFilter] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');


  useEffect(() => {
    setLoading(true);
    setTimeout(() => {
      setMenuItems(mockInitialMenuItems);
      setLoading(false);
    }, 800);
  }, []);

  const filteredMenuItems = menuItems.filter(item => {
    const matchesCategory = categoryFilter ? item.category === categoryFilter : true;
    const matchesAvailability = availabilityFilter !== null ? item.is_available === availabilityFilter : true;
    const matchesSearch = searchTerm ? item.name.toLowerCase().includes(searchTerm.toLowerCase()) : true;
    return matchesCategory && matchesAvailability && matchesSearch;
  });

  const handleOpenModal = (item = null) => {
    setEditingItem(item);
    if (item) {
        // Ensure variants and modifierGroups are arrays for Form.List
        const itemData = {
            ...item,
            image_url: item.image_url ? [{ uid: '-1', name: 'image.png', status: 'done', url: item.image_url }] : [],
            variants: item.variants || [],
            modifierGroups: item.modifierGroups || [],
        };
        // Ensure each modifierGroup has a modifiers array
        itemData.modifierGroups = itemData.modifierGroups.map(mg => ({ ...mg, modifiers: mg.modifiers || [] }));
        form.setFieldsValue(itemData);
    } else {
        form.setFieldsValue({
            is_available: true, is_veg: false, tags: [], category: mockCategories[0],
            price: 0.00, prep_time: 10, variants: [], modifierGroups: [] // Defaults
        });
    }
    setIsModalOpen(true);
  };

  const handleCancelModal = () => {
    setIsModalOpen(false);
    setEditingItem(null);
    form.resetFields();
  };

  const handleFormSubmit = (values) => {
    setLoading(true);
    message.loading({ content: editingItem ? 'Updating item...' : 'Adding item...', key: 'menuSubmit' });
    setTimeout(() => {
      const imageFile = values.image_url && values.image_url[0] && values.image_url[0].originFileObj;
      const imageUrlToSave = imageFile ? URL.createObjectURL(imageFile) : (editingItem?.image_url || 'https://via.placeholder.com/150?text=No+Image');
      
      const submittedValues = {
          ...values,
          image_url: imageUrlToSave,
          // Ensure variants and modifierGroups are properly structured, removing undefined fields from Form.List
          variants: values.variants?.filter(v => v && v.name) || [],
          modifierGroups: values.modifierGroups?.filter(mg => mg && mg.groupName).map(mg => ({
              ...mg,
              modifiers: mg.modifiers?.filter(m => m && m.name) || []
          })) || [],
      };


      if (editingItem) {
        setMenuItems(prevItems =>
          prevItems.map(item =>
            item.id === editingItem.id ? { ...item, ...submittedValues } : item
          )
        );
        message.success({ content: `Item "${values.name}" updated!`, key: 'menuSubmit' });
      } else {
        const newItem = {
          id: `item_${Date.now()}`,
          ...submittedValues,
        };
        setMenuItems(prevItems => [newItem, ...prevItems]);
        message.success({ content: `Item "${values.name}" added!`, key: 'menuSubmit' });
      }
      setLoading(false);
      handleCancelModal();
    }, 1500);
  };

  const handleDeleteItem = (itemId) => { /* ... (same as before) ... */ 
    setLoading(true);
    setTimeout(() => {
        setMenuItems(prevItems => prevItems.filter(item => item.id !== itemId));
        message.success('Item deleted successfully!');
        setLoading(false);
    }, 500);
  };
  const handleToggleAvailability = (itemId, currentAvailability) => { /* ... (same as before) ... */
    setLoading(true);
    setTimeout(() => {
        setMenuItems(prevItems =>
        prevItems.map(item =>
            item.id === itemId ? { ...item, is_available: !currentAvailability } : item
        )
        );
        message.success(`Availability for item ID ${itemId} updated!`);
        setLoading(false);
    }, 300);
  };
  const normFile = (e) => { /* ... (same as before) ... */
    if (Array.isArray(e)) return e;
    return e && e.fileList;
  };

  const columns = [
    // ... (Avatar, Name, Category, Price columns same as before) ...
    { title: 'Image', dataIndex: 'image_url', key: 'image_url', width: 80, render: (url) => <Avatar shape="square" size={48} src={url || 'https://via.placeholder.com/48?text=N/A'} /> },
    { title: 'Name', dataIndex: 'name', key: 'name', sorter: (a,b) => a.name.localeCompare(b.name), render: (text, record) => (
        <>
            {text}
            {(record.variants?.length > 0 || record.modifierGroups?.length > 0) &&
                <Tooltip title="Has Variants/Modifiers">
                    <TagsOutlined style={{ marginLeft: 8, color: accentColor }} />
                </Tooltip>
            }
        </>
    )},
    { title: 'Category', dataIndex: 'category', key: 'category', width: 150, filters: mockCategories.map(c => ({text:c, value:c})), onFilter: (value, record) => record.category.includes(value) },
    { title: 'Base Price', dataIndex: 'price', key: 'price', width: 100, sorter: (a,b) => a.price - b.price, render: price => `$${price?.toFixed(2)}` }, // Clarified "Base Price"
    { title: 'Veg/Non-Veg', dataIndex: 'is_veg', key: 'is_veg', width: 120, render: is_veg => <Tag color={is_veg ? 'green' : 'red'}>{is_veg ? 'Veg' : 'Non-Veg'}</Tag>, filters: [{text:'Veg', value:true}, {text:'Non-Veg', value:false}], onFilter: (value, record) => record.is_veg === value },
    { title: 'Prep Time (min)', dataIndex: 'prep_time', key: 'prep_time', width: 120, sorter: (a,b) => a.prep_time - b.prep_time, },
    { title: 'Available', dataIndex: 'is_available', key: 'is_available', width: 120, render: (is_available, record) => (<Switch checked={is_available} onChange={() => handleToggleAvailability(record.id, record.is_available)} checkedChildren="Yes" unCheckedChildren="No"/>), filters: [{text:'Available', value:true}, {text:'Unavailable', value:false}], onFilter: (value, record) => record.is_available === value},
    { title: 'Actions', key: 'actions', width: 180, fixed: 'right', render: (_, record) => (<Space size="small"><Button type="primary" ghost icon={<EditOutlined />} onClick={() => handleOpenModal(record)} size="small">Edit</Button><Popconfirm title="Delete this item?" onConfirm={() => handleDeleteItem(record.id)} okText="Yes" cancelText="No"><Button danger icon={<DeleteOutlined />} size="small">Delete</Button></Popconfirm></Space>)},
  ];

  return (
    <Card bordered={false}>
      {/* ... (Header Row with Title and Add Button same as before) ... */}
      <Row justify="space-between" align="middle" style={{ marginBottom: 24 }}>
        <Col> <Title level={3} style={{ margin: 0 }}>Menu Item Management</Title> </Col>
        <Col> <Button type="primary" icon={<PlusOutlined />} onClick={() => handleOpenModal()}> Add New Menu Item </Button> </Col>
      </Row>
      {/* ... (Filter Row same as before) ... */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} md={8} lg={6}> <Input.Search placeholder="Search by item name..." allowClear onSearch={setSearchTerm} onChange={e => setSearchTerm(e.target.value)} /> </Col>
        <Col xs={12} md={6} lg={4}> <Select placeholder="Filter by Category" value={categoryFilter} onChange={setCategoryFilter} allowClear style={{ width: '100%' }} suffixIcon={<FilterOutlined />}> {mockCategories.map(cat => <Option key={cat} value={cat}>{cat}</Option>)} </Select> </Col>
        <Col xs={12} md={6} lg={4}> <Select placeholder="Filter by Availability" value={availabilityFilter} onChange={setAvailabilityFilter} allowClear style={{ width: '100%' }} suffixIcon={<FilterOutlined />}> <Option value={true}>Available</Option> <Option value={false}>Unavailable</Option> </Select> </Col>
      </Row>

      {loading && !isModalOpen ? <div style={{textAlign:'center', padding: '50px'}}><Spin size="large" tip="Loading menu..."/></div> :
        <Table columns={columns} dataSource={filteredMenuItems} rowKey="id" pagination={{ pageSize: 10 }} scroll={{ x: 1200 }} loading={loading && isModalOpen} size="middle"/>
      }

      <Modal
        title={<Title level={4} style={{margin:0}}>{editingItem ? `Edit: ${editingItem.name}` : 'Add New Menu Item'}</Title>}
        open={isModalOpen}
        onCancel={handleCancelModal}
        footer={null}
        width={800} // Increased width for more fields
        destroyOnClose
      >
        <Form form={form} layout="vertical" onFinish={handleFormSubmit} className="menu-item-modal-form">
          <Tabs defaultActiveKey="1">
            <Tabs.TabPane tab="Basic Info" key="1">
              {/* ... (Name, Category, Description, Price, Prep Time, Veg, Tags, Image, Availability - same as before) ... */}
              <Row gutter={16}>
                <Col span={12}><Form.Item name="name" label="Item Name" rules={[{ required: true }]}><Input /></Form.Item></Col>
                <Col span={12}><Form.Item name="category" label="Category" rules={[{ required: true }]}><Select>{mockCategories.map(cat => <Option key={cat} value={cat}>{cat}</Option>)}</Select></Form.Item></Col>
              </Row>
              <Form.Item name="description" label="Description"><Input.TextArea rows={2} /></Form.Item>
              <Row gutter={16}>
                <Col span={8}><Form.Item name="price" label="Base Price ($)" rules={[{ required: true, type: 'number', min: 0 }]}><InputNumber style={{ width: '100%' }} precision={2} /></Form.Item></Col>
                <Col span={8}><Form.Item name="prep_time" label="Prep Time (min)" rules={[{ type: 'number', min: 0}]}><InputNumber style={{ width: '100%' }} /></Form.Item></Col>
                <Col span={8}><Form.Item name="is_veg" label="Vegetarian?" valuePropName="checked"><Switch checkedChildren="Yes" unCheckedChildren="No" /></Form.Item></Col>
              </Row>
              <Form.Item name="tags" label="Tags"><Select mode="tags" style={{ width: '100%' }} tokenSeparators={[',']}>{mockTags.map(tag => <Option key={tag} value={tag}>{tag}</Option>)}</Select></Form.Item>
              <Form.Item name="image_url" label="Item Image" valuePropName="fileList" getValueFromEvent={normFile}><Upload name="logo" listType="picture" maxCount={1} beforeUpload={() => false}><Button icon={<UploadOutlined />}>Upload/Change</Button></Upload></Form.Item>
              <Form.Item name="is_available" label="Available?" valuePropName="checked" initialValue={true}><Switch checkedChildren="Yes" unCheckedChildren="No" /></Form.Item>
            </Tabs.TabPane>

            <Tabs.TabPane tab="Variants" key="2">
              <Paragraph type="secondary" style={{marginBottom: 10}}>Define different versions of this item, e.g., Small, Medium, Large, each with a price adjustment from the base price.</Paragraph>
              <Form.List name="variants">
                {(fields, { add, remove }) => (
                  <>
                    {fields.map(({ key, name, ...restField }) => (
                      <Space key={key} style={{ display: 'flex', marginBottom: 8 }} align="baseline">
                        <Form.Item {...restField} name={[name, 'name']} rules={[{ required: true, message: 'Variant name missing' }]} style={{width: '200px'}}>
                          <Input placeholder="Variant Name (e.g., Small)" />
                        </Form.Item>
                        <Form.Item {...restField} name={[name, 'priceModifier']} rules={[{ required: true, type: 'number', message: 'Price modifier missing' }]} initialValue={0}>
                          <InputNumber placeholder="Price Modifier" addonBefore="$" precision={2}/>
                        </Form.Item>
                        <Form.Item {...restField} name={[name, 'default']} valuePropName="checked" >
                            <Tooltip title="Is this the default variant?">
                                <Checkbox>Default</Checkbox>
                            </Tooltip>
                        </Form.Item>
                        <MinusCircleOutlined onClick={() => remove(name)} />
                      </Space>
                    ))}
                    <Form.Item> <Button type="dashed" onClick={() => add({priceModifier: 0, default: false})} block icon={<PlusOutlined />}> Add Variant </Button> </Form.Item>
                  </>
                )}
              </Form.List>
            </Tabs.TabPane>

            <Tabs.TabPane tab="Modifiers / Add-ons" key="3">
              <Paragraph type="secondary" style={{marginBottom: 10}}>Group related choices for customers, e.g., "Crust Type", "Extra Toppings".</Paragraph>
              <Form.List name="modifierGroups">
                {(groups, { add: addGroup, remove: removeGroup }) => (
                  <>
                    {groups.map(({ key: groupKey, name: groupName, ...restGroupField }) => (
                      <Card key={groupKey} size="small" title={`Modifier Group ${groupKey + 1}`} extra={<MinusCircleOutlined onClick={() => removeGroup(groupName)} />} style={{marginBottom: 16}}>
                        <Row gutter={16}>
                            <Col span={10}>
                                <Form.Item {...restGroupField} name={[groupName, 'groupName']} label="Group Name" rules={[{ required: true }]} >
                                    <Input placeholder="e.g., Toppings, Size" />
                                </Form.Item>
                            </Col>
                            <Col span={8}>
                                <Form.Item {...restGroupField} name={[groupName, 'selectionType']} label="Selection Type" rules={[{ required: true }]} initialValue="single">
                                    <Select>
                                        <Option value="single">Single Choice</Option>
                                        <Option value="multiple">Multiple Choices</Option>
                                    </Select>
                                </Form.Item>
                            </Col>
                            <Col span={6}>
                                <Form.Item {...restGroupField} name={[groupName, 'required']} label="Required?" valuePropName="checked" initialValue={false}>
                                    <Switch/>
                                </Form.Item>
                            </Col>
                        </Row>
                        <Divider orientation="left" plain><Text type="secondary">Modifiers within this group</Text></Divider>
                        <Form.List {...restGroupField} name={[groupName, 'modifiers']}>
                          {(modifiers, { add: addModifier, remove: removeModifier }) => (
                            <>
                              {modifiers.map(({ key: modKey, name: modName, ...restModField }) => (
                                <Space key={modKey} style={{ display: 'flex', marginBottom: 8 }} align="baseline">
                                  <Form.Item {...restModField} name={[modName, 'name']} rules={[{ required: true }]} style={{width: '200px'}}>
                                    <Input placeholder="Modifier Name (e.g., Extra Cheese)" />
                                  </Form.Item>
                                  <Form.Item {...restModField} name={[modName, 'priceChange']} rules={[{ required: true, type: 'number' }]} initialValue={0}>
                                    <InputNumber placeholder="Price Change" addonBefore="$" precision={2}/>
                                  </Form.Item>
                                  <MinusCircleOutlined onClick={() => removeModifier(modName)} />
                                </Space>
                              ))}
                              <Form.Item> <Button type="dashed" onClick={() => addModifier({priceChange: 0})} block icon={<PlusOutlined />}> Add Modifier Option </Button> </Form.Item>
                            </>
                          )}
                        </Form.List>
                      </Card>
                    ))}
                    <Form.Item> <Button type="dashed" onClick={() => addGroup({selectionType: 'single', required: false, modifiers: []})} block icon={<PlusOutlined />}> Add Modifier Group </Button> </Form.Item>
                  </>
                )}
              </Form.List>
            </Tabs.TabPane>
          </Tabs>
          <Divider/>
          <Form.Item style={{textAlign: 'right', marginTop: 20}}>
            <Button onClick={handleCancelModal} style={{ marginRight: 8 }}> Cancel </Button>
            <Button type="primary" htmlType="submit" loading={loading && isModalOpen}> {editingItem ? 'Save All Changes' : 'Add Item with Options'} </Button>
          </Form.Item>
        </Form>
      </Modal>
    </Card>
  );
};

export default AdminMenuManagementPage;