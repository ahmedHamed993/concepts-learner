import type { Phase } from "@/lib/types";
import { content, lesson, topic } from "./helpers";

const bitsIntegers = topic({
  id: "bits-integers",
  phaseId: "phase-3",
  order: 1,
  title: "Bits, Bytes, and Two's Complement",
  definition:
    "A bit is a binary digit. Eight bits form a byte. Signed integers are commonly represented in two's complement, where the most significant bit carries a negative weight.",
  summary:
    "Read hexadecimal, reason about signed ranges and overflow, and connect bit patterns to numeric values.",
  difficulty: "beginner",
  estimatedMinutes: 80,
  keywords: ["binary", "hexadecimal", "bits", "bytes", "signed integers", "two's complement"],
  aliases: ["two's complement", "hex", "overflow", "bit pattern", "unsigned"],
  prerequisites: ["go-types"],
  related: ["floating-point", "endianness", "logic-circuits"],
  objectives: [
    "Convert between binary, hexadecimal, and decimal.",
    "Compute the range of signed and unsigned integers.",
    "Explain two's complement negation and overflow.",
    "Use bitmasks and shifts safely.",
  ],
  lessons: [
    lesson("number-bases", "Number bases", "Binary, hexadecimal, and conversion.", 25),
    lesson("twos", "Two's complement", "Signed ranges, negation, wraparound, and traps.", 30),
    lesson("bitops", "Bit operations", "AND, OR, XOR, shifts, and masks.", 25),
  ],
  content: content({
    what:
      "Numbers are stored as fixed-width bit patterns. An n-bit unsigned integer ranges from 0 to 2^n-1. An n-bit two's complement signed integer ranges from -2^(n-1) to 2^(n-1)-1. Bitwise operators act on patterns; arithmetic interprets them according to type.",
    why:
      "Overflow, truncation, and sign mistakes are common in systems code and protocol handling. Hex is the readable notation for bytes. Understanding bit patterns is required for flags, masks, serialization, and assembly.",
    mentalModel:
      "Think of a fixed row of switches. Unsigned interpretation reads the switches as a positive binary number. Two's complement interpretation gives the highest switch a negative weight, like -128 for an 8-bit byte, and adds the rest.",
    precise:
      "For width n, two's complement negation is `^x + 1` in n bits. In Go, signed integer overflow at runtime wraps in two's complement for fixed-size types; the language specification defines the result, but relying on wraparound is usually a bug. Unsigned arithmetic is defined modulo 2^n. Shifts by at least the width are legal in Go and produce zero for unsigned or sign extension for signed values, unlike C where behavior is undefined. Constants are arbitrary precision in the language, so overflow can be a compile-time error when a constant does not fit.",
    connections:
      "Byte order determines how multi-byte integers appear in memory and on the wire. Logic gates implement adders and bitwise operations. Alignment explains why padding exists. Floating point uses a different bit layout.",
    misconceptions: [
      "Assuming two's complement is mandated by every language; the representation matters in C and in some hardware details.",
      "Thinking signed overflow is always harmless.",
      "Confusing logical and arithmetic right shifts.",
      "Forgetting that hex digits map exactly to four bits.",
    ],
    trace: [
      { step: "int8(-1)", detail: "All eight bits are 1: 11111111." },
      { step: "^int8(-1) + 1", detail: "In 8 bits this is 00000001, so negation of -1 is 1." },
      { step: "int8(127) + 1", detail: "Wraps to -128 in the runtime representation." },
    ],
    assessment: [
      "What is the range of int16?",
      "How do you negate a two's complement integer using bitwise operations?",
      "Why is 0xFF not always 255?",
      "What is the difference between a logical and arithmetic right shift?",
    ],
  }),
  codeExamples: [
    {
      language: "go",
      caption: "Hex, masks, and a two's complement negation",
      code: `package main

import "fmt"

func negate8(x int8) int8 { return ^x + 1 }

func main() {
    var flags uint8 = 0b1010_0101
    fmt.Printf("%02x %08b\\n", flags, flags) // a5 10100101

    flags &^= 0b0000_0100                // clear bit 2
    fmt.Printf("bit2=%d flags=%08b\\n", (flags>>2)&1, flags)

    fmt.Println(negate8(5))  // -5
    fmt.Println(int8(127) + 1) // -128
}`,
    },
  ],
  exerciseIds: ["ex-two-complement"],
  promptIds: ["prompt-deep-tutor", "prompt-architecture", "prompt-predict-output"],
});

const floatingPoint = topic({
  id: "floating-point",
  phaseId: "phase-3",
  order: 2,
  title: "Floating Point",
  definition:
    "Floating-point numbers approximate real numbers using a sign, exponent, and fraction. IEEE 754 defines the common binary formats used by Go's float32 and float64.",
  summary:
    "Understand rounding, precision loss, NaN, and why some decimal values cannot be exact.",
  difficulty: "intermediate",
  estimatedMinutes: 75,
  keywords: ["floating point", "IEEE 754", "precision", "rounding", "NaN", "float64"],
  aliases: ["IEEE-754", "float", "rounding error", "0.1 + 0.2"],
  prerequisites: ["bits-integers"],
  related: ["endianness", "alignment", "go-types"],
  objectives: [
    "Describe the sign, exponent, and fraction fields.",
    "Predict when decimal fractions are inexact.",
    "Use epsilon comparisons and exact decimal types appropriately.",
    "Explain NaN, infinity, and signed zero.",
  ],
  lessons: [
    lesson("format", "The format", "Sign, exponent, fraction, and normalization.", 25),
    lesson("rounding", "Rounding and error", "Representation error and accumulation.", 25),
    lesson("compare", "Comparing floats", "Epsilon, NaN, and avoiding equality traps.", 25),
  ],
  content: content({
    what:
      "A binary floating-point value is sign × significand × 2^exponent. float64 has 1 sign bit, 11 exponent bits, and 52 fraction bits; float32 has 1, 8, and 23. Values are rounded to the nearest representable value according to the rounding mode. Special values include positive and negative infinity and NaN.",
    why:
      "Money, measurements, scientific computation, and any decimal input can expose rounding behavior. Equality comparisons can fail unexpectedly. NaN breaks the usual total order. Systems programmers also need to know why a float's bytes look different from an integer's.",
    mentalModel:
      "A float is scientific notation with a fixed number of binary significant digits and a sliding exponent. The number line has dense regions and huge gaps; rounding snaps each computation to the nearest available point.",
    precise:
      "Go's float32 and float64 follow IEEE 754. The specification requires IEEE 754 behavior for arithmetic and conversions where supported. 0.1 and 0.2 are not exactly representable in binary, so 0.1+0.2 is not exactly 0.3. NaN is unordered: every comparison with NaN is false, including NaN == NaN. Use math.IsNaN. For approximate comparison, choose an absolute or relative tolerance appropriate to the domain. For exact decimal values such as currency, use integer minor units or a decimal library.",
    connections:
      "The bit layout connects to endianness when serialized. CPU floating-point units implement the operations. Compiler optimization cannot assume real-number associativity because floating-point addition is not associative. Alignment and vectorization affect performance.",
    misconceptions: [
      "Thinking printing more digits makes a float exact.",
      "Comparing computed floats with ==.",
      "Assuming (0.1+0.2) equals 0.3 in all languages.",
      "Believing NaN equals itself.",
    ],
    trace: [
      { step: "0.1 in float64", detail: "Stored as the nearest binary fraction, approximately 0.10000000000000000555." },
      { step: "0.2 in float64", detail: "Another rounded value." },
      { step: "0.1 + 0.2", detail: "The exact real sum is rounded to a float64 near 0.30000000000000004." },
      { step: "x == 0.3", detail: "The two rounded values are not bit-identical, so the comparison is false." },
    ],
    assessment: [
      "Why is 0.1 not exactly representable in binary?",
      "What does IEEE 754 say about NaN comparisons?",
      "When is comparing floats with a tolerance appropriate?",
      "Why can reordering additions change a floating-point result?",
    ],
  }),
  codeExamples: [
    {
      language: "go",
      caption: "Rounding is visible and NaN is unordered",
      code: `package main

import (
    "fmt"
    "math"
)

func almostEqual(a, b, tolerance float64) bool {
    return math.Abs(a-b) <= tolerance
}

func main() {
    fmt.Printf("%.20f\\n", 0.1+0.2)
    fmt.Println(0.1+0.2 == 0.3)               // false
    fmt.Println(almostEqual(0.1+0.2, 0.3, 1e-9)) // true

    nan := math.NaN()
    fmt.Println(nan == nan, math.IsNaN(nan)) // false true
}`,
    },
  ],
  exerciseIds: ["ex-float-format"],
  promptIds: ["prompt-deep-tutor", "prompt-architecture", "prompt-predict-output"],
});

const pointersAddresses = topic({
  id: "pointers-addresses",
  phaseId: "phase-3",
  order: 3,
  title: "Pointers and Memory Addresses",
  definition:
    "A pointer is a value that holds a memory address. Dereferencing reads or writes the value at that address. In Go, pointers are typed, garbage-collected, and cannot be used for arbitrary address arithmetic.",
  summary:
    "Build a precise model of addresses, indirection, nil, and why pointer values are not stable identities.",
  difficulty: "intermediate",
  estimatedMinutes: 85,
  keywords: ["pointers", "memory addresses", "dereference", "nil", "indirection"],
  aliases: ["address-of", "double pointer", "pointer value", "&", "*"],
  prerequisites: ["go-structs-pointers", "bits-integers"],
  related: ["stack-heap", "escape-analysis-gc", "syscalls-io"],
  objectives: [
    "Read and write pointer types and operations.",
    "Explain why addresses can change and should not be compared as identity.",
    "Avoid nil dereferences and pointer-to-loop-variable mistakes.",
    "Connect pointers to slices, maps, and interfaces.",
  ],
  lessons: [
    lesson("address", "Addresses and indirection", "&, *, nil, and pointer types.", 25),
    lesson("aliasing", "Aliasing and mutation", "Shared storage, slices, and structs.", 30),
    lesson("pitfalls", "Pointer pitfalls", "Nil, loop variables, and unsafe boundaries.", 30),
  ],
  content: content({
    what:
      "The expression &x yields a pointer to x. For a pointer p, *p reads or writes the pointed-to value. A pointer can be nil, meaning it points to nothing. Slices, maps, channels, functions, and interfaces also carry references to underlying data or metadata.",
    why:
      "Pointers explain mutation, aliasing, memory layout, and interface representation. They are also where many crashes and concurrency bugs originate. Systems work requires understanding what an address means and what it does not mean.",
    mentalModel:
      "A pointer is a slip of paper with a location written on it. Copying the slip does not copy the house. Following the address is dereferencing. A nil pointer is a blank slip: attempting to follow it is an error.",
    precise:
      "Go pointers are strongly typed and cannot be offset with arithmetic, except through the unsafe package. The Go runtime may move goroutine stacks, and the garbage collector may move heap objects; therefore an address is not a stable identity across time. Taking the address of a variable can cause it to escape to the heap. Comparing pointers compares addresses at that moment. `new(T)` returns a pointer to a zero T. Composite literals can be addressed with `&T{...}`. Pointer receivers affect method sets.",
    connections:
      "Addresses map to virtual memory and page tables. Heap placement connects to escape analysis and garbage collection. Slice headers contain a data pointer. Interface values may contain pointers. At the hardware level, load and store instructions operate on memory operands.",
    misconceptions: [
      "Treating a printed pointer address as a permanent object ID.",
      "Assuming taking the address of a local always allocates on the heap; escape analysis decides.",
      "Thinking a pointer to a loop variable is fresh each iteration in older Go versions.",
      "Using unsafe pointer arithmetic without understanding the unsafe.Pointer rules.",
    ],
    trace: [
      { step: "x := 10", detail: "Storage for x holds 10." },
      { step: "p := &x", detail: "p holds the address of x; x may now be heap-allocated if it escapes." },
      { step: "q := p", detail: "q copies the address, not the integer." },
      { step: "*q = 20", detail: "The store writes through the address; x is now 20." },
    ],
    assessment: [
      "What is the difference between copying a pointer and dereferencing it?",
      "Why is a pointer address not a reliable object identity?",
      "What does escape analysis have to do with taking an address?",
      "How can a nil pointer hide inside a non-nil interface?",
    ],
  }),
  codeExamples: [
    {
      language: "go",
      caption: "Addresses, aliasing, and a heap probe",
      code: `package main

import "fmt"

type Box struct{ n int }

func main() {
    x := 10
    p := &x
    q := p
    *q = 20
    fmt.Println(x, *p) // 20 20

    b := &Box{n: 1}
    fmt.Printf("pointer=%p\\n", b) // format only; do not treat as stable ID

    var missing *Box
    if missing != nil {
        fmt.Println(missing.n) // not reached
    }
}`,
    },
  ],
  exerciseIds: [],
  promptIds: ["prompt-memory-investigation", "prompt-deep-tutor"],
});

const stackHeap = topic({
  id: "stack-heap",
  phaseId: "phase-3",
  order: 4,
  title: "Stack, Heap, and Stack Frames",
  definition:
    "A stack frame is the per-call storage for parameters, locals, and return information. The stack is a region of memory managed by push/pop-like allocation; the heap is managed dynamically and reclaimed by the garbage collector.",
  summary:
    "Visualize frames, returns, and allocation decisions, and separate language guarantees from implementation details.",
  difficulty: "intermediate",
  estimatedMinutes: 90,
  keywords: ["stack", "heap", "stack frame", "call stack", "allocation"],
  aliases: ["frame", "stack growth", "heap allocation", "goroutine stack"],
  prerequisites: ["pointers-addresses", "go-flow"],
  related: ["escape-analysis-gc", "virtual-memory", "cache-memory"],
  objectives: [
    "Describe what a stack frame contains during a call.",
    "Explain stack growth and why unbounded recursion is dangerous.",
    "Distinguish stack and heap allocation at the language level.",
    "Use compiler escape analysis output to check expectations.",
  ],
  lessons: [
    lesson("frames", "Frames and calls", "Arguments, locals, returns, and unwinding.", 30),
    lesson("regions", "Stack versus heap", "Lifetime, ownership, and allocation.", 30),
    lesson("observe", "Observing allocation", "Compiler output, benchmarks, and pprof.", 30),
  ],
  content: content({
    what:
      "Each function call typically has a frame containing incoming arguments, local variables, temporaries, and return slots. The stack grows and shrinks with calls. The heap holds values whose lifetime is not confined to a single call or whose size is dynamic. Go's garbage collector reclaims unreachable heap objects.",
    why:
      "Allocation location affects performance, cache locality, and garbage-collector pressure. It also explains addresses, pointer safety, and why some values survive after a function returns. Distinguishing guarantees from implementation choices prevents incorrect assumptions.",
    mentalModel:
      "The stack is a stack of work trays. A call places a new tray on top with its tools; returning removes it. The heap is a shared warehouse where objects can outlive the call that created them, with a cleanup crew tracing what is still reachable.",
    precise:
      "The Go language does not specify whether a particular value lives on the stack or the heap. It guarantees memory safety and garbage collection for reachable heap objects. The compiler's escape analysis decides where to allocate based on whether a value can outlive its frame or is referenced by escaping data. Goroutine stacks start small and grow by copying. A stack overflow can occur with deep recursion or very large frames. You can inspect decisions with `go build -gcflags=\"-m\"`. These details are implementation-dependent and can change between compiler versions.",
    connections:
      "Stack frames connect directly to recursion and call traces. Virtual memory provides the pages backing both stacks and heaps. Escape analysis connects compiler decisions to runtime behavior. Cache hierarchy affects the cost of heap access patterns. The garbage collector finds reachable objects starting from roots such as stacks and globals.",
    misconceptions: [
      "Believing the Go specification assigns every local to the stack.",
      "Thinking heap allocation is always slower; allocation cost and locality vary.",
      "Assuming stack frames have a fixed size or location.",
      "Confusing logical lifetime with physical stack/heap placement.",
    ],
    trace: [
      { step: "main calls f(3)", detail: "A frame for f is created with argument 3 and return slot." },
      { step: "f takes &local", detail: "If the pointer escapes, the compiler may place local on the heap." },
      { step: "f returns", detail: "Its frame is popped. Any heap object stays until unreachable." },
      { step: "goroutine stack grows", detail: "The runtime copies the stack to a larger region; pointers are adjusted." },
    ],
    assessment: [
      "What decisions does escape analysis make?",
      "Why is a stack address not permanent?",
      "Does the Go spec require local variables to be on the stack?",
      "How can a heap allocation increase GC pressure?",
    ],
  }),
  codeExamples: [
    {
      language: "go",
      caption: "A pointer that escapes its frame",
      code: `package main

import "fmt"

func makeCounter() *int {
    n := 0 // address escapes because it is returned
    return &n
}

func add(a, b int) int {
    sum := a + b // typically does not escape
    return sum
}

func main() {
    c := makeCounter()
    *c++
    fmt.Println(*c, add(2, 3))

    // Inspect decisions:
    // go build -gcflags="-m" .
}`,
    },
  ],
  exerciseIds: ["ex-stack-growth"],
  promptIds: ["prompt-memory-investigation", "prompt-compiler-assembly"],
});

const escapeAnalysisGc = topic({
  id: "escape-analysis-gc",
  phaseId: "phase-3",
  order: 5,
  title: "Escape Analysis and Garbage Collection",
  definition:
    "Escape analysis is a compiler analysis that determines whether a value can be allocated on the stack or must escape to the heap. Garbage collection automatically reclaims heap objects that are no longer reachable.",
  summary:
    "Understand allocation decisions, reachability, GC pauses, and how to measure instead of guessing.",
  difficulty: "advanced",
  estimatedMinutes: 95,
  keywords: ["escape analysis", "garbage collection", "allocation", "reachability", "GC"],
  aliases: ["escape", "GC", "heap allocation", "write barrier", "go build -gcflags=-m"],
  prerequisites: ["stack-heap", "pointers-addresses"],
  related: ["go-runtime", "profiling", "pointers-addresses"],
  objectives: [
    "Explain why a value escapes.",
    "Read basic escape-analysis diagnostics.",
    "Describe reachability-based garbage collection.",
    "Reduce allocations using evidence from benchmarks and profiles.",
  ],
  lessons: [
    lesson("escape", "Escape analysis", "Compiler decisions and diagnostics.", 30),
    lesson("gc", "Garbage collection", "Reachability, marking, and pauses.", 30),
    lesson("reduce", "Allocation reduction", "Benchmarks, pprof, and real trade-offs.", 35),
  ],
  content: content({
    what:
      "Escape analysis decides whether a value's lifetime is provably confined to its stack frame. If a reference might outlive the frame, the value escapes and is allocated on the heap. The garbage collector traces reachable objects from roots and reclaims the rest.",
    why:
      "Allocation rate drives GC frequency and CPU cost. Understanding escape analysis helps write efficient Go without unsafe manual memory management. It also explains why seemingly local values have heap addresses and why some optimizations are not guaranteed.",
    mentalModel:
      "Escape analysis asks: can anyone outside this call still reach this value after return? If yes, it must live in the warehouse. The GC periodically starts from known roots and marks everything reachable; unmarked objects are garbage.",
    precise:
      "In Go, the compiler reports escape decisions with `-gcflags='-m'`. Common escape reasons include returning a pointer, storing a pointer in a global, sending a pointer through a channel, capturing a variable in a closure that outlives the frame, or placing a pointer in an interface. Go uses a concurrent, tri-color mark-and-sweep collector with write barriers. The language does not promise a specific collector implementation or pause time. `runtime.GC` forces a collection but is rarely appropriate in production code. `sync.Pool` can reduce allocation churn but adds complexity and is not a cache for correctness.",
    connections:
      "Escape analysis is a compiler optimization and a runtime allocation decision. The GC walks stacks and heap objects, connecting to pointer layout. Interfaces and closures often trigger escapes. Allocations affect cache locality, not just GC. Benchmarking provides measured evidence.",
    misconceptions: [
      "Thinking `new(T)` always means heap allocation.",
      "Assuming every interface conversion allocates in every compiler version.",
      "Calling runtime.GC in hot paths to 'fix' memory usage.",
      "Optimizing allocations before measuring with benchmarks and profiles.",
    ],
    trace: [
      { step: "func f() *int { x := 1; return &x }", detail: "x escapes because its address is returned." },
      { step: "func g() int { x := 1; return x }", detail: "x does not need to escape; it can stay on the stack." },
      { step: "GC mark phase", detail: "Reachable objects are marked; unreachable ones are swept later." },
    ],
    assessment: [
      "Give three reasons a value might escape.",
      "What does the compiler flag -m show?",
      "How does reachability define garbage?",
      "Why is allocating less not always the same as running faster?",
    ],
  }),
  codeExamples: [
    {
      language: "go",
      caption: "A closure that captures a variable and escapes",
      code: `package main

import "fmt"

func counter() func() int {
    n := 0
    return func() int {
        n++
        return n
    }
}

func main() {
    next := counter()
    fmt.Println(next(), next(), next()) // 1 2 3
    // n is reachable through the returned closure, so it must survive
    // after counter returns. The compiler chooses heap storage.
}`,
    },
  ],
  exerciseIds: ["ex-escape-analysis"],
  promptIds: ["prompt-memory-investigation", "prompt-compiler-assembly", "prompt-profiling"],
});

const alignment = topic({
  id: "alignment",
  phaseId: "phase-3",
  order: 6,
  title: "Alignment, Padding, and Struct Layout",
  definition:
    "Alignment is the requirement that a value's address be a multiple of some power of two. Padding is inserted between fields so each field is properly aligned. Struct layout is the ordered arrangement of fields and padding in memory.",
  summary:
    "See why structs are larger than the sum of their fields and how layout affects memory and caches.",
  difficulty: "intermediate",
  estimatedMinutes: 60,
  keywords: ["alignment", "padding", "struct layout", "unsafe.Sizeof", "memory layout"],
  aliases: ["struct padding", "alignment requirement", "sizeof", "field order"],
  prerequisites: ["bits-integers", "stack-heap"],
  related: ["cache-memory", "stack-heap", "serialization-distributed"],
  objectives: [
    "Compute basic struct size including padding.",
    "Explain why alignment exists at the hardware level.",
    "Order fields to reduce padding when it matters.",
    "Distinguish logical fields from in-memory representation.",
  ],
  lessons: [
    lesson("why", "Why alignment exists", "Word accesses, buses, and hardware constraints.", 20),
    lesson("size", "Sizes and padding", "Computing offsets and total size.", 20),
    lesson("layout", "Layout in practice", "Field ordering, unsafe.Sizeof, and serialization.", 20),
  ],
  content: content({
    what:
      "Every type has a size and an alignment requirement. A struct's fields are laid out in declaration order with padding inserted so each field starts at a suitably aligned offset. The struct's alignment is the maximum alignment of its fields, and its total size is rounded up to a multiple of that alignment.",
    why:
      "Misunderstanding layout leads to surprising memory use and incorrect assumptions when serializing raw bytes. On large slices of structs, padding can substantially increase memory traffic and cache misses. Alignment also matters for atomic operations and low-level interop.",
    mentalModel:
      "Think of memory as a row of lockers that can only be opened in aligned groups. A four-byte value must start at a locker number divisible by four. Padding is empty space left to satisfy that rule.",
    precise:
      "On common 64-bit platforms, int64 and pointers are 8-byte aligned, int32 is 4-byte aligned, and int16 is 2-byte aligned. The exact sizes and alignments are implementation-dependent; use unsafe.Sizeof and unsafe.Alignof to inspect the current platform. For example, struct{ a int8; b int64; c int8 } typically occupies 24 bytes, while struct{ b int64; a int8; c int8 } occupies 16. Zero-size fields can still affect layout and addresses. Serializing a struct by writing its memory is not portable across architectures or Go versions.",
    connections:
      "Alignment connects to CPU loads, cache lines, and bus transactions. Endianness matters when interpreting multi-byte values. Struct layout affects heap size and GC scanning. Atomic operations require naturally aligned addresses on many architectures.",
    misconceptions: [
      "Assuming a struct's size is the sum of its field sizes.",
      "Assuming the same layout on every architecture.",
      "Writing struct memory directly to disk as a portable format.",
      "Thinking zero-size fields occupy no address space in every context.",
    ],
    trace: [
      { step: "type S struct{ a int8; b int64; c int8 }", detail: "a at offset 0; seven padding bytes; b at offset 8; c at offset 16." },
      { step: "Total", detail: "Struct alignment is 8, so size rounds from 17 to 24 bytes." },
      { step: "Reorder", detail: "b, a, c places fields at 0, 8, 9; size rounds to 16 bytes." },
    ],
    assessment: [
      "Why does struct field order matter?",
      "How would you measure the size of a struct on the current platform?",
      "Why is raw struct memory a poor serialization format?",
      "What does alignment have to do with cache lines?",
    ],
  }),
  codeExamples: [
    {
      language: "go",
      caption: "Measuring layout on the current platform",
      code: `package main

import (
    "fmt"
    "unsafe"
)

type Padded struct {
    A int8
    B int64
    C int8
}

type Packed struct {
    B int64
    A int8
    C int8
}

func main() {
    fmt.Println(unsafe.Sizeof(Padded{})) // typically 24
    fmt.Println(unsafe.Sizeof(Packed{})) // typically 16
    fmt.Println(unsafe.Offsetof(Padded{}.B))
    fmt.Println(unsafe.Alignof(Padded{}))
}`,
    },
  ],
  exerciseIds: [],
  promptIds: ["prompt-memory-investigation", "prompt-architecture"],
});

export const phase3: Phase = {
  id: "phase-3",
  number: 3,
  title: "Memory and Data Representation",
  tagline: "What the bytes mean",
  description:
    "Move from syntax to representation: bits, integers, floating point, pointers, stack and heap, escape analysis, and garbage collection.",
  objectives: [
    "Interpret raw bit patterns and signed values.",
    "Predict allocation and mutability behavior.",
    "Explain GC reachability in terms of pointers.",
    "Distinguish guaranteed semantics from implementation details.",
  ],
  prerequisites: ["Phase 1 types and pointers", "Phase 2 complexity basics"],
  completionCriteria: [
    "You can explain stack versus heap without hand-waving.",
    "You can run an allocation experiment and interpret it.",
    "You can compute a simple struct layout.",
  ],
  estimatedWeeks: 4,
  keywords: [
    "binary", "hexadecimal", "bits", "bytes", "signed integers",
    "two's complement", "floating point", "pointers", "memory addresses",
    "alignment", "stack", "heap", "escape analysis", "garbage collection",
  ],
  projectIdea: "Build a number representation explorer with tests and a memory experiment log.",
  topics: [bitsIntegers, floatingPoint, pointersAddresses, stackHeap, escapeAnalysisGc, alignment],
};
