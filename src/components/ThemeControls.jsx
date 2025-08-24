import React, { useContext, useState } from 'react';
import { Switch, Button, Popover, Space, Typography, Row, Col, Tooltip } from 'antd';
import { BgColorsOutlined, SunOutlined, MoonOutlined } from '@ant-design/icons';
import { ThemeContext, PREDEFINED_COLORS } from '../contexts/ThemeContext';

const { Text } = Typography;

const ThemeControls = ({ style = {} }) => {
  const { isDarkMode, toggleTheme, accentColor, setAccentColor } = useContext(ThemeContext);
  const [colorPickerVisible, setColorPickerVisible] = useState(false);

  const ColorPicker = () => (
    <div style={{ padding: '12px', width: '280px' }}>
      <Text strong style={{ display: 'block', marginBottom: '12px' }}>
        Choose Accent Color
      </Text>
      <Row gutter={[8, 8]}>
        {PREDEFINED_COLORS.map((color) => (
          <Col span={12} key={color.value}>
            <Tooltip title={color.description}>
              <Button
                style={{
                  width: '100%',
                  height: '40px',
                  backgroundColor: color.value,
                  borderColor: accentColor === color.value ? '#fff' : color.value,
                  borderWidth: accentColor === color.value ? '3px' : '1px',
                  borderStyle: 'solid',
                  color: '#fff',
                  fontWeight: accentColor === color.value ? 'bold' : 'normal',
                  boxShadow: accentColor === color.value ? '0 0 0 2px rgba(255,255,255,0.3)' : 'none',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'all 0.3s ease'
                }}
                onClick={() => {
                  setAccentColor(color.value);
                  setColorPickerVisible(false);
                }}
                onMouseEnter={(e) => {
                  if (accentColor !== color.value) {
                    e.target.style.transform = 'scale(1.05)';
                    e.target.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (accentColor !== color.value) {
                    e.target.style.transform = 'scale(1)';
                    e.target.style.boxShadow = 'none';
                  }
                }}
              >
                {color.name}
                {accentColor === color.value && (
                  <span style={{ marginLeft: '4px' }}>✓</span>
                )}
              </Button>
            </Tooltip>
          </Col>
        ))}
      </Row>
      <div style={{ marginTop: '12px', textAlign: 'center' }}>
        <Text type="secondary" style={{ fontSize: '12px' }}>
          Selected: {PREDEFINED_COLORS.find(c => c.value === accentColor)?.name || 'Custom'}
        </Text>
      </div>
    </div>
  );

  return (
    <Space size="middle" style={style}>
      {/* Theme Toggle */}
      <Tooltip title={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <SunOutlined 
            style={{ 
              color: isDarkMode ? '#666' : '#faad14',
              fontSize: '16px',
              transition: 'color 0.3s ease'
            }} 
          />
          <Switch
            checked={isDarkMode}
            onChange={toggleTheme}
            style={{
              backgroundColor: isDarkMode ? accentColor : '#f0f0f0',
            }}
            checkedChildren={<MoonOutlined style={{ fontSize: '12px' }} />}
            unCheckedChildren={<SunOutlined style={{ fontSize: '12px' }} />}
          />
          <MoonOutlined 
            style={{ 
              color: isDarkMode ? '#1890ff' : '#666',
              fontSize: '16px',
              transition: 'color 0.3s ease'
            }} 
          />
        </div>
      </Tooltip>

      {/* Color Picker */}
      <Popover
        content={<ColorPicker />}
        title={null}
        trigger="click"
        open={colorPickerVisible}
        onOpenChange={setColorPickerVisible}
        placement="bottomRight"
        overlayStyle={{ zIndex: 1050 }}
      >
        <Tooltip title="Change Accent Color">
          <Button
            icon={<BgColorsOutlined />}
            style={{
              backgroundColor: accentColor,
              borderColor: accentColor,
              color: '#fff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.3s ease'
            }}
            onMouseEnter={(e) => {
              e.target.style.transform = 'scale(1.05)';
              e.target.style.boxShadow = `0 4px 12px ${accentColor}40`;
            }}
            onMouseLeave={(e) => {
              e.target.style.transform = 'scale(1)';
              e.target.style.boxShadow = 'none';
            }}
          />
        </Tooltip>
      </Popover>
    </Space>
  );
};

export default ThemeControls;