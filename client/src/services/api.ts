// API client service for RJ BODY BUILDING
import {
  User,
  WorkshopSetting,
  VehicleCategory,
  Service,
  Enquiry,
  Quotation,
  Job,
  JobTask,
  ContactMessage,
  DashboardMetrics,
} from '../types';

const API_BASE = '/api';

function getToken(): string | null {
  return localStorage.getItem('rj_token');
}

export function setToken(token: string) {
  localStorage.setItem('rj_token', token);
}

export function clearToken() {
  localStorage.removeItem('rj_token');
  localStorage.removeItem('rj_user');
}

export function getStoredUser(): User | null {
  const u = localStorage.getItem('rj_user');
  if (!u) return null;
  try {
    return JSON.parse(u);
  } catch {
    return null;
  }
}

export function setStoredUser(user: User) {
  localStorage.setItem('rj_user', JSON.stringify(user));
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = getToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const res = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new Error(data.message || `Request failed with status ${res.status}`);
  }

  return data as T;
}

export const api = {
  // Auth
  auth: {
    register: (body: { name: string; email: string; phone: string; password: string }) =>
      request<{ message: string; token: string; user: User }>('/auth/register', {
        method: 'POST',
        body: JSON.stringify(body),
      }),
    login: (body: { email: string; password: string }) =>
      request<{ message: string; token: string; user: User }>('/auth/login', {
        method: 'POST',
        body: JSON.stringify(body),
      }),
    me: () => request<{ user: User }>('/auth/me'),
  },

  // Settings & Public Info
  settings: {
    getWorkshop: () => request<{ settings: WorkshopSetting }>('/settings/workshop'),
    updateWorkshop: (body: Partial<WorkshopSetting>) =>
      request<{ message: string; settings: WorkshopSetting }>('/settings/workshop', {
        method: 'PUT',
        body: JSON.stringify(body),
      }),
    getCategories: () => request<{ categories: VehicleCategory[] }>('/settings/categories'),
    addCategory: (body: { name: string; description?: string; axleType?: string; tyreCount?: number }) =>
      request<{ message: string; category: VehicleCategory }>('/settings/categories', {
        method: 'POST',
        body: JSON.stringify(body),
      }),
    addModel: (body: { categoryId: string; brand: string; modelName: string; supportedBodyTypes: string }) =>
      request<{ message: string; model: any }>('/settings/models', {
        method: 'POST',
        body: JSON.stringify(body),
      }),
    getServices: () => request<{ services: Service[] }>('/settings/services'),
    addService: (body: { name: string; slug: string; category: string; description: string }) =>
      request<{ message: string; service: Service }>('/settings/services', {
        method: 'POST',
        body: JSON.stringify(body),
      }),
    updateService: (id: string, body: any) =>
      request<{ message: string; service: Service }>(`/settings/services/${id}`, {
        method: 'PUT',
        body: JSON.stringify(body),
      }),
  },

  // Enquiries & Service Bookings
  enquiries: {
    submit: (body: any) =>
      request<{ message: string; enquiry: Enquiry }>('/enquiries', {
        method: 'POST',
        body: JSON.stringify(body),
      }),
    list: (params?: { status?: string; search?: string }) => {
      const q = new URLSearchParams();
      if (params?.status) q.append('status', params.status);
      if (params?.search) q.append('search', params.search);
      return request<{ enquiries: Enquiry[] }>(`/enquiries?${q.toString()}`);
    },
    get: (id: string) => request<{ enquiry: Enquiry }>(`/enquiries/${id}`),
    update: (id: string, body: any) =>
      request<{ message: string; booking: Enquiry }>(`/enquiries/${id}`, {
        method: 'PUT',
        body: JSON.stringify(body),
      }),
    updateStatus: (id: string, status: string) =>
      request<{ message: string; enquiry: Enquiry }>(`/enquiries/${id}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status }),
      }),
  },

  // Quotations
  quotations: {
    create: (body: any) =>
      request<{ message: string; quotation: Quotation }>('/quotations', {
        method: 'POST',
        body: JSON.stringify(body),
      }),
    list: (status?: string) => {
      const q = status ? `?status=${status}` : '';
      return request<{ quotations: Quotation[] }>(`/quotations${q}`);
    },
    get: (id: string) => request<{ quotation: Quotation }>(`/quotations/${id}`),
    update: (id: string, body: any) =>
      request<{ message: string; quotation: Quotation }>(`/quotations/${id}`, {
        method: 'PUT',
        body: JSON.stringify(body),
      }),
    approve: (id: string) =>
      request<{ message: string; quotation: Quotation }>(`/quotations/${id}/approve`, {
        method: 'POST',
      }),
    reject: (id: string, rejectionReason?: string) =>
      request<{ message: string; quotation: Quotation }>(`/quotations/${id}/reject`, {
        method: 'POST',
        body: JSON.stringify({ rejectionReason }),
      }),
  },

  // Jobs & Timeline
  jobs: {
    activate: (body: { quotationId: string; vehicleDetails: string; expectedDeliveryDate?: string }) =>
      request<{ message: string; job: Job }>('/jobs/activate', {
        method: 'POST',
        body: JSON.stringify(body),
      }),
    list: (params?: { status?: string; stage?: string }) => {
      const q = new URLSearchParams();
      if (params?.status) q.append('status', params.status);
      if (params?.stage) q.append('stage', params.stage);
      return request<{ jobs: Job[] }>(`/jobs?${q.toString()}`);
    },
    get: (id: string) => request<{ job: Job }>(`/jobs/${id}`),
    updateStage: (
      id: string,
      body: { newStage: string; notes?: string; skipReason?: string; isSkipped?: boolean }
    ) =>
      request<{ message: string; job: Job }>(`/jobs/${id}/stage`, {
        method: 'PATCH',
        body: JSON.stringify(body),
      }),
    deliver: (id: string, notes?: string) =>
      request<{ message: string; job: Job }>(`/jobs/${id}/deliver`, {
        method: 'POST',
        body: JSON.stringify({ notes }),
      }),
    assignTask: (jobId: string, body: { title: string; description?: string; department: string; assignedWorkerId?: string }) =>
      request<{ message: string; task: JobTask }>(`/jobs/${jobId}/tasks`, {
        method: 'POST',
        body: JSON.stringify(body),
      }),
    updateTask: (taskId: string, body: { status: string; notes?: string }) =>
      request<{ message: string; task: JobTask }>(`/jobs/tasks/${taskId}`, {
        method: 'PATCH',
        body: JSON.stringify(body),
      }),
  },

  // Workers
  workers: {
    list: (params?: { department?: string; status?: string }) => {
      const q = new URLSearchParams();
      if (params?.department) q.append('department', params.department);
      if (params?.status) q.append('status', params.status);
      return request<{ workers: User[]; departments: string[] }>(`/workers?${q.toString()}`);
    },
    add: (body: any) =>
      request<{ message: string; worker: User }>('/workers', {
        method: 'POST',
        body: JSON.stringify(body),
      }),
    update: (id: string, body: any) =>
      request<{ message: string; worker: User }>(`/workers/${id}`, {
        method: 'PUT',
        body: JSON.stringify(body),
      }),
    getMyTasks: () => request<{ tasks: JobTask[] }>('/workers/my-tasks'),
  },

  // Customer Accounts (Admin)
  customers: {
    list: () => request<{ customers: User[] }>('/auth/customers'),
    create: (body: { name: string; email?: string; phone: string; password?: string }) =>
      request<{ message: string; customer: User }>('/auth/customers', {
        method: 'POST',
        body: JSON.stringify(body),
      }),
  },

  // Contact
  contact: {
    submit: (body: { name: string; phone: string; subject?: string; message: string }) =>
      request<{ message: string; contactId: string }>('/contact', {
        method: 'POST',
        body: JSON.stringify(body),
      }),
    list: () => request<{ messages: ContactMessage[] }>('/contact'),
    updateStatus: (id: string, status: string) =>
      request<{ message: string; messageItem: ContactMessage }>(`/contact/${id}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status }),
      }),
  },

  // Reports
  reports: {
    getDashboardMetrics: () =>
      request<{
        metrics: DashboardMetrics;
        recentActivity: any;
      }>('/reports/dashboard-metrics'),
    getDetailedReport: (params?: { startDate?: string; endDate?: string; type?: string }) => {
      const q = new URLSearchParams();
      if (params?.startDate) q.append('startDate', params.startDate);
      if (params?.endDate) q.append('endDate', params.endDate);
      if (params?.type) q.append('type', params.type);
      return request<{ reportData: any }>(`/reports/detailed?${q.toString()}`);
    },
  },

  // File Upload
  upload: async (file: File): Promise<{ url: string; filename: string }> => {
    const formData = new FormData();
    formData.append('photo', file);

    const token = getToken();
    const headers: Record<string, string> = {};
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const res = await fetch(`${API_BASE}/upload`, {
      method: 'POST',
      headers,
      body: formData,
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.message || 'File upload failed.');
    }
    return data;
  },
};
