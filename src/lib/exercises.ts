import type { Exercise } from "@/lib/types";

export const seedExercises: Exercise[] = [
  {
    id: "ex-slice-growth",
    phaseId: "phase-1",
    title: "Prove slice aliasing with append",
    instructions:
      "Write a program that creates a slice, takes a subslice, appends within capacity, and then appends beyond capacity. Print the original backing array after each step. Add a short comment explaining which writes were shared and where reallocation occurred.",
    prerequisites: ["Slices and capacity"],
    difficulty: "beginner",
    estimatedMinutes: 25,
    testCases: [
      { name: "Aliased write", expectation: "The original slice observes the appended value when capacity is sufficient." },
      { name: "Reallocation", expectation: "After growth, modifying the new slice no longer changes the original slice." },
      { name: "Explanation", expectation: "Comments identify len and cap at each step." },
    ],
    hints: [
      "Use a slice literal with length equal to capacity to keep the first append in place.",
      "Print the backing array by re-slicing to its full capacity.",
    ],
    solutionNotes:
      "A slice header holds a pointer, length, and capacity. append may reuse the same backing array until capacity is exhausted. Growth allocates a new array and copies elements. Design notes only; run your own tests before claiming completion.",
    concepts: ["go-collections", "stack-heap"],
  },
  {
    id: "ex-word-count",
    phaseId: "phase-1",
    title: "Word frequency with maps",
    instructions:
      "Read text from stdin and print the five most frequent words, case-insensitively, excluding punctuation. Break ties alphabetically. Handle empty input and unreadable stdin errors.",
    prerequisites: ["Maps", "Slices", "Error handling"],
    difficulty: "beginner",
    estimatedMinutes: 35,
    testCases: [
      { name: "Basic counts", expectation: "Repeated words are counted case-insensitively." },
      { name: "Ties", expectation: "Equal counts are ordered alphabetically." },
      { name: "Empty input", expectation: "Prints nothing and exits successfully." },
    ],
    hints: [
      "Write a tokenizer using strings.FieldsFunc with unicode-aware checks.",
      "Convert entries to a slice before sorting; maps have no order.",
    ],
    solutionNotes:
      "The map gives expected O(1) counting per token. Sorting the distinct words is O(k log k). Do not assume map iteration order. This exercise does not prove behavior on every Unicode locale.",
    concepts: ["go-collections", "data-structures-complexity"],
  },
  {
    id: "ex-generic-stack",
    phaseId: "phase-1",
    title: "A generic stack with a zero value",
    instructions:
      "Implement a generic Stack[T] with Push, Pop, Peek, Len, and a useful zero value. Return an explicit error for Pop and Peek on an empty stack. Write table-driven tests, including a stack of structs and a stack of pointers.",
    prerequisites: ["Generics", "Methods", "Testing"],
    difficulty: "intermediate",
    estimatedMinutes: 40,
    testCases: [
      { name: "LIFO order", expectation: "Push 1,2,3 then Pop yields 3,2,1." },
      { name: "Empty", expectation: "Pop on zero Stack returns an error, not a panic." },
      { name: "Generic reuse", expectation: "The same type works for int and a custom struct." },
    ],
    hints: [
      "Use a nil slice for the zero value; append works on nil slices.",
      "Decide whether to retain popped backing slots to avoid memory leaks for large values.",
    ],
    solutionNotes:
      "After popping, clear the vacated slot if the element type may hold large referenced data and the stack may stay allocated. The zero value should not require a constructor. Keep errors as package-level sentinel values.",
    concepts: ["go-interfaces-generics", "go-types"],
  },
  {
    id: "ex-error-wrapping",
    phaseId: "phase-1",
    title: "Wrap errors without losing the cause",
    instructions:
      "Create a small package that loads a configuration file. Return errors that preserve the underlying cause, add operation context, and expose a sentinel error for a missing name. Test with errors.Is and errors.As.",
    prerequisites: ["Error wrapping", "Testing"],
    difficulty: "intermediate",
    estimatedMinutes: 35,
    testCases: [
      { name: "Missing file", expectation: "errors.Is(err, fs.ErrNotExist) is true." },
      { name: "Missing field", expectation: "The sentinel ErrMissingName is reachable through the chain." },
      { name: "Message", expectation: "The message contains useful operation and path context." },
    ],
    hints: [
      "Use fmt.Errorf with %w.",
      "Do not string-match the formatted error to inspect it.",
    ],
    solutionNotes:
      "Wrap at layer boundaries, not repeatedly at every line. Keep sentinel errors exported when callers need to branch on them. Avoid exposing secrets in error messages.",
    concepts: ["go-errors-packages-testing"],
  },
  {
    id: "ex-recursive-permutations",
    phaseId: "phase-2",
    title: "Generate permutations and count nodes",
    instructions:
      "Write a recursive function that generates all permutations of a distinct integer slice. Instrument a counter for recursive calls and compare the observed count with the expected factorial growth for small n.",
    prerequisites: ["Recursion", "Backtracking"],
    difficulty: "intermediate",
    estimatedMinutes: 40,
    testCases: [
      { name: "Three elements", expectation: "Exactly 6 permutations are produced, with no duplicates." },
      { name: "Empty input", expectation: "One permutation: the empty slice." },
      { name: "No mutation", expectation: "The input slice is unchanged after generation." },
    ],
    hints: [
      "Swap elements in place, recurse, then swap back.",
      "Copy results at the leaf; otherwise all results share the same backing array.",
    ],
    solutionNotes:
      "Backtracking must restore state on every path. Generating all permutations is O(n!·n) in the usual implementation because each leaf copies n elements. Memoization is not applicable to the full output.",
    concepts: ["recursion", "data-structures-complexity"],
  },
  {
    id: "ex-complexity-lab",
    phaseId: "phase-2",
    title: "Measure two duplicate-detection algorithms",
    instructions:
      "Implement nested-loop and map-based duplicate detection. Write benchmarks over sizes 10, 1,000, and 1,000,000 with a planted duplicate. Explain when each implementation wins and why the asymptotics do not tell the whole story.",
    prerequisites: ["Big O", "Benchmarks"],
    difficulty: "intermediate",
    estimatedMinutes: 50,
    testCases: [
      { name: "Correctness", expectation: "Both implementations agree on empty, unique, and duplicate inputs." },
      { name: "Benchmarks", expectation: "Results are reported with ns/op and allocations for all sizes." },
      { name: "Analysis", expectation: "The write-up compares expected O(n) versus O(n²)." },
    ],
    hints: [
      "Use b.Run for sub-benchmarks by size.",
      "Exclude input construction from the timed loop.",
    ],
    solutionNotes:
      "The map version allocates and hashing costs; the nested loop has no auxiliary allocation but quadratic comparisons. At tiny n, constants may dominate. Record the environment and input construction in your notes.",
    concepts: ["data-structures-complexity", "profiling"],
  },
  {
    id: "ex-binary-search-invariants",
    phaseId: "phase-2",
    title: "Binary search with an explicit invariant",
    instructions:
      "Implement binary search with a documented invariant and tests for empty input, one element, duplicates, target below the range, and target above the range. Prove termination by identifying the shrinking interval.",
    prerequisites: ["Invariants", "Testing"],
    difficulty: "intermediate",
    estimatedMinutes: 40,
    testCases: [
      { name: "Found", expectation: "Returns a valid index containing the target." },
      { name: "Absent", expectation: "Returns a not-found result without panicking." },
      { name: "Duplicates", expectation: "Any matching index is accepted; document the choice." },
    ],
    hints: [
      "Use low + (high-low)/2 to avoid overflow in other languages, and still use it for consistency.",
      "Make the interval half-open or closed and stick to one convention.",
    ],
    solutionNotes:
      "State whether the invariant preserves the target inside [low, high] or [low, high). Every branch must shrink the interval. This text is a design note, not an executed test report.",
    concepts: ["invariants-testing-clean-code", "data-structures-complexity"],
  },
  {
    id: "ex-two-complement",
    phaseId: "phase-3",
    title: "Visualize two's complement",
    instructions:
      "Write a program that prints the 8-bit binary representation of int8 values -128 through 127 in a compact form. Then implement negation with bitwise operations and verify it for every non-minimum value. Explain why negating -128 is special.",
    prerequisites: ["Bits and integers"],
    difficulty: "intermediate",
    estimatedMinutes: 35,
    testCases: [
      { name: "Range", expectation: "All 256 bit patterns are printed exactly once." },
      { name: "Negation", expectation: "^x+1 equals -x for all values in range except -128." },
      { name: "Minimum", expectation: "The write-up explains the overflow at -128." },
    ],
    hints: [
      "Format with %08b after converting to uint8.",
      "Use a loop over an int and convert to int8 for each value.",
    ],
    solutionNotes:
      "There is no positive 128 in int8, so negating -128 wraps back to -128. In Go, converting a constant outside the range is a compile error, which is different from runtime wraparound of a typed value.",
    concepts: ["bits-integers", "floating-point"],
  },
  {
    id: "ex-float-format",
    phaseId: "phase-3",
    title: "Inspect floating-point bits",
    instructions:
      "Use math.Float64bits and math.Float64frombits to print the sign, exponent, and fraction fields for values such as 0.1, 1.5, NaN, and infinity. Then demonstrate why 0.1+0.2 != 0.3.",
    prerequisites: ["IEEE 754", "Bit operations"],
    difficulty: "intermediate",
    estimatedMinutes: 40,
    testCases: [
      { name: "Fields", expectation: "Sign, exponent, and fraction are extracted with the correct masks and shifts." },
      { name: "Special values", expectation: "NaN and infinities are identified by exponent and fraction patterns." },
      { name: "Comparison", expectation: "The program shows the rounded sum and an epsilon comparison." },
    ],
    hints: [
      "float64 has 1 sign bit, 11 exponent bits, and 52 fraction bits.",
      "Use math.IsInf and math.IsNaN rather than manual comparisons for logic.",
    ],
    solutionNotes:
      "The exponent is biased by 1023 for normal float64 values. Subnormals need separate handling. Bit inspection is implementation-defined only in the sense that IEEE 754 behavior depends on the platform supporting it; Go uses IEEE 754 formats.",
    concepts: ["floating-point", "bits-integers"],
  },
  {
    id: "ex-stack-growth",
    phaseId: "phase-3",
    title: "Observe stack growth and escape",
    instructions:
      "Write two Go programs: one with a pointer returned from a function and one with a value only used locally. Compile with -gcflags='-m' and record the escape decisions. Then use a benchmark to compare an allocation-heavy and allocation-free version of a helper.",
    prerequisites: ["Escape analysis", "Benchmarks"],
    difficulty: "advanced",
    estimatedMinutes: 50,
    testCases: [
      { name: "Diagnostics", expectation: "The notes quote the relevant escape-analysis output." },
      { name: "Benchmark", expectation: "Allocations per operation are reported for both versions." },
      { name: "Care", expectation: "The write-up does not claim the compiler will always make the same choice." },
    ],
    hints: [
      "Use -benchmem.",
      "Keep inputs identical between versions.",
    ],
    solutionNotes:
      "Escape decisions are compiler-version and platform dependent. A pointer can stay on the stack if the compiler proves it does not outlive the frame. The goal is to learn to read evidence, not to memorize a decision.",
    concepts: ["stack-heap", "escape-analysis-gc"],
  },
  {
    id: "ex-escape-analysis",
    phaseId: "phase-3",
    title: "Close over a counter without leaking",
    instructions:
      "Implement a counter closure and a struct-based counter. Compare their escape behavior, benchmark cost, and API trade-offs. Then design a version that avoids allocation while preserving the required behavior, or explain why allocation is unavoidable.",
    prerequisites: ["Closures", "Escape analysis"],
    difficulty: "advanced",
    estimatedMinutes: 45,
    testCases: [
      { name: "Behavior", expectation: "Both counters produce the same sequence under sequential use." },
      { name: "Evidence", expectation: "Benchmarks show allocations per operation." },
      { name: "Concurrency", expectation: "The write-up states whether the design is safe for concurrent use." },
    ],
    hints: [
      "A closure's captured variable must live as long as the closure.",
      "For concurrency safety, add a mutex or use atomics and document the trade-off.",
    ],
    solutionNotes:
      "If the closure is returned, its captured state must outlive the creating function and is likely heap-allocated. A struct can be embedded in the caller and avoided, but only if the API allows it. Allocation avoidance is not automatically the right design.",
    concepts: ["escape-analysis-gc", "goroutines"],
  },
  {
    id: "ex-logic-gates",
    phaseId: "phase-4",
    title: "Build and verify a full adder",
    instructions:
      "Write a Go simulation of a full adder. Print its truth table, then chain four full adders into a 4-bit ripple-carry adder and test several input pairs against integer addition.",
    prerequisites: ["Boolean logic", "Bits"],
    difficulty: "beginner",
    estimatedMinutes: 30,
    testCases: [
      { name: "Full adder", expectation: "Sum and carry match the truth table for all eight input combinations." },
      { name: "Four bits", expectation: "The ripple-carry result matches modulo 16 addition for all 256 pairs." },
      { name: "Carry", expectation: "The final carry-out is reported separately." },
    ],
    hints: [
      "Sum is XOR of the three inputs; carry-out is the majority.",
      "Test all pairs rather than a few examples.",
    ],
    solutionNotes:
      "A ripple-carry adder is combinational; its delay grows with bit width. This simulation models logic, not timing. The exhaustive test catches wiring errors.",
    concepts: ["logic-circuits", "registers-alu"],
  },
  {
    id: "ex-instruction-trace",
    phaseId: "phase-4",
    title: "Trace a tiny instruction sequence",
    instructions:
      "Write pseudo-assembly for a loop that sums the integers 1 through 5. Trace registers and flags for each iteration. Then explain which parts are architectural state and which would depend on a specific CPU's pipeline.",
    prerequisites: ["Instruction cycle", "Registers"],
    difficulty: "intermediate",
    estimatedMinutes: 35,
    testCases: [
      { name: "Result", expectation: "The final sum register holds 15." },
      { name: "Loop", expectation: "The branch condition terminates at the correct iteration." },
      { name: "Explanation", expectation: "The write-up separates architectural results from microarchitectural timing." },
    ],
    hints: [
      "Use a counter register, an accumulator, and a comparison plus conditional branch.",
      "Track the program counter explicitly at least once.",
    ],
    solutionNotes:
      "Many equivalent instruction sequences exist. The exercise is about state transitions, not a specific ISA encoding. Real branch prediction may change timing but not the architectural result.",
    concepts: ["isa-cpu-cycle", "assembly-machine-code"],
  },
  {
    id: "ex-cache-lines",
    phaseId: "phase-4",
    title: "Demonstrate cache locality",
    instructions:
      "Benchmark sequential versus strided traversal of a large []int. Run multiple sizes and explain the curve using cache lines and prefetching. Then compare []T with a linked list of the same logical size, or a slice of pointers.",
    prerequisites: ["Cache hierarchy", "Benchmarks"],
    difficulty: "advanced",
    estimatedMinutes: 50,
    testCases: [
      { name: "Both correct", expectation: "The sequential and strided traversals visit the same set of elements." },
      { name: "Measurements", expectation: "Benchmarks include several sizes and repeated runs." },
      { name: "Interpretation", expectation: "The notes do not claim a universal cache line size or timing." },
    ],
    hints: [
      "Keep the amount of arithmetic identical; only access order changes.",
      "Pin down CPU, OS, and Go version in your notes.",
    ],
    solutionNotes:
      "Results depend on hardware, cache sizes, prefetchers, and data size. Use the exercise to learn measurement discipline, not to derive a fixed constant. Report medians across runs.",
    concepts: ["cache-memory", "data-structures-complexity"],
  },
  {
    id: "ex-assembly-inspect",
    phaseId: "phase-4",
    title: "Disassemble one Go function",
    instructions:
      "Write a small function with a loop and a function call. Use go build -gcflags='-S' and go tool objdump -s to inspect its assembly. Annotate each instruction you can identify and note anything you cannot explain yet.",
    prerequisites: ["Assembly", "Go toolchain"],
    difficulty: "advanced",
    estimatedMinutes: 50,
    testCases: [
      { name: "Reproducible", expectation: "The notes record the exact Go version and GOARCH." },
      { name: "Annotations", expectation: "Loads, stores, arithmetic, calls, and returns are identified where present." },
      { name: "Honesty", expectation: "Unrecognized instructions are listed as open questions, not guessed." },
    ],
    hints: [
      "Start with -gcflags='-S' output; it is easier to map to source lines.",
      "Compare with a noinline version if inlining hides the function.",
    ],
    solutionNotes:
      "Compiler output changes with version, optimization decisions, and architecture. The exercise teaches inspection. Do not present generated assembly as language semantics.",
    concepts: ["assembly-machine-code", "toolchain"],
  },
  {
    id: "ex-tokenizer",
    phaseId: "phase-5",
    title: "Write a tokenizer with positions",
    instructions:
      "Implement a lexer for a small expression language with numbers, identifiers, + - * /, parentheses, and whitespace. Each token includes a line and column. Report an error for illegal characters and test multi-line input.",
    prerequisites: ["Lexing", "Strings"],
    difficulty: "intermediate",
    estimatedMinutes: 50,
    testCases: [
      { name: "Tokens", expectation: "Valid input produces the expected token sequence ending with EOF." },
      { name: "Positions", expectation: "Token positions point to the first character of each token." },
      { name: "Errors", expectation: "Illegal input returns an error with a position and does not panic." },
    ],
    hints: [
      "Advance a byte index and track line/column updates on newline.",
      "Use unicode.IsLetter and unicode.IsDigit for broader support, or document ASCII-only behavior.",
    ],
    solutionNotes:
      "Decide whether to emit whitespace tokens or skip them; document the choice. Lexical errors are distinct from parse errors. Write table-driven tests for every token class.",
    concepts: ["lexing-parsing", "invariants-testing-clean-code"],
  },
  {
    id: "ex-shunting-yard",
    phaseId: "phase-5",
    title: "Parse expressions with precedence",
    instructions:
      "Implement either recursive descent or the shunting-yard algorithm for infix arithmetic with parentheses. Produce an AST or RPN output and evaluate it. Handle invalid syntax without panicking.",
    prerequisites: ["Parsing", "Recursion", "Stacks"],
    difficulty: "advanced",
    estimatedMinutes: 70,
    testCases: [
      { name: "Precedence", expectation: "2 + 3 * 4 evaluates to 14." },
      { name: "Parentheses", expectation: "(2 + 3) * 4 evaluates to 20." },
      { name: "Errors", expectation: "Missing operands and mismatched parentheses produce errors." },
    ],
    hints: [
      "For recursive descent, use separate functions for expression, term, and factor.",
      "For shunting-yard, maintain operator and output stacks with precedence and associativity.",
    ],
    solutionNotes:
      "Division by zero must be defined as an error for integer evaluation. Unary minus needs a grammar decision. This exercise is the foundation of the interpreter project.",
    concepts: ["lexing-parsing", "interpreters-vms"],
  },
  {
    id: "ex-page-map",
    phaseId: "phase-6",
    title: "Map virtual pages to frames",
    instructions:
      "Simulate a 4-level page table with 4 KiB pages for a 32-bit address space. Translate several virtual addresses, handle a missing mapping, and explain the number of bits used at each level.",
    prerequisites: ["Virtual memory", "Bits"],
    difficulty: "advanced",
    estimatedMinutes: 45,
    testCases: [
      { name: "Field split", expectation: "Page offset uses 12 bits and the remaining bits are split across levels." },
      { name: "Translation", expectation: "Mapped addresses resolve to the correct frame and offset." },
      { name: "Fault", expectation: "Unmapped pages report a page fault rather than reading arbitrary memory." },
    ],
    hints: [
      "With 4 KiB pages, offset = address & 0xFFF and page number = address >> 12.",
      "For four levels, choose how the 20 virtual page bits divide, and document it.",
    ],
    solutionNotes:
      "This is a simplified model. Real x86-64 uses 48 or 57-bit virtual addresses and multi-level tables with permission bits. The exercise teaches translation structure, not a specific MMU implementation.",
    concepts: ["virtual-memory", "bits-integers"],
  },
  {
    id: "ex-syscall-trace",
    phaseId: "phase-6",
    title: "Trace a file read through syscalls",
    instructions:
      "Write a Go program that opens, reads, and closes a file using os and syscall packages where appropriate. On Linux or macOS, use strace/dtruss if available to inspect the syscalls. Explain each transition and why the Go runtime may issue additional calls.",
    prerequisites: ["Syscalls", "File descriptors"],
    difficulty: "advanced",
    estimatedMinutes: 50,
    testCases: [
      { name: "Correct read", expectation: "The program handles short reads and EOF." },
      { name: "Descriptors", expectation: "The file is closed on every return path, including errors." },
      { name: "Trace notes", expectation: "Open, read, and close calls are identified with their results." },
    ],
    hints: [
      "Use defer f.Close() immediately after a successful open.",
      "The trace tool may not be installed; document the attempt and use Go-level evidence otherwise.",
    ],
    solutionNotes:
      "Go's runtime and netpoller can add operations. Descriptor numbers are process-local. Do not claim exact syscall sequences across platforms or Go versions; record the environment.",
    concepts: ["syscalls-io", "filesystems-sync"],
  },
  {
    id: "ex-producer-consumer",
    phaseId: "phase-7",
    title: "Bounded producer-consumer with cancellation",
    instructions:
      "Implement a producer, a bounded worker pool, and a consumer that can be canceled with context. Ensure no goroutine leaks, close channels exactly once, and propagate errors. Run the race detector.",
    prerequisites: ["Goroutines", "Channels", "Context"],
    difficulty: "advanced",
    estimatedMinutes: 60,
    testCases: [
      { name: "All jobs", expectation: "Every produced job is processed when no cancellation occurs." },
      { name: "Cancellation", expectation: "Cancellation returns promptly and no send blocks forever." },
      { name: "Races", expectation: "go test -race reports no data races in the provided tests." },
    ],
    hints: [
      "Separate the goroutine that closes the jobs channel from the producers.",
      "Use a WaitGroup before closing the results channel.",
    ],
    solutionNotes:
      "There are several valid ownership designs. Write down who closes each channel. A buffer alone does not solve shutdown. Test with and without cancellation.",
    concepts: ["goroutines", "channels-select", "context-networking"],
  },
  {
    id: "ex-context-timeout",
    phaseId: "phase-7",
    title: "Deadline propagation across HTTP",
    instructions:
      "Build a server handler that calls an upstream HTTP service with a timeout derived from the incoming request context. Return a clear status on timeout. Test with a deliberately slow test server and verify the client returns promptly.",
    prerequisites: ["Context", "HTTP", "Testing"],
    difficulty: "advanced",
    estimatedMinutes: 50,
    testCases: [
      { name: "Success", expectation: "A fast upstream returns 200 and the body." },
      { name: "Timeout", expectation: "A slow upstream returns 504 and the request ends promptly." },
      { name: "Cleanup", expectation: "No goroutines are left running after the handler returns." },
    ],
    hints: [
      "Use httptest.NewServer for the upstream.",
      "Use NewRequestWithContext, not a context stored in a struct.",
    ],
    solutionNotes:
      "Deriving a timeout from r.Context ensures client disconnects also cancel work. Map errors with errors.Is(err, context.DeadlineExceeded) carefully. Test timing conservatively to avoid flaky tests.",
    concepts: ["context-networking", "servers-concurrency"],
  },
  {
    id: "ex-benchmark-strings",
    phaseId: "phase-7",
    title: "Benchmark string building",
    instructions:
      "Benchmark repeated string concatenation, strings.Builder, and bytes.Buffer for building a 10,000-part string. Report ns/op and allocs/op, then profile the slowest version. Explain the result using allocation and copying behavior.",
    prerequisites: ["Benchmarks", "Profiling", "Strings"],
    difficulty: "intermediate",
    estimatedMinutes: 45,
    testCases: [
      { name: "Equal output", expectation: "All three approaches produce identical final strings." },
      { name: "Allocations", expectation: "Benchmarks report allocations per operation." },
      { name: "Profile", expectation: "The notes include one profile observation, not just intuition." },
    ],
    hints: [
      "Use b.ResetTimer after constructing inputs.",
      "Pre-grow Builder and Buffer when the final size is known.",
    ],
    solutionNotes:
      "Repeated concatenation copies the accumulated string each time. Builder and Buffer amortize growth. Exact numbers depend on hardware and Go version; report your environment.",
    concepts: ["profiling", "go-collections"],
  },
  {
    id: "ex-cli-flags",
    phaseId: "phase-8",
    title: "A testable file statistics CLI",
    instructions:
      "Build a CLI that reports line, word, and byte counts for one or more files. Support a --json flag, read from stdin when no file is given, send diagnostics to stderr, and return non-zero on errors. Make the core logic testable without a subprocess.",
    prerequisites: ["CLI design", "Interfaces", "Testing"],
    difficulty: "intermediate",
    estimatedMinutes: 60,
    testCases: [
      { name: "Files", expectation: "Counts match wc-style expectations for test fixtures." },
      { name: "Stdin", expectation: "Piped input is processed when no file argument is present." },
      { name: "Errors", expectation: "A missing file produces a non-zero exit and a message on stderr." },
    ],
    hints: [
      "Accept io.Reader and io.Writer in the core function.",
      "Use encoding/json for machine-readable output.",
    ],
    solutionNotes:
      "Define word splitting explicitly. Multiple files require per-file errors and possibly a final non-zero status. This exercise is the starting point for the file indexer.",
    concepts: ["cli-tools", "syscalls-io"],
  },
  {
    id: "ex-indexer",
    phaseId: "phase-8",
    title: "Concurrent index with duplicate detection",
    instructions:
      "Extend a file walker to hash regular files concurrently with a bounded worker pool. Group identical files by hash and report groups with more than one path. Handle permission errors and cancellation. Measure throughput on a real directory.",
    prerequisites: ["Filesystem walk", "Goroutines", "Channels"],
    difficulty: "advanced",
    estimatedMinutes: 90,
    testCases: [
      { name: "Duplicates", expectation: "A fixture with known duplicates reports exactly the expected groups." },
      { name: "Bounded", expectation: "The number of in-flight file reads never exceeds the configured limit." },
      { name: "Errors", expectation: "Unreadable files are reported without aborting the whole walk." },
    ],
    hints: [
      "Close the jobs channel after WalkDir returns.",
      "Use a single aggregator goroutine or a mutex around the index map.",
    ],
    solutionNotes:
      "Hash collision probability is negligible for cryptographic hashes but the design should state the assumption. Avoid following symlinks unless explicitly requested. Benchmark before optimizing.",
    concepts: ["file-indexers", "goroutines", "stores-databases"],
  },
];

export function getExerciseById(id: string): Exercise | undefined {
  return seedExercises.find((exercise) => exercise.id === id);
}
