const AuthSystem = {
  baseURL: 'http://localhost:5000/api',
  
  // Save token to localStorage
  setToken(token) {
    localStorage.setItem('skillswap_token', token);
  },
  
  // Get token from localStorage
  getToken() {
    return localStorage.getItem('skillswap_token');
  },
  
  // Make API requests with authentication
  async apiCall(endpoint, options = {}) {
    const token = this.getToken();
    const defaultOptions = {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': token ? `Bearer ${token}` : ''
      }
    };
    
    const response = await fetch(`${this.baseURL}${endpoint}`, {
      ...defaultOptions,
      ...options,
      headers: {
        ...defaultOptions.headers,
        ...options.headers
      }
    });
    
    return await response.json();
  },
  
  // Updated register function
  async register(userData) {
    try {
      const response = await this.apiCall('/auth/register', {
        method: 'POST',
        body: JSON.stringify(userData)
      });
      
      if (response.success) {
        this.setToken(response.token);
        localStorage.setItem('skillswap_user', JSON.stringify(response.user));
        this.showMessage('Registration successful!', 'success');
        
        // Redirect to profile page
        setTimeout(() => {
          window.location.href = 'profile.html';
        }, 1500);
      } else {
        this.showMessage(response.message, 'error');
      }
      
      return response;
    } catch (error) {
      this.showMessage('Network error. Please try again.', 'error');
      return { success: false, message: 'Network error' };
    }
  },
  
  // Updated login function
  async login(email, password) {
    try {
      const response = await this.apiCall('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password })
      });
      
      if (response.success) {
        this.setToken(response.token);
        localStorage.setItem('skillswap_user', JSON.stringify(response.user));
        this.showMessage('Login successful!', 'success');
        
        // Redirect based on role
        setTimeout(() => {
          if (response.user.role === 'admin') {
            window.location.href = 'admin.html';
          } else {
            window.location.href = 'dashboard.html';
          }
        }, 1500);
      } else {
        this.showMessage(response.message, 'error');
      }
      
      return response;
    } catch (error) {
      this.showMessage('Network error. Please try again.', 'error');
      return { success: false, message: 'Network error' };
    }
  },
  
  // Check if user is logged in
  isLoggedIn() {
    return !!this.getToken();
  },
  
  // Get current user
  getCurrentUser() {
    const user = localStorage.getItem('skillswap_user');
    return user ? JSON.parse(user) : null;
  },
  
  // Logout
  logout() {
    localStorage.removeItem('skillswap_token');
    localStorage.removeItem('skillswap_user');
    window.location.href = 'index.html';
  },
  
  // Show messages
  showMessage(message, type = 'info') {
    // Create toast notification
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.textContent = message;
    toast.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      padding: 12px 20px;
      border-radius: 5px;
      color: white;
      z-index: 10000;
      background: ${type === 'success' ? '#4bb543' : type === 'error' ? '#e63946' : '#4361ee'};
    `;
    
    document.body.appendChild(toast);
    
    setTimeout(() => {
      toast.remove();
    }, 3000);
  }
};