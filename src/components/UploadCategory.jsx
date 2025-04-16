import React from 'react';
import { db } from '../config/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { Form, Input, Button, message } from 'antd';

export default function UploadCategory() {
    const onFinish = async (values) => {
        try {
            await addDoc(collection(db, 'categories'), {
                ...values,
                createdAt: serverTimestamp(),
                usageCount: 0,
                imageUrl: '',
            });
            message.success('Category added successfully');
        } catch (err) {
            message.error('Failed to add category');
        }
    };

    return (
        <Form layout="vertical" onFinish={onFinish}>
            <Form.Item name="name" label="Category Name" rules={[{ required: true }]}>
                <Input />
            </Form.Item>
            <Form.Item name="localName" label="Local (Arabic) Name">
                <Input />
            </Form.Item>
            <Button type="primary" htmlType="submit">Submit Category</Button>
        </Form>
    );
}
