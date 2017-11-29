
# inline-html-withimg-loader

本插件是针对html-withimg-loader的扩展。修复使用html-webpack-plugin在html中不能使用注入语法的bug 

______________

## 安装

    npm install inline-html-withimg-loader --save

## 使用
webpack配置:
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
index.html：
```
<!DOCTYPE html>  
<html lang="zh-CN">

<head>  
  <meta charset="UTF-8">
  <title>Template</title>
  <%= htmlWebpackPlugin.files.webpackManifest %>
</head>

<body>  
  <div id="app">
    <img src="./imges/a.jpg">
  </div>
</body>

</html>  
```

