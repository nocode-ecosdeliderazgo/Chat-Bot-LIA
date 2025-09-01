// Apps Data - Datos de las aplicaciones de IA

const appsData = [
    {
        id: 1,
        name: "ChatGPT",
        description: "Asistente de IA conversacional para múltiples tareas",
        category: "contenido-escritura",
        tags: ["Chat", "Escritura", "Productividad"],
        pricing: "freemium",
        logo: "https://cdn.openai.com/API/logo-openai.svg",
        url: "https://chat.openai.com"
    },
    {
        id: 2,
        name: "Midjourney",
        description: "Generador de imágenes con IA de alta calidad",
        category: "arte-ilustracion",
        tags: ["Imágenes", "Arte", "Creatividad"],
        pricing: "premium",
        logo: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/javascript/javascript-original.svg",
        url: "https://midjourney.com"
    },
    {
        id: 3,
        name: "GitHub Copilot",
        description: "Asistente de programación con IA",
        category: "desarrollo-programacion",
        tags: ["Código", "Programación", "Desarrollo"],
        pricing: "premium",
        logo: "https://github.githubassets.com/images/modules/logos_page/GitHub-Mark.png",
        url: "https://github.com/features/copilot"
    },
    {
        id: 4,
        name: "Notion AI",
        description: "Asistente de IA integrado en Notion para productividad",
        category: "productividad",
        tags: ["Productividad", "Notas", "Organización"],
        pricing: "freemium",
        logo: "https://www.notion.so/cdn-cgi/image/format=auto,width=256,quality=100/front-static/shared/icons/notion-app-icon-3d.png",
        url: "https://notion.so"
    },
    {
        id: 5,
        name: "Runway ML",
        description: "Suite de herramientas de IA para creación de video",
        category: "video",
        tags: ["Video", "Edición", "IA"],
        pricing: "freemium",
        logo: "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDgiIGhlaWdodD0iNDgiIHZpZXdCb3g9IjAgMCA0OCA0OCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjQ4IiBoZWlnaHQ9IjQ4IiByeD0iOCIgZmlsbD0iIzQ0RTVGRiIvPgo8cGF0aCBkPSJNMjQgMTJDMjkuNTIyOCAxMiAzNCAxNi40NzcyIDM0IDIyQzM0IDI3LjUyMjggMjkuNTIyOCAzMiAyNCAzMkMxOC40NzcyIDMyIDE0IDI3LjUyMjggMTQgMjJDMTQgMTYuNDc3MiAxOC40NzcyIDEyIDI0IDEyWiIgZmlsbD0iIzBBMEEwQSIvPgo8L3N2Zz4K",
        url: "https://runwayml.com"
    },
    {
        id: 6,
        name: "Claude",
        description: "Asistente de IA avanzado para análisis y escritura",
        category: "contenido-escritura",
        tags: ["Chat", "Análisis", "Productividad"],
        pricing: "freemium",
        logo: "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDgiIGhlaWdodD0iNDgiIHZpZXdCb3g9IjAgMCA0OCA0OCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjQ4IiBoZWlnaHQ9IjQ4IiByeD0iOCIgZmlsbD0iI0Y4NzE3MSIvPgo8cGF0aCBkPSJNMjQgMTJDMjkuNTIyOCAxMiAzNCAxNi40NzcyIDM0IDIyQzM0IDI3LjUyMjggMjkuNTIyOCAzMiAyNCAzMkMxOC40NzcyIDMyIDE0IDI3LjUyMjggMTQgMjJDMTQgMTYuNDc3MiAxOC40NzcyIDEyIDI0IDEyWiIgZmlsbD0iI0ZGRkZGRiIvPgo8L3N2Zz4K",
        url: "https://claude.ai"
    },
    {
        id: 7,
        name: "DALL-E 3",
        description: "Generador de imágenes con inteligencia artificial",
        category: "arte-ilustracion",
        tags: ["Imágenes", "Arte", "Generación"],
        pricing: "premium",
        logo: "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDgiIGhlaWdodD0iNDgiIHZpZXdCb3g9IjAgMCA0OCA0OCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjQ4IiBoZWlnaHQ9IjQ4IiByeD0iOCIgZmlsbD0iIzEwQjk4MSIvPgo8cGF0aCBkPSJNMjQgMTJDMjkuNTIyOCAxMiAzNCAxNi40NzcyIDM0IDIyQzM0IDI3LjUyMjggMjkuNTIyOCAzMiAyNCAzMkMxOC40NzcyIDMyIDE0IDI3LjUyMjggMTQgMjJDMTQgMTYuNDc3MiAxOC40NzcyIDEyIDI0IDEyWiIgZmlsbD0iI0ZGRkZGRiIvPgo8L3N2Zz4K",
        url: "https://openai.com/dall-e-3"
    },
    {
        id: 8,
        name: "Figma AI",
        description: "Herramienta de diseño con funciones de IA",
        category: "arte-ilustracion",
        tags: ["Diseño", "UI/UX", "Creatividad"],
        pricing: "freemium",
        logo: "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDgiIGhlaWdodD0iNDgiIHZpZXdCb3g9IjAgMCA0OCA0OCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjQ4IiBoZWlnaHQ9IjQ4IiByeD0iOCIgZmlsbD0iI0Y0NEU1QyIvPgo8cGF0aCBkPSJNMjQgMTJDMjkuNTIyOCAxMiAzNCAxNi40NzcyIDM0IDIyQzM0IDI3LjUyMjggMjkuNTIyOCAzMiAyNCAzMkMxOC40NzcyIDMyIDE0IDI3LjUyMjggMTQgMjJDMTQgMTYuNDc3MiAxOC40NzcyIDEyIDI0IDEyWiIgZmlsbD0iI0ZGRkZGRiIvPgo8L3N2Zz4K",
        url: "https://figma.com"
    },
    {
        id: 9,
        name: "Loom AI",
        description: "Grabación de pantalla con resúmenes automáticos",
        category: "video",
        tags: ["Video", "Grabación", "Productividad"],
        pricing: "freemium",
        logo: "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDgiIGhlaWdodD0iNDgiIHZpZXdCb3g9IjAgMCA0OCA0OCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjQ4IiBoZWlnaHQ9IjQ4IiByeD0iOCIgZmlsbD0iIzYzNjZGMSIvPgo8cGF0aCBkPSJNMjQgMTJDMjkuNTIyOCAxMiAzNCAxNi40NzcyIDM0IDIyQzM0IDI3LjUyMjggMjkuNTIyOCAzMiAyNCAzMkMxOC40NzcyIDMyIDE0IDI3LjUyMjggMTQgMjJDMTQgMTYuNDc3MiAxOC40NzcyIDEyIDI0IDEyWiIgZmlsbD0iI0ZGRkZGRiIvPgo8L3N2Zz4K",
        url: "https://loom.com"
    },
    {
        id: 10,
        name: "Zapier AI",
        description: "Automatización inteligente de flujos de trabajo",
        category: "productividad-automatizacion",
        tags: ["Automatización", "Flujos", "Productividad"],
        pricing: "freemium",
        logo: "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDgiIGhlaWdodD0iNDgiIHZpZXdCb3g9IjAgMCA0OCA0OCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjQ4IiBoZWlnaHQ9IjQ4IiByeD0iOCIgZmlsbD0iI0ZGNkEwMCIvPgo8cGF0aCBkPSJNMjQgMTJDMjkuNTIyOCAxMiAzNCAxNi40NzcyIDM0IDIyQzM0IDI3LjUyMjggMjkuNTIyOCAzMiAyNCAzMkMxOC40NzcyIDMyIDE0IDI3LjUyMjggMTQgMjJDMTQgMTYuNDc3MiAxOC40NzcyIDEyIDI0IDEyWiIgZmlsbD0iI0ZGRkZGRiIvPgo8L3N2Zz4K",
        url: "https://zapier.com"
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

console.log('✅ [APPS-DATA] Archivo de datos cargado correctamente');
