import React from "react";
import { Layout, Menu } from "antd";
import {
  HomeOutlined,
  FileTextOutlined,
  UserOutlined,
  TagsOutlined,
  AppstoreOutlined,
} from "@ant-design/icons";
import { Link, Outlet, useLocation } from "react-router-dom";

const { Header, Sider, Content } = Layout;

const AdminLayout = () => {
  const location = useLocation();

  return (
    <Layout style={{ minHeight: "100vh" }}>
      <Sider breakpoint="lg" collapsedWidth="0">
        <div className="logo" style={{ color: "#fff", textAlign: "center", padding: "12px" }}>
          Tabadul Admin
        </div>
        <Menu theme="dark" mode="inline" selectedKeys={[location.pathname]}>
          <Menu.Item key="/" icon={<HomeOutlined />}>
            <Link to="/">Dashboard</Link>
          </Menu.Item>
          <Menu.Item key="/posts" icon={<FileTextOutlined />}>
            <Link to="/posts">Posts</Link>
          </Menu.Item>
          <Menu.Item key="/users" icon={<UserOutlined />}>
            <Link to="/users">Users</Link>
          </Menu.Item>
          <Menu.Item key="/categories" icon={<AppstoreOutlined />}>
            <Link to="/categories">Categories</Link>
          </Menu.Item>
          <Menu.Item key="/hashtags" icon={<TagsOutlined />}>
            <Link to="/hashtags">Hashtags</Link>
          </Menu.Item>
        </Menu>
      </Sider>
      <Layout>
        {/* <Header style={{ background: "#fff", padding: 0 }} title="Home" /> */}
        <Content style={{ margin: "24px 16px 0" }}>
          <div style={{ padding: 24, minHeight: 360 }}>
            <Outlet />
          </div>
        </Content>
      </Layout>
    </Layout>
  );
};

export default AdminLayout;
