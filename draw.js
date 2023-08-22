// draw.js
import * as geometry from './geometry.js';


export function clear(viewport) {
  viewport.ctx.clearRect(0, 0, viewport.width, viewport.height);
}


export function viewer(viewport, monitors, viewer) {
  const yOffset = (viewer.distance - geometry.sagitta(monitors.combinedWidth, monitors.curvature)) / viewport.scale;
  const xOffset = geometry.chordLength(monitors.combinedWidth, monitors.curvature) / 2 / viewport.scale;
  
  const ctx = viewport.ctx;
  ctx.strokeStyle = viewport.theme.color.viewer;
  ctx.lineWidth = viewport.theme.line.dotted.width;
  ctx.lineCap = viewport.theme.line.dotted.cap;
  ctx.setLineDash(viewport.theme.line.dashed.pattern);
  ctx.fillStyle = viewport.theme.color.viewer;

  // FOV guides
  ctx.beginPath();
  ctx.moveTo(viewport.cx - xOffset, viewport.cy - yOffset);
  ctx.lineTo(viewport.cx, viewport.cy);
  ctx.lineTo(viewport.cx + xOffset, viewport.cy - yOffset);
  ctx.stroke();
  ctx.closePath();
  
  // Centre position
  ctx.setLineDash([]);
  ctx.beginPath();
  ctx.arc(viewport.cx, viewport.cy, viewer.size / viewport.scale , 0, 2 * Math.PI);
  ctx.fill();
  ctx.stroke();
}


export function curvature(viewport, monitors, viewer) {
  const viewerOffset = (monitors.curvature - viewer.distance) / viewport.scale;
  
  const ctx = viewport.ctx;
  ctx.strokeStyle = viewport.theme.color.grid;
  ctx.lineWidth = viewport.theme.line.dotted.width;
  ctx.lineCap = viewport.theme.line.dotted.cap;
  ctx.setLineDash(viewport.theme.line.dotted.pattern);
  
  // Curvature path
  ctx.beginPath();
  ctx.arc(viewport.cx, viewport.cy + viewerOffset, monitors.curvature / viewport.scale, 0, 2 * Math.PI);
  ctx.stroke();
  
  // Centre position (circle)
  ctx.beginPath();
  ctx.arc(viewport.cx, viewport.cy + viewerOffset, viewer.size / viewport.scale , 0, 2 * Math.PI);
  ctx.stroke();

  // Centre position (cross)
  const lineLength = 50 / viewport.scale;
  ctx.beginPath();
  ctx.moveTo(viewport.cx - lineLength / 2, viewport.cy + viewerOffset);
  ctx.lineTo(viewport.cx + lineLength / 2, viewport.cy + viewerOffset);
  ctx.moveTo(viewport.cx, viewport.cy - lineLength / 2 + viewerOffset);
  ctx.lineTo(viewport.cx, viewport.cy + lineLength / 2 + viewerOffset);
  ctx.stroke();
}


export function curvedMonitors(viewport, monitors, viewer) {
  switch (monitors.count) {
    case 1:
      _curvedMonitor(viewport, monitors, viewer, 0);
      break;
    case 2:
      _curvedMonitor(viewport, monitors, viewer, -0.5);
      _curvedMonitor(viewport, monitors, viewer, 0.5);
      break;
    case 3:
      _curvedMonitor(viewport, monitors, viewer, -1);
      _curvedMonitor(viewport, monitors, viewer, 0);
      _curvedMonitor(viewport, monitors, viewer, 1);
      break;
  }
}


function _curvedMonitor(viewport, monitors, viewer, offset) {  
  const viewerOffset = (monitors.curvature - viewer.distance) / viewport.scale;
  const screenAngle = geometry.arcAngle(monitors.width + monitors.bezel * 2, monitors.curvature);
  const offsetAngle = Math.PI / 2 - screenAngle * offset;
  const startAngle = 0 - screenAngle / 2 - offsetAngle;
  const endAngle = 0 + screenAngle / 2 - offsetAngle;
  const radius = monitors.curvature / viewport.scale;
  const centerX = viewport.cx;
  const centerY = viewport.cy + viewerOffset;
  
  const ctx = viewport.ctx;
  
  // Screen
  ctx.strokeStyle = viewport.theme.color.monitor;
  ctx.fillStyle = viewport.theme.color.highlight;
  ctx.lineWidth = viewport.theme.line.thick.width;
  ctx.lineCap = viewport.theme.line.thick.cap;
  ctx.setLineDash(viewport.theme.line.thick.pattern);

  ctx.beginPath();
  ctx.arc(centerX, centerY, radius, startAngle, endAngle);
  ctx.stroke();
  
  // Side edges  
  const leftEdgeX = centerX + radius * Math.cos(startAngle);
  const leftEdgeY = centerY + radius * Math.sin(startAngle);
  const rightEdgeX = centerX + radius * Math.cos(endAngle);
  const rightEdgeY = centerY + radius * Math.sin(endAngle);
  
  ctx.beginPath();
  ctx.arc(leftEdgeX, leftEdgeY, viewport.theme.line.thick.width / 2, 0, 2 * Math.PI);
  ctx.fill();
  ctx.arc(rightEdgeX, rightEdgeY, viewport.theme.line.thick.width / 2, 0, 2 * Math.PI);
  ctx.fill();
}
