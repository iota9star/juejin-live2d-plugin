import models from "./models";

const model = models[0];

export default {
  publicUrl: "https://cdn.jsdelivr.net/gh/iota9star/juejin-live2d-plugin@master",
  key: "<<<>juejin-live2d-plugin<>>>",
  domids: {
    live2d: "juejin-live2d-canvas",
    widget: "juejin-live2d-widget",
    msgbox: "juejin-live2d-msgbox",
    config: "juejin-live2d-config",
  },
  live2d: {
    model,
    draggable: true,
    size: 240,
  },
  models,
};