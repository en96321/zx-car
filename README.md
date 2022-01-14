
# 開車車

開車用
因我不會sh
所以使用Google zx來跑流程

## 需求
Google zx專案需求.  [github](https://github.com/google/zx)
```

node >= 14.13.1

```

## 安裝

open default terminal

```

npm i -g zx

```

optional global install （這會echo alias create-car="zx path/index.mjs" 至 ~/.bashrc and ~/.zshrc, 請不要移動目前index.mjs位置)

```

zx install.mjs

```

## 執行

切換到需要被merge的分支，如(staging, production)

```

zx {PATH_TO_File}/index.mjs

```

or

```

create-car

```

  

## props
| 參數 | 說明 | 預設 |
|--|--|--|
| -b| 要建立的分支名稱 | to-staging |
| -h | 要merge進來的分支名稱或hash | origin/lab |
範例

```
$ create-car -b=to-production -h=origin/staging
$ create-car -b=to-staging -h=origin/lab
```
