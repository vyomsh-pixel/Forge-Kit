import axios from 'axios';

const baseURL = import.meta.env.VITE_API_URL || (import.meta.env.PROD ? '/api' : 'http://localhost:3000/api');
const api = axios.create({ baseURL });

api.interceptors.request.use((config) => {
  try {
    const token = localStorage.getItem('forgekit_auth_token');
    if (token) {
      config.headers = config.headers || {};
      config.headers.Authorization = `Bearer ${token}`;
    }
  } catch {}
  return config;
});

// Auth & Account Endpoints
export const registerAccount = (payload) => api.post('/auth/register', payload);
export const loginAccount = (payload) => api.post('/auth/login', payload);
export const fetchCurrentUser = () => api.get('/auth/me');
export const exportAccountData = () => api.get('/account/export');
export const deleteAccount = () => api.delete('/account');

// Studio Generation Endpoints
export const generateFromWireframe = (formData) => api.post('/generate', formData);
export const generateFromPrompt = (prompt, brandKit = 'modern', pageName = 'Home') => 
  api.post('/prompt-ui', { prompt, brandKit, pageName });
export const updatePromptUI = (code, css, prompt) => api.post('/prompt-ui-update', { code, css, prompt });
export const modifyReactCode = (code, prompt) => api.post('/react-feature', { code, prompt });

// CMS & Section API Endpoints
export const fetchCMSElements = (pageName = 'Home', sectionId = '') => 
  api.get('/elements', { params: { pageName, sectionId } });
export const updateCMSElement = (fieldId, data) => api.patch(`/elements/${fieldId}`, data);

export const fetchSections = (pageName = '') => api.get('/sections', { params: { pageName } });
export const fetchSectionById = (sectionId) => api.get(`/sections/${sectionId}`);
export const fetchHealth = () => api.get('/health');

// ML UI & Accessibility Evaluator
export const evaluateUI = (jsx, css = '') => api.post('/evaluate-ui', { jsx, css });

