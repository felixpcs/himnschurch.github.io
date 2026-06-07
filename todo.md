# HimnsChurch - TODO

## Base de datos y backend
- [x] Esquema DB: tabla hymns (id, number, title, author, category, lyrics JSON, createdAt, updatedAt)
- [x] Esquema DB: tabla setlists (id, name, createdAt)
- [x] Esquema DB: tabla setlist_items (id, setlistId, hymnId, position)
- [x] Esquema DB: tabla projection_state (id, activeHymnId, currentSlide, blackout, welcomeText, theme, fontSize)
- [x] Migrar esquema y aplicar SQL
- [x] Router tRPC: hymns.list, hymns.get, hymns.create, hymns.update, hymns.delete
- [x] Router tRPC: hymns.import (parseo de texto plano)
- [x] Router tRPC: setlists.list, setlists.get, setlists.create, setlists.update, setlists.delete
- [x] Router tRPC: setlists.addHymn, setlists.removeHymn, setlists.reorder
- [x] Router tRPC: projection.getState, projection.setState (blackout, slide, hymn, theme)
- [x] Seed: precargar himnos del himnario cristiano (25 himnos)

## Frontend - Estilos y Layout
- [x] Estilos globales cyberpunk: fondo negro, neón rosa/cian, fuentes geométricas
- [x] Efectos de brillo neon (text-shadow, box-shadow)
- [x] Componente HUD con corchetes en esquinas
- [x] Layout principal con sidebar de navegación cyberpunk
- [x] Página principal / biblioteca de himnos

## Frontend - Biblioteca de himnos
- [x] Lista de himnos con buscador en tiempo real
- [x] Filtros por categoría y número
- [x] Tarjetas de himno con número, título, autor, categoría
- [x] Modal/página de detalle del himno
- [x] Formulario de creación de himno (título, número, autor, categoría, estrofas/coros)
- [x] Formulario de edición de himno
- [x] Confirmación de eliminación de himno
- [x] Importación de himnos desde texto plano con detección automática de estrofas/coros

## Frontend - Panel de control de presentación
- [x] Selector de himno activo
- [x] Vista previa de la diapositiva actual
- [x] Navegación entre estrofas/coros (anterior/siguiente)
- [x] Botón de Blackout (ocultar/mostrar pantalla)
- [x] Pantalla de bienvenida configurable (texto personalizable)
- [x] Selector de tema visual (negro puro, gradiente oscuro)
- [x] Selector de tamaño de fuente (pequeño, mediano, grande)
- [x] Botón para abrir ventana de proyección secundaria (window.open)

## Frontend - Setlist (Lista de servicio)
- [x] Crear y nombrar setlist
- [x] Agregar himnos al setlist desde la biblioteca
- [x] Reordenar himnos en el setlist (up/down)
- [x] Eliminar himno del setlist
- [x] Navegar entre himnos del setlist durante presentación

## Frontend - Vista de proyección
- [x] Ruta /projection para ventana secundaria
- [x] Pantalla completa con fondo negro
- [x] Texto de himno en tamaño grande con efectos neon
- [x] Sincronización en tiempo real via BroadcastChannel API
- [x] Modo blackout (pantalla negra)
- [x] Pantalla de bienvenida
- [x] Soporte de temas: negro puro, gradiente oscuro
- [x] Soporte de tamaños de fuente

## Créditos
- [x] Sección "Acerca de" con nombre Felipe Formanttel como creador
- [x] Pie de página con crédito visible en todas las páginas

## Tests
- [x] Test: hymns CRUD básico
- [x] Test: setlist operations
- [x] Test: projection state
- [x] Test: parser de importación de himnos (unit test)
