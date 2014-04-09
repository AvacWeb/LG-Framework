LG Framework 
===============================

A chainable JS library filled with useful functions (including events, animations, dom and more). It writes similar to jQuery since that is what mose are used to and is an easy format. 
Whats unique about it? Erm... ... er ... :P

```javascript
$lg('div.className > [href]').click(function(){ 
	$lg(this).fadeOut(); 
})
.append(' Click me to hide me!');
```


Basics
-------------
#### Initiation
Initiate with the global '$lg' variable `$lg('selector')`  
The returned object can now be manipulated using all the LG functions, and the matching elements can be access via index.   
You can supply the $lg function with a number of different things;
* A CSS Selector: `$lg('div.content')` which optionally takes a second argument of a context. This is only available if selector.js is installed.
* A single element: `$lg(document.body)`
* A node list: `$lg(document.getElementsByClassName('content'))`
* An array of nodes: `$lg([div.childNodes[0], div.childNodes[1]])`
* Window or Document: `$lg(document) $lg(window)`
* A string of HTML: `$lg('<div id="test">Test Div</div>')` - This is only available if dom.js is installed.
* A HTML tag with properties: `$lg('div', {id: 'test', className: 'content', innerHTML: 'Test Div'})` - This is only available if dom.js is installed.
* Or even a document fragment ... 


#### Selector.
The selector.js file in /src is a modified version of Avac-Selector-Engine tuned to work well with LG.   
For information visit here: [https://github.com/AvacWeb/Avac-Selector-Engine](https://github.com/AvacWeb/Avac-Selector-Engine)   
Alternatively, you can use your own or a preffered selector engine. 
  

#### DOM Readiness.
LG does have a DOM ready function similar to that of JQuery.   
`$lg(function(){ alert('DOM is ready!'); });`    
You can check if the dom is loaded already, with the `$lg.isDomLoaded()` function. 

Additionally, if you need to run all your dom ready functions again manually you can use this: `$lg.domReady.run(true)`   
Forcing them to run regardless of dom state.


Updates/ Changelog
---------
* 31/3/2014
	- Released to public.
