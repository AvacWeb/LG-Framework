LG DOM Functions
===================
LG dom.js module provides many functions for manipulating the pages DOM easily. 
This module works well with the selector.js module and some functions have extra functionality when selector.js is installed.


Functions accessible directly through the $lg variable
----------------------------
These functions don't require initiation, they can be used directly from the $lg variable.

#### $lg.elem(tag, properties)
Create a dom element with the specified properties. 
If props.js is installed the prop function will be used and therefore has all the functionality of prop. 
If not then the provided properties are set as-is to the newly created element.
The native element object is returned.

```javascript
$lg.elem('div', {
	innerHTML : 'New element',
	id : 'mydiv',
	title : 'My new div'
});
``` 

#### $lg.frag(item)
Create a documentFragment of all the elements provided.
The provided item can be a string of HTML, a dom element, a nodelist, an array of nodes or an LG object.
`$lg.frag('<div id="test">Test Div</div><span class="tester">Test Span</span>');`


Prototype functions for LG object
--------------------------
These functions are used on your LG object containing the nodes.

#### inner([markup])
Returns or set the innerHTML of all matching elements. 
If event.js is installed all event listeners are removed from any existing child elements to avoid memory leaks.
`$lg('.test').inner('This is a test');`

There is a .html() function as an alias of inner.

#### children()  
Gets all the children of all elements in the nodeset. 

`$lg('#main').children().inner('I\'m a child of #main');`

If selector.js module is installed a selector can be provided to filter the children. 
Aka: `$lg('#main').children('div')` gets all the children of #main which are div elements.

#### last()   
Gets the lastChild element of all the elements of the nodeset.
`$lg('.parent').last().inner("I'm the last child of .parent");`

#### first()
Gets the firstChild element of all the elements of the nodeset.

#### parent()  
Gets the parentNode of all the elements of the nodeset.

#### next()
Gets the nextSibling element of all the elements in the nodeset.

#### previous()   
Gets the previousSibling of all elements.

#### append(item)  
Appends the provided item to the elements in the nodeset.
The item can be a string of HTML, an array of elements, a single element or an LG object.
`$lg('.test').append('<span>testing</span>').append(document.getElementById('testid'));`

#### prepend(item)
Same as append but prepends obviously.

#### before(item)    
Adds markup or a node before all the elements in the nodeset.

#### after(item)   
Adds markup or a node after all elements. Same as before but after.

#### remove()
Removes all matching elements from the DOM. After using this your LG object will be empty.  
If the event.js module is installed event listeners will be removed.

#### move(action, target)
Move the nodeset to before, after, at the end of or beginning of the target element. 
Example: `$lg('#elem').move('after', '#elem2');` would move #elem after #elem2
The action can be 'after', 'before', 'prepend', 'append' or 'replace'. 

#### prependTo(target)
Prepends the nodeset to the target element. 
This is the same as `.move('prepend', target)` or `$lg(target).prepend( nodeSet )`

#### appendTo(target)
Appends the nodeset to the target element.
Same as prependTo but appends.

#### empty()
Remove the children of all the elements in the nodeset. 
If event.js module is installed, event listeners will be removed from the children.

#### replace(item)
Replaces all the nodeset elements with the provided item. 
The item parameter can be the same as what after/before functions would accept.

#### text()
Returns the text content of all matching elements as 1 string.

#### offsets([property])
Returns the offset values of the first element in the nodeset as an object containing 'left', 'top', 'width' and 'height' properties.
Optional second paramter can be a string of either 'left', 'top', 'width' or 'height' to return a specific offset value.

