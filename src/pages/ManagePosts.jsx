import React, { useEffect, useState } from "react";
import {
  Table,
  Input,
  Space,
  Image,
  Button,
  Modal,
  Form,
  Upload,
  message,
  Popconfirm,
} from "antd";
import {
  PlusOutlined,
  SearchOutlined,
  UploadOutlined,
  EditOutlined,
  DeleteOutlined,
  FileExcelOutlined,
  FilePdfOutlined,
} from "@ant-design/icons";
import { db } from "../config/firebase";
import {
  collection,
  getDocs,
  addDoc,
  deleteDoc,
  doc,
  updateDoc,
  serverTimestamp,
} from "firebase/firestore";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

const ManagePosts = () => {
  const [posts, setPosts] = useState([]);
  const [search, setSearch] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editingPost, setEditingPost] = useState(null);
  const [form] = Form.useForm();

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    const snapshot = await getDocs(collection(db, "posts"));
    const data = snapshot.docs.map(doc => ({ key: doc.id, ...doc.data() }));
    setPosts(data);
  };

  const handleAddOrEdit = async (values) => {
    try {
      if (editingPost) {
        await updateDoc(doc(db, "posts", editingPost.key), values);
        message.success("Post updated");
      } else {
        await addDoc(collection(db, "posts"), {
          ...values,
          createdAt: serverTimestamp(),
          imageUrls: values.imageUrls || [],
        });
        message.success("Post added");
      }
      form.resetFields();
      setModalOpen(false);
      setEditingPost(null);
      fetchPosts();
    } catch {
      message.error("Something went wrong");
    }
  };

  const handleDelete = async (id) => {
    await deleteDoc(doc(db, "posts", id));
    message.success("Post deleted");
    fetchPosts();
  };

  const handleImport = (file) => {
    const reader = new FileReader();
    reader.onload = async (e) => {
      const workbook = XLSX.read(e.target.result, { type: "binary" });
      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      const data = XLSX.utils.sheet_to_json(sheet);

      for (let post of data) {
        await addDoc(collection(db, "posts"), {
          ...post,
          createdAt: serverTimestamp(),
          imageUrls: [],
        });
      }
      message.success("Import successful");
      fetchPosts();
    };
    reader.readAsBinaryString(file);
    return false;
  };

  const handleExport = (type = "csv") => {
    const exportData = posts.map(p => ({
      title: p.title,
      category: p.category,
      price: p.price,
      description: p.description,
    }));

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Posts");

    const fileType = type === "csv" ? "csv" : "xlsx";
    const buffer = XLSX.write(workbook, { bookType: fileType, type: "array" });
    const blob = new Blob([buffer], {
      type:
        fileType === "csv"
          ? "text/csv;charset=utf-8;"
          : "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });

    saveAs(blob, `posts_export.${fileType}`);
  };

  const filtered = posts.filter(post =>
    post.title?.toLowerCase().includes(search.toLowerCase())
  );

  const columns = [
    {
      title: "Image",
      dataIndex: "imageUrls",
      render: urls => <Image width={60} src={urls?.[0]} />,
    },
    {
      title: "Title",
      dataIndex: "title",
      sorter: (a, b) => a.title.localeCompare(b.title),
    },
    {
      title: "Category",
      dataIndex: "category",
    },
    {
      title: "Price (OMR)",
      dataIndex: "price",
      sorter: (a, b) => a.price - b.price,
    },
    {
      title: "Actions",
      render: (_, record) => (
        <Space>
          <Button
            icon={<EditOutlined />}
            onClick={() => {
              setEditingPost(record);
              setModalOpen(true);
              form.setFieldsValue(record);
            }}
          />
          <Popconfirm
            title="Are you sure?"
            onConfirm={() => handleDelete(record.key)}
          >
            <Button icon={<DeleteOutlined />} danger />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <Space style={{ marginBottom: 16 }}>
        <Input
          placeholder="Search posts..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          prefix={<SearchOutlined />}
        />
        <Button type="primary" icon={<PlusOutlined />} onClick={() => setModalOpen(true)}>
          Add Post
        </Button>
        <Upload beforeUpload={handleImport} showUploadList={false}>
          <Button icon={<UploadOutlined />}>Import CSV</Button>
        </Upload>
        <Button icon={<FileExcelOutlined />} onClick={() => handleExport("csv")}>
          Export CSV
        </Button>
        <Button icon={<FilePdfOutlined />} onClick={() => handleExport("xlsx")}>
          Export XLSX
        </Button>
      </Space>

      <Table columns={columns} dataSource={filtered} pagination={{ pageSize: 6 }} />

      <Modal
        title={editingPost ? "Edit Post" : "Add Post"}
        open={modalOpen}
        onCancel={() => {
          setModalOpen(false);
          setEditingPost(null);
          form.resetFields();
        }}
        onOk={() => form.submit()}
        destroyOnClose
      >
        <Form form={form} layout="vertical" onFinish={handleAddOrEdit}>
          <Form.Item name="title" label="Title" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="category" label="Category">
            <Input />
          </Form.Item>
          <Form.Item name="price" label="Price">
            <Input type="number" />
          </Form.Item>
          <Form.Item name="description" label="Description">
            <Input.TextArea />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default ManagePosts;
