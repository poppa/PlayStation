/* Class for creating and manipulating SVG objects
 *
 * Copyright (C) 2010 Pontus Östlund (http://www.poppa.se)
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to
 * deal in the Software without restriction, including without limitation the
 * rights to use, copy, modify, merge, publish, distribute, sublicense, and/or
 * sell copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * The Software shall be used for Good, not Evil.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 *
 * Author:
 *  Pontus Östlund
 */

/* Creates a new SVG object
 *
 * @param DOMNode svgNode
 *  DOM element node
 */
var SVG = function(svgNode, parent)
{
  var svg = svgNode;
  var workingNode = svg;

  /* Creates a DOM element node
   *
   * @param string n
   *  Node name
   * @param object attr
   */
  function ce(n, attr) // {{{
  {
    var n = svg.ownerDocument.createElementNS(SVG.NS, n);
    if (attr) {
      attr = unCamelCase(attr);
      for (var name in attr)
	addAttribute(n, name, attr[name]);
    }
    return n;
  } // }}}

  /* Add attribute to node
   *
   * @param DOMNode node
   * @param string name
   * @param string value
   */
  function addAttribute(node, name, value) // {{{
  {
    if (name.indexOf(':') > -1) {
      var localname = name.substring(0, name.indexOf(':'));
      var nsuri = SVG.namespaces[localname];
      if (!nsuri) throw "No namespace exists for " + name;
      var a = svg.ownerDocument.createAttributeNS(nsuri, name);
      a.nodeValue = value;
      node.setAttributeNodeNS(a);
    }
    else node.setAttribute(name, value);
  } // }}}

  /* Turns a node into a string representation
   *
   * @param DOMNode node
   */
  function serialize(node) // {{{
  {
    if (XMLSerializer != 'undefined')
      return new XMLSerializer().serializeToString(node);
    else if (node.xml)
      return node.xml;

    throw "XML serialization not supported by browser!";
  } // }}}

  /* Turns camelCased keys in an object into dash separated word
   *
   * <code>
   * var obj = { zIndex: 12, bottomMargin: 10 };
   * obj = SVG.utils.unCamelCase(obj);
   * // { 'z-index': 12, 'bottom-margin': 10 }
   * </code>
   *
   * @param Object obj
   */
  function unCamelCase(obj) // {{{
  {
    var o = {};
    for (var name in obj) {
      var n = '';
      if (name[0] == '#') {
      	var val = obj[name];
      	name = name.substring(1);
      	o[name] = val;
      	continue;
      }

      for (var i = 0; i < name.length; i++) {
	var c = name.charCodeAt(i);
	if (c > 96 || c < 58)
	  n += name[i];
	else if (c > 57 && c < 97) {
	  // 58 is a colon (:)
	  if (i > 0 && c != 58) n += '-';
	  n += name[i].toLowerCase();
	}
	else throw ('Unhandled char: ' + n[i]);
      }

      o[n] = obj[name];
    }

    return o;
  } // }}}

  /* Appends node to the working node
   *
   * @param DOMNode|SVG node
   */
  function add(node) // {{{
  {
    if (node.type && node.type == 'SVG')
      node = node.getDocument();

    return workingNode.appendChild(node);
  } // }}}

  /* Checks if val is an integer
   *
   * @param string val
   */
  function isInt(val) // {{{
  {
    return val.match(/^-?[0-9]+$/) && true || false;
  } // }}}

  /* Checks if val is a float
   *
   * @param string val
   */
  function isFloat(val) // {{{
  {
    return val.match(/^-?[0-9]+(\.[0-9]+)?$/) && true || false;
  } // }}}

  /* Converts val to int or float if it is an integer or float value
   *
   * @param string val
   */
  function autoCast(val) // {{{
  {
    if (isInt(val))
      return parseInt(val, 10);
    else if (isFloat(val))
      return parseFloat(val, 10);

    return val;
  } // }}}

  /* **********************************************
   * Return public methods and members */ return {
  /* *********************************************/

  /* Object flag
   */
  type: 'SVG',

  /* Returns the parent object
   */
  parent: function() // {{{
  {
    return parent;
  }, // }}}
  
  /* Add a namespace to the root node
   *
   * @param string nsURI
   * @param string name
   */
  addNamespace: function(nsURI, name) // {{{
  {
    var n = svg.ownerDocument.createAttribute(name);
    n.nodeValue = nsURI;
    svg.setAttributeNodeNS(n);
    var localname = name.substring(name.indexOf(':')+1);
    SVG.namespaces[localname] = nsURI;
  }, // }}}

  /* Convinience method for adding the XLink namespace
   */
  useXLink: function() // {{{
  {
    this.addNamespace(SVG.XLINK_NS, 'xmlns:xlink');
  }, // }}}
  
  /* Turns the SVG element into an XML tree
   */
  toString: function() // {{{
  {
    return serialize(svg);
  }, // }}}

  /* Turns the SVG element into an indented and formatted XML tree
   *
   * @param int tabsize
   */
  toPrettyString: function(tabsize) // {{{
  {
    if (!document.createTreeWalker)
      return this.toString();

    return new XMLIndenter(svg).indent(tabsize);
  }, // }}}

  /* Turns the SVG element into a highlighthed and formatted XML tree.
   * Three CSS classes is used for the highlighting:
   * 
   * - node: For the XML nodes
   * - attr: For the node attribute names
   * - literal: For the node attribute values
   *
   * @param int tabsize
   */
  toHighlightedString: function(tabsize) // {{{
  {
    if (!document.createTreeWalker)
      return this.toString();

    return new XMLIndenter(svg).highlight(tabsize);
  }, // }}}

  /* Getter for the SVG element node
   */
  getDocument: function() // {{{
  {
    return svg;
  }, // }}}

  /* Appends n to the working node
   *
   * @param DOMNode n
   */
  appendChild: function(n) // {{{
  {
    return new SVG(add(n), this);
  }, // }}}

  /* Set working node, which is the node newly created nodes will be appended
   * to. If node is null the root node will be set as working node.
   *
   * @param DOMNode node
   */
  setWorkingNode: function(node) // {{{
  {
    if (!node)
      workingNode = svg;
    else
      workingNode = node;
  }, // }}}

  /* Makes a copy of the current object
   */
  clone: function() // {{{
  {
    var n = svg.cloneNode(true);
    n = svg.parentNode.appendChild(n);
    return new SVG(n, parent);
  }, // }}}

  /* Set attributes on the working node
   *
   * @param string|object name
   *  If an object it will be treated as an associative array and all
   *  key/value pairs will be set as attributes
   * @param string value
   */
  setAttribute: function(name, value) // {{{
  {
    if (typeof name == 'object') {
      var attr = unCamelCase(name);
      for (var key in attr)
	addAttribute(workingNode, key, attr[key]);
    }
    else
      addAttribute(workingNode, name, value);
    
    return this;
  }, // }}}

  /* Returns the attribute name or all attributes if name is omitted
   *
   * @param string name
   */
  getAttribute: function(name) // {{{
  {
    if (!name) {
      var o = {};
      for (var i = 0; i < svg.attributes.length; i++) {
      	var a = svg.attributes.item(i);
      	o[a.name] = autoCast(a.value);
      }

      return o;
    }

    return autoCast(svg.getAttribute(name));
  }, // }}}

  /* Creates and appends a text node
   *
   * @param string text
   * @param float x
   *  x position of the text
   * @param float y
   *  y position of the text
   * @param object attr
   *
   * @return
   *  The text node as an SVG object
   */
  text: function(text, x, y, attr) // {{{
  {
    if (!attr) attr = {};
    if (x != null) attr.x = x;
    if (y != null) attr.y = y;
    var n = ce('text', attr);
    if (text) {
      var t = svg.ownerDocument.createTextNode(text);
      n.appendChild(t);
    }
    add(n);
    return new SVG(n, this);
  }, // }}}

  /* Creates a tspan node
   *
   * @param string text
   * @param object attr
   */
  tspan: function(text, attr) // {{{
  {
    var n = ce('tspan', attr);
    var t = svg.ownerDocument.createTextNode(text);
    n.appendChild(t);
    return new SVG(add(n), this);
  }, // }}}

  /* Creates a tref node
   *
   * @param object attr
   */
  tref: function(attr) // {{{
  {
    return new SVG(add(ce('tref', attr)));
  }, // }}}

  /* Creates a text path
   *
   * @param string text
   * @param string path
   * @param object attr
   */
  textpath: function(text, path, attr) // {{{
  {
    if (!attr) attr = {};
    attr['xlink:href'] = path;
    var n = ce('textpath', attr);
    var t = svg.ownerDocument.createTextNode(text);
    n.appendChild(t);
    return new SVG(add(n), this);
  }, // }}}

  /* Creates an image
   *
   * @param string src
   * @param object attr
   */
  image: function(src, attr) // {{{
  {
    if (!attr) attr = {};
    attr['xlink:href'] = src;
    return new SVG(add(ce('image', attr)), this);
  }, // }}}

  /* Creates an arbitrary node
   *
   * @param string name
   * @param object attr
   */
  node: function(name, attr) // {{{
  {
    return new SVG(add(ce(name, attr)), this);
  }, // }}}

  /* Creates a defs node
   *
   * @param object attr
   */
  defs: function(attr) // {{{
  {
    return new SVG(add(ce('defs', attr)), this);
  }, // }}}

  /* Creates a new SVG node
   *
   * @param object attr
   */
  svg: function(attr) // {{{
  {
    return new SVG(add(ce('svg', attr)), this);
  }, // }}}

  /* Creates a g node
   *
   * @param object attr
   */
  g: function(attr) // {{{
  {
    return new SVG(add(ce('g', attr)), this);
  }, // }}}

  /* Creates a rectangle
   *
   * @param float x
   * @param float y
   * @param int with
   * @param int height
   * @param object attr
   */
  rect: function(x, y, width, height, attr) // {{{
  {
    if (!attr) attr = {};
    attr.x = x;
    attr.y = y;
    attr.width = width;
    attr.height = height;
    return new SVG(add(ce('rect', attr)), this);
  }, // }}}

  /* Creates an A node
   *
   * @param string href
   * @param SVG contents
   * @param object attr
   */
  a: function(href, contents, attr) // {{{
  {
    if (!attr) attr = {};
    attr['xlink:href'] = href;
    var n = ce('a', attr);
    n.appendChild(contents.getDocument());
    add(n);
    return new SVG(n, this);
  }, // }}}

  /* Draws a circle
   *
   * @param float x
   *  x position
   * @param float y
   *  y position
   * @param float r
   *  Radius
   * @param object attr
   */
  circle: function(x, y, r, attr) // {{{
  {
    if (!attr) attr = {};
    attr.cx = x;
    attr.cy = y;
    attr.r  = r;
    return new SVG(add(ce('circle', attr)), this);
  }, // }}}

  /* Draws an ellipse
   *
   * @param float x
   * @param float y
   * @param float rx
   *  x radius
   * @param float ry
   *  y radius
   * @param object attr
   */
  ellipse: function(x, y, rx, ry, attr) // {{{
  {
    if (!attr) attr = {};
    attr.cx = x;
    attr.cy = y;
    attr.rx = rx;
    attr.ry = ry;
    return new SVG(add(ce('ellipse', attr)), this);
  }, // }}}

  /* Draws a polyline
   *
   * @param string points
   * @param object attr
   */
  polyline: function(points, attr) // {{{
  {
    if (!attr) attr = {};
    attr.points = points;
    return new SVG(add(ce('polyline', attr)), this);
  }, // }}}

  /* Draws a polygon
   *
   * @param string points
   * @param object attr
   */
  polygon: function(points, attr) // {{{
  {
    if (!attr) attr = {};
    attr.points = points;
    return new SVG(add(ce('polygon', attr)), this);
  }, // }}}

  /* Draws a line
   *
   * @param float x1
   *  x starting position
   * @param float y1
   *  y starting position
   * @param float x2
   *  x ending position
   * @param float y2
   *  y ending position
   * @param float width
   *  Line width
   * @param attr
   */
  line: function(x1, y1, x2, y2, width, attr) // {{{
  {
    if (!attr) attr = {};
    attr.x1 = x1;
    attr.y1 = y1;
    attr.x2 = x2;
    attr.y2 = y2;
    attr.strokeWidth = width;

    if (!attr.stroke) attr.stroke = '#000';

    return new SVG(add(ce('line', attr)), this);
  }, // }}}

  /* Draws a path
   *
   * @param string lines
   *  Path definitions
   * @param attr
   */
  path: function(lines, attr) // {{{
  {
    if (!attr) attr = {};
    attr.d = lines;
    if (!attr.fill) attr.fill = 'none';
    return new SVG(add(ce('path', attr)), this);
  } // }}}

  /***/};/***/
};

/* SVG namespace URI
 */
SVG.NS = 'http://www.w3.org/2000/svg';

/* XHTML namspace URI
 */
SVG.XHTML_NS = 'http://www.w3.org/1999/xhtml';

/* XLINK namespace URI
 */
SVG.XLINK_NS = 'http://www.w3.org/1999/xlink';

// Namespace cache
SVG.namespaces = {};

/* Factory method for creating a new SVG document
 *
 * @param int width
 * @param int height
 * @param string id
 *
 * @return
 *  Returns a new @{link SVG} object
 */
SVG.createDocument = function(width, height, id)
{
  var e = document.createElementNS(SVG.NS, 'svg');
  e.setAttribute('width', width);
  e.setAttribute('height', height);
  if (id) e.setAttribute('id', id);
  return new SVG(e);
};

/* Class for rendering a DOMNode to a (indented) string representation.
 */
var XMLIndenter = function(node)
{
  var walker = document.createTreeWalker(
    node,
    NodeFilter.SHOW_ALL,
    null,
    false
  );
  var buf = '';
  var level = 0;
  var tabwidth = 2;

  /* Creates the indentation
   */
  var pad = function()
  {
    return new Array((level*tabwidth) + 1).join(' ');
  };

  /* Turns an AttrNodeList into a string
   *
   * @param AttrNodeList attr
   */
  var attrToString = function(attr)
  {
    if (!attr) return null;

    var a = [];
    for (var i = 0; i < attr.length; i++) {
      var item = attr.item(i);
      a.push(item.name + '="' + item.value + '"');
    }

    if (!a.length) return null;
    return ' '  + a.join(' ');
  };

  /* Turns an AttributeNodeList into a highlighted string
   *
   * @param AttrNodeList attr
   */
  var attrToClrString = function(attr)
  {
    if (!attr) return null;

    var a = [];
    for (var i = 0; i < attr.length; i++) {
      var item = attr.item(i);
      a.push(
	span('attr') + item.name + span() + '=' +
	span('literal') + '"' + item.value + '"' + span()
      );
    }

    if (!a.length) return null;
    return ' '  + a.join(' ');
  };

  /* Creates an opening span tag with class cls. If no cls is given
   * creates a closing span tag
   *
   * @param string cls
   */
  var span = function(cls)
  {
    if (!cls) return '</span>';
    return '<span class="' + cls + '">';
  };

  /* Recurses through node and creates the string representation
   *
   * @param Node node
   */
  var walk = function(node)
  {
    if (node.nodeType == 1) {
      buf += (pad() + '<' + node.tagName);
      var attr = attrToString(node.attributes);
      if (attr) buf += attr;

      if (node.childNodes.length > 0) {
      	buf += ">\n";
	level++;
	for (var i = 0; i < node.childNodes.length; i++)
	  walk(node.childNodes[i]);

	level--;
	buf += (pad() + '</' + node.tagName + ">\n");
      }
      else buf += "/>\n";
    }
    else
      buf += pad() + node.nodeValue + "\n";
  };

  /* Recurses through node and creates a highlighted string representation
   *
   * @param Node node
   */
  var highlight = function(node)
  {
    if (node.nodeType == 1) {
      buf += (pad() + span('node') + '&lt;' + node.tagName + span());
      var attr = attrToClrString(node.attributes);
      if (attr) buf += attr;
      if (node.childNodes.length > 0) {
      	buf += span('node') + "&gt;" + span() + "\n";
	level++;
	for (var i = 0; i < node.childNodes.length; i++)
	  highlight(node.childNodes[i]);

	level--;
	buf += (pad() + span('node') + '&lt;/' + node.tagName + "&gt;" +
	        span() + "\n");
      }
      else buf += (span('node') + "/&gt;" + span() + "\n");
    }
    else
      buf += pad() + node.nodeValue + "\n";
  }

  /* **********************************************
   * Return public methods and members */ return {
  /* *********************************************/

  /* Creates an indented string representation
   *
   * @param int tabsize
   */
  indent: function(tabsize)
  {
    tabwidth = tabsize || tabwidth;
    walk(walker.currentNode);
    return buf;
  },

  /* Creates an indented and highlighted string representation
   *
   * @param int tabsize
   */
  highlight: function(tabsize)
  {
    tabwidth = tabsize || tabwidth;
    highlight(walker.currentNode);
    return buf;
  }
  /***/};/***/
};
