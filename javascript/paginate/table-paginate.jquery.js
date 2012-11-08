/* jQuery plugin for automatically paginating tables with many rows.
 *
 * Table attributes:
 *
 *    # data-tpgn-rows: Number of rows per page. Default is 20.
 *
 *    # data-tpgn-force-rows: If set and "true" the value of the above
 *      attribute will be forced. The standard behavior is that if the number
 *      of rows in the table exceeds data-paginate-rows with only up to 4 the
 *      pagination will be skipped. This attribute forces the pagination even
 *      if the numer of rows only exceeds by one.
 *
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
  var paginate = function(table)
  {
    table = $(table);

    var tbody = table.find('tbody'),
    tfoot = table.find('tfoot'),
    rows = tbody.length === 0 ? table.find('tr') : tbody.find('tr'),
    nrows = rows.length,
    ncells = $(rows[0]).find('td').length,
    td = $('<td>').attr('colspan', ncells)
    maxRows = 20,
    my = this;
    
    if (table.attr('data-tpgn-rows'))
      maxRows = parseInt(table.attr('data-tpgn-rows'), 10);

    // We pad the number of max rows. If there are more rows in the table than
    // maxRows, but only by 4 rows we don't bother paginating.
    if (!table.attr('data-tpgn-force-rows') && nrows < maxRows + 5)
      return;

    if (tfoot.length === 0) {
      tfoot = $('<tfoot>');
      table.append(tfoot);
    }

    tfoot.append($('<tr>').addClass('paginater').append(td));

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

      	return false;
      };

      // Show previous page
      this.prev = function() {
      	if (--this.offset < 0)
      	  this.offset = this.pages - 1;

      	return this.showRows();
      };

      // Show next page
      this.next = function() {
      	if (++this.offset === this.pages)
      	  this.offset = 0;

      	return this.showRows();
      };

      // Goto page at `offset`
      this.goto = function(offset) {
      	this.offset = offset;
      	return this.showRows();
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