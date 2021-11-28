import { get, post } from "./fake";
import to from "await-to-js";
import { cr, encrypt } from "./xiaoiceaes";


export default {
  xiaoiceStore: {},
  /**
   * 获取掘金活动
   * {"err_no":0,"err_msg":"success","data":[{"id":1,"advert_id":"1","user_id":"0","item_id":"0","item_type":0,"platform":1,"layout":1,"position":100,"advert_type":0,"station_type":0,"author_name":"","author_id":0,"title":"","brief":"","url":"https://juejin.cn/post/7024369534119182367?utm_source=webbanner\u0026utm_medium=banner\u0026utm_campaign=catcat_2021111","picture":"https://p9-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/496fb4041fe546f4b6a04f41fcdf20d6~tplv-k3u1fbpfcp-watermark.image?","avatar":"","start_time":"0","end_time":"0","ctime":"1635496534","mtime":"1635496534","sale_count":0,"sale_price":0,"discount_rate":0,"digg_count":0,"comment_count":0,"topic":"","topic_id":"0","status":1},{"id":1468,"advert_id":"7025439706649198626","user_id":"0","item_id":"0","item_type":0,"platform":2608,"layout":1,"position":100,"advert_type":0,"station_type":0,"author_name":"","author_id":0,"title":"","brief":"","url":"https://juejin.cn/user/center/welfare?type=1\u0026from=lucky_lottery_menu_bar","picture":"https://p1-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/4a49e41d7fb344e988a7350a678861aa~tplv-k3u1fbpfcp-watermark.image?","avatar":"","start_time":"0","end_time":"0","ctime":"1635752434","mtime":"1635776010","sale_count":0,"sale_price":0,"discount_rate":0,"digg_count":0,"comment_count":0,"topic":"","topic_id":"0","status":1}],"cursor":"0","count":2,"has_more":true}
   * @returns {Promise<string>}
   */
  async adverts() {
    const [err, resp] = await to(post("https://api.juejin.cn/content_api/v1/advert/query_adverts", {
      data: JSON.stringify({
        "position": 100,
        "platform": 2608,
        "layout": 1,
      }),
    }));
    if (err || !resp) return undefined;
    const data = resp.data || [];
    const index = Math.floor(Math.random() * data.length);
    return data[index];
  },
  /**
   * 文章活动和沸点活动
   * {"err_no":0,"err_msg":"success","data":[{"id":3554,"title":"【沸常六加一｜来沸点砸彩蛋赢千元好礼！】","url":"https://juejin.cn/pin/7028022075142963214?utm_source=czzbanner\u0026utm_medium=banner\u0026utm_campaign=double11","screenshot":"","city":"","event_start_time":1636300800,"event_end_time":1636732740,"event_type":26,"event_id":"7026998054272106534","brief":"双十一沸点也疯狂，沸常六加一重磅来袭！本次活动准备了一个丰厚奖池，而且采取了六加一的老玩法——砸彩蛋！参与活动还有机会拿千元大礼包！","image_banner_web":"https://p6-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/093a847548af4e0084d5ec8638c39bed~tplv-k3u1fbpfcp-watermark.image?","image_banner_app":"https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/1ec0cf134025472093518c9582698f31~tplv-k3u1fbpfcp-watermark.image?","image_center_web":"https://p9-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/9289a6ad73c94bc1bc1cd8fbacf649fd~tplv-k3u1fbpfcp-watermark.image?","image_center_app":"https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/585ab5e59f5b45e78ae14d00c139e9f6~tplv-k3u1fbpfcp-watermark.image?"},{"id":3537,"title":"“我与掘金小册”的故事有奖征集🎁","url":"https://juejin.cn/post/7021780163616571423","screenshot":"","city":"","event_start_time":1634832000,"event_end_time":1636732740,"event_type":26,"event_id":"7023562033643651109","brief":"参与沸点话题#分享·我与掘金小册#，最高赢「2022小册全年免费学+100京东卡」！","image_banner_web":"https://p9-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/e938bd6a209c438abb55ab3ae40497fd~tplv-k3u1fbpfcp-watermark.image?","image_banner_app":"https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/51bcfedac811414bbc10ee8111e6143b~tplv-k3u1fbpfcp-watermark.image?","image_center_web":"https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/3d1d2240c411465f8863fdfdd04a3cbc~tplv-k3u1fbpfcp-watermark.image?","image_center_app":"https://p6-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/6b4331afe7e54d12b8dc686c324d9d53~tplv-k3u1fbpfcp-watermark.image?"}],"count":2}
   * @returns {Promise<undefined|*>}
   */
  async event() {
    const [err, resp] = await to(post("https://api.juejin.cn/study_api/v1/events/get_by_page", {
      data: JSON.stringify({
        "category_id": "0",
        "event_type": Math.random() < 0.5 ? 25 : 26,
        "page_no": 1,
        "page_size": 12,
        "status": 1,
      }),
    }));
    if (err || !resp) return undefined;
    const data = resp.data || [];
    const index = Math.floor(Math.random() * data.length);
    return data[index];
  },
  async weiboTop() {
    const [err, resp] = await to(get("https://api.weibo.cn/2/guest/search/hot/word"));
    if (err || !resp) return undefined;
    const data = resp.data || [];
    const index = Math.floor(Math.random() * data.length);
    return data[index];
  },
  /**
   * {"err_no":0,"err_msg":"success","data":{"date":"2021-11-02","datas":{"all_article_collect":{"cnt":1,"than_before":2},"all_article_comment":{"cnt":1,"than_before":0},"all_article_digg":{"cnt":1,"than_before":0},"all_article_view":{"cnt":1,"than_before":1},"all_follower":{"cnt":1,"than_before":1}}}}
   * @returns {Promise<{date, datas}>}
   * @param types
   */
  async statistic(types = []) {
    const [, userId] = await to(this.profile());
    if (!userId) return undefined;
    const params = {
      datas: types,
      "user_id": userId,
    };
    const [err, resp] = await to(post("https://api.juejin.cn/content_api/v1/author_center/data/card", {
      data: JSON.stringify(params),
    }));
    if (err || !resp) return undefined;
    const {
      date,
      datas,
    } = resp.data || {};
    return { date, datas };
  },
  /**
   * 签到统计
   * {"err_no":0,"err_msg":"success","data":{"cont_count":1,"sum_count":1}}
   * @returns {Promise<{count: number, sum: number}>}
   */
  async growthCount() {
    const [err, { data }] = await to(get("https://api.juejin.cn/growth_api/v1/get_counts"));
    if (err) return undefined;
    const { cont_count: count = 0, sum_count: sum = 0 } = data || {};
    return { count, sum };
  },
  /**
   * 签到状态
   * {"err_no":0,"err_msg":"success","data":true}
   * @returns {Promise<boolean>}
   */
  async growthStatus() {
    const [err, resp] = await to(get("https://api.juejin.cn/growth_api/v1/get_today_status"));
    if (err || !resp) return undefined;
    return !!resp.data;
  },
  /**
   * 矿石数
   * {"err_no":0,"err_msg":"success","data":1}
   * @returns {Promise<number>}
   */
  async growthPoints() {
    const [err, resp] = await to(get("https://api.juejin.cn/growth_api/v1/get_cur_point"));
    if (err || !resp) return undefined;
    return resp.data;
  },
  /**
   * 今日日历
   * {"err_no":0,"err_msg":"success","data":{"aphorism":"女友是私有变量，只有我这个类才能调用","should_or_not":"宜打DOTA"}}
   * @returns {Promise<{aphorism: string, shouldOrNot: string}>}
   */
  async coderCalendar() {
    const [err, resp] = await to(get("https://api.juejin.cn/growth_api/v1/get_coder_calendar"));
    if (err || !resp) return undefined;
    const { aphorism = "", should_or_not: shouldOrNot = "" } = resp.data || {};
    return { aphorism, shouldOrNot };
  },
  /**
   * 签到
   * {"err_no":0,"err_msg":"success","data":{"incr_point":1,"sum_point":1}}
   * @returns {Promise<{incr: number, sum: number}>}
   */
  async checkIn() {
    const [err, resp] = await to(post("https://api.juejin.cn/growth_api/v1/check_in"));
    if (err || !resp) return undefined;
    const { incr_point: incr = 0, sum_point: sum = 0 } = (resp || {}).data || {};
    const [, dat] = await to(this.draw());
    return { incr, sum, ...(dat || {}) };
  },
  /**
   * 抽奖
   * {"err_no":0,"err_msg":"success","data":{"id":19,"lottery_id":"xxxx","lottery_name":"66矿石","lottery_type":1,"lottery_image":"https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/32ed6a7619934144882d841761b63d3c~tplv-k3u1fbpfcp-no-mark:0:0:0:0.image","lottery_desc":"","history_id":"xxxxxx"}}
   * @returns {Promise<{lotteryImage, lotteryName: string}>}
   */
  async draw() {
    const [err, resp] = await to(post("https://api.juejin.cn/growth_api/v1/lottery/draw"));
    if (err || !resp) return undefined;
    const { lottery_name: lotteryName = "", lottery_image: lotteryImage } = resp.data || {};
    return { lotteryName, lotteryImage };
  },
  async yunduanzi() {
    const [err, resp] = await to(get("https://www.yduanzi.com/duanzi/getduanzi", {
      headers: {
        "HOST": "www.yduanzi.com",
        "Origin": "https://www.yduanzi.com",
        "Referer": "https://www.yduanzi.com/?utm_source=shadiao.app",
        "content-type": "application/json",
      },
    }));
    if (err || !resp) return undefined;
    const { duanzi, qiafan } = resp || {};
    if (qiafan) return undefined;
    return duanzi;
  },
  async rainbowfart() {
    const [err, resp] = await to(get("https://chp.shadiao.app/api.php", {
      responseType: "text",
      headers: {
        "content-type": "text/html",
        "referer": "https://chp.shadiao.app/",
      },
    }));
    if (err || !resp) return undefined;
    return resp;
  },
  async jitang() {
    const [err, resp] = await to(get("https://du.shadiao.app/api.php", {
      responseType: "text",
      headers: {
        "content-type": "text/html",
        "referer": "https://du.shadiao.app/",
      },
    }));
    if (err || !resp) return undefined;
    return resp;
  },
  async hitokoto() {
    const [err, resp] = await to(get("https://v1.hitokoto.cn/"));
    if (err || !resp) return undefined;
    return resp;
  },
  async shici() {
    const [err, resp] = await to(get("https://v1.jinrishici.com/all.json"));
    if (err || !resp) return undefined;
    return resp;
  },
  /**
   * 获取登录账号 profileId
   * {"err_no":0,"err_msg":"success","data":{"profile_id":"xxxxxxx"}}
   * @returns {Promise<undefined|string>}
   */
  async profile() {
    const [err, resp] = await to(get("https://api.juejin.cn/user_api/v1/user/profile_id"));
    if (err || !resp) return undefined;
    const { profile_id: profileId } = resp.data || {};
    return profileId;
  },
  async xiaoiceConfig() {
    const [err, resp] = await to(get("https://cn.bing.com/search?q=%E5%B0%8F%E5%86%B0", {
      responseType: "text",
      headers: {
        "content-type": "text/html",
      },
    }));
    if (err || !resp) return undefined;
    try {
      let matched = /var\s+config\s*=({.*conversationId.*?})/gm.exec(resp.toString());
      let cs = matched[1];
      if (cs) {
        this.xiaoiceStore.config = JSON.parse(cs);
      }
    } catch (e) {

    }
  },
  async talkWithXiaoIce(words) {
    const { config: _conf = {} } = this.xiaoiceStore;
    let from;
    if (!_conf.conversationId) {
      await to(this.xiaoiceConfig());
      from = "searchbox";
    } else {
      from = "chatbox";
    }
    const { config = {}, lastStr = "", lastTime = "" } = this.xiaoiceStore;
    if (!config.conversationId) return undefined;
    const params = {
      conversationId: config.conversationId,
      from: from,
      query: {
        normalizedQuery: encrypt(words, config.ZoAESPassword, config.ZoAESBitCount),
      },
      traceId: config.traceId,
      zoIsGCSResponse: from === "searchbox" ? "false" : "true",
      zoIsStartOfSession: from === "searchbox" ? "true" : "false",
      zoRequestId: cr(),
      zoSearchQuery: words,
      zoTextResponse: lastStr,
      zoTimestampUtc: lastTime,
    };
    const [err, resp] = await to(post(`https://cn.bing.com${config.ZoChatV2Url}`, {
      data: JSON.stringify(params),
      headers: {
        "origin": "https://cn.bing.com",
        "referer": "https://cn.bing.com/search?q=%E4%BD%A0%E5%A5%BD%E5%95%8A",
        "content-type": "application/json",
      },
    }));
    if (err || !resp) return undefined;
    if (from === "searchbox") {
      return await this.talkWithXiaoIce(words);
    }
    return resp.content;
  },
};