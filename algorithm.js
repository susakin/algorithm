
//call实现
Function.prototype._call = function (context,...args) {
  const _context = context || window;
  _context.fn = this;
  const res = _context.fn(...args);
  delete _context.fn;
  return res;
}


//apply实现
Function.prototype._apply = function (context,args) {
  const _context = context || window;
  _context.fn = this;
  const res = _context.fn(...args);
  delete _context.fn;
  return res;
}


//bind函数实现
Function.prototype._bind = function (context,...args) {
  const _this = this;   
  const h = function () {};
  h.prototype = _this.prototype;

  const res = function() {
    return _this.apply(this instanceof res ? this : context,context,args.concat(...arguments))
  }

  res.prototype = new h();
  return res;

}

//深拷贝
function deepClone (obj) {
  if(typeof obj !== 'object') return;
  const _obj = Array.isArray(obj) ? [] : {};
  for(let k in obj) {
    if(obj.hasOwnProperty(k)) {
      const val = obj[k];
      _obj[k] = typeof val === 'object' ? deepClone(val) : val
    }
  }
  return _obj;
}

//new函数实现
function _new (fn,...args) {
  const obj = Object.create(fn.prototype);
  const res = fn.apply(obj,args);
  return res instanceof Object ? res : obj;
}


//有效的括号对数
const isValid = (s) => {
  const map = {
    '(' : ')',
    '{' : '}',
    '[' : ']'
  }

  const stack = [];
  for(let i = 0; i < s.length; i ++ ) {
    const t  = s[i];
    if(map[i]) {
      stack.push(t);
    } else if(t !== map[stack.pop()]){
      return false;
    }
  }

  return !stack.length;

}

//函数防抖
function debounce (fn ,delay) {
  let timer = null;
  return function () {
    if(timer) {
      clearTimeout(timer);
    }
    timer = setTimeout(() => {
      fn.apply(this,arguments);
      timer = null;
    },delay)
  }
}

//函数节流
function throttle(fn,delay) {
  let timer = null;
  return function () {
    if(timer)  {
      return;
    }
    timer = setTimeout(() => {
      fn.apply(this,arguments);
      timer = null;
    },delay)
  }
}

//promise.all实现
Promise.prototype._all = (arr) => {
  const result = [];
  const length = arr.length;
  let count = 0;

  return new Promise((resolve,reject) => {
    arr.forEach((p,index) => {
      Promise.resolve(p).then(res => {
        result[index] = res;
        count ++;
        length == count && resolve(result);
      },err => reject(err))
    })
  })
}

//promise.race实现

Promise.prototype._race = (arr) => {
  return new Promise((resolve,reject) => {
    arr.forEach((p) => {
      Promise.resolve(p).then(res => {
        resolve(res)
      },err => reject(err))
    })
  })
}

//promise
function Promise(fn) {
  const self = this;
  self.status = 'pedding';
  self.data = undefined;
  self.onFulfilledCallback = [];
  self.onRejectedCallback = [];

  function resolve(value) {
    if(self.status === 'pedding') {
      self.status = 'resolved';
      self.data = value;
      setTimeout(() => {
        const length = self.onFulfilledCallback.length;
        for(let i = 0; i < length; i ++) {
          self.onFulfilledCallback[i](value);
        }
      })
    }
  }

  function reject(reason) {
    if(self.status === 'pedding') {
      self.status = 'rejected';
      self.data = reason;
      setTimeout(() => {
        const length = self.onRejectedCallback.length;
        for(let i = 0; i < length; i ++) {
          self.onRejectedCallback[i](reason);
        }
      })
    }
  }

  try {
    fn(resolve,reject);
  } catch (e) {
    reject(e);
  }

}


Promise.prototype.then = (onFulfilled = (v) => {},onRejected =(v) => {}) => {
  const self = this;

  if(self.status === 'resolved') {
    return new Promise((resolve,reject) => {
      setTimeout(() => {
        try {
          const res = onFulfilled(self.data);
          if(res instanceof Promise) {
            res.then(resolve,reject);
          } else {
            resolve(res);
          }
        }catch(e) {
          reject(e);
        }
      })
    })
  }

  if(self.status === 'rejected') {
    return new Promise((resolve,reject) => {
      setTimeout(() => {
        try {
          const res = onRejected(self.data);
          if(res instanceof Promise) {
            res.then(resolve,reject);
          } else {
            reject(res);
          }
        }catch(e) {
          reject(e);
        }
      })
    })

  }

  if(self.status == 'pedding') {
    return new Promise((resolve,reject) => {
      self.onFulfilledCallback.push(() => {
        setTimeout(() => {
          try {
            const res = onFulfilled(self.data);
            if(res instanceof Promise) {
              res.then(resolve,reject);
            } else {
              resolve(res);
            }
          }catch(e) {
            reject(e);
          }          
        })
      })

      self.onRejectedCallback.push(() => {
        setTimeout(() => {
          try {
            const res = onRejected(self.data);
            if(res instanceof Promise) {
              res.then(resolve,reject);
            } else {
              reject(res);
            }
          }catch(e) {
            reject(e);
          }
        })        
      })

    })



  }

}


//数组扁平化
function flatten(arr) {
  return arr.reduce((pre,cur) => {
    return pre.concat(Array.isArray(cur) ? flatten(cur) : cur);
  },[]);
}

//发布订阅模式

class  EventEmitter {
  constructor() {
    this._event = {};
  }

  on(eventName,callback) {
    const callbacks = this._event[eventName] || [];
    callbacks.push(callback);
    this._event[eventName] = callbacks
  }

  emit(eventName,...args) {
    const callbacks = this._event[eventName] || [];
    callbacks.forEach(cb => cb(...args));
  }

  once(eventName,callback) {
    const once = (...args) => {
      callback(...args);
      this.off(eventName,once);
    }

    this.on(eventName,once)

  }

  off(eventName,callback) {
    const callbacks = this._event[eventName] || [];
    this._event[eventName] = callbacks.filter(cb => cb != callback);
  }

}


//树的层序遍历
const levelOrder = function(root) {
  const res = [];
  if(!root) return res;

  const queue = [root];
  while(queue.length) {
    const level = [];
    const len = queue.length;
    for(let i =0 ; i< len; i ++) {
      const node = queue.pop();
      level.push(node.val);
      node.left && queue.push(node.left);
      node.right && queue.push(node.right);
    }

    res.push(level);
  }
  return res;
}

//前序遍历
const preOrder = (node) => {
  if(node !== null) {
    console.log(node.val);
    preOrder(node.left);
    preOrder(node.right);
  }
}

//中序遍历
const inOrder= (node) => {
  if(node !== null) {
    inOrder(node.left);
    console.log(node.val);
    inOrder(node.right);
  }
}

//后序遍历
const postOrder = (node) => {
  if(node !== null) {
    postOrder(node.left);
    postOrder(node.right);
    console.log(node.val);
  }
}

//请求并发控制
function requestWithLimit(urls,num,callback) {
  (function request(res) {
    urls.length ? Promise.all(urls.splice(0,num).map(url => fetch(url))).then(r => request(res.concat(r))) : callback(res);
  })([]);
}

//instanceof
function _instanceof(left,right) {
  const prototype = right.prototype;
  left = left.__proto__;
  while(left) {
    if(prototype == left)
      return true;
    left = left.__proto__;
  }
  return false;
}

//实现一个sleep
function delay(func,seconds,...args) {
  return new Promise((resolve,reject) => {
    setTimeout(() => {
      Promise.resolve(func(...args)).then(resolve).catch(reject);
    },seconds)
  })
}

//带并发得异步调度器Scheduler
class Scheduler {
  constructor() {
    this.tasks = [];
    this.running = 0;
    this.maxRunningLength = 2;
  }

  add(promiseMaker) {
    if(this.running < this.maxRunningLength) {
      this.run(promiseMaker);
    } else {
      this.tasks.push(promiseMaker);
    }
  }

  run(promiseMaker) {
    this.running ++ ;
    promiseMaker().then(() => {
      this.running --;
      if(this.tasks.length > 0) {
        this.run(this.tasks.shift());
      }
    })
  }

}


//简易的Redux
function createStore(reducer) {
  let state;
  const listeners = [];

  function subscribe(callback) {
    listeners.push(callback);
  }

  function dispatch(action) {
    state = reducer(action);
    for(let i = 0; i < listeners.length; i ++) {
      const listener = listeners[i];
      listener();
    }
  }

  function getState() {
    return state;
  }

  const store = {
    subscribe,
    dispatch,
    getState
  }
}
// 路径和
function hasPathSum(root,targetSum) {
  if(root == null) {
    return false;
  }

  if(root.left === null && root.right === null) {
    return root.val == targetSum;
  }

  return hasPathSum(root.left,targetSum - root.val) || hasPathSum(root.right,targetSum - root.val)


}


//reduce实现
Array.prototype._reduce = (fn = () => {},initialValue) => {
  const _this = this;
  let res = initialValue ? initialValue : _this[0];

  for(let i = 0; i < _this.length; i ++) {
    res = fn(res,arr[i],i,_this);
  }

  return res;

}

//两数之和
const twoSum = (nums,target) => {
  const len = nums.length;
  for(let i = 0; i  < len; i++) {
      for(let j = 0; j < len; j++) {
          if(i !=j && nums[i] + nums[j] == target){
            return [i,j];
          }
      }
  }
}

//三数之和
const threeSum = (nums,target) => {
  const res = [];
  const len = nums.length;
  for(let i = 0; i < len; i ++) {
      for(let j = i + 1; j < len; j ++) {
          for(let k = j  + 1; k < len; k ++ ) {
              if(nums[i] + nums[j] + nums[k] === 0) {
                res.push(nums[i],nums[j],nums[k]);
              }
          }
      }
  }
}
//数组最大连续子序列和
const maxSubArray = function(nums) {
  let res = nums[0];
  let sum = 0
  for(let num of nums) {
    if(sum + num > num) {
      sum += num;
    } else {
      sum = num;
    }
    res = Math.max(res,sum);
  }

  return res;
}

//大数相乘
const multiply  = function(a,b) {
  const arr = new Array(a.length + b.length).fill(0);

  for(let i = a.length - 1;i >= 0; i--) {
    for(let j = b.length -1; j >= 0; j--) {
      const m = a[i] * b[j] + arr[i + j +1];
      arr[i + j] = Math.floor(m/10);
      arr[i + j + 1] = m % 10;
    }
  }
  return arr.join('').replace(/^0+/,'');
}
//快速排序
const quickSort = (arr) => {
  if(arr.length <= 1) return arr;
  const n = arr[Math.floor(arr.length/2)];

  const left = [];
  const right = [];

  for(let i = 0; i < arr.length; i ++) {
    const t = arr[i];
    if(t > n) {
      right.push(n);
    } else {
      left.push(n);
    }
  }

  return quickSort(left).concat([n],quickSort(right));

}

//实现一个lazyMan
const sleepTask = () => new Promise((resolve) => {
  setTimeout(() => resolve(console.log(`wake up after ${d}`)),d  * 1000);
})

function lazyMan(name) {
  const ctx = {};
  const tasks = [() => console.log(`Hi! This is ${name}`)];

  ctx.sleep = (d) => {
    tasks.push(sleepTask(d));
    return ctx;
  }

  ctx.sleepFirst = (d) => {
    tasks.unshift(sleepTask(d));
    return ctx;
  }

  ctx.eat = (food) => {
    tasks.push(() => console.log(`Eat ${food}`))
    return ctx;
  }

  (() => {
    setTimeout(async () => {
      while(tasks.length) {
        await tasks.shift()();
      }
    })
  })()

  return ctx;

}


/**
 * LRU 是Least Recently Used的缩写，即是最近最少使用，是一种常见的页面置换算法，选择内存中最久未使用的页面予以淘汰
 */

const LRUCache = function (capacity) {
  this.cache = new Map();
  this.capacity = capacity;
}

LRUCache.prototype.get = function(key) {
  if(this.cache.has(key)) {
    //存在即更新
    const _key = this.cache.get(key);
    this.cache.delete(_key);
    this.cache.set(key,temp);
    return _key;
  }
  return -1;
}

LRUCache.prototype.put = function(key,value){
  if(this.cache.has(key)) {
    //存在即更新（删除后加入）
    this.cache.delete(key);
  } else if(this.cache.size >= this.capacity) {
    // 不存在即加入
    // 缓存超过最大值，则移除最近没有使用的
    // new Map().keys() 返回一个新的 Iterator 对象
    this.cache.delete(this.cache.keys().next().value)    ;
  }
  this.cache.set(key,value);
}

/**
 * 观察者模式
 * 定义了一种一对多的关系，让多个观察者对象同时监听某一个主题对象，这个主题对象的状态发生变化时就会通知所有的观察者对象，使它们能够自动更新自己，当一个对象的改变需要同时改变其它对象，并且它不知道具体有多少对象需要改变的时候，就应该考虑使用观察者模式。
 */
class Subject {
  constructor() {
    this.state = 0;
    this.observers = [];
  }

  getState() {
    return this.state;
  }

  setState(state) {
    this.state = state;
  }

  notifyAllObservers() {
    this.observers.forEach(observer => {
      observer.update();
    })
  }

  attach(observer) {
    this.observers.push(observer);
  }

}
// 观察者
class Observer {
  constructor(name, subject) {
    this.name = name
    this.subject = subject
    this.subject.attach(this)
  }
  update() {
    console.log(`${this.name} update, state: ${this.subject.getState()}`)
  }
}

// 测试
let s = new Subject()
let o1 = new Observer('o1', s)
let o2 = new Observer('02', s)

s.setState(12)

//字节高频算法题
//https://juejin.cn/post/6947842412102287373#comment

//链表
/**
 * 判断回文链表
 * https://leetcode.cn/problems/palindrome-linked-list/solution/by-allan2coder-azf1/
 */ 
const isPalindrome = function(head ) {
  const arr = [];
  while(head !== null) {
    arr.push(head.val);
    head = head.next;
  } 
  for(let i = 0,j = arr.length - 1; i < arr.length -1,j > 0; i ++ ,j --) {
    if(arr[i] != arr[j]) return false;
  }
  return true;
}


/**
 * 反转链表
 * https://leetcode.cn/problems/reverse-linked-list/solution/by-1105389168-oncv/
 */

function reverseList(head) {
  let prev = null;
  let cur = head;
  while(cur) {
    const next = cur.next;
    cur.next = prev;
    prev = cur;
    cur = next;
  }
  return prev;
}
/**
 * 环形链表
 * https://leetcode.cn/problems/linked-list-cycle/
 */

const hasCycle = function(head) {
  while(head) {
    if(head.visited) return true;
    head.visited = true;
    head = head.next;
  }
  return false;
}

/**
 * 相交链表
 * https://leetcode.cn/problems/intersection-of-two-linked-lists/solution/160-xiang-jiao-lian-biao-by-1105389168-h2ai/
 */

function getIntersectionNode(headA,headB) {
  let pA = headA,pB = headB;
  while(pA !== pB) {
    pA = pA === null ? headB : pA.next;
    pB = pB === null ? headA : pB.next;
  }
  return pA;
}

/**
 * 最长回文子串
 * https://leetcode.cn/problems/longest-palindromic-substring/solution/by-bei-chen-8h-1b9m/
 */
const longestPalidrome = function(s){
  let max = '';
  function helper(l,r) {
    while(l >=0 &&r < s.length && s[l] === s[r]) {
      l --;
      r ++
    }
    const str = s.slice(l +1,r);
    if(str.length >max.length) max = str;
  }
  for(let i = 0; i < s.length;i ++) {
    helper(i,i);
    helper(i, i +1);
  }
  return max;
}
/**
 * 最长公共子串
 * https://leetcode.cn/problems/longest-common-prefix/solution/by-lzxjack-jlvi/
 */
const longestCommonPrefix = strs => {
  strs.sort();
  const [start,end] = [str[0],str[strs.length - 1]];
  let count = 0;
  for(let i = 0; i < start.length; i ++) {
    if(start[i] === end[i]) {
      count ++;
    } else {
      break;
    }
  }
  return start.slice(0,count);
}
/**
 * 无重复字符的最长子串
 * https://leetcode.cn/problems/longest-substring-without-repeating-characters/
 */   
const lengthOfLogestSubstring = (str) => {
  const res = [];
  let max = 0;
  for(let s of str) {
    while(res.includes(s)) {
      res.shift();
    }
    res.push(s);
    max = Math.max(max,res.length);
  }
  return max;
}
/**
 * 最长连续递增序列
 * https://leetcode.cn/problems/longest-continuous-increasing-subsequence/solution/dai-ma-jian-ji-yi-chong-huan-bu-cuo-de-j-jiw8/
 */ 
const findLengthOfLCIS = (nums) =>{
  if(nums.length < 2) return nums.length;
  let left = 0, current = 0, right = 1,len = 1;
  while(right < nums.length) {
    if(nums[right] <= nums[current]) {
      left = right;
    }
    len = Max(len,right - left + 1);
    current ++;
    right ++;
  }
  return len;
}
/**
 * 斐波拉切数列
 * 
 */
const fib = (n) => {
  if(n < 2) return n;
  return fib(n -1) + fib(n - 2);
}

const fib1 = (n) => { 
  if(n < 2) return n;
  const arr = new Array(n);
  arr[0] = 0;
  arr[1] = 1;
  for(i = 2; i <= n; i++) {
    arr[i] = arr[i -1] + arr[i - 2];
  }
  return arr[n];
}
/**
 * 数组全排列
 */
const permute = function (nums) {
  if(nums.length === 0) {
    return nums;
  }
  const res = [];
  function dfs(arr) {
    if(arr.length == nums.length) {
      res.push(arr);
      return;
    }
    for(let i =0; i <nums.length;i ++) {
      const e = nums[i];
      if(!arr.includes(e)) {
        dfs([...arr,e]);
      }
    }
  }
  dfs([]);
  return res;
}
/**
 * 盛最多水
 * https://leetcode.cn/problems/container-with-most-water/solution/jsjie-ti-si-lu-qing-xi-ming-liao-by-inte-aav9/
 */
const maxArea = (height) => {
  let max = 0,left = 0, right = height.length - 1;
  while(left < right) {
    const temp = (right - left) * Math.min(height[left],height[right]);
    max = Math.max(temp,max);
    if(height[left] < height[right]) {
      left ++ ;
    } else{
      right --;
    }
  }
  return max;
}

/**
 * 买股票的最佳时机
 * https://leetcode.cn/problems/best-time-to-buy-and-sell-stock/solution/maimai-by-1105389168-heyc/
 */ 
const maxProfit = (prices) => {  
  if(prices.length == 0)  return 0;
  let min = prices[0];
  let max = 0;
  for(let i of prices) {
    min = Math.min(min,i);
    max = Math.max(max,i - min);
  }
  return max;
}
/**
 * 股票买卖最佳
 * https://leetcode.cn/problems/best-time-to-buy-and-sell-stock-ii/solution/dai-ma-jian-ji-de-jie-fa-jsban-ben-by-it-q49l/
 */
const maxProfit1 = (prices) => {
  if(prices.length < 2) return 0;
  let res = 0;
  for(let i = 0; i < prices.length; i ++) {
    if(prices[i] > prices[i - 1] ) {
      res += prices[i] - prices[i-1];
    }
  }
  return res;
}

//数组去重
function unique(arr) {
  return arr.reduce((prev,cur) => prev.includes(cur) ? prev :[...prev,cur],[]);
}

//大数相加
function add(a,b) {
  const maxLength = Math.max(a.length,b.length);
  a = a.padStart(maxLength,0);
  b = b.padStart(maxLength,0);
  let t = 0;
  let f = 0;//进位
  let sum = '';
  for(let i = maxLength - 1; i >= 0; i --) {
    t = parseInt(a[i]) + parseInt(b[i]) + f;
    f = Math.floor(t/10);
    sum = t % 10 + sum;
  }
  if(f == 1) {
    sum = '1' + sum;
  }
  return sum;
}

// 数组中第k大的元素
function findKthLarget(nums,k) {
  nums = nums.sort((a,b) =>{
    return b - a;
  })
  return nums[k];
}