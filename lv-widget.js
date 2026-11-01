/* lv-widget.js — 자동 생성 파일 (원본: src/lv-widget.src.js, 만들기: node tools/build.mjs)
   QR 부분: qrcode-generator (c) 2009 Kazuhiko Arase, MIT License */
/* ── 라이브 참여 결과 위젯 + 공용 연결 코드 ─────────────────────────
   덱 장표:  <div class="lv-box" data-room="w1" data-q="agi"></div>
             <div class="lv-box" data-room="w1" data-q="live"></div>
             <div class="lv-box" data-room="w1" data-q="qa"></div>
   학생 페이지 · 관리 페이지도 이 파일의 window.LV 를 같이 쓴다.
   외부 파일 없이 동작 (QR 생성기 포함). 이름은 전부 lv- / LV. */
(function () {
  'use strict';
  if (window.LV && window.LV.version) return;

  var CFG = Object.assign({
    url: "https://gxyckkinlygeasruapmj.supabase.co",
    key: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd4eWNra2lubHlnZWFzcnVhcG1qIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTAxMzcwNzQsImV4cCI6MjEwNTcxMzA3NH0.8YYHtKltWy4cER_YLM5Wbn5lol1-ExvVo8iMt2QWRR0",
    site: "https://ceaser501.github.io/lecture-survey/"
  }, window.LV_CONFIG || {});

  /* ───────── QR 생성기 (qrcode-generator, MIT, Kazuhiko Arase) ───────── */
  var qrcode = (function(){var window={};var qrcode=function(){var t=function(t,r){var e=t,n=g[r],o=null,i=0,a=null,u=[],f={},c=function(t,r){o=function(t){for(var r=new Array(t),e=0;e<t;e+=1){r[e]=new Array(t);for(var n=0;n<t;n+=1)r[e][n]=null}return r}(i=4*e+17),l(0,0),l(i-7,0),l(0,i-7),s(),h(),d(t,r),e>=7&&v(t),null==a&&(a=p(e,n,u)),w(a,r)},l=function(t,r){for(var e=-1;e<=7;e+=1)if(!(t+e<=-1||i<=t+e))for(var n=-1;n<=7;n+=1)r+n<=-1||i<=r+n||(o[t+e][r+n]=0<=e&&e<=6&&(0==n||6==n)||0<=n&&n<=6&&(0==e||6==e)||2<=e&&e<=4&&2<=n&&n<=4)},h=function(){for(var t=8;t<i-8;t+=1)null==o[t][6]&&(o[t][6]=t%2==0);for(var r=8;r<i-8;r+=1)null==o[6][r]&&(o[6][r]=r%2==0)},s=function(){for(var t=B.getPatternPosition(e),r=0;r<t.length;r+=1)for(var n=0;n<t.length;n+=1){var i=t[r],a=t[n];if(null==o[i][a])for(var u=-2;u<=2;u+=1)for(var f=-2;f<=2;f+=1)o[i+u][a+f]=-2==u||2==u||-2==f||2==f||0==u&&0==f}},v=function(t){for(var r=B.getBCHTypeNumber(e),n=0;n<18;n+=1){var a=!t&&1==(r>>n&1);o[Math.floor(n/3)][n%3+i-8-3]=a}for(n=0;n<18;n+=1){a=!t&&1==(r>>n&1);o[n%3+i-8-3][Math.floor(n/3)]=a}},d=function(t,r){for(var e=n<<3|r,a=B.getBCHTypeInfo(e),u=0;u<15;u+=1){var f=!t&&1==(a>>u&1);u<6?o[u][8]=f:u<8?o[u+1][8]=f:o[i-15+u][8]=f}for(u=0;u<15;u+=1){f=!t&&1==(a>>u&1);u<8?o[8][i-u-1]=f:u<9?o[8][15-u-1+1]=f:o[8][15-u-1]=f}o[i-8][8]=!t},w=function(t,r){for(var e=-1,n=i-1,a=7,u=0,f=B.getMaskFunction(r),c=i-1;c>0;c-=2)for(6==c&&(c-=1);;){for(var g=0;g<2;g+=1)if(null==o[n][c-g]){var l=!1;u<t.length&&(l=1==(t[u]>>>a&1)),f(n,c-g)&&(l=!l),o[n][c-g]=l,-1==(a-=1)&&(u+=1,a=7)}if((n+=e)<0||i<=n){n-=e,e=-e;break}}},p=function(t,r,e){for(var n=A.getRSBlocks(t,r),o=b(),i=0;i<e.length;i+=1){var a=e[i];o.put(a.getMode(),4),o.put(a.getLength(),B.getLengthInBits(a.getMode(),t)),a.write(o)}var u=0;for(i=0;i<n.length;i+=1)u+=n[i].dataCount;if(o.getLengthInBits()>8*u)throw"code length overflow. ("+o.getLengthInBits()+">"+8*u+")";for(o.getLengthInBits()+4<=8*u&&o.put(0,4);o.getLengthInBits()%8!=0;)o.putBit(!1);for(;!(o.getLengthInBits()>=8*u||(o.put(236,8),o.getLengthInBits()>=8*u));)o.put(17,8);return function(t,r){for(var e=0,n=0,o=0,i=new Array(r.length),a=new Array(r.length),u=0;u<r.length;u+=1){var f=r[u].dataCount,c=r[u].totalCount-f;n=Math.max(n,f),o=Math.max(o,c),i[u]=new Array(f);for(var g=0;g<i[u].length;g+=1)i[u][g]=255&t.getBuffer()[g+e];e+=f;var l=B.getErrorCorrectPolynomial(c),h=k(i[u],l.getLength()-1).mod(l);for(a[u]=new Array(l.getLength()-1),g=0;g<a[u].length;g+=1){var s=g+h.getLength()-a[u].length;a[u][g]=s>=0?h.getAt(s):0}}var v=0;for(g=0;g<r.length;g+=1)v+=r[g].totalCount;var d=new Array(v),w=0;for(g=0;g<n;g+=1)for(u=0;u<r.length;u+=1)g<i[u].length&&(d[w]=i[u][g],w+=1);for(g=0;g<o;g+=1)for(u=0;u<r.length;u+=1)g<a[u].length&&(d[w]=a[u][g],w+=1);return d}(o,n)};f.addData=function(t,r){var e=null;switch(r=r||"Byte"){case"Numeric":e=M(t);break;case"Alphanumeric":e=x(t);break;case"Byte":e=m(t);break;case"Kanji":e=L(t);break;default:throw"mode:"+r}u.push(e),a=null},f.isDark=function(t,r){if(t<0||i<=t||r<0||i<=r)throw t+","+r;return o[t][r]},f.getModuleCount=function(){return i},f.make=function(){if(e<1){for(var t=1;t<40;t++){for(var r=A.getRSBlocks(t,n),o=b(),i=0;i<u.length;i++){var a=u[i];o.put(a.getMode(),4),o.put(a.getLength(),B.getLengthInBits(a.getMode(),t)),a.write(o)}var g=0;for(i=0;i<r.length;i++)g+=r[i].dataCount;if(o.getLengthInBits()<=8*g)break}e=t}c(!1,function(){for(var t=0,r=0,e=0;e<8;e+=1){c(!0,e);var n=B.getLostPoint(f);(0==e||t>n)&&(t=n,r=e)}return r}())},f.createTableTag=function(t,r){t=t||2;var e="";e+='<table style="',e+=" border-width: 0px; border-style: none;",e+=" border-collapse: collapse;",e+=" padding: 0px; margin: "+(r=void 0===r?4*t:r)+"px;",e+='">',e+="<tbody>";for(var n=0;n<f.getModuleCount();n+=1){e+="<tr>";for(var o=0;o<f.getModuleCount();o+=1)e+='<td style="',e+=" border-width: 0px; border-style: none;",e+=" border-collapse: collapse;",e+=" padding: 0px; margin: 0px;",e+=" width: "+t+"px;",e+=" height: "+t+"px;",e+=" background-color: ",e+=f.isDark(n,o)?"#000000":"#ffffff",e+=";",e+='"/>';e+="</tr>"}return e+="</tbody>",e+="</table>"},f.createSvgTag=function(t,r,e,n){var o={};"object"==typeof arguments[0]&&(t=(o=arguments[0]).cellSize,r=o.margin,e=o.alt,n=o.title),t=t||2,r=void 0===r?4*t:r,(e="string"==typeof e?{text:e}:e||{}).text=e.text||null,e.id=e.text?e.id||"qrcode-description":null,(n="string"==typeof n?{text:n}:n||{}).text=n.text||null,n.id=n.text?n.id||"qrcode-title":null;var i,a,u,c,g=f.getModuleCount()*t+2*r,l="";for(c="l"+t+",0 0,"+t+" -"+t+",0 0,-"+t+"z ",l+='<svg version="1.1" xmlns="http://www.w3.org/2000/svg"',l+=o.scalable?"":' width="'+g+'px" height="'+g+'px"',l+=' viewBox="0 0 '+g+" "+g+'" ',l+=' preserveAspectRatio="xMinYMin meet"',l+=n.text||e.text?' role="img" aria-labelledby="'+y([n.id,e.id].join(" ").trim())+'"':"",l+=">",l+=n.text?'<title id="'+y(n.id)+'">'+y(n.text)+"</title>":"",l+=e.text?'<description id="'+y(e.id)+'">'+y(e.text)+"</description>":"",l+='<rect width="100%" height="100%" fill="white" cx="0" cy="0"/>',l+='<path d="',a=0;a<f.getModuleCount();a+=1)for(u=a*t+r,i=0;i<f.getModuleCount();i+=1)f.isDark(a,i)&&(l+="M"+(i*t+r)+","+u+c);return l+='" stroke="transparent" fill="black"/>',l+="</svg>"},f.createDataURL=function(t,r){t=t||2,r=void 0===r?4*t:r;var e=f.getModuleCount()*t+2*r,n=r,o=e-r;return I(e,e,function(r,e){if(n<=r&&r<o&&n<=e&&e<o){var i=Math.floor((r-n)/t),a=Math.floor((e-n)/t);return f.isDark(a,i)?0:1}return 1})},f.createImgTag=function(t,r,e){t=t||2,r=void 0===r?4*t:r;var n=f.getModuleCount()*t+2*r,o="";return o+="<img",o+=' src="',o+=f.createDataURL(t,r),o+='"',o+=' width="',o+=n,o+='"',o+=' height="',o+=n,o+='"',e&&(o+=' alt="',o+=y(e),o+='"'),o+="/>"};var y=function(t){for(var r="",e=0;e<t.length;e+=1){var n=t.charAt(e);switch(n){case"<":r+="&lt;";break;case">":r+="&gt;";break;case"&":r+="&amp;";break;case'"':r+="&quot;";break;default:r+=n}}return r};return f.createASCII=function(t,r){if((t=t||1)<2)return function(t){t=void 0===t?2:t;var r,e,n,o,i,a=1*f.getModuleCount()+2*t,u=t,c=a-t,g={"██":"█","█ ":"▀"," █":"▄","  ":" "},l={"██":"▀","█ ":"▀"," █":" ","  ":" "},h="";for(r=0;r<a;r+=2){for(n=Math.floor((r-u)/1),o=Math.floor((r+1-u)/1),e=0;e<a;e+=1)i="█",u<=e&&e<c&&u<=r&&r<c&&f.isDark(n,Math.floor((e-u)/1))&&(i=" "),u<=e&&e<c&&u<=r+1&&r+1<c&&f.isDark(o,Math.floor((e-u)/1))?i+=" ":i+="█",h+=t<1&&r+1>=c?l[i]:g[i];h+="\n"}return a%2&&t>0?h.substring(0,h.length-a-1)+Array(a+1).join("▀"):h.substring(0,h.length-1)}(r);t-=1,r=void 0===r?2*t:r;var e,n,o,i,a=f.getModuleCount()*t+2*r,u=r,c=a-r,g=Array(t+1).join("██"),l=Array(t+1).join("  "),h="",s="";for(e=0;e<a;e+=1){for(o=Math.floor((e-u)/t),s="",n=0;n<a;n+=1)i=1,u<=n&&n<c&&u<=e&&e<c&&f.isDark(o,Math.floor((n-u)/t))&&(i=0),s+=i?g:l;for(o=0;o<t;o+=1)h+=s+"\n"}return h.substring(0,h.length-1)},f.renderTo2dContext=function(t,r){r=r||2;for(var e=f.getModuleCount(),n=0;n<e;n++)for(var o=0;o<e;o++)t.fillStyle=f.isDark(n,o)?"black":"white",t.fillRect(o*r,n*r,r,r)},f};t.stringToBytes=(t.stringToBytesFuncs={default:function(t){for(var r=[],e=0;e<t.length;e+=1){var n=t.charCodeAt(e);r.push(255&n)}return r}}).default,t.createStringToBytes=function(t,r){var e=function(){for(var e=S(t),n=function(){var t=e.read();if(-1==t)throw"eof";return t},o=0,i={};;){var a=e.read();if(-1==a)break;var u=n(),f=n()<<8|n();i[String.fromCharCode(a<<8|u)]=f,o+=1}if(o!=r)throw o+" != "+r;return i}(),n="?".charCodeAt(0);return function(t){for(var r=[],o=0;o<t.length;o+=1){var i=t.charCodeAt(o);if(i<128)r.push(i);else{var a=e[t.charAt(o)];"number"==typeof a?(255&a)==a?r.push(a):(r.push(a>>>8),r.push(255&a)):r.push(n)}}return r}};var r,e,n,o,i,a=1,u=2,f=4,c=8,g={L:1,M:0,Q:3,H:2},l=0,h=1,s=2,v=3,d=4,w=5,p=6,y=7,B=(r=[[],[6,18],[6,22],[6,26],[6,30],[6,34],[6,22,38],[6,24,42],[6,26,46],[6,28,50],[6,30,54],[6,32,58],[6,34,62],[6,26,46,66],[6,26,48,70],[6,26,50,74],[6,30,54,78],[6,30,56,82],[6,30,58,86],[6,34,62,90],[6,28,50,72,94],[6,26,50,74,98],[6,30,54,78,102],[6,28,54,80,106],[6,32,58,84,110],[6,30,58,86,114],[6,34,62,90,118],[6,26,50,74,98,122],[6,30,54,78,102,126],[6,26,52,78,104,130],[6,30,56,82,108,134],[6,34,60,86,112,138],[6,30,58,86,114,142],[6,34,62,90,118,146],[6,30,54,78,102,126,150],[6,24,50,76,102,128,154],[6,28,54,80,106,132,158],[6,32,58,84,110,136,162],[6,26,54,82,110,138,166],[6,30,58,86,114,142,170]],e=1335,n=7973,i=function(t){for(var r=0;0!=t;)r+=1,t>>>=1;return r},(o={}).getBCHTypeInfo=function(t){for(var r=t<<10;i(r)-i(e)>=0;)r^=e<<i(r)-i(e);return 21522^(t<<10|r)},o.getBCHTypeNumber=function(t){for(var r=t<<12;i(r)-i(n)>=0;)r^=n<<i(r)-i(n);return t<<12|r},o.getPatternPosition=function(t){return r[t-1]},o.getMaskFunction=function(t){switch(t){case l:return function(t,r){return(t+r)%2==0};case h:return function(t,r){return t%2==0};case s:return function(t,r){return r%3==0};case v:return function(t,r){return(t+r)%3==0};case d:return function(t,r){return(Math.floor(t/2)+Math.floor(r/3))%2==0};case w:return function(t,r){return t*r%2+t*r%3==0};case p:return function(t,r){return(t*r%2+t*r%3)%2==0};case y:return function(t,r){return(t*r%3+(t+r)%2)%2==0};default:throw"bad maskPattern:"+t}},o.getErrorCorrectPolynomial=function(t){for(var r=k([1],0),e=0;e<t;e+=1)r=r.multiply(k([1,C.gexp(e)],0));return r},o.getLengthInBits=function(t,r){if(1<=r&&r<10)switch(t){case a:return 10;case u:return 9;case f:case c:return 8;default:throw"mode:"+t}else if(r<27)switch(t){case a:return 12;case u:return 11;case f:return 16;case c:return 10;default:throw"mode:"+t}else{if(!(r<41))throw"type:"+r;switch(t){case a:return 14;case u:return 13;case f:return 16;case c:return 12;default:throw"mode:"+t}}},o.getLostPoint=function(t){for(var r=t.getModuleCount(),e=0,n=0;n<r;n+=1)for(var o=0;o<r;o+=1){for(var i=0,a=t.isDark(n,o),u=-1;u<=1;u+=1)if(!(n+u<0||r<=n+u))for(var f=-1;f<=1;f+=1)o+f<0||r<=o+f||0==u&&0==f||a==t.isDark(n+u,o+f)&&(i+=1);i>5&&(e+=3+i-5)}for(n=0;n<r-1;n+=1)for(o=0;o<r-1;o+=1){var c=0;t.isDark(n,o)&&(c+=1),t.isDark(n+1,o)&&(c+=1),t.isDark(n,o+1)&&(c+=1),t.isDark(n+1,o+1)&&(c+=1),0!=c&&4!=c||(e+=3)}for(n=0;n<r;n+=1)for(o=0;o<r-6;o+=1)t.isDark(n,o)&&!t.isDark(n,o+1)&&t.isDark(n,o+2)&&t.isDark(n,o+3)&&t.isDark(n,o+4)&&!t.isDark(n,o+5)&&t.isDark(n,o+6)&&(e+=40);for(o=0;o<r;o+=1)for(n=0;n<r-6;n+=1)t.isDark(n,o)&&!t.isDark(n+1,o)&&t.isDark(n+2,o)&&t.isDark(n+3,o)&&t.isDark(n+4,o)&&!t.isDark(n+5,o)&&t.isDark(n+6,o)&&(e+=40);var g=0;for(o=0;o<r;o+=1)for(n=0;n<r;n+=1)t.isDark(n,o)&&(g+=1);return e+=Math.abs(100*g/r/r-50)/5*10},o),C=function(){for(var t=new Array(256),r=new Array(256),e=0;e<8;e+=1)t[e]=1<<e;for(e=8;e<256;e+=1)t[e]=t[e-4]^t[e-5]^t[e-6]^t[e-8];for(e=0;e<255;e+=1)r[t[e]]=e;var n={glog:function(t){if(t<1)throw"glog("+t+")";return r[t]},gexp:function(r){for(;r<0;)r+=255;for(;r>=256;)r-=255;return t[r]}};return n}();function k(t,r){if(void 0===t.length)throw t.length+"/"+r;var e=function(){for(var e=0;e<t.length&&0==t[e];)e+=1;for(var n=new Array(t.length-e+r),o=0;o<t.length-e;o+=1)n[o]=t[o+e];return n}(),n={getAt:function(t){return e[t]},getLength:function(){return e.length},multiply:function(t){for(var r=new Array(n.getLength()+t.getLength()-1),e=0;e<n.getLength();e+=1)for(var o=0;o<t.getLength();o+=1)r[e+o]^=C.gexp(C.glog(n.getAt(e))+C.glog(t.getAt(o)));return k(r,0)},mod:function(t){if(n.getLength()-t.getLength()<0)return n;for(var r=C.glog(n.getAt(0))-C.glog(t.getAt(0)),e=new Array(n.getLength()),o=0;o<n.getLength();o+=1)e[o]=n.getAt(o);for(o=0;o<t.getLength();o+=1)e[o]^=C.gexp(C.glog(t.getAt(o))+r);return k(e,0).mod(t)}};return n}var A=function(){var t=[[1,26,19],[1,26,16],[1,26,13],[1,26,9],[1,44,34],[1,44,28],[1,44,22],[1,44,16],[1,70,55],[1,70,44],[2,35,17],[2,35,13],[1,100,80],[2,50,32],[2,50,24],[4,25,9],[1,134,108],[2,67,43],[2,33,15,2,34,16],[2,33,11,2,34,12],[2,86,68],[4,43,27],[4,43,19],[4,43,15],[2,98,78],[4,49,31],[2,32,14,4,33,15],[4,39,13,1,40,14],[2,121,97],[2,60,38,2,61,39],[4,40,18,2,41,19],[4,40,14,2,41,15],[2,146,116],[3,58,36,2,59,37],[4,36,16,4,37,17],[4,36,12,4,37,13],[2,86,68,2,87,69],[4,69,43,1,70,44],[6,43,19,2,44,20],[6,43,15,2,44,16],[4,101,81],[1,80,50,4,81,51],[4,50,22,4,51,23],[3,36,12,8,37,13],[2,116,92,2,117,93],[6,58,36,2,59,37],[4,46,20,6,47,21],[7,42,14,4,43,15],[4,133,107],[8,59,37,1,60,38],[8,44,20,4,45,21],[12,33,11,4,34,12],[3,145,115,1,146,116],[4,64,40,5,65,41],[11,36,16,5,37,17],[11,36,12,5,37,13],[5,109,87,1,110,88],[5,65,41,5,66,42],[5,54,24,7,55,25],[11,36,12,7,37,13],[5,122,98,1,123,99],[7,73,45,3,74,46],[15,43,19,2,44,20],[3,45,15,13,46,16],[1,135,107,5,136,108],[10,74,46,1,75,47],[1,50,22,15,51,23],[2,42,14,17,43,15],[5,150,120,1,151,121],[9,69,43,4,70,44],[17,50,22,1,51,23],[2,42,14,19,43,15],[3,141,113,4,142,114],[3,70,44,11,71,45],[17,47,21,4,48,22],[9,39,13,16,40,14],[3,135,107,5,136,108],[3,67,41,13,68,42],[15,54,24,5,55,25],[15,43,15,10,44,16],[4,144,116,4,145,117],[17,68,42],[17,50,22,6,51,23],[19,46,16,6,47,17],[2,139,111,7,140,112],[17,74,46],[7,54,24,16,55,25],[34,37,13],[4,151,121,5,152,122],[4,75,47,14,76,48],[11,54,24,14,55,25],[16,45,15,14,46,16],[6,147,117,4,148,118],[6,73,45,14,74,46],[11,54,24,16,55,25],[30,46,16,2,47,17],[8,132,106,4,133,107],[8,75,47,13,76,48],[7,54,24,22,55,25],[22,45,15,13,46,16],[10,142,114,2,143,115],[19,74,46,4,75,47],[28,50,22,6,51,23],[33,46,16,4,47,17],[8,152,122,4,153,123],[22,73,45,3,74,46],[8,53,23,26,54,24],[12,45,15,28,46,16],[3,147,117,10,148,118],[3,73,45,23,74,46],[4,54,24,31,55,25],[11,45,15,31,46,16],[7,146,116,7,147,117],[21,73,45,7,74,46],[1,53,23,37,54,24],[19,45,15,26,46,16],[5,145,115,10,146,116],[19,75,47,10,76,48],[15,54,24,25,55,25],[23,45,15,25,46,16],[13,145,115,3,146,116],[2,74,46,29,75,47],[42,54,24,1,55,25],[23,45,15,28,46,16],[17,145,115],[10,74,46,23,75,47],[10,54,24,35,55,25],[19,45,15,35,46,16],[17,145,115,1,146,116],[14,74,46,21,75,47],[29,54,24,19,55,25],[11,45,15,46,46,16],[13,145,115,6,146,116],[14,74,46,23,75,47],[44,54,24,7,55,25],[59,46,16,1,47,17],[12,151,121,7,152,122],[12,75,47,26,76,48],[39,54,24,14,55,25],[22,45,15,41,46,16],[6,151,121,14,152,122],[6,75,47,34,76,48],[46,54,24,10,55,25],[2,45,15,64,46,16],[17,152,122,4,153,123],[29,74,46,14,75,47],[49,54,24,10,55,25],[24,45,15,46,46,16],[4,152,122,18,153,123],[13,74,46,32,75,47],[48,54,24,14,55,25],[42,45,15,32,46,16],[20,147,117,4,148,118],[40,75,47,7,76,48],[43,54,24,22,55,25],[10,45,15,67,46,16],[19,148,118,6,149,119],[18,75,47,31,76,48],[34,54,24,34,55,25],[20,45,15,61,46,16]],r=function(t,r){var e={};return e.totalCount=t,e.dataCount=r,e},e={};return e.getRSBlocks=function(e,n){var o=function(r,e){switch(e){case g.L:return t[4*(r-1)+0];case g.M:return t[4*(r-1)+1];case g.Q:return t[4*(r-1)+2];case g.H:return t[4*(r-1)+3];default:return}}(e,n);if(void 0===o)throw"bad rs block @ typeNumber:"+e+"/errorCorrectionLevel:"+n;for(var i=o.length/3,a=[],u=0;u<i;u+=1)for(var f=o[3*u+0],c=o[3*u+1],l=o[3*u+2],h=0;h<f;h+=1)a.push(r(c,l));return a},e}(),b=function(){var t=[],r=0,e={getBuffer:function(){return t},getAt:function(r){var e=Math.floor(r/8);return 1==(t[e]>>>7-r%8&1)},put:function(t,r){for(var n=0;n<r;n+=1)e.putBit(1==(t>>>r-n-1&1))},getLengthInBits:function(){return r},putBit:function(e){var n=Math.floor(r/8);t.length<=n&&t.push(0),e&&(t[n]|=128>>>r%8),r+=1}};return e},M=function(t){var r=a,e=t,n={getMode:function(){return r},getLength:function(t){return e.length},write:function(t){for(var r=e,n=0;n+2<r.length;)t.put(o(r.substring(n,n+3)),10),n+=3;n<r.length&&(r.length-n==1?t.put(o(r.substring(n,n+1)),4):r.length-n==2&&t.put(o(r.substring(n,n+2)),7))}},o=function(t){for(var r=0,e=0;e<t.length;e+=1)r=10*r+i(t.charAt(e));return r},i=function(t){if("0"<=t&&t<="9")return t.charCodeAt(0)-"0".charCodeAt(0);throw"illegal char :"+t};return n},x=function(t){var r=u,e=t,n={getMode:function(){return r},getLength:function(t){return e.length},write:function(t){for(var r=e,n=0;n+1<r.length;)t.put(45*o(r.charAt(n))+o(r.charAt(n+1)),11),n+=2;n<r.length&&t.put(o(r.charAt(n)),6)}},o=function(t){if("0"<=t&&t<="9")return t.charCodeAt(0)-"0".charCodeAt(0);if("A"<=t&&t<="Z")return t.charCodeAt(0)-"A".charCodeAt(0)+10;switch(t){case" ":return 36;case"$":return 37;case"%":return 38;case"*":return 39;case"+":return 40;case"-":return 41;case".":return 42;case"/":return 43;case":":return 44;default:throw"illegal char :"+t}};return n},m=function(r){var e=f,n=t.stringToBytes(r),o={getMode:function(){return e},getLength:function(t){return n.length},write:function(t){for(var r=0;r<n.length;r+=1)t.put(n[r],8)}};return o},L=function(r){var e=c,n=t.stringToBytesFuncs.SJIS;if(!n)throw"sjis not supported.";!function(){var t=n("友");if(2!=t.length||38726!=(t[0]<<8|t[1]))throw"sjis not supported."}();var o=n(r),i={getMode:function(){return e},getLength:function(t){return~~(o.length/2)},write:function(t){for(var r=o,e=0;e+1<r.length;){var n=(255&r[e])<<8|255&r[e+1];if(33088<=n&&n<=40956)n-=33088;else{if(!(57408<=n&&n<=60351))throw"illegal char at "+(e+1)+"/"+n;n-=49472}n=192*(n>>>8&255)+(255&n),t.put(n,13),e+=2}if(e<r.length)throw"illegal char at "+(e+1)}};return i},D=function(){var t=[],r={writeByte:function(r){t.push(255&r)},writeShort:function(t){r.writeByte(t),r.writeByte(t>>>8)},writeBytes:function(t,e,n){e=e||0,n=n||t.length;for(var o=0;o<n;o+=1)r.writeByte(t[o+e])},writeString:function(t){for(var e=0;e<t.length;e+=1)r.writeByte(t.charCodeAt(e))},toByteArray:function(){return t},toString:function(){var r="";r+="[";for(var e=0;e<t.length;e+=1)e>0&&(r+=","),r+=t[e];return r+="]"}};return r},S=function(t){var r=t,e=0,n=0,o=0,i={read:function(){for(;o<8;){if(e>=r.length){if(0==o)return-1;throw"unexpected end of file./"+o}var t=r.charAt(e);if(e+=1,"="==t)return o=0,-1;t.match(/^\s$/)||(n=n<<6|a(t.charCodeAt(0)),o+=6)}var i=n>>>o-8&255;return o-=8,i}},a=function(t){if(65<=t&&t<=90)return t-65;if(97<=t&&t<=122)return t-97+26;if(48<=t&&t<=57)return t-48+52;if(43==t)return 62;if(47==t)return 63;throw"c:"+t};return i},I=function(t,r,e){for(var n=function(t,r){var e=t,n=r,o=new Array(t*r),i={setPixel:function(t,r,n){o[r*e+t]=n},write:function(t){t.writeString("GIF87a"),t.writeShort(e),t.writeShort(n),t.writeByte(128),t.writeByte(0),t.writeByte(0),t.writeByte(0),t.writeByte(0),t.writeByte(0),t.writeByte(255),t.writeByte(255),t.writeByte(255),t.writeString(","),t.writeShort(0),t.writeShort(0),t.writeShort(e),t.writeShort(n),t.writeByte(0);var r=a(2);t.writeByte(2);for(var o=0;r.length-o>255;)t.writeByte(255),t.writeBytes(r,o,255),o+=255;t.writeByte(r.length-o),t.writeBytes(r,o,r.length-o),t.writeByte(0),t.writeString(";")}},a=function(t){for(var r=1<<t,e=1+(1<<t),n=t+1,i=u(),a=0;a<r;a+=1)i.add(String.fromCharCode(a));i.add(String.fromCharCode(r)),i.add(String.fromCharCode(e));var f,c,g,l=D(),h=(f=l,c=0,g=0,{write:function(t,r){if(t>>>r!=0)throw"length over";for(;c+r>=8;)f.writeByte(255&(t<<c|g)),r-=8-c,t>>>=8-c,g=0,c=0;g|=t<<c,c+=r},flush:function(){c>0&&f.writeByte(g)}});h.write(r,n);var s=0,v=String.fromCharCode(o[s]);for(s+=1;s<o.length;){var d=String.fromCharCode(o[s]);s+=1,i.contains(v+d)?v+=d:(h.write(i.indexOf(v),n),i.size()<4095&&(i.size()==1<<n&&(n+=1),i.add(v+d)),v=d)}return h.write(i.indexOf(v),n),h.write(e,n),h.flush(),l.toByteArray()},u=function(){var t={},r=0,e={add:function(n){if(e.contains(n))throw"dup key:"+n;t[n]=r,r+=1},size:function(){return r},indexOf:function(r){return t[r]},contains:function(r){return void 0!==t[r]}};return e};return i}(t,r),o=0;o<r;o+=1)for(var i=0;i<t;i+=1)n.setPixel(i,o,e(i,o));var a=D();n.write(a);for(var u=function(){var t=0,r=0,e=0,n="",o={},i=function(t){n+=String.fromCharCode(a(63&t))},a=function(t){if(t<0);else{if(t<26)return 65+t;if(t<52)return t-26+97;if(t<62)return t-52+48;if(62==t)return 43;if(63==t)return 47}throw"n:"+t};return o.writeByte=function(n){for(t=t<<8|255&n,r+=8,e+=1;r>=6;)i(t>>>r-6),r-=6},o.flush=function(){if(r>0&&(i(t<<6-r),t=0,r=0),e%3!=0)for(var o=3-e%3,a=0;a<o;a+=1)n+="="},o.toString=function(){return n},o}(),f=a.toByteArray(),c=0;c<f.length;c+=1)u.writeByte(f[c]);return u.flush(),"data:image/gif;base64,"+u};return t}();qrcode.stringToBytesFuncs["UTF-8"]=function(t){return function(t){for(var r=[],e=0;e<t.length;e++){var n=t.charCodeAt(e);n<128?r.push(n):n<2048?r.push(192|n>>6,128|63&n):n<55296||n>=57344?r.push(224|n>>12,128|n>>6&63,128|63&n):(e++,n=65536+((1023&n)<<10|1023&t.charCodeAt(e)),r.push(240|n>>18,128|n>>12&63,128|n>>6&63,128|63&n))}return r}(t)},window.__lvqr=qrcode;return window.__lvqr;})();

  function qrSvg(text) {
    var qr = qrcode(0, 'M');
    qr.addData(text);
    qr.make();
    var n = qr.getModuleCount(), d = '';
    for (var r = 0; r < n; r++) for (var c = 0; c < n; c++) if (qr.isDark(r, c)) d += 'M' + c + ' ' + r + 'h1v1h-1z';
    return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="-2 -2 ' + (n + 4) + ' ' + (n + 4) + '" shape-rendering="crispEdges"><path fill="#000" d="' + d + '"/></svg>';
  }

  /* ───────── 작은 도우미 ───────── */
  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }
  function h(tag, cls, html) {
    var e = document.createElement(tag);
    if (cls) e.className = cls;
    if (html != null) e.innerHTML = html;
    return e;
  }
  var store = (function () {
    var mem = {};
    function ok() { try { localStorage.setItem('lv-t', '1'); localStorage.removeItem('lv-t'); return true; } catch (e) { return false; } }
    var has = ok();
    return {
      get: function (k) { try { return has ? localStorage.getItem(k) : (mem[k] || null); } catch (e) { return mem[k] || null; } },
      set: function (k, v) { mem[k] = v; try { if (has) localStorage.setItem(k, v); } catch (e) {} },
      del: function (k) { delete mem[k]; try { if (has) localStorage.removeItem(k); } catch (e) {} }
    };
  })();
  function clientId() {
    var id = store.get('lv-cid');
    if (!id || !/^[A-Za-z0-9_-]{8,64}$/.test(id)) {
      var a = new Uint8Array(16);
      (window.crypto || window.msCrypto).getRandomValues(a);
      id = Array.prototype.map.call(a, function (b) { return ('0' + b.toString(16)).slice(-2); }).join('');
      store.set('lv-cid', id);
    }
    return id;
  }
  function roomUrl(room) { return CFG.site.replace(/\/?$/, '/') + '?r=' + encodeURIComponent(room); }
  function shortUrl(room) { return roomUrl(room).replace(/^https?:\/\//, ''); }
  function urlLines(room) { // 첫 줄 도메인, 둘째 줄 경로 (QR 아래 좁은 칸용)
    var u = shortUrl(room), i = u.indexOf('/');
    return esc(u.slice(0, i)) + '<br><b>' + esc(u.slice(i)) + '</b>';
  }
  function debounce(fn, ms) { // 마지막 호출 뒤 ms, 계속 불려도 ms×3 안에는 한 번 실행
    var t = null, first = 0;
    return function () {
      var now = Date.now();
      if (!t) first = now;
      clearTimeout(t);
      t = setTimeout(function () { t = null; fn(); }, Math.max(0, Math.min(ms, first + ms * 3 - now)));
    };
  }

  /* ───────── 연결 상태 ───────── */
  var netFns = [], netState = { rest: true, rt: false };
  function setNet(k, v) {
    if (netState[k] === v) return;
    netState[k] = v;
    netFns.forEach(function (f) { try { f(netState); } catch (e) {} });
  }
  function onNet(f) { netFns.push(f); f(netState); return function () { netFns = netFns.filter(function (x) { return x !== f; }); }; }

  /* ───────── 로그인 (강사) ───────── */
  var AUTH_KEY = 'lv-auth';
  var auth = {
    get: function () { try { return JSON.parse(store.get(AUTH_KEY) || 'null'); } catch (e) { return null; } },
    save: function (s) {
      if (!s) { store.del(AUTH_KEY); return; }
      store.set(AUTH_KEY, JSON.stringify({ access_token: s.access_token, refresh_token: s.refresh_token,
        expires_at: s.expires_at || (Math.floor(Date.now() / 1000) + (s.expires_in || 3600)),
        email: (s.user && s.user.email) || s.email || '' }));
    },
    login: function (email, password) {
      return fetch(CFG.url + '/auth/v1/token?grant_type=password', {
        method: 'POST', headers: { apikey: CFG.key, 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email, password: password })
      }).then(function (r) { return r.json().then(function (j) {
        if (!r.ok) throw new Error(j.error_description || j.msg || j.message || '로그인 실패');
        auth.save(j); return rpc('lv_is_admin', {}, true).then(function (isAdmin) {
          if (!isAdmin) { auth.save(null); throw new Error('강사로 등록된 계정이 아니에요'); }
          return auth.get();
        });
      }); });
    },
    logout: function () {
      var s = auth.get();
      auth.save(null);
      if (s) fetch(CFG.url + '/auth/v1/logout', { method: 'POST', headers: { apikey: CFG.key, Authorization: 'Bearer ' + s.access_token } }).catch(function () {});
    },
    _refreshing: null,
    token: function () {
      var s = auth.get();
      if (!s) return Promise.resolve(null);
      if (s.expires_at - 120 > Date.now() / 1000) return Promise.resolve(s.access_token);
      if (auth._refreshing) return auth._refreshing;
      auth._refreshing = fetch(CFG.url + '/auth/v1/token?grant_type=refresh_token', {
        method: 'POST', headers: { apikey: CFG.key, 'Content-Type': 'application/json' },
        body: JSON.stringify({ refresh_token: s.refresh_token })
      }).then(function (r) { return r.json().then(function (j) {
        if (!r.ok) { if (r.status === 400 || r.status === 401) auth.save(null); return null; }
        auth.save(j); return j.access_token;
      }); }).catch(function () { return s.access_token; })
        .then(function (t) { auth._refreshing = null; return t; });
      return auth._refreshing;
    }
  };

  /* ───────── REST · RPC ───────── */
  function call(path, opt, useAuth) {
    opt = opt || {};
    return (useAuth ? auth.token() : Promise.resolve(null)).then(function (tok) {
      if (useAuth && !tok) { var e = new Error('강사 로그인이 필요해요'); e.code = 'auth'; throw e; }
      var headers = Object.assign({ apikey: CFG.key, Authorization: 'Bearer ' + (tok || CFG.key),
        'Content-Type': 'application/json' }, opt.headers || {});
      var ctl = window.AbortController ? new AbortController() : null;
      var timer = ctl && setTimeout(function () { ctl.abort(); }, opt.timeout || 8000);
      return fetch(CFG.url + path, { method: opt.method || 'GET', headers: headers, cache: 'no-store',
        body: opt.body == null ? undefined : JSON.stringify(opt.body), signal: ctl ? ctl.signal : undefined })
        .then(function (r) {
          clearTimeout(timer);
          setNet('rest', true);
          return r.text().then(function (t) {
            var j = null; try { j = t ? JSON.parse(t) : null; } catch (e) { j = t; }
            if (!r.ok) {
              var err = new Error((j && (j.message || j.msg || j.error_description)) || ('HTTP ' + r.status));
              err.status = r.status; err.code = (r.status === 401 || r.status === 403 || (j && j.code === '42501')) ? 'auth' : 'http';
              throw err;
            }
            return j;
          });
        }, function (e) {
          clearTimeout(timer);
          setNet('rest', false);
          var err = new Error('연결 안 됨'); err.code = 'net'; throw err;
        });
    });
  }
  function rpc(name, args, useAuth) { return call('/rest/v1/rpc/' + name, { method: 'POST', body: args || {} }, useAuth); }

  /* ───────── 실시간 (Supabase Realtime Broadcast, 라이브러리 없이) ───────── */
  var rt = {
    ws: null, subs: {}, joined: {}, ref: 0, hb: null, hbRef: null, hbTimer: null, backoff: 1000, retryT: null,
    topic: function (room) { return 'realtime:lv-' + room; },
    send: function (m) { try { if (rt.ws && rt.ws.readyState === 1) rt.ws.send(JSON.stringify(m)); } catch (e) {} },
    join: function (room) {
      var r = String(++rt.ref);
      rt.joined[room] = r;
      rt.send({ topic: rt.topic(room), event: 'phx_join', ref: r, join_ref: r,
        payload: { config: { broadcast: { self: false, ack: false }, presence: { key: '' }, postgres_changes: [], private: false },
                   access_token: CFG.key } });
    },
    emit: function (room, msg) { (rt.subs[room] || []).forEach(function (f) { try { f(msg); } catch (e) {} }); },
    emitAll: function (msg) { Object.keys(rt.subs).forEach(function (room) { rt.emit(room, msg); }); },
    connect: function () {
      if (typeof WebSocket === 'undefined') return;
      if (rt.ws && (rt.ws.readyState === 0 || rt.ws.readyState === 1)) return;
      clearTimeout(rt.retryT);
      var url = CFG.url.replace(/^http/, 'ws') + '/realtime/v1/websocket?apikey=' + encodeURIComponent(CFG.key) + '&vsn=1.0.0';
      var ws;
      try { ws = new WebSocket(url); } catch (e) { rt.later(); return; }
      rt.ws = ws;
      ws.onopen = function () {
        rt.backoff = 1000; rt.joined = {};
        Object.keys(rt.subs).forEach(rt.join);
        clearInterval(rt.hb);
        rt.hb = setInterval(rt.beat, 20000);
      };
      ws.onmessage = function (ev) {
        var m; try { m = JSON.parse(ev.data); } catch (e) { return; }
        if (m.topic === 'phoenix') { if (m.ref === rt.hbRef) { clearTimeout(rt.hbTimer); rt.hbRef = null; } return; }
        var room = String(m.topic || '').replace(/^realtime:lv-/, '');
        if (m.event === 'phx_reply' && m.ref && m.ref === rt.joined[room]) {
          if (m.payload && m.payload.status === 'ok') { setNet('rt', true); rt.emit(room, { t: 'resync' }); }
          else setTimeout(function () { if (rt.subs[room]) rt.join(room); }, 3000);
        } else if (m.event === 'broadcast' && m.payload) {
          rt.emit(room, m.payload.payload || {});
        } else if (m.event === 'phx_error' || m.event === 'phx_close') {
          if (rt.subs[room]) setTimeout(function () { rt.join(room); }, 2000);
        }
      };
      ws.onclose = function () {
        if (rt.ws !== ws) return;
        clearInterval(rt.hb); clearTimeout(rt.hbTimer);
        rt.ws = null; rt.joined = {};
        setNet('rt', false);
        rt.later();
      };
      ws.onerror = function () { try { ws.close(); } catch (e) {} };
    },
    later: function () {
      clearTimeout(rt.retryT);
      if (!Object.keys(rt.subs).length) return;
      rt.retryT = setTimeout(rt.connect, rt.backoff);
      rt.backoff = Math.min(rt.backoff * 2, 10000);
    },
    beat: function () {
      if (!rt.ws || rt.ws.readyState !== 1) return;
      rt.hbRef = String(++rt.ref);
      rt.send({ topic: 'phoenix', event: 'heartbeat', payload: {}, ref: rt.hbRef });
      clearTimeout(rt.hbTimer);
      rt.hbTimer = setTimeout(function () { if (rt.ws) try { rt.ws.close(); } catch (e) {} }, 10000);
    },
    kick: function () { // 화면이 다시 보이거나 네트워크가 돌아오면 즉시 확인
      if (!rt.ws || rt.ws.readyState > 1) { rt.backoff = 1000; rt.connect(); }
      else rt.beat();
      rt.emitAll({ t: 'resync' });
    },
    sub: function (room, fn) {
      (rt.subs[room] = rt.subs[room] || []).push(fn);
      if (rt.ws && rt.ws.readyState === 1 && !rt.joined[room]) rt.join(room);
      rt.connect();
      return function () {
        rt.subs[room] = (rt.subs[room] || []).filter(function (f) { return f !== fn; });
        if (!rt.subs[room].length) {
          delete rt.subs[room];
          if (rt.joined[room]) { rt.send({ topic: rt.topic(room), event: 'phx_leave', payload: {}, ref: String(++rt.ref) }); delete rt.joined[room]; }
        }
      };
    }
  };
  window.addEventListener('online', function () { rt.kick(); });
  window.addEventListener('offline', function () { setNet('rest', false); setNet('rt', false); });
  document.addEventListener('visibilitychange', function () { if (!document.hidden) rt.kick(); });
  window.addEventListener('pageshow', function (e) { if (e.persisted) rt.kick(); });

  /* ───────── 결과 그리기 ───────── */
  function pct(n, total) { return total ? Math.round(n * 100 / total) : 0; }

  function renderChoice(body, res) {
    var opts = res.options || [], counts = res.data || [], total = 0, max = 0;
    counts.forEach(function (c) { total += c; if (c > max) max = c; });
    var sig = res.id + '|' + JSON.stringify(opts);
    var wrap = body.querySelector('.lv-bars');
    if (!wrap || wrap.getAttribute('data-sig') !== sig) {
      body.innerHTML = '';
      wrap = h('div', 'lv-bars lv-n' + opts.length);
      wrap.setAttribute('data-sig', sig);
      opts.forEach(function (o) {
        var b = h('div', 'lv-bar', '<div class="lv-bar-row"><span class="lv-bar-t">' + esc(o) +
          '</span><span class="lv-bar-p"><span class="lv-v">0</span><small>%</small><span class="lv-bar-n"></span></span></div>' +
          '<div class="lv-bar-track"><div class="lv-bar-fill"></div></div>');
        wrap.appendChild(b);
      });
      body.appendChild(wrap);
      wrap.offsetWidth; // 0%에서 자라도록
    }
    Array.prototype.forEach.call(wrap.children, function (b, i) {
      var c = counts[i] || 0, p = pct(c, total);
      b.classList.toggle('lv-top', max > 0 && c === max);
      b.querySelector('.lv-v').textContent = p;
      b.querySelector('.lv-bar-n').textContent = c + '명';
      b.querySelector('.lv-bar-fill').style.width = p + '%';
    });
  }

  function renderText(body, res, o) {
    var items = (res.data || []).slice(0, o.compact ? 30 : 40);
    if (!items.length) { body.innerHTML = '<div class="lv-msg">아직 답변이 없어요</div>'; return; }
    var wrap = body.querySelector('.lv-cards');
    if (!wrap || wrap.getAttribute('data-q') !== res.id) {
      body.innerHTML = ''; wrap = h('div', 'lv-cards'); wrap.setAttribute('data-q', res.id); body.appendChild(wrap);
      wrap._first = true;
    }
    var have = {};
    Array.prototype.forEach.call(wrap.children, function (c) { have[c.getAttribute('data-id') + '|' + c.textContent] = c; });
    var frag = document.createDocumentFragment();
    items.forEach(function (it) {
      var k = it.id + '|' + it.v, el = have[k];
      if (!el) { el = h('div', 'lv-card' + (wrap._first ? '' : ' lv-new')); el.setAttribute('data-id', it.id); el.textContent = it.v; }
      frag.appendChild(el);
    });
    wrap.innerHTML = ''; wrap.appendChild(frag); wrap._first = false;
  }

  var measureCtx = null;
  function textWidth(t, size) {
    if (!measureCtx) measureCtx = document.createElement('canvas').getContext('2d');
    measureCtx.font = '800 ' + size + 'px Pretendard, "Apple SD Gothic Neo", "Noto Sans KR", system-ui, sans-serif';
    return measureCtx.measureText(t).width;
  }
  // 많이 나온 말일수록 크게, 가운데부터 나선으로 겹치지 않게 놓는다
  function layoutCloud(words, W, H, compact) {
    if (!words.length || W < 50 || H < 50) return [];
    var max = words[0].n, min = words[words.length - 1].n;
    var big = Math.min(compact ? 54 : 128, H * 0.26), small = compact ? 15 : 24;
    if (words.length > 30) big *= 0.85;
    if (words.length > 55) big *= 0.85;
    var placed = [], out = [], cx = W / 2, cy = H / 2, ratio = W / H;
    function hit(r) {
      if (r.x < 4 || r.y < 2 || r.x + r.w > W - 4 || r.y + r.h > H - 2) return true;
      for (var i = 0; i < placed.length; i++) {
        var p = placed[i];
        if (r.x < p.x + p.w && r.x + r.w > p.x && r.y < p.y + p.h && r.y + r.h > p.y) return true;
      }
      return false;
    }
    words.forEach(function (wd, idx) {
      var t = max === min ? (idx === 0 ? 1 : 0.55) : (wd.n - min) / (max - min);
      var fs = Math.round(small + (big - small) * Math.sqrt(t));
      for (var attempt = 0; attempt < 4; attempt++) {
        var w = textWidth(wd.w, fs) + fs * 0.45, hh = fs * 1.18;
        if (w > W * 0.94) { fs = Math.floor(fs * (W * 0.94) / w); continue; }
        var done = false;
        for (var s = 0; s < 1400; s++) {
          var a = s * 0.32, rad = (fs * 0.06 + 1.6) * a;
          var x = cx + rad * Math.cos(a) * Math.max(1, ratio * 0.8), y = cy + rad * Math.sin(a);
          var rect = { x: x - w / 2, y: y - hh / 2, w: w, h: hh };
          if (!hit(rect)) { placed.push(rect); out.push({ k: wd.k, w: wd.w, n: wd.n, x: x, y: y, fs: fs, rank: idx }); done = true; break; }
        }
        if (done) break;
        fs = Math.max(small * 0.7, Math.floor(fs * 0.8));
      }
    });
    return out;
  }
  function renderCloud(body, res, o) {
    var words = res.data || [];
    if (!words.length) { body.innerHTML = '<div class="lv-msg">아직 들어온 말이 없어요</div>'; return; }
    var box = body.querySelector('.lv-cloud');
    if (!box || box.getAttribute('data-q') !== res.id) {
      body.innerHTML = ''; box = h('div', 'lv-cloud'); box.setAttribute('data-q', res.id); body.appendChild(box); box._first = true;
    }
    if (o.compact && !body.style.height) body.style.height = '260px';
    var W = box.clientWidth, H = box.clientHeight;
    if (!W || !H) { box._pending = res; return; }
    var spots = layoutCloud(words, W, H, o.compact), have = {};
    Array.prototype.forEach.call(box.children, function (c) { have[c.getAttribute('data-k')] = c; });
    var keep = {};
    spots.forEach(function (s) {
      var el = have[s.k];
      if (!el) { el = h('span', 'lv-word' + (box._first ? '' : ' lv-new')); el.setAttribute('data-k', s.k); box.appendChild(el); }
      el.textContent = s.w;
      el.className = 'lv-word' + (s.rank < 3 ? ' lv-hot' : s.rank < 10 ? ' lv-r1' : '') + (el.classList.contains('lv-new') ? ' lv-new' : '');
      el.style.left = s.x + 'px'; el.style.top = s.y + 'px'; el.style.fontSize = s.fs + 'px';
      el.title = s.n + '번';
      keep[s.k] = 1;
    });
    Object.keys(have).forEach(function (k) { if (!keep[k]) have[k].remove(); });
    box._first = false; box._last = res;
  }

  function renderResult(body, res, o) {
    o = o || {};
    if (!res) { body.innerHTML = ''; return; }
    if (res.type === 'choice') renderChoice(body, res, o);
    else if (res.type === 'text') renderText(body, res, o);
    else renderCloud(body, res, o);
  }

  function renderQA(body, data, o) {
    o = o || {};
    var items = (data && data.items) || [];
    if (data && data.enabled === false) { body.innerHTML = '<div class="lv-msg">Q&amp;A가 꺼져 있어요</div>'; return; }
    if (!items.length) { body.innerHTML = '<div class="lv-msg">아직 공개된 질문이 없어요</div>'; return; }
    var open = items.filter(function (i) { return i.status !== 'answered'; }).slice(0, o.max || 5);
    var done = items.filter(function (i) { return i.status === 'answered'; }).slice(0, open.length >= 4 ? 1 : 2);
    var wrap = body.querySelector('.lv-qa');
    if (!wrap) { body.innerHTML = ''; wrap = h('div', 'lv-qa'); body.appendChild(wrap); wrap._first = true; }
    var have = {};
    Array.prototype.forEach.call(wrap.children, function (c) { have[c.getAttribute('data-id')] = c; });
    var frag = document.createDocumentFragment();
    open.concat(done).forEach(function (it) {
      var el = have[it.id];
      if (!el) {
        el = h('button', 'lv-qa-i' + (wrap._first ? '' : ' lv-new'));
        el.type = 'button'; el.setAttribute('data-id', it.id);
        el.innerHTML = '<span class="lv-qa-b"></span><span class="lv-qa-l"><b></b>나도 궁금해</span>';
      }
      el.classList.toggle('lv-done', it.status === 'answered');
      el.setAttribute('data-status', it.status);
      el.querySelector('.lv-qa-b').textContent = it.body;
      el.querySelector('.lv-qa-l b').textContent = it.likes;
      el.querySelector('.lv-qa-l').lastChild.textContent = it.status === 'answered' ? '답변 완료' : '나도 궁금해';
      frag.appendChild(el);
    });
    wrap.innerHTML = ''; wrap.appendChild(frag); wrap._first = false;
  }

  /* ───────── 토스트 · 강사 로그인 창 ───────── */
  function toast(msg) {
    var t = h('div', 'lv-toast'); t.textContent = msg; document.body.appendChild(t);
    setTimeout(function () { t.remove(); }, 2600);
  }
  function stopAll(el) {
    ['click', 'mousedown', 'mouseup', 'pointerdown', 'pointerup', 'touchstart', 'touchend', 'keydown', 'keyup', 'keypress', 'wheel']
      .forEach(function (ev) { el.addEventListener(ev, function (e) { e.stopPropagation(); }); });
  }
  function loginDialog(done) {
    if (document.querySelector('.lv-pop')) return;
    var s = auth.get();
    var pop = h('div', 'lv-pop');
    stopAll(pop);
    if (s) {
      pop.innerHTML = '<form><h3>강사 로그인 중</h3><p>' + esc(s.email) + '<br>장표에 들어오면 연결된 질문이 자동으로 열립니다.</p>' +
        '<div class="lv-row"><button type="button" class="lv-out">로그아웃</button><button type="submit" class="lv-go">닫기</button></div></form>';
      pop.querySelector('.lv-out').onclick = function () { auth.logout(); pop.remove(); done && done(); };
      pop.querySelector('form').onsubmit = function (e) { e.preventDefault(); pop.remove(); };
    } else {
      pop.innerHTML = '<form><h3>강사 로그인</h3><p>이 PC에서 한 번만 하면 됩니다. 로그인하면 장표에 들어올 때 질문이 자동으로 열려요.</p>' +
        '<input type="email" name="e" placeholder="이메일" autocomplete="username" required>' +
        '<input type="password" name="p" placeholder="비밀번호" autocomplete="current-password" required>' +
        '<div class="lv-err"></div><div class="lv-row"><button type="button" class="lv-x">취소</button><button type="submit" class="lv-go">로그인</button></div></form>';
      var f = pop.querySelector('form');
      pop.querySelector('.lv-x').onclick = function () { pop.remove(); };
      f.onsubmit = function (e) {
        e.preventDefault();
        f.querySelector('.lv-err').textContent = '';
        auth.login(f.e.value.trim(), f.p.value).then(function () { pop.remove(); toast('강사 로그인 완료'); done && done(); },
          function (err) { f.querySelector('.lv-err').textContent = err.code === 'net' ? '인터넷 연결을 확인해 주세요' : err.message; });
      };
    }
    pop.addEventListener('click', function (e) { if (e.target === pop) pop.remove(); });
    document.body.appendChild(pop);
    var first = pop.querySelector('input,button.lv-go'); if (first) first.focus();
  }

  /* ───────── 덱 위젯 ───────── */
  var boxes = [];
  function mount(box) {
    if (box._lv) return box._lv;
    var room = box.getAttribute('data-room') || 'w1';
    var qid = box.getAttribute('data-qid') || ''; // 관리 화면 · 전체보기용: 질문 id 로 직접
    var key = qid ? '' : (box.getAttribute('data-q') || 'live').trim();
    var isQA = key === 'qa', isLive = key === 'live';
    var showPrompt = box.getAttribute('data-prompt') ? box.getAttribute('data-prompt') !== 'hide' : (isLive || !!qid);
    var autoOpen = qid ? false : box.getAttribute('data-open') !== '0';
    var autoClose = box.getAttribute('data-close') === '1';
    var showSide = box.getAttribute('data-qr') !== '0';
    var slide = box.closest('section.slide, .slide');

    var w = h('div', 'lv-w' + (showSide ? '' : ' lv-noside'));
    var main = h('div', 'lv-main');
    var prompt = h('div', 'lv-prompt');
    var body = h('div', 'lv-body');
    main.appendChild(prompt); main.appendChild(body);
    w.appendChild(main);
    var side = h('div', 'lv-side',
      '<div class="lv-qr">' + qrSvg(roomUrl(room)) + '</div><div class="lv-url">' + urlLines(room) + '</div><div class="lv-count"><b>0</b><span>' + (isQA ? '개 질문' : '명 참여') + '</span></div><div class="lv-state"></div>');
    if (showSide) w.appendChild(side);
    var foot = h('div', 'lv-foot', '<span class="lv-net">연결 안 됨</span>');
    var keyBtn = h('button', 'lv-key'); keyBtn.type = 'button';
    foot.appendChild(keyBtn);
    box.innerHTML = ''; box.appendChild(w); box.appendChild(foot);

    var st = { active: false, unsub: null, poll: null, data: null, opening: false, lastOpenedId: null };
    function setKeyBtn() { var s = auth.get(); keyBtn.classList.toggle('lv-in', !!s); keyBtn.textContent = s ? '강사' : '로그인'; }
    setKeyBtn();
    keyBtn.addEventListener('click', function (e) { e.stopPropagation(); loginDialog(function () { setKeyBtn(); refresh(); }); });

    var offT = null;
    var unNet = onNet(function (n) {
      clearTimeout(offT);
      // 실시간이 안 붙어도 3초마다 새로 읽으므로, 서버에 아예 닿지 않을 때만 표시
      if (n.rest) box.classList.remove('lv-off');
      else offT = setTimeout(function () { if (!netState.rest) box.classList.add('lv-off'); }, 1500);
    });

    function showMsg(html, small) { body.innerHTML = '<div class="lv-msg' + (small ? ' lv-small' : '') + '">' + html + '</div>'; }
    function setCount(n) { var b = side.querySelector('.lv-count b'); if (b && b.textContent !== String(n)) b.textContent = n; }
    function setState(open) {
      var s = side.querySelector('.lv-state');
      s.className = 'lv-state' + (open ? ' lv-on' : '');
      s.textContent = open == null ? '' : open ? '받는 중' : '마감';
    }

    function draw(d) {
      st.data = d;
      if (isQA) {
        prompt.textContent = showPrompt ? '' : '';
        setCount((d.items || []).filter(function (i) { return i.status !== 'answered'; }).length);
        setState(d.enabled === false ? false : null);
        renderQA(body, d);
        return;
      }
      if (d.err === 'no_room') { showMsg('방 <code>' + esc(room) + '</code> 이 없어요', true); return; }
      if (d.missing && qid) { prompt.textContent = ''; setCount(0); setState(null); showMsg('질문을 찾을 수 없어요 (삭제됐을 수 있어요)', true); return; }
      if (d.missing) {
        prompt.textContent = ''; setCount(0); setState(null);
        showMsg('관리 화면에서 <code>' + esc(key) + '</code> 키로 질문을 등록하세요', true); return;
      }
      var res = d.result;
      if (!res) { prompt.textContent = ''; setCount(0); setState(null); showMsg('질문을 열면 결과가 여기에 나타나요'); return; }
      prompt.textContent = showPrompt ? res.prompt : '';
      setCount(res.n || 0);
      setState(!!res.open);
      if (body.querySelector('.lv-msg') && (res.type !== 'text' || (res.data || []).length)) body.innerHTML = '';
      renderResult(body, res, {});
    }

    var busy = false, again = false;
    function refresh() {
      if (busy) { again = true; return; }
      busy = true;
      var p = isQA ? rpc('lv_qa_board', { p_room: room })
        : qid ? rpc('lv_results', { p_qid: qid }).then(function (r) { return r ? { room: room, result: r } : { room: room, missing: true }; })
        : rpc('lv_board', { p_room: room, p_key: key });
      p.then(function (d) { if (d) { draw(d); maybeOpen(d); } }, function () {})
        .then(function () { busy = false; if (again) { again = false; refresh(); } });
    }
    var soon = debounce(refresh, 250);

    function maybeOpen(d) {
      if (!st.active || isQA || isLive || qid || !autoOpen || !auth.get() || st.opening) return;
      if (!d.result || d.result.open || st.lastOpenedId === d.result.id) return;
      st.opening = true; st.lastOpenedId = d.result.id;
      rpc('lv_admin_open', { p_room: room, p_qid: d.result.id }, true)
        .then(function () { refresh(); }, function (e) { if (e.code === 'auth') { auth.save(null); setKeyBtn(); } })
        .then(function () { st.opening = false; });
    }

    function start() {
      if (st.active) return;
      st.active = true; st.lastOpenedId = null;
      st.unsub = rt.sub(room, function (m) {
        if (isQA ? (m.t === 'qa' || m.t === 'room' || m.t === 'all' || m.t === 'resync') : m.t !== 'qa') soon();
      });
      refresh();
      (function loop() {
        st.poll = setTimeout(function () { refresh(); loop(); }, netState.rt ? 20000 : 3000);
      })();
    }
    function stop() {
      if (!st.active) return;
      st.active = false;
      clearTimeout(st.poll);
      if (st.unsub) st.unsub();
      if (autoClose && !isQA && !isLive && auth.get() && st.data && st.data.result && st.data.result.open) {
        rpc('lv_admin_open', { p_room: room, p_qid: null }, true).catch(function () {});
      }
    }

    // Q&A 장표: 강사 로그인 상태면 질문을 누를 때 답변 완료 ↔ 되돌리기
    body.addEventListener('click', function (e) {
      var b = e.target.closest && e.target.closest('.lv-qa-i');
      if (!b) return;
      e.stopPropagation();
      if (!auth.get()) { toast('오른쪽 아래 「로그인」 후 답변 완료로 바꿀 수 있어요'); return; }
      var done = b.getAttribute('data-status') === 'answered';
      call('/rest/v1/lv_qa?id=eq.' + encodeURIComponent(b.getAttribute('data-id')), {
        method: 'PATCH', headers: { Prefer: 'return=minimal' },
        body: { status: done ? 'approved' : 'answered', answered_at: done ? null : new Date().toISOString() }
      }, true).then(refresh, function (err) { toast(err.code === 'auth' ? '강사 로그인이 필요해요' : '바꾸지 못했어요'); });
    });

    // 워드클라우드는 크기가 바뀌면 다시 배치
    if (window.ResizeObserver) {
      var lastW = 0, lastH = 0;
      new ResizeObserver(function () {
        if (body.clientWidth === lastW && body.clientHeight === lastH) return;
        lastW = body.clientWidth; lastH = body.clientHeight;
        if (st.data && st.data.result && st.data.result.type === 'wordcloud') renderResult(body, st.data.result, {});
      }).observe(body);
    }

    function check() {
      var on = !slide || slide.classList.contains('active');
      if (on) start(); else stop();
    }
    if (slide) new MutationObserver(check).observe(slide, { attributes: true, attributeFilter: ['class'] });
    check();
    if (!st.active) { refresh(); } // 장표 밖에서도 처음 모양은 미리 채워 둔다

    var api = { refresh: refresh, start: start, stop: stop, box: box, destroy: function () { stop(); unNet(); } };
    box._lv = api; boxes.push(api);
    return api;
  }

  function mountAll(root) {
    Array.prototype.forEach.call((root || document).querySelectorAll('.lv-box'), mount);
  }

  // 글꼴이 늦게 오면 워드클라우드 크기 재계산
  if (document.fonts && document.fonts.addEventListener) {
    document.fonts.addEventListener('loadingdone', function () {
      boxes.forEach(function (b) { if (b.box._lv) b.refresh(); });
    });
  }

  window.LV = {
    version: '1.0.0', cfg: CFG, rpc: rpc, call: call, auth: auth, rt: rt, onNet: onNet, net: netState,
    clientId: clientId, roomUrl: roomUrl, shortUrl: shortUrl, urlLines: urlLines, qrSvg: qrSvg, esc: esc, toast: toast,
    renderResult: renderResult, renderQA: renderQA, layoutCloud: layoutCloud, mount: mount, mountAll: mountAll,
    loginDialog: loginDialog
  };

  if (!(window.LV_CONFIG && window.LV_CONFIG.manual)) {
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', function () { mountAll(); });
    else mountAll();
  }
})();
