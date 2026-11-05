/**
 * 设置面板（全局共享）
 * 在页面右下角加一个齿轮图标，点击弹出设置面板
 * 含：主题切换（亮/暗）、亮度滑块、字号按钮（小/中/大）
 * 依赖：theme.js (NotesTheme)
 *
 * 用法：在页面引入 theme.js 和 settings-panel.js 即可自动生效
 *   <script src="theme.js"></script>
 *   <script src="settings-panel.js"></script>
 */
(function(window, document){
  'use strict';
  if (!window.NotesTheme) {
    console.warn('settings-panel 需要 theme.js 先加载');
    return;
  }

  // 等 DOM 就绪
  function ready(fn){
    if (document.readyState !== 'loading') fn();
    else document.addEventListener('DOMContentLoaded', fn);
  }

  ready(function(){
    // ============ 创建齿轮按钮 ============
    var fab = document.createElement('div');
    fab.id = 'settings-fab';
    fab.innerHTML = '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>';
    document.body.appendChild(fab);

    // ============ 创建设置面板 ============
    var panel = document.createElement('div');
    panel.id = 'settings-panel';
    panel.innerHTML = ''
      + '<div class="sp-header">'
      +   '<span>显示设置</span>'
      +   '<button class="sp-close" title="关闭">&times;</button>'
      + '</div>'
      + '<div class="sp-body">'
      // 主题切换
      +   '<div class="sp-row">'
      +     '<div class="sp-label">主题</div>'
      +     '<div class="sp-theme-switch">'
      +       '<button class="sp-theme-btn" data-theme="light">'
      +         '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>'
      +         '<span>亮色</span>'
      +       '</button>'
      +       '<button class="sp-theme-btn" data-theme="dark">'
      +         '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>'
      +         '<span>暗色</span>'
      +       '</button>'
      +     '</div>'
      +   '</div>'
      // 亮度
      +   '<div class="sp-row">'
      +     '<div class="sp-label">亮度 <span class="sp-value" id="sp-brightness-val">100%</span></div>'
      +     '<div class="sp-slider-wrap">'
      +       '<svg class="sp-slider-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="5"/></svg>'
      +       '<input type="range" id="sp-brightness" min="0.7" max="1" step="0.05" value="1">'
      +     '</div>'
      +   '</div>'
      // 字号
      +   '<div class="sp-row">'
      +     '<div class="sp-label">字号</div>'
      +     '<div class="sp-fontsize">'
      +       '<button class="sp-fs-btn" data-scale="0.9">小</button>'
      +       '<button class="sp-fs-btn" data-scale="1">中</button>'
      +       '<button class="sp-fs-btn" data-scale="1.1">大</button>'
      +       '<button class="sp-fs-btn" data-scale="1.2">特大</button>'
      +     '</div>'
      +   '</div>'
      + '</div>';
    document.body.appendChild(panel);

    // ============ 注入样式 ============
    var style = document.createElement('style');
    style.textContent = ''
      // 齿轮按钮（右下角悬浮）
      + '#settings-fab{position:fixed;right:20px;bottom:24px;width:48px;height:48px;border-radius:50%;'
      +   'background:rgba(40,40,48,0.7);backdrop-filter:blur(20px) saturate(180%);-webkit-backdrop-filter:blur(20px) saturate(180%);'
      +   'border:1px solid rgba(255,255,255,0.15);color:#fff;display:flex;align-items:center;justify-content:center;'
      +   'cursor:pointer;z-index:1000;box-shadow:0 8px 24px rgba(0,0,0,0.3);'
      +   'transition:transform 0.3s cubic-bezier(0.22,1,0.36,1),box-shadow 0.3s;}'
      + '#settings-fab:hover{transform:scale(1.08) rotate(30deg);box-shadow:0 12px 32px rgba(0,0,0,0.4);}'
      + '#settings-fab:active{transform:scale(0.95)}'
      // 设置面板
      + '#settings-panel{position:fixed;right:20px;bottom:84px;width:300px;max-width:calc(100vw - 40px);'
      +   'background:rgba(30,30,36,0.92);backdrop-filter:blur(40px) saturate(180%);-webkit-backdrop-filter:blur(40px) saturate(180%);'
      +   'border:1px solid rgba(255,255,255,0.12);border-radius:20px;color:#f5f5f7;'
      +   'box-shadow:0 20px 60px rgba(0,0,0,0.5);z-index:1001;'
      +   'opacity:0;visibility:hidden;transform:translateY(12px) scale(0.96);transform-origin:bottom right;'
      +   'transition:opacity 0.25s cubic-bezier(0.22,1,0.36,1),transform 0.25s cubic-bezier(0.22,1,0.36,1),visibility 0.25s;}'
      + '#settings-panel.open{opacity:1;visibility:visible;transform:translateY(0) scale(1);}'
      + '#settings-panel .sp-header{display:flex;align-items:center;justify-content:space-between;'
      +   'padding:16px 20px;border-bottom:1px solid rgba(255,255,255,0.08);font-size:15px;font-weight:600;}'
      + '#settings-panel .sp-close{background:none;border:none;color:#a1a1a6;font-size:24px;cursor:pointer;'
      +   'line-height:1;padding:0 4px;transition:color 0.2s;}'
      + '#settings-panel .sp-close:hover{color:#fff;}'
      + '#settings-panel .sp-body{padding:16px 20px 20px;}'
      + '#settings-panel .sp-row{margin-bottom:18px;}'
      + '#settings-panel .sp-row:last-child{margin-bottom:0;}'
      + '#settings-panel .sp-label{font-size:13px;color:#a1a1a6;margin-bottom:10px;display:flex;justify-content:space-between;align-items:center;}'
      + '#settings-panel .sp-value{color:#0a84ff;font-weight:600;}'
      // 主题切换按钮
      + '#settings-panel .sp-theme-switch{display:flex;gap:8px;}'
      + '#settings-panel .sp-theme-btn{flex:1;display:flex;align-items:center;justify-content:center;gap:6px;'
      +   'padding:10px;border-radius:12px;border:1px solid rgba(255,255,255,0.1);'
      +   'background:rgba(255,255,255,0.04);color:#a1a1a6;font-size:13px;cursor:pointer;'
      +   'transition:all 0.2s;font-family:inherit;}'
      + '#settings-panel .sp-theme-btn:hover{background:rgba(255,255,255,0.08);color:#fff;}'
      + '#settings-panel .sp-theme-btn.active{background:linear-gradient(135deg,#0a84ff,#bf5af2);'
      +   'color:#fff;border-color:transparent;box-shadow:0 0 16px rgba(10,132,255,0.4);}'
      // 亮度滑块
      + '#settings-panel .sp-slider-wrap{display:flex;align-items:center;gap:10px;}'
      + '#settings-panel .sp-slider-icon{color:#a1a1a6;flex-shrink:0;}'
      + '#settings-panel input[type=range]{flex:1;-webkit-appearance:none;appearance:none;height:6px;'
      +   'border-radius:3px;background:rgba(255,255,255,0.1);outline:none;}'
      + '#settings-panel input[type=range]::-webkit-slider-thumb{-webkit-appearance:none;appearance:none;'
      +   'width:20px;height:20px;border-radius:50%;background:#0a84ff;cursor:pointer;'
      +   'box-shadow:0 0 12px rgba(10,132,255,0.5);border:2px solid #fff;}'
      + '#settings-panel input[type=range]::-moz-range-thumb{width:20px;height:20px;border-radius:50%;'
      +   'background:#0a84ff;cursor:pointer;border:2px solid #fff;}'
      // 字号按钮
      + '#settings-panel .sp-fontsize{display:grid;grid-template-columns:repeat(4,1fr);gap:6px;}'
      + '#settings-panel .sp-fs-btn{padding:9px 0;border-radius:10px;border:1px solid rgba(255,255,255,0.1);'
      +   'background:rgba(255,255,255,0.04);color:#a1a1a6;cursor:pointer;transition:all 0.2s;font-family:inherit;}'
      + '#settings-panel .sp-fs-btn:hover{background:rgba(255,255,255,0.08);color:#fff;}'
      + '#settings-panel .sp-fs-btn.active{background:linear-gradient(135deg,#ff9f0a,#ff375f);'
      +   'color:#fff;border-color:transparent;box-shadow:0 0 12px rgba(255,159,10,0.4);}'
      + '#settings-panel .sp-fs-btn[data-scale="0.9"]{font-size:12px;}'
      + '#settings-panel .sp-fs-btn[data-scale="1"]{font-size:13px;}'
      + '#settings-panel .sp-fs-btn[data-scale="1.1"]{font-size:14px;}'
      + '#settings-panel .sp-fs-btn[data-scale="1.2"]{font-size:15px;}'
      // 移动端适配
      + '@media(max-width:640px){'
      +   '#settings-fab{right:16px;bottom:20px;width:44px;height:44px;}'
      +   '#settings-panel{right:16px;bottom:72px;width:calc(100vw - 32px);}'
      + '}';
    document.head.appendChild(style);

    // ============ 交互逻辑 ============
    var s = NotesTheme.settings;

    // 打开/关闭面板
    fab.addEventListener('click', function(e){
      e.stopPropagation();
      panel.classList.toggle('open');
    });
    panel.querySelector('.sp-close').addEventListener('click', function(){
      panel.classList.remove('open');
    });
    // 点击面板外关闭
    document.addEventListener('click', function(e){
      if (panel.classList.contains('open') && !panel.contains(e.target) && e.target !== fab && !fab.contains(e.target)) {
        panel.classList.remove('open');
      }
    });

    // 主题按钮
    var themeBtns = panel.querySelectorAll('.sp-theme-btn');
    function syncThemeBtns(){
      themeBtns.forEach(function(b){
        b.classList.toggle('active', b.getAttribute('data-theme') === s.theme);
      });
    }
    syncThemeBtns();
    themeBtns.forEach(function(b){
      b.addEventListener('click', function(){
        NotesTheme.setTheme(b.getAttribute('data-theme'));
        syncThemeBtns();
      });
    });

    // 亮度滑块
    var brightnessInput = panel.querySelector('#sp-brightness');
    var brightnessVal = panel.querySelector('#sp-brightness-val');
    brightnessInput.value = s.brightness;
    brightnessVal.textContent = Math.round(s.brightness * 100) + '%';
    brightnessInput.addEventListener('input', function(){
      var v = parseFloat(this.value);
      NotesTheme.setBrightness(v);
      brightnessVal.textContent = Math.round(v * 100) + '%';
    });

    // 字号按钮
    var fsBtns = panel.querySelectorAll('.sp-fs-btn');
    function syncFsBtns(){
      fsBtns.forEach(function(b){
        b.classList.toggle('active', parseFloat(b.getAttribute('data-scale')) === s.fontScale);
      });
    }
    syncFsBtns();
    fsBtns.forEach(function(b){
      b.addEventListener('click', function(){
        var scale = parseFloat(b.getAttribute('data-scale'));
        NotesTheme.setFontScale(scale);
        syncFsBtns();
        // 触发自定义事件，让页面重新计算字号
        window.dispatchEvent(new CustomEvent('theme-fontscale-change', { detail: { scale: scale } }));
      });
    });
  });
})(window, document);
