import { WebhookResponse, CloserFormData } from '@/lib/types';

// URL base de la API
const API_BASE_URL = 'https://webhook.lacocinaquevende.com/webhook';

// Endpoints
const ENDPOINTS = {
  validateId: `${API_BASE_URL}/ingresoonb`,
  generateId: `${API_BASE_URL}/idclosers`,
};

// Timeout para solicitudes (ms)
const REQUEST_TIMEOUT = 10000;

// Helper para manejar timeouts en solicitudes
const timeoutPromise = <T>(ms: number, promise: Promise<T>): Promise<T> => {
  return new Promise((resolve, reject) => {
    const timeoutId = setTimeout(() => {
      reject(new Error('La solicitud ha excedido el tiempo de espera. Intenta nuevamente más tarde.'));
    }, ms);
    
    promise
      .then((result) => {
        clearTimeout(timeoutId);
        resolve(result);
      })
      .catch((error) => {
        clearTimeout(timeoutId);
        reject(error);
      });
  });
};

// Métodos del servicio de API
export const apiService = {
  validateId: async (id: string): Promise<WebhookResponse> => {
    try {
      console.log('Enviando solicitud al webhook de validación:', ENDPOINTS.validateId);
      
      const response = await timeoutPromise(
        REQUEST_TIMEOUT,
        fetch(ENDPOINTS.validateId, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ id }),
        })
      );
      
      if (!response.ok) {
        throw new Error('Error del servidor. Intenta nuevamente más tarde.');
      }
      
      const data = await response.json();
      console.log('Respuesta del webhook:', data);
      
      // Verificar el campo respuesta del webhook
      if (!data.respuesta || !['closer', 'restaurante', 'admin', 'id_no_existe', 'problemas'].includes(data.respuesta)) {
        return {
          success: false,
          message: 'Error de validación. Por favor, intenta nuevamente.',
          userType: null,
        };
      }
      
      // Manejar caso id_no_existe
      if (data.respuesta === 'id_no_existe') {
        return {
          success: false,
          message: 'ID no encontrado. Por favor, verifica e intenta nuevamente.',
          userType: null,
        };
      }
      
      return {
        success: true,
        message: 'ID validado correctamente',
        userType: data.respuesta,
        data,
      };
    } catch (error) {
      console.error('Error validando ID:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Error desconocido',
        userType: null,
      };
    }
  },
  
  generateId: async (formData: CloserFormData): Promise<WebhookResponse> => {
    try {
      console.log('Enviando solicitud al webhook de generación de ID:', ENDPOINTS.generateId);
      
      const response = await timeoutPromise(
        REQUEST_TIMEOUT,
        fetch(ENDPOINTS.generateId, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(formData),
        })
      );
      
      if (!response.ok) {
        throw new Error('Error del servidor. Intenta nuevamente más tarde.');
      }
      
      const data = await response.json();
      console.log('Respuesta del webhook:', data);
      
      if (!data.respuesta) {
        throw new Error('Error en la respuesta del servidor. No se recibió el mensaje esperado.');
      }
      
      return {
        success: true,
        message: 'ID generado correctamente',
        data
      };
    } catch (error) {
      console.error('Error generando ID:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Error desconocido',
      };
    }
  },
};

// Exportamos apiService como default para ser importado en las páginas
export default apiService;
