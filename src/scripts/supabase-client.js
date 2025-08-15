// Inicialización del cliente de Supabase para uso en el navegador
// Lee las credenciales desde meta tags o variables globales

// IIFE para cargar Supabase de forma asíncrona sin usar export
(async function() {
	function getMeta(name) {
		const el = document.querySelector(`meta[name="${name}"]`);
		return el && el.content ? el.content.trim() : '';
	}

	const fallback = {
		url: (window.SUPABASE_URL || localStorage.getItem('supabaseUrl') || '').trim(),
		key: (window.SUPABASE_ANON_KEY || localStorage.getItem('supabaseAnonKey') || '').trim()
	};

	const SUPABASE_URL = getMeta('supabase-url') || fallback.url;
	const SUPABASE_ANON_KEY = getMeta('supabase-key') || fallback.key;

	if (!SUPABASE_URL || !SUPABASE_ANON_KEY || SUPABASE_URL === 'https://your-project.supabase.co' || SUPABASE_ANON_KEY === 'your-anon-key' || SUPABASE_ANON_KEY === 'TU_CLAVE_ANON_AQUI') {
		console.warn('[Supabase] Credenciales no configuradas. Usando modo desarrollo.');
		window.supabase = null;
	} else {
		try {
			// Importar dinámicamente Supabase
			const { createClient } = await import('https://esm.sh/@supabase/supabase-js@2');
			const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
			
			// Exponer de forma global para scripts no-modulo
			window.supabase = supabase;
			window.supabase.supabaseUrl = SUPABASE_URL;
			window.supabase.supabaseKey = SUPABASE_ANON_KEY;
			
			console.log('[Supabase] Cliente inicializado correctamente');
		} catch (error) {
			console.error('[Supabase] Error al cargar cliente:', error);
			window.supabase = null;
		}
	}
})();


