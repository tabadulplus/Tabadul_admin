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
  Checkbox,
  Row,
  Col,
  Select,
  InputNumber,
  Spin,
} from "antd";
import {
  PlusOutlined,
  SearchOutlined,
  UploadOutlined,
  EditOutlined,
  DeleteOutlined,
} from "@ant-design/icons";
import { db, storage } from "../config/firebase";
import {
  collection,
  getDocs,
  doc,
  getDoc,
  addDoc,
  deleteDoc,
  updateDoc,
  serverTimestamp,
  query,
  where,
} from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";

const { Option } = Select;

const ManagePosts = () => {
  const [posts, setPosts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [users, setUsers] = useState([]);
  const [hashtags, setHashtags] = useState([]);
  const [search, setSearch] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editingPost, setEditingPost] = useState(null);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [form] = Form.useForm();
  const [selectedImageFile, setSelectedImageFile] = useState(null);

  useEffect(() => {
    Promise.all([
      fetchPosts(),
      fetchCategories(),
      fetchUsers(),
      fetchHashtags(),
    ]).then(() => setInitialLoading(false));
  }, []);

  const fetchPosts = async () => {
    const snapshot = await getDocs(collection(db, "posts"));
    const data = snapshot.docs.map(doc => ({ key: doc.id, ...doc.data() }));
    setPosts(data);
  };

  const fetchCategories = async () => {
    const snapshot = await getDocs(collection(db, "categories"));
    const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    setCategories(data);
  };

  const fetchUsers = async () => {
    const q = query(collection(db, "users"), where("role", "==", "User"));
    const snapshot = await getDocs(q);
    const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    setUsers(data);
  };

  const fetchHashtags = async () => {
    const docRef = doc(db, "Hashtags", "allHashtags");
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      const data = docSnap.data();
      setHashtags(Array.isArray(data.hashtags) ? data.hashtags : []);
    } else {
      setHashtags([]);
    }
  };

  const handleAddOrEdit = async (values) => {
    try {
      setLoading(true);

      let imageUrl = values.imageUrls;
      if (selectedImageFile) {
        const storageRef = ref(storage, `postImages/${Date.now()}_${selectedImageFile.name}`);
        await uploadBytes(storageRef, selectedImageFile);
        imageUrl = await getDownloadURL(storageRef);
      }

      const postData = {
        ...values,
        modelYear: values.modelYear || null,
        contactNumber: values.contactNumber || "",
        isFeatured: values.isFeatured || false,
        tags: values.tags || [],
        imageUrls: imageUrl ? [imageUrl] : [],
        complaints: [],
        views: [],
        location: null,
        updatedAt: serverTimestamp(),
      };

      if (editingPost) {
        await updateDoc(doc(db, "posts", editingPost.key), postData);
        message.success("Post updated successfully");
      } else {
        await addDoc(collection(db, "posts"), {
          ...postData,
          createdAt: serverTimestamp(),
        });
        message.success("Post created successfully");
      }

      form.resetFields();
      setModalOpen(false);
      setEditingPost(null);
      setSelectedImageFile(null);
      fetchPosts();
    } catch (error) {
      console.error(error);
      message.error("Something went wrong, try again");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteDoc(doc(db, "posts", id));
      message.success("Post deleted successfully");
      fetchPosts();
    } catch (error) {
      message.error("Failed to delete post");
    }
  };

  const filtered = posts.filter(post =>
    post.title?.toLowerCase().includes(search.toLowerCase())
  );

  const columns = [
    {
      title: "Image",
      dataIndex: "imageUrls",
      render: urls => urls?.[0] ? <Image width={60} height={60} src={urls[0]} /> : "-",
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
      title: "Model Year",
      dataIndex: "modelYear",
    },
    {
      title: "Contact Number",
      dataIndex: "contactNumber",
    },
    {
      title: "Is Featured",
      dataIndex: "isFeatured",
      render: value => (value ? "Yes" : "No"),
    },
    {
      title: "Tags",
      dataIndex: "tags",
      render: tags => tags?.join(", "),
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
              form.setFieldsValue({
                ...record,
                tags: record.tags || [],
                imageUrls: record.imageUrls?.[0] || "",
              });
            }}
          />
          <Popconfirm
            title="Are you sure to delete?"
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
      <Space style={{ marginBottom: 16, flexWrap: "wrap" }}>
        <Input
          placeholder="Search posts..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          prefix={<SearchOutlined />}
        />
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => {
            setModalOpen(true);
            setSelectedImageFile(null);
          }}
        >
          Add Post
        </Button>
      </Space>

      {initialLoading ? (
        <Spin tip="Loading..." size="large" style={{ width: "100%", marginTop: "100px" }} />
      ) : (
        <Table
          columns={columns}
          dataSource={filtered}
          pagination={{ pageSize: 6 }}
          scroll={{ x: true }}
        />
      )}

      <Modal
        title={editingPost ? "Edit Post" : "Add Post"}
        open={modalOpen}
        onCancel={() => {
          setModalOpen(false);
          setEditingPost(null);
          form.resetFields();
          setSelectedImageFile(null);
        }}
        onOk={() => form.submit()}
        destroyOnClose
        width={900}
        centered
        okButtonProps={{ loading: loading, disabled: loading }}
      >
        <Form form={form} layout="vertical" onFinish={handleAddOrEdit}>
          <Row gutter={[16, 16]}>
            <Col span={24}>
              <Form.Item name="userId" label="Select User" rules={[{ required: true }]}>
                <Select
                  placeholder="Select User"
                  showSearch
                  optionFilterProp="children"
                  filterOption={(input, option) =>
                    option?.children.toLowerCase().includes(input.toLowerCase())
                  }
                >
                  {users.map(user => (
                    <Option key={user.uid} value={user.uid}>
                      {user.name} - {user.contactNumber}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={[16, 16]}>
            <Col span={12}>
              <Form.Item name="title" label="Title" rules={[{ required: true }]}>
                <Input />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="category" label="Category" rules={[{ required: true }]}>
                <Select
                  placeholder="Select Category"
                  showSearch
                  optionFilterProp="children"
                  filterOption={(input, option) =>
                    option?.children.toLowerCase().includes(input.toLowerCase())
                  }
                >
                  {categories.map(cat => (
                    <Option key={cat.id} value={cat.name}>
                      {cat.name}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={[16, 16]}>
            <Col span={12}>
              <Form.Item
                name="price"
                label="Price (OMR)"
                rules={[
                  { required: true, message: "Please enter price" },
                  { type: "number", min: 0 },
                ]}
              >
                <InputNumber
                  style={{ width: "100%" }}
                  min={0}
                  placeholder="Enter Price"
                  formatter={value => `OMR ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                  parser={value => value.replace(/OMR\s?|(,*)/g, '')}
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="modelYear" label="Model Year" rules={[{ required: true }]}>
                <InputNumber
                  min={1900}
                  max={new Date().getFullYear()}
                  style={{ width: "100%" }}
                  placeholder="Enter Year"
                />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={[16, 16]}>
            <Col span={12}>
              <Form.Item name="contactNumber" label="Contact Number">
                <Input />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="tags" label="Select Hashtags">
                <Select
                  mode="multiple"
                  placeholder="Select Hashtags"
                  allowClear
                  showSearch
                  optionFilterProp="children"
                >
                  {hashtags.map((tag, index) => (
                    <Option key={index} value={tag.name}>
                      {tag.name}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={[16, 16]}>
            <Col span={24}>
              <Form.Item name="description" label="Description">
                <Input.TextArea rows={3} placeholder="Write post description..." />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={[16, 16]}>
            <Col span={24}>
              <Form.Item name="imageUrls" label="Upload Image">
                <Upload.Dragger
                  name="file"
                  accept="image/*"
                  beforeUpload={(file) => {
                    setSelectedImageFile(file);
                    message.info("Image selected. It will be uploaded on Save.");
                    return false;
                  }}
                  showUploadList={false}
                  multiple={false}
                >
                  <p className="ant-upload-drag-icon">
                    <UploadOutlined />
                  </p>
                  <p className="ant-upload-text">Click or drag image to this area</p>
                  <p className="ant-upload-hint">Image will be uploaded after clicking Save</p>
                </Upload.Dragger>

                {selectedImageFile && (
                  <div style={{ marginTop: 12 }}>
                    <Image
                      src={URL.createObjectURL(selectedImageFile)}
                      alt="Preview"
                      width={100}
                      style={{ display: "block", marginBottom: 8 }}
                    />
                    <Button
                      type="dashed"
                      danger
                      onClick={() => setSelectedImageFile(null)}
                    >
                      Remove Image
                    </Button>
                  </div>
                )}
              </Form.Item>
            </Col>
          </Row>

          <Row>
            <Col span={24}>
              <Form.Item name="isFeatured" valuePropName="checked">
                <Checkbox>Mark as Featured</Checkbox>
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Modal>
    </div>
  );
};

export default ManagePosts;
