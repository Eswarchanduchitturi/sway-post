import React, { useState, useEffect } from "react";
import axios from "axios";
import './App.css'; // Make sure your CSS file is set up correctly

// LoginPage Component
const LoginPage = ({ onLogin }) => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (username === "user" && password === "password") {
      onLogin(true); // Simulate login success
    } else {
      setError("Invalid username or password");
    }
  };

  return (
    <div className="login">
      <h2>Credentials!</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <button type="submit">Login</button>
        {error && <p style={{ color: "red" }}>{error}</p>}
      </form>
    </div>
  );
};

// Main App Component
const App = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [posts, setPosts] = useState([]);
  const [newPost, setNewPost] = useState({ title: "", body: "", image: null });
  const [isCreatePostVisible, setIsCreatePostVisible] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [userProfile, setUserProfile] = useState({ name: "User", avatar: "" });
  const [editingPost, setEditingPost] = useState(null); // Track the post being edited

  useEffect(() => {
    if (isLoggedIn) {
      axios.get("https://jsonplaceholder.typicode.com/posts")
        .then((response) => {
          setPosts(response.data.slice(0, 10));
        })
        .catch((error) => console.error(error));
    }
  }, [isLoggedIn]);

  const handleCreate = () => {
    if (newPost.title && newPost.body) {
      axios.post("https://jsonplaceholder.typicode.com/posts", newPost)
        .then((response) => {
          setPosts([...posts, response.data]);
          setNewPost({ title: "", body: "", image: null });
        })
        .catch((error) => console.error(error));
    } else {
      alert("Please fill out both title and body");
    }
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
  };

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  const handleProfileEdit = () => {
    const newName = prompt("Enter your new name:", userProfile.name);
    if (newName) {
      setUserProfile({ ...userProfile, name: newName });
    }
  };

  // Edit Post Logic
  const handleEdit = (post) => {
    setEditingPost(post); // Set the post to be edited
  };

  const handleSaveEdit = () => {
    if (editingPost) {
      axios.put(`https://jsonplaceholder.typicode.com/posts/${editingPost.id}`, editingPost)
        .then((response) => {
          const updatedPosts = posts.map(post => 
            post.id === editingPost.id ? response.data : post
          );
          setPosts(updatedPosts);
          setEditingPost(null); // Clear the editing mode
        })
        .catch((error) => console.error(error));
    }
  };

  const handleCancelEdit = () => {
    setEditingPost(null); // Cancel editing
  };

  // Render login page if not logged in
  if (!isLoggedIn) {
    return <LoginPage onLogin={setIsLoggedIn} />;
  }

  return (
    <div className={`App ${darkMode ? "dark-mode" : ""}`}>
      <header>
        <div className="profile-container">
          <div className="profile" onClick={handleProfileEdit}>
            <img src={userProfile.avatar || "/default-avatar.png"} alt="Avatar" className="avatar" />
            <span>{userProfile.name}</span>
          </div>
          <button onClick={toggleDarkMode} className="btn toggle-btn">
            {darkMode ? "Light Mode" : "Dark Mode"}
          </button>
          <button onClick={handleLogout} className="btn logout-btn">Logout</button>
        </div>
      </header>

      <h1>SWAYpost</h1>

      {/* Toggle Create Post Form */}
      <button
        className="btn toggle-btn"
        onClick={() => setIsCreatePostVisible(!isCreatePostVisible)}
      >
        {isCreatePostVisible ? "Cancel" : "Create New Post"}
      </button>

      {/* Create Post Form - Toggled */}
      {isCreatePostVisible && (
        <div className="post-form">
          <h3>Create New Post</h3>
          <input
            type="text"
            placeholder="Title"
            value={newPost.title}
            onChange={(e) => setNewPost({ ...newPost, title: e.target.value })}
          />
          <textarea
            placeholder="Message..."
            value={newPost.body}
            onChange={(e) => setNewPost({ ...newPost, body: e.target.value })}
          />
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setNewPost({ ...newPost, image: URL.createObjectURL(e.target.files[0]) })}
          />
          {newPost.image && <img src={newPost.image} alt="Preview" className="image-preview" />}
          <button onClick={handleCreate} className="btn create-btn">Create Post</button>
        </div>
      )}

      {/* Display List of Posts (Limited to 10 posts) */}
      <div>
        <h3>Available Posts</h3>
        {posts.length === 0 ? (
          <p>No posts available</p>
        ) : (
          <ul>
            {posts.map((post) => (
              <li key={post.id}>
                {editingPost && editingPost.id === post.id ? (
                  <div className="edit-post-form">
                    <input
                      type="text"
                      value={editingPost.title}
                      onChange={(e) => setEditingPost({ ...editingPost, title: e.target.value })}
                    />
                    <textarea
                      value={editingPost.body}
                      onChange={(e) => setEditingPost({ ...editingPost, body: e.target.value })}
                    />
                    <button onClick={handleSaveEdit} className="btn save-btn">Save</button>
                    <button onClick={handleCancelEdit} className="btn cancel-btn">Cancel</button>
                  </div>
                ) : (
                  <>
                    <h4>{post.title}</h4>
                    <p>{post.body}</p>
                    {post.image && <img src={post.image} alt="Post" className="post-image" />}
                    <button onClick={() => handleEdit(post)} className="btn edit-btn">Edit</button>
                  </>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default App;
