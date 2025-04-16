// CreatePost.js
import React, { useEffect, useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import {
    collection,
    getDocs,
    addDoc,
    Timestamp,
    doc,
    getDoc,
} from 'firebase/firestore';
import { db, storage } from '../config/firebase'; // Adjust the path as necessary
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import {
    Form,
    Input,
    Button,
    Select,
    Checkbox,
    Upload,
    message,
    Spin,
    Row,
    Col,
} from 'antd';
import { UploadOutlined } from '@ant-design/icons';

const { Option } = Select;
const { TextArea } = Input;

const CreatePost = () => {
    const { control, handleSubmit, reset } = useForm();
    const [categories, setCategories] = useState([]);
    const [hashtags, setHashtags] = useState([]);
    const [fileList, setFileList] = useState([]);
    const [uploading, setUploading] = useState(false);

    // Fetch Categories
    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const categoriesCol = collection(db, 'categories');
                const categorySnapshot = await getDocs(categoriesCol);
                const categoryList = categorySnapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data(),
                }));
                setCategories(categoryList);
            } catch (error) {
                console.error('Error fetching categories:', error);
                message.error('Failed to fetch categories.');
            }
        };

        fetchCategories();
    }, []);

    // Fetch Hashtags
    useEffect(() => {
        const fetchHashtags = async () => {
            try {
                const hashtagsDocRef = doc(db, 'Hashtags', 'allHashtags');
                const hashtagSnapshot = await getDoc(hashtagsDocRef);
                if (hashtagSnapshot.exists()) {
                    const data = hashtagSnapshot.data();
                    // Assuming hashtags are stored as an array in a field named 'hashtags'
                    setHashtags(data.hashtags || []);
                } else {
                    console.warn('No such document in hashtags collection!');
                    message.warning('No hashtags found.');
                }
            } catch (error) {
                console.error('Error fetching hashtags:', error);
                message.error('Failed to fetch hashtags.');
            }
        };

        fetchHashtags();
    }, []);

    // Handle Image Upload Changes
    const handleUploadChange = ({ fileList }) => {
        setFileList(fileList);
    };

    // Handle Form Submission
    const onSubmit = async (data) => {
        setUploading(true);
        try {
            // Upload Images to Firebase Storage
            const imageUrls = [];
            for (let i = 0; i < fileList.length; i++) {
                const file = fileList[i].originFileObj;
                const storageRef = ref(
                    storage,
                    `postImages/${Date.now()}_${file.name}`
                );
                const snapshot = await uploadBytes(storageRef, file);
                const url = await getDownloadURL(snapshot.ref);
                imageUrls.push(url);
            }

            // Prepare Location
            const latitude = parseFloat(data.latitude);
            const longitude = parseFloat(data.longitude);
            const location = { latitude, longitude };

            // Prepare Post Data
            const postData = {
                category: data.category,
                complaints: [], // Initialize as empty array or handle accordingly
                contactNumber: data.contactNumber,
                createdAt: Timestamp.now(),
                description: data.description,
                imageUrls: imageUrls,
                isFeatured: data.isFeatured || false,
                likes: [], // Initialize as empty array
                location: location, // Adjusted to a simple object
                modelYear: parseInt(data.modelYear, 10) || null,
                price: parseFloat(data.price) || 0,
                tags: data.tags || [],
                title: data.title,
                updatedAt: Timestamp.now(),
                userId: 'WlSsyFzb36ZWA147JGpgtoAzG3p1', // Replace with actual user ID
                views: 0,
            };

            // Add Post to Firestore
            const postsCol = collection(db, 'posts');
            const docRef = await addDoc(postsCol, postData);
            console.log('Post created with ID:', docRef.id);

            // Reset Form
            reset();
            setFileList([]);
            message.success('Post created successfully!');
        } catch (error) {
            console.error('Error creating post:', error);
            message.error('Failed to create post. Please try again.');
        } finally {
            setUploading(false);
        }
    };

    // Custom Upload Button
    const uploadButton = (
        <div>
            <UploadOutlined />
            <div style={{ marginTop: 8 }}>Upload</div>
        </div>
    );

    return (
        <div className="create-post-container" style={{ padding: '24px', maxWidth: '800px', margin: '0 auto' }}>
            <h2>Create a New Post</h2>
            <Form layout="vertical" onFinish={handleSubmit(onSubmit)}>
                <Row gutter={16}>
                    {/* Title */}
                    <Col span={24}>
                        <Form.Item label="Title" required>
                            <Controller
                                name="title"
                                control={control}
                                rules={{ required: 'Title is required.' }}
                                render={({ field, fieldState: { error } }) => (
                                    <Input {...field} placeholder="Enter post title" />
                                )}
                            />
                        </Form.Item>
                    </Col>

                    {/* Description */}
                    <Col span={24}>
                        <Form.Item label="Description" required>
                            <Controller
                                name="description"
                                control={control}
                                rules={{ required: 'Description is required.' }}
                                render={({ field, fieldState: { error } }) => (
                                    <TextArea
                                        {...field}
                                        rows={4}
                                        placeholder="Enter post description"
                                    />
                                )}
                            />
                        </Form.Item>
                    </Col>

                    {/* Category */}
                    <Col span={12}>
                        <Form.Item label="Category" required>
                            <Controller
                                name="category"
                                control={control}
                                rules={{ required: 'Category is required.' }}
                                render={({ field, fieldState: { error } }) => (
                                    <Select
                                        {...field}
                                        placeholder="Select a category"
                                        allowClear
                                    >
                                        {categories.map((cat) => (
                                            <Option key={cat.id} value={cat.name}>
                                                {cat.name} ({cat.localName})
                                            </Option>
                                        ))}
                                    </Select>
                                )}
                            />
                        </Form.Item>
                    </Col>

                    {/* Hashtags */}
                    <Col span={12}>
                        <Form.Item label="Hashtags">
                            <Controller
                                name="tags"
                                control={control}
                                render={({ field }) => (
                                    <Select
                                        {...field}
                                        mode="multiple"
                                        placeholder="Select hashtags"
                                        allowClear
                                    >
                                        {hashtags.map((tag) => (
                                            <Option key={tag.id} value={tag.name}>
                                                {tag.name}
                                            </Option>
                                        ))}
                                    </Select>
                                )}
                            />
                            <small>Hold down the Ctrl (Windows) or Command (Mac) key to select multiple options.</small>
                        </Form.Item>
                    </Col>

                    {/* Contact Number */}
                    <Col span={12}>
                        <Form.Item label="Contact Number" required>
                            <Controller
                                name="contactNumber"
                                control={control}
                                rules={{ required: 'Contact number is required.' }}
                                render={({ field, fieldState: { error } }) => (
                                    <Input
                                        {...field}
                                        type="tel"
                                        placeholder="+96877253384"
                                    />
                                )}
                            />
                        </Form.Item>
                    </Col>

                    {/* Price */}
                    <Col span={12}>
                        <Form.Item label="Price" required>
                            <Controller
                                name="price"
                                control={control}
                                rules={{ required: 'Price is required.' }}
                                render={({ field, fieldState: { error } }) => (
                                    <Input
                                        {...field}
                                        type="number"
                                        min="0"
                                        step="0.01"
                                        placeholder="Enter price"
                                    />
                                )}
                            />
                        </Form.Item>
                    </Col>

                    {/* Model Year */}
                    <Col span={12}>
                        <Form.Item label="Model Year">
                            <Controller
                                name="modelYear"
                                control={control}
                                render={({ field, fieldState: { error } }) => (
                                    <Input
                                        {...field}
                                        type="number"
                                        min="1900"
                                        max={new Date().getFullYear()}
                                        placeholder="Enter model year"
                                    />
                                )}
                            />
                        </Form.Item>
                    </Col>

                    {/* Location */}
                    <Col span={12}>
                        <Form.Item label="Latitude" required>
                            <Controller
                                name="latitude"
                                control={control}
                                rules={{ required: 'Latitude is required.' }}
                                render={({ field, fieldState: { error } }) => (
                                    <Input
                                        {...field}
                                        type="number"
                                        step="0.000001"
                                        placeholder="Latitude"
                                    />
                                )}
                            />
                        </Form.Item>
                    </Col>

                    <Col span={12}>
                        <Form.Item label="Longitude" required>
                            <Controller
                                name="longitude"
                                control={control}
                                rules={{ required: 'Longitude is required.' }}
                                render={({ field, fieldState: { error } }) => (
                                    <Input
                                        {...field}
                                        type="number"
                                        step="0.000001"
                                        placeholder="Longitude"
                                    />
                                )}
                            />
                        </Form.Item>
                    </Col>

                    {/* Images */}
                    <Col span={24}>
                        <Form.Item label="Upload Images">
                            <Controller
                                name="images"
                                control={control}
                                render={({ field }) => (
                                    <Upload
                                        {...field}
                                        listType="picture"
                                        multiple
                                        accept="image/*"
                                        beforeUpload={() => false} // Prevent automatic upload
                                        onChange={handleUploadChange}
                                        fileList={fileList}
                                    >
                                        {fileList.length >= 8 ? null : uploadButton}
                                    </Upload>
                                )}
                            />
                            <small>You can upload up to 8 images.</small>
                        </Form.Item>
                    </Col>

                    {/* Featured */}
                    <Col span={24}>
                        <Form.Item>
                            <Controller
                                name="isFeatured"
                                control={control}
                                render={({ field }) => (
                                    <Checkbox {...field} checked={field.value}>
                                        Featured
                                    </Checkbox>
                                )}
                            />
                        </Form.Item>
                    </Col>
                </Row>

                {/* Submit Button */}
                <Form.Item>
                    <Button type="primary" htmlType="submit" disabled={uploading} block>
                        {uploading ? <Spin /> : 'Create Post'}
                    </Button>
                </Form.Item>
            </Form>
        </div>
    );
};

export default CreatePost;
