// draw.js
import * as geometry from './geometry.js';


export function clear(canvas) {
  canvas.ctx.clearRect(0, 0, canvas.width, canvas.height);
}


export function idealCurvature(canvas, monitor, viewer) {
  const curvature = monitor.type === 0 ? geometry.hexagoInradius(monitor.width) : monitor.curvature;  
  const viewerOffset = (curvature - viewer.distance) / canvas.scale;
  
  const ctx = canvas.ctx;
  ctx.strokeStyle = canvas.theme.color.grid;
  ctx.lineWidth = canvas.theme.line.dotted.width;
  ctx.lineCap = canvas.theme.line.dotted.cap;
  ctx.setLineDash(canvas.theme.line.dotted.pattern);

  // Curvature path
  ctx.beginPath();
  ctx.arc(canvas.cx, canvas.cy + viewerOffset, curvature / canvas.scale, 0, 2 * Math.PI);
  ctx.stroke();

  // Centre position (circle)
  ctx.beginPath();
  ctx.arc(canvas.cx, canvas.cy + viewerOffset, viewer.size / canvas.scale , 0, 2 * Math.PI);
  ctx.stroke();

  // Centre position (cross)
  const lineLength = 50 / canvas.scale;
  ctx.beginPath();
  ctx.moveTo(canvas.cx - lineLength / 2, canvas.cy + viewerOffset);
  ctx.lineTo(canvas.cx + lineLength / 2, canvas.cy + viewerOffset);
  ctx.moveTo(canvas.cx, canvas.cy - lineLength / 2 + viewerOffset);
  ctx.lineTo(canvas.cx, canvas.cy + lineLength / 2 + viewerOffset);
  ctx.stroke();
}


// Flat Monitors
export function flatViewer(canvas, monitor, viewer) {
  const offsetX = monitor.setupWidth / 2 / canvas.scale;
  const offsetY = (viewer.distance - monitor.setupDepth) / canvas.scale;
  
  const ctx = canvas.ctx;
  ctx.strokeStyle = canvas.theme.color.viewer;
  ctx.lineWidth = canvas.theme.line.dotted.width;
  ctx.lineCap = canvas.theme.line.dotted.cap;
  ctx.setLineDash(canvas.theme.line.dashed.pattern);
  ctx.fillStyle = canvas.theme.color.viewer;

  // FOV guides
  ctx.beginPath();
  ctx.moveTo(canvas.cx - offsetX, canvas.cy - offsetY);
  ctx.lineTo(canvas.cx, canvas.cy);
  ctx.lineTo(canvas.cx + offsetX, canvas.cy - offsetY);
  ctx.stroke();
  ctx.closePath();
  
  // Centre position
  ctx.setLineDash([]);
  ctx.beginPath();
  ctx.arc(canvas.cx, canvas.cy, viewer.size / canvas.scale , 0, 2 * Math.PI);
  ctx.fill();
  ctx.stroke();
}

export function flatMonitor(canvas, monitor, viewer, offset, side) {
  const offsetX = monitor.width * offset / canvas.scale;

  const angleOffsetX = geometry.angledMonitorWidth(monitor) / canvas.scale * side;
  const angleOffsetY = geometry.angledMonitorHeight(monitor) / canvas.scale;

  const leftEdgeX = canvas.cx - monitor.width / 2 / canvas.scale + offsetX;
  const leftEdgeY = canvas.cy - viewer.distance / canvas.scale;
  let rightEdgeX = leftEdgeX + angleOffsetX;
  let rightEdgeY = leftEdgeY + angleOffsetY;
  
  if (side === 0) {
    rightEdgeX = canvas.cx + monitor.width / 2 / canvas.scale + offsetX;
    rightEdgeY = canvas.cy - viewer.distance / canvas.scale;
  }

  const ctx = canvas.ctx;
  ctx.strokeStyle = canvas.theme.color.monitor;
  ctx.fillStyle = canvas.theme.color.highlight;
  ctx.lineWidth = canvas.theme.line.thick.width;
  ctx.lineCap = canvas.theme.line.thick.cap;
  ctx.setLineDash(canvas.theme.line.thick.pattern);

  // Screen
  ctx.beginPath();
  ctx.moveTo(leftEdgeX, leftEdgeY);
  ctx.lineTo(rightEdgeX, rightEdgeY);
  ctx.stroke();
  
  // Edges
  ctx.beginPath();
  ctx.arc(leftEdgeX, leftEdgeY, canvas.theme.line.thick.width / 2, 0, 2 * Math.PI);
  ctx.fill();
  ctx.arc(rightEdgeX, rightEdgeY, canvas.theme.line.thick.width / 2, 0, 2 * Math.PI);
  ctx.fill();
}


// Curved Monitors
export function curvedViewer(canvas, monitor, viewer) {
  const yOffset = (viewer.distance - geometry.sagitta(monitor.width * monitor.count, monitor.curvature)) / canvas.scale;
  const xOffset = geometry.chordLength(monitor.width * monitor.count, monitor.curvature) / 2 / canvas.scale;
  
  const ctx = canvas.ctx;
  ctx.strokeStyle = canvas.theme.color.viewer;
  ctx.lineWidth = canvas.theme.line.dotted.width;
  ctx.lineCap = canvas.theme.line.dotted.cap;
  ctx.setLineDash(canvas.theme.line.dashed.pattern);
  ctx.fillStyle = canvas.theme.color.viewer;

  // FOV guides
  ctx.beginPath();
  ctx.moveTo(canvas.cx - xOffset, canvas.cy - yOffset);
  ctx.lineTo(canvas.cx, canvas.cy);
  ctx.lineTo(canvas.cx + xOffset, canvas.cy - yOffset);
  ctx.stroke();
  ctx.closePath();
  
  // Centre position
  ctx.setLineDash([]);
  ctx.beginPath();
  ctx.arc(canvas.cx, canvas.cy, viewer.size / canvas.scale , 0, 2 * Math.PI);
  ctx.fill();
  ctx.stroke();
}


export function curvedMonitor(canvas, monitor, viewer, offset) {  
  const viewerOffset = (monitor.curvature - viewer.distance) / canvas.scale;
  const screenAngle = geometry.arcAngle(monitor.width, monitor.curvature);
  const offsetAngle = Math.PI / 2 - screenAngle * offset;
  const startAngle = 0 - screenAngle / 2 - offsetAngle;
  const endAngle = 0 + screenAngle / 2 - offsetAngle;
  const radius = monitor.curvature / canvas.scale;
  const centerX = canvas.cx;
  const centerY = canvas.cy + viewerOffset;
  
  const ctx = canvas.ctx;
  
  // Screen
  ctx.strokeStyle = canvas.theme.color.monitor;
  ctx.fillStyle = canvas.theme.color.highlight;
  ctx.lineWidth = canvas.theme.line.thick.width;
  ctx.lineCap = canvas.theme.line.thick.cap;
  ctx.setLineDash(canvas.theme.line.thick.pattern);

  ctx.beginPath();
  ctx.arc(centerX, centerY, radius, startAngle, endAngle);
  ctx.stroke();
  
  // Side edges  
  const leftEdgeX = centerX + radius * Math.cos(startAngle);
  const leftEdgeY = centerY + radius * Math.sin(startAngle);
  const rightEdgeX = centerX + radius * Math.cos(endAngle);
  const rightEdgeY = centerY + radius * Math.sin(endAngle);
  
  ctx.beginPath();
  ctx.arc(leftEdgeX, leftEdgeY, canvas.theme.line.thick.width / 2, 0, 2 * Math.PI);
  ctx.fill();
  ctx.arc(rightEdgeX, rightEdgeY, canvas.theme.line.thick.width / 2, 0, 2 * Math.PI);
  ctx.fill();
}
