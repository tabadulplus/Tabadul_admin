import React, { useEffect, useState } from 'react';
import { db } from '../config/firebase';
import { collection, getDocs, orderBy, limit, query } from 'firebase/firestore';
import { Card, Col, Row, Typography, List, Avatar, Tag, Button, Modal } from 'antd';

// Upload forms
import UploadPost from '../components/UploadPost';
import UploadUser from '../components/UploadUser';
import UploadCategory from '../components/UploadCategory';
import UploadHashtag from '../components/UploadHashtag';

const { Title } = Typography;

export default function Home() {
    const [posts, setPosts] = useState([]);
    const [users, setUsers] = useState([]);
    const [categories, setCategories] = useState([]);
    const [hashtags, setHashtags] = useState([]);

    const [modal, setModal] = useState({
        type: null,
        visible: false,
    });

    const openModal = (type) => setModal({ type, visible: true });
    const closeModal = () => setModal({ type: null, visible: false });

    useEffect(() => {
        const fetchData = async () => {
            const fetchCollection = async (colName, orderField = 'createdAt') => {
                const q = query(collection(db, colName), orderBy(orderField, 'desc'), limit(5));
                const snapshot = await getDocs(q);
                return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            };

            const postData = await fetchCollection('posts');
            const userData = await fetchCollection('users');
            const categoryData = await fetchCollection('categories');
            const hashtagsData = await getDocs(collection(db, 'Hashtags'));

            const sortedHashtags = (hashtagsData.docs[0]?.data()?.hashtags || []).slice(0, 5);

            setPosts(postData);
            setUsers(userData);
            setCategories(categoryData);
            setHashtags(sortedHashtags);
        };

        fetchData();
    }, [modal.visible]); // Refresh data after closing modal

    const renderModalContent = () => {
        switch (modal.type) {
            case 'post': return <UploadPost onSuccess={closeModal} />;
            case 'user': return <UploadUser onSuccess={closeModal} />;
            case 'category': return <UploadCategory onSuccess={closeModal} />;
            case 'hashtag': return <UploadHashtag onSuccess={closeModal} />;
            default: return null;
        }
    };

    return (
        <div style={{ padding: '24px' }}>
            <Title level={2}>📊 Admin Dashboard</Title>

            <Row gutter={[24, 24]}>
                <Col span={12}>
                    <Card
                        title="📝 Latest Posts"
                        extra={<Button type="primary" onClick={() => openModal('post')}>Add Post</Button>}
                        bordered={false}
                    >
                        <List
                            itemLayout="vertical"
                            dataSource={posts}
                            renderItem={post => (
                                <List.Item
                                    key={post.postId}
                                    extra={<img width={100} height={100} src={post.imageUrls?.[0]} alt="post" style={{borderRadius: '30px'}}/>}
                                >
                                    <List.Item.Meta
                                        title={post.title}
                                        description={`Category: ${post.category}, Price: ${post.price} OMR`}
                                    />
                                    <p>{post.description}</p>
                                </List.Item>
                            )}
                        />
                    </Card>
                </Col>

                <Col span={12}>
                    <Card
                        title="👥 New Users"
                        extra={<Button type="primary" onClick={() => openModal('user')}>Add User</Button>}
                        bordered={false}
                    >
                        <List
                            itemLayout="horizontal"
                            dataSource={users}
                            renderItem={user => (
                                <List.Item key={user.uid}>
                                    <List.Item.Meta
                                        avatar={<Avatar src={user.profilePicture} />}
                                        title={user.name}
                                        description={user.email}
                                    />
                                </List.Item>
                            )}
                        />
                    </Card>
                </Col>

                <Col span={12}>
                    <Card
                        title="📦 Categories"
                        extra={<Button type="primary" onClick={() => openModal('category')}>Add Category</Button>}
                        bordered={false}
                    >
                        <List
                            dataSource={categories}
                            renderItem={cat => (
                                <List.Item key={cat.name}>
                                    <List.Item.Meta
                                        title={cat.name}
                                        description={`Arabic: ${cat.localName || 'N/A'}`}
                                    />
                                </List.Item>
                            )}
                        />
                    </Card>
                </Col>

                <Col span={12}>
                    <Card
                        title="🏷️ Trending Hashtags"
                        extra={<Button type="primary" onClick={() => openModal('hashtag')}>Add Hashtag</Button>}
                        bordered={false}
                    >
                        <List
                            dataSource={hashtags}
                            renderItem={tag => (
                                <List.Item key={tag.name}>
                                    <Tag color={tag.isTrending ? 'green' : 'default'}>{tag.name}</Tag>
                                    <span style={{ marginLeft: 10 }}>Category: {tag.category}</span>
                                </List.Item>
                            )}
                        />
                    </Card>
                </Col>
            </Row>

            <Modal
                title={`Add ${modal.type?.toUpperCase()}`}
                open={modal.visible}
                onCancel={closeModal}
                footer={null}
                destroyOnClose
            >
                {renderModalContent()}
            </Modal>
        </div>
    );
}
