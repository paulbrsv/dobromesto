!function(){function e(t){return e="function"==typeof Symbol&&"symbol"==typeof Symbol.iterator?function(e){return typeof e}:function(e){return e&&"function"==typeof Symbol&&e.constructor===Symbol&&e!==Symbol.prototype?"symbol":typeof e},e(t)}function t(){"use strict";/*! regenerator-runtime -- Copyright (c) 2014-present, Facebook, Inc. -- license (MIT): https://github.com/facebook/regenerator/blob/main/LICENSE */t=function(){return i};var n,i={},r=Object.prototype,a=r.hasOwnProperty,o=Object.defineProperty||function(e,t,n){e[t]=n.value},l="function"==typeof Symbol?Symbol:{},s=l.iterator||"@@iterator",c=l.asyncIterator||"@@asyncIterator",p=l.toStringTag||"@@toStringTag";function d(e,t,n){return Object.defineProperty(e,t,{value:n,enumerable:!0,configurable:!0,writable:!0}),e[t]}try{d({},"")}catch(n){d=function(e,t,n){return e[t]=n}}function f(e,t,n,i){var r=t&&t.prototype instanceof x?t:x,a=Object.create(r.prototype),l=new T(i||[]);return o(a,"_invoke",{value:z(e,n,l)}),a}function u(e,t,n){try{return{type:"normal",arg:e.call(t,n)}}catch(e){return{type:"throw",arg:e}}}i.wrap=f;var m="suspendedStart",g="suspendedYield",h="executing",v="completed",b={};function x(){}function y(){}function w(){}var k={};d(k,s,(function(){return this}));var L=Object.getPrototypeOf,E=L&&L(L(I([])));E&&E!==r&&a.call(E,s)&&(k=E);var S=w.prototype=x.prototype=Object.create(k);function j(e){["next","throw","return"].forEach((function(t){d(e,t,(function(e){return this._invoke(t,e)}))}))}function _(t,n){function i(r,o,l,s){var c=u(t[r],t,o);if("throw"!==c.type){var p=c.arg,d=p.value;return d&&"object"==e(d)&&a.call(d,"__await")?n.resolve(d.__await).then((function(e){i("next",e,l,s)}),(function(e){i("throw",e,l,s)})):n.resolve(d).then((function(e){p.value=e,l(p)}),(function(e){return i("throw",e,l,s)}))}s(c.arg)}var r;o(this,"_invoke",{value:function(e,t){function a(){return new n((function(n,r){i(e,t,n,r)}))}return r=r?r.then(a,a):a()}})}function z(e,t,i){var r=m;return function(a,o){if(r===h)throw Error("Generator is already running");if(r===v){if("throw"===a)throw o;return{value:n,done:!0}}for(i.method=a,i.arg=o;;){var l=i.delegate;if(l){var s=P(l,i);if(s){if(s===b)continue;return s}}if("next"===i.method)i.sent=i._sent=i.arg;else if("throw"===i.method){if(r===m)throw r=v,i.arg;i.dispatchException(i.arg)}else"return"===i.method&&i.abrupt("return",i.arg);r=h;var c=u(e,t,i);if("normal"===c.type){if(r=i.done?v:g,c.arg===b)continue;return{value:c.arg,done:i.done}}"throw"===c.type&&(r=v,i.method="throw",i.arg=c.arg)}}}function P(e,t){var i=t.method,r=e.iterator[i];if(r===n)return t.delegate=null,"throw"===i&&e.iterator.return&&(t.method="return",t.arg=n,P(e,t),"throw"===t.method)||"return"!==i&&(t.method="throw",t.arg=new TypeError("The iterator does not provide a '"+i+"' method")),b;var a=u(r,e.iterator,t.arg);if("throw"===a.type)return t.method="throw",t.arg=a.arg,t.delegate=null,b;var o=a.arg;return o?o.done?(t[e.resultName]=o.value,t.next=e.nextLoc,"return"!==t.method&&(t.method="next",t.arg=n),t.delegate=null,b):o:(t.method="throw",t.arg=new TypeError("iterator result is not an object"),t.delegate=null,b)}function O(e){var t={tryLoc:e[0]};1 in e&&(t.catchLoc=e[1]),2 in e&&(t.finallyLoc=e[2],t.afterLoc=e[3]),this.tryEntries.push(t)}function q(e){var t=e.completion||{};t.type="normal",delete t.arg,e.completion=t}function T(e){this.tryEntries=[{tryLoc:"root"}],e.forEach(O,this),this.reset(!0)}function I(t){if(t||""===t){var i=t[s];if(i)return i.call(t);if("function"==typeof t.next)return t;if(!isNaN(t.length)){var r=-1,o=function e(){for(;++r<t.length;)if(a.call(t,r))return e.value=t[r],e.done=!1,e;return e.value=n,e.done=!0,e};return o.next=o}}throw new TypeError(e(t)+" is not iterable")}return y.prototype=w,o(S,"constructor",{value:w,configurable:!0}),o(w,"constructor",{value:y,configurable:!0}),y.displayName=d(w,p,"GeneratorFunction"),i.isGeneratorFunction=function(e){var t="function"==typeof e&&e.constructor;return!!t&&(t===y||"GeneratorFunction"===(t.displayName||t.name))},i.mark=function(e){return Object.setPrototypeOf?Object.setPrototypeOf(e,w):(e.__proto__=w,d(e,p,"GeneratorFunction")),e.prototype=Object.create(S),e},i.awrap=function(e){return{__await:e}},j(_.prototype),d(_.prototype,c,(function(){return this})),i.AsyncIterator=_,i.async=function(e,t,n,r,a){void 0===a&&(a=Promise);var o=new _(f(e,t,n,r),a);return i.isGeneratorFunction(t)?o:o.next().then((function(e){return e.done?e.value:o.next()}))},j(S),d(S,p,"Generator"),d(S,s,(function(){return this})),d(S,"toString",(function(){return"[object Generator]"})),i.keys=function(e){var t=Object(e),n=[];for(var i in t)n.push(i);return n.reverse(),function e(){for(;n.length;){var i=n.pop();if(i in t)return e.value=i,e.done=!1,e}return e.done=!0,e}},i.values=I,T.prototype={constructor:T,reset:function(e){if(this.prev=0,this.next=0,this.sent=this._sent=n,this.done=!1,this.delegate=null,this.method="next",this.arg=n,this.tryEntries.forEach(q),!e)for(var t in this)"t"===t.charAt(0)&&a.call(this,t)&&!isNaN(+t.slice(1))&&(this[t]=n)},stop:function(){this.done=!0;var e=this.tryEntries[0].completion;if("throw"===e.type)throw e.arg;return this.rval},dispatchException:function(e){if(this.done)throw e;var t=this;function i(i,r){return l.type="throw",l.arg=e,t.next=i,r&&(t.method="next",t.arg=n),!!r}for(var r=this.tryEntries.length-1;r>=0;--r){var o=this.tryEntries[r],l=o.completion;if("root"===o.tryLoc)return i("end");if(o.tryLoc<=this.prev){var s=a.call(o,"catchLoc"),c=a.call(o,"finallyLoc");if(s&&c){if(this.prev<o.catchLoc)return i(o.catchLoc,!0);if(this.prev<o.finallyLoc)return i(o.finallyLoc)}else if(s){if(this.prev<o.catchLoc)return i(o.catchLoc,!0)}else{if(!c)throw Error("try statement without catch or finally");if(this.prev<o.finallyLoc)return i(o.finallyLoc)}}}},abrupt:function(e,t){for(var n=this.tryEntries.length-1;n>=0;--n){var i=this.tryEntries[n];if(i.tryLoc<=this.prev&&a.call(i,"finallyLoc")&&this.prev<i.finallyLoc){var r=i;break}}r&&("break"===e||"continue"===e)&&r.tryLoc<=t&&t<=r.finallyLoc&&(r=null);var o=r?r.completion:{};return o.type=e,o.arg=t,r?(this.method="next",this.next=r.finallyLoc,b):this.complete(o)},complete:function(e,t){if("throw"===e.type)throw e.arg;return"break"===e.type||"continue"===e.type?this.next=e.arg:"return"===e.type?(this.rval=this.arg=e.arg,this.method="return",this.next="end"):"normal"===e.type&&t&&(this.next=t),b},finish:function(e){for(var t=this.tryEntries.length-1;t>=0;--t){var n=this.tryEntries[t];if(n.finallyLoc===e)return this.complete(n.completion,n.afterLoc),q(n),b}},catch:function(e){for(var t=this.tryEntries.length-1;t>=0;--t){var n=this.tryEntries[t];if(n.tryLoc===e){var i=n.completion;if("throw"===i.type){var r=i.arg;q(n)}return r}}throw Error("illegal catch attempt")},delegateYield:function(e,t,i){return this.delegate={iterator:I(e),resultName:t,nextLoc:i},"next"===this.method&&(this.arg=n),b}},i}function n(e,t,n,i,r,a,o){try{var l=e[a](o),s=l.value}catch(e){return void n(e)}l.done?t(s):Promise.resolve(s).then(i,r)}function i(e,t){var n=Object.keys(e);if(Object.getOwnPropertySymbols){var i=Object.getOwnPropertySymbols(e);t&&(i=i.filter((function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable}))),n.push.apply(n,i)}return n}function r(e){for(var t=1;t<arguments.length;t++){var n=null!=arguments[t]?arguments[t]:{};t%2?i(Object(n),!0).forEach((function(t){a(e,t,n[t])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(n)):i(Object(n)).forEach((function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(n,t))}))}return e}function a(t,n,i){return(n=function(t){var n=function(t,n){if("object"!=e(t)||!t)return t;var i=t[Symbol.toPrimitive];if(void 0!==i){var r=i.call(t,n||"default");if("object"!=e(r))return r;throw new TypeError("@@toPrimitive must return a primitive value.")}return("string"===n?String:Number)(t)}(t,"string");return"symbol"==e(n)?n:n+""}(n))in t?Object.defineProperty(t,n,{value:i,enumerable:!0,configurable:!0,writable:!0}):t[n]=i,t}System.register(["./header-legacy-CdwY0ONq.js"],(function(e,i){"use strict";var a,o,l,s,c,p,d,f;return{setters:[function(e){a=e.a,o=e.m,l=e.f,s=e.b,c=e.c,p=e.u,d=e.d,f=e.h}],execute:function(){var e=document.createElement("style");e.textContent='.filters{display:flex;gap:3px;align-items:center;flex-wrap:wrap;align-items:flex-start;margin-top:5px}.filters-mobile{display:none}.filters-left{display:flex;gap:3px;align-items:center;flex-wrap:wrap;width:240px;justify-content:space-between}.filters-right{display:flex;gap:3px;align-items:center;flex-wrap:wrap;width:650px}.filter{font-size:11px;cursor:pointer;color:#333;background-color:#f2f1f1;transition:background-color .3s,color .3s;padding:2px;border-radius:9px;display:flex;align-items:center;white-space:nowrap;position:relative}.filter .filter-count{margin-left:5px;width:20px;height:20px;background-color:#fefefe;border-radius:50%;color:#333;font-size:9px;text-align:center;line-height:20px;font-weight:700}.filter.active{background-color:#add8e6;color:#333}.filter-divider{width:2px;background-color:#ccc;height:65px;margin:0 5px;align-self:center}.filter-reset{font-size:14px;cursor:pointer;padding:5px 10px;border-radius:9px;background-color:#ffefef;font-weight:700;align-items:center;transition:background-color .2s}.filter-reset:hover{background-color:#fbb}.desktop-reset{display:block}.filter-icon-wrapper{display:inline-block;position:relative}.custom-tooltip{position:absolute;background-color:#333;color:#fff;padding:4px 8px;border-radius:4px;font-size:12px;z-index:1001;visibility:hidden;white-space:nowrap;pointer-events:none;box-shadow:0 2px 4px rgba(0,0,0,.2)}.custom-tooltip:after{content:"";position:absolute;top:100%;left:50%;margin-left:-5px;border-width:5px;border-style:solid;border-color:#333 transparent transparent transparent}#sidebar{width:320px;height:calc(100vh - 100px);overflow-y:auto;padding:10px;background:#f8f8f8;border-right:1px solid #ddd;position:fixed;top:100px;left:0;box-sizing:border-box;z-index:900}.place-list{margin-bottom:0}.place-list h3{margin-top:20px}.place{display:flex;align-items:center;padding:10px;border-bottom:1px solid #ddd;cursor:pointer;background:#fff;transition:background .3s,transform .2s;border-radius:8px;min-height:80px}.place:hover{background:#f0f0f0;transform:scale(1.02)}.place img{width:60px;height:80px;object-fit:cover;border-radius:8px;margin-right:10px;flex-shrink:0}.place-info{display:flex;flex-direction:column;flex:1;min-width:0}.place-info h3{margin:0;font-size:15px;font-weight:700;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.place-info p{margin:3px 0 5px;font-size:13px;color:#555;overflow:hidden;text-overflow:ellipsis;display:flex;flex-wrap:nowrap;gap:3px;align-items:center}.place-info p img{margin:0;padding:0}.place.highlighted{background:#e0f7fa;border:2px solid #3388ff}#map{flex:1;height:calc(100vh - 115px);margin-left:320px;margin-top:115px;position:relative;z-index:0;overflow:hidden}.highlighted-marker,.default-marker{line-height:0}.marker-cluster{background-clip:padding-box;border-radius:20px}.marker-cluster-small{background-color:rgba(0,128,255,.6)}.marker-cluster-small>div{background-color:rgba(0,102,204,.6);color:#fff;font-size:14px;font-weight:700}.marker-cluster-medium{background-color:rgba(0,128,255,.6)}.marker-cluster-medium>div{background-color:rgba(0,102,204,.6);color:#fff;font-size:14px;font-weight:700}.marker-cluster-large{background-color:rgba(0,128,255,.6)}.marker-cluster-large>div{background-color:rgba(0,102,204,.6);color:#fff;font-size:14px;font-weight:700}@media (max-width: 768px){.marker-cluster div{font-size:12px}}.leaflet-popup-content-wrapper{max-width:500px!important;width:500px!important}.leaflet-popup-content{display:flex;flex-direction:row;max-width:500px!important;width:500px!important;margin:13px 24px 13px 10px}.popup-content{display:flex;align-items:flex-start;width:97%;min-height:150px}.popup-content img{width:120px;height:150px;object-fit:cover;border-radius:8px;margin-right:10px;flex-shrink:0}.popup-text{flex:1;min-width:0;word-wrap:break-word;overflow-wrap:break-word;display:flex;flex-direction:column;justify-content:space-between;min-height:150px}.popup-text-content{flex:1;overflow:hidden}.popup-text h3{margin:0 0 5px;font-size:16px}.popup-text p{margin:5px 0;font-size:14px;word-wrap:break-word;overflow-wrap:break-word}.popup-attributes{gap:3px;font-size:13px;color:#555;overflow:hidden;text-overflow:ellipsis;display:flex;flex-wrap:nowrap;align-items:center}.popup-attributes img{border-radius:0!important;margin:0;padding:0}.popup-links{display:flex;gap:0px;margin-top:auto;align-items:flex-end}.popup-links a{text-decoration:none;white-space:nowrap;display:inline-block}@media (max-width: 768px){header{height:auto;padding:8px 10px}.filters-left,.filters-right,.filter-divider,.desktop-reset{display:none}.filters-mobile{display:flex;flex-direction:column;gap:4px;width:100%}.filter-row{display:flex;justify-content:flex-start;gap:4px;width:auto}.filter,.more-filters-btn,.filter-reset{font-size:12px;padding:4px 6px;white-space:nowrap}.filter-icon{max-width:18px;max-height:18px;margin-right:3px}.more-filters-btn{display:inline-flex;align-items:center;background-color:#f2f1f1;border-radius:9px;cursor:pointer}#map{margin-left:0;margin-top:0;height:100vh;width:100vw}#sidebar.hidden-mobile{transform:translate(-100%)}#sidebar{position:fixed;top:0;left:0;width:100%;height:100%;z-index:1500;background:#f8f8f8;transform:translate(0);padding:0}.mobile-sidebar-close{position:fixed;top:20px;right:20px;background:#ffb6c1;padding:5px 10px;border-radius:9px;box-shadow:0 2px 5px rgba(0,0,0,.2);z-index:1600;cursor:pointer;display:none;align-items:center;gap:5px;font-size:14px}.mobile-sidebar-close img{max-width:20px;max-height:20px}.place-list{padding:10px}.mobile-place-card{position:fixed;bottom:5%;left:0;width:100%;background:#fff;border-radius:10px;box-shadow:0 -2px 10px rgba(0,0,0,.2);max-height:50vh;overflow-y:auto;transition:transform .3s ease;transform:translateY(100%);z-index:1001;display:none}.mobile-place-card.active{transform:translateY(0);display:block}.mobile-place-card-header{position:relative;padding:10px 10px 5px;text-align:right;display:flex;justify-content:space-between;align-items:center}.close-card{font-size:20px;cursor:pointer}.mobile-place-card-attributes{display:flex;gap:3px;align-items:center}.mobile-place-card-content{display:flex;align-items:flex-start;padding:5px 5px 10px;min-height:100px}.mobile-place-card-content img{width:90px;height:110px;object-fit:cover;border-radius:8px;margin-right:10px;flex-shrink:0}.mobile-place-card-content .popup-text{flex:1;min-width:0;word-wrap:break-word;overflow-wrap:break-word;display:flex;flex-direction:column;justify-content:space-between;min-height:110px}.mobile-place-card-content .popup-text-content{flex:1;overflow:hidden}.mobile-place-card-content .popup-text h3{margin:0 0 5px;font-size:16px}.mobile-place-card-content .popup-text p{margin:5px 0;font-size:14px;word-wrap:break-word;overflow-wrap:break-word}.mobile-place-card-content .popup-links{display:flex;gap:0px;margin-top:auto;align-items:flex-end}.mobile-list-toggle{position:fixed;top:120px;right:10px;background:#fff;padding:5px 10px;border-radius:9px;box-shadow:0 2px 5px rgba(0,0,0,.2);z-index:1000;cursor:pointer;display:none;align-items:center;gap:5px}.mobile-list-toggle img{max-width:20px;max-height:20px;vertical-align:middle}}.modal{position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,.5);display:flex;align-items:center;justify-content:center;z-index:2000;display:none}.modal:not(.hidden){display:flex}.modal-content{background:#fff;padding:20px;border-radius:10px;max-height:80vh;overflow-y:auto;width:90%}.close-modal{float:right;font-size:20px;cursor:pointer}.extra-filters{display:flex;flex-direction:column;gap:10px}.extra-filters-top,.extra-filters-bottom{display:flex;flex-wrap:wrap;gap:5px}.filter-divider-horizontal{width:100%;height:2px;background-color:#ccc;margin:5px 0}.hidden{display:none}@media (min-width: 769px){.mobile-sidebar-close,.mobile-list-toggle,.mobile-place-card,.modal{display:none!important}}\n/*$vite$:1*/',document.head.appendChild(e);var i,u=null;function m(e){u&&g();var t=k();if(t[e]){var n=t[e],i=L.divIcon({className:"highlighted-marker",html:'<img src="https://paulbrsv.github.io/goodplaces/image/mark.svg" style="width: 48px; height: 64px;">',iconSize:[48,48],iconAnchor:[24,48]});n.setIcon(i),u=n,E().setView(n.getLatLng(),E().getZoom(),{animate:!0})}}function g(){if(u){var e=L.divIcon({className:"default-marker",html:'<div style="background-color: #3388ff; width: 10px; height: 10px; border-radius: 50%; border: 3px solid #ffffff; box-shadow: 0 0 0 2px #3388ff;"></div>',iconSize:[16,16],iconAnchor:[8,8]});u.setIcon(e),u=null}}function h(e,t){var n=e.querySelector(".custom-tooltip");n||((n=document.createElement("div")).className="custom-tooltip",n.textContent=t,e.appendChild(n));var i=e.getBoundingClientRect(),r=n.offsetWidth,a=window.innerWidth;n.style.top="-".concat(n.offsetHeight+5,"px");var o=(e.offsetWidth-r)/2,l=i.left;l+o<0?o=5-l:l+o+r>a&&(o=a-l-r-5),n.style.left="".concat(o,"px"),n.style.visibility="visible",setTimeout((function(){n.style.visibility="hidden"}),3e3)}function v(e){var t=document.getElementById("visible-places"),n=document.getElementById("outside-places");t.innerHTML="",n.innerHTML="";var i=E(),o=i.getBounds(),l=i.getCenter(),s=k(),c=e.map((function(e){var t=L.latLng(e.lat,e.lng),n=l.distanceTo(t);return r(r({},e),{},{distance:n})})).sort((function(e,t){return e.distance-t.distance})),p=null;c.forEach((function(e){var r=document.createElement("div");r.className="place",r.innerHTML='\n      <img src="'.concat(e.image,'" alt="').concat(e.name,'" loading="lazy">\n      <div class="place-info">\n        <h3>').concat(e.name,"</h3>\n        <p>").concat(e.shirt_description||e.description,"</p>\n        <p>").concat(e.attributes.map((function(e){return a[e]||e})).join(""),"</p>\n      </div>\n    "),r.onclick=function(){if(window.innerWidth<=768)i.setView([e.lat,e.lng],17,{animate:!0}),function(e){var t=document.getElementById("mobile-place-card"),n=t.querySelector(".mobile-place-card-header"),i=t.querySelector(".mobile-place-card-content"),r=e.attributes.map((function(e){return a[e]||e})).join("");n.innerHTML='\n    <div class="mobile-place-card-attributes">'.concat(r,'</div>\n    <span class="close-card">✕</span>\n  '),i.innerHTML='\n    <img src="'.concat(e.image,'" alt="').concat(e.name,'">\n    <div class="popup-text">\n      <div class="popup-text-content">\n        <h3>').concat(e.name,"</h3>\n        <p>").concat(e.description,'</p>\n      </div>\n      <div class="popup-links">\n        <a href="').concat(e.instagram,'" target="_blank"><img src="https://paulbrsv.github.io/goodplaces/image/instagram.svg" alt="Instagram" class="icon"></a>\n        <a href="').concat(e.maps_url,'" target="_blank"><img src="https://paulbrsv.github.io/goodplaces/image/google.svg" alt="Google Maps" class="icon"></a>\n      </div>\n    </div>\n  '),t.classList.remove("hidden"),t.classList.add("active")}(e),function(){var e=document.getElementById("sidebar"),t=document.querySelector(".mobile-sidebar-close"),n=document.querySelector(".mobile-list-toggle");e.style.transform="translateX(-100%)",t.style.display="none",window.innerWidth<=768&&(n.style.display="block");g()}(),m(e.name);else{var t=s[e.name];t&&i.removeLayer(t),p&&(p.isPopupOpen()&&p.closePopup(),i.removeLayer(p),p=null);var n='\n          <div class="popup-content">\n            <img src="'.concat(e.image,'" alt="').concat(e.name,'">\n            <div class="popup-text">\n              <div class="popup-text-content">\n                <h3>').concat(e.name,"</h3>\n                <p>").concat(e.description,'</p>\n                <div class="popup-attributes">').concat(e.attributes.map((function(e){return a[e]||e})).join(""),'</div>\n              </div>\n              <div class="popup-links">\n                <a href="').concat(e.instagram,'" target="_blank">\n                  <img src="https://paulbrsv.github.io/goodplaces/image/instagram.svg" alt="Instagram" class="icon">\n                </a>\n                <a href="').concat(e.maps_url,'" target="_blank">\n                  <img src="https://paulbrsv.github.io/goodplaces/image/google.svg" alt="Google Maps" class="icon">\n                </a>\n              </div>\n            </div>\n          </div>\n        ');(p=L.marker([e.lat,e.lng],{icon:L.divIcon({className:"highlighted-marker",html:'<img src="https://paulbrsv.github.io/goodplaces/image/mark.svg" style="width: 48px; height: 64px;">',iconSize:[48,48],iconAnchor:[24,48]})})).bindPopup(n,{autoPan:!0,autoPanPaddingTopLeft:L.point(0,100),autoPanPaddingBottomRight:L.point(0,50),offset:L.point(0,-25)}),p.addTo(i).openPopup(),i.setView([e.lat,e.lng],17,{animate:!0}),m(e.name),p.on("popupclose",(function(){i.removeLayer(p),p=null,t&&i.addLayer(t),g()}))}},o.contains([e.lat,e.lng])?t.appendChild(r):n.appendChild(r)}))}var b=L.markerClusterGroup(),x={},y=[];function w(e){if(i&&y.length){b.clearLayers();var t=y.filter((function(t){return 0===e.length||e.every((function(e){return t.attributes.includes(e)}))}));t.forEach((function(e){var t='\n      <div class="popup-content">\n        <img src="'.concat(e.image,'" alt="').concat(e.name,'" loading="lazy">\n        <div class="popup-text">\n          <div class="popup-text-content">\n            <h3>').concat(e.name,"</h3>\n            <p>").concat(e.description,'</p>\n            <div class="popup-attributes">').concat(e.attributes.map((function(e){return a[e]||e})).join(""),'</div>\n          </div>\n          <div class="popup-links">\n            <a href="').concat(e.instagram,'" target="_blank">\n              <img src="https://paulbrsv.github.io/goodplaces/image/instagram.svg" alt="Instagram" class="icon">\n            </a>\n            <a href="').concat(e.maps_url,'" target="_blank">\n              <img src="https://paulbrsv.github.io/goodplaces/image/google.svg" alt="Google Maps" class="icon">\n            </a>\n          </div>\n        </div>\n      </div>\n    '),n=L.marker([e.lat,e.lng],{icon:L.divIcon({className:"default-marker",html:'<div style="background-color: #3388ff; width: 10px; height: 10px; border-radius: 50%; border: 3px solid #ffffff; box-shadow: 0 0 0 2px #3388ff;"></div>',iconSize:[16,16],iconAnchor:[8,8]})});window.innerWidth>768?(n.bindPopup(t,{autoPan:!0,autoPanPaddingTopLeft:L.point(0,100),autoPanPaddingBottomRight:L.point(0,50),offset:L.point(0,-25)}),n.on("popupopen",(function(){return m(e.name)})),n.on("popupclose",(function(){return g()}))):n.on("click",(function(){!function(e){var t=document.getElementById("mobile-place-card"),n=t.querySelector(".mobile-place-card-header"),i=t.querySelector(".mobile-place-card-content"),r=e.attributes.map((function(e){return a[e]||e})).join("");n.innerHTML='\n    <div class="mobile-place-card-attributes">'.concat(r,'</div>\n    <span class="close-card">✕</span>\n  '),i.innerHTML='\n    <img src="'.concat(e.image,'" alt="').concat(e.name,'">\n    <div class="popup-text">\n      <div class="popup-text-content">\n        <h3>').concat(e.name,"</h3>\n        <p>").concat(e.description,'</p>\n      </div>\n      <div class="popup-links">\n        <a href="').concat(e.instagram,'" target="_blank"><img src="https://paulbrsv.github.io/goodplaces/image/instagram.svg" alt="Instagram" class="icon"></a>\n        <a href="').concat(e.maps_url,'" target="_blank"><img src="https://paulbrsv.github.io/goodplaces/image/google.svg" alt="Google Maps" class="icon"></a>\n      </div>\n    </div>\n  '),t.classList.remove("hidden"),t.classList.add("active")}(e),m(e.name)})),b.addLayer(n),x[e.name]=n})),i.addLayer(b),v(t),function(e){document.querySelectorAll(".filter").forEach((function(t){var n=t.dataset.filter;if(n){var i=e.filter((function(e){return e.attributes.includes(n)})).length,r=t.querySelector(".filter-count");r||((r=document.createElement("div")).classList.add("filter-count"),t.appendChild(r)),r.textContent=i}}))}(t)}else console.warn("Map or places data not ready yet, skipping updateMap")}function k(){return x}function E(){return i}var S=[];function j(e){S=e.filter((function(e){return l[e]})),console.log("Setting active filters:",S),S.forEach((function(e){var t=document.querySelector('.filter[data-filter="'.concat(e,'"]'));t?(console.log("Activating filter: ".concat(e)),t.classList.add("active")):console.warn('Filter "'.concat(e,'" not found in DOM'))})),S.length>0&&(w(S),z())}function _(){return S}function z(){var e=new URL(window.location);S.length>0?e.search="?filter=".concat(S.join(",")):e.search="",window.history.pushState({},document.title,e)}function P(){document.querySelector(".mobile-list-toggle").addEventListener("click",(function(){var e=document.getElementById("sidebar"),t=document.querySelector(".mobile-sidebar-close");"translateX(-100%)"===e.style.transform||e.classList.contains("hidden-mobile")?(e.style.transform="translateX(0)",e.classList.remove("hidden-mobile"),e.scrollTop=0,window.innerWidth<=768&&(t.style.display="flex",document.querySelector(".mobile-list-toggle").style.display="none")):O()})),document.querySelector(".mobile-sidebar-close").addEventListener("click",O),document.getElementById("mobile-place-card").addEventListener("click",(function(e){if(e.target.classList.contains("close-card")){var t=document.getElementById("mobile-place-card");t.classList.remove("active"),setTimeout((function(){t.classList.add("hidden"),g()}),300)}}));var e=document.querySelector(".mobile-list-toggle"),t=function(){window.innerWidth>768?e.style.display="none":e.style.display="block"};t(),window.addEventListener("resize",t)}function O(){var e=document.getElementById("sidebar"),t=document.querySelector(".mobile-sidebar-close"),n=document.querySelector(".mobile-list-toggle");e.style.transform="translateX(-100%)",t.style.display="none",window.innerWidth<=768&&(n.style.display="block"),g()}function q(e,t){document.getElementById(e).innerHTML=t}function T(){var e;return e=t().mark((function e(){var n,r,a,u,m;return t().wrap((function(e){for(;;)switch(e.prev=e.next){case 0:return q("header-container",f),q("filters-container",'<div class="filters">\n  <div class="filters-mobile">\n    <div class="filter-row">\n      <span class="filter" data-filter="no_smoking"></span>\n      <span class="filter" data-filter="terrace"></span>\n      <span class="more-filters-btn">\n        \x3c!-- Текст "Ещё" добавится через JS --\x3e\n      </span>\n    </div>\n    <div class="filter-row">\n      <span class="filter" data-filter="coffee_shop"></span>\n      <span class="filter" data-filter="breakfast"></span>\n      <span class="filter" data-filter="bar"></span>\n      <span class="filter-reset">\n        <img src="https://paulbrsv.github.io/goodplaces/image/reset.svg" alt="Reset" class="filter-icon">\n      </span>\n    </div>\n  </div>\n  <div class="filters-left">\n    <span class="filter" data-filter="no_smoking"></span>\n    <span class="filter" data-filter="pets_allowed"></span>\n    <span class="filter" data-filter="terrace"></span>\n    <span class="filter" data-filter="smoke"></span>\n\n  </div>\n  <span class="filter-divider"></span>\n  <div class="filters-right">\n    <span class="filter" data-filter="coffee_shop"></span>\n    <span class="filter" data-filter="specialty"></span>\n    <span class="filter" data-filter="food"></span>\n    <span class="filter" data-filter="bar"></span>\n    <span class="filter" data-filter="desserts"></span>\n    <span class="filter" data-filter="breakfast"></span>\n    <span class="filter" data-filter="cafe"></span>\n    <span class="filter" data-filter="vegan"></span>\n    <span class="filter" data-filter="snacks"></span>\n    <span class="filter" data-filter="beans_sale"></span>\n    <span class="filter" data-filter="ice_cream"></span>\n    <span class="filter" data-filter="beer"></span>\n    <span class="filter" data-filter="wine"></span>\n  </div>\n  <span class="filter-reset desktop-reset">\n    <img src="https://paulbrsv.github.io/goodplaces/image/reset.svg" alt="Reset" class="filter-icon">\n  </span>\n</div>\n'),q("sidebar-container",'<div id="sidebar" class="hidden-mobile">\n  <div class="place-list">\n    <h3>В этом районе</h3>\n    <div id="visible-places"></div>\n  </div>\n  <div class="place-list">\n    <h3>📍 Ещё рядом</h3>\n    <div id="outside-places"></div>\n  </div>\n</div>\n'),q("map-container",'<div id="map"></div>\n'),q("mobile-container",'<button class="mobile-sidebar-close" style="display: none;">\n  <img src="https://paulbrsv.github.io/goodplaces/image/close.svg" alt="Close" class="icon">\n  Закрыть\n</button>\n<div class="mobile-list-toggle">\n  <img src="https://paulbrsv.github.io/goodplaces/image/list.svg" alt="List" class="icon">\n  Показать список\n</div>\n<div id="mobile-place-card" class="mobile-place-card hidden">\n  <div class="mobile-place-card-header">\n    <div class="mobile-place-card-attributes"></div>\n    <span class="close-card">✕</span>\n  </div>\n  <div class="mobile-place-card-content"></div>\n</div>\n'),q("modal-container",'<div id="more-filters-modal" class="modal hidden">\n  <div class="modal-content">\n    <span class="close-modal">✕</span>\n    <div class="extra-filters">\n      <div class="extra-filters-top">\n        <span class="filter" data-filter="smoke"></span>\n        <span class="filter" data-filter="pets_allowed"></span>\n      </div>\n      <span class="filter-divider-horizontal"></span>\n      <div class="extra-filters-bottom">\n        <span class="filter" data-filter="specialty"></span>\n        <span class="filter" data-filter="food"></span>\n        <span class="filter" data-filter="desserts"></span>\n        <span class="filter" data-filter="cafe"></span>\n        <span class="filter" data-filter="vegan"></span>\n        <span class="filter" data-filter="snacks"></span>\n        <span class="filter" data-filter="wine"></span>\n        <span class="filter" data-filter="beans_sale"></span>\n        <span class="filter" data-filter="ice_cream"></span>\n        <span class="filter" data-filter="beer"></span>\n\n      </div>\n    </div>\n  </div>\n</div>\n'),n=document.getElementById("filters-container"),document.getElementById("filters-placeholder").appendChild(n.querySelector(".filters")),n.innerHTML="",document.querySelector("h1").textContent=p.headerTitle[c],document.querySelector(".mobile-list-toggle").lastChild.textContent=p.showListButton[c],document.querySelector(".mobile-sidebar-close").lastChild.textContent=p.closeButton[c],(r=document.querySelector(".more-filters-btn")).innerHTML="",(a=document.createElement("img")).src="https://paulbrsv.github.io/goodplaces/image/more.svg",a.alt=p.moreFilters[c],a.className="filter-icon",r.appendChild(a),r.appendChild(document.createTextNode(p.moreFilters[c])),document.querySelectorAll(".filter").forEach((function(e){var t,n,i=e.dataset.filter;if(i){e.innerHTML="";var r=document.createElement("span");r.className="filter-icon-wrapper";var a=document.createElement("img");a.src=l[i]||"https://via.placeholder.com/16",a.alt=(null===(t=s[i])||void 0===t?void 0:t[c])||i,a.className="filter-icon",r.appendChild(a),e.appendChild(r),e.appendChild(document.createTextNode((null===(n=s[i])||void 0===n?void 0:n[c])||i)),e.addEventListener("click",(function(){S.includes(i)?(S=S.filter((function(e){return e!==i})),e.classList.remove("active")):(S.push(i),e.classList.add("active")),g(),w(S),z()})),S.includes(i)&&e.classList.add("active")}})),document.querySelectorAll(".filter-reset").forEach((function(e){e.addEventListener("click",(function(){S=[],document.querySelectorAll(".filter").forEach((function(e){return e.classList.remove("active")})),g(),E().setView(o.initialCoords,o.initialZoom),w(S),z()}))})),e.next=24,new Promise((function(e,t){i=L.map("map").setView(o.initialCoords,o.initialZoom),L.tileLayer(o.tileLayerUrl,{attribution:o.attribution}).addTo(i),i.addLayer(b),fetch("/places.json").then((function(e){return e.json()})).then((function(t){y=t,w(_()),e()})).catch((function(e){console.error("Ошибка загрузки данных:",e),t(e)})),i.on("moveend",(function(){y.length&&v(y.filter((function(e){var t=_();return 0===t.length||e.attributes.some((function(e){return t.includes(e)}))})))}))}));case 24:P(),document.querySelector(".more-filters-btn").addEventListener("click",(function(){document.getElementById("more-filters-modal").classList.remove("hidden")})),document.querySelector(".close-modal").addEventListener("click",(function(){document.getElementById("more-filters-modal").classList.add("hidden")})),u=new URLSearchParams(window.location.search),(m=u.get("filter"))&&j(m.split(",")),document.querySelectorAll(".filter").forEach((function(e){var t=e.dataset.filter;t&&(S.includes(t)?(console.log("Updating visual state for: ".concat(t)),e.classList.add("active")):e.classList.remove("active"))})),document.querySelectorAll(".filter").forEach((function(e){var t=e.dataset.filter;if(t){var n=(d[t]||{})[c]||"Description unavailable";e.addEventListener("mouseenter",(function(){return h(e,n)})),e.addEventListener("mouseleave",(function(){var t;(t=e.querySelector(".custom-tooltip"))&&(t.style.visibility="hidden")}))}}));case 32:case"end":return e.stop()}}),e)})),T=function(){var t=this,i=arguments;return new Promise((function(r,a){var o=e.apply(t,i);function l(e){n(o,r,a,l,s,"next",e)}function s(e){n(o,r,a,l,s,"throw",e)}l(void 0)}))},T.apply(this,arguments)}document.addEventListener("DOMContentLoaded",(function(){return T.apply(this,arguments)}))}}}))}();
