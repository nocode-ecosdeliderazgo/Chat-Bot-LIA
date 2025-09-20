// ===== COMMUNITY DATABASE MODULE =====
// Módulo centralizado para operaciones de base de datos de comunidades
// Incluye métodos para comentarios, reacciones y operaciones CRUD

class CommunityDatabase {
    constructor() {
        this.supabase = null;
        this.initialized = false;
        this.debug = true;
    }

    log(message, data = null) {
        if (this.debug) {
            console.log(`[COMMUNITY-DB] ${message}`, data || '');
        }
    }

    warn(message, error = null) {
        console.warn(`[COMMUNITY-DB] ⚠️ ${message}`, error || '');
    }

    error(message, error = null) {
        console.error(`[COMMUNITY-DB] ❌ ${message}`, error || '');
    }

    success(message, data = null) {
        console.log(`[COMMUNITY-DB] ✅ ${message}`, data || '');
    }

    async initialize() {
        try {
            this.log('🚀 Inicializando CommunityDatabase...');

            // Verificar disponibilidad de Supabase
            if (!window.supabase) {
                throw new Error('window.supabase no está disponible');
            }

            this.supabase = window.supabase;
            this.initialized = true;
            this.success('CommunityDatabase inicializado exitosamente');

            return true;
        } catch (error) {
            this.error('Error inicializando CommunityDatabase:', error);
            this.initialized = false;
            return false;
        }
    }

    // ===== MÉTODOS DE COMENTARIOS =====

    /**
     * Agregar comentario a un post usando RPC
     * @param {string} postId - ID del post
     * @param {string} content - Contenido del comentario
     * @returns {Object} Comentario insertado y contador actualizado
     */
    async addComment(postId, content) {
        try {
            this.log(`📝 Agregando comentario al post ${postId}`);

            if (!this.initialized) {
                throw new Error('CommunityDatabase no está inicializado');
            }

            // Validar parámetros
            if (!postId || !content || !content.trim()) {
                throw new Error('PostId y contenido son requeridos');
            }

            // Llamar al RPC rpc_add_comment
            const { data, error } = await this.supabase.rpc('rpc_add_comment', {
                p_post_id: postId,
                p_content: content.trim()
            });

            if (error) {
                this.error('Error en RPC rpc_add_comment:', error);
                throw error;
            }

            this.success(`Comentario agregado exitosamente al post ${postId}`);

            // El RPC debería retornar el comentario insertado
            const insertedComment = data;

            // Obtener el conteo actualizado de comentarios
            const commentCount = await this.getCommentCount(postId);

            return {
                comment: insertedComment,
                commentCount: commentCount
            };

        } catch (error) {
            this.error('Error agregando comentario:', error);
            throw error;
        }
    }

    /**
     * Listar comentarios de un post
     * @param {string} postId - ID del post
     * @returns {Array} Lista de comentarios
     */
    async listComments(postId) {
        try {
            this.log(`📋 Obteniendo comentarios del post ${postId}`);

            if (!this.initialized) {
                throw new Error('CommunityDatabase no está inicializado');
            }

            if (!postId) {
                throw new Error('PostId es requerido');
            }

            const { data, error } = await this.supabase
                .from('community_comments')
                .select(`
                    id,
                    content,
                    created_at,
                    updated_at,
                    author_id,
                    profiles:author_id (
                        display_name,
                        avatar_url
                    )
                `)
                .eq('post_id', postId)
                .order('created_at', { ascending: true });

            if (error) {
                this.error('Error obteniendo comentarios:', error);
                throw error;
            }

            this.success(`${data?.length || 0} comentarios obtenidos para el post ${postId}`);
            return data || [];

        } catch (error) {
            this.error('Error listando comentarios:', error);
            throw error;
        }
    }

    /**
     * Obtener conteo de comentarios de un post
     * @param {string} postId - ID del post
     * @returns {number} Número de comentarios
     */
    async getCommentCount(postId) {
        try {
            if (!this.initialized || !postId) {
                return 0;
            }

            const { count, error } = await this.supabase
                .from('community_comments')
                .select('*', { count: 'exact', head: true })
                .eq('post_id', postId);

            if (error) {
                this.warn('Error obteniendo conteo de comentarios:', error);
                return 0;
            }

            return count || 0;

        } catch (error) {
            this.warn('Error en getCommentCount:', error);
            return 0;
        }
    }

    // ===== MÉTODOS DE REACCIONES =====

    /**
     * Toggle reacción en un post usando RPC
     * @param {string} postId - ID del post
     * @param {string} reaction - Tipo de reacción (default: 'like')
     * @returns {Object} Estado de reacción y total
     */
    async toggleReaction(postId, reaction = 'like') {
        try {
            this.log(`👍 Toggle reacción ${reaction} en post ${postId}`);

            if (!this.initialized) {
                throw new Error('CommunityDatabase no está inicializado');
            }

            if (!postId) {
                throw new Error('PostId es requerido');
            }

            // Llamar al RPC rpc_toggle_reaction
            const { data, error } = await this.supabase.rpc('rpc_toggle_reaction', {
                p_post_id: postId,
                p_reaction: reaction
            });

            if (error) {
                this.error('Error en RPC rpc_toggle_reaction:', error);
                throw error;
            }

            this.success(`Reacción ${reaction} procesada para post ${postId}`);

            // El RPC debería retornar { reacted: boolean, total_reactions: number }
            return {
                reacted: data?.reacted || false,
                total_reactions: data?.total_reactions || 0,
                reaction_type: reaction
            };

        } catch (error) {
            this.error('Error procesando reacción:', error);
            throw error;
        }
    }

    /**
     * Obtener reacciones de un post
     * @param {string} postId - ID del post
     * @returns {Object} Reacciones del post
     */
    async getReactions(postId) {
        try {
            if (!this.initialized || !postId) {
                return { total_reactions: 0, user_reacted: false };
            }

            this.log(`📊 Obteniendo reacciones del post ${postId}`);

            // Obtener conteo total de reacciones
            const { count: totalReactions, error: countError } = await this.supabase
                .from('community_reactions')
                .select('*', { count: 'exact', head: true })
                .eq('post_id', postId);

            if (countError) {
                this.warn('Error obteniendo conteo de reacciones:', countError);
                return { total_reactions: 0, user_reacted: false };
            }

            // Verificar si el usuario actual reaccionó
            let userReacted = false;
            try {
                const currentUserId = await this.getCurrentUserId();
                if (currentUserId) {
                    const { data: userReaction, error: userError } = await this.supabase
                        .from('community_reactions')
                        .select('id')
                        .eq('post_id', postId)
                        .eq('user_id', currentUserId)
                        .maybeSingle();

                    if (!userError && userReaction) {
                        userReacted = true;
                    }
                }
            } catch (userError) {
                this.warn('Error verificando reacción del usuario:', userError);
            }

            return {
                total_reactions: totalReactions || 0,
                user_reacted: userReacted
            };

        } catch (error) {
            this.warn('Error obteniendo reacciones:', error);
            return { total_reactions: 0, user_reacted: false };
        }
    }

    // ===== MÉTODOS DE AUTENTICACIÓN =====

    /**
     * Obtener ID del usuario actual
     * @returns {string|null} ID del usuario
     */
    async getCurrentUserId() {
        try {
            // Usar CommunityAuth si está disponible
            if (window.CommunityAuth) {
                return await window.CommunityAuth.getCurrentUserId();
            }

            // Fallback: obtener desde Supabase directamente
            if (this.supabase?.auth) {
                const { data: { session } } = await this.supabase.auth.getSession();
                return session?.user?.id || null;
            }

            return null;
        } catch (error) {
            this.warn('Error obteniendo ID de usuario:', error);
            return null;
        }
    }

    /**
     * Obtener información del usuario actual
     * @returns {Object|null} Datos del usuario
     */
    async getCurrentUser() {
        try {
            // Usar CommunityAuth si está disponible
            if (window.CommunityAuth) {
                return await window.CommunityAuth.getCurrentUser();
            }

            // Fallback: obtener desde Supabase directamente
            if (this.supabase?.auth) {
                const { data: { session } } = await this.supabase.auth.getSession();
                return session?.user || null;
            }

            return null;
        } catch (error) {
            this.warn('Error obteniendo usuario actual:', error);
            return null;
        }
    }

    // ===== MÉTODOS EXISTENTES (mantenidos para compatibilidad) =====

    async getCommunities() {
        try {
            if (!this.initialized) {
                this.warn('Database no inicializada, retornando array vacío');
                return [];
            }

            const { data, error } = await this.supabase
                .from('communities')
                .select('*')
                .eq('is_active', true)
                .order('name');

            if (error) {
                this.error('Error obteniendo comunidades:', error);
                return [];
            }

            return data || [];
        } catch (error) {
            this.error('Error en getCommunities:', error);
            return [];
        }
    }

    async countCommunityMembers(communityId) {
        try {
            if (!this.initialized || !communityId) {
                return 0;
            }

            const { count, error } = await this.supabase
                .from('community_members')
                .select('*', { count: 'exact', head: true })
                .eq('community_id', communityId)
                .eq('is_active', true);

            if (error) {
                this.warn('Error contando miembros:', error);
                return 0;
            }

            return count || 0;
        } catch (error) {
            this.warn('Error en countCommunityMembers:', error);
            return 0;
        }
    }

    async countCommunityPosts(communityId) {
        try {
            if (!this.initialized || !communityId) {
                return 0;
            }

            const { count, error } = await this.supabase
                .from('community_posts')
                .select('*', { count: 'exact', head: true })
                .eq('community_id', communityId);

            if (error) {
                this.warn('Error contando posts:', error);
                return 0;
            }

            return count || 0;
        } catch (error) {
            this.warn('Error en countCommunityPosts:', error);
            return 0;
        }
    }

    // ===== UTILIDADES PARA SISTEMA DE PUNTOS =====

    /**
     * Actualizar puntos del usuario (TODO: implementar cuando esté disponible)
     * @param {string} userId - ID del usuario
     * @param {number} points - Puntos a agregar
     * @param {string} action - Acción que generó los puntos
     */
    async updateUserPoints(userId, points, action) {
        // TODO: Implementar cuando se defina el sistema de puntos
        this.log(`TODO(points): Agregar ${points} puntos al usuario ${userId} por acción: ${action}`);

        // Placeholder para sistema de puntos futuro
        console.log(`[POINTS] TODO: ${userId} + ${points} puntos (${action})`);
    }
}

// Exponer globalmente
window.CommunityDatabase = CommunityDatabase;

// Auto-inicializar si Supabase está disponible
document.addEventListener('DOMContentLoaded', async () => {
    if (window.supabase && !window.communityDB) {
        window.communityDB = new CommunityDatabase();
        await window.communityDB.initialize();
    }
});