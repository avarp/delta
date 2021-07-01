### How computers think

Human brain deals with information in very different manner than computers do. On the one hand, our short-term memory is very restricted: most of people can remember 5 - 9 items at he same time. On the other hand our brain is a brilliant example of neural network. That is why we are very good in pattern recognition problems, especially classification. We always classify. We clasify everything: people, animals, chemistry elements, stars and even abstract mathematical entities!

On the contrary, computers are extremely ineffective in these areas. The way of "thinking" for computers is to treat information as a large homogenous stream of data. On the very low level every single piece of data is just a sequence of binary digits. One data can be transformed to another without any restrictions, except technical, such as memory capacity and computation speed.

This fact makes computers so universal instrument for information processing. The same fact makes computer's low-level machine language so difficult to use for expressing the business logic of applications. Computers think very different than we are.

How this affect on the programming languages? We are using computers for solving problems of real world. That is why good programming language should allow to express our way of thinking. In particular we need to "explain" to computer how we, humans, classify information we are dealing with.

In real life we are rarely using binary data. We are used to deal with texts, numbers, dates and so on. We are grouping primitive pieces of data into more complex structures like lists and tables. We classify information. This is how we are thinking and it is normal for us. A good programming language should provide for a developer reliable and eloquent type system for classifying data we processing.

### Types

We know that for computer all data is just binary blobs. A computer can perform on this blob any operation. For example, we can make computer invert every third bit of data. But for real use cases not every operation will make sence. We need to restrict which operations are meaningful on exact type of data and which are senseless.

For example, the aforementioned operation of inversion of every third bit is senseless in most cases. If you will try to apply this operation on ASCII text it will just destroy your data.

Type is an additional information "glued" like a label to actual data. Type defines what the data is and which ways to process it are legal.

There are several primitive types which we will use as is:

```
type Any 			// all possible values
type Void			// there is no value at all
type Int			// integer numbers
type Float    // floating-point numbers
type Char     // characters UTF-16
```

This should be enough to build every possible data. But we need to provide a way to combine types.



### Operation on types

**Union**.

```
type C = A | B // contains all values from A anb B
```

**Intersection**.

```
type C = A & B // contains values from A which also exist in B
```

**Difference**.

```
type C = A - B // contains values from A except those which are in B
```

**Complement**.

```
type C = ^A // contains all values except those which are in A
```



### Combining types

**Tuple**

```
type C = (A B)
```

**List**

```
type B = [A]
```

**Record**

```
type C = {key1:A key2:B}
```

**Variants**

```
type C = key1: A | key2: B
```

**Function**

```
type Function = Parameter => Result
```



### Higher order types

```
type C(A x B y ...) = ... // C has type-parameter 'x' all values of which belong to A
```

You can construct this type:

```
type SomeC = C TypeA TypeB
```



### Subtypes

Types can be divided to more concrete subtype using functions.

```
type PositiveInt = Int which isPositive // in this case "isPositive" is a name of function Int => Bool
```

```
type Equatable = Any with
{
	func == (a b): Bool
	
	func != (a b): Bool
	{
		return !areEqual(a b c)
	}
}
```





#### Built-in types

```
// Basic types
type Any
type Void
type Int
type Float
type Char

// Operations with types:

Addition:
	Anonymous (unions)
	Named (variants)
	
Multiplication:
	Anonymous (tuples)
	Named (records)
	
Subtraction:
	something like "Any - Char": anything except characters
	
Division:
	



```

#### Lists

```
type String = [Char]
```

#### Cardinality-multiplicating types
```
type Tuple = (Type1, Type2, ...)
type Record = [key: Type1, key: Type2, key: Type3]
```

#### Cardinality-adding types
```
type Union = {Type1 | Type2}
type Variant = {Literal1: Type1 | Literal2: Type2}
```

#### Generics
```
type Maybe{a} = {Just: a | Nothing: Void}
type Foo{Bar a} = {Baz: a | Ups}
```

#### Functions
```
type Function = ParamType1 > ParamType2 > ParamType3 > ResultType
```

#### Procedures
```
type Procedure = ParamType1 > ParamType2 > ParamType3 ?> ResultType
type Rand = Void ?> Float
type Print = String ?> Void
```

#### Function-based types
```
type Equatable = Any with
{
	func (Equatable a == Equatable b): Bool
	
	func (Equatable a != Equatable b): Bool
	{
		return not(a == b)
	}
}
```

#### Function definition
```
x = x => x^2 //arrow

// classic
func x(String a, Int b): String
{
	...
}

// operator
func (String a =>= Int b): Float
{
  ...
}
```

#### Procedure definition
```
proc unixTime(): Int
{
	...
}
```

#### Partial application of functions
```
a = b(c, ?, ?)
equalToTwo = ? == 2
```

#### Typed constants
```
Int x = 5
Float y = 3.141
Char z = 'z'
String a = ['h', 'e', 'l', 'l', 'o']
String b = "hello"
Coord c = (2, 3)
Record d = [a: 'b', "c": 'd']
Union e = 4
Union f = "String"
MaybeInt g = Nothing
MaybeInt h = {Just: 5}
```

#### Other
```
// Typed variable (in local function's scope)
var Int i = 0

// Arrow function
Int > Int > Int add = (a, b) => a + b

// Function as a value
Num > Num > MaybeFloat div = (a, b) {
	if (b == 0) return Nothing
	else return {Just: a / b}
}

// Procedure as value
String >> Void print = (a) {
	native {
		console.log(a)
	}
}

// Function calling
y = f(x)

// Procedure calling
result = call print(a) or value
```

#### Imperative data processing
```
// list processing
for (index, value) in list {
	// do something
}

// tuple processing
for (index, value) in tuple
{
	// do something
}

// record processing
for (key, value) in record
{
	// do something
}

// union processing
if value is String {
	// do something
}
elseif value is Char {
	// do something else
}

// variants processing
if value is {Just: x} {
	// do something with x
} else {
	// do something else
}

// Pattern matching
if value is [x1, x2, ...otherElements] {
	
}

// Decomposition
use point1 as (x1, y1, z1)
use point2 as (x2, y2, z2)

return x1*x2 + y1*y2 + z1*z2

// Scoped decomposition
use point1 as (x1, y1, z1) point2 as (x2, y2, z2)
{
	return x1*x2 + y1*y2 + z1*z2
}
```

#### Export


```
export func x(a, b) {

}

export Int meaningOfLife = 42
```

#### Import

```
import * as X, a as B, b as C from "./path/to/BlaBlaBla"


import * as module from "./path/to/Module"

module.x()
```

