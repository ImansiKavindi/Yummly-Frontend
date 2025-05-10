import axios from 'axios';

const API_URL = '/api/recipes';

class RecipeService {
    // Get all recipes
    getAllRecipes() {
        return axios.get(API_URL);
    }
    
    // Get latest recipes
    getLatestRecipes() {
        return axios.get(`${API_URL}/latest`);
    }
    
    // Get recipe by ID
    getRecipeById(id) {
        return axios.get(`${API_URL}/${id}`);
    }
    
    // Create new recipe
    createRecipe(recipeData, userId) {
        return axios.post(API_URL, recipeData, {
            headers: { 'userid': userId }
        });
    }
    
    // Update recipe
    updateRecipe(id, recipeData, userId) {
        return axios.put(`${API_URL}/${id}`, recipeData, {
            headers: { 'userid': userId }
        });
    }
    
    // Delete recipe
    deleteRecipe(id, userId) {
        return axios.delete(`${API_URL}/${id}`, {
            headers: { 'userid': userId }
        });
    }
    
    // Get recipes by user
    getRecipesByUser(userId) {
        return axios.get(`${API_URL}/user/${userId}`);
    }
    
    // Search recipes
    searchRecipes(params) {
        return axios.get(`${API_URL}/search`, { params });
    }
    
    // Add comment to recipe
    addComment(recipeId, commentData, userId) {
        return axios.post(`${API_URL}/${recipeId}/comments`, commentData, {
            headers: { 'userid': userId }
        });
    }
    
    // Get comments for recipe
    getComments(recipeId) {
        return axios.get(`${API_URL}/${recipeId}/comments`);
    }
}

export default new RecipeService(); 