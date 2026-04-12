import base64
import urllib.parse

code = """(function(){
  function i(){
    if(document.getElementById('j0x-wm'))return;
    var a=document.createElement('div');
    a.id='j0x-wm';
    a.innerHTML='<a href="https://github.com/John-Varghese-EH" target="_blank" style="color:rgba(255,255,255,0.3);text-decoration:none;" title="Made by J0X">⚡ J0X</a>';
    a.setAttribute('style','position:fixed!important;bottom:5px!important;right:5px!important;z-index:2147483647!important;font-family:monospace!important;font-size:10px!important;text-decoration:none!important;pointer-events:auto!important;display:block!important;visibility:visible!important;opacity:1!important;transform:none!important;');
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
})();"""

encoded = base64.b64encode(urllib.parse.unquote(urllib.parse.quote(code)).encode('utf-8')).decode('utf-8')

js_content = f'const _0xabc = "{encoded}";\neval(decodeURIComponent(escape(atob(_0xabc))));'

with open('dashboard/public/watermark.js', 'w', encoding='utf-8') as f:
    f.write(js_content)

print("Watermark written successfully.")
