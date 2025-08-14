import React, { useContext } from 'react';
import { Row, Col, Card, Statistic, Typography, Table, Tag, Progress } from 'antd';
import { ArrowUpOutlined, ArrowDownOutlined, UserOutlined, ShoppingCartOutlined, DollarCircleOutlined, ExclamationCircleOutlined } from '@ant-design/icons';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { ThemeContext } from '../../contexts/ThemeContext';

const { Title, Text } = Typography;

const mockSalesData = [
  { name: 'Mon', sales: 4000, orders: 24, profit: 2400 },
  { name: 'Tue', sales: 3000, orders: 13, profit: 1800 },
  { name: 'Wed', sales: 2000, orders: 58, profit: 1300 },
  { name: 'Thu', sales: 2780, orders: 39, profit: 2000 },
  { name: 'Fri', sales: 1890, orders: 48, profit: 1100 },
  { name: 'Sat', sales: 6390, orders: 98, profit: 4500 },
  { name: 'Sun', sales: 5490, orders: 73, profit: 3490 },
];

const orderTypeData = [
  { name: 'Dine-in', value: 400 },
  { name: 'Takeaway', value: 300 },
  { name: 'Delivery', value: 200 },
];
const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

const recentOrdersData = [
    { id: 'ORD1023', customer: 'John Doe', total: 45.50, status: 'Preparing', type: 'Dine-in'},
    { id: 'ORD1022', customer: 'Jane Smith', total: 22.00, status: 'Ready for Pickup', type: 'Takeaway'},
    { id: 'ORD1021', customer: 'Mike Ross', total: 75.10, status: 'Out for Delivery', type: 'Delivery'},
    { id: 'ORD1020', customer: 'Harvey Specter', total: 120.00, status: 'Completed', type: 'Dine-in'},
];

const lowStockItems = [
    { name: 'Tomato Sauce', current: 5, unit: 'Liters', min: 10},
    { name: 'Pizza Dough Balls', current: 12, unit: 'Units', min: 20},
    { name: 'Chicken Breast', current: 2, unit: 'Kg', min: 5},
]

const AdminDashboard = () => {
  const { accentColor, isDarkMode } = useContext(ThemeContext);
  const chartTextColor = isDarkMode ? '#FFF' : '#666';

  const recentOrdersColumns = [
    { title: 'ID', dataIndex: 'id', key: 'id' },
    { title: 'Customer', dataIndex: 'customer', key: 'customer' },
    { title: 'Total', dataIndex: 'total', key: 'total', render: val => `$${val.toFixed(2)}`},
    { title: 'Type', dataIndex: 'type', key: 'type', render: type => <Tag color={type === 'Dine-in' ? 'blue' : type === 'Takeaway' ? 'orange' : 'purple'}>{type}</Tag>},
    { title: 'Status', dataIndex: 'status', key: 'status', render: status => <Tag color={status === 'Completed' ? 'green' : 'processing'}>{status}</Tag> },
  ];

  const lowStockColumns = [
    { title: 'Item', dataIndex: 'name', key: 'name' },
    { title: 'Current Stock', dataIndex: 'current', key: 'current', render: (text, record) => `${text} ${record.unit}` },
    { title: 'Min. Stock', dataIndex: 'min', key: 'min', render: (text, record) => `${text} ${record.unit}` },
    { title: 'Progress', key: 'progress', render: (_, record) => <Progress percent={Math.round((record.current/record.min)*100)} status={record.current/record.min < 0.3 ? "exception" : "normal"} size="small"/> }
  ]

  return (
    <div>
      <Title level={2} style={{ marginBottom: 24 }}>Manager Dashboard</Title>
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} md={6}>
          <Card bordered={false}>
            <Statistic
              title="Total Revenue (Today)"
              value={1128.93}
              precision={2}
              valueStyle={{ color: '#3f8600', fontSize: '1.8em' }}
              prefix={<DollarCircleOutlined />}
              suffix="USD"
            />
            <Text type="secondary"><ArrowUpOutlined style={{color: 'green'}} /> 12% vs yesterday</Text>
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card bordered={false}>
            <Statistic
              title="Total Orders (Today)"
              value={93}
              valueStyle={{ color: accentColor, fontSize: '1.8em' }}
              prefix={<ShoppingCartOutlined />}
            />
             <Text type="secondary"><ArrowDownOutlined style={{color: 'red'}}/> 5% vs yesterday</Text>
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card bordered={false}>
            <Statistic
              title="New Customers (Today)"
              value={12}
              valueStyle={{ color: '#108ee9', fontSize: '1.8em' }}
              prefix={<UserOutlined />}
            />
            <Text type="secondary"><ArrowUpOutlined style={{color: 'green'}}/> 3 new signups</Text>
          </Card>
        </Col>
         <Col xs={24} sm={12} md={6}>
          <Card bordered={false}>
            <Statistic
              title="Avg. Order Value"
              value={12.14}
              precision={2}
              valueStyle={{ color: '#eb2f96', fontSize: '1.8em' }}
              prefix={<DollarCircleOutlined />}
              suffix="USD"
            />
            <Text type="secondary">Consistent</Text>
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 24]} style={{ marginTop: 30 }}>
        <Col xs={24} lg={16}>
          <Card bordered={false}>
            <Title level={4}>Sales & Profit Overview (Last 7 Days)</Title>
            <ResponsiveContainer width="100%" height={300}>
                <BarChart data={mockSalesData} margin={{ top: 20, right: 0, left: -20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={isDarkMode ? "#555" : "#eee"} />
                <XAxis dataKey="name" tick={{ fill: chartTextColor }} />
                <YAxis yAxisId="left" orientation="left" stroke={accentColor} tick={{ fill: chartTextColor }} />
                <YAxis yAxisId="right" orientation="right" stroke="#82ca9d" tick={{ fill: chartTextColor }} />
                <Tooltip
                    contentStyle={{ backgroundColor: isDarkMode ? '#333' : '#fff', border: '1px solid #ccc' }}
                    itemStyle={{ color: isDarkMode ? '#fff' : '#000' }}
                />
                <Legend wrapperStyle={{ color: chartTextColor }} />
                <Bar yAxisId="left" dataKey="sales" fill={accentColor} name="Sales ($)" />
                <Bar yAxisId="right" dataKey="profit" fill="#82ca9d" name="Profit ($)" />
                </BarChart>
            </ResponsiveContainer>
          </Card>
        </Col>
        <Col xs={24} lg={8}>
          <Card bordered={false}>
            <Title level={4}>Order Types</Title>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie data={orderTypeData} cx="50%" cy="50%" labelLine={false} outerRadius={100} dataKey="value" nameKey="name" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                  {orderTypeData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: isDarkMode ? '#333' : '#fff' }}/>
                <Legend wrapperStyle={{ color: chartTextColor }} />
              </PieChart>
            </ResponsiveContainer>
          </Card>
        </Col>
      </Row>
      <Row gutter={[16,24]} style={{marginTop: 30}}>
        <Col xs={24} lg={12}>
            <Card title="Recent Orders" bordered={false}>
                <Table columns={recentOrdersColumns} dataSource={recentOrdersData} rowKey="id" pagination={{pageSize: 3}} size="small"/>
            </Card>
        </Col>
        <Col xs={24} lg={12}>
            <Card title={<><ExclamationCircleOutlined style={{color: 'red', marginRight: 8}}/>Low Stock Items</>} bordered={false}>
                 <Table columns={lowStockColumns} dataSource={lowStockItems} rowKey="name" pagination={{pageSize: 3}} size="small"/>
            </Card>
        </Col>
      </Row>
    </div>
  );
};

export default AdminDashboard;