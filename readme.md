
# inline-html-withimg-loader

本插件是针对html-withimg-loader的扩展。修复使用html-webpack-plugin在html中不能使用注入语法的bug 

______________

## 安装

    npm install inline-html-withimg-loader --save

## 使用
```
    new HtmlWebpackPlugin({
        filename: 'index.html'
        template: 'inline-html-withimg-loader!'+path.resolve(__dirname, '../src/index.html'),
    }),

    new webpack.optimize.CommonsChunkPlugin({
            names: ['manifest', 'vendor'].reverse(),
            minChunks: Infinity, // 随着 入口chunk 越来越多，这个配置保证没其它的模块会打包进 公共chunk
    }),

    new InlineManifestWebpackPlugin()
```

