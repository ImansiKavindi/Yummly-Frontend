import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import '../styles/Home.css'; // Make sure your CSS matches the layout
import '../styles/comment.css';

function Home() {
  const [posts, setPosts] = useState([]);
  const [commentCounts, setCommentCounts] = useState({});
  const [expandedPostId, setExpandedPostId] = useState(null);
  const [comments, setComments] = useState({});
  

  const navigate = useNavigate();

  useEffect(() => {
    axios.get('http://localhost:8080/api/posts/')
      .then(res => {
        // Check if posts have `id`
        if (res.data && res.data[0] && res.data[0].id) {
          // Sort posts by id (most recent first)
          const sortedPosts = res.data.sort((a, b) => b.id - a.id); // Sort in descending order
          setPosts(sortedPosts);
                    // Fetch comment counts for each post
                    sortedPosts.forEach(post => {
                      axios.get(`http://localhost:8080/api/posts/${post.id}/comments/count`)
                        .then(countRes => {
                          setCommentCounts(prevCounts => ({
                            ...prevCounts,
                            [post.id]: countRes.data // Assuming this returns a number
                          }));
                        })
                        .catch(() => console.error('Failed to fetch comment count for post', post.id));
                    });
 
        } else {
          console.error('Posts do not have id field');
          setPosts(res.data); // Set unsorted posts
        }
      })
      .catch(() => alert("Failed to load posts 😭"));
  }, []);

  console.log('Comment counts:', commentCounts);

    // 🔽 UPDATED: Toggle and fetch comments
    const toggleComments = (postId) => {
      if (expandedPostId === postId) {
        // If the same post is clicked again, close the comment section
        setExpandedPostId(null);
      } else {
        // Expand the comment section for the clicked post
        setExpandedPostId(postId);
    
        // If comments are not fetched already for the clicked post, fetch them
        if (!comments[postId]) {
          axios.get(`http://localhost:8080/api/posts/${postId}/comments`)
            .then(res => {
              setComments(prev => ({
                ...prev,
                [postId]: res.data
              }));
            })
            .catch(() => console.error("Failed to load comments for post", postId));
        }
        
      }
    };
    
  // 🔼


  return (
    <div className="home-container">
      <div className="page-header"></div>

      <div className="action-buttons">
        <button onClick={() => navigate('/create')} className="btn create-post-btn">
          Create New Post
        </button>
        <button onClick={() => navigate('/profile')} className="btn profile-btn">
          Your Profile
        </button>
      </div>

      <div className="posts-container">
        {posts.map(post => {
          const avatarUrl = `https://api.dicebear.com/7.x/thumbs/svg?seed=${encodeURIComponent(post.userName || 'user')}`;
          
          return (
            <div key={post.id} className="post-card">
              <div className="post-header">
                <img src={avatarUrl} alt="avatar" className="avatar" />
                <p className="user-name">{post.userName}</p>
              </div>

              <h3 className="post-title">{post.title}</h3>

              {post.imagePath && (
                <img
                  src={`http://localhost:8080/uploads/${post.imagePath}`}
                  alt="post"
                  className="post-image"
                />
              )}

              <p className="post-description">{post.description}</p>

              <div className="post-actions">
                <button>❤️ Like</button>
                <button onClick={() => toggleComments(post.id)}>
                  💬 Comment ({commentCounts[post.id] || 0})
                </button>
                <button>🔗 Share</button>
              </div>
              
               {/* 🔽 UPDATED: Display comments below post if expanded */}
               {expandedPostId === post.id && (
                <div className="comments-section">
                  {comments[post.id] ? (
                    comments[post.id].length > 0 ? (
                      comments[post.id].map((comment, index) => (
                        <div key={index} className="comment">
                          <strong>{comment.userName}</strong>: {comment.content}
                          {/* 🔼 FIXED: Use `comment.content` instead of `comment.text` */}
                        </div>
                      ))
                    ) : (
                      <p>No comments yet.</p>
                    )
                  ) : (
                    <p>Loading comments...</p>
                  )}
                </div>
              )}
              {/* 🔼 */}

            </div>
          );
        })}
      </div>
    </div>
  );
}

export default Home;
