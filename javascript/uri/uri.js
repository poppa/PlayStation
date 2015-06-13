/*!
 * URI class
 * This class is for parsing, creating and manupulating a URI
 *
 * Copyright © 2009-2015 Pontus Östlund <https://profiles.google.com/poppanator>
 *
 * License GNU GPL version 3
 */
/* URI.js is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * URI.js is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with URI.js. If not, see <@url{http://www.gnu.org/licenses/@}>.
 */

(function() {
'use strict';
/* URI constructor
 *
 * @param uri
 */
window.URI = function(uri) {
  this.scheme = null;
  this.host = null;
  this.username = null;
  this.password = null;
  this.port = null;
  this.path = null;
  this.query = null;
  this.fragment = null;
  this.variables = {};

  var ports = {
    ftp:     21,
    ssh:     22,
    telnet:  23,
    smtp:    25,
    http:    80,
    https:  443,
    mysql: 3306
  };

  var enc = encodeURIComponent;
  var dec = decodeURIComponent;

  /* Turns the querystring `q` into an object
   *
   * @param q
   */
  this.queryToObject = function(q) {
    if (!q || !q.length) return null;

    var res = {}, p, i, x, k, v;

    if (q[0] === '?') q = q.substring(1);

    p = q.split('&');

    for (i = 0; i < p.length; i++) {
      x = p[i].split('=');

      if (x.length === 1) {
        res[dec(x[0])] = '';
        continue;
      }

      k = dec(x[0]);
      v = dec(x[1]);

      if (res[k]) {
        if (typeof res[k] === 'string')
          res[k] = [ res[k] ];

        res[k].push(v);
      }
      else {
        res[k] = v;
      }
    }

    return res;
  };

  /* Parse `uri`
   *
   * @param uri
   */
  this.parse = function (uri) {
    var pos = 0, u = uri, t, tt;
    // Find scheme
    if ((pos = u.indexOf('://')) > -1) {
      this.scheme = u.substring(0, pos);
      u = u.substring(pos+3);
    }

    // Find fragment
    if ((pos = u.indexOf('#')) > -1) {
      this.fragment = u.substring(pos+1);
      u = u.substring(0, pos);
    }

    // Find query string
    if ((pos = u.indexOf('?')) > -1) {
      this.query = u.substring(pos+1);
      u = u.substring(0, pos);
    }

    // Find path
    if ((pos = u.indexOf('/')) > -1) {
      this.path = u.substring(pos);
      u = u.substring(0, pos);
    }
    // if no path and no scheme we're most certainly dealing with a
    // relative URI
    else if (!this.scheme) {
      this.path = u;
      u = null;
    }

    this.variables = this.queryToObject(this.query) || {};

    if (!u || u.length === 0)
      return;

    // Find user info
    if ((pos = u.indexOf('@')) > -1) {
      t = u.substring(0, pos);

      if (t.indexOf(':') > -1) {
        tt = t.split(':');
        this.username = tt[0];
        this.password = tt[1];
      }
      else
        this.username = t;

      u = u.substring(pos+1);
    }

    // Find port
    if ((pos = u.indexOf(':')) > -1) {
      this.port = parseInt(u.substring(pos+1), 10);
      u = u.substring(0, pos);
    }

    // Set the port to default port for the current scheme if no port was
    // ser explicitly
    if (!this.port && this.scheme)
      this.port = ports[this.scheme];

    this.host = u;
  };

  /* Returns the querystring part of the object.
   * If a variable === null it will be discarted.
   */
  this.queryString = function() {
    var tmp = [], t, val, tt, v, x, i;

    for (var name in this.variables) {
      if ((val = this.variables[name]) !== null) {
        // Multiple occurences of variable
        if (typeof val !== 'string') {
          tt = [];
          for (i = 0; i < val.length; i++) {
            v = val[i];
            if (v !== null) {
              x = enc(name);
              if (v.length > 0)
                x += '=' + enc(v);

              tt.push(x);
            }
          }

          t = tt.join('&');
        }
        else {
          t = enc(name);
          if (val.length > 0)
            t += '=' + enc(val);
        }

        tmp.push(t);
      }
    }

    return tmp.length && tmp.join('&') || null;
  }

  /* Turns this object into a full URI
   */
  this.toString = function() {
    // If the scheme has been changed from the outside the orginal port
    // will not reflect the scheme. If the orginal port is a default port
    // we try to set the new port to the scheme's default port.
    if (isStandardPort(this.port)) {
      this.port = ports[this.scheme];
    }

    var s = "", q = null;
    if (this.scheme)                    s  = this.scheme + "://";
    if (this.username)                  s += this.username;
    if (this.username && this.password) s += ":";
    if (this.password)                  s += this.password;
    if (this.username)                  s += "@";
    if (this.host)                      s += this.host;
    if (!this.isDefaultPort())          s += ":" + this.port;
    if (this.path)                      s += this.path;
    if (q = this.queryString())         s += "?" + q;
    if (this.fragment)                  s += "#" + this.fragment;

    return s;
  }

  var isStandardPort = function(port) {
    for (var name in ports) {
      if (ports[name] === port)
        return true;
    }

    return false;
  };

  this.isDefaultPort = function () {
    if (!this.port) return true;
    for (var schema in ports) {
      if (schema === this.scheme && this.port !== ports[this.scheme])
        return false;
    }

    return true;
  };

  if (uri && uri.length > 0)
    this.parse(uri);
};
}());
