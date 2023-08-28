// geometryModule.js

export function radians(angleDegrees) {
  return angleDegrees * (Math.PI / 180);
}


export function degrees(angleRadians) {
  return angleRadians * (180 / Math.PI);
}


export function screenHeight(diagonal, aspectRatio) {
  return Math.sqrt(Math.pow(diagonal * 25.4, 2) / (1 + Math.pow(aspectRatio, 2)));
}


export function screenWidth(diagonal, aspectRatio) {
  return screenHeight(diagonal, aspectRatio) * aspectRatio;
}


export function arcAngle(length, curvature) {
  return length / curvature;
}


export function chordLength(length, curvature) {
  return 2 * curvature * Math.sin(length / (2 * curvature));
}


export function sagitta(length, curvature) {
  return curvature - curvature * Math.cos(length / (2 * curvature));
}


export function arcWidth(length, curvature) {
  return length < curvature * Math.PI ? Math.round(chordLength(length, curvature)) : curvature * 2;
}


export function arcDepth(length, curvature) {
  let actualLength = length;
  let sagitta = 0;
  
  if (length > Math.PI * curvature) {
    actualLength = 2 * Math.PI * curvature - length;
  }
  
  if (length > 2 * Math.PI * curvature) {
    actualLength = 2 * Math.PI * curvature;
  }
  
  sagitta = Math.round(curvature - Math.sqrt(curvature ** 2 - (chordLength(actualLength, curvature) / 2) ** 2));
  
  return (length > Math.PI * curvature) ? 2 * curvature - sagitta : sagitta;
}


export function hexagoInradius(sideLength) {
  return Math.sqrt(3) / 2 * sideLength;
}


export function angledMonitorWidth(monitor) {
  const angleRadians = radians(90 - monitor.angle);
  return monitor.width * Math.sin(angleRadians);
}


export function angledMonitorHeight(monitor) {
  const angleRadians = radians(90 - monitor.angle);
  return monitor.width * Math.cos(angleRadians);
}


export function curvedHFov(length, distance, curvature) {
  return Math.atan2(chordLength(length, curvature) / 2, distance - sagitta(length, curvature)) * 2;
}


export function curvedVFov(height, distance) {
  return 2 * Math.atan(height / (2 * distance));
}


export function flatHFov(monitor, viewer) {
  const offsetX = monitor.setupWidth / 2;
  const offsetY = (viewer.distance - monitor.setupDepth);
  const angle = Math.atan(offsetX / offsetY) * 2;
  return angle < 0 ? angle + Math.PI * 2 : angle;
}