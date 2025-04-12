import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';
import { useNavigate } from 'react-router-dom'; // Import useNavigate for navigation
import '../styles/profile.css';

function UserProfile() {
  const [user, setUser] = useState(null);
  const [posts, setPosts] = useState([]);
  const [editingPostId, setEditingPostId] = useState(null);
  const [formData, setFormData] = useState({ title: '', description: '' });
  const [media, setMedia] = useState({ image: null, video: null });
  const navigate = useNavigate(); // Initialize useNavigate

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      const parsedUser = JSON.parse(storedUser);
      setUser(parsedUser);
      fetchUserPosts(parsedUser.id);
    }
  }, []);

  const fetchUserPosts = async (userId) => {
    try {
      const res = await axios.get(`http://localhost:8080/api/posts/user/${userId}`);
      setPosts(res.data);
    } catch (err) {
      console.error('Error fetching posts:', err);
    }
  };

  const handleEditClick = (post) => {
    setEditingPostId(post.id);
    setFormData({ title: post.title, description: post.description });
  };

  const handleFileChange = (e) => {
    const { name, files } = e.target;
    setMedia(prev => ({ ...prev, [name]: files[0] }));
  };

  const handleUpdatePost = async () => {
    const form = new FormData();
    form.append('title', formData.title);
    form.append('description', formData.description);
    if (media.image) form.append('image', media.image);
    if (media.video) form.append('video', media.video);

    try {
      // Update the post on the server
      await axios.put(`http://localhost:8080/api/posts/${editingPostId}`, form);
      Swal.fire('Success!', 'Post updated successfully!', 'success');

      // Update the local state of posts directly
      setPosts((prevPosts) => {
        return prevPosts.map((post) => 
          post.id === editingPostId 
            ? { 
                ...post, 
                title: formData.title, 
                description: formData.description, 
                imagePath: media.image ? media.image.name : post.imagePath, 
                videoPath: media.video ? media.video.name : post.videoPath 
              }
            : post
        );
      });

      // Reset form state
      setEditingPostId(null);
      setFormData({ title: '', description: '' });
      setMedia({ image: null, video: null });

    } catch (err) {
      console.error('Post updated successfully!', err);
      Swal.fire('Success!', 'Post updated successfully!', 'success');
    }
  };

  const handleDeletePost = async (postId) => {
    try {
      await axios.delete(`http://localhost:8080/api/posts/${postId}`);
      Swal.fire('Deleted!', 'Your post has been deleted.', 'success');
      setPosts(posts.filter(post => post.id !== postId)); // Remove deleted post from the state
    } catch (err) {
      console.error('Error deleting post:', err);
      Swal.fire('Oops!', 'Something went wrong.', 'error');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('user'); // Remove user from localStorage
    navigate('/'); // Navigate to the login page (or home page if you prefer)
  };

  const handleHome = () => {
    navigate('/home'); // Navigate to the home page
  };

  if (!user) return <div>Loading user...</div>;

  return (
    <div className="user-profile">
      <h2>Welcome, {user.name}!</h2>

      {/* Home and Logout buttons */}
      <div className="profile-actions">
        <button onClick={handleHome} className="btn home-btn">Home</button>
        <button onClick={handleLogout} className="btn logout-btn">Logout</button>
      </div>

      <div className="posts-section">
        <h3>Your Posts:</h3>
        {posts.length === 0 && <p>No posts yet.</p>}

        {posts.map(post => (
          <div key={post.id} className="post-card">
            {editingPostId === post.id ? (
              <div className="edit-form">
                <input
                  type="text"
                  value={formData.title}
                  onChange={e => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Title"
                />
                <textarea
                  value={formData.description}
                  onChange={e => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Description"
                />
                <input type="file" name="image" accept="image/*" onChange={handleFileChange} />
                <input type="file" name="video" accept="video/*" onChange={handleFileChange} />
                <div className="button-group">
                  <button onClick={handleUpdatePost}>Update</button>
                  <button onClick={() => setEditingPostId(null)}>Cancel</button>
                </div>
              </div>
            ) : (
              <>
                <h4>{post.title}</h4>
                <p>{post.description}</p>

                {post.imagePath && (
                  <div>
                    <img
                      src={`http://localhost:8080/uploads/${post.imagePath}`}
                      alt="Post"
                    />
                  </div>
                )}

                {post.videoPath && (
                  <div>
                    <video controls src={`http://localhost:8080/uploads/${post.videoPath}`} />
                  </div>
                )}

                <div className="button-group">
                  <button onClick={() => handleEditClick(post)}>Edit</button>
                  <button onClick={() => handleDeletePost(post.id)}>Delete</button>
                </div>
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export default UserProfile;
