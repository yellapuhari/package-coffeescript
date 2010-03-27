(function(){
  var balanced_string, compact, count, del, extend, flatten, helpers, include, merge, starts;
  var __hasProp = Object.prototype.hasOwnProperty;
  // This file contains the common helper functions that we'd like to share among
  // the **Lexer**, **Rewriter**, and the **Nodes**. Merge objects, flatten
  // arrays, count characters, that sort of thing.
  // Set up exported variables for both **Node.js** and the browser.
  if (!((typeof process !== "undefined" && process !== null))) {
    this.exports = this;
  }
  helpers = (exports.helpers = {});
  // Does a list include a value?
  helpers.include = (include = function include(list, value) {
    return list.indexOf(value) >= 0;
  });
  // Peek at the beginning of a given string to see if it matches a sequence.
  helpers.starts = (starts = function starts(string, literal, start) {
    return string.substring(start, (start || 0) + literal.length) === literal;
  });
  // Trim out all falsy values from an array.
  helpers.compact = (compact = function compact(array) {
    var _a, _b, _c, _d, item;
    _a = []; _b = array;
    for (_c = 0, _d = _b.length; _c < _d; _c++) {
      item = _b[_c];
      item ? _a.push(item) : null;
    }
    return _a;
  });
  // Count the number of occurences of a character in a string.
  helpers.count = (count = function count(string, letter) {
    var num, pos;
    num = 0;
    pos = string.indexOf(letter);
    while (pos !== -1) {
      num += 1;
      pos = string.indexOf(letter, pos + 1);
    }
    return num;
  });
  // Merge objects, returning a fresh copy with attributes from both sides.
  // Used every time `BaseNode#compile` is called, to allow properties in the
  // options hash to propagate down the tree without polluting other branches.
  helpers.merge = (merge = function merge(options, overrides) {
    var _a, _b, fresh, key, val;
    fresh = {};
    _a = options;
    for (key in _a) { if (__hasProp.call(_a, key)) {
      val = _a[key];
      (fresh[key] = val);
    }}
    if (overrides) {
      _b = overrides;
      for (key in _b) { if (__hasProp.call(_b, key)) {
        val = _b[key];
        (fresh[key] = val);
      }}
    }
    return fresh;
  });
  // Extend a source object with the properties of another object (shallow copy).
  // We use this to simulate Node's deprecated `process.mixin`
  helpers.extend = (extend = function extend(object, properties) {
    var _a, _b, key, val;
    _a = []; _b = properties;
    for (key in _b) { if (__hasProp.call(_b, key)) {
      val = _b[key];
      _a.push((object[key] = val));
    }}
    return _a;
  });
  // Return a completely flattened version of an array. Handy for getting a
  // list of `children` from the nodes.
  helpers.flatten = (flatten = function flatten(array) {
    var _a, _b, _c, item, memo;
    memo = [];
    _a = array;
    for (_b = 0, _c = _a.length; _b < _c; _b++) {
      item = _a[_b];
      item instanceof Array ? (memo = memo.concat(item)) : memo.push(item);
    }
    return memo;
  });
  // Delete a key from an object, returning the value. Useful when a node is
  // looking for a particular method in an options hash.
  helpers.del = (del = function del(obj, key) {
    var val;
    val = obj[key];
    delete obj[key];
    return val;
  });
  // Matches a balanced group such as a single or double-quoted string. Pass in
  // a series of delimiters, all of which must be nested correctly within the
  // contents of the string. This method allows us to have strings within
  // interpolations within strings, ad infinitum.
  helpers.balanced_string = (balanced_string = function balanced_string(str, delimited, options) {
    var _a, _b, _c, _d, close, i, levels, open, pair, slash;
    options = options || {};
    slash = delimited[0][0] === '/';
    levels = [];
    i = 0;
    while (i < str.length) {
      if (levels.length && starts(str, '\\', i)) {
        i += 1;
      } else {
        _a = delimited;
        for (_b = 0, _c = _a.length; _b < _c; _b++) {
          pair = _a[_b];
          _d = pair;
          open = _d[0];
          close = _d[1];
          if (levels.length && starts(str, close, i) && levels[levels.length - 1] === pair) {
            levels.pop();
            i += close.length - 1;
            if (!(levels.length)) {
              i += 1;
            }
            break;
          } else if (starts(str, open, i)) {
            levels.push(pair);
            i += open.length - 1;
            break;
          }
        }
      }
      if (!levels.length || slash && starts(str, '\n', i)) {
        break;
      }
      i += 1;
    }
    if (levels.length) {
      if (slash) {
        return false;
      }
      throw new Error("SyntaxError: Unterminated " + (levels.pop()[0]) + " starting on line " + (this.line + 1));
    }
    if (!i) {
      return false;
    } else {
      return str.substring(0, i);
    }
  });
})();
