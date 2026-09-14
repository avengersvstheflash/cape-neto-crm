/**
 * api.js — Centralized API client for Cape Neto CRM
 * Handles auth headers, JSON parsing, and error normalization.
 */

const API_BASE = 'http://127.0.0.1:8000';

function getToken() {
  return localStorage.getItem('cape_neto_token') || '';
}

function authHeaders() {
  return {
    'Authorization': `Bearer ${getToken()}`,
    'Content-Type': 'application/json',
  };
}

async function request(method, path, body = null, customHeaders = null) {
  const opts = {
    method,
    headers: customHeaders || authHeaders(),
  };
  if (body && method !== 'GET') {
    opts.body = typeof body === 'string' ? body : JSON.stringify(body);
  }
  const res = await fetch(`${API_BASE}${path}`, opts);
  if (res.status === 204) return null;
  const data = await res.json().catch(() => null);
  if (!res.ok) {
    const msg = data?.detail || `Request failed (${res.status})`;
    throw new Error(msg);
  }
  return data;
}

// ── Auth ────────────────────────────────────
export async function login(email, password) {
  const formData = new URLSearchParams();
  formData.append('username', email);
  formData.append('password', password);
  return request('POST', '/auth/login', formData.toString(), {
    'Content-Type': 'application/x-www-form-urlencoded',
  });
}

export async function fetchMe() {
  return request('GET', '/auth/me');
}

// ── Leads ───────────────────────────────────
export async function fetchLeads(params = {}) {
  const q = new URLSearchParams(params).toString();
  return request('GET', `/leads/${q ? '?' + q : ''}`);
}

export async function createLead(payload) {
  return request('POST', '/leads/', payload);
}

export async function updateLead(id, payload) {
  return request('PUT', `/leads/${id}`, payload);
}

export async function deleteLead(id) {
  return request('DELETE', `/leads/${id}`);
}

// ── Tasks ───────────────────────────────────
export async function fetchTasks(params = {}) {
  const q = new URLSearchParams(params).toString();
  return request('GET', `/tasks/${q ? '?' + q : ''}`);
}

export async function createTask(payload) {
  return request('POST', '/tasks/', payload);
}

export async function updateTask(id, payload) {
  return request('PUT', `/tasks/${id}`, payload);
}

export async function completeTask(id) {
  return request('PUT', `/tasks/${id}/complete`);
}

export async function deleteTask(id) {
  return request('DELETE', `/tasks/${id}`);
}

// ── Activities ──────────────────────────────
export async function fetchActivities(params = {}) {
  const q = new URLSearchParams(params).toString();
  return request('GET', `/activities/${q ? '?' + q : ''}`);
}

export async function createActivity(payload) {
  return request('POST', '/activities/', payload);
}

export async function updateActivity(id, payload) {
  return request('PUT', `/activities/${id}`, payload);
}

export async function deleteActivity(id) {
  return request('DELETE', `/activities/${id}`);
}

// ── Clients ─────────────────────────────────
export async function fetchClients() {
  return request('GET', '/clients/');
}

export async function createClient(payload) {
  return request('POST', '/clients/', payload);
}

export async function updateClient(id, payload) {
  return request('PATCH', `/clients/${id}`, payload);
}

export async function deleteClient(id) {
  return request('DELETE', `/clients/${id}`);
}

// ── Pipeline Stages ─────────────────────────
export async function fetchStages() {
  return request('GET', '/pipeline-stages/');
}

export async function createStage(payload) {
  return request('POST', '/pipeline-stages/', payload);
}

export async function updateStage(id, payload) {
  return request('PUT', `/pipeline-stages/${id}`, payload);
}

export async function deleteStage(id) {
  return request('DELETE', `/pipeline-stages/${id}`);
}

export { API_BASE };
