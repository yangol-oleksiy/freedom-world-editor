const Path = require("path");
const Webpack = require("webpack");

const source = Path.resolve(__dirname, "source");
const output = Path.resolve(__dirname, "dist");

const config = {
	context: source,
	entry: source + "/core/Main.js",
	target: "web",
	devtool: "none",
	mode: "production",
	optimization: {minimize: true},
	plugins: [
		new Webpack.ProvidePlugin({
			THREE: "three",
			"window.THREE": "three"
		})
	],
	module: {
		rules: [
			{
				test: /\.glsl$/i,
				use: "raw-loader"
			},
			{
				test: /.*brython.*/,
				loader: "@shoutem/webpack-prepend-append",
				query: JSON.stringify({
					prepend: `(function (root, factory) {
						if (typeof define === 'function' && define.amd) { define([], factory); }  // AMD loader
						else if (typeof module === 'object' && module.exports) { module.exports = factory(); }  // CommonJS loader
						else { root.brython = factory(); }  // Script tag
						}(typeof self !== 'undefined' ? self : this, function () {
						var process = {release: {name: ''}};`,
					append: `window.__BRYTHON__ = __BRYTHON__;
						return __BRYTHON__;
						}));`
				})
			}
		]
	}
};

module.exports = [
	Object.assign({
		output: {
			filename: "fwe.min.js",
			path: output,
			library: "FWE",
			libraryTarget: "umd"
		}
	}, config),
	Object.assign({
		output: {
			filename: "fwe.module.min.js",
			path: output,
			libraryTarget: "umd"
		}
	}, config)
];
