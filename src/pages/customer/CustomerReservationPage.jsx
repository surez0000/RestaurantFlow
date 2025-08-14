// src/pages/customer/CustomerReservationPage.jsx
import React, { useState, useContext } from 'react';
import { Form, Input, InputNumber, DatePicker, TimePicker, Button, Typography, Card, Row, Col, Select, message, Spin } from 'antd';
import { CalendarOutlined, UserOutlined, MessageOutlined } from '@ant-design/icons';
import { ThemeContext } from '../../contexts/ThemeContext';
import dayjs from 'dayjs';
// import './CustomerReservationPage.css'; // Create if needed

const { Title, Paragraph } = Typography;
const { Option } = Select;

const CustomerReservationPage = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const { accentColor } = useContext(ThemeContext);

  const onFinish = (values) => {
    setLoading(true);
    message.loading({ content: 'Submitting your reservation request...', key: 'resSubmit' });
    // Simulate API call
    setTimeout(() => {
      console.log('Reservation Request Submitted:', {
        ...values,
        date: values.date.format('YYYY-MM-DD'),
        time: values.time.format('HH:mm'),
      });
      message.success({ content: 'Reservation request submitted! We will confirm shortly.', key: 'resSubmit', duration: 4 });
      form.resetFields();
      setLoading(false);
    }, 2000);
  };

  // Disable past dates and current date if time is past
  const disabledDate = (current) => {
    return current && current < dayjs().startOf('day');
  };
  
  // Example: restaurant operating hours 10 AM to 10 PM
  const disabledTime = () => ({
    disabledHours: () => [...Array(24).keys()].filter(h => h < 10 || h >= 22),
    // disabledMinutes: (selectedHour) => [],
    // disabledSeconds: (selectedHour, selectedMinute) => [],
  });

  return (
    <div className="customer-reservation-page" style={{ padding: '20px', maxWidth: '700px', margin: 'auto' }}>
      <Card>
        <Title level={2} style={{ textAlign: 'center', color: accentColor }}>Book Your Table</Title>
        <Paragraph style={{ textAlign: 'center', marginBottom: 30 }}>
          We'd love to host you! Please fill out the form below to request a reservation.
        </Paragraph>
        <Form
          form={form}
          layout="vertical"
          onFinish={onFinish}
          initialValues={{ partySize: 2 }}
        >
          <Row gutter={16}>
            <Col xs={24} sm={12}>
              <Form.Item name="name" label="Full Name" rules={[{ required: true, message: 'Please enter your name' }]}>
                <Input prefix={<UserOutlined />} placeholder="E.g., John Doe" />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item name="phone" label="Phone Number" rules={[{ required: true, message: 'Please enter your phone number' }]}>
                <Input placeholder="For confirmation" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col xs={24} sm={12}>
              <Form.Item name="date" label="Date" rules={[{ required: true, message: 'Please select a date' }]}>
                <DatePicker style={{ width: '100%' }} disabledDate={disabledDate} format="DD-MM-YYYY"/>
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item name="time" label="Time" rules={[{ required: true, message: 'Please select a time' }]}>
                <TimePicker style={{ width: '100%' }} format="HH:mm" minuteStep={15} disabledTime={disabledTime} />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item name="partySize" label="Number of Guests" rules={[{ required: true, type: 'number', min: 1, max: 20, message: 'Please enter number of guests (1-20)' }]}>
            <InputNumber style={{ width: '100%' }} placeholder="e.g., 4" />
          </Form.Item>

          <Form.Item name="specialRequests" label="Special Requests (Optional)">
            <Input.TextArea rows={3} placeholder="E.g., Window seat, allergies, birthday celebration" />
          </Form.Item>

          <Form.Item style={{ textAlign: 'center', marginTop: 20 }}>
            <Button type="primary" htmlType="submit" loading={loading} size="large" icon={<CalendarOutlined />}>
              Request Reservation
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
};

export default CustomerReservationPage;