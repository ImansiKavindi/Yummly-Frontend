import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';
import { useParams } from 'react-router-dom';
import { useUser } from './UserContext'; // ✅ Import UserContext

function Comments() {
  const { postId } = useParams();
  const { user } = useUser(); // ✅ Use logged-in user from context

  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [editingCommentId, setEditingCommentId] = useState(null);
  const [editingText, setEditingText] = useState('');

  const fetchComments = async () => {
    try {
      const response = await axios.get(`http://localhost:8080/api/comments/post/${postId}`);
      setComments(response.data);
    } catch (error) {
      console.error('❌ Failed to fetch comments:', error);
    }
  };

  useEffect(() => {
    fetchComments();
  }, [postId]);

  const handleAddComment = async () => {
    if (!user) {
      Swal.fire('Warning', 'Please login to comment.', 'warning');
      return;
    }
    if (!newComment.trim()) {
      Swal.fire('Error', 'Comment cannot be empty.', 'error');
      return;
    }
    try {
      await axios.post('http://localhost:8080/api/comments', {
        userId: user.id,
        postId: postId,
        content: newComment,
      });
      setNewComment('');
      fetchComments();
      Swal.fire('Success', 'Comment added!', 'success');
    } catch (error) {
      console.error('❌ Failed to add comment:', error);
      Swal.fire('Error', 'Failed to add comment.', 'error');
    }
  };

  const handleDeleteComment = async (commentId) => {
    try {
      await axios.delete(`http://localhost:8080/api/comments/${commentId}`);
      fetchComments();
      Swal.fire('Deleted!', 'Your comment has been deleted.', 'success');
    } catch (error) {
      console.error('❌ Failed to delete comment:', error);
      Swal.fire('Error', 'Failed to delete comment.', 'error');
    }
  };

  const handleEdit = (commentId, content) => {
    setEditingCommentId(commentId);
    setEditingText(content);
  };

  const handleUpdateComment = async () => {
    try {
      await axios.put(`http://localhost:8080/api/comments/${editingCommentId}`, {
        content: editingText,
      });
      setEditingCommentId(null);
      setEditingText('');
      fetchComments();
      Swal.fire('Success', 'Comment updated!', 'success');
    } catch (error) {
      console.error('❌ Failed to update comment:', error);
      Swal.fire('Error', 'Failed to update comment.', 'error');
    }
  };

  return (
    <div className="comments-container">
      <h3>Comments 💬</h3>

      <div className="add-comment-section">
        <textarea
          placeholder="Write a comment..."
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          rows={3}
        />
        <button onClick={handleAddComment}>Post Comment</button>
      </div>

      <h4>Total Comments: {comments.length}</h4>

      <div className="comments-list">
        {comments.map((comment) => (
          <div key={comment.id} className="comment-item">
            <p><strong>{comment.userName}</strong>:</p>

            {editingCommentId === comment.id ? (
              <>
                <textarea
                  value={editingText}
                  onChange={(e) => setEditingText(e.target.value)}
                  rows={2}
                />
                <button onClick={handleUpdateComment}>Save</button>
                <button onClick={() => setEditingCommentId(null)}>Cancel</button>
              </>
            ) : (
              <>
                <p>{comment.content}</p>
                {user && user.id === comment.userId && (
                  <div className="comment-actions">
                    <button onClick={() => handleEdit(comment.id, comment.content)}>Edit</button>
                    <button onClick={() => handleDeleteComment(comment.id)}>Delete</button>
                  </div>
                )}
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export default Comments;
