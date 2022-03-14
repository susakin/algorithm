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
      self.status = 'resolved';
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


Promise.prototype.then = (onFulfilled,onRejected) => {
  const self = this;

  onFulfilled = typeof onFulfilled === 'function' ? onFulfilled : (v) => {};
  onRejected = typeof onFulfilled === 'function' ? onRejected : (v) => {};

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