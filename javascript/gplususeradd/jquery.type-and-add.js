/*!
 * Like the "add people to invite" function in Google+. Lets you type in an
 * invisible input field. A callback is called and if an array is passed back
 * from there a drop-down list is populated from which you can choose.
 *
 * Copyright (c) 2011 Pontus Östlund
 *
 * Dual licensed under the MIT and GPL licenses:
 *   http://www.opensource.org/licenses/mit-license.php
 *   http://www.gnu.org/licenses/gpl.html
 */
(function($) {
  if ($ == undefined) throw 'jQuery not available';

  var Handler = function(config, element) {
    var handler = this,
    my          = $(element),
    sd          = config.searchDelay || 500,
    sml         = config.searchMinLength || 3,
    onAdd       = config.onAdd || function() {},
    onRemove    = config.onRemove || function() {},
    onSearch    = config.onSearch || function() {},
    storage     = new Storage(),
    add_a       = my.find('a.add-element'),
    blur = function() {
      inp.css('display','none');
      add_a.css('display','inline-block').focus();
      $(document).unbind('click');
      $(inp[0].popup).remove();
      inp[0].popup = null;
    },
    inp = $('<input type="text" placeholder="'+add_a.text()+'" />')
    .css({ border: 'none',  background: 'transparent', display: 'none'})
    .addClass('type-and-find')
    // Focus
    .focus(function() {
      var $my = $(this);
      var $this = this;
      $(document).click(blur);

      if (!$this.popup) {
	var o = document.all ? $my.position() : $my.offset();
	$this.popup = $('<div class="type-and-find-popup"/>')
                      .css({ position: 'absolute',
                             left: o.left,
                             top: o.top + $my.outerHeight(),
                             minWidth: 180,
                             maxWidth: 350,
                             display: 'none',
                             border: '1px solid #ccc',
                             maxHeight: 300,
                             overflow: 'auto',
                             background: 'white',
                             boxShadow: '2px 2px 2px #999' })
		      .focus(function() {
			trace("Focus");
		      });

	$this.popup.insertAfter(inp);
      }
    })
    // Keyup
    .keyup(function(e) {
      if (e.keyCode == 27) { // escape
      	blur();
      	return;
      }
      if (e.keyCode == 32) { // space
	if (this.iv) clearInterval(this.iv);
	return;
      }

      if (inp.val().length >= sml) {
	this.iv = setTimeout(function() {
	  var ret = onSearch(inp.val(), handler, inp[0]);
	  handler.populatePopup(ret);
	}, sd);
      }
    })
    // Keydown
    .keydown(function() {
      if (this.iv != undefined && this.iv > 0)
	clearInterval(this.iv);
    })
    // Hide the document click event
    .click(function(e) { e.stopPropagation(); }); // end input

    my.prepend(inp);

    add_a.click(function(e) {
      e.stopPropagation();
      $(this).css('display','none');
      inp.css('display', 'inline-block').val('').focus();
      return false;
    });

    //- Public methods

    this.getStorage = function() { return storage; };
    this.remove = function(element) {
      storage.remove($.data(element, 'data'));
      $(element).remove();
    };
    this.populatePopup = function(a) {
      var t = my.find('div.type-and-find-popup').empty();
      if (!a || !a.length) { t.hide(); return; }

      for (var i = 0; i < a.length; i++) {
	var e = a[i];
	if (storage.exists(e)) continue;

	var link = $('<a href="#">' + (e.display||'?') + '</a>')
		   .attr('title', e.title||'')
		   .css({ display: 'block',
		          padding: '2px 4px',
		          textDecoration: 'none'})
		   .click(function(ev) {
		     if (onAdd($.data(this, 'data'), handler, this) !== false) {
		       storage.add($.data(this, 'data'));

		       $(this).css({ display: 'inline-block' })
		       .addClass('selected-item')
		       .unbind('click')
		       .click(function() {
			 if (onRemove($.data(this, 'data'),
			              handler, this) !== false)
			 {
			   handler.remove(this);
			 }

			 return false;
		       })
		       .focus(function() {})
		       .insertBefore(inp);

		       setTimeout(function() { add_a.trigger('click'); },1);
		     }
		     blur();
		     return false;
		   });

	$.data(link[0], 'data', a[i]);
	t.append(link);
      }

      t.show();
    };
    this.reset = function() {
      storage.clear();
      my.find('a.selected-item').remove();
      blur();
    };
  };

  var Storage = function() {
    var list = [];
    this.getList = function() { return list; };
    this.add = function(obj) { list.push(obj); };
    this.remove = function(obj) {
      var n = [];
      for (var i in list)
	if (!equals(list[i], obj))
	  n.push(list[i]);

      list = n;
    };
    this.exists = function(which) {
      for (var i = 0; i < list.length; i++) {
	if (equals(list[i], which))
	  return true;
      }
      return false;
    };
    this.clear = function() { list = []; };
  };
  
  //! Compare a to b
  var equals = function (a, b) {
    var t1 = typeof a, t2 = typeof b;
    if (t1 !== t2) return false;

    if (t1 === 'object') {
      for (var name in a) {
	// Key mismatch
	if (!(name in b)) return false;

	var _a = a[name], _b = b[name];

	if (typeof _a !== typeof _b) return false;
	if (typeof _a === 'object')  return equals(_a, _b);
	if (typeof _a === 'function') {
	  // If argument length mismatch it's definitely different funcs.
	  // Don't know of any foolproof way of comparing functions
	  return _a.length === _b.length;
	}

	return a[name] === b[name];
      }
    }
    else if (t1 === 'function')
      return a.length === b.length;
    else
      return a === b;
  };

  $.fn.typeAndAdd = function(config)
  {
    return this.each(function() {
      var h = new Handler(config, this);
      $.data(this, 'typeAndAdd', h);
    });
  };
  $.fn.typeAndAddReset = function() {
    return this.each(function() {
      var h = $.data(this, 'typeAndAdd');
      if (h) h.reset();
    });
  }
})(jQuery);
