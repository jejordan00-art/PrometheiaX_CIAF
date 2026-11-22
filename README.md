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
    "id": "1",
    "estudiante": "Ana Gómez",
    "tipoServicio": "Asesoría académica",
    "tema": "Arquitectura de software",
    "fechaHora": "2026-12-05T10:00:00",
    "precioBase": 200000,
    "prioritario": true,
    "parametroN": 7,
    "porcentajeRecargo": 14,
    "valorRecargo": 28000,
    "totalPagar": 228000,
    "estado": "Confirmada",
    "creadoEn": "2026-11-21T10:00:00.000Z"
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
git clone <URL_DEL_REPOSITORIO_GITHUB>
cd universidad
```

### Paso 2: Instalar dependencias
```bash
npm install
```

### Paso 3: Configurar variables de entorno
Copia la plantilla `.env.example` en un nuevo archivo `.env`:
```bash
cp .env.example .env
```
Ajusta la variable `EQUIPO_N` con el número oficial de lista del primer integrante del equipo:
```env
PORT=3000
EQUIPO_N=7
```

### Paso 4: Iniciar el servidor
```bash
npm start
```

El servidor quedará en ejecución en:
* **Interfaz Gráfica Web del Foro y Asesorías:** [http://localhost:3000](http://localhost:3000)
* **Endpoint API de Turnos:** [http://localhost:3000/api/turnos](http://localhost:3000/api/turnos)

---

## 7. Pruebas Automatizadas

El proyecto incluye una suite completa de pruebas unitarias y de integración que verifican los 9 criterios de la rúbrica sin requerir librerías pesadas.

Para ejecutar los tests automatizados:
```bash
npm test
```

### Salida Real de las Pruebas:
```text
=============================================================
   PROMETHEIAX — EJECUCIÓN DE PRUEBAS TÉCNICAS (CIAF)        
=============================================================

  ✔ [PRUEBA 1] GET /api/turnos debe responder con HTTP 200 y un arreglo de turnos
  ✔ [PRUEBA 2] GET /api/turnos/:id con ID existente debe responder con HTTP 200
  ✔ [PRUEBA 3] GET /api/turnos/:id con ID inexistente debe responder con HTTP 404 Not Found
  ✔ [PRUEBA 4] POST /api/turnos con prioritario=true debe responder HTTP 201 y aplicar recargo de N
  ✔ [PRUEBA 5] POST /api/turnos con prioritario=false debe responder HTTP 201 sin recargo
  ✔ [PRUEBA 6] POST /api/turnos con campos vacíos debe responder con HTTP 400 Bad Request
  ✔ [PRUEBA 7] POST /api/turnos con precioBase <= 0 debe responder con HTTP 400 Bad Request
  ✔ [PRUEBA 8] Verificar persistencia en data/turnos.json
  ✔ [PRUEBA 9] Verificar cálculo directo en services/turnos.service.js

-------------------------------------------------------------
 RESULTADO FINAL: 9/9 PRUEBAS EXITOSAS (100%)
-------------------------------------------------------------
```

---

## 8. Instrucciones de Entrega y Publicación en GitHub

1. Inicializar Git y verificar exclusión de `node_modules`:
   ```bash
   git init
   git add .
   git commit -m "feat: Implementacion PrometheiaX API REST por capas para Taller CIAF"
   ```
2. Crear un repositorio público en GitHub (ej: `prometheiax-api-ciaf`).
3. Vincular y subir:
   ```bash
   git branch -M main
   git remote add origin https://github.com/TU_USUARIO/prometheiax-api-ciaf.git
   git push -u origin main
   ```
4. Adjuntar el enlace público de GitHub en la plataforma virtual de CIAF junto con los dos documentos Word de sustentación e instalación.
