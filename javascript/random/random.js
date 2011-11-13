var Random =
{
  ALPHA:     1,
  NUMBER:    2,
  SPECIAL:   4,
  ALNUM:   1|2,
  ALL:   1|2|4,
  LOWERCASE: 1,
  UPPERCASE: 2,

  _a_z: 'abcdefghijklmnopqrstuvxyz',
  _A_Z: 'ABCDEFGHIJKLMNOPQRSTUVXYZ',
  _pct: '!@£$%&/()=?+-\\}][{¤#*^:;<>|-_§½~',
  _0_9: '0123456789',

  /**
   * Generates a random string of length len
   *
   * @param int len
   */
  string: function(len, type, _case, exclude)
  {
    len       = len     || 8;
    type      = type    || (Random.ALPHA|Random.NUMBER);
    _case     = _case   || (Random.LOWERCASE|Random.UPPERCASE);
    exclude   = exclude || '';

    var chars = '';

    if ((type & Random.ALPHA) == Random.ALPHA) {
      if ((_case & Random.LOWERCASE) == Random.LOWERCASE)
         chars += Random._a_z;
      if ((_case & Random.UPPERCASE) == Random.UPPERCASE)
         chars += Random._A_Z;
    }

    if ((type & Random.NUMBER) == Random.NUMBER)
      chars += Random._0_9;

    if ((type & Random.SPECIAL) == Random.SPECIAL)
      chars += Random._pct;

    chars = chars.split('');
    var l = chars.length;
    var out = '';

    while (1) {
      if (out.length >= len)
         break;

      var c = chars[Math.floor(Math.random() * l)];

      if (exclude.indexOf(c) > -1)
         continue;

      out += c;
    }

    return out;
  }
};