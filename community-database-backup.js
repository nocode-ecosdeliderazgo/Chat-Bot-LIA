/**
 * Sistema de Base de Datos para la Comunidad
 * Maneja todas las operaciones CRUD con Supabase
 */

class CommunityDatabase {
    constructor() {
        this.supabase = window.supabase;
        this.currentUser = null;
    }

    // ========================================
    // MÃ‰TODOS DE USUARIO
    // ========================================

    async getCurrentUser() {
        try {
            console.log('ðŸ” Obteniendo usuario actual...');
            
            // Intentar obtener usuario autenticado de Supabase
            const { data: { user }, error } = await this.supabase.auth.getUser();
            
            if (!error && user) {
                console.log('âœ… Usuario autenticado encontrado:', user);
                
                // Buscar o crear usuario en la tabla users
                let { data: userData, error: userError } = await this.supabase
                    .from('users')
                    .select('*')
                    .eq('id', user.id)
                    .single();

                if (userError && userError.code === 'PGRST116') {
                    // Usuario no existe en la tabla users, crearlo
                    console.log('ðŸ“ Creando nuevo usuario en la base de datos...');
                    const { data: newUser, error: createError } = await this.supabase
                        .from('users')
                        .insert({
                            id: user.id,
                            username: user.email,
                            email: user.email,
                            password_hash: 'auth_user', // Placeholder
                            first_name: user.user_metadata?.full_name?.split(' ')[0] || '',
                            last_name: user.user_metadata?.full_name?.split(' ').slice(1).join(' ') || '',
                            display_name: user.user_metadata?.full_name || user.email,
                            points: 0
                        })
                        .select()
                        .single();

                    if (createError) {
                        console.error('âŒ Error creando usuario:', createError);
                        return null;
                    }
                    
                    userData = newUser;
                } else if (userError) {
                    console.error('âŒ Error obteniendo usuario:', userError);
                    return null;
                }

                this.currentUser = userData;
                console.log('ðŸ‘¤ Usuario actual:', this.currentUser);
                return this.currentUser;
            } else {
                console.log('âš ï¸ No hay usuario autenticado');
                return null;
            }
        } catch (error) {
            console.error('âŒ Error en getCurrentUser:', error);
            return null;
        }
    }

    async updateUserPoints(userId, points) {
        try {
            console.log(`ðŸ’° Actualizando puntos para usuario ${userId}: ${points}`);
            
            const { data, error } = await this.supabase
                .from('users')
                .update({ points: points })
                .eq('id', userId)
                .select();

            if (error) {
                console.error('âŒ Error actualizando puntos:', error);
                return false;
            }

            console.log('âœ… Puntos actualizados:', data);
            return true;
        } catch (error) {
            console.error('âŒ Error en updateUserPoints:', error);
            return false;
        }
    }

    // ========================================
    // MÃ‰TODOS DE COMUNIDADES
    // ========================================

    async getCommunities() {
        console.log('🏘️ Obteniendo comunidades...');
        console.log('📊 Supabase client:', this.supabase);

        try {
            console.log('ðŸ˜ï¸ Obteniendo comunidades...');
            
            const { data, error } = await this.supabase
                .from('communities')
                .select('*')
                .eq('is_active', true)
                .order('name');

            if (error) {
                console.error('âŒ Error obteniendo comunidades:', error);
                return [];
            }

            console.log('âœ… Comunidades obtenidas:', data);
            return data;
        } catch (error) {
            console.error('âŒ Error en getCommunities:', error);
            return [];
        }
    }

    async getCommunityBySlug(slug) {
        try {
            console.log(`ðŸ˜ï¸ Obteniendo comunidad: ${slug}`);
            
            const { data, error } = await this.supabase
                .from('communities')
                .select('*')
                .eq('slug', slug)
                .eq('is_active', true)
                .single();

            if (error) {
                console.error('âŒ Error obteniendo comunidad:', error);
                return null;
            }

            console.log('âœ… Comunidad obtenida:', data);
            return data;
        } catch (error) {
            console.error('âŒ Error en getCommunityBySlug:', error);
            return null;
        }
    }

    // ========================================
    // MÃ‰TODOS DE PUBLICACIONES
    // ========================================

    async getPosts(communityId, limit = 50) {
        try {
            console.log(`ðŸ“ Obteniendo publicaciones para comunidad ${communityId}...`);
            
            const { data, error } = await this.supabase
                .from('community_posts')
                .select(`
                    *,
                    users!community_posts_user_id_fkey (
                        id,
                        display_name,
                        first_name,
                        username,
                        profile_picture_url
                    )
                `)
                .eq('community_id', communityId)
                .order('created_at', { ascending: false })
                .limit(limit);

            if (error) {
                console.error('âŒ Error obteniendo publicaciones:', error);
                return [];
            }

            console.log('âœ… Publicaciones obtenidas:', data);
            return data;
        } catch (error) {
            console.error('âŒ Error en getPosts:', error);
            return [];
        }
    }

    async createPost(communityId, content, title = null, attachmentUrl = null, attachmentType = null) {
        try {
            if (!this.currentUser) {
                console.error('âŒ No hay usuario actual');
                return null;
            }

            console.log('ðŸ“ Creando nueva publicaciÃ³n...');
            
            const postData = {
                community_id: communityId,
                user_id: this.currentUser.id,
                content: content,
                title: title,
                attachment_url: attachmentUrl,
                attachment_type: attachmentType
            };

            const { data, error } = await this.supabase
                .from('community_posts')
                .insert(postData)
                .select(`
                    *,
                    users!community_posts_user_id_fkey (
                        id,
                        display_name,
                        first_name,
                        username,
                        profile_picture_url
                    )
                `)
                .single();

            if (error) {
                console.error('âŒ Error creando publicaciÃ³n:', error);
                return null;
            }

            console.log('âœ… PublicaciÃ³n creada:', data);
            return data;
        } catch (error) {
            console.error('âŒ Error en createPost:', error);
            return null;
        }
    }

    async updatePost(postId, content, title = null) {
        try {
            console.log(`ðŸ“ Actualizando publicaciÃ³n ${postId}...`);
            
            const updateData = {
                content: content,
                is_edited: true,
                edited_at: new Date().toISOString()
            };

            if (title !== null) {
                updateData.title = title;
            }

            const { data, error } = await this.supabase
                .from('community_posts')
                .update(updateData)
                .eq('id', postId)
                .select()
                .single();

            if (error) {
                console.error('âŒ Error actualizando publicaciÃ³n:', error);
                return null;
            }

            console.log('âœ… PublicaciÃ³n actualizada:', data);
            return data;
        } catch (error) {
            console.error('âŒ Error en updatePost:', error);
            return null;
        }
    }

    async deletePost(postId) {
        try {
            console.log(`ðŸ—‘ï¸ Eliminando publicaciÃ³n ${postId}...`);
            
            const { error } = await this.supabase
                .from('community_posts')
                .delete()
                .eq('id', postId);

            if (error) {
                console.error('âŒ Error eliminando publicaciÃ³n:', error);
                return false;
            }

            console.log('âœ… PublicaciÃ³n eliminada');
            return true;
        } catch (error) {
            console.error('âŒ Error en deletePost:', error);
            return false;
        }
    }

    // ========================================
    // MÃ‰TODOS DE COMENTARIOS
    // ========================================

    async getComments(postId) {
        try {
            console.log(`ðŸ’¬ Obteniendo comentarios para publicaciÃ³n ${postId}...`);
            
            const { data, error } = await this.supabase
                .from('community_comments')
                .select(`
                    *,
                    users!community_comments_user_id_fkey (
                        id,
                        display_name,
                        first_name,
                        username,
                        profile_picture_url
                    )
                `)
                .eq('post_id', postId)
                .order('created_at', { ascending: true });

            if (error) {
                console.error('âŒ Error obteniendo comentarios:', error);
                return [];
            }

            console.log('âœ… Comentarios obtenidos:', data);
            return data;
        } catch (error) {
            console.error('âŒ Error en getComments:', error);
            return [];
        }
    }

    async createComment(postId, content, parentCommentId = null) {
        try {
            if (!this.currentUser) {
                console.error('âŒ No hay usuario actual');
                return null;
            }

            console.log('ðŸ’¬ Creando nuevo comentario...');
            
            const commentData = {
                post_id: postId,
                user_id: this.currentUser.id,
                content: content,
                parent_comment_id: parentCommentId
            };

            const { data, error } = await this.supabase
                .from('community_comments')
                .insert(commentData)
                .select(`
                    *,
                    users!community_comments_user_id_fkey (
                        id,
                        display_name,
                        first_name,
                        username,
                        profile_picture_url
                    )
                `)
                .single();

            if (error) {
                console.error('âŒ Error creando comentario:', error);
                return null;
            }

            console.log('âœ… Comentario creado:', data);
            return data;
        } catch (error) {
            console.error('âŒ Error en createComment:', error);
            return null;
        }
    }

    // ========================================
    // MÃ‰TODOS DE REACCIONES
    // ========================================

    async getReactions(postId = null, commentId = null) {
        try {
            console.log(`ðŸ‘ Obteniendo reacciones...`);
            
            let query = this.supabase
                .from('community_reactions')
                .select(`
                    *,
                    users!community_reactions_user_id_fkey (
                        id,
                        display_name,
                        first_name,
                        username
                    )
                `);

            if (postId) {
                query = query.eq('post_id', postId);
            } else if (commentId) {
                query = query.eq('comment_id', commentId);
            }

            const { data, error } = await query;

            if (error) {
                console.error('âŒ Error obteniendo reacciones:', error);
                return [];
            }

            console.log('âœ… Reacciones obtenidas:', data);
            return data;
        } catch (error) {
            console.error('âŒ Error en getReactions:', error);
            return [];
        }
    }

    async toggleReaction(postId = null, commentId = null, reactionType = 'like') {
        try {
            if (!this.currentUser) {
                console.error('âŒ No hay usuario actual');
                return false;
            }

            console.log(`ðŸ‘ Alternando reacciÃ³n: ${reactionType}...`);
            
            // Verificar si ya existe una reacciÃ³n
            let query = this.supabase
                .from('community_reactions')
                .select('*');

            if (postId) {
                query = query.eq('post_id', postId);
            } else if (commentId) {
                query = query.eq('comment_id', commentId);
            }

            query = query.eq('user_id', this.currentUser.id);
            const { data: existingReaction, error: checkError } = await query.single();

            if (checkError && checkError.code !== 'PGRST116') {
                console.error('âŒ Error verificando reacciÃ³n existente:', checkError);
                return false;
            }

            if (existingReaction) {
                // Eliminar reacciÃ³n existente
                const { error: deleteError } = await this.supabase
                    .from('community_reactions')
                    .delete()
                    .eq('id', existingReaction.id);

                if (deleteError) {
                    console.error('âŒ Error eliminando reacciÃ³n:', deleteError);
                    return false;
                }

                console.log('âœ… ReacciÃ³n eliminada');
                return true;
            } else {
                // Crear nueva reacciÃ³n
                const reactionData = {
                    user_id: this.currentUser.id,
                    reaction_type: reactionType
                };

                if (postId) {
                    reactionData.post_id = postId;
                } else if (commentId) {
                    reactionData.comment_id = commentId;
                }

                const { error: insertError } = await this.supabase
                    .from('community_reactions')
                    .insert(reactionData);

                if (insertError) {
                    console.error('âŒ Error creando reacciÃ³n:', insertError);
                    return false;
                }

                console.log('âœ… ReacciÃ³n creada');
                return true;
            }
        } catch (error) {
            console.error('âŒ Error en toggleReaction:', error);
            return false;
        }
    }

    // ========================================
    // MÃ‰TODOS DE MIEMBROS
    // ========================================

    async countCommunityMembers(communityId) {
        try {
            const { count, error } = await this.supabase
                .from('community_members')
                .select('id', { count: 'exact', head: true })
                .eq('community_id', communityId)
                .eq('is_active', true);

            if (error) {
                console.error('[COMMUNITY_DB] Error contando miembros:', error);
                return 0;
            }

            return count || 0;
        } catch (error) {
            console.error('[COMMUNITY_DB] Error en countCommunityMembers:', error);
            return 0;
        }
    }

    async countCommunityPosts(communityId) {
        try {
            const { count, error } = await this.supabase
                .from('community_posts')
                .select('id', { count: 'exact', head: true })
                .eq('community_id', communityId);

            if (error) {
                console.error('[COMMUNITY_DB] Error contando publicaciones:', error);
                return 0;
            }

            return count || 0;
        } catch (error) {
            console.error('[COMMUNITY_DB] Error en countCommunityPosts:', error);
            return 0;
        }
    }
    async getCommunityMembers(communityId) {
        try {
            console.log(`ðŸ‘¥ Obteniendo miembros de comunidad ${communityId}...`);
            
            const { data, error } = await this.supabase
                .from('community_members')
                .select(`
                    *,
                    users!community_members_user_id_fkey (
                        id,
                        display_name,
                        first_name,
                        username,
                        profile_picture_url,
                        points
                    )
                `)
                .eq('community_id', communityId)
                .eq('is_active', true)
                .order('joined_at', { ascending: true });

            if (error) {
                console.error('âŒ Error obteniendo miembros:', error);
                return [];
            }

            console.log('âœ… Miembros obtenidos:', data);
            return data;
        } catch (error) {
            console.error('âŒ Error en getCommunityMembers:', error);
            return [];
        }
    }

    async joinCommunity(communityId) {
        try {
            if (!this.currentUser) {
                console.error('âŒ No hay usuario actual');
                return false;
            }

            console.log(`ðŸ‘¥ UniÃ©ndose a comunidad ${communityId}...`);
            
            const memberData = {
                community_id: communityId,
                user_id: this.currentUser.id,
                role: 'member'
            };

            const { error } = await this.supabase
                .from('community_members')
                .insert(memberData);

            if (error) {
                console.error('âŒ Error uniÃ©ndose a comunidad:', error);
                return false;
            }

            console.log('âœ… Usuario unido a comunidad');
            return true;
        } catch (error) {
            console.error('âŒ Error en joinCommunity:', error);
            return false;
        }
    }

    // ========================================
    // MÃ‰TODOS DE PREGUNTAS DE COMUNIDAD
    // ========================================

    async getQuestions(params = {}) {
        try {
            console.log('ðŸ“‹ Obteniendo preguntas de comunidad...');
            
            // Verificar estado de Supabase
            if (!this.supabase) {
                console.warn('âš ï¸ Cliente de Supabase no disponible');
                throw new Error('Cliente de Supabase no disponible');
            }
            
            // Intentar con autenticaciÃ³n primero
            const user = await this.getCurrentUser();
            
            if (user) {
                console.log('ðŸ‘¤ Usuario autenticado, cargando preguntas completas...');
                return await this.getQuestionsAuthenticated(params);
            } else {
                console.log('ðŸ‘¤ Usuario no autenticado, cargando preguntas pÃºblicas...');
                return await this.getQuestionsPublic(params);
            }
        } catch (error) {
            console.error('âŒ Error en getQuestions:', error);
            // Lanzar el error para que el sistema pueda usar el fallback al API
            throw error;
        }
    }

    // MÃ©todo para preguntas con usuario autenticado
    async getQuestionsAuthenticated(params = {}) {
        try {
            console.log('ðŸ” Cargando preguntas para usuario autenticado...');
            
            let query = this.supabase
                .from('community_questions')
                .select(`
                    *,
                    users:user_id (
                        id,
                        username,
                        email,
                        display_name,
                        profile_picture_url
                    )
                `);

            // Aplicar filtros
            if (params.course_id) {
                query = query.eq('course_id', params.course_id);
            }
            if (params.module_id) {
                query = query.eq('module_id', params.module_id);
            }
            if (params.filter === 'unanswered') {
                query = query.eq('is_answered', false);
            } else if (params.filter === 'answered') {
                query = query.eq('is_answered', true);
            }

            // Aplicar ordenamiento
            if (params.sort === 'votes') {
                query = query.order('votes_count', { ascending: false });
            } else if (params.sort === 'answers') {
                query = query.order('answers_count', { ascending: false });
            } else {
                query = query.order('created_at', { ascending: false });
            }

            // Aplicar paginaciÃ³n si se especifica
            const limit = params.limit || 20;
            const offset = params.offset || 0;
            query = query.range(offset, offset + limit - 1);

            const { data, error } = await query;

            if (error) {
                console.error('âŒ Error obteniendo preguntas autenticadas:', error);
                throw error;
            }

            console.log(`âœ… ${data.length} preguntas autenticadas obtenidas`);
            return data || [];
        } catch (error) {
            console.error('âŒ Error en getQuestionsAuthenticated:', error);
            throw error;
        }
    }

    // Nuevo mÃ©todo para preguntas pÃºblicas (sin autenticaciÃ³n)
    async getQuestionsPublic(params = {}) {
        try {
            console.log('ðŸŒ Cargando preguntas pÃºblicas...');
            
            let query = this.supabase
                .from('community_questions')
                .select(`
                    id,
                    title,
                    content,
                    created_at,
                    updated_at,
                    user_id,
                    course_id,
                    module_id,
                    tags,
                    votes_count,
                    answers_count,
                    views_count,
                    is_answered,
                    is_featured,
                    users:user_id (
                        id,
                        username,
                        display_name
                    )
                `);

            // Solo preguntas pÃºblicas o sin restricciÃ³n de privacidad
            // query = query.eq('is_public', true); // Comentado hasta que se agregue la columna

            // Aplicar filtros
            if (params.course_id) {
                query = query.eq('course_id', params.course_id);
            }
            if (params.module_id) {
                query = query.eq('module_id', params.module_id);
            }
            if (params.filter === 'unanswered') {
                query = query.eq('is_answered', false);
            } else if (params.filter === 'answered') {
                query = query.eq('is_answered', true);
            }

            // Aplicar ordenamiento
            if (params.sort === 'votes') {
                query = query.order('votes_count', { ascending: false });
            } else if (params.sort === 'answers') {
                query = query.order('answers_count', { ascending: false });
            } else {
                query = query.order('created_at', { ascending: false });
            }

            // Aplicar paginaciÃ³n
            const limit = params.limit || 20;
            const offset = params.offset || 0;
            query = query.range(offset, offset + limit - 1);

            const { data, error } = await query;

            if (error) {
                console.error('âŒ Error en consulta pÃºblica:', error);
                throw error;
            }

            console.log(`âœ… ${data.length} preguntas pÃºblicas obtenidas`);
            return data || [];
        } catch (error) {
            console.error('âŒ Error en getQuestionsPublic:', error);
            throw error;
        }
    }

    async createQuestion(questionData) {
        try {
            if (!this.currentUser) {
                console.error('âŒ No hay usuario actual');
                return null;
            }

            console.log('ðŸ“ Creando nueva pregunta...');
            
            const { data, error } = await this.supabase
                .from('community_questions')
                .insert({
                    title: questionData.title,
                    content: questionData.content,
                    tags: questionData.tags || [],
                    course_id: questionData.course_id,
                    module_id: questionData.module_id,
                    user_id: this.currentUser.id
                })
                .select(`
                    *,
                    users:user_id (
                        id,
                        name,
                        avatar_url
                    )
                `)
                .single();

            if (error) {
                console.error('âŒ Error creando pregunta:', error);
                return null;
            }

            console.log('âœ… Pregunta creada:', data);
            return data;
        } catch (error) {
            console.error('âŒ Error en createQuestion:', error);
            return null;
        }
    }

    // ========================================
    // MÃ‰TODOS DE UTILIDAD
    // ========================================

    async initialize() {
        console.log('ðŸš€ Inicializando CommunityDatabase...');
        await this.getCurrentUser();
        console.log('âœ… CommunityDatabase inicializado');
    }

    formatTimestamp(timestamp) {
        const date = new Date(timestamp);
        const now = new Date();
        const diffInSeconds = Math.floor((now - date) / 1000);

        if (diffInSeconds < 60) {
            return 'Ahora mismo';
        } else if (diffInSeconds < 3600) {
            // Menos de 1 hora: mostrar en minutos
            const minutes = Math.floor(diffInSeconds / 60);
            return `Hace ${minutes} minuto${minutes > 1 ? 's' : ''}`;
        } else if (diffInSeconds < 86400) {
            // Menos de 1 dÃ­a: mostrar en horas
            const hours = Math.floor(diffInSeconds / 3600);
            return `Hace ${hours} hora${hours > 1 ? 's' : ''}`;
        } else if (diffInSeconds < 2592000) {
            // Menos de 30 dÃ­as: mostrar en dÃ­as
            const days = Math.floor(diffInSeconds / 86400);
            return `Hace ${days} dÃ­a${days > 1 ? 's' : ''}`;
        } else if (diffInSeconds < 31536000) {
            // Menos de 1 aÃ±o: mostrar en meses
            const months = Math.floor(diffInSeconds / 2592000);
            return `Hace ${months} mes${months > 1 ? 'es' : ''}`;
        } else {
            // MÃ¡s de 1 aÃ±o: mostrar fecha completa
            return date.toLocaleDateString('es-ES', {
                year: 'numeric',
                month: 'short',
                day: 'numeric'
            });
        }
    }
}

// Exportar para uso global
window.CommunityDatabase = CommunityDatabase;


