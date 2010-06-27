/* URI class
 * This class is for parsing, creating and manupulating a URI
 *
 * Copyright © 2009, Pontus Östlund <spam@poppa.se>
 *
 * License GNU GPL version 3
 *
 * URI.js is free software: you can redistribute it and/or modify
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
 *
 * ----------------------------------------------------------------------------
 *
 * Example of usage
 *
 * var uri = new URI("http://mydomain.com/some/path/");
 *
 * console.log(uri.scheme);     //> http
 * console.log(uri.port);       //> 80
 * console.log(uri.host);       //> mydomain.com
 * console.log(uri.path);       //> /some/path/
 * console.log(uri.toString()); //> http://mydomain.com/some/path/
 *
 * // Alter the domain
 * uri.domain = "my.otherdomain.com";
 * console.log(uri.toString()); //> http://my.otherdomain.com/some/path/
 *
 * uri.variables.articleID = 135;
 * uri.variables.action = 'read';
 * console.log(uri.toString());
 * //> http://my.otherdomain.com/some/path/?articleID=135&action=read
 */

/* URI constructor
 *
 * @param uri
 */
var URI = function(uri)
{
  var scheme = null;
  var host = null;
  var username = null;
  var password = null;
  var port = null;
  var path = null;
  var query = null;
  var fragment = null;
  var variables = {};
  var ports = {
    ftp: 21,
    ssh: 22,
    telnet: 23,
    smtp: 25,
    http: 80,
    https: 443
  };

  var enc = encodeURIComponent;
  var dec = decodeURIComponent;

  var re = new RegExp("(?:([-+a-z0-9]+)://" + // Scheme
		      "((.[^:]*):?(.*)?@)?" + // Userinfo
		      "(.[^:/]*)"           + // Host
		      ":?([0-9]{1,6})?)?"   + // Port
		      "([/.].[^?#]*)?"      + // Path
		      "([?](.[^#]*))?"      + // Query
		      "#?(.*)?", "i");        // Fragment

  var parse = function(theUri)
  {
    uri = theUri;
    var m;
    if (uri && (m = re.exec(uri))) {
      scheme   = m[1] && m[1].toLowerCase();
      username = m[3];
      password = m[4];
      host     = m[5] && m[5].toLowerCase();
      port     = m[6] && parseInt(m[6],10);
      path     = m[7];
      query    = m[9];
      fragment = m[10];
  
      if (!port && scheme)
	port = ports[scheme];
  
      if (query && query.length) {
	var q = query.split('&');
	for (var i = 0; i < q.length; i++) {
	  var p = q[i].split('=');
	  variables[dec(p[0])] = p.length > 1 ? dec(p[1]) : null;
	}
      }
    }
  };

  var isDefaultPort = function()
  {
    if (!pub.port) return true;
    for (var schema in ports) {
      if (schema == pub.scheme && pub.port != ports[pub.scheme])
	return false;
    }

    return true;
  };

  parse(uri);

  var pub;

  /*****************************************************************************
   * Return public members and methods */ return pub = {
  /****************************************************************************/

  /* The uri scheme
   * @var string
   */
  scheme: scheme,

  /* The host
   * @var string
   */
  host: host,

  /* The username
   * @var string
   */
  username: username,

  /* The password
   * @var string
   */
  password: password,

  /* The port
   * @var int
   */
  port: port,

  /* The local path
   * @var path
   */
  path: path,

  /* The fragment
   * @var string
   */
  fragment: fragment,

  /* The query string variables
   * @var object
   */
  variables: variables,

  /* Reparse with uri
   *
   * @param uri
   */
  parse: function(uri)
  {
    parse(uri);
    this.scheme = scheme;
    this.host = host;
    this.username = username;
    this.password = password;
    this.port = port;
    this.path = path;
    this.fragment = fragment;
    this.variables = variables;
  },

  /* Returns the variables as a query string
   */
  queryString: function()
  {
    //trace(this.variables);
    var tmp = [];
    for (var name in this.variables) {
      var t;
      if (this.variables[name] != null)
	t = enc(name) + '=' + enc(this.variables[name]);
      else
      	t = enc(name);

      tmp.push(t);
    }

    return tmp.length && tmp.join('&') || null;
  },

  /* Turns this object into a full URI
   */
  toString: function()
  {
    var s = "", q = null;
    if (this.scheme)                    s  = this.scheme + "://";
    if (this.username)                  s += this.username;
    if (this.username && this.password) s += ":";
    if (this.password)                  s += this.password;
    if (this.username)                  s += "@";
    if (this.host)                      s += this.host;
    if (!isDefaultPort())               s += ":" + this.port;
    if (this.path)                      s += this.path;
    if (q = this.queryString())         s += "?" + q;
    if (this.fragment)                  s += "#" + this.fragment;

    return s;
  }
  /***/}/***/
};
