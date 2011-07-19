/*!
 * Copyright man
 */

if (!window.console)
  window.console = { log: function() {} };

/* Debug method
 *
 * @param mixed ... args
 *  Like @[String
 .format]
 */
var trace = function() // {{{
{
  var s = arguments[0];
  for (var i = 1; i < arguments.length; i++)
    s = s.replace("{" + (i-1) + "}", arguments[i]);

  console.log(s);
}; // }}}

/*! Returns the current viewport: Width and height of body and window
 */
var Viewport = function() // {{{
{
  var bod = $(document.body);
  var win = $(window);
  var width = bod.width();
  var height = bod.height();
  
  if (height < win.height())
    height = win.height();
  else
    height += 20;

  return { width: width,
           height: height, 
	   winHeight: win.height(),
	   winWidth: win.width(),
           scrollTop: win.scrollTop() };
}; // }}}

function topnav() // {{{
{
  $('#topnav>ul>li').each(function(i, el) {
    el = $(el);
    var a = $(el.find('a')[0]);
    var s = el.find('ul');
    if (s.length) {
      el.mouseenter(function() {
	var my = el.get(0);
	my.state = 1;
	
	a.addClass('hover');
	
	var vp = Viewport();
	var thisOffset = $(this).offset();
	var subWidth = s.width();
	
	// Submenu goes outside if the right side
	if (thisOffset.left + subWidth >= (vp.width-20)) {
	  var bs = s.css('-moz-box-shadow');
	  var m = bs.match(/^(rgb\(.*?\)) ([\d]+px) ([\d]+px) ([\d]+px)/i);
	  if (m && m.length > 1) {
	    var css = "-" + m[2] + " " + m[3] + " " + m[4] + " " + m[1];
	    s.css({
	      '-moz-box-shadow': css,
	      'box-shadow': css
	    });
	  }
	  var diff = subWidth - $(this).width();
	  s.css('margin-left', -(diff));
	}

	if (my.iv) clearInterval(my.iv);
	if (!my.doDelay) {
	  s.hide();
	}
	my.iv = setTimeout(function() {
	  s.slideDown('fast');
	  my.doDelay = true;
	}, 500);
      })
      .mouseleave(function() {
	var my = el.get(0);
	my.state = 0;
	if (my.iv) clearInterval(my.iv);
	if (my.doDelay) {
	  s.show();
	  my.iv = setTimeout(function() {
	    s.slideUp('fast', function() {
	      a.removeClass('hover');
	    });
	    my.doDelay = false;
	  }, 700);
	}
	else {
	  s.hide();
	  a.removeClass('hover');
	}
      });
    }
  });
} // }}}

function faq(marker) // {{{
{
  new (function(marker) {
    var marker = $('#' + marker);
    var nodes = marker.find('~ div.picture-component');
    this.targets = [];
    this.toggles = 0;
    var my = this;
    my.a = $('<a class="read-more" href="javascript:void(0)">Öppna alla</a>').click(function() {
      if (my.toggles++ % 2 == 0) {
      	$(my.targets).each(function(i, el) { $(el).show() });
      	my.a.text('Göm alla');
      }
      else {
	$(my.targets).each(function(i, el) { $(el).hide() });
	my.a.text('Visa alla');
      }
    });
    my.a.insertBefore(marker);
    nodes.each(function(i, el) {
      el = $(el).addClass('faq');
      var h = el.find('h2');
      var b = el.find('div.body');
      b.addClass('hidden faq-body');
      my.targets.push(b);
      h.css('cursor','pointer').addClass('faq').click(function() {
	b.slideToggle('fast');
      });
    });
  })(marker);
} // }}}

var DomTab = function(ul) // {{{
{
  this.ul = $(ul);
  this.items = [];
  this.current = null;

  var my = this;

  this.ul.find('a').each(function(i, el) {
    el = $(el);
    var t = $(el.attr('href'));
    if (t.length) {
      t.css('display','none');
      var x;
      my.items.push(x = {
	id: t.attr('id'),
	link: el,
	target: t
      });

      el.click(function() {
	my.select(x);
	$(this).blur();
	return false;
      });
    }
  });

  this.select = function(id)
  {
    if (!id) return;
    var x = typeof id == 'string' ? my.find(id) : id;
    if (!x) return my.select(my.items[0]);
    
    if (my.current) {
      my.current.link.removeClass('selected');
      my.current.target.css('display','none');
    }
    
    x.link.addClass('selected');
    x.target.css('display','block');
    
    my.current = x;
  };

  this.find = function(id)
  {
    if (id.indexOf('#') > -1) id = id.substring(1);

    for (var i = 0; i < my.items.length; i++) {
      if (my.items[i].id == id)
      	return my.items[i];
    }

    return null;
  };
  
  if (this.items.length) {
    var h = this.find(document.location.hash);
    this.select(h || this.items[0]);
  }
}; // }}}

var AutoTab = function(el) // {{{
{
  this.container = $(el);
  this.items = [];
  this.current = null;
  this.ul = $('<ul class="tab no-list no-margin"></ul>');
  var my = this;

  this.container.find('.tab').each(function(i, el) {
    el = $(el);
    var p = el.parent();
    var id = p.attr('id');
    var aid = 'autotab-' + id;
    var a = $('<a href="#' + aid + '">' + el.html() + '</a>');
    var li = $('<li></li>').addClass('tab-' + i);
    my.ul.append(li.append(el.empty().append(a)));
    a.click(function() {
      my.select(this.href.substring(this.href.indexOf('#')+1));
    });
    
    my.items.push({
      id: id,
      link: a,
      target: p
    });

    p.css('display','none');
  });

  this.select = function(id)
  {
    trace("Select: " + id);
    if (!id) return;
    if (typeof id == 'string') {
      if (id[0] == '#') id = id.substring(1);
      id = my.find(id);
      if (!id) return my.find(my.items.length && my.items[0]);
    }
    
    if (my.current) {
      my.current.link.removeClass('selected');
      my.current.target.css('display','none');
    }
    
    id.link.addClass('selected');
    id.target.css('display','block');

    my.current = id;
  };
  
  this.find = function(id) 
  {
    if (id.indexOf('#') > -1) id = id.substring(1);
    if (id.indexOf('autotab-') > -1)
      id = id.substring('autotab-'.length);

    for (var i = 0; i < my.items.length; i++) {
      var t = my.items[i];
      if (t.id == id)
      	return t;
    }
    
    return null;
  };

  this.container.prepend(this.ul);
  $('<div class="clear"></div>').insertAfter(this.ul);;
  if (this.items.length) {
    var h = this.find(document.location.hash);
    this.select(h || this.items[0]);
  }
}; // }}}

var levelColumns = function() // {{{
{
  $('ul.horizontal').each(function(i, el) {
    var max = 0;
    var items = [];
    $(el).find('li.item .col').each(function(j, col) {
      var h = $(col).height(); 
      if (h > max) max = h;
      items.push(col);
    });
    $(items).css('height', max);
  });
}; // }}}

var form = {
  error: {
    errors: [],
    init: function() {
      var form = null;
      var messages = [];
      $(this.errors).each(function(i, el) {
	var inp = $('#' + el.id);
	trace(inp);
	if (inp.length > 0) {
	  $('#msg-' + el.id).css('display','none');
	  if (!form) form = inp.closest('form');
	  messages.push(
	    '<dd>' +
	      '<a href="#' + el.id + '">' + el.value + '</a>' +
	    '</dd>'
	  );
	}
      });
      
      if (messages.length && form) {
      	var dl = $(
      	  '<dl class="form-errors rounded">' +
      	  '<dt><em>' + messages.length + '</em> fel hittades i ' +
      	    'formuläret' + '</dt>' + messages.join('') + 
      	  '</dl>'
	);

	form.prepend(dl);
	
	$(dl).find('a').click(function() {
	  var hash = this.href.substring(this.href.indexOf('#')+1);
	  $('#' + hash).addClass('error').blur(function() {
	    $(this).removeClass('error');
	  });
	  document.location.href = this.href;
	  $('#' + hash).focus();
	  return false;
      	});
      }
    }
  }
};

(function($) 
{
  $.fn.autotab = function() {
    return this.each(function() {
      new AutoTab(this);
    });
  };
})(jQuery);

$(function() {
  $('div.autotab').autotab();
  topnav();
  levelColumns();
  form.error.init();
});
