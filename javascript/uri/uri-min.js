var URI=function(uri)
{var scheme=null;var host=null;var username=null;var password=null;var port=null;var path=null;var query=null;var fragment=null;var variables={};var ports={ftp:21,ssh:22,telnet:23,smtp:25,http:80,https:443};var enc=encodeURIComponent;var dec=decodeURIComponent;var re=new RegExp("(?:([-+a-z0-9]+)://"+"((.[^:]*):?(.*)?@)?"+"(.[^:/]*)"+":?([0-9]{1,6})?)?"+"([/.].[^?#]*)?"+"([?](.[^#]*))?"+"#?(.*)?","i");var parse=function(theUri)
{uri=theUri;var m;if(uri&&(m=re.exec(uri))){scheme=m[1]&&m[1].toLowerCase();username=m[3];password=m[4];host=m[5]&&m[5].toLowerCase();port=m[6]&&parseInt(m[6],10);path=m[7];query=m[9];fragment=m[10];if(!port&&scheme)
port=ports[scheme];if(query&&query.length){var q=query.split('&');for(var i=0;i<q.length;i++){var p=q[i].split('=');variables[dec(p[0])]=p.length>1?dec(p[1]):null;}}}};var isDefaultPort=function()
{if(!pub.port)return true;for(var schema in ports){if(schema==pub.scheme&&pub.port!=ports[pub.scheme])
return false;}
return true;};parse(uri);var pub;return pub={scheme:scheme,host:host,username:username,password:password,port:port,path:path,fragment:fragment,variables:variables,parse:function(uri)
{parse(uri);this.scheme=scheme;this.host=host;this.username=username;this.password=password;this.port=port;this.path=path;this.fragment=fragment;this.variables=variables;},queryString:function()
{var tmp=[];for(var name in this.variables){var t;if(this.variables[name]!=null)
t=enc(name)+'='+enc(this.variables[name]);else
t=enc(name);tmp.push(t);}
return tmp.length&&tmp.join('&')||null;},toString:function()
{var s="",q=null;if(this.scheme)s=this.scheme+"://";if(this.username)s+=this.username;if(this.username&&this.password)s+=":";if(this.password)s+=this.password;if(this.username)s+="@";if(this.host)s+=this.host;if(!isDefaultPort())s+=":"+this.port;if(this.path)s+=this.path;if(q=this.queryString())s+="?"+q;if(this.fragment)s+="#"+this.fragment;return s;}}};