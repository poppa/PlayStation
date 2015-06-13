
(function() {
var t;
var puts = function() {
  var m = arguments[0];
  if (arguments.length > 1) {
    for (var i = 1; i < arguments.length; i++) {
      var re = new RegExp("\\\{" + (i-1) + "\\\}", "g");
      m = m.replace(re, arguments[i]);
      console.log(t);
    }
  }

  t.append(m);
};
$(document).ready(function() {

  t = $('#console pre');

  // <capture>

  var uri = new URI('http://poppa.se');
  uri.path = '/blog/';
  uri.variables.offset = 10;

  // Print example 1
  puts("<b>Example 1:</b> {0}\n", uri.toString());

  delete uri.variables.offset;
  uri.variables.name = 'Poppa P';

  uri.path = '/blog/tags/roxen/';
  uri.fragment = 'content';

  // Print example 2
  puts("<b>Example 2:</b> {0}\n", uri.toString());

  uri.parse('http://google.com');

  // Print example 3
  puts("<b>Example 3:</b> {0}", uri.toString());

  // </capture>
});
}());