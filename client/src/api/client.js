// Centralized API client with automatic token handling
const API_BASE_URL = import.meta.env.VITE_API_URL || '';

export async function apiRequest(endpoint, options = {}) {
  const token = localStorage.getItem('skillbridge_token');
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
    ...options.headers,
  };

  const url = `${API_BASE_URL}${endpoint}`;

  try {
    const response = await fetch(url, {
      ...options,
      headers,
    });

    if (response.status === 401) {
      // Clear token on unauthorized if not login/register
      if (!endpoint.includes('/auth/login') && !endpoint.includes('/auth/register')) {
        localStorage.removeItem('skillbridge_token');
        localStorage.removeItem('skillbridge_user');
      }
    }

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      const errorMsg = data.detail || data.message || `Request failed with status ${response.status}`;
      throw new Error(errorMsg);
    }

    return data;
  } catch (error) {
    console.error(`API Error on ${endpoint}:`, error);
    throw error;
  }
}

export const api = {
  // Auth
  login: (credentials) => apiRequest('/api/auth/login', { method: 'POST', body: JSON.stringify(credentials) }),
  register: (userData) => apiRequest('/api/auth/register', { method: 'POST', body: JSON.stringify(userData) }),
  logout: () => apiRequest('/api/auth/logout', { method: 'POST' }),
  getCurrentUser: () => apiRequest('/api/auth/me'),
  forgotPassword: (email) => apiRequest('/api/auth/forgot-password', { method: 'POST', body: JSON.stringify({ email }) }),
  resetPassword: (payload) => apiRequest('/api/auth/reset-password', { method: 'POST', body: JSON.stringify(payload) }),

  // Student Profile
  getProfile: () => apiRequest('/api/students/profile'),
  updateProfile: (profileData) => apiRequest('/api/students/profile', { method: 'PUT', body: JSON.stringify(profileData) }),

  // Skills
  getAllSkills: (category) => apiRequest(`/api/skills${category ? `?category=${category}` : ''}`),
  getMySkills: () => apiRequest('/api/skills/my-skills'),
  updateMySkills: (skills) => apiRequest('/api/skills/my-skills', { method: 'POST', body: JSON.stringify({ skills }) }),
  addCustomSkill: (skill) => apiRequest('/api/skills', { method: 'POST', body: JSON.stringify(skill) }),
  getAssessmentQuestions: (skillId) => apiRequest(`/api/skills/assessment/questions?skill_id=${skillId}`),
  submitAssessment: (payload) => apiRequest('/api/skills/assessment/submit', { method: 'POST', body: JSON.stringify(payload) }),

  // Careers
  getCareers: () => apiRequest('/api/careers'),
  getCareerDetails: (id) => apiRequest(`/api/careers/${id}`),
  selectCareerGoal: (careerId) => apiRequest('/api/careers/select-goal', { method: 'POST', body: JSON.stringify({ career_id: careerId }) }),

  // AI & Recommendations
  getSkillGapAnalysis: (careerId) => apiRequest('/api/ai/skill-gap-analysis', { method: 'POST', body: JSON.stringify({ career_id: careerId }) }),
  generateRoadmap: (payload = {}) => apiRequest('/api/ai/generate-roadmap', { method: 'POST', body: JSON.stringify(payload) }),
  recommendResources: (payload = {}) => apiRequest('/api/ai/recommend-resources', { method: 'POST', body: JSON.stringify(payload) }),
  searchResources: (payload) => apiRequest('/api/ai/search-resources', { method: 'POST', body: JSON.stringify(payload) }),
  getResourceSearchStatus: (visitorId) => apiRequest(`/api/ai/search-resources/status${visitorId ? `?visitor_id=${encodeURIComponent(visitorId)}` : ''}`),

  // Progress
  getProgress: () => apiRequest('/api/progress'),
  toggleTask: (taskId) => apiRequest(`/api/progress/task/${taskId}/toggle`, { method: 'POST' }),

  // Admin
  getAdminStudents: () => apiRequest('/api/admin/students'),
  getAdminAnalytics: () => apiRequest('/api/admin/analytics'),
  createAdminCareer: (data) => apiRequest('/api/admin/careers', { method: 'POST', body: JSON.stringify(data) }),
  createAdminSkill: (data) => apiRequest('/api/admin/skills', { method: 'POST', body: JSON.stringify(data) }),
};
