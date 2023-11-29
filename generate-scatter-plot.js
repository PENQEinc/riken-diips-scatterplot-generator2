import fs from "fs";
import * as d3 from "d3";
import { JSDOM } from "jsdom";
import sharp from "sharp";

// 散布図データの例
const data = [
  { x: 30, y: 30 },
  { x: 70, y: 70 },
  // ... 他のデータポイント
];

// SVGの設定
const width = 200;
const height = 200;

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

// SVGをPNGに変換して保存
sharp(Buffer.from(svgString))
  .png()
  .toFile("scatter-plot.png", (err, info) => {
    if (err) {
      console.error("エラーが発生しました:", err);
    } else {
      console.log("PNGファイルが生成されました:", info);
    }
  });
