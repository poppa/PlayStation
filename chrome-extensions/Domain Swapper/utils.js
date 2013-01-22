function trace()
{
  for (var i = 0; i < arguments.length; i++)
    console.log(arguments[i]);
}

function __(key)
{
  return chrome.i18n.getMessage(key);
}

var config = new (function()
{
  function getc()
  {
    var ls = localStorage["swapdomains"];
    return (ls && JSON.parse(ls) || {});
  }

  this.get = function(prop)
  {
    if (!prop) return getc();
    return getc()[prop];
  };

  this.set = function(prop, val)
  {
    var c = getc();
    c[prop] = val;
    localStorage["swapdomains"] = JSON.stringify(c);
  };

  this.getDomains = function()
  {
    return getc().domains || [];
  };

  this.setDomains = function(val)
  {
    var c = getc();
    c.domains = val;
    localStorage["swapdomains"] = JSON.stringify(c);
  };
})();