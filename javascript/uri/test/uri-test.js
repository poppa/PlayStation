$(document).ready(function()
{
  var uri = new URI('http://poppa.se');
  uri.path = '/blog/';
  uri.variables.offset = 10;

  // Print example 1
  puts("<b>Example 1:</b> {0}\n", uri.toString());

  delete uri.variables.offset;

  uri.path = '/blog/tags/roxen/';
  uri.fragment = 'content';

  // Print example 2
  puts("<b>Example 2:</b> {0}\n", uri.toString());

  var uri = new URI();
  uri.parse('http://poppa.se');

  // Print example 3
  puts("<b>Example 3:</b> {0}", uri.toString());
});
