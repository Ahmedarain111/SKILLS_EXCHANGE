// app.js - Main Application with Local Storage
class SkillSwapApp {
    constructor() {
        this.currentFilters = {};
        this.currentView = 'grid';
    }

    async loadMarketplace() {
        await this.renderSkills();
        this.setupEventListeners();
    }

    setupEventListeners() {
        const searchInput = document.getElementById('searchInput');
        if (searchInput) {
            searchInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    this.handleSearch();
                }
            });
        }
    }

    handleSearch() {
        const searchInput = document.getElementById('searchInput');
        if (searchInput) {
            this.currentFilters.search = searchInput.value;
            this.renderSkills();
        }
    }

    handleFilter() {
        const categoryCheckboxes = document.querySelectorAll('input[type="checkbox"]');
        const levelRadios = document.querySelectorAll('input[type="radio"]');
        
        this.currentFilters.category = Array.from(categoryCheckboxes)
            .filter(cb => cb.checked)
            .map(cb => cb.id);

        this.currentFilters.level = Array.from(levelRadios)
            .find(radio => radio.checked)?.id.replace('level-', '');
    }

    applyFilters() {
        this.renderSkills();
    }

    resetFilters() {
        document.querySelectorAll('input[type="checkbox"]').forEach(cb => cb.checked = false);
        document.querySelectorAll('input[type="radio"]').forEach(radio => {
            if (radio.id === 'level-any') radio.checked = true;
        });
        this.currentFilters = {};
        this.renderSkills();
    }

    toggleSkillTag(element) {
        element.classList.toggle('active');
    }

    changeView(view) {
        this.currentView = view;
        document.querySelectorAll('.view-option').forEach(opt => {
            opt.classList.toggle('active', opt.textContent.includes(view));
        });
        this.renderSkills();
    }

    async renderSkills() {
        const skillsGrid = document.getElementById('skillsGrid');
        const skillsCount = document.getElementById('skillsCount');
        
        if (!skillsGrid) return;

        try {
            const skills = AuthSystem.getAllSkills(this.currentFilters);
            
            if (skillsCount) {
                skillsCount.textContent = `${skills.length} Skills Available`;
            }

            skillsGrid.innerHTML = skills.map(skill => this.createSkillCard(skill)).join('');
            this.attachSkillCardListeners();
        } catch (error) {
            console.error('Error rendering skills:', error);
            skillsGrid.innerHTML = '<p>Error loading skills. Please try again.</p>';
        }
    }

    createSkillCard(skill) {
        const icons = {
            technology: 'fas fa-code',
            design: 'fas fa-palette',
            languages: 'fas fa-language',
            fitness: 'fas fa-dumbbell',
            business: 'fas fa-chart-line',
            arts: 'fas fa-camera'
        };

        return `
            <div class="skill-card ${skill.featured ? 'featured' : ''}">
                <div class="skill-image">
                    <i class="${icons[skill.category] || 'fas fa-star'}"></i>
                </div>
                <div class="skill-content">
                    <span class="skill-category">${skill.category}</span>
                    <h3>${skill.title}</h3>
                    <p>${skill.description}</p>
                    
                    <div class="skill-meta">
                        <span><i class="far fa-clock"></i> ${skill.sessions || 0} sessions</span>
                        <span><i class="fas fa-signal"></i> ${skill.level}</span>
                        <span><i class="fas fa-star"></i> ${skill.rating || 0}</span>
                    </div>
                    
                    <div class="skill-user">
                        <div class="user-avatar-small">${skill.user?.avatar || 'US'}</div>
                        <div class="user-info">
                            <h4>${skill.user?.name || 'User'}</h4>
                            <p>${skill.location || 'Online'}</p>
                        </div>
                    </div>
                    
                    <div class="skill-actions">
                        <button class="btn btn-outline">View Details</button>
                        <button class="btn btn-primary magic-match-btn" data-skill="${skill.title}">Magic Match</button>
                    </div>
                </div>
            </div>
        `;
    }

    attachSkillCardListeners() {
        document.querySelectorAll('.magic-match-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const skill = e.target.getAttribute('data-skill');
                this.showMagicMatch(skill);
            });
        });
    }

    showMagicMatch(skill) {
        const modal = document.getElementById('magicMatchModal');
        if (modal) {
            modal.classList.add('active');
        }
    }

    closeModal() {
        const modal = document.getElementById('magicMatchModal');
        if (modal) {
            modal.classList.remove('active');
        }
    }

    sendProposal() {
        alert('Exchange proposal sent successfully!');
        this.closeModal();
    }
}

// Initialize the app
window.skillSwapApp = new SkillSwapApp();

// Close modal when clicking outside
document.addEventListener('click', function(e) {
    if (e.target.classList.contains('modal-overlay')) {
        window.skillSwapApp.closeModal();
    }
});


// In app.js
async function loadSkills(filters = {}) {
  try {
    const queryParams = new URLSearchParams(filters).toString();
    const response = await AuthSystem.apiCall(`/skills?${queryParams}`);
    
    if (response.success) {
      displaySkills(response.data);
    }
  } catch (error) {
    console.error('Error loading skills:', error);
  }
}