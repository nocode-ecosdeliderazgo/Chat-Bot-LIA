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

	const looksLikePlaceholder = (key) => {
		if (!key) return true;
		if (key.includes('your-anon-key') || key.includes('TU_CLAVE_ANON_AQUI')) return true;
		if (/someGeneratedSignatureHere/i.test(key)) return true;
		const parts = key.split('.');
		return parts.length !== 3;
	};

	if (!SUPABASE_URL || !SUPABASE_ANON_KEY || SUPABASE_URL === 'https://your-project.supabase.co' || looksLikePlaceholder(SUPABASE_ANON_KEY)) {
		console.warn('[Supabase] Credenciales no configuradas. Usando modo desarrollo.');
		window.supabase = null;
	} else {
		try {
			// Importar dinámicamente Supabase
			const { createClient } = await import('https://esm.sh/@supabase/supabase-js@2');
			if (!window.__supabaseInstance) {
				window.__supabaseInstance = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
					auth: { storageKey: 'sb-lia' }
				});
			}
			const supabase = window.__supabaseInstance;
			
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


