---
date: 2021-10-16
title: Javascript 中的异步编程
description: Javascript 中的异步编程令我感到困惑。所以我决定按时间线重新梳理异步编程的解决方案。知其然，知其所以然。
---

# Javascript 中的异步编程

## 什么是异步？

### 先理解什么是同步

要理解异步，就先明白什么是同步。同步其实很符合人的常识。代码按顺序从上到下执行。

```js
function first() {
  // 第一个被调用的函数
}

function second() {
  // 第二个被调用的函数
}

function third() {
  // 第三个被调用的函数
}

first();
second();
third();
```

按照常识，只有`first`**执行完毕**之后，`second`才会开始运行，只有`second`**执行完毕**之后，`third`才会开始运行。

### 为什么需要异步？

假设一个新的场景：

- `first`非常耗时，但又不占据 CPU，比如网络请求。
- `second`依赖`first`的运行结果。
- `third`随时可以运行。

如果依然使用同步模式，就会造成这样一个问题——`third`只有在`first`和`second`执行完毕之后才可以开始执行。而`third`其实在`first`执行过程中就可以开始执行了。

这种情况在浏览器端比比皆是。

## 曾经我们如何解决异步

### 回调函数

举个例子：

```js
function handleClick() {
  alert("You clicked me!");
}
btn.addEventListener("click", handleClick);
```

函数`handleClick`就是一个回调函数。在这个例子中，回调函数`handleClick`作为一个参数，传递给另一个函数`addEventListener`,含义是「在`click`事件发生后调用`handleClick`函数」。

广义地说，回调函数（`handleClick`）的作用就是通知那个包含回调函数的函数（`addEventListener`），在合适的时机（`click`事件发生后）调用我。

所以，在上一章中，可以用回调函数的方式来解决新场景的问题，譬如。

```js
// todo: onFinish的实现

first.onFinish = f2;
```

### 回调函数的问题

如果我们想在回调函数中执行回调函数怎么办？

如果我们想在回调函数中执行包含回调函数的回调函数怎么办？

```js
loadScript("1.js", function (error, script) {
  if (error) {
    handleError(error);
  } else {
    // ...
    loadScript("2.js", function (error, script) {
      if (error) {
        handleError(error);
      } else {
        // ...
        loadScript("3.js", function (error, script) {
          if (error) {
            handleError(error);
          } else {
            // ...加载完所有脚本后继续 (*)
          }
        });
      }
    });
  }
});
```

看看这种代码，我不是很希望遇见这种代码。

## Promise

稍微现代一些的异步解决方案是使用`Promise`。

### 生产者代码

`Promise`是一个特殊的类。它的构造器（constructor）语法如下：

```js
let promise = new Promise(function (resolve, reject) {
  // 做一些事情
});
```

传递给 new Promise 的函数被称为 **executor**。当 `new Promise` 被创建，executor 会自动运行。

它的参数 `resolve` 和 `reject` 是由 JavaScript 自身提供的回调。我们需要遵循的原则是：

- 如果**executor**顺利执行，应该调用`resolve(value)`
- 如果不顺利，应该调用`resolve(value)`

由 `new Promise` 构造器返回的 `promise` 对象具有以下内部属性：

- `state` — 最初是 `"pending"`，然后在 `resolve` 被调用时变为 `"fulfilled"`，或者在 `reject` 被调用时变为 `"rejected"`。
- `result` — 最初是 `undefined`，然后在 `resolve(value)` 被调用时变为 `value`，或者在 `reject(error)` 被调用时变为 `error`。

总而言之，`executor` 应该执行一项工作（通常是需要花费一些时间的事儿），然后调用 `resolve` 或 `reject` 来改变对应的 `promise` 对象的状态。

`executor` 里的代码可以被称为**生产者代码**。

### 消费者代码

#### then

最重要最基础的一个就是 `.then`。

语法如下：

```js
promise.then(
  function (result) {
    /* handle a successful result */
  },
  function (error) {
    /* handle an error */
  }
);
```

`.then` 的第一个参数是一个函数，该函数将在 promise `resolved` 后运行并接收 `result`。

`.then` 的第二个参数也是一个函数，该函数将在 promise `rejected` 后运行并接收 `error`。

#### catch

等价于`.then(null, errorHandlingFunction)`

如果发生了错误也没有被处理，会产生一个全局错误。

#### finally

`.finally(f)` 与 `.then(f, f)` 类似。`f` 总是在 promise 被 `settled` 时运行。

区别在于：

- `finally` 里的函数没有参数。因为我们不知道 promise 成功与否。
- `finally` 处理程序将 `result` 和 `error` 传递给下一个处理程序。

### Promise 链

Promise 链看起来就像这样：

```js
new Promise(function (resolve, reject) {
  setTimeout(() => resolve(1), 1000); // (*)
})
  .then(function (result) {
    // (**)

    alert(result); // 1
    return result * 2;
  })
  .then(function (result) {
    // (***)

    alert(result); // 2
    return result * 2;
  })
  .then(function (result) {
    alert(result); // 4
    return result * 2;
  });
```

为什么可以这样？因为对 `promise.then` 的调用会返回了一个 `promise`，所以我们可以在其之上调用下一个 `.then`。

还有一种容易搞混的情况：

```js
let promise = new Promise(function (resolve, reject) {
  setTimeout(() => resolve(1), 1000);
});

promise.then(function (result) {
  alert(result); // 1
  return result * 2;
});

promise.then(function (result) {
  alert(result); // 1
  return result * 2;
});

promise.then(function (result) {
  alert(result); // 1
  return result * 2;
});
```

它们不会相互传递 result；相反，它们之间彼此独立运行处理任务。

### 思考题

```js
new Promise(function (resolve, reject) {
  setTimeout(() => {
    throw new Error("Whoops!");
  }, 1000);
}).catch(alert);
```

问：`.catch` 会被触发么？

[答案在这](https://zh.javascript.info/promise-error-handling#tasks)。

### Promise API

Promise 类有 5 种静态方法：

- `Promise.all(promises)` —— 等待所有 promise 都 `resolve` 时，返回存放它们结果的数组。如果给定的任意一个 promise 为 `reject`，那么它就会变成 `Promise.all` 的 `error`，所有其他 promise 的结果都会被忽略。
- `Promise.allSettled(promises)`（ES2020 新增方法）—— 等待所有 promise 都 settle 时，并以包含以下内容的对象数组的形式返回它们的结果：
  - `status`: `"fulfilled"` 或 `"rejected"`
  - `value`（如果 `fulfilled`）或 `reason`（如果 `rejected`）。
- `Promise.race(promises)` —— 等待第一个 settle 的 `promise`，并将其 result/error 作为结果。
- `Promise.resolve(value)` —— 使用给定 `value` 创建一个 `resolved` 的 promise。
- `Promise.reject(error)` —— 使用给定 `error` 创建一个 `rejected` 的 promise。

## async / await

Async/await 是以更舒适的方式使用 promise 的一种特殊语法，同时它也非常易于理解和使用。

### Async function

`async` 关键字可以被放置在一个函数前面，如下所示：

```js
async function f() {
  return 1;
}
```

在函数前面的 “async” 这个单词表达了一个简单的事情：即这个函数总是返回一个 promise。其他值将自动被包装在一个 resolved 的 promise 中。

```js
async function f1() {
  return 1;
}

f1().then(alert); // 1

async function f2() {
  return Promise.resolve(1);
}

f2().then(alert); // f1与f2等价
```

### Await

```js
// 只在 async 函数内工作
let value = await promise;
```

关键字 `await` 让 JavaScript 引擎等待直到 promise 完成（settle）并返回结果。这个行为不会耗费任何 CPU 资源，因为 JavaScript 引擎可以同时处理其他任务：执行其他脚本，处理事件等。


## 参考阅读

- [异步 JavaScript](https://developer.mozilla.org/zh-CN/docs/Learn/JavaScript/Asynchronous)
- [JavaScript 编程语言 - Promise，async/await](https://zh.javascript.info/async)
- [《深入掌握 ECMAScript 6 异步编程》](https://www.ruanyifeng.com/blog/2015/04/generator.html)
