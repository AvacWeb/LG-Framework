Tido JS Library - Simple, Small and Easy to use. 
===============================

A chainable JS library filled with useful functions (including events, animations, dom and more). Whats unique about it? Erm... ... er ... :P

```javascript
$tido('div.className > [href]').click(function(){ $tido(this).hide(); }).append(' Click me to hide me!');
```

Documentation and Functions
-------------------------
* [DOM - Basic DOM manipulation and traversing](https://github.com/AvacWeb/Tido/blob/master/Docs/dom.md)
* [Attributes and Class - manipulating attributes and classNames](https://github.com/AvacWeb/Tido/blob/master/Docs/attr.md)
* [CSS - manipulating elements styles](https://github.com/AvacWeb/Tido/blob/master/Docs/css.md)
* [Event - Event handling functions](https://github.com/AvacWeb/Tido/blob/master/Docs/event.md)
* [Ajax - Basic AJAX functions](https://github.com/AvacWeb/Tido/blob/master/Docs/ajax.md)
* Animation - An animation handler.    __DOCS still to come.__
* [Other - Other notes and things to know about Tido](https://github.com/AvacWeb/Tido/blob/master/Docs/other.md)

Basics
-------------
#### Selecting Elements. 
For information regarding using the selector engine that Tido uses visit here:   
[https://github.com/AvacWeb/Avac-Selector-Engine](https://github.com/AvacWeb/Avac-Selector-Engine)
Alternatively, you can use your own or a preffered selector engine. Read 'Other' documentation.
  

#### Using Tido.  
Tido is accessed and used like most others. You first initiate the object and supply your css selector or nodes. `$tido('div.content')`   
After this you can access and perform all the methods of tido. The methods of Tido will be performed on all elements matching the selector obviously. You can access the elements directly via index `$tido('div')[1]`, and also access the length property. 

#### DOM Readiness.
Tido does have a DOM ready function similar to that of JQuery.   
```$tido(function(){ alert('DOM is ready!'); });```   



