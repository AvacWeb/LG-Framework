LG Core
===================
The core.js file is required for LG to work. 

Here's a list of functions for use within the LG core.js

Functions accessible directly through the $lg variable
----------------------------
These functions don't require initiation, they can be used directly from the $lg variable.

#### $lg.array_index(haystack, needle)
Return the index of an item in an array or -1 if not present.

#### $lg.in_array(haystack, needle)
Return boolean value whether needle is found within the haystack (array).

#### $lg.is_element(item),is_document is_function is_array is_object is_string is_number is_regexp
Simple boolean check if the item provided is of a certain type. This is a more in depth typeof. 

#### $lg.selection()
Returns a string, with the text of the current mouse selection. 

#### $lg.cookie(name [, value] [, permanent])
Simple get or set cookie function.    
`$lg.cookie('cookiename', 'value of cookie')`
`$lg.cookie('cookiename'); //"value of cookie" `

#### $lg.isDomLoaded()
Returns boolean value whether or not dom has loaded.


Prototype functions for LG object
--------------------------
These functions are used on your LG object containing the nodes.

#### .all(function)
Perform the provided function on all the nodes. 
The callback function receives the element, the index and the array as parameters.
```javascript
$lg('div').all(function(elem, index) {
	elem.innerHTML += 'I am div number ' + index;
});
```

#### .index(number)
Choose to narrow your nodes down to the element at the index. `$lg('div').index(1)` - second div.

#### .get(string|index)
Return the native dom element object. 
`$lg('div').get(1)` - returns the 2nd div element
`$lg('div').get('last')` - returns the last div element.
`$lg('div').get()` - returns a native array of div elements.

#### .add(nodes)
Add the item into the current nodeset. The provided nodes can be in any form that LG will accept in initiation.
```javascript
var x = $lg('div').add('span'); //all div and span elements
$lg('p').add(x); // all p and div and span elements
$lg('p').add(x[0]); //all p elements and first div.
etc...
```
However providing a selector is only available if selector.js is included within installation of LG.

#### .lose(index|selector)
This is the opposite .add and allows your to remove elements from your nodeset.  
You can provide an index and the element at that index will be removed from your set.
Additionally, if you have dom.js and selector.js installed, you can provide a selector and any elements matching the selector will be removed from your set.   
`$lg('div').lose('.content')` - all divs except those with the classname of 'content'

#### .filter(function|selector)
This will filter your node set, the callback function provided should return boolean value whether or not to keep the element within the set or not.
Additionally if you have selector.js installed you can provide a selector and only elements matching the selector will be kept.

#### .data(key [, value])
Store data on the matched node set. Provide both a key and value to set, and only the key to get.

