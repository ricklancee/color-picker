class ColorPicker {

  constructor() {
    this.colorPickerEl = document.querySelector('canvas');
    this.hueBarEl = document.querySelector('.hue-bar');
    this.hueHandleEl = document.querySelector('.hue-handle');
    this.colorHandleEl = document.querySelector('.color-handle');
    this.pickedColorEl = document.querySelector('.picked-color');

    this.huePickerWidth = this.hueBarEl.offsetWidth;
    this.canvasWidth = this.colorPickerEl.width;
    this.canvasHeight = this.colorPickerEl.height;

    this.canvas = this.colorPickerEl.getContext('2d');

    this.hue = 215;
    this.sat = 100;
    this.val = 100;

    this.updateColor();
    this.drawColorGradient();
    this.updateHandleColors();
    this.addEventListeners();
  }

  addEventListeners() {
    this.colorPickerEl.addEventListener('click', this.onCanvasClick.bind(this));
    this.hueBarEl.addEventListener('click', this.onHueBarClick.bind(this));
  }

  onCanvasClick(event) {
    const x = event.offsetX;
    const y = event.offsetY;

    this.sat = (x * 100) / this.canvasWidth;
    this.val = (((y - 176) * -1) * 100) / this.canvasHeight;

    this.moveColorHandle(x, y);
    this.updateColor();
  }

  onHueBarClick(event) {
    const x = event.offsetX;
    const degree = (x * 360) / this.huePickerWidth;
    this.hue = Math.round(degree);


    this.moveHueHandle(x);
    this.updateColor();
    this.drawColorGradient();
  }

  moveColorHandle(positionX, positionY) {
    this.colorHandleEl.style.transform = `translateX(${positionX}px) translateY(${positionY}px)`;
    this.updateHandleColors();
  }

  moveHueHandle(position) {
    this.hueHandleEl.style.transform = `translateX(${position}px)`;
    this.updateHandleColors();
  }

  updateHandleColors() {
    const hsl = this.convertHSVToHSL(this.hue, this.sat/100, this.val/100);
    this.colorHandleEl.style.backgroundColor = `hsl(${this.hue}, ${hsl.s}%, ${hsl.l}%)`;
    this.hueHandleEl.style.backgroundColor = `hsl(${this.hue}, 100%, 50%)`;
  }

  updateColor() {
    const hex = this.convertHSVToHEX(this.hue, this.sat, this.val);
    const hsl = this.convertHSVToHSL(this.hue, this.sat/100, this.val/100);
    const rgb = this.convertHSVToRGB(this.hue/360, this.sat/100, this.val/100);

    this.pickedColorEl.innerHTML = `${hex}<br>
      rgb(${rgb.r}, ${rgb.g}, ${rgb.b})<br>
      hsl(${hsl.h}, ${hsl.s}%, ${hsl.l}%)`;
    this.pickedColorEl.style.backgroundColor = `${hex}`;

    if (this.sat < 40) {
      if (this.val < 40) {
        this.pickedColorEl.style.color = '#fff';
      } else {
        this.pickedColorEl.style.color = '#000';
      }
    } else {
      this.pickedColorEl.style.color = '#fff';
    }
  }

  drawColorGradient() {
    for (let v = 100; v >= 0; v--) {
      const start = this.convertHSVToHSL(this.hue, 0, v/100);
      const end = this.convertHSVToHSL(this.hue, 1, v/100);

      const gradient = this.canvas.createLinearGradient(0, 0, this.canvasWidth, 0);


      gradient.addColorStop(0, `hsl(${start.h}, ${start.s}%, ${start.l}%)`);
      gradient.addColorStop(1, `hsl(${end.h}, ${end.s}%, ${end.l}%)`);

      let percentage = (v - 100) * -1;

      this.canvas.fillStyle = gradient;
      this.canvas.fillRect(0, (this.canvasHeight/100) * percentage, this.canvasWidth, this.canvasHeight/100 + 1);
    }
  }

  convertHSVToHSL(h, s, v) {
    var l = (2 - s) * v / 2;

    if (l != 0) {
        if (l == 1) {
            s = 0
        } else if (l < 0.5) {
            s = s * v / (l * 2)
        } else {
            s = s * v / (2 - l * 2)
        }
    }

    return {
      h:h,
      s:Math.round(s*100),
      l:Math.round(l*100)
    };
  }

  convertHSVToHEX(h, s, v) {
    const rgb = this.convertHSVToRGB(h/360, s/100, v/100);
    return this.convertRGBToHEX(rgb.r, rgb.g, rgb.b);
  }

  convertHSVToRGB(h, s, v) {
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

  componentToHex(c) {
    var hex = c.toString(16);
    return hex.length == 1 ? "0" + hex : hex;
  }

  convertRGBToHEX(r, g, b) {
      return "#" + this.componentToHex(r) + this.componentToHex(g) + this.componentToHex(b);
  }

}

window.addEventListener('load', () => new ColorPicker());









