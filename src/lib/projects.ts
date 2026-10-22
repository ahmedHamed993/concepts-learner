import type { Project } from "@/lib/types";

export const seedProjects: Project[] = [
  {
    id: "project-cli-calculator",
    phaseId: "phase-1",
    title: "CLI Calculator",
    description:
      "A command-line calculator that parses expressions, reports clear errors, and is tested without a terminal.",
    difficulty: "beginner",
    estimatedHours: 6,
    milestones: [
      {
        id: "milestone-1",
        title: "Single operation",
        description: "Support two operands and one of + - * / through flags or positional arguments.",
        acceptance: [
          "Invalid operands and division by zero produce a clear error.",
          "The run function accepts io.Writer for testability.",
        ],
      },
      {
        id: "milestone-2",
        title: "Expression grammar",
        description: "Parse precedence and parentheses with a recursive-descent parser.",
        acceptance: [
          "2 + 3 * 4 returns 14.",
          "(2 + 3) * 4 returns 20.",
          "Malformed expressions produce a position-aware error.",
        ],
      },
      {
        id: "milestone-3",
        title: "Test suite and README",
        description: "Add table-driven tests and document usage, assumptions, and limitations.",
        acceptance: [
          "Tests cover valid, invalid, and boundary inputs.",
          "The README states that integers are used and division is truncated.",
        ],
      },
    ],
    acceptanceCriteria: [
      "Binary builds and runs on the current platform.",
      "Tests pass when executed by the learner.",
      "Errors go to stderr; results go to stdout.",
    ],
    concepts: ["go-types", "go-flow", "go-errors-packages-testing", "lexing-parsing"],
    exerciseId: "ex-cli-flags",
  },
  {
    id: "project-task-manager",
    phaseId: "phase-1",
    title: "File-Based Task Manager",
    description:
      "A task tracker persisted in a human-readable file, with safe writes and crash-conscious updates.",
    difficulty: "beginner",
    estimatedHours: 10,
    milestones: [
      {
        id: "milestone-1",
        title: "In-memory model",
        description: "Define Task and Store types with add, list, complete, and delete operations.",
        acceptance: [
          "Operations are covered by tests.",
          "Task IDs are stable and unique.",
        ],
      },
      {
        id: "milestone-2",
        title: "Persistence",
        description: "Serialize tasks to JSON and load them on startup with validation.",
        acceptance: [
          "Malformed files produce a recoverable error.",
          "Writes use a temporary file plus rename.",
        ],
      },
      {
        id: "milestone-3",
        title: "CLI and filtering",
        description: "Add commands, filtering by status, and clear usage output.",
        acceptance: [
          "List, add, done, delete, and show work.",
          "Exit codes reflect failures.",
        ],
      },
    ],
    acceptanceCriteria: [
      "Corrupt data is never silently overwritten.",
      "The task file format is documented.",
      "Every command has at least one test or documented manual check.",
    ],
    concepts: ["go-structs-pointers", "go-errors-packages-testing", "filesystems-sync", "cli-tools"],
  },
  {
    id: "project-benchmark",
    phaseId: "phase-2",
    title: "Search and Sort Benchmark",
    description:
      "Implement and compare linear search, binary search, and sorting strategies with reproducible benchmarks.",
    difficulty: "intermediate",
    estimatedHours: 10,
    milestones: [
      {
        id: "milestone-1",
        title: "Correct implementations",
        description: "Implement linear search, binary search, insertion sort, and a standard-library sort wrapper.",
        acceptance: [
          "Tests cover empty, sorted, unsorted, duplicate, and not-found inputs.",
          "The complexity of each implementation is documented.",
        ],
      },
      {
        id: "milestone-2",
        title: "Benchmarks",
        description: "Benchmark across several sizes and input distributions.",
        acceptance: [
          "Benchmarks report ns/op and allocations.",
          "Input generation is excluded from the timed loop.",
        ],
      },
      {
        id: "milestone-3",
        title: "Analysis",
        description: "Write a short report connecting measurements to Big O and memory behavior.",
        acceptance: [
          "The report names the environment and Go version.",
          "At least one measurement contradicts or refines the naive expectation.",
        ],
      },
    ],
    acceptanceCriteria: [
      "Benchmarks are reproducible from the README.",
      "No performance claim is made without a measurement.",
      "Sorting and searching tests are independent.",
    ],
    concepts: ["data-structures-complexity", "invariants-testing-clean-code", "profiling"],
    exerciseId: "ex-complexity-lab",
  },
  {
    id: "project-number-explorer",
    phaseId: "phase-3",
    title: "Number Representation Explorer",
    description:
      "A tool that visualizes integer, floating-point, and byte-level representations and verifies its own conversions.",
    difficulty: "intermediate",
    estimatedHours: 12,
    milestones: [
      {
        id: "milestone-1",
        title: "Integer views",
        description: "Show binary, hex, decimal, signed, and unsigned views for configurable widths.",
        acceptance: [
          "All views agree with independent conversion checks.",
          "Min and max values are handled without panics.",
        ],
      },
      {
        id: "milestone-2",
        title: "Floating point",
        description: "Decompose float32 and float64 into sign, exponent, and fraction.",
        acceptance: [
          "NaN, infinities, zero, and subnormals are labeled.",
          "The UI or CLI documents that IEEE 754 formats are used.",
        ],
      },
      {
        id: "milestone-3",
        title: "Endianness lab",
        description: "Show bytes in little-endian and big-endian order for chosen values.",
        acceptance: [
          "Byte output uses explicit encoding/binary order.",
          "A round-trip test passes for random values.",
        ],
      },
    ],
    acceptanceCriteria: [
      "Conversions are tested against known vectors.",
      "The tool does not dump raw struct memory.",
      "The README explains what each view does and does not prove.",
    ],
    concepts: ["bits-integers", "floating-point", "endianness", "alignment"],
    exerciseId: "ex-two-complement",
  },
  {
    id: "project-data-structures",
    phaseId: "phase-2",
    title: "Data Structure Library",
    description:
      "Implement a stack, queue, ring buffer, binary search tree, and min-heap with tests and complexity notes.",
    difficulty: "intermediate",
    estimatedHours: 18,
    milestones: [
      {
        id: "milestone-1",
        title: "Linear structures",
        description: "Implement stack, queue, and fixed-capacity ring buffer using generics.",
        acceptance: [
          "Empty and full behavior is explicit.",
          "Zero values are usable or clearly documented.",
        ],
      },
      {
        id: "milestone-2",
        title: "Trees and heaps",
        description: "Implement a binary search tree and a min-heap with insert, remove, and traversal where applicable.",
        acceptance: [
          "Ordering invariants are documented and tested.",
          "Randomized tests compare heap operations with a sorted slice reference.",
        ],
      },
      {
        id: "milestone-3",
        title: "Complexity and benchmarks",
        description: "Add complexity tables and benchmarks for core operations.",
        acceptance: [
          "Every operation's expected complexity is listed.",
          "At least two implementations are compared with measurements.",
        ],
      },
    ],
    acceptanceCriteria: [
      "All structures have property-style or randomized tests.",
      "No operation silently ignores invalid input.",
      "Memory retention after removal is considered.",
    ],
    concepts: ["data-structures-complexity", "go-interfaces-generics", "invariants-testing-clean-code"],
    exerciseId: "ex-generic-stack",
  },
  {
    id: "project-file-indexer",
    phaseId: "phase-8",
    title: "Concurrent File Indexer",
    description:
      "Walk a directory tree, index file metadata and hashes, and answer duplicate and search queries.",
    difficulty: "advanced",
    estimatedHours: 24,
    milestones: [
      {
        id: "milestone-1",
        title: "Reliable walk",
        description: "Traverse directories, collect metadata, and report errors without aborting.",
        acceptance: [
          "Symlink behavior is explicit.",
          "Unreadable paths are reported with context.",
        ],
      },
      {
        id: "milestone-2",
        title: "Bounded concurrency",
        description: "Add a bounded worker pool for hashing and support context cancellation.",
        acceptance: [
          "In-flight work never exceeds the configured limit.",
          "Cancellation returns promptly.",
          "go test -race passes for the test suite.",
        ],
      },
      {
        id: "milestone-3",
        title: "Query and persistence",
        description: "Store the index in a versioned format and implement duplicate and substring queries.",
        acceptance: [
          "The index can be reloaded and queried.",
          "The format has a version and a documented schema.",
        ],
      },
      {
        id: "milestone-4",
        title: "Evidence",
        description: "Benchmark a real directory and record a profile or trace.",
        acceptance: [
          "The report includes environment, input size, and one interpreted profile.",
          "Known limitations are listed.",
        ],
      },
    ],
    acceptanceCriteria: [
      "No goroutine leaks under cancellation.",
      "Indexing errors are surfaced, not hidden.",
      "Persistence survives process restart.",
    ],
    concepts: ["file-indexers", "goroutines", "channels-select", "filesystems-sync", "profiling"],
    exerciseId: "ex-indexer",
  },
  {
    id: "project-http-server",
    phaseId: "phase-7",
    title: "HTTP Server",
    description:
      "A small JSON API with middleware, request validation, graceful shutdown, and observability.",
    difficulty: "advanced",
    estimatedHours: 18,
    milestones: [
      {
        id: "milestone-1",
        title: "Handlers and routing",
        description: "Implement health, create, read, and delete endpoints over an in-memory store.",
        acceptance: [
          "Status codes and JSON errors are consistent.",
          "Invalid bodies are rejected with 400.",
        ],
      },
      {
        id: "milestone-2",
        title: "Middleware and limits",
        description: "Add structured logging, panic recovery, body limits, and timeouts.",
        acceptance: [
          "Request bodies over the limit are rejected.",
          "Server timeouts are configured.",
        ],
      },
      {
        id: "milestone-3",
        title: "Shutdown and tests",
        description: "Implement graceful shutdown and httptest-based integration tests.",
        acceptance: [
          "Shutdown waits for in-flight requests up to a deadline.",
          "Tests cover success, invalid input, and cancellation.",
        ],
      },
      {
        id: "milestone-4",
        title: "Observability",
        description: "Add request IDs, structured logs, and a trace ID in responses.",
        acceptance: [
          "Logs can be correlated to requests.",
          "No secrets are logged.",
        ],
      },
    ],
    acceptanceCriteria: [
      "The server does not rely on default timeouts.",
      "All errors have explicit HTTP mappings.",
      "go test -race passes for the test suite.",
    ],
    concepts: ["servers-concurrency", "context-networking", "serialization-distributed"],
  },
  {
    id: "project-key-value",
    phaseId: "phase-8",
    title: "Persistent Key-Value Store",
    description:
      "A crash-conscious key-value store with an append-only log, in-memory index, and recovery.",
    difficulty: "advanced",
    estimatedHours: 28,
    milestones: [
      {
        id: "milestone-1",
        title: "In-memory store",
        description: "Implement Get, Put, Delete, and iteration with a documented concurrency model.",
        acceptance: [
          "Concurrent access is race-free under the race detector.",
          "Deletes are idempotent.",
        ],
      },
      {
        id: "milestone-2",
        title: "Write-ahead log",
        description: "Append length-prefixed, checksummed records and recover state on startup.",
        acceptance: [
          "Truncated records are detected and reported.",
          "Recovery reconstructs the last consistent state.",
        ],
      },
      {
        id: "milestone-3",
        title: "Durability modes",
        description: "Support explicit sync-on-write and batched sync modes.",
        acceptance: [
          "The README states exactly what each mode guarantees.",
          "Mode behavior is covered by tests or documented experiments.",
        ],
      },
      {
        id: "milestone-4",
        title: "Benchmark and limitations",
        description: "Measure write and read throughput and document scalability limits.",
        acceptance: [
          "Benchmarks are reproducible.",
          "Limitations include log growth and lack of compaction.",
        ],
      },
    ],
    acceptanceCriteria: [
      "Durability claims match the implementation.",
      "Corruption is detected, not silently ignored.",
      "The storage format is versioned.",
    ],
    concepts: ["stores-databases", "filesystems-sync", "serialization-distributed"],
  },
  {
    id: "project-interpreter",
    phaseId: "phase-8",
    title: "Simple Interpreter or VM",
    description:
      "A small language with lexing, parsing, evaluation, and either a tree-walking interpreter or a stack VM.",
    difficulty: "advanced",
    estimatedHours: 26,
    milestones: [
      {
        id: "milestone-1",
        title: "Lexer and parser",
        description: "Support arithmetic, variables, assignments, blocks, and if statements.",
        acceptance: [
          "Syntax errors include positions.",
          "The parser produces an inspectable AST or bytecode listing.",
        ],
      },
      {
        id: "milestone-2",
        title: "Evaluator",
        description: "Implement environments, expressions, conditionals, and runtime errors.",
        acceptance: [
          "Scope and shadowing tests pass.",
          "Division by zero and undefined names produce clear errors.",
        ],
      },
      {
        id: "milestone-3",
        title: "Functions or VM",
        description: "Add functions with parameters and return, or implement a stack VM with call frames.",
        acceptance: [
          "Recursive factorial works.",
          "The implementation documents its calling model.",
        ],
      },
      {
        id: "milestone-4",
        title: "Conformance tests",
        description: "Write a suite of programs with expected outputs and errors.",
        acceptance: [
          "The suite runs from one command.",
          "Known missing features are listed.",
        ],
      },
    ],
    acceptanceCriteria: [
      "Language semantics are documented.",
      "Errors are categorized as lexical, syntax, or runtime.",
      "The implementation includes at least one program that exercises recursion.",
    ],
    concepts: ["interpreters-vms", "lexing-parsing", "ast-typechecking", "stack-heap"],
    exerciseId: "ex-shunting-yard",
  },
];
