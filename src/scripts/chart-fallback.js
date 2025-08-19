// src/scripts/chart-fallback.js
// Funciones de Chart.js como fallback cuando Grafana no funciona

// Inicializar Supabase
const supabaseUrl = 'https://miwbzotcuaywpdbidpwo.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1pd2J6b3RjdWF5d3BkYmlkcHdvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzQ1NzI5NzQsImV4cCI6MjA1MDE0ODk3NH0.0987ghtU';
const supabase = window.supabase.createClient(supabaseUrl, supabaseKey);

// Función para dibujar gráfico de gauge (Índice Global)
async function drawGaugeFallback(containerId, sessionId) {
  try {
    const { data, error } = await supabase
      .from('v_index_session_final')
      .select('*')
      .eq('session_id', sessionId)
      .single();

    if (error) throw error;

    const ctx = document.createElement('canvas');
    ctx.width = 400;
    ctx.height = 300;
    
    const container = document.getElementById(containerId);
    if (container) {
      container.innerHTML = '';
      container.appendChild(ctx);
    }

    new Chart(ctx, {
      type: 'doughnut',
      data: {
        datasets: [{
          data: [data.index_value || 0, 100 - (data.index_value || 0)],
          backgroundColor: ['#4CAF50', '#f0f0f0'],
          borderWidth: 0
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: '70%',
        plugins: {
          legend: { display: false },
          tooltip: { enabled: false }
        }
      },
      plugins: [{
        id: 'gaugeText',
        afterDraw: (chart) => {
          const { ctx, width, height } = chart;
          ctx.save();
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.font = 'bold 24px Arial';
          ctx.fillStyle = '#333';
          ctx.fillText(`${data.index_value || 0}%`, width / 2, height / 2);
          ctx.font = '14px Arial';
          ctx.fillText('Índice Global', width / 2, height / 2 + 30);
        }
      }]
    });
  } catch (error) {
    console.error('Error dibujando gauge:', error);
  }
}

// Función para dibujar gráfico de barras (Dimensiones)
async function drawDimensionsFallback(containerId, sessionId) {
  try {
    const { data, error } = await supabase
      .from('v_scores_dimension_session')
      .select('*')
      .eq('session_id', sessionId)
      .order('score', { ascending: false });

    if (error) throw error;

    const ctx = document.createElement('canvas');
    ctx.width = 600;
    ctx.height = 400;
    
    const container = document.getElementById(containerId);
    if (container) {
      container.innerHTML = '';
      container.appendChild(ctx);
    }

    new Chart(ctx, {
      type: 'bar',
      data: {
        labels: data.map(d => d.dimension_name),
        datasets: [{
          label: 'Puntuación',
          data: data.map(d => d.score),
          backgroundColor: '#2196F3',
          borderColor: '#1976D2',
          borderWidth: 1
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          y: {
            beginAtZero: true,
            max: 100
          }
        },
        plugins: {
          title: {
            display: true,
            text: 'Puntuaciones por Dimensión'
          }
        }
      }
    });
  } catch (error) {
    console.error('Error dibujando dimensiones:', error);
  }
}

// Función para dibujar gráfico de radar (Subdominios)
async function drawSubdomainsFallback(containerId, sessionId) {
  try {
    const { data, error } = await supabase
      .from('v_scores_subdomain_session')
      .select('*')
      .eq('session_id', sessionId)
      .order('score', { ascending: false })
      .limit(10);

    if (error) throw error;

    const ctx = document.createElement('canvas');
    ctx.width = 500;
    ctx.height = 400;
    
    const container = document.getElementById(containerId);
    if (container) {
      container.innerHTML = '';
      container.appendChild(ctx);
    }

    new Chart(ctx, {
      type: 'radar',
      data: {
        labels: data.map(d => d.subdomain_name),
        datasets: [{
          label: 'Puntuación',
          data: data.map(d => d.score),
          backgroundColor: 'rgba(255, 99, 132, 0.2)',
          borderColor: 'rgb(255, 99, 132)',
          borderWidth: 2,
          pointBackgroundColor: 'rgb(255, 99, 132)',
          pointBorderColor: '#fff',
          pointHoverBackgroundColor: '#fff',
          pointHoverBorderColor: 'rgb(255, 99, 132)'
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          r: {
            beginAtZero: true,
            max: 100
          }
        },
        plugins: {
          title: {
            display: true,
            text: 'Top 10 Subdominios'
          }
        }
      }
    });
  } catch (error) {
    console.error('Error dibujando subdominios:', error);
  }
}

// Función principal de fallback
function drawChartFallback(panelId, sessionId) {
  console.log('Activando fallback Chart.js para panel:', panelId);
  
  switch (panelId) {
    case 1:
      drawGaugeFallback('grafana_idx_img', sessionId);
      break;
    case 6:
      drawDimensionsFallback('grafana_dims_img', sessionId);
      break;
    case 8:
      drawSubdomainsFallback('grafana_subs_img', sessionId);
      break;
    default:
      console.warn('Panel ID no reconocido:', panelId);
  }
}

// Exportar funciones para uso global
window.drawChartFallback = drawChartFallback;
