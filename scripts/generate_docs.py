# scripts/generate_docs.py
# Generador automatizado de documentos Word profesionales para PrometheiaX (CIAF)

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

def set_cell_margins(cell, top=120, bottom=120, left=150, right=150):
    """Establece márgenes internos de una celda."""
    tcPr = cell._element.get_or_add_tcPr()
    tcMar = parse_xml(f'<w:tcMar {nsdecls("w")}><w:top w:w="{top}" w:type="dxa"/><w:bottom w:w="{bottom}" w:type="dxa"/><w:left w:w="{left}" w:type="dxa"/><w:right w:w="{right}" w:type="dxa"/></w:tcMar>')
    tcPr.append(tcMar)

def add_callout(doc, title, text, bg_color="F0F4FF", border_color="4F46E5"):
    """Agrega una caja de llamado o alerta visual elegante."""
    tbl = doc.add_table(rows=1, cols=1)
    tbl.alignment = WD_TABLE_ALIGNMENT.CENTER
    cell = tbl.cell(0, 0)
    set_cell_background(cell, bg_color)
    set_cell_margins(cell, top=140, bottom=140, left=200, right=200)
    
    # Borde izquierdo grueso
    tcPr = cell._element.get_or_add_tcPr()
    borders = parse_xml(f'<w:tcBorders {nsdecls("w")}><w:left w:val="single" w:sz="36" w:space="0" w:color="{border_color}"/><w:top w:val="none"/><w:right w:val="none"/><w:bottom w:val="none"/></w:tcBorders>')
    tcPr.append(borders)
    
    p = cell.paragraphs[0]
    p.paragraph_format.space_before = Pt(2)
    p.paragraph_format.space_after = Pt(2)
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
    """Agrega una caja de código formateado con fondo oscuro/gris."""
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
    run.font.size = Pt(9.5)
    run.font.color.rgb = RGBColor(0x0F, 0x17, 0x2A)
    doc.add_paragraph()

# ==============================================================================
# DOCUMENTO A: GUÍA DE SUSTENTACIÓN
# ==============================================================================
def generar_guia_sustentacion():
    doc = Document()
    
    # Márgenes de página estándar (2.5 cm)
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
    
    r_prog = p_header.add_run("PROGRAMA DE INGENIERÍA DE SOFTWARE\nASIGNATURA: ARQUITECTURA CLIENTE-SERVIDOR\n\n")
    r_prog.font.size = Pt(11)
    r_prog.font.color.rgb = RGBColor(0x64, 0x74, 0x8B)

    p_title = doc.add_paragraph()
    p_title.alignment = WD_ALIGN_PARAGRAPH.CENTER
    r_title = p_title.add_run("PROMETHEIAX\n")
    r_title.bold = True
    r_title.font.size = Pt(26)
    r_title.font.color.rgb = RGBColor(0x4F, 0x46, 0xE5)
    
    r_sub = p_title.add_run("Guía Maestra de Sustentación Técnica\nAPI REST por Capas y Reglas de Negocio Parametrizadas (N)\n\n")
    r_sub.font.size = Pt(15)
    r_sub.bold = True
    r_sub.font.color.rgb = RGBColor(0x0F, 0x17, 0x2A)

    add_callout(doc, "INTEGRANTES OFICIALES DEL EQUIPO (GRUPO 1 MARTES)",
                "• 1. Jordan Rivas, John Edison — Lista Oficial CIAF: Puesto #10 (N = 10)\n"
                "• 2. Sánchez Rodríguez, Laura Ximena — Lista Oficial CIAF: Puesto #19\n\n"
                "Regla de Orden Alfabético por Apellido: La letra 'J' (Jordan) precede a la letra 'S' (Sánchez). "
                "Por lo tanto, el primer integrante es John Edison Jordan Rivas y el parámetro oficial es N = 10. "
                "Porcentaje de recargo resultante: N × 2% = 10 × 2% = 20%.",
                bg_color="EEF2FF", border_color="4F46E5")

    # SECCIÓN 1: CONTEXTO DEL NEGOCIO
    h1 = doc.add_heading("1. Definición del Caso de Negocio: PrometheiaX", level=1)
    h1.runs[0].font.color.rgb = RGBColor(0x1E, 0x29, 0x3B)
    
    p = doc.add_paragraph(
        "PrometheiaX es una plataforma académica inteligente que combina un foro colaborativo entre estudiantes de ingeniería con un sistema formal de solicitudes de asesorías y tutorías académicas. "
        "En el contexto universitario, los estudiantes requieren reforzar conceptos de alta complejidad como Arquitectura de Software, Patrones de Diseño, Bases de Datos y Programación Orientada a Objetos.\n\n"
        "Para dar estricto cumplimiento al Taller Evaluativo Final de CIAF, el caso de negocio modelado en la API REST es la gestión de turnos de asesorías académicas, donde los estudiantes registran su solicitud con los siguientes datos:"
    )
    
    doc.add_paragraph("• estudiante: Nombre completo del estudiante universitario solicitante (ej: 'Ana Gómez').", style='List Bullet')
    doc.add_paragraph("• tipoServicio: Modalidad de atención académica ('Asesoría académica', 'Tutoría personalizada', 'Revisión de proyecto').", style='List Bullet')
    doc.add_paragraph("• tema: Asignatura o tópico específico de la consulta ('Arquitectura de software').", style='List Bullet')
    doc.add_paragraph("• fechaHora: Fecha y hora programada en formato estándar ISO 8601 (ej: '2026-12-05T10:00:00').", style='List Bullet')
    doc.add_paragraph("• precioBase: Valor base de la sesión académica en pesos colombianos (simulado; debe ser mayor a 0).", style='List Bullet')
    doc.add_paragraph("• prioritario: Indicador booleano (true/false) que define si la asesoría requiere atención urgente.", style='List Bullet')

    # SECCIÓN 2: REGLA DE NEGOCIO N
    h1 = doc.add_heading("2. Parámetro N del Equipo y Cálculo de Recargo", level=1)
    h1.runs[0].font.color.rgb = RGBColor(0x1E, 0x29, 0x3B)
    
    p = doc.add_paragraph(
        "La rúbrica de CIAF exige que cada equipo parametrice el cálculo de sus tarifas según un valor numérico N. "
        "Dicho valor se obtiene ordenando alfabéticamente por apellido los integrantes del equipo según la lista oficial de asistencia de la plataforma; el valor de N es el número de lista del primer integrante."
    )
    
    add_callout(doc, "FÓRMULA MATEMÁTICA OFICIAL (services/turnos.service.js)",
                "porcentajeRecargo = N * 2%\n\n"
                "• Si prioritario = true:\n"
                "  totalPagar = precioBase + (precioBase * porcentajeRecargo / 100)\n\n"
                "• Si prioritario = false o no se especifica:\n"
                "  totalPagar = precioBase",
                bg_color="FEF3C7", border_color="D97706")

    p = doc.add_paragraph(
        "Ejemplo con N = 10 (Porcentaje aplicable = 20%):\n"
        "• Solicitud con precioBase = $200.000 COP y prioritario = true:\n"
        "  Recargo = 200.000 * 20% = $40.000 COP\n"
        "  Total a Pagar = $200.000 + $40.000 = $240.000 COP.\n"
        "• Solicitud con precioBase = $150.000 COP y prioritario = false:\n"
        "  Recargo = $0 COP\n"
        "  Total a Pagar = $150.000 COP."
    )

    # SECCIÓN 3: ARQUITECTURA POR CAPAS
    h1 = doc.add_heading("3. Explicación de la Arquitectura por Capas", level=1)
    h1.runs[0].font.color.rgb = RGBColor(0x1E, 0x29, 0x3B)
    
    p = doc.add_paragraph(
        "El principio fundamental de la arquitectura limpia por capas es el desacoplamiento: cada carpeta y archivo tiene una única y estricta responsabilidad. Si el profesor te pregunta por cualquier archivo, esta es la respuesta exacta:"
    )

    tabla_capas = doc.add_table(rows=6, cols=3)
    tabla_capas.alignment = WD_TABLE_ALIGNMENT.CENTER
    
    headers = ["Capa / Archivo", "Responsabilidad Principal", "¿Qué NO debe hacer?"]
    for i, title in enumerate(headers):
        cell = tabla_capas.cell(0, i)
        cell.text = title
        set_cell_background(cell, "1E293B")
        cell.paragraphs[0].runs[0].bold = True
        cell.paragraphs[0].runs[0].font.color.rgb = RGBColor(0xFF, 0xFF, 0xFF)
        set_cell_margins(cell, top=100, bottom=100, left=120, right=120)

    filas = [
        ("index.js", "Inicializa Express, configura middlewares (express.json, cors, static), monta las rutas en /api/turnos y levanta el servidor.", "NO debe contener lógica de negocio, ni validaciones de campos, ni cálculo de tarifas."),
        ("routes/\nturnos.routes.js", "Define los endpoints y verbos HTTP (GET /, GET /:id, POST /) y los asocia a las funciones del controlador.", "NO debe manipular req/res directamente, ni ejecutar cálculos matemáticos, ni acceder a los datos."),
        ("controllers/\nturnos.controller.js", "Gestiona la petición (req) y respuesta (res). Valida que no falten campos y que precioBase > 0. Asigna códigos HTTP 200, 201, 400 y 404.", "NO debe realizar la fórmula matemática del recargo ni leer/escribir archivos JSON directamente."),
        ("services/\nturnos.service.js", "Contiene toda la lógica de negocio, cálculos matemáticos con N, generación de IDs y lectura/escritura en disco.", "NO debe manejar req ni res, ni códigos de estado HTTP."),
        ("data/\nturnos.json", "Almacenamiento local persistente donde se guardan los turnos en formato JSON.", "NO es un motor SQL externo; es la persistencia local solicitada por el taller.")
    ]

    for idx, (capa, resp, no_hacer) in enumerate(filas, start=1):
        c0 = tabla_capas.cell(idx, 0)
        c1 = tabla_capas.cell(idx, 1)
        c2 = tabla_capas.cell(idx, 2)
        c0.text = capa
        c1.text = resp
        c2.text = no_hacer
        bg = "F8FAFC" if idx % 2 == 1 else "FFFFFF"
        set_cell_background(c0, bg)
        set_cell_background(c1, bg)
        set_cell_background(c2, bg)
        for c in (c0, c1, c2):
            set_cell_margins(c, top=80, bottom=80, left=100, right=100)
            c.paragraphs[0].runs[0].font.size = Pt(9)

    doc.add_paragraph()

    # SECCIÓN 4: PROTOCOLOS Y CÓDIGOS HTTP
    h1 = doc.add_heading("4. Protocolos y Códigos de Estado HTTP Exigidos", level=1)
    h1.runs[0].font.color.rgb = RGBColor(0x1E, 0x29, 0x3B)
    
    p = doc.add_paragraph(
        "La rúbrica asigna un puntaje crucial al manejo adecuado de los códigos HTTP. En PrometheiaX se manejan 4 códigos principales:"
    )

    doc.add_paragraph("• HTTP 200 OK: Indica que la petición se resolvió exitosamente. Se retorna al listar todos los turnos (GET /api/turnos) o al consultar un turno existente por su ID (GET /api/turnos/:id).", style='List Bullet')
    doc.add_paragraph("• HTTP 201 Created: Indica que un nuevo recurso fue creado en el servidor. Se retorna al registrar satisfactoriamente una nueva asesoría académica (POST /api/turnos), devolviendo el objeto creado con su ID y cálculos.", style='List Bullet')
    doc.add_paragraph("• HTTP 400 Bad Request: Indica error del cliente. Se retorna cuando en el cuerpo de la petición faltan campos obligatorios (como estudiante, tema o fechaHora) o cuando precioBase es menor o igual a cero o no es numérico.", style='List Bullet')
    doc.add_paragraph("• HTTP 404 Not Found: Indica que el recurso solicitado no fue encontrado. Se retorna cuando se consulta un identificador inexistente (ej: GET /api/turnos/999999).", style='List Bullet')

    # SECCIÓN 5: PREGUNTAS FRECUENTES DEL PROFESOR
    h1 = doc.add_heading("5. Simulacro: Preguntas Difíciles del Profesor y Respuestas Clave", level=1)
    h1.runs[0].font.color.rgb = RGBColor(0x1E, 0x29, 0x3B)

    preguntas = [
        ("¿Por qué el cálculo del porcentaje de recargo está en services y no en el controller?",
         "Porque según el principio de arquitectura por capas, el controlador sólo debe ocuparse de la comunicación HTTP (recibir req, validar datos de entrada y responder res). Toda la lógica de negocio, reglas de cálculo matemático y manipulación de datos pertenece exclusivamente a la capa de servicios (services). De esta forma, si mañana cambiamos la fórmula o el canal de entrada, la regla permanece intacta sin tocar los controladores."),
        
        ("¿Cómo determinaron el parámetro N y qué pasa si un integrante cambia?",
         "Siguiendo estrictamente la instrucción de CIAF, ordenamos alfabéticamente por apellido los integrantes de nuestro grupo según la lista oficial. El valor de N corresponde al número de lista del primer compañero. Además, diseñamos el sistema para leer la variable de entorno EQUIPO_N desde el archivo .env, de modo que si el profesor nos pide cambiar el N en vivo, sólo ajustamos la variable y el servidor aplica la nueva regla inmediatamente sin tocar el código fuente."),

        ("¿Cuál es la diferencia técnica entre devolver 400 Bad Request y 404 Not Found?",
         "El código 400 Bad Request se produce cuando la sintaxis o semántica de los datos enviados por el cliente es defectuosa (faltan campos obligatorios o el precio es menor o igual a cero). En cambio, el código 404 Not Found significa que la petición fue sintácticamente correcta, pero el recurso identificado en la URL (el ID del turno) no existe en el almacenamiento del servidor."),

        ("¿Por qué utilizan un archivo JSON en lugar de una base de datos MySQL o MongoDB?",
         "Porque el numeral 3.2 del documento oficial del taller especifica textualmente: 'Se debe utilizar un arreglo en memoria o un archivo .json local para almacenar los registros durante la ejecución (no se requiere motor de base de datos externo)'. Al usar JSON aseguramos persistencia entre reinicios del servidor sin dependencias externas pesadas, facilitando la portabilidad y la calificación."),

        ("¿Qué pasa si un usuario envía precioBase = -20000 o envía texto en el precio?",
         "En controllers/turnos.controller.js implementamos una validación defensiva estricta: Number(precioBase). Si no es numérico o si es menor o igual a cero, el servidor detiene el procesamiento y responde inmediatamente con HTTP 400 Bad Request y un mensaje JSON descriptivo, garantizando que el servidor no colapse con un error 500.")
    ]

    for q, a in preguntas:
        doc.add_paragraph(f"❓ Pregunta del Profesor: {q}", style='List Bullet')
        p_ans = doc.add_paragraph()
        r_ans = p_ans.add_run(f"💡 Respuesta recomendada: {a}\n")
        r_ans.font.size = Pt(9.5)
        r_ans.font.color.rgb = RGBColor(0x33, 0x41, 0x55)

    # SECCIÓN 6: GUION DE SUSTENTACIÓN
    h1 = doc.add_heading("6. Guion de Exposición para el Equipo (Tiempo Total: 8 Minutos)", level=1)
    h1.runs[0].font.color.rgb = RGBColor(0x1E, 0x29, 0x3B)

    p = doc.add_paragraph(
        "Se recomienda distribuir la exposición de la siguiente manera, manteniendo a todos los integrantes atentos porque el docente puede pedir el cambio de expositor en cualquier segundo:"
    )

    doc.add_paragraph("• Minuto 0 a 2 (Introducción y Negocio): Saludo institucional, presentación de integrantes, justificación de PrometheiaX y explicación de cómo se obtuvo N según la lista oficial.", style='List Bullet')
    doc.add_paragraph("• Minuto 2 a 4 (Demostración en Vivo): Abrir el navegador en http://localhost:3000, registrar un turno con atención prioritaria demostrando el código 201 y el recargo en vivo, consultar un ID existente (200 OK) y forzar un ID que no exista (404 Not Found).", style='List Bullet')
    doc.add_paragraph("• Minuto 4 a 6 (Inspección de Capas en el Código): Abrir VS Code y mostrar la pureza de cada capa: cómo index.js sólo conecta, cómo routes/ sólo define endpoints, cómo controllers/ valida y asigna los códigos HTTP, y cómo services/ calcula el recargo de N y persiste en data/turnos.json.", style='List Bullet')
    doc.add_paragraph("• Minuto 6 a 8 (Pruebas Automatizadas y Cierre): Ejecutar 'npm test' en la terminal para mostrar las 9 pruebas pasando al 100% y responder preguntas del docente.", style='List Bullet')

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
    
    r_prog = p_header.add_run("FACULTAD DE INGENIERÍA — INGENIERÍA DE SOFTWARE\n\n")
    r_prog.font.size = Pt(11)
    r_prog.font.color.rgb = RGBColor(0x64, 0x74, 0x8B)

    p_title = doc.add_paragraph()
    p_title.alignment = WD_ALIGN_PARAGRAPH.CENTER
    r_title = p_title.add_run("PROMETHEIAX\n")
    r_title.bold = True
    r_title.font.size = Pt(26)
    r_title.font.color.rgb = RGBColor(0x02, 0x84, 0xC7)
    
    r_sub = p_title.add_run("Manual Técnico de Instalación, Configuración y Despliegue\nPaso a paso desde cero en cualquier computador\n\n")
    r_sub.font.size = Pt(15)
    r_sub.bold = True
    r_sub.font.color.rgb = RGBColor(0x0F, 0x17, 0x2A)

    add_callout(doc, "PROPÓSITO DE ESTE MANUAL",
                "Este manual está diseñado para que cualquier miembro del equipo, o el docente calificador, pueda clonar y poner en marcha PrometheiaX en un computador nuevo sin complicaciones técnicas. Incluye solución a errores comunes en Windows y guías de prueba tanto por navegador como con Postman y tests automatizados.",
                bg_color="F0F9FF", border_color="0284C7")

    # SECCIÓN 1: REQUISITOS
    h1 = doc.add_heading("1. Requisitos Previos del Sistema", level=1)
    h1.runs[0].font.color.rgb = RGBColor(0x1E, 0x29, 0x3B)
    
    p = doc.add_paragraph("Antes de comenzar, asegúrate de contar con los siguientes programas instalados en el equipo:")
    doc.add_paragraph("• Node.js: Versión 18.x, 20.x o 22.x LTS recomendada (incluye npm). Descargar desde https://nodejs.org.", style='List Bullet')
    doc.add_paragraph("• Git: Para clonar el repositorio desde GitHub (descargar desde https://git-scm.com).", style='List Bullet')
    doc.add_paragraph("• Navegador Web Moderno: Chrome, Edge, Firefox o Brave.", style='List Bullet')
    doc.add_paragraph("• Postman (Opcional pero recomendado): Para pruebas avanzadas de API REST.", style='List Bullet')

    # SECCIÓN 2: DESCARGA E INSTALACIÓN
    h1 = doc.add_heading("2. Descarga e Instalación Paso a Paso", level=1)
    h1.runs[0].font.color.rgb = RGBColor(0x1E, 0x29, 0x3B)

    doc.add_paragraph("Paso 2.1: Obtener el código fuente desde GitHub o descomprimir el archivo ZIP:")
    add_code_box(doc, "git clone https://github.com/TU_USUARIO/prometheiax-api-ciaf.git\ncd prometheiax-api-ciaf")

    doc.add_paragraph("Paso 2.2: Instalar las dependencias de Node.js mediante npm:")
    add_code_box(doc, "npm install\n\n# En Windows PowerShell si hay restricción de scripts, usar:\nnpm.cmd install")

    # SECCIÓN 3: CONFIGURACIÓN DE N Y ENTORNO
    h1 = doc.add_heading("3. Configuración del Parámetro N y Variables de Entorno", level=1)
    h1.runs[0].font.color.rgb = RGBColor(0x1E, 0x29, 0x3B)

    p = doc.add_paragraph(
        "PrometheiaX utiliza un archivo .env para parametrizar el número del equipo N sin modificar el código. "
        "En la raíz del proyecto encontrarás el archivo .env.example. Crea una copia llamada .env:"
    )
    add_code_box(doc, "# En Windows (PowerShell):\nCopy-Item .env.example .env\n\n# En Linux / macOS:\ncp .env.example .env")

    p = doc.add_paragraph("Abre el archivo .env en cualquier editor de texto (Bloc de notas o VS Code) y define el N oficial de tu equipo:")
    add_code_box(doc, "PORT=3000\nEQUIPO_N=7")

    add_callout(doc, "CÓMO DETERMINAR TU EQUIPO_N",
                "1. Toma los apellidos de tus compañeros y ordénalos de la A a la Z.\n"
                "2. Busca al primer compañero en la lista oficial de asistencia del profesor.\n"
                "3. El número de casilla oficial que ocupe es tu N (ejemplo: si es el puesto #7, N=7).",
                bg_color="FEF3C7", border_color="D97706")

    # SECCIÓN 4: INICIO DEL SERVIDOR
    h1 = doc.add_heading("4. Puesta en Marcha del Servidor", level=1)
    h1.runs[0].font.color.rgb = RGBColor(0x1E, 0x29, 0x3B)

    p = doc.add_paragraph("Para iniciar el servidor en modo producción:")
    add_code_box(doc, "npm start")

    p = doc.add_paragraph("Verás una confirmación en la consola similar a:")
    add_code_box(doc, "================================================================\n"
                      "   PROMETHEIAX — FORO ACADÉMICO & API REST POR CAPAS (CIAF)    \n"
                      "================================================================\n"
                      " Servidor ejecutándose en: http://localhost:3000\n"
                      " Interfaz web del Foro y Asesorías: http://localhost:3000\n"
                      " Endpoint de Turnos: http://localhost:3000/api/turnos\n"
                      " Parámetro N configurado: N = 7 (Recargo prioritario: 14%)\n"
                      "================================================================")

    p = doc.add_paragraph("Abre tu navegador e ingresa a: http://localhost:3000. Podrás interactuar inmediatamente con el formulario, ver el recargo de N en vivo y consultar solicitudes.")

    # SECCIÓN 5: PRUEBAS CON POSTMAN
    h1 = doc.add_heading("5. Guía de Pruebas con Postman", level=1)
    h1.runs[0].font.color.rgb = RGBColor(0x1E, 0x29, 0x3B)

    p = doc.add_paragraph("Para probar los 3 endpoints obligatorios y sus códigos HTTP en Postman:")

    p1 = doc.add_paragraph("Prueba 1: Listar todas las solicitudes (HTTP 200 OK)", style='List Bullet')
    add_code_box(doc, "Método: GET\nURL: http://localhost:3000/api/turnos\nRespuesta esperada: 200 OK con arreglo JSON de turnos.")

    p2 = doc.add_paragraph("Prueba 2: Consultar solicitud específica (HTTP 200 OK)", style='List Bullet')
    add_code_box(doc, "Método: GET\nURL: http://localhost:3000/api/turnos/1\nRespuesta esperada: 200 OK con los datos de Ana Gómez.")

    p3 = doc.add_paragraph("Prueba 3: Consultar solicitud inexistente (HTTP 404 Not Found)", style='List Bullet')
    add_code_box(doc, "Método: GET\nURL: http://localhost:3000/api/turnos/999999\nRespuesta esperada: 404 Not Found con mensaje descriptivo.")

    p4 = doc.add_paragraph("Prueba 4: Crear solicitud con prioridad (HTTP 201 Created y Recargo N)", style='List Bullet')
    add_code_box(doc, "Método: POST\nURL: http://localhost:3000/api/turnos\nHeader: Content-Type: application/json\nBody:\n{\n  \"estudiante\": \"Ana Gómez\",\n  \"tipoServicio\": \"Asesoría académica\",\n  \"tema\": \"Arquitectura de software\",\n  \"fechaHora\": \"2026-12-05T10:00:00\",\n  \"precioBase\": 200000,\n  \"prioritario\": true\n}\nRespuesta esperada: 201 Created, totalPagar = 228000 (con N=7).")

    p5 = doc.add_paragraph("Prueba 5: Enviar datos incompletos (HTTP 400 Bad Request)", style='List Bullet')
    add_code_box(doc, "Método: POST\nURL: http://localhost:3000/api/turnos\nHeader: Content-Type: application/json\nBody:\n{\n  \"estudiante\": \"\",\n  \"tipoServicio\": \"Asesoría\"\n}\nRespuesta esperada: 400 Bad Request con detalles de validación.")

    # SECCIÓN 6: PRUEBAS AUTOMATIZADAS
    h1 = doc.add_heading("6. Ejecución de la Suite de Pruebas Automatizadas", level=1)
    h1.runs[0].font.color.rgb = RGBColor(0x1E, 0x29, 0x3B)

    p = doc.add_paragraph("PrometheiaX incluye un runner automatizado que verifica los 9 requisitos de la rúbrica en menos de 1 segundo:")
    add_code_box(doc, "npm test")
    p = doc.add_paragraph("El resultado debe indicar: RESULTADO FINAL: 9/9 PRUEBAS EXITOSAS (100%).")

    # SECCIÓN 7: SOLUCIÓN DE PROBLEMAS
    h1 = doc.add_heading("7. Solución de Problemas Frecuentes (Troubleshooting)", level=1)
    h1.runs[0].font.color.rgb = RGBColor(0x1E, 0x29, 0x3B)

    doc.add_paragraph("• Error: 'npm.ps1 cannot be loaded because running scripts is disabled':\n"
                      "  Causa: Política de seguridad restrictiva de PowerShell en Windows.\n"
                      "  Solución: Ejecutar 'npm.cmd install' o abrir PowerShell como Administrador y ejecutar 'Set-ExecutionPolicy RemoteSigned -Scope CurrentUser'.", style='List Bullet')

    doc.add_paragraph("• Error: 'EADDRINUSE: address already in use :::3000':\n"
                      "  Causa: El puerto 3000 está siendo utilizado por otro programa.\n"
                      "  Solución: En el archivo .env cambia 'PORT=3000' por 'PORT=3001' o 'PORT=5000' y vuelve a iniciar.", style='List Bullet')

    doc.add_paragraph("• Los registros se borraron o el archivo JSON está vacío:\n"
                      "  Solución: data/turnos.json se auto-repara si se daña, pero puedes restaurar los datos semilla copiando el contenido de ejemplo del README.md.", style='List Bullet')

    ruta_doc = os.path.join(r"d:\proyectos\universidad", "PrometheiaX — Manual de Instalación y Despliegue.docx")
    doc.save(ruta_doc)
    print(f"Documento guardado: {ruta_doc}")

if __name__ == '__main__':
    generar_guia_sustentacion()
    generar_manual_instalacion()
