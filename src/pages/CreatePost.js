import React, { useState } from 'react';
import { useUser } from './UserContext';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2'; // ✅ SweetAlert2
import '../styles/createpost.css'; // ✅ External CSS

// Create axios instance with base URL
const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:8080',
  headers: {
    'Content-Type': 'multipart/form-data'
  }
});

function CreatePost() {
  const { user } = useUser();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [image, setImage] = useState(null);
  const [video, setVideo] = useState(null);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!user || !user.name) {
      Swal.fire({
        icon: 'warning',
        title: 'Oops...',
        text: 'You must be logged in to create a post!',
      });
      return;
    }

    const formData = new FormData();
    formData.append('title', title);
    formData.append('description', description);
    formData.append('userId', user.id);
    if (image) formData.append('image', image);
    if (video) formData.append('video', video);

    try {
      const response = await api.post('/api/posts/create', formData);

      console.log('✅ Post created:', response.data);
      Swal.fire({
        icon: 'success',
        title: 'Success!',
        text: 'Your post has been created successfully 🎉',
        confirmButtonColor: '#007bff',
      }).then(() => {
        navigate('/profile');
      });
    } catch (error) {
      console.error('❌ Post creation failed:', error);
      Swal.fire({
        icon: 'error',
        title: 'Failed',
        text: error.response?.data?.message || 'Something went wrong while creating your post.',
      });
    }
  };

  return (
    <div className="create-post-container">
      <h2 className="create-post-title">Create a New Post 📝</h2>
      <form className="create-post-form" onSubmit={handleSubmit} encType="multipart/form-data">
        <input
          type="text"
          placeholder="Post Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />
        <textarea
          placeholder="Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          required
          rows={5}
        />
        <label className="upload-label">Upload Image (optional):</label>
        <input
          type="file"
          accept="image/*"
          onChange={(e) => setImage(e.target.files[0])}
        />
        <label className="upload-label">Upload Video (optional):</label>
        <input
          type="file"
          accept="video/*"
          onChange={(e) => setVideo(e.target.files[0])}
        />
        <button type="submit" className="create-btn">
          Submit Post
        </button>
      </form>
    </div>
  );
}

export default CreatePost;
