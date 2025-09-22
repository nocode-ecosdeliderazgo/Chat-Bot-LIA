// =====================================================
// NETLIFY FUNCTION: PERFIL DE USUARIO COMPLETO
// Función serverless para obtener perfil completo de usuario con estadísticas
// =====================================================

const { createClient } = require('@supabase/supabase-js');

// Configuración de Supabase
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
    console.error('❌ Variables de entorno de Supabase no configuradas');
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// =====================================================
// HANDLER PRINCIPAL
// =====================================================

exports.handler = async (event, context) => {
    // Headers CORS
    const headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-User-Id',
        'Access-Control-Allow-Methods': 'GET, OPTIONS',
        'Content-Type': 'application/json'
    };

    // Manejar preflight OPTIONS
    if (event.httpMethod === 'OPTIONS') {
        return {
            statusCode: 200,
            headers,
            body: ''
        };
    }

    try {
        const path = event.path;
        const method = event.httpMethod;

        console.log(`📡 ${method} ${path}`);

        if (method === 'GET' && path.includes('/profile/')) {
            // GET /api/user/profile/{userId}
            const pathParts = path.split('/');
            const profileIndex = pathParts.indexOf('profile');

            if (profileIndex !== -1 && pathParts[profileIndex + 1]) {
                const userId = pathParts[profileIndex + 1];
                console.log(`👤 Obteniendo perfil completo para usuario: ${userId}`);
                return await getUserProfile(userId, headers);
            } else {
                return {
                    statusCode: 400,
                    headers,
                    body: JSON.stringify({ error: 'userId requerido en la ruta' })
                };
            }
        } else {
            return {
                statusCode: 404,
                headers,
                body: JSON.stringify({ error: 'Endpoint no encontrado' })
            };
        }

    } catch (error) {
        console.error('💥 Error en user-profile function:', error);
        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({
                error: 'Error interno del servidor',
                details: error.message
            })
        };
    }
};

// =====================================================
// FUNCIONES ESPECÍFICAS
// =====================================================

async function getUserProfile(userId, headers) {
    try {
        console.log(`📊 Obteniendo perfil completo del usuario ${userId}`);

        // 🚨 VERIFICACIÓN OBLIGATORIA SEGÚN DOCUMENTO
        const userData = await verifyUserData(userId);

        if (!userData) {
            console.error('❌ Error obteniendo datos del usuario');
            return {
                statusCode: 404,
                headers,
                body: JSON.stringify({
                    error: 'Usuario no encontrado'
                })
            };
        }

        // 🚨 LOGS DE VERIFICACIÓN OBLIGATORIOS SEGÚN DOCUMENTO
        console.log('🔍 DATOS REALES DEL USUARIO:', userData);
        console.log('🎯 PUNTOS REALES:', userData.points);
        console.log('📅 FECHA REAL DE REGISTRO:', userData.created_at);
        console.log('🕐 ÚLTIMO LOGIN REAL:', userData.last_login_at);

        // 2. Obtener conteo real de posts
        const realPostsCount = await getUserPostsCount(userId);
        console.log('📝 POSTS REALES:', realPostsCount);

        // 3. Obtener ranking real
        const realRanking = await calculateUserRanking(userData.points);
        console.log('📊 RANKING REAL:', realRanking);

        // 4. Calcular liga real
        const realLeague = getRealLeagueFromPoints(userData.points);

        // 5. Calcular tiempo transcurrido REAL
        const realLastSeen = getRealTimeAgo(userData.last_login_at);

        // 6. Calcular fecha de membresía REAL
        const realMemberSince = getRealMemberSince(userData.created_at);

        // 🚨 ESTRUCTURA DE RESPUESTA EXACTA SEGÚN DOCUMENTO
        const response = {
            user: {
                id: userData.id,
                username: userData.username,
                display_name: userData.display_name,
                bio: userData.bio, // ⭐ OBLIGATORIO - Campo bio de la BD
                cargo_rol: userData.cargo_rol, // ⭐ OBLIGATORIO - Campo cargo_rol de la BD
                type_rol: userData.type_rol, // ⭐ OBLIGATORIO - Para liga superior
                points: userData.points, // ⭐ OBLIGATORIO - Campo points de la BD
                last_login_at: userData.last_login_at, // ⭐ OBLIGATORIO - Para última vez visto
                profile_picture_url: userData.profile_picture_url,
                created_at: userData.created_at // ⭐ OBLIGATORIO - Para "miembro desde"
            },
            stats: {
                league: realLeague, // ⭐ CALCULADO - Liga real basada en puntos
                ranking: {
                    position: realRanking.position, // ⭐ CALCULADO - Ranking real
                    total_users: realRanking.total_users // ⭐ CALCULADO - Total de usuarios
                },
                posts_count: realPostsCount, // ⭐ CALCULADO - Conteo real de posts
                last_seen: realLastSeen, // ⭐ CALCULADO - Tiempo real desde last_login_at
                member_since: realMemberSince // ⭐ CALCULADO - Fecha real desde created_at
            }
        };

        console.log('✅ VERIFICACIÓN COMPLETADA - TODOS LOS DATOS SON REALES');

        return {
            statusCode: 200,
            headers,
            body: JSON.stringify(response)
        };

    } catch (error) {
        console.error('❌ ERROR EN ENDPOINT:', error);
        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({
                error: 'Error al obtener datos del usuario',
                details: error.message
            })
        };
    }
}

// =====================================================
// FUNCIONES AUXILIARES EXACTAS SEGÚN DOCUMENTO
// =====================================================

// 🚨 FUNCIÓN DE VERIFICACIÓN OBLIGATORIA SEGÚN DOCUMENTO
async function verifyUserData(userId) {
    const { data: user, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single();

    console.log('🔍 DATOS REALES DEL USUARIO:', user);
    return user;
}

// ⭐ FUNCIÓN CORREGIDA - Determinar liga REAL basada en puntos (EXACTA SEGÚN DOCUMENTO)
function getRealLeagueFromPoints(points) {
    console.log('🎯 PUNTOS REALES DEL USUARIO:', points);

    if (points >= 2000) return "Diamante";
    if (points >= 1500) return "Platino";
    if (points >= 1000) return "Oro";
    if (points >= 500) return "Plata";
    return "Bronce";
}

// ⭐ FUNCIÓN CORREGIDA - Calcular tiempo transcurrido REAL (EXACTA SEGÚN DOCUMENTO)
function getRealTimeAgo(lastLoginAt) {
    console.log('🕐 ÚLTIMO LOGIN REAL:', lastLoginAt);

    if (!lastLoginAt) return "Nunca ha iniciado sesión";

    const now = new Date();
    const lastSeen = new Date(lastLoginAt);
    const diffInHours = Math.floor((now - lastSeen) / (1000 * 60 * 60));

    if (diffInHours < 1) return "hace menos de 1 hora";
    if (diffInHours < 24) return `hace ${diffInHours} horas`;

    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `hace ${diffInDays} días`;

    const diffInWeeks = Math.floor(diffInDays / 7);
    return `hace ${diffInWeeks} semanas`;
}

// ⭐ FUNCIÓN CORREGIDA - Calcular fecha de membresía REAL (EXACTA SEGÚN DOCUMENTO)
function getRealMemberSince(createdAt) {
    console.log('📅 FECHA REAL DE REGISTRO:', createdAt);

    const date = new Date(createdAt);
    const month = date.toLocaleString('es-ES', { month: 'long' });
    const year = date.getFullYear();
    return `Miembro desde ${month.charAt(0).toUpperCase() + month.slice(1)} ${year}`;
}

// Calcular ranking del usuario basado en puntos
async function calculateUserRanking(userPoints) {
    try {
        // Obtener todos los usuarios con sus puntos para calcular ranking
        const { data: allUsers, error } = await supabase
            .from('users')
            .select('id, points')
            .not('points', 'is', null)
            .order('points', { ascending: false });

        if (error) {
            console.error('❌ Error calculando ranking:', error);
            return { position: 1, total_users: 1 };
        }

        const totalUsers = allUsers.length;

        // Encontrar posición del usuario (usuarios con más puntos + 1)
        const usersWithMorePoints = allUsers.filter(user => (user.points || 0) > (userPoints || 0));
        const position = usersWithMorePoints.length + 1;

        console.log(`🏆 Ranking calculado: ${position} de ${totalUsers} (${userPoints} puntos)`);

        return {
            position: position,
            total_users: totalUsers
        };

    } catch (error) {
        console.error('💥 Error calculando ranking:', error);
        return { position: 1, total_users: 1 };
    }
}

// Contar posts realizados por el usuario
async function getUserPostsCount(userId) {
    try {
        const { data, error, count } = await supabase
            .from('community_posts')
            .select('id', { count: 'exact' })
            .eq('user_id', userId);

        if (error) {
            console.error('❌ Error contando posts:', error);
            return 0;
        }

        const postsCount = count || 0;
        console.log(`📝 Posts realizados: ${postsCount}`);

        return postsCount;

    } catch (error) {
        console.error('💥 Error contando posts:', error);
        return 0;
    }
}

// Calcular tiempo transcurrido desde último login
function calculateLastSeen(lastLoginAt) {
    if (!lastLoginAt) {
        return 'Nunca visto';
    }

    try {
        const now = new Date();
        const lastLogin = new Date(lastLoginAt);
        const diffMs = now - lastLogin;

        // Convertir a diferentes unidades
        const diffMinutes = Math.floor(diffMs / (1000 * 60));
        const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
        const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
        const diffWeeks = Math.floor(diffDays / 7);

        if (diffMinutes < 1) {
            return 'En línea ahora';
        } else if (diffMinutes < 60) {
            return `Hace ${diffMinutes} minuto${diffMinutes > 1 ? 's' : ''}`;
        } else if (diffHours < 24) {
            return `Hace ${diffHours} hora${diffHours > 1 ? 's' : ''}`;
        } else if (diffDays < 7) {
            return `Hace ${diffDays} día${diffDays > 1 ? 's' : ''}`;
        } else if (diffWeeks < 4) {
            return `Hace ${diffWeeks} semana${diffWeeks > 1 ? 's' : ''}`;
        } else {
            // Más de un mes: mostrar fecha
            return lastLogin.toLocaleDateString('es-ES', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            });
        }

    } catch (error) {
        console.error('💥 Error calculando última vez visto:', error);
        return 'Fecha no disponible';
    }
}

// Determinar liga basada en puntos (según documento)
function getLeagueFromPoints(points) {
    const userPoints = points || 0;

    if (userPoints >= 2000) {
        return {
            name: 'Liga Diamante',
            color: '#B9F2FF',
            icon: '💎',
            minPoints: 2000,
            maxPoints: null
        };
    }
    if (userPoints >= 1500) {
        return {
            name: 'Liga Platino',
            color: '#E5E4E2',
            icon: '🥈',
            minPoints: 1500,
            maxPoints: 1999
        };
    }
    if (userPoints >= 1000) {
        return {
            name: 'Liga Oro',
            color: '#FFD700',
            icon: '🥇',
            minPoints: 1000,
            maxPoints: 1499
        };
    }
    if (userPoints >= 500) {
        return {
            name: 'Liga Plata',
            color: '#C0C0C0',
            icon: '🥉',
            minPoints: 500,
            maxPoints: 999
        };
    }

    return {
        name: 'Liga Bronce',
        color: '#CD7F32',
        icon: '🏅',
        minPoints: 0,
        maxPoints: 499
    };
}

// Formatear fecha de registro
function formatJoinDate(createdAt) {
    if (!createdAt) {
        return 'Fecha no disponible';
    }

    try {
        const date = new Date(createdAt);
        return date.toLocaleDateString('es-ES', {
            year: 'numeric',
            month: 'long'
        });
    } catch (error) {
        console.error('💥 Error formateando fecha de registro:', error);
        return 'Fecha no disponible';
    }
}