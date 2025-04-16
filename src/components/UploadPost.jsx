import React, { useState } from 'react';
import { db } from '../config/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { Input, Button, Form, Upload, message } from 'antd';
import { UploadOutlined } from '@ant-design/icons';

export default function UploadPost() {
    const [fileList, setFileList] = useState([]);

    const onFinish = async (values) => {
        try {
            await addDoc(collection(db, 'posts'), {
                ...values,
                imageUrls: fileList.map(file => file.url),
                createdAt: serverTimestamp(),
                isFeatured: false,
                likes: [],
                tags: [],
            });
            message.success('Post added successfully');
        } catch (error) {
            message.error('Failed to add post');
        }
    };

    return (
        <Form layout="vertical" onFinish={onFinish}>
            <Form.Item name="title" label="Title" rules={[{ required: true }]}>
                <Input />
            </Form.Item>
            <Form.Item name="description" label="Description">
                <Input.TextArea />
            </Form.Item>
            <Form.Item name="price" label="Price">
                <Input type="number" />
            </Form.Item>
            <Form.Item label="Images">
                <Upload
                    listType="picture"
                    beforeUpload={() => false}
                    onChange={({ fileList }) => setFileList(fileList)}
                >
                    <Button icon={<UploadOutlined />}>Upload</Button>
                </Upload>
            </Form.Item>
            <Button type="primary" htmlType="submit">Submit Post</Button>
        </Form>
    );
}
