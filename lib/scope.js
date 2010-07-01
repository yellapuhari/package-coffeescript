(function(){
  var Scope;
  var __hasProp = Object.prototype.hasOwnProperty;
  if (!(typeof process !== "undefined" && process !== null)) {
    this.exports = this;
  }
  exports.Scope = (function() {
    Scope = function(parent, expressions, method) {
      var _a;
      _a = [parent, expressions, method];
      this.parent = _a[0];
      this.expressions = _a[1];
      this.method = _a[2];
      this.variables = {};
      if (this.parent) {
        this.tempVar = this.parent.tempVar;
      } else {
        Scope.root = this;
        this.tempVar = '_a';
      }
      return this;
    };
    Scope.root = null;
    Scope.prototype.find = function(name) {
      if (this.check(name)) {
        return true;
      }
      this.variables[name] = 'var';
      return false;
    };
    Scope.prototype.any = function(fn) {
      var _a, k, v;
      _a = this.variables;
      for (v in _a) { if (__hasProp.call(_a, v)) {
        k = _a[v];
        if (fn(v, k)) {
          return true;
        }
      }}
      return false;
    };
    Scope.prototype.parameter = function(name) {
      this.variables[name] = 'param';
      return this.variables[name];
    };
    Scope.prototype.check = function(name) {
      if (this.variables.hasOwnProperty(name)) {
        return true;
      }
      return !!(this.parent && this.parent.check(name));
    };
    Scope.prototype.freeVariable = function() {
      var ordinal;
      while (this.check(this.tempVar)) {
        ordinal = 1 + parseInt(this.tempVar.substr(1), 36);
        this.tempVar = '_' + ordinal.toString(36).replace(/\d/g, 'a');
      }
      this.variables[this.tempVar] = 'var';
      return this.tempVar;
    };
    Scope.prototype.assign = function(name, value) {
      this.variables[name] = {
        value: value,
        assigned: true
      };
      return this.variables[name];
    };
    Scope.prototype.hasDeclarations = function(body) {
      return body === this.expressions && this.any(function(k, val) {
        return val === 'var';
      });
    };
    Scope.prototype.hasAssignments = function(body) {
      return body === this.expressions && this.any(function(k, val) {
        return val.assigned;
      });
    };
    Scope.prototype.declaredVariables = function() {
      var _a, _b, key, val;
      return (function() {
        _a = []; _b = this.variables;
        for (key in _b) { if (__hasProp.call(_b, key)) {
          val = _b[key];
          val === 'var' ? _a.push(key) : null;
        }}
        return _a;
      }).call(this).sort();
    };
    Scope.prototype.assignedVariables = function() {
      var _a, _b, key, val;
      _a = []; _b = this.variables;
      for (key in _b) { if (__hasProp.call(_b, key)) {
        val = _b[key];
        val.assigned ? _a.push("" + key + " = " + val.value) : null;
      }}
      return _a;
    };
    Scope.prototype.compiledDeclarations = function() {
      return this.declaredVariables().join(', ');
    };
    Scope.prototype.compiledAssignments = function() {
      return this.assignedVariables().join(', ');
    };
    return Scope;
  }).call(this);
})();
