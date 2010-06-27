$(document).ready(function()
{
  // <capture>

  var d = SVG.createDocument(600, 300, 'test1');
  d.addNamespace('http://www.w3.org/1999/xlink', 'xmlns:xlink');
  var defs = d.defs();
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

  var group = d.g();

  group.rect(0, 0, 599, 299, {
    stroke: '#000',
    strokeWidth: 3,
    fill: 'url(#gradient1)',
    shapeRendering: 'crispEdges'
  });

  var text = group.text('This is an SVG test!', 160, 150, {
    fontFamily: 'arial,sans-serif',
    fontSize: 28,
    fontWeight: 'bold',
    fill: '#fff'
  });

  group.a('http://poppa.se', text);

  // </capture>

  $('#svg1').append($(d.getDocument()));
  $('#result-1 pre').append(d.toHighlightedString());

  // <capture>

  var d = SVG.createDocument(600, 300, 'test2');
  d.addNamespace('http://www.w3.org/1999/xlink', 'xmlns:xlink');

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
  
  d.rect(0, 0, 599, 299, {
    stroke: '#000',
    strokeWidth: 3,
    fill: 'url(#gradient2)',
    shapeRendering: 'crispEdges'
  });

  d.image('http://www.poppa.se/blog/wp-content/themes/poppa/img/logo.png', {
    x: 300,
    y: 120,
    width: 229,
    height: 52
  });
  
  d.rect(300-20, 120-20, 229+40, 52+40, {
    stroke: '#000',
    strokeWidth: 1,
    fill: 'none',
    shapeRendering: 'crispEdges'
  });
  
  d.rect(305-20, 125-20, 229+40, 52+40, {
    stroke: '#000',
    strokeWidth: 1,
    fill: 'none',
    shapeRendering: 'crispEdges'
  });
  
  // </capture>

  $('#svg2').append($(d.getDocument()));
  $('#result-2 pre').append(d.toHighlightedString());

});