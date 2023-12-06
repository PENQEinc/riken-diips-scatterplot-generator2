import fs from "fs";
import * as d3 from "d3";
import { tsvParse, tsvParseRows } from "d3-dsv";
import { JSDOM } from "jsdom";
import sharp from "sharp";
import path from "path";

// dataフォルダ内の全TSVファイルを取得
const tsvFiles = fs
  .readdirSync("data")
  .filter((file) => path.extname(file) === ".tsv");

// 画像出力サイズ設定
const outputWidth = 983;
const outputHeight = 978;
const margin = { top: 20, right: 20, bottom: 50, left: 50 };

// 色情報を含む列名のリスト
const colorColumns = [
  "color_A951",
  "color_A952",
  "color_A953",
  "color_A954",
  "color_A955",
];

tsvFiles.forEach((file) => {
  // TSVファイルを読み込む
  const tsvData = fs.readFileSync(`data/${file}`, "utf-8");
  const rawData = tsvParseRows(tsvData);
  const headers = rawData.shift(); // ヘッダー行を取得し、生データから削除
  const data = tsvParse(tsvData); // データを解析して型推測

  // JSDOMを使用して仮想DOMを作成
  const dom = new JSDOM(`<!DOCTYPE html><html><body></body></html>`);
  const body = d3.select(dom.window.document.body);

  // SVG要素を作成
  const svg = body
    .append("svg")
    .attr("width", outputWidth)
    .attr("height", outputHeight);

  // スケール関数の設定
  const xScale = d3
    .scaleLinear()
    .domain(d3.extent(data, (d) => +d[headers[1]]))
    .range([margin.left, outputWidth - margin.right]);

  const yScale = d3
    .scaleLinear()
    .domain(d3.extent(data, (d) => +d[headers[2]]))
    .range([outputHeight - margin.bottom, margin.top]);

  // 軸の生成
  const xAxis = d3.axisBottom(xScale).ticks(10);
  const yAxis = d3.axisLeft(yScale).ticks(10);

  // X軸をSVGに追加
  svg
    .append("g")
    .attr("transform", `translate(0,${yScale(0)})`)
    .call(xAxis)
    .append("text")
    .attr("fill", "#000")
    .attr("x", outputWidth - margin.right)
    .attr("y", 35)
    .style("text-anchor", "end")
    .text(headers[1]);

  // Y軸をSVGに追加
  svg
    .append("g")
    .attr("transform", `translate(${xScale(0)},0)`)
    .call(yAxis)
    .append("text")
    .attr("fill", "#000")
    .attr("transform", "rotate(-90)")
    .attr("y", 6 - margin.left)
    .attr("dy", "0.71em")
    .attr("text-anchor", "end")
    .text(headers[2]);

  // 各ノードに対して色を適用し、乗算ブレンドモードで描画
  data.forEach((d) => {
    colorColumns.forEach((col, index) => {
      // d[col]が有効なカラーコードである場合のみcolorを設定する
      if (d[col]) {
        let color = d3.color(d[col]);

        // ニュートラルな色の透明度を下げる
        if (color.hex() === "#e5e5e5") {
          color.opacity *= 0.2; // 透明度を20%に設定
        } else {
          color.opacity *= 0.5; // その他の色の透明度を50%に設定
        }

        svg
          .append("circle")
          .attr("cx", xScale(+d[headers[1]]))
          .attr("cy", yScale(+d[headers[2]]))
          .attr("r", 2) // 半径を2に設定
          .attr("fill", color)
          .style("mix-blend-mode", "multiply");
      }
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
