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