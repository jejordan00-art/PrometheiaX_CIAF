# scripts/generate_docs.py
# Generador automatizado de documentos Word profesionales y humanizados para PrometheiaX (CIAF)
# Integrantes: John Edison Jordan (#10) y Laura Ximena Sánchez (#19)

import os
from docx import Document
from docx.shared import Inches, Pt, RGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.enum.table import WD_TABLE_ALIGNMENT, WD_ALIGN_VERTICAL
from docx.oxml import OxmlElement, parse_xml
from docx.oxml.ns import nsdecls, qn

def set_cell_background(cell, fill_hex):
    """Establece color de fondo de una celda de tabla."""
    tcPr = cell._element.get_or_add_tcPr()
    shd = parse_xml(f'<w:shd {nsdecls("w")} w:fill="{fill_hex}"/>')
    tcPr.append(shd)

def set_cell_margins(cell, top=140, bottom=140, left=180, right=180):
    """Establece márgenes internos de una celda."""
    tcPr = cell._element.get_or_add_tcPr()
    tcMar = parse_xml(f'<w:tcMar {nsdecls("w")}><w:top w:w="{top}" w:type="dxa"/><w:bottom w:w="{bottom}" w:type="dxa"/><w:left w:w="{left}" w:type="dxa"/><w:right w:w="{right}" w:type="dxa"/></w:tcMar>')
    tcPr.append(tcMar)

def add_callout(doc, title, text, bg_color="EEF2FF", border_color="4F46E5"):
    """Agrega una caja de llamado o alerta visual elegante y pedagógica."""
    tbl = doc.add_table(rows=1, cols=1)
    tbl.alignment = WD_TABLE_ALIGNMENT.CENTER
    cell = tbl.cell(0, 0)
    set_cell_background(cell, bg_color)
    set_cell_margins(cell, top=150, bottom=150, left=200, right=200)
    
    tcPr = cell._element.get_or_add_tcPr()
    borders = parse_xml(f'<w:tcBorders {nsdecls("w")}><w:left w:val="single" w:sz="36" w:space="0" w:color="{border_color}"/><w:top w:val="none"/><w:right w:val="none"/><w:bottom w:val="none"/></w:tcBorders>')
    tcPr.append(borders)
    
    p = cell.paragraphs[0]
    p.paragraph_format.space_before = Pt(3)
    p.paragraph_format.space_after = Pt(3)
    run_title = p.add_run(f"📌 {title}\n")
    run_title.bold = True
    run_title.font.name = "Calibri"
    run_title.font.size = Pt(11)
    run_title.font.color.rgb = RGBColor(0x1E, 0x1B, 0x4B)
    
    run_text = p.add_run(text)
    run_text.font.name = "Calibri"
    run_text.font.size = Pt(10)
    run_text.font.color.rgb = RGBColor(0x37, 0x41, 0x51)
    doc.add_paragraph()

def add_code_box(doc, code_text):
    """Agrega una caja de código formateado con fuente Consolas e indentación limpia."""
    tbl = doc.add_table(rows=1, cols=1)
    tbl.alignment = WD_TABLE_ALIGNMENT.CENTER
    cell = tbl.cell(0, 0)
    set_cell_background(cell, "F8FAFC")
    set_cell_margins(cell, top=120, bottom=120, left=160, right=160)
    
    tcPr = cell._element.get_or_add_tcPr()
    borders = parse_xml(f'<w:tcBorders {nsdecls("w")}><w:left w:val="single" w:sz="12" w:space="0" w:color="CBD5E1"/><w:top w:val="single" w:sz="12" w:space="0" w:color="CBD5E1"/><w:right w:val="single" w:sz="12" w:space="0" w:color="CBD5E1"/><w:bottom w:val="single" w:sz="12" w:space="0" w:color="CBD5E1"/></w:tcBorders>')
    tcPr.append(borders)
    
    p = cell.paragraphs[0]
    p.paragraph_format.space_before = Pt(2)
    p.paragraph_format.space_after = Pt(2)
    run = p.add_run(code_text)
    run.font.name = "Consolas"
    run.font.size = Pt(9)
    run.font.color.rgb = RGBColor(0x0F, 0x17, 0x2A)
    doc.add_paragraph()

# ==============================================================================
# DOCUMENTO A: GUÍA DE SUSTENTACIÓN
# ==============================================================================
def generar_guia_sustentacion():
    doc = Document()
    
    for section in doc.sections:
        section.top_margin = Inches(1)
        section.bottom_margin = Inches(1)
        section.left_margin = Inches(1)
        section.right_margin = Inches(1)

    # PORTADA
    p_header = doc.add_paragraph()
    p_header.alignment = WD_ALIGN_PARAGRAPH.CENTER
    r_inst = p_header.add_run("CORPORACIÓN INSTITUTO DE ADMINISTRACIÓN Y FINANZAS — CIAF\n")
    r_inst.bold = True
    r_inst.font.size = Pt(13)
    r_inst.font.color.rgb = RGBColor(0x1E, 0x29, 0x3B)
    
    r_prog = p_header.add_run("PROGRAMA DE INGENIERÍA DE SOFTWARE\nASIGNATURA: ARQUITECTURA CLIENTE-SERVIDOR\nGRUPO 1 MARTES\n\n")
    r_prog.font.size = Pt(11)
    r_prog.font.color.rgb = RGBColor(0x64, 0x74, 0x8B)

    p_title = doc.add_paragraph()
    p_title.alignment = WD_ALIGN_PARAGRAPH.CENTER
    r_title = p_title.add_run("PROMETHEIAX\n")
    r_title.bold = True
    r_title.font.size = Pt(28)
    r_title.font.color.rgb = RGBColor(0x4F, 0x46, 0xE5)
    
    r_sub = p_title.add_run("Guía Maestra de Sustentación Técnica Humanizada\nAPI REST por Capas y Reglas de Negocio Parametrizadas (N = 10 · 20%)\n\n")
    r_sub.font.size = Pt(14)
    r_sub.bold = True
    r_sub.font.color.rgb = RGBColor(0x0F, 0x17, 0x2A)

    add_callout(doc, "INTEGRANTES OFICIALES DEL EQUIPO (GRUPO 1 MARTES)",
                "• 1. Jordan Rivas, John Edison — Lista Oficial CIAF: Puesto #10 (N = 10)\n"
                "• 2. Sánchez Rodríguez, Laura Ximena — Lista Oficial CIAF: Puesto #19\n\n"
                "Regla de Orden Alfabético por Apellido: La letra 'J' (Jordan) precede a la letra 'S' (Sánchez). "
                "Por lo tanto, el primer integrante es John Edison Jordan Rivas y el parámetro oficial es N = 10. "
                "Porcentaje de recargo resultante: N × 2% = 10 × 2% = 20%.\n\n"
                "Este documento está escrito con un tono pedagógico y humanizado para que tanto Laura como John dominen cualquier parte del código y saquen 5.0 en la sustentación.",
                bg_color="EEF2FF", border_color="4F46E5")

    # SECCIÓN 1: CONTEXTO DEL NEGOCIO
    h1 = doc.add_heading("1. Definición del Caso de Negocio: PrometheiaX", level=1)
    h1.runs[0].font.color.rgb = RGBColor(0x1E, 0x29, 0x3B)
    
    p = doc.add_paragraph(
        "PrometheiaX es una plataforma universitaria inteligente que une dos mundos: un foro colaborativo entre estudiantes de ingeniería de software y un módulo formal para solicitar turnos de asesorías y tutorías académicas personalizadas con monitores o docentes.\n\n"
        "Para cumplir estrictamente con el PDF de CIAF, el caso de negocio modelado en la API REST es la gestión de turnos de asesoría académica, donde cada solicitud requiere:"
    )
    
    doc.add_paragraph("• estudiante: Nombre del estudiante solicitante (ej: 'Laura Ximena Sánchez' o 'John Edison Jordan').", style='List Bullet')
    doc.add_paragraph("• tipoServicio: Modalidad académica ('Tutoría de código', 'Asesoría académica', 'Revisión de proyecto').", style='List Bullet')
    doc.add_paragraph("• tema: Asignatura o tópico ('Arquitectura de software por capas', 'Validaciones HTTP').", style='List Bullet')
    doc.add_paragraph("• fechaHora: Momento programado en estándar ISO 8601 (ej: '2026-12-05T10:00:00').", style='List Bullet')
    doc.add_paragraph("• precioBase: Valor base de la sesión (simulado; debe ser estrictamente mayor que cero).", style='List Bullet')
    doc.add_paragraph("• prioritario: Booleano (true/false) que define si requiere atención de urgencia con recargo.", style='List Bullet')

    # SECCIÓN 2: REGLA DE NEGOCIO N = 10
    h1 = doc.add_heading("2. Parámetro N del Equipo y Cálculo Matemático (20%)", level=1)
    h1.runs[0].font.color.rgb = RGBColor(0x1E, 0x29, 0x3B)
    
    p = doc.add_paragraph(
        "La rúbrica de CIAF exige que cada equipo obtenga su parámetro N a partir de la lista oficial de asistencia: "
        "ordenando alfabéticamente a los integrantes por apellido, el número del primer compañero es N."
    )
    
    add_callout(doc, "FÓRMULA MATEMÁTICA OFICIAL (services/turnos.service.js)",
                "N = 10 (por John Edison Jordan Rivas)\n"
                "porcentajeRecargo = N × 2% = 10 × 2% = 20%\n\n"
                "• Si prioritario = true:\n"
                "  totalPagar = precioBase + (precioBase × 20 / 100)\n\n"
                "• Si prioritario = false o no se especifica:\n"
                "  totalPagar = precioBase",
                bg_color="FEF3C7", border_color="D97706")

    p = doc.add_paragraph(
        "Ejemplos reales con N = 10 (Recargo del 20%):\n"
        "• Asesoría de $200.000 COP con prioritario = true:\n"
        "  Recargo = 200.000 × 20% = $40.000 COP\n"
        "  Total a Pagar = $200.000 + $40.000 = $240.000 COP.\n"
        "• Asesoría de $150.000 COP con prioritario = false:\n"
        "  Recargo = $0 COP\n"
        "  Total a Pagar = $150.000 COP."
    )

    # SECCIÓN 3: EXPLICACIÓN HUMANIZADA DE LAS CAPAS
    h1 = doc.add_heading("3. Explicación Humanizada de las Tres Capas", level=1)
    h1.runs[0].font.color.rgb = RGBColor(0x1E, 0x29, 0x3B)
    
    p = doc.add_paragraph(
        "Para que la sustentación sea natural y fluida, imaginen la arquitectura por capas como un restaurante de alta cocina:"
    )

    doc.add_paragraph("1. index.js es el Anfitrión del Restaurante: Abre las puertas, enciende las luces (Express), pone las mesas y el menú (middlewares y rutas estáticas) y recibe a los clientes.", style='List Bullet')
    doc.add_paragraph("2. routes/turnos.routes.js es la Carta o Menú de Servicios: Indica qué platos o servicios existen (/api/turnos) y quién los atiende, sin preparar la comida.", style='List Bullet')
    doc.add_paragraph("3. controllers/turnos.controller.js es el Mesero: Recibe el pedido del cliente (req), revisa que la orden no esté vacía y que los datos sean coherentes (validación de campos y precio > 0). Si la orden está mal, dice cortésmente '400 Bad Request'. Si todo está bien, le entrega la comanda al chef y le devuelve la comida servida al cliente (200 OK o 201 Created).", style='List Bullet')
    doc.add_paragraph("4. services/turnos.service.js es el Chef de Cocina: Es el que sabe cocinar, aplicar la receta matemática (recargo del 20%), calcular los totales y guardar los ingredientes en la despensa (data/turnos.json). Nunca habla con los clientes; solo ejecuta la lógica.", style='List Bullet')
    doc.add_paragraph("5. data/turnos.json es la Despensa Local: El archivo plano en disco donde se preservan los registros.", style='List Bullet')

    # SECCIÓN 4: CÓDIGOS HTTP
    h1 = doc.add_heading("4. Códigos de Estado HTTP y Cuándo Explicar Cada Uno", level=1)
    h1.runs[0].font.color.rgb = RGBColor(0x1E, 0x29, 0x3B)

    doc.add_paragraph("• 200 OK (Petición Exitosa): Cuando el mesero entrega la lista completa de solicitudes o encuentra un turno existente por su ID.", style='List Bullet')
    doc.add_paragraph("• 201 Created (Recurso Creado): Cuando se registra con éxito una nueva asesoría académica y el servidor le asigna un nuevo ID con el total calculado.", style='List Bullet')
    doc.add_paragraph("• 400 Bad Request (Error del Cliente): Cuando el cliente envía datos incompletos (falta el tema o el estudiante) o envía un precioBase <= 0 o no numérico.", style='List Bullet')
    doc.add_paragraph("• 404 Not Found (Recurso Inexistente): Cuando se busca un ID de turno que no existe en el archivo (ej: ID 999999).", style='List Bullet')

    # SECCIÓN 5: GUION REPARTIDO PARA LAURA Y JOHN
    h1 = doc.add_heading("5. Guion de Exposición para Laura Sánchez y John Edison Jordan", level=1)
    h1.runs[0].font.color.rgb = RGBColor(0x1E, 0x29, 0x3B)

    p_r1 = doc.add_paragraph()
    p_r1.add_run("🎙️ PARTE 1 (Minuto 0 a 3) — Presentación y Negocio (Por Laura Sánchez):\n").bold = True
    p_r1.add_run(
        "\"Buenas noches profesor y compañeros. Nuestro proyecto es PrometheiaX, un foro académico donde los estudiantes comparten conocimientos de ingeniería. "
        "Para el taller evaluativo, el caso de negocio seleccionado es la solicitud de asesorías y tutorías personalizadas.\n"
        "Para definir el parámetro N, ordenamos alfabéticamente a los dos integrantes por apellido: Jordan Rivas, John Edison (puesto #10) y Sánchez Rodríguez, Laura Ximena (puesto #19). "
        "Como la 'J' antecede a la 'S', nuestro N oficial es 10, y el porcentaje de recargo es N × 2% = 20%.\n"
        "Ahora mi compañero John les mostrará la aplicación en vivo y los códigos HTTP.\""
    )

    p_r2 = doc.add_paragraph()
    p_r2.add_run("\n🎙️ PARTE 2 (Minuto 3 a 6) — Demostración en Vivo y Protocolos HTTP (Por John Edison Jordan):\n").bold = True
    p_r2.add_run(
        "\"Gracias Laura. Aquí en el navegador en http://localhost:3000 tenemos la aplicación corriendo. "
        "En la sección 'Nueva Asesoría', si ingresamos un precio base de $200.000 con atención prioritaria, la tarjeta de cotización calcula en vivo el 20% ($40.000) dando un total de $240.000 COP. "
        "Al dar clic en registrar, Express responde con HTTP 201 Created.\n"
        "Si pasamos a 'Mis Solicitudes', consultamos el ID 1 y responde HTTP 200 OK; pero si consultamos el ID 999999, responde HTTP 404 Not Found.\n"
        "Además, en la 'Consola HTTP' si enviamos un precio menor o igual a cero o dejamos campos vacíos, el servidor responde HTTP 400 Bad Request sin colapsar.\""
    )

    p_r3 = doc.add_paragraph()
    p_r3.add_run("\n🎙️ PARTE 3 (Minuto 6 a 8) — Código por Capas y Pruebas Automatizadas (Compartido):\n").bold = True
    p_r3.add_run(
        "Laura abre VS Code y muestra index.js, routes/ y controllers/ explicando cómo valida los datos y asigna los estados HTTP. "
        "John muestra services/ demostrando que allí reside el cálculo matemático del recargo y la lectura/escritura en data/turnos.json. "
        "Finalmente, ejecutan en la terminal 'npm test' para mostrar ante el profesor las 9 pruebas pasando al 100%.\""
    )

    # SECCIÓN 6: PREGUNTAS CLAVE
    h1 = doc.add_heading("6. Preguntas Probables del Profesor y Respuestas Directas", level=1)
    h1.runs[0].font.color.rgb = RGBColor(0x1E, 0x29, 0x3B)

    add_callout(doc, "¿Por qué el cálculo no está en el controlador?",
                "\"Porque el controlador solo debe encargarse de la comunicación web (recibir req, validar datos de entrada y responder res). "
                "Toda la regla de negocio y las fórmulas matemáticas pertenecen a la capa de servicios (services/). Así, si cambiamos de Express a Fastify o NestJS, la lógica de negocio queda completamente intacta.\"",
                bg_color="F8FAFC", border_color="0284C7")

    add_callout(doc, "¿Qué pasa si un usuario envía precioBase = -50000?",
                "\"En controllers/turnos.controller.js validamos defensivamente: if (precioNumerico <= 0). "
                "Si es menor o igual a cero, el controlador frena la petición y retorna inmediatamente HTTP 400 Bad Request con un mensaje descriptivo en JSON, garantizando que el servidor jamás se detenga con un error 500.\"",
                bg_color="F8FAFC", border_color="0284C7")

    ruta_doc = os.path.join(r"d:\proyectos\universidad", "PrometheiaX — Guía de Sustentación.docx")
    doc.save(ruta_doc)
    print(f"Documento guardado: {ruta_doc}")

# ==============================================================================
# DOCUMENTO B: MANUAL DE INSTALACIÓN Y DESPLIEGUE
# ==============================================================================
def generar_manual_instalacion():
    doc = Document()
    
    for section in doc.sections:
        section.top_margin = Inches(1)
        section.bottom_margin = Inches(1)
        section.left_margin = Inches(1)
        section.right_margin = Inches(1)

    # PORTADA
    p_header = doc.add_paragraph()
    p_header.alignment = WD_ALIGN_PARAGRAPH.CENTER
    r_inst = p_header.add_run("CORPORACIÓN INSTITUTO DE ADMINISTRACIÓN Y FINANZAS — CIAF\n")
    r_inst.bold = True
    r_inst.font.size = Pt(13)
    r_inst.font.color.rgb = RGBColor(0x1E, 0x29, 0x3B)
    
    r_prog = p_header.add_run("FACULTAD DE INGENIERÍA — INGENIERÍA DE SOFTWARE\nASIGNATURA: ARQUITECTURA CLIENTE-SERVIDOR\n\n")
    r_prog.font.size = Pt(11)
    r_prog.font.color.rgb = RGBColor(0x64, 0x74, 0x8B)

    p_title = doc.add_paragraph()
    p_title.alignment = WD_ALIGN_PARAGRAPH.CENTER
    r_title = p_title.add_run("PROMETHEIAX\n")
    r_title.bold = True
    r_title.font.size = Pt(28)
    r_title.font.color.rgb = RGBColor(0x02, 0x84, 0xC7)
    
    r_sub = p_title.add_run("Manual Técnico de Instalación, Configuración y Despliegue\nPaso a paso desde cero en cualquier computador\n\n")
    r_sub.font.size = Pt(14)
    r_sub.bold = True
    r_sub.font.color.rgb = RGBColor(0x0F, 0x17, 0x2A)

    add_callout(doc, "DATOS OFICIALES DEL PROYECTO",
                "• Integrantes: John Edison Jordan Rivas (#10) y Laura Ximena Sánchez Rodríguez (#19)\n"
                "• Parámetro N oficial: N = 10 (Recargo aplicable: 20%)\n"
                "• Stack técnico: Node.js, Express, JavaScript moderno, CSS Grid, JSON local.\n"
                "• Repositorio: Código limpio, validado, probado y listo para GitHub.",
                bg_color="F0F9FF", border_color="0284C7")

    # SECCIÓN 1: REQUISITOS
    h1 = doc.add_heading("1. Requisitos Previos del Sistema", level=1)
    h1.runs[0].font.color.rgb = RGBColor(0x1E, 0x29, 0x3B)
    
    doc.add_paragraph("• Node.js: Versión 18 o superior (descargar desde https://nodejs.org).", style='List Bullet')
    doc.add_paragraph("• Gestor npm: Incluido automáticamente con Node.js.", style='List Bullet')
    doc.add_paragraph("• Git: Para clonar el repositorio.", style='List Bullet')
    doc.add_paragraph("• Navegador Web: Google Chrome, Microsoft Edge o Mozilla Firefox.", style='List Bullet')

    # SECCIÓN 2: DESCARGA E INSTALACIÓN
    h1 = doc.add_heading("2. Descarga e Instalación Paso a Paso", level=1)
    h1.runs[0].font.color.rgb = RGBColor(0x1E, 0x29, 0x3B)

    doc.add_paragraph("Paso 2.1: Clonar el repositorio o descomprimir la carpeta del proyecto:")
    add_code_box(doc, "git clone https://github.com/TU_USUARIO/prometheiax-api-ciaf.git\ncd prometheiax-api-ciaf")

    doc.add_paragraph("Paso 2.2: Instalar dependencias del proyecto:")
    add_code_box(doc, "npm install\n\n# En Windows PowerShell si hay bloqueo de scripts, usar:\nnpm.cmd install")

    # SECCIÓN 3: CONFIGURACIÓN DE N=10
    h1 = doc.add_heading("3. Configuración del Archivo .env (N = 10)", level=1)
    h1.runs[0].font.color.rgb = RGBColor(0x1E, 0x29, 0x3B)

    p = doc.add_paragraph(
        "Copia el archivo .env.example en un archivo llamado .env en la raíz del proyecto. "
        "Asegúrate de que contenga exactamente los parámetros oficiales de Laura y John Edison:"
    )
    add_code_box(doc, "PORT=3000\nEQUIPO_N=10")

    # SECCIÓN 4: PUESTA EN MARCHA
    h1 = doc.add_heading("4. Puesta en Marcha y Verificación", level=1)
    h1.runs[0].font.color.rgb = RGBColor(0x1E, 0x29, 0x3B)

    p = doc.add_paragraph("Para iniciar el servidor en modo normal:")
    add_code_box(doc, "npm start")

    p = doc.add_paragraph("Verás la confirmación oficial en consola:")
    add_code_box(doc, "================================================================\n"
                      "   PROMETHEIAX — FORO ACADÉMICO & API REST POR CAPAS (CIAF)    \n"
                      "================================================================\n"
                      " Servidor ejecutándose en: http://localhost:3000\n"
                      " Interfaz web del Foro y Asesorías: http://localhost:3000\n"
                      " Endpoint de Turnos: http://localhost:3000/api/turnos\n"
                      " Integrantes: John Edison Jordan (#10) y Laura Ximena Sánchez (#19)\n"
                      " Parámetro N configurado: N = 10 (Recargo prioritario: 20%)\n"
                      "================================================================")

    p = doc.add_paragraph("Abre el navegador e ingresa a: http://localhost:3000.")

    # SECCIÓN 5: PRUEBAS AUTOMATIZADAS
    h1 = doc.add_heading("5. Ejecución de la Suite de Pruebas Automatizadas", level=1)
    h1.runs[0].font.color.rgb = RGBColor(0x1E, 0x29, 0x3B)

    p = doc.add_paragraph("Para ejecutar los 9 tests que demuestran el cumplimiento de la rúbrica:")
    add_code_box(doc, "npm test")
    p = doc.add_paragraph("Resultado esperado: RESULTADO FINAL: 9/9 PRUEBAS EXITOSAS (100%).")

    # SECCIÓN 6: SOLUCIÓN DE ERRORES FRECUENTES
    h1 = doc.add_heading("6. Solución de Problemas Frecuentes (Troubleshooting)", level=1)
    h1.runs[0].font.color.rgb = RGBColor(0x1E, 0x29, 0x3B)

    doc.add_paragraph("• Error: 'npm.ps1 no se puede cargar porque la ejecución de scripts está deshabilitada':\n"
                      "  Causa: Política restrictiva de PowerShell en Windows.\n"
                      "  Solución: Ejecutar siempre 'npm.cmd install' o 'npm.cmd test'.", style='List Bullet')

    doc.add_paragraph("• Error: 'EADDRINUSE: address already in use :::3000':\n"
                      "  Causa: El puerto 3000 está ocupado por otra aplicación.\n"
                      "  Solución: Cambia en el archivo .env a 'PORT=3001' y reinicia con 'npm start'.", style='List Bullet')

    ruta_doc = os.path.join(r"d:\proyectos\universidad", "PrometheiaX — Manual de Instalación y Despliegue.docx")
    doc.save(ruta_doc)
    print(f"Documento guardado: {ruta_doc}")

if __name__ == '__main__':
    generar_guia_sustentacion()
    generar_manual_instalacion()
