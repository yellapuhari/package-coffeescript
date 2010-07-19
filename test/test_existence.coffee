ok(if mySpecialVariable? then false else true)

mySpecialVariable: false

ok(if mySpecialVariable? then true else false)


# Existential assignment.
a: 5
a: null
a ?= 10
b ?= 10

ok a is 10 and b is 10


# The existential operator.
z: null
x: z ? "EX"

ok z is null and x is "EX"


# Only evaluate once.
counter: 0
getNextNode: ->
  throw "up" if counter
  counter++

ok(if getNextNode()? then true else false)


# Existence chains, soaking up undefined properties:
obj: {
  prop: "hello"
}

ok obj?.prop is "hello"

ok obj?['prop'] is "hello"

ok obj.prop?.length is 5

ok obj?['prop']?['length'] is 5

ok obj?.prop?.non?.existent?.property is undefined

ok obj?['non']?['existent'].property is undefined


# Soaks and caches method calls as well.
arr: ["--", "----"]

ok arr.pop()?.length is 4
ok arr.pop()?.length is 2
ok arr.pop()?.length is undefined
ok arr[0]?.length is undefined
ok arr.pop()?.length?.non?.existent()?.property is undefined


# Soaks method calls safely.
value: undefined
result: value?.toString().toLowerCase()

ok result is undefined

value: 10
result: value?.toString().toLowerCase()

ok result is '10'


# Safely existence test on soaks.
result: not value?.property?
ok result


# Safely calls values off of non-existent variables.
result: nothing?.value
ok result is undefined


# Assign to the result of an exsitential operation with a minus.
x: null ? - 1
ok x is - 1
