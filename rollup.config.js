import {terser} from "rollup-plugin-terser";
import resolve from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";
import babel from "@rollup/plugin-babel";
import polyfillNode from "rollup-plugin-polyfill-node";
import copy from "rollup-plugin-copy";
import styles from "rollup-plugin-styles";
import fs from "fs";
import * as path from "path";
import {version} from "./package.json";


function fileTree(dir, files = []) {
  const ps = fs.readdirSync(dir);
  for (const p of ps) {
    const fp = path.posix.join(dir, p);
    fs.statSync(fp).isDirectory() ?
      fileTree(path.posix.join(dir, p), files) :
      /\.model\d?\.json/.test(fp) ? files.push(fp) : undefined;
  }
  return files;
}

const models = fileTree("public/models").map(it => ({
  key: it.split("/").pop().replace(/\.model\d?\.json/, ""),
  value: it,
  inner: true,
}));
fs.writeFileSync("src/models.js", "export default " + JSON.stringify(models) + ";");

const metaFile = ".tampermonkeymeta";
const meta = String(fs.readFileSync(metaFile))
  .replace(/@version(\s+)\d+\.\d+\.\d+/m, `@version$1${version}`)
  .replace(/bundle.(\d+\.\d+\.\d+).min.js/m, `bundle.${version}.min.js`);
fs.writeFileSync(metaFile, meta);
const readmeFile = "README.md";
const readme = String(fs.readFileSync(readmeFile))
  .replace(/\.tampermonkeymeta\?v=\d+\.\d+\.\d+/gm, `.tampermonkeymeta?v=${version}`)
  .replace(/```tampermonkeymeta(.+)?```/sm, `\`\`\`tampermonkeymeta\n${meta}\n\`\`\``);
fs.writeFileSync(readmeFile, readme);

// 移除插件对live2d runtime的校验
function removePLDRuntimeCheck() {
  return {
    name: "remove-PLD-runtime-check",
    transform(code) {
      if (code && (code.indexOf("!window.Live2DCubismCore") > 0 || code.indexOf("!window.Live2D") > 0)) {
        return code.replace("!window.Live2DCubismCore", "false").replace("!window.Live2D", "false");
      }
      return code;
    },
    // writeBundle(options) {
    //   const file = options.file;
    //   const meta = String(fs.readFileSync(".tampermonkeymeta"));
    //   const script = String(fs.readFileSync(file));
    //   fs.writeFileSync(file, meta + "\n\n\n" + script);
    // },
  };
}

const output = `public/bundle.${version}.min.js`;

export default function () {
  return {
    input: "src/index.js",
    output: [
      {
        file: output,
        format: "iife",
        plugins: [
          terser({
              format: {
                comments: false,
              },
              compress: {
                drop_console: true,
                drop_debugger: true,
                pure_funcs: ["console.log", "console.error"],
              }
            },
          ),
        ],
      },
    ],
    plugins: [
      removePLDRuntimeCheck(),
      commonjs(),
      resolve({
        browser: true,
        preferBuiltins: false,
      }),
      polyfillNode(),
      babel({
        babelHelpers: "runtime",
        skipPreflightCheck: true,
      }),
      styles({
        minimize: true,
      }),
      copy({
        targets: [
          {src: output, dest: "public/", rename: () => "bundle.min.js"},
        ],
        hook: "writeBundle",
      }),
    ],
  };
};