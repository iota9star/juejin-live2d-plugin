const http = (options) => {
  return new Promise((resolve, reject) => {
    GM_xmlhttpRequest({
      nocache: true,
      responseType: "json",
      headers: {
        "content-type": "application/json",
      },
      timeout: 30000,
      ...options,
      onload: ({ status, response }) => {
        if (status === 200) {
          resolve(response);
        } else {
          reject(`奇怪的响应，掘金炸了？`);
        }
      },
      onabort: () => {
        reject("谁打断了我的请求？");
      },
      onerror: () => {
        reject("为什么请求失败了啊，喂");
      },
      ontimeout: () => {
        reject(`这请求的太久了吧`);
      },
    });
  });
};

const baseQuery = () => {
  const aid = 2608;
  try {
    const value = localStorage.getItem("__tea_cache_tokens_2608");
    if (value) {
      const { user_unique_id: uuid = "", web_id = "" } = JSON.parse(value) || {};
      return { aid, uuid, web_id };
    }
  } catch (e) {
    console.log(e);
  }
  return { aid };
};

const appendQuery = (url, params) => {
  params = Object.assign(params || {}, url.indexOf("juejin") >= 0 ? baseQuery() : {});
  if (!Object.keys(params).length) {
    return url;
  }
  const query = new URLSearchParams(params).toString();
  if (/\\?\S+?=/.test(url)) {
    return url + query;
  } else {
    return `${url}?${query}`;
  }
};

export function post(url, options = {}) {
  url = appendQuery(url, options.params);
  return http({
    ...options,
    url,
    method: "POST",
  });
}


export function get(url, options = {}) {
  url = appendQuery(url, options.params);
  return http({
    ...options,
    url,
    method: "GET",
  });
}

export const ls = {
  setItem: GM_setValue,
  getItem: GM_getValue,
};




