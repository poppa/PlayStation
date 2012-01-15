var URI=function(uri)
{var my=this;this.scheme=null;this.host=null;this.username=null;this.password=null;this.port=null;this.path=null;this.query=null;this.fragment=null;this.variables={};var ports={ftp:21,ssh:22,telnet:23,smtp:25,http:80,https:443};var enc=encodeURIComponent;var dec=decodeURIComponent;this.queryToObject=function(q)
{if(!q||!q.length)return null;var res={};if(q[0]=='?')q=q.substring(1);var p=q.split('&');for(var i=0;i<p.length;i++){var x=p[i].split('=');if(x.length==1){res[dec(x[0])]='';continue;}
var k=dec(x[0]);var v=dec(x[1]);if(res[k]){if(typeof res[k]=='string')
res[k]=[res[k]];res[k].push(v);}
else{res[k]=v;}}
return res;};this.parse=function(uri)
{var pos=0,u=uri;if((pos=u.indexOf('://'))>-1){this.scheme=u.substring(0,pos);u=u.substring(pos+3);}
if((pos=u.indexOf('#'))>-1){this.fragment=u.substring(pos+1);u=u.substring(0,pos);}
if((pos=u.indexOf('?'))>-1){this.query=u.substring(pos+1);u=u.substring(0,pos);}
if((pos=u.indexOf('/'))>-1){this.path=u.substring(pos);u=u.substring(0,pos);}
else if(!this.scheme){this.path=u;u=null;}
this.variables=this.queryToObject(this.query);if(!u||u.length==0)
return;if((pos=u.indexOf('@'))>-1){var t=u.substring(0,pos);if(t.indexOf(':')>-1){var tt=t.split(':');this.username=tt[0];this.password=tt[1];}
else
this.username=t;u=u.substring(pos+1);}
if((pos=u.indexOf(':'))>-1){this.port=parseInt(u.substring(pos+1),10);u=u.substring(0,pos);}
if(!this.port&&this.scheme)
this.port=ports[this.scheme];this.host=u;};this.queryString=function()
{var tmp=[];for(var name in this.variables){var t,val;if((val=this.variables[name])!==null){if(typeof val!=='string'){var tt=[];for(var i=0;i<val.length;i++){var v=val[i];if(v!==null){var x=enc(name);if(v.length>0)
x+='='+enc(v);tt.push(x);}}
t=tt.join('&');}
else{t=enc(name);if(val.length>0)
t+='='+enc(val);}}
if(t&&t.length)
tmp.push(t);}
return tmp.length&&tmp.join('&')||null;}
this.toString=function()
{var s="",q=null;if(this.scheme)s=this.scheme+"://";if(this.username)s+=this.username;if(this.username&&this.password)s+=":";if(this.password)s+=this.password;if(this.username)s+="@";if(this.host)s+=this.host;if(!isDefaultPort())s+=":"+this.port;if(this.path)s+=this.path;if(q=this.queryString())s+="?"+q;if(this.fragment)s+="#"+this.fragment;return s;}
var isDefaultPort=function()
{if(!my.port)return true;for(var schema in ports){if(schema==my.scheme&&my.port!=ports[my.scheme])
return false;}
return true;};if(uri&&uri.length>0)
this.parse(uri);};