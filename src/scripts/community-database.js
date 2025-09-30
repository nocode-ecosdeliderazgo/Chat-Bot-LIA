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

    // NUEVO método que usa AuthUtils y múltiples fuentes
    async getCurrentUserWithAuthUtils() {
        console.log('🔍 Obteniendo usuario con AuthUtils...');

        try {
            // MÉTODO 1: Usar AuthUtils si está disponible
            if (window.AuthUtils) {
                console.log('🔄 Intentando obtener usuario con AuthUtils...');
                const authUtilsUser = await window.AuthUtils.getCurrentAuthenticatedUser();

                if (authUtilsUser) {
                    console.log('✅ Usuario obtenido via AuthUtils:', authUtilsUser.email || authUtilsUser.id);

                    // Sincronizar con todas las fuentes
                    window.AuthUtils.syncUserToAllSources(authUtilsUser);

                    this.currentUser = authUtilsUser;
                    return authUtilsUser;
                }
            } else {
                console.warn('⚠️ AuthUtils no disponible - usando métodos fallback');
            }

            // MÉTODO 2: Verificar localStorage directamente (como funciona el menú)
            console.log('🔄 Verificando localStorage directamente...');
            const localStorageSources = ['currentUser', 'userData', 'user'];

            for (const source of localStorageSources) {
                try {
                    const data = localStorage.getItem(source);
                    if (data && data !== 'null' && data !== 'undefined') {
                        const user = JSON.parse(data);
                        if (user && (user.id || user.user_id || user.email)) {
                            console.log(`✅ Usuario encontrado en localStorage.${source}:`, user.email || user.id);

                            // Normalizar estructura
                            const normalizedUser = {
                                id: user.id || user.user_id || user.uid,
                                email: user.email || user.user?.email,
                                display_name: user.display_name || user.name,
                                user_metadata: user.user_metadata || {},
                                app_metadata: user.app_metadata || {},
                                created_at: user.created_at || new Date().toISOString()
                            };

                            this.currentUser = normalizedUser;

                            // Sincronizar con otras fuentes
                            try {
                                localStorage.setItem('currentUser', JSON.stringify(normalizedUser));
                                window.currentUser = normalizedUser;
                            } catch (syncError) {
                                console.warn('⚠️ Error sincronizando usuario:', syncError);
                            }

                            return normalizedUser;
                        }
                    }
                } catch (parseError) {
                    console.warn(`⚠️ Error parseando localStorage.${source}:`, parseError);
                    continue;
                }
            }

            // MÉTODO 3: Fallback al método original
            console.log('🔄 Fallback al método getCurrentUser original...');
            return await this.getCurrentUserOriginal();

        } catch (error) {
            console.error('❌ Error crítico en getCurrentUserWithAuthUtils:', error);
            this.currentUser = null;
            return null;
        }
    }

    // Método principal que usa el nuevo enfoque
    async getCurrentUser() {
        console.log('🔍 NUEVO: getCurrentUser usando AuthUtils y múltiples fuentes...');
        return await this.getCurrentUserWithAuthUtils();
    }

    // Método original renombrado como backup
    async getCurrentUserOriginal() {
        try {
            console.log('ðŸ” Obteniendo usuario actual...');
            
            // Intentar obtener usuario autenticado de Supabase
            // DIAGNÓSTICO: Verificar que Supabase auth esté disponible
            if (!this.supabase || !this.supabase.auth) {
                console.error('❌ DIAGNÓSTICO: Supabase auth no está disponible');
                console.log('📊 this.supabase:', this.supabase);
                return null;
            }

            console.log('✅ DIAGNÓSTICO: Supabase auth disponible');

            // USAR getSession() como otros archivos exitosos
            console.log('🔍 ULTRATHINK: Usando getSession() en lugar de getUser()...');
            const { data: { session }, error: sessionError } = await this.supabase.auth.getSession();

            console.log('📊 DIAGNÓSTICO Session completa:', session);
            console.log('📊 DIAGNÓSTICO Session error:', sessionError);

            if (sessionError) {
                console.error('❌ Error obteniendo sesión:', sessionError);
                return null;
            }

            // Verificar session && session.user como patrón exitoso
            if (!session || !session.user) {
                console.warn('⚠️ DIAGNÓSTICO: No hay sesión activa o usuario en sesión');
                console.log('📊 session:', session);
                console.log('📊 session?.user:', session?.user);

                // Intentar también getUser() para comparación
                console.log('🔍 DIAGNÓSTICO: Intentando getUser() para comparación...');
                const { data: { user }, error: userError } = await this.supabase.auth.getUser();
                console.log('📊 DIAGNÓSTICO getUser() result:', user);
                console.log('📊 DIAGNÓSTICO getUser() error:', userError);

                this.currentUser = null;
                return null;
            }

            const user = session.user;
            console.log('✅ ULTRATHINK: Usuario encontrado en sesión:', user.email);
            console.log('📊 DIAGNÓSTICO User ID:', user.id);
            console.log('📊 DIAGNÓSTICO Session expires:', new Date(session.expires_at * 1000));
            
            if (user) {
                console.log('✅ Usuario autenticado encontrado:', user.email);
                
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
                console.log('👤 ULTRATHINK: Usuario establecido correctamente:', this.currentUser.email);
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
    // MÉTODOS DE COMUNIDADES
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

    async getCommunities() {
        console.log('🏘️ ULTRATHINK: Método principal de comunidades con autenticación híbrida...');
        console.log('📊 Supabase client:', this.supabase);
        console.log('👤 Usuario actual:', this.currentUser?.email || 'No autenticado');

        try {
            // PASO 1: Verificar autenticación y actualizar usuario si es necesario
            if (!this.currentUser) {
                console.log('🔍 ULTRATHINK: Verificando autenticación antes de consulta...');
                await this.getCurrentUser();
            }

            // PASO 2: Método híbrido con diagnóstico completo
            console.log('🏘️ ULTRATHINK: Iniciando consulta híbrida de comunidades...');

            // MÉTODO 1: Consulta básica sin filtros para diagnóstico
            console.log('🔍 MÉTODO 1: Consulta básica sin filtros...');
            const { data: basicData, error: basicError } = await this.supabase
                .from('communities')
                .select('*');

            console.log('📊 Resultado básico:', basicData);
            console.log('❌ Error básico:', basicError);

            // MÉTODO 2: Consulta con filtro is_active y orden
            console.log('🔍 MÉTODO 2: Consulta con filtro is_active...');
            const { data: activeData, error: activeError } = await this.supabase
                .from('communities')
                .select('*')
                .eq('is_active', true)
                .order('name');

            console.log('📊 Resultado activo:', activeData);
            console.log('❌ Error activo:', activeError);

            // ANÁLISIS DE RESULTADOS CON ESTRATEGIA HÍBRIDA
            if (basicData && basicData.length > 0) {
                console.log('✅ ULTRATHINK: Hay datos en la tabla communities');
                console.log('🔍 Análisis de cada comunidad:');
                basicData.forEach((community, index) => {
                    console.log(`  ${index + 1}. ${community.name}:`);
                    console.log(`     - ID: ${community.id}`);
                    console.log(`     - is_active: ${community.is_active}`);
                    console.log(`     - slug: ${community.slug}`);
                });

                // ESTRATEGIA HÍBRIDA: Preferir datos activos filtrados
                if (activeData && activeData.length > 0) {
                    console.log(`✅ ULTRATHINK: Retornando ${activeData.length} comunidades activas filtradas`);
                    return activeData;
                } else {
                    console.log('⚠️ ULTRATHINK: No hay comunidades activas, retornando todas para debug');
                    return basicData.filter(c => c.is_active !== false); // Filtro manual si hay problema con eq()
                }

            } else if (basicError) {
                console.error('❌ ULTRATHINK: Error en consulta básica - Analizando tipo...');

                // DIAGNÓSTICO DE ERROR RLS
                if (basicError.message.includes('RLS') ||
                    basicError.message.includes('policy') ||
                    basicError.message.includes('permission') ||
                    basicError.code === 'PGRST116') {
                    console.error('🔐 ULTRATHINK: Error de Row Level Security detectado');
                    console.error('💡 DIAGNÓSTICO: Las políticas RLS están bloqueando el acceso');
                    console.error('👤 Estado autenticación:', this.currentUser ? 'Autenticado' : 'No autenticado');

                    // Si hay usuario autenticado pero aún falla, puede ser problema de RLS
                    if (this.currentUser) {
                        console.error('🚨 ULTRATHINK: Usuario autenticado pero RLS bloqueando - Verificar políticas');
                    } else {
                        console.error('🔑 ULTRATHINK: Sin autenticación - RLS requiere usuario');
                    }

                    // NUEVO: Usar fallback cuando hay problemas de RLS
                    console.log('🔄 ULTRATHINK: Activando fallback por error RLS...');
                    return this.getFallbackCommunities();
                } else {
                    console.error('🔧 ULTRATHINK: Error técnico no relacionado con RLS:', basicError);
                }

                return [];
            } else {
                console.warn('⚠️ ULTRATHINK: No hay datos en la tabla communities');
                console.warn('🔍 DIAGNÓSTICO: La tabla puede estar vacía o política RLS muy restrictiva');
                console.warn('👤 Estado autenticación:', this.currentUser ? 'Autenticado' : 'No autenticado');
                return [];
            }

        } catch (error) {
            console.error('❌ ULTRATHINK: Error crítico en getCommunities híbrido:', error);
            console.error('🔍 DIAGNÓSTICO: Error de conexión o configuración');
            console.error('👤 Estado autenticación:', this.currentUser ? 'Autenticado' : 'No autenticado');

            // NUEVO: Usar fallback en caso de error crítico
            console.log('🔄 ULTRATHINK: Activando fallback por error crítico...');
            return this.getFallbackCommunities();
        }
    }

    async getCommunitiesULTRATHINK_BACKUP() {
        console.log('🏘️ ULTRATHINK: Obteniendo comunidades con diagnóstico completo...');
        console.log('📊 Supabase client:', this.supabase);
        console.log('👤 Usuario actual:', this.currentUser?.email || 'No autenticado');

        try {
            // MÉTODO 1: Consulta básica sin filtros para diagnóstico
            console.log('🔍 MÉTODO 1: Consulta básica sin filtros...');
            const { data: basicData, error: basicError } = await this.supabase
                .from('communities')
                .select('*');

            console.log('📊 Resultado básico:', basicData);
            console.log('❌ Error básico:', basicError);

            // MÉTODO 2: Consulta con filtro is_active
            console.log('🔍 MÉTODO 2: Consulta con filtro is_active...');
            const { data: activeData, error: activeError } = await this.supabase
                .from('communities')
                .select('*')
                .eq('is_active', true);

            console.log('📊 Resultado activo:', activeData);
            console.log('❌ Error activo:', activeError);

            // MÉTODO 3: Contar total de registros
            console.log('🔍 MÉTODO 3: Contando registros...');
            const { count, error: countError } = await this.supabase
                .from('communities')
                .select('*', { count: 'exact', head: true });

            console.log('📊 Total de registros:', count);
            console.log('❌ Error de conteo:', countError);

            // ANÁLISIS DE RESULTADOS
            if (basicData && basicData.length > 0) {
                console.log('✅ ULTRATHINK: Hay datos en la tabla communities');
                console.log('🔍 Análisis de cada comunidad:');
                basicData.forEach((community, index) => {
                    console.log(`  ${index + 1}. ${community.name}:`);
                    console.log(`     - ID: ${community.id}`);
                    console.log(`     - is_active: ${community.is_active}`);
                    console.log(`     - slug: ${community.slug}`);
                });

                // Determinar qué datos retornar
                if (activeData && activeData.length > 0) {
                    console.log('✅ ULTRATHINK: Retornando comunidades activas filtradas');
                    return activeData;
                } else {
                    console.log('⚠️ ULTRATHINK: No hay comunidades activas, retornando todas para debug');
                    return basicData;
                }

            } else if (basicError) {
                console.error('❌ ULTRATHINK: Error en consulta básica - Analizando tipo...');

                // Verificar si es error de RLS
                if (basicError.message.includes('RLS') ||
                    basicError.message.includes('policy') ||
                    basicError.message.includes('permission') ||
                    basicError.code === 'PGRST116') {
                    console.error('🔐 ULTRATHINK: Error de Row Level Security detectado');
                    console.error('💡 DIAGNÓSTICO: Las políticas RLS están bloqueando el acceso');
                    console.error('📋 SOLUCIÓN: Crear política pública o verificar autenticación');
                } else {
                    console.error('🔧 ULTRATHINK: Error técnico no relacionado con RLS:', basicError);
                }

                return [];
            } else {
                console.warn('⚠️ ULTRATHINK: No hay datos en la tabla communities');
                console.warn('🔍 DIAGNÓSTICO: La tabla puede estar vacía o política RLS muy restrictiva');
                return [];
            }

        } catch (error) {
            console.error('❌ ULTRATHINK: Error crítico obteniendo comunidades:', error);
            console.error('🔍 DIAGNÓSTICO: Error de conexión o configuración');
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
            console.log('[COMMUNITY_DB] Contando miembros para community_id:', communityId);
            console.log('[COMMUNITY_DB] Supabase disponible:', !!this.supabase);
            
            const { count, error } = await this.supabase
                .from('community_members')
                .select('id', { count: 'exact', head: true })
                .eq('community_id', communityId)
                .eq('is_active', true);

            console.log('[COMMUNITY_DB] Resultado de la consulta:');
            console.log('  - count:', count);
            console.log('  - error:', error);

            if (error) {
                console.error('[COMMUNITY_DB] Error contando miembros:', error);
                return 0;
            }

            const result = count || 0;
            console.log('[COMMUNITY_DB] Número final de miembros:', result);
            return result;
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

    // Método auxiliar para obtener comunidad por slug con fallback
    async getCommunityBySlugWithFallback(slug) {
        try {
            // Primero intentar con la base de datos
            const community = await this.getCommunityBySlug(slug);
            if (community) {
                return community;
            }
            
            // Si no se encuentra, usar fallback
            console.log('🔄 Usando fallback para slug:', slug);
            const fallbackCommunities = this.getFallbackCommunities();
            const fallbackCommunity = fallbackCommunities.find(c => c.slug === slug);
            
            if (fallbackCommunity) {
                console.log('✅ Comunidad encontrada en fallback:', fallbackCommunity.name);
                return fallbackCommunity;
            }
            
            console.warn('⚠️ No se encontró la comunidad en BD ni en fallback:', slug);
            return null;
        } catch (error) {
            console.error('❌ Error en getCommunityBySlugWithFallback:', error);
            return null;
        }
    }

    // NUEVA función de fallback para comunidades
    getFallbackCommunities() {
        console.log('🔄 Usando fallback de comunidades hardcodeadas...');
        return [
            {
                id: '7886aa14-35b9-41da-b099-29ff1ad3516b',
                name: 'Profesionales',
                description: 'Espacio abierto para perfiles sin cursos activos',
                slug: 'profesionales',
                image_url: null,
                is_active: true,
                member_count: 0,
                access_type: 'Free',
                visibility: 'public',
                created_at: new Date().toISOString()
            },
            {
                id: 'aa5a4c4c-ce64-4a12-b1ef-365aa0d320c8',
                name: 'SIF ICAP',
                description: 'Comunidad cerrada por invitación.',
                slug: 'sif-icap',
                image_url: null,
                is_active: true,
                member_count: 0,
                access_type: 'Invitación',
                visibility: 'invite_only',
                created_at: new Date().toISOString()
            },
            {
                id: 'b3b154e1-110e-4aa7-8998-ef208482a159',
                name: 'Openminder',
                description: 'Comunidad cerrada por invitación.',
                slug: 'openminder',
                image_url: null,
                is_active: true,
                member_count: 0,
                access_type: 'Invitación',
                visibility: 'invite_only',
                created_at: new Date().toISOString()
            },
            {
                id: 'd2dbebb1-5b57-4da7-9fc6-8b40c732b548',
                name: 'Ecos de Liderazgo',
                description: 'Comunidad cerrada por invitación.',
                slug: 'ecos-de-liderazgo',
                image_url: null,
                is_active: true,
                member_count: 0,
                access_type: 'Invitación',
                visibility: 'invite_only',
                created_at: new Date().toISOString()
            }
        ];
    }
}

// Exportar para uso global
window.CommunityDatabase = CommunityDatabase;


