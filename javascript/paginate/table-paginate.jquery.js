/* jQuery plugin for automatically paginating tables with many rows.
 *
 * Table attributes:
 *
 *    data-paginate-rows: Number of rows per page. Default is 20
 *
 * Example:
 *
 *    <table class="paginate" data-paginate-rows="10">
 *      ...
 *    </table>
 *
 *    $('table.paginate').tablePaginate()
 */
$.fn.tablePaginate = function() // {{{
{
  var rndid = function() {
    var x = '';
    for (var i = 0; i < 8; i++)
      x += String.fromCharCode(Math.floor(26 * Math.random() + 65));

    return x;
  };

  var paginate = function(table)
  {
    table = $(table);

    var tbody = table.find('tbody'),
    tfoot = table.find('tfoot'),
    rows = tbody.length === 0 ? table.find('tr') : tbody.find('tr'),
    nrows = rows.length,
    ncells = $(rows[0]).find('td').length,
    td = $('<td></td>').attr('colspan', ncells)
    maxRows = 20,
    tableId = rndid(),
    my = this;

    if (table.attr('data-paginate-rows'))
      maxRows = parseInt(table.attr('data-paginate-rows'), 10);

    // We pad the number of max rows. If there are more rows in the table than
    // maxRows, but only by 4 rows we don't bother paginating.
    if (nrows < maxRows + 5)
      return;

    if (tfoot.length === 0) {
      tfoot = $('<tfoot>');
      table.append(tfoot);
    }

    tfoot.append($('<tr></tr>').addClass('paginater').append(td));

    var paginater = new (function()
    {
      this.offset = 0;
      this.pages = Math.ceil(nrows / maxRows);

      // Show rows from offset
      this.showRows = function() {
      	rows.hide();

      	var start = this.offset * maxRows,
      	end = maxRows + start;

      	if (end > nrows)
      	  end = nrows;

      	for (var i = start; i < end; i++)
      	  $(rows[i]).show();

      	td.find('a.selected').removeClass('selected');
      	td.find('a#paginater-' + this.offset).addClass('selected');

      	//if (start > 0)
      	//  document.location.href = '#' + tableId + '=' + (this.offset + 1);
      };

      // Show previous page
      this.prev = function() {
      	this.offset--;

      	if (this.offset < 0)
      	  this.offset = this.pages - 1;

      	this.showRows();
      	return false;
      };

      // Show next page
      this.next = function() {
      	this.offset++;

      	if (this.offset == this.pages)
      	  this.offset = 0;

      	this.showRows();
      	return false;
      };

      // Goto page at `offset`
      this.goto = function(offset) {
      	this.offset = offset;
      	this.showRows();
      	return false;
      }

      var plink = $('<a href="#" class="prev"> « </a>'),
      nlink = $('<a href="#" class="prev"> » </a>');

      plink.click(function() { return paginater.prev(); });
      nlink.click(function() { return paginater.next(); });

      td.append(plink);

      for (var i = 0; i < this.pages; i++) {
      	var lnk = $('<a href="javascript:void(0)"> ' + (i + 1) + ' </a>');
      	$.data(lnk[0], 'offset', i);

      	lnk.click(function() {
	  $(this).blur();
	  paginater.goto($.data(this, 'offset'));
      	}).attr('id', 'paginater-' + i);

      	td.append(lnk);
      }

      td.append(nlink);

      this.showRows();
    });
  };

  return this.each(function() {
    return new paginate(this);
  });
}; // }}}