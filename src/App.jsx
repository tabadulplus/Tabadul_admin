import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import AdminLayout from "./Layout/AdminLayout";
import ManagePosts from "./pages/ManagePosts";
import ManageUsers from "./pages/ManageUsers";
import ManageCategories from "./pages/ManageCategories";
import ManageHashtags from "./pages/ManageHashtags";

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<AdminLayout />}>
          <Route index element={<Home />} />
          <Route path="posts" element={<ManagePosts />} />
          <Route path="users" element={<ManageUsers />} />
          <Route path="categories" element={<ManageCategories />} />
          <Route path="hashtags" element={<ManageHashtags />} />
        </Route>
      </Routes>
    </Router>
  );
};

export default App;
