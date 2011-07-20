/*! Like the "add people to invite" function in Google+. Lets you type in an
 *! invisible input field. A callback is called and if an array is passed back
 *! from there a drop-down list is populated from which you can choose.
 *!
 *! Copyright (c) 2011 Pontus Östlund
 *!
 *! Dual licensed under the MIT and GPL licenses:
 *!   http://www.opensource.org/licenses/mit-license.php
 *!   http://www.gnu.org/licenses/gpl.html
 */
(function($) {
  if ($ == undefined) throw 'jQuery not available';

  /* The main object handling the replacement of the "add link" with the input
   * and what not. 
   *
   * @param Object config
   * @param domElement element
   */
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
      hideInput();
      rmPopup();
    },
    blurNoFocus = function() {
      hideInput(true);
      rmPopup();
    },
    hideInput = function(nofocus) {
      inp.css('display','none');
      add_a.css('display','inline-block');
      if (!nofocus) add_a.focus();
      $(document).unbind('click');
    },
    rmPopup = function() {
      $(inp[0].popup).remove();
      inp[0].popup = null;
    },
    keepInput = function() {
      inp[0].doHide = false;
    },
    inp = $('<input type="text" placeholder="'+add_a.text()+'" />')
    .css({ border: 'none',  background: 'transparent', display: 'none'})
    .addClass('type-and-find')
    // Focus
    .focus(function() {
      var $my = $(this);
      var $this = this;
      
      if ($this.doHide === true)
      	keepInput();

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
			keepInput();
		      });

	$this.popup.insertAfter(inp);
      }
    })
    // Keyup
    .keyup(function(e) {
      // Skip if less than zero (0) and not backspace
      if (e.keyCode < 48 && e.keyCode != 8) {
      	clearInterval(this.iv);
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
    .blur(function() {
      this.doHide = true;
      $this = this;
      setTimeout(function() {
	if ($this.doHide === true) {
	  $this.doHide = false;
	  blurNoFocus();
	}
      }, 100);
    })
    // Hide the document click event
    .click(function(e) { e.stopPropagation(); }); // end input

    my.prepend(inp).keyup(function(ev) {
      // Esc, close the input and popup if existing
      if (ev.keyCode == 27) {
	blur();
	return;
      }
    });

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
      var t = my.find('div.type-and-find-popup');
      // To prevent the popup from flickering, if it's already open, if the 
      // dataset is large we collect all current elements and remove them when
      // the new elements have been added.
      var oldelem = t.find('a');
      if (!a || !a.length) { t.hide(); return; }

      for (var i = 0; i < a.length; i++) {
	var e = a[i];
	if (!config.duplicates && storage.exists(e)) continue;

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
			   blur();
			 }

			 return false;
		       })
		       .focus(function(e) {
			 e.stopPropagation();
		       })
		       .blur(function(e) {
		       	  e.stopPropagation();
		       	  inp.trigger('blur');
		       })
		       .insertBefore(inp);

		       // Internet Exploder needs this!
		       setTimeout(function() { add_a.trigger('click'); },1);
		     }
		     blur();
		     return false;
		   })
		   .keyup(function(ev) {
		     if (ev.keyCode == 46 || ev.keyCode == 8) 
		       $(this).click();
		   })
		   .focus(function() {
		     keepInput();
		   })
		   .blur(function() {
		     inp.trigger('blur');
		   });

	$.data(link[0], 'data', a[i]);
	t.append(link);
      }

      oldelem.remove();

      t.show();
    };
    this.reset = function() {
      storage.clear();
      my.find('a.selected-item').remove();
      blur();
    };
  };

  // The storage class is where we keep added elements in an instance. This is
  // to be able to prevent duplicates to be added.
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
