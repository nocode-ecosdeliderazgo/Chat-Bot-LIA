// Apps Data - Datos de las aplicaciones de IA (Solo herramientas de creación de contenido)

const appsData = [
    {
        id: 1,
        name: "ChatGPT",
        description: "El asistente de IA conversacional más avanzado del mundo, desarrollado por OpenAI. Capaz de mantener conversaciones naturales, generar contenido creativo, resolver problemas complejos y asistir en una amplia gama de tareas profesionales y personales.",
        category: "contenido-escritura",
        tags: ["Chat", "Escritura", "Productividad", "IA Conversacional", "GPT-4"],
        pricing: "freemium",
        hasTutorial: true,
        hasFreePlan: true,
        features: [
            "Conversación natural y contextual",
            "Soporte para 95+ idiomas",
            "Análisis y procesamiento de texto avanzado",
            "Generación de contenido creativo y técnico",
            "Resolución de problemas matemáticos y lógicos",
            "Asistencia en programación y debugging",
            "Análisis de datos y visualización",
            "Tutoría personalizada en múltiples materias",
            "Integración con APIs y herramientas externas",
            "Memoria de conversación contextual"
        ],
        logo: "assets/images/tools/chatgpt.png",
        url: "https://chat.openai.com",
        detailedInfo: {
            pros: [
                "Respuestas extremadamente precisas y contextuales",
                "Soporte para más de 95 idiomas diferentes",
                "Integración perfecta con herramientas populares como Microsoft Office, Google Workspace",
                "Actualizaciones constantes y mejoras del modelo",
                "Capacidad de análisis de archivos (PDF, Word, Excel)",
                "Memoria de conversación para contextos largos",
                "Generación de código en múltiples lenguajes de programación",
                "Análisis de datos y creación de visualizaciones",
                "Asistencia en tareas creativas como escritura, poesía, guiones",
                "Resolución de problemas matemáticos complejos"
            ],
            cons: [
                "Límites estrictos de uso en el plan gratuito (3 mensajes por hora)",
                "Puede generar información incorrecta o desactualizada",
                "Requiere conexión a internet constante",
                "Dependiente de la calidad y especificidad del prompt",
                "No tiene acceso a información en tiempo real (corte de conocimiento en abril 2024)",
                "Puede ser lento durante horas pico de uso",
                "Requiere verificación manual de información crítica",
                "Costo elevado para uso intensivo en planes de pago"
            ],
            pricingPlans: [
                {
                    name: "Gratuito",
                    price: "0€/mes",
                    features: [
                        "Acceso a GPT-3.5",
                        "3 mensajes por hora",
                        "Límite de 25 mensajes por día",
                        "Respuestas básicas",
                        "Sin acceso a funciones avanzadas",
                        "Sin análisis de archivos"
                    ],
                    popular: false
                },
                {
                    name: "Plus",
                    price: "20€/mes",
                    features: [
                        "Acceso completo a GPT-4 y GPT-4 Turbo",
                        "Sin límites de mensajes",
                        "Respuestas más rápidas y precisas",
                        "Análisis de archivos (PDF, Word, Excel, PowerPoint)",
                        "Acceso a funciones de búsqueda web",
                        "Creación de imágenes con DALL-E 3",
                        "Acceso prioritario durante horas pico",
                        "Nuevas funciones y actualizaciones tempranas"
                    ],
                    popular: true
                },
                {
                    name: "Team",
                    price: "25€/usuario/mes",
                    features: [
                        "Todo lo incluido en Plus",
                        "Colaboración en equipo con espacios compartidos",
                        "Administración avanzada de usuarios y permisos",
                        "Soporte prioritario 24/7",
                        "Integraciones empresariales (SSO, SAML)",
                        "Análisis de uso y métricas del equipo",
                        "Políticas de privacidad empresarial",
                        "API de administración avanzada"
                    ],
                    popular: false
                }
            ],
            useCases: [
                "Generación de contenido creativo para blogs, redes sociales y marketing",
                "Asistencia en programación y debugging de código",
                "Análisis de datos complejos y creación de reportes",
                "Tutoría personalizada en matemáticas, ciencias y humanidades",
                "Traducción y localización de contenido multilingüe",
                "Creación de guiones, historias y contenido narrativo",
                "Análisis de documentos y extracción de información",
                "Asistencia en tareas de investigación y análisis",
                "Generación de ideas y brainstorming creativo",
                "Resolución de problemas técnicos y consultas complejas"
            ],
            alternatives: ["Claude 3.5 Sonnet", "Google Bard", "Perplexity AI", "You.com", "Microsoft Copilot"],
            tutorialUrl: "https://help.openai.com"
        }
    },
    {
        id: 2,
        name: "Claude 3.5 Sonnet",
        description: "El modelo de IA más avanzado de Anthropic, especializado en análisis profundo, razonamiento complejo y generación de contenido de alta calidad. Destaca por su capacidad de análisis de documentos largos y su enfoque en la seguridad y utilidad.",
        category: "contenido-escritura",
        tags: ["Análisis", "Escritura", "IA", "Razonamiento", "Documentos"],
        pricing: "freemium",
        hasTutorial: true,
        hasFreePlan: true,
        features: [
            "Análisis de documentos de hasta 200,000 tokens",
            "Razonamiento complejo y análisis profundo",
            "Generación de código en múltiples lenguajes",
            "Análisis de imágenes y documentos visuales",
            "Generación de contenido creativo y técnico",
            "Traducción y localización avanzada",
            "Análisis de datos y visualización",
            "Asistencia en investigación académica",
            "Generación de reportes y análisis",
            "Integración con APIs y herramientas externas"
        ],
        logo: "assets/images/tools/claude.png",
        url: "https://claude.ai",
        detailedInfo: {
            pros: [
                "Capacidad excepcional para analizar documentos largos",
                "Razonamiento lógico superior y análisis profundo",
                "Generación de código de alta calidad",
                "Análisis de imágenes y documentos visuales",
                "Enfoque en seguridad y utilidad",
                "Generación de contenido técnico preciso",
                "Análisis de datos complejos",
                "Traducción y localización avanzada",
                "Asistencia en investigación académica",
                "Integración con herramientas populares"
            ],
            cons: [
                "Límites de uso en el plan gratuito",
                "Puede ser lento con tareas muy complejas",
                "Requiere conexión a internet constante",
                "Dependiente de la calidad del prompt",
                "No tiene acceso a información en tiempo real",
                "Puede generar contenido conservador",
                "Requiere verificación manual de información",
                "Costo elevado para uso intensivo"
            ],
            pricingPlans: [
                {
                    name: "Gratuito",
                    price: "0€/mes",
                    features: [
                        "Acceso a Claude 3.5 Sonnet",
                        "Límite de 5 mensajes por día",
                        "Análisis de documentos básico",
                        "Respuestas estándar",
                        "Sin acceso a funciones avanzadas"
                    ],
                    popular: false
                },
                {
                    name: "Pro",
                    price: "20€/mes",
                    features: [
                        "Acceso completo a Claude 3.5 Sonnet",
                        "Sin límites de mensajes",
                        "Análisis de documentos largos",
                        "Análisis de imágenes avanzado",
                        "Generación de código mejorada",
                        "Respuestas más rápidas",
                        "Acceso prioritario",
                        "Nuevas funciones tempranas"
                    ],
                    popular: true
                }
            ],
            useCases: [
                "Análisis de documentos largos y complejos",
                "Generación de código y debugging",
                "Análisis de datos y visualización",
                "Investigación académica y análisis",
                "Generación de contenido técnico",
                "Traducción y localización",
                "Análisis de imágenes y documentos",
                "Asistencia en tareas de investigación",
                "Generación de reportes detallados",
                "Análisis de problemas complejos"
            ],
            alternatives: ["ChatGPT", "Google Bard", "Perplexity AI", "You.com", "Microsoft Copilot"],
            tutorialUrl: "https://docs.anthropic.com"
        }
    },
    {
        id: 3,
        name: "Midjourney",
        description: "La plataforma de generación de imágenes con IA más avanzada y artísticamente sofisticada del mercado. Utiliza algoritmos de última generación para crear arte digital, ilustraciones y contenido visual de alta calidad a partir de descripciones textuales.",
        category: "arte-ilustracion",
        tags: ["Imágenes", "Arte", "IA", "Generación", "Creatividad"],
        pricing: "de-pago",
        hasTutorial: true,
        hasFreePlan: false,
        features: [
            "Generación de imágenes de alta resolución",
            "Múltiples estilos artísticos",
            "Control avanzado de parámetros",
            "Generación de variaciones",
            "Upscaling y mejora de imágenes",
            "Integración con Discord",
            "Generación de imágenes panorámicas",
            "Control de composición y perspectiva",
            "Generación de imágenes consistentes",
            "API para desarrolladores"
        ],
        logo: "assets/images/tools/midjourney.png",
        url: "https://midjourney.com",
        detailedInfo: {
            pros: [
                "Calidad artística excepcional",
                "Múltiples estilos y técnicas artísticas",
                "Control avanzado de parámetros",
                "Generación de variaciones creativas",
                "Upscaling de alta calidad",
                "Integración perfecta con Discord",
                "Generación de imágenes panorámicas",
                "Control de composición y perspectiva",
                "Generación de imágenes consistentes",
                "API para desarrolladores"
            ],
            cons: [
                "No tiene plan gratuito",
                "Requiere Discord para usar",
                "Puede ser lento durante horas pico",
                "Dependiente de la calidad del prompt",
                "Requiere conexión a internet",
                "Puede generar contenido inapropiado",
                "Requiere revisión manual de imágenes",
                "Costo elevado para uso intensivo",
                "Curva de aprendizaje para prompts efectivos",
                "Limitado a generación de imágenes"
            ],
            pricingPlans: [
                {
                    name: "Basic",
                    price: "10€/mes",
                    features: [
                        "200 minutos de generación/mes",
                        "Generación estándar",
                        "Acceso a Discord",
                        "Generación de variaciones",
                        "Upscaling básico",
                        "Soporte por correo electrónico"
                    ],
                    popular: false
                },
                {
                    name: "Standard",
                    price: "30€/mes",
                    features: [
                        "900 minutos de generación/mes",
                        "Generación rápida",
                        "Todas las funciones de Basic",
                        "Upscaling avanzado",
                        "Generación de imágenes panorámicas",
                        "Soporte prioritario"
                    ],
                    popular: true
                },
                {
                    name: "Pro",
                    price: "60€/mes",
                    features: [
                        "1800 minutos de generación/mes",
                        "Generación turbo",
                        "Todas las funciones de Standard",
                        "API para desarrolladores",
                        "Soporte 24/7",
                        "Funciones experimentales"
                    ],
                    popular: false
                }
            ],
            useCases: [
                "Creación de arte digital y ilustraciones",
                "Generación de conceptos visuales",
                "Creación de contenido para redes sociales",
                "Desarrollo de personajes y mundos",
                "Generación de imágenes para marketing",
                "Creación de contenido educativo",
                "Desarrollo de videojuegos",
                "Creación de portadas y diseños",
                "Generación de imágenes para presentaciones",
                "Creación de contenido artístico"
            ],
            alternatives: ["DALL-E 3", "Stable Diffusion", "Adobe Firefly", "Canva AI", "Leonardo AI"],
            tutorialUrl: "https://docs.midjourney.com"
        }
    },
    {
        id: 4,
        name: "DALL-E 3",
        description: "El generador de imágenes con IA más avanzado de OpenAI, integrado directamente con ChatGPT. DALL-E 3 representa un salto cuántico en la generación de imágenes, con capacidades excepcionales para crear ilustraciones, arte conceptual y contenido visual de alta calidad a partir de descripciones textuales.",
        category: "arte-ilustracion",
        tags: ["Imágenes", "Arte", "IA", "Generación", "OpenAI"],
        pricing: "de-pago",
        hasTutorial: true,
        hasFreePlan: false,
        features: [
            "Generación de imágenes de alta resolución",
            "Integración perfecta con ChatGPT",
            "Comprensión avanzada de prompts",
            "Generación de imágenes realistas",
            "Múltiples estilos artísticos",
            "Generación de variaciones",
            "Upscaling y mejora de imágenes",
            "Generación de imágenes consistentes",
            "Control de composición y perspectiva",
            "API para desarrolladores"
        ],
        logo: "assets/images/tools/dalle.png",
        url: "https://openai.com/dall-e-3",
        detailedInfo: {
            pros: [
                "Integración perfecta con ChatGPT",
                "Comprensión avanzada de prompts",
                "Generación de imágenes realistas",
                "Múltiples estilos artísticos",
                "Generación de variaciones creativas",
                "Upscaling de alta calidad",
                "Generación de imágenes consistentes",
                "Control de composición y perspectiva",
                "API para desarrolladores",
                "Actualizaciones constantes"
            ],
            cons: [
                "No tiene plan gratuito",
                "Requiere suscripción de ChatGPT Plus",
                "Puede ser lento durante horas pico",
                "Dependiente de la calidad del prompt",
                "Requiere conexión a internet",
                "Puede generar contenido inapropiado",
                "Requiere revisión manual de imágenes",
                "Costo elevado para uso intensivo",
                "Limitado a generación de imágenes",
                "Dependiente de la infraestructura de OpenAI"
            ],
            pricingPlans: [
                {
                    name: "ChatGPT Plus",
                    price: "20€/mes",
                    features: [
                        "Acceso a DALL-E 3",
                        "Generación de imágenes",
                        "Integración con ChatGPT",
                        "Generación de variaciones",
                        "Upscaling básico",
                        "Soporte por correo electrónico"
                    ],
                    popular: true
                },
                {
                    name: "ChatGPT Team",
                    price: "25€/usuario/mes",
                    features: [
                        "Todo lo incluido en Plus",
                        "Colaboración en equipo",
                        "Administración avanzada",
                        "Soporte prioritario",
                        "Integraciones empresariales",
                        "Análisis de uso"
                    ],
                    popular: false
                }
            ],
            useCases: [
                "Creación de arte digital e ilustraciones",
                "Generación de conceptos visuales",
                "Creación de contenido para redes sociales",
                "Desarrollo de personajes y mundos",
                "Generación de imágenes para marketing",
                "Creación de contenido educativo",
                "Desarrollo de videojuegos",
                "Creación de portadas y diseños",
                "Generación de imágenes para presentaciones",
                "Creación de contenido artístico"
            ],
            alternatives: ["Midjourney", "Stable Diffusion", "Adobe Firefly", "Canva AI", "Leonardo AI"],
            tutorialUrl: "https://help.openai.com"
        }
    },
    {
        id: 5,
        name: "Runway ML",
        description: "La suite de herramientas de IA más avanzada para creación y edición de video del mercado. Utiliza algoritmos de machine learning de última generación para proporcionar efectos especiales, generación de contenido y automatización de tareas de edición que antes requerían equipos profesionales y software costoso.",
        category: "video",
        tags: ["Video", "Edición", "IA", "Efectos", "ML"],
        pricing: "freemium",
        hasTutorial: true,
        hasFreePlan: true,
        features: [
            "Generación de video con IA",
            "Edición automática de video",
            "Efectos especiales avanzados",
            "Remoción de objetos y personas",
            "Generación de contenido",
            "Automatización de tareas",
            "Integración con herramientas",
            "Colaboración en equipo",
            "Análisis de contenido",
            "API para desarrolladores"
        ],
        logo: "assets/images/tools/runway.png",
        url: "https://runwayml.com",
        detailedInfo: {
            pros: [
                "Efectos especiales de nivel profesional",
                "Generación de video con IA",
                "Edición automática avanzada",
                "Remoción de objetos precisa",
                "Integración con herramientas populares",
                "Colaboración en equipo eficiente",
                "Análisis de contenido inteligente",
                "API para desarrolladores",
                "Actualizaciones constantes",
                "Soporte para múltiples formatos"
            ],
            cons: [
                "Límites en el plan gratuito",
                "Puede ser lento con videos largos",
                "Requiere conexión a internet",
                "Dependiente de la calidad del contenido",
                "Puede generar resultados inesperados",
                "Requiere revisión manual del contenido",
                "Costo elevado para uso intensivo",
                "Curva de aprendizaje inicial",
                "Dependiente de la infraestructura",
                "Limitado a funciones específicas"
            ],
            pricingPlans: [
                {
                    name: "Free",
                    price: "0€/mes",
                    features: [
                        "125 segundos de generación/mes",
                        "Herramientas básicas",
                        "Resolución estándar",
                        "Soporte por correo electrónico",
                        "Integraciones básicas"
                    ],
                    popular: false
                },
                {
                    name: "Standard",
                    price: "12€/mes",
                    features: [
                        "625 segundos de generación/mes",
                        "Herramientas avanzadas",
                        "Resolución HD",
                        "Soporte prioritario",
                        "Integraciones avanzadas"
                    ],
                    popular: true
                },
                {
                    name: "Pro",
                    price: "28€/mes",
                    features: [
                        "2250 segundos de generación/mes",
                        "Todas las herramientas",
                        "Resolución 4K",
                        "Soporte 24/7",
                        "API completa"
                    ],
                    popular: false
                }
            ],
            useCases: [
                "Creación de efectos especiales",
                "Edición automática de video",
                "Remoción de objetos y personas",
                "Generación de contenido",
                "Automatización de tareas",
                "Colaboración en equipo",
                "Análisis de contenido",
                "Desarrollo de videojuegos",
                "Creación de contenido educativo",
                "Producción de marketing"
            ],
            alternatives: ["Adobe After Effects", "DaVinci Resolve", "Final Cut Pro", "Premiere Pro", "CapCut"],
            tutorialUrl: "https://runwayml.com/help"
        }
    },
    {
        id: 6,
        name: "Loom AI",
        description: "La plataforma de grabación de pantalla más avanzada del mercado, potenciada con inteligencia artificial para crear, editar y compartir videos de manera inteligente. Loom combina grabación de pantalla de alta calidad con capacidades de IA para transcripción, resúmenes automáticos y análisis de contenido.",
        category: "video",
        tags: ["Video", "Grabación", "IA", "Pantalla", "Colaboración"],
        pricing: "freemium",
        hasTutorial: true,
        hasFreePlan: true,
        features: [
            "Grabación de pantalla HD",
            "Transcripción automática",
            "Resúmenes automáticos",
            "Análisis de contenido",
            "Edición automática",
            "Compartir y colaborar",
            "Integración con herramientas",
            "Análisis de audiencia",
            "Personalización de marca",
            "API para desarrolladores"
        ],
        logo: "assets/images/tools/loom.png",
        url: "https://loom.com",
        detailedInfo: {
            pros: [
                "Grabación de pantalla de alta calidad",
                "Transcripción automática precisa",
                "Resúmenes automáticos útiles",
                "Análisis de contenido inteligente",
                "Edición automática eficiente",
                "Compartir y colaborar fácilmente",
                "Integración con herramientas populares",
                "Análisis de audiencia detallado",
                "Personalización de marca",
                "API para desarrolladores"
            ],
            cons: [
                "Límites en el plan gratuito",
                "Puede ser lento con videos largos",
                "Requiere conexión a internet",
                "Dependiente de la calidad del audio",
                "Puede generar transcripciones inexactas",
                "Requiere revisión manual del contenido",
                "Costo elevado para uso intensivo",
                "Curva de aprendizaje inicial",
                "Dependiente de la infraestructura",
                "Limitado a grabación de pantalla"
            ],
            pricingPlans: [
                {
                    name: "Free",
                    price: "0€/mes",
                    features: [
                        "25 videos/mes",
                        "5 minutos por video",
                        "Transcripción básica",
                        "Resúmenes básicos",
                        "Soporte por correo electrónico"
                    ],
                    popular: false
                },
                {
                    name: "Business",
                    price: "8€/usuario/mes",
                    features: [
                        "Videos ilimitados",
                        "Duración ilimitada",
                        "Transcripción avanzada",
                        "Resúmenes avanzados",
                        "Análisis de audiencia",
                        "Personalización de marca"
                    ],
                    popular: true
                },
                {
                    name: "Enterprise",
                    price: "Personalizado",
                    features: [
                        "Todo lo incluido en Business",
                        "API completa",
                        "Soporte 24/7",
                        "Integraciones personalizadas",
                        "Análisis avanzado",
                        "Soporte dedicado"
                    ],
                    popular: false
                }
            ],
            useCases: [
                "Grabación de tutoriales",
                "Presentaciones de productos",
                "Comunicación interna",
                "Entrenamiento de empleados",
                "Feedback y revisiones",
                "Documentación de procesos",
                "Creación de contenido educativo",
                "Colaboración en equipo",
                "Análisis de audiencia",
                "Marketing y ventas"
            ],
            alternatives: ["Screencastify", "Camtasia", "OBS Studio", "Bandicam", "ScreenFlow"],
            tutorialUrl: "https://help.loom.com"
        }
    },
    {
        id: 7,
        name: "Murf AI",
        description: "Plataforma de síntesis de voz con IA para crear audios profesionales, podcasts, narraciones y contenido de audio. Incluye más de 120 voces en 20+ idiomas con control emocional y estilos de voz para diferentes tipos de contenido.",
        category: "musica-audio",
        tags: ["Audio", "Voz", "IA", "Síntesis", "Podcast"],
        pricing: "freemium",
        hasTutorial: true,
        hasFreePlan: true,
        features: [
            "Más de 120 voces naturales",
            "20+ idiomas soportados",
            "Control emocional de voz",
            "Múltiples estilos de voz",
            "Edición de audio avanzada",
            "Integración con video",
            "API para desarrolladores",
            "Colaboración en equipo",
            "Exportación en múltiples formatos",
            "Análisis de calidad de audio"
        ],
        logo: "assets/images/tools/murf.png",
        url: "https://murf.ai",
        detailedInfo: {
            pros: [
                "Calidad de voz extremadamente natural",
                "Amplia variedad de voces y idiomas",
                "Control emocional preciso",
                "Múltiples estilos de voz",
                "Edición de audio avanzada",
                "Integración perfecta con video",
                "API para desarrolladores",
                "Colaboración en equipo eficiente",
                "Exportación en múltiples formatos",
                "Análisis de calidad de audio"
            ],
            cons: [
                "Límites en el plan gratuito",
                "Puede ser lento con audio largo",
                "Requiere conexión a internet",
                "Dependiente de la calidad del texto",
                "Puede generar audio robótico",
                "Requiere revisión manual del audio",
                "Costo elevado para uso intensivo",
                "Curva de aprendizaje inicial",
                "Dependiente de la infraestructura",
                "Limitado a síntesis de voz"
            ],
            pricingPlans: [
                {
                    name: "Free",
                    price: "0€/mes",
                    features: [
                        "10 minutos de audio/mes",
                        "Voces básicas",
                        "Idiomas limitados",
                        "Soporte por correo electrónico",
                        "Integraciones básicas"
                    ],
                    popular: false
                },
                {
                    name: "Basic",
                    price: "19€/mes",
                    features: [
                        "60 minutos de audio/mes",
                        "Todas las voces",
                        "Todos los idiomas",
                        "Soporte prioritario",
                        "Integraciones avanzadas"
                    ],
                    popular: true
                },
                {
                    name: "Pro",
                    price: "39€/mes",
                    features: [
                        "300 minutos de audio/mes",
                        "Todas las funciones",
                        "API completa",
                        "Soporte 24/7",
                        "Integraciones personalizadas"
                    ],
                    popular: false
                }
            ],
            useCases: [
                "Creación de podcasts",
                "Narración de videos",
                "Audiolibros",
                "Contenido educativo",
                "Marketing y publicidad",
                "Accesibilidad",
                "Internacionalización",
                "Creación de contenido",
                "Colaboración en equipo",
                "Análisis de audio"
            ],
            alternatives: ["ElevenLabs", "Synthesia", "Resemble AI", "Speechify", "Natural Reader"],
            tutorialUrl: "https://murf.ai/help"
        }
    },
    {
        id: 8,
        name: "Synthesia",
        description: "Plataforma de creación de videos con avatares de IA para presentaciones, e-learning y marketing. Permite crear videos profesionales con presentadores virtuales en más de 120 idiomas, ideal para contenido educativo y corporativo.",
        category: "video",
        tags: ["Video", "Avatar", "IA", "Presentación", "E-learning"],
        pricing: "de-pago",
        hasTutorial: true,
        hasFreePlan: false,
        features: [
            "Más de 140 avatares realistas",
            "120+ idiomas soportados",
            "Creación de videos rápida",
            "Personalización de avatares",
            "Integración con herramientas",
            "API para desarrolladores",
            "Colaboración en equipo",
            "Análisis de rendimiento",
            "Exportación en HD",
            "Templates predefinidos"
        ],
        logo: "assets/images/tools/synthesia.png",
        url: "https://synthesia.io",
        detailedInfo: {
            pros: [
                "Avatares extremadamente realistas",
                "Creación de videos rápida y fácil",
                "Amplia variedad de avatares y idiomas",
                "Personalización avanzada de avatares",
                "Integración con herramientas populares",
                "API para desarrolladores",
                "Colaboración en equipo eficiente",
                "Análisis de rendimiento detallado",
                "Exportación en HD de alta calidad",
                "Templates predefinidos útiles"
            ],
            cons: [
                "No tiene plan gratuito",
                "Puede ser lento con videos largos",
                "Requiere conexión a internet",
                "Dependiente de la calidad del texto",
                "Puede generar avatares poco naturales",
                "Requiere revisión manual del video",
                "Costo elevado para uso intensivo",
                "Curva de aprendizaje inicial",
                "Dependiente de la infraestructura",
                "Limitado a avatares virtuales"
            ],
            pricingPlans: [
                {
                    name: "Starter",
                    price: "30€/mes",
                    features: [
                        "10 minutos de video/mes",
                        "Avatares básicos",
                        "Idiomas limitados",
                        "Soporte por correo electrónico",
                        "Integraciones básicas"
                    ],
                    popular: false
                },
                {
                    name: "Creator",
                    price: "41€/mes",
                    features: [
                        "30 minutos de video/mes",
                        "Todas las voces",
                        "Todos los idiomas",
                        "Soporte prioritario",
                        "Integraciones avanzadas"
                    ],
                    popular: true
                },
                {
                    name: "Enterprise",
                    price: "Personalizado",
                    features: [
                        "Videos ilimitados",
                        "Todas las funciones",
                        "API completa",
                        "Soporte 24/7",
                        "Integraciones personalizadas"
                    ],
                    popular: false
                }
            ],
            useCases: [
                "Creación de videos educativos",
                "Presentaciones corporativas",
                "Marketing y publicidad",
                "E-learning y capacitación",
                "Comunicación interna",
                "Creación de contenido",
                "Internacionalización",
                "Colaboración en equipo",
                "Análisis de rendimiento",
                "Desarrollo de productos"
            ],
            alternatives: ["D-ID", "Rephrase.ai", "Synthesia", "Lumen5", "InVideo"],
            tutorialUrl: "https://synthesia.io/help"
        }
    },
    {
        id: 9,
        name: "GitHub Copilot",
        description: "Asistente de IA para programación desarrollado por GitHub en colaboración con OpenAI. Utiliza el modelo GPT para sugerir código en tiempo real, completar funciones, generar tests y asistir en el desarrollo de software en múltiples lenguajes de programación.",
        category: "desarrollo-programacion",
        tags: ["Programación", "IA", "Código", "Desarrollo", "GitHub"],
        pricing: "de-pago",
        hasTutorial: true,
        hasFreePlan: true,
        features: [
            "Sugerencias de código en tiempo real",
            "Soporte para múltiples lenguajes",
            "Completado automático de funciones",
            "Generación de tests",
            "Integración con IDEs populares",
            "Análisis de código",
            "Documentación automática",
            "Refactoring inteligente",
            "Detección de bugs",
            "API para desarrolladores"
        ],
        logo: "assets/images/tools/github-copilot.png",
        url: "https://github.com/features/copilot",
        detailedInfo: {
            pros: [
                "Sugerencias de código muy precisas",
                "Soporte para múltiples lenguajes de programación",
                "Integración perfecta con IDEs populares",
                "Completado automático de funciones",
                "Generación de tests automáticos",
                "Análisis de código inteligente",
                "Documentación automática",
                "Refactoring inteligente",
                "Detección de bugs",
                "API para desarrolladores"
            ],
            cons: [
                "Límites en el plan gratuito",
                "Puede sugerir código incorrecto",
                "Requiere conexión a internet",
                "Dependiente de la calidad del código existente",
                "Puede generar código inseguro",
                "Requiere revisión manual del código",
                "Costo elevado para uso intensivo",
                "Curva de aprendizaje inicial",
                "Dependiente de la infraestructura",
                "Limitado a programación"
            ],
            pricingPlans: [
                {
                    name: "Free",
                    price: "0€/mes",
                    features: [
                        "Sugerencias básicas",
                        "Lenguajes limitados",
                        "Soporte por correo electrónico",
                        "Integraciones básicas",
                        "Sin funciones avanzadas"
                    ],
                    popular: false
                },
                {
                    name: "Individual",
                    price: "10€/mes",
                    features: [
                        "Sugerencias avanzadas",
                        "Todos los lenguajes",
                        "Soporte prioritario",
                        "Integraciones avanzadas",
                        "Funciones experimentales"
                    ],
                    popular: true
                },
                {
                    name: "Business",
                    price: "19€/usuario/mes",
                    features: [
                        "Todo lo incluido en Individual",
                        "Colaboración en equipo",
                        "Administración avanzada",
                        "Soporte 24/7",
                        "Integraciones empresariales"
                    ],
                    popular: false
                }
            ],
            useCases: [
                "Desarrollo de software",
                "Generación de código",
                "Completado de funciones",
                "Generación de tests",
                "Refactoring de código",
                "Documentación automática",
                "Detección de bugs",
                "Análisis de código",
                "Colaboración en equipo",
                "Desarrollo de productos"
            ],
            alternatives: ["Tabnine", "Kite", "CodeWhisperer", "CodeT5", "Codex"],
            tutorialUrl: "https://docs.github.com/copilot"
        }
    },
    {
        id: 10,
        name: "Zapier AI",
        description: "Plataforma de automatización de workflows con IA para conectar aplicaciones y automatizar tareas repetitivas. Permite crear flujos de trabajo complejos sin programación, ideal para empresas que necesitan optimizar sus procesos operativos.",
        category: "productividad-automatizacion",
        tags: ["Automatización", "Workflows", "IA", "Productividad", "Integración"],
        pricing: "freemium",
        hasTutorial: true,
        hasFreePlan: true,
        features: [
            "Conectar más de 5,000 aplicaciones",
            "Automatización de workflows",
            "Triggers y acciones inteligentes",
            "Análisis de datos",
            "Integración con herramientas",
            "Colaboración en equipo",
            "Análisis de rendimiento",
            "API para desarrolladores",
            "Templates predefinidos",
            "Soporte para múltiples idiomas"
        ],
        logo: "assets/images/tools/zapier.png",
        url: "https://zapier.com",
        detailedInfo: {
            pros: [
                "Conecta más de 5,000 aplicaciones",
                "Automatización de workflows eficiente",
                "Triggers y acciones inteligentes",
                "Análisis de datos avanzado",
                "Integración con herramientas populares",
                "Colaboración en equipo eficiente",
                "Análisis de rendimiento detallado",
                "API para desarrolladores",
                "Templates predefinidos útiles",
                "Soporte para múltiples idiomas"
            ],
            cons: [
                "Límites en el plan gratuito",
                "Puede ser lento con workflows complejos",
                "Requiere conexión a internet",
                "Dependiente de la calidad de las integraciones",
                "Puede generar workflows incorrectos",
                "Requiere revisión manual de workflows",
                "Costo elevado para uso intensivo",
                "Curva de aprendizaje inicial",
                "Dependiente de la infraestructura",
                "Limitado a automatización"
            ],
            pricingPlans: [
                {
                    name: "Free",
                    price: "0€/mes",
                    features: [
                        "100 tareas/mes",
                        "5 Zaps",
                        "Soporte por correo electrónico",
                        "Integraciones básicas",
                        "Sin funciones avanzadas"
                    ],
                    popular: false
                },
                {
                    name: "Starter",
                    price: "20€/mes",
                    features: [
                        "750 tareas/mes",
                        "20 Zaps",
                        "Soporte prioritario",
                        "Integraciones avanzadas",
                        "Funciones experimentales"
                    ],
                    popular: true
                },
                {
                    name: "Professional",
                    price: "50€/mes",
                    features: [
                        "2,000 tareas/mes",
                        "Unlimited Zaps",
                        "Soporte 24/7",
                        "Integraciones personalizadas",
                        "Análisis avanzado"
                    ],
                    popular: false
                }
            ],
            useCases: [
                "Automatización de procesos empresariales",
                "Integración de aplicaciones",
                "Gestión de datos",
                "Colaboración en equipo",
                "Análisis de rendimiento",
                "Desarrollo de productos",
                "Marketing y ventas",
                "Gestión de contenido y redes sociales",
                "Automatización de soporte al cliente",
                "Gestión de proyectos y tareas"
            ],
            alternatives: ["Microsoft Power Automate", "IFTTT", "Integromat", "Automate.io", "n8n"],
            tutorialUrl: "https://zapier.com/learn"
        }
    },
    {
        id: 11,
        name: "NotebookLM",
        description: "Herramienta de IA de Google para crear y gestionar notebooks inteligentes. Permite organizar información, generar resúmenes automáticos, crear conexiones entre ideas y colaborar en proyectos de investigación de manera eficiente.",
        category: "contenido-escritura",
        tags: ["Notebook", "Google", "IA", "Investigación", "Colaboración"],
        pricing: "freemium",
        hasTutorial: true,
        hasFreePlan: true,
        features: [
            "Creación de notebooks inteligentes",
            "Resúmenes automáticos",
            "Conexiones entre ideas",
            "Colaboración en tiempo real",
            "Integración con Google Drive",
            "Búsqueda inteligente",
            "Generación de contenido",
            "Análisis de documentos",
            "Exportación en múltiples formatos",
            "API para desarrolladores"
        ],
        logo: "assets/images/tools/notebooklm.png",
        url: "https://notebooklm.google.com",
        detailedInfo: {
            pros: [
                "Interfaz intuitiva y fácil de usar",
                "Integración perfecta con Google Workspace",
                "Resúmenes automáticos precisos",
                "Conexiones inteligentes entre ideas",
                "Colaboración en tiempo real eficiente",
                "Búsqueda inteligente avanzada",
                "Generación de contenido de calidad",
                "Análisis de documentos automático",
                "Exportación en múltiples formatos",
                "API para desarrolladores"
            ],
            cons: [
                "Límites en el plan gratuito",
                "Requiere conexión a internet",
                "Dependiente de la infraestructura de Google",
                "Puede generar contenido genérico",
                "Requiere revisión manual del contenido",
                "Curva de aprendizaje inicial",
                "Limitado a ecosistema Google",
                "Puede ser lento con documentos largos",
                "Requiere configuración inicial",
                "Dependiente de la calidad del contenido"
            ],
            pricingPlans: [
                {
                    name: "Free",
                    price: "0€/mes",
                    features: [
                        "3 notebooks",
                        "Funciones básicas",
                        "Colaboración limitada",
                        "Soporte por correo electrónico",
                        "Integraciones básicas"
                    ],
                    popular: false
                },
                {
                    name: "Pro",
                    price: "10€/mes",
                    features: [
                        "Notebooks ilimitados",
                        "Todas las funciones",
                        "Colaboración avanzada",
                        "Soporte prioritario",
                        "Integraciones avanzadas"
                    ],
                    popular: true
                }
            ],
            useCases: [
                "Investigación académica",
                "Gestión de proyectos",
                "Colaboración en equipo",
                "Análisis de documentos",
                "Generación de contenido",
                "Organización de información",
                "Creación de presentaciones",
                "Desarrollo de ideas",
                "Análisis de datos",
                "Documentación de procesos"
            ],
            alternatives: ["Obsidian", "Notion", "Roam Research", "Logseq", "RemNote"],
            tutorialUrl: "https://support.google.com/notebooklm"
        }
    },
    {
        id: 12,
        name: "Linear",
        description: "Plataforma de gestión de proyectos y desarrollo de software con IA integrada. Diseñada para equipos de desarrollo, incluye seguimiento de issues, gestión de sprints, automatización de workflows y análisis de productividad.",
        category: "desarrollo-programacion",
        tags: ["Desarrollo", "Proyectos", "IA", "Software", "Colaboración"],
        pricing: "freemium",
        hasTutorial: true,
        hasFreePlan: true,
        features: [
            "Gestión de issues y bugs",
            "Seguimiento de sprints",
            "Automatización de workflows",
            "Análisis de productividad",
            "Integración con Git",
            "Colaboración en equipo",
            "API para desarrolladores",
            "Templates predefinidos",
            "Reportes automáticos",
            "Integración con herramientas"
        ],
        logo: "assets/images/tools/linear.png",
        url: "https://linear.app",
        detailedInfo: {
            pros: [
                "Interfaz moderna y rápida",
                "Gestión de issues eficiente",
                "Automatización de workflows avanzada",
                "Análisis de productividad detallado",
                "Integración perfecta con Git",
                "Colaboración en equipo eficiente",
                "API para desarrolladores",
                "Templates predefinidos útiles",
                "Reportes automáticos precisos",
                "Integración con herramientas populares"
            ],
            cons: [
                "Límites en el plan gratuito",
                "Requiere conexión a internet",
                "Dependiente de la infraestructura",
                "Puede ser complejo para equipos pequeños",
                "Requiere configuración inicial",
                "Curva de aprendizaje inicial",
                "Dependiente de la calidad de los datos",
                "Puede generar reportes incorrectos",
                "Requiere revisión manual de workflows",
                "Limitado a desarrollo de software"
            ],
            pricingPlans: [
                {
                    name: "Free",
                    price: "0€/mes",
                    features: [
                        "Hasta 10 usuarios",
                        "Funciones básicas",
                        "Soporte por correo electrónico",
                        "Integraciones básicas",
                        "Sin funciones avanzadas"
                    ],
                    popular: false
                },
                {
                    name: "Standard",
                    price: "8€/usuario/mes",
                    features: [
                        "Usuarios ilimitados",
                        "Todas las funciones",
                        "Soporte prioritario",
                        "Integraciones avanzadas",
                        "Funciones experimentales"
                    ],
                    popular: true
                }
            ],
            useCases: [
                "Desarrollo de software",
                "Gestión de proyectos",
                "Seguimiento de bugs",
                "Colaboración en equipo",
                "Análisis de productividad",
                "Automatización de workflows",
                "Integración con Git",
                "Reportes automáticos",
                "Desarrollo de productos",
                "Gestión de sprints"
            ],
            alternatives: ["Jira", "Asana", "Monday.com", "Trello", "ClickUp"],
            tutorialUrl: "https://linear.app/docs"
        }
    },
    {
        id: 13,
        name: "Jira",
        description: "Plataforma de gestión de proyectos y seguimiento de issues desarrollada por Atlassian. Incluye herramientas avanzadas para equipos de desarrollo, gestión de sprints, reportes detallados y integración con herramientas de desarrollo.",
        category: "desarrollo-programacion",
        tags: ["Desarrollo", "Proyectos", "Atlassian", "Software", "Colaboración"],
        pricing: "freemium",
        hasTutorial: true,
        hasFreePlan: true,
        features: [
            "Gestión de issues y bugs",
            "Seguimiento de sprints",
            "Reportes detallados",
            "Integración con herramientas",
            "Colaboración en equipo",
            "Automatización de workflows",
            "API para desarrolladores",
            "Templates predefinidos",
            "Análisis de rendimiento",
            "Integración con Git"
        ],
        logo: "assets/images/tools/jira.png",
        url: "https://www.atlassian.com/software/jira",
        detailedInfo: {
            pros: [
                "Plataforma robusta y confiable",
                "Gestión de issues muy completa",
                "Reportes detallados y personalizables",
                "Integración con muchas herramientas",
                "Colaboración en equipo eficiente",
                "Automatización de workflows avanzada",
                "API para desarrolladores",
                "Templates predefinidos útiles",
                "Análisis de rendimiento detallado",
                "Integración perfecta con Git"
            ],
            cons: [
                "Puede ser complejo para equipos pequeños",
                "Requiere configuración inicial extensa",
                "Curva de aprendizaje empinada",
                "Puede ser lento con muchos datos",
                "Requiere conexión a internet",
                "Dependiente de la infraestructura",
                "Puede generar reportes incorrectos",
                "Requiere revisión manual de workflows",
                "Costo elevado para equipos grandes",
                "Limitado a gestión de proyectos"
            ],
            pricingPlans: [
                {
                    name: "Free",
                    price: "0€/mes",
                    features: [
                        "Hasta 10 usuarios",
                        "Funciones básicas",
                        "Soporte por correo electrónico",
                        "Integraciones básicas",
                        "Sin funciones avanzadas"
                    ],
                    popular: false
                },
                {
                    name: "Standard",
                    price: "7.50€/usuario/mes",
                    features: [
                        "Usuarios ilimitados",
                        "Todas las funciones",
                        "Soporte prioritario",
                        "Integraciones avanzadas",
                        "Funciones experimentales"
                    ],
                    popular: true
                }
            ],
            useCases: [
                "Desarrollo de software",
                "Gestión de proyectos",
                "Seguimiento de bugs",
                "Colaboración en equipo",
                "Análisis de rendimiento",
                "Automatización de workflows",
                "Integración con Git",
                "Reportes detallados",
                "Desarrollo de productos",
                "Gestión de sprints"
            ],
            alternatives: ["Linear", "Asana", "Monday.com", "Trello", "ClickUp"],
            tutorialUrl: "https://support.atlassian.com/jira"
        }
    },
    {
        id: 14,
        name: "Gemini Studio",
        description: "Plataforma de IA de Google para crear y gestionar aplicaciones de inteligencia artificial. Incluye herramientas para entrenar modelos, crear chatbots, analizar datos y desarrollar soluciones de IA personalizadas.",
        category: "desarrollo-programacion",
        tags: ["IA", "Google", "Desarrollo", "Machine Learning", "APIs"],
        pricing: "freemium",
        hasTutorial: true,
        hasFreePlan: true,
        features: [
            "Creación de modelos de IA",
            "Entrenamiento de modelos",
            "Creación de chatbots",
            "Análisis de datos",
            "APIs para desarrolladores",
            "Integración con Google Cloud",
            "Colaboración en equipo",
            "Templates predefinidos",
            "Análisis de rendimiento",
            "Despliegue de modelos"
        ],
        logo: "assets/images/tools/gemini-studio.png",
        url: "https://aistudio.google.com",
        detailedInfo: {
            pros: [
                "Plataforma potente de IA",
                "Integración perfecta con Google Cloud",
                "Creación de modelos avanzada",
                "Entrenamiento de modelos eficiente",
                "Creación de chatbots intuitiva",
                "Análisis de datos detallado",
                "APIs para desarrolladores",
                "Colaboración en equipo eficiente",
                "Templates predefinidos útiles",
                "Despliegue de modelos fácil"
            ],
            cons: [
                "Límites en el plan gratuito",
                "Requiere conocimientos técnicos",
                "Curva de aprendizaje empinada",
                "Requiere conexión a internet",
                "Dependiente de la infraestructura de Google",
                "Puede ser lento con modelos complejos",
                "Requiere configuración inicial",
                "Dependiente de la calidad de los datos",
                "Puede generar modelos incorrectos",
                "Requiere revisión manual de modelos"
            ],
            pricingPlans: [
                {
                    name: "Free",
                    price: "0€/mes",
                    features: [
                        "Funciones básicas",
                        "Límites de uso",
                        "Soporte por correo electrónico",
                        "Integraciones básicas",
                        "Sin funciones avanzadas"
                    ],
                    popular: false
                },
                {
                    name: "Pro",
                    price: "20€/mes",
                    features: [
                        "Todas las funciones",
                        "Sin límites de uso",
                        "Soporte prioritario",
                        "Integraciones avanzadas",
                        "Funciones experimentales"
                    ],
                    popular: true
                }
            ],
            useCases: [
                "Desarrollo de aplicaciones de IA",
                "Creación de chatbots",
                "Análisis de datos",
                "Entrenamiento de modelos",
                "Desarrollo de productos",
                "Colaboración en equipo",
                "Análisis de rendimiento",
                "Despliegue de modelos",
                "Desarrollo de APIs",
                "Investigación en IA"
            ],
            alternatives: ["OpenAI API", "Hugging Face", "Azure AI", "AWS SageMaker", "TensorFlow"],
            tutorialUrl: "https://aistudio.google.com/learn"
        }
    },
    {
        id: 15,
        name: "Figma AI",
        description: "Herramienta de diseño con IA integrada para crear interfaces de usuario, prototipos y diseños colaborativos. Incluye generación automática de componentes, sugerencias de diseño y automatización de tareas de diseño.",
        category: "arte-ilustracion",
        tags: ["Diseño", "UI/UX", "IA", "Colaboración", "Prototipos"],
        pricing: "freemium",
        hasTutorial: true,
        hasFreePlan: true,
        features: [
            "Diseño de interfaces",
            "Creación de prototipos",
            "Colaboración en tiempo real",
            "Generación automática de componentes",
            "Sugerencias de diseño",
            "Automatización de tareas",
            "Integración con herramientas",
            "Templates predefinidos",
            "Análisis de diseño",
            "Exportación en múltiples formatos"
        ],
        logo: "assets/images/tools/figma.png",
        url: "https://www.figma.com",
        detailedInfo: {
            pros: [
                "Herramienta de diseño muy potente",
                "Colaboración en tiempo real eficiente",
                "Generación automática de componentes",
                "Sugerencias de diseño útiles",
                "Automatización de tareas eficiente",
                "Integración con muchas herramientas",
                "Templates predefinidos útiles",
                "Análisis de diseño detallado",
                "Exportación en múltiples formatos",
                "API para desarrolladores"
            ],
            cons: [
                "Límites en el plan gratuito",
                "Requiere conexión a internet",
                "Dependiente de la infraestructura",
                "Puede ser lento con diseños complejos",
                "Requiere conocimientos de diseño",
                "Curva de aprendizaje inicial",
                "Dependiente de la calidad del contenido",
                "Puede generar diseños genéricos",
                "Requiere revisión manual de diseños",
                "Limitado a diseño de interfaces"
            ],
            pricingPlans: [
                {
                    name: "Free",
                    price: "0€/mes",
                    features: [
                        "3 proyectos",
                        "Funciones básicas",
                        "Colaboración limitada",
                        "Soporte por correo electrónico",
                        "Integraciones básicas"
                    ],
                    popular: false
                },
                {
                    name: "Professional",
                    price: "12€/usuario/mes",
                    features: [
                        "Proyectos ilimitados",
                        "Todas las funciones",
                        "Colaboración avanzada",
                        "Soporte prioritario",
                        "Integraciones avanzadas"
                    ],
                    popular: true
                }
            ],
            useCases: [
                "Diseño de interfaces de usuario",
                "Creación de prototipos",
                "Colaboración en equipo",
                "Generación de componentes",
                "Análisis de diseño",
                "Desarrollo de productos",
                "Creación de presentaciones",
                "Diseño de marketing",
                "Desarrollo de aplicaciones",
                "Creación de contenido visual"
            ],
            alternatives: ["Sketch", "Adobe XD", "InVision", "Framer", "Principle"],
            tutorialUrl: "https://help.figma.com"
        }
    }
];

// Función para obtener una app por ID
function getAppById(id) {
    return appsData.find(app => app.id === id);
}

// Exportar los datos
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { appsData, getAppById };
}
