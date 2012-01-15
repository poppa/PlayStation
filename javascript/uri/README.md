JavaScript URI class
====================

This is a JavaScript class for creating and manipulating URI: s. This script
handles both absolute and realtive URI: s.

The object has the following fields:

  * `fragment` (i.e. #anchor)
  * `host` (i.e. www.domain.com)
  * `password` (i.e. password part in userinfo: http://user:*password*@domain.com)
  * `path` (i.e. /some/path/index.php)
  * `port` (i.e domain.com:*8080*)
  * `query` (i.e. ?some=query&string=stuff)
  * `scheme` (i.e http, https, ftp and so on)
  * `username` (i.e user name part in userinfo: http://*user*:password@domain.com)
  * `variables` (the query string as an object)
  
and the following methods:

  * `parse(string uri)` Use this to reparse/reset an URI. This is called 
     automatically upon instantiation.
  * `queryString()` Returns the `uri.variables` as a query string
  * `queryToObject(string querystring)` Turns a querystring into an object
  * `toString()` Turns the object into a string URI.

Some examples
-------------

    var uri = new URI('http://domain.com/?fname=john&lname=doe#anchor');
    console.log(uri);
    
    > scheme:   "http"
    > host:     "domain.com"
    > port:     80
    > path:     "/"
    > query:    "fname=john&lname=doe"
    > variables { "fname" : "john", "lname" : "doe" }
    
    uri.fragment = null;
    uri.variables.lname = null;
    uri.variables.lang = 'en';
    uri.scheme = 'https';
    
    console.log(uri.toString());
    
    > https://domain.com/?fname=john&fname=john&lang=en

You can also work on relative URI: s

    var uri = new URI('index.php?id=12&type=order');
    uri.format = 'json';
    
    > index.php?id=12&type=order&format=json

And that's about that!
