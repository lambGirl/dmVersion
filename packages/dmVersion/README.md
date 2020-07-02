### dmVersion

动态修改项目的迭代版本号及npm version版本号（按照公司内部迭代规则）
在部署规则中，前端项目分为两个版本维护： 
1. scripts/build.pro中的VERSION（按照迭代规则走）
2. package.json中的版本，按照Semver(语异化版本规则)

### example
```js
    $ npm i dmVersion --dev
```




