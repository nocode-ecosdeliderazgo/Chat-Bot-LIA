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

  const perfilText = document.getElementById('perfilText');
  const areaText = document.getElementById('areaText');
  if (perfilText) perfilText.textContent = perfil || '-';
  if (areaText) areaText.textContent = area || '-';

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
          • En Multi‑Selección, marca todas las opciones que apliquen. En Abiertas, escribe una idea breve.
        </div>
        <div class="scale-subtitle">Significado de la escala 1–7</div>
        <ul class="scale-meaning">
          <li><strong>1</strong>: Nulo / No lo conozco / Nunca lo uso</li>
          <li><strong>2</strong>: Conozco el término, no lo aplico / Pruebas mínimas</li>
          <li><strong>3</strong>: He probado poco / Uso ocasional y básico</li>
          <li><strong>4</strong>: Uso regular en algunos casos / Aplicación inicial</li>
          <li><strong>5</strong>: Uso frecuente / Impacta varias tareas</li>
          <li><strong>6</strong>: Uso alto / La IA optimiza gran parte de mi trabajo</li>
          <li><strong>7</strong>: Experto con experiencia práctica / Uso avanzado y estratégico</li>
        </ul>
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

  async function getSupabaseUserId() {
    if (!window.supabase) return null;
    try {
      const { data: { session } } = await window.supabase.auth.getSession();
      return session?.user?.id || null;
    } catch (_) { return null; }
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

  function createLikert(q){
    const wrap = document.createElement('div');
    wrap.className='likert';
    for(let i=1;i<=7;i++){
      const id = `${q.code}-L${i}`;
      const input = document.createElement('input');
      input.type='radio';
      input.name=`likert-${q.id}`;
      input.id=id;
      input.value=String(i);
      const label = document.createElement('label');
      label.setAttribute('for', id);
      label.textContent = String(i);
      wrap.appendChild(input);
      wrap.appendChild(label);
    }
    return wrap;
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

  async function renderQuestions(questions){
    const list = document.getElementById('questionList'); list.innerHTML='';
    for(const q of questions){
      const card = document.createElement('div'); card.className='question'; card.dataset.qid=q.id;
      const title = document.createElement('div'); title.className='q-title'; title.textContent=q.content; card.appendChild(title);
      // guía de escala ya se muestra una sola vez en cabecera
      let inputEl;
      if(q.qtype==='Likert_1_7') inputEl = createLikert(q);
      else if(q.qtype==='SiNo') inputEl = createBoolean(q);
      else if(q.qtype==='MultiCheck') inputEl = await createMultiCheck(q);
      else inputEl = createOpenText();
      card.appendChild(inputEl);
      list.appendChild(card);
    }
  }

  async function persistAnswer(sessionId, q, value){
    const payload = { session_id: sessionId, question_id: q.id };
    if(q.qtype==='Likert_1_7') payload.answer_likert = parseInt(value,10);
    else if(q.qtype==='SiNo') payload.answer_bool = (value === 'true');
    else if(q.qtype==='MultiCheck') payload.answer_opts = value; // array
    else payload.answer_text = value;
    await supabase.from('user_question_responses').upsert(payload, { onConflict: 'session_id,question_id' });
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
    await persistAnswer(sessionId, q, value);
  });

  // Guardar y finalizar
  document.getElementById('submitQuiz').addEventListener('click', async ()=>{
    // Guardado final de todo lo visible
    for(const q of questions){
      const card = document.querySelector(`.question[data-qid="${q.id}"]`);
      if(!card) continue;
      const value = collectValue(q, card);
      if(value!==null && value!==undefined && !(Array.isArray(value) && value.length===0)){
        if (window.supabase && String(sessionId).startsWith('local-') === false) {
          await persistAnswer(sessionId, q, value);
        }
      }
    }
    // marcar sesión completada
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


