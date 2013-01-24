// Settings functionality for the Domain Swapper Chrome extension
//
// Copyright (C) 2013 Pontus Östlund (www.poppa.se)
//
// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to
// deal in the Software without restriction, including without limitation the
// rights to use, copy, modify, merge, publish, distribute, sublicense, and/or
// sell copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:
//
// The above copyright notice and this permission notice shall be included in
// all copies or substantial portions of the Software.
//
// The Software shall be used for Good, not Evil.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
// THE SOFTWARE.

var dom_org_template = document.getElementById('template'),
template             = null,
dom_domains          = document.getElementById('domains'),
dom_alwaysActive     = document.getElementById('always-active'),
html                 = document.getElementsByTagName('html')[0],
i18n                 = html.querySelectorAll('[data-i18n]');

// Internationalization. Loop through all elements with the attribute
// "data-i18n". The attribute value is the translation key. Get that value
// and replace the nodes content with it.
for (var i = 0; i < i18n.length; i++) {
  var lnode = i18n[i],
  key = lnode.dataset['i18n'],
  value = __(key);

  if (value) lnode.innerHTML = value;
}

// This needs to be after the internationalization
template = dom_org_template.cloneNode(true);
dom_domains.removeChild(dom_org_template);

html = null, i18n = null, dom_org_template = null;

var domainHandler = (function () {
  var domains = [];

  return {
    init: function() {
      var dd = config.getDomains();

      for (var i = 0; i < dd.length; i++)
	domains.push(dd[i]);
    },

    clearAll: function() {
      config.clear();
      domains = [];
      dom_domains.innerHTML = "";
      domainHandler.save(true);
    },

    save: function(noConfig) {
      var c = dom_domains.children,
      rm = [];

      for (var i = 0; i < c.length; i++) {
      	var cc = c[i],
      	value = cc.querySelector('input').value;

      	if (!domainHandler.exists(value)) {
      	  domainHandler.add(value);
      	  rm.push(cc);
      	}
      }

      for (var i = 0; i < rm.length; i++)
      	rm[i].parentNode.removeChild(rm[i]);

      console.log("DS: domainHandler.save()");

      if (!noConfig)
	config.setDomains(domains);

      setupDomains();
    },

    domains: function() {
      return domains;
    },

    length: function() {
      return domains.length;
    },

    exists: function(s) {
      s = s.trim();

      for (var i = 0; i < domains.length; i++)
	if (domains[i] === s)
	  return true;

      return false;
    },

    add: function(s) {
      s = s.trim();

      if (s.length === 0)
      	return false;

      if (domainHandler.exists(s))
      	return false;

      domains.push(s);

      return true;
    },

    remove: function(s)
    {
      console.log("DS: domainHandler.remove('" + s + "')");

      var n = [];
      s = s.trim();

      for (var i = 0; i < domains.length; i++) {
      	if (s === domains[i])
      	  continue;

      	n.push(domains[i]);
      }

      domains = n;
      config.setDomains(domains);
    }
  };
})();

function getTemplate()
{
  var t = template.cloneNode(true);
  t.removeAttribute("id");
  return t;
}

function onRemoveDomainClick()
{
  var inp = this.parentNode.querySelector('input');
  domainHandler.remove(inp.value);
  this.parentNode.parentNode.removeChild(this.parentNode);

  return false;
}

function setupDomains()
{
  dom_domains.innerHTML = "";

  var dd = domainHandler.domains();

  for (var i = 0; i < dd.length; i++) {
    var tx = getTemplate(),
    inp = tx.querySelector('input'),
    ah = tx.querySelector('button');

    ah.addEventListener('click', onRemoveDomainClick);
    inp.value = dd[i];
    inp.disabled = true;
    dom_domains.appendChild(tx);
  }

  setAlwaysActive();
}

function setAlwaysActive()
{
  dom_alwaysActive.checked = config.isAlwaysActive();
}

dom_alwaysActive.addEventListener('change', function(e) {
  console.log("DS: alwaysActive.change(" + this.checked + ")");
  config.set('always-active', this.checked);
});

document.getElementById('save').addEventListener('click', function(e) {
  domainHandler.save();
  return false;
});

document.getElementById('clear').addEventListener('click', function(e) {
  if (confirm(__('clear_all_settings_confirm')))
    domainHandler.clearAll();
});

document.getElementById('addDomain').addEventListener('click', function(e) {
  var y = getTemplate();
  dom_domains.appendChild(y);

  var a = y.querySelector('button');
  a.addEventListener('click', onRemoveDomainClick);

  return false;
});

config.onReady(function() {
  domainHandler.init();
  setupDomains();
});