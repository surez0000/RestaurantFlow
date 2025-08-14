// src/pages/admin/AdminReservationManagementPage.jsx
import React, { useState, useEffect, useContext } from 'react';
import { Table, Button, Tag, Space, Typography, Modal, Descriptions, message, Select, DatePicker, Row, Col, Card, Input, Spin } from 'antd';
import { CheckCircleOutlined, CloseCircleOutlined, EyeOutlined, FilterOutlined, ReloadOutlined } from '@ant-design/icons';
import { ThemeContext } from '../../contexts/ThemeContext';
import dayjs from 'dayjs';
// import './AdminReservationManagement.css'; // Create if needed

const { Title, Text } = Typography;
const { Option } = Select;
const { RangePicker } = DatePicker;

const mockReservations = [
  { id: 'RES001', name: 'Jane Doe', phone: '555-0201', date: '2024-03-20T19:00:00Z', partySize: 4, status: 'Pending', specialRequests: 'Window seat if possible.', submittedAt: '2024-03-18T10:00:00Z' },
  { id: 'RES002', name: 'Mike Ross', phone: '555-0202', date: '2024-03-20T20:30:00Z', partySize: 2, status: 'Confirmed', specialRequests: 'Celebrating anniversary.', submittedAt: '2024-03-17T15:20:00Z' },
  { id: 'RES003', name: 'Lisa Cuddy', phone: '555-0203', date: '2024-03-21T18:00:00Z', partySize: 6, status: 'Pending', specialRequests: '', submittedAt: '2024-03-19T09:30:00Z' },
  { id: 'RES004', name: 'Harvey Specter', phone: '555-0204', date: '2024-03-19T19:00:00Z', partySize: 3, status: 'Declined', reasonDecline: 'Fully booked.', submittedAt: '2024-03-16T11:00:00Z' },
  { id: 'RES005', name: 'Rachel Zane', phone: '555-0205', date: '2024-03-22T12:30:00Z', partySize: 2, status: 'Pending', specialRequests: 'Quiet table.', submittedAt: '2024-03-19T14:15:00Z' },
];

const reservationStatusOptions = ['Pending', 'Confirmed', 'Declined', 'Completed', 'No Show'];

const AdminReservationManagementPage = () => {
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedReservation, setSelectedReservation] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const { accentColor } = useContext(ThemeContext);

  // Filters
  const [statusFilter, setStatusFilter] = useState(null);
  const [dateFilter, setDateFilter] = useState(null); // Single date for reservations on that day
  const [searchTerm, setSearchTerm] = useState('');


  const fetchReservations = () => {
    setLoading(true);
    setTimeout(() => {
      setReservations(mockReservations.sort((a,b) => new Date(b.submittedAt) - new Date(a.submittedAt))); // Sort by newest submission
      setLoading(false);
    }, 800);
  }

  useEffect(() => {
    fetchReservations();
  }, []);

  const filteredReservations = reservations.filter(res => {
    const reservationDate = dayjs(res.date);
    const matchesStatus = statusFilter ? res.status === statusFilter : true;
    const matchesDate = dateFilter ? reservationDate.isSame(dateFilter, 'day') : true;
    const matchesSearch = searchTerm ? (
        res.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        res.phone.includes(searchTerm) ||
        res.id.toLowerCase().includes(searchTerm.toLowerCase())
    ) : true;
    return matchesStatus && matchesDate && matchesSearch;
  });

  const handleViewDetails = (reservation) => {
    setSelectedReservation(reservation);
    setIsModalVisible(true);
  };

  const handleUpdateStatus = (reservationId, newStatus) => {
    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      setReservations(prev =>
        prev.map(res => (res.id === reservationId ? { ...res, status: newStatus } : res))
      );
      message.success(`Reservation ${reservationId} status updated to ${newStatus}!`);
      setLoading(false);
      if (isModalVisible && selectedReservation?.id === reservationId) {
          setSelectedReservation(prev => ({...prev, status: newStatus}));
      }
    }, 500);
  };


  const getStatusTagColor = (status) => {
    if (status === 'Pending') return 'gold';
    if (status === 'Confirmed') return 'success';
    if (status === 'Declined') return 'error';
    if (status === 'Completed') return 'blue';
    if (status === 'No Show') return 'purple';
    return 'default';
  };

  const columns = [
    { title: 'ID', dataIndex: 'id', key: 'id', sorter: (a,b) => a.id.localeCompare(b.id), width: 100 },
    { title: 'Guest Name', dataIndex: 'name', key: 'name', sorter: (a,b) => a.name.localeCompare(b.name) },
    { title: 'Phone', dataIndex: 'phone', key: 'phone' },
    { title: 'Date & Time', dataIndex: 'date', key: 'date', render: (date) => dayjs(date).format('DD MMM YYYY, HH:mm'), sorter: (a,b) => dayjs(a.date).unix() - dayjs(b.date).unix(), width: 180 },
    { title: 'Party Size', dataIndex: 'partySize', key: 'partySize', sorter: (a,b) => a.partySize - b.partySize, width: 100 },
    { title: 'Status', dataIndex: 'status', key: 'status', width: 120, render: status => <Tag color={getStatusTagColor(status)}>{status}</Tag>,
      filters: reservationStatusOptions.map(s => ({text:s, value:s})), onFilter: (value, record) => record.status === value },
    { title: 'Submitted At', dataIndex: 'submittedAt', key: 'submittedAt', render: (date) => dayjs(date).format('DD MMM, HH:mm'), sorter: (a,b) => dayjs(a.submittedAt).unix() - dayjs(b.submittedAt).unix(), width: 150 },
    {
      title: 'Actions',
      key: 'actions',
      width: 220,
      fixed: 'right',
      render: (_, record) => (
        <Space size="small">
          <Button icon={<EyeOutlined />} onClick={() => handleViewDetails(record)} size="small">View</Button>
          {record.status === 'Pending' && (
            <>
              <Button type="primary" ghost icon={<CheckCircleOutlined />} onClick={() => handleUpdateStatus(record.id, 'Confirmed')} size="small">Confirm</Button>
              <Button danger ghost icon={<CloseCircleOutlined />} onClick={() => handleUpdateStatus(record.id, 'Declined')} size="small">Decline</Button>
            </>
          )}
        </Space>
      ),
    },
  ];

  return (
    <Card bordered={false}>
      <Row justify="space-between" align="middle" style={{ marginBottom: 24 }}>
        <Col>
          <Title level={3} style={{ margin: 0 }}>Reservation Management</Title>
        </Col>
        <Col>
            <Button icon={<ReloadOutlined/>} onClick={fetchReservations} loading={loading}>Refresh</Button>
        </Col>
      </Row>
       <Row gutter={[16,16]} style={{marginBottom: 24}}>
        <Col xs={24} md={8} lg={6}>
            <Input.Search placeholder="Search by ID, Name, Phone..." allowClear onSearch={setSearchTerm} onChange={e => setSearchTerm(e.target.value)} />
        </Col>
        <Col xs={12} md={6} lg={4}>
            <Select placeholder="Filter by Status" value={statusFilter} onChange={setStatusFilter} allowClear style={{width:'100%'}} suffixIcon={<FilterOutlined/>}>
                {reservationStatusOptions.map(s => <Option key={s} value={s}>{s}</Option>)}
            </Select>
        </Col>
        <Col xs={12} md={6} lg={4}>
            <DatePicker placeholder="Filter by Reservation Date" value={dateFilter} onChange={setDateFilter} style={{width:'100%'}}/>
        </Col>
      </Row>

      {loading ? <div style={{textAlign:'center', padding: '50px'}}><Spin size="large" tip="Loading reservations..."/></div> :
        <Table
            columns={columns}
            dataSource={filteredReservations}
            rowKey="id"
            pagination={{ pageSize: 10 }}
            scroll={{ x: 1200 }}
            size="middle"
        />
      }

      <Modal
        title={`Reservation Details: ${selectedReservation?.id}`}
        open={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        footer={[
            <Button key="close" onClick={() => setIsModalVisible(false)}>Close</Button>,
            selectedReservation?.status === 'Pending' && <Button key="decline" danger onClick={() => handleUpdateStatus(selectedReservation.id, 'Declined')}>Decline</Button>,
            selectedReservation?.status === 'Pending' && <Button key="confirm" type="primary" onClick={() => handleUpdateStatus(selectedReservation.id, 'Confirmed')}>Confirm</Button>,
        ]}
        width={600}
      >
        {selectedReservation && (
          <Descriptions bordered column={1} size="small">
            <Descriptions.Item label="Guest Name">{selectedReservation.name}</Descriptions.Item>
            <Descriptions.Item label="Phone">{selectedReservation.phone}</Descriptions.Item>
            <Descriptions.Item label="Date & Time">{dayjs(selectedReservation.date).format('dddd, DD MMMM YYYY @ HH:mm A')}</Descriptions.Item>
            <Descriptions.Item label="Party Size">{selectedReservation.partySize}</Descriptions.Item>
            <Descriptions.Item label="Status"><Tag color={getStatusTagColor(selectedReservation.status)}>{selectedReservation.status}</Tag></Descriptions.Item>
            <Descriptions.Item label="Special Requests">{selectedReservation.specialRequests || 'None'}</Descriptions.Item>
            <Descriptions.Item label="Submitted At">{dayjs(selectedReservation.submittedAt).format('DD MMM YYYY, HH:mm')}</Descriptions.Item>
            {selectedReservation.status === 'Declined' && selectedReservation.reasonDecline && <Descriptions.Item label="Reason for Decline">{selectedReservation.reasonDecline}</Descriptions.Item>}
          </Descriptions>
        )}
      </Modal>
    </Card>
  );
};

export default AdminReservationManagementPage;