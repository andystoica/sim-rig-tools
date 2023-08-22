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
    index: 1
  },
  numberMonitors: {
    min: 1,
    max: 3,
    value: 3
  },
  sideMonitorAngle: {
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
      { label: "21:9", value: 21 / 9 },
      { label: "21:10", value: 21 / 10 },
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
const monitors = {
  count: 0,
  diagonal: 0,
  width: 0,
  height: 0,
  aspectRatio: 0,
  curvature: 0,
  bezel: 10
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
  computeModel();
  updateUI();

  draw.clear(viewport);
  draw.viewer(viewport, monitors, viewer);
  draw.curvature(viewport, monitors, viewer);
  draw.curvedMonitors(viewport, monitors, viewer);
}


function computeModel() {
  monitors.count = input.numberMonitors.value;
  monitors.diagonal = input.monitorDiagonal.value;
  monitors.aspectRatio = eval(input.monitorAspectRatio.presets[input.monitorAspectRatio.index].value)
  monitors.width = geometry.screenWidth(monitors.diagonal, monitors.aspectRatio);
  monitors.height = geometry.screenHeight(monitors.diagonal, monitors.aspectRatio);
  monitors.combinedWidth = (monitors.width + monitors.bezel * 2) * monitors.count;
  monitors.curvature = input.monitorCurvature.value;
  monitors.bezel = input.monitorBezel.value;
  
  viewer.distance = input.viewerDistance.value;
  viewer.hFov = geometry.curvedHFov(monitors.combinedWidth, viewer.distance, monitors.curvature);  
  viewer.vFov = geometry.curvedVFov(monitors.height, viewer.distance);
}


function updateUI() {
  $(".controls .label.monitorType").html(`Type: <strong>${input.monitorType.presets[input.monitorType.index].label}</strong>`);
  $(".controls .label.diagonal").html(`Diagonal (in): <strong>${input.monitorDiagonal.value}</strong>`);
  $(".controls .label.aspectRatio").html(`Aspect (ratio): <strong>${input.monitorAspectRatio.presets[input.monitorAspectRatio.index].label}</strong>`);
  
  $(".controls .label.numberMonitors").html(`Count: <strong>${input.numberMonitors.value}</strong>`);

  if (input.monitorType.index == 0) { // Flat monitors
    $(".controls .label.curvature").html(`Curvature (mm): <strong>n/a</strong>`);
    $(".controls .label.sideMonitorAngle").html(`Angle (degrees): <strong>${input.sideMonitorAngle.value}</strong>`);
    $("#sliderSideMonitorAngle").show();
    $("#sliderCurvature").hide();
  }

  if (input.monitorType.index == 1) { // Curved monitors
    $(".controls .label.curvature").html(`Curvature (mm): <strong>${input.monitorCurvature.value}</strong>`);
    $(".controls .label.sideMonitorAngle").html(`Angle (degrees): <strong>n/a</strong>`);
    $("#sliderSideMonitorAngle").hide();
    $("#sliderCurvature").show();
  }
  
  $(".controls .label.width").html(`Width: (mm): <strong>${Math.round(monitors.width + monitors.bezel * 2)}</strong>`);
  $(".controls .label.bezel").html(`Bezel (mm): <strong>${input.monitorBezel.value}</strong>`);
  $(".controls .label.height").html(`Height (mm): <strong>${Math.round(monitors.height + monitors.bezel * 2)}</strong>`);
  
  $(".controls .label.hFOV").html(`hFOV (degrees): <strong>${Math.round(geometry.degrees(viewer.hFov))}\u00B0</strong>`);
  $(".controls .label.distance").html(`Distance (mm): <strong>${input.viewerDistance.value}</strong>`);
  $(".controls .label.vFOV").html(`vFOV (degrees): <strong>${Math.round(geometry.degrees(viewer.vFov))}\u00B0</strong>`);
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
  $("#sliderNumberMonitors").slider({
    min: input.numberMonitors.min,
    max: input.numberMonitors.max,
    value: input.numberMonitors.value,
    slide: (event, ui) => {
      input.numberMonitors.value = ui.value;
      updateState();
    }
  });
});

$(document).ready(function() {
  $("#sliderSideMonitorAngle").slider({
    min: input.sideMonitorAngle.min,
    max: input.sideMonitorAngle.max,
    value: input.sideMonitorAngle.value,
    slide: (event, ui) => {
      input.sideMonitorAngle.value = ui.value;
      updateState();
    }
  });
});

$(document).ready(function() {
  $("#sliderDiagonal").slider({
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
  $("#sliderAspectRatio").slider({
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
  $("#sliderCurvature").slider({
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
  $("#sliderBezel").slider({
    min: input.monitorBezel.min,
    max: input.monitorBezel.max,
    value: input.monitorBezel.value,
    slide: (event, ui) => {
      input.monitorBezel.value = ui.value;
      updateState();
    }
  });
});

$(document).ready(function () {
  $("#sliderDistance").slider({
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
