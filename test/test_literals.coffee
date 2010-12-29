a = [((x) -> x), ((x) -> x * x)]

ok a.length is 2


neg = (3 -4)

ok neg is -1


# Decimal number literals.
value = .25 + .75
ok value is 1
value = 0.0 + -.25 - -.75 + 0.0
ok value is 0.5


# Can call methods directly on numbers.
4.valueOf() is 4


func = ->
  return if true

ok func() is undefined


trailingComma = [1, 2, 3,]
ok (trailingComma[0] is 1) and (trailingComma[2] is 3) and (trailingComma.length is 3)

trailingComma = [
  1, 2, 3,
  4, 5, 6
  7, 8, 9,
]
(sum = (sum or 0) + n) for n in trailingComma

trailingComma = {k1: "v1", k2: 4, k3: (-> true),}
ok trailingComma.k3() and (trailingComma.k2 is 4) and (trailingComma.k1 is "v1")


ok {a: (num) -> num is 10 }.a 10


moe = {
  name:  'Moe'
  greet: (salutation) ->
    salutation + " " + @name
  hello: ->
    @['greet'] "Hello"
  10: 'number'
}

ok moe.hello() is "Hello Moe"
ok moe[10] is 'number'

moe.hello = ->
  this['greet'] "Hello"

ok moe.hello() is 'Hello Moe'


obj = {
  is:     -> yes,
  'not':  -> no,
}

ok obj.is()
ok not obj.not()


### Top-level object literal... ###
obj: 1
### ...doesn't break things. ###

# Funky indentation within non-comma-seperated arrays.
result = [['a']
 {b: 'c'}]

ok result[0][0] is 'a'
ok result[1]['b'] is 'c'


# Object literals should be able to include keywords.
obj = {class: 'höt'}
obj.function = 'dog'

ok obj.class + obj.function is 'hötdog'


# But keyword assignment should be smart enough not to stringify variables.
func = ->
  this == 'this'

ok func() is false


# New fancy implicit objects:
config =
  development:
    server: 'localhost'
    timeout: 10

  production:
    server: 'dreamboat'
    timeout: 1000

ok config.development.server  is 'localhost'
ok config.production.server   is 'dreamboat'
ok config.development.timeout is 10
ok config.production.timeout  is 1000

obj =
  a: 1
  b: 2

ok obj.a is 1
ok obj.b is 2

obj =
  a: 1,
  b: 2,

ok obj.a is 1
ok obj.b is 2


# Implicit objects nesting.
obj =
  options:
    value: yes

  fn: ->
    {}
    null

ok obj.options.value is yes
ok obj.fn() is null


# Implicit arguments to function calls:
func = (obj) -> obj.a
func2 = -> arguments

result = func
  a: 10

ok result is 10

result = func
  "a": 20

ok result is 20

third = (a, b, c) -> c
obj =
  one: 'one'
  two: third 'one', 'two', 'three'

ok obj.one is 'one'
ok obj.two is 'three'

a = b = undefined

result = func
    b:1
    a

ok result is undefined

result = func
    a:
        b:2
    b:1
ok result.b is 2

result = func2
    a:1
    b
    c:1

ok result.length is 3
ok result[2].c is 1

# Implicit objects with wacky indentation:
obj =
  'reverse': (obj) ->
    Array.prototype.reverse.call obj
  abc: ->
    @reverse(
      @reverse @reverse ['a', 'b', 'c'].reverse()
    )
  one: [1, 2,
    a: 'b'
  3, 4]
  red:
    orange:
          yellow:
                  green: 'blue'
    indigo: 'violet'
  misdent: [[],
  [],
                  [],
      []]

ok obj.abc().join(' ') is 'a b c'
ok obj.one.length is 5
ok obj.one[4] is 4
ok obj.one[2].a is 'b'
ok (key for key of obj.red).length is 2
ok obj.red.orange.yellow.green is 'blue'
ok obj.red.indigo is 'violet'
ok obj.misdent.toString() is ',,,'

second = (x, y) -> y
obj = then second 'the',
  1: 1
  two:
    three: ->
      four five,
        six: seven
  three: 3

ok obj[1] is 1
ok obj.three is 3


# Implicit objects as part of chained calls.
pluck = (x) -> x.a
eq 100, pluck pluck pluck a: a: a: 100


eq '\\`', `
  // Inline JS
  "\\\`"
`


# Shorthand objects with property references.
obj =
  ### comment one ###
  ### comment two ###
  one: 1
  two: 2
  object: -> {@one, @two}
  list:   -> [@one, @two]


result = obj.object()
eq result.one, 1
eq result.two, 2
eq result.two, obj.list()[1]


#542: Objects leading expression statement should be parenthesized.
{f: -> ok yes }.f() + 1


#764: Boolean/Number should be indexable.
ok 42['toString']
ok on['toString']


# String-keyed objects shouldn't suppress newlines.
one =
  '>!': 3
six: -> 10

ok not one.six

