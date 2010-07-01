a: [((x) -> x), ((x) -> x * x)]

ok a.length is 2


regex: /match/i
words: "I think there is a match in here."

ok !!words.match(regex)


neg: (3 -4)

ok neg is -1


# Decimal number literals.
value: .25 + .75
ok value is 1
value: 0.0 + -.25 - -.75 + 0.0
ok value is 0.5

# Decimals don't interfere with ranges.
ok [0..10].join(' ') is  '0 1 2 3 4 5 6 7 8 9 10'
ok [0...10].join(' ') is '0 1 2 3 4 5 6 7 8 9'


# Can call methods directly on numbers.
4.toFixed(10) is '4.0000000000'


func: ->
  return if true

ok func() is null


str: "\\"
reg: /\\/

ok reg(str) and str is '\\'

trailingComma: [1, 2, 3,]
ok (trailingComma[0] is 1) and (trailingComma[2] is 3) and (trailingComma.length is 3)

trailingComma: [
  1, 2, 3,
  4, 5, 6
  7, 8, 9,
]
(sum: (sum or 0) + n) for n in trailingComma

trailingComma: {k1: "v1", k2: 4, k3: (-> true),}
ok trailingComma.k3() and (trailingComma.k2 is 4) and (trailingComma.k1 is "v1")

multiline: {a: 15,
  b: 26}

ok multiline.b is 26


money$: 'dollars'

ok money$ is 'dollars'


multiline: "one
            two
            three"

ok multiline is 'one two three'


ok {a: (num) -> num is 10 }.a 10


moe: {
  name:  'Moe'
  greet: (salutation) ->
    salutation + " " + @name
  hello: ->
    @['greet'] "Hello"
  10: 'number'
}

ok moe.hello() is "Hello Moe"
ok moe[10] is 'number'

moe.hello: ->
  this['greet'] "Hello"

ok moe.hello() is 'Hello Moe'


obj: {
  is:     -> yes,
  'not':  -> no,
}

ok obj.is()
ok not obj.not()


# Funky indentation within non-comma-seperated arrays.
result: [['a']
 {b: 'c'}]

ok result[0][0] is 'a'
ok result[1]['b'] is 'c'


# Object literals should be able to include keywords.
obj: {class: 'höt'}
obj.function: 'dog'

ok obj.class + obj.function is 'hötdog'
