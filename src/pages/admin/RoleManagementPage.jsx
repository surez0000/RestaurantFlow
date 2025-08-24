import React, { useState, useContext } from 'react';
import { 
  Card, Table, Button, Modal, Form, Input, Select, Checkbox, 
  Space, Typography, Tag, Popconfirm, message, Tabs, 
  Row, Col, Divider, Alert, Badge, Tooltip 
} from 'antd';
import { 
  PlusOutlined, EditOutlined, DeleteOutlined, UserOutlined, 
  SafetyOutlined, SettingOutlined, CopyOutlined 
} from '@ant-design/icons';
import { useRole, PERMISSIONS, DEFAULT_ROLES } from '../../contexts/RoleContext';
import { ThemeContext } from '../contexts/ThemeContext';

const { Title, Text, Paragraph } = Typography;
const { Option } = Select;
const { TabPane } = Tabs;

const RoleManagementPage = () => {
  const { 
    roles, 
    createRole, 
    updateRole, 
    deleteRole, 
    getAllPermissions,
    userRoleAssignments 
  } = useRole();
  const { accentColor } = useContext(ThemeContext);
  
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingRole, setEditingRole] = useState(null);
  const [form] = Form.useForm();
  const [selectedPermissions, setSelectedPermissions] = useState([]);

  const allPermissions = getAllPermissions();
  const rolesList = Object.values(roles);

  // Group permissions by category
  const permissionsByCategory = allPermissions.reduce((acc, permission) => {
    if (!acc[permission.category]) {
      acc[permission.category] = [];
    }
    acc[permission.category].push(permission);
    return acc;
  }, {});

  const handleCreateRole = () => {
    setEditingRole(null);
    form.resetFields();
    setSelectedPermissions([]);
    setIsModalVisible(true);
  };

  const handleEditRole = (role) => {
    if (role.isSystemRole) {
      message.warning('System roles cannot be modified');
      return;
    }
    setEditingRole(role);
    form.setFieldsValue({
      name: role.name,
      description: role.description,
      locations: role.locations || ['all']
    });
    setSelectedPermissions(role.permissions || []);
    setIsModalVisible(true);
  };

  const handleCloneRole = (role) => {
    setEditingRole(null);
    form.setFieldsValue({
      name: `${role.name} (Copy)`,
      description: `Copy of ${role.description}`,
      locations: role.locations || ['all']
    });
    setSelectedPermissions(role.permissions || []);
    setIsModalVisible(true);
  };

  const handleDeleteRole = (roleId) => {
    try {
      deleteRole(roleId);
      message.success('Role deleted successfully');
    } catch (error) {
      message.error(error.message);
    }
  };

  const handleSubmit = (values) => {
    try {
      const roleData = {
        ...values,
        permissions: selectedPermissions,
      };

      if (editingRole) {
        updateRole(editingRole.id, roleData);
        message.success('Role updated successfully');
      } else {
        createRole(roleData);
        message.success('Role created successfully');
      }

      setIsModalVisible(false);
      form.resetFields();
      setSelectedPermissions([]);
    } catch (error) {
      message.error(error.message);
    }
  };

  const handlePermissionChange = (categoryPermissions, checked) => {
    if (checked) {
      setSelectedPermissions(prev => [...new Set([...prev, ...categoryPermissions])]);
    } else {
      setSelectedPermissions(prev => prev.filter(p => !categoryPermissions.includes(p)));
    }
  };

  const handleIndividualPermissionChange = (permission, checked) => {
    if (checked) {
      setSelectedPermissions(prev => [...prev, permission]);
    } else {
      setSelectedPermissions(prev => prev.filter(p => p !== permission));
    }
  };

  const getUserCount = (roleId) => {
    return Object.values(userRoleAssignments).filter(assignments =>
      assignments.some(assignment => assignment.roleId === roleId)
    ).length;
  };

  const columns = [
    {
      title: 'Role Name',
      dataIndex: 'name',
      key: 'name',
      render: (text, record) => (
        <Space>
          <SafetyOutlined style={{ color: record.isSystemRole ? accentColor : '#52c41a' }} />
          <div>
            <Text strong>{text}</Text>
            {record.isSystemRole && <Tag color="blue" size="small" style={{ marginLeft: 8 }}>System</Tag>}
            <br />
            <Text type="secondary" style={{ fontSize: '12px' }}>{record.description}</Text>
          </div>
        </Space>
      ),
    },
    {
      title: 'Permissions',
      dataIndex: 'permissions',
      key: 'permissions',
      render: (permissions) => (
        <div>
          <Badge count={permissions?.length || 0} style={{ backgroundColor: accentColor }} />
          <Text style={{ marginLeft: 8 }}>permissions</Text>
        </div>
      ),
    },
    {
      title: 'Users Assigned',
      key: 'userCount',
      render: (_, record) => (
        <Badge count={getUserCount(record.id)} style={{ backgroundColor: '#52c41a' }} />
      ),
    },
    {
      title: 'Location Access',
      dataIndex: 'locations',
      key: 'locations',
      render: (locations) => (
        <Tag color={locations?.includes('all') ? 'green' : 'blue'}>
          {locations?.includes('all') ? 'All Locations' : `${locations?.length || 0} Locations`}
        </Tag>
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Space size="small">
          <Tooltip title="Edit Role">
            <Button 
              type="primary" 
              ghost 
              icon={<EditOutlined />} 
              size="small"
              onClick={() => handleEditRole(record)}
              disabled={record.isSystemRole}
            />
          </Tooltip>
          <Tooltip title="Clone Role">
            <Button 
              icon={<CopyOutlined />} 
              size="small"
              onClick={() => handleCloneRole(record)}
            />
          </Tooltip>
          {!record.isSystemRole && (
            <Popconfirm
              title="Delete this role?"
              description="This action cannot be undone. Users with this role will lose access."
              onConfirm={() => handleDeleteRole(record.id)}
              okText="Yes"
              cancelText="No"
            >
              <Button danger icon={<DeleteOutlined />} size="small" />
            </Popconfirm>
          )}
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: '20px' }}>
      <Row justify="space-between" align="middle" style={{ marginBottom: 24 }}>
        <Col>
          <Title level={2} style={{ margin: 0 }}>
            <SafetyOutlined style={{ marginRight: 8, color: accentColor }} />
            Role & Permission Management
          </Title>
          <Paragraph type="secondary">
            Manage user roles and permissions across your restaurant operations
          </Paragraph>
        </Col>
        <Col>
          <Button type="primary" icon={<PlusOutlined />} onClick={handleCreateRole}>
            Create Custom Role
          </Button>
        </Col>
      </Row>

      <Tabs defaultActiveKey="roles">
        <TabPane tab="Roles Overview" key="roles">
          <Card>
            <Table
              columns={columns}
              dataSource={rolesList}
              rowKey="id"
              pagination={{ pageSize: 10 }}
              size="middle"
            />
          </Card>
        </TabPane>

        <TabPane tab="Permission Matrix" key="permissions">
          <Card title="System Permissions Overview">
            <Row gutter={[16, 16]}>
              {Object.entries(permissionsByCategory).map(([category, permissions]) => (
                <Col xs={24} md={12} lg={8} key={category}>
                  <Card size="small" title={category.replace(/_/g, ' ')}>
                    <Space direction="vertical" size="small" style={{ width: '100%' }}>
                      {permissions.map(permission => (
                        <div key={permission.id}>
                          <Text style={{ fontSize: '12px' }}>{permission.name}</Text>
                        </div>
                      ))}
                    </Space>
                  </Card>
                </Col>
              ))}
            </Row>
          </Card>
        </TabPane>

        <TabPane tab="System Roles" key="system-roles">
          <Card title="Predefined System Roles">
            <Alert
              message="System Role Information"
              description="These are predefined roles that cannot be modified but can be cloned to create custom variations."
              type="info"
              style={{ marginBottom: 16 }}
            />
            <Row gutter={[16, 16]}>
              {Object.values(DEFAULT_ROLES).filter(role => role.isSystemRole).map(role => (
                <Col xs={24} md={12} lg={8} key={role.id}>
                  <Card 
                    size="small" 
                    title={role.name}
                    extra={<Tag color="blue">System</Tag>}
                    actions={[
                      <Button 
                        type="link" 
                        icon={<CopyOutlined />} 
                        onClick={() => handleCloneRole(role)}
                      >
                        Clone
                      </Button>
                    ]}
                  >
                    <Paragraph style={{ fontSize: '13px', marginBottom: 8 }}>
                      {role.description}
                    </Paragraph>
                    <div>
                      <Badge count={role.permissions.length} style={{ backgroundColor: accentColor }} />
                      <Text style={{ marginLeft: 8, fontSize: '12px' }}>permissions</Text>
                    </div>
                  </Card>
                </Col>
              ))}
            </Row>
          </Card>
        </TabPane>
      </Tabs>

      {/* Create/Edit Role Modal */}
      <Modal
        title={editingRole ? `Edit Role: ${editingRole.name}` : 'Create New Role'}
        open={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        footer={null}
        width={800}
        destroyOnClose
      >
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="name" label="Role Name" rules={[{ required: true }]}>
                <Input placeholder="e.g., Kitchen Supervisor" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="locations" label="Location Access" initialValue={['all']}>
                <Select mode="multiple" placeholder="Select locations">
                  <Option value="all">All Locations</Option>
                  <Option value="location1">Main Branch</Option>
                  <Option value="location2">Downtown Branch</Option>
                  <Option value="location3">Mall Branch</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Form.Item name="description" label="Description">
            <Input.TextArea rows={2} placeholder="Brief description of this role's responsibilities" />
          </Form.Item>

          <Divider>Permissions</Divider>
          
          <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
            {Object.entries(permissionsByCategory).map(([category, permissions]) => {
              const categoryPermissions = permissions.map(p => p.id);
              const isAllSelected = categoryPermissions.every(p => selectedPermissions.includes(p));
              const isIndeterminate = categoryPermissions.some(p => selectedPermissions.includes(p)) && !isAllSelected;

              return (
                <Card key={category} size="small" style={{ marginBottom: 16 }}>
                  <div style={{ marginBottom: 12 }}>
                    <Checkbox
                      indeterminate={isIndeterminate}
                      checked={isAllSelected}
                      onChange={(e) => handlePermissionChange(categoryPermissions, e.target.checked)}
                    >
                      <Text strong>{category.replace(/_/g, ' ')}</Text>
                    </Checkbox>
                  </div>
                  <Row gutter={[8, 8]}>
                    {permissions.map(permission => (
                      <Col span={12} key={permission.id}>
                        <Checkbox
                          checked={selectedPermissions.includes(permission.id)}
                          onChange={(e) => handleIndividualPermissionChange(permission.id, e.target.checked)}
                        >
                          <Text style={{ fontSize: '12px' }}>{permission.name}</Text>
                        </Checkbox>
                      </Col>
                    ))}
                  </Row>
                </Card>
              );
            })}
          </div>

          <Form.Item style={{ textAlign: 'right', marginTop: 24 }}>
            <Space>
              <Button onClick={() => setIsModalVisible(false)}>Cancel</Button>
              <Button type="primary" htmlType="submit">
                {editingRole ? 'Update Role' : 'Create Role'}
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default RoleManagementPage;