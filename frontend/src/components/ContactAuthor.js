/**
 * 联系作者组件
 * 展示作者信息和联系方式
 * Authors: hovi.hyw & AI
 * Date: 2025-03-18
 */

import React, { useState } from 'react';
import { Modal, Button, Typography, Image } from 'antd';
import { UserOutlined } from '@ant-design/icons';

const { Title, Paragraph } = Typography;

/**
 * 联系作者组件
 * @returns {JSX.Element} 联系作者组件
 */
const ContactAuthor = () => {
  const [isModalVisible, setIsModalVisible] = useState(false);

  const showModal = () => {
    setIsModalVisible(true);
  };

  const handleCancel = () => {
    setIsModalVisible(false);
  };

  return (
    <>
      <Button type="link" onClick={showModal} icon={<UserOutlined />}>
        联系作者
      </Button>
      <Modal 
        title="联系作者" 
        open={isModalVisible} 
        onCancel={handleCancel} 
        footer={null}
        width={600}
      >
        <div style={{ textAlign: 'center', marginBottom: '20px' }}>
          <Image
            src="/me.jpg"
            alt="作者照片"
            style={{ maxWidth: '100%', maxHeight: '300px' }}
            fallback="https://via.placeholder.com/300x300?text=作者照片"
          />
        </div>
        <Title level={4} style={{ textAlign: 'center' }}>hovi.hyw</Title>
        <Paragraph style={{ textAlign: 'center' }}>
          股票数据可视化系统是一个专业的金融数据分析平台，致力于为投资者提供全面、直观的市场数据和分析工具。
          如有问题或建议，请通过以下方式联系我。
        </Paragraph>
        <div style={{ textAlign: 'center', marginTop: '20px' }}>
          <Button type="primary" href="mailto:author@example.com">
            发送邮件
          </Button>
        </div>
      </Modal>
    </>
  );
};

export default ContactAuthor;