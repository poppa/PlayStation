Table pagination jQuery plugin
==============================

This is a jQuery plugin that paginates HTML tables with many rows.
The number of rows per page (default is 20) can be configured per table via
custom data attributes.

Table attributes
----------------

  * data-tpgn-rows='int': Number of table rows per page (default is 20)
  * data-tpgn-bastards='int': Number of bastards to allow before beginning
    pagination (default is 4).
    
    This means: If data-tpgn-rows=10 and the table contains 14 rows no 
    pagination will be done.

CSS
----------------

If no `<tfoot>` tag exists in the table one will be created. The page links
will be put in the `<tfoot>` tag in a row with the CSS class `paginater`. 
The link for the currently selected row will have the class `selected`.

Usage
----------------

    // Assuming jquery.js and table-paginate.jquery.js is loaded
    
    <table class="paginate">
      <thead>
        <tr>
          <th>Header 1</th>
          <th>Header 2</th>
          <th>Header 3</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>Data 1.1</td>
          <td>Data 1.2</td>
          <td>Data 1.3</td>
        </tr>
        <tr>
          <td>Data 2.1</td>
          <td>Data 2.2</td>
          <td>Data 2.3</td>
        </tr>
        <!-- And so on -->
      </tbody>
    </table>
    
    <script>
      $('table.paginate').tablePaginate();
    </script>
    
Live example
-----------------

http://www.poppa.se/tmp/table-paginate/
