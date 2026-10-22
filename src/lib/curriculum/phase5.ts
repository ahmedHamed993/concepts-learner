import type { Phase } from "@/lib/types";
import { content, lesson, topic } from "./helpers";

const lexingParsing = topic({
  id: "lexing-parsing",
  phaseId: "phase-5",
  order: 1,
  title: "Lexing and Parsing",
  definition:
    "Lexing converts characters into tokens. Parsing groups tokens into a syntax tree according to a grammar.",
  summary:
    "Learn how source text becomes structure, and build a tokenizer and expression parser.",
  difficulty: "intermediate",
  estimatedMinutes: 90,
  keywords: ["lexing", "parsing", "tokens", "grammar", "abstract syntax trees"],
  aliases: ["lexer", "scanner", "parser", "recursive descent", "precedence"],
  prerequisites: ["recursion", "go-flow"],
  related: ["ast-typechecking", "interpreters-vms", "toolchain"],
  objectives: [
    "Distinguish lexical from syntactic errors.",
    "Write a hand-written tokenizer.",
    "Build a recursive-descent parser for expressions.",
    "Explain precedence, associativity, and ambiguity.",
  ],
  lessons: [
    lesson("tokens", "Tokens", "Lexemes, token kinds, and positions.", 25),
    lesson("grammar", "Grammars", "Productions, precedence, and ambiguity.", 30),
    lesson("parse", "Recursive descent", "Writing a parser and reporting errors.", 35),
  ],
  content: content({
    what:
      "A lexer scans characters and emits tokens such as identifiers, numbers, operators, and keywords, usually with source positions. A parser consumes tokens and builds a syntax tree according to a formal or informal grammar. Errors can occur at either stage.",
    why:
      "Every language tool starts here: compilers, interpreters, linters, formatters, configuration parsers. Parsing also teaches recursive structure and the difference between syntax and meaning. It is an excellent systems project with visible progress.",
    mentalModel:
      "The lexer turns a sentence into words. The parser checks grammar and builds a sentence diagram. A word can be spelled correctly but the sentence still ungrammatical; that is the difference between lexical and syntax errors.",
    precise:
      "Token kinds usually include EOF, identifiers, literals, operators, and delimiters. A recursive-descent parser has one function per grammar rule. Left recursion must be rewritten to avoid infinite descent. Operator precedence can be encoded by layered parse functions or precedence climbing. The resulting tree captures structure, not evaluation. Source positions enable useful diagnostics. In Go, the standard library packages go/scanner, go/token, go/parser, and go/ast implement these stages for Go.",
    connections:
      "Parse trees feed type checking and interpretation. ASTs connect to compilers and tooling. Grammars connect to recursion and language theory. Source positions connect to diagnostics and editor tooling.",
    misconceptions: [
      "Thinking parsing executes the program.",
      "Confusing a token's text with its meaning.",
      "Assuming regex can parse arbitrary nested expressions.",
      "Ignoring error recovery and source positions.",
    ],
    trace: [
      { step: "input: 2 + 3 * 4", detail: "Lexer emits NUMBER(2), PLUS, NUMBER(3), STAR, NUMBER(4), EOF." },
      { step: "parse expression", detail: "Precedence makes multiplication bind tighter than addition." },
      { step: "tree", detail: "Add(2, Multiply(3, 4)), which evaluates to 14." },
    ],
    assessment: [
      "Give an example of a lexical error and a syntax error.",
      "Why must left-recursive grammar rules be transformed for recursive descent?",
      "How is precedence represented in a recursive-descent parser?",
      "What information should each token carry?",
    ],
  }),
  codeExamples: [
    {
      language: "go",
      caption: "A minimal recursive-descent expression parser",
      code: `package main

import (
    "fmt"
    "strconv"
    "strings"
)

type node interface{}
type num int
type bin struct {
    op   byte
    l, r node
}

func parse(input string) (node, error) {
    tokens := strings.Fields(input)
    pos := 0
    var expr func() node
    var term func() node
    var factor func() node

    factor = func() node {
        if pos >= len(tokens) {
            return nil
        }
        t := tokens[pos]
        pos++
        if t == "(" {
            n := expr()
            pos++ // skip ")"
            return n
        }
        v, _ := strconv.Atoi(t)
        return num(v)
    }
    term = func() node {
        n := factor()
        for pos < len(tokens) && (tokens[pos] == "*" || tokens[pos] == "/") {
            op := tokens[pos][0]
            pos++
            n = bin{op: op, l: n, r: factor()}
        }
        return n
    }
    expr = func() node {
        n := term()
        for pos < len(tokens) && (tokens[pos] == "+" || tokens[pos] == "-") {
            op := tokens[pos][0]
            pos++
            n = bin{op: op, l: n, r: term()}
        }
        return n
    }
    return expr(), nil
}

func eval(n node) int {
    switch x := n.(type) {
    case num:
        return int(x)
    case bin:
        l, r := eval(x.l), eval(x.r)
        switch x.op {
        case '+':
            return l + r
        case '-':
            return l - r
        case '*':
            return l * r
        case '/':
            return l / r
        }
    }
    return 0
}

func main() {
    tree, _ := parse("2 + 3 * 4")
    fmt.Println(eval(tree)) // 14
}`,
    },
  ],
  exerciseIds: ["ex-tokenizer"],
  promptIds: ["prompt-deep-tutor", "prompt-project-learning", "prompt-trace-code"],
});

const astTypechecking = topic({
  id: "ast-typechecking",
  phaseId: "phase-5",
  order: 2,
  title: "ASTs and Type Checking",
  definition:
    "An abstract syntax tree (AST) represents the structure of a program as nodes. Type checking verifies that operations and declarations are consistent with a type system before execution.",
  summary:
    "Walk a syntax tree, resolve names, and enforce types with useful diagnostics.",
  difficulty: "advanced",
  estimatedMinutes: 90,
  keywords: ["abstract syntax trees", "type checking", "symbol table", "scope", "semantic analysis"],
  aliases: ["AST", "type system", "name resolution", "semantic analysis"],
  prerequisites: ["lexing-parsing", "go-types", "abstraction"],
  related: ["ir-optimization", "go-runtime", "invariants-testing-clean-code"],
  objectives: [
    "Design AST node types.",
    "Walk an AST recursively.",
    "Resolve names through scopes.",
    "Explain static versus dynamic typing.",
  ],
  lessons: [
    lesson("ast", "AST design", "Nodes, visitors, and source positions.", 30),
    lesson("names", "Name resolution", "Scopes, symbol tables, and shadowing.", 30),
    lesson("types", "Type checking", "Rules, inference, and diagnostics.", 30),
  ],
  content: content({
    what:
      "An AST omits punctuation and formatting but preserves structure. Type checking traverses it, resolving identifiers and assigning or verifying types. Errors detected here prevent entire classes of runtime failures.",
    why:
      "ASTs power compilers, interpreters, linters, refactoring tools, and formatting. Type checking is where language guarantees are established. Understanding it makes Go's compile errors and generics behavior less magical.",
    mentalModel:
      "The AST is a family tree of expressions and statements. Type checking is a careful inspection that labels each expression with what it produces and ensures every operation makes sense.",
    precise:
      "AST nodes are usually structs or tagged unions implementing a common interface or visited by a switch. A symbol table maps names to declarations in each scope. Type checking may be bidirectional: expected types flow down, actual types flow up. Go performs static type checking and requires explicit interface satisfaction. Generics add constraint checking and type inference. Diagnostics should include positions and actionable context.",
    connections:
      "The AST comes from parsing and feeds interpretation or code generation. Type information drives optimization and memory layout. Scope resolution connects to runtime environments for interpreted languages. Go's go/ast and go/types packages expose these phases.",
    misconceptions: [
      "Thinking an AST contains every source character.",
      "Confusing runtime type checks with static type checking.",
      "Believing type inference means dynamic typing.",
      "Ignoring scope rules when implementing a language.",
    ],
    trace: [
      { step: "parse: x + 1", detail: "AST: BinaryExpr{Op:+, X:Ident(x), Y:BasicLit(1)}." },
      { step: "resolve x", detail: "Lookup x in the current scope chain; fail if undeclared." },
      { step: "check +", detail: "Both operands must be numeric; result type is determined." },
    ],
    assessment: [
      "What information should an AST node carry for diagnostics?",
      "How does a symbol table handle shadowing?",
      "What is the difference between static and dynamic type checking?",
      "Why can type checking prevent some security bugs?",
    ],
  }),
  codeExamples: [
    {
      language: "go",
      caption: "A tiny AST with an evaluator and scope",
      code: `package main

import "fmt"

type Expr interface{ Eval(env map[string]int) (int, error) }
type Lit int
type Var string
type Add struct{ L, R Expr }

func (l Lit) Eval(map[string]int) (int, error) { return int(l), nil }

func (v Var) Eval(env map[string]int) (int, error) {
    n, ok := env[string(v)]
    if !ok {
        return 0, fmt.Errorf("undefined variable %q", v)
    }
    return n, nil
}

func (a Add) Eval(env map[string]int) (int, error) {
    l, err := a.L.Eval(env)
    if err != nil {
        return 0, err
    }
    r, err := a.R.Eval(env)
    if err != nil {
        return 0, err
    }
    return l + r, nil
}

func main() {
    expr := Add{L: Var("x"), R: Lit(2)}
    v, err := expr.Eval(map[string]int{"x": 40})
    fmt.Println(v, err) // 42 <nil>
}`,
    },
  ],
  exerciseIds: ["ex-shunting-yard"],
  promptIds: ["prompt-deep-tutor", "prompt-code-review"],
});

const irOptimization = topic({
  id: "ir-optimization",
  phaseId: "phase-5",
  order: 3,
  title: "Intermediate Representation and Optimization",
  definition:
    "An intermediate representation (IR) is a compiler-internal program form, often lower-level than an AST and independent of any one source language. Optimization transforms IR while preserving observable behavior.",
  summary:
    "See why compilers lower, analyze, and transform programs before generating code.",
  difficulty: "advanced",
  estimatedMinutes: 90,
  keywords: ["intermediate representation", "optimization", "SSA", "constant folding", "dead code"],
  aliases: ["IR", "SSA form", "optimization pass", "inlining", "dead code elimination"],
  prerequisites: ["ast-typechecking", "data-structures-complexity"],
  related: ["toolchain", "go-runtime", "profiling"],
  objectives: [
    "Explain why an IR is useful.",
    "Recognize common optimizations.",
    "Apply constant folding and dead-code reasoning.",
    "Understand that optimization preserves observable behavior, not exact timing.",
  ],
  lessons: [
    lesson("lower", "Lowering to IR", "From tree to instructions and basic blocks.", 30),
    lesson("passes", "Optimization passes", "Folding, inlining, DCE, and escape analysis.", 30),
    lesson("limits", "Optimization limits", "Aliasing, side effects, and observable behavior.", 30),
  ],
  content: content({
    what:
      "An IR may resemble a control-flow graph of simple operations, often in static single assignment (SSA) form where each value is assigned once. Optimizations include constant folding, constant propagation, dead code elimination, inlining, loop optimizations, and register allocation.",
    why:
      "IR separates language semantics from machine details, making analyses reusable. It is where many performance transformations happen. Understanding optimization also explains why benchmarks and source-level intuition can diverge.",
    mentalModel:
      "The compiler translates a rich source language into a plain list of tiny operations with explicit control flow. Optimization is repeated cleanup: remove work that cannot matter, combine known values, and choose efficient machine-level strategies.",
    precise:
      "SSA simplifies data-flow analysis because each value has one definition. Inlining substitutes a callee's body at a call site, enabling further optimization at the cost of code size. Escape analysis can remove heap allocations. Compilers must preserve side effects, panics, and observable behavior; they may change timing and memory layout. Go's compiler uses SSA internally and applies numerous passes; details change across versions and are not language guarantees. `GOSSAFUNC` can emit an SSA HTML report.",
    connections:
      "Parsing and type checking produce the input to IR. IR feeds assembly generation. Escape analysis connects to memory. Performance profiling validates whether optimizations matter in real workloads. The theoretical study of program equivalence underlies correct rewrites.",
    misconceptions: [
      "Assuming optimization always makes code faster in every dimension.",
      "Thinking the compiler can reorder across synchronization boundaries freely.",
      "Believing inlining is always beneficial.",
      "Expecting a particular optimization to be guaranteed by the language.",
    ],
    trace: [
      { step: "x := 2 * 3", detail: "Constant folding replaces the expression with 6." },
      { step: "y := 10; y unused", detail: "Dead code elimination removes the assignment if it has no side effect." },
      { step: "inline small function", detail: "The call is replaced by its body, enabling further simplification." },
    ],
    assessment: [
      "Why is SSA useful for analysis?",
      "What must an optimization preserve?",
      "What is the trade-off of aggressive inlining?",
      "How can GOSSAFUNC help investigate compiler behavior?",
    ],
  }),
  codeExamples: [
    {
      language: "go",
      caption: "Optimization is not guaranteed at source level",
      code: `package main

import "fmt"

// A function call is a semantic action. The compiler may inline it,
// but you should not write code that depends on inlining for correctness.
func square(x int) int { return x * x }

func main() {
    const folded = 2 * 3 // constant expression
    n := square(folded)

    fmt.Println(n)

    // Inspect compiler output (implementation details vary):
    // go build -gcflags="-S" .
    // GOSSAFUNC=main go build .
}`,
    },
  ],
  exerciseIds: [],
  promptIds: ["prompt-compiler-assembly", "prompt-deep-tutor"],
});

const toolchain = topic({
  id: "toolchain",
  phaseId: "phase-5",
  order: 4,
  title: "Compilation, Assembly, and Linking",
  definition:
    "Compilation translates source into object code. Assembly converts assembly into machine code object files. Linking combines object files and libraries into an executable, resolving symbols and relocations.",
  summary:
    "Follow the Go build pipeline from source to executable and inspect each artifact.",
  difficulty: "advanced",
  estimatedMinutes: 90,
  keywords: ["compilation", "assembly", "linking", "executable files", "object files", "symbols"],
  aliases: ["linker", "go build", "object code", "relocation", "static linking"],
  prerequisites: ["assembly-machine-code", "ir-optimization"],
  related: ["go-runtime", "lexing-parsing", "profiling"],
  objectives: [
    "Describe the stages from source to executable.",
    "Explain symbol resolution and relocation.",
    "Use go build, go tool compile, and go tool link.",
    "Distinguish static and dynamic linking trade-offs.",
  ],
  lessons: [
    lesson("pipeline", "The build pipeline", "Compile, assemble, link, and package.", 30),
    lesson("symbols", "Symbols and relocations", "Names, addresses, and unresolved references.", 30),
    lesson("artifacts", "Inspecting artifacts", "go tool nm, objdump, and build flags.", 30),
  ],
  content: content({
    what:
      "The compiler emits assembly or object code for each package. The assembler produces machine code and metadata such as symbols and relocations. The linker lays out sections, resolves references, and produces an executable or library.",
    why:
      "Build failures often occur at link time, not compile time. Executable size, startup time, and dependency behavior depend on linking. Inspecting symbols and binaries is a practical systems skill.",
    mentalModel:
      "Compilation builds labeled puzzle pieces. Assembly cuts them to physical shape. Linking arranges all pieces on a board, resolves labels, and glues them into a finished picture.",
    precise:
      "A symbol names a function or variable. A relocation records a place where an address must be filled in once layout is known. Go builds mostly static binaries by default, but cgo and certain features can introduce dynamic dependencies. Package initialization order is determined by dependency order, not source file order, with a defined ordering among independent packages. Linker flags can strip debug information. Build modes and CGO_ENABLED affect the result. Exact object formats are platform-specific.",
    connections:
      "Compilation connects source semantics to machine instructions. Linking connects separately compiled packages. The runtime is linked in and initializes goroutines, GC, and schedulers. Symbols support debugging and profiling.",
    misconceptions: [
      "Thinking a successful compile guarantees a successful link.",
      "Assuming Go binaries are always fully static under every build configuration.",
      "Believing source file order determines package initialization order.",
      "Ignoring build tags and CGO when reproducing a binary.",
    ],
    trace: [
      { step: "go build ./...", detail: "Each package is compiled with dependencies in topological order." },
      { step: "object files", detail: "Contain code and data with symbols and relocations." },
      { step: "link", detail: "Sections are laid out; references are resolved to addresses." },
      { step: "executable", detail: "The OS loader maps it and transfers control to the entry point." },
    ],
    assessment: [
      "What does a linker do that a compiler does not?",
      "What is a relocation?",
      "When might a Go binary depend on dynamic libraries?",
      "How can you inspect symbols in a Go binary?",
    ],
  }),
  codeExamples: [
    {
      language: "text",
      caption: "Inspect build artifacts",
      code: `go build -o app .

# List symbols (functions, types, data)
go tool nm app | head

# Disassemble a function
go tool objdump -s 'main.main' app

# Build without CGO for a portable static experiment
CGO_ENABLED=0 go build -o app-static .

# Reproduce build settings
go env CGO_ENABLED GOOS GOARCH GOVERSION`,
    },
  ],
  exerciseIds: ["ex-assembly-inspect"],
  promptIds: ["prompt-compiler-assembly", "prompt-deep-tutor"],
});

const goRuntime = topic({
  id: "go-runtime",
  phaseId: "phase-5",
  order: 5,
  title: "The Go Runtime and Garbage Collector",
  definition:
    "The Go runtime is the library and support code linked into every Go program. It manages goroutines, stacks, memory allocation, the garbage collector, channels, and scheduling.",
  summary:
    "Understand the machinery beneath goroutines: scheduler, allocator, GC, and runtime diagnostics.",
  difficulty: "advanced",
  estimatedMinutes: 100,
  keywords: ["Go runtime", "garbage collector", "goroutine scheduler", "allocator", "GOMAXPROCS"],
  aliases: ["runtime", "GC", "M:P:G", "scheduler", "mcache"],
  prerequisites: ["escape-analysis-gc", "stack-heap", "isa-cpu-cycle"],
  related: ["goroutines", "channels-select", "profiling"],
  objectives: [
    "Explain what the runtime owns.",
    "Describe the goroutine scheduler at a high level.",
    "Understand allocation size classes and GC roots.",
    "Use runtime diagnostics without overclaiming.",
  ],
  lessons: [
    lesson("role", "Runtime responsibilities", "Startup, scheduling, memory, and reflection.", 25),
    lesson("sched", "Goroutine scheduling", "G, M, P, work stealing, and preemption.", 35),
    lesson("memory", "Allocator and GC", "Size classes, spans, roots, and write barriers.", 40),
  ],
  content: content({
    what:
      "The Go runtime provides goroutine creation and scheduling, stack growth, memory allocation, garbage collection, channel operations, timers, and runtime metadata. It is linked into the program even when you do not import the runtime package directly.",
    why:
      "Runtime behavior explains blocking, preemption, GC pauses, memory overhead, and concurrency performance. Runtime diagnostics such as GODEBUG, pprof, and execution traces are essential for production systems.",
    mentalModel:
      "The runtime is a small operating system inside your process. Goroutines are user-space tasks, Ps are execution tokens, Ms are OS threads, and the allocator and GC manage the process's heap.",
    precise:
      "The scheduler uses G (goroutine), M (OS thread), and P (processor context) abstractions. A P is required to run Go code; M's execute G's; work stealing balances queues. Asynchronous preemption has been available since Go 1.14, so tight loops can be interrupted. The GC is concurrent mark-and-sweep with write barriers and assists. Exact scheduling, size classes, and GC behavior are implementation details that vary by version and can be tuned with GOGC and GOMEMLIMIT. GOMAXPROCS defaults to the number of available CPUs, subject to container awareness in recent versions.",
    connections:
      "The runtime implements the memory model's synchronization mechanisms. Scheduling is the user-space counterpart of OS threads. Escape analysis and allocation feed GC pressure. pprof and traces reveal runtime behavior. Channels and context are runtime-supported synchronization primitives.",
    misconceptions: [
      "Believing a goroutine is an OS thread.",
      "Thinking GOMAXPROCS caps the number of goroutines.",
      "Assuming GC always stops the world for a fixed duration.",
      "Treating runtime internals as language guarantees.",
    ],
    trace: [
      { step: "go f()", detail: "A G is created and placed on a run queue." },
      { step: "scheduler", detail: "An M with a P picks a runnable G and executes it." },
      { step: "blocking syscall", detail: "The M may hand off its P so other goroutines keep running." },
      { step: "GC cycle", detail: "Roots are scanned; reachable objects are marked; unreachable memory is reclaimed." },
    ],
    assessment: [
      "What do G, M, and P represent?",
      "Why is preemption necessary for fair scheduling?",
      "What are GC roots?",
      "How do GOGC and GOMEMLIMIT influence behavior?",
    ],
  }),
  codeExamples: [
    {
      language: "go",
      caption: "Runtime introspection",
      code: `package main

import (
    "fmt"
    "runtime"
    "runtime/debug"
)

func main() {
    fmt.Println("GOMAXPROCS", runtime.GOMAXPROCS(0))
    fmt.Println("NumCPU", runtime.NumCPU())
    fmt.Println("NumGoroutine", runtime.NumGoroutine())

    var m runtime.MemStats
    runtime.ReadMemStats(&m)
    fmt.Printf("HeapAlloc=%d KiB NumGC=%d\\n", m.HeapAlloc/1024, m.NumGC)

    debug.SetGCPercent(100) // restore the default experiment; tune with evidence
}`,
    },
  ],
  exerciseIds: [],
  promptIds: ["prompt-compiler-assembly", "prompt-profiling", "prompt-memory-investigation"],
});

export const phase5: Phase = {
  id: "phase-5",
  number: 5,
  title: "Compilers and Language Runtime",
  tagline: "From text to execution",
  description:
    "Follow source text through lexing, parsing, type checking, IR optimization, code generation, linking, and the Go runtime.",
  objectives: [
    "Explain each compiler stage and its output.",
    "Build a small tokenizer and parser.",
    "Read generated assembly and understand linking.",
    "Describe the Go runtime's role in execution.",
  ],
  prerequisites: ["Phase 1 Go", "Phase 4 architecture and assembly"],
  completionCriteria: [
    "You can explain the Go build pipeline end to end.",
    "You can inspect a binary's symbols and assembly.",
    "One interpreter or expression evaluator is working.",
  ],
  estimatedWeeks: 5,
  keywords: [
    "lexing", "parsing", "abstract syntax trees", "type checking",
    "intermediate representation", "optimization", "compilation", "assembly",
    "linking", "executable files", "Go runtime", "garbage collector",
    "compiler escape analysis",
  ],
  projectIdea: "Build a tokenizer and recursive-descent interpreter for a small language.",
  topics: [lexingParsing, astTypechecking, irOptimization, toolchain, goRuntime],
};
