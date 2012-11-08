#!/usr/bin/env pike
/* -*- Mode: Pike; indent-tabs-mode: t; c-basic-offset: 2; tab-width: 8 -*- */

int main(int argc, array(string) argv)
{
  array(array(string)) out = ({});
  array headers = ({ "Date", "One", "Two", "Three", "Four" });
  Calendar.Second date = Calendar.now();
  
  for (int i; i < 105; i++) {
    out += ({ ({
      (date - (date->day() * i+1))->format_ymd(),
      (string) random(10000),
      (string) random(10000),
      (string) random(10000),
      (string) random(10000)
    }) });
  }

  array table = ({
    "<table class='paginate' data-paginate-rows='10'>",
    " <thead>",
    "  <tr><th>" + (headers * "</th><th>") + "</th></tr>",
    " </thead>",
    " <tbody>",
    "  <tr><td>" +
    ((out[*] * "</td><td>") * "</td></tr>\n  <tr><td>") +
    "</td></tr>",
    " </tbody>",
    "</table>"
  });

  Stdio.write_file("table.html", table*"\n");

  return 0;
}
