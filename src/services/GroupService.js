import axios from 'axios';

const API_URL = '/api/groups';

class GroupService {
    // Get all groups
    getAllGroups() {
        return axios.get(API_URL);
    }
    
    // Get group by ID
    getGroupById(groupId) {
        return axios.get(`${API_URL}/${groupId}`);
    }
    
    // Create new group
    createGroup(groupData, userId) {
        // After creating the group, automatically join the user to the group
        return axios.post(API_URL, groupData, {
            headers: { 'userid': userId }
        });
    }
    
    // Update group
    updateGroup(groupId, groupData, userId) {
        return axios.put(`${API_URL}/${groupId}`, groupData, {
            headers: { 'userid': userId }
        });
    }
    
    // Delete group
    deleteGroup(groupId, userId) {
        // Use DELETE with query parameter instead of POST
        return axios.delete(`${API_URL}/${groupId}?userId=${userId}`, {
            headers: { 'userid': userId }
        });
    }
    
    // Join group
    joinGroup(groupId, userId) {
        return axios.post(`${API_URL}/${groupId}/join`, {}, {
            headers: { 'userid': userId }
        });
    }
    
    // Leave group
    leaveGroup(groupId, userId) {
        return axios.post(`${API_URL}/${groupId}/leave`, {}, {
            headers: { 'userid': userId }
        });
    }
    
    // Get members
    getGroupMembers(groupId) {
        return axios.get(`${API_URL}/${groupId}/members`);
    }
    
    // Get moderators
    getGroupModerators(groupId) {
        return axios.get(`${API_URL}/${groupId}/moderators`);
    }
    
    // Add moderator
    addModerator(groupId, userId, adminId) {
        return axios.post(`${API_URL}/${groupId}/moderators/${userId}`, {}, {
            headers: { 'userid': adminId }
        });
    }
    
    // Remove moderator
    removeModerator(groupId, userId, adminId) {
        return axios.delete(`${API_URL}/${groupId}/moderators/${userId}`, {
            headers: { 'userid': adminId }
        });
    }
    
    // Transfer ownership
    transferOwnership(groupId, newAdminId, currentAdminId) {
        return axios.post(`${API_URL}/${groupId}/transfer-ownership`, 
            { newAdminId }, 
            { headers: { 'userid': currentAdminId } }
        );
    }
    
    // Search groups
    searchGroups(query) {
        return axios.get(`${API_URL}/search?query=${query}`);
    }
    
    // Get groups by member
    getGroupsByMember(userId) {
        return axios.get(`${API_URL}/member/${userId}`, {
            headers: { 'userid': userId }
        });
    }
    
    // Get groups by admin
    getGroupsByAdmin(userId) {
        return axios.get(`${API_URL}/admin/${userId}`, {
            headers: { 'userid': userId }
        });
    }
    
    // Check if user is member
    isMember(groupId, userId) {
        return axios.get(`${API_URL}/${groupId}/is-member`, {
            headers: { 'userid': userId }
        });
    }
    
    // Check if user is moderator
    isModerator(groupId, userId) {
        return axios.get(`${API_URL}/${groupId}/is-moderator`, {
            headers: { 'userid': userId }
        });
    }
    
    // Check if user is admin
    isAdmin(groupId, userId) {
        return axios.get(`${API_URL}/${groupId}/is-admin`, {
            headers: { 'userid': userId }
        });
    }
    
    // Get messages for a group
    getGroupMessages(groupId, userId) {
        return axios.get(`${API_URL}/${groupId}/messages`, {
            headers: { 'userid': userId }
        });
    }
    
    // Create a new message
    createMessage(groupId, content, userId) {
        return axios.post(`${API_URL}/${groupId}/messages`, 
            { content }, 
            { headers: { 'userid': userId } }
        );
    }
    
    // Delete a message
    deleteMessage(groupId, messageId, userId) {
        return axios.delete(`${API_URL}/${groupId}/messages/${messageId}`, {
            headers: { 'userid': userId }
        });
    }
    
    // Remove a member (for moderators and admin)
    removeMember(groupId, userId, requesterId) {
        return axios.delete(`${API_URL}/${groupId}/members/${userId}`, {
            headers: { 'userid': requesterId }
        });
    }

    // Alias for getGroupsByMember used in AllGroups
    getUserGroups(userId) {
        return this.getGroupsByMember(userId);
    }

    // Alias for createMessage used in GroupMessages
    postGroupMessage(groupId, userId, content) {
        return this.createMessage(groupId, content, userId);
    }

    // Alias for deleteMessage used in GroupMessages
    deleteGroupMessage(messageId) {
        // Find the group ID from the URL or context
        // For now, extract from the current URL
        const pathParts = window.location.pathname.split('/');
        const groupId = pathParts[pathParts.indexOf('groups') + 1];
        const userId = document.querySelector('meta[name="userId"]')?.content || localStorage.getItem('userId');
        
        return this.deleteMessage(groupId, messageId, userId);
    }

    // Get user role in group (member, moderator, admin) all in one call
    getUserRoleInGroup(groupId, userId) {
        return axios.get(`${API_URL}/${groupId}/user-role`, {
            headers: { 'userid': userId }
        });
    }
}

export default new GroupService(); 