import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import RecipeService from '../services/RecipeService';
import { useUser } from './UserContext';
import '../styles/Recipe.css';
import Swal from 'sweetalert2';

const RecipeDetail = () => {
    const { id } = useParams();
    const [recipe, setRecipe] = useState(null);
    const [loading, setLoading] = useState(true);
    const [comment, setComment] = useState('');
    const [comments, setComments] = useState([]);
    const [submitting, setSubmitting] = useState(false);
    const { user } = useUser();
    const navigate = useNavigate();

    useEffect(() => {
        fetchRecipe();
        fetchComments();
    }, [id]);

    const fetchRecipe = () => {
        RecipeService.getRecipeById(id)
            .then(response => {
                setRecipe(response.data);
                setLoading(false);
            })
            .catch(error => {
                console.error('Error fetching recipe:', error);
                setLoading(false);
            });
    };

    const fetchComments = () => {
        RecipeService.getComments(id)
            .then(response => {
                setComments(response.data);
            })
            .catch(error => {
                console.error('Error fetching comments:', error);
            });
    };

    const handleDelete = () => {
        Swal.fire({
            title: 'Delete Recipe?',
            text: 'This action cannot be undone!',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'Yes, delete it!',
            cancelButtonText: 'Cancel'
        }).then((result) => {
            if (result.isConfirmed) {
                RecipeService.deleteRecipe(id, user.id)
                    .then(() => {
                        Swal.fire(
                            'Deleted!',
                            'Your recipe has been deleted.',
                            'success'
                        );
                        navigate('/recipes');
                    })
                    .catch(error => {
                        console.error('Error deleting recipe:', error);
                        Swal.fire(
                            'Error!',
                            'Failed to delete recipe. Please try again.',
                            'error'
                        );
                    });
            }
        });
    };

    const handleSubmitComment = (e) => {
        e.preventDefault();
        if (!comment.trim()) return;
        
        setSubmitting(true);
        const commentData = {
            content: comment
        };
        
        RecipeService.addComment(id, commentData, user.id)
            .then(response => {
                setComments([response.data, ...comments]);
                setComment('');
                setSubmitting(false);
                
                // Show success notification
                Swal.fire({
                    icon: 'success',
                    title: 'Comment Posted!',
                    text: 'Your comment has been added.',
                    timer: 1500,
                    showConfirmButton: false
                });
            })
            .catch(error => {
                console.error('Error adding comment:', error);
                setSubmitting(false);
                Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: 'Failed to add comment. Please try again.'
                });
            });
    };

    const formatDate = (timestamp) => {
        return new Date(timestamp).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    if (loading) {
        return (
            <div className="recipe-container">
                <div className="loading-container">
                    <div className="loading-spinner"></div>
                    <p>Loading recipe...</p>
                </div>
            </div>
        );
    }

    if (!recipe) {
        return (
            <div className="recipe-container">
                <p>Recipe not found.</p>
                <Link to="/recipes" className="btn btn-primary">Back to Recipes</Link>
            </div>
        );
    }

    return (
        <div className="recipe-detail-container">
            <div className="recipe-detail">
                <div className="recipe-detail-header">
                    <h1 className="recipe-detail-title">{recipe.title}</h1>
                    <div className="recipe-detail-meta">
                        <p className="recipe-detail-author">By {recipe.userName} • {formatDate(recipe.createdAt)}</p>
                        {recipe.cuisine && (
                            <span className="recipe-detail-cuisine">{recipe.cuisine}</span>
                        )}
                    </div>
                </div>

                <div className="recipe-detail-nav">
                    <button onClick={() => navigate('/recipes')} className="btn btn-secondary">
                        Back to Recipes
                    </button>
                    {user && user.id === recipe.userId && (
                        <div className="recipe-owner-actions">
                            <Link to={`/recipes/${recipe.id}/edit`} className="btn btn-edit">Edit Recipe</Link>
                            <button onClick={handleDelete} className="btn btn-delete">Delete Recipe</button>
                        </div>
                    )}
                </div>

                {recipe.imageUrl && (
                    <img
                        src={recipe.imageUrl}
                        alt={recipe.title}
                        className="recipe-detail-image"
                    />
                )}

                <div className="recipe-detail-stats">
                    <div className="recipe-stat">
                        <div className="recipe-stat-icon">⏱️</div>
                        <div className="recipe-stat-value">{recipe.prepTimeMinutes}</div>
                        <div className="recipe-stat-label">Prep Time (min)</div>
                    </div>
                    <div className="recipe-stat">
                        <div className="recipe-stat-icon">🍳</div>
                        <div className="recipe-stat-value">{recipe.cookTimeMinutes}</div>
                        <div className="recipe-stat-label">Cook Time (min)</div>
                    </div>
                    <div className="recipe-stat">
                        <div className="recipe-stat-icon">👥</div>
                        <div className="recipe-stat-value">{recipe.servings}</div>
                        <div className="recipe-stat-label">Servings</div>
                    </div>
                </div>

                {recipe.dietaryPreferences && recipe.dietaryPreferences.length > 0 && recipe.dietaryPreferences[0] !== '' && (
                    <div className="recipe-dietary-preferences">
                        <h3 className="dietary-title">Dietary Information</h3>
                        <div className="dietary-tags">
                            {recipe.dietaryPreferences.map((pref, index) => (
                                <span key={index} className="recipe-dietary-tag">{pref}</span>
                            ))}
                        </div>
                    </div>
                )}

                <div className="recipe-detail-section">
                    <h2 className="recipe-detail-section-title">Ingredients</h2>
                    <ul className="recipe-ingredients-list">
                        {recipe.ingredients.map((ingredient, index) => (
                            <li key={index} className="recipe-ingredient-item">{ingredient}</li>
                        ))}
                    </ul>
                </div>

                <div className="recipe-detail-section">
                    <h2 className="recipe-detail-section-title">Instructions</h2>
                    <div className="recipe-instructions">
                        {recipe.instructions}
                    </div>
                </div>

                <div className="recipe-comments-section">
                    <h2 className="recipe-comments-title">Comments</h2>
                    
                    {user ? (
                        <form onSubmit={handleSubmitComment} className="comment-form">
                            <textarea
                                placeholder="Add a comment..."
                                value={comment}
                                onChange={(e) => setComment(e.target.value)}
                                className="comment-textarea"
                                required
                            />
                            <button type="submit" className="btn btn-primary comment-submit-btn" disabled={submitting}>
                                {submitting ? 'Posting...' : 'Post Comment'}
                            </button>
                        </form>
                    ) : (
                        <div className="login-to-comment">
                            <p>Please <Link to="/">log in</Link> to add a comment.</p>
                        </div>
                    )}
                    
                    <div className="comment-list">
                        {comments.length === 0 ? (
                            <p className="no-comments-message">No comments yet. Be the first to comment!</p>
                        ) : (
                            comments.map(comment => (
                                <div key={comment.id} className="comment-item">
                                    <div className="comment-header">
                                        <span className="comment-author">{comment.userName}</span>
                                        <span className="comment-date">{formatDate(comment.createdAt)}</span>
                                    </div>
                                    <div className="comment-content">{comment.content}</div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default RecipeDetail; 