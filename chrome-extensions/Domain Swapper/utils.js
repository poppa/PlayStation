// Utility functions for the Domain Swapper Chrome extension
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

String.prototype.trim = function () {
  return this.replace(/^\s*(.*?)\s*$/g, "$1") || "";
};

function getElement(id)
{
  return document.getElementById(id);
}

function __(key)
{
  return chrome.i18n.getMessage(key);
}

var config = new (function()
{
  var conf = { "swapdomains" : {}},
  onReadyCallback,
  isReady = false,
  manifest = chrome.runtime.getManifest();

  chrome.storage.onChanged.addListener(function (obj, area) {
    console.log("DS: storage.changed(" + JSON.stringify(obj) + ")");
    chrome.extension.sendMessage({
      request: 'updateConfig'
    });
  });

  chrome.storage.sync.get("swapdomains", function (items) {
    console.log("DS: config is ready");
    conf.swapdomains = items.swapdomains || {};
    isReady = true;

    if (onReadyCallback)
      onReadyCallback();
  });

  function getc()
  {
    return conf.swapdomains;
  }

  function save()
  {
    console.log("DS: config.save()");
    chrome.storage.sync.set(conf);
  }

  this.manifest = manifest;
  
  this.isReady = function () {
    return isReady;
  };

  this.update = function (callback)
  {
    chrome.storage.sync.get("swapdomains", function (items) {
      conf.swapdomains = items.swapdomains || {};

      if (callback)
	callback();
    });
  };

  this.onReady = function (callback) {
    onReadyCallback = callback;
  };

  this.isMyDomain = function (dom)
  {
    var d = config.getDomains();

    for (var i = 0; i < d.length; i++)
      if (d[i] === dom)
	return true;

    return false;
  };

  this.clear = function()
  {
    conf.swapdomains = {};
    save();
  }

  this.get = function(prop)
  {
    if (!prop) return getc();
    return getc()[prop];
  };

  this.set = function(prop, val)
  {
    conf.swapdomains[prop] = val;
    save();
  };

  this.isAlwaysActive = function()
  {
    return config.get('always-active') === false ? false : true;
  };

  this.getDomains = function()
  {
    return getc().domains || [];
  };

  this.setDomains = function(val)
  {
    conf.swapdomains.domains = val;
    save();
  };
})();