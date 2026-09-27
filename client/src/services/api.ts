import type { User, Report, Shelter, RouteData, UserRole } from '../types';

const API_BASE = (import.meta.env.VITE_API_URL as string) || 'http://localhost:5000/api';

function getAuthHeaders() {
  const token = localStorage.getItem('raksha_token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {})
  };
}

export const api = {
  // Auth
  async register(data: any): Promise<{ token: string; user: User }> {
    const res = await fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Registration failed');
    }
    return res.json();
  },

  async login(credentials: { email: string; password: string }): Promise<{ token: string; user: User }> {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials)
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Login failed');
    }
    return res.json();
  },

  async getMe(): Promise<{ user: User }> {
    const res = await fetch(`${API_BASE}/auth/me`, {
      headers: getAuthHeaders()
    });
    if (!res.ok) throw new Error('Session expired');
    return res.json();
  },

  async demoSwitch(role: UserRole): Promise<{ token: string; user: User }> {
    const res = await fetch(`${API_BASE}/auth/demo-switch`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ role })
    });
    if (!res.ok) throw new Error('Demo switch failed');
    return res.json();
  },

  // Reports
  async getReports(filters?: { type?: string; status?: string; severity?: string }): Promise<Report[]> {
    const params = new URLSearchParams();
    if (filters?.type) params.append('type', filters.type);
    if (filters?.status) params.append('status', filters.status);
    if (filters?.severity) params.append('severity', filters.severity);

    const res = await fetch(`${API_BASE}/reports?${params.toString()}`);
    if (!res.ok) throw new Error('Failed to fetch reports');
    return res.json();
  },

  async createReport(data: Partial<Report> & { coordinates: [number, number] }): Promise<Report> {
    const res = await fetch(`${API_BASE}/reports`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data)
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Failed to submit report');
    }
    return res.json();
  },

  async updateReportStatus(id: string, status: string, dispatchNotes?: string): Promise<Report> {
    const res = await fetch(`${API_BASE}/reports/${id}/status`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
      body: JSON.stringify({ status, dispatchNotes })
    });
    if (!res.ok) throw new Error('Failed to update report status');
    return res.json();
  },

  // Shelters
  async getShelters(): Promise<Shelter[]> {
    const res = await fetch(`${API_BASE}/shelters`);
    if (!res.ok) throw new Error('Failed to fetch shelters');
    return res.json();
  },

  async getNearestShelters(lng: number, lat: number): Promise<Shelter[]> {
    const res = await fetch(`${API_BASE}/shelters/nearest?lng=${lng}&lat=${lat}`);
    if (!res.ok) throw new Error('Failed to fetch nearest shelters');
    return res.json();
  },

  async updateShelterCapacity(id: string, capacityAvailable: number, activeEvacueesCount?: number): Promise<Shelter> {
    const res = await fetch(`${API_BASE}/shelters/${id}/capacity`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
      body: JSON.stringify({ capacityAvailable, activeEvacueesCount })
    });
    if (!res.ok) throw new Error('Failed to update capacity');
    return res.json();
  },

  async updateShelterSupplies(id: string, suppliesStatus: any): Promise<Shelter> {
    const res = await fetch(`${API_BASE}/shelters/${id}/supplies`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
      body: JSON.stringify({ suppliesStatus })
    });
    if (!res.ok) throw new Error('Failed to update supplies');
    return res.json();
  },

  // Routes
  async calculateRoute(start: [number, number], shelterId?: string, end?: [number, number]): Promise<RouteData> {
    const res = await fetch(`${API_BASE}/routes/calculate`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ start, shelterId, end })
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Failed to calculate route');
    }
    return res.json();
  },

  // Simulation
  async injectHazard(data: { title?: string; hazardCategory?: string; coordinates?: [number, number]; severity?: string }): Promise<any> {
    const res = await fetch(`${API_BASE}/simulation/inject-hazard`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error('Failed to inject hazard');
    return res.json();
  },

  async blockActiveRoute(routeCoordinates?: [number, number][], title?: string): Promise<any> {
    const res = await fetch(`${API_BASE}/simulation/block-active-route`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ routeCoordinates, title })
    });
    if (!res.ok) throw new Error('Failed to trigger route blockage');
    return res.json();
  },

  async triggerScenario(scenarioType: 'flash_flood' | 'earthquake'): Promise<any> {
    const res = await fetch(`${API_BASE}/simulation/scenario`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ scenarioType })
    });
    if (!res.ok) throw new Error('Failed to trigger scenario');
    return res.json();
  },

  async resetDemoData(): Promise<any> {
    const res = await fetch(`${API_BASE}/simulation/reset`, {
      method: 'POST',
      headers: getAuthHeaders()
    });
    if (!res.ok) throw new Error('Failed to reset simulation data');
    return res.json();
  }
};
