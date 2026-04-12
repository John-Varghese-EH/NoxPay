const fs = require('fs');

const code = `(function(){
  function i(){
    if(document.getElementById('j0x-wm'))return;
    var a=document.createElement('div');
    a.id='j0x-wm';
    a.innerHTML='Made with ❤️ by <a href="https://github.com/John-Varghese-EH" target="_blank" style="color:#a78bfa;text-decoration:none;">J0X</a> | Github: <a href="https://github.com/John-Varghese-EH" target="_blank" style="color:inherit;text-decoration:none;">John-Varghese-EH</a> | Instagram: <a href="https://instagram.com/cyber__trinity" target="_blank" style="color:inherit;text-decoration:none;">@cyber__trinity</a>';
    a.setAttribute('style','position:fixed!important;bottom:15px!important;right:15px!important;z-index:2147483647!important;color:rgba(255,255,255,0.7)!important;font-family:monospace!important;font-size:11px!important;text-decoration:none!important;background:rgba(0,0,0,0.8)!important;padding:6px 12px!important;border-radius:6px!important;pointer-events:auto!important;display:block!important;visibility:visible!important;opacity:1!important;transform:none!important;border:1px solid rgba(139,92,246,0.2)!important;box-shadow:0 0 10px rgba(139,92,246,0.1)!important;backdrop-filter:blur(4px)!important;');
    document.body.appendChild(a)
  }
  document.readyState==='loading'?document.addEventListener('DOMContentLoaded',i):i();
  new MutationObserver(function(m){
    var e=document.getElementById('j0x-wm');
    if(!e)i();
    else{
      var s=window.getComputedStyle(e);
      if(s.display==='none'||s.visibility==='hidden'||s.opacity==='0'||s.transform!=='none'){
        e.style.setProperty('display','block','important');
        e.style.setProperty('visibility','visible','important');
        e.style.setProperty('opacity','1','important');
        e.style.setProperty('transform','none','important')
      }
    }
  }).observe(document.documentElement,{childList:true,subtree:true,attributes:true,attributeFilter:['style','class']});

  console.log("%c Made with ❤️ by J0X \\n Github: John-Varghese-EH \\n Instagram: @cyber__trinity ", "background:#020617;color:#a78bfa;font-size:14px;padding:20px;border-radius:10px;font-family:monospace;border:1px solid #7c3aed;box-shadow:0 0 20px rgba(124,58,237,0.3);");
})();`;

// Correct standard encoder mapping for eval(decodeURIComponent(escape(atob(str))))
const encoded = btoa(unescape(encodeURIComponent(code)));

const finalJs = 'const _0xabc = "' + encoded + '";\neval(decodeURIComponent(escape(atob(_0xabc))));\n';

fs.writeFileSync('dashboard/public/watermark.js', finalJs);
console.log('Watermark written successfully!');
