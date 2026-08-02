function ValidateEmail(sEmail)
{ 
var reEmail=/^(.+)@(.+)$/; 
var reQuotedString="(\"[^\"]*\")";
var reIPDomain=/^\[(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})\]$/;
var reValidCharString="\[^\\s\\(\\)><@,;:\\\\\\\"\\.\\[\\]\]+";
var reGetString="(" + reValidCharString + "|" + reQuotedString + ")";
var reUserName=new RegExp("^" + reGetString + "(\\." + reGetString + ")*$");
var reDomain=new RegExp("^" + reValidCharString + "(\\." + reValidCharString +")*$");
var reWholeCharString=new RegExp("^" + reValidCharString + "$");

var matchArray=sEmail.match(reEmail);
if (matchArray==null) return false; 
var sUsername=matchArray[1];
var sDomain=matchArray[2];

for (i=0; i<sUsername.length; i++) {
    if (sUsername.charCodeAt(i)>127) return false; 
} 
if (sUsername.match(reUserName)==null) return false;

for (i=0; i<sDomain.length; i++) {
    if (sDomain.charCodeAt(i)>127) return false;
} 

var arrIPNums=sDomain.match(reIPDomain);
if (arrIPNums!=null)
{
    for (var i=1;i<=4;i++) { 
        if (arrIPNums>255) return false; 
    }    
} 
else
{
    var arrDomains=sDomain.split(".");
    var iDomainLen=arrDomains.length;
    if (iDomainLen<2) return false; 
    for (i=0;i<iDomainLen;i++) { 
        if (arrDomains[i].search(reWholeCharString)==-1) return false; 
    } 
}
return true;
} 

function ltrim(str, chars) {
    chars = chars || "\\s";
    return str.replace(new RegExp("^[" + chars + "]+", "g"), "");
}
 
function rtrim(str, chars) {
    chars = chars || "\\s";
    return str.replace(new RegExp("[" + chars + "]+$", "g"), "");
}
