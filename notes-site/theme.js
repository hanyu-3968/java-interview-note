/**
 * 主题管理器（全局共享）
 * 管理三项设置：主题（亮/暗）、亮度（0.7~1.0）、字号缩放（0.9~1.2）
 * 用 localStorage 持久化，所有页面共享同一份设置
 *
 * 实现原理：
 * - 给 <html> 加 data-theme="light|dark" 属性，CSS 据此切换变量
 * - 设置 --brightness CSS 变量，body 用 filter: brightness() 调亮度
 * - 设置 --font-scale CSS 变量，content 区用 font-size: calc(基准 * var(--font-scale))
 */
(function(window){
  'use strict';

  var STORAGE_KEY = 'notes_theme_settings';
  var DEFAULTS = {
    theme: 'light',      // light | dark（会被 html data-default-theme 覆盖）
    brightness: 1.0,     // 0.7 ~ 1.0
    fontScale: 1.0       // 0.9 ~ 1.2
  };

  var Theme = {
    settings: null,

    // 读取页面默认主题（html 标签上的 data-default-theme 属性）
    getPageDefaultTheme: function(){
      var t = document.documentElement.getAttribute('data-default-theme');
      return (t === 'dark' || t === 'light') ? t : 'light';
    },

    // 读取 localStorage 设置，合并默认值
    load: function(){
      // 默认主题取页面配置
      var defaults = Object.assign({}, DEFAULTS, { theme: this.getPageDefaultTheme() });
      var s = defaults;
      try {
        var raw = localStorage.getItem(STORAGE_KEY);
        if (raw) {
          var parsed = JSON.parse(raw);
          s = {
            theme: parsed.theme === 'dark' ? 'dark' : 'light',
            brightness: clamp(parsed.brightness, 0.7, 1.0, 1.0),
            fontScale: clamp(parsed.fontScale, 0.9, 1.2, 1.0)
          };
        }
      } catch(e){}
      this.settings = s;
      return s;
    },

    // 保存到 localStorage
    save: function(){
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(this.settings));
      } catch(e){}
    },

    // 应用设置到 DOM
    apply: function(){
      var s = this.settings;
      var html = document.documentElement;
      html.setAttribute('data-theme', s.theme);
      html.style.setProperty('--brightness', s.brightness);
      html.style.setProperty('--font-scale', s.fontScale);
      // 亮度通过 body filter 实现
      document.body.style.filter = 'brightness(' + s.brightness + ')';
    },

    // 设置主题
    setTheme: function(theme){
      this.settings.theme = (theme === 'dark') ? 'dark' : 'light';
      this.save();
      this.apply();
    },

    // 设置亮度
    setBrightness: function(v){
      this.settings.brightness = clamp(v, 0.7, 1.0, 1.0);
      this.save();
      this.apply();
    },

    // 设置字号缩放
    setFontScale: function(v){
      this.settings.fontScale = clamp(v, 0.9, 1.2, 1.0);
      this.save();
      this.apply();
    },

    // 切换主题（亮↔暗）
    toggleTheme: function(){
      this.setTheme(this.settings.theme === 'dark' ? 'light' : 'dark');
    },

    // 初始化：加载并应用
    init: function(){
      this.load();
      this.apply();
    }
  };

  function clamp(v, min, max, def){
    v = parseFloat(v);
    if (isNaN(v)) return def;
    if (v < min) return min;
    if (v > max) return max;
    return v;
  }

  Theme.init();
  window.NotesTheme = Theme;
})(window);
