import React from 'react';
import { db } from '../config/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { Form, Input, Button, message } from 'antd';

export default function UploadUser() {
    const onFinish = async (values) => {
        try {
            await addDoc(collection(db, 'users'), {
                ...values,
                createdAt: serverTimestamp(),
                role: 'User',
                bio: '',
            });
            message.success('User added successfully');
        } catch (err) {
            message.error('Failed to add user');
        }
    };

    return (
        <Form layout="vertical" onFinish={onFinish}>
            <Form.Item name="name" label="Name" rules={[{ required: true }]}>
                <Input />
            </Form.Item>
            <Form.Item name="email" label="Email" rules={[{ required: true }]}>
                <Input type="email" />
            </Form.Item>
            <Form.Item name="contactNumber" label="Contact Number">
                <Input />
            </Form.Item>
            <Button type="primary" htmlType="submit">Submit User</Button>
        </Form>
    );
}
