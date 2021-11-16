// ==UserScript==
// @name         掘金live2d插件
// @namespace    https://github.com/iota9star
// @version      0.1.0
// @description  为掘金页面添加live2d形象，辅助实现一些功能
// @require      https://cubism.live2d.com/sdk-web/cubismcore/live2dcubismcore.min.js
// @require      https://cdn.jsdelivr.net/gh/dylanNew/live2d/webgl/Live2D/lib/live2d.min.js
// @require      https://192.168.2.191:12345/public/bundle.min.js?41asdasdghfsassdaddasdaddasdasasdaasdasdasd
// @author       iota9star
// @match        juejin.cn/*
// @icon         https://www.google.com/s2/favicons?domain=juejin.cn
// @grant GM_setValue
// @grant GM_getValue
// @grant GM_xmlhttpRequest
// @run-at document-idle
// @connect      juejin.cn
// @connect      juejin.im
// @connect      juejin.org
// @connect      jsdelivr.net
// @connect      github.com
// @connect      hitokoto.cn
// @connect      jinrishici.com
// @connect      weibo.com
// @connect      weibo.cn
// @connect      bing.com
// ==/UserScript==

import "./index.scss";
import _config from "./config";
import { ls } from "./fake";
import solarLunar from "solarLunar";
import api from "./api";
import to from "await-to-js";
import { Application } from "@pixi/app";
import { Renderer } from "@pixi/core";
import { Ticker, TickerPlugin } from "@pixi/ticker";
import { InteractionManager } from "@pixi/interaction";
import { Live2DModel } from "pixi-live2d-display";
import { createApp } from "petite-vue";
import _merge from "lodash/merge";

// register the Ticker to support automatic updating of Live2D models
Application.registerPlugin(TickerPlugin);
Live2DModel.registerTicker(Ticker);

// register the InteractionManager to support automatic interaction of Live2D models
Renderer.registerPlugin("interaction", InteractionManager);

const {
  live2d: live2dElId,
  widget: widgetElId,
  msgbox: msgboxElId,
  config: configElId,
} = _config.domids;


const key = Symbol(_config.key);
if (window[key] && window[key].destroy) {
  window[key].destroy();
}

class JuejinLive2dPlugin {
  constructor(config) {
    this.app = null;
    const item = ls.getItem(config.key);
    const pConfig = !item ? {} : JSON.parse(item);
    this.config = _merge({}, config, pConfig);
    console.log(this.config);
    this.intervalSayConf = {
      sayExpire: 0,
      minDelay: 5000,
      maxRandomDelay: 3 * 60 * 1000,
      timer: null,
    };
    this.visible = true;
  }

  destroy() {
    const that = this;
    if (that.intervalSayConf.timer) {
      clearInterval(that.intervalSayConf.timer);
    }
    if (that.app) {
      that.app.destroy();
    }
  }

  initLive2d() {
    const that = this;
    that.insertLive2d();
    that.createLive2d();
    that.switchModel().catch(e => {
      console.log(e);
    });
    that.sayCheckin().catch(e => {
      console.log(e);
    });
    that.registerEvents();
    that.intervalSay();
    return that;
  }

  createLive2d() {
    const that = this;
    if (that.app) {
      that.app.destroy();
    }
    that.app = new Application({
      view: document.getElementById(live2dElId),
      autoStart: true,
      backgroundAlpha: 0,
    });
  }

  async loadLive2d(path) {
    const that = this;
    that.limitWidget();
    const model = await Live2DModel.from(path);
    const size = that.config.live2d.size;
    const width = model.width;
    const height = model.height;
    const ratio = width / height;
    let scale;
    let ww;
    let wh;
    if (width > height) {
      scale = size / width;
      ww = size;
      wh = Math.ceil(ww / ratio);
    } else {
      scale = size / height;
      wh = size;
      ww = Math.ceil(wh * ratio);
    }
    const widget = document.getElementById(live2dElId);
    widget.style.width = `${ww}px`;
    widget.style.height = `${wh}px`;
    let live2d = that.config.live2d;
    let { left, top } = live2d.position || { left: 0, top: 0 };
    that.addStyle(widget, "transform", `translate(${left}px,${top}px)`);
    model.scale.set(scale);
    if (that.app.stage.children.length) {
      that.app.stage.removeChildren();
    }
    that.app.stage.addChild(model);
    that.app.renderer.resize(ww, wh);
  }

  intervalSay() {
    const that = this;
    if (that.intervalSayConf.timer) {
      clearInterval(that.intervalSayConf.timer);
    }
    that.intervalSayConf.timer = setInterval(() => {
      const now = Date.now();
      if (now - that.intervalSayConf.sayExpire > that.intervalSayConf.minDelay) {
        that.sayRandom();
        that.intervalSayConf.sayExpire = now + Math.floor(Math.random() * that.intervalSayConf.maxRandomDelay + that.intervalSayConf.minDelay);
      }
    }, that.intervalSayConf.minDelay);
  }

  registerEvents() {
    const that = this;
    window.addEventListener("visibilitychange", () => {
      that.visible = !document.hidden;
      if (that.visible) that.showMsg("喵喵，欢迎回来～");
    });
  }

  insertLive2d() {
    const that = this;
    if (!document.getElementById(live2dElId)) {
      const config = that.config;
      const live2d = document.createElement("canvas");
      const { position } = config.live2d;
      if (position) {
        that.addStyle(live2d, "transform", `translate(${position.left}px,${position.top}px)`);
      } else {
        const { clientHeight } = document.documentElement;
        const top = clientHeight - config.live2d.size;
        that.config.live2d.position = { left: 0, top };
        that.addStyle(live2d, "transform", `translate(0px,${top}px)`);
      }
      live2d.id = live2dElId;
      live2d.draggable = config.live2d.draggable;
      let elX = 0;
      let elY = 0;
      let dragStartX = 0;
      let dragStartY = 0;
      live2d.ondragstart = (e) => {
        const { left, top } = e.target.getBoundingClientRect();
        elX = left;
        elY = top;
        dragStartX = e.clientX;
        dragStartY = e.clientY;
      };
      live2d.ondragend = (e) => {
        let left = e.clientX - (dragStartX - elX);
        let top = e.clientY - (dragStartY - elY);
        if (left < 0) {
          left = 0;
        }
        if (top < 0) {
          top = 0;
        }
        const { width, height } = e.target.getBoundingClientRect();
        const { clientWidth, clientHeight } = document.documentElement;
        if (left + width > clientWidth) {
          left = clientWidth - width;
        }
        if (top + height > clientHeight) {
          top = clientHeight - height;
        }
        config.live2d.position = { left, top };
        that.addStyle(live2d, "transform", `translate(${left}px,${top}px)`);
        that.syncConfig();
      };
      live2d.oncontextmenu = (e) => {
        e.preventDefault();
        that.showConfigPanel();
      };
      document.body.append(live2d);
    }
    if (!document.getElementById(widgetElId)) {
      const wrapper = document.createElement("div");
      wrapper.id = widgetElId;
      const box = document.createElement("div");
      box.id = msgboxElId;
      box.onclick = () => {
        that.sayRandom();
      };
      wrapper.append(box);
      const msgs = document.createElement("div");
      wrapper.append(msgs);
      const chatIn = document.createElement("input");
      chatIn.placeholder = "请输入...";
      chatIn.onkeydown = (e) => {
        if (e.key === "Enter") {
          const words = chatIn.value;
          if (words) {
            chatIn.value = "";
            while (msgs.children.length > 3) {
              msgs.removeChild(msgs.firstChild);
            }
            const msg = document.createElement("div");
            msg.setAttribute("class", "jlp-r-msg jlp-msg");
            msg.innerHTML = words;
            msgs.append(msg);
            api.talkWithXiaoIce(words).then((re) => {
              const reply = document.createElement("div");
              reply.setAttribute("class", "jlp-l-msg jlp-msg");
              reply.innerHTML = re || "发生错误啦，请稍候重试";
              msgs.append(reply);
            }).catch(e => {
              console.log(e);
            }).finally(() => {
            });
          }
        }
      };
      wrapper.append(chatIn);
      document.body.append(wrapper);
    }
  }


  showConfigPanel() {
    const that = this;
    if (!document.getElementById(configElId)) {
      const wrapper = document.createElement("div");
      wrapper.id = configElId;
      const dialog = document.createElement("div");
      wrapper.append(dialog);
      dialog.innerHTML = `<h2 class="f ai-c"><span class="f1">掘金Live2d插件配置</span><span @click="handleClose">&times;</span></h2>
<div class="f ai-c mb-16">
    <label for="draggable_jlp" class="mw64">启用拖拽</label>
    <input type="checkbox" @change="handleDraggableChange" v-model="config.live2d.draggable" id="draggable_jlp">
</div>
<div class="f ai-c mb-16">
    <label for="size_jlp" class="mw64">模型尺寸</label>
    <input id="size_jlp" min="100" max="1080" type="number" placeholder="尺寸" v-model.num="config.live2d.size" @blur="handleSizeInputBlur">
</div>
<div class="f ai-fs mb-16">
    <label class="mw64">使用模型</label>
    <div class="f ai-c fw-w">
        <label :for="item.key+'_jlp'" v-for="item in config.models" class="f ai-c fw-nw mr-8 mb-8">
            <input type="radio" v-model="selectedKey" :id="item.key+'_jlp'"
                   name="model" :value="item.key" class="mr-4" @change="handleSelectedModel(item)">
            {{item.key}}
        </label>
    </div>
</div>
<div class="f ai-c mb-8">
    <input type="text" placeholder="模型名称" v-model.trim="newModel.key" @focus="err=''" :disabled="newModel.inner"
           class="mr-8 f1">
    <input type="text" placeholder="模型地址" v-model.trim="newModel.value" @focus="err=''" :disabled="newModel.inner"
           class="mr-8 f2">
    <button @click="handleAddModel()" :disabled="newModel.inner">添加并使用</button>
</div>
<div v-if="err" style="color: red;">{{err}}</div>
<div class="loading" v-if="loading">{{loadingTips}}</div>
`;
      document.body.append(wrapper);
      const config = that.config;
      const selectedKey = config.live2d.model.key;
      createApp({
        config,
        selectedKey,
        newModel: {
          key: "",
          value: "",
        },
        err: "",
        loadingTips: "加载中...",
        loading: false,
        handleSelectedModel(model) {
          this.config.live2d.model = model;
          this.selectedKey = model.key;
          this.showLoading("切换模型中，请稍候...");
          that.switchModel(model.value).then(() => {
            that.config = this.config;
            that.syncConfig();
          }).catch(e => {
            console.log(e);
          }).finally(() => {
            this.hideLoading();
          });
        },
        showLoading(tips) {
          this.loadingTips = tips || "加载中...";
          this.loading = true;
        },
        hideLoading() {
          setTimeout(() => {
            this.loading = false;
          }, 500);
        },
        handleDraggableChange() {
          document.getElementById(live2dElId).draggable = !!this.config.live2d.draggable;
          that.config = this.config;
          that.syncConfig();
        },
        handleAddModel() {
          const { key, value } = this.newModel;
          if (!key) {
            this.err = "模型名称不能为空";
            return;
          }
          if (!value) {
            this.err = "模型地址不能为空";
            return;
          }

          if (!/^http[s]?:\/\//.test(value)) {
            this.err = "请填写正确的模型地址";
            return;
          }

          if (config.models.some(it => it.key === key)) {
            this.err = "模型名称已存在";
            return;
          }
          this.config.models = [...this.config.models, { ...this.newModel }];
          that.config = this.config;
          this.selectedKey = this.newModel.key;
          this.showLoading("加载模型中，请稍候...");
          that.switchModel(this.newModel.value).then(() => {
            that.config = this.config;
            that.syncConfig();
          }).catch(e => {
            console.log(e);
          }).finally(() => {
            this.hideLoading();
          });
          this.newModel = {
            key: "",
            value: "",
          };
        },
        handleClose() {
          document.getElementById(configElId).style.display = "none";
        },
        handleSizeInputBlur() {
          this.showLoading("重新布局中，请稍候...");
          that.relayoutWidget().then((val) => {
            if (val) {
              that.syncConfig();
            }
          }).catch(e => {
            console.log(e);
          }).finally(() => {
            this.hideLoading();
          });
        },
      }).mount(dialog);
    }
    document.getElementById(configElId).style.display = "block";
  }

  limitWidget() {
    const that = this;
    const live2d = that.config.live2d;
    const { clientWidth, clientHeight } = document.documentElement;
    let { left, top } = live2d.position;
    let size = live2d.size;
    let maxSize = Math.min(clientWidth, clientHeight);
    if (size > maxSize) {
      size = maxSize;
    }
    if (size < 100) {
      size = 100;
    }
    if (left < 0) {
      left = 0;
    }
    if (top < 0) {
      top = 0;
    }
    if (left + size > clientWidth) {
      left = clientWidth - size;
    }
    if (top + size > clientHeight) {
      top = clientHeight - size;
    }
    live2d.size = size;
    live2d.position = { left, top };
    that.syncConfig();
  }

  async relayoutWidget() {
    const that = this;
    let live2d = that.config.live2d;
    const [err] = await to(that.switchModel(live2d.model.value));
    return !err;
  }

  addStyle(el, key, value) {
    const vendorKeys = ["moz", "ms", "o", "webkit"].map(it => it + key.toLowerCase());
    Object.keys(el.style).filter(it => it === key || vendorKeys.includes(it.toLowerCase())).forEach(it => {
      el.style[it] = value;
    });
  }

  async switchModel(nameOrPath) {
    const that = this;
    nameOrPath = nameOrPath || that.config.live2d.model.value;
    console.log(nameOrPath);
    if (/http[s]?:\/\//.test(nameOrPath)) {
      await that.loadLive2d(nameOrPath);
      return;
    }
    const path = `${that.config.publicUrl}/${nameOrPath}`;
    await that.loadLive2d(path);
  }

  showMsg(msg) {
    const that = this;
    that.showDom(`<div class="smsg" title="${msg.replace(/"/gm, "&quot;")}">${msg.replace(/\n/gm, "<br/>")}</div>`);
  }

  showDom(domStr, style) {
    const that = this;
    const box = document.getElementById(msgboxElId);
    if (!style) {
      style = {
        backgroundColor: "#fff",
        padding: "12px",
        fontSize: "12px",
      };
    }
    for (let [key, value] of Object.entries(style)) {
      that.addStyle(box, key, value);
    }
    box.innerHTML = domStr;
  }

  syncConfig() {
    const that = this;
    setTimeout(() => {
      ls.setItem(that.config.key, JSON.stringify(that.config));
      console.log(that.config);
    }, 0);
  }

  sayRandom() {
    const that = this;
    if (!that.visible) {
      return;
    }
    const messageType = [
      that.sayHi, that.sayTime, that.sayCheckin, that.sayCoderCalendar,
      that.sayGrowth, that.sayHitokoto, that.sayShici, that.sayStatistic,
      that.sayAdvert, that.sayEvent, that.sayWeibo,
    ];
    const index = Math.floor(Math.random() * messageType.length);
    const promise = messageType[index].call(that);
    if (promise && promise instanceof Promise) {
      promise.catch((e) => {
        console.log(e);
      });
    }
  }

  async sayWeibo() {
    const that = this;
    const [err, data] = await to(api.weiboTop());
    if (err || !data) return;
    const { word } = data;
    const domStr = `<p style="padding-bottom: 8px;margin-bottom: 8px;border-bottom: 1px solid #f4f4f4;">微博热搜</p><a href="https://s.weibo.com/weibo?q=${encodeURIComponent(word)}&Refer=realtime_weibo" style="text-decoration: none;color: #ff7d00;" target="_blank">${word}</a>`;
    that.showDom(domStr);
  }

  async sayEvent() {
    const that = this;
    const [err, data] = await to(api.event());
    if (err || !data) return;
    const { image_center_web: picture, url, title } = data;
    const domStr = `<a href="${url}" style="text-decoration: none;"><img style="width: 100%;border-radius: 12px;" src="${picture}" alt="${title}"></a>`;
    that.showDom(domStr, {
      backgroundColor: "transparent",
      padding: "0px",
      fontSize: "0px",
    });
  }

  async sayAdvert() {
    const that = this;
    const [err, data] = await to(api.adverts());
    if (err || !data) return;
    const { picture, url, title } = data;
    const domStr = `<a href="${url}" style="text-decoration: none;"><img style="width: 100%;border-radius: 12px;" src="${picture}" alt="${title}"></a>`;
    that.showDom(domStr, {
      backgroundColor: "transparent",
      padding: "0px",
      fontSize: "0px",
    });
  }

  async sayStatistic() {
    const that = this;
    const map = {
      all_article: "文章总数",
      all_article_collect: "文章收藏数",
      all_article_view: "文章阅读数",
      all_article_digg: "文章点赞数",
      all_article_comment: "文章评论数",
      all_column: "总专栏数",
      all_column_follow: "专栏关注数",
      all_short_msg: "总沸点数",
      all_short_msg_digg: "沸点赞数",
      all_short_msg_comment: "沸点评论数",
      all_follower: "总关注者",
      incr_active_follower: "活跃关注者",
      incr_do_follower: "新增关注者",
      incr_undo_follower: "取消关注",
      incr_follower: "净增关注",
    };
    const [err, data] = await to(api.statistic(Object.keys(map)));
    if (err || !data) return;
    let domStr = "";
    const { date, datas = {} } = data;
    for (let [key, { cnt, than_before }] of Object.entries(datas)) {
      let name = map[key];
      domStr += `
                <div>
                    <p>${name}</p>
                    <p>${cnt.toLocaleString()}</p>
                    <p>${than_before === 0 ? "平" : than_before > 0 ? `增` : `减`} <span class="${than_before === 0 ? "n" : than_before > 0 ? `i` : `d`}">${than_before === 0 ? "--" : than_before > 0 ? `${than_before.toLocaleString()} ↑` : `${Math.abs(than_before).toLocaleString()} ↓`}</span></p>
                </div>
            `;
    }
    that.showDom(`<div class="stat"><h3>${date} 统计</h3>${domStr}<p>喵喵，主人加油哦</p><div>`);
  }

  sayHi() {
    const that = this;
    const now = new Date().getHours();
    let text;
    if (now > 5 && now <= 7) text = "喵喵，我的早餐呢！";
    else if (now > 7 && now <= 11) text = "喵喵，我要喝水。立刻马上！！！";
    else if (now > 11 && now <= 13) text = "喵喵，吃完饭要记得好好休息一下哦";
    else if (now > 13 && now <= 17) text = "喵喵，午后很容易犯困呢，今天的运动目标完成了吗？";
    else if (now > 17 && now <= 19) text = "喵喵，傍晚了！窗外夕阳的景色很美丽呢，最美不过夕阳红～";
    else if (now > 19 && now <= 21) text = "喵喵，今天好好锻炼了吗？";
    else if (now > 21 && now <= 23) text = "喵喵，已经这么晚了呀，我要起床啦";
    else text = "喵喵，这么晚了，你是要给我准备早餐了吗？";
    that.showMsg(text);
  }

  async sayCheckin() {
    const that = this;
    const [err1, status] = await to(api.growthStatus());
    if (err1) {
      return undefined;
    }
    if (status) {
      return that.sayGrowth();
    }
    const [err2, data] = await to(api.checkIn());
    if (err2 || !data) return;
    const { incr, sum, lotteryName, lotteryImage } = data;
    let domStr = `
            喵喵，我已经帮您签到抽奖啦。获得矿石 <b style="color: #ff7d00">+${incr}</b> ，您现在共有 <b style="color: #ff7d00">${sum}</b> 矿石
        `;
    if (lotteryName) {
      domStr += `<p style="vertical-align: middle;">免费抽奖获得 <img style="height: 24px;" src="${lotteryImage}" alt="${lotteryName}"> <b style="color: #ff7d00">${lotteryName}</b><p/>`;
    }
    that.showDom(domStr);
  }

  async sayGrowth() {
    const that = this;
    const [err, data] = await to(api.growthCount());
    if (err || !data) return;
    const { count, sum } = data;
    let domStr = `喵喵，主人已经连续签到 <b style="color: #ff7d00;">${count}</b> 天啦，总共签到 <b style="color: #ff7d00;">${sum}</b>天。`;
    const [, dat] = await to(api.growthPoints());
    if (dat) {
      domStr += `您现在共有 <b style="color: #ff7d00;">${dat}</b> 矿石`;
    }
    that.showDom(domStr);
  }

  async sayCoderCalendar() {
    const that = this;
    const [err, data] = await to(api.coderCalendar());
    if (err || !data) return;
    const { aphorism, shouldOrNot } = data;
    let domStr = `
            <p style="padding-bottom: 8px;">喵喵，今日 <b style="color: #ff7d00;">${shouldOrNot}</b></p>
            <p style="border-top: 1px solid #f4f4f4;padding-top: 8px;"><b>${aphorism}</b></p>
        `;
    that.showDom(domStr);
  }

  async sayHitokoto() {
    const that = this;
    const [err, data] = await to(api.hitokoto());
    if (err || !data) return;
    const { from, hitokoto } = data;
    let domStr = `
            <p style="padding-bottom: 8px;">喵喵，来自 <b style="color: #ff7d00;">${from}</b> 的一言</p>
            <p style="border-top: 1px solid #f4f4f4;padding-top: 8px;"><b>${hitokoto}</b></p>
        `;
    that.showDom(domStr);
  }

  async sayShici() {
    const that = this;
    const [err, data] = await to(api.shici());
    if (err || !data) return;
    const { origin, content, author } = data;
    let domStr = `
            <p style="padding-bottom: 8px;">喵喵，来自 <b style="color: #ff7d00;">${author}</b> 的诗词</p>
            <p style="border-top: 1px solid #f4f4f4;padding-top: 8px;"><b>${[content, origin].filter(it => !!it).join(" - ")}</b></p>
        `;
    that.showDom(domStr);
  }

  sayTime() {
    const that = this;
    const date = new Date();
    const month = date.getMonth() + 1;
    const day = date.getDate();
    const hours = date.getHours().toString().padStart(2, "0");
    const minutes = date.getMinutes().toString().padStart(2, "0");
    const seconds = date.getSeconds().toString().padStart(2, "0");
    const solarlunar = solarLunar.solar2lunar(date.getFullYear(), month, day);
    const domStr = `
        喵喵，此刻就是你我的永恒吗
        <p style="line-height: 1.25;margin-top: 8px;padding-top: 8px;border-top: 1px solid #f4f4f4;">${month}月${day}日，${solarlunar.ncWeek}</p>
        <p style="line-height: 1.25;">${solarlunar.monthCn}${solarlunar.dayCn} ${solarlunar.term} ${hours}:${minutes}:${seconds}</p>
    `;
    that.showDom(domStr);
  }
}

window[key] = new JuejinLive2dPlugin(_config).initLive2d();

