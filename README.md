# None-cli

## 功能介绍

1. 自动快速生成项目模板，目前只支持vue版本的项目模板

2. 快速构建项目

3. 一键运行测试用例

## 如何使用

运行以下命令： 

```

    git clone https://github.com/jjaimm/mars-cli.git

```

```

    npm install

    npm link

```

### 查看cli当前版本信息

```

    none -V

```

### 快速生成项目模板

```

    none init my-project-name

```

### 开启本地服务（自动开启热更新）

```

    none dev

```

### 打包项目文件

```

    none build

```

### 运行测试用例

```

    none test

```

### 快速进行git commit

```

    none commit

```

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

- test
    - smoke 冒烟测试目录
    - unit 单元测试代码文件

