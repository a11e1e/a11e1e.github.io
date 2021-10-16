---
date: 2021-10-15
title: JavaScript 模块化
description: 这是一篇关于JavaScript 模块化的文章。
---

# JavaScript 模块化

## 模块化的背景

当一个程序复杂到一定程度的时候，我们不可能也没有必要亲力亲为地实现程序的所有功能。如果别人已经写好了一个函数，为什么不直接用呢？

几乎所有语言在诞生伊始就支持这种想法。

在 C++ 中，我们要使用一个库，只需要：

```cpp
// 导入输入和输出头文件
#include <iostream>
```

在 Python 中，是这样的：

```python
# 导入数学模块
import math
```

那在 JavaScript 中呢？

### 远古时代

在 ES6 之前，你几乎只能使用`<script>`标签。可以看[这个回答](https://stackoverflow.com/questions/950087/how-do-i-include-a-javascript-file-in-another-javascript-file)下面，大部分 13 年之前的回答都在使用类似的方式：

```js
document.write('<script src="myscript.js" type="text/javascript"></script>');
```

可以窥见那时候的前端领域有多贫瘠。几乎没有什么严肃的 JavaScript 开发者。几乎所有的网页开发者都是后端，而 JavaScript 只是一门玩具语音。事实也如此，你甚至无法脱离 HTML 来完成**模块化**这种基础的功能。

好，哪怕通过`<script>`标签引入文件，仍然有很多问题：

- 不可预测性
- 命名冲突
- 依赖管理混乱
- 不能在后端（Node.js）中使用

如果前三者还只是属于好用与否的范畴，而最后一条直接就是能不能用的问题。

无数的历史经验告诉我们，但凡还有一口饭吃，人民也不会揭竿起义。于是没有饭吃的程序员首先在服务器领域给出了他们的解决方案————**CommonJS**

### CommonJS

简单的说，CommonJS 是一种规范。Node.js 采用了这种规范，随着 Node 大火的同时，CommonJS 也进入人们视野。

CommonJS 规范要点：

- 每个文件就是一个模块。
- 在一个文件里定义的变量、函数、类都是私有的。
- 用`module.exports`导出。
- 用`require`导入。

简洁优雅！

### 分歧

但此时的 CommonJS 有两个重要问题没能得到解决，所以迟迟不能推广到浏览器上：

- 导出的变量会暴露在全局中。
- 在服务端`require`一个模块，只会有磁盘 I/O，所以同步加载机制没什么问题；但如果是浏览器加载，一是会产生开销更大的网络 I/O，二是天然异步，就会产生时序上的错误。

针对这些问题社区逐步形成了三大流派：
- **Modules/1.x 派**：这派的观点是，既然 Modules/1.0 已经在服务器端有了很好的实践经验，那么只需要将它移植到浏览器端就好。在浏览器加载模块之前，先通过工具将模块转换成浏览器能运行的代码了。我们可以理解为他们是“保守派”。
- **Modules/Async 派**：这派认为，既然浏览器环境于服务器环境差异过大，那么就不应该继续在 Modules/1.0 的基础上小修小补，应该遵循浏览器本身的特点，放弃 `require` 方式改为回调，将同步加载模块变为异步加载模块，这样就可以通过 ”下载 -> 回调“ 的方式，避免时序问题。我们可以理解为他们是“激进派”。
- **Modules/2.0 派**：这派同样也认为不应该沿用 Modules/1.0，但也不向激进派一样过于激进，认为 `require` 等规范还是有可取之处，不应该随随便便放弃，而是要尽可能的保持一致；但激进派的优点也应该吸收，比如 `exports` 也可以导出其他类型、而不仅局限于 `object` 对象。我们可以理解为他们是“中间派”。

### AMD

激进派的 James Burke 在 2009 年 9 月开发出了 RequireJS 这一模块加载器，以实践证明自己的观点。

RequireJS 的拥趸们根据 RequireJS 的实现，发布了Async Module Definition（简称 AMD）标准规范。

但激进派的想法始终得不到 CommonJS 社区主流认可。双方的分歧点主要在于执行时机问题，Modules/1.0 是延迟加载、且同一模块只执行一次，而 Modules/AsynchronousDefinition 却是提前加载，加之破坏了就近声明（就近依赖）原则，还引入了 `define` 等新的全局函数，双方的分歧越来越大。

### 钦定 ESM

后面的事情大家就都知道了

## 参考阅读

- [《编程时间简史系列》JavaScript 模块化的历史进程](https://segmentfault.com/a/1190000023017398)
- [前端模块化开发那点历史 ](https://github.com/seajs/seajs/issues/588)
- [前端模块化开发的价值](https://github.com/seajs/seajs/issues/547)

