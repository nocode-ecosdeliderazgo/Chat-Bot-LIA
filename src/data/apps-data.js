// Apps Data - Datos de las aplicaciones de IA

const appsData = [
    {
        id: 1,
        name: "ChatGPT",
        description: "Asistente de IA conversacional para múltiples tareas",
        category: "contenido-escritura",
        tags: ["Chat", "Escritura", "Productividad"],
        pricing: "freemium",
        hasTutorial: true,
        hasFreePlan: true,
        features: ["Conversación natural", "Múltiples idiomas", "Análisis de texto", "Generación de contenido"],
        logo: "src/assets/images/tools/chatgpt.png",
        url: "https://chat.openai.com",
        // Información detallada para el modal
        detailedInfo: {
            pros: [
                "Respuestas rápidas y precisas",
                "Soporte para múltiples idiomas",
                "Integración con herramientas populares",
                "Actualizaciones constantes del modelo"
            ],
            cons: [
                "Límites de uso en plan gratuito",
                "Puede generar información incorrecta",
                "Requiere conexión a internet",
                "Dependiente de la calidad del prompt"
            ],
            pricingPlans: [
                {
                    name: "Gratuito",
                    price: "0€/mes",
                    features: ["Acceso básico", "Límite de mensajes", "Modelo GPT-3.5"],
                    popular: false
                },
                {
                    name: "Plus",
                    price: "20€/mes",
                    features: ["Acceso a GPT-4", "Sin límites de uso", "Respuestas más rápidas", "Nuevas funciones"],
                    popular: true
                },
                {
                    name: "Team",
                    price: "25€/usuario/mes",
                    features: ["Todo de Plus", "Colaboración en equipo", "Administración avanzada", "Soporte prioritario"],
                    popular: false
                }
            ],
            useCases: [
                "Generación de contenido creativo",
                "Asistencia en programación",
                "Análisis de datos y textos",
                "Tutoría y aprendizaje"
            ],
            alternatives: ["Claude", "Bard", "Perplexity", "You.com"],
            tutorialUrl: "https://help.openai.com/en/collections/3742473-chatgpt-basics"
        }
    },
    {
        id: 2,
        name: "Midjourney",
        description: "Generador de imágenes con IA de alta calidad",
        category: "arte-ilustracion",
        tags: ["Imágenes", "Arte", "Creatividad"],
        pricing: "de-pago",
        hasTutorial: true,
        hasFreePlan: false,
        features: ["Generación de imágenes", "Estilos artísticos", "Alta resolución", "Prompt engineering"],
        logo: "src/assets/images/tools/midjourney.png",
        url: "https://midjourney.com",
        detailedInfo: {
            pros: [
                "Calidad artística excepcional",
                "Gran variedad de estilos",
                "Comunidad activa y creativa",
                "Resultados únicos y originales"
            ],
            cons: [
                "Solo disponible en Discord",
                "Proceso de generación lento",
                "Curva de aprendizaje para prompts",
                "Sin plan gratuito"
            ],
            pricingPlans: [
                {
                    name: "Básico",
                    price: "10€/mes",
                    features: ["200 imágenes/mes", "Acceso a Discord", "Generación estándar"],
                    popular: false
                },
                {
                    name: "Estándar",
                    price: "30€/mes",
                    features: ["15 horas de GPU", "Generación rápida", "Acceso prioritario"],
                    popular: true
                },
                {
                    name: "Pro",
                    price: "60€/mes",
                    features: ["30 horas de GPU", "Modo relajado", "Uso comercial"],
                    popular: false
                }
            ],
            useCases: [
                "Arte conceptual y digital",
                "Ilustraciones para libros",
                "Diseño de personajes",
                "Contenido para redes sociales"
            ],
            alternatives: ["DALL-E 3", "Stable Diffusion", "Adobe Firefly", "Canva AI"],
            tutorialUrl: "https://docs.midjourney.com/docs/quick-start"
        }
    },
    {
        id: 3,
        name: "GitHub Copilot",
        description: "Asistente de programación con IA",
        category: "desarrollo-programacion",
        tags: ["Código", "Programación", "Desarrollo"],
        pricing: "de-pago",
        hasTutorial: true,
        hasFreePlan: false,
        features: ["Autocompletado inteligente", "Sugerencias de código", "Múltiples lenguajes", "Integración IDE"],
        logo: "src/assets/images/tools/github-copilot.png",
        url: "https://github.com/features/copilot",
        detailedInfo: {
            pros: [
                "Acelera significativamente el desarrollo",
                "Soporte para múltiples lenguajes",
                "Integración perfecta con IDEs",
                "Aprendizaje contextual del código"
            ],
            cons: [
                "Puede sugerir código inseguro",
                "Requiere revisión manual",
                "Dependiente de la calidad del contexto",
                "Costo mensual elevado"
            ],
            pricingPlans: [
                {
                    name: "Individual",
                    price: "10€/mes",
                    features: ["Sugerencias ilimitadas", "Integración IDE", "Soporte técnico"],
                    popular: true
                },
                {
                    name: "Business",
                    price: "19€/usuario/mes",
                    features: ["Todo de Individual", "Gestión empresarial", "Políticas de privacidad"],
                    popular: false
                },
                {
                    name: "Enterprise",
                    price: "39€/usuario/mes",
                    features: ["Todo de Business", "SSO", "Auditoría avanzada", "Soporte prioritario"],
                    popular: false
                }
            ],
            useCases: [
                "Desarrollo de aplicaciones web",
                "Scripts de automatización",
                "Análisis de datos",
                "Prototipado rápido"
            ],
            alternatives: ["Tabnine", "CodeWhisperer", "Codeium", "Kite"],
            tutorialUrl: "https://docs.github.com/en/copilot"
        }
    },
    {
        id: 4,
        name: "Notion AI",
        description: "Asistente de IA integrado en Notion para productividad",
        category: "productividad-automatizacion",
        tags: ["Productividad", "Notas", "Organización"],
        pricing: "freemium",
        hasTutorial: true,
        hasFreePlan: true,
        features: ["Generación de contenido", "Resúmenes automáticos", "Organización inteligente", "Templates"],
        logo: "src/assets/images/tools/notion.png",
        url: "https://notion.so",
        detailedInfo: {
            pros: [
                "Integración perfecta con Notion",
                "Generación de contenido contextual",
                "Resúmenes automáticos inteligentes",
                "Templates personalizados"
            ],
            cons: [
                "Límites en plan gratuito",
                "Requiere suscripción de Notion",
                "Dependiente de la estructura de Notion",
                "Curva de aprendizaje inicial"
            ],
            pricingPlans: [
                {
                    name: "Gratuito",
                    price: "0€/mes",
                    features: ["20 respuestas de IA/mes", "Bloques básicos", "Colaboración limitada"],
                    popular: false
                },
                {
                    name: "Plus",
                    price: "8€/usuario/mes",
                    features: ["Respuestas ilimitadas", "Historial ilimitado", "Colaboración avanzada"],
                    popular: true
                },
                {
                    name: "Business",
                    price: "15€/usuario/mes",
                    features: ["Todo de Plus", "Administración avanzada", "Integraciones empresariales"],
                    popular: false
                }
            ],
            useCases: [
                "Gestión de proyectos",
                "Documentación técnica",
                "Planificación de contenido",
                "Análisis de datos"
            ],
            alternatives: ["Obsidian", "Roam Research", "Logseq", "Craft"],
            tutorialUrl: "https://www.notion.so/help/using-notion-ai"
        }
    },
    {
        id: 5,
        name: "Runway ML",
        description: "Suite de herramientas de IA para creación de video",
        category: "video",
        tags: ["Video", "Edición", "IA"],
        pricing: "freemium",
        hasTutorial: true,
        hasFreePlan: true,
        features: ["Edición de video con IA", "Efectos especiales", "Generación de contenido", "Automatización"],
        logo: "src/assets/images/tools/runway.png",
        url: "https://runwayml.com",
        detailedInfo: {
            pros: [
                "Herramientas de IA avanzadas para video",
                "Interfaz intuitiva y moderna",
                "Efectos especiales impresionantes",
                "Integración con herramientas profesionales"
            ],
            cons: [
                "Límites de uso en plan gratuito",
                "Procesamiento puede ser lento",
                "Requiere hardware potente",
                "Curva de aprendizaje para funciones avanzadas"
            ],
            pricingPlans: [
                {
                    name: "Gratuito",
                    price: "0€/mes",
                    features: ["125 créditos/mes", "Videos de 4 segundos", "Resolución estándar"],
                    popular: false
                },
                {
                    name: "Standard",
                    price: "12€/mes",
                    features: ["625 créditos/mes", "Videos de 18 segundos", "Resolución HD"],
                    popular: true
                },
                {
                    name: "Pro",
                    price: "28€/mes",
                    features: ["2250 créditos/mes", "Videos de 18 segundos", "Resolución 4K", "Uso comercial"],
                    popular: false
                }
            ],
            useCases: [
                "Creación de contenido para redes sociales",
                "Efectos especiales para películas",
                "Publicidad y marketing",
                "Arte digital experimental"
            ],
            alternatives: ["Pika Labs", "Stable Video Diffusion", "Synthesia", "D-ID"],
            tutorialUrl: "https://runwayml.com/help"
        }
    },
    {
        id: 6,
        name: "Claude",
        description: "Asistente de IA avanzado para análisis y escritura",
        category: "contenido-escritura",
        tags: ["Chat", "Análisis", "Productividad"],
        pricing: "freemium",
        hasTutorial: true,
        hasFreePlan: true,
        features: ["Análisis avanzado", "Escritura creativa", "Razonamiento complejo", "Múltiples formatos"],
        logo: "src/assets/images/tools/claude.png",
        url: "https://claude.ai",
        detailedInfo: {
            pros: [
                "Análisis profundo y contextual",
                "Excelente para tareas de escritura",
                "Razonamiento lógico avanzado",
                "Interfaz conversacional natural"
            ],
            cons: [
                "Límites de uso en plan gratuito",
                "Puede ser más lento que ChatGPT",
                "Menos integraciones disponibles",
                "Modelo menos actualizado"
            ],
            pricingPlans: [
                {
                    name: "Gratuito",
                    price: "0€/mes",
                    features: ["5 mensajes/día", "Acceso básico", "Modelo Claude 3 Haiku"],
                    popular: false
                },
                {
                    name: "Pro",
                    price: "20€/mes",
                    features: ["Mensajes ilimitados", "Acceso a Claude 3.5 Sonnet", "Análisis de archivos"],
                    popular: true
                },
                {
                    name: "Team",
                    price: "30€/usuario/mes",
                    features: ["Todo de Pro", "Colaboración en equipo", "Administración avanzada"],
                    popular: false
                }
            ],
            useCases: [
                "Análisis de documentos largos",
                "Escritura técnica y creativa",
                "Investigación y resúmenes",
                "Asistencia en programación"
            ],
            alternatives: ["ChatGPT", "Bard", "Perplexity", "You.com"],
            tutorialUrl: "https://claude.ai/help"
        }
    },
    {
        id: 7,
        name: "DALL-E 3",
        description: "Generador de imágenes con inteligencia artificial",
        category: "arte-ilustracion",
        tags: ["Imágenes", "Arte", "Generación"],
        pricing: "de-pago",
        hasTutorial: true,
        hasFreePlan: false,
        features: ["Generación de imágenes", "Alta calidad", "Estilos diversos", "Prompt avanzado"],
        logo: "src/assets/images/tools/dalle.png",
        url: "https://openai.com/dall-e-3",
        detailedInfo: {
            pros: [
                "Calidad de imagen excepcional",
                "Comprensión avanzada del lenguaje",
                "Integración con ChatGPT",
                "Resultados coherentes y detallados"
            ],
            cons: [
                "Solo disponible con suscripción de ChatGPT",
                "Límites de generación diaria",
                "No hay plan gratuito",
                "Requiere prompts bien estructurados"
            ],
            pricingPlans: [
                {
                    name: "ChatGPT Plus",
                    price: "20€/mes",
                    features: ["Acceso a DALL-E 3", "50 imágenes/día", "Resolución 1024x1024"],
                    popular: true
                },
                {
                    name: "ChatGPT Team",
                    price: "25€/usuario/mes",
                    features: ["Todo de Plus", "Colaboración en equipo", "Uso comercial"],
                    popular: false
                }
            ],
            useCases: [
                "Ilustraciones para contenido",
                "Diseño de productos",
                "Arte conceptual",
                "Contenido para redes sociales"
            ],
            alternatives: ["Midjourney", "Stable Diffusion", "Adobe Firefly", "Canva AI"],
            tutorialUrl: "https://help.openai.com/en/collections/3742473-chatgpt-basics"
        }
    },
    {
        id: 8,
        name: "Figma AI",
        description: "Herramienta de diseño con funciones de IA",
        category: "arte-ilustracion",
        tags: ["Diseño", "UI/UX", "Creatividad"],
        pricing: "freemium",
        hasTutorial: true,
        hasFreePlan: true,
        features: ["Diseño colaborativo", "Componentes inteligentes", "Prototipado", "Integración"],
        logo: "src/assets/images/tools/figma.png",
        url: "https://figma.com",
        detailedInfo: {
            pros: [
                "Diseño colaborativo en tiempo real",
                "Componentes reutilizables",
                "Prototipado interactivo",
                "Integración con herramientas de desarrollo"
            ],
            cons: [
                "Límites en plan gratuito",
                "Requiere conexión a internet",
                "Curva de aprendizaje inicial",
                "Dependiente de la calidad del hardware"
            ],
            pricingPlans: [
                {
                    name: "Gratuito",
                    price: "0€/mes",
                    features: ["3 proyectos", "Colaboración básica", "Componentes básicos"],
                    popular: false
                },
                {
                    name: "Professional",
                    price: "12€/editor/mes",
                    features: ["Proyectos ilimitados", "Colaboración avanzada", "Componentes avanzados"],
                    popular: true
                },
                {
                    name: "Organization",
                    price: "45€/editor/mes",
                    features: ["Todo de Professional", "Administración avanzada", "Integraciones empresariales"],
                    popular: false
                }
            ],
            useCases: [
                "Diseño de interfaces de usuario",
                "Prototipado de aplicaciones",
                "Diseño de sistemas",
                "Colaboración en equipos de diseño"
            ],
            alternatives: ["Sketch", "Adobe XD", "Framer", "Principle"],
            tutorialUrl: "https://help.figma.com/hc/en-us"
        }
    },
    {
        id: 9,
        name: "Loom AI",
        description: "Grabación de pantalla con resúmenes automáticos",
        category: "video",
        tags: ["Video", "Grabación", "Productividad"],
        pricing: "freemium",
        hasTutorial: true,
        hasFreePlan: true,
        features: ["Grabación de pantalla", "Resúmenes automáticos", "Transcripción", "Compartir fácil"],
        logo: "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDgiIGhlaWdodD0iNDgiIHZpZXdCb3g9IjAgMCA0OCA0OCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjQ4IiBoZWlnaHQ9IjQ4IiByeD0iOCIgZmlsbD0iIzYzNjZGMSIvPgo8cGF0aCBkPSJNMjQgMTJDMjkuNTIyOCAxMiAzNCAxNi40NzcyIDM0IDIyQzM0IDI3LjUyMjggMjkuNTIyOCAzMiAyNCAzMkMxOC40NzcyIDMyIDE0IDI3LjUyMjggMTQgMjJDMTQgMTYuNDc3MiAxOC40NzcyIDEyIDI0IDEyWiIgZmlsbD0iI0ZGRkZGRiIvPgo8L3N2Zz4K",
        url: "https://loom.com",
        detailedInfo: {
            pros: [
                "Grabación de pantalla fácil y rápida",
                "Resúmenes automáticos con IA",
                "Transcripción automática",
                "Compartir y colaborar fácilmente"
            ],
            cons: [
                "Límites de duración en plan gratuito",
                "Calidad de transcripción variable",
                "Requiere conexión a internet",
                "Dependiente de la calidad del audio"
            ],
            pricingPlans: [
                {
                    name: "Gratuito",
                    price: "0€/mes",
                    features: ["25 videos/mes", "5 minutos máximo", "Transcripción básica"],
                    popular: false
                },
                {
                    name: "Business",
                    price: "8€/usuario/mes",
                    features: ["Videos ilimitados", "45 minutos máximo", "Transcripción avanzada"],
                    popular: true
                },
                {
                    name: "Enterprise",
                    price: "16€/usuario/mes",
                    features: ["Todo de Business", "Administración avanzada", "Integraciones empresariales"],
                    popular: false
                }
            ],
            useCases: [
                "Tutoriales y capacitación",
                "Comunicación asíncrona",
                "Documentación de procesos",
                "Feedback y revisiones"
            ],
            alternatives: ["Screencastify", "Camtasia", "OBS Studio", "QuickTime"],
            tutorialUrl: "https://help.loom.com/hc/en-us"
        }
    },
    {
        id: 10,
        name: "Zapier AI",
        description: "Automatización inteligente de flujos de trabajo",
        category: "productividad-automatizacion",
        tags: ["Automatización", "Flujos", "Productividad"],
        pricing: "freemium",
        hasTutorial: true,
        hasFreePlan: true,
        features: ["Automatización de tareas", "Integraciones múltiples", "Flujos de trabajo", "Triggers inteligentes"],
        logo: "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDgiIGhlaWdodD0iNDgiIHZpZXdCb3g9IjAgMCA0OCA0OCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjQ4IiBoZWlnaHQ9IjQ4IiByeD0iOCIgZmlsbD0iI0ZGNkEwMCIvPgo8cGF0aCBkPSJNMjQgMTJDMjkuNTIyOCAxMiAzNCAxNi40NzcyIDM0IDIyQzM0IDI3LjUyMjggMjkuNTIyOCAzMiAyNCAzMkMxOC40NzcyIDMyIDE0IDI3LjUyMjggMTQgMjJDMTQgMTYuNDc3MiAxOC40NzcyIDEyIDI0IDEyWiIgZmlsbD0iI0ZGRkZGRiIvPgo8L3N2Zz4K",
        url: "https://zapier.com",
        detailedInfo: {
            pros: [
                "Miles de integraciones disponibles",
                "Automatización sin código",
                "Flujos de trabajo complejos",
                "Triggers inteligentes y condicionales"
            ],
            cons: [
                "Límites de ejecuciones en plan gratuito",
                "Curva de aprendizaje para flujos complejos",
                "Dependiente de la calidad de las integraciones",
                "Costo puede ser elevado para uso intensivo"
            ],
            pricingPlans: [
                {
                    name: "Gratuito",
                    price: "0€/mes",
                    features: ["5 Zaps", "100 tareas/mes", "Integraciones básicas"],
                    popular: false
                },
                {
                    name: "Starter",
                    price: "20€/mes",
                    features: ["20 Zaps", "750 tareas/mes", "Integraciones avanzadas"],
                    popular: true
                },
                {
                    name: "Professional",
                    price: "50€/mes",
                    features: ["Unlimited Zaps", "2000 tareas/mes", "Triggers condicionales"],
                    popular: false
                }
            ],
            useCases: [
                "Automatización de marketing",
                "Gestión de leads y CRM",
                "Sincronización de datos",
                "Notificaciones y alertas"
            ],
            alternatives: ["Microsoft Power Automate", "IFTTT", "Integromat", "Automate.io"],
            tutorialUrl: "https://zapier.com/learn"
        }
    }
];

// Función para obtener todas las aplicaciones
function getAllApps() {
    console.log('📱 [APPS-DATA] Cargando', appsData.length, 'aplicaciones...');
    return appsData;
}

// Función para obtener aplicaciones por categoría
function getAppsByCategory(category) {
    return appsData.filter(app => app.category === category);
}

// Función para buscar aplicaciones
function searchApps(query) {
    const searchQuery = query.toLowerCase();
    return appsData.filter(app => 
        app.name.toLowerCase().includes(searchQuery) ||
        app.description.toLowerCase().includes(searchQuery) ||
        app.tags.some(tag => tag.toLowerCase().includes(searchQuery))
    );
}

// Función para obtener una aplicación por ID
function getAppById(id) {
    return appsData.find(app => app.id === parseInt(id));
}

console.log('✅ [APPS-DATA] Archivo de datos cargado correctamente');
