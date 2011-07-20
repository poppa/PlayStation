// <capture>

$(function() {
  $('div.users').typeAndAdd({
    /* Fire the @[onSearch] callback when the input contains at least
     * this number of characters.
     */
    searchMinLength: 2,

    /* Wait for x number om milliseconds before calling the @[onSearch]
     * callback function
     */
    searchDelay: 300,

    /* Allow/disallow elements already added to show up in the result popup
     */
    duplicates: false,

    /* Function being called when an added element is about to be removed.
     *
     * @param Object element
     *  This is the data object, returned from @[onSearch], associated with 
     *  the element being removed
     * @param Object obj
     *  The @[Handler] object, or the _typeAndAdd_ object of you wish,  which 
     *  is the object keeping track of added elements, the input/add link 
     *  replacement and so forth.
     * @param domElement caller
     *  The HTML element being removed
     *
     * @return mixed
     *  Returning false will prevent the element from being removed 
     */
    onRemove: function(element, obj, caller) {
      // Return false to stop this from being removed
      return confirm("Are you sure you want to remove '"+element.display+"'");
    },
    
    /* Function being called when an item in the popup is clicked, i.e.
     * being added.
     *
     * @param Object element
     *  This is the data object, returned from @[onSearch], associated with 
     *  the element being removed
     * @param Object obj
     *  The @[Handler] object, or the _typeAndAdd_ object of you wish,  which 
     *  is the object keeping track of added elements, the input/add link 
     *  replacement and so forth.
     * @param domElement caller
     *  The HTML element being removed
     *
     * @return mixed
     *  Returning false will prevent the element from being added 
     */
    onAdd: function(element, obj, caller) {
      // Return false to stop this from being added
    },
    
    /* Function being called when the requirements, @[searchMinLength] and
     * @[searchDelay], for fireing have been met.
     *
     * @param string val
     *  What is typed in the input field 
     * @param Object obj
     *  The @[Handler] object, or the _typeAndAdd_ object of you wish,  which 
     *  is the object keeping track of added elements, the input/add link 
     *  replacement and so forth.
     * @param domElement inp
     *  The actual input HTML element
     *
     * @return
     *  Should return an array obj objects where the member "display" is what
     *  whill be the actual "link text" for each element in the popup.
     *  If the member "title" is present it will be put in a title attribute
     *  of the link.
     *  Any other members are optional and will be kept in the object for 
     *  future refereces.
     *
     *  @note If an async method is called from here just return null and then
     *        call "populatePopup" on the "obj" object passed as the second
     *        argument. Like:
     *
     *        obj.populatePopup(resultArray)
     */
    onSearch: function(val, obj, inp) {
      var d = [
      	{ "username" : "ponost", "display" : "Pontus Östlund",
      	  "title" : "pontus@poppa.se" },
      	{ "username" : "serbri", "display" : "Sergei Brin",
      	  "title" : "sergei@google.com" },
      	{ "username" : "marshu", "display" : "Mark Shuttleworth",
      	  "title" : "mark@canonical.com" },
      	{ "username" : "albjoh", "display" : "Albin Johansson",
      	  "title" : "albin.johansson@tekniskaverken.se" },
      	{ "username" : "karjob", "display" : "Karin Johansson",
      	  "title" : "karin.johansson@tekniskaverken.se" },
      	{ "username" : "andjoh", "display" : "Anders Jonsson",
      	  "title" : "anders.jonsson@tekniskaverken.se" },
      	{ "username" : "johkar", "display" : "Johan Karlsson",
      	  "title" : "johan.karlsson@norrkoping.se" },
	{ "username" : "johsch", "display" : "Johan Scheele",
      	  "title" : "johan.scheele@svt.se" }
      ];

      var v   = $(inp).val(),
          ret = [],
          re  = new RegExp(v, 'i');

      for (var i in d) {
      	var e = d[i];

      	if (e.username.match(re) || e.display.match(re) || e.title.match(re))
	  ret.push(e);
      }

      return ret;
    }
  });
});

// </capture>