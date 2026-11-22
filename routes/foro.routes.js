/**
 * PROMETHEIAX - FORO ACADÉMICO
 * Rutas de apoyo para la comunidad académica (preguntas, debates y respuestas)
 */

const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');

const RUTA_FORO = path.join(__dirname, '..', 'data', 'foro.json');

function leerForo() {
  try {
    if (!fs.existsSync(RUTA_FORO)) return [];
    return JSON.parse(fs.readFileSync(RUTA_FORO, 'utf-8'));
  } catch {
    return [];
  }
}

function guardarForo(posts) {
  try {
    fs.writeFileSync(RUTA_FORO, JSON.stringify(posts, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error al guardar foro:', err.message);
  }
}

// GET /api/foro - Listar preguntas y publicaciones del foro
router.get('/', (req, res) => {
  const posts = leerForo();
  res.status(200).json({ exito: true, total: posts.length, datos: posts });
});

// POST /api/foro - Crear nueva pregunta o publicación en el foro
router.post('/', (req, res) => {
  const { titulo, categoria, autor, contenido } = req.body;
  if (!titulo || !categoria || !autor || !contenido) {
    return res.status(400).json({
      exito: false,
      error: 'Campos obligatorios incompletos',
      mensaje: 'Debe incluir titulo, categoria, autor y contenido.'
    });
  }

  const posts = leerForo();
  const nuevoPost = {
    id: `post-${Date.now()}`,
    titulo: titulo.trim(),
    categoria: categoria.trim(),
    autor: autor.trim(),
    rol: 'Estudiante CIAF',
    fecha: new Date().toISOString(),
    contenido: contenido.trim(),
    votos: 0,
    respuestas: []
  };

  posts.unshift(nuevoPost);
  guardarForo(posts);
  res.status(201).json({ exito: true, datos: nuevoPost });
});

// POST /api/foro/:id/respuesta - Responder a una publicación
router.post('/:id/respuesta', (req, res) => {
  const { id } = req.params;
  const { autor, contenido } = req.body;
  if (!autor || !contenido) {
    return res.status(400).json({ exito: false, error: 'Debe incluir autor y contenido.' });
  }

  const posts = leerForo();
  const post = posts.find(p => p.id === id);
  if (!post) {
    return res.status(404).json({ exito: false, error: 'Publicación no encontrada.' });
  }

  const nuevaResp = {
    id: `resp-${Date.now()}`,
    autor: autor.trim(),
    fecha: new Date().toISOString(),
    contenido: contenido.trim()
  };

  post.respuestas.push(nuevaResp);
  guardarForo(posts);
  res.status(201).json({ exito: true, datos: nuevaResp });
});

// POST /api/foro/:id/voto - Votar por una publicación
router.post('/:id/voto', (req, res) => {
  const { id } = req.params;
  const posts = leerForo();
  const post = posts.find(p => p.id === id);
  if (!post) {
    return res.status(404).json({ exito: false, error: 'Publicación no encontrada.' });
  }

  post.votos = (post.votos || 0) + 1;
  guardarForo(posts);
  res.status(200).json({ exito: true, votos: post.votos });
});

module.exports = router;
