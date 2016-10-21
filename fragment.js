class Fragment {
  constructor() {

  }

  _getColorsFromFragment() {
    let colorHash = window.location.hash.replace('#', '');

    if (colorHash.length === 6 || colorHash.length === 3) {
      colorHash = '#' + colorHash;
    }

    // If it's hex
    if (colorHash.indexOf('#') === 0) {
      return colorHash;
    }

    // If it's rgb
    if (colorHash.indexOf('rgb') === 0) {
      const rgb = colorHash.match(/rgb\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*\)/i);
      return rgb;
    }

    // If its hsl
    if (colorHash.indexOf('hsl') === 0) {
      const hsl = colorHash.match(/hsl\(\s*(\d+)º?\s*,\s*(\d+)%?\s*,\s*(\d+)%?\s*\)/i);
      return hsl;
    }
  }
}
