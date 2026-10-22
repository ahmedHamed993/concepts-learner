export const glossary: Record<string, string> = {
  variables:
    "Named storage locations with a type; assignment copies a value into the location.",
  types:
    "Descriptions of the set of values an expression can hold and the operations valid on them.",
  constants:
    "Compile-time values that cannot change; untyped constants can adapt to context.",
  "control flow":
    "The rules determining which statements execute, in what order, and how often.",
  functions:
    "Reusable units of computation with parameters, results, and their own call frames.",
  arrays:
    "Fixed-length, value-typed sequences; assigning an array copies all elements.",
  slices:
    "Descriptors containing a data pointer, length, and capacity over a backing array.",
  maps:
    "Hash-table key-value structures with expected constant-time lookup.",
  structs:
    "Aggregates of named fields stored together as one typed value.",
  methods:
    "Functions with a receiver, giving behavior to a named type.",
  pointers:
    "Typed values holding a memory address; dereferencing accesses the pointed-to value.",
  interfaces:
    "Sets of method signatures that types satisfy implicitly.",
  generics:
    "Type-parameterized functions and types constrained by interfaces.",
  errors:
    "Ordinary values implementing Error, returned to signal expected failure.",
  packages:
    "Named compilation and namespace units controlling exported identifiers.",
  modules:
    "Versioned collections of packages defined by a go.mod file.",
  testing:
    "Executable checks of behavior, often written as table-driven Go tests.",
  "problem decomposition":
    "Splitting a vague problem into smaller parts with explicit contracts and dependencies.",
  abstraction:
    "Exposing essential behavior while hiding implementation detail.",
  encapsulation:
    "Enforcing access boundaries so invariants cannot be violated from outside.",
  recursion:
    "Solving a problem by calling the same procedure on smaller instances with base cases.",
  algorithms:
    "Finite procedures that transform inputs into outputs under defined rules.",
  "data structures":
    "Arrangements of data chosen to make specific operations efficient.",
  "Big O notation":
    "An asymptotic upper bound describing how resource use grows with input size.",
  invariants:
    "Properties that must remain true at defined points in a program or algorithm.",
  debugging:
    "Disciplined hypothesis testing to locate and fix incorrect behavior.",
  "clean code":
    "Code whose intent, structure, and invariants are easy to read, test, and change.",
  binary: "Base-2 notation in which each digit is a bit.",
  hexadecimal:
    "Base-16 notation; each hex digit maps exactly to four bits.",
  bits: "A binary digit, 0 or 1; the smallest unit of digital information.",
  bytes: "Groups of eight bits, commonly the smallest addressable storage unit.",
  "signed integers":
    "Fixed-width integers interpreted with a sign; commonly represented in two's complement.",
  "two's complement":
    "A signed representation where the most significant bit has a negative weight; negation is ^x + 1.",
  "floating point":
    "An approximate numeric format with sign, exponent, and fraction fields, commonly IEEE 754.",
  "memory addresses":
    "Numeric locations in a process's virtual address space, typically represented by pointers.",
  alignment:
    "The requirement that a value's address be a multiple of its alignment.",
  stack:
    "A memory region used for call frames and automatic storage in typical implementations.",
  heap:
    "Dynamically managed memory whose lifetime is not tied to one call frame.",
  "stack frame":
    "Per-call storage for arguments, locals, temporaries, and return information.",
  "escape analysis":
    "Compiler analysis deciding whether a value's lifetime requires heap allocation.",
  "garbage collection":
    "Automatic reclamation of heap objects that are no longer reachable.",
  "Boolean algebra":
    "The algebra of true and false values using AND, OR, and NOT.",
  "logic gates":
    "Hardware elements implementing Boolean operations such as AND, OR, NOT, NAND, and XOR.",
  "combinational circuits":
    "Circuits whose outputs depend only on their current inputs.",
  "sequential circuits":
    "Circuits that hold state and update it in response to a clock or events.",
  registers:
    "Small, fast CPU storage elements that hold values during execution.",
  ALU:
    "The arithmetic logic unit: combinational hardware that performs arithmetic and bitwise operations.",
  "instruction sets":
    "The software-visible operations, registers, addressing modes, and memory rules of an ISA.",
  "CPU execution cycle":
    "The conceptual fetch, decode, execute, memory, and write-back sequence of instruction execution.",
  assembly:
    "Human-readable notation for machine instructions and operands.",
  "machine code":
    "The binary encoding of instructions executed by a processor.",
  RAM: "Random-access memory used for working data; volatile and much slower than caches.",
  "cache hierarchy":
    "Layered fast storage between the CPU and main memory, trading size for speed.",
  "cache lines":
    "Fixed-size blocks transferred between cache levels; commonly 64 bytes on x86-64.",
  endianness:
    "The order in which the bytes of a multi-byte value are stored or transmitted.",
  lexing:
    "Converting a character stream into tokens with kinds and source positions.",
  parsing:
    "Grouping tokens into a syntactic structure according to a grammar.",
  "abstract syntax trees":
    "Tree representations of program structure that omit formatting and punctuation.",
  "type checking":
    "Verifying that operations and declarations are consistent with a type system.",
  "intermediate representation":
    "A compiler-internal program form used for analysis and optimization.",
  optimization:
    "Program transformations that preserve observable behavior while improving a target metric.",
  compilation:
    "Translating source code into a lower-level representation, often machine code.",
  linking:
    "Combining object files and libraries, resolving symbols and relocations into an executable.",
  "executable files":
    "Files containing code and data that an operating system can load and run.",
  "Go runtime":
    "The support code linked into Go programs that manages scheduling, memory, GC, and related services.",
  "garbage collector":
    "A runtime component that finds unreachable heap objects and reclaims them.",
  "compiler escape analysis":
    "The compiler phase that determines whether values may be stack-allocated.",
  kernel:
    "The privileged core of an operating system that controls hardware and isolation.",
  processes:
    "Running program instances with their own virtual address spaces and resources.",
  threads:
    "Schedulable execution paths within a process that share its address space.",
  scheduling:
    "Selecting which runnable task executes on a CPU and when.",
  "virtual memory":
    "Per-process address spaces translated to physical memory through page tables.",
  "page tables":
    "Kernel-maintained mappings from virtual pages to physical frames, including permissions.",
  "system calls":
    "Controlled requests from user code to the kernel.",
  syscall: "A system call: a controlled transition from user mode into the kernel.",
  "file descriptors":
    "Per-process integers indexing open file descriptions and other I/O resources.",
  filesystems:
    "Structures and rules for organizing persistent files, directories, and metadata.",
  interrupts:
    "Signals that cause the CPU to pause and handle an event, often from hardware.",
  synchronization:
    "Coordination that prevents conflicting concurrent access and establishes ordering.",
  permissions:
    "Rules controlling which subjects may perform which operations on resources.",
  "I/O": "Input and output between a program and devices, files, sockets, or other resources.",
  goroutines:
    "Lightweight concurrent functions scheduled by the Go runtime.",
  goroutine:
    "A lightweight concurrent function execution managed by the Go runtime.",
  channels:
    "Typed conduits for synchronized communication between goroutines.",
  select:
    "A Go statement that chooses among ready channel operations.",
  mutexes:
    "Mutual-exclusion locks that serialize access to shared state.",
  "atomic operations":
    "Indivisible operations with defined ordering, used to coordinate shared memory.",
  "race conditions":
    "Correctness bugs caused by timing-dependent interleavings, broader than data races.",
  "Go memory model":
    "The specification of when writes become visible to other goroutines through happens-before.",
  "context cancellation":
    "Propagation of cancellation and deadlines through a context tree.",
  "worker pools":
    "Fixed sets of workers consuming tasks from a queue to bound concurrency.",
  networking:
    "Communication between programs over protocols such as TCP and HTTP.",
  TCP: "A reliable, ordered byte-stream transport protocol with connection setup and teardown.",
  HTTP: "An application protocol of requests and responses, commonly carried over TCP.",
  profiling:
    "Collecting runtime evidence such as CPU samples, allocations, blocking, or traces.",
  benchmarking:
    "Controlled measurement of performance, often with Go's testing.B.",
  pprof:
    "Go's profiling toolchain for CPU, heap, goroutine, block, and mutex profiles.",
  "CLI tools":
    "Programs driven by arguments, stdin, stdout, stderr, and exit codes.",
  "file indexers":
    "Programs that traverse files and store searchable information about them.",
  interpreters:
    "Programs that execute a program representation directly rather than compiling to native code first.",
  "virtual machines":
    "Software execution environments with their own instruction set and runtime state.",
  "HTTP servers":
    "Programs that accept HTTP requests and produce responses through handlers.",
  "concurrent workers":
    "Multiple execution units processing independent tasks while sharing bounded resources.",
  "key-value stores":
    "Storage systems mapping opaque keys to values with defined durability and concurrency behavior.",
  databases:
    "Systems that organize persistent data with queries, indexes, transactions, and recovery.",
  serialization:
    "Converting structured values to a stable byte representation and back.",
  "performance analysis":
    "Using measurements and models to explain and improve resource use.",
  observability:
    "Inferring internal system state from logs, metrics, traces, and other outputs.",
  "distributed systems":
    "Multiple independent programs coordinating over a network with partial failure.",
};
