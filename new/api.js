let API_BASE_URL = '/api';
let token = null;

function setToken(newToken) {
  token = newToken;
  localStorage.setItem('admin_token', token);
}

function getToken() {
  if (!token) token = localStorage.getItem('admin_token');
  return token;
}

async function fetchAPI(endpoint, options = {}) {
  const t = getToken();
  if (t) {
    options.headers = { ...options.headers, 'Authorization': `Bearer ${t}` };
  }
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers: { 'Content-Type': 'application/json', ...options.headers }
  });
  if (!response.ok) {
    let err = 'API请求失败';
    try { const data = await response.json(); err = data.error || err; } catch {}
    throw new Error(err);
  }
  return response.json();
}

async function login(password) {
  const data = await fetchAPI('/login', { method: 'POST', body: JSON.stringify({ password }) });
  if (data && data.token) setToken(data.token);
  return data;
}

async function fetchNavigation() { return fetchAPI('/navigation'); }
async function fetchGroups() { return fetchAPI('/groups'); }
async function fetchLinks() { return fetchAPI('/links'); }
async function createGroup(data) { return fetchAPI('/groups', { method: 'POST', body: JSON.stringify(data) }); }
async function updateGroup(id, data) { return fetchAPI(`/groups/${id}`, { method: 'PUT', body: JSON.stringify(data) }); }
async function deleteGroup(id) { return fetchAPI(`/groups/${id}`, { method: 'DELETE' }); }
async function createLink(data) { return fetchAPI('/links', { method: 'POST', body: JSON.stringify(data) }); }
async function updateLink(id, data) { return fetchAPI(`/links/${id}`, { method: 'PUT', body: JSON.stringify(data) }); }
async function deleteLink(id) { return fetchAPI(`/links/${id}`, { method: 'DELETE' }); }
async function fetchWebInfo(url) { return fetchAPI('/fetch-info', { method: 'POST', body: JSON.stringify({ url }) }); }
async function fetchSettings() { return fetchAPI('/settings'); }
async function updateSettings(data) { return fetchAPI('/settings', { method: 'PUT', body: JSON.stringify(data) }); }
async function exportData() { return fetchAPI('/export'); }
async function importData(payload) { return fetchAPI('/import', { method: 'POST', body: JSON.stringify(payload) }); }

window.API = {
  login,
  fetchNavigation,
  fetchGroups,
  fetchLinks,
  createGroup,
  updateGroup,
  deleteGroup,
  createLink,
  updateLink,
  deleteLink,
  fetchWebInfo,
  fetchSettings,
  updateSettings,
  exportData,
  importData
};