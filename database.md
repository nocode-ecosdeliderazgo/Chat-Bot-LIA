-- SEED P1: Direcciones (CEO, CTO/CIO, Ventas, Marketing, Operaciones, Finanzas/CFO, RRHH, Contabilidad, Compras/Supply)
-- Ejecuta en Supabase SQL editor. Idempotente por (code).

-- Helper: UPSERT question
-- fields: code, perfil, area, dimension, subdomain, qtype, max_options, content, order_num

-- =========================
-- CEO / Dirección General
-- =========================
INSERT INTO public.questions_catalog (code, perfil, area, dimension, subdomain, qtype, max_options, content, order_num)
VALUES
('CEO-1',   'CEO','Otra','Conocimiento', NULL, 'Likert_1_7', NULL, 'Conocimiento general sobre IA aplicada a tu rol como Dirección General', 10),
('CEO-2a',  'CEO','Otra','Conocimiento', 'Familiaridad', 'Likert_1_7', NULL, 'LLMs para presentaciones ejecutivas', 20),
('CEO-2b',  'CEO','Otra','Conocimiento', 'Familiaridad', 'Likert_1_7', NULL, 'Automatización personal (resúmenes, agenda, seguimiento)', 21),
('CEO-2c',  'CEO','Otra','Conocimiento', 'Familiaridad', 'Likert_1_7', NULL, 'Análisis predictivo para decisiones estratégicas', 22),
('CEO-2d',  'CEO','Otra','Conocimiento', 'Familiaridad', 'Likert_1_7', NULL, 'Comunicación y mensajes clave asistidos por IA', 23),
('CEO-2e',  'CEO','Otra','Conocimiento', 'Familiaridad', 'Likert_1_7', NULL, 'Gobernanza básica: privacidad y uso responsable', 24),
('CEO-Tool','CEO','Otra','Conocimiento', NULL, 'Abierta', NULL, 'Herramienta/flujo con IA que te dio mayor claridad o velocidad', 25),
('CEO-3',   'CEO','Otra','Aplicación', 'Estrategia', 'Likert_1_7', NULL, 'Uso de IA para preparar y comunicar estrategia', 30),
('CEO-4',   'CEO','Otra','Aplicación', 'Priorizar',  'Likert_1_7', NULL, 'Uso de IA para evaluar escenarios y priorizar iniciativas', 31),
('CEO-5',   'CEO','Otra','Aplicación', 'Seguimiento','Likert_1_7', NULL, 'Uso de IA para seguimiento ejecutivo (KPIs, resúmenes, next steps)', 32),
('CEO-90',  'CEO','Otra','Aplicación', NULL, 'Abierta', NULL, 'Mayor oportunidad de impacto con IA en 90 días', 33),
('CEO-6',   'CEO','Otra','Inversión', NULL, 'Likert_1_7', NULL, 'Disposición a invertir en tu capacitación personal (12 meses)', 40),
('CEO-7',   'CEO','Otra','Estrategia', NULL, 'Abierta', NULL, '¿Qué esperas lograr con IA en tu dirección general?', 41),
('CEO-8',   'CEO','Otra','Inversión', NULL, 'MultiCheck', 5, '¿Qué apoyo valoras más?', 42)
ON CONFLICT (code) DO UPDATE SET
  perfil=EXCLUDED.perfil, area=EXCLUDED.area, dimension=EXCLUDED.dimension, subdomain=EXCLUDED.subdomain,
  qtype=EXCLUDED.qtype, max_options=EXCLUDED.max_options, content=EXCLUDED.content, order_num=EXCLUDED.order_num;

INSERT INTO public.question_options (question_id, opt_key, opt_text)
SELECT id, x.opt_key, x.opt_text
FROM public.questions_catalog q
JOIN (VALUES
 ('A','Taller ejecutivo 1:1'),
 ('B','Casos de uso por área y plan de 90 días'),
 ('C','Herramientas listas para la oficina del CEO'),
 ('D','Gobernanza de uso responsable (líneas rojas)'),
 ('E','Otro')
) AS x(opt_key,opt_text) ON TRUE
WHERE q.code='CEO-8'
ON CONFLICT DO NOTHING;

-- =========================
-- Dirección de Ventas
-- =========================
INSERT INTO public.questions_catalog (code, perfil, area, dimension, subdomain, qtype, max_options, content, order_num)
VALUES
('VENTDIR-1',   'Dirección de Ventas','Ventas','Conocimiento', NULL, 'Likert_1_7', NULL, 'Conocimiento general sobre IA en dirección comercial/ventas', 10),
('VENTDIR-2a',  'Dirección de Ventas','Ventas','Conocimiento', 'Familiaridad','Likert_1_7', NULL, 'Prevención de fuga en pipeline y forecast asistido', 20),
('VENTDIR-2b',  'Dirección de Ventas','Ventas','Conocimiento', 'Familiaridad','Likert_1_7', NULL, 'Productividad del equipo (copilots, resúmenes, seguimiento)', 21),
('VENTDIR-2c',  'Dirección de Ventas','Ventas','Conocimiento', 'Familiaridad','Likert_1_7', NULL, 'Playbooks de mensajes y secuencias con IA', 22),
('VENTDIR-2d',  'Dirección de Ventas','Ventas','Conocimiento', 'Familiaridad','Likert_1_7', NULL, 'Priorización de cuentas y territorios (ICP, señales)', 23),
('VENTDIR-2e',  'Dirección de Ventas','Ventas','Conocimiento', 'Familiaridad','Likert_1_7', NULL, 'Análisis de rendimiento y coaching habilitado por IA', 24),
('VENTDIR-FLU', 'Dirección de Ventas','Ventas','Conocimiento', NULL, 'Abierta', NULL, 'Flujo con IA que quieres escalar en tu equipo', 25),
('VENTDIR-3',   'Dirección de Ventas','Ventas','Aplicación', 'Forecast','Likert_1_7', NULL, 'Uso de IA para forecast y salud del pipeline', 30),
('VENTDIR-4',   'Dirección de Ventas','Ventas','Aplicación', 'Enablement','Likert_1_7', NULL, 'Uso de IA para enablement/coaching del equipo', 31),
('VENTDIR-5',   'Dirección de Ventas','Ventas','Aplicación', 'CRM','Likert_1_7', NULL, 'Uso de IA para gobierno de CRM (calidad de datos, cadencias)', 32),
('VENTDIR-CASO','Dirección de Ventas','Ventas','Aplicación', NULL, 'Abierta', NULL, 'Caso en el que IA aceleró cierres o mejoró win-rate', 33),
('VENTDIR-6',   'Dirección de Ventas','Ventas','Estrategia', NULL, 'Likert_1_7', NULL, 'Claridad de roadmap de IA en dirección de ventas', 40),
('VENTDIR-7',   'Dirección de Ventas','Ventas','Inversión',  NULL, 'Likert_1_7', NULL, 'Disposición a invertir en capacitación ejecutiva (12 meses)', 41),
('VENTDIR-8',   'Dirección de Ventas','Ventas','Estrategia', NULL, 'Abierta', NULL, '¿Qué esperas lograr con IA en tu dirección comercial?', 42),
('VENTDIR-9',   'Dirección de Ventas','Ventas','Inversión',  NULL, 'MultiCheck', 5, '¿Qué apoyo necesitas?', 43)
ON CONFLICT (code) DO UPDATE SET
  perfil=EXCLUDED.perfil, area=EXCLUDED.area, dimension=EXCLUDED.dimension, subdomain=EXCLUDED.subdomain,
  qtype=EXCLUDED.qtype, max_options=EXCLUDED.max_options, content=EXCLUDED.content, order_num=EXCLUDED.order_num;

INSERT INTO public.question_options (question_id, opt_key, opt_text)
SELECT id, x.opt_key, x.opt_text
FROM public.questions_catalog q
JOIN (VALUES
 ('A','Playbooks y plantillas listos'),
 ('B','Tableros de riesgo y forecast'),
 ('C','Mentoría para managers'),
 ('D','Integraciones con CRM'),
 ('E','Otro')
) AS x(opt_key,opt_text) ON TRUE
WHERE q.code='VENTDIR-9'
ON CONFLICT DO NOTHING;

-- =========================
-- Dirección de Marketing
-- =========================
INSERT INTO public.questions_catalog (code, perfil, area, dimension, subdomain, qtype, max_options, content, order_num)
VALUES
('MKTDIR-1',  'Dirección de Marketing','Marketing','Conocimiento', NULL, 'Likert_1_7', NULL, 'Conocimiento general sobre IA en marketing (dirección)', 10),
('MKTDIR-2a','Dirección de Marketing','Marketing','Conocimiento','Familiaridad','Likert_1_7',NULL,'Generación de contenido y creatividad con IA',20),
('MKTDIR-2b','Dirección de Marketing','Marketing','Conocimiento','Familiaridad','Likert_1_7',NULL,'Optimización de campañas y mix de medios',21),
('MKTDIR-2c','Dirección de Marketing','Marketing','Conocimiento','Familiaridad','Likert_1_7',NULL,'Segmentación/atribución y medición de ROI',22),
('MKTDIR-2d','Dirección de Marketing','Marketing','Conocimiento','Familiaridad','Likert_1_7',NULL,'Personalización en canales (email, web, chat)',23),
('MKTDIR-2e','Dirección de Marketing','Marketing','Conocimiento','Familiaridad','Likert_1_7',NULL,'Gobernanza de marca y riesgos',24),
('MKTDIR-OP','Dirección de Marketing','Marketing','Conocimiento',NULL,'Abierta',NULL,'Mayor oportunidad para mejorar ROI con IA en tu área',25),
('MKTDIR-3', 'Dirección de Marketing','Marketing','Aplicación','Planeación','Likert_1_7',NULL,'Uso de IA para planeación y calendarización de contenido',30),
('MKTDIR-4', 'Dirección de Marketing','Marketing','Aplicación','Optimización','Likert_1_7',NULL,'Uso de IA para optimización y experimentación (A/B)',31),
('MKTDIR-5', 'Dirección de Marketing','Marketing','Aplicación','Medición','Likert_1_7',NULL,'Uso de IA para medición y atribución de campañas',32),
('MKTDIR-C','Dirección de Marketing','Marketing','Aplicación',NULL,'Abierta',NULL,'Caso en el que IA elevó el rendimiento de una campaña',33),
('MKTDIR-6', 'Dirección de Marketing','Marketing','Estrategia',NULL,'Likert_1_7',NULL,'Claridad de roadmap de IA en dirección de marketing',40),
('MKTDIR-7', 'Dirección de Marketing','Marketing','Inversión',NULL,'Likert_1_7',NULL,'Disposición a invertir en capacitación ejecutiva (12 meses)',41),
('MKTDIR-8', 'Dirección de Marketing','Marketing','Estrategia',NULL,'Abierta',NULL,'¿Qué esperas lograr con IA en tu dirección de marketing?',42),
('MKTDIR-9', 'Dirección de Marketing','Marketing','Inversión',NULL,'MultiCheck',5,'¿Qué apoyo necesitas?',43)
ON CONFLICT (code) DO UPDATE SET
  perfil=EXCLUDED.perfil, area=EXCLUDED.area, dimension=EXCLUDED.dimension, subdomain=EXCLUDED.subdomain,
  qtype=EXCLUDED.qtype, max_options=EXCLUDED.max_options, content=EXCLUDED.content, order_num=EXCLUDED.order_num;

INSERT INTO public.question_options (question_id, opt_key, opt_text)
SELECT id, x.opt_key, x.opt_text
FROM public.questions_catalog q
JOIN (VALUES
 ('A','Talleres por canal'),
 ('B','Casos de personalización y medición'),
 ('C','Herramientas listas para contenido/campañas'),
 ('D','Mentoría para el equipo'),
 ('E','Otro')
) AS x(opt_key,opt_text) ON TRUE
WHERE q.code='MKTDIR-9'
ON CONFLICT DO NOTHING;

-- =========================
-- Dirección de Operaciones
-- =========================
INSERT INTO public.questions_catalog (code, perfil, area, dimension, subdomain, qtype, max_options, content, order_num)
VALUES
('OPSDIR-1','Dirección de Operaciones','Operaciones','Conocimiento',NULL,'Likert_1_7',NULL,'Conocimiento general sobre IA en dirección de operaciones',10),
('OPSDIR-2a','Dirección de Operaciones','Operaciones','Conocimiento','Familiaridad','Likert_1_7',NULL,'Optimización de procesos y automatizaciones',20),
('OPSDIR-2b','Dirección de Operaciones','Operaciones','Conocimiento','Familiaridad','Likert_1_7',NULL,'Análisis predictivo de tiempos/costos/riesgos',21),
('OPSDIR-2c','Dirección de Operaciones','Operaciones','Conocimiento','Familiaridad','Likert_1_7',NULL,'Gestión de proyectos y tableros operativos',22),
('OPSDIR-2d','Dirección de Operaciones','Operaciones','Conocimiento','Familiaridad','Likert_1_7',NULL,'Mejora continua con IA (cuellos de botella)',23),
('OPSDIR-2e','Dirección de Operaciones','Operaciones','Conocimiento','Familiaridad','Likert_1_7',NULL,'Gobernanza de datos operativos',24),
('OPSDIR-OP','Dirección de Operaciones','Operaciones','Conocimiento',NULL,'Abierta',NULL,'Proceso a optimizar con IA (90 días)',25),
('OPSDIR-3','Dirección de Operaciones','Operaciones','Aplicación','Priorización','Likert_1_7',NULL,'Uso de IA para priorización y carga de trabajo',30),
('OPSDIR-4','Dirección de Operaciones','Operaciones','Aplicación','Seguimiento','Likert_1_7',NULL,'Uso de IA para seguimiento y reporteo operativo',31),
('OPSDIR-5','Dirección de Operaciones','Operaciones','Aplicación','Riesgos','Likert_1_7',NULL,'Uso de IA para control de riesgos (incidentes/SLAs)',32),
('OPSDIR-C','Dirección de Operaciones','Operaciones','Aplicación',NULL,'Abierta',NULL,'Caso en el que IA redujo reprocesos o tiempos',33),
('OPSDIR-6','Dirección de Operaciones','Operaciones','Estrategia',NULL,'Likert_1_7',NULL,'Claridad de roadmap de IA en operaciones',40),
('OPSDIR-7','Dirección de Operaciones','Operaciones','Inversión',NULL,'Likert_1_7',NULL,'Disposición a invertir en capacitación ejecutiva (12 meses)',41),
('OPSDIR-8','Dirección de Operaciones','Operaciones','Estrategia',NULL,'Abierta',NULL,'¿Qué esperas lograr con IA en tu dirección de operaciones?',42),
('OPSDIR-9','Dirección de Operaciones','Operaciones','Inversión',NULL,'MultiCheck',5,'¿Qué apoyo necesitas?',43)
ON CONFLICT (code) DO UPDATE SET
  perfil=EXCLUDED.perfil, area=EXCLUDED.area, dimension=EXCLUDED.dimension, subdomain=EXCLUDED.subdomain,
  qtype=EXCLUDED.qtype, max_options=EXCLUDED.max_options, content=EXCLUDED.content, order_num=EXCLUDED.order_num;

INSERT INTO public.question_options (question_id, opt_key, opt_text)
SELECT id, x.opt_key, x.opt_text
FROM public.questions_catalog q
JOIN (VALUES
 ('A','Talleres de automatización'),
 ('B','Casos de uso de análisis predictivo'),
 ('C','Herramientas listas (RPA/iPaaS)'),
 ('D','Mentoría para líderes operativos'),
 ('E','Otro')
) AS x(opt_key,opt_text) ON TRUE
WHERE q.code='OPSDIR-9'
ON CONFLICT DO NOTHING;

-- =========================
-- Dirección de Finanzas (CFO)
-- =========================
INSERT INTO public.questions_catalog (code, perfil, area, dimension, subdomain, qtype, max_options, content, order_num)
VALUES
('CFODIR-1','Dirección de Finanzas (CFO)','Finanzas','Conocimiento',NULL,'Likert_1_7',NULL,'Conocimiento general sobre IA en dirección de finanzas (CFO)',10),
('CFODIR-2a','Dirección de Finanzas (CFO)','Finanzas','Conocimiento','Familiaridad','Likert_1_7',NULL,'Automatización de reportes y cierres ejecutivos',20),
('CFODIR-2b','Dirección de Finanzas (CFO)','Finanzas','Conocimiento','Familiaridad','Likert_1_7',NULL,'Proyecciones y escenarios (ingresos, costos, cashflow)',21),
('CFODIR-2c','Dirección de Finanzas (CFO)','Finanzas','Conocimiento','Familiaridad','Likert_1_7',NULL,'Riesgos/controles y detección de anomalías',22),
('CFODIR-2d','Dirección de Finanzas (CFO)','Finanzas','Conocimiento','Familiaridad','Likert_1_7',NULL,'Planificación y presupuesto asistido por IA',23),
('CFODIR-2e','Dirección de Finanzas (CFO)','Finanzas','Conocimiento','Familiaridad','Likert_1_7',NULL,'Narrativas y presentaciones financieras',24),
('CFODIR-OP','Dirección de Finanzas (CFO)','Finanzas','Conocimiento',NULL,'Abierta',NULL,'Entregable financiero a optimizar con IA',25),
('CFODIR-3','Dirección de Finanzas (CFO)','Finanzas','Aplicación','Reportes','Likert_1_7',NULL,'Uso de IA para reportes y paquetes de gestión',30),
('CFODIR-4','Dirección de Finanzas (CFO)','Finanzas','Aplicación','Escenarios','Likert_1_7',NULL,'Uso de IA para escenarios y planeación financiera',31),
('CFODIR-5','Dirección de Finanzas (CFO)','Finanzas','Aplicación','Riesgos','Likert_1_7',NULL,'Uso de IA para riesgos/controles/fraude',32),
('CFODIR-C','Dirección de Finanzas (CFO)','Finanzas','Aplicación',NULL,'Abierta',NULL,'Caso en el que IA mejoró visibilidad o decisiones',33),
('CFODIR-6','Dirección de Finanzas (CFO)','Finanzas','Estrategia',NULL,'Likert_1_7',NULL,'Claridad de roadmap de IA en finanzas',40),
('CFODIR-7','Dirección de Finanzas (CFO)','Finanzas','Inversión',NULL,'Likert_1_7',NULL,'Disposición a invertir en capacitación ejecutiva (12 meses)',41),
('CFODIR-8','Dirección de Finanzas (CFO)','Finanzas','Estrategia',NULL,'Abierta',NULL,'¿Qué esperas lograr con IA en tu dirección financiera?',42),
('CFODIR-9','Dirección de Finanzas (CFO)','Finanzas','Inversión',NULL,'MultiCheck',5,'¿Qué apoyo necesitas?',43)
ON CONFLICT (code) DO UPDATE SET
  perfil=EXCLUDED.perfil, area=EXCLUDED.area, dimension=EXCLUDED.dimension, subdomain=EXCLUDED.subdomain,
  qtype=EXCLUDED.qtype, max_options=EXCLUDED.max_options, content=EXCLUDED.content, order_num=EXCLUDED.order_num;

INSERT INTO public.question_options (question_id, opt_key, opt_text)
SELECT id, x.opt_key, x.opt_text
FROM public.questions_catalog q
JOIN (VALUES
 ('A','Taller financiero con el equipo'),
 ('B','Casos de valor (ROI) y priorización'),
 ('C','Herramientas listas (narrativas, proyecciones)'),
 ('D','Mentoría/Colearning ejecutivo'),
 ('E','Otro')
) AS x(opt_key,opt_text) ON TRUE
WHERE q.code='CFODIR-9'
ON CONFLICT DO NOTHING;

-- =========================
-- Dirección de RRHH (CHRO)
-- =========================
INSERT INTO public.questions_catalog (code, perfil, area, dimension, subdomain, qtype, max_options, content, order_num)
VALUES
('RRHHDIR-1','Dirección de RRHH','RRHH','Conocimiento',NULL,'Likert_1_7',NULL,'Conocimiento general sobre IA en RRHH',10),
('RRHHDIR-2a','Dirección de RRHH','RRHH','Conocimiento','Familiaridad','Likert_1_7',NULL,'Reclutamiento y selección (CV, entrevistas)',20),
('RRHHDIR-2b','Dirección de RRHH','RRHH','Conocimiento','Familiaridad','Likert_1_7',NULL,'Onboarding y capacitación personalizada',21),
('RRHHDIR-2c','Dirección de RRHH','RRHH','Conocimiento','Familiaridad','Likert_1_7',NULL,'Análisis de desempeño y productividad',22),
('RRHHDIR-2d','Dirección de RRHH','RRHH','Conocimiento','Familiaridad','Likert_1_7',NULL,'Clima laboral y escucha activa',23),
('RRHHDIR-2e','Dirección de RRHH','RRHH','Conocimiento','Familiaridad','Likert_1_7',NULL,'Planeación de sucesión y desarrollo',24),
('RRHHDIR-OP','Dirección de RRHH','RRHH','Conocimiento',NULL,'Abierta',NULL,'Aplicación de IA que transformaría la gestión de talento',25),
('RRHHDIR-3','Dirección de RRHH','RRHH','Aplicación','Atracción','Likert_1_7',NULL,'Uso de IA en atracción y selección de talento',30),
('RRHHDIR-4','Dirección de RRHH','RRHH','Aplicación','Capacitación','Likert_1_7',NULL,'Uso de IA en capacitación y desarrollo',31),
('RRHHDIR-5','Dirección de RRHH','RRHH','Aplicación','Desempeño','Likert_1_7',NULL,'Uso de IA en desempeño y clima laboral',32),
('RRHHDIR-C','Dirección de RRHH','RRHH','Aplicación',NULL,'Abierta',NULL,'Ejemplo de mejora de compromiso/retención',33),
('RRHHDIR-6','Dirección de RRHH','RRHH','Estrategia',NULL,'Likert_1_7',NULL,'Claridad del potencial de IA (RRHH)',40),
('RRHHDIR-7','Dirección de RRHH','RRHH','Inversión',NULL,'Likert_1_7',NULL,'Disposición a capacitarte en IA (12 meses)',41),
('RRHHDIR-8','Dirección de RRHH','RRHH','Estrategia',NULL,'Abierta',NULL,'¿Qué esperas lograr con IA en tu dirección de RRHH?',42),
('RRHHDIR-9','Dirección de RRHH','RRHH','Inversión',NULL,'MultiCheck',5,'¿Qué apoyo sería más valioso?',43)
ON CONFLICT (code) DO UPDATE SET
  perfil=EXCLUDED.perfil, area=EXCLUDED.area, dimension=EXCLUDED.dimension, subdomain=EXCLUDED.subdomain,
  qtype=EXCLUDED.qtype, max_options=EXCLUDED.max_options, content=EXCLUDED.content, order_num=EXCLUDED.order_num;

INSERT INTO public.question_options (question_id, opt_key, opt_text)
SELECT id, x.opt_key, x.opt_text
FROM public.questions_catalog q
JOIN (VALUES
 ('A','Taller práctico con el equipo'),
 ('B','Casos de uso en gestión de talento'),
 ('C','Herramientas para desempeño o reclutamiento'),
 ('D','Mentoría para directores de RRHH'),
 ('E','Otro')
) AS x(opt_key,opt_text) ON TRUE
WHERE q.code='RRHHDIR-9'
ON CONFLICT DO NOTHING;

-- =========================
-- Dirección / Jefatura de Contabilidad
-- =========================
INSERT INTO public.questions_catalog (code, perfil, area, dimension, subdomain, qtype, max_options, content, order_num)
VALUES
('CONTDIR-1','Dirección/Jefatura de Contabilidad','Contabilidad','Conocimiento',NULL,'Likert_1_7',NULL,'Conocimiento general sobre IA en contabilidad',10),
('CONTDIR-2a','Dirección/Jefatura de Contabilidad','Contabilidad','Conocimiento','Familiaridad','Likert_1_7',NULL,'OCR/IDP CFDI y pólizas',20),
('CONTDIR-2b','Dirección/Jefatura de Contabilidad','Contabilidad','Conocimiento','Familiaridad','Likert_1_7',NULL,'Conciliación bancaria y masiva',21),
('CONTDIR-2c','Dirección/Jefatura de Contabilidad','Contabilidad','Conocimiento','Familiaridad','Likert_1_7',NULL,'CxP/CxC (matching, validación CFDI, REP)',22),
('CONTDIR-2d','Dirección/Jefatura de Contabilidad','Contabilidad','Conocimiento','Familiaridad','Likert_1_7',NULL,'Cierre contable y provisiones',23),
('CONTDIR-2e','Dirección/Jefatura de Contabilidad','Contabilidad','Conocimiento','Familiaridad','Likert_1_7',NULL,'Impuestos y SAT (CFDI 4.0, DIOT)',24),
('CONTDIR-2f','Dirección/Jefatura de Contabilidad','Contabilidad','Conocimiento','Familiaridad','Likert_1_7',NULL,'Detección de anomalías y control interno',25),
('CONTDIR-2g','Dirección/Jefatura de Contabilidad','Contabilidad','Conocimiento','Familiaridad','Likert_1_7',NULL,'Integraciones ERP/iPaaS/RPA',26),
('CONTDIR-OP','Dirección/Jefatura de Contabilidad','Contabilidad','Conocimiento',NULL,'Abierta',NULL,'Flujo con mayor impacto en tiempo/exactitud',27),
('CONTDIR-3','Dirección/Jefatura de Contabilidad','Contabilidad','Aplicación','Captura','Likert_1_7',NULL,'Uso de IA para captura y clasificación contable',30),
('CONTDIR-4','Dirección/Jefatura de Contabilidad','Contabilidad','Aplicación','Conciliación','Likert_1_7',NULL,'Uso de IA para conciliaciones y CxP/CxC',31),
('CONTDIR-5','Dirección/Jefatura de Contabilidad','Contabilidad','Aplicación','Cierre','Likert_1_7',NULL,'Uso de IA para cierre contable',32),
('CONTDIR-6','Dirección/Jefatura de Contabilidad','Contabilidad','Aplicación','Impuestos','Likert_1_7',NULL,'Uso de IA para impuestos y cumplimiento SAT',33),
('CONTDIR-Case','Dirección/Jefatura de Contabilidad','Contabilidad','Aplicación',NULL,'Abierta',NULL,'Oportunidad para reducir retrabajos/errores',34),
('CONTDIR-7','Dirección/Jefatura de Contabilidad','Contabilidad','Estrategia',NULL,'Likert_1_7',NULL,'Claridad del potencial de IA en tu rol',40),
('CONTDIR-8','Dirección/Jefatura de Contabilidad','Contabilidad','Inversión',NULL,'Likert_1_7',NULL,'Disposición a capacitarte (12 meses)',41),
('CONTDIR-9','Dirección/Jefatura de Contabilidad','Contabilidad','Estrategia',NULL,'Abierta',NULL,'¿Qué esperas lograr con IA en contabilidad?',42),
('CONTDIR-10','Dirección/Jefatura de Contabilidad','Contabilidad','Inversión',NULL,'MultiCheck',5,'¿Qué apoyo sería más valioso?',43)
ON CONFLICT (code) DO UPDATE SET
  perfil=EXCLUDED.perfil, area=EXCLUDED.area, dimension=EXCLUDED.dimension, subdomain=EXCLUDED.subdomain,
  qtype=EXCLUDED.qtype, max_options=EXCLUDED.max_options, content=EXCLUDED.content, order_num=EXCLUDED.order_num;

INSERT INTO public.question_options (question_id, opt_key, opt_text)
SELECT id, x.opt_key, x.opt_text
FROM public.questions_catalog q
JOIN (VALUES
 ('A','Taller por procesos (captura, conciliación, cierre, impuestos)'),
 ('B','Plantillas y playbooks (checklists, validaciones CFDI/DIOT)'),
 ('C','Herramientas (OCR/IDP, conciliación, narrativas)'),
 ('D','Integraciones ERP/iPaaS/RPA'),
 ('E','Mentoría personalizada')
) AS x(opt_key,opt_text) ON TRUE
WHERE q.code='CONTDIR-10'
ON CONFLICT DO NOTHING;

-- =========================
-- Dirección de Compras / Supply
-- =========================
INSERT INTO public.questions_catalog (code, perfil, area, dimension, subdomain, qtype, max_options, content, order_num)
VALUES
('SUPDIR-1','Dirección de Compras / Supply','Compras/Supply','Conocimiento',NULL,'Likert_1_7',NULL,'Conocimiento general sobre IA en Compras/Supply',10),
('SUPDIR-2a','Dirección de Compras / Supply','Compras/Supply','Conocimiento','Familiaridad','Likert_1_7',NULL,'Pronóstico de demanda y S&OP',20),
('SUPDIR-2b','Dirección de Compras / Supply','Compras/Supply','Conocimiento','Familiaridad','Likert_1_7',NULL,'Optimización de inventarios',21),
('SUPDIR-2c','Dirección de Compras / Supply','Compras/Supply','Conocimiento','Familiaridad','Likert_1_7',NULL,'Sourcing y RFx asistido',22),
('SUPDIR-2d','Dirección de Compras / Supply','Compras/Supply','Conocimiento','Familiaridad','Likert_1_7',NULL,'Evaluación y riesgo de proveedores',23),
('SUPDIR-2e','Dirección de Compras / Supply','Compras/Supply','Conocimiento','Familiaridad','Likert_1_7',NULL,'Pricing y should-cost',24),
('SUPDIR-2f','Dirección de Compras / Supply','Compras/Supply','Conocimiento','Familiaridad','Likert_1_7',NULL,'Logística y transporte',25),
('SUPDIR-2g','Dirección de Compras / Supply','Compras/Supply','Conocimiento','Familiaridad','Likert_1_7',NULL,'Visibilidad end-to-end',26),
('SUPDIR-2h','Dirección de Compras / Supply','Compras/Supply','Conocimiento','Familiaridad','Likert_1_7',NULL,'Integraciones ERP/WMS/TMS con iPaaS/RPA',27),
('SUPDIR-OP','Dirección de Compras / Supply','Compras/Supply','Conocimiento',NULL,'Abierta',NULL,'Flujo con mayor impacto en costo/servicio/tiempo',28),
('SUPDIR-3','Dirección de Compras / Supply','Compras/Supply','Aplicación','Demanda','Likert_1_7',NULL,'Uso de IA para demanda y S&OP',30),
('SUPDIR-4','Dirección de Compras / Supply','Compras/Supply','Aplicación','Inventarios','Likert_1_7',NULL,'Uso de IA para optimizar inventarios',31),
('SUPDIR-5','Dirección de Compras / Supply','Compras/Supply','Aplicación','Pricing','Likert_1_7',NULL,'Uso de IA para pricing y should-cost',32),
('SUPDIR-C','Dirección de Compras / Supply','Compras/Supply','Aplicación',NULL,'Abierta',NULL,'Oportunidad para reducir quiebres/sobrestock',33),
('SUPDIR-6','Dirección de Compras / Supply','Compras/Supply','Estrategia',NULL,'Likert_1_7',NULL,'Claridad del potencial de IA en Compras/Supply',40),
('SUPDIR-7','Dirección de Compras / Supply','Compras/Supply','Inversión',NULL,'Likert_1_7',NULL,'Disposición a capacitarte en IA (12 meses)',41),
('SUPDIR-8','Dirección de Compras / Supply','Compras/Supply','Estrategia',NULL,'Abierta',NULL,'¿Qué esperas lograr con IA en Compras/Supply?',42),
('SUPDIR-9','Dirección de Compras / Supply','Compras/Supply','Inversión',NULL,'MultiCheck',6,'¿Qué apoyo sería más valioso?',43)
ON CONFLICT (code) DO UPDATE SET
  perfil=EXCLUDED.perfil, area=EXCLUDED.area, dimension=EXCLUDED.dimension, subdomain=EXCLUDED.subdomain,
  qtype=EXCLUDED.qtype, max_options=EXCLUDED.max_options, content=EXCLUDED.content, order_num=EXCLUDED.order_num;

INSERT INTO public.question_options (question_id, opt_key, opt_text)
SELECT id, x.opt_key, x.opt_text
FROM public.questions_catalog q
JOIN (VALUES
 ('A','Taller por categorías (sourcing, RFx, contratos)'),
 ('B','Casos por industria (CPG, retail, manufactura, salud)'),
 ('C','Herramientas listas (forecasting, inventarios, ruteo)'),
 ('D','Playbooks S&OP y tablero de valor'),
 ('E','Integraciones ERP/WMS/TMS (iPaaS/RPA)'),
 ('F','Mentoría personalizada')
) AS x(opt_key,opt_text) ON TRUE
WHERE q.code='SUPDIR-9'
ON CONFLICT DO NOTHING;

-- =========================
-- CTO/CIO (Dirección de Tecnología)
-- =========================
INSERT INTO public.questions_catalog (code, perfil, area, dimension, subdomain, qtype, max_options, content, order_num)
VALUES
('CTO-1','CTO/CIO','Tecnología/TI','Conocimiento',NULL,'Likert_1_7',NULL,'Conocimiento general sobre IA aplicada a TI',10),
('CTO-2a','CTO/CIO','Tecnología/TI','Conocimiento','Familiaridad','Likert_1_7',NULL,'LLMs para arquitectura y desarrollo (copilots, diseño)',20),
('CTO-2b','CTO/CIO','Tecnología/TI','Conocimiento','Familiaridad','Likert_1_7',NULL,'Automatización (RPA/iPaaS, orquestación, CI/CD)',21),
('CTO-2c','CTO/CIO','Tecnología/TI','Conocimiento','Familiaridad','Likert_1_7',NULL,'Integraciones y APIs (gateways, webhooks, conectores)',22),
('CTO-2d','CTO/CIO','Tecnología/TI','Conocimiento','Familiaridad','Likert_1_7',NULL,'MLOps/LLMOps (versionado, evaluación, guardrails)',23),
('CTO-2e','CTO/CIO','Tecnología/TI','Conocimiento','Familiaridad','Likert_1_7',NULL,'Gobierno de datos (catálogo, linaje, calidad)',24),
('CTO-2f','CTO/CIO','Tecnología/TI','Conocimiento','Familiaridad','Likert_1_7',NULL,'Seguridad/Privacidad (clasificación, DLP, acceso)',25),
('CTO-2g','CTO/CIO','Tecnología/TI','Conocimiento','Familiaridad','Likert_1_7',NULL,'Observabilidad y costos de IA (telemetría, FinOps IA)',26),
('CTO-OP','CTO/CIO','Tecnología/TI','Conocimiento',NULL,'Abierta',NULL,'Herramientas/ﬂujos con IA de mayor impacto',27),
('CTO-3','CTO/CIO','Tecnología/TI','Aplicación','Integraciones','Likert_1_7',NULL,'Uso de IA para diseñar/automatizar integraciones (ETL/ELT, iPaaS, APIs)',30),
('CTO-4','CTO/CIO','Tecnología/TI','Aplicación','Desarrollo','Likert_1_7',NULL,'Uso de IA para desarrollo y calidad (code review, pruebas, refactor)',31),
('CTO-5','CTO/CIO','Tecnología/TI','Aplicación','Soporte','Likert_1_7',NULL,'Uso de IA para soporte interno (ChatOps, KB, triage)',32),
('CTO-C','CTO/CIO','Tecnología/TI','Aplicación',NULL,'Abierta',NULL,'Caso en el que IA redujo tiempos/incidentes',33),
('CTO-6','CTO/CIO','Tecnología/TI','Aplicación','Gobierno de datos','Likert_1_7',NULL,'Madurez en gobierno de datos asistido por IA',34),
('CTO-7','CTO/CIO','Tecnología/TI','Aplicación','Seguridad','Likert_1_7',NULL,'Uso de IA en privacidad/seguridad (DLP, enmascarado, acceso)',35),
('CTO-8','CTO/CIO','Tecnología/TI','Aplicación','Riesgos IA','Likert_1_7',NULL,'Gestión de riesgos específicos de IA',36),
('CTO-RISK','CTO/CIO','Tecnología/TI','Aplicación',NULL,'Abierta',NULL,'Mayor riesgo de IA y cómo mitigarlo',37),
('CTO-9','CTO/CIO','Tecnología/TI','Estrategia',NULL,'Likert_1_7',NULL,'Claridad del roadmap de IA para TI',40),
('CTO-10','CTO/CIO','Tecnología/TI','Estrategia',NULL,'Likert_1_7',NULL,'Decisiones build vs. buy y gestión de vendors',41),
('CTO-11','CTO/CIO','Tecnología/TI','Aplicación','Habilitación','Likert_1_7',NULL,'Habilitación del equipo (playbooks, estándares, plataforma de IA)',42),
('CTO-12','CTO/CIO','Tecnología/TI','Aplicación','Valor/Costos','Likert_1_7',NULL,'Medición de valor y costos (ROI, FinOps IA)',43),
('CTO-13','CTO/CIO','Tecnología/TI','Inversión',NULL,'Likert_1_7',NULL,'Disposición a capacitarte en IA (12 meses)',44),
('CTO-SKILL','CTO/CIO','Tecnología/TI','Estrategia',NULL,'Abierta',NULL,'Habilidad prioritaria (LLMOps, evaluación, prompts, iPaaS, DFQ/linaje)',45),
('CTO-14','CTO/CIO','Tecnología/TI','Estrategia',NULL,'Abierta',NULL,'¿Qué esperas lograr con IA en tu dirección de TI?',46),
('CTO-15','CTO/CIO','Tecnología/TI','Inversión',NULL,'MultiCheck',7,'¿Qué apoyo sería más valioso?',47)
ON CONFLICT (code) DO UPDATE SET
  perfil=EXCLUDED.perfil, area=EXCLUDED.area, dimension=EXCLUDED.dimension, subdomain=EXCLUDED.subdomain,
  qtype=EXCLUDED.qtype, max_options=EXCLUDED.max_options, content=EXCLUDED.content, order_num=EXCLUDED.order_num;

INSERT INTO public.question_options (question_id, opt_key, opt_text)
SELECT id, x.opt_key, x.opt_text
FROM public.questions_catalog q
JOIN (VALUES
 ('A','Arquitectura de referencia y patrones'),
 ('B','Seguridad/privacidad y guardrails'),
 ('C','Gobierno de datos (catálogo, linaje, calidad)'),
 ('D','Casos priorizados y plan de valor'),
 ('E','Laboratorio de automatización/integraciones'),
 ('F','Programa de habilitación (bootcamps)'),
 ('G','Otro')
) AS x(opt_key,opt_text) ON TRUE
WHERE q.code='CTO-15'
ON CONFLICT DO NOTHING;

-- FIN PARTE 1


-- SEED P2: Miembros (Ventas, Marketing, Operaciones, Finanzas, RRHH, Contabilidad, Compras) + Gerencia Media
-- Idempotente por (code)

-- ===============
-- Miembros Ventas
-- ===============
INSERT INTO public.questions_catalog (code, perfil, area, dimension, subdomain, qtype, max_options, content, order_num)
VALUES
('VENTMEM-1','Miembros de Ventas','Ventas','Conocimiento',NULL,'Likert_1_7',NULL,'Conocimiento general sobre IA aplicada a ventas',10),
('VENTMEM-2a','Miembros de Ventas','Ventas','Conocimiento','Familiaridad','Likert_1_7',NULL,'LLMs para correos/mensajes de outreach',20),
('VENTMEM-2b','Miembros de Ventas','Ventas','Conocimiento','Familiaridad','Likert_1_7',NULL,'IA en CRM (seguimiento, scoring, recordatorios)',21),
('VENTMEM-2c','Miembros de Ventas','Ventas','Conocimiento','Familiaridad','Likert_1_7',NULL,'Enriquecimiento de prospectos (ICP fit, firmográficos)',22),
('VENTMEM-2d','Miembros de Ventas','Ventas','Conocimiento','Familiaridad','Likert_1_7',NULL,'Preparación de llamadas (guiones, objeciones, discovery)',23),
('VENTMEM-2e','Miembros de Ventas','Ventas','Conocimiento','Familiaridad','Likert_1_7',NULL,'Análisis/forecast de oportunidades',24),
('VENTMEM-2f','Miembros de Ventas','Ventas','Conocimiento','Familiaridad','Likert_1_7',NULL,'Resúmenes automáticos (reuniones, emails, notas)',25),
('VENTMEM-App','Miembros de Ventas','Ventas','Conocimiento',NULL,'Abierta',NULL,'App o flujo con IA con más resultados en ventas',26),
('VENTMEM-3','Miembros de Ventas','Ventas','Aplicación','Prospección','Likert_1_7',NULL,'Uso de IA para identificar y priorizar prospectos',30),
('VENTMEM-4','Miembros de Ventas','Ventas','Aplicación','Mensajes','Likert_1_7',NULL,'Uso de IA para personalizar mensajes de primer contacto',31),
('VENTMEM-Ex','Miembros de Ventas','Ventas','Aplicación',NULL,'Abierta',NULL,'Ejemplo de mensaje con IA que abrió una oportunidad',32),
('VENTMEM-5','Miembros de Ventas','Ventas','Aplicación','Reuniones','Likert_1_7',NULL,'Uso de IA para preparar reuniones (briefings, objeciones)',33),
('VENTMEM-6','Miembros de Ventas','Ventas','Aplicación','Propuestas','Likert_1_7',NULL,'Uso de IA para propuestas/casos de negocio',34),
('VENTMEM-7','Miembros de Ventas','Ventas','Aplicación','Seguimiento','Likert_1_7',NULL,'Uso de IA para seguimientos (resúmenes, next steps, recordatorios)',35),
('VENTMEM-8','Miembros de Ventas','Ventas','Aplicación','CRM','Likert_1_7',NULL,'Uso de IA para actualizar CRM y pipeline',36),
('VENTMEM-9','Miembros de Ventas','Ventas','Aplicación','Forecast','Likert_1_7',NULL,'Uso de IA para priorizar oportunidades y estimar forecast',37),
('VENTMEM-Need','Miembros de Ventas','Ventas','Aplicación',NULL,'Abierta',NULL,'Señal/dato que falta para priorizar mejor tu pipeline',38),
('VENTMEM-10','Miembros de Ventas','Ventas','Productividad','Resúmenes','Likert_1_7',NULL,'Uso de IA para resumir emails/reuniones y preparar seguimientos',39),
('VENTMEM-11','Miembros de Ventas','Ventas','Productividad','Agenda','Likert_1_7',NULL,'Uso de IA para coordinar agenda y reducir no-shows',40),
('VENTMEM-Task','Miembros de Ventas','Ventas','Aplicación',NULL,'Abierta',NULL,'Tarea repetitiva que te gustaría automatizar con IA',41),
('VENTMEM-12','Miembros de Ventas','Ventas','Inversión',NULL,'Likert_1_7',NULL,'Disposición a capacitarte en IA (12 meses)',42),
('VENTMEM-Barr','Miembros de Ventas','Ventas','Inversión',NULL,'MultiCheck',6,'Principales barreras personales',43),
('VENTMEM-Skill','Miembros de Ventas','Ventas','Estrategia',NULL,'Abierta',NULL,'Habilidad específica de IA a dominar primero',44),
('VENTMEM-Goal','Miembros de Ventas','Ventas','Estrategia',NULL,'Abierta',NULL,'En una frase, ¿qué esperas lograr aplicando IA en ventas?',45),
('VENTMEM-Help','Miembros de Ventas','Ventas','Inversión',NULL,'MultiCheck',5,'¿Qué apoyo sería más útil?',46)
ON CONFLICT (code) DO UPDATE SET
  perfil=EXCLUDED.perfil, area=EXCLUDED.area, dimension=EXCLUDED.dimension, subdomain=EXCLUDED.subdomain,
  qtype=EXCLUDED.qtype, max_options=EXCLUDED.max_options, content=EXCLUDED.content, order_num=EXCLUDED.order_num;

-- Opciones de barreras y apoyo
INSERT INTO public.question_options (question_id, opt_key, opt_text)
SELECT id, x.opt_key, x.opt_text FROM public.questions_catalog q
JOIN (VALUES
 ('A','Falta de tiempo'),('B','Falta de habilidades'),('C','Pocas herramientas'),('D','Dudas sobre precisión'),('E','Lineamientos internos'),('F','Otra')
) AS x(opt_key,opt_text) ON TRUE WHERE q.code='VENTMEM-Barr' ON CONFLICT DO NOTHING;

INSERT INTO public.question_options (question_id, opt_key, opt_text)
SELECT id, x.opt_key, x.opt_text FROM public.questions_catalog q
JOIN (VALUES
 ('A','Taller práctico'),('B','Casos y plantillas por industria'),('C','Herramientas listas (prospecting/cadencia)'),('D','Mentoría 1:1'),('E','Otro')
) AS x(opt_key,opt_text) ON TRUE WHERE q.code='VENTMEM-Help' ON CONFLICT DO NOTHING;

-- ===============
-- Miembros Marketing
-- ===============
INSERT INTO public.questions_catalog (code, perfil, area, dimension, subdomain, qtype, max_options, content, order_num)
VALUES
('MKTMEM-1','Miembros de Marketing','Marketing','Conocimiento',NULL,'Likert_1_7',NULL,'Conocimiento general sobre IA aplicada al marketing',10),
('MKTMEM-2a','Miembros de Marketing','Marketing','Conocimiento','Familiaridad','Likert_1_7',NULL,'LLMs para copywriting y creatividad',20),
('MKTMEM-2b','Miembros de Marketing','Marketing','Conocimiento','Familiaridad','Likert_1_7',NULL,'IA generativa para diseño visual',21),
('MKTMEM-2c','Miembros de Marketing','Marketing','Conocimiento','Familiaridad','Likert_1_7',NULL,'Optimización de campañas (Google/Meta/programática)',22),
('MKTMEM-2d','Miembros de Marketing','Marketing','Conocimiento','Familiaridad','Likert_1_7',NULL,'Segmentación y análisis predictivo de clientes',23),
('MKTMEM-2e','Miembros de Marketing','Marketing','Conocimiento','Familiaridad','Likert_1_7',NULL,'Personalización (emails, landing, chatbots)',24),
('MKTMEM-Tool','Miembros de Marketing','Marketing','Conocimiento',NULL,'Abierta',NULL,'Aplicación de IA más útil en marketing',25),
('MKTMEM-3','Miembros de Marketing','Marketing','Aplicación','Contenido','Likert_1_7',NULL,'Uso de IA para generar contenidos',30),
('MKTMEM-4','Miembros de Marketing','Marketing','Aplicación','ROI','Likert_1_7',NULL,'Uso de IA para optimizar campañas y mejorar ROI',31),
('MKTMEM-C','Miembros de Marketing','Marketing','Aplicación',NULL,'Abierta',NULL,'Caso en que la IA mejoró el rendimiento de una campaña',32),
('MKTMEM-5','Miembros de Marketing','Marketing','Aplicación','Clientes','Likert_1_7',NULL,'Uso de IA para analizar clientes',33),
('MKTMEM-6','Miembros de Marketing','Marketing','Aplicación','Personalización','Likert_1_7',NULL,'Uso de IA para personalización (emails, journeys)',34),
('MKTMEM-Aud','Miembros de Marketing','Marketing','Aplicación',NULL,'Abierta',NULL,'¿Cómo te ayudó la IA a comprender mejor a tu audiencia?',35),
('MKTMEM-7','Miembros de Marketing','Marketing','Estrategia',NULL,'Likert_1_7',NULL,'Claridad del potencial de IA en tu rol',40),
('MKTMEM-8','Miembros de Marketing','Marketing','Inversión',NULL,'Likert_1_7',NULL,'Disposición a capacitarte en IA (12 meses)',41),
('MKTMEM-Skill','Miembros de Marketing','Marketing','Estrategia',NULL,'Abierta',NULL,'Habilidad de IA a aprender primero',42),
('MKTMEM-Goal','Miembros de Marketing','Marketing','Estrategia',NULL,'Abierta',NULL,'¿Qué esperas lograr con IA en marketing?',43),
('MKTMEM-Help','Miembros de Marketing','Marketing','Inversión',NULL,'MultiCheck',5,'¿Qué apoyo sería más valioso?',44)
ON CONFLICT (code) DO UPDATE SET
  perfil=EXCLUDED.perfil, area=EXCLUDED.area, dimension=EXCLUDED.dimension, subdomain=EXCLUDED.subdomain,
  qtype=EXCLUDED.qtype, max_options=EXCLUDED.max_options, content=EXCLUDED.content, order_num=EXCLUDED.order_num;

INSERT INTO public.question_options (question_id, opt_key, opt_text)
SELECT id, x.opt_key, x.opt_text FROM public.questions_catalog q
JOIN (VALUES
 ('A','Taller práctico'),('B','Casos aplicados a marketing digital'),('C','Herramientas listas para campañas y contenidos'),('D','Mentoría personalizada'),('E','Otro')
) AS x(opt_key,opt_text) ON TRUE WHERE q.code='MKTMEM-Help' ON CONFLICT DO NOTHING;

-- ===============
-- Miembros Operaciones
-- ===============
INSERT INTO public.questions_catalog (code, perfil, area, dimension, subdomain, qtype, max_options, content, order_num)
VALUES
('OPSMEM-1','Miembros de Operaciones','Operaciones','Conocimiento',NULL,'Likert_1_7',NULL,'Conocimiento general sobre IA en operaciones y procesos',10),
('OPSMEM-2a','Miembros de Operaciones','Operaciones','Conocimiento','Familiaridad','Likert_1_7',NULL,'Organización personal y gestión de tareas',20),
('OPSMEM-2b','Miembros de Operaciones','Operaciones','Conocimiento','Familiaridad','Likert_1_7',NULL,'Optimización de procesos internos (automatizaciones)',21),
('OPSMEM-2c','Miembros de Operaciones','Operaciones','Conocimiento','Familiaridad','Likert_1_7',NULL,'Análisis predictivo de tiempos, costos o riesgos',22),
('OPSMEM-2d','Miembros de Operaciones','Operaciones','Conocimiento','Familiaridad','Likert_1_7',NULL,'Gestión de proyectos (seguimiento/reportes)',23),
('OPSMEM-2e','Miembros de Operaciones','Operaciones','Conocimiento','Familiaridad','Likert_1_7',NULL,'Soporte en logística y cadena de suministro',24),
('OPSMEM-Tool','Miembros de Operaciones','Operaciones','Conocimiento',NULL,'Abierta',NULL,'Aplicación de IA que ahorró más tiempo o errores',25),
('OPSMEM-3','Miembros de Operaciones','Operaciones','Aplicación','Tareas','Likert_1_7',NULL,'Uso de IA para organizar y priorizar tareas diarias',30),
('OPSMEM-4','Miembros de Operaciones','Operaciones','Aplicación','Procesos','Likert_1_7',NULL,'Uso de IA para optimizar procesos/tareas repetitivas',31),
('OPSMEM-5','Miembros de Operaciones','Operaciones','Aplicación','Datos','Likert_1_7',NULL,'Uso de IA para análisis de datos y proyecciones operativas',32),
('OPSMEM-Case','Miembros de Operaciones','Operaciones','Aplicación',NULL,'Abierta',NULL,'Ejemplo: IA detectó problema o mejoró proceso',33),
('OPSMEM-6','Miembros de Operaciones','Operaciones','Estrategia',NULL,'Likert_1_7',NULL,'Claridad del potencial de la IA en tu rol',34),
('OPSMEM-7','Miembros de Operaciones','Operaciones','Inversión',NULL,'Likert_1_7',NULL,'Disposición a capacitarte en IA (12 meses)',35),
('OPSMEM-Learn','Miembros de Operaciones','Operaciones','Estrategia',NULL,'Abierta',NULL,'Habilidad de IA a aprender para tu productividad/equipo',36),
('OPSMEM-Goal','Miembros de Operaciones','Operaciones','Estrategia',NULL,'Abierta',NULL,'¿Qué esperas lograr con IA en operaciones?',37),
('OPSMEM-Help','Miembros de Operaciones','Operaciones','Inversión',NULL,'MultiCheck',4,'¿Qué apoyo sería más valioso?',38)
ON CONFLICT (code) DO UPDATE SET
  perfil=EXCLUDED.perfil, area=EXCLUDED.area, dimension=EXCLUDED.dimension, subdomain=EXCLUDED.subdomain,
  qtype=EXCLUDED.qtype, max_options=EXCLUDED.max_options, content=EXCLUDED.content, order_num=EXCLUDED.order_num;

INSERT INTO public.question_options (question_id, opt_key, opt_text)
SELECT id, x.opt_key, x.opt_text FROM public.questions_catalog q
JOIN (VALUES
 ('A','Taller práctico'),('B','Casos de procesos internos'),('C','Herramientas para gestión de proyectos'),('D','Mentoría personalizada')
) AS x(opt_key,opt_text) ON TRUE WHERE q.code='OPSMEM-Help' ON CONFLICT DO NOTHING;

-- ===============
-- Miembros Finanzas
-- ===============
INSERT INTO public.questions_catalog (code, perfil, area, dimension, subdomain, qtype, max_options, content, order_num)
VALUES
('FINMEM-1','Miembros de Finanzas','Finanzas','Conocimiento',NULL,'Likert_1_7',NULL,'Conocimiento general sobre IA aplicada a finanzas',10),
('FINMEM-2a','Miembros de Finanzas','Finanzas','Conocimiento','Familiaridad','Likert_1_7',NULL,'Automatización de reportes financieros/contables',20),
('FINMEM-2b','Miembros de Finanzas','Finanzas','Conocimiento','Familiaridad','Likert_1_7',NULL,'Análisis predictivo de ingresos, costos y flujo',21),
('FINMEM-2c','Miembros de Finanzas','Finanzas','Conocimiento','Familiaridad','Likert_1_7',NULL,'Detección de riesgos o anomalías',22),
('FINMEM-2d','Miembros de Finanzas','Finanzas','Conocimiento','Familiaridad','Likert_1_7',NULL,'Optimización de presupuestos y escenarios',23),
('FINMEM-2e','Miembros de Finanzas','Finanzas','Conocimiento','Familiaridad','Likert_1_7',NULL,'Presentaciones y dashboards financieros',24),
('FINMEM-Impact','Miembros de Finanzas','Finanzas','Conocimiento',NULL,'Abierta',NULL,'App IA que más tiempo ahorra o mejora precisión',25),
('FINMEM-3','Miembros de Finanzas','Finanzas','Aplicación','Reportes','Likert_1_7',NULL,'Uso de IA para generar/revisar reportes financieros',30),
('FINMEM-4','Miembros de Finanzas','Finanzas','Aplicación','Proyecciones','Likert_1_7',NULL,'Uso de IA para análisis predictivo/proyecciones',31),
('FINMEM-5','Miembros de Finanzas','Finanzas','Aplicación','Riesgos','Likert_1_7',NULL,'Uso de IA para detección de riesgos/fraudes/errores',32),
('FINMEM-Risk','Miembros de Finanzas','Finanzas','Aplicación',NULL,'Abierta',NULL,'Cómo IA podría mejorar el control de riesgos',33),
('FINMEM-6','Miembros de Finanzas','Finanzas','Estrategia',NULL,'Likert_1_7',NULL,'Claridad del potencial de IA en tu rol financiero',40),
('FINMEM-7','Miembros de Finanzas','Finanzas','Inversión',NULL,'Likert_1_7',NULL,'Disposición a capacitarte en IA (12 meses)',41),
('FINMEM-Skill','Miembros de Finanzas','Finanzas','Estrategia',NULL,'Abierta',NULL,'Habilidad IA prioritaria para tu productividad',42),
('FINMEM-Goal','Miembros de Finanzas','Finanzas','Estrategia',NULL,'Abierta',NULL,'¿Qué esperas lograr con IA en finanzas?',43),
('FINMEM-Help','Miembros de Finanzas','Finanzas','Inversión',NULL,'MultiCheck',5,'¿Qué apoyo sería más valioso?',44)
ON CONFLICT (code) DO UPDATE SET
  perfil=EXCLUDED.perfil, area=EXCLUDED.area, dimension=EXCLUDED.dimension, subdomain=EXCLUDED.subdomain,
  qtype=EXCLUDED.qtype, max_options=EXCLUDED.max_options, content=EXCLUDED.content, order_num=EXCLUDED.order_num;

INSERT INTO public.question_options (question_id, opt_key, opt_text)
SELECT id, x.opt_key, x.opt_text FROM public.questions_catalog q
JOIN (VALUES
 ('A','Taller práctico'),('B','Casos de uso en finanzas'),('C','Herramientas para automatizar reportes'),('D','Mentoría personalizada'),('E','Otro')
) AS x(opt_key,opt_text) ON TRUE WHERE q.code='FINMEM-Help' ON CONFLICT DO NOTHING;

-- ===============
-- Miembros RRHH
-- ===============
INSERT INTO public.questions_catalog (code, perfil, area, dimension, subdomain, qtype, max_options, content, order_num)
VALUES
('RRHHMEM-1','Miembros de RRHH','RRHH','Conocimiento',NULL,'Likert_1_7',NULL,'Conocimiento general sobre IA en RRHH',10),
('RRHHMEM-2','Miembros de RRHH','RRHH','Conocimiento','Reclutamiento','Likert_1_7',NULL,'Uso de IA en búsqueda/selección (CV, entrevistas)',20),
('RRHHMEM-3','Miembros de RRHH','RRHH','Conocimiento','Capacitación','Likert_1_7',NULL,'Uso de IA en diseño/recomendación de cursos',21),
('RRHHMEM-4','Miembros de RRHH','RRHH','Conocimiento','Nómina','Likert_1_7',NULL,'Uso de IA en procesos administrativos',22),
('RRHHMEM-5','Miembros de RRHH','RRHH','Conocimiento','Clima','Likert_1_7',NULL,'Uso de IA en encuestas/análisis de feedback',23),
('RRHHMEM-Time','Miembros de RRHH','RRHH','Conocimiento',NULL,'Abierta',NULL,'¿En qué parte la IA te ayudaría más a ahorrar tiempo?',24),
('RRHHMEM-6','Miembros de RRHH','RRHH','Inversión',NULL,'Likert_1_7',NULL,'Disposición a capacitarte en IA (12 meses)',30),
('RRHHMEM-7','Miembros de RRHH','RRHH','Estrategia',NULL,'Abierta',NULL,'¿Qué esperas lograr aplicando IA en RRHH?',31),
('RRHHMEM-8','Miembros de RRHH','RRHH','Inversión',NULL,'MultiCheck',5,'¿Qué apoyo sería más útil?',32)
ON CONFLICT (code) DO UPDATE SET
  perfil=EXCLUDED.perfil, area=EXCLUDED.area, dimension=EXCLUDED.dimension, subdomain=EXCLUDED.subdomain,
  qtype=EXCLUDED.qtype, max_options=EXCLUDED.max_options, content=EXCLUDED.content, order_num=EXCLUDED.order_num;

INSERT INTO public.question_options (question_id, opt_key, opt_text)
SELECT id, x.opt_key, x.opt_text FROM public.questions_catalog q
JOIN (VALUES
 ('A','Talleres prácticos cortos'),('B','Casos de reclutamiento/capacitación/nómina'),('C','Herramientas listas para usar'),('D','Mentoría en el puesto'),('E','Otro')
) AS x(opt_key,opt_text) ON TRUE WHERE q.code='RRHHMEM-8' ON CONFLICT DO NOTHING;

-- ===============
-- Miembros Contabilidad
-- ===============
INSERT INTO public.questions_catalog (code, perfil, area, dimension, subdomain, qtype, max_options, content, order_num)
VALUES
('CONTMEM-1','Miembros de Contabilidad','Contabilidad','Conocimiento',NULL,'Likert_1_7',NULL,'Conocimiento general sobre IA en contabilidad',10),
('CONTMEM-2a','Miembros de Contabilidad','Contabilidad','Conocimiento','Familiaridad','Likert_1_7',NULL,'OCR/IDP para CFDI, pólizas y comprobantes',20),
('CONTMEM-2b','Miembros de Contabilidad','Contabilidad','Conocimiento','Familiaridad','Likert_1_7',NULL,'Conciliación bancaria asistida por IA',21),
('CONTMEM-2c','Miembros de Contabilidad','Contabilidad','Conocimiento','Familiaridad','Likert_1_7',NULL,'CxP/CxC (matching, validación CFDI y REP)',22),
('CONTMEM-2d','Miembros de Contabilidad','Contabilidad','Conocimiento','Familiaridad','Likert_1_7',NULL,'Apoyo al cierre (provisiones, saldos, aging)',23),
('CONTMEM-2e','Miembros de Contabilidad','Contabilidad','Conocimiento','Familiaridad','Likert_1_7',NULL,'Impuestos y SAT (CFDI 4.0, DIOT, timbrado)',24),
('CONTMEM-2f','Miembros de Contabilidad','Contabilidad','Conocimiento','Familiaridad','Likert_1_7',NULL,'Detección de anomalías (errores, fraudes, duplicidades)',25),
('CONTMEM-2g','Miembros de Contabilidad','Contabilidad','Conocimiento','Familiaridad','Likert_1_7',NULL,'Integraciones ERP/iPaaS/RPA',26),
('CONTMEM-Tool','Miembros de Contabilidad','Contabilidad','Conocimiento',NULL,'Abierta',NULL,'Herramienta/flujo IA que más tiempo ahorra',27),
('CONTMEM-3','Miembros de Contabilidad','Contabilidad','Aplicación','Captura','Likert_1_7',NULL,'Captura y clasificación (CFDI, pólizas, gastos)',30),
('CONTMEM-4','Miembros de Contabilidad','Contabilidad','Aplicación','Conciliación','Likert_1_7',NULL,'Conciliación bancaria y gestión CxP/CxC',31),
('CONTMEM-5','Miembros de Contabilidad','Contabilidad','Aplicación','Cierre','Likert_1_7',NULL,'Cierre contable (provisiones, checklists, revisiones)',32),
('CONTMEM-6','Miembros de Contabilidad','Contabilidad','Aplicación','Impuestos','Likert_1_7',NULL,'Impuestos y cumplimiento SAT',33),
('CONTMEM-Part','Miembros de Contabilidad','Contabilidad','Aplicación',NULL,'Abierta',NULL,'¿En qué parte la IA te ayudaría más (captura, conciliación, cierre o impuestos)?',34),
('CONTMEM-7','Miembros de Contabilidad','Contabilidad','Aplicación','Reportes','Likert_1_7',NULL,'Reportes/narrativas (variaciones, paquetes de gestión)',35),
('CONTMEM-8','Miembros de Contabilidad','Contabilidad','Aplicación','Calidad','Likert_1_7',NULL,'Calidad/estandarización (plantillas, checklists, validaciones)',36),
('CONTMEM-9','Miembros de Contabilidad','Contabilidad','Productividad','Personal','Likert_1_7',NULL,'Productividad personal (resúmenes, organización, seguimiento)',37),
('CONTMEM-Need','Miembros de Contabilidad','Contabilidad','Aplicación',NULL,'Abierta',NULL,'Dato o integración que falta para mejorar reportes/productividad',38),
('CONTMEM-10','Miembros de Contabilidad','Contabilidad','Inversión',NULL,'Likert_1_7',NULL,'Disposición a capacitarte en IA (12 meses)',39),
('CONTMEM-11','Miembros de Contabilidad','Contabilidad','Inversión',NULL,'MultiCheck',7,'Principales barreras',40),
('CONTMEM-12','Miembros de Contabilidad','Contabilidad','Inversión',NULL,'MultiCheck',6,'Habilidad prioritaria a desarrollar',41),
('CONTMEM-Why','Miembros de Contabilidad','Contabilidad','Estrategia',NULL,'Abierta',NULL,'Describe qué quieres lograr al dominar esa habilidad',42),
('CONTMEM-Goal','Miembros de Contabilidad','Contabilidad','Estrategia',NULL,'Abierta',NULL,'¿Qué esperas lograr aplicando IA en tu rol?',43)
ON CONFLICT (code) DO UPDATE SET
  perfil=EXCLUDED.perfil, area=EXCLUDED.area, dimension=EXCLUDED.dimension, subdomain=EXCLUDED.subdomain,
  qtype=EXCLUDED.qtype, max_options=EXCLUDED.max_options, content=EXCLUDED.content, order_num=EXCLUDED.order_num;

INSERT INTO public.question_options (question_id, opt_key, opt_text)
SELECT id, x.opt_key, x.opt_text FROM public.questions_catalog q
JOIN (VALUES
 ('A','Falta de tiempo'),('B','Falta de habilidades'),('C','Falta de herramientas'),('D','Lineamientos internos'),('E','Dudas sobre precisión/errores'),('F','Integración con ERP'),('G','Otra')
) AS x(opt_key,opt_text) ON TRUE WHERE q.code='CONTMEM-11' ON CONFLICT DO NOTHING;

INSERT INTO public.question_options (question_id, opt_key, opt_text)
SELECT id, x.opt_key, x.opt_text FROM public.questions_catalog q
JOIN (VALUES
 ('A','OCR/IDP para CFDI y comprobantes'),('B','Conciliación con IA'),('C','Automatización con ERP/iPaaS/RPA'),('D','Validación CFDI/DIOT/SAT'),('E','Detección de anomalías'),('F','Otra')
) AS x(opt_key,opt_text) ON TRUE WHERE q.code='CONTMEM-12' ON CONFLICT DO NOTHING;

-- ===============
-- Miembros Compras / Procurement
-- ===============
INSERT INTO public.questions_catalog (code, perfil, area, dimension, subdomain, qtype, max_options, content, order_num)
VALUES
('SUPMEM-1','Miembros de Compras','Compras/Supply','Conocimiento',NULL,'Likert_1_7',NULL,'Conocimiento general sobre IA en compras',10),
('SUPMEM-2a','Miembros de Compras','Compras/Supply','Conocimiento','Familiaridad','Likert_1_7',NULL,'Sourcing asistido (búsqueda/pre-calificación de proveedores)',20),%
('SUPMEM-2b','Miembros de Compras','Compras/Supply','Conocimiento','Familiaridad','Likert_1_7',NULL,'RFx (requerimientos, criterios, scoring)',21),
('SUPMEM-2c','Miembros de Compras','Compras/Supply','Conocimiento','Familiaridad','Likert_1_7',NULL,'Riesgo y desempeño de proveedores (scorecards, ESG)',22),
('SUPMEM-2d','Miembros de Compras','Compras/Supply','Conocimiento','Familiaridad','Likert_1_7',NULL,'Should-cost / TCO (simulación de costos, escenarios)',23),
('SUPMEM-2e','Miembros de Compras','Compras/Supply','Conocimiento','Familiaridad','Likert_1_7',NULL,'Órdenes de compra y MRP (priorización, reposición)',24),
('SUPMEM-2f','Miembros de Compras','Compras/Supply','Conocimiento','Familiaridad','Likert_1_7',NULL,'Spend analytics (categorización, maverick buying)',25),
('SUPMEM-2g','Miembros de Compras','Compras/Supply','Conocimiento','Familiaridad','Likert_1_7',NULL,'Integraciones ERP/iPaaS/RPA',26),
('SUPMEM-Impact','Miembros de Compras','Compras/Supply','Conocimiento',NULL,'Abierta',NULL,'Herramienta/flujo IA con más impacto en tiempo/costo/calidad',27),
('SUPMEM-3','Miembros de Compras','Compras/Supply','Aplicación','Sourcing','Likert_1_7',NULL,'Uso de IA para identificar y priorizar proveedores',30),
('SUPMEM-4','Miembros de Compras','Compras/Supply','Aplicación','RFx','Likert_1_7',NULL,'Uso de IA para preparar/evaluar RFx',31),
('SUPMEM-Case','Miembros de Compras','Compras/Supply','Aplicación',NULL,'Abierta',NULL,'Caso: IA mejoró tiempos/calidad en un RFx',32),
('SUPMEM-5','Miembros de Compras','Compras/Supply','Aplicación','Proveedores','Likert_1_7',NULL,'Uso de IA para evaluación/seguimiento de proveedores',33),
('SUPMEM-6','Miembros de Compras','Compras/Supply','Aplicación','Costos','Likert_1_7',NULL,'Uso de IA para negociación y análisis de costos',34),
('SUPMEM-7','Miembros de Compras','Compras/Supply','Aplicación','Contratos','Likert_1_7',NULL,'Uso de IA para gestión contractual',35),
('SUPMEM-8','Miembros de Compras','Compras/Supply','Aplicación','Órdenes','Likert_1_7',NULL,'Uso de IA para generar/priorizar órdenes (MRP, reposición)',36),
('SUPMEM-9','Miembros de Compras','Compras/Supply','Aplicación','Logística','Likert_1_7',NULL,'Uso de IA para coordinar con logística/almacén',37),
('SUPMEM-10','Miembros de Compras','Compras/Supply','Aplicación','Gasto','Likert_1_7',NULL,'Uso de IA para análisis de gasto (spend), categorización y compras fuera de política',38),
('SUPMEM-Need','Miembros de Compras','Compras/Supply','Aplicación',NULL,'Abierta',NULL,'Dato o integración que falta para decidir mejor',39),
('SUPMEM-11','Miembros de Compras','Compras/Supply','Estrategia',NULL,'Likert_1_7',NULL,'Claridad del potencial de IA en tu rol',40),
('SUPMEM-12','Miembros de Compras','Compras/Supply','Inversión',NULL,'Likert_1_7',NULL,'Disposición a capacitarte en IA (12 meses)',41),
('SUPMEM-Skill','Miembros de Compras','Compras/Supply','Estrategia',NULL,'Abierta',NULL,'Habilidad prioritaria (RFx, should-cost/TCO, spend, iPaaS/RPA)',42),
('SUPMEM-Goal','Miembros de Compras','Compras/Supply','Estrategia',NULL,'Abierta',NULL,'¿Qué esperas lograr aplicando IA en compras?',43)
ON CONFLICT (code) DO UPDATE SET
  perfil=EXCLUDED.perfil, area=EXCLUDED.area, dimension=EXCLUDED.dimension, subdomain=EXCLUDED.subdomain,
  qtype=EXCLUDED.qtype, max_options=EXCLUDED.max_options, content=EXCLUDED.content, order_num=EXCLUDED.order_num;

-- ===============
-- Gerencia Media (Transversal)
-- ===============
INSERT INTO public.questions_catalog (code, perfil, area, dimension, subdomain, qtype, max_options, content, order_num)
VALUES
('GER-1','Gerencia Media','Otra','Conocimiento',NULL,'Likert_1_7',NULL,'Conocimiento general sobre IA en tu rol de gerencia',10),
('GER-2a','Gerencia Media','Otra','Conocimiento','Familiaridad','Likert_1_7',NULL,'Productividad personal (resúmenes, organización, seguimiento)',20),
('GER-2b','Gerencia Media','Otra','Conocimiento','Familiaridad','Likert_1_7',NULL,'Análisis de datos para decisiones del equipo',21),
('GER-2c','Gerencia Media','Otra','Conocimiento','Familiaridad','Likert_1_7',NULL,'Automatización de tareas repetitivas del área',22),
('GER-2d','Gerencia Media','Otra','Conocimiento','Familiaridad','Likert_1_7',NULL,'Comunicación con el equipo (briefings, mensajes)',23),
('GER-2e','Gerencia Media','Otra','Conocimiento','Familiaridad','Likert_1_7',NULL,'Planificación y seguimiento de proyectos',24),
('GER-Process','Gerencia Media','Otra','Conocimiento',NULL,'Abierta',NULL,'Proceso del equipo a automatizar con IA',25),
('GER-3','Gerencia Media','Otra','Aplicación','Operación','Likert_1_7',NULL,'Uso de IA en la operación de tu equipo (reuniones, reportes, tareas)',30),
('GER-4','Gerencia Media','Otra','Estrategia',NULL,'Likert_1_7',NULL,'Claridad del potencial de IA en tu rol de gerencia',31),
('GER-5','Gerencia Media','Otra','Inversión',NULL,'Likert_1_7',NULL,'Disposición a capacitarte en IA (12 meses)',32),
('GER-Goal','Gerencia Media','Otra','Estrategia',NULL,'Abierta',NULL,'¿Qué esperas lograr aplicando IA en tu gerencia?',33),
('GER-Help','Gerencia Media','Otra','Inversión',NULL,'MultiCheck',4,'¿Qué apoyo sería más valioso?',34)
ON CONFLICT (code) DO UPDATE SET
  perfil=EXCLUDED.perfil, area=EXCLUDED.area, dimension=EXCLUDED.dimension, subdomain=EXCLUDED.subdomain,
  qtype=EXCLUDED.qtype, max_options=EXCLUDED.max_options, content=EXCLUDED.content, order_num=EXCLUDED.order_num;

INSERT INTO public.question_options (question_id, opt_key, opt_text)
SELECT id, x.opt_key, x.opt_text FROM public.questions_catalog q
JOIN (VALUES
 ('A','Taller práctico para el equipo'),('B','Casos y plantillas por área'),('C','Herramientas listas para flujos clave'),('D','Mentoría del líder')
) AS x(opt_key,opt_text) ON TRUE WHERE q.code='GER-Help' ON CONFLICT DO NOTHING;

-- FIN PARTE 2


-- SEED P3: Consultor y Freelancer + opciones
-- Idempotente por (code)

-- ===============
-- Consultor / Asesor Externo
-- ===============
INSERT INTO public.questions_catalog (code, perfil, area, dimension, subdomain, qtype, max_options, content, order_num)
VALUES
('CONS-1','Consultor','Otra','Conocimiento',NULL,'Likert_1_7',NULL,'Conocimiento general sobre IA aplicada a consultoría',10),
('CONS-2','Consultor','Otra','Conocimiento','Diagnóstico','Likert_1_7',NULL,'Uso de IA en recopilación/procesamiento de datos',20),
('CONS-3','Consultor','Otra','Conocimiento','Propuestas','Likert_1_7',NULL,'Uso de IA en presentaciones/informes/modelos',21),
('CONS-4','Consultor','Otra','Conocimiento','Implementación','Likert_1_7',NULL,'Uso de IA en automatización/dashboards/procesos',22),
('CONS-Future','Consultor','Otra','Conocimiento',NULL,'Abierta',NULL,'Soluciones con IA que tus clientes implementarían pronto',23),
('CONS-5','Consultor','Otra','Inversión',NULL,'Likert_1_7',NULL,'Disposición a capacitarte en IA (12 meses)',30),
('CONS-Goal','Consultor','Otra','Estrategia',NULL,'Abierta',NULL,'¿Qué esperas lograr con IA como consultor/asesor?',31),
('CONS-Help','Consultor','Otra','Inversión',NULL,'MultiCheck',4,'¿Qué apoyo sería más valioso?',32)
ON CONFLICT (code) DO UPDATE SET
  perfil=EXCLUDED.perfil, area=EXCLUDED.area, dimension=EXCLUDED.dimension, subdomain=EXCLUDED.subdomain,
  qtype=EXCLUDED.qtype, max_options=EXCLUDED.max_options, content=EXCLUDED.content, order_num=EXCLUDED.order_num;

INSERT INTO public.question_options (question_id, opt_key, opt_text)
SELECT id, x.opt_key, x.opt_text FROM public.questions_catalog q
JOIN (VALUES
 ('A','Talleres con ejemplos de clientes'),('B','Casos de estudio sectoriales'),('C','Herramientas listas para proyectos'),('D','Mentoría especializada en IA')
) AS x(opt_key,opt_text) ON TRUE WHERE q.code='CONS-Help' ON CONFLICT DO NOTHING;

-- ===============
-- Freelancer / Independiente
-- ===============
INSERT INTO public.questions_catalog (code, perfil, area, dimension, subdomain, qtype, max_options, content, order_num)
VALUES
('FREEL-1','Freelancer','Otra','Conocimiento',NULL,'Likert_1_7',NULL,'Conocimiento general sobre IA aplicada a tu trabajo como freelancer',10),
('FREEL-2','Freelancer','Otra','Conocimiento','Productividad','Likert_1_7',NULL,'Uso de IA en organización/automatización',20),
('FREEL-3','Freelancer','Otra','Conocimiento','Clientes','Likert_1_7',NULL,'Uso de IA en prospección/marketing personal',21),
('FREEL-4','Freelancer','Otra','Conocimiento','Calidad','Likert_1_7',NULL,'IA en investigación/contenido/mejoras de entregables',22),
('FREEL-Deliver','Freelancer','Otra','Conocimiento',NULL,'Abierta',NULL,'Entregable que te gustaría mejorar con apoyo de IA',23),
('FREEL-5','Freelancer','Otra','Inversión',NULL,'Likert_1_7',NULL,'Disposición a capacitarte en IA (12 meses)',30),
('FREEL-Goal','Freelancer','Otra','Estrategia',NULL,'Abierta',NULL,'¿Qué esperas lograr con IA como freelancer?',31),
('FREEL-Help','Freelancer','Otra','Inversión',NULL,'MultiCheck',4,'¿Qué apoyo sería más valioso?',32)
ON CONFLICT (code) DO UPDATE SET
  perfil=EXCLUDED.perfil, area=EXCLUDED.area, dimension=EXCLUDED.dimension, subdomain=EXCLUDED.subdomain,
  qtype=EXCLUDED.qtype, max_options=EXCLUDED.max_options, content=EXCLUDED.content, order_num=EXCLUDED.order_num;

INSERT INTO public.question_options (question_id, opt_key, opt_text)
SELECT id, x.opt_key, x.opt_text FROM public.questions_catalog q
JOIN (VALUES
 ('A','Talleres prácticos aplicados'),('B','Casos reales en tu industria'),('C','Plantillas/herramientas listas'),('D','Mentoría personalizada')
) AS x(opt_key,opt_text) ON TRUE WHERE q.code='FREEL-Help' ON CONFLICT DO NOTHING;

-- FIN PARTE 3


