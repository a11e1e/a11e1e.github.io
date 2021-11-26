import{_ as n,c as s,o as a,d as o}from"./app.cdf062b3.js";const p='{"title":"Promise 的实现","description":"一直很好奇 Promise 是如何实现的。","frontmatter":{"date":"2021-10-19T00:00:00.000Z","title":"Promise 的实现","description":"一直很好奇 Promise 是如何实现的。"},"headers":[{"level":2,"title":"Promise/A+ 规范","slug":"promise-a-规范"},{"level":3,"title":"术语","slug":"术语"},{"level":3,"title":"具体内容","slug":"具体内容"},{"level":2,"title":"具体实现","slug":"具体实现"},{"level":3,"title":"构造函数","slug":"构造函数"},{"level":3,"title":"resolve 和 reject 方法","slug":"resolve-和-reject-方法"},{"level":3,"title":"then 方法","slug":"then-方法"}],"relativePath":"blogs/promise-implementation.md","lastUpdated":1634974272009}',t={},e=[o('<h1 id="promise-的实现" tabindex="-1">Promise 的实现 <a class="header-anchor" href="#promise-的实现" aria-hidden="true">#</a></h1><h2 id="promise-a-规范" tabindex="-1">Promise/A+ 规范 <a class="header-anchor" href="#promise-a-规范" aria-hidden="true">#</a></h2><p>有一定基础的 JavaScript 同学对 Promise 应该有一定的了解。而<strong>Promise/A+ 规范</strong>用更准确的语言规定了 Promise。</p><p>根据该规范，一个 <em>promise</em> 相当于一个异步操作的最终结果。</p><p>与一个 <em>promise</em> 交互的最主要的方法就是 <code>then</code>。<code>then</code>给 <code>promise</code> 注册了两个回调函数。一个在异步操作成功时调用，另一个在异步操作失败后调用。</p><p>Promise/A+ 规范本质上只规定了 <code>then</code> 方法。只要是符合这个规范的 <code>promise</code> 都可以互相操作。</p><h3 id="术语" tabindex="-1">术语 <a class="header-anchor" href="#术语" aria-hidden="true">#</a></h3><ul><li><code>promise</code> 是一个对象或者函数，拥有 then 方法，同时遵从 Promise/A+ 规范。</li><li><code>thenable</code> 是一个对象或者函数，拥有 then 方法，没了。</li><li><code>value</code> 是一个合法的 JavaScript 值。</li><li><code>excepttion</code> 是 <code>throw</code> 出来的一个 <code>value</code> 。</li><li><code>reason</code> 是一个 <code>value</code>，说明了异步操作为什么失败。</li></ul><h3 id="具体内容" tabindex="-1">具体内容 <a class="header-anchor" href="#具体内容" aria-hidden="true">#</a></h3><h4 id="promise-状态" tabindex="-1">Promise 状态 <a class="header-anchor" href="#promise-状态" aria-hidden="true">#</a></h4><p>一个 promise 可能会有三种状态：</p><ul><li>当状态是 <code>pending</code> 时候： <ul><li>可以转变为 <code>fulfilled</code> 或者 <code>rejected</code></li></ul></li><li>当状态是 <code>fulfilled</code> 时候： <ul><li>不能再改变状态</li><li>一定要有一个 <code>value</code>，且不能改变</li></ul></li><li>当状态是 <code>rejected</code> 时候： <ul><li>不能再改变状态</li><li>一定要有一个 <code>reason</code>，且不能改变</li></ul></li></ul><div class="warning custom-block"><p class="custom-block-title">WARNING</p><p>不能改变的意思是 <code>===</code>,也就是说如果 <code>value</code>是个对象，只需要保证引用不变。</p></div><h4 id="then" tabindex="-1">then <a class="header-anchor" href="#then" aria-hidden="true">#</a></h4><p>只挑一些重要的讲一下。</p><p>一个 promise 必提供一个可以访问 <code>value</code> 或者 <code>reason</code> 的 <code>then</code> 方法。</p><p><code>then</code> 方法接受两个参数：</p><div class="language-js"><pre><code>promise<span class="token punctuation">.</span><span class="token function">then</span><span class="token punctuation">(</span>onFulfilled<span class="token punctuation">,</span> onRejected<span class="token punctuation">)</span><span class="token punctuation">;</span>\n</code></pre></div><ol><li><p><code>onFulfilled</code> 和 <code>onRejected</code> 都是可选参数。如果他们不是函数，就忽略它们。</p></li><li><p>如果 <code>onFulfilled</code> 是函数，只能在 <code>promise</code> 成功执行后被调用且仅调用一次，第一个参数是 <code>promise</code> 的 <code>value</code>。</p></li><li><p>如果 <code>onRejected</code> 是函数，只能在 <code>promise</code> 不成功执行后被调用且仅调用一次，第一个参数是 <code>promise</code> 的 <code>reason</code>。</p></li><li><p><code>onFulfilled</code> 和 <code>onRejected</code> 必须是异步的。</p></li><li><p><code>onFulfilled</code> 和 <code>onRejected</code>不能有 this。</p></li><li><p>同一个 <code>promse</code> 可以调用多次 <code>then</code>。</p><ol><li>当/如果 <code>promise</code> 被满足，所有的 <code>onFulfilled</code> 按 <code>then</code> 顺序执行。</li><li>当/如果 <code>promise</code> 被拒绝，所有的 <code>onRejected</code> 按 <code>then</code> 顺序执行。</li></ol></li><li><p><code>then</code> 必须返回一个 promise。</p><div class="language-js"><pre><code>promise2 <span class="token operator">=</span> promise1<span class="token punctuation">.</span><span class="token function">then</span><span class="token punctuation">(</span>onFulfilled<span class="token punctuation">,</span> onRejected<span class="token punctuation">)</span><span class="token punctuation">;</span>\n</code></pre></div><ol><li>当<code>onFulfilled</code> 或 <code>onRejected</code>返回一个 <code>x</code> ，执行<em>promise 解决程序</em> <code>[[Resolve]](promise2, x)</code>。</li><li>当<code>onFulfilled</code> 或 <code>onRejected</code>抛出一个意外 <code>e</code>，<code>promise2</code> 必须以 <code>e</code> 为理由被拒绝。</li><li>当<code>onFulfilled</code> 不是一个函数，而且 <code>promise1</code> 被满足，<code>promise2</code> 应该以 同样的 <code>value</code> 被满足。</li><li>当<code>onFulfilled</code> 不是一个函数，而且 <code>promise1</code> 被拒绝，<code>promise2</code> 应该以 同样的 <code>reason</code> 被拒绝。</li></ol></li></ol><h4 id="promise-解决程序" tabindex="-1">promise 解决程序 <a class="header-anchor" href="#promise-解决程序" aria-hidden="true">#</a></h4><p>promise 解决程序是这样一个抽象的操作过程。我们把它记做 <code>[[Resolve]](promise, x)</code>。</p><p>它输入一个 <code>promise</code> 和一个 <code>x</code>。</p><ul><li>如果 <code>x</code> 是一个 <code>thenable</code>，他会用 <code>x</code> 的状态来替代 <code>promise</code> 的状态。（假定 <code>x</code> 或多或少有一些类似 <code>promise</code>）</li><li>否则，直接用 <code>x</code> 来满足 <code>promise</code>。</li></ul><p>这种对 <code>thenable</code> 的处理允许 <code>promise</code> 实现进行互操作，只要它们暴露一个符合 Promises/A+ 的 <code>then</code> 方法。</p><ol><li>如果 <code>promise</code> 和 <code>x</code> 是同一个对象，就抛出一个 <code>TypeError</code>。</li><li>如果 <code>x</code> 是一个 <code>promise</code>，<code>promise</code> 就采用 <code>x</code> 的状态。</li><li>如果 <code>x</code> 是一个对象或者函数，</li><li>如果 <code>x</code> 不是一个对象或者函数，用 <code>x</code> 满足 <code>promse</code>。</li></ol><h2 id="具体实现" tabindex="-1">具体实现 <a class="header-anchor" href="#具体实现" aria-hidden="true">#</a></h2><p>其实亲自阅读规范就会发现它根本没有规定 promise 必须要传入一个函数作为参数。但为什么所有的实现都是这样呢？我认为这或多或少有一些路径依赖————因为 ES 的标准做法如此。我也没有能力想出更好的做法，暂时临摹标准的 <code>Promise</code> 好了。</p><h3 id="构造函数" tabindex="-1">构造函数 <a class="header-anchor" href="#构造函数" aria-hidden="true">#</a></h3><p>想象一下平时我们是怎么使用 <code>Promise</code> 的：</p><div class="language-js"><pre><code><span class="token keyword">const</span> p <span class="token operator">=</span> <span class="token keyword">new</span> <span class="token class-name">Promise</span><span class="token punctuation">(</span><span class="token punctuation">(</span><span class="token parameter">reslove<span class="token punctuation">,</span> reject</span><span class="token punctuation">)</span> <span class="token operator">=&gt;</span> <span class="token punctuation">{</span>\n  <span class="token keyword">try</span> <span class="token punctuation">{</span>\n    <span class="token comment">// 一些耗时的I/O操作，比如网络请求...</span>\n    <span class="token function">reslove</span><span class="token punctuation">(</span><span class="token string">&quot;done!&quot;</span><span class="token punctuation">)</span><span class="token punctuation">;</span>\n  <span class="token punctuation">}</span> <span class="token keyword">catch</span> <span class="token punctuation">(</span>e<span class="token punctuation">)</span> <span class="token punctuation">{</span>\n    <span class="token comment">// 如果失败就拒绝</span>\n    <span class="token function">reject</span><span class="token punctuation">(</span>e<span class="token punctuation">)</span><span class="token punctuation">;</span>\n  <span class="token punctuation">}</span>\n<span class="token punctuation">}</span><span class="token punctuation">)</span><span class="token punctuation">;</span>\n</code></pre></div><p>那么我们照猫画虎：</p><div class="language-js"><pre><code><span class="token keyword">const</span> <span class="token constant">PENDING</span> <span class="token operator">=</span> <span class="token string">&quot;pending&quot;</span><span class="token punctuation">;</span>\n<span class="token keyword">const</span> <span class="token constant">FULFILLED</span> <span class="token operator">=</span> <span class="token string">&quot;fulfilled&quot;</span><span class="token punctuation">;</span>\n<span class="token keyword">const</span> <span class="token constant">REJECTED</span> <span class="token operator">=</span> <span class="token string">&quot;rejected&quot;</span><span class="token punctuation">;</span>\n<span class="token keyword">class</span> <span class="token class-name">MyPromise</span> <span class="token punctuation">{</span>\n  status <span class="token operator">=</span> <span class="token constant">PENDING</span><span class="token punctuation">;</span>\n  value <span class="token operator">=</span> <span class="token keyword">null</span><span class="token punctuation">;</span>\n  reason <span class="token operator">=</span> <span class="token keyword">null</span><span class="token punctuation">;</span>\n  <span class="token function">constructor</span><span class="token punctuation">(</span><span class="token parameter">executor</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>\n    <span class="token function">executor</span><span class="token punctuation">(</span><span class="token keyword">this</span><span class="token punctuation">.</span>resolve<span class="token punctuation">,</span> <span class="token keyword">this</span><span class="token punctuation">.</span>reject<span class="token punctuation">)</span><span class="token punctuation">;</span>\n  <span class="token punctuation">}</span>\n\n  <span class="token function-variable function">resolve</span> <span class="token operator">=</span> <span class="token punctuation">(</span><span class="token parameter">value</span><span class="token punctuation">)</span> <span class="token operator">=&gt;</span> <span class="token punctuation">{</span><span class="token punctuation">}</span><span class="token punctuation">;</span>\n\n  <span class="token function-variable function">reject</span> <span class="token operator">=</span> <span class="token punctuation">(</span><span class="token parameter">reason</span><span class="token punctuation">)</span> <span class="token operator">=&gt;</span> <span class="token punctuation">{</span><span class="token punctuation">}</span><span class="token punctuation">;</span>\n<span class="token punctuation">}</span>\n</code></pre></div><p>这样，框架就建好了。</p><h3 id="resolve-和-reject-方法" tabindex="-1">resolve 和 reject 方法 <a class="header-anchor" href="#resolve-和-reject-方法" aria-hidden="true">#</a></h3><p>接下来应该思考的是 <code>resolve</code> 和 <code>reject</code> 应该要做什么。</p><p>其实很简单，<code>resolve</code> 让大家知道 <code>MyPromise</code> 已经完成。用代码的语言去描述就是</p><ul><li><code>status</code> 变为 <code>FULFILLED</code></li><li><code>value</code> 变为 <code>executor</code> 指定的 <code>value</code>. 所以，<code>resolve</code> 应该这样。</li></ul><div class="language-js"><pre><code><span class="token keyword">class</span> <span class="token class-name">MyPromise</span> <span class="token punctuation">{</span>\n  <span class="token comment">// ...</span>\n  <span class="token function-variable function">resolve</span> <span class="token operator">=</span> <span class="token punctuation">(</span><span class="token parameter">value</span><span class="token punctuation">)</span> <span class="token operator">=&gt;</span> <span class="token punctuation">{</span>\n    <span class="token keyword">if</span> <span class="token punctuation">(</span><span class="token keyword">this</span><span class="token punctuation">.</span>status <span class="token operator">===</span> <span class="token constant">PENDING</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>\n      <span class="token keyword">this</span><span class="token punctuation">.</span>status <span class="token operator">=</span> <span class="token constant">FULFILLED</span><span class="token punctuation">;</span>\n      <span class="token keyword">this</span><span class="token punctuation">.</span>value <span class="token operator">=</span> value<span class="token punctuation">;</span>\n    <span class="token punctuation">}</span>\n  <span class="token punctuation">}</span><span class="token punctuation">;</span>\n\n  <span class="token comment">// 同理，`reject`应该这样</span>\n  <span class="token function-variable function">reject</span> <span class="token operator">=</span> <span class="token punctuation">(</span><span class="token parameter">reason</span><span class="token punctuation">)</span> <span class="token operator">=&gt;</span> <span class="token punctuation">{</span>\n    <span class="token keyword">if</span> <span class="token punctuation">(</span><span class="token keyword">this</span><span class="token punctuation">.</span>status <span class="token operator">===</span> <span class="token constant">PENDING</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>\n      <span class="token keyword">this</span><span class="token punctuation">.</span>status <span class="token operator">=</span> <span class="token constant">REJECTED</span><span class="token punctuation">;</span>\n      <span class="token keyword">this</span><span class="token punctuation">.</span>reason <span class="token operator">=</span> reason<span class="token punctuation">;</span>\n    <span class="token punctuation">}</span>\n  <span class="token punctuation">}</span><span class="token punctuation">;</span>\n  <span class="token comment">// ...</span>\n<span class="token punctuation">}</span>\n</code></pre></div><h3 id="then-方法" tabindex="-1">then 方法 <a class="header-anchor" href="#then-方法" aria-hidden="true">#</a></h3><p>整个规范的重点就是 then 方法。</p><p>回忆一下平时我们如何使用 then 方法，同样临摹一下。</p><div class="language-js"><pre><code><span class="token keyword">class</span> <span class="token class-name">MyPromise</span> <span class="token punctuation">{</span>\n  <span class="token comment">// ...</span>\n  <span class="token function-variable function">then</span> <span class="token operator">=</span> <span class="token punctuation">(</span><span class="token parameter">onFulfilled<span class="token punctuation">,</span> onRejected</span><span class="token punctuation">)</span> <span class="token operator">=&gt;</span> <span class="token punctuation">{</span>\n    <span class="token comment">// todo</span>\n  <span class="token punctuation">}</span><span class="token punctuation">;</span>\n  <span class="token comment">// ...</span>\n<span class="token punctuation">}</span>\n</code></pre></div><p><code>then</code> 方法里面里要做的事情，其实规范也告诉我们了。</p><p>先看这一条</p><blockquote><p><code>onFulfilled</code> 和 <code>onRejected</code> 都是可选参数。如果他们不是函数，就忽略它们。</p></blockquote><p>这里的「忽略」，实际上可以想象成<em>如果他们不是函数，就让它们成为一个最普通的函数。</em></p><div class="language-js"><pre><code><span class="token keyword">if</span> <span class="token punctuation">(</span><span class="token keyword">typeof</span> onFulfilled <span class="token operator">!==</span> <span class="token string">&quot;function&quot;</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>\n  <span class="token function-variable function">onFulfilled</span> <span class="token operator">=</span> <span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token operator">=&gt;</span> <span class="token punctuation">{</span><span class="token punctuation">}</span><span class="token punctuation">;</span>\n<span class="token punctuation">}</span>\n<span class="token keyword">if</span> <span class="token punctuation">(</span><span class="token keyword">typeof</span> onRejected <span class="token operator">!==</span> <span class="token string">&quot;function&quot;</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>\n  <span class="token function-variable function">onRejected</span> <span class="token operator">=</span> <span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token operator">=&gt;</span> <span class="token punctuation">{</span><span class="token punctuation">}</span><span class="token punctuation">;</span>\n<span class="token punctuation">}</span>Ï\n</code></pre></div><p>再看这两条</p><blockquote><ol><li>如果 <code>onFulfilled</code> 是函数，只能在 <code>promise</code> 成功执行后被调用且仅调用一次，第一个参数是 <code>promise</code> 的 <code>value</code>。</li><li>如果 <code>onRejected</code> 是函数，只能在 <code>promise</code> 不成功执行后被调用且仅调用一次，第一个参数是 <code>promise</code> 的 <code>reason</code>。</li></ol></blockquote><p>所以，我们先判断一下 <code>promise</code> 的状态。如果是 <code>FULFILLED</code> 或者是 <code>REJECTED</code>，那就必须要执行相应的 <code>onFulfilled</code> 或者 <code>onRejected</code>。</p><div class="language-js"><pre><code><span class="token keyword">if</span> <span class="token punctuation">(</span><span class="token keyword">this</span><span class="token punctuation">.</span>status <span class="token operator">===</span> <span class="token constant">FULFILLED</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>\n  <span class="token function">onFulfilled</span><span class="token punctuation">(</span><span class="token keyword">this</span><span class="token punctuation">.</span>value<span class="token punctuation">)</span><span class="token punctuation">;</span>\n<span class="token punctuation">}</span>\n<span class="token keyword">if</span> <span class="token punctuation">(</span><span class="token keyword">this</span><span class="token punctuation">.</span>status <span class="token operator">===</span> <span class="token constant">REJECTED</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>\n  <span class="token function">onRejected</span><span class="token punctuation">(</span><span class="token keyword">this</span><span class="token punctuation">.</span>reason<span class="token punctuation">)</span><span class="token punctuation">;</span>\n<span class="token punctuation">}</span>\n</code></pre></div><p>最后考虑一下这一条：</p><blockquote><p>同一个 <code>promse</code> 可以调用多次 <code>then</code>。</p><ol><li>当/如果 <code>promise</code> 被满足，所有的 <code>onFulfilled</code> 按 <code>then</code> 顺序执行。</li><li>当/如果 <code>promise</code> 被拒绝，所有的 <code>onRejected</code> 按 <code>then</code> 顺序执行。</li></ol></blockquote><p>这实际上告诉我们，如果 <code>promise</code> 是 <code>PENDING</code> 状态，就要把所有的 所有的 <code>onFulfilled</code> 和<code>onRejected</code> 都存放在一个地方。在 <code>promise</code> 被 settle （被满足或者被拒绝）的时候调用。自此，我们完整的 promise 应该是这样的：</p><div class="language-js"><pre><code><span class="token keyword">const</span> <span class="token constant">PENDING</span> <span class="token operator">=</span> <span class="token string">&quot;pending&quot;</span><span class="token punctuation">;</span>\n<span class="token keyword">const</span> <span class="token constant">FULFILLED</span> <span class="token operator">=</span> <span class="token string">&quot;fulfilled&quot;</span><span class="token punctuation">;</span>\n<span class="token keyword">const</span> <span class="token constant">REJECTED</span> <span class="token operator">=</span> <span class="token string">&quot;rejected&quot;</span><span class="token punctuation">;</span>\n\n\n<span class="token keyword">export</span> <span class="token keyword">class</span> <span class="token class-name">MyPromise</span> <span class="token punctuation">{</span>\n  status <span class="token operator">=</span> <span class="token constant">PENDING</span><span class="token punctuation">;</span>\n  value <span class="token operator">=</span> <span class="token keyword">null</span><span class="token punctuation">;</span>\n  reason <span class="token operator">=</span> <span class="token keyword">null</span><span class="token punctuation">;</span>\n  onFulfilledCallbacks <span class="token operator">=</span> <span class="token punctuation">[</span><span class="token punctuation">]</span><span class="token punctuation">;</span>\n  onRejectedCallbacks <span class="token operator">=</span> <span class="token punctuation">[</span><span class="token punctuation">]</span><span class="token punctuation">;</span>\n  <span class="token function">constructor</span><span class="token punctuation">(</span><span class="token parameter">executor</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>\n    <span class="token function">executor</span><span class="token punctuation">(</span><span class="token keyword">this</span><span class="token punctuation">.</span>resolve<span class="token punctuation">,</span> <span class="token keyword">this</span><span class="token punctuation">.</span>reject<span class="token punctuation">)</span><span class="token punctuation">;</span>\n  <span class="token punctuation">}</span>\n\n  <span class="token function-variable function">resolve</span> <span class="token operator">=</span> <span class="token punctuation">(</span><span class="token parameter">value</span><span class="token punctuation">)</span> <span class="token operator">=&gt;</span> <span class="token punctuation">{</span>\n    <span class="token keyword">if</span> <span class="token punctuation">(</span><span class="token keyword">this</span><span class="token punctuation">.</span>status <span class="token operator">===</span> <span class="token constant">PENDING</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>\n      <span class="token keyword">this</span><span class="token punctuation">.</span>status <span class="token operator">=</span> <span class="token constant">FULFILLED</span><span class="token punctuation">;</span>\n      <span class="token keyword">this</span><span class="token punctuation">.</span>value <span class="token operator">=</span> value<span class="token punctuation">;</span>\n      <span class="token keyword">this</span><span class="token punctuation">.</span>onFulfilledCallbacks<span class="token punctuation">.</span><span class="token function">forEach</span><span class="token punctuation">(</span><span class="token punctuation">(</span><span class="token parameter">callback</span><span class="token punctuation">)</span> <span class="token operator">=&gt;</span> <span class="token punctuation">{</span>\n        <span class="token function">callback</span><span class="token punctuation">(</span>value<span class="token punctuation">)</span><span class="token punctuation">;</span>\n      <span class="token punctuation">}</span><span class="token punctuation">)</span><span class="token punctuation">;</span>\n    <span class="token punctuation">}</span>\n  <span class="token punctuation">}</span><span class="token punctuation">;</span>\n\n  <span class="token function-variable function">reject</span> <span class="token operator">=</span> <span class="token punctuation">(</span><span class="token parameter">reason</span><span class="token punctuation">)</span> <span class="token operator">=&gt;</span> <span class="token punctuation">{</span>\n    <span class="token keyword">if</span> <span class="token punctuation">(</span><span class="token keyword">this</span><span class="token punctuation">.</span>status <span class="token operator">===</span> <span class="token constant">PENDING</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>\n      <span class="token keyword">this</span><span class="token punctuation">.</span>status <span class="token operator">=</span> <span class="token constant">REJECTED</span><span class="token punctuation">;</span>\n      <span class="token keyword">this</span><span class="token punctuation">.</span>reason <span class="token operator">=</span> reason<span class="token punctuation">;</span>\n      <span class="token keyword">this</span><span class="token punctuation">.</span>onRejectedCallbacks<span class="token punctuation">.</span><span class="token function">forEach</span><span class="token punctuation">(</span><span class="token punctuation">(</span><span class="token parameter">callback</span><span class="token punctuation">)</span> <span class="token operator">=&gt;</span> <span class="token punctuation">{</span>\n        <span class="token function">callback</span><span class="token punctuation">(</span>reason<span class="token punctuation">)</span><span class="token punctuation">;</span>\n      <span class="token punctuation">}</span><span class="token punctuation">)</span><span class="token punctuation">;</span>\n    <span class="token punctuation">}</span>\n  <span class="token punctuation">}</span><span class="token punctuation">;</span>\n\n  <span class="token function-variable function">then</span> <span class="token operator">=</span> <span class="token punctuation">(</span><span class="token parameter">onFulfilled<span class="token punctuation">,</span> onRejected</span><span class="token punctuation">)</span> <span class="token operator">=&gt;</span> <span class="token punctuation">{</span>\n    <span class="token keyword">if</span> <span class="token punctuation">(</span><span class="token keyword">typeof</span> onFulfilled <span class="token operator">!==</span> <span class="token string">&quot;function&quot;</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>\n      <span class="token function-variable function">onFulfilled</span> <span class="token operator">=</span> <span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token operator">=&gt;</span> <span class="token punctuation">{</span><span class="token punctuation">}</span><span class="token punctuation">;</span>\n    <span class="token punctuation">}</span>\n    <span class="token keyword">if</span> <span class="token punctuation">(</span><span class="token keyword">typeof</span> onRejected <span class="token operator">!==</span> <span class="token string">&quot;function&quot;</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>\n      <span class="token function-variable function">onRejected</span> <span class="token operator">=</span> <span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token operator">=&gt;</span> <span class="token punctuation">{</span><span class="token punctuation">}</span><span class="token punctuation">;</span>\n    <span class="token punctuation">}</span>\n\n    <span class="token keyword">if</span> <span class="token punctuation">(</span><span class="token keyword">this</span><span class="token punctuation">.</span>status <span class="token operator">===</span> <span class="token constant">FULFILLED</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>\n      <span class="token function">onFulfilled</span><span class="token punctuation">(</span><span class="token keyword">this</span><span class="token punctuation">.</span>value<span class="token punctuation">)</span><span class="token punctuation">;</span>\n    <span class="token punctuation">}</span>\n    <span class="token keyword">if</span> <span class="token punctuation">(</span><span class="token keyword">this</span><span class="token punctuation">.</span>status <span class="token operator">===</span> <span class="token constant">REJECTED</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>\n      <span class="token function">onRejected</span><span class="token punctuation">(</span><span class="token keyword">this</span><span class="token punctuation">.</span>reason<span class="token punctuation">)</span><span class="token punctuation">;</span>\n    <span class="token punctuation">}</span>\n    <span class="token keyword">if</span> <span class="token punctuation">(</span><span class="token keyword">this</span><span class="token punctuation">.</span>status <span class="token operator">===</span> <span class="token constant">PENDING</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>\n      <span class="token keyword">this</span><span class="token punctuation">.</span>onFulfilledCallbacks<span class="token punctuation">.</span><span class="token function">push</span><span class="token punctuation">(</span>onFulfilled<span class="token punctuation">)</span>\n      <span class="token keyword">this</span><span class="token punctuation">.</span>onRejectedCallbacks<span class="token punctuation">.</span><span class="token function">push</span><span class="token punctuation">(</span>onRejected<span class="token punctuation">)</span>\n    <span class="token punctuation">}</span>\n  <span class="token punctuation">}</span><span class="token punctuation">;</span>\n<span class="token punctuation">}</span>\n\n</code></pre></div><p>看上去初具规模，但我们还忘记一个很重要的东西</p><blockquote><p><code>then</code> 必须返回一个 promise。</p><div class="language-js"><pre><code>promise2 <span class="token operator">=</span> promise1<span class="token punctuation">.</span><span class="token function">then</span><span class="token punctuation">(</span>onFulfilled<span class="token punctuation">,</span> onRejected<span class="token punctuation">)</span><span class="token punctuation">;</span>\n</code></pre></div><ol><li>当<code>onFulfilled</code> 或 <code>onRejected</code>返回一个 <code>x</code> ，执行<em>promise 解决程序</em> <code>[[Resolve]](promise2, x)</code>。</li><li>当<code>onFulfilled</code> 或 <code>onRejected</code>抛出一个意外 <code>e</code>，<code>promise2</code> 必须以 <code>e</code> 为理由被拒绝。</li><li>当<code>onFulfilled</code> 不是一个函数，而且 <code>promise1</code> 被满足，<code>promise2</code> 应该以 同样的 <code>value</code> 被满足。</li><li>当<code>onFulfilled</code> 不是一个函数，而且 <code>promise1</code> 被拒绝，<code>promise2</code> 应该以 同样的 <code>reason</code> 被拒绝。</li></ol></blockquote><p>上面的代码，<code>then</code> 没有返回任何东西，所以我们就无法完成对 <code>then</code> 的链式调用。</p><div class="language-js"><pre><code>promise1\n  <span class="token punctuation">.</span><span class="token function">then</span><span class="token punctuation">(</span>onFulfilled<span class="token punctuation">,</span> onRejected<span class="token punctuation">)</span>\n  <span class="token punctuation">.</span><span class="token function">then</span><span class="token punctuation">(</span>onFulfilled2<span class="token punctuation">,</span> onRejected2<span class="token punctuation">)</span>\n  <span class="token punctuation">.</span><span class="token function">then</span><span class="token punctuation">(</span>onFulfilled3<span class="token punctuation">,</span> onRejected3<span class="token punctuation">)</span>\n</code></pre></div><p>我认为 promise 实现的难点就在于此。</p><p>从编程技巧的角度去考虑，我们可以假设只有前两种情况，对于第三四种情况，当<code>onFulfilled</code> 不是一个函数的时候，就让<code>onFulfilled</code> 成为一个特殊的函数。这样就转换为了第一种情况。</p><p>这样，我们的 <code>then</code> 应该重写成</p><div class="language-js"><pre><code><span class="token function-variable function">then</span> <span class="token operator">=</span> <span class="token punctuation">(</span><span class="token parameter">onFulfilled<span class="token punctuation">,</span> onRejected</span><span class="token punctuation">)</span> <span class="token operator">=&gt;</span> <span class="token punctuation">{</span>\n  <span class="token keyword">if</span> <span class="token punctuation">(</span><span class="token keyword">typeof</span> onFulfilled <span class="token operator">!==</span> <span class="token string">&quot;function&quot;</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>\n    <span class="token function-variable function">onFulfilled</span> <span class="token operator">=</span> <span class="token punctuation">(</span><span class="token parameter">value</span><span class="token punctuation">)</span> <span class="token operator">=&gt;</span> value<span class="token punctuation">;</span>\n  <span class="token punctuation">}</span>\n  <span class="token keyword">if</span> <span class="token punctuation">(</span><span class="token keyword">typeof</span> onRejected <span class="token operator">!==</span> <span class="token string">&quot;function&quot;</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>\n    <span class="token function-variable function">onRejected</span> <span class="token operator">=</span> <span class="token punctuation">(</span><span class="token parameter">reason</span><span class="token punctuation">)</span> <span class="token operator">=&gt;</span> reason<span class="token punctuation">;</span>\n  <span class="token punctuation">}</span>\n\n  <span class="token keyword">if</span> <span class="token punctuation">(</span><span class="token keyword">this</span><span class="token punctuation">.</span>status <span class="token operator">===</span> <span class="token constant">FULFILLED</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>\n    <span class="token keyword">const</span> promise2 <span class="token operator">=</span> <span class="token keyword">new</span> <span class="token class-name">MyPromise</span><span class="token punctuation">(</span><span class="token punctuation">(</span><span class="token parameter">resolve<span class="token punctuation">,</span> reject</span><span class="token punctuation">)</span> <span class="token operator">=&gt;</span> <span class="token punctuation">{</span>\n      <span class="token comment">// try catch 语句为了满足第二点</span>\n      <span class="token keyword">try</span> <span class="token punctuation">{</span>\n        <span class="token keyword">let</span> x <span class="token operator">=</span> <span class="token function">onFulfilled</span><span class="token punctuation">(</span><span class="token keyword">this</span><span class="token punctuation">.</span>value<span class="token punctuation">)</span><span class="token punctuation">;</span>\n        <span class="token comment">// resolvePromise 是一个待实现的函数，为了满足第一点</span>\n        <span class="token function">resolvePromise</span><span class="token punctuation">(</span>     <span class="token punctuation">,</span> x<span class="token punctuation">,</span> resolve<span class="token punctuation">,</span> reject<span class="token punctuation">)</span><span class="token punctuation">;</span>\n      <span class="token punctuation">}</span> <span class="token keyword">catch</span> <span class="token punctuation">(</span>error<span class="token punctuation">)</span> <span class="token punctuation">{</span>\n        <span class="token function">reject</span><span class="token punctuation">(</span>error<span class="token punctuation">)</span><span class="token punctuation">;</span>\n      <span class="token punctuation">}</span>\n    <span class="token punctuation">}</span><span class="token punctuation">)</span><span class="token punctuation">;</span>\n    <span class="token keyword">return</span> promise2<span class="token punctuation">;</span>\n  <span class="token punctuation">}</span>\n  <span class="token keyword">if</span> <span class="token punctuation">(</span><span class="token keyword">this</span><span class="token punctuation">.</span>status <span class="token operator">===</span> <span class="token constant">REJECTED</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>\n    <span class="token keyword">const</span> promise2 <span class="token operator">=</span> <span class="token keyword">new</span> <span class="token class-name">MyPromise</span><span class="token punctuation">(</span><span class="token punctuation">(</span><span class="token parameter">resolve<span class="token punctuation">,</span> reject</span><span class="token punctuation">)</span> <span class="token operator">=&gt;</span> <span class="token punctuation">{</span>\n      <span class="token keyword">try</span> <span class="token punctuation">{</span>\n        <span class="token keyword">let</span> x <span class="token operator">=</span> <span class="token function">onRejected</span><span class="token punctuation">(</span><span class="token keyword">this</span><span class="token punctuation">.</span>reason<span class="token punctuation">)</span><span class="token punctuation">;</span>\n        <span class="token function">resolvePromise</span><span class="token punctuation">(</span>promise2<span class="token punctuation">,</span> x<span class="token punctuation">,</span> resolve<span class="token punctuation">,</span> reject<span class="token punctuation">)</span><span class="token punctuation">;</span>\n      <span class="token punctuation">}</span> <span class="token keyword">catch</span> <span class="token punctuation">(</span>error<span class="token punctuation">)</span> <span class="token punctuation">{</span>\n        <span class="token function">reject</span><span class="token punctuation">(</span>error<span class="token punctuation">)</span><span class="token punctuation">;</span>\n      <span class="token punctuation">}</span>\n    <span class="token punctuation">}</span><span class="token punctuation">)</span><span class="token punctuation">;</span>\n    <span class="token keyword">return</span> promise2<span class="token punctuation">;</span>\n  <span class="token punctuation">}</span>\n  <span class="token keyword">if</span> <span class="token punctuation">(</span><span class="token keyword">this</span><span class="token punctuation">.</span>status <span class="token operator">===</span> <span class="token constant">PENDING</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>\n    <span class="token keyword">const</span> promise2 <span class="token operator">=</span> <span class="token keyword">new</span> <span class="token class-name">MyPromise</span><span class="token punctuation">(</span><span class="token punctuation">(</span><span class="token parameter">resolve<span class="token punctuation">,</span> reject</span><span class="token punctuation">)</span> <span class="token operator">=&gt;</span> <span class="token punctuation">{</span>\n      <span class="token comment">// 想不出来该如何写</span>\n    <span class="token punctuation">}</span><span class="token punctuation">)</span><span class="token punctuation">;</span>\n    <span class="token keyword">return</span> promise2<span class="token punctuation">;</span>\n  <span class="token punctuation">}</span>\n<span class="token punctuation">}</span><span class="token punctuation">;</span>\n\n<span class="token function">resolvePromise</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">{</span>\n  <span class="token comment">// todo</span>\n<span class="token punctuation">}</span>\n</code></pre></div>',63)];var c=n(t,[["render",function(n,o,p,t,c,l){return a(),s("div",null,e)}]]);export{p as __pageData,c as default};