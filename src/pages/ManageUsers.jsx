import React, { useEffect, useState } from "react";
import { Table, Input, Space, Avatar } from "antd";
import { SearchOutlined } from "@ant-design/icons";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../config/firebase";

const ManageUsers = () => {
    const [users, setUsers] = useState([]);
    const [search, setSearch] = useState("");

    useEffect(() => {
        const fetchUsers = async () => {
            const snapshot = await getDocs(collection(db, "users"));
            const data = snapshot.docs.map(doc => ({ key: doc.id, ...doc.data() }));
            setUsers(data);
        };
        fetchUsers();
    }, []);

    const filtered = users.filter(user =>
        user.name?.toLowerCase().includes(search.toLowerCase())
    );

    const columns = [
        {
            title: "Avatar",
            dataIndex: "profilePicture",
            render: url => <Avatar src={url} />,
        },
        {
            title: "Name",
            dataIndex: "name",
            sorter: (a, b) => a.name.localeCompare(b.name),
        },
        {
            title: "Email",
            dataIndex: "email",
        },
        {
            title: "Contact",
            dataIndex: "contactNumber",
        },
        {
            title: "Role",
            dataIndex: "role",
        },
    ];

    return (
        <div>
            <Space style={{ marginBottom: 16 }}>
                <Input
                    placeholder="Search users..."
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    prefix={<SearchOutlined />}
                />
            </Space>
            <Table columns={columns} dataSource={filtered} />
        </div>
    );
};

export default ManageUsers;
