/*! Misc constants
 */
var STATIC = {
  DEBUG: 1
};

/*! Format string, like in C#:
 *! String.format("This is argument {0} and {1}", "One", 2);
 */
String.format = function(format) // {{{
{
  for (var i = 0; i < arguments.length; i++) {
    var re = new RegExp("\\\{" + i + "\\\}", "g");
    format = format.replace(re, arguments[i+1]);
  }

  return format;
}; // }}}

/*! Strip whitespace from the beginning and end of a string
 */
String.prototype.trim = function()
{
  return this.replace(/^[\s\xA0]+/, "").replace(/[\s\xA0]+$/, "");
} // }}}

$id = function(id) { return $('#' + id); };

/*! Function to use for debugging output
 */
var lowtrace = window.console && function(a){ console.log(a) } || function(){};

/*! Trace function. Only outputs when in DEBUG mode
 */
var trace = function()
{
  if (STATIC.DEBUG && arguments.length > 0) {
    var m = arguments[0];
    if (arguments.length > 1) {
      for (var i = 1; i < arguments.length; i++) {
	var re = new RegExp("\\\{" + (i-1) + "\\\}", "g");
	m = m.replace(re, arguments[i]);
      }
    }
    try { lowtrace(m); }
    catch (e) { lowtrace(e); }
  }
};

var puts = function()
{
  var t = $('#console pre');
  var m = arguments[0];
  if (arguments.length > 1) {
    for (var i = 1; i < arguments.length; i++) {
      var re = new RegExp("\\\{" + (i-1) + "\\\}", "g");
      m = m.replace(re, arguments[i]);
    }
  }

  t.append(m);
};
