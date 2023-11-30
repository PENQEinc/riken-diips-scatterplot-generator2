import fs from "fs";
import * as d3 from "d3";
import { tsvParse } from "d3-dsv";
import { JSDOM } from "jsdom";
import sharp from "sharp";
import path from "path";

// dataフォルダ内の全TSVファイルを取得
const tsvFiles = fs
  .readdirSync("data")
  .filter((file) => path.extname(file) === ".tsv");

// SVGの設定
const width = 800;
const height = 600;

tsvFiles.forEach((file) => {
  // TSVファイルを読み込む
  const tsvData = fs.readFileSync(`data/${file}`, "utf-8");
  const data = tsvParse(tsvData);

  // JSDOMを使用して仮想DOMを作成
  const dom = new JSDOM(`<!DOCTYPE html><html><body></body></html>`);
  const body = d3.select(dom.window.document.body);

  // SVG要素を作成
  const svg = body.append("svg").attr("width", width).attr("height", height);

  // スケール関数の設定
  const xScale = d3
    .scaleLinear()
    .domain(d3.extent(data, (d) => +d.UMAP_1))
    .range([0, width]);

  const yScale = d3
    .scaleLinear()
    .domain(d3.extent(data, (d) => +d.UMAP_2))
    .range([height, 0]);

  // 散布図を描画
  svg
    .selectAll("circle")
    .data(data)
    .enter()
    .append("circle")
    .attr("cx", (d) => xScale(+d.UMAP_1))
    .attr("cy", (d) => yScale(+d.UMAP_2))
    .attr("r", 5)
    .attr("fill", "blue"); // ここでは全ての点を青色で描画

  // SVGを文字列として取得
  const svgString = body.select("svg").node().outerHTML;

  // ファイル名を拡張子なしで取得
  const fileNameWithoutExt = path.basename(file, ".tsv");

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
