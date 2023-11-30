import fs from "fs";
import * as d3 from "d3";
import { JSDOM } from "jsdom";
import sharp from "sharp";
import path from "path";

// JSONファイルのリストを取得
const jsonFiles = fs
  .readdirSync("data")
  .filter((file) => path.extname(file) === ".json");

// SVGの設定
const width = 200;
const height = 200;

jsonFiles.forEach((file) => {
  // JSONデータを読み込む
  const jsonData = fs.readFileSync(`data/${file}`);
  const data = JSON.parse(jsonData);

  // JSDOMを使用して仮想DOMを作成
  const dom = new JSDOM(`<!DOCTYPE html><html><body></body></html>`);
  const body = d3.select(dom.window.document.body);

  // SVG要素を作成
  const svg = body.append("svg").attr("width", width).attr("height", height);

  // 散布図を描画
  svg
    .selectAll("circle")
    .data(data)
    .enter()
    .append("circle")
    .attr("cx", (d) => d.x)
    .attr("cy", (d) => d.y)
    .attr("r", 5);

  // SVGを文字列として取得
  const svgString = body.select("svg").node().outerHTML;

  // ファイル名を拡張子なしで取得
  const fileNameWithoutExt = path.basename(file, ".json");

  // SVGをPNGに変換して保存
  sharp(Buffer.from(svgString))
    .png()
    .toFile(`output/${fileNameWithoutExt}.png`, (err, info) => {
      if (err) {
        console.error(`エラーが発生しました (${file}):`, err);
      } else {
        console.log(
          `PNGファイルが生成され、outputフォルダに保存されました (${file}):`,
          info
        );
      }
    });
});
