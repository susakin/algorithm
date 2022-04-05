const { resolve } = require("dns");

//call实现
Function.prototype._call = function (context) {
  const _context = context || window;
  _context.fn = this;
  const args = [...arguments].slice(1);
  const res = _context.fn(...args);
  delete _context.fn;
  return res;
}


//apply实现
Function.prototype._apply = function (context) {
  const _context = context || window;
  _context.fn = this;
  const args = arguments[1] || [];
  const res = _context.fn(...args);
  delete _context.fn;
  return res;
}


//bind函数实现
Function.prototype._bind = function (context) {
  const _this = this; 
  const args = [...arguments].slice(1);

  return function f() {
    if(this instanceof f) {
      return new _this(...args,...arguments);
    }
    return _this.apply(context,args.concat(...arguments))
  }

}

//深拷贝
function deepClone (obj) {
  if(typeof obj !== 'object') return;
  const _obj = Array.isArray(obj) ? [] : {};
  for(let k in obj) {
    if(obj.hasOwnPropery(k)) {
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
    } else if(t !== map[stack.pop]){
      return false;
    }
  }

  return !stack.length;

}

//函数节流

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
    state = reducer();
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

//leecode 路径和
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