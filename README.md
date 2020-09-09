# Mars-cli

Mars 中文译名为“战神”，寓意该工具像战神一样所向披靡，所向无敌。

## 如何使用

运行以下命令： 

```git clone https://github.com/jjaimm/mars-cli.git```

```npm install```

## 目录设计

- lib
    - webpack.base.js
        - 资源解析
        - css前缀处理
        - 构建文件清理
        - 日志信息提示优化
        - HTML模板文件生成
        - eslint
        - 多页面打包
    
    - webpack.dev.js
        - 热更新
        - sourcemap
    
    - webpack.prod.js
        - 体积优化
        - 构建速度优化
        - 文件指纹
        - tree-shaking
        - scope hoisting
    
    - webpack.ssr.js

