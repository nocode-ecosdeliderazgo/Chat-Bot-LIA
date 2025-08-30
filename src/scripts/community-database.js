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
    // MÉTODOS DE USUARIO
    // ========================================

    async getCurrentUser() {
        try {
            console.log('🔍 Obteniendo usuario actual...');
            
            // Intentar obtener usuario autenticado de Supabase
            const { data: { user }, error } = await this.supabase.auth.getUser();
            
            if (!error && user) {
                console.log('✅ Usuario autenticado encontrado:', user);
                
                // Buscar o crear usuario en la tabla users
                let { data: userData, error: userError } = await this.supabase
                    .from('users')
                    .select('*')
                    .eq('id', user.id)
                    .single();

                if (userError && userError.code === 'PGRST116') {
                    // Usuario no existe en la tabla users, crearlo
                    console.log('📝 Creando nuevo usuario en la base de datos...');
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
                        console.error('❌ Error creando usuario:', createError);
                        return null;
                    }
                    
                    userData = newUser;
                } else if (userError) {
                    console.error('❌ Error obteniendo usuario:', userError);
                    return null;
                }

                this.currentUser = userData;
                console.log('👤 Usuario actual:', this.currentUser);
                return this.currentUser;
            } else {
                console.log('⚠️ No hay usuario autenticado');
                return null;
            }
        } catch (error) {
            console.error('❌ Error en getCurrentUser:', error);
            return null;
        }
    }

    async updateUserPoints(userId, points) {
        try {
            console.log(`💰 Actualizando puntos para usuario ${userId}: ${points}`);
            
            const { data, error } = await this.supabase
                .from('users')
                .update({ points: points })
                .eq('id', userId)
                .select();

            if (error) {
                console.error('❌ Error actualizando puntos:', error);
                return false;
            }

            console.log('✅ Puntos actualizados:', data);
            return true;
        } catch (error) {
            console.error('❌ Error en updateUserPoints:', error);
            return false;
        }
    }

    // ========================================
    // MÉTODOS DE COMUNIDADES
    // ========================================

    async getCommunities() {
        try {
            console.log('🏘️ Obteniendo comunidades...');
            
            const { data, error } = await this.supabase
                .from('communities')
                .select('*')
                .eq('is_active', true)
                .order('name');

            if (error) {
                console.error('❌ Error obteniendo comunidades:', error);
                return [];
            }

            console.log('✅ Comunidades obtenidas:', data);
            return data;
        } catch (error) {
            console.error('❌ Error en getCommunities:', error);
            return [];
        }
    }

    async getCommunityBySlug(slug) {
        try {
            console.log(`🏘️ Obteniendo comunidad: ${slug}`);
            
            const { data, error } = await this.supabase
                .from('communities')
                .select('*')
                .eq('slug', slug)
                .eq('is_active', true)
                .single();

            if (error) {
                console.error('❌ Error obteniendo comunidad:', error);
                return null;
            }

            console.log('✅ Comunidad obtenida:', data);
            return data;
        } catch (error) {
            console.error('❌ Error en getCommunityBySlug:', error);
            return null;
        }
    }

    // ========================================
    // MÉTODOS DE PUBLICACIONES
    // ========================================

    async getPosts(communityId, limit = 50) {
        try {
            console.log(`📝 Obteniendo publicaciones para comunidad ${communityId}...`);
            
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
                console.error('❌ Error obteniendo publicaciones:', error);
                return [];
            }

            console.log('✅ Publicaciones obtenidas:', data);
            return data;
        } catch (error) {
            console.error('❌ Error en getPosts:', error);
            return [];
        }
    }

    async createPost(communityId, content, title = null, attachmentUrl = null, attachmentType = null) {
        try {
            if (!this.currentUser) {
                console.error('❌ No hay usuario actual');
                return null;
            }

            console.log('📝 Creando nueva publicación...');
            
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
                console.error('❌ Error creando publicación:', error);
                return null;
            }

            console.log('✅ Publicación creada:', data);
            return data;
        } catch (error) {
            console.error('❌ Error en createPost:', error);
            return null;
        }
    }

    async updatePost(postId, content, title = null) {
        try {
            console.log(`📝 Actualizando publicación ${postId}...`);
            
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
                console.error('❌ Error actualizando publicación:', error);
                return null;
            }

            console.log('✅ Publicación actualizada:', data);
            return data;
        } catch (error) {
            console.error('❌ Error en updatePost:', error);
            return null;
        }
    }

    async deletePost(postId) {
        try {
            console.log(`🗑️ Eliminando publicación ${postId}...`);
            
            const { error } = await this.supabase
                .from('community_posts')
                .delete()
                .eq('id', postId);

            if (error) {
                console.error('❌ Error eliminando publicación:', error);
                return false;
            }

            console.log('✅ Publicación eliminada');
            return true;
        } catch (error) {
            console.error('❌ Error en deletePost:', error);
            return false;
        }
    }

    // ========================================
    // MÉTODOS DE COMENTARIOS
    // ========================================

    async getComments(postId) {
        try {
            console.log(`💬 Obteniendo comentarios para publicación ${postId}...`);
            
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
                console.error('❌ Error obteniendo comentarios:', error);
                return [];
            }

            console.log('✅ Comentarios obtenidos:', data);
            return data;
        } catch (error) {
            console.error('❌ Error en getComments:', error);
            return [];
        }
    }

    async createComment(postId, content, parentCommentId = null) {
        try {
            if (!this.currentUser) {
                console.error('❌ No hay usuario actual');
                return null;
            }

            console.log('💬 Creando nuevo comentario...');
            
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
                console.error('❌ Error creando comentario:', error);
                return null;
            }

            console.log('✅ Comentario creado:', data);
            return data;
        } catch (error) {
            console.error('❌ Error en createComment:', error);
            return null;
        }
    }

    // ========================================
    // MÉTODOS DE REACCIONES
    // ========================================

    async getReactions(postId = null, commentId = null) {
        try {
            console.log(`👍 Obteniendo reacciones...`);
            
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
                console.error('❌ Error obteniendo reacciones:', error);
                return [];
            }

            console.log('✅ Reacciones obtenidas:', data);
            return data;
        } catch (error) {
            console.error('❌ Error en getReactions:', error);
            return [];
        }
    }

    async toggleReaction(postId = null, commentId = null, reactionType = 'like') {
        try {
            if (!this.currentUser) {
                console.error('❌ No hay usuario actual');
                return false;
            }

            console.log(`👍 Alternando reacción: ${reactionType}...`);
            
            // Verificar si ya existe una reacción
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
                console.error('❌ Error verificando reacción existente:', checkError);
                return false;
            }

            if (existingReaction) {
                // Eliminar reacción existente
                const { error: deleteError } = await this.supabase
                    .from('community_reactions')
                    .delete()
                    .eq('id', existingReaction.id);

                if (deleteError) {
                    console.error('❌ Error eliminando reacción:', deleteError);
                    return false;
                }

                console.log('✅ Reacción eliminada');
                return true;
            } else {
                // Crear nueva reacción
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
                    console.error('❌ Error creando reacción:', insertError);
                    return false;
                }

                console.log('✅ Reacción creada');
                return true;
            }
        } catch (error) {
            console.error('❌ Error en toggleReaction:', error);
            return false;
        }
    }

    // ========================================
    // MÉTODOS DE MIEMBROS
    // ========================================

    async getCommunityMembers(communityId) {
        try {
            console.log(`👥 Obteniendo miembros de comunidad ${communityId}...`);
            
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
                console.error('❌ Error obteniendo miembros:', error);
                return [];
            }

            console.log('✅ Miembros obtenidos:', data);
            return data;
        } catch (error) {
            console.error('❌ Error en getCommunityMembers:', error);
            return [];
        }
    }

    async joinCommunity(communityId) {
        try {
            if (!this.currentUser) {
                console.error('❌ No hay usuario actual');
                return false;
            }

            console.log(`👥 Uniéndose a comunidad ${communityId}...`);
            
            const memberData = {
                community_id: communityId,
                user_id: this.currentUser.id,
                role: 'member'
            };

            const { error } = await this.supabase
                .from('community_members')
                .insert(memberData);

            if (error) {
                console.error('❌ Error uniéndose a comunidad:', error);
                return false;
            }

            console.log('✅ Usuario unido a comunidad');
            return true;
        } catch (error) {
            console.error('❌ Error en joinCommunity:', error);
            return false;
        }
    }

    // ========================================
    // MÉTODOS DE UTILIDAD
    // ========================================

    async initialize() {
        console.log('🚀 Inicializando CommunityDatabase...');
        await this.getCurrentUser();
        console.log('✅ CommunityDatabase inicializado');
    }

    formatTimestamp(timestamp) {
        const date = new Date(timestamp);
        const now = new Date();
        const diffInSeconds = Math.floor((now - date) / 1000);

        if (diffInSeconds < 60) {
            return 'Ahora mismo';
        } else if (diffInSeconds < 3600) {
            const minutes = Math.floor(diffInSeconds / 60);
            return `Hace ${minutes} minuto${minutes > 1 ? 's' : ''}`;
        } else if (diffInSeconds < 86400) {
            const hours = Math.floor(diffInSeconds / 3600);
            return `Hace ${hours} hora${hours > 1 ? 's' : ''}`;
        } else if (diffInSeconds < 2592000) {
            const days = Math.floor(diffInSeconds / 86400);
            return `Hace ${days} día${days > 1 ? 's' : ''}`;
        } else {
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
