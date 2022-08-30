# gi
根据目录中的 `.gitidentity.json` 修改git仓库的 user/email 信息

## 安装

``` shell

npm i @croatialu/gi -g

```


## 使用

1. 在父目录创建 `.gitidentity.json` 文件
2. 填入内容
``` json
{
  "name": "croatialu", // git 名
  "email": "wuli.croatia@foxmail.com", // git 显示邮箱
  "level": 3, // 递归深度
  "excludeDir": [] // 排除的文件夹名
}

```
3. 在目录中执行 gi
- 如果该目录是一个仓库， 则会将 `.gitidentity.json` 配置同步到本仓库
- 如果该目录不是一个仓库，则会往下递归查找目录， 最大层级为 `level`，排除 `excludeDir` 后， 将满足规则的git仓库进行配置同步



## 举例
```
├── remote
│   ├── gi
│   ├── taro-lazy-swiper
│   └── taro-playground
└── workspace
    ├── company-project-a
    └── company-project-b
```

有个人仓库目录 `remote` 和 公司项目仓库 `workspace`， 而当想针对 `remote` 个人仓库单独配置 `user.name` 和 `user.email`, 则只需要创建 `.gitidentity.json` 在 `remote/.gitidentity.json` 中， 然后运行 `gi` ，就会自动同步git配置信息

同理，公司仓库也一样， 配置  `.gitidentity.json` 在 `workspace/.gitidentity.json`中，balabala....

最终的目录结构是：
```
├── remote
│   ├── gi
│   ├── taro-lazy-swiper
│   └── taro-playground
|   └── .gitidentity.json
└── workspace
    ├── company-project-a
    ├── company-project-b
    └── .gitidentity.json
```
