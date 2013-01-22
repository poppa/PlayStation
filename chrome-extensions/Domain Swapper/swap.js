var mainCtxId = null,
menus = [],
domainmap = {};

function onClickHandler(info, tab)
{
  if (info.menuItemId == "domainswappersettings") {
    console.log("Handle settings");
    onSettingsClicked();
  }
  else {
    var uri = new URI(info.pageUrl);
    uri.host = domainmap[info.menuItemId];
    chrome.tabs.update(tab.id, { url: uri.toString() });
  }
}

chrome.contextMenus.onClicked.addListener(onClickHandler);

chrome.webNavigation.onCommitted.addListener(function (e) {
  updateMenu(e.url);
});

function onSettingsClicked()
{
  chrome.tabs.create({ url: "settings.html" });
}

chrome.extension.onMessage.addListener(function(msg, sender, sendResponse)
{
  console.log("Got message");

  if (msg.request === "updateContextMenu") {
    buildMenu();
  }
});

function updateMenu(url)
{
  var url = new URI(url),
  domains = config.getDomains();

  chrome.tabs.getSelected(null, function (tab) {
    var turl = new URI(tab.url);

    for (var i = 0; i < menus.length; i++) {
      var u = domainmap[menus[i]];

      if (u === undefined)
	continue;

      console.log(u + " <> " + turl.host);

      if (u === turl.host) {
	console.log("Disable menu: " + u + "(" + menus[i] + ")");
	chrome.contextMenus.update(menus[i], { enabled: false });
      }
      else {
	chrome.contextMenus.update(menus[i], { enabled: true });
      }
    }
  });
}

function buildMenu()
{
  var domains = config.getDomains(),
  cid = null;

  console.log("Build menu");
  console.log(domains);

  for (var i = 0; i < menus.length; i++)
    chrome.contextMenus.remove(menus[i]);

  menus = [];

  for (var i = 0; i < domains.length; i++) {
    cid = chrome.contextMenus.create({
      "title" : domains[i],
      "parentId" : mainCtxId,
      "id" : "domainswapper" + i
    });

    menus.push(cid);
    domainmap["domainswapper" + i] = domains[i];
  }

  cid = chrome.contextMenus.create({
    "type" : "separator",
    "parentId" : mainCtxId,
    "id" : "domainswapperseparator"
  });

  menus.push(cid);

  cid = chrome.contextMenus.create({
    "title" : __("settings") + "...",
    "parentId" : mainCtxId,
    "id" : "domainswappersettings"
  });

  menus.push(cid);
}

chrome.runtime.onInstalled.addListener(function()
{
  mainCtxId = chrome.contextMenus.create({
    "title" : __("swap_domain"),
    "contexts" : [ "page", "selection", "image", "link" ],
    "id" : "domainswapper"
  });

  buildMenu();
});