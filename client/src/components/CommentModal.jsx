import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './CommentModal.css';

const CommentModal = ({ reportId, onClose, onCommentAdded }) => {
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchComments = async () => {
      const token = localStorage.getItem('token');
      try {
        setLoading(true);
        const res = await axios.get(`/api/reports/${reportId}/comments`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setComments(res.data);
      } catch (error) {
        console.error("Failed to fetch comments", error);
      } finally {
        setLoading(false);
      }
    };
    fetchComments();
  }, [reportId]);

  const handleSubmitComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    const token = localStorage.getItem('token');
    try {
      const res = await axios.post(`/api/reports/${reportId}/comments`, 
        { text: newComment },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      // Add the new comment to the top of the list instantly
      setComments(prev => [res.data, ...prev]);
      setNewComment("");
      onCommentAdded(); // Notify the parent to update the count
    } catch (error) {
      console.error("Failed to post comment", error);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Comments</h2>
          <button onClick={onClose} className="modal-close-btn">&times;</button>
        </div>
        <div className="comments-list">
          {loading ? <p>Loading comments...</p> : (
            comments.map(comment => (
              <div key={comment._id} className="comment-item">
                <p className="comment-author">{comment.author.name}</p>
                <p className="comment-text">{comment.text}</p>
              </div>
            ))
          )}
          {(!loading && comments.length === 0) && <p>No comments yet. Be the first!</p>}
        </div>
        <form onSubmit={handleSubmitComment} className="comment-form">
          <textarea
            className="comment-textarea"
            placeholder="Write a comment..."
            value={newComment}
            onChange={e => setNewComment(e.target.value)}
          />
          <button type="submit" className="comment-submit-btn" disabled={!newComment.trim()}>
            Post
          </button>
        </form>
      </div>
    </div>
  );
};

export default CommentModal;