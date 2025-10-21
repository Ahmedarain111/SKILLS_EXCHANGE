// Sample Data
const sampleSkills = [
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
    },
    {
        id: 3,
        title: "Conversational Spanish",
        category: "languages",
        description: "Practice speaking Spanish in real-life scenarios and improve your fluency naturally.",
        level: "Beginner",
        sessions: 12,
        rating: 4.8,
        user: { name: "Carlos Rodriguez", avatar: "CR" },
        type: "offer",
        location: "Online"
    },
    {
        id: 4,
        title: "Yoga & Mindfulness",
        category: "fitness",
        description: "Learn yoga poses, breathing techniques, and meditation for physical and mental wellness.",
        level: "All Levels",
        sessions: 6,
        rating: 4.9,
        user: { name: "Priya Williams", avatar: "PW" },
        type: "offer",
        location: "Local"
    },
    {
        id: 5,
        title: "Digital Marketing Strategy",
        category: "business",
        description: "Develop effective marketing campaigns across social media, SEO, and content platforms.",
        level: "Intermediate",
        sessions: 7,
        rating: 4.6,
        user: { name: "Taylor Davis", avatar: "TD" },
        type: "offer",
        location: "Online"
    },
    {
        id: 6,
        title: "Portrait Photography",
        category: "arts",
        description: "Master lighting, composition, and editing techniques for stunning portrait photography.",
        level: "Beginner",
        sessions: 5,
        rating: 4.7,
        user: { name: "Kevin Lee", avatar: "KL" },
        type: "offer",
        location: "Local"
    }
];

const sampleUsers = [
    {
        id: 1,
        name: "John Doe",
        email: "john@example.com",
        password: "password123",
        avatar: "JD",
        skillsOffered: ["Web Development", "Public Speaking"],
        skillsWanted: ["Graphic Design", "Yoga"],
        joinDate: "2023-01-15"
    }
];

// Data Manager
class DataManager {
    static init() {
        if (!localStorage.getItem('skillswap_skills')) {
            localStorage.setItem('skillswap_skills', JSON.stringify(sampleSkills));
        }
        if (!localStorage.getItem('skillswap_users')) {
            localStorage.setItem('skillswap_users', JSON.stringify(sampleUsers));
        }
    }

    static getSkills(filters = {}) {
        const skills = JSON.parse(localStorage.getItem('skillswap_skills'));
        
        let filteredSkills = skills.filter(skill => {
            if (filters.category && skill.category !== filters.category) return false;
            if (filters.search) {
                const searchTerm = filters.search.toLowerCase();
                if (!skill.title.toLowerCase().includes(searchTerm) && 
                    !skill.description.toLowerCase().includes(searchTerm)) return false;
            }
            if (filters.level && skill.level !== filters.level) return false;
            return true;
        });

        return filteredSkills;
    }

    static addSkill(skillData) {
        const skills = this.getSkills();
        const user = AuthSystem.getCurrentUser();
        
        const newSkill = {
            id: Date.now(),
            ...skillData,
            user: { name: user.name, avatar: user.avatar },
            rating: 0,
            featured: false
        };
        
        skills.push(newSkill);
        localStorage.setItem('skillswap_skills', JSON.stringify(skills));
        return newSkill;
    }

    static getCategories() {
        const skills = this.getSkills();
        const categories = [...new Set(skills.map(skill => skill.category))];
        return categories;
    }
}

// Initialize data on load
document.addEventListener('DOMContentLoaded', function() {
    DataManager.init();
});