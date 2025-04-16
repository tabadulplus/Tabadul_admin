import React, { useEffect, useState } from "react";
import { Table, Input, Space, Tag } from "antd";
import { SearchOutlined } from "@ant-design/icons";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../config/firebase";

const ManageHashtags = () => {
    const [hashtags, setHashtags] = useState([]);
    const [search, setSearch] = useState("");

    useEffect(() => {
        const fetchHashtags = async () => {
            const ref = doc(db, "Hashtags", "allHashtags");
            const snapshot = await getDoc(ref);
            const data = snapshot.data()?.hashtags || [];
            const enriched = data.map((tag, index) => ({ key: index, ...tag }));
            setHashtags(enriched);
        };
        fetchHashtags();
    }, []);

    const filtered = hashtags.filter(tag =>
        tag.name?.toLowerCase().includes(search.toLowerCase())
    );

    const columns = [
        {
            title: "Name",
            dataIndex: "name",
            render: name => <Tag>{name}</Tag>,
        },
        {
            title: "Category",
            dataIndex: "category",
        },
        {
            title: "Trending",
            dataIndex: "isTrending",
            render: val => (val ? <Tag color="green">Yes</Tag> : <Tag>No</Tag>),
        },
        {
            title: "Usage Count",
            dataIndex: "usageCount",
            sorter: (a, b) => a.usageCount - b.usageCount,
        },
    ];

    return (
        <div>
            <Space style={{ marginBottom: 16 }}>
                <Input
                    placeholder="Search hashtags..."
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    prefix={<SearchOutlined />}
                />
            </Space>
            <Table columns={columns} dataSource={filtered} />
        </div>
    );
};

export default ManageHashtags;
