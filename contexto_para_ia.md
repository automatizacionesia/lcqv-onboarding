# Contexto Profundo de Webhooks y Lógica Externa

## 1. Endpoints y Webhooks Utilizados

### Webhooks principales
- **Validación de ID**
  - **Endpoint:** `https://webhook.lacocinaquevende.com/webhook/ingresoonb`
  - **Función:** Valida el ID ingresado por el usuario y determina el tipo de usuario (`closer`, `restaurante`, `admin`, `id_no_existe`).
  - **Uso:** Página principal (`/`), función `apiService.validateId(id)`.

- **Generación de ID (para closers)**
  - **Endpoint:** `https://webhook.lacocinaquevende.com/webhook/idclosers`
  - **Función:** Permite a los closers crear un nuevo ID único para un restaurante.
  - **Uso:** Página `/closer`, función `apiService.generateId(formData)`.

- **Onboarding Restaurante - Formulario Consolidado**
  - **Endpoint:** `https://webhook.lacocinaquevende.com/webhook/ingresardatosuserpt1`
  - **Función:** Recibe los datos consolidados del restaurante (solo campos de la Lista Blanca).
  - **Uso:** Página `/restaurant/form`, envío de formulario único.

---

## 2. Lógica de Integración y Flujo

### Validación de ID (Landing Page)
- El usuario ingresa un ID.
- Se llama a `apiService.validateId(id)` (POST a `/ingresoonb`).
- El backend responde con el tipo de usuario y datos asociados.
- Según el tipo de usuario:
  - **closer:** Redirige a `/closer`.
  - **restaurante:** Guarda datos en localStorage y redirige a `/restaurant`.
  - **admin/otros:** Muestra mensaje de implementación en progreso.

### Generación de ID (Closer)
- El closer llena un formulario con datos del restaurante y su venta.
- Se llama a `apiService.generateId(formData)` (POST a `/idclosers`).
- El backend responde con el nuevo ID y un mensaje para el cliente.
- El closer puede copiar el mensaje y generar nuevos IDs.

### Onboarding Restaurante (REFACTORIZADO - Formulario Único)
- **Formulario Consolidado:**
  - El restaurante llena únicamente los campos de la "Lista Blanca".
  - Se envían todos los datos a `/ingresardatosuserpt1`.
  - Se guarda el progreso en localStorage.
  - Se redirige directamente a la página de despedida.
- **Página de Despedida:**
  - Pantalla de felicitación y cierre, sin integración externa.

### Campos de la Lista Blanca (Únicos permitidos)
1. País del restaurante
2. Ciudad del restaurante
3. Nombre del representante legal
4. ID del documento del representante legal
5. Nombre de la empresa (RUT)
6. Número de identificación fiscal o NIT
7. Correo de Gmail en el que puedan ver documentos de Google Drive
8. Correo corporativo del restaurante (puede ser el mismo de arriba)

---

## 3. Tipos de Datos y Respuestas

### Respuesta de Validación de ID
```ts
interface WebhookResponse {
  success: boolean;
  message: string;
  data?: {
    id: string;
    message: string;
    respuesta: string; // 'closer', 'restaurante', 'admin', 'id_no_existe'
    [key: string]: any;
  };
  userType?: 'closer' | 'restaurante' | 'admin' | null;
  error?: string;
}
```

### Datos enviados por el closer
```ts
interface CloserFormData {
  restaurantName: string;
  package: 'mensual' | '3months' | '6months';
  amountPaid: number;
  adsAmount: number;
  hasGuarantee: boolean;
  closerName: string;
  instagram: string;
  adsPlatform?: 'Meta' | 'Meta y TikTok'; // Opcional
  branchCount: number;
  notes: string;
}
```

### Datos del formulario consolidado de restaurante
```ts
interface FormData {
  pais: string;
  ciudad: string;
  representante: string;
  idRepresentante: string;
  empresa: string;
  nit: string;
  gmail: string;
  correoCorporativo: string;
}
```

---

## 4. Utilidades y Helpers

- **Notificaciones:**
  - Se usa `sonner` para mostrar toasts de éxito, error, info y carga.
- **Persistencia:**
  - Se usa `storageHelper` para guardar datos en localStorage con expiración.
- **Validadores:**
  - Validaciones de campos requeridos, emails, números, etc.
- **Contexto de Usuario:**
  - Se maneja el usuario globalmente con React Context (`UserContext`).

---

## 5. Resumen de Seguridad y Buenas Prácticas
- Los endpoints de webhooks esperan datos bien formateados y validan el tipo de usuario.
- El acceso a rutas está protegido según el tipo de usuario.
- Los datos sensibles se guardan en localStorage solo lo necesario.
- Las credenciales de Minio están embebidas en el frontend (¡mejorar esto en producción!).

---

## 6. Diagrama de Flujo (REFACTORIZADO)

```mermaid
graph TD;
  A[Usuario ingresa ID] --> B{Validar ID (webhook)}
  B -- closer --> C[Redirige a /closer]
  B -- restaurante --> D[Redirige a /restaurant]
  C --> E[Closer genera ID (webhook)]
  D --> F[Onboarding Formulario Único (webhook)]
  F --> G[Página de Despedida (finaliza)]
```

---

## 7. Cambios de Refactorización Implementados

### Eliminaciones:
- Formulario 2 (`/restaurant/form/page2`) completamente eliminado
- Subida de archivos a Minio eliminada
- Campos de contactos de WhatsApp eliminados
- Campos de servicios a potenciar eliminados
- Barra de progreso eliminada
- Lógica de sesiones compleja simplificada

### Consolidaciones:
- Un solo formulario con 8 campos de la Lista Blanca
- Un solo webhook para todos los datos
- Flujo directo: Formulario → Despedida
- UI 100% responsive con grid y gap

### Texto Actualizado:
- Sección de WhatsApp actualizada según especificaciones
- Mensaje de despedida simplificado y más directo

---

Este archivo sirve como referencia integral para entender cómo se integran y usan los webhooks, qué datos se envían y reciben, y cómo se estructura el flujo de onboarding y generación de IDs en el sistema después de la refactorización crítica. 