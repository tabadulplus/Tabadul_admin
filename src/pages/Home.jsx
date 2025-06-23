import React, { useEffect, useState } from 'react';
import { db } from '../config/firebase';
import {
    collection,
    getDocs,
    orderBy,
    limit,
    query
} from 'firebase/firestore';
import {
    Card,
    Col,
    Row,
    Typography,
    List,
    Avatar,
    Tag,
    Button,
    Modal,
    Statistic,
    Space
} from 'antd';
import {
    FileTextOutlined,
    UserOutlined,
    AppstoreOutlined,
    TagOutlined
} from '@ant-design/icons';

// Upload forms
import UploadPost from '../components/UploadPost';
import UploadUser from '../components/UploadUser';
import UploadCategory from '../components/UploadCategory';
import UploadHashtag from '../components/UploadHashtag';

const { Title, Text } = Typography;

export default function Home() {
    const [posts, setPosts] = useState([]);
    const [users, setUsers] = useState([]);
    const [categories, setCategories] = useState([]);
    const [hashtags, setHashtags] = useState([]);
    const [modal, setModal] = useState({ type: null, visible: false });

    const openModal = type => setModal({ type, visible: true });
    const closeModal = () => setModal({ type: null, visible: false });

    useEffect(() => {
        const fetchData = async () => {
            const fetchCollection = async (colName, orderField = 'createdAt') => {
                const q = query(
                    collection(db, colName),
                    orderBy(orderField, 'desc'),
                    limit(5)
                );
                const snap = await getDocs(q);
                return snap.docs.map(d => ({ id: d.id, ...d.data() }));
            };

            const [postData, userData, categoryData] = await Promise.all([
                fetchCollection('posts'),
                fetchCollection('users'),
                fetchCollection('categories')
            ]);

            const hashtagsSnap = await getDocs(collection(db, 'Hashtags'));
            const rawTags =
                hashtagsSnap.docs[0]?.data()?.hashtags?.slice(0, 5) || [];

            setPosts(postData);
            setUsers(userData);
            setCategories(categoryData);
            setHashtags(rawTags);
        };

        fetchData();
    }, [modal.visible]);

    const renderModalContent = () => {
        switch (modal.type) {
            case 'post': return <UploadPost onSuccess={closeModal} />;
            case 'user': return <UploadUser onSuccess={closeModal} />;
            case 'category': return <UploadCategory onSuccess={closeModal} />;
            case 'hashtag': return <UploadHashtag onSuccess={closeModal} />;
            default: return null;
        }
    };

    const cardStyle = {
        borderRadius: 12,
        boxShadow: '0 4px 12px rgba(0,0,0,0.05)'
    };

    return (
        <div style={{ padding: 24, maxWidth: 1200, margin: '0 auto', background: '#f0f2f5' }}>
            <Title level={2} style={{ marginBottom: 32, textAlign: 'center' }}>
                📊 Admin Dashboard
            </Title>

            {/* Summary Stats */}
            <Row gutter={[24, 24]} style={{ marginBottom: 24 }}>
                {[
                    { icon: <FileTextOutlined style={{ fontSize: 32, color: '#1890ff' }} />, title: 'Total Posts', value: posts.length },
                    { icon: <UserOutlined style={{ fontSize: 32, color: '#52c41a' }} />, title: 'Total Users', value: users.length },
                    { icon: <AppstoreOutlined style={{ fontSize: 32, color: '#faad14' }} />, title: 'Categories', value: categories.length },
                    { icon: <TagOutlined style={{ fontSize: 32, color: '#eb2f96' }} />, title: 'Hashtags', value: hashtags.length },
                ].map((stat, idx) => (
                    <Col key={idx} xs={24} sm={12} md={12} lg={6}>
                        <Card hoverable style={cardStyle} bodyStyle={{ padding: 16 }}>
                            <Space align="center">
                                {stat.icon}
                                <Statistic
                                    title={stat.title}
                                    value={stat.value}
                                    valueStyle={{ fontSize: 24 }}
                                />
                            </Space>
                        </Card>
                    </Col>
                ))}
            </Row>

            {/* Detailed Lists */}
            <Row gutter={[24, 24]}>
                <Col xs={24} sm={24} md={12} lg={12}>
                    <Card
                        hoverable
                        style={cardStyle}
                        title={<Space><FileTextOutlined /><Text strong>Latest Posts</Text></Space>}
                        extra={<Button type="primary" onClick={() => openModal('post')}>Add Post</Button>}
                    >
                        <List
                            itemLayout="vertical"
                            dataSource={posts}
                            renderItem={post => (
                                <List.Item
                                    key={post.id}
                                    extra={
                                        post.imageUrls?.[0] && (
                                            <img
                                                width={80}
                                                height={80}
                                                src={post.imageUrls[0]}
                                                alt="post"
                                                style={{ borderRadius: 8, objectFit: 'cover' }}
                                            />
                                        )
                                    }
                                >
                                    <List.Item.Meta
                                        title={<Text strong>{post.title}</Text>}
                                        description={
                                            <Text type="secondary">
                                                {post.category} — {post.price} OMR
                                            </Text>
                                        }
                                    />
                                    <Text ellipsis={{ rows: 2 }}>{post.description}</Text>
                                </List.Item>
                            )}
                        />
                    </Card>
                </Col>

                <Col xs={24} sm={24} md={12} lg={12}>
                    <Card
                        hoverable
                        style={cardStyle}
                        title={<Space><UserOutlined /><Text strong>New Users</Text></Space>}
                        extra={<Button type="primary" onClick={() => openModal('user')}>Add User</Button>}
                    >
                        <List
                            itemLayout="horizontal"
                            dataSource={users}
                            renderItem={user => (
                                <List.Item key={user.uid}>
                                    <List.Item.Meta
                                        avatar={<Avatar size="large" src={user.profilePicture} icon={<UserOutlined />} />}
                                        title={<Text strong>{user.name}</Text>}
                                        description={<Text type="secondary">{user.email}</Text>}
                                    />
                                </List.Item>
                            )}
                        />
                    </Card>
                </Col>

                <Col xs={24} sm={24} md={12} lg={12}>
                    <Card
                        hoverable
                        style={cardStyle}
                        title={<Space><AppstoreOutlined /><Text strong>Categories</Text></Space>}
                        extra={<Button type="primary" onClick={() => openModal('category')}>Add Category</Button>}
                    >
                        <List
                            dataSource={categories}
                            renderItem={cat => (
                                <List.Item key={cat.id}>
                                    <List.Item.Meta
                                        title={<Text>{cat.name}</Text>}
                                        description={<Text type="secondary">Arabic: {cat.localName || 'N/A'}</Text>}
                                    />
                                </List.Item>
                            )}
                        />
                    </Card>
                </Col>

                <Col xs={24} sm={24} md={12} lg={12}>
                    <Card
                        hoverable
                        style={cardStyle}
                        title={<Space><TagOutlined /><Text strong>Trending Hashtags</Text></Space>}
                        extra={<Button type="primary" onClick={() => openModal('hashtag')}>Add Hashtag</Button>}
                    >
                        <List
                            grid={{ gutter: 16, xs: 2, sm: 2, md: 2, lg: 2 }}
                            dataSource={hashtags}
                            renderItem={tag => (
                                <List.Item key={tag.name}>
                                    <Space wrap>
                                        <Tag color={tag.isTrending ? 'green' : 'default'}>{tag.name}</Tag>
                                        <Text type="secondary">({tag.category})</Text>
                                    </Space>
                                </List.Item>
                            )}
                        />
                    </Card>
                </Col>
            </Row>

            <Modal
                title={`Add ${modal.type?.toUpperCase()}`}
                visible={modal.visible}
                onCancel={closeModal}
                footer={null}
                destroyOnClose
            >
                {renderModalContent()}
            </Modal>
        </div>
    );
}
