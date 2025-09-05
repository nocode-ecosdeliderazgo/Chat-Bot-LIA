// SOLUCIÓN URGENTE PARA MÓDULO DE MATERIALES
// REEMPLAZAR LA FUNCIÓN createMaterialsContent() EXISTENTE

    // ===== CREAR CONTENIDO DE MATERIALES - VERSIÓN CORREGIDA =====
    createMaterialsContent() {
        console.log('📚 Creando contenido de materiales - VERSIÓN CORREGIDA CON 11 LECCIONES');
        
        const centerPanel = document.querySelector('.center-panel .course-content');
        if (!centerPanel) {
            console.error('❌ No se encontró el panel central');
            return;
        }
        
        // Remover contenido existente de materiales si existe
        const existingMaterials = document.querySelector('.materials-content');
        if (existingMaterials) {
            existingMaterials.remove();
            console.log('🗑️ Contenido anterior removido');
        }
        
        // CREAR HTML CON LAS 11 LECCIONES COMPLETAS
        const materialsHTML = `
            <div class="materials-content">
                <div class="materials-header">
                    <h2>
                        <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                            <polyline points="14,2 14,8 20,8"/>
                        </svg>
                        Materiales del Curso
                    </h2>
                    <p>Contenido del curso de Inteligencia Artificial</p>
                </div>
                
                <div class="materials-grid" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(400px, 1fr)); gap: 1.5rem; margin-top: 2rem;">
                    
                    <!-- LECCIÓN 1: INTRODUCCIÓN A LA IA -->
                    <div class="material-card lesson-card" style="background: linear-gradient(135deg, rgba(0, 102, 204, 0.08), rgba(0, 102, 204, 0.05)); border: 2px solid rgba(0, 102, 204, 0.2); border-radius: 16px; padding: 1.5rem; min-height: 120px; display: flex; align-items: center; gap: 1rem; position: relative; transition: all 0.3s ease; margin-bottom: 1rem;">
                        <div class="lesson-number" style="position: absolute; top: 1rem; right: 1rem; background: linear-gradient(135deg, #0066CC, #0052A3); color: white; width: 32px; height: 32px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 0.9rem; z-index: 2;">01</div>
                        <div class="material-icon" style="width: 56px; height: 56px; background: linear-gradient(135deg, rgba(0, 102, 204, 0.2), rgba(0, 102, 204, 0.1)); border: 2px solid rgba(0, 102, 204, 0.3); border-radius: 16px; display: flex; align-items: center; justify-content: center; flex-shrink: 0;">
                            <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width: 28px; height: 28px; color: #0066CC;">
                                <polygon points="5,3 19,12 5,21"/>
                            </svg>
                        </div>
                        <div class="material-info" style="flex: 1; min-width: 0; padding-right: 1rem;">
                            <h3 style="font-size: 1.2rem !important; font-weight: 700 !important; color: #FFFFFF !important; margin-bottom: 0.75rem; line-height: 1.3; opacity: 1 !important; visibility: visible !important;">Introducción a la IA</h3>
                            <p style="color: rgba(255, 255, 255, 0.8) !important; font-size: 0.95rem; line-height: 1.5; margin-bottom: 1rem; opacity: 1 !important; visibility: visible !important;">Conceptos fundamentales y aplicaciones de la Inteligencia Artificial</p>
                            <div class="lesson-meta" style="display: flex; gap: 1rem; align-items: center; flex-wrap: wrap;">
                                <span class="lesson-duration" style="background: linear-gradient(135deg, rgba(0, 102, 204, 0.15), rgba(0, 102, 204, 0.08)); color: #0066CC !important; padding: 0.4rem 0.8rem; border-radius: 8px; font-size: 0.85rem; font-weight: 600; border: 1px solid rgba(0, 102, 204, 0.3);">⏱️ 15 min</span>
                                <span class="lesson-status completed" style="background: linear-gradient(135deg, #22C55E, #16A34A) !important; color: white !important; padding: 0.4rem 0.8rem; border-radius: 8px; font-size: 0.8rem; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; border: 1px solid #16A34A;">✅ Completado</span>
                            </div>
                        </div>
                        <button class="play-btn" onclick="window.chatOnline.playLesson(1)" style="width: 48px; height: 48px; background: linear-gradient(135deg, #0066CC, #0052A3); border: 2px solid #0066CC; border-radius: 50%; color: white; cursor: pointer; display: flex; align-items: center; justify-content: center; flex-shrink: 0; transition: all 0.3s ease;">
                            <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width: 20px; height: 20px; margin-left: 2px;">
                                <polygon points="5,3 19,12 5,21"/>
                            </svg>
                        </button>
                    </div>
                    
                    <!-- LECCIÓN 2: HISTORIA DE LA IA -->
                    <div class="material-card lesson-card" style="background: linear-gradient(135deg, rgba(0, 102, 204, 0.08), rgba(0, 102, 204, 0.05)); border: 2px solid rgba(0, 102, 204, 0.2); border-radius: 16px; padding: 1.5rem; min-height: 120px; display: flex; align-items: center; gap: 1rem; position: relative; transition: all 0.3s ease; margin-bottom: 1rem;">
                        <div class="lesson-number" style="position: absolute; top: 1rem; right: 1rem; background: linear-gradient(135deg, #0066CC, #0052A3); color: white; width: 32px; height: 32px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 0.9rem; z-index: 2;">02</div>
                        <div class="material-icon" style="width: 56px; height: 56px; background: linear-gradient(135deg, rgba(0, 102, 204, 0.2), rgba(0, 102, 204, 0.1)); border: 2px solid rgba(0, 102, 204, 0.3); border-radius: 16px; display: flex; align-items: center; justify-content: center; flex-shrink: 0;">
                            <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width: 28px; height: 28px; color: #0066CC;">
                                <polygon points="5,3 19,12 5,21"/>
                            </svg>
                        </div>
                        <div class="material-info" style="flex: 1; min-width: 0; padding-right: 1rem;">
                            <h3 style="font-size: 1.2rem !important; font-weight: 700 !important; color: #FFFFFF !important; margin-bottom: 0.75rem; line-height: 1.3; opacity: 1 !important; visibility: visible !important;">Historia de la IA</h3>
                            <p style="color: rgba(255, 255, 255, 0.8) !important; font-size: 0.95rem; line-height: 1.5; margin-bottom: 1rem; opacity: 1 !important; visibility: visible !important;">Evolución histórica desde los primeros algoritmos hasta la actualidad</p>
                            <div class="lesson-meta" style="display: flex; gap: 1rem; align-items: center; flex-wrap: wrap;">
                                <span class="lesson-duration" style="background: linear-gradient(135deg, rgba(0, 102, 204, 0.15), rgba(0, 102, 204, 0.08)); color: #0066CC !important; padding: 0.4rem 0.8rem; border-radius: 8px; font-size: 0.85rem; font-weight: 600; border: 1px solid rgba(0, 102, 204, 0.3);">⏱️ 22 min</span>
                                <span class="lesson-status current" style="background: linear-gradient(135deg, #F59E0B, #D97706) !important; color: white !important; padding: 0.4rem 0.8rem; border-radius: 8px; font-size: 0.8rem; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; border: 1px solid #D97706;">🟡 En Progreso</span>
                            </div>
                        </div>
                        <button class="play-btn" onclick="window.chatOnline.playLesson(2)" style="width: 48px; height: 48px; background: linear-gradient(135deg, #0066CC, #0052A3); border: 2px solid #0066CC; border-radius: 50%; color: white; cursor: pointer; display: flex; align-items: center; justify-content: center; flex-shrink: 0; transition: all 0.3s ease;">
                            <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width: 20px; height: 20px; margin-left: 2px;">
                                <polygon points="5,3 19,12 5,21"/>
                            </svg>
                        </button>
                    </div>
                    
                    <!-- LECCIÓN 3: MACHINE LEARNING BÁSICO -->
                    <div class="material-card lesson-card" style="background: linear-gradient(135deg, rgba(0, 102, 204, 0.08), rgba(0, 102, 204, 0.05)); border: 2px solid rgba(0, 102, 204, 0.2); border-radius: 16px; padding: 1.5rem; min-height: 120px; display: flex; align-items: center; gap: 1rem; position: relative; transition: all 0.3s ease; margin-bottom: 1rem;">
                        <div class="lesson-number" style="position: absolute; top: 1rem; right: 1rem; background: linear-gradient(135deg, #0066CC, #0052A3); color: white; width: 32px; height: 32px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 0.9rem; z-index: 2;">03</div>
                        <div class="material-icon" style="width: 56px; height: 56px; background: linear-gradient(135deg, rgba(0, 102, 204, 0.2), rgba(0, 102, 204, 0.1)); border: 2px solid rgba(0, 102, 204, 0.3); border-radius: 16px; display: flex; align-items: center; justify-content: center; flex-shrink: 0;">
                            <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width: 28px; height: 28px; color: #666;">
                                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                                <circle cx="12" cy="16" r="1"/>
                                <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                            </svg>
                        </div>
                        <div class="material-info" style="flex: 1; min-width: 0; padding-right: 1rem;">
                            <h3 style="font-size: 1.2rem !important; font-weight: 700 !important; color: #FFFFFF !important; margin-bottom: 0.75rem; line-height: 1.3; opacity: 1 !important; visibility: visible !important;">Machine Learning Básico</h3>
                            <p style="color: rgba(255, 255, 255, 0.8) !important; font-size: 0.95rem; line-height: 1.5; margin-bottom: 1rem; opacity: 1 !important; visibility: visible !important;">Fundamentos del aprendizaje automático y sus aplicaciones</p>
                            <div class="lesson-meta" style="display: flex; gap: 1rem; align-items: center; flex-wrap: wrap;">
                                <span class="lesson-duration" style="background: linear-gradient(135deg, rgba(0, 102, 204, 0.15), rgba(0, 102, 204, 0.08)); color: #0066CC !important; padding: 0.4rem 0.8rem; border-radius: 8px; font-size: 0.85rem; font-weight: 600; border: 1px solid rgba(0, 102, 204, 0.3);">⏱️ 18 min</span>
                                <span class="lesson-status locked" style="background: rgba(255, 255, 255, 0.1) !important; color: rgba(255, 255, 255, 0.6) !important; padding: 0.4rem 0.8rem; border-radius: 8px; font-size: 0.8rem; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; border: 1px solid rgba(255, 255, 255, 0.2);">🔒 Bloqueado</span>
                            </div>
                        </div>
                        <button class="play-btn" disabled style="width: 48px; height: 48px; background: rgba(255, 255, 255, 0.1); border: 2px solid rgba(255, 255, 255, 0.2); border-radius: 50%; color: rgba(255, 255, 255, 0.6); cursor: not-allowed; display: flex; align-items: center; justify-content: center; flex-shrink: 0; transition: all 0.3s ease;">
                            <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width: 20px; height: 20px; margin-left: 2px;">
                                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                                <circle cx="12" cy="16" r="1"/>
                                <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                            </svg>
                        </button>
                    </div>
                    
                    <!-- LECCIÓN 4: REDES NEURONALES -->
                    <div class="material-card lesson-card" style="background: linear-gradient(135deg, rgba(0, 102, 204, 0.08), rgba(0, 102, 204, 0.05)); border: 2px solid rgba(0, 102, 204, 0.2); border-radius: 16px; padding: 1.5rem; min-height: 120px; display: flex; align-items: center; gap: 1rem; position: relative; transition: all 0.3s ease; margin-bottom: 1rem;">
                        <div class="lesson-number" style="position: absolute; top: 1rem; right: 1rem; background: linear-gradient(135deg, #0066CC, #0052A3); color: white; width: 32px; height: 32px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 0.9rem; z-index: 2;">04</div>
                        <div class="material-icon" style="width: 56px; height: 56px; background: linear-gradient(135deg, rgba(0, 102, 204, 0.2), rgba(0, 102, 204, 0.1)); border: 2px solid rgba(0, 102, 204, 0.3); border-radius: 16px; display: flex; align-items: center; justify-content: center; flex-shrink: 0;">
                            <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width: 28px; height: 28px; color: #666;">
                                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                                <circle cx="12" cy="16" r="1"/>
                                <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                            </svg>
                        </div>
                        <div class="material-info" style="flex: 1; min-width: 0; padding-right: 1rem;">
                            <h3 style="font-size: 1.2rem !important; font-weight: 700 !important; color: #FFFFFF !important; margin-bottom: 0.75rem; line-height: 1.3; opacity: 1 !important; visibility: visible !important;">Redes Neuronales</h3>
                            <p style="color: rgba(255, 255, 255, 0.8) !important; font-size: 0.95rem; line-height: 1.5; margin-bottom: 1rem; opacity: 1 !important; visibility: visible !important;">Arquitectura y funcionamiento de las redes neuronales artificiales</p>
                            <div class="lesson-meta" style="display: flex; gap: 1rem; align-items: center; flex-wrap: wrap;">
                                <span class="lesson-duration" style="background: linear-gradient(135deg, rgba(0, 102, 204, 0.15), rgba(0, 102, 204, 0.08)); color: #0066CC !important; padding: 0.4rem 0.8rem; border-radius: 8px; font-size: 0.85rem; font-weight: 600; border: 1px solid rgba(0, 102, 204, 0.3);">⏱️ 25 min</span>
                                <span class="lesson-status locked" style="background: rgba(255, 255, 255, 0.1) !important; color: rgba(255, 255, 255, 0.6) !important; padding: 0.4rem 0.8rem; border-radius: 8px; font-size: 0.8rem; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; border: 1px solid rgba(255, 255, 255, 0.2);">🔒 Bloqueado</span>
                            </div>
                        </div>
                        <button class="play-btn" disabled style="width: 48px; height: 48px; background: rgba(255, 255, 255, 0.1); border: 2px solid rgba(255, 255, 255, 0.2); border-radius: 50%; color: rgba(255, 255, 255, 0.6); cursor: not-allowed; display: flex; align-items: center; justify-content: center; flex-shrink: 0;">
                            <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width: 20px; height: 20px;">
                                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                                <circle cx="12" cy="16" r="1"/>
                                <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                            </svg>
                        </button>
                    </div>
                    
                    <!-- LECCIÓN 5: PROCESAMIENTO DE LENGUAJE NATURAL -->
                    <div class="material-card lesson-card" style="background: linear-gradient(135deg, rgba(0, 102, 204, 0.08), rgba(0, 102, 204, 0.05)); border: 2px solid rgba(0, 102, 204, 0.2); border-radius: 16px; padding: 1.5rem; min-height: 120px; display: flex; align-items: center; gap: 1rem; position: relative; transition: all 0.3s ease; margin-bottom: 1rem;">
                        <div class="lesson-number" style="position: absolute; top: 1rem; right: 1rem; background: linear-gradient(135deg, #0066CC, #0052A3); color: white; width: 32px; height: 32px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 0.9rem; z-index: 2;">05</div>
                        <div class="material-icon" style="width: 56px; height: 56px; background: linear-gradient(135deg, rgba(0, 102, 204, 0.2), rgba(0, 102, 204, 0.1)); border: 2px solid rgba(0, 102, 204, 0.3); border-radius: 16px; display: flex; align-items: center; justify-content: center; flex-shrink: 0;">
                            <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width: 28px; height: 28px; color: #666;">
                                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                                <circle cx="12" cy="16" r="1"/>
                                <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                            </svg>
                        </div>
                        <div class="material-info" style="flex: 1; min-width: 0; padding-right: 1rem;">
                            <h3 style="font-size: 1.2rem !important; font-weight: 700 !important; color: #FFFFFF !important; margin-bottom: 0.75rem; line-height: 1.3; opacity: 1 !important; visibility: visible !important;">Procesamiento de Lenguaje Natural</h3>
                            <p style="color: rgba(255, 255, 255, 0.8) !important; font-size: 0.95rem; line-height: 1.5; margin-bottom: 1rem; opacity: 1 !important; visibility: visible !important;">Cómo las máquinas comprenden y procesan el lenguaje humano</p>
                            <div class="lesson-meta" style="display: flex; gap: 1rem; align-items: center; flex-wrap: wrap;">
                                <span class="lesson-duration" style="background: linear-gradient(135deg, rgba(0, 102, 204, 0.15), rgba(0, 102, 204, 0.08)); color: #0066CC !important; padding: 0.4rem 0.8rem; border-radius: 8px; font-size: 0.85rem; font-weight: 600; border: 1px solid rgba(0, 102, 204, 0.3);">⏱️ 20 min</span>
                                <span class="lesson-status locked" style="background: rgba(255, 255, 255, 0.1) !important; color: rgba(255, 255, 255, 0.6) !important; padding: 0.4rem 0.8rem; border-radius: 8px; font-size: 0.8rem; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; border: 1px solid rgba(255, 255, 255, 0.2);">🔒 Bloqueado</span>
                            </div>
                        </div>
                        <button class="play-btn" disabled style="width: 48px; height: 48px; background: rgba(255, 255, 255, 0.1); border: 2px solid rgba(255, 255, 255, 0.2); border-radius: 50%; color: rgba(255, 255, 255, 0.6); cursor: not-allowed; display: flex; align-items: center; justify-content: center; flex-shrink: 0;">
                            <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width: 20px; height: 20px;">
                                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                                <circle cx="12" cy="16" r="1"/>
                                <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                            </svg>
                        </button>
                    </div>
                    
                    <!-- LECCIÓN 6: VISIÓN POR COMPUTADORA -->
                    <div class="material-card lesson-card" style="background: linear-gradient(135deg, rgba(0, 102, 204, 0.08), rgba(0, 102, 204, 0.05)); border: 2px solid rgba(0, 102, 204, 0.2); border-radius: 16px; padding: 1.5rem; min-height: 120px; display: flex; align-items: center; gap: 1rem; position: relative; transition: all 0.3s ease; margin-bottom: 1rem;">
                        <div class="lesson-number" style="position: absolute; top: 1rem; right: 1rem; background: linear-gradient(135deg, #0066CC, #0052A3); color: white; width: 32px; height: 32px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 0.9rem; z-index: 2;">06</div>
                        <div class="material-icon" style="width: 56px; height: 56px; background: linear-gradient(135deg, rgba(0, 102, 204, 0.2), rgba(0, 102, 204, 0.1)); border: 2px solid rgba(0, 102, 204, 0.3); border-radius: 16px; display: flex; align-items: center; justify-content: center; flex-shrink: 0;">
                            <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width: 28px; height: 28px; color: #666;">
                                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                                <circle cx="12" cy="16" r="1"/>
                                <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                            </svg>
                        </div>
                        <div class="material-info" style="flex: 1; min-width: 0; padding-right: 1rem;">
                            <h3 style="font-size: 1.2rem !important; font-weight: 700 !important; color: #FFFFFF !important; margin-bottom: 0.75rem; line-height: 1.3; opacity: 1 !important; visibility: visible !important;">Visión por Computadora</h3>
                            <p style="color: rgba(255, 255, 255, 0.8) !important; font-size: 0.95rem; line-height: 1.5; margin-bottom: 1rem; opacity: 1 !important; visibility: visible !important;">Tecnologías para el reconocimiento y análisis de imágenes</p>
                            <div class="lesson-meta" style="display: flex; gap: 1rem; align-items: center; flex-wrap: wrap;">
                                <span class="lesson-duration" style="background: linear-gradient(135deg, rgba(0, 102, 204, 0.15), rgba(0, 102, 204, 0.08)); color: #0066CC !important; padding: 0.4rem 0.8rem; border-radius: 8px; font-size: 0.85rem; font-weight: 600; border: 1px solid rgba(0, 102, 204, 0.3);">⏱️ 28 min</span>
                                <span class="lesson-status locked" style="background: rgba(255, 255, 255, 0.1) !important; color: rgba(255, 255, 255, 0.6) !important; padding: 0.4rem 0.8rem; border-radius: 8px; font-size: 0.8rem; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; border: 1px solid rgba(255, 255, 255, 0.2);">🔒 Bloqueado</span>
                            </div>
                        </div>
                        <button class="play-btn" disabled style="width: 48px; height: 48px; background: rgba(255, 255, 255, 0.1); border: 2px solid rgba(255, 255, 255, 0.2); border-radius: 50%; color: rgba(255, 255, 255, 0.6); cursor: not-allowed; display: flex; align-items: center; justify-content: center; flex-shrink: 0;">
                            <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width: 20px; height: 20px;">
                                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                                <circle cx="12" cy="16" r="1"/>
                                <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                            </svg>
                        </button>
                    </div>
                    
                    <!-- LECCIÓN 7: ÉTICA EN IA -->
                    <div class="material-card lesson-card" style="background: linear-gradient(135deg, rgba(0, 102, 204, 0.08), rgba(0, 102, 204, 0.05)); border: 2px solid rgba(0, 102, 204, 0.2); border-radius: 16px; padding: 1.5rem; min-height: 120px; display: flex; align-items: center; gap: 1rem; position: relative; transition: all 0.3s ease; margin-bottom: 1rem;">
                        <div class="lesson-number" style="position: absolute; top: 1rem; right: 1rem; background: linear-gradient(135deg, #0066CC, #0052A3); color: white; width: 32px; height: 32px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 0.9rem; z-index: 2;">07</div>
                        <div class="material-icon" style="width: 56px; height: 56px; background: linear-gradient(135deg, rgba(0, 102, 204, 0.2), rgba(0, 102, 204, 0.1)); border: 2px solid rgba(0, 102, 204, 0.3); border-radius: 16px; display: flex; align-items: center; justify-content: center; flex-shrink: 0;">
                            <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width: 28px; height: 28px; color: #666;">
                                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                                <circle cx="12" cy="16" r="1"/>
                                <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                            </svg>
                        </div>
                        <div class="material-info" style="flex: 1; min-width: 0; padding-right: 1rem;">
                            <h3 style="font-size: 1.2rem !important; font-weight: 700 !important; color: #FFFFFF !important; margin-bottom: 0.75rem; line-height: 1.3; opacity: 1 !important; visibility: visible !important;">Ética en IA</h3>
                            <p style="color: rgba(255, 255, 255, 0.8) !important; font-size: 0.95rem; line-height: 1.5; margin-bottom: 1rem; opacity: 1 !important; visibility: visible !important;">Consideraciones éticas y responsabilidad en el desarrollo de IA</p>
                            <div class="lesson-meta" style="display: flex; gap: 1rem; align-items: center; flex-wrap: wrap;">
                                <span class="lesson-duration" style="background: linear-gradient(135deg, rgba(0, 102, 204, 0.15), rgba(0, 102, 204, 0.08)); color: #0066CC !important; padding: 0.4rem 0.8rem; border-radius: 8px; font-size: 0.85rem; font-weight: 600; border: 1px solid rgba(0, 102, 204, 0.3);">⏱️ 16 min</span>
                                <span class="lesson-status locked" style="background: rgba(255, 255, 255, 0.1) !important; color: rgba(255, 255, 255, 0.6) !important; padding: 0.4rem 0.8rem; border-radius: 8px; font-size: 0.8rem; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; border: 1px solid rgba(255, 255, 255, 0.2);">🔒 Bloqueado</span>
                            </div>
                        </div>
                        <button class="play-btn" disabled style="width: 48px; height: 48px; background: rgba(255, 255, 255, 0.1); border: 2px solid rgba(255, 255, 255, 0.2); border-radius: 50%; color: rgba(255, 255, 255, 0.6); cursor: not-allowed; display: flex; align-items: center; justify-content: center; flex-shrink: 0;">
                            <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width: 20px; height: 20px;">
                                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                                <circle cx="12" cy="16" r="1"/>
                                <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                            </svg>
                        </button>
                    </div>
                    
                    <!-- LECCIÓN 8: IA GENERATIVA -->
                    <div class="material-card lesson-card" style="background: linear-gradient(135deg, rgba(0, 102, 204, 0.08), rgba(0, 102, 204, 0.05)); border: 2px solid rgba(0, 102, 204, 0.2); border-radius: 16px; padding: 1.5rem; min-height: 120px; display: flex; align-items: center; gap: 1rem; position: relative; transition: all 0.3s ease; margin-bottom: 1rem;">
                        <div class="lesson-number" style="position: absolute; top: 1rem; right: 1rem; background: linear-gradient(135deg, #0066CC, #0052A3); color: white; width: 32px; height: 32px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 0.9rem; z-index: 2;">08</div>
                        <div class="material-icon" style="width: 56px; height: 56px; background: linear-gradient(135deg, rgba(0, 102, 204, 0.2), rgba(0, 102, 204, 0.1)); border: 2px solid rgba(0, 102, 204, 0.3); border-radius: 16px; display: flex; align-items: center; justify-content: center; flex-shrink: 0;">
                            <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width: 28px; height: 28px; color: #666;">
                                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                                <circle cx="12" cy="16" r="1"/>
                                <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                            </svg>
                        </div>
                        <div class="material-info" style="flex: 1; min-width: 0; padding-right: 1rem;">
                            <h3 style="font-size: 1.2rem !important; font-weight: 700 !important; color: #FFFFFF !important; margin-bottom: 0.75rem; line-height: 1.3; opacity: 1 !important; visibility: visible !important;">IA Generativa</h3>
                            <p style="color: rgba(255, 255, 255, 0.8) !important; font-size: 0.95rem; line-height: 1.5; margin-bottom: 1rem; opacity: 1 !important; visibility: visible !important;">Modelos de IA capaces de generar contenido original</p>
                            <div class="lesson-meta" style="display: flex; gap: 1rem; align-items: center; flex-wrap: wrap;">
                                <span class="lesson-duration" style="background: linear-gradient(135deg, rgba(0, 102, 204, 0.15), rgba(0, 102, 204, 0.08)); color: #0066CC !important; padding: 0.4rem 0.8rem; border-radius: 8px; font-size: 0.85rem; font-weight: 600; border: 1px solid rgba(0, 102, 204, 0.3);">⏱️ 24 min</span>
                                <span class="lesson-status locked" style="background: rgba(255, 255, 255, 0.1) !important; color: rgba(255, 255, 255, 0.6) !important; padding: 0.4rem 0.8rem; border-radius: 8px; font-size: 0.8rem; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; border: 1px solid rgba(255, 255, 255, 0.2);">🔒 Bloqueado</span>
                            </div>
                        </div>
                        <button class="play-btn" disabled style="width: 48px; height: 48px; background: rgba(255, 255, 255, 0.1); border: 2px solid rgba(255, 255, 255, 0.2); border-radius: 50%; color: rgba(255, 255, 255, 0.6); cursor: not-allowed; display: flex; align-items: center; justify-content: center; flex-shrink: 0;">
                            <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width: 20px; height: 20px;">
                                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                                <circle cx="12" cy="16" r="1"/>
                                <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                            </svg>
                        </button>
                    </div>
                    
                    <!-- LECCIÓN 9: AUTOMATIZACIÓN CON IA -->
                    <div class="material-card lesson-card" style="background: linear-gradient(135deg, rgba(0, 102, 204, 0.08), rgba(0, 102, 204, 0.05)); border: 2px solid rgba(0, 102, 204, 0.2); border-radius: 16px; padding: 1.5rem; min-height: 120px; display: flex; align-items: center; gap: 1rem; position: relative; transition: all 0.3s ease; margin-bottom: 1rem;">
                        <div class="lesson-number" style="position: absolute; top: 1rem; right: 1rem; background: linear-gradient(135deg, #0066CC, #0052A3); color: white; width: 32px; height: 32px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 0.9rem; z-index: 2;">09</div>
                        <div class="material-icon" style="width: 56px; height: 56px; background: linear-gradient(135deg, rgba(0, 102, 204, 0.2), rgba(0, 102, 204, 0.1)); border: 2px solid rgba(0, 102, 204, 0.3); border-radius: 16px; display: flex; align-items: center; justify-content: center; flex-shrink: 0;">
                            <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width: 28px; height: 28px; color: #666;">
                                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                                <circle cx="12" cy="16" r="1"/>
                                <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                            </svg>
                        </div>
                        <div class="material-info" style="flex: 1; min-width: 0; padding-right: 1rem;">
                            <h3 style="font-size: 1.2rem !important; font-weight: 700 !important; color: #FFFFFF !important; margin-bottom: 0.75rem; line-height: 1.3; opacity: 1 !important; visibility: visible !important;">Automatización con IA</h3>
                            <p style="color: rgba(255, 255, 255, 0.8) !important; font-size: 0.95rem; line-height: 1.5; margin-bottom: 1rem; opacity: 1 !important; visibility: visible !important;">Aplicación de IA para automatizar procesos y tareas</p>
                            <div class="lesson-meta" style="display: flex; gap: 1rem; align-items: center; flex-wrap: wrap;">
                                <span class="lesson-duration" style="background: linear-gradient(135deg, rgba(0, 102, 204, 0.15), rgba(0, 102, 204, 0.08)); color: #0066CC !important; padding: 0.4rem 0.8rem; border-radius: 8px; font-size: 0.85rem; font-weight: 600; border: 1px solid rgba(0, 102, 204, 0.3);">⏱️ 30 min</span>
                                <span class="lesson-status locked" style="background: rgba(255, 255, 255, 0.1) !important; color: rgba(255, 255, 255, 0.6) !important; padding: 0.4rem 0.8rem; border-radius: 8px; font-size: 0.8rem; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; border: 1px solid rgba(255, 255, 255, 0.2);">🔒 Bloqueado</span>
                            </div>
                        </div>
                        <button class="play-btn" disabled style="width: 48px; height: 48px; background: rgba(255, 255, 255, 0.1); border: 2px solid rgba(255, 255, 255, 0.2); border-radius: 50%; color: rgba(255, 255, 255, 0.6); cursor: not-allowed; display: flex; align-items: center; justify-content: center; flex-shrink: 0;">
                            <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width: 20px; height: 20px;">
                                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                                <circle cx="12" cy="16" r="1"/>
                                <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                            </svg>
                        </button>
                    </div>
                    
                    <!-- LECCIÓN 10: FUTURO DE LA IA -->
                    <div class="material-card lesson-card" style="background: linear-gradient(135deg, rgba(0, 102, 204, 0.08), rgba(0, 102, 204, 0.05)); border: 2px solid rgba(0, 102, 204, 0.2); border-radius: 16px; padding: 1.5rem; min-height: 120px; display: flex; align-items: center; gap: 1rem; position: relative; transition: all 0.3s ease; margin-bottom: 1rem;">
                        <div class="lesson-number" style="position: absolute; top: 1rem; right: 1rem; background: linear-gradient(135deg, #0066CC, #0052A3); color: white; width: 32px; height: 32px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 0.9rem; z-index: 2;">10</div>
                        <div class="material-icon" style="width: 56px; height: 56px; background: linear-gradient(135deg, rgba(0, 102, 204, 0.2), rgba(0, 102, 204, 0.1)); border: 2px solid rgba(0, 102, 204, 0.3); border-radius: 16px; display: flex; align-items: center; justify-content: center; flex-shrink: 0;">
                            <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width: 28px; height: 28px; color: #666;">
                                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                                <circle cx="12" cy="16" r="1"/>
                                <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                            </svg>
                        </div>
                        <div class="material-info" style="flex: 1; min-width: 0; padding-right: 1rem;">
                            <h3 style="font-size: 1.2rem !important; font-weight: 700 !important; color: #FFFFFF !important; margin-bottom: 0.75rem; line-height: 1.3; opacity: 1 !important; visibility: visible !important;">Futuro de la IA</h3>
                            <p style="color: rgba(255, 255, 255, 0.8) !important; font-size: 0.95rem; line-height: 1.5; margin-bottom: 1rem; opacity: 1 !important; visibility: visible !important;">Tendencias y perspectivas futuras en Inteligencia Artificial</p>
                            <div class="lesson-meta" style="display: flex; gap: 1rem; align-items: center; flex-wrap: wrap;">
                                <span class="lesson-duration" style="background: linear-gradient(135deg, rgba(0, 102, 204, 0.15), rgba(0, 102, 204, 0.08)); color: #0066CC !important; padding: 0.4rem 0.8rem; border-radius: 8px; font-size: 0.85rem; font-weight: 600; border: 1px solid rgba(0, 102, 204, 0.3);">⏱️ 19 min</span>
                                <span class="lesson-status locked" style="background: rgba(255, 255, 255, 0.1) !important; color: rgba(255, 255, 255, 0.6) !important; padding: 0.4rem 0.8rem; border-radius: 8px; font-size: 0.8rem; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; border: 1px solid rgba(255, 255, 255, 0.2);">🔒 Bloqueado</span>
                            </div>
                        </div>
                        <button class="play-btn" disabled style="width: 48px; height: 48px; background: rgba(255, 255, 255, 0.1); border: 2px solid rgba(255, 255, 255, 0.2); border-radius: 50%; color: rgba(255, 255, 255, 0.6); cursor: not-allowed; display: flex; align-items: center; justify-content: center; flex-shrink: 0;">
                            <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width: 20px; height: 20px;">
                                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                                <circle cx="12" cy="16" r="1"/>
                                <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                            </svg>
                        </button>
                    </div>
                    
                    <!-- LECCIÓN 11: PROYECTO FINAL -->
                    <div class="material-card lesson-card" style="background: linear-gradient(135deg, rgba(0, 102, 204, 0.08), rgba(0, 102, 204, 0.05)); border: 2px solid rgba(0, 102, 204, 0.2); border-radius: 16px; padding: 1.5rem; min-height: 120px; display: flex; align-items: center; gap: 1rem; position: relative; transition: all 0.3s ease; margin-bottom: 1rem;">
                        <div class="lesson-number" style="position: absolute; top: 1rem; right: 1rem; background: linear-gradient(135deg, #0066CC, #0052A3); color: white; width: 32px; height: 32px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 0.9rem; z-index: 2;">11</div>
                        <div class="material-icon" style="width: 56px; height: 56px; background: linear-gradient(135deg, rgba(0, 102, 204, 0.2), rgba(0, 102, 204, 0.1)); border: 2px solid rgba(0, 102, 204, 0.3); border-radius: 16px; display: flex; align-items: center; justify-content: center; flex-shrink: 0;">
                            <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width: 28px; height: 28px; color: #666;">
                                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                                <circle cx="12" cy="16" r="1"/>
                                <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                            </svg>
                        </div>
                        <div class="material-info" style="flex: 1; min-width: 0; padding-right: 1rem;">
                            <h3 style="font-size: 1.2rem !important; font-weight: 700 !important; color: #FFFFFF !important; margin-bottom: 0.75rem; line-height: 1.3; opacity: 1 !important; visibility: visible !important;">Proyecto Final</h3>
                            <p style="color: rgba(255, 255, 255, 0.8) !important; font-size: 0.95rem; line-height: 1.5; margin-bottom: 1rem; opacity: 1 !important; visibility: visible !important;">Proyecto integrador para aplicar todos los conocimientos adquiridos</p>
                            <div class="lesson-meta" style="display: flex; gap: 1rem; align-items: center; flex-wrap: wrap;">
                                <span class="lesson-duration" style="background: linear-gradient(135deg, rgba(0, 102, 204, 0.15), rgba(0, 102, 204, 0.08)); color: #0066CC !important; padding: 0.4rem 0.8rem; border-radius: 8px; font-size: 0.85rem; font-weight: 600; border: 1px solid rgba(0, 102, 204, 0.3);">⏱️ 45 min</span>
                                <span class="lesson-status locked" style="background: rgba(255, 255, 255, 0.1) !important; color: rgba(255, 255, 255, 0.6) !important; padding: 0.4rem 0.8rem; border-radius: 8px; font-size: 0.8rem; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; border: 1px solid rgba(255, 255, 255, 0.2);">🔒 Bloqueado</span>
                            </div>
                        </div>
                        <button class="play-btn" disabled style="width: 48px; height: 48px; background: rgba(255, 255, 255, 0.1); border: 2px solid rgba(255, 255, 255, 0.2); border-radius: 50%; color: rgba(255, 255, 255, 0.6); cursor: not-allowed; display: flex; align-items: center; justify-content: center; flex-shrink: 0;">
                            <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width: 20px; height: 20px;">
                                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                                <circle cx="12" cy="16" r="1"/>
                                <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                            </svg>
                        </button>
                    </div>
                    
                </div>
            </div>
        `;
        
        centerPanel.insertAdjacentHTML('beforeend', materialsHTML);
        console.log('✅ Contenido de materiales creado exitosamente con 11 lecciones');
    }

// INSTRUCCIONES PARA APLICAR ESTE CÓDIGO:
// 1. ABRIR el archivo src/Chat-Online/chat-online.js
// 2. BUSCAR la función createMaterialsContent() existente (aproximadamente línea 4598)
// 3. REEMPLAZAR toda la función existente con este código
// 4. GUARDAR el archivo
// 5. REFRESCAR el navegador (Ctrl+F5 para limpiar caché)