function HSVtoRGB(h, s, v) {
  var r, g, b, i, f, p, q, t;
  if (arguments.length === 1) {
      s = h.s, v = h.v, h = h.h;
  }
  i = Math.floor(h * 6);
  f = h * 6 - i;
  p = v * (1 - s);
  q = v * (1 - f * s);
  t = v * (1 - (1 - f) * s);
  switch (i % 6) {
      case 0: r = v, g = t, b = p; break;
      case 1: r = q, g = v, b = p; break;
      case 2: r = p, g = v, b = t; break;
      case 3: r = p, g = q, b = v; break;
      case 4: r = t, g = p, b = v; break;
      case 5: r = v, g = p, b = q; break;
  }
  return {
      r: Math.round(r * 255),
      g: Math.round(g * 255),
      b: Math.round(b * 255)
  };
}

const canvas = document.querySelector('canvas');
const canvasWidth = canvas.width;
const canvasHeight = canvas.height;
const context = canvas.getContext('2d');

function drawColorGradient(hue) {
  let percentage = 0;
  for (let v = 100; v >= 0; v--) {
    const start = HSVtoRGB(hue/360, 0, v/100);
    const end = HSVtoRGB(hue/360, 1, v/100);

    const gradient = context.createLinearGradient(0, 0, canvasWidth, 0);
    gradient.addColorStop(0, `rgb(${start.r}, ${start.g}, ${start.b})`);
    gradient.addColorStop(1, `rgb(${end.r}, ${end.g}, ${end.b})`);

    context.fillStyle = gradient;
    context.fillRect(0, (canvasHeight/100) * percentage, canvasWidth, canvasHeight/100 + 1);
    percentage++;
  }
}

drawColorGradient(215);

const huePicker = document.querySelector('.hue-picker');


huePicker.addEventListener('click', e => {
  console.log(e);
});

