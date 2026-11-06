/**
 * 笔记更新管理器
 * 离线为主：App 打包时内置全部笔记，file:// 直接读取，秒开
 * 联网更新：点"检查更新"按钮，从多源容错拉最新 manifest.json，对比版本号，下载新增/变更文件缓存到 localStorage
 * 之后优先读缓存，没有缓存再读本地文件
 *
 * 多源容错：按优先级尝试多个 CDN，哪个通就用哪个，单一平台挂了不影响更新
 * 代码只需 git push 到 GitHub，所有 CDN 镜像自动同步
 */
(function(window){
  'use strict';

  // 多个更新源（按优先级排序，逐个尝试，哪个通用哪个）
  // GitHub Raw 优先：实时反映 git 最新 commit，不受 CDN 同步延迟影响
  // jsDelivr 系列作备份：GitHub Raw 偶尔限流时兜底
  var REMOTE_SOURCES = [
    'https://raw.githubusercontent.com/hanyu-3968/java-interview-note/main/notes-site/',   // GitHub Raw 主源（实时，慢但准）
    'https://cdn.jsdelivr.net/gh/hanyu-3968/java-interview-note@main/notes-site/',        // jsDelivr 备源（快，但有同步延迟）
    'https://fastly.jsdelivr.net/gh/hanyu-3968/java-interview-note@main/notes-site/',     // Fastly jsDelivr 镜像
    'https://gcore.jsdelivr.net/gh/hanyu-3968/java-interview-note@main/notes-site/'       // gcore jsDelivr 镜像
  ];
  var MANIFEST_FILE = 'manifest.json';
  var CACHE_PREFIX = 'note_cache_';   // localStorage 缓存键前缀
  var CACHE_MANIFEST_KEY = 'note_cache_manifest';

  var Updater = {
    // 当前本地 manifest（打包时内置的）
    localManifest: null,
    // 最新远程 manifest
    remoteManifest: null,
    // init 是否完成
    _ready: false,

    // 初始化：异步读取本地 manifest.json
    init: function(){
      var self = this;
      // fetch 本地 manifest.json（file:// 下同目录 fetch 可行）
      return fetch('manifest.json', { cache: 'no-cache' })
        .then(function(r){ if(!r.ok) throw new Error('HTTP ' + r.status); return r.json(); })
        .then(function(m){
          self.localManifest = m;
          self._ready = true;
        })
        .catch(function(e){
          console.warn('读取本地 manifest.json 失败，使用空版本', e);
          self.localManifest = { version: '0', files: [] };
          self._ready = true;
        });
    },

    // 取当前生效的 manifest（远程缓存 > 本地内置）
    getActiveManifest: function(){
      try {
        var cached = localStorage.getItem(CACHE_MANIFEST_KEY);
        if (cached) {
          var parsed = JSON.parse(cached);
          if (parsed && parsed.version) return parsed;
        }
      } catch(e){}
      return this.localManifest || { version: '0', files: [] };
    },

    // 多源容错 fetch：逐个尝试 REMOTE_SOURCES，哪个通用哪个
    // 返回 {text, source} 或抛错（全部源都失败）
    // cacheKey: 可选，若提供则成功后缓存到 localStorage
    fetchWithFallback: function(filePath, asJson){
      var sources = REMOTE_SOURCES.slice();
      var self = this;
      function tryNext(i){
        if(i >= sources.length) {
          throw new Error('所有更新源都不可用（共尝试 ' + sources.length + ' 个）');
        }
        var url = sources[i] + filePath + '?t=' + Date.now();
        return fetch(url, { cache: 'no-store' })
          .then(function(r){
            if(!r.ok) throw new Error('HTTP ' + r.status);
            return asJson ? r.json() : r.text();
          })
          .then(function(data){
            self._activeSource = sources[i]; // 记住成功的源，后续下载优先用它
            return data;
          })
          .catch(function(e){
            // 这个源失败，试下一个
            return tryNext(i + 1);
          });
      }
      return tryNext(0);
    },

    // 检查更新：返回 {hasUpdate, remote, local, newFiles}
    checkUpdate: function(){
      var self = this;
      return this.fetchWithFallback(MANIFEST_FILE, true)
        .then(function(remote){
          self.remoteManifest = remote;
          var local = self.getActiveManifest();
          var hasUpdate = remote.version !== local.version;
          // 找出新增/变更文件
          var newFiles = [];
          if (hasUpdate && remote.files) {
            remote.files.forEach(function(f){
              if (local.files.indexOf(f) === -1) newFiles.push(f);
            });
          }
          return { hasUpdate: hasUpdate, remote: remote, local: local, newFiles: newFiles };
        });
    },

    // 下载新文件并缓存到 localStorage
    // 注意：localStorage 单 key 限制约 5MB，大文件（SVG）不缓存，只缓存 md/json 等小文件
    downloadFiles: function(fileList){
      var self = this;
      var results = { ok: [], fail: [] };
      var MAX_CACHE_SIZE = 2 * 1024 * 1024; // 单文件超 2MB 不缓存（SVG 太大）

      var chain = Promise.resolve();
      fileList.forEach(function(f){
        chain = chain.then(function(){
          return self.fetchWithFallback(f, false)
            .then(function(text){
              if (text.length < MAX_CACHE_SIZE) {
                try {
                  localStorage.setItem(CACHE_PREFIX + f, text);
                  results.ok.push(f);
                } catch(e) {
                  // localStorage 满了，跳过缓存
                  results.fail.push(f);
                }
              } else {
                // 大文件不缓存，标记为跳过（不影响功能，下次仍读本地）
                results.ok.push(f);
              }
            })
            .catch(function(e){
              results.fail.push(f);
              console.warn('下载失败: ' + f, e);
            });
        });
      });
      return chain.then(function(){
        // 下载完，更新本地 manifest 缓存
        if (self.remoteManifest) {
          try {
            localStorage.setItem(CACHE_MANIFEST_KEY, JSON.stringify(self.remoteManifest));
          } catch(e){}
        }
        return results;
      });
    },

    // 读取文件内容：优先缓存，没有则尝试多种方式读本地文件
    // HBuilderX App 的 WebView 对 file:// fetch 可能有限制，所以加 XHR 和 plus.io 回退
    // 返回 Promise<string>
    read: function(path){
      var cacheKey = CACHE_PREFIX + path;
      try {
        var cached = localStorage.getItem(cacheKey);
        if (cached !== null) return Promise.resolve(cached);
      } catch(e){}
      // 没缓存，尝试多种方式读本地文件
      return this._readLocal(path);
    },

    // 多策略读取本地文件：fetch → XHR → plus.io
    _readLocal: function(path){
      var self = this;
      // 策略 1：fetch
      return fetch(path, { cache: 'no-cache' })
        .then(function(r){
          if(!r.ok) throw new Error('fetch HTTP ' + r.status);
          return r.text();
        })
        .catch(function(fetchErr){
          // 策略 2：XMLHttpRequest（同步 file:// 读取，绕过 fetch 的 CORS 限制）
          return new Promise(function(resolve, reject){
            try {
              var xhr = new XMLHttpRequest();
              xhr.open('GET', path, true);
              xhr.responseType = 'text';
              xhr.onload = function(){
                if(xhr.status === 200 || xhr.status === 0){
                  resolve(xhr.responseText);
                } else {
                  reject(new Error('XHR HTTP ' + xhr.status));
                }
              };
              xhr.onerror = function(){
                reject(new Error('XHR onerror'));
              };
              xhr.send();
            } catch(e){
              reject(new Error('XHR 异常: ' + e.message));
            }
          }).catch(function(xhrErr){
            // 策略 3：plus.io（HBuilderX 5+ 原生文件读取）
            if(window.plus && window.plus.io){
              return new Promise(function(resolve, reject){
                try {
                  // plus.io 用相对路径，需要转成绝对路径
                  plus.io.resolveLocalFileSystemURL(path, function(entry){
                    entry.file(function(file){
                      var reader = new plus.io.FileReader();
                      reader.onloadend = function(e){
                        resolve(e.target.result);
                      };
                      reader.onerror = function(){
                        reject(new Error('plus.io read error'));
                      };
                      reader.readAsText(file);
                    }, function(){
                      reject(new Error('plus.io file error'));
                    });
                  }, function(){
                    reject(new Error('plus.io resolve error'));
                  });
                } catch(e){
                  reject(new Error('plus.io 异常: ' + e.message));
                }
              });
            }
            // 所有策略都失败，抛出汇总错误
            throw new Error('读取失败 [fetch:' + fetchErr.message + '][xhr:' + xhrErr.message + ']');
          });
        });
    },

    // 读 JSON：同 read 但解析
    readJSON: function(path){
      return this.read(path).then(function(text){ return JSON.parse(text); });
    },

    // 一键检查+下载更新
    // 返回 Promise<{updated:bool, newFiles:[], fail:[]}>
    sync: function(){
      var self = this;
      return this.checkUpdate()
        .then(function(info){
          if (!info.hasUpdate) {
            return { updated: false, newFiles: [], fail: [] };
          }
          if (info.newFiles.length === 0) {
            // 版本变了但没新文件，只更新 manifest
            try {
              localStorage.setItem(CACHE_MANIFEST_KEY, JSON.stringify(info.remote));
            } catch(e){}
            return { updated: true, newFiles: [], fail: [] };
          }
          return self.downloadFiles(info.newFiles)
            .then(function(res){
              return { updated: true, newFiles: res.ok, fail: res.fail };
            });
        });
    }
  };

  Updater._initPromise = Updater.init();
  window.NoteUpdater = Updater;
})(window);
