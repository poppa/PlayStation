// Extension functionality for the Domain Swapper Chrome extension
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

// Main menu item id
var mainCtxId = null,
// ID:s of all menu items
menus = [],
// Key is menu item ID, value is the domain to swap to
domainmap = {},
// In which context should the menu be displayed.
contexts = [ "page", "image", "link" ];

// Listener for menu items click
chrome.contextMenus.onClicked.addListener(function (info, tab)
{
  if (info.menuItemId === "domainswappersettings")
    chrome.tabs.create({ url: "settings.html" });
  else if (info.menuItemId === mainCtxId)
    console.log("DS: This one isn't clickable");
  else {
    var uri = new URI(info.pageUrl);
    uri.host = domainmap[info.menuItemId];
    chrome.tabs.update(tab.id, { url: uri.toString() });
  }
});

// When URL is changed
chrome.webNavigation.onCommitted.addListener(function (e) {
  console.log("DS: webNavigation.onCommitted()");
  // Only update menu if URL i changed in the active tab
  chrome.tabs.get(e.tabId, function (tab) {
    if (tab && tab.active)
      updateMenu();
  });
});

// When changeing tabs. If tab is changed we need to update the menu items if
// menu items should be disabled if the current domain isn't in the domain list.
//
// NOTE: I'm not sure the if/else is needed. Think I read somewhere that
// "onActivated" isn't available in older versions of Chrome. Better safe
// than sorry.
if (chrome.tabs.onActivated) {
  chrome.tabs.onActivated.addListener(function (e) {
    console.log("DS: tabs.onActivated()");
    updateMenu();
  });
}
else if (chrome.tabs.onActiveChanged) {
  chrome.tabs.onActiveChanged.addListener(function (e) {
    console.log("DS: tabs.onActiveChanged()");
    updateMenu();
  });
}

// Invoked when settings are changed
chrome.extension.onMessage.addListener(function(msg, sender, sendResponse)
{
  // This will be invoked twice since there at this point will be two instanses
  // of the config obkect. We only rebuild the menu if the message comes from
  // the settings instance, that is the active tab.
  if (msg.request === "updateConfig" && sender.tab.active !== true) {
    config.update(function() {
      console.log("DS: onMessage('updateConfig')");
      buildMenu();
    });
  }
});

// Update the menu
function updateMenu()
{
  console.log("DS: updateMenu()");

  chrome.tabs.query({ active: true, currentWindow: true }, function (tab) {
    // This happens when closing Chrome for instance.
    if (!(tab = tab[0])) return;

    var turl = new URI(tab.url),
    domains = config.getDomains(),
    disable_all = !config.isMyDomain(turl.host) && !config.isAlwaysActive();

    console.log("DS: menus: " + JSON.stringify(menus));

    for (var i = 0; i < menus.length; i++) {
      var u = domainmap[menus[i]];

      if (u === undefined)
	continue;

      if (disable_all || u === turl.host)
	chrome.contextMenus.update(menus[i], { enabled: false });
      else
	chrome.contextMenus.update(menus[i], { enabled: true });
    }
  });
}

// Build menu
function buildMenu()
{
  var domains = config.getDomains(),
  cid = null;

  console.log("DS: buildMenu(" + JSON.stringify(domains) + ")");

  chrome.contextMenus.removeAll(function() {
    console.log("DS: Context menus removed");

    mainCtxId = chrome.contextMenus.create({
      "title" : __("swap_domain"),
      "contexts" : contexts,
      "id" : "domainswapper"
    });

    menus = [], domainmap = {};

    for (var i = 0; i < domains.length; i++) {
      console.log("    + DS: add menu(" + domains[i] + ")");
      cid = chrome.contextMenus.create({
	"title" : domains[i],
	"parentId" : mainCtxId,
	"contexts" : contexts,
	"id" : "domainswapper" + i
      });

      menus.push(cid);
      domainmap[cid] = domains[i];
    }

    cid = chrome.contextMenus.create({
      "type" : "separator",
      "parentId" : mainCtxId,
      "contexts" : contexts,
      "id" : "domainswapperseparator"
    });

    menus.push(cid);

    cid = chrome.contextMenus.create({
      "title" : __("settings") + "...",
      "parentId" : mainCtxId,
      "contexts" : contexts,
      "id" : "domainswappersettings"
    });

    menus.push(cid);

    updateMenu();
  });
}

chrome.runtime.onInstalled.addListener(function()
{
  console.log("DS: Installed");

  // Depending on stuff this listener can be invoked before the config object
  // is ready. Thus this interval which waits for the config object to ready.
  var iv = setInterval(function() {
    if (config.isReady()) {
      clearInterval(iv);
      buildMenu();
    }
    else console.log("DS: Config not ready yet!");
  }, 0.1);
});