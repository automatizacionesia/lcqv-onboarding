// Definiciones de tipos para el proyecto

export interface UserData {
  id: string;
  userType: 'closer' | 'restaurante' | 'admin' | null;
  name?: string;
  state?: 'initial' | 'pt1' | 'pt2' | 'completed';
}

export interface WebhookResponse {
  success: boolean;
  message: string;
  data?: {
    id: string;
    message: string;
    respuesta: string;
    [key: string]: any;
  };
  userType?: 'closer' | 'restaurante' | 'admin' | null;
  error?: string;
}

export interface CloserFormData {
  restaurantName: string;
  package: 'mensual' | '3months' | '6months';
  amountPaid: number;
  adsAmount: number;
  hasGuarantee: boolean;
  closerName: string;
  instagram: string;
  adsPlatform?: 'Meta' | 'Meta y TikTok';
  branchCount: number;
  notes: string;
}
