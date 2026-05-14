export const API_BASE_URL = ''; // Empty string means current domain, rewrites will handle /api/v1

export const getApiUrl = (path: string) => {
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  return `${API_BASE_URL}${cleanPath}`;
};
