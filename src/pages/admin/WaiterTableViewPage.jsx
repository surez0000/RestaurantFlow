// src/pages/admin/WaiterTableViewPage.jsx
import React, { useState, useEffect, useContext } from 'react';
import { Row, Col, Card, Typography, Tag, Button, Popover, Spin, Modal, message, QRCode } from 'antd';
import { QrcodeOutlined, EyeOutlined, PlusCircleOutlined, UsergroupAddOutlined, EditOutlined } from '@ant-design/icons';
import { ThemeContext } from '../../contexts/ThemeContext';
import { useNavigate } from 'react-router-dom'; // For navigation
import './WaiterTableViewPage.css';

const { Title, Text, Paragraph } = Typography;

const mockTablesData = [
  { id: 'T1', number: '1', capacity: 4, status: 'Available', currentOrderId: null, customerCount: 0 },
  { id: 'T2', number: '2', capacity: 2, status: 'Occupied', currentOrderId: 'ORDW001', customerCount: 2, currentOrderValue: 45.50 },
  { id: 'T3', number: '3', capacity: 6, status: 'Reserved', reservedFor: 'Mr. Smith @ 7 PM', customerCount: 0 },
  { id: 'T4', number: '4', capacity: 4, status: 'Available', currentOrderId: null, customerCount: 0 },
  { id: 'T5', number: '5', capacity: 2, status: 'Needs Attention', currentOrderId: 'ORDW002', customerCount: 1, attentionReason: "Wants to pay bill" },
  { id: 'T6', number: '6', capacity: 8, status: 'Occupied', currentOrderId: 'ORDW003', customerCount: 5, currentOrderValue: 120.75 },
  { id: 'T7', number: '7', capacity: 4, status: 'Cleaning', currentOrderId: null, customerCount: 0 },
  { id: 'T8', number: '8', capacity: 2, status: 'Available', currentOrderId: null, customerCount: 0 },
];

const WaiterTableViewPage = () => {
  const [tables, setTables] = useState([]);
  const [loading, setLoading] = useState(true);
  const { accentColor, isDarkMode } = useContext(ThemeContext);
  const navigate = useNavigate();

  const [qrModalVisible, setQrModalVisible] = useState(false);
  const [selectedTableForQr, setSelectedTableForQr] = useState(null);

  useEffect(() => {
    // Simulate fetching table data
    setLoading(true);
    setTimeout(() => {
      setTables(mockTablesData);
      setLoading(false);
    }, 800);
  }, []);

  const getTableStatusColor = (status) => {
    switch (status) {
      case 'Available': return 'green';
      case 'Occupied': return accentColor;
      case 'Reserved': return 'gold';
      case 'Needs Attention': return 'red';
      case 'Cleaning': return 'purple';
      default: return 'default';
    }
  };
  
  const handleTableAction = (table, action) => {
    message.info(`Action: ${action} on Table ${table.number} (Not Implemented)`);
    if (action === 'Start Order' && table.status === 'Available') {
        // In a real app, you might navigate to an order taking page
        // For now, let's just update the table status for demo
        setTables(prevTables => prevTables.map(t => t.id === table.id ? {...t, status: 'Occupied', customerCount: 1, currentOrderId: `ORDW${Date.now().toString().slice(-3)}`} : t));
        message.success(`New order started for Table ${table.number}`);
    } else if (action === 'View/Add to Order') {
        navigate(`/admin/orders?table=${table.id}&orderId=${table.currentOrderId}`); // Conceptual navigation
    }
    // Close popover if any
  };

  const showQrCode = (table) => {
    setSelectedTableForQr(table);
    setQrModalVisible(true);
  };


  const TableCard = ({ table }) => {
    const popoverContent = (
      <div>
        {table.status === 'Available' && (
          <Button block type="primary" icon={<PlusCircleOutlined />} onClick={() => handleTableAction(table, 'Start Order')} style={{ marginBottom: 8 }}>
            Start New Order
          </Button>
        )}
        {table.status === 'Occupied' && (
          <>
            <Button block icon={<EyeOutlined />} onClick={() => handleTableAction(table, 'View/Add to Order')} style={{ marginBottom: 8 }}>
              View/Add to Order
            </Button>
            <Button block danger onClick={() => handleTableAction(table, 'Process Payment')} style={{ marginBottom: 8 }}>
              Process Payment
            </Button>
          </>
        )}
        {table.status === 'Reserved' && (
            <Button block icon={<UsergroupAddOutlined />} onClick={() => handleTableAction(table, 'Seat Guests')}>
                Seat Guests
            </Button>
        )}
        {table.status === 'Needs Attention' && (
            <Button block type="dashed" danger onClick={() => handleTableAction(table, 'Resolve Issue')}>
                Mark as Resolved
            </Button>
        )}
         <Button block icon={<EditOutlined />} onClick={() => handleTableAction(table, 'Update Status')} style={{ marginTop: 8 }}>
          Update Table Status
        </Button>
      </div>
    );

    return (
      <Popover content={popoverContent} title={`Table ${table.number} Actions`} trigger="click" placement="right">
        <Card
          hoverable
          className={`table-card table-status-${table.status.toLowerCase().replace(' ', '-')}`}
          style={{ borderColor: getTableStatusColor(table.status) }}
        >
          <div className="table-card-header">
            <Title level={4} className="table-number">T{table.number}</Title>
            <Tag color={getTableStatusColor(table.status)} className="table-status-tag">
              {table.status}
            </Tag>
          </div>
          <div className="table-card-body">
            <Text>Capacity: {table.capacity}</Text>
            {table.status === 'Occupied' && <Text>Guests: {table.customerCount}</Text>}
            {table.status === 'Occupied' && table.currentOrderValue && <Text>Bill: ${table.currentOrderValue.toFixed(2)}</Text>}
            {table.status === 'Reserved' && <Text type="secondary" ellipsis>{table.reservedFor}</Text>}
            {table.status === 'Needs Attention' && <Text type="danger" ellipsis>{table.attentionReason}</Text>}
          </div>
          <div className="table-card-footer">
            <Button type="text" icon={<QrcodeOutlined />} onClick={(e) => { e.stopPropagation(); showQrCode(table); }}>
              QR Order
            </Button>
          </div>
        </Card>
      </Popover>
    );
  };

  if (loading) {
    return <div style={{ textAlign: 'center', padding: '50px' }}><Spin size="large" tip="Loading Tables..." /></div>;
  }

  return (
    <div className="waiter-table-view-page">
      <Title level={2} style={{ marginBottom: '24px' }}>Restaurant Table View</Title>
      <Row gutter={[16, 16]}>
        {tables.map(table => (
          <Col xs={24} sm={12} md={8} lg={6} xl={4} key={table.id}>
            <TableCard table={table} />
          </Col>
        ))}
      </Row>
      {selectedTableForQr && (
        <Modal
            title={`QR Code for Table ${selectedTableForQr.number}`}
            open={qrModalVisible}
            onCancel={() => setQrModalVisible(false)}
            footer={null}
            centered
        >
            <div style={{textAlign: 'center', padding: '20px'}}>
                <QRCode 
                    value={`${window.location.origin}/customer/menu?table=${selectedTableForQr.id}`} // Example URL
                    size={200}
                    bgColor={isDarkMode ? '#333' : '#fff'}
                    fgColor={isDarkMode ? '#fff' : '#000'}
                />
                <Paragraph style={{marginTop: '15px'}}>
                    Scan this QR code to view the menu and order for Table {selectedTableForQr.number}.
                </Paragraph>
                <Text copyable={{text: `${window.location.origin}/customer/menu?table=${selectedTableForQr.id}`}}>
                    Order Link
                </Text>
            </div>
        </Modal>
      )}
    </div>
  );
};

export default WaiterTableViewPage;