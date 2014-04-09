LG Attribute, Properties & Classname Functions 
===================
LG contains a few functions which makes dealing with attributes easier to deal with.

All the following functions are part of the LG prototype and should be used on your LG object on your node set.

#### prop(name [, value])
Get or set a property of the node set. 
When used to get a property, the value of the first node is returned.
When used to set a property, the value is set on all nodes.
If there is no existing property in the element node then prop will try to find it using attr.

```html
<img src="/url" my-attr="my value">
<script>
$lg('img').prop('src'); // '/url'  an img element has a src property.
$lg('img').prop('my-attr'); // 'my value'  the property my-attr doesn't exist but it is found as an attribute.
``` 

The prop function can be used for setting the style property of an element.
The prop function will return an array of selected vlues on select elements with multiple choice.
You can set multiple properties by using an object with name value pairs.

There are shortcut functions for these common properties: _src href title id type name value_
With no parameters they will get the value, or you provide a value to set.

```javascript
$lg('img').src(); // '/url'
$lg('img').title('My title');
``` 

#### attr(attribute [,value])
Get or set an attribute of the node set.
When used to get an attribure, the value of the first node is returned.
When used to set an attribute, the value is set on all nodes.

```html
<div name="hello"></div>
<script>
$lg('[name="hello"]').attr('name');
// => 'hello'
</script>
```      

#### removeAttr(attrbute)  
Removes an attribute from all the matching elements.   

#### addClass(classname)  
Adds a className to all the matched elements.   

#### removeClass(classname)  
Removes the specified classname from all elements.   
If no classname is specified all classnames will be removed from each element in the node set.


