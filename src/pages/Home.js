import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import '../styles/Home.css';
import '../styles/comment.css';

function Home() {
  const [posts, setPosts] = useState([]);
  const [commentCounts, setCommentCounts] = useState({});
  const [expandedPostId, setExpandedPostId] = useState(null);
  const [comments, setComments] = useState({});
  const [newCommentText, setNewCommentText] = useState('');
  const [editingCommentId, setEditingCommentId] = useState(null);
  const [editingCommentText, setEditingCommentText] = useState('');
  const [selectedCommentId, setSelectedCommentId] = useState(null);

  const storedUser = localStorage.getItem("user") ? JSON.parse(localStorage.getItem("user")) : null;
  const [commentAuthor, setCommentAuthor] = useState(storedUser?.userName || '');
  const navigate = useNavigate();

  useEffect(() => {
    axios.get('http://localhost:8080/api/posts/')
      .then(res => {
        const sortedPosts = res.data.sort((a, b) => b.id - a.id);
        setPosts(sortedPosts);
        sortedPosts.forEach(post => {
          axios.get(`http://localhost:8080/api/posts/${post.id}/comments/count`)
            .then(countRes => {
              setCommentCounts(prev => ({ ...prev, [post.id]: countRes.data }));
            }).catch(error => {
              console.error('Comment count error:', post.id, error);
            });
        });
      })
      .catch(error => {
        console.error("Failed to load posts:", error);
        alert("Failed to load posts 😭");
      });
  }, []);

  const toggleComments = (postId) => {
    if (expandedPostId === postId) {
      setExpandedPostId(null);
    } else {
      setExpandedPostId(postId);
      if (!comments[postId]) {
        axios.get(`http://localhost:8080/api/posts/${postId}/comments`)
          .then(res => {
            setComments(prev => ({ ...prev, [postId]: res.data }));
          }).catch(error => {
            console.error("Failed to load comments:", error);
          });
      }
    }
    setNewCommentText('');
    setEditingCommentId(null);
    setEditingCommentText('');
    setSelectedCommentId(null);
  };

  const handleAddComment = (postId) => {
    if (newCommentText.trim() === '') return alert("Please enter a comment");

    let user = storedUser;
    const finalCommentAuthor = commentAuthor.trim() || (storedUser?.userName || 'Anonymous');

    if (!user) {
      user = {
        id: Math.floor(Math.random() * 10000) + 1,
        userName: finalCommentAuthor
      };
      localStorage.setItem("user", JSON.stringify(user));
    } else if (commentAuthor && commentAuthor !== user.userName) {
      user.userName = finalCommentAuthor;
      localStorage.setItem("user", JSON.stringify(user));
    }

    axios.post(`http://localhost:8080/api/posts/${postId}/comments?userId=${user.id}`, {
      content: newCommentText
    })
      .then(res => {
        const commentWithAuthor = {
          ...res.data,
          userName: user.userName,
          userId: user.id
        };
        setComments(prev => ({
          ...prev,
          [postId]: [...(prev[postId] || []), commentWithAuthor]
        }));
        setCommentCounts(prev => ({
          ...prev,
          [postId]: (prev[postId] || 0) + 1
        }));
        setNewCommentText('');
      })
      .catch(error => {
        console.error("Failed to add comment:", error);
        alert("Failed to add comment 😢");
      });
  };

  const handleDeleteComment = (postId, commentId) => {
    if (!window.confirm("Are you sure you want to delete this comment?")) {
      return;
    }

    axios.delete(`http://localhost:8080/api/posts/${postId}/comments/${commentId}`)
      .then(() => {
        setComments(prev => ({
          ...prev,
          [postId]: prev[postId].filter(comment => comment.id !== commentId)
        }));
        setCommentCounts(prev => ({
          ...prev,
          [postId]: (prev[postId] || 1) - 1
        }));
        setSelectedCommentId(null);
      })
      .catch(error => {
        console.error("Failed to delete comment:", error);
        alert("Failed to delete comment 😢");
      });
  };

  const handleEditComment = (commentId, currentText) => {
    setEditingCommentId(commentId);
    setEditingCommentText(currentText);
  };

  const handleSaveEdit = (postId, commentId) => {
    if (editingCommentText.trim() === '') return alert("Comment cannot be empty");

    axios.put(`http://localhost:8080/api/posts/${postId}/comments/${commentId}?newContent=${encodeURIComponent(editingCommentText)}`)
      .then(() => {
        setComments(prev => ({
          ...prev,
          [postId]: prev[postId].map(comment =>
            comment.id === commentId ? { ...comment, content: editingCommentText } : comment
          )
        }));
        setEditingCommentId(null);
        setEditingCommentText('');
        // Keep the comment selected after editing
      })
      .catch(error => {
        console.error("Failed to edit comment:", error);
        alert("Failed to edit comment 😢");
      });
  };

  const isUserComment = (comment) => {
    return storedUser && storedUser.id === comment.userId;
  };

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
        {posts.length > 0 ? (
          posts.map(post => {
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

                {expandedPostId === post.id && (
                  <div className="comments-section">
                    {comments[post.id] ? (
                      comments[post.id].length > 0 ? (
                        comments[post.id].map((comment, index) => (
                          <div
                            key={index}
                            className={`comment ${isUserComment(comment) ? 'user-comment' : ''} ${selectedCommentId === comment.id ? 'selected-comment' : ''}`}
                            onClick={() => {
                              if (isUserComment(comment)) {
                                if (selectedCommentId === comment.id) {
                                  setSelectedCommentId(null); // Deselect if already selected
                                } else {
                                  setSelectedCommentId(comment.id); // Select this comment
                                }
                              }
                            }}
                          >
                            <strong>{comment.username || comment.userName || 'Anonymous'}</strong>:&nbsp;
                            {editingCommentId === comment.id ? (
                              <>
                                <input
                                  value={editingCommentText}
                                  onChange={(e) => setEditingCommentText(e.target.value)}
                                  onClick={(e) => e.stopPropagation()} // Prevent comment deselection
                                />
                                <button onClick={(e) => {
                                  e.stopPropagation(); // Prevent comment deselection
                                  handleSaveEdit(post.id, comment.id);
                                }}>Save</button>
                                <button onClick={(e) => {
                                  e.stopPropagation(); // Prevent comment deselection
                                  setEditingCommentId(null);
                                }}>Cancel</button>
                              </>
                            ) : (
                              <>
                                {comment.content}
                                {isUserComment(comment) && selectedCommentId === comment.id && (
                                  <div className="comment-actions">
                                    <button onClick={(e) => {
                                      e.stopPropagation(); // Prevent comment deselection
                                      handleEditComment(comment.id, comment.content);
                                    }}>Edit</button>
                                    <button onClick={(e) => {
                                      e.stopPropagation(); // Prevent comment deselection
                                      handleDeleteComment(post.id, comment.id);
                                    }}>Delete</button>
                                  </div>
                                )}
                              </>
                            )}
                          </div>
                        ))
                      ) : (
                        <p>No comments yet. Be the first to comment!</p>
                      )
                    ) : (
                      <p>Loading comments...</p>
                    )}

                    <div className="add-comment">
                      <textarea
                        rows="2"
                        placeholder="Write a comment..."
                        value={newCommentText}
                        onChange={(e) => setNewCommentText(e.target.value)}
                      />
                      <button onClick={() => handleAddComment(post.id)}>Post Comment</button>
                    </div>
                  </div>
                )}
              </div>
            );
          })
        ) : (
          <p>Loading posts...</p>
        )}
      </div>
    </div>
  );
}

export default Home;