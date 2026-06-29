/* Custom pure SVG and CSS Chart rendering engine for premium dashboards */

document.addEventListener('DOMContentLoaded', () => {
    renderCharts();
});

function renderCharts() {
    renderBarCharts();
    renderLineCharts();
    renderDonutCharts();
}

/* 1. Bar Chart Render */
function renderBarCharts() {
    const containers = document.querySelectorAll('.bar-chart-render');
    containers.forEach(container => {
        const rawData = container.getAttribute('data-values') || ''; // e.g. "40,65,80,35,90"
        const labels = (container.getAttribute('data-labels') || '').split(',');
        const values = rawData.split(',').map(Number);
        
        if (values.length === 0) return;
        
        container.innerHTML = '';
        container.style.display = 'flex';
        container.style.alignItems = 'flex-end';
        container.style.justifyContent = 'space-between';
        container.style.height = '200px';
        container.style.padding = '10px';
        
        const maxValue = Math.max(...values);
        
        values.forEach((val, idx) => {
            const barWrapper = document.createElement('div');
            barWrapper.style.display = 'flex';
            barWrapper.style.flexDirection = 'column';
            barWrapper.style.alignItems = 'center';
            barWrapper.style.flexGrow = '1';
            
            const bar = document.createElement('div');
            bar.style.width = '24px';
            bar.style.background = 'linear-gradient(to top, var(--primary), var(--secondary))';
            bar.style.borderRadius = '4px 4px 0 0';
            bar.style.boxShadow = '0 0 10px rgba(6, 182, 212, 0.2)';
            
            // Animate Height
            const targetHeight = (val / maxValue) * 140; // max height 140px
            bar.style.height = '0px';
            bar.style.transition = 'height 1s cubic-bezier(0.4, 0, 0.2, 1)';
            
            const tooltip = document.createElement('span');
            tooltip.style.fontSize = '0.7rem';
            tooltip.style.color = '#ffffff';
            tooltip.style.background = 'rgba(15, 23, 42, 0.8)';
            tooltip.style.padding = '2px 6px';
            tooltip.style.borderRadius = '4px';
            tooltip.style.marginBottom = '4px';
            tooltip.innerText = val;
            
            const labelEl = document.createElement('span');
            labelEl.style.fontSize = '0.7rem';
            labelEl.style.color = 'var(--text-muted)';
            labelEl.style.marginTop = '8px';
            labelEl.innerText = labels[idx] || '';
            
            barWrapper.appendChild(tooltip);
            barWrapper.appendChild(bar);
            barWrapper.appendChild(labelEl);
            container.appendChild(barWrapper);
            
            // Trigger animation
            setTimeout(() => {
                bar.style.height = `${targetHeight}px`;
            }, 100);
        });
    });
}

/* 2. Line Chart Render */
function renderLineCharts() {
    const containers = document.querySelectorAll('.line-chart-render');
    containers.forEach(container => {
        const rawData = container.getAttribute('data-values') || ''; // e.g. "20,50,40,80,60"
        const values = rawData.split(',').map(Number);
        
        if (values.length === 0) return;
        
        const width = container.clientWidth || 300;
        const height = 150;
        const maxValue = Math.max(...values);
        
        // Calculate points
        const points = values.map((val, idx) => {
            const x = (idx / (values.length - 1)) * (width - 40) + 20;
            const y = height - ((val / maxValue) * (height - 40) + 20);
            return { x, y };
        });
        
        const pathData = points.reduce((acc, p, idx) => {
            return acc + (idx === 0 ? `M ${p.x} ${p.y}` : ` L ${p.x} ${p.y}`);
        }, '');

        // Area under path
        const areaData = pathData + ` L ${points[points.length - 1].x} ${height} L ${points[0].x} ${height} Z`;
        
        container.innerHTML = `
            <svg width="100%" height="${height}" viewBox="0 0 ${width} ${height}" style="overflow: visible;">
                <defs>
                    <linearGradient id="lineGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stop-color="var(--secondary)" stop-opacity="0.2"/>
                        <stop offset="100%" stop-color="var(--primary)" stop-opacity="0.0"/>
                    </linearGradient>
                </defs>
                <!-- Area path -->
                <path d="${areaData}" fill="url(#lineGrad)" />
                <!-- Stroke Line -->
                <path d="${pathData}" fill="none" stroke="var(--secondary)" stroke-width="3" 
                      stroke-dasharray="800" stroke-dashoffset="800" style="transition: stroke-dashoffset 1.5s ease-in-out;">
                </path>
                <!-- Dots -->
                ${points.map((p, idx) => `
                    <circle cx="${p.x}" cy="${p.y}" r="4" fill="#ffffff" stroke="var(--primary)" stroke-width="2"></circle>
                `).join('')}
            </svg>
        `;
        
        // Trigger draw animation
        const strokePath = container.querySelector('path[fill="none"]');
        setTimeout(() => {
            if (strokePath) strokePath.style.strokeDashoffset = '0';
        }, 100);
    });
}

/* 3. Donut Pie Chart Render */
function renderDonutCharts() {
    const containers = document.querySelectorAll('.donut-chart-render');
    containers.forEach(container => {
        const percent = Number(container.getAttribute('data-percent')) || 75;
        const color = container.getAttribute('data-color') || 'var(--secondary)';
        
        const size = 120;
        const strokeWidth = 10;
        const radius = (size - strokeWidth) / 2;
        const circumference = 2 * Math.PI * radius;
        const offset = circumference - (percent / 100) * circumference;

        container.style.position = 'relative';
        container.style.width = `${size}px`;
        container.style.height = `${size}px`;
        container.style.display = 'flex';
        container.style.alignItems = 'center';
        container.style.justifyContent = 'center';

        container.innerHTML = `
            <svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" style="transform: rotate(-90deg);">
                <circle cx="${size/2}" cy="${size/2}" r="${radius}" fill="none" stroke="rgba(15,23,42,0.06)" stroke-width="${strokeWidth}"></circle>
                <circle cx="${size/2}" cy="${size/2}" r="${radius}" fill="none" stroke="${color}" stroke-width="${strokeWidth}"
                        stroke-dasharray="${circumference}" stroke-dashoffset="${circumference}"
                        style="transition: stroke-dashoffset 1s ease-in-out;" stroke-linecap="round"></circle>
            </svg>
            <div style="position: absolute; font-family: var(--font-heading); font-size: 1.25rem; font-weight: 700; color: var(--text-main);">
                ${percent}%
            </div>
        `;

        const progressCircle = container.querySelectorAll('circle')[1];
        setTimeout(() => {
            if (progressCircle) progressCircle.style.strokeDashoffset = offset;
        }, 100);
    });
}

