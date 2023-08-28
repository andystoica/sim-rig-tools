import * as geometry from './geometry.js';
import * as draw from './draw.js';

// Canvas initialization
const canvas = document.getElementById('diagram');


// Viewport state
const viewport = {
  ctx: canvas.getContext('2d'),
  scale: 4,
  theme: {
    color: {
      highlight: "#E11",
      monitor: "#DDD",
      viewer: "#E11",
      grid: "#555",
    },
    line: {
      thin: {
        width: 1,
        pattern: [],
        cap: "butt"
      },
      thick: {
        width: 10,
        pattern: [],
        cap: "round"
      },
      dashed: {
        width: 1,
        pattern: [5, 3],
        cap: "butt"
      },
      dotted: {
        width: 1,
        pattern: [2, 3],
        cap: "butt"
      }
    }
  } 
}


// Input state
const input = {
  monitorType: {
    presets: [
      { label: "Flat", value: 0 },
      { label: "Curved", value: 1}
    ],
    index: 0
  },
  monitorCount: {
    presets: [
      { label: "Single", value: 1 },
      { label: "Triple", value: 3 }
    ],
    index: 1
  },
  monitorAngle: {
    min: 0,
    max: 90,
    value: 60
  },
  monitorDiagonal: {
    min: 24,
    max: 85,
    value: 32
  },
  monitorAspectRatio: {
    presets: [
      { label: "5:4", value: 5 / 4 },
      { label: "4:3", value: 4 / 3 },
      { label: "16:10", value: 16 / 10 },
      { label: "16:9", value: 16 / 9 },
      { label: "21:10", value: 21 / 10 },
      { label: "21:9", value: 21 / 9 },
      { label: "32:10", value: 32 / 10 },
      { label: "32:9", value: 32 / 9 }
    ],
    index: 3
  },
  monitorCurvature: {
    min: 800,
    max: 1800,
    step: 100,
    value: 1500
  },
  monitorBezel: {
    min: 0,
    max: 20,
    value: 5
  },
  viewerDistance: {
    min: 150,
    max: 1800,
    step: 10,
    value: 750
  }
}


// Monitors state
const monitor = {
  type: 0,
  count: 0,
  diagonal: 0,
  width: 0,
  height: 0,
  aspectRatio: 0,
  curvature: 0,
  bezel: 0,
  setupWidth: 0,
  setupDepth: 0
}


// Viewer state
const viewer = {
  size: 90,
  distance: 0,
  hfov: 0,
  vfov: 0
}




// Update state
function updateState() {

  // Both monitor types
  computeModel();
  updateUI();
  draw.clear(viewport);
  
  
  // Flat monitors
  if (monitor.type === 0) {
    draw.flatViewer(viewport, monitor, viewer);
    draw.idealCurvature(viewport, monitor, viewer);    
    if (monitor.count === 1) {
      draw.flatMonitor(viewport, monitor, viewer, 0, 0);
    } else {
      draw.flatMonitor(viewport, monitor, viewer, 0, -1);
      draw.flatMonitor(viewport, monitor, viewer, 0, 0);
      draw.flatMonitor(viewport, monitor, viewer, 1, 1);
    }
  }

  // Curved monitors
  if (monitor.type === 1) {
    draw.curvedViewer(viewport, monitor, viewer);
    draw.idealCurvature(viewport, monitor, viewer);
    if (monitor.count === 1) {
      draw.curvedMonitor(viewport, monitor, viewer, 0);
    } else {
      draw.curvedMonitor(viewport, monitor, viewer, -1);
      draw.curvedMonitor(viewport, monitor, viewer, 0);
      draw.curvedMonitor(viewport, monitor, viewer, 1);   
    }
  }
}


function computeModel() {
  // Both monitor types
  monitor.type = input.monitorType.index;
  monitor.count = input.monitorCount.presets[input.monitorCount.index].value;
  monitor.diagonal = input.monitorDiagonal.value;
  monitor.aspectRatio = eval(input.monitorAspectRatio.presets[input.monitorAspectRatio.index].value)
  monitor.bezel = input.monitorBezel.value;
  monitor.angle = input.monitorAngle.value;
  monitor.curvature = input.monitorCurvature.value;
  monitor.screenWidth = geometry.screenWidth(monitor.diagonal, monitor.aspectRatio);
  monitor.screenHeight = geometry.screenHeight(monitor.diagonal, monitor.aspectRatio);
  monitor.width = monitor.screenWidth + monitor.bezel * 2;
  monitor.height = monitor.screenHeight + monitor.bezel * 2;
  viewer.distance = input.viewerDistance.value;
  
  // Flat monitors
  if (monitor.type == 0) {
    if (monitor.count === 1) {
      monitor.setupWidth = monitor.width;
      monitor.setupDepth = 0;        
    } else {
      monitor.setupWidth = monitor.width + geometry.angledMonitorWidth(monitor) * 2;
      monitor.setupDepth = geometry.angledMonitorHeight(monitor);  
    }
    viewer.hFov = geometry.flatHFov(monitor, viewer);
    viewer.vFov = geometry.curvedVFov(monitor.height, viewer.distance);
  }
  
  // Curved monitors
  if (monitor.type == 1) {
    monitor.setupWidth = geometry.arcWidth(monitor.width * monitor.count, monitor.curvature);
    monitor.setupDepth = geometry.arcDepth(monitor.width * monitor.count, monitor.curvature);
    viewer.hFov = geometry.curvedHFov(monitor.width * monitor.count, viewer.distance, monitor.curvature);    
    viewer.vFov = geometry.curvedVFov(monitor.height, viewer.distance);
  }
}


function updateUI() {
  // Monitor controls
  $(".controls .label.monitorCount").html(`Setup: <strong>${input.monitorCount.presets[input.monitorCount.index].label}</strong>`);
  $(".controls .label.monitorType").html(`Type: <strong>${input.monitorType.presets[input.monitorType.index].label}</strong>`);
  $(".controls .label.monitorDiagonal").html(`Diagonal (in): <strong>${input.monitorDiagonal.value}</strong>`);
  
  $(".controls .label.monitorAspectRatio").html(`Aspect (ratio): <strong>${input.monitorAspectRatio.presets[input.monitorAspectRatio.index].label}</strong>`);
  $(".controls .label.monitorBezel").html(`Bezel (mm): <strong>${input.monitorBezel.value}</strong>`);
  $(".controls .label.monitorAngle").html(`Angle (degrees): <strong>${input.monitorAngle.value}</strong>`);
  $(".controls .label.monitorCurvature").html(`Curvature (mm): <strong>${input.monitorCurvature.value}</strong>`);

  $(".controls .label.monitorSetupWidth").html(`Setup width: (mm): <strong>${Math.round(monitor.setupWidth)}</strong>`);
  $(".controls .label.monitorSetupDepth").html(`Setup depth: (mm): <strong>${Math.round(monitor.setupDepth)}</strong>`);
  $(".controls .label.monitorWidth").html(`Monitor width (mm): <strong>${Math.round(monitor.width)}</strong>`);
  $(".controls .label.monitorHeight").html(`Monitor height (mm): <strong>${Math.round(monitor.height)}</strong>`);
  
    // Flat monitors
    if (input.monitorType.index == 0) { 
      $("#controlMonitorAngle").show();
      $("#controlMonitorCurvature").hide();
    }
    
    // Curved monitors
    if (input.monitorType.index == 1) { 
      $("#controlMonitorAngle").hide();
      $("#controlMonitorCurvature").show();
    }
  
  // Viewer controls
  $(".controls .label.viewerHFov").html(`hFOV (degrees): <strong>${Math.round(geometry.degrees(viewer.hFov))}\u00B0</strong>`);
  $(".controls .label.viewerDistance").html(`Distance (mm): <strong>${input.viewerDistance.value}</strong>`);
  $(".controls .label.viewerVFov").html(`vFOV (degrees): <strong>${Math.round(geometry.degrees(viewer.vFov))}\u00B0</strong>`);
}


function resizeCanvas(canvas) {
  let canvasStyle = window.getComputedStyle(canvas);
  canvas.width = parseInt(canvasStyle.width);
  canvas.height = parseInt(canvasStyle.height);

  viewport.width = canvas.width;
  viewport.height = canvas.height;
  viewport.cx = canvas.width / 2;
  viewport.cy = canvas.height / 2;
} 



// UI Controls
$(document).ready(function() {
  $("#sliderMonitorCount").slider({
    min: 0,
    max: input.monitorCount.presets.length -1 ,
    value: input.monitorCount.index,
    slide: (event, ui) => {
      input.monitorCount.index = ui.value;
      updateState();
    }
  });
});

$(document).ready(function () {
  $("#sliderMonitorType").slider({
    min: 0,
    max: input.monitorType.presets.length - 1,
    value: input.monitorType.index,
    slide: (event, ui) => {
      input.monitorType.index = ui.value;
      updateState();
    }
  });
});

$(document).ready(function() {
  $("#sliderMonitorDiagonal").slider({
    min: input.monitorDiagonal.min,
    max: input.monitorDiagonal.max,
    value: input.monitorDiagonal.value,
    slide: (event, ui) => {
      input.monitorDiagonal.value = ui.value;
      updateState();
    }
  });
});

$(document).ready(function() {
  $("#sliderMonitorAspectRatio").slider({
    min: 0,
    max: input.monitorAspectRatio.presets.length - 1,
    value: input.monitorAspectRatio.index,
    slide: (event, ui) => {
      input.monitorAspectRatio.index = ui.value;
      updateState();
    }
  });
});

$(document).ready(function () {
  $("#sliderMonitorBezel").slider({
    min: input.monitorBezel.min,
    max: input.monitorBezel.max,
    value: input.monitorBezel.value,
    slide: (event, ui) => {
      input.monitorBezel.value = ui.value;
      updateState();
    }
  });
});

$(document).ready(function() {
  $("#sliderMonitorAngle").slider({
    min: input.monitorAngle.min,
    max: input.monitorAngle.max,
    value: input.monitorAngle.value,
    slide: (event, ui) => {
      input.monitorAngle.value = ui.value;
      updateState();
    }  
  });  
});  

$(document).ready(function () {
  $("#sliderMonitorCurvature").slider({
    min: input.monitorCurvature.min,
    max: input.monitorCurvature.max,
    step: input.monitorCurvature.step,
    value: input.monitorCurvature.value,
    slide: (event, ui) => {
      input.monitorCurvature.value = ui.value;
      updateState();
    }
  });
});

$(document).ready(function () {
  $("#sliderViewerDistance").slider({
    min: input.viewerDistance.min,
    max: input.viewerDistance.max,
    step: input.viewerDistance.step,
    value: input.viewerDistance.value,
    slide: (event, ui) => {
      input.viewerDistance.value = ui.value;
      updateState();
    }
  });
});



// Main program
$(document).ready(function() {
  resizeCanvas(canvas);
  updateState();

  // Attach the event listener for window resize
  $(window).on('resize', function() {
      resizeCanvas(canvas);
      updateState();
  });
});
