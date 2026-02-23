import Highcharts from 'highcharts'
import 'highcharts/modules/exporting'
import 'highcharts/modules/export-data'

// Modern theme: softer gridlines, cleaner colors
Highcharts.setOptions({
  chart: {
    backgroundColor: 'transparent',
    borderWidth: 0,
    style: {
      fontFamily: 'Inter, system-ui, sans-serif',
    },
  },
  xAxis: {
    lineColor: 'rgba(0,0,0,0.06)',
    tickColor: 'rgba(0,0,0,0.06)',
    gridLineColor: 'rgba(0,0,0,0.06)',
  },
  yAxis: {
    lineColor: 'rgba(0,0,0,0.06)',
    tickColor: 'rgba(0,0,0,0.06)',
    gridLineColor: 'rgba(0,0,0,0.06)',
    gridLineWidth: 1,
    gridLineDashStyle: 'Dot',
  },
  legend: {
    itemStyle: { fontWeight: '500' },
    itemHoverStyle: { color: '#6366f1' },
    symbolRadius: 4,
  },
  tooltip: {
    backgroundColor: 'rgba(255,255,255,0.92)',
    borderColor: 'rgba(0,0,0,0.08)',
    borderRadius: 8,
    shadow: true,
    style: { fontSize: '12px' },
  },
  colors: [
    '#4a5568',
    '#3182ce',
    '#2d6a4f',
    '#d4a853',
    '#52b788',
    '#a7c957',
    '#2ec4b6',
    '#6b7280',
  ],
})

// Disable accessibility module warning in development
Highcharts.setOptions({
  accessibility: { enabled: false },
  title: { text: null },
  exporting: {
    enabled: true,
    buttons: {
      contextButton: {
        menuItems: [
          'viewFullscreen',
          'printChart',
          'separator',
          'downloadPNG',
          'downloadJPEG',
          'downloadSVG',
          'separator',
          'downloadCSV',
          'downloadXLS',
        ],
      },
    },
  },
})
