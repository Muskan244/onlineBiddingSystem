/**
 * API service for interacting with the backend
 */
const API = {
    // Base URL for API requests
    baseUrl: '',
    
    // Authentication endpoints
    auth: {
        login: async (email, password) => {
            try {
                const response = await fetch(`${API.baseUrl}/api/users/login?email=${encodeURIComponent(email)}&password=${encodeURIComponent(password)}`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    }
                });
                
                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.error || 'Login failed');
                }
                
                const data = await response.json();
                // Store user data in localStorage
                localStorage.setItem('user', JSON.stringify(data));
                return data;
            } catch (error) {
                console.error('Login error:', error);
                throw error;
            }
        },
        
        register: async (userData) => {
            try {
                const response = await fetch(`${API.baseUrl}/api/users/register`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(userData),
                });
                
                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.error || 'Registration failed');
                }
                
                return await response.json();
            } catch (error) {
                console.error('Registration error:', error);
                throw error;
            }
        },
        
        logout: () => {
            localStorage.removeItem('user');
            // Dispatch custom event to notify components about auth change
            window.dispatchEvent(new Event('authChange'));
            window.location.href = '#/';
        },
        
        getCurrentUser: () => {
            const user = localStorage.getItem('user');
            return user ? JSON.parse(user) : null;
        }
    },
    
    // Item endpoints
    items: {
        getAll: async () => {
            try {
                const response = await fetch(`${API.baseUrl}/items`);
                
                if (!response.ok) {
                    throw new Error('Failed to fetch items');
                }
                
                return await response.json();
            } catch (error) {
                console.error('Get items error:', error);
                throw error;
            }
        },
        
        getById: async (id) => {
            try {
                const response = await fetch(`${API.baseUrl}/item/${id}`);
                
                if (!response.ok) {
                    throw new Error('Failed to fetch item');
                }
                
                return await response.json();
            } catch (error) {
                console.error(`Get item ${id} error:`, error);
                throw error;
            }
        },
        
        create: async (itemData) => {
            try {
                const user = API.auth.getCurrentUser();
                if (!user) {
                    throw new Error('You must be logged in to create an item');
                }
                
                // Add the current user as the seller
                itemData.seller = { id: user.id };
                
                const response = await fetch(`${API.baseUrl}/item`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(itemData),
                });
                
                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.error || 'Failed to create item');
                }
                
                return await response.json();
            } catch (error) {
                console.error('Create item error:', error);
                throw error;
            }
        },
        
        update: async (id, itemData) => {
            try {
                const user = API.auth.getCurrentUser();
                if (!user) {
                    throw new Error('You must be logged in to update an item');
                }
                
                // Verify the user is the seller of this item
                if (!itemData.seller || itemData.seller.id !== user.id) {
                    throw new Error('You can only update your own items');
                }
                
                const response = await fetch(`${API.baseUrl}/item/${id}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(itemData),
                });
                
                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.error || 'Failed to update item');
                }
                
                return await response.json();
            } catch (error) {
                console.error(`Update item ${id} error:`, error);
                throw error;
            }
        },
        
        delete: async (id) => {
            try {
                const user = API.auth.getCurrentUser();
                if (!user) {
                    throw new Error('You must be logged in to delete an item');
                }
                
                // Get the item first to verify ownership
                const item = await API.items.getById(id);
                if (!item.seller || item.seller.id !== user.id) {
                    throw new Error('You can only delete your own items');
                }
                
                const response = await fetch(`${API.baseUrl}/item/${id}`, {
                    method: 'DELETE',
                });
                
                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.error || 'Failed to delete item');
                }
                
                return true;
            } catch (error) {
                console.error(`Delete item ${id} error:`, error);
                throw error;
            }
        }
    },
    
    // Bid endpoints
    bids: {
        place: async (bidData) => {
            try {
                const user = API.auth.getCurrentUser();
                if (!user) {
                    throw new Error('You must be logged in to place a bid');
                }
                
                // Add the current user ID to the bid data
                bidData.userId = user.id;
                
                const response = await fetch(`${API.baseUrl}/api/bids/place`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(bidData),
                });
                
                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.error || 'Failed to place bid');
                }
                
                return await response.json();
            } catch (error) {
                console.error('Place bid error:', error);
                throw error;
            }
        },
        
        getByItemId: async (itemId) => {
            try {
                const response = await fetch(`${API.baseUrl}/api/bids/item/${itemId}`);
                
                if (!response.ok) {
                    throw new Error('Failed to fetch bids');
                }
                
                return await response.json();
            } catch (error) {
                console.error(`Get bids for item ${itemId} error:`, error);
                throw error;
            }
        },
        
        getByUserId: async (userId) => {
            try {
                const response = await fetch(`${API.baseUrl}/api/bids/user/${userId}`);
                
                if (!response.ok) {
                    throw new Error('Failed to fetch bids');
                }
                
                return await response.json();
            } catch (error) {
                console.error(`Get bids for user ${userId} error:`, error);
                throw error;
            }
        }
    },
    
    // User endpoints
    users: {
        getById: async (id) => {
            try {
                const response = await fetch(`${API.baseUrl}/api/users/profile/${id}`);
                
                if (!response.ok) {
                    throw new Error('Failed to fetch user');
                }
                
                return await response.json();
            } catch (error) {
                console.error(`Get user ${id} error:`, error);
                throw error;
            }
        },
        
        update: async (id, userData) => {
            try {
                const currentUser = API.auth.getCurrentUser();
                if (!currentUser || currentUser.id !== id) {
                    throw new Error('You can only update your own profile');
                }
                
                const response = await fetch(`${API.baseUrl}/api/users/update/${id}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(userData),
                });
                
                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.error || 'Failed to update user');
                }
                
                const updatedUser = await response.json();
                
                // Update the stored user data
                localStorage.setItem('user', JSON.stringify(updatedUser));
                
                return updatedUser;
            } catch (error) {
                console.error(`Update user ${id} error:`, error);
                throw error;
            }
        }
    }
};
