class ColorPicker {

  constructor() {
    this.colorPickerEl = document.querySelector('canvas');
    this.hueBarEl = document.querySelector('.hue');
    this.hueHandleEl = document.querySelector('.hue-handle');
    this.colorHandleEl = document.querySelector('.color-handle');
    this.pickedColorEl = document.querySelector('.picked-color');

    const colorPickerBCR = this.colorPickerEl.getBoundingClientRect();
    const huePickerBCR = this.hueBarEl.getBoundingClientRect();

    this.hueHandleHeight = this.hueHandleEl.offsetHeight;
    this.huePickerWidth = huePickerBCR.width;
    this.huePickerX = huePickerBCR.left;

    this.canvasX = colorPickerBCR.left;
    this.canvasY = colorPickerBCR.top;
    this.canvasWidth = colorPickerBCR.width;
    this.canvasHeight = colorPickerBCR.height;

    this.canvas = this.colorPickerEl.getContext('2d');

    if(this._colorInFragmentId()) {
      const colors = this._getColorsFromFragment();

      this.hue = colors.h;
      this.sat = colors.s;
      this.val = colors.v;
    } else {
      this.hue = 215;
      this.sat = 100;
      this.val = 100;
    }

    this._updateColor();
    this._drawColorGradient();
    this._moveColorHandle();
    this._moveHueHandle();
    this._updateHandleColors();
    this._addEventListeners();

    // Wait a frame and add the animatable class
    // to the hue handle to avoid an animation on page load.
    requestAnimationFrame(_ => this.hueHandleEl.classList.add('hue-handle--animatable'));
  }

  _colorInFragmentId() {
    if (!window.location.hash)
      return false;

    let hash = window.location.hash.replace('#', '');

    if (hash.length === 6 || hash.length === 3) {
      hash = '#' + hash;
    }

    try {
      const gradient = this.canvas.createLinearGradient(0, 0, 0, 0);
      gradient.addColorStop(0, hash);
    } catch(err) {
      return false;
    }

    return true;
  }

  _getColorsFromFragment() {
    let colorHash = window.location.hash.replace('#', '');

    if (colorHash.length === 6 || colorHash.length === 3) {
      colorHash = '#' + colorHash;
    }

    // If it's hex
    if (colorHash.indexOf('#') === 0) {
      const rgb = this.convertHEXToRGB(colorHash);
      const hsv = this.convertRGBToHSV(rgb.r, rgb.g, rgb.b);
      return hsv;
    }

    // If it's rgb
    if (colorHash.indexOf('rgb') === 0) {
      const rgb = colorHash.match(/rgb\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*\)/i);
      const hsv = this.convertRGBToHSV(parseInt(rgb[1]), parseInt(rgb[2]), parseInt(rgb[3]));
      return hsv;
    }

    // If its hsl
    if (colorHash.indexOf('hsl') === 0) {
      const hsl = colorHash.match(/hsl\(\s*(\d+)º?\s*,\s*(\d+)%?\s*,\s*(\d+)%?\s*\)/i);
      const hsv = this.convertHSLToHSV(parseInt(hsl[1]), parseInt(hsl[2]), parseInt(hsl[3]));
      return hsv;
    }
  }

  _updateCanvasByFragment() {
    const colors = this._getColorsFromFragment();
    this.hue = colors.h;
    this.sat = colors.s;
    this.val = colors.v;

    this._updateColor();
    this._drawColorGradient();
    this._moveColorHandle();
    this._moveHueHandle();
    this._updateHandleColors();
  }

  _addEventListeners() {
    window.addEventListener('hashchange', () => {
      if (this._colorInFragmentId()) {
        this._updateCanvasByFragment();
      }
    });

    this.colorPickerEl.addEventListener('click', this._onCanvasClick.bind(this));
    this.hueBarEl.addEventListener('click', this._onHueBarClick.bind(this));

    const onHuebarMove = this._onHueBarMouseMove.bind(this);
    const onColorPickerMove = this._onColorPickerMouseMove.bind(this);
    const body = document.body;

    this.colorHandleEl.addEventListener('mousedown', () => {
      body.addEventListener('mousemove', onColorPickerMove);
    });

    this.hueHandleEl.addEventListener('mousedown', () => {
      this.hueHandleEl.classList.remove('hue-handle--animatable');
      body.addEventListener('mousemove', onHuebarMove);
    });

    body.addEventListener('mouseup', () => {
      this.hueHandleEl.classList.add('hue-handle--animatable');
      body.removeEventListener('mousemove', onHuebarMove);
      body.removeEventListener('mousemove', onColorPickerMove);
    });

    document.addEventListener('mouseout', event => {
      var from = event.relatedTarget || event.toElement;
      if (!from || from.nodeName == "HTML") {
        this.hueHandleEl.classList.add('hue-handle--animatable');
        body.removeEventListener('mousemove', onHuebarMove);
        body.removeEventListener('mousemove', onColorPickerMove);
      }
    });
  }


  _onCanvasClick(event) {
    const x = event.offsetX;
    const y = event.offsetY;

    this.sat = (x * 100) / this.canvasWidth;
    this.val = (((y - this.canvasHeight) * -1) * 100) / this.canvasHeight;

    this._moveColorHandle();
    this._updateHandleColors();
    this._updateColor();
  }

  _onHueBarClick(event) {
    let x = event.pageX - this.huePickerX;

    if (x < 0 || x > this.huePickerWidth) {
      return;
    }

    const degree = (x * 360) / this.huePickerWidth;
    this.hue = Math.round(degree);

    this._moveHueHandle();
    this._updateHandleColors();
    this._updateColor();
    this._drawColorGradient();
  }

  _onHueBarMouseMove(event) {
    let x = event.pageX - this.huePickerX;
    if (x < 0) x = 0;
    if (x > this.huePickerWidth) x = this.huePickerWidth;

    const degree = (x * 360) / this.huePickerWidth;
    this.hue = Math.round(degree);

    this._moveHueHandle();
    this._updateHandleColors();
    this._updateColor();
    this._drawColorGradient();
  }

  _onColorPickerMouseMove(event) {
    let x = event.pageX - this.canvasX;
    let y = event.pageY - this.canvasY - (this.hueHandleHeight / 2);
    if (x < 0) x = 0;
    if (x > this.canvasWidth) x = this.canvasWidth;
    if (y < 0) y = 0;
    if (y > this.canvasHeight) y = this.canvasHeight;

    this.sat = (x * 100) / this.canvasWidth;
    this.val = (((y - this.canvasHeight) * -1) * 100) / this.canvasHeight;

    this._moveColorHandle();
    this._updateHandleColors();
    this._updateColor();
  }

  _moveColorHandle() {
    const x = (this.sat * this.canvasWidth) / 100;
    const y = ((this.val * this.canvasHeight) / 100 - this.canvasHeight) * -1;

    this.colorHandleEl.style.transform = `translateX(${x}px) translateY(${y}px)`;
  }

  _moveHueHandle() {
    const x = (this.hue * this.huePickerWidth) / 360;
    this.hueHandleEl.style.transform = `translateX(${x}px)`;
  }

  _updateHandleColors() {
    const hsl = this.convertHSVToHSL(this.hue, this.sat, this.val);
    this.colorHandleEl.style.backgroundColor = `hsl(${this.hue}, ${hsl.s}%, ${hsl.l}%)`;
    this.hueHandleEl.style.backgroundColor = `hsl(${this.hue}, 100%, 50%)`;
  }

  _updateColor() {
    const hex = this.convertHSVToHEX(this.hue, this.sat, this.val);
    const hsl = this.convertHSVToHSL(this.hue, this.sat, this.val);
    const rgb = this.convertHSVToRGB(this.hue, this.sat, this.val);

    this.pickedColorEl.innerHTML = `${hex}<br>
      rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`;
    this.pickedColorEl.style.backgroundColor = `${hex}`;

    if (this.sat < 40) {
      if (this.val < 40) {
        this.pickedColorEl.style.color = '#fff';
      } else {
        this.pickedColorEl.style.color = '#000';
      }
    } else {
      if (this.hue > 51 && this.hue <= 98) {
        this.pickedColorEl.style.color = '#000';
      } else {
        this.pickedColorEl.style.color = '#fff';
      }
    }
  }

  _drawColorGradient() {
    for (let value = 100; value >= 0; value--) {
      const start = this.convertHSVToHSL(this.hue, 0, value);
      const end = this.convertHSVToHSL(this.hue, 100, value);

      const gradient = this.canvas.createLinearGradient(0, 0, this.canvasWidth, 0);

      gradient.addColorStop(0, `hsl(${start.h}, ${start.s}%, ${start.l}%)`);
      gradient.addColorStop(1, `hsl(${end.h}, ${end.s}%, ${end.l}%)`);

      let percentage = (value - 100) * -1;

      this.canvas.fillStyle = gradient;
      this.canvas.fillRect(0, (this.canvasHeight/100) * percentage, this.canvasWidth, this.canvasHeight/100 + 1);
    }
  }

  // Color conversions
  //
  convertHSVToHSL(h, s, v) {
    s = s/100;
    v = v/100;

    let l = (2 - s) * v / 2;

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
    const rgb = this.convertHSVToRGB(h, s, v);
    return this.convertRGBToHEX(rgb.r, rgb.g, rgb.b);
  }

  convertHSVToRGB(h, s, v) {
    h = h/360;
    s = s/100;
    v = v/100;

    let r, g, b, i, f, p, q, t;
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

  _componentToHex(c) {
    var hex = c.toString(16);
    return hex.length == 1 ? "0" + hex : hex;
  }

  convertRGBToHEX(r, g, b) {
      return "#" + this._componentToHex(r) + this._componentToHex(g) + this._componentToHex(b);
  }

  convertHEXToRGB(hex) {
    var shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
    hex = hex.replace(shorthandRegex, function(m, r, g, b) {
        return r + r + g + g + b + b;
    });

    var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
    } : null;
  }

  convertRGBToHSV(r, g, b) {
    var max = Math.max(r, g, b), min = Math.min(r, g, b),
        d = max - min,
        h,
        s = (max === 0 ? 0 : d / max),
        v = max / 255;

    switch (max) {
        case min: h = 0; break;
        case r: h = (g - b) + d * (g < b ? 6: 0); h /= 6 * d; break;
        case g: h = (b - r) + d * 2; h /= 6 * d; break;
        case b: h = (r - g) + d * 4; h /= 6 * d; break;
    }

    return {
        h: Math.round(h * 360),
        s: Math.round(s * 100),
        v: Math.round(v * 100)
    };
  }

  convertHSLToHSV(h, s, l) {
    h = h / 360;
    s = s / 100;
    l = l / 100;

    var _h = h,
        _s,
        _v;

    l *= 2;
    s *= (l <= 1) ? l : 2 - l;
    _v = (l + s) / 2;
    _s = (2 * s) / (l + s);

    return {
        h: Math.round(_h * 360),
        s: Math.round(_s * 100),
        v: Math.round(_v * 100)
    };
  }
}

window.addEventListener('load', () => new ColorPicker());
