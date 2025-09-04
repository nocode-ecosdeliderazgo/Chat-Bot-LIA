/**
 * CONTENIDO COMPLETO DEL CURSO "APRENDE Y APLICA IA®"
 * Programa de Capacitación para SIF ICAP
 * 
 * Este archivo contiene toda la información del curso para que LIA pueda responder
 * específicamente sobre el contenido del curso y no solo sobre IA general.
 */

const COURSE_CONTENT = {
  // ===== INFORMACIÓN GENERAL DEL CURSO =====
  courseInfo: {
    title: "APRENDE Y APLICA IA®",
    subtitle: "Programa de Capacitación para SIF ICAP",
    description: "Transformación estratégica para el sector financiero: potencia tu ventaja competitiva con inteligencia artificial aplicada al negocio.",
    target: "SIF ICAP y el Grupo BMV",
    focus: "Aplicación práctica de tecnologías de inteligencia artificial dentro del sector financiero mexicano y latinoamericano",
    methodology: "Orientada a resultados inmediatos mediante quick wins implementados en entornos sandbox y pilotos controlados",
    compliance: "Alineado con marcos regulatorios: CNBV, Ley del Mercado de Valores (LMV), GDPR, Ley General de Protección de Datos (LGPD)"
  },

  // ===== OBJETIVOS GENERALES =====
  objectives: {
    general: "Transformación Digital Estratégica",
    specific: [
      {
        title: "Diseño e Implementación Integral",
        description: "Desarrollar e implementar un programa completo de inteligencia artificial adaptado a las necesidades específicas de SIF ICAP, con metodologías progresivas que aseguren adopción sostenible y medible."
      },
      {
        title: "Optimización Operativa",
        description: "Potenciar las capacidades de corretaje y mejorar la eficiencia operativa mediante el uso estratégico de tecnologías de IA, reduciendo tiempos de procesamiento e incrementando precisión analítica."
      },
      {
        title: "Gobierno y Cumplimiento",
        description: "Fortalecer los marcos de gobierno corporativo y cumplimiento organizacional, implementando soluciones de IA que operen dentro de los parámetros regulatorios del sector financiero mexicano."
      }
    ]
  },

  // ===== CONTEXTO Y DIAGNÓSTICO =====
  context: {
    currentSituation: {
      operations: "SIF ICAP gestiona volúmenes significativos en operaciones de renta fija y derivados",
      requirements: "Exige capacidades analíticas avanzadas para mantener competitividad en un mercado cada vez más digitalizado",
      needs: "Operadores requieren herramientas que proporcionen velocidad y precisión analítica para tomar decisiones informadas en tiempo real",
      challenges: [
        "Procesamiento manual de grandes volúmenes de información",
        "Detección tardía de anomalías en operaciones",
        "Tiempos extendidos en análisis contractual",
        "Generación manual de reportes regulatorios"
      ],
      dataHandling: "Manejo de información altamente sensible y necesidad de mantener estrictos controles regulatorios",
      automation: "Baja automatización actual en procesos críticos como análisis de contratos, monitoreo de operaciones y generación de reportes regulatorios"
    }
  },

  // ===== MÓDULOS TRANSVERSALES (PARA TODOS) =====
  transversalModules: [
    {
      id: 1,
      title: "Fundamentos de IA y Ética",
      duration: "3 horas",
      description: "Introducción a conceptos clave de inteligencia artificial, machine learning y procesamiento de lenguaje natural. Exploración de consideraciones éticas en la implementación de IA en el sector financiero mexicano.",
      content: [
        "Conceptos fundamentales de inteligencia artificial",
        "Machine learning y sus aplicaciones",
        "Procesamiento de lenguaje natural (NLP)",
        "Consideraciones éticas en IA financiera",
        "Responsabilidad en el uso de IA",
        "Sesgos y transparencia en algoritmos"
      ]
    },
    {
      id: 2,
      title: "Seguridad y Privacidad de Datos",
      duration: "2 horas",
      description: "Estrategias para proteger datos sensibles durante el procesamiento con IA. Implementación de medidas de privacidad por diseño conforme a LGPD y mejores prácticas internacionales.",
      content: [
        "Protección de datos sensibles",
        "Privacidad por diseño",
        "Cumplimiento LGPD",
        "Mejores prácticas internacionales",
        "Encriptación y seguridad de datos",
        "Gestión de riesgos de privacidad"
      ]
    },
    {
      id: 3,
      title: "Gobierno y Cumplimiento",
      duration: "2 horas",
      description: "Marcos de referencia para implementar IA conforme a regulaciones de CNBV y LMV. Estrategias de gestión de riesgos y documentación de procesos automatizados.",
      content: [
        "Marcos regulatorios CNBV",
        "Cumplimiento Ley del Mercado de Valores",
        "Gestión de riesgos en IA",
        "Documentación de procesos automatizados",
        "Auditoría de sistemas de IA",
        "Controles regulatorios"
      ]
    },
    {
      id: 4,
      title: "Productividad con IA",
      duration: "3 horas",
      description: "Aplicaciones prácticas de IA para aumentar la productividad diaria. Uso de asistentes, generación de contenido y automatización de tareas repetitivas en el contexto financiero.",
      content: [
        "Asistentes virtuales para productividad",
        "Generación de contenido con IA",
        "Automatización de tareas repetitivas",
        "Herramientas de IA para análisis",
        "Optimización de flujos de trabajo",
        "Integración de IA en procesos diarios"
      ]
    }
  ],

  // ===== MÓDULOS ESPECÍFICOS POR ÁREA =====
  specificModules: {
    brokers: {
      title: "Brokers",
      description: "Analítica avanzada para identificación de oportunidades, detección de anomalías en patrones de mercado y análisis automatizado de noticias con impacto en instrumentos financieros.",
      content: [
        "Identificación de oportunidades de mercado",
        "Detección de anomalías en patrones",
        "Análisis automatizado de noticias",
        "Impacto en instrumentos financieros",
        "Alertas de mercado en tiempo real",
        "Análisis de sentimiento de mercado"
      ],
      duration: "3-4 horas"
    },
    ti: {
      title: "TI",
      description: "Implementación de MLOps ligero, integración con APIs financieras y uso de embeddings para análisis de similitud en documentos y series de tiempo de mercados.",
      content: [
        "MLOps ligero para implementación",
        "Integración con APIs financieras",
        "Embeddings para análisis de similitud",
        "Análisis de series de tiempo",
        "Arquitectura de sistemas de IA",
        "Despliegue y monitoreo de modelos"
      ],
      duration: "3-4 horas"
    },
    legal: {
      title: "Legal/Contraloría",
      description: "Análisis automatizado de contratos, extracción de cláusulas clave y herramientas de auditoría potenciadas por IA para identificación de riesgos regulatorios.",
      content: [
        "Análisis automatizado de contratos",
        "Extracción de cláusulas clave",
        "Herramientas de auditoría con IA",
        "Identificación de riesgos regulatorios",
        "Revisión legal automatizada",
        "Cumplimiento normativo"
      ],
      duration: "3-4 horas"
    },
    nuevosNegocios: {
      title: "Nuevos Negocios",
      description: "Generación de perfiles enriquecidos de prospectos, análisis de potencial de mercado y resúmenes automatizados de documentos de emisoras.",
      content: [
        "Perfiles enriquecidos de prospectos",
        "Análisis de potencial de mercado",
        "Resúmenes automatizados de documentos",
        "Evaluación de emisoras",
        "Identificación de oportunidades",
        "Análisis de competencia"
      ],
      duration: "3-4 horas"
    },
    administracion: {
      title: "Administración/Finanzas",
      description: "Automatización de conciliaciones contables, generación de reportes financieros y detección de patrones inusuales en registros transaccionales.",
      content: [
        "Automatización de conciliaciones",
        "Generación de reportes financieros",
        "Detección de patrones inusuales",
        "Análisis de registros transaccionales",
        "Control interno automatizado",
        "Análisis de riesgos financieros"
      ],
      duration: "3-4 horas"
    },
    auxiliares: {
      title: "Auxiliares/Dirección",
      description: "Implementación de asistentes virtuales para agenda y seguimiento, así como generación y mantenimiento de documentación corporativa automatizada.",
      content: [
        "Asistentes virtuales para agenda",
        "Seguimiento automatizado",
        "Documentación corporativa automatizada",
        "Gestión de tareas administrativas",
        "Comunicación interna optimizada",
        "Organización de información"
      ],
      duration: "3-4 horas"
    }
  },

  // ===== CASOS DE USO ESPECÍFICOS =====
  useCases: {
    brokers: [
      "Detección de oportunidades de arbitraje en tiempo real",
      "Análisis de sentimiento de noticias financieras",
      "Identificación de patrones anómalos en trading",
      "Alertas automáticas de movimientos de mercado"
    ],
    ti: [
      "Implementación de pipeline MLOps para modelos de riesgo",
      "Integración con APIs de Bloomberg y Reuters",
      "Análisis de similitud de documentos regulatorios",
      "Monitoreo de performance de modelos en producción"
    ],
    legal: [
      "Revisión automatizada de contratos de derivados",
      "Extracción de cláusulas de riesgo en documentos",
      "Auditoría automatizada de cumplimiento regulatorio",
      "Generación de reportes de cumplimiento"
    ],
    nuevosNegocios: [
      "Análisis de prospectos para nuevos emisores",
      "Evaluación automatizada de documentos de emisoras",
      "Identificación de oportunidades de mercado",
      "Generación de perfiles de riesgo de emisores"
    ],
    administracion: [
      "Conciliación automática de operaciones",
      "Detección de transacciones inusuales",
      "Generación de reportes regulatorios",
      "Análisis de flujos de efectivo"
    ],
    auxiliares: [
      "Asistente virtual para gestión de agenda",
      "Automatización de documentación corporativa",
      "Seguimiento de tareas administrativas",
      "Organización de información interna"
    ]
  },

  // ===== METODOLOGÍA Y ENFOQUE =====
  methodology: {
    approach: "Transversal garantiza que cada área obtenga beneficios tangibles",
    measurement: "KPIs definidos en conjunto con equipo directivo",
    adaptation: "Diseñado para adaptarse a prioridades estratégicas",
    challenges: "Abordar desafíos específicos del mercado financiero mexicano",
    delivery: "Modalidad adaptable: presencial, virtual o híbrida",
    evaluation: "Evaluaciones pre y post para medir impacto del aprendizaje",
    materials: "Materiales de referencia personalizados para contexto SIF ICAP"
  },

  // ===== CERTIFICACIÓN Y RESULTADOS =====
  certification: {
    type: "Certificación por módulo completado",
    benefits: [
      "Conocimiento aplicable inmediatamente",
      "Mejora en eficiencia operativa",
      "Reducción de riesgos regulatorios",
      "Ventaja competitiva en el mercado",
      "Preparación para transformación digital"
    ]
  },

  // ===== TECNOLOGÍAS Y HERRAMIENTAS =====
  technologies: [
    "Machine Learning",
    "Procesamiento de Lenguaje Natural (NLP)",
    "Análisis de Series de Tiempo",
    "Embeddings y Análisis de Similitud",
    "APIs Financieras",
    "MLOps",
    "Herramientas de Automatización",
    "Sistemas de Monitoreo"
  ],

  // ===== REGULACIONES Y COMPLIANCE =====
  regulations: {
    mexican: [
      "CNBV (Comisión Nacional Bancaria y de Valores)",
      "Ley del Mercado de Valores (LMV)",
      "Ley General de Protección de Datos (LGPD)"
    ],
    international: [
      "GDPR (General Data Protection Regulation)",
      "Mejores prácticas internacionales de IA"
    ]
  },

  // ===== BENEFICIOS ESPERADOS =====
  expectedBenefits: [
    "Reducción de tiempos de procesamiento",
    "Incremento en precisión analítica",
    "Mejora en detección de anomalías",
    "Automatización de tareas repetitivas",
    "Mejor cumplimiento regulatorio",
    "Ventaja competitiva en el mercado",
    "Optimización de recursos operativos",
    "Reducción de errores humanos"
  ]
};

// ===== FUNCIONES DE BÚSQUEDA Y ACCESO =====

/**
 * Busca información específica en el contenido del curso
 * @param {string} query - Término de búsqueda
 * @returns {Array} - Resultados relevantes
 */
function searchCourseContent(query) {
  const results = [];
  const searchTerm = query.toLowerCase();
  
  // Buscar en información general
  if (COURSE_CONTENT.courseInfo.title.toLowerCase().includes(searchTerm) ||
      COURSE_CONTENT.courseInfo.description.toLowerCase().includes(searchTerm)) {
    results.push({
      type: 'course_info',
      content: COURSE_CONTENT.courseInfo,
      relevance: 'high'
    });
  }
  
  // Buscar en módulos transversales
  COURSE_CONTENT.transversalModules.forEach(module => {
    if (module.title.toLowerCase().includes(searchTerm) ||
        module.description.toLowerCase().includes(searchTerm) ||
        module.content.some(item => item.toLowerCase().includes(searchTerm))) {
      results.push({
        type: 'transversal_module',
        content: module,
        relevance: 'high'
      });
    }
  });
  
  // Buscar en módulos específicos
  Object.keys(COURSE_CONTENT.specificModules).forEach(area => {
    const module = COURSE_CONTENT.specificModules[area];
    if (module.title.toLowerCase().includes(searchTerm) ||
        module.description.toLowerCase().includes(searchTerm) ||
        module.content.some(item => item.toLowerCase().includes(searchTerm))) {
      results.push({
        type: 'specific_module',
        content: module,
        area: area,
        relevance: 'high'
      });
    }
  });
  
  // Buscar en casos de uso
  Object.keys(COURSE_CONTENT.useCases).forEach(area => {
    COURSE_CONTENT.useCases[area].forEach(useCase => {
      if (useCase.toLowerCase().includes(searchTerm)) {
        results.push({
          type: 'use_case',
          content: useCase,
          area: area,
          relevance: 'medium'
        });
      }
    });
  });
  
  return results;
}

/**
 * Obtiene información específica por área funcional
 * @param {string} area - Área funcional (brokers, ti, legal, etc.)
 * @returns {Object} - Información del área
 */
function getAreaInfo(area) {
  return COURSE_CONTENT.specificModules[area] || null;
}

/**
 * Obtiene todos los módulos transversales
 * @returns {Array} - Lista de módulos transversales
 */
function getTransversalModules() {
  return COURSE_CONTENT.transversalModules;
}

/**
 * Obtiene información general del curso
 * @returns {Object} - Información general
 */
function getCourseInfo() {
  return COURSE_CONTENT.courseInfo;
}

/**
 * Obtiene objetivos del curso
 * @returns {Object} - Objetivos generales y específicos
 */
function getCourseObjectives() {
  return COURSE_CONTENT.objectives;
}

/**
 * Obtiene casos de uso por área
 * @param {string} area - Área funcional (opcional)
 * @returns {Object|Array} - Casos de uso
 */
function getUseCases(area = null) {
  if (area) {
    return COURSE_CONTENT.useCases[area] || [];
  }
  return COURSE_CONTENT.useCases;
}

// Exportar para uso en el chatbot
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    COURSE_CONTENT,
    searchCourseContent,
    getAreaInfo,
    getTransversalModules,
    getCourseInfo,
    getCourseObjectives,
    getUseCases
  };
} else {
  // Para uso en navegador
  window.COURSE_CONTENT_SIF_ICAP = {
    COURSE_CONTENT,
    searchCourseContent,
    getAreaInfo,
    getTransversalModules,
    getCourseInfo,
    getCourseObjectives,
    getUseCases
  };
}
