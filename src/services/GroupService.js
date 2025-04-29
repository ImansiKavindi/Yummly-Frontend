import axios from 'axios';

const API_URL = 'http://localhost:8080/api/groups';

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
        return axios.delete(`${API_URL}/${groupId}`, {
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
}

export default new GroupService(); 