    async getCommunities() {
        console.log('🏘️ Obteniendo comunidades...');
        console.log('📊 Supabase client:', this.supabase);

        try {
            // CONSULTA SIN FILTROS PRIMERO
            console.log('🔍 Haciendo consulta SIN filtros...');
            const { data: allData, error: allError } = await this.supabase
                .from('communities')
                .select('*');

            console.log('📊 Resultado SIN filtros:', allData);
            console.log('📊 Error SIN filtros:', allError);

            if (allError) {
                console.error('❌ Error en consulta sin filtros:', allError);
            }

            // CONSULTA CON FILTROS
            console.log('🔍 Haciendo consulta CON filtros...');
            const { data: filteredData, error: filteredError } = await this.supabase
                .from('communities')
                .select('*')
                .eq('is_active', true);

            console.log('📊 Resultado CON filtros:', filteredData);
            console.log('📊 Error CON filtros:', filteredError);

            if (filteredError) {
                console.error('❌ Error en consulta con filtros:', filteredError);
            }

            // VERIFICAR ESTADO DE is_active
            if (allData && allData.length > 0) {
                console.log('🔍 Estado is_active de cada comunidad:');
                allData.forEach((community, index) => {
                    console.log(`  ${index + 1}. ${community.name}: is_active = ${community.is_active}`);
                });
            }

            // RETORNAR DATOS SIN FILTROS TEMPORALMENTE PARA TESTING
            console.log('⚠️ RETORNANDO DATOS SIN FILTROS PARA DEBUG');
            return allData || [];

        } catch (error) {
            console.error('❌ Error crítico obteniendo comunidades:', error);
            return [];
        }
    }