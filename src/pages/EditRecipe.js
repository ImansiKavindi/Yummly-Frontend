import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import RecipeService from '../services/RecipeService';
import { useUser } from './UserContext';
import '../styles/Recipe.css';
import Swal from 'sweetalert2';

const EditRecipe = () => {
    const { id } = useParams();
    const [recipe, setRecipe] = useState({
        title: '',
        instructions: '',
        imageUrl: '',
        ingredients: [''],
        cuisine: '',
        dietaryPreferences: [''],
        prepTimeMinutes: '',
        cookTimeMinutes: '',
        servings: ''
    });
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const { user } = useUser();
    const navigate = useNavigate();

    // List of common cuisine types for select dropdown - same as in CreateGroup
    const cuisineTypes = [
        'Italian', 'Mexican', 'Chinese', 'Indian', 'French', 
        'Japanese', 'Thai', 'Mediterranean', 'American', 'Korean',
        'Middle Eastern', 'Vietnamese', 'Greek', 'Spanish', 'Other'
    ];

    useEffect(() => {
        fetchRecipe();
    }, [id]);

    const fetchRecipe = () => {
        RecipeService.getRecipeById(id)
            .then(response => {
                const fetchedRecipe = response.data;
                
                // Ensure we have at least one empty field for ingredients and preferences
                if (fetchedRecipe.ingredients.length === 0) {
                    fetchedRecipe.ingredients = [''];
                }
                if (fetchedRecipe.dietaryPreferences.length === 0) {
                    fetchedRecipe.dietaryPreferences = [''];
                }
                
                setRecipe(fetchedRecipe);
                setLoading(false);
                
                // Check if user is the owner
                if (user && fetchedRecipe.userId !== user.id) {
                    Swal.fire({
                        icon: 'error',
                        title: 'Access Denied',
                        text: 'You can only edit your own recipes.'
                    });
                    navigate(`/recipes/${id}`);
                }
            })
            .catch(error => {
                console.error('Error fetching recipe:', error);
                setLoading(false);
                navigate('/recipes');
                Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: 'Recipe not found or error loading recipe data.'
                });
            });
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setRecipe(prevRecipe => ({
            ...prevRecipe,
            [name]: value
        }));
    };

    const handleIngredientChange = (index, value) => {
        const updatedIngredients = [...recipe.ingredients];
        updatedIngredients[index] = value;
        setRecipe(prevRecipe => ({
            ...prevRecipe,
            ingredients: updatedIngredients
        }));
    };

    const addIngredient = () => {
        setRecipe(prevRecipe => ({
            ...prevRecipe,
            ingredients: [...prevRecipe.ingredients, '']
        }));
    };

    const removeIngredient = (index) => {
        const updatedIngredients = [...recipe.ingredients];
        updatedIngredients.splice(index, 1);
        setRecipe(prevRecipe => ({
            ...prevRecipe,
            ingredients: updatedIngredients
        }));
    };

    const handleDietaryChange = (index, value) => {
        const updatedPreferences = [...recipe.dietaryPreferences];
        updatedPreferences[index] = value;
        setRecipe(prevRecipe => ({
            ...prevRecipe,
            dietaryPreferences: updatedPreferences
        }));
    };

    const addDietaryPreference = () => {
        setRecipe(prevRecipe => ({
            ...prevRecipe,
            dietaryPreferences: [...prevRecipe.dietaryPreferences, '']
        }));
    };

    const removeDietaryPreference = (index) => {
        const updatedPreferences = [...recipe.dietaryPreferences];
        updatedPreferences.splice(index, 1);
        setRecipe(prevRecipe => ({
            ...prevRecipe,
            dietaryPreferences: updatedPreferences
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!user) {
            Swal.fire({
                icon: 'error',
                title: 'Authentication Required',
                text: 'You must be logged in to edit a recipe'
            });
            navigate('/');
            return;
        }

        // Validate required fields
        if (!recipe.title.trim() || !recipe.instructions.trim()) {
            Swal.fire({
                icon: 'warning',
                title: 'Missing Information',
                text: 'Title and instructions are required'
            });
            return;
        }

        // Clean up empty ingredients and preferences
        const cleanRecipe = {
            ...recipe,
            ingredients: recipe.ingredients.filter(ing => ing.trim() !== ''),
            dietaryPreferences: recipe.dietaryPreferences.filter(pref => pref.trim() !== ''),
            prepTimeMinutes: parseInt(recipe.prepTimeMinutes) || 0,
            cookTimeMinutes: parseInt(recipe.cookTimeMinutes) || 0,
            servings: parseInt(recipe.servings) || 1
        };

        setSaving(true);
        RecipeService.updateRecipe(id, cleanRecipe, user.id)
            .then(() => {
                setSaving(false);
                Swal.fire({
                    icon: 'success',
                    title: 'Recipe Updated!',
                    text: 'Your recipe has been updated successfully.'
                });
                navigate(`/recipes/${id}`);
            })
            .catch(error => {
                console.error('Error updating recipe:', error);
                setSaving(false);
                Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: 'Failed to update recipe. Please try again.'
                });
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

    return (
        <div className="recipe-form-container">
            <div className="form-header">
                <h1 className="recipe-form-title">Edit Recipe</h1>
                <button className="btn btn-secondary" onClick={() => navigate(`/recipes/${id}`)}>
                    Back to Recipe
                </button>
            </div>
            
            <div className="recipe-form">
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label className="form-label">Title*</label>
                        <input
                            type="text"
                            name="title"
                            className="form-control"
                            value={recipe.title}
                            onChange={handleChange}
                            placeholder="Enter recipe title"
                            required
                        />
                    </div>
                    
                    <div className="form-group">
                        <label className="form-label">Cuisine*</label>
                        <select
                            name="cuisine"
                            className="form-control form-select"
                            value={recipe.cuisine}
                            onChange={handleChange}
                            required
                        >
                            <option value="">Select a cuisine type</option>
                            {cuisineTypes.map(cuisine => (
                                <option key={cuisine} value={cuisine}>{cuisine}</option>
                            ))}
                        </select>
                    </div>
                    
                    <div className="form-group">
                        <label className="form-label">Image URL</label>
                        <input
                            type="url"
                            name="imageUrl"
                            className="form-control"
                            value={recipe.imageUrl}
                            onChange={handleChange}
                            placeholder="https://example.com/image.jpg"
                        />
                        <span className="form-hint">Add an image URL for your recipe</span>
                    </div>
                    
                    <div className="form-row">
                        <div className="form-group">
                            <label className="form-label">Prep Time (minutes)</label>
                            <input
                                type="number"
                                name="prepTimeMinutes"
                                className="form-control"
                                value={recipe.prepTimeMinutes}
                                onChange={handleChange}
                                min="0"
                            />
                        </div>
                        
                        <div className="form-group">
                            <label className="form-label">Cook Time (minutes)</label>
                            <input
                                type="number"
                                name="cookTimeMinutes"
                                className="form-control"
                                value={recipe.cookTimeMinutes}
                                onChange={handleChange}
                                min="0"
                            />
                        </div>
                        
                        <div className="form-group">
                            <label className="form-label">Servings</label>
                            <input
                                type="number"
                                name="servings"
                                className="form-control"
                                value={recipe.servings}
                                onChange={handleChange}
                                min="1"
                            />
                        </div>
                    </div>
                    
                    <div className="form-group">
                        <label className="form-label">Ingredients*</label>
                        <div className="dynamic-inputs">
                            {recipe.ingredients.map((ingredient, index) => (
                                <div key={index} className="dynamic-input-row">
                                    <input
                                        type="text"
                                        className="form-control"
                                        value={ingredient}
                                        onChange={(e) => handleIngredientChange(index, e.target.value)}
                                        placeholder="e.g. 2 cups flour"
                                    />
                                    {recipe.ingredients.length > 1 && (
                                        <button 
                                            type="button" 
                                            onClick={() => removeIngredient(index)}
                                            className="remove-input-btn"
                                        >×</button>
                                    )}
                                </div>
                            ))}
                        </div>
                        <button
                            type="button"
                            className="add-input-btn"
                            onClick={addIngredient}
                        >
                            + Add Ingredient
                        </button>
                    </div>
                    
                    <div className="form-group">
                        <label className="form-label">Dietary Preferences</label>
                        <div className="dynamic-inputs">
                            {recipe.dietaryPreferences.map((preference, index) => (
                                <div key={index} className="dynamic-input-row">
                                    <input
                                        type="text"
                                        className="form-control"
                                        value={preference}
                                        onChange={(e) => handleDietaryChange(index, e.target.value)}
                                        placeholder="e.g. Vegetarian, Gluten-Free"
                                    />
                                    {recipe.dietaryPreferences.length > 1 && (
                                        <button 
                                            type="button" 
                                            onClick={() => removeDietaryPreference(index)}
                                            className="remove-input-btn"
                                        >×</button>
                                    )}
                                </div>
                            ))}
                        </div>
                        <button
                            type="button"
                            className="add-input-btn"
                            onClick={addDietaryPreference}
                        >
                            + Add Dietary Preference
                        </button>
                    </div>
                    
                    <div className="form-group">
                        <label className="form-label">Instructions*</label>
                        <textarea
                            name="instructions"
                            className="form-control"
                            value={recipe.instructions}
                            onChange={handleChange}
                            placeholder="Provide step-by-step instructions for preparing the recipe"
                            required
                        />
                    </div>
                    
                    <div className="form-actions">
                        <button type="button" className="btn btn-secondary" onClick={() => navigate(`/recipes/${id}`)}>
                            Cancel
                        </button>
                        <button type="submit" className="btn btn-primary update-btn" disabled={saving}>
                            {saving ? 'Saving...' : 'Save Changes'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default EditRecipe; 