Other Tido Stuff
===================

DOM Ready
-----------------
Tido does have a DOM ready function similar to that of well-known JQuery.   
```$tido(function(){ alert('DOM is ready!'); });``` 

If you don't already know what this means, anything wrapped inside the function, will only execute when the DOM is fully loaded and ready to be manipulated.

Miscellaneous Functions
--------------------------
#### origin()
return to the original matched nodes. 
```javascript
$tido('#main').parent().next().inner('hello').origin().attr('id'); // 'main'
```

#### sideof()
Updates and returns the size of the current matched element set.
```javascript
var amountOfChildren = $tido('#main').children().sizeOf();
```

#### index(i)
Choose a specific matched node by index. ```$tido('a').index(1).append('link 2')```
Index is zero-based.

#### get([i])
return the node stack or a specified node by index. Index is zero-based.

#### back([steps])
Return to a previous stack of nodes. Optional parameter to specify amount of steps back. If not specified, 1 step back will be taken. 
```javascript
$tido('#main').parent().find('.test').back(2).attr('id'); //'main'
```

#### $tido.isit(item [,test])
Tests if an item is something or returns a string specifying what an item is.    
```$tido.isit([1,2], 'array') //true```
 or    
```$tido.isit([1,2]) //'array'``

No Conflict
------------------
Tido does store your original window.$tido variable, and so tido can be mapped to another name and restore your original tido var. 
```javascript
$tido.noConflict('$T');
$T('#main').get();
```

Selector Engine
-------------------
If you don't already know a "selector engine" is a function/object used for selecting and getting elements, most commonly by using CSS compliant selectors. Tido uses [Avac-Selector Engine](https://github.com/AvacWeb/Avac-Selector-Engine) but this can be changed to another if you would prefer. if you know what your doing in the core JS, go ahead, if you don't you can set another selector engine using ```$tido.customSelector(newselector)``` in one of two ways.

Map the Sizzle selector engine to be used by Tido. Sizzle must be available in the global scope at point of executing this function.
```javascript
$tido.customSelector('Sizzle');
```
Or by setting a function literal:
```javascript
$tido.customSelector(function(selector, context){
   return Sizzle(selector, context);
});

$tido.customSelector = Sizzle;
```
The custom selector engine, should accept the selector string and an optional context parameter second. This is the standard of 90% of selector engines. They must also return an array of nodes or a single node.

Adding To Tido
----------------------
The $tido function returns a new TIDO object. You can add directly to this object via `$tido.fn`.
Example:    ```$tido.fn.showMeNodes = function(){ alert( this.get() ) };``` Which will add a function called 'showMeNodes' to the TIDO prototype obviously. ```$tido('.test').showMeNodes()```    

You can also add directly to tido with simple ```$tido.boo = function(){ alert('boo!') };``` which will obviously add you a function to the $tido object. ```$tido.boo()``` 


Useful functions for using internally
-------------------------------
* __.innerUpdate()__ Recount the nodes and update the object length property and index's.
* __.performALL([array,] function)__ Perform a function on all the matching nodes. Or an array/nodeset if provided. 
* __$tido.docFrag(markup)__ Makes a document fragment of the provided markup and returns it.
* __.innerFilter(function)__ Same as .filter() but returns nothing as used internally. Updates nodes and length afterwards.
* __.innerByNodeType(elem, type)__ Returns an array of nodes matching the nodetype in a single element.
* __.getTrueElem(elem, relation [,direction])__ Ensures only element nodes. Can get a related node of another, but gets the nearest of nodetype 1. This should be used for traversing the DOM as it ensures more support. 
* __.getTrueFirst(elem)__ Get the first element node of an element. Uses above function as getTrueElem(elem, 'firstChild', 'nextSibling')
* __.getTrueLast(elem)__ Same as above but lastchild.
* For next and prev, you can do getTrueElem(elem, 'nextSibling') and getTrueElem(elem, 'previousSibling');
* __.toAll(function)__ Perform a function to all. Same as .each()
* __$tido.isit__ See Miscellanouse functions above.
* __$tido.Slice(object)__ multi browser slice for nodelist objects. 
* __$tido.haveFunction(name)__ check if a tido function is available to use.
* __$tido._nodeData(node, name [,value])__ Store data about a node. Omit a value to return the data.

