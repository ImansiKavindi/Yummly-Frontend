import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import '../styles/Home.css';
import '../styles/comment.css';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Swal from 'sweetalert2';

function Home() {
  const [posts, setPosts] = useState([]);
  const [commentCounts, setCommentCounts] = useState({});
  const [likeCounts, setLikeCounts] = useState({});
  const [likedPosts, setLikedPosts] = useState({});
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
        
        // Load saved likes from localStorage
        const localLikes = JSON.parse(localStorage.getItem("likes") || "{}");
        
        sortedPosts.forEach(post => {
          axios.get(`http://localhost:8080/api/posts/${post.id}/comments/count`)
            .then(countRes => {
              setCommentCounts(prev => ({ ...prev, [post.id]: countRes.data }));
            }).catch(error => {
              console.error('Comment count error:', post.id, error);
            });

          // Check if the post is liked by the current user
          if (storedUser) {
            axios.get(`http://localhost:8080/api/posts/${post.id}/likes/check?userId=${storedUser.id}`)
              .then(likeRes => {
                setLikedPosts(prev => ({ ...prev, [post.id]: likeRes.data }));
              })
              .catch(error => {
                // If error, assume user hasn't liked the post
                setLikedPosts(prev => ({ ...prev, [post.id]: false }));
                console.error('Like check error:', post.id, error);
              });
          } else {
            // If no user is logged in, use localStorage as fallback
            setLikedPosts(prev => ({ ...prev, [post.id]: localLikes[post.id] || false }));
          }

          // Get the current like count for the post
          axios.get(`http://localhost:8080/api/posts/${post.id}/likes/count`)
            .then(likeCountRes => {
              setLikeCounts(prev => ({ ...prev, [post.id]: likeCountRes.data }));
            })
            .catch(error => {
              console.error('Like count error:', post.id, error);
              setLikeCounts(prev => ({ ...prev, [post.id]: post.likeCount || 0 }));
            });
        });
      })
      .catch(error => {
        console.error("Failed to load posts:", error);
        toast.error("Failed to load posts 😭");
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
    if (newCommentText.trim() === '') return toast.warning("Please enter a comment");

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
        toast.success("Comment added successfully!");
      })
      .catch(error => {
        console.error("Failed to add comment:", error);
        toast.error("Failed to add comment 😢");
      });
  };

  const handleDeleteComment = (postId, commentId) => {
    // Use SweetAlert2 for a beautiful confirmation dialog
    Swal.fire({
      title: 'Delete Comment',
      text: 'Are you sure you want to delete this comment?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes, delete it!',
      cancelButtonText: 'Cancel'
    }).then((result) => {
      if (result.isConfirmed) {
        // User confirmed, proceed with deletion
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
            
            // Show success message with SweetAlert2
            Swal.fire({
              title: 'Deleted!',
              text: 'Your comment has been deleted.',
              icon: 'success',
              timer: 1500,
              showConfirmButton: false
            });
          })
          .catch(error => {
            console.error("Failed to delete comment:", error);
            
            // Show error message with SweetAlert2
            Swal.fire({
              title: 'Error!',
              text: 'Failed to delete comment.',
              icon: 'error',
              confirmButtonText: 'OK'
            });
          });
      }
    });
  };

  const handleEditComment = (commentId, currentText) => {
    setEditingCommentId(commentId);
    setEditingCommentText(currentText);
  };

  const handleSaveEdit = (postId, commentId) => {
    if (editingCommentText.trim() === '') return toast.warning("Comment cannot be empty");

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
        toast.success("Comment updated successfully!");
      })
      .catch(error => {
        console.error("Failed to edit comment:", error);
        toast.error("Failed to edit comment 😢");
      });
  };

  const isUserComment = (comment) => {
    return storedUser && storedUser.id === comment.userId;
  };

  const toggleLike = (postId) => {
    // Get current like status
    const isLiked = likedPosts[postId];
    
    // If no user is logged in, create a basic user object
    let user = storedUser;
    if (!user) {
      user = {
        id: Math.floor(Math.random() * 10000) + 1,
        userName: 'Anonymous'
      };
      localStorage.setItem("user", JSON.stringify(user));
    }
    
    // Optimistically update UI
    const updatedLikes = {
      ...likedPosts,
      [postId]: !isLiked
    };
    
    const updatedCounts = {
      ...likeCounts,
      [postId]: (likeCounts[postId] || 0) + (isLiked ? -1 : 1)
    };
    
    // Ensure we don't have negative counts
    if (updatedCounts[postId] < 0) {
      updatedCounts[postId] = 0;
    }
    
    setLikedPosts(updatedLikes);
    setLikeCounts(updatedCounts);
    localStorage.setItem("likes", JSON.stringify(updatedLikes));
    
    // Call the toggle endpoint
    axios.post(`http://localhost:8080/api/posts/${postId}/likes/toggle?userId=${user.id}`)
      .then(response => {
        console.log("Toggle like response:", response.data);
        // Refresh like count after toggle
        refreshLikeCount(postId);
      })
      .catch(error => {
        console.error("Failed to toggle like:", error);
        // Revert UI changes on error
        setLikedPosts(prev => ({ ...prev, [postId]: isLiked }));
        setLikeCounts(prev => ({ ...prev, [postId]: likeCounts[postId] }));
        toast.error("Failed to update like status 😢");
      });
  };
  
  // Helper function to refresh like count for a post
  const refreshLikeCount = (postId) => {
    axios.get(`http://localhost:8080/api/posts/${postId}/likes/count`)
      .then(response => {
        setLikeCounts(prev => ({ ...prev, [postId]: response.data }));
      })
      .catch(error => {
        console.error("Failed to refresh like count:", error);
      });
  };

  // Function to share post on WhatsApp
  const shareOnWhatsApp = (post) => {
    // Base URL of your application (change this in production)
    const baseUrl = window.location.origin;
    
    // Create post URL - assuming you'd have a route like /post/[id]
    // Modify this URL structure based on your actual routing setup
    const postUrl = `${baseUrl}/post/${post.id}`;
    
    // Create shareable text content with the link more prominently displayed
    // WhatsApp will automatically make this URL clickable in the chat
    const text = `Check out this post: "${post.title}"\n\n${post.description}\n\n${postUrl}`;
    
    // Create WhatsApp share URL
    const shareUrl = `https://wa.me/?text=${encodeURIComponent(text)}`;
    
    // Open WhatsApp share in a new window
    window.open(shareUrl, '_blank');
    toast.info("Sharing post on WhatsApp");
  };

  return (
    <div className="home-container">
      <ToastContainer position="top-right" autoClose={3000} hideProgressBar={false} />
      <div className="page-header"></div>

      <div className="action-buttons">
        <button onClick={() => navigate('/create')} className="btn create-post-btn">
          Create New Post
        </button>
        <button onClick={() => navigate('/profile')} className="btn profile-btn">
          Your Profile
        </button>
        <button onClick={() => navigate('/groups')} className="btn groups-btn">
          Community Groups
        </button>
      </div>

      <div className="posts-container">
        {posts.length > 0 ? (
          posts.map(post => {
            const avatarUrl = `https://api.dicebear.com/7.x/thumbs/svg?seed=${encodeURIComponent(post.userName || 'user')}`;
            const isLiked = likedPosts[post.id];

            return (
              <div key={post.id} className="post-card">
                <div className="post-header">
                  <img src={avatarUrl} alt="avatar" className="avatar" />
                  <p className="user-name">{post.userName}</p>
                </div>

                <h3 className="post-title">{post.title}</h3>

               
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


                <p className="post-description">{post.description}</p>

                <div className="post-actions">
                  <button
                    className="heart-button"
                    onClick={() => toggleLike(post.id)}
                    aria-label={isLiked ? "Unlike post" : "Like post"}
                  >
                    <svg 
                      className="heart-icon" 
                      viewBox="0 0 24 24" 
                      width="24" 
                      height="24" 
                      stroke="currentColor" 
                      strokeWidth="2" 
                      fill={isLiked ? "red" : "none"} 
                      strokeLinecap="round" 
                      strokeLinejoin="round"
                    >
                      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
                    </svg>
                    <span className="like-count">{likeCounts[post.id] || 0}</span>
                  </button>
                  <button onClick={() => toggleComments(post.id)}>
                    💬 Comment ({commentCounts[post.id] || 0})
                  </button>
                  <button onClick={() => shareOnWhatsApp(post)}>🔗 Share</button>
                </div>

                {expandedPostId === post.id && (
                  <div className="comments-container">
                    {comments[post.id] ? (
                      comments[post.id].length > 0 ? (
                        <div className="comments-list">
                          {comments[post.id].map((comment, index) => (
                            <div
                              key={index}
                              className={`comment-item ${isUserComment(comment) ? 'user-comment' : ''} ${selectedCommentId === comment.id ? 'selected-comment' : ''}`}
                              onClick={() => {
                                if (isUserComment(comment)) {
                                  setSelectedCommentId(selectedCommentId === comment.id ? null : comment.id);
                                }
                              }}
                            >
                              <strong>{comment.username || comment.userName || 'Anonymous'}</strong>:&nbsp;
                              {editingCommentId === comment.id ? (
                                <>
                                  <input
                                    value={editingCommentText}
                                    onChange={(e) => setEditingCommentText(e.target.value)}
                                    onClick={(e) => e.stopPropagation()}
                                  />
                                  <button
                                    className="comment-btn"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleSaveEdit(post.id, comment.id);
                                    }}
                                  >
                                    Save
                                  </button>
                                  <button
                                    className="cancel-btn"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setEditingCommentId(null);
                                    }}
                                  >
                                    Cancel
                                  </button>
                                </>
                              ) : (
                                <>
                                  {comment.content}
                                  {isUserComment(comment) && selectedCommentId === comment.id && (
                                    <div className="comment-actions">
                                      <button
                                        className="edit-btn"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          handleEditComment(comment.id, comment.content);
                                        }}
                                      >
                                        Edit
                                      </button>
                                      <button
                                        className="delete-btn"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          handleDeleteComment(post.id, comment.id);
                                        }}
                                      >
                                        Delete
                                      </button>
                                    </div>
                                  )}
                                </>
                              )}
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p>No comments yet. Be the first to comment!</p>
                      )
                    ) : (
                      <p>Loading comments...</p>
                    )}

                    <div className="add-comment-section">
                      <textarea
                        rows="2"
                        placeholder="Write a comment..."
                        value={newCommentText}
                        onChange={(e) => setNewCommentText(e.target.value)}
                      />
                      <button className="comment-btn" onClick={() => handleAddComment(post.id)}>
                        Post Comment
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })
        ) : (
          <p>No posts to display. Please check back later.</p>
        )}
      </div>
    </div>
  );
}

export default Home;