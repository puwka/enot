const API_BASE = (process.env.REACT_APP_API_URL || '/api').replace(/\/$/, '');

export const isApiConfigured = () => Boolean(API_BASE);

const parseResponse = async (response) => {
  const text = await response.text();
  let payload = null;
  if (text) {
    try {
      payload = JSON.parse(text);
    } catch {
      payload = { message: text };
    }
  }
  if (!response.ok) {
    const error = new Error(payload?.message || payload?.error || 'REQUEST_FAILED');
    error.code = payload?.error || 'REQUEST_FAILED';
    error.status = response.status;
    throw error;
  }
  return payload;
};

export const apiFetch = async (path, { method = 'GET', body, token, adminToken, headers = {} } = {}) => {
  const nextHeaders = {
    Accept: 'application/json',
    ...headers,
  };
  if (body !== undefined) {
    nextHeaders['Content-Type'] = 'application/json';
  }
  if (token) {
    nextHeaders.Authorization = `Bearer ${token}`;
  }
  if (adminToken) {
    nextHeaders['x-admin-token'] = adminToken;
  }
  const response = await fetch(`${API_BASE}${path}`, {
    method,
    headers: nextHeaders,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });
  return parseResponse(response);
};

export const checkDatabaseConnection = async () => {
  try {
    const data = await apiFetch('/health');
    return { ok: Boolean(data?.ok), message: data?.message || 'Подключение к базе данных установлено.' };
  } catch {
    return { ok: false, message: 'Не удалось подключиться к базе данных.' };
  }
};
