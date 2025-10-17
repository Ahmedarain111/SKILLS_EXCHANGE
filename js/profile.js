
// Step Navigation
document.querySelectorAll('.next-step').forEach(button => {
    button.addEventListener('click', function () {
        const currentStep = this.closest('.form-section').id.split('-')[1];
        const nextStep = this.getAttribute('data-next');

        // Update progress steps
        document.querySelector(`[data-step="${currentStep}"]`).classList.remove('active');
        document.querySelector(`[data-step="${currentStep}"]`).classList.add('step-completed');
        document.querySelector(`[data-step="${nextStep}"]`).classList.add('active');

        // Show next section
        document.querySelectorAll('.form-section').forEach(section => {
            section.classList.remove('active');
        });
        document.getElementById(`step-${nextStep}`).classList.add('active');

        createSparkle(this);
    });
});

document.querySelectorAll('.prev-step').forEach(button => {
    button.addEventListener('click', function () {
        const currentStep = this.closest('.form-section').id.split('-')[1];
        const prevStep = this.getAttribute('data-prev');

        // Update progress steps
        document.querySelector(`[data-step="${currentStep}"]`).classList.remove('active');
        document.querySelector(`[data-step="${prevStep}"]`).classList.add('active');
        document.querySelector(`[data-step="${prevStep}"]`).classList.remove('step-completed');

        // Show previous section
        document.querySelectorAll('.form-section').forEach(section => {
            section.classList.remove('active');
        });
        document.getElementById(`step-${prevStep}`).classList.add('active');

        createSparkle(this);
    });
});

// Skill Management
document.getElementById('add-have-skill').addEventListener('click', function () {
    const skillInput = document.getElementById('have-skill-input');
    const skill = skillInput.value.trim();

    if (skill) {
        addSkillToContainer(skill, 'have-skills-container');
        skillInput.value = '';
        createSparkle(this);
    }
});

document.getElementById('add-want-skill').addEventListener('click', function () {
    const skillInput = document.getElementById('want-skill-input');
    const skill = skillInput.value.trim();

    if (skill) {
        addSkillToContainer(skill, 'want-skills-container');
        skillInput.value = '';
        createSparkle(this);
    }
});

function addSkillToContainer(skill, containerId) {
    const container = document.getElementById(containerId);
    const skillTag = document.createElement('div');
    skillTag.className = 'skill-tag';
    skillTag.innerHTML = `
                ${skill}
                <i class="fas fa-times" onclick="removeSkill(this, '${containerId.split('-')[0]}')"></i>
            `;

    container.appendChild(skillTag);
}

function removeSkill(element, type) {
    element.closest('.skill-tag').remove();
}

// File Upload Simulation
document.getElementById('certification-upload').addEventListener('click', function () {
    const uploadedFiles = document.getElementById('uploaded-certifications');
    const fileId = Date.now();

    const fileElement = document.createElement('div');
    fileElement.className = 'uploaded-file';
    fileElement.innerHTML = `
                <i class="fas fa-file-certificate"></i>
                <div class="file-info">
                    <h4>New_Certificate_${fileId}.pdf</h4>
                    <p>Uploaded just now • 1.8 MB</p>
                </div>
                <div class="file-actions">
                    <button class="file-action"><i class="fas fa-eye"></i></button>
                    <button class="file-action" onclick="this.closest('.uploaded-file').remove()"><i class="fas fa-trash"></i></button>
                </div>
            `;

    uploadedFiles.appendChild(fileElement);
    createSparkle(this);
});

// Complete Profile with Magic
document.getElementById('complete-profile').addEventListener('click', function () {
    // Create multiple sparkles
    for (let i = 0; i < 15; i++) {
        setTimeout(() => {
            createSparkle(this);
        }, i * 100);
    }

    // Show success message
    setTimeout(() => {
        alert('✨ Your magical profile has been created! ✨\n\nYou are now ready to start exchanging skills with our enchanted community.');
        // Save profile data
        saveProfileData();
        // Redirect to dashboard
        window.location.href = 'dashboard.html';
    }, 1500);
});

// Save profile data to localStorage
function saveProfileData() {
    const user = JSON.parse(localStorage.getItem('skillswap_user'));
    if (user) {
        // Collect skills
        const haveSkills = Array.from(document.querySelectorAll('#have-skills-container .skill-tag'))
            .map(tag => tag.childNodes[0].textContent.trim());
        const wantSkills = Array.from(document.querySelectorAll('#want-skills-container .skill-tag'))
            .map(tag => tag.childNodes[0].textContent.trim());

        // Update user profile
        user.skillsOffered = haveSkills;
        user.skillsWanted = wantSkills;
        user.bio = document.getElementById('bio').value;
        user.location = document.getElementById('location').value;
        user.profileComplete = true;

        localStorage.setItem('skillswap_user', JSON.stringify(user));

        // Update users array
        const users = JSON.parse(localStorage.getItem('skillswap_users'));
        const userIndex = users.findIndex(u => u.id === user.id);
        if (userIndex !== -1) {
            users[userIndex] = user;
            localStorage.setItem('skillswap_users', JSON.stringify(users));
        }
    }
}

// Create sparkle animation
function createSparkle(element) {
    const rect = element.getBoundingClientRect();
    const sparkle = document.createElement('div');
    sparkle.className = 'sparkle';

    // Position sparkle at center of element
    sparkle.style.left = (rect.left + rect.width / 2 - 5) + 'px';
    sparkle.style.top = (rect.top + rect.height / 2 - 5) + 'px';

    document.body.appendChild(sparkle);

    // Remove sparkle after animation completes
    setTimeout(() => {
        sparkle.remove();
    }, 800);
}

// Allow Enter key to add skills
document.getElementById('have-skill-input').addEventListener('keypress', function (e) {
    if (e.key === 'Enter') {
        e.preventDefault();
        document.getElementById('add-have-skill').click();
    }
});

document.getElementById('want-skill-input').addEventListener('keypress', function (e) {
    if (e.key === 'Enter') {
        e.preventDefault();
        document.getElementById('add-want-skill').click();
    }
});

// Load user data if available
document.addEventListener('DOMContentLoaded', function () {
    const user = JSON.parse(localStorage.getItem('skillswap_user'));
    if (user) {
        // Pre-fill form with user data
        if (user.name) document.getElementById('fullName').value = user.name;
        if (user.bio) document.getElementById('bio').value = user.bio;
        if (user.location) document.getElementById('location').value = user.location;

        // Load existing skills
        if (user.skillsOffered && user.skillsOffered.length > 0) {
            user.skillsOffered.forEach(skill => {
                addSkillToContainer(skill, 'have-skills-container');
            });
        }

        if (user.skillsWanted && user.skillsWanted.length > 0) {
            user.skillsWanted.forEach(skill => {
                addSkillToContainer(skill, 'want-skills-container');
            });
        }
    }

    // Mobile menu toggle
    document.getElementById('mobileMenuToggle').addEventListener('click', function () {
        document.getElementById('navLinks').classList.toggle('active');
    });
});