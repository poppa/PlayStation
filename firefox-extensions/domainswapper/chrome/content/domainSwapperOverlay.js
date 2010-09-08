/*! The domain swapper object (doh!)
 *!
 *! @author Pontus Östlund <pontus@poppa.se>
 *! @version 0.2.1
 */
var DomainSwapper =
{
  /*! Is the extension initialized or not
   *!
   *! @var bool
   */
  isInit: false,

  /*! Array of domains set in the preferences
   *!
   *! @var array
   */
  domains: [],

  /*! Storage for the menu items. For ease of removal
   *!
   *! @var object
   *!  Has two members: item (the actual menu item (XULElement)) and
   *!  value (the domain associated with the menu item).
   */
  menuItems: {},

  /*! The preferences listener. When a preferece is altered this object
   *! will be called an relay the call to our internal methods so that we can
   *! update the menues accordingly to the changes.
   *!
   *! @var object
   */
  prefListener: null,

  /*! Should we always keep the menu items active or not.
   *!
   *! @var bool
   */
  alwaysActive: false,

  /*! Container for the default menu items (Always active, Settings)
   *!
   *! @var object
   */
  defaultMenu: {},
  
  URLHandler: openUILink,

  /*! Initialize the extension
   *!
   *! @access public
   */
  Init: function(evnt) // {{{
  {
    this.isInit = true;
    this.prefListener = new this.Manager.PrefListener(
      this.Manager.EXTENSION_BRANCH,
      function(branch, name) {
	switch (name)
	{
	  case "domains":      DomainSwapper.CollectDomains(); break;
	  case "alwaysActive": DomainSwapper.SetActive();      break;
	  default: /* Do nothing */ break;
	}
      }
    );

    this.prefListener.register();
    window.removeEventListener("load", DomainSwapper.Init, false);
  }, // }}}

  /*! Fetches the comma separated string of domains from the preferenses and
   *! turns it into an array.
   *!
   *! @access public
   */
  CollectDomains: function() // {{{
  {
    this.domains = [];
    var doms = this.Manager.GetCharPref("domains");

    if (doms) {
      doms = doms.split(',');
      for (var i = 0; i < doms.length; i++) {
	var d = doms[i].trim();
	if (!d || !d.length) continue;
	if (!d.match(/^https?:\/\//i))
	  d = 'http://' + d;
  
	while (d[d.length-1] == '/')
	  d = d.substring(0, d.length-1);
  
	if (!in_array(this.domains, d))
	  this.domains.push(d);
      }
    }

    this.buildMenu();
  }, // }}}

  /*! Checks the alwaysActive preference and updates the corresponding
   *! object member accordingly.
   *!
   *! @access public
   */
  SetActive: function()
  {
    this.alwaysActive = this.Manager.GetBoolPref("alwaysActive");
  },

  /*! Opens up a prompt with the comma separated list of domains for editing
   *!
   *! @access public
   */
  PromptSettings: function() // {{{
  {
    var v1 = this.Manager.GetCharPref('domains');
    var v2 = null;

    // It's an assignment
    if (v2 = prompt(this.Manager._('domains'), v1)) {
      if (v2 != v1) 
	this.Manager.SetCharPref('domains', v2);
    }
  }, // }}}

  /*! Toggles the preference alwaysActive
   *!
   *! @access public
   */
  ToggleAlwaysActive: function() // {{
  {
    this.Manager.SetBoolPref("alwaysActive", !this.alwaysActive);
  }, // }}}

  /*! Swaps the current domain to the one selected
   *!
   *! @access public
   *!
   *! @param string domain
   *!  The id of the menu item clicked (domain-0, domain-1, etc...)
   */
  Swap: function(domain) // {{{
  {
    gURLBar.value = this.domains[domain] + getBrowser().currentURI.path;
    this.URLHandler(gURLBar.value, null, false, true);
  }, // }}}

  /*! Run when the context menu is opened. Enables or disables the menu items
   *! depending on the settings and on which domain we're currently on.
   *!
   *! This one is called from the .xul file
   *!
   *! @access public
   */
  CheckMenu: function() // {{{
  {
    this.SetActive();

    var host = getBrowser().currentURI.prePath;
    var disableAll = !in_array(this.domains, host) && !this.alwaysActive;

    for (var name in this.menuItems) {
      var item = this.menuItems[name];

      if (item.value == host || disableAll) {
	item.item.setAttribute('disabled', 'true');
	item.item.onclick = null;
      }
      else if (in_array(this.domains, host) || this.alwaysActive) {
	item.item.setAttribute('disabled', 'false');
	item.item.onclick = item.item.oldcommand;
      }
    }
  }, // }}}

  /*! Creates the context menu.
   *!
   *! @access private
   */
  buildMenu: function() // {{{
  {
    dtrace("buildMenu");
    // The preference listener is run before the extension/chrome is fully
    // loaded it seems, thus the menu in the .xul file won't be there the
    // first time. So we simply return and wait for Init() to call this
    // method.
    if (!this.isInit) return;

    this.SetActive();

    var menu = document.getElementById('domainswapper-context');

    // Clear the menu on domains
    for (var name in this.menuItems)
      menu.removeItemAt(menu.getIndexOfItem(this.menuItems[name].item));

    // And clear the default items
    for (var name in this.defaultMenu)
      menu.removeItemAt(menu.getIndexOfItem(this.defaultMenu[name]));

    this.menuItems = {};

    this.domains.forEach(function (domain, i) {
      var el = menu.appendItem(domain, i);
      el.setAttribute('id', 'domain-' + i);
      el.onclick = el.oldcommand = function(ev) {
	DomainSwapper.Swap(this.value);
      };
      DomainSwapper.menuItems[el.id] = { 'item' : el, 'value' : domain };
    });

    // Setup the default menu items

    this.defaultMenu = {};

    // If not, means no domains have been added yet so we don't bother adding
    // the separator since there's nothing to separate
    if (menu.menupopup) {
      // There seems to be not method for adding menu separatators (I haven't
      // been able to find it anyway) so lets do it manually then!
      var NS  = 'http://www.mozilla.org/keymaster/gatekeeper/there.is.only.xul';
      var sep = menu.ownerDocument.createElementNS(NS, 'menuseparator');
      menu.menupopup.appendChild(sep);
      this.defaultMenu['separator'] = sep;
    }

    var eactive = menu.appendItem(this.Manager._('active'), null);
    eactive.onclick = function (e) { DomainSwapper.ToggleAlwaysActive() };
    eactive.setAttribute('type', 'checkbox');

    if (this.alwaysActive)
      eactive.setAttribute('checked', 'true');

    this.defaultMenu['active'] = eactive;

    var eset = menu.appendItem(this.Manager._('settings'), null);
    eset.onclick = function (e) { DomainSwapper.PromptSettings() };
    this.defaultMenu['settings'] = eset;
  } // }}}
};

window.addEventListener("load", function (e) { DomainSwapper.Init(e) }, false);
