import React, { useEffect, useState } from "react";
import { Table, Input, Space } from "antd";
import { SearchOutlined } from "@ant-design/icons";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../config/firebase";

const ManageCategories = () => {
    const [categories, setCategories] = useState([]);
    const [search, setSearch] = useState("");

    useEffect(() => {
        const fetchCategories = async () => {
            const snapshot = await getDocs(collection(db, "categories"));
            const data = snapshot.docs.map(doc => ({ key: doc.id, ...doc.data() }));
            setCategories(data);
        };
        fetchCategories();
    }, []);

    const filtered = categories.filter(cat =>
        cat.name?.toLowerCase().includes(search.toLowerCase())
    );

    const columns = [
        {
            title: "Name",
            dataIndex: "name",
            sorter: (a, b) => a.name.localeCompare(b.name),
        },
        {
            title: "Local Name",
            dataIndex: "localName",
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
                    placeholder="Search categories..."
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    prefix={<SearchOutlined />}
                />
            </Space>
            <Table columns={columns} dataSource={filtered} />
        </div>
    );
};

export default ManageCategories;
