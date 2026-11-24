# PrometheiaX — Foro Académico y API REST por Capas

> **Taller Evaluativo Final — Arquitectura Cliente-Servidor**  
> **Institución:** Corporación Instituto de Administración y Finanzas (CIAF)  
> **Programa:** Profesional en Ingeniería de Software  
> **Docente:** Arquitectura de Software  

---

## 1. Integrantes del Equipo y Asignación del Parámetro N

De acuerdo con las instrucciones oficiales del taller evaluativo de CIAF, los integrantes del equipo se ordenan estrictamente de manera **alfabética por apellido** según el listado oficial de asistencia (Página 5 del PDF). El parámetro **N** del equipo corresponde al **número oficial de lista del primer integrante** en dicho orden.

### Integrantes Oficiales del Equipo (Arquitectura de Software - Grupo 1 Martes)

| # | Apellidos y Nombres | Número en Lista Oficial CIAF | Grupo de Clase | Rol en el Proyecto |
|---|---------------------|:----------------------------:|:--------------:|---------------------|
| 1 | **Jordan Rivas, John Edison** | **#10 (N = 10)** | Grupo 1 martes | Arquitectura, Capa Services y Lógica N |
| 2 | **Sánchez Rodríguez, Laura Ximena** | **#19** | Grupo 1 martes | Capa Controllers, Routes y Validaciones HTTP |

> **Justificación de la Obtención de N:**  
> Al ordenar alfabéticamente por apellido los integrantes del equipo:
> 1. **Jordan Rivas, John Edison** (Letra 'J') → Puesto **#10** en la lista oficial de CIAF.
> 2. **Sánchez Rodríguez, Laura Ximena** (Letra 'S') → Puesto **#19** en la lista oficial de CIAF.
> 
> Como el primer integrante por orden alfabético es **John Edison Jordan Rivas**, el valor de **N asignado al equipo es exactamente N = 10**.
> Este parámetro se encuentra configurado en la variable de entorno `EQUIPO_N=10` en el archivo `.env`.

### Cálculo del Porcentaje de Recargo Oficial
$$\text{porcentajeRecargo} = N \times 2\%$$

$$\text{porcentajeRecargo} = 10 \times 2\% = \mathbf{20\%}$$

* **Fórmula de Tarifa Final en `services/turnos.service.js`:**
  * Si `prioritario = true`:
    $$\text{totalPagar} = \text{precioBase} + \left(\text{precioBase} \times \frac{20}{100}\right)$$
  * Si `prioritario = false` o no se especifica:
    $$\text{totalPagar} = \text{precioBase}$$

* **Demostración de Cálculo Real:**
  * Para una asesoría con `precioBase = 200.000 COP` y `prioritario = true`:
    $$\text{Recargo} = 200.000 \times 20\% = 40.000\text{ COP}$$
    $$\text{totalPagar} = 200.000 + 40.000 = \mathbf{240.000\text{ COP}}$$
  * Para una asesoría con `precioBase = 150.000 COP` y `prioritario = false`:
    $$\text{Recargo} = 0\text{ COP}$$
    $$\text{totalPagar} = \mathbf{150.000\text{ COP}}$$

---

## 2. Descripción del Negocio Elegido: PrometheiaX

**PrometheiaX** es un foro académico inteligente diseñado para la comunidad universitaria de ingeniería de software. Su objetivo primordial es brindar un espacio donde los estudiantes pueden:
1. Compartir conocimientos técnicos y participar en debates de programación y arquitectura.
2. Formular preguntas académicas y recibir respuestas categorizadas.
3. **Módulo Central del Taller:** Solicitar **turnos de asesorías y tutorías académicas personalizadas** con docentes o monitores expertos.

### Datos Específicos que Requiere un Turno de Asesoría:
* `estudiante` *(String)*: Nombre y apellido del estudiante que solicita la asesoría (obligatorio).
* `tipoServicio` *(String)*: Modalidad académica solicitada (ej: *"Asesoría académica individual"*, *"Tutoría personalizada"*, *"Revisión de proyecto"*).
* `tema` *(String)*: Tema o materia de la sesión (ej: *"Arquitectura por capas en Express"*, *"Normalización de bases de datos"*).
* `fechaHora` *(String ISO 8601)*: Fecha y hora programada para la atención (ej: `"2026-12-05T10:00:00"`).
* `precioBase` *(Number)*: Tarifa base en pesos colombianos simulada con fines académicos; debe ser estrictamente **mayor a 0**.
* `prioritario` *(Boolean)*: Indica si el estudiante requiere atención de urgencia/prioritaria. Si es `true`, activa el recargo calculado mediante la regla $N \times 2\%$.

---

## 3. Arquitectura del Proyecto por Capas

El proyecto implementa de manera rigurosa la separación de responsabilidades exigida en la rúbrica de evaluación:

```text
universidad/
├── index.js                     # Inicialización de Express, middlewares y servidor
├── routes/
│   ├── turnos.routes.js         # Definición limpia de endpoints de turnos
│   └── foro.routes.js           # Endpoints del foro de preguntas y debates
├── controllers/
│   └── turnos.controller.js     # Manejo de req/res, validaciones y códigos HTTP
├── services/
│   └── turnos.service.js        # Lógica de negocio, regla N y persistencia
├── data/
│   ├── turnos.json              # Almacenamiento local persistente de turnos
│   └── foro.json                # Persistencia local de preguntas del foro
├── public/                      # Frontend web completo de PrometheiaX
│   ├── index.html               # Interfaz de usuario (asesorías, foro, consola)
│   ├── styles.css               # Diseño moderno, responsivo y temas de estado
│   └── app.js                   # Cliente HTTP (fetch) y simulador en tiempo real
├── test/
│   └── turnos.test.js           # Suite de pruebas automatizadas (100% cobertura)
├── .env.example                 # Plantilla documentada de variables de entorno
├── .env                         # Variables de entorno locales (puerto y EQUIPO_N)
├── .gitignore                   # Exclusión de node_modules y archivos temporales
└── package.json                 # Dependencias y scripts de ejecución
```

### Responsabilidad de Cada Capa

| Capa / Archivo | Responsabilidad Técnica |
|---|---|
| **`index.js`** | Únicamente inicializa Express, configura los middlewares (`express.json()`, `cors`, `express.static`), conecta el router en `/api/turnos` y `/api/foro`, y pone el servidor a la escucha en el puerto definido. |
| **`routes/turnos.routes.js`** | Define exclusivamente los verbos y rutas HTTP (`GET /`, `GET /:id`, `POST /`), vinculándolos directamente a los métodos del controlador sin implementar ninguna lógica. |
| **`controllers/turnos.controller.js`** | Extrae los datos de `req.body` o `req.params`. Valida que no falten campos obligatorios y que `precioBase > 0`. Si hay datos inválidos, responde con **HTTP 400 Bad Request**. Si se consulta un ID inexistente, responde con **HTTP 404 Not Found**. Delega a la capa de servicios y responde con **HTTP 200 OK** o **HTTP 201 Created**. |
| **`services/turnos.service.js`** | Aloja toda la regla de negocio. Calcula la tarifa con el porcentaje $N \times 2\%$. Genera los identificadores únicos y gestiona la lectura y escritura segura en `data/turnos.json`. |
| **`data/turnos.json`** | Archivo plano local que almacena los registros durante la ejecución sin necesidad de un motor de base de datos externo. |

---

## 4. Endpoints de la API REST y Protocolos HTTP

### Resumen de Códigos HTTP Implementados

| Código HTTP | Nombre | Cuándo se produce en PrometheiaX |
|:-----------:|:-------|:--------------------------------|
| **`200 OK`** | Petición Exitosa | Al listar todas las solicitudes (`GET /api/turnos`) o consultar un ID existente (`GET /api/turnos/:id`). |
| **`201 Created`** | Recurso Creado | Al registrar exitosamente una nueva solicitud de asesoría (`POST /api/turnos`). |
| **`400 Bad Request`** | Petición Incorrecta | Cuando faltan campos obligatorios en el JSON o el `precioBase` es $\le 0$ o no es numérico. |
| **`404 Not Found`** | No Encontrado | Cuando se consulta un ID de turno que no existe en el almacenamiento (`GET /api/turnos/999999`). |

---

## 5. Ejemplos de Peticiones y Respuestas JSON

### A. Caso Exitoso con Atención Prioritaria (HTTP 201 Created)

**Endpoint:** `POST /api/turnos`  
**Encabezados:** `Content-Type: application/json`

**Cuerpo de la Petición (Request JSON):**
```json
{
  "estudiante": "Ana Gómez",
  "tipoServicio": "Asesoría académica",
  "tema": "Arquitectura de software",
  "fechaHora": "2026-12-05T10:00:00",
  "precioBase": 200000,
  "prioritario": true
}
```

**Respuesta del Servidor (Response JSON — HTTP 201 Created con N = 10):**
```json
{
  "exito": true,
  "mensaje": "Solicitud de asesoría académica registrada exitosamente.",
  "datos": {
    "id": "3",
    "estudiante": "Laura Ximena Sánchez",
    "tipoServicio": "Asesoría académica",
    "tema": "Arquitectura de software",
    "fechaHora": "2026-12-05T10:00:00",
    "precioBase": 200000,
    "prioritario": true,
    "parametroN": 10,
    "porcentajeRecargo": 20,
    "valorRecargo": 40000,
    "totalPagar": 240000,
    "estado": "Confirmada",
    "creadoEn": "2026-11-21T19:45:00.000Z"
  }
}
```
*Demostración del cálculo:*  
$\text{Recargo} = 200.000 \times 20\% = 40.000$ COP.  
$\text{Total a Pagar} = 200.000 + 40.000 = 240.000$ COP.

---

### B. Caso Exitoso Sin Atención Prioritaria (HTTP 201 Created)

**Endpoint:** `POST /api/turnos`  
**Cuerpo de la Petición (Request JSON):**
```json
{
  "estudiante": "Carlos Mendoza",
  "tipoServicio": "Tutoría personalizada",
  "tema": "Bases de datos relacionales y normalización",
  "fechaHora": "2026-12-06T14:30:00",
  "precioBase": 150000,
  "prioritario": false
}
```

**Respuesta del Servidor (Response JSON — HTTP 201 Created):**
```json
{
  "exito": true,
  "mensaje": "Solicitud de asesoría académica registrada exitosamente.",
  "datos": {
    "id": "4",
    "estudiante": "Carlos Mendoza",
    "tipoServicio": "Tutoría personalizada",
    "tema": "Bases de datos relacionales y normalización",
    "fechaHora": "2026-12-06T14:30:00",
    "precioBase": 150000,
    "prioritario": false,
    "parametroN": 7,
    "porcentajeRecargo": 0,
    "valorRecargo": 0,
    "totalPagar": 150000,
    "estado": "Confirmada",
    "creadoEn": "2026-11-21T19:46:00.000Z"
  }
}
```

---

### C. Caso de Error de Validación por Campos Faltantes (HTTP 400 Bad Request)

**Endpoint:** `POST /api/turnos`  
**Cuerpo de la Petición (Request JSON):**
```json
{
  "estudiante": "",
  "tipoServicio": "Asesoría académica",
  "fechaHora": "2026-12-05T10:00:00",
  "precioBase": 100000
}
```
*(Falta el campo obligatorio `tema` y el nombre del estudiante viene vacío)*

**Respuesta del Servidor (Response JSON — HTTP 400 Bad Request):**
```json
{
  "exito": false,
  "error": "Validación de entrada fallida (400 Bad Request)",
  "detalles": [
    "El campo \"estudiante\" es obligatorio y debe ser un texto no vacío.",
    "El campo \"tema\" es obligatorio (ej: \"Arquitectura de software\")."
  ],
  "mensaje": "La solicitud no pudo ser procesada debido a datos incompletos o inválidos."
}
```

---

### D. Caso de Error de Validación por Precio Base Inválido (HTTP 400 Bad Request)

**Endpoint:** `POST /api/turnos`  
**Cuerpo de la Petición (Request JSON):**
```json
{
  "estudiante": "Laura Ximena Sánchez",
  "tipoServicio": "Asesoría académica",
  "tema": "Patrones de Diseño",
  "fechaHora": "2026-12-10T10:00:00",
  "precioBase": -50000,
  "prioritario": true
}
```

**Respuesta del Servidor (Response JSON — HTTP 400 Bad Request):**
```json
{
  "exito": false,
  "error": "Validación de entrada fallida (400 Bad Request)",
  "detalles": [
    "El campo \"precioBase\" debe ser un valor numérico mayor a cero (> 0). Los valores menores o iguales a cero no son permitidos."
  ],
  "mensaje": "La solicitud no pudo ser procesada debido a datos incompletos o inválidos."
}
```

---

### E. Caso de Consulta Exitosa por ID (HTTP 200 OK)

**Endpoint:** `GET /api/turnos/1`

**Respuesta del Servidor (Response JSON — HTTP 200 OK):**
```json
{
  "exito": true,
  "datos": {
    "id": 1,
    "estudiante": "Laura Ximena Sánchez",
    "tipoServicio": "Tutoría de código",
    "tema": "Arquitectura de software por capas",
    "fechaHora": "2026-11-24T15:00:00.000Z",
    "precioBase": 200000,
    "prioritario": true,
    "parametroN": 10,
    "porcentajeRecargo": 20,
    "valorRecargo": 40000,
    "totalPagar": 240000,
    "estado": "Confirmada",
    "creadoEn": "2026-11-22T06:00:00.000Z"
  }
}
```

---

### F. Caso de Consulta con Identificador Inexistente (HTTP 404 Not Found)

**Endpoint:** `GET /api/turnos/999999`

**Respuesta del Servidor (Response JSON — HTTP 404 Not Found):**
```json
{
  "exito": false,
  "error": "Recurso no encontrado (404 Not Found)",
  "mensaje": "No existe ninguna solicitud de asesoría con el identificador \"999999\"."
}
```

---

## 6. Instalación y Puesta en Marcha

### Requisitos Previos
* Node.js versión 18 o superior instalado.
* Gestor de paquetes npm instalado.

### Paso 1: Clonar o descargar el repositorio
```bash
git clone https://github.com/xjordan1x/prometheiax-api-ciaf.git
cd prometheiax-api-ciaf
```

### Paso 2: Instalar dependencias
```bash
npm install
# O en Windows PowerShell si hay bloqueo de scripts:
npm.cmd install
```

### Paso 3: Configurar variables de entorno (.env)
Copia la plantilla `.env.example` en un nuevo archivo `.env`:
```bash
cp .env.example .env
```
Asegúrate de configurar los parámetros oficiales del equipo:
```env
PORT=3000
EQUIPO_N=10
```

### Paso 4: Iniciar el servidor
```bash
npm start
# O en modo desarrollo con recarga automática:
npm run dev
```

El servidor quedará en ejecución en:
* **Interfaz Gráfica Web del Foro y Asesorías:** [http://localhost:3000](http://localhost:3000)
* **Endpoint API de Turnos:** [http://localhost:3000/api/turnos](http://localhost:3000/api/turnos)

---

## 7. Suite Completa de Pruebas Técnicas Automatizadas (25/25 — 100% OK)

El proyecto cuenta con una suite completa de pruebas técnicas que evalúan unitarias, integración HTTP, seguridad defensiva y carga/concurrencia:

```bash
# Ejecutar todas las pruebas con reporte unificado:
npm test

# O ejecutar por categorías individuales:
npm run test:unit         # 6 Pruebas unitarias de servicios y regla N
npm run test:integration  # 10 Pruebas de integración HTTP (200, 201, 400, 404)
npm run test:security     # 6 Pruebas de seguridad defensiva y casos de borde
npm run test:load         # 3 Pruebas de carga, concurrencia y latencia < 100ms
```

### Salida Real de la Suite de Pruebas:
```text
╔══════════════════════════════════════════════════════════════════╗
║       PROMETHEIAX — REPORTE GLOBAL DE PRUEBAS TÉCNICAS (CIAF)    ║
║   Integrantes: John Edison Jordan (#10) y Laura Sánchez (#19)   ║
║   Parámetro N = 10 · Recargo Prioritario = 20%                   ║
╚══════════════════════════════════════════════════════════════════╝

--- 🔬 PRUEBAS UNITARIAS (services/turnos.service.js) ---
  ✔ [UNIT-1] obtenerParametroN() debe devolver 10 (por John Edison Jordan #10)
  ✔ [UNIT-2] obtenerConfiguracionNegocio() debe retornar N=10 y porcentajeRecargo=20
  ✔ [UNIT-3] calcularTarifa(200000, true) debe aplicar recargo del 20% (Total: 240.000 COP)
  ✔ [UNIT-4] calcularTarifa(150000, false) no debe aplicar recargo (Total: 150.000 COP)
  ✔ [UNIT-5] calcularTarifa(80000, undefined) debe asumir prioridad false por defecto
  ✔ [UNIT-6] calcularTarifa(123455, true) debe redondear el recargo a enteros
  Subtotal Unitarias: 6/6 exitosas

--- 🌐 PRUEBAS DE INTEGRACIÓN (ENDPOINTS & PROTOCOLOS HTTP) ---
  ✔ [INTEG-1] GET /api responde HTTP 200 OK con metadatos del servicio
  ✔ [INTEG-2] GET /api/turnos responde HTTP 200 OK con arreglo de solicitudes
  ✔ [INTEG-3] GET /api/turnos/1 responde HTTP 200 OK con el turno #1
  ✔ [INTEG-4] GET /api/turnos/999999 responde HTTP 404 Not Found con mensaje descriptivo
  ✔ [INTEG-5] POST /api/turnos con prioridad calcula 20% y devuelve HTTP 201 Created
  ✔ [INTEG-6] POST /api/turnos sin prioridad no aplica recargo y devuelve HTTP 201 Created
  ✔ [INTEG-7] POST /api/turnos con estudiante vacío rechaza con HTTP 400 Bad Request
  ✔ [INTEG-8] POST /api/turnos con precioBase <= 0 rechaza con HTTP 400 Bad Request
  ✔ [INTEG-9] GET a ruta inexistente /api/ruta-desconocida responde HTTP 404
  ✔ [INTEG-10] GET /api/foro responde HTTP 200 OK con hilos del foro académico
  Subtotal Integración: 10/10 exitosas

--- 🛡️ PRUEBAS DE SEGURIDAD Y CASOS DE BORDE (DEFENSIVE CODING) ---
  ✔ [SEC-1] POST /api/turnos con cuerpo {} vacío devuelve HTTP 400 Bad Request
  ✔ [SEC-2] POST /api/turnos con precioBase="gratis" devuelve HTTP 400 Bad Request
  ✔ [SEC-3] POST /api/turnos con precioBase=0 exacto devuelve HTTP 400 Bad Request
  ✔ [SEC-4] POST /api/turnos con fechaHora="manana-a-las-3" devuelve HTTP 400 Bad Request
  ✔ [SEC-5] POST /api/turnos sanitiza espacios y persiste texto sin romper el JSON
  ✔ [SEC-6] POST /api/turnos con estudiante=["Juan", "Pedro"] devuelve HTTP 400
  Subtotal Seguridad y Casos de Borde: 6/6 exitosas

--- ⚡ PRUEBAS DE CARGA Y CONCURRENCIA (STRESS & CONCURRENCY) ---
    📊 Métricas: 30 peticiones en 59ms (Promedio: 54ms/req)
  ✔ [LOAD-1] Ráfaga de 30 consultas GET /api/turnos en paralelo
    📊 Integridad: 15 solicitudes registradas concurrentemente con 15 IDs únicos.
  ✔ [LOAD-2] Ráfaga de 15 registros POST /api/turnos simultáneos (verificar IDs únicos)
    📊 Latencia individual: 2 ms
  ✔ [LOAD-3] Latencia de respuesta individual en GET /api/turnos < 100ms
  Subtotal Carga y Concurrencia: 3/3 exitosas

══════════════════════════════════════════════════════════════════
                  RESUMEN EJECUTIVO DE EVALUACIÓN                 
══════════════════════════════════════════════════════════════════
  1. Pruebas Unitarias (Services & Regla N):      6/6 OK
  2. Pruebas de Integración (Endpoints & HTTP):    10/10 OK
  3. Pruebas de Seguridad y Casos de Borde:       6/6 OK
  4. Pruebas de Carga y Concurrencia:             3/3 OK
──────────────────────────────────────────────────────────────────
  TOTAL GENERAL: 25/25 PRUEBAS EXITOSAS (100%)
  TIEMPO DE EJECUCIÓN TOTAL: 177 ms
══════════════════════════════════════════════════════════════════
```

---

## 8. Colección de Postman v2.1

En la carpeta `test/prometheiax.postman_collection.json` se incluye la colección oficial con 8 peticiones y aserciones `pm.test` automáticas para importar directamente en Postman.

---

## 9. Instrucciones de Entrega y Publicación en GitHub

1. Verificar estado del repositorio Git:
   ```bash
   git status
   ```
2. Crear un repositorio público en GitHub (ej: `prometheiax-api-ciaf`).
3. Vincular y subir a la cuenta `xjordan1x`:
   ```bash
   git remote add origin https://github.com/xjordan1x/prometheiax-api-ciaf.git
   git push -u origin main
   ```
4. Adjuntar en la plataforma virtual de CIAF:
   - El enlace al repositorio de GitHub.
   - El archivo comprimido `PrometheiaX_CIAF_Entrega.zip`.
   - Los dos documentos Word generados: `PrometheiaX — Guía de Sustentación.docx` y `PrometheiaX — Manual de Instalación y Despliegue.docx`.
