export interface User {
  id: number;
  username: string;
  email: string;
  roles: string[];
  locale: string;
  createdAt: string;
  updatedAt: string;
}

export interface FileItem {
  id: number;
  originalName: string;
  mimeType: string;
  size: string;
  isImage: boolean;
  isVideo: boolean;
  isAudio: boolean;
  ownerId: number;
  ownerName: string;
  createdAt: string;
  updatedAt: string;
}

export interface AccessLogEntry {
  id: number;
  userId: number | null;
  username: string | null;
  ip: string;
  userAgent: string | null;
  action: string;
  detail: string | null;
  createdAt: string;
}

export interface ChartDataPoint {
  date: string;
  total: number;
  failed: number;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  errors?: Record<string, string>;
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    pages: number;
  };
}

export interface LoginResponse {
  token: string;
  user: User;
}

export interface SetupStatus {
  setupComplete: boolean;
}
