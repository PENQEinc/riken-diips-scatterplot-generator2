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
const margin = { top: 20, right: 20, bottom: 40, left: 40 };
const colorColumns = [
  "color_A951",
  "color_A952",
  "color_A953",
  "color_A954",
  "color_A955",
]; // 色列のリスト

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
    .range([margin.left, width - margin.right]);

  const yScale = d3
    .scaleLinear()
    .domain(d3.extent(data, (d) => +d.UMAP_2))
    .range([height - margin.bottom, margin.top]);

  // 軸の生成
  const xAxis = d3.axisBottom(xScale).ticks(10);
  const yAxis = d3.axisLeft(yScale).ticks(10);

  // X軸とY軸をSVGに追加
  svg
    .append("g")
    .attr("transform", `translate(0,${height - margin.bottom})`)
    .call(xAxis);
  svg.append("g").attr("transform", `translate(${margin.left},0)`).call(yAxis);

  // 各ノードに対して複数の円を描画
  data.forEach((d) => {
    colorColumns.forEach((col, index) => {
      svg
        .append("circle")
        .attr("cx", xScale(+d.UMAP_1))
        .attr("cy", yScale(+d.UMAP_2))
        .attr("r", 5 - index) // 異なる半径で重なりを防ぐ
        .attr("fill", d[col]);
    });
  });

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
