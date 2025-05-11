import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import RecipeService from '../services/RecipeService';
import { useUser } from './UserContext';
import '../styles/Recipe.css';
import Swal from 'sweetalert2';

const Recipes = () => {
    const [recipes, setRecipes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [filters, setFilters] = useState({
        ingredient: '',
        cuisine: '',
        dietaryPreference: ''
    });
    const { user } = useUser();
    const navigate = useNavigate();

    useEffect(() => {
        fetchRecipes();
    }, []);

    const fetchRecipes = () => {
        setLoading(true);
        RecipeService.getAllRecipes()
            .then(response => {
                setRecipes(response.data);
                setLoading(false);
            })
            .catch(error => {
                console.error('Error fetching recipes:', error);
                setLoading(false);
            });
    };

    const handleSearch = (e) => {
        e.preventDefault();
        
        const params = {};
        if (searchQuery.trim()) {
            params.query = searchQuery.trim();
        }
        if (filters.ingredient.trim()) {
            params.ingredient = filters.ingredient.trim();
        }
        if (filters.cuisine.trim()) {
            params.cuisine = filters.cuisine.trim();
        }
        if (filters.dietaryPreference.trim()) {
            params.dietaryPreference = filters.dietaryPreference.trim();
        }
        
        setLoading(true);
        RecipeService.searchRecipes(params)
            .then(response => {
                setRecipes(response.data);
                setLoading(false);
            })
            .catch(error => {
                console.error('Error searching recipes:', error);
                setLoading(false);
            });
    };

    const handleDelete = (e, recipeId) => {
        e.stopPropagation();
        
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
                RecipeService.deleteRecipe(recipeId, user.id)
                    .then(() => {
                        setRecipes(recipes.filter(recipe => recipe.id !== recipeId));
                        Swal.fire(
                            'Deleted!',
                            'Your recipe has been deleted.',
                            'success'
                        );
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

    const formatDate = (timestamp) => {
        return new Date(timestamp).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        setFilters(prevFilters => ({
            ...prevFilters,
            [name]: value
        }));
    };

    return (
        <div className="recipe-container recipe-form-container">
            <div className="recipe-header">
                <h1>Recipe Dashboard</h1>
                <button onClick={() => navigate('/home')} className="btn btn-secondary">Back to Home</button>
            </div>

            <div className="recipe-search">
                <h2 className="search-title">Search and Filter</h2>
                <form onSubmit={handleSearch} className="search-form">
                    <input
                        type="text"
                        placeholder="Search recipes..."
                        className="search-input"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                    <button type="submit" className="search-btn">Search</button>
                </form>
                
                <div className="filter-group">
                    <div>
                        <span className="filter-label">Ingredient:</span>
                        <input
                            type="text"
                            name="ingredient"
                            className="search-input"
                            placeholder="e.g. chicken"
                            value={filters.ingredient}
                            onChange={handleFilterChange}
                        />
                    </div>
                    
                    <div>
                        <span className="filter-label">Cuisine:</span>
                        <input
                            type="text"
                            name="cuisine"
                            className="search-input"
                            placeholder="e.g. Italian"
                            value={filters.cuisine}
                            onChange={handleFilterChange}
                        />
                    </div>
                    
                    <div>
                        <span className="filter-label">Dietary:</span>
                        <input
                            type="text"
                            name="dietaryPreference"
                            className="search-input"
                            placeholder="e.g. Vegetarian"
                            value={filters.dietaryPreference}
                            onChange={handleFilterChange}
                        />
                    </div>
                </div>
            </div>

            {loading ? (
                <div className="loading-container">
                    <div className="loading-spinner"></div>
                    <p>Loading delicious recipes...</p>
                </div>
            ) : (
                <div className="recipe-list">
                    {recipes.length === 0 ? (
                        <div className="no-recipes">
                            <p>No recipes found. Try a different search or create your own!</p>
                            {user && (
                                <button 
                                    className="btn btn-primary create-recipe-btn-empty" 
                                    onClick={() => navigate('/recipes/create')}
                                >
                                    Create New Recipe
                                </button>
                            )}
                        </div>
                    ) : (
                        recipes.map(recipe => (
                            <div key={recipe.id} className="recipe-card" onClick={() => navigate(`/recipes/${recipe.id}`)}>
                                <div className="recipe-card-image-container">
                                    <img
                                        src={recipe.imageUrl || 'https://via.placeholder.com/300x200?text=No+Image'}
                                        alt={recipe.title}
                                        className="recipe-card-image"
                                    />
                                    {user && user.id === recipe.userId && (
                                        <div className="recipe-card-actions">
                                            <button 
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    navigate(`/recipes/${recipe.id}/edit`);
                                                }}
                                                className="recipe-edit-btn"
                                                title="Edit Recipe"
                                            >
                                                <i className="edit-icon">✏️</i>
                                            </button>
                                            <button 
                                                onClick={(e) => handleDelete(e, recipe.id)}
                                                className="recipe-delete-btn"
                                                title="Delete Recipe"
                                            >
                                                <i className="delete-icon">🗑️</i>
                                            </button>
                                        </div>
                                    )}
                                </div>
                                <div className="recipe-card-content">
                                    <h3 className="recipe-card-title">{recipe.title}</h3>
                                    {recipe.cuisine && (
                                        <span className="recipe-card-cuisine">{recipe.cuisine}</span>
                                    )}
                                    <div className="recipe-card-info">
                                        <span><i className="prep-icon">⏱️</i> {recipe.prepTimeMinutes} min</span>
                                        <span><i className="cook-icon">🍳</i> {recipe.cookTimeMinutes} min</span>
                                    </div>
                                </div>
                                <div className="recipe-card-footer">
                                    <span className="recipe-card-author">By {recipe.userName}</span>
                                    <span className="recipe-card-date">{formatDate(recipe.createdAt)}</span>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            )}

            {user && (
                <div className="floating-action-button" onClick={() => navigate('/recipes/create')}>
                    <span className="plus-icon">+</span>
                    <span className="fab-tooltip">Create Recipe</span>
                </div>
            )}
        </div>
    );
};

export default Recipes; 