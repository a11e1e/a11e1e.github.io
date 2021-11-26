---
date: 2021-10-19
title: Promise 的实现
description: 一直很好奇 Promise 是如何实现的。
---

# Promise 的实现

## Promise/A+ 规范

有一定基础的 JavaScript 同学对 Promise 应该有一定的了解。而**Promise/A+ 规范**用更准确的语言规定了 Promise。

根据该规范，一个 _promise_ 相当于一个异步操作的最终结果。

与一个 _promise_ 交互的最主要的方法就是 `then`。`then`给 `promise` 注册了两个回调函数。一个在异步操作成功时调用，另一个在异步操作失败后调用。

Promise/A+ 规范本质上只规定了 `then` 方法。只要是符合这个规范的 `promise` 都可以互相操作。

### 术语

- `promise` 是一个对象或者函数，拥有 then 方法，同时遵从 Promise/A+ 规范。
- `thenable` 是一个对象或者函数，拥有 then 方法，没了。
- `value` 是一个合法的 JavaScript 值。
- `excepttion` 是 `throw` 出来的一个 `value` 。
- `reason` 是一个 `value`，说明了异步操作为什么失败。

### 具体内容

#### Promise 状态

一个 promise 可能会有三种状态：

- 当状态是 `pending` 时候：
  - 可以转变为 `fulfilled` 或者 `rejected`
- 当状态是 `fulfilled` 时候：
  - 不能再改变状态
  - 一定要有一个 `value`，且不能改变
- 当状态是 `rejected` 时候：
  - 不能再改变状态
  - 一定要有一个 `reason`，且不能改变

::: warning
不能改变的意思是 `===`,也就是说如果 `value`是个对象，只需要保证引用不变。
:::

#### then

只挑一些重要的讲一下。

一个 promise 必提供一个可以访问 `value` 或者 `reason` 的 `then` 方法。

`then` 方法接受两个参数：

```js
promise.then(onFulfilled, onRejected);
```

1. `onFulfilled` 和 `onRejected` 都是可选参数。如果他们不是函数，就忽略它们。

2. 如果 `onFulfilled` 是函数，只能在 `promise` 成功执行后被调用且仅调用一次，第一个参数是 `promise` 的 `value`。

3. 如果 `onRejected` 是函数，只能在 `promise` 不成功执行后被调用且仅调用一次，第一个参数是 `promise` 的 `reason`。

4. `onFulfilled` 和 `onRejected` 必须是异步的。

5. `onFulfilled` 和 `onRejected`不能有 this。

6. 同一个 `promse` 可以调用多次 `then`。

   1. 当/如果 `promise` 被满足，所有的 `onFulfilled` 按 `then` 顺序执行。
   2. 当/如果 `promise` 被拒绝，所有的 `onRejected` 按 `then` 顺序执行。

7. `then` 必须返回一个 promise。

   ```js
   promise2 = promise1.then(onFulfilled, onRejected);
   ```

   1. 当`onFulfilled` 或 `onRejected`返回一个 `x` ，执行*promise 解决程序* `[[Resolve]](promise2, x)`。
   2. 当`onFulfilled` 或 `onRejected`抛出一个意外 `e`，`promise2` 必须以 `e` 为理由被拒绝。
   3. 当`onFulfilled` 不是一个函数，而且 `promise1` 被满足，`promise2` 应该以 同样的 `value` 被满足。
   4. 当`onFulfilled` 不是一个函数，而且 `promise1` 被拒绝，`promise2` 应该以 同样的 `reason` 被拒绝。

#### promise 解决程序

promise 解决程序是这样一个抽象的操作过程。我们把它记做 `[[Resolve]](promise, x)`。

它输入一个 `promise` 和一个 `x`。

- 如果 `x` 是一个 `thenable`，他会用 `x` 的状态来替代 `promise` 的状态。（假定 `x` 或多或少有一些类似 `promise`）
- 否则，直接用 `x` 来满足 `promise`。

这种对 `thenable` 的处理允许 `promise` 实现进行互操作，只要它们暴露一个符合 Promises/A+ 的 `then` 方法。

1. 如果 `promise` 和 `x` 是同一个对象，就抛出一个 `TypeError`。
2. 如果 `x` 是一个 `promise`，`promise` 就采用 `x` 的状态。
3. 如果 `x` 是一个对象或者函数，
4. 如果 `x` 不是一个对象或者函数，用 `x` 满足 `promse`。

## 具体实现

其实亲自阅读规范就会发现它根本没有规定 promise 必须要传入一个函数作为参数。但为什么所有的实现都是这样呢？我认为这或多或少有一些路径依赖————因为 ES 的标准做法如此。我也没有能力想出更好的做法，暂时临摹标准的 `Promise` 好了。

### 构造函数

想象一下平时我们是怎么使用 `Promise` 的：

```js
const p = new Promise((reslove, reject) => {
  try {
    // 一些耗时的I/O操作，比如网络请求...
    reslove("done!");
  } catch (e) {
    // 如果失败就拒绝
    reject(e);
  }
});
```

那么我们照猫画虎：

```js
const PENDING = "pending";
const FULFILLED = "fulfilled";
const REJECTED = "rejected";
class MyPromise {
  status = PENDING;
  value = null;
  reason = null;
  constructor(executor) {
    executor(this.resolve, this.reject);
  }

  resolve = (value) => {};

  reject = (reason) => {};
}
```

这样，框架就建好了。

### resolve 和 reject 方法

接下来应该思考的是 `resolve` 和 `reject` 应该要做什么。

其实很简单，`resolve` 让大家知道 `MyPromise` 已经完成。用代码的语言去描述就是

- `status` 变为 `FULFILLED`
- `value` 变为 `executor` 指定的 `value`.
  所以，`resolve` 应该这样。

```js
class MyPromise {
  // ...
  resolve = (value) => {
    if (this.status === PENDING) {
      this.status = FULFILLED;
      this.value = value;
    }
  };

  // 同理，`reject`应该这样
  reject = (reason) => {
    if (this.status === PENDING) {
      this.status = REJECTED;
      this.reason = reason;
    }
  };
  // ...
}
```

### then 方法

整个规范的重点就是 then 方法。

回忆一下平时我们如何使用 then 方法，同样临摹一下。

```js
class MyPromise {
  // ...
  then = (onFulfilled, onRejected) => {
    // todo
  };
  // ...
}
```

`then` 方法里面里要做的事情，其实规范也告诉我们了。

先看这一条

> `onFulfilled` 和 `onRejected` 都是可选参数。如果他们不是函数，就忽略它们。

这里的「忽略」，实际上可以想象成*如果他们不是函数，就让它们成为一个最普通的函数。*

```js
if (typeof onFulfilled !== "function") {
  onFulfilled = () => {};
}
if (typeof onRejected !== "function") {
  onRejected = () => {};
}Ï
```



再看这两条

> 1. 如果 `onFulfilled` 是函数，只能在 `promise` 成功执行后被调用且仅调用一次，第一个参数是 `promise` 的 `value`。
> 2. 如果 `onRejected` 是函数，只能在 `promise` 不成功执行后被调用且仅调用一次，第一个参数是 `promise` 的 `reason`。

所以，我们先判断一下 `promise` 的状态。如果是 `FULFILLED` 或者是 `REJECTED`，那就必须要执行相应的 `onFulfilled` 或者 `onRejected`。

```js
if (this.status === FULFILLED) {
  onFulfilled(this.value);
}
if (this.status === REJECTED) {
  onRejected(this.reason);
}
```

最后考虑一下这一条：

> 同一个 `promse` 可以调用多次 `then`。
>
> 1. 当/如果 `promise` 被满足，所有的 `onFulfilled` 按 `then` 顺序执行。
> 2. 当/如果 `promise` 被拒绝，所有的 `onRejected` 按 `then` 顺序执行。

这实际上告诉我们，如果 `promise` 是 `PENDING` 状态，就要把所有的 所有的 `onFulfilled` 和`onRejected` 都存放在一个地方。在 `promise` 被 settle （被满足或者被拒绝）的时候调用。自此，我们完整的 promise 应该是这样的：

```js
const PENDING = "pending";
const FULFILLED = "fulfilled";
const REJECTED = "rejected";


export class MyPromise {
  status = PENDING;
  value = null;
  reason = null;
  onFulfilledCallbacks = [];
  onRejectedCallbacks = [];
  constructor(executor) {
    executor(this.resolve, this.reject);
  }

  resolve = (value) => {
    if (this.status === PENDING) {
      this.status = FULFILLED;
      this.value = value;
      this.onFulfilledCallbacks.forEach((callback) => {
        callback(value);
      });
    }
  };

  reject = (reason) => {
    if (this.status === PENDING) {
      this.status = REJECTED;
      this.reason = reason;
      this.onRejectedCallbacks.forEach((callback) => {
        callback(reason);
      });
    }
  };

  then = (onFulfilled, onRejected) => {
    if (typeof onFulfilled !== "function") {
      onFulfilled = () => {};
    }
    if (typeof onRejected !== "function") {
      onRejected = () => {};
    }

    if (this.status === FULFILLED) {
      onFulfilled(this.value);
    }
    if (this.status === REJECTED) {
      onRejected(this.reason);
    }
    if (this.status === PENDING) {
      this.onFulfilledCallbacks.push(onFulfilled)
      this.onRejectedCallbacks.push(onRejected)
    }
  };
}

```

看上去初具规模，但我们还忘记一个很重要的东西

> `then` 必须返回一个 promise。
>
> ```js
> promise2 = promise1.then(onFulfilled, onRejected);
> ```
>
> 1. 当`onFulfilled` 或 `onRejected`返回一个 `x` ，执行*promise 解决程序* `[[Resolve]](promise2, x)`。
> 2. 当`onFulfilled` 或 `onRejected`抛出一个意外 `e`，`promise2` 必须以 `e` 为理由被拒绝。
> 3. 当`onFulfilled` 不是一个函数，而且 `promise1` 被满足，`promise2` 应该以 同样的 `value` 被满足。
> 4. 当`onFulfilled` 不是一个函数，而且 `promise1` 被拒绝，`promise2` 应该以 同样的 `reason` 被拒绝。

上面的代码，`then` 没有返回任何东西，所以我们就无法完成对 `then` 的链式调用。

```js
promise1
  .then(onFulfilled, onRejected)
  .then(onFulfilled2, onRejected2)
  .then(onFulfilled3, onRejected3)
```

我认为 promise 实现的难点就在于此。

从编程技巧的角度去考虑，我们可以假设只有前两种情况，对于第三四种情况，当`onFulfilled` 不是一个函数的时候，就让`onFulfilled` 成为一个特殊的函数。这样就转换为了第一种情况。

这样，我们的 `then` 应该重写成

```js
then = (onFulfilled, onRejected) => {
  if (typeof onFulfilled !== "function") {
    onFulfilled = (value) => value;
  }
  if (typeof onRejected !== "function") {
    onRejected = (reason) => reason;
  }

  if (this.status === FULFILLED) {
    const promise2 = new MyPromise((resolve, reject) => {
      // try catch 语句为了满足第二点
      try {
        let x = onFulfilled(this.value);
        // resolvePromise 是一个待实现的函数，为了满足第一点
        resolvePromise(     , x, resolve, reject);
      } catch (error) {
        reject(error);
      }
    });
    return promise2;
  }
  if (this.status === REJECTED) {
    const promise2 = new MyPromise((resolve, reject) => {
      try {
        let x = onRejected(this.reason);
        resolvePromise(promise2, x, resolve, reject);
      } catch (error) {
        reject(error);
      }
    });
    return promise2;
  }
  if (this.status === PENDING) {
    const promise2 = new MyPromise((resolve, reject) => {
      // 想不出来该如何写
    });
    return promise2;
  }
};

resolvePromise(){
  // todo
}
```

