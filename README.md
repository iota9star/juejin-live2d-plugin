# 掘金Live2d插件

### 功能

先来说说现在已有的功能吧，内置两只猫猫**白猫山药泥**与**黑猫羊栖菜**

- 支持拖拽
- 支持配置大小、拖拽
- 支持自定义模型
- 支持和微软小冰对话
- 支持一些奇奇怪怪的的功能：一言、诗词
- 支持一些问候
- 支持掘金相关功能：自动签到并抽奖、查看用户相关的统计信息、查看掘金相关活动卡片


### 使用到的工具

凑凑字数，来讲讲这个脚本用到的工具和三方库

- 使用 **rollup** 打包
- 使用 **sass** 编写样式
- 使用 **pixi-live2d-display** 来展示 **live2d**
- 使用 **petite-vue** 来交互配置

Rollup打包这种脚本是真的好使，配置简单，打包体积小。我们编写完脚本和样式，直接梭哈成一个**iife**脚本，直接在油猴 **@require** 引入即可。**petite-vue** 这个尤大的小玩意儿用在这种场景真的完美搭配，告别了一丢丢的dom操作，非常的完美。各位同学一定要亲自尝试一下，真的好使。


### 展示时间

- 展示统计信息


![image.png](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/91a5161990a54fd3a4d962c8b3b019b2~tplv-k3u1fbpfcp-watermark.image?)

- 展示配置信息


![image.png](https://p1-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/0d70b8726b6044a9acd27a90b0d39997~tplv-k3u1fbpfcp-watermark.image?)

- 展示签到


![image.png](https://p6-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/9bf73a6cbf14465c831356d717df2e89~tplv-k3u1fbpfcp-watermark.image?)

- 换个靓妹


![demo.gif](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/af0ef569635f4d459eea1abf41d20b7c~tplv-k3u1fbpfcp-watermark.image?)

GIF录制帧数和像素有点糊，实际效果还是不错的。猛男喜欢的纸片人，YYDS

### 使用

#### 方式一（推荐方式）

- 打开油猴管理面板，切换到 **实用工具** 菜单  
- 往 **从URL安装** 表单输入下面地址，点击 **安装** 安装按钮即可  

> `https://raw.githubusercontent.com/iota9star/juejin-live2d-plugin/master/.tampermonkeymeta?v=0.2.0`  
> PS: 如果上述地址无法安装，则尝试使用下面地址  
> `https://cdn.jsdelivr.net/gh/iota9star/juejin-live2d-plugin@master/.tampermonkeymeta?v=0.2.0`  

#### 方式二

直接打开油猴，选择添加脚本，把下面的内容贴进去就OK了

```tampermonkeymeta
// ==UserScript==
// @name         掘金live2d插件
// @namespace    https://github.com/iota9star/juejin-live2d-plugin
// @description  为掘金页面添加live2d形象，辅助实现一些功能
// @author       iota9star
// @match        juejin.cn/*
// @version      0.2.0
// @icon         https://lf3-cdn-tos.bytescm.com/obj/static/xitu_juejin_web/6bdafd801c878b10edb5fed5d00969e9.svg
// @require      https://cubism.live2d.com/sdk-web/cubismcore/live2dcubismcore.min.js
// @require      https://cdn.jsdelivr.net/gh/dylanNew/live2d/webgl/Live2D/lib/live2d.min.js
// @require      https://cdn.jsdelivr.net/gh/iota9star/juejin-live2d-plugin@master/public/bundle.0.2.0.min.js
// @grant        GM_setValue
// @grant        GM_getValue
// @grant        GM_xmlhttpRequest
// @run-at       document-idle
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
// @connect      shadiao.app
// @connect      yduanzi.com
// ==/UserScript==
```

### 版本更新

- 0.2.0

> 支持更多配置信息  
> 添加禁用页面配置，如编辑文章页禁用  
> 新增彩虹屁，毒鸡汤，网易云段子

- 0.1.2

> 修复调整尺寸时，可能切换其他模型的问题

- 0.1.1  

> 添加个人数据统计文章展现量  
> 移除一些无用的打印信息