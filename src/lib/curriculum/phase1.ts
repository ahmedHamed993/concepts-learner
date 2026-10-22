import type { Phase } from "@/lib/types";
import { content, lesson, topic } from "./helpers";

const goTypes = topic({
  id: "go-types",
  phaseId: "phase-1",
  order: 1,
  title: "Variables, Types, and Constants",
  definition:
    "A type describes the set of values a variable can hold and the operations that are valid on those values. A variable is a named storage location with a type; a constant is a compile-time value that cannot change.",
  summary:
    "Build the foundation: typed storage, zero values, inference, constants, and conversions in Go.",
  difficulty: "beginner",
  estimatedMinutes: 75,
  keywords: ["variables", "types", "constants", "zero value", "type inference"],
  aliases: ["var", "const", "zero values", "declaration"],
  prerequisites: [],
  related: ["go-flow", "go-structs-pointers", "bits-integers"],
  objectives: [
    "Declare variables with explicit and inferred types.",
    "Predict zero values for every basic type.",
    "Choose between const and var and explain why.",
    "Use explicit conversions instead of accidental coercion.",
  ],
  lessons: [
    lesson("values", "Values and declarations", "Variables, short declarations, and scope.", 25),
    lesson("zero", "Zero values and constants", "Go's deterministic defaults and untyped constants.", 25),
    lesson("convert", "Conversions and type safety", "Explicit conversions, overflow, and typed arithmetic.", 25),
  ],
  content: content({
    what:
      "Go is statically typed. Every expression has a type known at compile time. A variable binds a name to a typed storage slot, while a constant is evaluated at compile time and has no mutable storage. Declarations may infer a type from an initializer, but the type never changes afterwards.",
    why:
      "Types determine which operations are legal, how many bytes a value occupies, how it is copied, and how it behaves at runtime. Understanding types early prevents a large class of bugs: silent truncation, accidental integer division, unexpected zero values, and aliasing.",
    mentalModel:
      "Think of a variable as a labelled box with a fixed shape. The label is the name, the shape is the type, and assignment copies a value into the box. Constants are not boxes at all; they are values pasted directly into the compiled program where they are used.",
    precise:
      "Basic types include bool, string, the sized integers int8 through int64, uint8 through uint64, uintptr, int, uint, float32, float64, complex64, and complex128. The size of int and uint is implementation-defined: 32 bits on many 32-bit platforms and 64 bits on most 64-bit platforms. Variables declared without an initializer receive the zero value: false, 0, 0.0, \"\", or nil for pointers, slices, maps, channels, functions, and interfaces. Short declarations (`:=`) require at least one new variable on the left and may only be used inside functions. Conversion syntax is T(x), never implicit.",
    connections:
      "The representation of integers leads directly to two's complement in memory. Strings are immutable byte sequences with a header, which connects to slicing and copying. Constants are folded during compilation, which connects to the compiler phase. Escape analysis later decides whether a variable's storage lives on the stack or the heap.",
    misconceptions: [
      "int always being 64 bits — its width is platform-dependent in the language specification.",
      "Believing := reassigns an existing variable in another scope; it declares a new variable in the current scope.",
      "Expecting an implicit conversion from int to int64; Go requires T(x).",
      "Thinking constants are always untyped; they can be given a type explicitly.",
    ],
    trace: [
      { step: "var a int", detail: "Storage is created for a and initialized to 0." },
      { step: "b := 3.5", detail: "b has type float64, inferred from the untyped constant 3.5." },
      { step: "c := int(b)", detail: "The fractional part is discarded; c holds 3. The conversion is explicit." },
      { step: "const answer = 42", detail: "answer is an untyped constant folded into its uses at compile time." },
    ],
    assessment: [
      "What is the zero value of a string, a pointer, and a map?",
      "Why does `var x int8 = 200` fail to compile?",
      "When would you keep a numeric constant untyped?",
      "Is `int` guaranteed to be 64 bits on every machine?",
    ],
  }),
  codeExamples: [
    {
      language: "go",
      caption: "Types, zero values, and explicit conversion",
      code: `package main

import "fmt"

func main() {
    var count int
    var label string
    var ready bool

    ratio := 7 / 2        // integer division: 3
    precise := 7.0 / 2.0  // untyped constants become float64
    narrowed := int8(127)
    // narrowed = narrowed + 1 // compile error: constant 128 overflows int8

    fmt.Println(count, label == "", ready, ratio, precise, narrowed)
}`,
    },
  ],
  exerciseIds: ["ex-generic-stack"],
  promptIds: ["prompt-deep-tutor", "prompt-predict-output"],
});

const goFlow = topic({
  id: "go-flow",
  phaseId: "phase-1",
  order: 2,
  title: "Control Flow and Functions",
  definition:
    "Control flow selects which statements execute and how often. Functions package a reusable computation with typed inputs, outputs, and its own stack frame.",
  summary:
    "Branch, loop, defer, and decompose programs into functions with clear contracts.",
  difficulty: "beginner",
  estimatedMinutes: 80,
  keywords: ["control flow", "functions", "if", "for", "switch", "defer"],
  aliases: ["if", "for loop", "switch", "defer", "function"],
  prerequisites: ["go-types"],
  related: ["decomposition", "stack-heap", "go-errors-packages-testing"],
  objectives: [
    "Write branching logic with if and switch, including type switches.",
    "Use Go's single loop form to express counted and conditional loops.",
    "Explain argument passing and multiple return values.",
    "Predict defer ordering and its interaction with named results.",
  ],
  lessons: [
    lesson("branch", "Branching and loops", "if, switch, for, and labeled break.", 25),
    lesson("functions", "Functions and returns", "Parameters, multiple results, closures, and defer.", 30),
    lesson("control", "Control-flow reasoning", "Reading code as a state machine and finding edge cases.", 25),
  ],
  content: content({
    what:
      "Go has if/else, switch, and for. There is no while or do-while; for expresses all iteration. Functions are first-class values, may return multiple results, and may be closures over captured variables. defer schedules a function call to run when the surrounding function returns.",
    why:
      "Most logic bugs are control-flow bugs: a missing branch, an off-by-one loop bound, a defer that runs later than expected, or an ignored error return. Being precise about control flow is the basis for tracing execution and reasoning about complexity.",
    mentalModel:
      "A function call creates a new frame with its parameters, local variables, and return slots. Control moves to the callee and returns to the instruction after the call. defer pushes calls onto a per-function list that is popped in last-in-first-out order when the function exits.",
    precise:
      "Conditions in if and for must be boolean; there is no implicit truthiness. switch cases do not fall through unless `fallthrough` is used. Deferred calls evaluate their arguments when the defer statement executes, but the call itself runs at return. Deferred calls run in LIFO order and can modify named result parameters. Closures capture variables, not values, so all closures created in one loop iteration can observe the last value of a variable declared outside the loop.",
    connections:
      "Each call maps to a stack frame, which connects to memory layout. Defer and panic unwind the stack, connecting to the Go runtime. Loop bounds determine Big O behavior. Function values and closures are runtime objects; whether they escape depends on escape analysis.",
    misconceptions: [
      "Using fallthrough by default, as in C.",
      "Assuming defer arguments are evaluated at return time rather than at defer time.",
      "Thinking a closure captures a snapshot of a loop variable when it actually captures the variable.",
      "Forgetting that goroutine scheduling may delay a deferred function relative to other code.",
    ],
    trace: [
      { step: "for i := 0; i < 3; i++", detail: "i is initialized to 0; the body runs for 0, 1, and 2." },
      { step: "defer fmt.Println(i)", detail: "Arguments are evaluated immediately, so 0, 1, and 2 are queued." },
      { step: "function returns", detail: "Deferred calls run LIFO: 2, 1, 0." },
    ],
    assessment: [
      "What happens if a defer references a variable declared before it but not passed as an argument?",
      "How do you write a while loop in Go?",
      "Why can closures inside a loop see an unexpected final value?",
      "What does `fallthrough` do, and what does it not do?",
    ],
  }),
  codeExamples: [
    {
      language: "go",
      caption: "LIFO defer and a closure over a loop variable",
      code: `package main

import "fmt"

func sum(values []int) (total int) {
    defer func() { total *= 2 }()
    for _, v := range values {
        total += v
    }
    return total
}

func main() {
    fmt.Println(sum([]int{1, 2, 3})) // 12: named result doubled on return

    for i := 0; i < 3; i++ {
        defer fmt.Println("defer", i)
    }
    fmt.Println("body done")
}`,
    },
  ],
  exerciseIds: [],
  promptIds: ["prompt-deep-tutor", "prompt-predict-output", "prompt-trace-code"],
});

const goCollections = topic({
  id: "go-collections",
  phaseId: "phase-1",
  order: 3,
  title: "Arrays, Slices, and Maps",
  definition:
    "An array is a fixed-length value containing elements of one type. A slice is a small descriptor with a pointer, length, and capacity that refers to an underlying array. A map is a hash table from keys to values.",
  summary:
    "Understand value semantics, slice headers, capacity growth, and map behavior.",
  difficulty: "beginner",
  estimatedMinutes: 90,
  keywords: ["arrays", "slices", "maps", "append", "capacity", "range"],
  aliases: ["slice header", "map lookup", "underlying array", "append"],
  prerequisites: ["go-types"],
  related: ["go-structs-pointers", "stack-heap", "data-structures-complexity"],
  objectives: [
    "Explain why assigning an array copies it but assigning a slice aliases its backing array.",
    "Predict when append mutates existing storage and when it allocates.",
    "Use maps safely, including the comma-ok idiom.",
    "Choose data structures based on access patterns.",
  ],
  lessons: [
    lesson("slices", "Slices and capacity", "Headers, subslicing, append, and aliasing.", 30),
    lesson("maps", "Maps and iteration", "Hashing, lookup, deletion, and iteration order.", 30),
    lesson("choose", "Choosing a collection", "Arrays, slices, maps, and sets in practice.", 30),
  ],
  content: content({
    what:
      "Arrays have a length that is part of their type, for example [3]int. Slices are views with three words: data pointer, length, and capacity. Maps store key-value pairs in a hash table. Both slices and maps are reference-like descriptors; assigning them copies the descriptor, not the underlying data.",
    why:
      "Most Go programs are built from slices and maps. Subtle bugs come from aliasing, append reallocation, modifying a slice while ranging, and assuming map iteration order. These structures are also the concrete starting point for discussing memory and complexity.",
    mentalModel:
      "Picture a slice as a window over a shared array. The window can grow to the right until capacity ends; after that, append must build a new, larger array and copy. A map is a set of locked boxes indexed by a hash; you retrieve by key, never by position.",
    precise:
      "The zero slice is nil, with length and capacity 0, and is usable with append. Slicing s[low:high] keeps the same backing array and capacity from low to cap(s). append appends in place when capacity is sufficient and allocates otherwise; the specification does not guarantee a particular growth factor. Map reads of a missing key return the zero value; use `v, ok := m[k]` to distinguish absent from zero. Iteration order over maps is deliberately randomized. Maps are not safe for concurrent writes.",
    connections:
      "The slice header explains stack versus heap allocation and escape analysis. append copying explains amortized O(1) growth and cache behavior. Hash tables connect to load factor, collisions, and expected versus worst-case complexity. Underlying arrays are contiguous memory, which matters for cache lines.",
    misconceptions: [
      "Assuming two slices never alias after a subslicing operation.",
      "Believing append always returns a new slice; it may mutate the original backing array.",
      "Thinking map iteration is stable or insertion ordered.",
      "Using a map concurrently without synchronization because reads and writes are individually cheap.",
    ],
    trace: [
      { step: "a := []int{1,2,3}", detail: "A backing array of length 3 exists; a has len 3, cap 3." },
      { step: "b := a[:2]", detail: "b shares the array, len 2, cap 3." },
      { step: "b = append(b, 9)", detail: "Capacity remains, so index 2 of a becomes 9." },
      { step: "b = append(b, 4, 5)", detail: "Capacity is exceeded; a new array is allocated and copied, so b no longer aliases a." },
    ],
    assessment: [
      "Why can modifying a subslice change the original slice?",
      "What does append return when capacity is insufficient?",
      "How do you detect whether a key exists in a map?",
      "What is the complexity of a map lookup in the average case and why?",
    ],
  }),
  codeExamples: [
    {
      language: "go",
      caption: "Aliasing, append growth, and comma-ok",
      code: `package main

import "fmt"

func main() {
    base := []int{10, 20, 30}
    alias := base[:2]
    alias = append(alias, 99)
    fmt.Println(base) // [10 20 99]

    counts := map[string]int{"go": 1}
    value, ok := counts["rust"]
    fmt.Println(value, ok) // 0 false
    counts["rust"] = value + 1
    delete(counts, "go")
    fmt.Println(counts) // map[rust:1]
}`,
    },
  ],
  exerciseIds: ["ex-slice-growth", "ex-word-count"],
  promptIds: ["prompt-memory-investigation", "prompt-trace-code"],
});

const goStructsPointers = topic({
  id: "go-structs-pointers",
  phaseId: "phase-1",
  order: 4,
  title: "Structs, Methods, and Pointers",
  definition:
    "A struct groups named fields into a single typed value. A method is a function with a receiver. A pointer stores the address of a value, enabling indirection and in-place mutation.",
  summary:
    "Model data with structs, choose value or pointer receivers deliberately, and reason about copies.",
  difficulty: "beginner",
  estimatedMinutes: 95,
  keywords: ["structs", "methods", "pointers", "receivers", "embedding"],
  aliases: ["value receiver", "pointer receiver", "address-of", "dereference", "embedding"],
  prerequisites: ["go-types", "go-collections"],
  related: ["pointers-addresses", "go-interfaces-generics", "stack-heap"],
  objectives: [
    "Define structs and instantiate them with named or positional literals.",
    "Explain when a copy happens and when an address is shared.",
    "Choose pointer receivers for mutation or large values.",
    "Use embedding for composition rather than inheritance.",
  ],
  lessons: [
    lesson("structs", "Struct values", "Fields, literals, copying, and zero structs.", 30),
    lesson("receivers", "Methods and receivers", "Value versus pointer receivers and method sets.", 30),
    lesson("embedding", "Composition", "Embedding, promotion, and small interfaces.", 35),
  ],
  content: content({
    what:
      "Struct fields have names and types. Assignment and function passing copy the whole struct value. A pointer holds an address and must be dereferenced to read or write the pointed-to value. Methods attach behavior to a named type; the receiver can be a value or a pointer. Embedded fields promote their methods and fields to the outer type.",
    why:
      "The value/pointer distinction determines whether a function mutates the caller's data. Receiver choice affects method sets and interface satisfaction. Struct layout also affects memory size and cache performance, and pointer use influences escape analysis.",
    mentalModel:
      "A struct is a bundle of boxes laid out together. Passing it by value hands over a full photocopy. Passing a pointer hands over the address of the original bundle, so both callers see writes. A method is just a function whose first argument is the receiver.",
    precise:
      "For a type T, the method set of T contains methods with value receivers, while the method set of *T contains both value and pointer receiver methods. This matters for interface satisfaction. The compiler automatically takes the address of an addressable value when calling a pointer-receiver method. Struct field order affects padding and total size. Go has no inheritance; embedding promotes fields and methods, and the outer type can shadow them. Pointers are typed and do not support arithmetic.",
    connections:
      "This is the practical entry point to memory addresses, stack frames, and escape analysis. Value copies interact with CPU caches. Method sets connect to interfaces and dynamic dispatch. Struct layout connects to alignment and padding.",
    misconceptions: [
      "Expecting a method with a value receiver to mutate the original struct.",
      "Thinking embedding creates a subtype with polymorphic substitution.",
      "Believing a pointer receiver method can be called on an unaddressable value.",
      "Assuming struct field order has no memory cost.",
    ],
    trace: [
      { step: "p := Point{1,2}", detail: "A two-int struct is stored; p names the value." },
      { step: "q := p", detail: "q is a full copy; changing q.X does not change p.X." },
      { step: "r := &p", detail: "r holds p's address." },
      { step: "r.X = 5", detail: "The compiler dereferences r and writes to p's storage." },
    ],
    assessment: [
      "When does assigning a struct not copy its data?",
      "Why can a *T method be called through a T variable, but not always the reverse?",
      "How does embedding differ from inheritance?",
      "What happens to a pointer-receiver method call on a map element?",
    ],
  }),
  codeExamples: [
    {
      language: "go",
      caption: "Value copies and pointer mutation",
      code: `package main

import "fmt"

type Counter struct{ n int }

func (c Counter) Value() int  { return c.n }
func (c *Counter) Add(d int)  { c.n += d }

func main() {
    c := Counter{}
    c.Add(3)        // equivalent to (&c).Add(3)
    copyOfC := c
    c.Add(4)
    fmt.Println(c.Value(), copyOfC.Value()) // 7 3

    pointer := &c
    pointer.n = 10
    fmt.Println(c.n) // 10
}`,
    },
  ],
  exerciseIds: [],
  promptIds: ["prompt-memory-investigation", "prompt-deep-tutor"],
});

const goInterfacesGenerics = topic({
  id: "go-interfaces-generics",
  phaseId: "phase-1",
  order: 5,
  title: "Interfaces and Generics",
  definition:
    "An interface specifies behavior as a set of method signatures. A type satisfies an interface implicitly by implementing those methods. Generics parameterize functions and types over type constraints.",
  summary:
    "Design with small interfaces, understand dynamic dispatch, and use type parameters without over-abstracting.",
  difficulty: "intermediate",
  estimatedMinutes: 90,
  keywords: ["interfaces", "generics", "type parameters", "constraints", "polymorphism"],
  aliases: ["interface satisfaction", "dynamic dispatch", "type assertion", "type switch", "type constraint"],
  prerequisites: ["go-structs-pointers"],
  related: ["go-errors-packages-testing", "abstraction", "go-runtime"],
  objectives: [
    "Define and satisfy interfaces implicitly.",
    "Distinguish interface values, dynamic types, and typed nils.",
    "Use type assertions, switches, and the empty interface sparingly.",
    "Write generic functions with constraints and explain instantiation.",
  ],
  lessons: [
    lesson("interfaces", "Interface values", "Dynamic type, method sets, and typed nil traps.", 30),
    lesson("generics", "Type parameters", "Constraints, instantiation, and zero values.", 35),
    lesson("design", "Interface design", "Small interfaces, consumer-side definitions, and trade-offs.", 25),
  ],
  content: content({
    what:
      "An interface value holds a dynamic type and a value. Calling a method dispatches through the dynamic type. A type satisfies an interface automatically if its method set includes the required methods. Generics add type parameters with constraints, allowing reusable code that remains statically checked.",
    why:
      "Interfaces enable decoupling and testing via fakes. They also introduce indirection, potential allocations, and nil traps. Generics reduce duplication while preserving type safety. Choosing between concrete types, interfaces, and generics is a core design skill.",
    mentalModel:
      "An interface is a contract, not a base class. An interface value is a pair: which concrete type am I, and where is the value? Generics are templates: the compiler checks each instantiation against a constraint and generates or shares implementations.",
    precise:
      "A nil interface has neither dynamic type nor value. An interface holding a nil pointer has a non-nil dynamic type, so comparing it to nil yields false. Type assertions `v, ok := i.(T)` are checked at runtime. Generic type parameters are constrained by interfaces; `~int` permits underlying type int. Since Go 1.18, generics use dictionaries or stenciling depending on the compiler implementation; that is not a language guarantee. Method sets and pointer receivers still determine interface satisfaction.",
    connections:
      "Dynamic dispatch involves a runtime type descriptor, connecting to the Go runtime and memory layout. Type assertions and boxing may allocate. Generic instantiations are resolved during compilation, connecting to type checking and monomorphization trade-offs in other languages.",
    misconceptions: [
      "Assuming an interface containing a nil pointer equals nil.",
      "Defining large interfaces instead of small consumer-owned ones.",
      "Thinking generics replace interfaces; they solve different problems.",
      "Using `any` when a concrete type or a small interface would be clearer.",
    ],
    trace: [
      { step: "var s fmt.Stringer", detail: "The interface value is nil: no dynamic type, no value." },
      { step: "var p *Point = nil; s = p", detail: "s is non-nil because its dynamic type is *Point, even though the value is nil." },
      { step: "s.String()", detail: "Dispatch finds *Point's method; it may panic if the method dereferences p." },
    ],
    assessment: [
      "Why is an interface holding a nil pointer not equal to nil?",
      "What is the difference between a type assertion and a type switch?",
      "When should you use a generic function instead of an interface?",
      "Which methods are in the method set of *T versus T?",
    ],
  }),
  codeExamples: [
    {
      language: "go",
      caption: "Small interface, type switch, and a generic constraint",
      code: `package main

import "fmt"

type Shape interface{ Area() float64 }
type Square struct{ Side float64 }

func (s Square) Area() float64 { return s.Side * s.Side }

func Max[T ~int | ~float64](values []T) T {
    var best T
    for i, v := range values {
        if i == 0 || v > best {
            best = v
        }
    }
    return best
}

func describe(v any) string {
    switch x := v.(type) {
    case Shape:
        return fmt.Sprintf("shape with area %.1f", x.Area())
    case string:
        return "string: " + x
    default:
        return fmt.Sprintf("other %T", x)
    }
}

func main() {
    fmt.Println(describe(Square{Side: 3}))
    fmt.Println(Max([]float64{1.5, 4.2, 2.0}))
}`,
    },
  ],
  exerciseIds: ["ex-generic-stack"],
  promptIds: ["prompt-deep-tutor", "prompt-code-review"],
});

const goErrorsPackagesTesting = topic({
  id: "go-errors-packages-testing",
  phaseId: "phase-1",
  order: 6,
  title: "Errors, Packages, Modules, and Testing",
  definition:
    "Errors are ordinary values returned to signal failure. Packages divide code into named units, modules define versioned dependency boundaries, and tests are functions executed by the go test tool.",
  summary:
    "Return and wrap errors deliberately, organize packages around behavior, and build a real testing habit.",
  difficulty: "intermediate",
  estimatedMinutes: 100,
  keywords: ["errors", "packages", "modules", "testing", "wrapping", "go test"],
  aliases: ["error wrapping", "errors.Is", "errors.As", "package", "module", "table-driven tests"],
  prerequisites: ["go-flow", "go-interfaces-generics"],
  related: ["invariants-testing-clean-code", "go-runtime", "goroutines"],
  objectives: [
    "Return errors rather than panicking for expected failures.",
    "Wrap errors with context and inspect them using errors.Is and errors.As.",
    "Create packages with clear responsibility and avoid import cycles.",
    "Write table-driven tests with t.Run and test error paths.",
  ],
  lessons: [
    lesson("errors", "Error handling", "Sentinel errors, wrapping, custom types, and panic boundaries.", 35),
    lesson("packages", "Packages and modules", "Organization, exports, dependencies, and versions.", 30),
    lesson("testing", "Testing Go code", "Tests, table-driven cases, fuzzing, and benchmarks.", 35),
  ],
  content: content({
    what:
      "An error is any value implementing `Error() string`. By convention, functions return errors as the final return value and callers check them. `fmt.Errorf` with %w wraps an error, preserving an unwrap chain. A module is a collection of packages with a go.mod file; packages group related declarations and control visibility through capitalization. Tests live in _test.go files and run with go test.",
    why:
      "Ignored errors are ignored failures. Good wrapping preserves both context and the ability to inspect causes. Package boundaries shape dependency direction and refactoring cost. Tests provide evidence for mastery and catch regressions in exercises and projects.",
    mentalModel:
      "Errors are messages in return values, not exceptions flying up the stack. Wrapping adds a note to the envelope while keeping the original inside. A module is a map from import path to source version; a package is a namespace with an explicit public surface.",
    precise:
      "`errors.Is` compares through unwrap chains, and `errors.As` finds a matching concrete type. Custom error types should implement Error with a value or pointer receiver consistently. Exported identifiers begin with an uppercase letter. Go modules use semantic import versioning; the toolchain records dependencies in go.mod and hashes in go.sum. Tests can access unexported identifiers when in the same package, and use `_test` packages for external tests. Test functions are `func TestXxx(t *testing.T)`. Benchmarks use `func BenchmarkXxx(b *testing.B)`.",
    connections:
      "Error chains are linked data structures in memory. Interface satisfaction powers error wrapping. Package compilation units connect to the compiler and linker. Benchmarks connect to performance work and profiling, where measured evidence replaces intuition.",
    misconceptions: [
      "Panicking for routine failures such as invalid user input.",
      "Losing the original error with fmt.Errorf(\"%v\", err) instead of %w.",
      "Thinking tests prove absence of bugs; they provide evidence for tested behavior.",
      "Creating a package per file instead of per responsibility.",
    ],
    trace: [
      { step: "Open returns *PathError", detail: "The concrete error value carries operation, path, and cause." },
      { step: "fmt.Errorf(\"load config: %w\", err)", detail: "A wrapError is created containing the original error." },
      { step: "errors.Is(returned, fs.ErrNotExist)", detail: "The chain is walked until fs.ErrNotExist is matched." },
    ],
    assessment: [
      "What does %w preserve that %v does not?",
      "When should errors.As be used instead of errors.Is?",
      "Why do tests belong next to the package they test?",
      "What does an import cycle indicate about package design?",
    ],
  }),
  codeExamples: [
    {
      language: "go",
      caption: "Wrapping, inspecting, and table-driven testing",
      code: `package config

import (
    "errors"
    "fmt"
)

var ErrMissingName = errors.New("missing name")

type Config struct{ Name string }

func Parse(raw map[string]string) (Config, error) {
    name, ok := raw["name"]
    if !ok {
        return Config{}, fmt.Errorf("parse config: %w", ErrMissingName)
    }
    return Config{Name: name}, nil
}

// config_test.go
// func TestParse(t *testing.T) {
//     tests := []struct{ name string; input map[string]string; wantErr bool }{
//         {"valid", map[string]string{"name": "dev"}, false},
//         {"missing", map[string]string{}, true},
//     }
//     for _, tt := range tests {
//         t.Run(tt.name, func(t *testing.T) {
//             _, err := Parse(tt.input)
//             if (err != nil) != tt.wantErr {
//                 t.Fatalf("err = %v, wantErr = %v", err, tt.wantErr)
//             }
//         })
//     }
// }`,
    },
  ],
  exerciseIds: ["ex-error-wrapping"],
  promptIds: ["prompt-debugging", "prompt-code-review", "prompt-quiz"],
});

export const phase1: Phase = {
  id: "phase-1",
  number: 1,
  title: "Go Fundamentals",
  tagline: "The language as a tool",
  description:
    "Learn Go from values and types through interfaces, generics, modules, and tests. The goal is not syntax recall but the ability to explain what a program does and why.",
  objectives: [
    "Read and write idiomatic Go with confidence.",
    "Predict copying, aliasing, and dispatch behavior.",
    "Build small tested packages and CLI programs.",
    "Explain each language feature in terms of memory and execution.",
  ],
  prerequisites: ["Basic programming experience or willingness to practice daily"],
  completionCriteria: [
    "All phase topics are at least practiced.",
    "At least four topics are understood or mastered with evidence.",
    "One CLI project is complete with tests.",
  ],
  estimatedWeeks: 5,
  keywords: [
    "variables", "types", "constants", "control flow", "functions", "arrays",
    "slices", "maps", "structs", "methods", "pointers", "interfaces", "generics",
    "errors", "packages", "modules", "testing",
  ],
  projectIdea: "Build a tested CLI calculator and then a file-backed task manager.",
  topics: [
    goTypes,
    goFlow,
    goCollections,
    goStructsPointers,
    goInterfacesGenerics,
    goErrorsPackagesTesting,
  ],
};
