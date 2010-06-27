var SVG=function(svgNode,parent)
{var svg=svgNode;var workingNode=svg;function ce(n,attr)
{var n=svg.ownerDocument.createElementNS(SVG.NS,n);if(attr){attr=unCamelCase(attr);for(var name in attr)
addAttribute(n,name,attr[name]);}
return n;}
function addAttribute(node,name,value)
{if(name.indexOf(':')>-1){var localname=name.substring(0,name.indexOf(':'));var nsuri=SVG.namespaces[localname];if(!nsuri)throw"No namespace exists for "+name;var a=svg.ownerDocument.createAttributeNS(nsuri,name);a.nodeValue=value;node.setAttributeNodeNS(a);}
else node.setAttribute(name,value);}
function serialize(node)
{if(XMLSerializer!='undefined')
return new XMLSerializer().serializeToString(node);else if(node.xml)
return node.xml;throw"XML serialization not supported by browser!";}
function unCamelCase(obj)
{var o={};for(var name in obj){var n='';if(name[0]=='#'){var val=obj[name];name=name.substring(1);o[name]=val;continue;}
for(var i=0;i<name.length;i++){var c=name.charCodeAt(i);if(c>96||c<58)
n+=name[i];else if(c>57&&c<97){if(i>0&&c!=58)n+='-';n+=name[i].toLowerCase();}
else throw('Unhandled char: '+n[i]);}
o[n]=obj[name];}
return o;}
function add(node)
{if(node.type&&node.type=='SVG')
node=node.getDocument();return workingNode.appendChild(node);}
function isInt(val)
{return val.match(/^-?[0-9]+$/)&&true||false;}
function isFloat(val)
{return val.match(/^-?[0-9]+(\.[0-9]+)?$/)&&true||false;}
function autoCast(val)
{if(isInt(val))
return parseInt(val,10);else if(isFloat(val))
return parseFloat(val,10);return val;}
return{type:'SVG',parent:function()
{return parent;},addNamespace:function(nsURI,name)
{var n=svg.ownerDocument.createAttribute(name);n.nodeValue=nsURI;svg.setAttributeNodeNS(n);var localname=name.substring(name.indexOf(':')+1);SVG.namespaces[localname]=nsURI;},useXLink:function()
{this.addNamespace(SVG.XLINK_NS,'xmlns:xlink');},toString:function()
{return serialize(svg);},toPrettyString:function(tabsize)
{if(!document.createTreeWalker)
return this.toString();return new XMLIndenter(svg).indent(tabsize);},toHighlightedString:function(tabsize)
{if(!document.createTreeWalker)
return this.toString();return new XMLIndenter(svg).highlight(tabsize);},getDocument:function()
{return svg;},appendChild:function(n)
{return new SVG(add(n),this);},setWorkingNode:function(node)
{if(!node)
workingNode=svg;else
workingNode=node;},clone:function()
{var n=svg.cloneNode(true);n=svg.parentNode.appendChild(n);return new SVG(n,parent);},setAttribute:function(name,value)
{if(typeof name=='object'){var attr=unCamelCase(name);for(var key in attr)
addAttribute(workingNode,key,attr[key]);}
else
addAttribute(workingNode,name,value);return this;},getAttribute:function(name)
{if(!name){var o={};for(var i=0;i<svg.attributes.length;i++){var a=svg.attributes.item(i);o[a.name]=autoCast(a.value);}
return o;}
return autoCast(svg.getAttribute(name));},text:function(text,x,y,attr)
{if(!attr)attr={};attr.x=x;attr.y=y;var n=ce('text',attr);if(text){var t=svg.ownerDocument.createTextNode(text);n.appendChild(t);}
add(n);return new SVG(n,this);},tspan:function(text,attr)
{var n=ce('tspan',attr);var t=svg.ownerDocument.createTextNode(text);n.appendChild(t);return new SVG(add(n),this);},tref:function(attr)
{return new SVG(add(ce('tref',attr)));},textpath:function(text,path,attr)
{if(!attr)attr={};attr['xlink:href']=path;var n=ce('textpath',attr);var t=svg.ownerDocument.createTextNode(text);n.appendChild(t);return new SVG(add(n),this);},image:function(src,attr)
{if(!attr)attr={};attr['xlink:href']=src;return new SVG(add(ce('image',attr)),this);},node:function(name,attr)
{return new SVG(add(ce(name,attr)),this);},defs:function(attr)
{return new SVG(add(ce('defs',attr)),this);},svg:function(attr)
{return new SVG(add(ce('svg',attr)),this);},g:function(attr)
{return new SVG(add(ce('g',attr)),this);},rect:function(x,y,width,height,attr)
{if(!attr)attr={};attr.x=x;attr.y=y;attr.width=width;attr.height=height;return new SVG(add(ce('rect',attr)),this);},a:function(href,contents,attr)
{if(!attr)attr={};attr['xlink:href']=href;var n=ce('a',attr);n.appendChild(contents.getDocument());add(n);return new SVG(n,this);},circle:function(x,y,r,attr)
{if(!attr)attr={};attr.cx=x;attr.cy=y;attr.r=r;return new SVG(add(ce('circle',attr)),this);},ellipse:function(x,y,rx,ry,attr)
{if(!attr)attr={};attr.cx=x;attr.cy=y;attr.rx=rx;attr.ry=ry;return new SVG(add(ce('ellipse',attr)),this);},polyline:function(points,attr)
{if(!attr)attr={};attr.points=points;return new SVG(add(ce('polyline',attr)),this);},polygon:function(points,attr)
{if(!attr)attr={};attr.points=points;return new SVG(add(ce('polygon',attr)),this);},line:function(x1,y1,x2,y2,width,attr)
{if(!attr)attr={};attr.x1=x1;attr.y1=y1;attr.x2=x2;attr.y2=y2;attr.strokeWidth=width;if(!attr.stroke)attr.stroke='#000';return new SVG(add(ce('line',attr)),this);},path:function(lines,attr)
{if(!attr)attr={};attr.d=lines;if(!attr.fill)attr.fill='none';return new SVG(add(ce('path',attr)),this);}};};SVG.NS='http://www.w3.org/2000/svg';SVG.XHTML_NS='http://www.w3.org/1999/xhtml';SVG.XLINK_NS='http://www.w3.org/1999/xlink';SVG.namespaces={};SVG.createDocument=function(width,height,id)
{var e=document.createElementNS(SVG.NS,'svg');e.setAttribute('width',width);e.setAttribute('height',height);if(id)e.setAttribute('id',id);return new SVG(e);};var XMLIndenter=function(node)
{var walker=document.createTreeWalker(node,NodeFilter.SHOW_ALL,null,false);var buf='';var level=0;var tabwidth=2;var pad=function()
{return new Array((level*tabwidth)+1).join(' ');};var attrToString=function(attr)
{if(!attr)return null;var a=[];for(var i=0;i<attr.length;i++){var item=attr.item(i);a.push(item.name+'="'+item.value+'"');}
if(!a.length)return null;return' '+a.join(' ');};var attrToClrString=function(attr)
{if(!attr)return null;var a=[];for(var i=0;i<attr.length;i++){var item=attr.item(i);a.push(span('attr')+item.name+span()+'='+
span('literal')+'"'+item.value+'"'+span());}
if(!a.length)return null;return' '+a.join(' ');};var span=function(cls)
{if(!cls)return'</span>';return'<span class="'+cls+'">';};var walk=function(node)
{if(node.nodeType==1){buf+=(pad()+'<'+node.tagName);var attr=attrToString(node.attributes);if(attr)buf+=attr;if(node.childNodes.length>0){buf+=">\n";level++;for(var i=0;i<node.childNodes.length;i++)
walk(node.childNodes[i]);level--;buf+=(pad()+'</'+node.tagName+">\n");}
else buf+="/>\n";}
else
buf+=pad()+node.nodeValue+"\n";};var highlight=function(node)
{if(node.nodeType==1){buf+=(pad()+span('node')+'&lt;'+node.tagName+span());var attr=attrToClrString(node.attributes);if(attr)buf+=attr;if(node.childNodes.length>0){buf+=span('node')+"&gt;"+span()+"\n";level++;for(var i=0;i<node.childNodes.length;i++)
highlight(node.childNodes[i]);level--;buf+=(pad()+span('node')+'&lt;/'+node.tagName+"&gt;"+
span()+"\n");}
else buf+=(span('node')+"/&gt;"+span()+"\n");}
else
buf+=pad()+node.nodeValue+"\n";}
return{indent:function(tabsize)
{tabwidth=tabsize||tabwidth;walk(walker.currentNode);return buf;},highlight:function(tabsize)
{tabwidth=tabsize||tabwidth;highlight(walker.currentNode);return buf;}};};