$(document).ready(function()
{
  // <capture>

  //! Creates a new SVG element of width 600 and height 300 with id "test1"
  var d = SVG.createDocument(600, 300, 'test1');

  //! The XLink namespace can also be added by calling:
  //! d.useXLink();
  //! This is just for the purpose of showing how to add an arbitrary
  //! namespace.
  d.addNamespace('http://www.w3.org/1999/xlink', 'xmlns:xlink');

  //! Create a defs node
  var defs = d.defs();
  
  //! Lets create a linear gradient fill.
  //! Note the hash in the "spreadMethod" attribute. The hash prevents the
  //! attribute from being "unCamelCased". By default all camelCased attributes
  //! is converted to "camel-case". Sometimes the camleCase is neccessary 
  //! though!
  //!
  //! Note the node() method which is used to add an arbitrary node.
  var gradient = defs.node('linearGradient', {
    id: 'gradient1',
    x1: '0%',
    y1: '0%',
    x2: '80%',
    y2: '50%',
    '#spreadMethod': 'pad'
  });
  gradient.node('stop', { offset: '0%', stopColor: '#4A678A', stopOpacity: 1 });
  gradient.node('stop', { offset: '100%', stopColor: '#193353', stopOpacity: 1 });

  //! Create a rectangle that fills the entire document. Serves a background
  d.rect(0, 0, 600, 300, {
    stroke: '#000',
    strokeWidth: 4,
    fill: 'url(#gradient1)',
    shapeRendering: 'crispEdges'
  });

  //! Let's create a text group.
  //! The first argument is the actual text but in this case the text node
  //! will be appended with "tspan" nodes which will contain the actual text.
  var tgroup = d.text(null, 160, 150);

  //! Append the first text to the text group
  var text = tgroup.tspan('This is an SVG test!', {
    fontFamily: 'arial,sans-serif',
    fontSize: 28,
    fontWeight: 'bold',
    fill: '#fff'
  });

  //! Make the text clickable
  tgroup.a('http://poppa.se', text);

  //! Append a second text to the text group
  tgroup.tspan('You can click above', {
    dx: -99,
    dy: 15,
    fontFamily: 'arial,sans-serif',
    fontSize: 11,
    fill: '#fff'
  });
  
  trace(d);

  // </capture>

  $('#svg1').append($(d.getDocument()));
  $('#result-1 pre').append(d.toHighlightedString());

  // <capture>

  var d = SVG.createDocument(600, 300, 'test2');
  d.useXLink();

  var defs = d.defs();
  var gradient = defs.node('linearGradient', {
    id: 'gradient2',
    x1: '0%',
    y1: '20%',
    x2: '50%',
    y2: '80%',
    '#spreadMethod' : 'pad'
  });

  gradient.node('stop', { offset: '0%', stopColor: '#ccc', stopOpacity: 1 });
  gradient.node('stop', { offset: '100%', stopColor: '#f9f9f9', stopOpacity: 1 });

  d.rect(0, 0, 600, 300, {
    stroke: '#000',
    strokeWidth: 4,
    fill: 'url(#gradient2)',
    shapeRendering: 'crispEdges'
  });

  var img = d.image('http://www.poppa.se/blog/wp-content/themes/poppa/img/logo.png', {
    x: 300,
    y: 120,
    width: 229,
    height: 52
  });

  var re1 = d.rect(300-20, 120-20, 229+40, 52+40, {
    stroke: '#000',
    strokeWidth: 1,
    fill: 'none',
    shapeRendering: 'crispEdges'
  });

  var re2 = re1.clone();
  re2.setAttribute({
    x: re2.getAttribute('x')+5,
    y: re2.getAttribute('y')+5
  });

  // </capture>

  $('#svg2').append($(d.getDocument()));
  $('#result-2 pre').append(d.toHighlightedString());

});