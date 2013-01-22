var t        = document.getElementById('template'),
d            = document.getElementById('domains'),
addDomain    = document.getElementById('addDomain'),
alwaysActive = document.getElementById('always-active'),
html         = document.getElementsByTagName('html')[0],
i18n         = html.querySelectorAll('[data-i18n]');

for (var i = 0; i < i18n.length; i++) {
  var lnode = i18n[i],
  key = lnode.dataset['i18n'],
  value = __(key);

  if (value) lnode.innerHTML = value;
}

var x = t.cloneNode(true);
d.removeChild(t);

var domainHandler = (function () {
  var dd = config.getDomains(),
  domains = [];

  console.log(dd);

  for (var i = 0; i < dd.length; i++) {
    var x = trim(dd[i]);
    domains.push(x);
  }

  function trim(s)
  {
    return s && s.replace(/^\s*(.*?)\s*$/g, "$1") || "";
  }

  return {
    save: function() {
      var c = d.children,
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

      config.setDomains(domains);

      broadcast();
      setupDomains();
    },

    domains: function() {
      return domains;
    },

    length: function() {
      return domains.length;
    },

    exists: function(s) {
      s = trim(s);

      for (var i = 0; i < domains.length; i++)
	if (domains[i] === s)
	  return true;

      return false;
    },

    add: function(s) {
      s = trim(s);

      if (s.length === 0) {
      	console.log("Zero length domain!");
      	return false;
      }

      if (domainHandler.exists(s)) {
      	console.log("Domain '" + s + "' exists. Skipping!");
      	return false;
      }

      console.log("Adding '" + s + "' to domains");

      domains.push(s);

      return true;
    },

    remove: function(s)
    {
      var n = [];
      s = trim(s);

      console.log("Remove domain: " + s);

      for (var i = 0; i < domains.length; i++) {
      	if (s === domains[i])
      	  continue;

      	n.push(domains[i]);
      }

      domains = n;
      config.setDomains(domains);
      broadcast();
    }
  };
})();

function broadcast()
{
  console.log("Broadcast change!");

  chrome.extension.sendMessage({
    request: 'updateContextMenu'
  });
}

function getTemplate()
{
  var tx = x.cloneNode(true);
  tx.removeAttribute("id");
  return tx;
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
  console.log(config.getDomains());
  d.innerHTML = "";

  var dd = domainHandler.domains();

  for (var i = 0; i < dd.length; i++) {
    var tx = getTemplate(),
    inp = tx.querySelector('input'),
    ah = tx.querySelector('a');

    ah.addEventListener('click', onRemoveDomainClick);
    inp.value = dd[i];
    inp.disabled = true;
    d.appendChild(tx);
  }
}

document.getElementById('save').addEventListener('click', function(e) {
  domainHandler.save();
  return false;
});

if (alwaysActive) {
  alwaysActive.checked = config.get('always-active') === false ? false : true;
  
  alwaysActive.addEventListener('change', function(e)
  {
    config.set('always-active', this.checked);
  });
}

addDomain.addEventListener('click', function(e) {
  var y = getTemplate();
  d.appendChild(y);

  var a = y.querySelector('a');
  a.onclick = onRemoveDomainClick;

  return false;
});

setupDomains();

