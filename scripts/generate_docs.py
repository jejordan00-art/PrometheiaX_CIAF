# -*- coding: utf-8 -*-
"""
scripts/generate_docs.py
Generador profesional y exhaustivo de documentos Word (.docx) para PrometheiaX (CIAF).
Contiene:
1. PrometheiaX — Manual de Instalación y Despliegue.docx
2. PrometheiaX — Guía de Sustentación.docx
Integrantes: John Edison Jordan Rivas (#10) y Laura Ximena Sánchez Rodríguez (#19)
Parámetro oficial: N = 10 · Recargo Prioritario = 20%
"""

import os
from docx import Document
from docx.shared import Inches, Pt, RGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.enum.table import WD_TABLE_ALIGNMENT, WD_ALIGN_VERTICAL
from docx.oxml import OxmlElement, parse_xml
from docx.oxml.ns import nsdecls, qn

BASE_DIR = r"d:\proyectos\universidad"

def set_cell_background(cell, fill_hex):
    """Establece color de fondo de una celda de tabla."""
    tcPr = cell._element.get_or_add_tcPr()
    shd = parse_xml(f'<w:shd {nsdecls("w")} w:fill="{fill_hex}"/>')
    tcPr.append(shd)

def set_cell_margins(cell, top=140, bottom=140, left=180, right=180):
    """Establece márgenes internos de una celda en dxa."""
    tcPr = cell._element.get_or_add_tcPr()
    tcMar = parse_xml(f'<w:tcMar {nsdecls("w")}><w:top w:w="{top}" w:type="dxa"/><w:bottom w:w="{bottom}" w:type="dxa"/><w:left w:w="{left}" w:type="dxa"/><w:right w:w="{right}" w:type="dxa"/></w:tcMar>')
    tcPr.append(tcMar)

def add_callout(doc, title, text, bg_color="EEF2FF", border_color="4F46E5"):
    """Agrega una caja de llamado o alerta visual elegante y pedagógica."""
    tbl = doc.add_table(rows=1, cols=1)
    tbl.alignment = WD_TABLE_ALIGNMENT.CENTER
    cell = tbl.cell(0, 0)
    set_cell_background(cell, bg_color)
    set_cell_margins(cell, top=160, bottom=160, left=220, right=220)
    
    tcPr = cell._element.get_or_add_tcPr()
    borders = parse_xml(f'<w:tcBorders {nsdecls("w")}><w:left w:val="single" w:sz="36" w:space="0" w:color="{border_color}"/><w:top w:val="none"/><w:right w:val="none"/></w:tcBorders>')
    tcPr.append(borders)
    
    p = cell.paragraphs[0]
    p.paragraph_format.space_before = Pt(3)
    p.paragraph_format.space_after = Pt(3)
    p.paragraph_format.line_spacing = 1.15
    run_title = p.add_run(f"📌 {title}\n")
    run_title.bold = True
    run_title.font.name = "Calibri"
    run_title.font.size = Pt(11)
    run_title.font.color.rgb = RGBColor(0x1E, 0x1B, 0x4B)
    
    run_text = p.add_run(text)
    run_text.font.name = "Calibri"
    run_text.font.size = Pt(10)
    run_text.font.color.rgb = RGBColor(0x33, 0x41, 0x55)
    doc.add_paragraph()

def add_code_box(doc, code_text):
    """Agrega una caja de comandos o código formateado con fuente Consolas."""
    tbl = doc.add_table(rows=1, cols=1)
    tbl.alignment = WD_TABLE_ALIGNMENT.CENTER
    cell = tbl.cell(0, 0)
    set_cell_background(cell, "F8FAFC")
    set_cell_margins(cell, top=130, bottom=130, left=180, right=180)
    
    tcPr = cell._element.get_or_add_tcPr()
    borders = parse_xml(f'<w:tcBorders {nsdecls("w")}><w:left w:val="single" w:sz="14" w:space="0" w:color="CBD5E1"/><w:top w:val="single" w:sz="14" w:space="0" w:color="CBD5E1"/><w:right w:val="single" w:sz="14" w:space="0" w:color="CBD5E1"/><w:bottom w:val="single" w:sz="14" w:space="0" w:color="CBD5E1"/></w:tcBorders>')
    tcPr.append(borders)
    
    p = cell.paragraphs[0]
    p.paragraph_format.space_before = Pt(2)
    p.paragraph_format.space_after = Pt(2)
    p.paragraph_format.line_spacing = 1.05
    run = p.add_run(code_text)
    run.font.name = "Consolas"
    run.font.size = Pt(9)
    run.font.color.rgb = RGBColor(0x0F, 0x17, 0x2A)
    doc.add_paragraph()

def add_styled_table(doc, headers, rows_data):
    """Crea una tabla con cabecera estilizada en azul institucional y filas alternadas."""
    tbl = doc.add_table(rows=len(rows_data) + 1, cols=len(headers))
    tbl.alignment = WD_TABLE_ALIGNMENT.CENTER
    
    # Encabezado
    for col_idx, header_text in enumerate(headers):
        cell = tbl.cell(0, col_idx)
        set_cell_background(cell, "1E3A8A")
        set_cell_margins(cell, top=140, bottom=140, left=160, right=160)
        p = cell.paragraphs[0]
        p.alignment = WD_ALIGN_PARAGRAPH.CENTER
        run = p.add_run(header_text)
        run.bold = True
        run.font.name = "Calibri"
        run.font.size = Pt(10)
        run.font.color.rgb = RGBColor(0xFF, 0xFF, 0xFF)
        
    # Filas
    for row_idx, row_values in enumerate(rows_data):
        bg = "FFFFFF" if row_idx % 2 == 0 else "F8FAFC"
        for col_idx, val in enumerate(row_values):
            cell = tbl.cell(row_idx + 1, col_idx)
            set_cell_background(cell, bg)
            set_cell_margins(cell, top=120, bottom=120, left=150, right=150)
            p = cell.paragraphs[0]
            run = p.add_run(str(val))
            run.font.name = "Calibri"
            run.font.size = Pt(9.5)
            run.font.color.rgb = RGBColor(0x1E, 0x29, 0x3B)
            
    doc.add_paragraph()

# ==============================================================================
# 1. MANUAL DE INSTALACIÓN Y DESPLIEGUE EXHAUSTIVO
# ==============================================================================
def generar_manual_instalacion():
    print("Generando: PrometheiaX — Manual de Instalación y Despliegue.docx...")
    doc = Document()
    
    for s in doc.sections:
        s.top_margin = Inches(1)
        s.bottom_margin = Inches(1)
        s.left_margin = Inches(1)
        s.right_margin = Inches(1)
        
    # PORTADA
    p_head = doc.add_paragraph()
    p_head.alignment = WD_ALIGN_PARAGRAPH.CENTER
    r_inst = p_head.add_run("CORPORACIÓN INSTITUTO DE ADMINISTRACIÓN Y FINANZAS — CIAF\n")
    r_inst.bold = True
    r_inst.font.size = Pt(13)
    r_inst.font.color.rgb = RGBColor(0x1E, 0x3A, 0x8A)
    
    r_fac = p_head.add_run("FACULTAD DE INGENIERÍA — PROFESIONAL EN INGENIERÍA DE SOFTWARE\n"
                           "ASIGNATURA: ARQUITECTURA CLIENTE-SERVIDOR (GRUPO 1 MARTES)\n"
                           "DOCENTE: ING. GERMÁN ARGÜELLES\n\n")
    r_fac.font.size = Pt(10.5)
    r_fac.font.color.rgb = RGBColor(0x64, 0x74, 0x8B)
    
    p_title = doc.add_paragraph()
    p_title.alignment = WD_ALIGN_PARAGRAPH.CENTER
    r_title = p_title.add_run("PROMETHEIAX\n")
    r_title.bold = True
    r_title.font.size = Pt(30)
    r_title.font.color.rgb = RGBColor(0x25, 0x63, 0xEB)
    
    r_sub = p_title.add_run("Manual Técnico de Instalación, Configuración, Pruebas y Despliegue\n"
                            "Guía paso a paso para entornos locales (Windows / Mac / Linux) y producción en la nube\n\n")
    r_sub.font.size = Pt(13)
    r_sub.bold = True
    r_sub.font.color.rgb = RGBColor(0x0F, 0x17, 0x2A)
    
    add_callout(doc, "FICHA TÉCNICA OFICIAL DEL EQUIPO (CIAF)",
                "• Integrantes oficiales: John Edison Jordan Rivas (#10) y Laura Ximena Sánchez Rodríguez (#19)\n"
                "• Parámetro N asignado: N = 10 (Primer integrante en orden alfabético por apellido)\n"
                "• Porcentaje de recargo resultante: N × 2% = 10 × 2% = 20%\n"
                "• Stack tecnológico: Node.js 18+, Express 4.21, JavaScript moderno (CommonJS), CSS Grid nativo y persistencia local JSON.\n"
                "• Repositorio Git oficial: https://github.com/xjordan1x (Rama main, commits limpios)",
                bg_color="EFF6FF", border_color="2563EB")
                
    doc.add_page_break()

    # ÍNDICE
    h_idx = doc.add_heading("Tabla de Contenido", level=1)
    h_idx.runs[0].font.color.rgb = RGBColor(0x1E, 0x3A, 0x8A)
    
    doc.add_paragraph("1. Descripción General de la Arquitectura del Sistema\n"
                      "2. Requisitos Previos de Software y Hardware\n"
                      "3. Instalación y Configuración Local Paso a Paso\n"
                      "4. Puesta en Marcha del Servidor y Verificación en Vivo\n"
                      "5. Manual de Uso de la Interfaz Web (Clean University Mode)\n"
                      "6. Ejecución de la Suite Completa de Pruebas Técnicas (25/25)\n"
                      "7. Importación y Uso de la Colección de Postman (v2.1)\n"
                      "8. Guía de Despliegue en Servidores de Producción (Cloud / VPS)\n"
                      "9. Diagnóstico y Solución de Problemas Frecuentes (Troubleshooting)")

    # 1. ARQUITECTURA
    h1 = doc.add_heading("1. Descripción General de la Arquitectura del Sistema", level=1)
    h1.runs[0].font.color.rgb = RGBColor(0x1E, 0x3A, 0x8A)
    
    doc.add_paragraph(
        "PrometheiaX es una plataforma universitaria diseñada para la gestión académica de asesorías, tutorías de código y debates técnicos. "
        "El proyecto implementa una estricta arquitectura por capas (Layered Architecture) para desacoplar responsabilidades y cumplir a cabalidad "
        "con los lineamientos de la rúbrica oficial de la CIAF:"
    )
    
    add_styled_table(doc, ["Capa / Archivo", "Responsabilidad Exclusiva", "Regla de Diseño"], [
        ["index.js", "Punto de entrada principal. Configura Express, habilita middlewares (CORS, express.json()), monta las rutas y levanta el listener HTTP.", "No contiene lógica de negocio ni manipulación de datos."],
        ["routes/turnos.routes.js", "Definición limpia de endpoints REST (/ y /:id) asociándolos a cada método del controlador.", "Solo enlaza rutas URL con controladores."],
        ["controllers/turnos.controller.js", "Gestión de peticiones (req) y respuestas (res). Validación defensiva de datos y asignación de códigos HTTP (200, 201, 400, 404).", "No calcula fórmulas de tarifas; delega a services/."],
        ["services/turnos.service.js", "Cerebro del sistema. Implementa la regla matemática del parámetro N=10 (20% de recargo), gestión de identificadores y persistencia.", "Aislado de HTTP; reutilizable en cualquier contexto."],
        ["data/turnos.json", "Almacenamiento persistente local en formato JSON. Garantiza durabilidad entre reinicios sin dependencias externas pesadas.", "Lectura y escritura controlada por services/."]
    ])

    # 2. REQUISITOS
    h1 = doc.add_heading("2. Requisitos Previos de Software y Hardware", level=1)
    h1.runs[0].font.color.rgb = RGBColor(0x1E, 0x3A, 0x8A)
    
    doc.add_paragraph("Para ejecutar y desplegar PrometheiaX se requieren los siguientes componentes instalados en la máquina anfitriona:")
    doc.add_paragraph("• Node.js: Versión 18.x LTS o 20.x LTS (descargar instalador oficial en https://nodejs.org).", style='List Bullet')
    doc.add_paragraph("• npm (Node Package Manager): Versión 9.x o superior (incluido automáticamente con Node.js).", style='List Bullet')
    doc.add_paragraph("• Git: Para clonación y control de versiones (descargar desde https://git-scm.com).", style='List Bullet')
    doc.add_paragraph("• Navegador Web Moderno: Google Chrome, Microsoft Edge, Mozilla Firefox o Safari.", style='List Bullet')
    doc.add_paragraph("• Terminal de Comandos: PowerShell o CMD en Windows; Bash o Zsh en macOS y Linux.", style='List Bullet')

    # 3. INSTALACIÓN
    h1 = doc.add_heading("3. Instalación y Configuración Local Paso a Paso", level=1)
    h1.runs[0].font.color.rgb = RGBColor(0x1E, 0x3A, 0x8A)
    
    doc.add_paragraph("Sigue este procedimiento ordenado para preparar el entorno de ejecución desde cero:")
    
    p = doc.add_paragraph()
    p.add_run("Paso 3.1: Obtención del código fuente\n").bold = True
    p.add_run("Puedes clonar el repositorio desde GitHub o descomprimir el archivo de entrega institucional PrometheiaX_CIAF_Entrega.zip:")
    add_code_box(doc, "# Opción A: Clonar vía Git\ngit clone https://github.com/xjordan1x/prometheiax-api-ciaf.git\ncd prometheiax-api-ciaf\n\n# Opción B: Descomprimir el archivo ZIP y navegar al directorio\ncd d:\\proyectos\\universidad")

    p = doc.add_paragraph()
    p.add_run("Paso 3.2: Instalación de dependencias del proyecto\n").bold = True
    p.add_run("El proyecto requiere Express, CORS y Dotenv. Ejecuta en la raíz del proyecto:")
    add_code_box(doc, "# En sistemas estándar (Linux, macOS, CMD Windows):\nnpm install\n\n# En Windows PowerShell (si las políticas de script bloquean npm.ps1):\nnpm.cmd install")

    p = doc.add_paragraph()
    p.add_run("Paso 3.3: Configuración de variables de entorno (.env)\n").bold = True
    p.add_run("El sistema incluye un archivo .env.example como plantilla. Crea tu archivo .env en la raíz asegurando los parámetros del equipo:")
    add_code_box(doc, "# Archivo .env\nPORT=3000\nEQUIPO_N=10")

    # 4. PUESTA EN MARCHA
    h1 = doc.add_heading("4. Puesta en Marcha del Servidor y Verificación en Vivo", level=1)
    h1.runs[0].font.color.rgb = RGBColor(0x1E, 0x3A, 0x8A)
    
    doc.add_paragraph("Para levantar el servidor web y la API REST por capas:")
    add_code_box(doc, "# Modo Producción:\nnpm start\n\n# Modo Desarrollo (recarga automática ante cambios):\nnpm run dev")
    
    doc.add_paragraph("Una vez iniciado, la consola de Node.js mostrará el banner institucional de confirmación:")
    add_code_box(doc, "================================================================\n"
                      "   PROMETHEIAX — FORO ACADÉMICO & API REST POR CAPAS (CIAF)    \n"
                      "================================================================\n"
                      " Servidor ejecutándose en: http://localhost:3000\n"
                      " Interfaz web del Foro y Asesorías: http://localhost:3000\n"
                      " Endpoint de Turnos: http://localhost:3000/api/turnos\n"
                      " Integrantes: John Edison Jordan (#10) y Laura Ximena Sánchez (#19)\n"
                      " Parámetro N configurado: N = 10 (Recargo prioritario: 20%)\n"
                      "================================================================")
                      
    doc.add_paragraph("Abre tu navegador e ingresa a http://localhost:3000 para interactuar con la plataforma.")

    # 5. USO DE LA INTERFAZ
    h1 = doc.add_heading("5. Manual de Uso de la Interfaz Web (Clean University Mode)", level=1)
    h1.runs[0].font.color.rgb = RGBColor(0x1E, 0x3A, 0x8A)
    
    doc.add_paragraph("La interfaz web implementa la paleta Clean University en modo claro y ofrece las siguientes funcionalidades clave:")
    doc.add_paragraph("• Buscador Global en Tiempo Real (Navbar): Al escribir cualquier término ('Valentina', 'Arquitectura', 'Bases de datos' o un #ID), despliega un menú flotante con solicitudes y temas del foro coincidentes con texto resaltado. Al presionar Enter, filtra la tabla de inmediato.", style='List Bullet')
    doc.add_paragraph("• Modificación Dinámica de Fechas: En la tarjeta 'Próxima Asesoría Recomendada' del Overview, haz clic en el botón '✏️ Modificar' para seleccionar un nuevo día y hora mediante el calendario nativo. En el formulario de registro, el campo de fecha es totalmente libre y editable.", style='List Bullet')
    doc.add_paragraph("• Calculadora en Vivo con Regla N: En 'Nueva Asesoría', al ingresar un precio base y activar la casilla 'Atención prioritaria', la tarjeta de cotización calcula instantáneamente el 20% ($precioBase × 0.20) y actualiza el total a pagar.", style='List Bullet')
    doc.add_paragraph("• Pestañas de Paso (Step Tabs): Los botones '01 Detalles de la asesoría' y '02 Confirmación' permiten navegar entre la captura de datos y la confirmación visual de la cotización con efecto de pulso luminoso.", style='List Bullet')
    doc.add_paragraph("• Mis Solicitudes: Tabla completa con indicador de prioridad, recargo y botón 'Ver 200' para inspeccionar la respuesta JSON directa de la API.", style='List Bullet')
    doc.add_paragraph("• Consola HTTP Evaluativa: Panel interactivo diseñado para el docente donde se puede disparar cada uno de los endpoints con un solo clic y verificar los códigos 200, 201, 400 y 404 en tiempo real con medición de latencia en milisegundos.", style='List Bullet')

    # 6. SUITE DE PRUEBAS
    h1 = doc.add_heading("6. Ejecución de la Suite Completa de Pruebas Técnicas (25/25)", level=1)
    h1.runs[0].font.color.rgb = RGBColor(0x1E, 0x3A, 0x8A)
    
    doc.add_paragraph("El proyecto cuenta con una robusta suite automatizada de pruebas dividida en 4 suites especializadas:")
    add_code_box(doc, "# Ejecutar la suite completa consolidada:\nnpm test\n\n# O ejecutar por suites individuales:\nnpm run test:unit         # 6 Pruebas unitarias de servicios y regla N\nnpm run test:integration  # 10 Pruebas de integración HTTP (200, 201, 400, 404)\nnpm run test:security     # 6 Pruebas de seguridad defensiva y casos de borde\nnpm run test:load         # 3 Pruebas de concurrencia, estrés y latencia < 100ms")

    add_styled_table(doc, ["Categoría", "Archivo de Prueba", "Pruebas", "Estado", "Aspectos Validados"], [
        ["🔬 Unitarias", "test/unit.test.js", "6", "100% OK", "Parámetro N=10, 20% de recargo, redondeo de centavos, prioridad por defecto false."],
        ["🌐 Integración", "test/integration.test.js", "10", "100% OK", "GET /api (200), GET /turnos (200), GET /turnos/1 (200), GET inexistente (404), POST 201, POST 400."],
        ["🛡️ Seguridad", "test/security_edge.test.js", "6", "100% OK", "Cuerpo vacío {}, precio 'gratis', precio = 0, fecha no válida, inyección de scripts, arrays en inputs."],
        ["⚡ Carga / Concurrencia", "test/load_stress.test.js", "3", "100% OK", "30 peticiones GET paralelas en <60ms, 15 POSTs concurrentes con unicidad de IDs, latencia < 100ms."]
    ])

    # 7. POSTMAN
    h1 = doc.add_heading("7. Importación y Uso de la Colección de Postman (v2.1)", level=1)
    h1.runs[0].font.color.rgb = RGBColor(0x1E, 0x3A, 0x8A)
    
    doc.add_paragraph("En la carpeta test/ se incluye el archivo oficial prometheiax.postman_collection.json listo para importar:")
    doc.add_paragraph("Paso 7.1: Abre Postman Desktop o Postman Web y haz clic en 'Import'.", style='List Bullet')
    doc.add_paragraph("Paso 7.2: Selecciona el archivo test/prometheiax.postman_collection.json.", style='List Bullet')
    doc.add_paragraph("Paso 7.3: La colección 'PrometheiaX — API REST CIAF' contiene 8 peticiones preconfiguradas con aserciones automáticas pm.test (verificación de códigos 200, 201, 400, 404 y cálculo del 20%).", style='List Bullet')
    doc.add_paragraph("Paso 7.4: Haz clic derecho sobre la colección y selecciona 'Run collection' para ejecutar todas las pruebas y ver el reporte 100% aprobado en verde.", style='List Bullet')

    # 8. DESPLIEGUE CLOUD / PRODUCCIÓN
    h1 = doc.add_heading("8. Guía de Despliegue en Servidores de Producción (Cloud / VPS)", level=1)
    h1.runs[0].font.color.rgb = RGBColor(0x1E, 0x3A, 0x8A)
    
    p = doc.add_paragraph()
    p.add_run("Opción A: Despliegue en Render (Cloud Gratuito)\n").bold = True
    p.add_run("1. Conecta tu repositorio de GitHub en https://render.com.\n"
              "2. Crea un nuevo 'Web Service'.\n"
              "3. En 'Build Command' ingresa: npm install\n"
              "4. En 'Start Command' ingresa: npm start\n"
              "5. En 'Environment Variables' agrega: PORT=3000 y EQUIPO_N=10.\n"
              "6. Haz clic en 'Deploy' y Render generará una URL pública con HTTPS activa.")

    p = doc.add_paragraph()
    p.add_run("Opción B: Despliegue en un VPS con Ubuntu y PM2\n").bold = True
    p.add_run("Para desplegar en un servidor dedicado o máquina virtual en la nube:")
    add_code_box(doc, "# 1. Clonar e instalar\ngit clone https://github.com/xjordan1x/prometheiax-api-ciaf.git /var/www/prometheiax\ncd /var/www/prometheiax\nnpm install --production\n\n# 2. Iniciar como demonio con PM2 (reinicio automático ante fallos)\nsudo npm install -g pm2\npm2 start index.js --name \"prometheiax-api\"\npm2 save\npm2 startup")

    # 9. SOLUCIÓN DE PROBLEMAS
    h1 = doc.add_heading("9. Diagnóstico y Solución de Problemas Frecuentes (Troubleshooting)", level=1)
    h1.runs[0].font.color.rgb = RGBColor(0x1E, 0x3A, 0x8A)
    
    doc.add_paragraph("• Problema: En PowerShell aparece el error 'npm.ps1 no se puede cargar porque la ejecución de scripts está deshabilitada'.\n"
                      "  Causa: Política restrictiva de seguridad ExecutionPolicy en Windows.\n"
                      "  Solución: Ejecuta siempre 'npm.cmd install', 'npm.cmd start' o 'npm.cmd test'.", style='List Bullet')
                      
    doc.add_paragraph("• Problema: El servidor arroja 'Error: listen EADDRINUSE: address already in use :::3000'.\n"
                      "  Causa: Hay otro proceso de Node.js u otra aplicación usando el puerto 3000.\n"
                      "  Solución: En el archivo .env cambia 'PORT=3001' o mata el proceso con 'taskkill /F /IM node.exe' en Windows.", style='List Bullet')

    doc.add_paragraph("• Problema: La cotización calcula 14% en lugar del 20%.\n"
                      "  Causa: Variable EQUIPO_N no configurada o tomando valor residual 7.\n"
                      "  Solución: Asegúrate de que .env tenga 'EQUIPO_N=10' y reinicia el servidor con 'npm start'.", style='List Bullet')

    ruta_doc = os.path.join(BASE_DIR, "PrometheiaX — Manual de Instalación y Despliegue.docx")
    try:
        doc.save(ruta_doc)
        print(f"✔ Manual de Instalación guardado con éxito: {ruta_doc}")
    except PermissionError:
        ruta_alt = os.path.join(BASE_DIR, "PrometheiaX — Manual de Instalación y Despliegue (Actualizado).docx")
        doc.save(ruta_alt)
        print(f"⚠️ Aviso: Word tiene abierto el archivo. Se guardó copia actualizada en: {ruta_alt}")

# ==============================================================================
# 2. GUÍA DE SUSTENTACIÓN EXHAUSTIVA
# ==============================================================================
def generar_guia_sustentacion():
    print("Generando: PrometheiaX — Guía de Sustentación.docx...")
    doc = Document()
    
    for s in doc.sections:
        s.top_margin = Inches(1)
        s.bottom_margin = Inches(1)
        s.left_margin = Inches(1)
        s.right_margin = Inches(1)

    # PORTADA
    p_head = doc.add_paragraph()
    p_head.alignment = WD_ALIGN_PARAGRAPH.CENTER
    r_inst = p_head.add_run("CORPORACIÓN INSTITUTO DE ADMINISTRACIÓN Y FINANZAS — CIAF\n")
    r_inst.bold = True
    r_inst.font.size = Pt(13)
    r_inst.font.color.rgb = RGBColor(0x1E, 0x3A, 0x8A)
    
    r_fac = p_head.add_run("PROGRAMA DE INGENIERÍA DE SOFTWARE\n"
                           "ASIGNATURA: ARQUITECTURA CLIENTE-SERVIDOR (GRUPO 1 MARTES)\n"
                           "DOCENTE: ING. GERMÁN ARGÜELLES\n\n")
    r_fac.font.size = Pt(10.5)
    r_fac.font.color.rgb = RGBColor(0x64, 0x74, 0x8B)

    p_title = doc.add_paragraph()
    p_title.alignment = WD_ALIGN_PARAGRAPH.CENTER
    r_title = p_title.add_run("PROMETHEIAX\n")
    r_title.bold = True
    r_title.font.size = Pt(32)
    r_title.font.color.rgb = RGBColor(0x25, 0x63, 0xEB)
    
    r_sub = p_title.add_run("Guía Maestra de Sustentación y Defensa Técnica (Rúbrica 5.0)\n"
                            "Libreto minuto a minuto, justificación matemática de N=10 y banco de respuestas trampa\n\n")
    r_sub.font.size = Pt(13)
    r_sub.bold = True
    r_sub.font.color.rgb = RGBColor(0x0F, 0x17, 0x2A)

    add_callout(doc, "EQUIPO EXPOSITOR Y PARÁMETROS OFICIALES",
                "• Integrantes: John Edison Jordan Rivas (#10) y Laura Ximena Sánchez Rodríguez (#19)\n"
                "• Regla alfabética de apellidos: 'Jordan Rivas' (#10) precede a 'Sánchez Rodríguez' (#19)\n"
                "• Parámetro oficial resultante: N = 10\n"
                "• Recargo prioritario aplicable: N × 2% = 10 × 2% = 20%\n"
                "• Objetivo de la sustentación: Demostrar dominio absoluto de la arquitectura en 3 capas, protocolos HTTP (200, 201, 400, 404) y regla N para obtener 5.0 / 5.0.",
                bg_color="F0FDF4", border_color="10B981")

    doc.add_page_break()

    # ÍNDICE
    h_idx = doc.add_heading("Estructura de la Defensa Técnica", level=1)
    h_idx.runs[0].font.color.rgb = RGBColor(0x1E, 0x3A, 0x8A)
    
    doc.add_paragraph("1. Justificación Formal del Caso de Negocio Elegido\n"
                      "2. Demostración Matemática Rigurosa del Parámetro N = 10 (Recargo 20%)\n"
                      "3. Defensa de la Arquitectura en 3 Capas y Desacoplamiento de Código\n"
                      "4. Demostración en Vivo de los Códigos de Estado HTTP (200, 201, 400, 404)\n"
                      "5. Libreto Minuto a Minuto de la Exposición (8 Minutos Totales)\n"
                      "6. Banco de 10 Preguntas Trampa del Docente y Respuestas Perfectas\n"
                      "7. Checklist Técnico Previo a Encender la Pantalla")

    # 1. CASO DE NEGOCIO
    h1 = doc.add_heading("1. Justificación Formal del Caso de Negocio Elegido", level=1)
    h1.runs[0].font.color.rgb = RGBColor(0x1E, 0x3A, 0x8A)
    
    doc.add_paragraph(
        "¿Qué negocio seleccionó el equipo?\n"
        "Elegimos 'PrometheiaX', una plataforma universitaria de intermediación para solicitudes de asesorías académicas, "
        "tutorías de código especializadas y resolución colaborativa de dudas en un foro académico."
    )
    doc.add_paragraph(
        "¿Por qué este negocio y cuál es su actividad principal?\n"
        "En la vida universitaria real, los estudiantes de ingeniería de software a menudo requieren refuerzos urgentes "
        "antes de entregas de proyectos o sustentaciones. PrometheiaX permite agendar asesorías individuales o grupales, "
        "cotizar tarifas transparentes según el tipo de servicio y solicitar atención prioritaria cuando la asesoría requiere "
        "atención urgente en menos de 24 horas."
    )
    doc.add_paragraph(
        "¿Qué datos específicos maneja cada solicitud?\n"
        "1. estudiante (string obligatorio): Nombre y apellido del alumno solicitante.\n"
        "2. tipoServicio (string obligatorio): Modalidad (ej: 'Tutoría de código', 'Asesoría académica individual').\n"
        "3. tema (string obligatorio): Materia o tópico específico (ej: 'Arquitectura por capas en Express').\n"
        "4. fechaHora (ISO 8601 string): Fecha y hora agendada para el encuentro.\n"
        "5. precioBase (number obligatorio estricto > 0): Valor fijado de la tutoría antes de recargos.\n"
        "6. prioritario (boolean opcional): Si es true, activa la regla N del 20% de recargo; si es false, totalPagar = precioBase."
    )

    # 2. MATEMÁTICA REGLA N
    h1 = doc.add_heading("2. Demostración Matemática Rigurosa del Parámetro N = 10 (Recargo 20%)", level=1)
    h1.runs[0].font.color.rgb = RGBColor(0x1E, 0x3A, 0x8A)
    
    doc.add_paragraph(
        "Según la página 2 y 3 de la guía oficial del taller evaluativo CIAF, el parámetro N se obtiene ordenando alfabéticamente "
        "por apellido a los integrantes del equipo según el listado oficial de asistencia:"
    )
    
    add_styled_table(doc, ["Orden Alfabético", "Apellidos y Nombres", "Puesto en Lista Oficial", "Grupo Asignatura"], [
        ["1° (Primer integrante)", "Jordan Rivas, John Edison", "#10 (Letra J)", "Arquitectura de Software - Grupo 1 Martes"],
        ["2° (Segundo integrante)", "Sánchez Rodríguez, Laura Ximena", "#19 (Letra S)", "Arquitectura de Software - Grupo 1 Martes"]
    ])
    
    doc.add_paragraph(
        "Dado que la letra 'J' de Jordan precede a la 'S' de Sánchez en el alfabeto castellano, el primer integrante es John Edison Jordan Rivas (#10). "
        "Por ende, de manera unívoca y rigurosa:\n\n"
        "• Parámetro N = 10\n"
        "• Fórmula oficial: porcentajeRecargo = N × 2% = 10 × 2% = 20%\n"
        "• Fórmula en Capa de Servicios:\n"
        "   - Si prioritario === true: totalPagar = precioBase + (precioBase × 20 / 100)\n"
        "   - Si prioritario === false: totalPagar = precioBase"
    )

    add_styled_table(doc, ["Precio Base (COP)", "¿Es Prioritario?", "Fórmula de Cálculo", "Valor Recargo (20%)", "Total a Pagar"], [
        ["$100.000 COP", "Sí (true)", "$100.000 + ($100.000 × 20 / 100)", "$20.000 COP", "$120.000 COP"],
        ["$200.000 COP", "Sí (true)", "$200.000 + ($200.000 × 20 / 100)", "$40.000 COP", "$240.000 COP"],
        ["$150.000 COP", "No (false)", "$150.000 (Sin recargo)", "$0 COP", "$150.000 COP"],
        ["$80.000 COP", "No especificado", "$80.000 (Por defecto false)", "$0 COP", "$80.000 COP"]
    ])

    # 3. JUSTIFICACIÓN ARQUITECTURA
    h1 = doc.add_heading("3. Defensa de la Arquitectura en 3 Capas y Desacoplamiento de Código", level=1)
    h1.runs[0].font.color.rgb = RGBColor(0x1E, 0x3A, 0x8A)
    
    doc.add_paragraph("Si el docente pregunta: ¿Por qué estructuraron el proyecto así y qué hace cada capa?, esta es la justificación técnica:")
    
    add_callout(doc, "PRINCIPIO DE RESPONSABILIDAD ÚNICA (SOLID - SRP)",
                "• index.js: Solo inicializa el servidor Express y middlewares globales (CORS, express.json()). No sabe nada de turnos ni de asesorías.\n"
                "• routes/: Mapea las URLs REST a los controladores. No contiene funciones anónimas ni lógica.\n"
                "• controllers/: Habla el lenguaje del protocolo HTTP. Recibe req, extrae parámetros, valida tipos de datos y emite res.status(). No sabe cómo se calcula el recargo.\n"
                "• services/: Habla el lenguaje del negocio. Aplica la regla N=10, calcula totales y persiste en data/turnos.json. No depende de Express ni de req/res.\n"
                "• data/: Persistencia local duradera en archivos JSON.",
                bg_color="F8FAFC", border_color="0284C7")

    # 4. PROTOCOLOS HTTP
    h1 = doc.add_heading("4. Demostración en Vivo de los Códigos de Estado HTTP (200, 201, 400, 404)", level=1)
    h1.runs[0].font.color.rgb = RGBColor(0x1E, 0x3A, 0x8A)
    
    doc.add_paragraph("Durante la sustentación, deben demostrar los 4 códigos HTTP operando en vivo:")
    
    add_styled_table(doc, ["Código HTTP", "Endpoint y Escenario", "Entrada Enviada", "Comportamiento del Servidor", "Resultado Esperado"], [
        ["200 OK", "GET /api/turnos", "Sin cuerpo (Lectura)", "Lee la lista en data/turnos.json", "Array JSON con todas las asesorías y HTTP 200."],
        ["200 OK", "GET /api/turnos/1", "ID existente en la URL", "Busca el turno con id == 1", "Objeto JSON de la solicitud #1 y HTTP 200."],
        ["201 Created", "POST /api/turnos", "JSON con estudiante, tema, precioBase > 0", "Ejecuta services.crearTurno() con recargo 20%", "Objeto creado con nuevo ID único y HTTP 201."],
        ["400 Bad Request", "POST /api/turnos", "precioBase = 0 o negativo, o campo vacío", "Validación en controlador detecta error", "JSON descriptivo con detalles y HTTP 400."],
        ["404 Not Found", "GET /api/turnos/999999", "ID inexistente", "services.obtenerPorId() retorna null", "JSON de error ('Recurso no encontrado') y HTTP 404."],
        ["404 Not Found", "GET /api/ruta-falsa", "Ruta no definida", "Middleware 404 de index.js captura", "JSON indicando que la ruta no existe y HTTP 404."]
    ])

    # 5. LIBRETO MINUTO A MINUTO
    h1 = doc.add_heading("5. Libreto Minuto a Minuto de la Exposición (8 Minutos Totales)", level=1)
    h1.runs[0].font.color.rgb = RGBColor(0x1E, 0x3A, 0x8A)
    
    doc.add_paragraph("Este es el guion exacto sincronizado para Laura Ximena Sánchez y John Edison Jordan:")

    p = doc.add_paragraph()
    p.add_run("🎙️ MINUTO 0 A 2 — Apertura y Contexto del Negocio (Laura Ximena Sánchez):\n").bold = True
    p.add_run(
        "\"Buenos días profesor y compañeros. Nuestro proyecto se llama PrometheiaX, una API REST construida sobre Node.js y Express "
        "para la gestión de asesorías académicas y tutorías de código universitario.\n"
        "En nuestra facultad, los estudiantes necesitan coordinar tutorías especializadas antes de entregas críticas. "
        "PrometheiaX permite agendar solicitudes, registrar temas, cotizar con la regla de negocio del equipo y participar en un foro académico colaborativo.\n"
        "Cumpliendo con la rúbrica oficial, el proyecto está estrictamente desacoplado en 3 capas: routes/, controllers/ y services/.\""
    )

    p = doc.add_paragraph()
    p.add_run("🎙️ MINUTO 2 A 4 — Justificación Matemática de N=10 y Arquitectura (John Edison Jordan):\n").bold = True
    p.add_run(
        "\"Para el cálculo del parámetro N, tomamos el listado oficial de asistencia de la asignatura (Grupo 1 Martes). "
        "Al ordenar los integrantes alfabéticamente por apellido:\n"
        "1. Jordan Rivas, John Edison ocupa el puesto #10.\n"
        "2. Sánchez Rodríguez, Laura Ximena ocupa el puesto #19.\n"
        "Al ser Jordan el primero en orden alfabético, nuestro N oficial es N = 10. "
        "Aplicando la fórmula de la guía: N × 2% = 10 × 2% = 20% de recargo prioritario.\n"
        "En el código, este cálculo está encapsulado en services/turnos.service.js, protegiendo la regla de negocio para que "
        "los controladores se dediquen única y exclusivamente a validar datos y responder protocolos HTTP.\""
    )

    p = doc.add_paragraph()
    p.add_run("🎙️ MINUTO 4 A 6 — Demostración en Vivo en la Web y Consola HTTP (Laura Ximena Sánchez):\n").bold = True
    p.add_run(
        "\"Pasemos a la demostración en vivo. En http://localhost:3000 tenemos la aplicación corriendo.\n"
        "1. En 'Nueva Asesoría', ingresamos un estudiante con precio base de $150.000. Al activar 'Atención prioritaria', "
        "la cotización calcula en vivo el 20% ($30.000) dando un total de $180.000 COP. Al pulsar Registrar, el backend responde con HTTP 201 Created.\n"
        "2. En 'Mis Solicitudes', podemos usar el buscador global en tiempo real o consultar por ID: el ID 1 responde HTTP 200 OK, "
        "mientras que el ID 999999 responde HTTP 404 Not Found.\n"
        "3. En la tarjeta de asesoría recomendada, podemos hacer clic en '✏️ Modificar' para ajustar la fecha de la cita dinámicamente.\""
    )

    p = doc.add_paragraph()
    p.add_run("🎙️ MINUTO 6 A 8 — Demostración de Códigos de Error y Suite de 25 Tests (John Edison Jordan):\n").bold = True
    p.add_run(
        "\"Para comprobar la robustez del servidor ante peticiones inválidas, en la Consola HTTP evaluativa enviamos una solicitud con precio base = 0 o negativo: "
        "el servidor responde inmediatamente con HTTP 400 Bad Request explicando en formato JSON el motivo del rechazo, sin colapsar jamás con un error 500.\n"
        "Finalmente, abrimos la terminal y ejecutamos 'npm test'. Como pueden observar en pantalla, las 25 pruebas técnicas "
        "(unitarias, integración, seguridad defensiva y carga/concurrencia) pasan con un 100% de éxito en menos de 200 milisegundos. "
        "Adicionalmente, contamos con la colección oficial de Postman v2.1 lista y verificada. Quedamos atentos a cualquier pregunta del docente.\""
    )

    # 6. BANCO DE PREGUNTAS TRAMPA
    h1 = doc.add_heading("6. Banco de 10 Preguntas Trampa del Docente y Respuestas Perfectas", level=1)
    h1.runs[0].font.color.rgb = RGBColor(0x1E, 0x3A, 0x8A)

    preguntas = [
        ("1. ¿Por qué el cálculo del recargo está en services y no en el controller?",
         "Porque el controlador solo debe gestionar el ciclo de vida de la petición HTTP (recibir req y responder res). Si mañana cambiamos Express por Fastify, NestJS o una aplicación CLI, la regla de negocio en services/ sigue intacta sin tocar una sola línea de lógica."),
        
        ("2. ¿Qué ocurre en el servidor si un cliente envía un precioBase = -50000?",
         "En controllers/turnos.controller.js validamos defensivamente: if (precioNumerico <= 0). Si es menor o igual a cero, frena la petición y responde HTTP 400 Bad Request con un mensaje claro en JSON, impidiendo que datos inválidos lleguen a la capa de servicios."),

        ("3. ¿Por qué el parámetro N es 10 y no 19?",
         "Porque la guía del taller exige explícitamente ordenar los integrantes alfabéticamente por apellido según el listado oficial de la asignatura. 'Jordan Rivas, John Edison' (#10) precede a 'Sánchez Rodríguez, Laura Ximena' (#19), por lo que el primer integrante determina N = 10."),

        ("4. ¿Dónde se guardan los turnos y qué pasa si el servidor se reinicia?",
         "Se almacenan en un archivo local data/turnos.json. La capa de servicios lee y escribe sincrónicamente este archivo, garantizando persistencia duradera incluso si la máquina se apaga o el proceso de Node.js se reinicia."),

        ("5. ¿Cómo garantizan que el servidor jamás colapse con un error 500 no controlado?",
         "Todas las rutas y controladores están envueltos en bloques try/catch defensivos, además de contar con un middleware global de captura de errores en index.js. Cualquier fallo imprevisto genera una respuesta JSON controlada sin apagar el proceso de Node."),

        ("6. ¿Por qué la fecha se valida con el formato ISO 8601?",
         "Porque ISO 8601 (YYYY-MM-DDTHH:mm) es el estándar internacional de interoperabilidad en APIs REST. Evita ambigüedades entre formatos regionales (día/mes vs mes/día) y previene errores de parseo en motores JavaScript."),

        ("7. ¿Cómo probaron la concurrencia y estrés de la API?",
         "Diseñamos una suite de carga en test/load_stress.test.js que dispara 30 consultas GET paralelas y 15 registros POST simultáneos. Verificamos la unicidad de IDs y una latencia promedio de apenas 2 a 4 milisegundos."),

        ("8. ¿Por qué en index.js solo hay middlewares y no lógica de endpoints?",
         "Porque según el criterio 1 de la rúbrica oficial (30%), index.js solo debe inicializar Express, configurar middlewares como express.json() y CORS, y montar las rutas delegadas. La concentración de código en el archivo principal penaliza la nota."),

        ("9. ¿Qué ventaja ofrece el buscador en tiempo real sobre una consulta SQL tradicional?",
         "Permite filtrado reactivo del lado del cliente sin sobrecargar el backend con peticiones por cada tecla pulsada, combinando búsqueda sobre solicitudes y temas del foro con resaltado visual instantáneo."),

        ("10. ¿Cómo está preparado el proyecto para pasar a una base de datos SQL como PostgreSQL?",
         "Gracias a la arquitectura por capas, bastaría con reemplazar los métodos readFile/writeFile de services/turnos.service.js por llamadas a un ORM como Prisma o Sequelize. Ni las rutas ni los controladores tendrían que modificarse.")
    ]

    for p_tit, p_resp in preguntas:
        add_callout(doc, p_tit, f"\"{p_resp}\"", bg_color="F8FAFC", border_color="0284C7")

    # 7. CHECKLIST PREVIO
    h1 = doc.add_heading("7. Checklist Técnico Previo a Encender la Pantalla", level=1)
    h1.runs[0].font.color.rgb = RGBColor(0x1E, 0x3A, 0x8A)
    
    doc.add_paragraph("Antes de que el docente llame al equipo a sustentar, verificar:")
    doc.add_paragraph("✔ 1. Servidor Node.js corriendo en la terminal: 'npm start' con banner visible en puerto 3000.", style='List Bullet')
    doc.add_paragraph("✔ 2. Navegador abierto en http://localhost:3000 con la pestaña de Resumen y Consola listas.", style='List Bullet')
    doc.add_paragraph("✔ 3. Postman Desktop abierto con la colección 'PrometheiaX — API REST CIAF' importada.", style='List Bullet')
    doc.add_paragraph("✔ 4. Terminal secundaria lista para ejecutar 'npm test' y mostrar las 25 pruebas en verde.", style='List Bullet')
    doc.add_paragraph("✔ 5. VS Code abierto en la raíz del proyecto para proyectar el código ordenado de index.js, routes/, controllers/ y services/.", style='List Bullet')

    ruta_doc = os.path.join(BASE_DIR, "PrometheiaX — Guía de Sustentación.docx")
    try:
        doc.save(ruta_doc)
        print(f"✔ Guía de Sustentación guardada con éxito: {ruta_doc}")
    except PermissionError:
        ruta_alt = os.path.join(BASE_DIR, "PrometheiaX — Guía de Sustentación (Actualizado).docx")
        doc.save(ruta_alt)
        print(f"⚠️ Aviso: Word tiene abierto el archivo. Se guardó copia actualizada en: {ruta_alt}")

if __name__ == '__main__':
    generar_manual_instalacion()
    generar_guia_sustentacion()
    print("\n¡Ambos documentos Word (.docx) fueron regenerados con máxima calidad y detalle!")
