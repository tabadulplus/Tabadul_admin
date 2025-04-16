import React, { useState } from 'react';
import { db } from '../config/firebase';
import { doc, updateDoc, arrayUnion } from 'firebase/firestore';
import { Form, Input, Button, Switch, message } from 'antd';

export default function UploadHashtag() {
    const [trending, setTrending] = useState(false);

    const onFinish = async (values) => {
        try {
            const ref = doc(db, 'Hashtags', 'allHashtags');
            await updateDoc(ref, {
                hashtags: arrayUnion({
                    name: values.name,
                    category: values.category,
                    isTrending: trending,
                    usageCount: 0,
                }),
            });
            message.success('Hashtag added');
        } catch (err) {
            message.error('Failed to add hashtag');
        }
    };

    return (
        <Form layout="vertical" onFinish={onFinish}>
            <Form.Item name="name" label="Hashtag" rules={[{ required: true }]}>
                <Input prefix="#" />
            </Form.Item>
            <Form.Item name="category" label="Category" rules={[{ required: true }]}>
                <Input />
            </Form.Item>
            <Form.Item label="Trending?">
                <Switch checked={trending} onChange={setTrending} />
            </Form.Item>
            <Button type="primary" htmlType="submit">Submit Hashtag</Button>
        </Form>
    );
}
