LG CSS
===================
The LG CSS module makes managing the style of elements easier and quicker. You can get computed styles and set multiple style properties at once.

#### css(property [,value])
Sets or returns css style properties.   
If a value parameter is specified, the property is set on all matched elements. 
If no value is given, the property value of the first matched element is returned.   
The first parameter can also be an object literal with property:value pairs. 

```javascript
$lg('.item').css('color', '#f00');
$lg('#item').css('background-color');
$lg('#item').css({   
 'padding' : '5px',
 'z-index' : '999'
});
```   

There are shortcut functions for these properties: _display position minHeight minWidth maxHeight maxWidth visibility_
`$lg('#item').display('block')`

#### hide()
Hides all the matched elements by setting a display property of 'none'. 
Any hidden elements prior to calling .hide() will stay hidden.        

#### show() 
Shows all the hidden matched elements by setting their default display state.

#### toggle()  
Toggles the display of all matched elements.
Aka shows the hidden ones and hides the visible ones.     


#### center([fix] [, axis])    
Centers matched elements in the middle of the page or by axis. 

If an elements position property is not 'fixed' or 'absolute' it will be set at 'absolute' to allow centering.   
Set the fix parameter to true or 1 to position elements 'fixed'. 

Specifying no axis centers elements horizontally and vertically (centered on the screen). 
Specifying axis as 'x' or 'left' centers elements on the x axis (so equadistant from left and right sides)
Specifying 'y' or 'top' centers it on the y axis (equadistant from top and bottom).   

```javascript
$lg('#login_button').click(function(){
    $lg('#login_form').load('/login', 'form', function() {
        $lg('#login_form').show().center();
    });
});
```    
This script would set an event listener on to a log in button, and on click would load a form into an element, then display that element in the center of the screen.   

#### width([width])  
Returns the width of the first element. Or sets the width for all.

#### height([height])   
Returns the height of the first element. Or sets the height for all.



