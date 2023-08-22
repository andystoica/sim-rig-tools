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

export function curvedHFov(length, distance, curvature) {
  return Math.atan2(chordLength(length, curvature) / 2, distance - sagitta(length, curvature)) * 2;
}

export function curvedVFov(height, distance) {
  return 2 * Math.atan(height / (2 * distance));
}