// Dashboard Component
// Handles statistics display, charts, and dashboard functionality

class Dashboard {
    constructor(adminPanel) {
        this.adminPanel = adminPanel;
        this.stats = {};
        this.charts = {};
        this.refreshInterval = null;
        this.autoRefreshEnabled = true;
        
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.initializeCharts();
    }

    setupEventListeners() {
        // Refresh button if exists
        const refreshBtn = document.getElementById('refreshDashboard');
        if (refreshBtn) {
            refreshBtn.addEventListener('click', () => {
                this.loadStats();
            });
        }

        // Auto-refresh toggle
        const autoRefreshToggle = document.getElementById('autoRefreshToggle');
        if (autoRefreshToggle) {
            autoRefreshToggle.addEventListener('change', (e) => {
                this.toggleAutoRefresh(e.target.checked);
            });
        }
    }

    initializeCharts() {
        // Initialize Chart.js if available
        if (typeof Chart !== 'undefined') {
            this.initUserActivityChart();
        } else {
            // Load Chart.js dynamically
            this.loadChartJS().then(() => {
                this.initUserActivityChart();
            });
        }
    }

    async loadChartJS() {
        return new Promise((resolve, reject) => {
            const script = document.createElement('script');
            script.src = 'https://cdn.jsdelivr.net/npm/chart.js';
            script.onload = resolve;
            script.onerror = reject;
            document.head.appendChild(script);
        });
    }

    initUserActivityChart() {
        const ctx = document.getElementById('userActivityChart');
        if (!ctx) return;

        this.charts.userActivity = new Chart(ctx, {
            type: 'line',
            data: {
                labels: [],
                datasets: [{
                    label: 'Usuarios Activos',
                    data: [],
                    borderColor: '#44E5FF',
                    backgroundColor: 'rgba(68, 229, 255, 0.1)',
                    borderWidth: 2,
                    fill: true,
                    tension: 0.4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        grid: {
                            color: 'rgba(68, 229, 255, 0.1)'
                        }
                    },
                    x: {
                        grid: {
                            color: 'rgba(68, 229, 255, 0.1)'
                        }
                    }
                }
            }
        });
    }

    async load() {
        try {
            await this.loadStats();
            await this.loadPopularCourses();
            await this.loadSystemAlerts();
            
            if (this.autoRefreshEnabled) {
                this.startAutoRefresh();
            }
        } catch (error) {
            console.error('Error loading dashboard:', error);
            this.adminPanel.showToast('Error al cargar el dashboard', 'error');
        }
    }

    async loadStats() {
        try {
            this.adminPanel.showLoading('Cargando estadísticas...');
            
            const response = await this.adminPanel.apiCall('/api/admin/dashboard/stats');
            this.stats = response;
            
            this.updateStatsDisplay();
            this.updateUserActivityChart();
            
            this.adminPanel.hideLoading();
        } catch (error) {
            console.error('Error loading stats:', error);
            this.adminPanel.hideLoading();
            throw error;
        }
    }

    updateStatsDisplay() {
        // Update stat cards
        const statElements = {
            totalUsers: document.getElementById('totalUsers'),
            totalCourses: document.getElementById('totalCourses'),
            totalNews: document.getElementById('totalNews'),
            totalMessages: document.getElementById('totalMessages')
        };

        Object.keys(statElements).forEach(key => {
            const element = statElements[key];
            const value = this.stats[key] || 0;
            
            if (element) {
                this.animateNumber(element, parseInt(element.textContent) || 0, value);
            }
        });
    }

    animateNumber(element, start, end, duration = 1000) {
        const startTime = Date.now();
        const difference = end - start;

        const animate = () => {
            const elapsed = Date.now() - startTime;
            const progress = Math.min(elapsed / duration, 1);
            
            // Easing function
            const easeOutQuart = 1 - Math.pow(1 - progress, 4);
            const current = Math.round(start + difference * easeOutQuart);
            
            element.textContent = current.toLocaleString();
            
            if (progress < 1) {
                requestAnimationFrame(animate);
            }
        };

        animate();
    }

    updateUserActivityChart() {
        if (!this.charts.userActivity || !this.stats.userActivity) return;

        const chart = this.charts.userActivity;
        const activityData = this.stats.userActivity;

        chart.data.labels = activityData.labels || [];
        chart.data.datasets[0].data = activityData.data || [];
        chart.update('smooth');
    }

    async loadPopularCourses() {
        try {
            const response = await this.adminPanel.apiCall('/api/admin/dashboard/popular-courses');
            this.renderPopularCourses(response.courses);
        } catch (error) {
            console.error('Error loading popular courses:', error);
        }
    }

    renderPopularCourses(courses) {
        const container = document.getElementById('popularCourses');
        if (!container) return;

        if (!courses || courses.length === 0) {
            container.innerHTML = '<div class="no-data">No hay cursos disponibles</div>';
            return;
        }

        container.innerHTML = courses.map(course => `
            <div class="popular-course-item">
                <div class="course-info">
                    <div class="course-title">${course.title}</div>
                    <div class="course-stats">
                        <span class="students">${course.studentsCount} estudiantes</span>
                        <span class="rating">★ ${course.rating || 'N/A'}</span>
                    </div>
                </div>
                <div class="course-progress">
                    <div class="progress-bar">
                        <div class="progress-fill" style="width: ${course.completionRate}%"></div>
                    </div>
                    <span class="progress-text">${course.completionRate}%</span>
                </div>
            </div>
        `).join('');
    }

    async loadSystemAlerts() {
        try {
            const response = await this.adminPanel.apiCall('/api/admin/dashboard/alerts');
            this.renderSystemAlerts(response.alerts);
        } catch (error) {
            console.error('Error loading system alerts:', error);
        }
    }

    renderSystemAlerts(alerts) {
        const container = document.getElementById('systemAlerts');
        if (!container) return;

        if (!alerts || alerts.length === 0) {
            container.innerHTML = '<div class="no-alerts">✅ Todo funciona correctamente</div>';
            return;
        }

        container.innerHTML = alerts.map(alert => `
            <div class="alert-item ${alert.type}">
                <div class="alert-icon">
                    <i class="fas fa-${this.getAlertIcon(alert.type)}"></i>
                </div>
                <div class="alert-content">
                    <div class="alert-title">${alert.title}</div>
                    <div class="alert-message">${alert.message}</div>
                    <div class="alert-time">${this.adminPanel.formatTime(alert.createdAt)}</div>
                </div>
                ${alert.actionable ? `
                    <div class="alert-actions">
                        <button class="btn btn-small btn-primary" onclick="dashboard.handleAlertAction('${alert.id}', '${alert.action}')">
                            ${alert.actionLabel}
                        </button>
                    </div>
                ` : ''}
            </div>
        `).join('');
    }

    getAlertIcon(type) {
        const icons = {
            error: 'exclamation-triangle',
            warning: 'exclamation-circle',
            info: 'info-circle',
            success: 'check-circle'
        };
        return icons[type] || 'info-circle';
    }

    async handleAlertAction(alertId, action) {
        try {
            this.adminPanel.showLoading('Procesando acción...');
            
            await this.adminPanel.apiCall(`/api/admin/dashboard/alerts/${alertId}/action`, {
                method: 'POST',
                body: JSON.stringify({ action })
            });
            
            this.adminPanel.hideLoading();
            this.adminPanel.showToast('Acción completada exitosamente', 'success');
            
            // Reload alerts
            this.loadSystemAlerts();
        } catch (error) {
            console.error('Error handling alert action:', error);
            this.adminPanel.hideLoading();
            this.adminPanel.showToast('Error al procesar la acción', 'error');
        }
    }

    startAutoRefresh() {
        this.stopAutoRefresh();
        
        this.refreshInterval = setInterval(() => {
            this.loadStats();
        }, 30000); // Refresh every 30 seconds
    }

    stopAutoRefresh() {
        if (this.refreshInterval) {
            clearInterval(this.refreshInterval);
            this.refreshInterval = null;
        }
    }

    toggleAutoRefresh(enabled) {
        this.autoRefreshEnabled = enabled;
        
        if (enabled) {
            this.startAutoRefresh();
            this.adminPanel.showToast('Auto-refresh activado', 'info');
        } else {
            this.stopAutoRefresh();
            this.adminPanel.showToast('Auto-refresh desactivado', 'info');
        }
    }

    // Export functionality
    async exportData(type) {
        try {
            this.adminPanel.showLoading('Exportando datos...');
            
            const response = await this.adminPanel.apiCall(`/api/admin/dashboard/export/${type}`, {
                method: 'POST'
            });
            
            // Create download link
            const blob = new Blob([response.data], { type: response.mimeType });
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = response.filename;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            window.URL.revokeObjectURL(url);
            
            this.adminPanel.hideLoading();
            this.adminPanel.showToast('Datos exportados exitosamente', 'success');
        } catch (error) {
            console.error('Export error:', error);
            this.adminPanel.hideLoading();
            this.adminPanel.showToast('Error al exportar los datos', 'error');
        }
    }

    // Search functionality
    handleSearchResults(results) {
        // Filter results relevant to dashboard
        const relevantResults = results.filter(result => 
            result.type === 'stat' || result.type === 'alert' || result.type === 'course'
        );

        if (relevantResults.length === 0) {
            this.adminPanel.showToast('No se encontraron resultados en el dashboard', 'info');
            return;
        }

        // Highlight relevant sections
        this.highlightSearchResults(relevantResults);
    }

    highlightSearchResults(results) {
        // Remove previous highlights
        this.clearHighlights();

        results.forEach(result => {
            let element = null;
            
            switch (result.type) {
                case 'course':
                    element = document.querySelector(`[data-course-id="${result.id}"]`);
                    break;
                case 'alert':
                    element = document.querySelector(`[data-alert-id="${result.id}"]`);
                    break;
                case 'stat':
                    element = document.getElementById(result.elementId);
                    break;
            }

            if (element) {
                element.classList.add('search-highlight');
                element.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
        });

        // Clear highlights after 5 seconds
        setTimeout(() => {
            this.clearHighlights();
        }, 5000);
    }

    clearHighlights() {
        const highlighted = document.querySelectorAll('.search-highlight');
        highlighted.forEach(el => el.classList.remove('search-highlight'));
    }

    // Real-time updates
    setupWebSocket() {
        if (typeof WebSocket === 'undefined') return;

        const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
        const wsUrl = `${protocol}//${window.location.host}/ws/admin/dashboard`;

        this.websocket = new WebSocket(wsUrl);
        
        this.websocket.onopen = () => {
            console.log('Dashboard WebSocket connected');
        };

        this.websocket.onmessage = (event) => {
            const data = JSON.parse(event.data);
            this.handleWebSocketMessage(data);
        };

        this.websocket.onclose = () => {
            console.log('Dashboard WebSocket disconnected');
            // Attempt to reconnect after 5 seconds
            setTimeout(() => {
                this.setupWebSocket();
            }, 5000);
        };

        this.websocket.onerror = (error) => {
            console.error('Dashboard WebSocket error:', error);
        };
    }

    handleWebSocketMessage(data) {
        switch (data.type) {
            case 'stats_update':
                this.stats = { ...this.stats, ...data.stats };
                this.updateStatsDisplay();
                break;
            case 'new_alert':
                this.loadSystemAlerts();
                break;
            case 'user_activity':
                if (this.charts.userActivity) {
                    this.updateUserActivityChart();
                }
                break;
        }
    }

    // Cleanup
    destroy() {
        this.stopAutoRefresh();
        
        if (this.websocket) {
            this.websocket.close();
        }

        // Destroy charts
        Object.values(this.charts).forEach(chart => {
            if (chart && chart.destroy) {
                chart.destroy();
            }
        });
        this.charts = {};
    }

    // Quick actions
    async performQuickAction(action) {
        try {
            this.adminPanel.showLoading('Ejecutando acción...');
            
            const response = await this.adminPanel.apiCall(`/api/admin/dashboard/quick-action/${action}`, {
                method: 'POST'
            });
            
            this.adminPanel.hideLoading();
            this.adminPanel.showToast(response.message, 'success');
            
            // Refresh relevant data
            this.load();
        } catch (error) {
            console.error('Quick action error:', error);
            this.adminPanel.hideLoading();
            this.adminPanel.showToast('Error al ejecutar la acción', 'error');
        }
    }

    // Date range filtering
    setDateRange(startDate, endDate) {
        this.dateRange = { startDate, endDate };
        this.loadStats();
    }

    // Metric comparison
    async compareMetrics(metric, period) {
        try {
            const response = await this.adminPanel.apiCall(`/api/admin/dashboard/compare/${metric}`, {
                method: 'POST',
                body: JSON.stringify({ period })
            });

            this.renderMetricComparison(metric, response.comparison);
        } catch (error) {
            console.error('Metric comparison error:', error);
            this.adminPanel.showToast('Error al comparar métricas', 'error');
        }
    }

    renderMetricComparison(metric, comparison) {
        // Implementation for metric comparison visualization
        const container = document.getElementById(`${metric}Comparison`);
        if (!container) return;

        const changePercent = ((comparison.current - comparison.previous) / comparison.previous * 100).toFixed(1);
        const isPositive = changePercent > 0;
        const changeClass = isPositive ? 'positive' : 'negative';
        const changeIcon = isPositive ? 'arrow-up' : 'arrow-down';

        container.innerHTML = `
            <div class="metric-comparison">
                <div class="current-value">${comparison.current}</div>
                <div class="change ${changeClass}">
                    <i class="fas fa-${changeIcon}"></i>
                    ${Math.abs(changePercent)}%
                </div>
                <div class="period">vs ${comparison.period}</div>
            </div>
        `;
    }
}

export default Dashboard;