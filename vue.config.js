/*
 * @Descripttion: 
 * @Author: wenlong
 * @version: 
 * @Date: 2021-05-21 09:36:42
 * @LastEditors: Please set LastEditors
 * @LastEditTime: 2021-11-22 15:09:39
 */
const path = require('path');
const CopyPlugin = require('copy-webpack-plugin');
const px2rem = require('postcss-px2rem')
function resolve(dir) {
    return path.join(__dirname, dir);
}

const postcss = px2rem({
    remUnit: 16   //基准大小 baseSize，需要和rem.js中相同
})

module.exports = {
    // publicPath: process.env.NODE_ENV === 'production' ? './' : '/',
    publicPath: '/crccgeo/',
    assetsDir: 'static', // 将所有静态文件集成在static中
    // outputDir: "vue-cesium",
    outputDir: "crccgeo",
    lintOnSave: false,
    filenameHashing: false,
    productionSourceMap: false,
    chainWebpack: (config) => {
        config.plugin('define').tap(args => {
            // 说明生成和开发环境下不同引用的路径
            args[0].CESIUM_BASE_URL = JSON.stringify(process.env.NODE_ENV === 'production' ? 'earth/static' : 'static')
            return args
        })
        config.resolve.alias
            .set('@', resolve('src'))
    },
    devServer: {
        overlay: {
            warnings: false,
            errors: false
        }
    },
    configureWebpack: {
        plugins: [new CopyPlugin([
            { from: 'node_modules/cesium/Build/Cesium/Assets', to: 'static/Assets' },
            { from: 'node_modules/cesium/Build/Cesium/Widgets', to: 'static/Widgets' },
            { from: 'node_modules/cesium/Build/Cesium/Workers', to: 'static/Workers' },
            { from: "node_modules/cesium/Build/Cesium/ThirdParty", to: "static/ThirdParty" },
            { from: 'src/assets', to: 'assets' }
        ])],
        module: {
            rules: [
                {
                    test: /\.js$/,
                    include: path.resolve(__dirname, 'node_modules/cesium/Source'),
                    use: {
                        loader: '@open-wc/webpack-import-meta-loader',
                    }
                }
            ]
        }
    },
    css: {
        loaderOptions: {
            postcss: {
            plugins: [postcss]
            }
        }
    }
}
