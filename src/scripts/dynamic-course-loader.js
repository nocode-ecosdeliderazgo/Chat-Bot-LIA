/**
 * DYNAMIC COURSE LOADER
 * Sistema para cargar cursos dinámicamente desde la base de datos
 * Reemplaza los datos hardcodeados con información real de la BD
 */

class DynamicCourseLoader {
    constructor() {
        this.courses = [];
        this.isLoading = false;
        this.cache = new Map();
        this.cacheExpiry = 5 * 60 * 1000; // 5 minutos
    }

    /**
     * Cargar todos los cursos disponibles desde la base de datos
     */
    async loadCourses() {
        if (this.isLoading) {
            console.log('🔄 Ya se están cargando cursos...');
            return this.courses;
        }

        // Verificar cache
        const cacheKey = 'all_courses';
        const cached = this.getFromCache(cacheKey);
        if (cached) {
            console.log('📦 Usando cursos desde cache');
            return cached;
        }

        this.isLoading = true;
        console.log('🔄 Cargando cursos desde la base de datos...');

        try {
            // Intentar cargar desde Supabase primero
            const supabaseCourses = await this.loadFromSupabase();
            if (supabaseCourses && supabaseCourses.length > 0) {
                this.courses = supabaseCourses;
                this.saveToCache(cacheKey, this.courses);
                console.log(`✅ ${this.courses.length} cursos cargados desde Supabase`);
                return this.courses;
            }

            // Fallback: cargar desde API del servidor
            const apiCourses = await this.loadFromAPI();
            if (apiCourses && apiCourses.length > 0) {
                this.courses = apiCourses;
                this.saveToCache(cacheKey, this.courses);
                console.log(`✅ ${this.courses.length} cursos cargados desde API`);
                return this.courses;
            }

            // Fallback final: usar datos por defecto
            console.warn('⚠️ No se pudieron cargar cursos desde BD, usando datos por defecto');
            this.courses = this.getDefaultCourses();
            return this.courses;

        } catch (error) {
            console.error('❌ Error cargando cursos:', error);
            this.courses = this.getDefaultCourses();
            return this.courses;
        } finally {
            this.isLoading = false;
        }
    }

    /**
     * Cargar cursos desde Supabase
     */
    async loadFromSupabase() {
        if (!window.supabase) {
            console.log('⚠️ Supabase no disponible');
            return null;
        }

        try {
            const { data, error } = await window.supabase
                .from('courses')
                .select(`
                    id,
                    title,
                    description,
                    category,
                    level,
                    instructor_id,
                    duration_total_minutes,
                    thumbnail_url,
                    slug,
                    is_active,
                    created_at,
                    updated_at
                `)
                .eq('is_active', true)
                .order('created_at', { ascending: false });

            if (error) {
                console.error('❌ Error Supabase:', error);
                return null;
            }

            return this.formatCoursesForFrontend(data);
        } catch (error) {
            console.error('❌ Error en loadFromSupabase:', error);
            return null;
        }
    }

    /**
     * Cargar cursos desde API del servidor
     */
    async loadFromAPI() {
        try {
            const response = await fetch('/api/admin/courses', {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            const data = await response.json();
            return this.formatCoursesForFrontend(data);
        } catch (error) {
            console.error('❌ Error en loadFromAPI:', error);
            return null;
        }
    }

    /**
     * Formatear cursos para el frontend
     */
    formatCoursesForFrontend(coursesData) {
        return coursesData.map(course => ({
            id: course.id,
            title: course.title || 'Curso sin nombre',
            instructor: 'Ernesto Hernandez', // TODO: Obtener desde instructor_id
            description: course.description || 'Sin descripción',
            fullDescription: course.description || '',
            image: course.thumbnail_url || 'assets/images/brain-icon.jpg',
            progress: 0, // Se calculará dinámicamente
            totalLessons: 0, // TODO: Calcular desde course_modules
            completedLessons: 0, // Se calculará dinámicamente
            estimatedTime: this.formatDuration(course.duration_total_minutes),
            category: this.mapCategory(course.category),
            difficulty: this.mapLevel(course.level),
            rating: 4.9, // TODO: Calcular desde reviews/ratings
            price: 'Gratis', // TODO: Agregar campo price a la tabla
            currency: 'USD',
            status: course.is_active ? 'published' : 'draft',
            modality: 'online', // TODO: Agregar campo modality a la tabla
            courseUrl: course.slug ? `/course/${course.slug}` : '',
            purchaseUrl: '', // TODO: Agregar campo purchase_url a la tabla
            isActive: course.is_active,
            createdAt: course.created_at,
            updatedAt: course.updated_at,
            slug: course.slug,
            instructorId: course.instructor_id
        }));
    }

    /**
     * Formatear duración en minutos a texto legible
     */
    formatDuration(minutes) {
        if (!minutes) return '0 horas';
        
        const hours = Math.floor(minutes / 60);
        const remainingMinutes = minutes % 60;
        
        if (hours === 0) {
            return `${minutes} min`;
        } else if (remainingMinutes === 0) {
            return `${hours} ${hours === 1 ? 'hora' : 'horas'}`;
        } else {
            return `${hours}h ${remainingMinutes}min`;
        }
    }

    /**
     * Mapear categoría de la BD a texto legible
     */
    mapCategory(category) {
        const categoryMap = {
            'ia': 'Inteligencia Artificial',
            'ml': 'Machine Learning',
            'data': 'Ciencia de Datos',
            'web': 'Desarrollo Web',
            'mobile': 'Desarrollo Móvil',
            'design': 'Diseño',
            'business': 'Negocios',
            'marketing': 'Marketing'
        };
        return categoryMap[category] || 'General';
    }

    /**
     * Mapear nivel de la BD a texto legible
     */
    mapLevel(level) {
        const levelMap = {
            'beginner': 'Principiante',
            'intermediate': 'Intermedio',
            'advanced': 'Avanzado'
        };
        return levelMap[level] || 'Intermedio';
    }

    /**
     * Obtener curso por ID
     */
    async getCourseById(courseId) {
        // Verificar cache primero
        const cached = this.getFromCache(`course_${courseId}`);
        if (cached) {
            return cached;
        }

        // Si no está en cache, cargar todos los cursos
        await this.loadCourses();
        
        const course = this.courses.find(c => c.id === courseId || c.id === parseInt(courseId));
        if (course) {
            this.saveToCache(`course_${courseId}`, course);
        }
        
        return course;
    }

    /**
     * Obtener cursos por categoría
     */
    async getCoursesByCategory(category) {
        await this.loadCourses();
        return this.courses.filter(course => 
            course.category.toLowerCase().includes(category.toLowerCase())
        );
    }

    /**
     * Buscar cursos por término
     */
    async searchCourses(searchTerm) {
        await this.loadCourses();
        const term = searchTerm.toLowerCase();
        
        return this.courses.filter(course => 
            course.title.toLowerCase().includes(term) ||
            course.description.toLowerCase().includes(term) ||
            course.instructor.toLowerCase().includes(term) ||
            course.category.toLowerCase().includes(term)
        );
    }

    /**
     * Obtener cursos por defecto (fallback)
     */
    getDefaultCourses() {
        return [
            {
                id: 'intro-to-ai',
                title: 'Introducción a la IA',
                instructor: 'Ernesto Hernandez',
                description: 'Curso completo de Inteligencia Artificial desde fundamentos hasta aplicaciones prácticas',
                fullDescription: 'Un programa integral que cubre los conceptos fundamentales de la IA, incluyendo machine learning, deep learning, y aplicaciones prácticas en el mundo real.',
                image: 'assets/images/brain-icon.jpg',
                progress: 0,
                totalLessons: 8,
                completedLessons: 0,
                estimatedTime: '12 horas',
                category: 'Inteligencia Artificial',
                difficulty: 'Intermedio',
                rating: 4.9,
                price: 'Gratis',
                currency: 'USD',
                status: 'published',
                modality: 'online',
                courseUrl: '',
                purchaseUrl: '',
                isActive: true,
                createdAt: new Date().toISOString()
            }
        ];
    }

    /**
     * Sistema de cache
     */
    getFromCache(key) {
        const cached = this.cache.get(key);
        if (cached && Date.now() - cached.timestamp < this.cacheExpiry) {
            return cached.data;
        }
        this.cache.delete(key);
        return null;
    }

    saveToCache(key, data) {
        this.cache.set(key, {
            data: data,
            timestamp: Date.now()
        });
    }

    /**
     * Limpiar cache
     */
    clearCache() {
        this.cache.clear();
        console.log('🗑️ Cache de cursos limpiado');
    }

    /**
     * Forzar recarga (ignorar cache)
     */
    async forceReload() {
        this.clearCache();
        return await this.loadCourses();
    }
}

// Instancia global
window.dynamicCourseLoader = new DynamicCourseLoader();

// Función de conveniencia para uso global
window.loadCourses = () => window.dynamicCourseLoader.loadCourses();
window.getCourseById = (id) => window.dynamicCourseLoader.getCourseById(id);
window.searchCourses = (term) => window.dynamicCourseLoader.searchCourses(term);

console.log('📚 Dynamic Course Loader inicializado');
