// Motor genérico del cuestionario: carga preguntas por perfil/área desde Supabase

(async function(){
  const params = new URLSearchParams(location.search);
  let perfil = decodeURIComponent(params.get('perfil') || '').trim();
  let area = decodeURIComponent(params.get('area') || '').trim();
  // Fallback desde localStorage si no vienen parámetros
  if (!perfil || !area) {
    try {
      const raw = localStorage.getItem('profileQuestionnaireData');
      if (raw) {
        const t = JSON.parse(raw);
        if (!perfil && t.perfilFinal) perfil = String(t.perfilFinal).trim();
        if (!area && t.respuestasSeccion1?.area) area = t.respuestasSeccion1.area;
      }
    } catch (_) {}
  }
  // Fallback adicional: leer de users.type_rol guardado en localStorage.currentUser
  if (!perfil) {
    try {
      const rawUser = localStorage.getItem('currentUser');
      if (rawUser) {
        const u = JSON.parse(rawUser);
        perfil = String(u.type_rol || u.typeRol || '').trim();
      }
    } catch (_) {}
  }
  if (!area) area = 'Otra';

  // Ocultar subtítulo de perfil/área (solicitado)
  try {
    const sub = document.getElementById('quizSubtitle');
    if (sub) sub.style.display = 'none';
  } catch(_) {}

  function injectScaleHelpOnce(){
    try{
      const header = document.querySelector('.quiz-header-info');
      if (!header || document.getElementById('scaleHelp')) return;
      const help = document.createElement('div');
      help.id = 'scaleHelp';
      help.className = 'scale-help';
      help.innerHTML = `
        <div class="scale-title">Instrucciones del cuestionario</div>
        <div class="scale-intro">
          • Lee cada enunciado y elige un número del 1 al 7 que describa tu situación actual.<br/>
          • No hay respuestas correctas o incorrectas; responde con honestidad y rapidez.<br/>
          • Si dudas, elige el valor que mejor te represente hoy (no el ideal).<br/>
          • En Multi‑Selección, marca todas las opciones que apliquen. En Abiertas, escribe una idea breve.<br/>
          • Haz clic en el título de cada pregunta para mostrar u ocultar el significado de la escala (1–7).
        </div>
        <div class="scale-note">Marca un solo valor por pregunta; podrás guardar y finalizar cuando termines.</div>`;
      header.appendChild(help);
    }catch(_){}
  }

  function ensureLocalSession() {
    try {
      const key = `quizSession:${perfil}:${area}`;
      const existing = localStorage.getItem(key);
      if (existing) return existing;
      const id = `local-${Date.now()}`;
      localStorage.setItem(key, id);
      return id;
    } catch (_) { return `local-${Date.now()}`; }
  }

  let currentUserId = null;

  async function getSupabaseUserId() {
    if (!window.supabase) return null;
    try {
      const { data: { session } } = await window.supabase.auth.getSession();
      currentUserId = session?.user?.id || null;
      return currentUserId;
    } catch (_) { return null; }
  }

  function showGlobalError(message){
    try{
      const list = document.getElementById('questionList');
      let box = document.getElementById('quizGlobalError');
      if(!box){
        box = document.createElement('div');
        box.id = 'quizGlobalError';
        box.style.margin = '12px 0 8px 0';
        box.style.padding = '10px 12px';
        box.style.border = '1px solid #e74c3c';
        box.style.borderRadius = '8px';
        box.style.background = 'rgba(231,76,60,.12)';
        box.style.color = '#ff6b6b';
        box.style.fontSize = '.95rem';
        list.parentElement.insertBefore(box, list);
      }
      box.textContent = message || 'Por favor completa todas las preguntas.';
    }catch(_){}
  }

  function clearGlobalError(){
    const box = document.getElementById('quizGlobalError');
    if (box) box.remove();
  }

  function maybeClearGlobalError(){
    if (!document.querySelector('.q-error-msg')) clearGlobalError();
  }

  // Crear/continuar sesión
  async function ensureSession(){
    if(!window.supabase){ console.warn('Supabase no disponible, usando sesión local'); return ensureLocalSession(); }
    const userId = await getSupabaseUserId();
    if(!userId){ console.warn('Sin sesión AUTH de Supabase, usando sesión local'); return ensureLocalSession(); }
    // Busca sesión abierta del mismo perfil/área en las últimas 24h
    const { data: existing } = await supabase
      .from('user_questionnaire_sessions')
      .select('id')
      .eq('user_id', userId)
      .eq('perfil', perfil)
      .eq('area', area)
      .is('completed_at', null)
      .order('started_at', { ascending: false })
      .limit(1)
      .maybeSingle();
    if(existing) return existing.id;
    const { data: created, error } = await supabase
      .from('user_questionnaire_sessions')
      .insert({ user_id: userId, perfil, area })
      .select('id')
      .single();
    if(error) throw error;
    return created.id;
  }

  async function fetchQuestions(){
    if(!window.supabase){ console.warn('[Quiz] Supabase no está disponible'); return []; }
    // Simplificar: traer por perfil (ignorar área para evitar desajustes tipográficos)
    const { data, error } = await supabase
      .from('questions_catalog')
      .select('*')
      .eq('perfil', perfil)
      .eq('active', true)
      .order('order_num', { ascending: true });
    if (error) { console.error('[Quiz] Error cargando preguntas:', error); return []; }
    return data || [];
  }

  function getLikertHintsByType(type, noun){
    if (type === 'usage') {
      const n = noun || 'casos';
      return [
        `Nunca la uso`,
        `Pruebas mínimas en PoC`,
        `Uso ocasional en ${n} simples`,
        `Uso regular en algunos ${n}`,
        `Frecuente en la mayoría de ${n}`,
        `IA automatiza gran parte del ciclo`,
        `Es esencial; lo hago a escala con patrones estandarizados`
      ];
    }
    if (type === 'willingness') {
      return [
        'Nada dispuesto (no lo veo útil)',
        'Muy poco (solo si es gratis)',
        'Poco tiempo (tutoriales)',
        'Tiempo sí, dinero no',
        'Tiempo + algo de dinero',
        'Tiempo + dinero + práctica guiada',
        'Prioridad personal (programa/certificación)'
      ];
    }
    // knowledge (default)
    return [
      'Nulo (no conozco nada del tema)',
      'Conozco el término, pero no lo aplico',
      'He leído o escuchado sobre IA, pero no la uso',
      'Tengo conocimientos básicos y algunos intentos de uso',
      'Uso ocasional en tareas simples',
      'Uso regular en procesos clave',
      'Experto con experiencia práctica (uso avanzado y estratégico)'
    ];
  }

  function inferUsageNounFromContent(content){
    const t = (content || '').toLowerCase();
    if (t.includes('integracion')) return 'integraciones';
    if (t.includes('campaña')) return 'campañas';
    if (t.includes('reporte')) return 'reportes';
    if (t.includes('audiencia')) return 'audiencias';
    if (t.includes('proyecto')) return 'proyectos';
    if (t.includes('reunione') || t.includes('llamada')) return 'reuniones';
    if (t.includes('oportunidad')) return 'oportunidades';
    if (t.includes('cliente')) return 'clientes';
    if (t.includes('proveedor')) return 'proveedores';
    return 'casos';
  }

  function getLikertHints(areaOrPerfil, q){
    const a = String(areaOrPerfil || '').toLowerCase();
    const dim = String(q?.dimension || '').toLowerCase();
    const content = String(q?.content || '');
    // Seleccionar tipo de escala
    const isWillingness = dim === 'inversión' || /disposición|invertir|capacitarte/i.test(content);
    const isUsage = dim === 'aplicación' || dim === 'productividad' || /qué tanto utiliza/i.test(content);
    if (isWillingness) {
      return getLikertHintsByType('willingness');
    }
    if (isUsage) {
      const noun = inferUsageNounFromContent(content);
      return getLikertHintsByType('usage', noun);
    }
    // Plantilla por defecto
    let hints = getLikertHintsByType('knowledge');
    if (a.includes('ventas')) {
      hints = [
        'Nulo (no conozco nada del tema)',
        'Conozco el término, pero no lo aplico',
        'He leído o escuchado sobre IA, pero no la uso',
        'Tengo conocimientos básicos y algunos intentos de uso',
        'Uso ocasional en tareas de ventas simples (ej. correos, propuestas)',
        'Uso regular en procesos de prospección o seguimiento',
        'Experto con experiencia práctica (uso avanzado y estratégico en ventas)'
      ];
    } else if (a.includes('marketing')) {
      hints = [
        'Nulo (no conozco nada del tema)',
        'Conozco el término, pero no lo aplico',
        'He leído o escuchado sobre IA, pero no la uso',
        'Conocimientos básicos y algunas pruebas en marketing',
        'Uso ocasional en tareas simples (textos, imágenes, redes sociales)',
        'Uso regular en campañas y análisis de datos',
        'Experto con experiencia práctica (uso avanzado y estratégico en marketing)'
      ];
    } else if (a.includes('operaciones')) {
      hints = [
        'Nulo (no conozco nada del tema)',
        'Conozco el término, pero no lo aplico',
        'He leído o escuchado sobre IA, pero no la uso',
        'Conocimientos básicos y algunas pruebas',
        'Uso ocasional en tareas de productividad y organización',
        'Uso regular en procesos internos y gestión de proyectos',
        'Experto con experiencia práctica (uso avanzado y estratégico en operaciones)'
      ];
    } else if (a.includes('finanzas')) {
      hints = [
        'Nulo (no conozco nada del tema)',
        'Conozco el término, pero no lo aplico',
        'He leído o escuchado sobre IA, pero no la uso',
        'Conocimientos básicos y algunas pruebas en análisis financiero',
        'Uso ocasional en reportes y proyecciones',
        'Uso regular en análisis, planeación o riesgos financieros',
        'Experto con experiencia práctica (uso avanzado y estratégico en finanzas)'
      ];
    } else if (a.includes('rrhh') || a.includes('recursos humanos')) {
      hints = [
        'Nulo (no conozco nada del tema)',
        'Conozco el término, pero no lo aplico en RRHH',
        'He leído o escuchado sobre IA, pero no la uso',
        'Conocimientos básicos y pruebas aisladas',
        'Uso ocasional en procesos como reclutamiento o encuestas internas',
        'Uso regular en gestión de personas, clima laboral o desempeño',
        'Experto con experiencia práctica y estratégica en RRHH'
      ];
    } else if (a.includes('contabilidad')) {
      hints = [
        'Nulo (no conozco nada del tema)',
        'Conozco el término, no lo aplico',
        'He hecho pruebas mínimas',
        'Conozco casos de uso y lo uso a veces',
        'Uso ocasional en tareas del rol contable',
        'Uso regular con impacto en mis entregables',
        'Experto con experiencia práctica (uso avanzado en contabilidad)'
      ];
    } else if (a.includes('compras') || a.includes('supply')) {
      hints = [
        'Nulo (no conozco nada del tema)',
        'Conozco el término, sin aplicación práctica',
        'He probado herramientas de forma superficial',
        'Conozco casos de uso y he hecho pruebas en mi área',
        'Uso ocasional en tareas o decisiones del día a día',
        'Uso regular con impacto en proyectos y KPIs del área',
        'Experto con experiencia práctica (uso avanzado y estratégico)'
      ];
    } else if (a.includes('tecnolog') || a.includes('ti')) {
      hints = [
        'Nulo (no conozco nada del tema)',
        'Conozco el término, sin aplicación práctica',
        'He probado herramientas de forma superficial',
        'Conozco casos de uso aplicables a TI y he hecho pruebas',
        'Uso ocasional en tareas técnicas o de liderazgo',
        'Uso regular con impacto en proyectos y decisiones',
        'Experto con experiencia práctica (uso avanzado y estratégico en TI)'
      ];
    }
    return hints;
  }

  function normalizeQuestionText(text, q){
    try{
      const s = String(text || '').trim();
      if (q.qtype === 'Likert_1_7'){
        // Transformar en pregunta si viene como enunciado "Uso de IA ..."
        let m = s.match(/^Uso de IA (para|en)\s+(.*)$/i);
        if (m){
          const prep = m[1].toLowerCase();
          const rest = m[2].replace(/[\s]*$/,'');
          return `¿Qué tanto utiliza IA ${prep} ${rest}?`;
        }
      }
      return s;
    }catch(_){ return String(text||''); }
  }

  async function createLikert(q){
    // Intentar cargar opciones desde la BD para esta pregunta
    let dbOptions = [];
    try {
      dbOptions = await loadOptions(q.id);
    } catch(_) { dbOptions = []; }

    // Determinar número de pasos (por defecto 7)
    const numSteps = Math.max(1, (dbOptions && dbOptions.length) ? dbOptions.length : 7);

    // Radios 1..N
    const radios = document.createElement('div');
    radios.className='likert';
    for(let i=1;i<=numSteps;i++){
      const id = `${q.code}-L${i}`;
      const input = document.createElement('input');
      input.type='radio';
      input.name=`likert-${q.id}`;
      input.id=id;
      input.value=String(i);
      const label = document.createElement('label');
      label.setAttribute('for', id);
      label.textContent = String(i);
      radios.appendChild(input);
      radios.appendChild(label);
    }

    // Descripciones 1..N: priorizar las de la BD; si no hay, usar plantilla local
    let hints = [];
    if (Array.isArray(dbOptions) && dbOptions.length > 0) {
      // Ordenar por opt_key creciente por si viene como texto
      const sorted = [...dbOptions].sort((a,b)=> String(a.opt_key).localeCompare(String(b.opt_key), 'es', { numeric: true }));
      hints = sorted.map(o => String(o.opt_text || ''));
    } else {
      hints = getLikertHints(area || perfil || '', q);
    }

    const ul = document.createElement('ul');
    ul.className = 'likert-hints';
    // Ocultar significados por defecto; se mostrarán al hacer clic en la pregunta
    ul.style.display = 'none';
    ul.dataset.collapsible = 'true';
    hints.forEach((txt, idx) => {
      const li = document.createElement('li');
      li.innerHTML = `<strong>${idx+1}</strong> = ${txt}`;
      ul.appendChild(li);
    });

    const block = document.createElement('div');
    block.className = 'likert-block';
    block.appendChild(radios);
    block.appendChild(ul);
    return block;
  }

  function createBoolean(q){
    const wrap = document.createElement('div');
    wrap.className='boolean';
    [['true','Sí'], ['false','No']].forEach(([val,txt],idx)=>{
      const id = `${q.code}-B${idx}`;
      const input = document.createElement('input');
      input.type='radio';
      input.name=`bool-${q.id}`;
      input.id=id;
      input.value=val;
      const label = document.createElement('label');
      label.setAttribute('for', id);
      label.textContent = txt;
      wrap.appendChild(input);
      wrap.appendChild(label);
    });
    return wrap;
  }

  async function loadOptions(questionId){
    const { data } = await supabase
      .from('question_options')
      .select('opt_key,opt_text')
      .eq('question_id', questionId)
      .order('opt_key');
    return data || [];
  }

  async function createMultiCheck(q){
    const wrap = document.createElement('div'); wrap.className='multicheck';
    const opts = await loadOptions(q.id);
    for(const o of opts){
      const id = `${q.code}-M-${o.opt_key}`;
      const input = document.createElement('input'); input.type='checkbox'; input.name=`multi-${q.id}`; input.id=id; input.value=o.opt_key;
      const label = document.createElement('label'); label.setAttribute('for', id); label.textContent = o.opt_text;
      wrap.appendChild(input); wrap.appendChild(label);
    }
    return wrap;
  }

  function createOpenText(){
    const wrap = document.createElement('div'); wrap.className='open-text';
    const ta = document.createElement('textarea'); ta.name='open';
    wrap.appendChild(ta); return wrap;
  }

  function createSectionTitle(text){
    const h = document.createElement('div');
    h.className = 'q-section-title';
    h.textContent = text;
    return h;
  }

  function createSubTitle(text){
    const h = document.createElement('div');
    h.className = 'q-subtitle';
    h.textContent = text;
    return h;
  }

  function prettyDimensionName(dim){
    const map = {
      'Conocimiento': 'Conocimiento y Uso Personal de IA',
      'Aplicación': 'Aplicación en el Trabajo',
      'Productividad': 'Seguimiento y Productividad',
      'Estrategia': 'Estrategia / Reflexión',
      'Inversión': 'Capacitación y Apoyo'
    };
    return map[dim] || dim || '';
  }

  async function renderQuestions(questions){
    const list = document.getElementById('questionList'); list.innerHTML='';
    let lastDim = null; let lastSub = null;
    for(const q of questions){
      // Sección por cambio de dimensión
      if (q.dimension && q.dimension !== lastDim) {
        list.appendChild(createSectionTitle(prettyDimensionName(q.dimension)));
        lastDim = q.dimension; lastSub = null; // forzar subtítulo si cambia dimensión
      }
      // Subtítulo por cambio de subdominio
      if (q.subdomain && q.subdomain !== lastSub) {
        list.appendChild(createSubTitle(q.subdomain));
        lastSub = q.subdomain;
      }
      const card = document.createElement('div'); card.className='question'; card.dataset.qid=q.id;
      const title = document.createElement('div'); title.className='q-title'; title.textContent=normalizeQuestionText(q.content, q); card.appendChild(title);
      // guía de escala ya se muestra una sola vez en cabecera
      let inputEl;
      if(q.qtype==='Likert_1_7') inputEl = await createLikert(q);
      else if(q.qtype==='SiNo') inputEl = createBoolean(q);
      else if(q.qtype==='MultiCheck') inputEl = await createMultiCheck(q);
      else inputEl = createOpenText();
      card.appendChild(inputEl);
      // Toggle de significados al hacer clic en el título (solo Likert)
      if(q.qtype==='Likert_1_7'){
        const hints = card.querySelector('.likert-hints');
        if (hints) {
          title.style.cursor = 'pointer';
          title.addEventListener('click', ()=>{
            const isHidden = hints.style.display === 'none';
            hints.style.display = isHidden ? 'block' : 'none';
          });
        }
      }
      list.appendChild(card);
    }
  }

  async function persistAnswer(sessionId, q, value){
    const payload = { session_id: sessionId, question_id: q.id };
    if(q.qtype==='Likert_1_7') payload.answer_likert = parseInt(value,10);
    else if(q.qtype==='SiNo') payload.answer_bool = (value === 'true');
    else if(q.qtype==='MultiCheck') payload.answer_opts = value; // array
    else payload.answer_text = value;
    if (currentUserId) payload.user_id = currentUserId;
    // Upsert con fallback por si falta la restricción única en la BD
    const { error } = await supabase
      .from('user_question_responses')
      .upsert(payload, { onConflict: 'session_id,question_id' });
    if (error) {
      try {
        await supabase.from('user_question_responses')
          .delete()
          .eq('session_id', sessionId)
          .eq('question_id', q.id);
        await supabase.from('user_question_responses')
          .insert(payload);
      } catch (_) {}
    }
  }

  function collectValue(q, card){
    if(q.qtype==='Likert_1_7'){
      const sel = card.querySelector(`input[name="likert-${q.id}"]:checked`);
      return sel ? sel.value : null;
    }
    if(q.qtype==='SiNo'){
      const sel = card.querySelector(`input[name="bool-${q.id}"]:checked`);
      return sel ? sel.value : null;
    }
    if(q.qtype==='MultiCheck'){
      return Array.from(card.querySelectorAll(`input[name="multi-${q.id}"]:checked`)).map(i=>i.value);
    }
    return (card.querySelector('textarea')?.value || '').trim();
  }

  function isAnswered(q, card){
    const value = collectValue(q, card);
    if(q.qtype==='Likert_1_7' || q.qtype==='SiNo') return value !== null && value !== undefined;
    if(q.qtype==='MultiCheck') return Array.isArray(value) && value.length > 0;
    // Abiertas: exigir texto no vacío
    return typeof value === 'string' && value.length > 0;
  }

  function markCardError(card, message){
    try{
      card.style.border = '1px solid #e74c3c';
      card.style.boxShadow = '0 0 0 1px rgba(231,76,60,.3)';
      let msg = card.querySelector('.q-error-msg');
      if(!msg){
        msg = document.createElement('div');
        msg.className = 'q-error-msg';
        msg.style.color = '#ff6b6b';
        msg.style.marginTop = '6px';
        msg.style.fontSize = '.95rem';
        card.appendChild(msg);
      }
      msg.textContent = message || 'Por favor responde esta pregunta.';
    }catch(_){}
  }

  function clearCardError(card){
    try{
      card.style.border = '';
      card.style.boxShadow = '';
      const msg = card.querySelector('.q-error-msg');
      if(msg) msg.remove();
    }catch(_){}
  }

  // Render inicial
  // Esperar un momento a que supabase-client.js termine su init asíncrono
  async function waitForSupabaseReady(maxMs = 1500) {
    const start = Date.now();
    while (!window.supabase && Date.now() - start < maxMs) {
      await new Promise(r => setTimeout(r, 50));
    }
  }
  await waitForSupabaseReady();

  const sessionId = await ensureSession();
  injectScaleHelpOnce();
  const questions = await fetchQuestions();
  document.getElementById('quizTitle').textContent = `Cuestionario ${perfil}`;
  await renderQuestions(questions);
  if (!questions.length) {
    const list = document.getElementById('questionList');
    const msg = document.createElement('div');
    msg.style.opacity = '.9';
    msg.textContent = 'No se encontraron preguntas para tu perfil/área. Verifica que los seeds se hayan ejecutado.';
    list.appendChild(msg);
  }

  // Auto-guardado al cambiar
  document.getElementById('questionList').addEventListener('change', async (e)=>{
    const card = e.target.closest('.question'); if(!card) return;
    const qid = card.dataset.qid; const q = questions.find(x=>x.id===qid);
    if(!q) return;
    let value = collectValue(q, card);
    // limpiar error si ya tiene respuesta
    if (isAnswered(q, card)) { clearCardError(card); maybeClearGlobalError(); }
    await persistAnswer(sessionId, q, value);
  });

  // Guardar y finalizar
  document.getElementById('submitQuiz').addEventListener('click', async ()=>{
    // Guardado final de todo lo visible
    const missing = [];
    for(const q of questions){
      const card = document.querySelector(`.question[data-qid="${q.id}"]`);
      if(!card) continue;
      if (!isAnswered(q, card)) {
        missing.push({ id: q.id, code: q.code, card });
        markCardError(card, 'Esta pregunta es obligatoria.');
        continue;
      }
      const value = collectValue(q, card);
      if (window.supabase && String(sessionId).startsWith('local-') === false) {
        await persistAnswer(sessionId, q, value);
      }
    }
    if (missing.length > 0){
      // Enfocar la primera con error y abortar envío
      try { missing[0].card.scrollIntoView({ behavior: 'smooth', block: 'center' }); } catch(_){ window.scrollTo(0, 0); }
      showGlobalError(`Faltan ${missing.length} pregunta(s) por responder. Por favor completa todas las preguntas.`);
      return;
    }
    // marcar sesión completada y asegurar persistencia
    if (window.supabase && String(sessionId).startsWith('local-') === false) {
      await supabase.from('user_questionnaire_sessions')
        .update({ completed_at: new Date().toISOString() })
        .eq('id', sessionId);
    }
    // ir a resultados (cursos por ahora)
    location.href = '../cursos.html';
  });

  // UI: menú perfil
  window.toggleProfileMenu = function(ev){
    ev.preventDefault(); ev.stopPropagation();
    const menu = document.getElementById('profileMenu');
    menu.style.display = (menu.style.display==='block'?'none':'block');
  };
  document.addEventListener('click', (e)=>{
    const menu = document.getElementById('profileMenu');
    const btn = document.querySelector('.header-profile');
    if(menu && btn && !menu.contains(e.target) && !btn.contains(e.target)) menu.style.display='none';
  });
})();


