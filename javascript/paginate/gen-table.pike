#!/usr/bin/env pike
/* -*- Mode: Pike; indent-tabs-mode: t; c-basic-offset: 2; tab-width: 8 -*- */

int main(int argc, array(string) argv)
{
  int nrows = argc > 1 ? (int) argv[1] : 87;
  array(string) headers = ({ "Date", "One", "Two", "Three", "Four", 
                             "Five", "Six" });
  Calendar.Second date = Calendar.now();

  array(array(string)) out = map(enumerate(nrows),
    lambda (int i) {
      return map(enumerate(sizeof(headers)),
        lambda (int j) {
          return j == 0 ? (date - (date->day() * (i+1)))->format_ymd()
                        : (string) random(10000);
        }
      );
    }
  );

  Stdio.write_file("table.html", ({
    "<table class='paginate' data-tpgn-rows='10'>",
    "  <thead>",
    "    <tr><th>" + (headers * "</th><th>") + "</th></tr>",
    "  </thead>",
    "  <tbody>",
    "    <tr><td>" +
    ((out[*] * "</td><td>") * "</td></tr>\n    <tr><td>") +
    "</td></tr>",
    "  </tbody>",
    "  <tfoot>",
    "    <tr><td colspan='" + sizeof(headers) + "'>A table footer</td></tr>",
    "  </tfoot>",
    "</table>" }) * "\n");

  return 0;
}