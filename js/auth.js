// auth.js - Local Storage Authentication System
class AuthSystem {
    static init() {
        console.log('Initializing SkillSwap data...');
        
        let users = this.getUsers();
        let skills = this.getSkills();
        let exchanges = this.getExchanges();

        // Check if admin user exists, if not create one
        const adminExists = users.find(u => u.email === 'admin@skillswap.com');
        
        if (!adminExists) {
            console.log('Creating admin user...');
            const adminUser = {
                id: 'admin-001',
                name: "SkillSwap Admin",
                email: "admin@skillswap.com",
                password: "admin123",
                avatar: "SA",
                skillsOffered: ["Platform Management", "User Support"],
                skillsWanted: [],
                joinDate: new Date().toISOString(),
                role: "admin",
                profileComplete: true,
                exchanges: []
            };
            users.push(adminUser);
            console.log('Admin user created:', adminUser.email, adminUser.password);
        }

        // Create demo user if not exists
        const demoExists = users.find(u => u.email === 'demo@skillswap.com');
        if (!demoExists) {
            const demoUser = {
                id: '1',
                name: "John Doe",
                email: "demo@skillswap.com",
                password: "password123",
                avatar: "JD",
                skillsOffered: ["Web Development", "Public Speaking"],
                skillsWanted: ["Graphic Design", "Yoga"],
                joinDate: new Date().toISOString(),
                role: "user",
                profileComplete: true,
                exchanges: []
            };
            users.push(demoUser);
        }

        // Initialize sample skills if empty
        if (skills.length === 0) {
            skills = [
                {
                    id: 1,
                    title: "Full-Stack Web Development",
                    category: "technology",
                    description: "Learn to build modern web applications from front-end to back-end with latest technologies.",
                    level: "Advanced",
                    sessions: 10,
                    rating: 4.9,
                    user: { name: "Alex Smith", avatar: "AS" },
                    type: "offer",
                    location: "Online",
                    featured: true
                },
                {
                    id: 2,
                    title: "UI/UX Design Principles",
                    category: "design",
                    description: "Master user-centered design thinking and create beautiful, functional interfaces.",
                    level: "Intermediate",
                    sessions: 8,
                    rating: 4.7,
                    user: { name: "Maria Johnson", avatar: "MJ" },
                    type: "offer",
                    location: "Local"
                }
            ];
        }

        // Initialize sample exchanges if empty
        if (exchanges.length === 0) {
            exchanges = [
                {
                    id: 'ex-001',
                    user1: { id: '1', name: 'John Doe', avatar: 'JD' },
                    user2: { id: '2', name: 'Alex Smith', avatar: 'AS' },
                    skill1: "Web Development",
                    skill2: "UI/UX Design",
                    status: "active",
                    startDate: "2023-10-01",
                    tasks: [
                        { user: '1', task: "Build portfolio website", status: "completed" },
                        { user: '2', task: "Design logo and brand identity", status: "in-progress" }
                    ],
                    messages: []
                }
            ];
        }

        // Save all data
        this.setUsers(users);
        this.setSkills(skills);
        this.setExchanges(exchanges);

        console.log('SkillSwap data initialized successfully!');
        console.log('Available users:', users.map(u => ({ email: u.email, password: u.password, role: u.role })));
        
        this.updateUI();
        return true;
    }

    // Storage methods
    static getUsers() {
        return JSON.parse(localStorage.getItem('skillswap_users') || '[]');
    }

    static setUsers(users) {
        localStorage.setItem('skillswap_users', JSON.stringify(users));
    }

    static getSkills() {
        return JSON.parse(localStorage.getItem('skillswap_skills') || '[]');
    }

    static setSkills(skills) {
        localStorage.setItem('skillswap_skills', JSON.stringify(skills));
    }

    static getExchanges() {
        return JSON.parse(localStorage.getItem('skillswap_exchanges') || '[]');
    }

    static setExchanges(exchanges) {
        localStorage.setItem('skillswap_exchanges', JSON.stringify(exchanges));
    }

    static login(email, password) {
        console.log('Login attempt:', email);
        
        const users = this.getUsers();
        const user = users.find(u => u.email === email && u.password === password);
        
        console.log('Found user:', user);
        
        if (user) {
            localStorage.setItem('skillswap_user', JSON.stringify(user));
            this.updateUI();
            
            this.showMessage(`Welcome back, ${user.name}!`, 'success');
            
            // Redirect based on role
            setTimeout(() => {
                if (user.role === 'admin') {
                    window.location.href = 'admin.html';
                } else {
                    window.location.href = 'dashboard.html';
                }
            }, 1000);
            
            return { success: true, user };
        }
        
        this.showMessage('Invalid email or password', 'error');
        return { success: false, message: 'Invalid credentials' };
    }

    static register(userData) {
        const users = this.getUsers();
        
        if (users.find(u => u.email === userData.email)) {
            this.showMessage('User with this email already exists', 'error');
            return { success: false, message: 'User already exists' };
        }
        
        const newUser = {
            id: Date.now().toString(),
            ...userData,
            joinDate: new Date().toISOString(),
            skillsOffered: [],
            skillsWanted: [],
            exchanges: [],
            avatar: userData.name.split(' ').map(n => n[0]).join('').toUpperCase(),
            role: 'user',
            profileComplete: false
        };
        
        users.push(newUser);
        this.setUsers(users);
        localStorage.setItem('skillswap_user', JSON.stringify(newUser));
        
        this.updateUI();
        this.showMessage('Account created successfully!', 'success');
        
        return { success: true, user: newUser };
    }

    static logout() {
        const user = this.getCurrentUser();
        localStorage.removeItem('skillswap_user');
        this.updateUI();
        this.showMessage(`Goodbye, ${user?.name || 'User'}!`, 'info');
        setTimeout(() => {
            window.location.href = 'index.html';
        }, 1000);
    }

    static getCurrentUser() {
        return JSON.parse(localStorage.getItem('skillswap_user'));
    }

    static isLoggedIn() {
        return !!localStorage.getItem('skillswap_user');
    }

    static isAdmin() {
        const user = this.getCurrentUser();
        return user && user.role === 'admin';
    }

    static updateUI() {
        const user = this.getCurrentUser();
        const authButtons = document.getElementById('authButtons');
        const userMenu = document.getElementById('userMenu');

        // Update auth buttons
        if (authButtons) {
            if (user) {
                let buttonsHTML = `
                    <a href="dashboard.html" class="btn btn-outline">Dashboard</a>
                    <a href="#" class="btn btn-primary" onclick="AuthSystem.logout()">Logout</a>
                `;
                
                // Add admin button if user is admin
                if (this.isAdmin()) {
                    buttonsHTML = `
                        <a href="admin.html" class="btn btn-outline">Admin Panel</a>
                        ${buttonsHTML}
                    `;
                }
                
                authButtons.innerHTML = buttonsHTML;
            } else {
                authButtons.innerHTML = `
                    <a href="login.html" class="btn btn-outline">Log In</a>
                    <a href="register.html" class="btn btn-primary">Register</a>
                `;
            }
        }

        // Update user menu
        if (userMenu && user) {
            userMenu.querySelector('.user-avatar').textContent = user.avatar;
            userMenu.style.display = 'flex';
        }
    }

    // Admin functions
    static getAllUsers() {
        return this.getUsers();
    }

    static getAllExchanges() {
        return this.getExchanges();
    }

    static getAllSkills(filters = {}) {
        let skills = this.getSkills();
        
        if (Object.keys(filters).length === 0) {
            return skills;
        }

        return skills.filter(skill => {
            if (filters.category && filters.category.length > 0 && !filters.category.includes(skill.category)) {
                return false;
            }
            if (filters.search) {
                const searchTerm = filters.search.toLowerCase();
                if (!skill.title.toLowerCase().includes(searchTerm) && 
                    !skill.description.toLowerCase().includes(searchTerm)) {
                    return false;
                }
            }
            if (filters.level && skill.level !== filters.level) {
                return false;
            }
            return true;
        });
    }

    static getUserById(userId) {
        const users = this.getAllUsers();
        return users.find(u => u.id === userId);
    }

    static updateUser(userId, updates) {
        const users = this.getAllUsers();
        const userIndex = users.findIndex(u => u.id === userId);
        
        if (userIndex !== -1) {
            users[userIndex] = { ...users[userIndex], ...updates };
            this.setUsers(users);
            
            // Update current user if it's the same user
            const currentUser = this.getCurrentUser();
            if (currentUser && currentUser.id === userId) {
                localStorage.setItem('skillswap_user', JSON.stringify(users[userIndex]));
                this.updateUI();
            }
            
            this.showMessage('User updated successfully', 'success');
            return true;
        }
        
        this.showMessage('User not found', 'error');
        return false;
    }

    static deleteUser(userId) {
        const users = this.getAllUsers();
        const userIndex = users.findIndex(u => u.id === userId);
        
        if (userIndex !== -1) {
            // Don't allow deleting admin users
            if (users[userIndex].role === 'admin') {
                this.showMessage('Cannot delete admin users', 'error');
                return false;
            }
            
            users.splice(userIndex, 1);
            this.setUsers(users);
            
            // If deleted user is current user, logout
            const currentUser = this.getCurrentUser();
            if (currentUser && currentUser.id === userId) {
                this.logout();
            }
            
            this.showMessage('User deleted successfully', 'success');
            return true;
        }
        
        this.showMessage('User not found', 'error');
        return false;
    }

    static createUser(userData) {
        const users = this.getAllUsers();
        
        if (users.find(u => u.email === userData.email)) {
            this.showMessage('User with this email already exists', 'error');
            return { success: false, message: 'User already exists' };
        }
        
        const newUser = {
            id: Date.now().toString(),
            ...userData,
            joinDate: new Date().toISOString(),
            skillsOffered: [],
            skillsWanted: [],
            exchanges: [],
            avatar: userData.name.split(' ').map(n => n[0]).join('').toUpperCase(),
            profileComplete: false
        };
        
        users.push(newUser);
        this.setUsers(users);
        
        this.showMessage('User created successfully', 'success');
        return { success: true, user: newUser };
    }

    static getExchangeById(exchangeId) {
        const exchanges = this.getAllExchanges();
        return exchanges.find(e => e.id === exchangeId);
    }

    static resolveExchange(exchangeId, resolution) {
        const exchanges = this.getAllExchanges();
        const exchangeIndex = exchanges.findIndex(e => e.id === exchangeId);
        
        if (exchangeIndex !== -1) {
            exchanges[exchangeIndex] = { 
                ...exchanges[exchangeIndex], 
                status: 'resolved',
                resolution: resolution
            };
            this.setExchanges(exchanges);
            return true;
        }
        return false;
    }

    static getPlatformStats() {
        const users = this.getAllUsers();
        const exchanges = this.getAllExchanges();
        const skills = this.getAllSkills();
        
        return {
            totalUsers: users.length,
            totalExchanges: exchanges.length,
            totalSkills: skills.length,
            activeExchanges: exchanges.filter(e => e.status === 'active').length,
            pendingExchanges: exchanges.filter(e => e.status === 'pending').length,
            completedExchanges: exchanges.filter(e => e.status === 'completed').length,
            disputeExchanges: exchanges.filter(e => e.status === 'dispute').length,
            regularUsers: users.filter(u => u.role === 'user').length,
            adminUsers: users.filter(u => u.role === 'admin').length
        };
    }

    // Utility function to show messages
    static showMessage(message, type = 'info') {
        // Remove existing messages
        const existingMessages = document.querySelectorAll('.auth-message');
        existingMessages.forEach(msg => msg.remove());
        
        const messageDiv = document.createElement('div');
        messageDiv.className = `auth-message auth-message-${type}`;
        messageDiv.innerHTML = `
            <span>${message}</span>
            <button onclick="this.parentElement.remove()">&times;</button>
        `;
        
        // Add styles if not already added
        if (!document.querySelector('#auth-message-styles')) {
            const styles = document.createElement('style');
            styles.id = 'auth-message-styles';
            styles.textContent = `
                .auth-message {
                    position: fixed;
                    top: 100px;
                    right: 20px;
                    padding: 15px 20px;
                    border-radius: 10px;
                    color: white;
                    font-weight: 500;
                    z-index: 10000;
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    max-width: 300px;
                    box-shadow: 0 5px 15px rgba(0,0,0,0.2);
                    animation: slideInRight 0.3s ease;
                }
                .auth-message-success { background: var(--success); }
                .auth-message-error { background: var(--error); }
                .auth-message-info { background: var(--primary); }
                .auth-message-warning { background: var(--warning); }
                .auth-message button {
                    background: none;
                    border: none;
                    color: white;
                    font-size: 18px;
                    cursor: pointer;
                    padding: 0;
                    width: 20px;
                    height: 20px;
                }
                @keyframes slideInRight {
                    from { transform: translateX(100%); opacity: 0; }
                    to { transform: translateX(0); opacity: 1; }
                }
            `;
            document.head.appendChild(styles);
        }
        
        document.body.appendChild(messageDiv);
        
        // Auto remove after 5 seconds
        setTimeout(() => {
            if (messageDiv.parentElement) {
                messageDiv.remove();
            }
        }, 5000);
    }

    // Reset all data (for testing)
    static resetData() {
        localStorage.removeItem('skillswap_users');
        localStorage.removeItem('skillswap_skills');
        localStorage.removeItem('skillswap_exchanges');
        localStorage.removeItem('skillswap_user');
        localStorage.removeItem('skillswap_demo_initialized');
        console.log('All SkillSwap data reset');
        this.init();
    }

    // Debug function to check users
    static debugUsers() {
        const users = this.getUsers();
        console.log('Current users:', users);
        return users;
    }
}

// Initialize auth system on load
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM loaded, initializing AuthSystem...');
    AuthSystem.init();
});

// Make AuthSystem available globally
window.AuthSystem = AuthSystem;

// Debug helper - you can call this in browser console
window.debugAuth = function() {
    console.log('=== SkillSwap Debug Info ===');
    const users = AuthSystem.getAllUsers();
    console.log('Users:', users);
    console.log('Current User:', AuthSystem.getCurrentUser());
    console.log('Is Admin:', AuthSystem.isAdmin());
    console.log('======================');
};

// export {AuthSystem};