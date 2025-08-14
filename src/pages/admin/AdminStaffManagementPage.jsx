// src/pages/admin/AdminStaffManagementPage.jsx
import React, { useState, useEffect, useContext } from 'react';
import { Table, Button, Modal, Form, Input, Select, Switch, Tag, Space, Typography, Avatar, Card, Row, Col, message, Popconfirm, Spin } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, UserOutlined, SolutionOutlined, ShopOutlined, DesktopOutlined, FilterOutlined } from '@ant-design/icons';
import { ThemeContext } from '../../contexts/ThemeContext';
// import './AdminStaffManagement.css'; // Create this if needed

const { Title } = Typography;
const { Option } = Select;

const mockStaffData = [
  { id: 'S001', name: 'John Manager', email: 'john.manager@example.com', phone: '555-0101', role: 'manager', status: 'Active', avatarSeed: 'John' },
  { id: 'S002', name: 'Alice Chef', email: 'alice.chef@example.com', phone: '555-0102', role: 'chef', status: 'Active', avatarSeed: 'Alice' },
  { id: 'S003', name: 'Bob Waiter', email: 'bob.waiter@example.com', phone: '555-0103', role: 'waiter', status: 'Active', avatarSeed: 'Bob' },
  { id: 'S004', name: 'Carol Waiter', email: 'carol.waiter@example.com', phone: '555-0104', role: 'waiter', status: 'Inactive', avatarSeed: 'Carol' },
  { id: 'S005', name: 'David Chef', email: 'dave.chef@example.com', phone: '555-0105', role: 'chef', status: 'Active', avatarSeed: 'David' },
];

const staffRoles = [
    { value: 'manager', label: 'Manager', icon: <SolutionOutlined /> },
    { value: 'chef', label: 'Chef', icon: <ShopOutlined /> },
    { value: 'waiter', label: 'Waiter', icon: <DesktopOutlined /> },
    // Add other roles as needed (e.g., delivery_person)
];

const AdminStaffManagementPage = () => {
  const [staffList, setStaffList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingStaff, setEditingStaff] = useState(null);
  const [form] = Form.useForm();
  const { accentColor } = useContext(ThemeContext);

  // Filters
  const [roleFilter, setRoleFilter] = useState(null);
  const [statusFilter, setStatusFilter] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    setLoading(true);
    setTimeout(() => {
      setStaffList(mockStaffData);
      setLoading(false);
    }, 800);
  }, []);

  const filteredStaffList = staffList.filter(staff => {
    const matchesRole = roleFilter ? staff.role === roleFilter : true;
    const matchesStatus = statusFilter ? staff.status === statusFilter : true;
    const matchesSearch = searchTerm ? (
        staff.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        staff.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        staff.phone.includes(searchTerm)
    ) : true;
    return matchesRole && matchesStatus && matchesSearch;
  });

  const handleOpenModal = (staff = null) => {
    setEditingStaff(staff);
    form.setFieldsValue(staff ? staff : { status: 'Active', role: 'waiter' }); // Defaults
    setIsModalOpen(true);
  };

  const handleCancelModal = () => {
    setIsModalOpen(false);
    setEditingStaff(null);
    form.resetFields();
  };

  const handleFormSubmit = (values) => {
    setLoading(true);
    setTimeout(() => {
      if (editingStaff) {
        setStaffList(prevList =>
          prevList.map(s => (s.id === editingStaff.id ? { ...editingStaff, ...values } : s))
        );
        message.success(`Staff member "${values.name}" updated!`);
      } else {
        const newStaff = {
          id: `S${Date.now().toString().slice(-4)}`, // Mock ID
          ...values,
          avatarSeed: values.name.split(' ')[0] // Use first name for avatar
        };
        setStaffList(prevList => [newStaff, ...prevList]);
        message.success(`Staff member "${values.name}" added!`);
      }
      setLoading(false);
      handleCancelModal();
    }, 1000);
  };

  const handleDeleteStaff = (staffId) => {
    setLoading(true);
    setTimeout(() => {
      setStaffList(prevList => prevList.filter(s => s.id !== staffId));
      message.success('Staff member deleted!');
      setLoading(false);
    }, 500);
  };

  const handleToggleStatus = (staffId, currentStatus) => {
    setLoading(true);
    setTimeout(() => {
        setStaffList(prevList =>
        prevList.map(s =>
            s.id === staffId ? { ...s, status: currentStatus === 'Active' ? 'Inactive' : 'Active' } : s
        )
        );
        message.success(`Status for staff ID ${staffId} updated!`);
        setLoading(false);
    }, 300);
  };
  
  const getRoleIcon = (roleValue) => {
    const roleObj = staffRoles.find(r => r.value === roleValue);
    return roleObj ? roleObj.icon : <UserOutlined />;
  };

  const columns = [
    {
      title: 'Avatar',
      dataIndex: 'avatarSeed',
      key: 'avatar',
      width: 80,
      render: (seed, record) => <Avatar style={{ backgroundColor: accentColor }} icon={getRoleIcon(record.role)}>{seed ? seed[0].toUpperCase() : <UserOutlined />}</Avatar>,
    },
    { title: 'Name', dataIndex: 'name', key: 'name', sorter: (a,b) => a.name.localeCompare(b.name) },
    { title: 'Email', dataIndex: 'email', key: 'email' },
    { title: 'Phone', dataIndex: 'phone', key: 'phone' },
    { title: 'Role', dataIndex: 'role', key: 'role', width: 120, render: role => <Tag icon={getRoleIcon(role)} style={{textTransform: 'capitalize'}}>{role}</Tag>,
      filters: staffRoles.map(r => ({text:r.label, value:r.value})), onFilter: (value, record) => record.role === value },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      width: 120,
      render: (status, record) => (
        <Switch
          checked={status === 'Active'}
          onChange={() => handleToggleStatus(record.id, record.status)}
          checkedChildren="Active"
          unCheckedChildren="Inactive"
        />
      ),
      filters: [{text:'Active', value:'Active'}, {text:'Inactive', value:'Inactive'}], onFilter: (value, record) => record.status === value
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 180,
      fixed: 'right',
      render: (_, record) => (
        <Space size="small">
          <Button type="primary" ghost icon={<EditOutlined />} onClick={() => handleOpenModal(record)} size="small">Edit</Button>
          <Popconfirm
            title="Are you sure to delete this staff member?"
            onConfirm={() => handleDeleteStaff(record.id)}
            okText="Yes"
            cancelText="No"
          >
            <Button danger icon={<DeleteOutlined />} size="small">Delete</Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <Card bordered={false}>
      <Row justify="space-between" align="middle" style={{ marginBottom: 24 }}>
        <Col>
            <Title level={3} style={{ margin: 0 }}>Staff Management</Title>
        </Col>
        <Col>
            <Button type="primary" icon={<PlusOutlined />} onClick={() => handleOpenModal()}>
                Add New Staff
            </Button>
        </Col>
      </Row>
      <Row gutter={[16,16]} style={{marginBottom: 24}}>
        <Col xs={24} md={8} lg={6}>
            <Input.Search placeholder="Search by name, email, phone..." allowClear onSearch={setSearchTerm} onChange={e => setSearchTerm(e.target.value)} />
        </Col>
        <Col xs={12} md={6} lg={4}>
            <Select placeholder="Filter by Role" value={roleFilter} onChange={setRoleFilter} allowClear style={{width:'100%'}} suffixIcon={<FilterOutlined/>}>
                {staffRoles.map(r => <Option key={r.value} value={r.value}>{r.label}</Option>)}
            </Select>
        </Col>
        <Col xs={12} md={6} lg={4}>
            <Select placeholder="Filter by Status" value={statusFilter} onChange={setStatusFilter} allowClear style={{width:'100%'}} suffixIcon={<FilterOutlined/>}>
                <Option value="Active">Active</Option>
                <Option value="Inactive">Inactive</Option>
            </Select>
        </Col>
      </Row>

      {loading && !isModalOpen ? <div style={{textAlign:'center', padding: '50px'}}><Spin size="large" tip="Loading staff..."/></div> :
        <Table
            columns={columns}
            dataSource={filteredStaffList}
            rowKey="id"
            pagination={{ pageSize: 10 }}
            scroll={{ x: 1000 }}
            loading={loading && isModalOpen}
            size="middle"
        />
      }

      <Modal
        title={editingStaff ? `Edit Staff: ${editingStaff.name}` : 'Add New Staff Member'}
        open={isModalOpen}
        onCancel={handleCancelModal}
        footer={null}
        width={600}
        destroyOnClose
      >
        <Form form={form} layout="vertical" onFinish={handleFormSubmit}>
          <Form.Item name="name" label="Full Name" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="email" label="Email" rules={[{ required: true, type: 'email' }]}>
                <Input />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="phone" label="Phone Number" rules={[{ required: true }]}>
                <Input />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
                <Form.Item name="role" label="Role" rules={[{ required: true }]}>
                    <Select>
                    {staffRoles.map(r => <Option key={r.value} value={r.value}>{r.label}</Option>)}
                    </Select>
                </Form.Item>
            </Col>
            <Col span={12}>
                <Form.Item name="status" label="Status" valuePropName="checked" getValueFromEvent={v => v ? 'Active' : 'Inactive'} initialValue="Active">
                    <Switch checkedChildren="Active" unCheckedChildren="Inactive" defaultChecked/>
                </Form.Item>
            </Col>
          </Row>
          {/* Add password field for new staff, or 'reset password' for edit if needed */}
          <Form.Item style={{textAlign: 'right', marginTop: 20}}>
            <Button onClick={handleCancelModal} style={{ marginRight: 8 }}>Cancel</Button>
            <Button type="primary" htmlType="submit" loading={loading && isModalOpen}>
              {editingStaff ? 'Save Changes' : 'Add Staff'}
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </Card>
  );
};

export default AdminStaffManagementPage;