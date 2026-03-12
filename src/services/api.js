/**
 * services/api.js
 * REST API adapter for Google Apps Script WebApp.
 * Replaces google.script.run with fetch calls to the deployed exec URL.
 */

const BASE_URL = import.meta.env.VITE_API_URL || 'https://script.google.com/macros/s/AKfycbyRn6Bl75cvEHr09XkzHJkfilD6u9JU1GENZ6oMII0zJ7tFX2TNKzozeih9qU888KVuiw/exec';

async function apiPost(action, data = {}) {
  const res = await fetch(BASE_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'text/plain' },
    redirect: 'follow', 
    body: JSON.stringify({ action, payload: data }),
  });
  
  const text = await res.text();
  let json;
  try {
    json = JSON.parse(text);
  } catch (err) {
    throw new Error("Gagal terhubung ke Server FormHub. Pastikan URL API benar.");
  }
  
  if (json.error) throw new Error(json.error);
  return json.data !== undefined ? json.data : json;
}

async function apiGet(action, params = {}) {
  const url = new URL(BASE_URL);
  url.searchParams.set('action', action);
  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined && v !== null) url.searchParams.set(k, String(v));
  });
  url.searchParams.set('_t', Date.now()); // Prevent aggressive browser caching
  const res = await fetch(url.toString());
  const json = await res.json();
  if (json.error) throw new Error(json.error);
  return json.data !== undefined ? json.data : json;
}

// GET endpoints
export const checkSetup = () => apiGet('checkSetup');
export const getAllForms = (isAdmin = false) => apiGet('getAllForms', { isAdmin });
export const getFormDetail = (formId) => apiGet('getFormDetail', { formId });
export const getFormResponses = (formId) => apiGet('getFormResponses', { formId });
export const getDatabaseList = () => apiGet('getDatabaseList');
export const getDatabaseData = (sheetName) => apiGet('getDatabaseData', { sheetName });
export const lookupData = (sheetName, searchCol, searchValue, returnCol) =>
  apiGet('lookupData', { sheetName, searchCol, searchValue, returnCol });

// POST endpoints — parameter names MUST match backend code.gs POST_ACTIONS
export const performSetup = (dbId, pin) => apiPost('performSetup', { spreadsheetId: dbId, adminPin: pin });
export const verifyAdmin = (pin) => apiPost('verifyAdmin', { pin });
export const saveForm = (payload) => apiPost('saveForm', payload);
export const publishForm = (formId) => apiPost('publishForm', { formId });
export const toggleFormStatus = (formId, status) => apiPost('toggleFormStatus', { formId, newStatus: status });
export const deleteForm = (formId) => apiPost('deleteForm', { formId });
export const submitResponse = (formId, data) => apiPost('submitResponse', { formId, data });
export const updateResponseCell = (formId, rowIdx, colIdx, val) =>
  apiPost('updateResponseCell', { formId, rowIdx, colIdx, newValue: val });
// FormHub Frontend v1.1 - Parameter Fix Applied
