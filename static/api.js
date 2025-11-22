// 从全局变量中获取 API 地址，失败时自动回退到同源 '/api'
let API_BASE_URL = 'https://ancient.pdszxh.workers.dev/api';
let token = null;

// Token 管理
function setToken(newToken) {
    token = newToken;
    localStorage.setItem('admin_token', token);
}

function getToken() {
    if (!token) {
        token = localStorage.getItem('admin_token');
    }
    return token;
}

// API 请求函数
async function fetchAPI(endpoint, options = {}) {
    const token = getToken();
    if (token) {
        options.headers = {
            ...options.headers,
            'Authorization': `Bearer ${token}`
        };
    }

    let response;
    try {
        response = await fetch(`${API_BASE_URL}${endpoint}`, {
            ...options,
            headers: {
                'Content-Type': 'application/json',
                ...options.headers
            }
        });
    } catch (networkErr) {
        if (API_BASE_URL !== '/api') {
            API_BASE_URL = '/api';
            response = await fetch(`${API_BASE_URL}${endpoint}`, {
                ...options,
                headers: {
                    'Content-Type': 'application/json',
                    ...options.headers
                }
            });
        } else {
            throw networkErr;
        }
    }

    if (!response.ok) {
        let errorText = 'API请求失败';
        try {
            const errorData = await response.json();
            errorText = errorData.error || errorText;
        } catch {}
        throw new Error(errorText);
    }

    return response.json();
}

// API 函数
async function login(password) {
    try {
        const data = await fetchAPI('/login', {
            method: 'POST',
            body: JSON.stringify({ password })
        });
        if (data && data.token) {
            setToken(data.token);
            return data;
        }
        throw new Error('登录响应中没有找到 token');
    } catch (error) {
        setToken(null);
        throw new Error(error.message || '登录失败');
    }
}

async function fetchGroups() {
    return fetchAPI('/groups');
}

async function fetchLinks() {
    return fetchAPI('/links');
}

async function createGroup(data) {
    return fetchAPI('/groups', {
        method: 'POST',
        body: JSON.stringify(data)
    });
}

async function updateGroup(id, data) {
    return fetchAPI(`/groups/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data)
    });
}

async function deleteGroup(id) {
    return fetchAPI(`/groups/${id}`, {
        method: 'DELETE'
    });
}

async function createLink(data) {
    return fetchAPI('/links', {
        method: 'POST',
        body: JSON.stringify(data)
    });
}

async function updateLink(id, data) {
    return fetchAPI(`/links/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data)
    });
}

async function deleteLink(id) {
    return fetchAPI(`/links/${id}`, {
        method: 'DELETE'
    });
}

// 获取网页信息
async function fetchWebInfo(url) {
    const response = await fetch(`${API_BASE_URL}/fetch-info`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ url })
    });

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || '获取网页信息失败');
    }

    return response.json();
}

async function fetchSettings() {
    return fetchAPI('/settings');
}

async function updateSettings(data) {
  return fetchAPI('/settings', {
    method: 'PUT',
    body: JSON.stringify(data)
  });
}

async function exportData() {
  return fetchAPI('/export');
}

async function importData(payload) {
  return fetchAPI('/import', {
    method: 'POST',
    body: JSON.stringify(payload)
  });
}
