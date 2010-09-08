/*! Manger object with misc methods
 */
DomainSwapper.Manager =
{
  /*! The name of the extension
   */
  EXTENSION_NAME: 'domainswapper',

  /*! The main branch of the extension
   */
  EXTENSION_BRANCH: 'extensions.domainswapper.',

  /*! The main stringbundle ID of the extension
   */
  STRBUNDLE_ID: 'domainswapper-stringbundle',

  /*! Debug mode
   */
  DEBUG: false,

  /*! Set a boolean preference value
   *!
   *! @access public
   *!
   *! @param string name
   *!  The name of the preference
   *! @param bool value
   *!  The value to set
   *! @param string branch (optional)
   *!  If not set the value from a constant named EXTENSION_BRANCH
   *!  will be used
   */
  SetBoolPref: function(name, value, branch)
  {
    var prefs = this.GetPrefService();
    prefs.getBranch(branch||this.EXTENSION_BRANCH).setBoolPref(name, value);
  },

  /*! Set a string preference value
   *!
   *! @access public
   *!
   *! @param string name
   *!  The name of the preference
   *! @param string value
   *!  The value to set
   *! @param string branch (optional)
   *!  If not set the value from a constant named EXTENSION_BRANCH
   *!  will be used
   */
  SetCharPref: function(name, value, branch)
  {
    var prefs = this.GetPrefService();
    prefs.getBranch(branch||this.EXTENSION_BRANCH).setCharPref(name, value);
  },

  /*! Set an int preference value
   *!
   *! @access public
   *!
   *! @param string name
   *!  The name of the preference
   *! @param int value
   *!  The value to set
   *! @param string branch (optional)
   *!  If not set the value from a constant named EXTENSION_BRANCH
   *!  will be used
   */
  SetIntPref: function(name, value, branch)
  {
    var prefs = this.GetPrefService();
    prefs.getBranch(branch||this.EXTENSION_BRANCH).setIntPref(name, value);
  },

  /*! Returns a boolean preference value
   *!
   *! @access public
   *!
   *! @param string name
   *!  The name of the preference
   *! @param string branch (optional)
   *!  If not set the value from a constant named EXTENSION_BRANCH
   *!  will be used
   *!
   *! @return bool
   */
  GetBoolPref: function(name, branch)
  {
    var prefs = this.GetPrefService();
    return prefs.getBranch(branch||this.EXTENSION_BRANCH).getBoolPref(name);
  },

  /*! Returns a string preference value
   *!
   *! @access public
   *!
   *! @param string name
   *!  The name of the preference
   *! @param string branch (optional)
   *!  If not set the value from a constant named EXTENSION_BRANCH
   *!  will be used
   *!
   *! @return string
   */
  GetCharPref: function(name, branch)
  {
    var prefs = this.GetPrefService();
    return prefs.getBranch(branch||this.EXTENSION_BRANCH).getCharPref(name);
  },

  /*! Returns an int preference value
   *!
   *! @access public
   *!
   *! @param string name
   *!  The name of the preference
   *! @param string branch (optional)
   *!  If not set the value from a constant named EXTENSION_BRANCH
   *!  will be used
   *!
   *! @return bool
   */
  GetIntPref: function(name, branch)
  {
    var prefs = this.GetPrefService();
    return prefs.getBranch(branch||this.EXTENSION_BRANCH).getIntPref(name);
  },

  /*! Returns a localized string named @[name]
   *!
   *! The lookup will be done from a stringbundle with the ID set in a
   *! constant named STRBUNDLE_ID. 
   *!
   *! The @[name] will be prefixed with the value of a constant named
   *! EXTENSION_NAME.
   *!
   *! @example
   *!  // myExtension.properties
   *!  myExtension.title=My extension
   *!  myExtension.open=Open
   *!
   *!  // First imported JavaScript.js
   *!  const EXTENSION_NAME = 'myExtension';
   *!  const STRBUNDLE_ID = 'my-localized-strings';
   *!
   *!  //...
   *!  var title = Manager._('title'); // Returns myExtension.title
   *!
   *! @param string name
   *!  The name, after the extension name, of the property
   */
  _: function(name)
  {
    return document.getElementById(this.STRBUNDLE_ID)
                   .getString(this.EXTENSION_NAME + '.' + name);
  },

  /*! Returns a preference object
   */
  GetPrefService: function()
  {
    return Components.classes["@mozilla.org/preferences-service;1"]
	             .getService(Components.interfaces.nsIPrefService);
  },

  /*! Debugging routine. Writes to the error console (message part)
   */
  trace: function(message) 
  {
    if (this.DEBUG) {
      var cs = Components.classes["@mozilla.org/consoleservice;1"]
			 .getService(Components.interfaces.nsIConsoleService);
      cs.logStringMessage(this.EXTENSION_NAME + ": " + message);
    }
  }
};

/*! Preference listener. Gets callback when ever a preference is altered
 */
DomainSwapper.Manager.PrefListener = function (branchName, func)
{
  var prefService = DomainSwapper.Manager.GetPrefService();
  var branch = prefService.getBranch(branchName);
  branch.QueryInterface(Components.interfaces.nsIPrefBranch2);

  this.register = function() {
    branch.addObserver("", this, false);
    branch.getChildList("", {})
          .forEach(function(name) { func(branch, name); });
  };

  this.unregister = function unregister() {
    if (branch)
      branch.removeObserver("", this);
  };

  this.observe = function(subject, topic, data) {
    if (topic == "nsPref:changed")
      func(branch, data);
  };
};

/*! Trims a string of leading and trailing whitespaces
 */
String.prototype.trim = function()
{
  return this.replace(/^[\s\xA0]+/, "").replace(/[\s\xA0]+$/, "");
};

/*! Checks if array @[ary] has the value @[what]
 *!
 *! @param array ary
 *! @param mixed what
 *!
 *! @return bool
 */
function in_array(ary, what)
{
  for (var a = 0; a < ary.length; a++) {
    if (ary[a] == what)
      return true;
  }
  return false;
}

var dtrace = function (m) {
  DomainSwapper.Manager.trace(m);
};
