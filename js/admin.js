
// Check if user is admin
document.addEventListener('DOMContentLoaded', function () {
    const user = JSON.parse(localStorage.getItem('skillswap_user'));

    if (!user || user.role !== 'admin') {
        alert('Access denied. Admin privileges required.');
        window.location.href = 'login.html';
        return;
    }

    loadAdminData();

    // Mobile menu toggle
    document.getElementById('mobileMenuToggle').addEventListener('click', function () {
        document.getElementById('navLinks').classList.toggle('active');
    });
});

function loadAdminData() {
    const users = JSON.parse(localStorage.getItem('skillswap_users') || '[]');
    const exchanges = JSON.parse(localStorage.getItem('skillswap_exchanges') || '[]');

    // Update stats
    document.getElementById('totalUsers').textContent = users.length;
    document.getElementById('activeExchanges').textContent = exchanges.filter(e => e.status === 'active').length;
    document.getElementById('pendingIssues').textContent = exchanges.filter(e => e.status === 'dispute').length;
    document.getElementById('completedExchanges').textContent = exchanges.filter(e => e.status === 'completed').length;

    // Load recent users
    const recentUsersContainer = document.getElementById('recentUsers');
    const recentUsers = users.slice(-5).reverse();

    recentUsersContainer.innerHTML = recentUsers.map(user => `
                <div class="user-item">
                    <div class="user-avatar-admin">${user.avatar}</div>
                    <div class="user-info">
                        <h4>${user.name}</h4>
                        <p>${user.email}</p>
                        <span class="user-role ${user.role === 'admin' ? 'role-admin' : ''}">${user.role}</span>
                    </div>
                    <div class="admin-actions">
                        <button class="btn btn-outline btn-sm" onclick="viewUser('${user.id}')">View</button>
                        ${user.role !== 'admin' ? `<button class="btn btn-primary btn-sm" onclick="manageUser('${user.id}')">Manage</button>` : ''}
                    </div>
                </div>
            `).join('');

    // Load disputes
    const disputeListContainer = document.getElementById('disputeList');
    const disputes = exchanges.filter(e => e.status === 'dispute').slice(-3);

    disputeListContainer.innerHTML = disputes.length > 0 ? disputes.map(exchange => `
                <div class="exchange-item">
                    <div class="exchange-info">
                        <h4>Exchange #${exchange.id}</h4>
                        <p>${exchange.parties?.join(' ↔ ') || 'Unknown parties'}</p>
                        <span class="exchange-status status-pending">Needs Review</span>
                    </div>
                    <div class="admin-actions">
                        <button class="btn btn-primary btn-sm" onclick="resolveDispute('${exchange.id}')">Resolve</button>
                    </div>
                </div>
            `).join('') : '<p style="text-align: center; color: var(--gray-medium);">No pending disputes</p>';
}

function generateReport() {
    alert('Generating admin report... This would download a comprehensive report in a real application.');
}

function refreshData() {
    loadAdminData();
    alert('Data refreshed!');
}

function viewUser(userId) {
    alert(`Viewing user ${userId} details...`);
}

function manageUser(userId) {
    alert(`Managing user ${userId}...`);
}

function resolveDispute(exchangeId) {
    if (confirm('Are you sure you want to resolve this dispute?')) {
        alert(`Resolving dispute for exchange ${exchangeId}...`);
        // In a real app, this would update the exchange status
    }
}

function showSystemSettings() {
    alert('Opening system settings...');
}