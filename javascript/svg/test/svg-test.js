$(document).ready(function()
{
  var div1 = $('<div><h1>Test 1</h1></div>');
  $(document.body).append(div1);

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
  
  group.rect(0, 0, 600, 300, {
    stroke: '#000',
    strokeWidth: 3,
    fill: 'url(#gradient1)'
  });

  group.text('This is an SVG test!', 160, 150, {
    fontFamily: 'arial,sans-serif',
    fontSize: 28,
    fontWeight: 'bold',
    fill: '#fff'
  });

  //trace(d.toPrettyString());
  div1.append($(d.getDocument()));
  var pre = $('<pre>' + d.toHighlightedString() + '</pre>');
  div1.append(pre);
});

/*
var d = SVG.createDocument(700, 600, 'test');
d.addNamespace('http://www.w3.org/1999/xlink', 'xmlns:xlink');

var defs = d.defs();
var lg = defs.node('linearGradient', {
  id: 'gradient1',
  x1: '0%',
  y1: '0%',
  x2: '80%',
  y2: '50%',
  '#spreadMethod': 'pad'
});

lg.node('stop', { offset: '0%', stopColor: '#0000cc', stopOpacity: 1 });
lg.node('stop', { offset: '100%', stopColor: '#000033', stopOpacity: 1 });

d.circle(10, 20, 5);
var text = d.text('A link to my web site', 50, 50, {
  fontFamily: 'calibri,sans-serif',
  fontSize: 28,
  fontWeight: 'bold',
  fill: '#777'
});

var group1 = d.g();
group1.a('http://poppa.se', text);
group1.rect(330, 100, 150, 150, {
  stroke: '#001',
  strokeWidth: 3,
  fill: 'url(#gradient1)',
  rx: 8,
  ry: 8
});

d.ellipse(42, 140, 40, 60, { stroke: '#600', fill: '#c00' });
group1.polyline('200,200 250,200 250,250 200,200');
var img = d.image('http://www.poppa.se/blog/wp-content/themes/poppa/img/logo.png', {
  width: 229,
  height: 52,
  x: 90,
  y: 90
});
d.a('http://www.poppa.se', img);
trace(d.toString());
document.body.appendChild(d.getDocument());
*/