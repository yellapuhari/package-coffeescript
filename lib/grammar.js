(function(){
  var Parser, _a, _b, _c, _d, _e, _f, _g, _h, alt, alternatives, grammar, name, o, operators, token, tokens, unwrap;
  var __hasProp = Object.prototype.hasOwnProperty;
  Parser = require('jison').Parser;
  unwrap = /function\s*\(\)\s*\{\s*return\s*([\s\S]*);\s*\}/;
  o = function(patternString, action, options) {
    var match;
    if (!(action)) {
      return [patternString, '$$ = $1;', options];
    }
    action = (match = (action + '').match(unwrap)) ? match[1] : ("(" + action + "())");
    return [patternString, ("$$ = " + action + ";"), options];
  };
  grammar = {
    Root: [
      o("", function() {
        return new Expressions();
      }), o("TERMINATOR", function() {
        return new Expressions();
      }), o("Body"), o("Block TERMINATOR")
    ],
    Body: [
      o("Line", function() {
        return Expressions.wrap([$1]);
      }), o("Body TERMINATOR Line", function() {
        return $1.push($3);
      }), o("Body TERMINATOR")
    ],
    Line: [o("Expression"), o("Statement")],
    Statement: [
      o("Return"), o("Throw"), o("BREAK", function() {
        return new LiteralNode($1);
      }), o("CONTINUE", function() {
        return new LiteralNode($1);
      })
    ],
    Expression: [o("Value"), o("Call"), o("Code"), o("Operation"), o("Assign"), o("If"), o("Try"), o("While"), o("For"), o("Switch"), o("Extends"), o("Class"), o("Splat"), o("Existence")],
    Block: [
      o("INDENT Body OUTDENT", function() {
        return $2;
      }), o("INDENT OUTDENT", function() {
        return new Expressions();
      })
    ],
    Identifier: [
      o("IDENTIFIER", function() {
        return new LiteralNode($1);
      })
    ],
    AlphaNumeric: [
      o("NUMBER", function() {
        return new LiteralNode($1);
      }), o("STRING", function() {
        return new LiteralNode($1);
      })
    ],
    Literal: [
      o("AlphaNumeric"), o("JS", function() {
        return new LiteralNode($1);
      }), o("REGEX", function() {
        return new LiteralNode($1);
      }), o("TRUE", function() {
        return new LiteralNode(true);
      }), o("FALSE", function() {
        return new LiteralNode(false);
      }), o("YES", function() {
        return new LiteralNode(true);
      }), o("NO", function() {
        return new LiteralNode(false);
      }), o("ON", function() {
        return new LiteralNode(true);
      }), o("OFF", function() {
        return new LiteralNode(false);
      })
    ],
    Assign: [
      o("Assignable ASSIGN Expression", function() {
        return new AssignNode($1, $3);
      })
    ],
    AssignObj: [
      o("Identifier", function() {
        return new ValueNode($1);
      }), o("AlphaNumeric"), o("Identifier ASSIGN Expression", function() {
        return new AssignNode(new ValueNode($1), $3, 'object');
      }), o("AlphaNumeric ASSIGN Expression", function() {
        return new AssignNode(new ValueNode($1), $3, 'object');
      })
    ],
    Return: [
      o("RETURN Expression", function() {
        return new ReturnNode($2);
      }), o("RETURN", function() {
        return new ReturnNode(new ValueNode(new LiteralNode('null')));
      })
    ],
    Existence: [
      o("Expression ?", function() {
        return new ExistenceNode($1);
      })
    ],
    Code: [
      o("PARAM_START ParamList PARAM_END FuncGlyph Block", function() {
        return new CodeNode($2, $5, $4);
      }), o("FuncGlyph Block", function() {
        return new CodeNode([], $2, $1);
      })
    ],
    FuncGlyph: [
      o("->", function() {
        return 'func';
      }), o("=>", function() {
        return 'boundfunc';
      })
    ],
    OptComma: [o(''), o(',')],
    ParamList: [
      o("", function() {
        return [];
      }), o("Param", function() {
        return [$1];
      }), o("ParamList , Param", function() {
        return $1.concat([$3]);
      })
    ],
    Param: [
      o("PARAM", function() {
        return new LiteralNode($1);
      }), o("Param . . .", function() {
        return new SplatNode($1);
      })
    ],
    Splat: [
      o("Expression . . .", function() {
        return new SplatNode($1);
      })
    ],
    SimpleAssignable: [
      o("Identifier", function() {
        return new ValueNode($1);
      }), o("Value Accessor", function() {
        return $1.push($2);
      }), o("Invocation Accessor", function() {
        return new ValueNode($1, [$2]);
      }), o("ThisProperty")
    ],
    Assignable: [
      o("SimpleAssignable"), o("Array", function() {
        return new ValueNode($1);
      }), o("Object", function() {
        return new ValueNode($1);
      })
    ],
    Value: [
      o("Assignable"), o("Literal", function() {
        return new ValueNode($1);
      }), o("Parenthetical", function() {
        return new ValueNode($1);
      }), o("Range", function() {
        return new ValueNode($1);
      }), o("This"), o("NULL", function() {
        return new ValueNode(new LiteralNode('null'));
      })
    ],
    Accessor: [
      o("PROPERTY_ACCESS Identifier", function() {
        return new AccessorNode($2);
      }), o("PROTOTYPE_ACCESS Identifier", function() {
        return new AccessorNode($2, 'prototype');
      }), o("::", function() {
        return new AccessorNode(new LiteralNode('prototype'));
      }), o("SOAK_ACCESS Identifier", function() {
        return new AccessorNode($2, 'soak');
      }), o("Index"), o("Slice", function() {
        return new SliceNode($1);
      })
    ],
    Index: [
      o("INDEX_START Expression INDEX_END", function() {
        return new IndexNode($2);
      }), o("INDEX_SOAK Index", function() {
        $2.soakNode = true;
        return $2;
      }), o("INDEX_PROTO Index", function() {
        $2.proto = true;
        return $2;
      })
    ],
    Object: [
      o("{ AssignList OptComma }", function() {
        return new ObjectNode($2);
      })
    ],
    AssignList: [
      o("", function() {
        return [];
      }), o("AssignObj", function() {
        return [$1];
      }), o("AssignList , AssignObj", function() {
        return $1.concat([$3]);
      }), o("AssignList OptComma TERMINATOR AssignObj", function() {
        return $1.concat([$4]);
      }), o("AssignList OptComma INDENT AssignList OptComma OUTDENT", function() {
        return $1.concat($4);
      })
    ],
    Class: [
      o("CLASS SimpleAssignable", function() {
        return new ClassNode($2);
      }), o("CLASS SimpleAssignable EXTENDS Value", function() {
        return new ClassNode($2, $4);
      }), o("CLASS SimpleAssignable INDENT ClassBody OUTDENT", function() {
        return new ClassNode($2, null, $4);
      }), o("CLASS SimpleAssignable EXTENDS Value INDENT ClassBody OUTDENT", function() {
        return new ClassNode($2, $4, $6);
      })
    ],
    ClassAssign: [
      o("AssignObj", function() {
        return $1;
      }), o("ThisProperty ASSIGN Expression", function() {
        return new AssignNode(new ValueNode($1), $3, 'this');
      })
    ],
    ClassBody: [
      o("", function() {
        return [];
      }), o("ClassAssign", function() {
        return [$1];
      }), o("ClassBody TERMINATOR ClassAssign", function() {
        return $1.concat($3);
      })
    ],
    Call: [
      o("Invocation"), o("NEW Invocation", function() {
        return $2.newInstance();
      }), o("Super")
    ],
    Extends: [
      o("SimpleAssignable EXTENDS Value", function() {
        return new ExtendsNode($1, $3);
      })
    ],
    Invocation: [
      o("Value Arguments", function() {
        return new CallNode($1, $2);
      }), o("Invocation Arguments", function() {
        return new CallNode($1, $2);
      })
    ],
    Arguments: [
      o("CALL_START ArgList OptComma CALL_END", function() {
        return $2;
      })
    ],
    Super: [
      o("SUPER Arguments", function() {
        return new CallNode('super', $2);
      })
    ],
    This: [
      o("THIS", function() {
        return new ValueNode(new LiteralNode('this'));
      }), o("@", function() {
        return new ValueNode(new LiteralNode('this'));
      })
    ],
    ThisProperty: [
      o("@ Identifier", function() {
        return new ValueNode(new LiteralNode('this'), [new AccessorNode($2)]);
      })
    ],
    Range: [
      o("[ Expression . . Expression ]", function() {
        return new RangeNode($2, $5);
      }), o("[ Expression . . . Expression ]", function() {
        return new RangeNode($2, $6, true);
      })
    ],
    Slice: [
      o("INDEX_START Expression . . Expression INDEX_END", function() {
        return new RangeNode($2, $5);
      }), o("INDEX_START Expression . . . Expression INDEX_END", function() {
        return new RangeNode($2, $6, true);
      })
    ],
    Array: [
      o("[ ArgList OptComma ]", function() {
        return new ArrayNode($2);
      })
    ],
    ArgList: [
      o("", function() {
        return [];
      }), o("Expression", function() {
        return [$1];
      }), o("ArgList , Expression", function() {
        return $1.concat([$3]);
      }), o("ArgList OptComma TERMINATOR Expression", function() {
        return $1.concat([$4]);
      }), o("ArgList OptComma INDENT ArgList OptComma OUTDENT", function() {
        return $1.concat($4);
      })
    ],
    SimpleArgs: [
      o("Expression"), o("SimpleArgs , Expression", function() {
        if ($1 instanceof Array) {
          return $1.concat([$3]);
        } else {
          return [$1].concat([$3]);
        }
      })
    ],
    Try: [
      o("TRY Block Catch", function() {
        return new TryNode($2, $3[0], $3[1]);
      }), o("TRY Block FINALLY Block", function() {
        return new TryNode($2, null, null, $4);
      }), o("TRY Block Catch FINALLY Block", function() {
        return new TryNode($2, $3[0], $3[1], $5);
      })
    ],
    Catch: [
      o("CATCH Identifier Block", function() {
        return [$2, $3];
      })
    ],
    Throw: [
      o("THROW Expression", function() {
        return new ThrowNode($2);
      })
    ],
    Parenthetical: [
      o("( Line )", function() {
        return new ParentheticalNode($2);
      })
    ],
    WhileSource: [
      o("WHILE Expression", function() {
        return new WhileNode($2);
      }), o("WHILE Expression WHEN Expression", function() {
        return new WhileNode($2, {
          guard: $4
        });
      }), o("UNTIL Expression", function() {
        return new WhileNode($2, {
          invert: true
        });
      }), o("UNTIL Expression WHEN Expression", function() {
        return new WhileNode($2, {
          invert: true,
          guard: $4
        });
      })
    ],
    While: [
      o("WhileSource Block", function() {
        return $1.addBody($2);
      }), o("Statement WhileSource", function() {
        return $2.addBody(Expressions.wrap([$1]));
      }), o("Expression WhileSource", function() {
        return $2.addBody(Expressions.wrap([$1]));
      }), o("Loop", function() {
        return $1;
      })
    ],
    Loop: [
      o("LOOP Block", function() {
        return new WhileNode(new LiteralNode('true')).addBody($2);
      }), o("LOOP Expression", function() {
        return new WhileNode(new LiteralNode('true')).addBody(Expressions.wrap([$2]));
      })
    ],
    For: [
      o("Statement FOR ForVariables ForSource", function() {
        return new ForNode($1, $4, $3[0], $3[1]);
      }), o("Expression FOR ForVariables ForSource", function() {
        return new ForNode($1, $4, $3[0], $3[1]);
      }), o("FOR ForVariables ForSource Block", function() {
        return new ForNode($4, $3, $2[0], $2[1]);
      })
    ],
    ForValue: [
      o("Identifier"), o("Array", function() {
        return new ValueNode($1);
      }), o("Object", function() {
        return new ValueNode($1);
      })
    ],
    ForVariables: [
      o("ForValue", function() {
        return [$1];
      }), o("ForValue , ForValue", function() {
        return [$1, $3];
      })
    ],
    ForSource: [
      o("IN Expression", function() {
        return {
          source: $2
        };
      }), o("OF Expression", function() {
        return {
          source: $2,
          object: true
        };
      }), o("IN Expression WHEN Expression", function() {
        return {
          source: $2,
          guard: $4
        };
      }), o("OF Expression WHEN Expression", function() {
        return {
          source: $2,
          guard: $4,
          object: true
        };
      }), o("IN Expression BY Expression", function() {
        return {
          source: $2,
          step: $4
        };
      }), o("IN Expression WHEN Expression BY Expression", function() {
        return {
          source: $2,
          guard: $4,
          step: $6
        };
      }), o("IN Expression BY Expression WHEN Expression", function() {
        return {
          source: $2,
          step: $4,
          guard: $6
        };
      })
    ],
    Switch: [
      o("SWITCH Expression INDENT Whens OUTDENT", function() {
        return $4.switchesOver($2);
      }), o("SWITCH Expression INDENT Whens ELSE Block OUTDENT", function() {
        return $4.switchesOver($2).addElse($6, true);
      }), o("SWITCH INDENT Whens OUTDENT", function() {
        return $3;
      }), o("SWITCH INDENT Whens ELSE Block OUTDENT", function() {
        return $3.addElse($5, true);
      })
    ],
    Whens: [
      o("When"), o("Whens When", function() {
        return $1.addElse($2);
      })
    ],
    When: [
      o("LEADING_WHEN SimpleArgs Block", function() {
        return new IfNode($2, $3, {
          statement: true
        });
      }), o("LEADING_WHEN SimpleArgs Block TERMINATOR", function() {
        return new IfNode($2, $3, {
          statement: true
        });
      })
    ],
    IfBlock: [
      o("IF Expression Block", function() {
        return new IfNode($2, $3);
      }), o("UNLESS Expression Block", function() {
        return new IfNode($2, $3, {
          invert: true
        });
      }), o("IfBlock ELSE IF Expression Block", function() {
        return $1.addElse((new IfNode($4, $5)).forceStatement());
      }), o("IfBlock ELSE Block", function() {
        return $1.addElse($3);
      })
    ],
    If: [
      o("IfBlock"), o("Statement IF Expression", function() {
        return new IfNode($3, Expressions.wrap([$1]), {
          statement: true
        });
      }), o("Expression IF Expression", function() {
        return new IfNode($3, Expressions.wrap([$1]), {
          statement: true
        });
      }), o("Statement UNLESS Expression", function() {
        return new IfNode($3, Expressions.wrap([$1]), {
          statement: true,
          invert: true
        });
      }), o("Expression UNLESS Expression", function() {
        return new IfNode($3, Expressions.wrap([$1]), {
          statement: true,
          invert: true
        });
      })
    ],
    Operation: [
      o("! Expression", function() {
        return new OpNode('!', $2);
      }), o("!! Expression", function() {
        return new OpNode('!!', $2);
      }), o("- Expression", (function() {
        return new OpNode('-', $2);
      }), {
        prec: 'UMINUS'
      }), o("+ Expression", (function() {
        return new OpNode('+', $2);
      }), {
        prec: 'UPLUS'
      }), o("~ Expression", function() {
        return new OpNode('~', $2);
      }), o("-- Expression", function() {
        return new OpNode('--', $2);
      }), o("++ Expression", function() {
        return new OpNode('++', $2);
      }), o("DELETE Expression", function() {
        return new OpNode('delete', $2);
      }), o("TYPEOF Expression", function() {
        return new OpNode('typeof', $2);
      }), o("Expression --", function() {
        return new OpNode('--', $1, null, true);
      }), o("Expression ++", function() {
        return new OpNode('++', $1, null, true);
      }), o("Expression * Expression", function() {
        return new OpNode('*', $1, $3);
      }), o("Expression / Expression", function() {
        return new OpNode('/', $1, $3);
      }), o("Expression % Expression", function() {
        return new OpNode('%', $1, $3);
      }), o("Expression + Expression", function() {
        return new OpNode('+', $1, $3);
      }), o("Expression - Expression", function() {
        return new OpNode('-', $1, $3);
      }), o("Expression << Expression", function() {
        return new OpNode('<<', $1, $3);
      }), o("Expression >> Expression", function() {
        return new OpNode('>>', $1, $3);
      }), o("Expression >>> Expression", function() {
        return new OpNode('>>>', $1, $3);
      }), o("Expression & Expression", function() {
        return new OpNode('&', $1, $3);
      }), o("Expression | Expression", function() {
        return new OpNode('|', $1, $3);
      }), o("Expression ^ Expression", function() {
        return new OpNode('^', $1, $3);
      }), o("Expression <= Expression", function() {
        return new OpNode('<=', $1, $3);
      }), o("Expression < Expression", function() {
        return new OpNode('<', $1, $3);
      }), o("Expression > Expression", function() {
        return new OpNode('>', $1, $3);
      }), o("Expression >= Expression", function() {
        return new OpNode('>=', $1, $3);
      }), o("Expression == Expression", function() {
        return new OpNode('==', $1, $3);
      }), o("Expression != Expression", function() {
        return new OpNode('!=', $1, $3);
      }), o("Expression && Expression", function() {
        return new OpNode('&&', $1, $3);
      }), o("Expression || Expression", function() {
        return new OpNode('||', $1, $3);
      }), o("Expression ? Expression", function() {
        return new OpNode('?', $1, $3);
      }), o("Expression -= Expression", function() {
        return new OpNode('-=', $1, $3);
      }), o("Expression += Expression", function() {
        return new OpNode('+=', $1, $3);
      }), o("Expression /= Expression", function() {
        return new OpNode('/=', $1, $3);
      }), o("Expression *= Expression", function() {
        return new OpNode('*=', $1, $3);
      }), o("Expression %= Expression", function() {
        return new OpNode('%=', $1, $3);
      }), o("Expression ||= Expression", function() {
        return new OpNode('||=', $1, $3);
      }), o("Expression &&= Expression", function() {
        return new OpNode('&&=', $1, $3);
      }), o("Expression ?= Expression", function() {
        return new OpNode('?=', $1, $3);
      }), o("Expression INSTANCEOF Expression", function() {
        return new OpNode('instanceof', $1, $3);
      }), o("Expression IN Expression", function() {
        return new InNode($1, $3);
      }), o("Expression OF Expression", function() {
        return new OpNode('in', $1, $3);
      }), o("Expression ! IN Expression", function() {
        return new OpNode('!', new InNode($1, $4));
      }), o("Expression ! OF Expression", function() {
        return new OpNode('!', new ParentheticalNode(new OpNode('in', $1, $4)));
      })
    ]
  };
  operators = [["left", '?'], ["nonassoc", 'UMINUS', 'UPLUS', '!', '!!', '~', '++', '--'], ["left", '*', '/', '%'], ["left", '+', '-'], ["left", '<<', '>>', '>>>'], ["left", '&', '|', '^'], ["left", '<=', '<', '>', '>='], ["right", 'DELETE', 'INSTANCEOF', 'TYPEOF'], ["left", '==', '!='], ["left", '&&', '||'], ["right", '-=', '+=', '/=', '*=', '%=', '||=', '&&=', '?='], ["left", '.'], ["right", 'INDENT'], ["left", 'OUTDENT'], ["right", 'WHEN', 'LEADING_WHEN', 'IN', 'OF', 'BY', 'THROW'], ["right", 'FOR', 'WHILE', 'UNTIL', 'LOOP', 'NEW', 'SUPER', 'CLASS'], ["left", 'EXTENDS'], ["right", 'ASSIGN', 'RETURN'], ["right", '->', '=>', 'UNLESS', 'IF', 'ELSE']];
  tokens = [];
  _a = grammar;
  for (name in _a) { if (__hasProp.call(_a, name)) {
    alternatives = _a[name];
    grammar[name] = (function() {
      _b = []; _d = alternatives;
      for (_c = 0, _e = _d.length; _c < _e; _c++) {
        alt = _d[_c];
        _b.push((function() {
          _g = alt[0].split(' ');
          for (_f = 0, _h = _g.length; _f < _h; _f++) {
            token = _g[_f];
            if (!(grammar[token])) {
              tokens.push(token);
            }
          }
          if (name === 'Root') {
            alt[1] = ("return " + (alt[1]));
          }
          return alt;
        })());
      }
      return _b;
    })();
  }}
  exports.parser = new Parser({
    tokens: tokens.join(' '),
    bnf: grammar,
    operators: operators.reverse(),
    startSymbol: 'Root'
  });
})();
