import type { Phase } from "@/lib/types";
import { content, lesson, topic } from "./helpers";

const cliTools = topic({
  id: "cli-tools",
  phaseId: "phase-8",
  order: 1,
  title: "Command-Line Tools",
  definition:
    "A CLI tool reads arguments, environment, and standard input, performs work, writes output, and returns an exit status. Well-behaved tools compose through streams and clear error reporting.",
  summary:
    "Design commands with flags, stdin/stdout, exit codes, and testable structure.",
  difficulty: "intermediate",
  estimatedMinutes: 75,
  keywords: ["CLI tools", "flags", "stdin", "stdout", "exit codes", "commands"],
  aliases: ["command line", "cobra", "flag package", "pipe", "usage"],
  prerequisites: ["go-errors-packages-testing", "syscalls-io"],
  related: ["file-indexers", "toolchain", "servers-concurrency"],
  objectives: [
    "Parse and validate command-line arguments.",
    "Separate command wiring from business logic.",
    "Use stdin, stdout, stderr, and exit codes correctly.",
    "Test CLI behavior without relying on the real terminal.",
  ],
  lessons: [
    lesson("interface", "Command interface", "Arguments, flags, help, and exit codes.", 25),
    lesson("structure", "Structure", "main package, run functions, and dependency injection.", 25),
    lesson("test", "Testing CLIs", "Buffers, temp dirs, and subprocess tests.", 25),
  ],
  content: content({
    what:
      "A CLI receives arguments and flags, optionally reads stdin, performs an operation, and writes results to stdout or errors to stderr. The process exit code communicates success or failure. Help output is part of the interface.",
    why:
      "CLIs are testable, composable, and scriptable. They are an excellent first systems project because they exercise parsing, I/O, errors, files, and testing without a large UI. Good CLI behavior matters for automation and debugging.",
    mentalModel:
      "A CLI is a function with text in, text out, and a status code. Flags are named parameters; arguments are positional; stdin is a stream input; stdout is the result channel; stderr is the diagnostic channel.",
    precise:
      "Go's flag package parses flags and provides usage output. It stops parsing at the first non-flag by default. Exit codes are conventionally 0 for success and non-zero for failure; specific codes are application-defined unless a platform convention applies. Write diagnostics to stderr so stdout stays machine-readable. `os.Args[0]` is the program name. Avoid calling os.Exit deep in library code; return errors to main. Use io.Reader and io.Writer interfaces for testability. Subprocess tests can exercise argument parsing but are slower and platform-dependent.",
    connections:
      "CLIs cross the syscall boundary for I/O and process exit. Parsing arguments connects to lexing and validation. File tools connect to filesystems and permissions. Indexers and servers can share the same core packages.",
    misconceptions: [
      "Writing logs to stdout and polluting piped output.",
      "Calling os.Exit inside reusable functions, skipping deferred cleanup.",
      "Assuming flag parsing handles subcommands automatically.",
      "Ignoring broken pipe errors when piping to tools like head.",
    ],
    trace: [
      { step: "$ tool --path data --limit 10", detail: "Flags are parsed into typed values." },
      { step: "validate", detail: "Missing required flags produce a clear error and non-zero exit." },
      { step: "work", detail: "The core function writes results to stdout." },
      { step: "exit", detail: "main returns; the process exits with 0 or reports an error with a non-zero status." },
    ],
    assessment: [
      "Why should errors go to stderr?",
      "What does an exit code communicate?",
      "How can a CLI be tested without a real terminal?",
      "Why is os.Exit dangerous inside library code?",
    ],
  }),
  codeExamples: [
    {
      language: "go",
      caption: "A small testable command",
      code: `package main

import (
    "errors"
    "flag"
    "fmt"
    "io"
    "os"
)

func run(args []string, stdout io.Writer) error {
    fs := flag.NewFlagSet("count", flag.ContinueOnError)
    path := fs.String("path", "", "file to read")
    if err := fs.Parse(args); err != nil {
        return err
    }
    if *path == "" {
        return errors.New("--path is required")
    }
    data, err := os.ReadFile(*path)
    if err != nil {
        return err
    }
    fmt.Fprintf(stdout, "bytes=%d\\n", len(data))
    return nil
}

func main() {
    if err := run(os.Args[1:], os.Stdout); err != nil {
        fmt.Fprintln(os.Stderr, "error:", err)
        os.Exit(1)
    }
}`,
    },
  ],
  exerciseIds: ["ex-cli-flags"],
  promptIds: ["prompt-project-learning", "prompt-code-review"],
});

const fileIndexers = topic({
  id: "file-indexers",
  phaseId: "phase-8",
  order: 2,
  title: "File Indexers",
  definition:
    "A file indexer walks a directory tree, extracts information from files, and stores it for fast querying. It must handle I/O errors, large trees, concurrency, and incremental updates.",
  summary:
    "Walk, extract, index, and query a filesystem safely and concurrently.",
  difficulty: "advanced",
  estimatedMinutes: 100,
  keywords: ["file indexers", "filesystem walk", "concurrency", "incremental indexing", "search"],
  aliases: ["crawler", "walker", "index", "inverted index", "filepath.WalkDir"],
  prerequisites: ["cli-tools", "filesystems-sync", "goroutines"],
  related: ["stores-databases", "profiling", "servers-concurrency"],
  objectives: [
    "Walk a directory tree with correct error handling.",
    "Design a bounded concurrent pipeline.",
    "Choose an index representation.",
    "Handle changes and failures without corrupting results.",
  ],
  lessons: [
    lesson("walk", "Walking a tree", "Traversal, symlinks, permissions, and errors.", 30),
    lesson("pipeline", "Concurrent extraction", "Bounded workers, backpressure, and cancellation.", 35),
    lesson("index", "Indexing", "In-memory maps, inverted indexes, and persistence.", 35),
  ],
  content: content({
    what:
      "An indexer traverses directories, reads file metadata and content, transforms it into index entries, and stores those entries. A typical pipeline has a walker, a bounded worker pool, and an index writer. Queries use the index rather than rescanning the filesystem.",
    why:
      "Indexers exercise nearly every systems skill: filesystem semantics, syscalls, concurrency, error handling, data structures, persistence, and performance. Search tools, code navigation, and backup systems depend on them.",
    mentalModel:
      "The walker is a scout listing locations. Workers are specialists extracting information. The index is a library catalog. The query engine reads the catalog instead of walking the shelves.",
    precise:
      "Use filepath.WalkDir for lexical traversal; it reports paths and DirEntry values. Symlink behavior must be explicit to avoid cycles. Permission errors should be recorded, not silently ignored. Bounded concurrency prevents file descriptor exhaustion and memory spikes. Cancellation should stop the pipeline promptly. An in-memory inverted index maps terms to document IDs and positions; persistence requires a format with versioning and crash safety. Incremental indexing needs stable file identity, modification times, and content hashes. Directory traversal order is lexical for WalkDir, not guaranteed to reflect creation order.",
    connections:
      "The indexer uses syscalls and filesystem metadata. Concurrency uses goroutines and channels. Search performance depends on data structures and memory layout. Profiling and observability are needed for large trees. A server can expose queries over HTTP.",
    misconceptions: [
      "Following symlinks blindly and creating cycles.",
      "Ignoring partial file reads and files changing during indexing.",
      "Spawning one goroutine per file without bounds.",
      "Assuming file modification time always changes when content changes.",
    ],
    trace: [
      { step: "walk root", detail: "Emit file paths to a channel; skip ignored directories." },
      { step: "worker reads file", detail: "Extract text or metadata; handle read errors per file." },
      { step: "index writer", detail: "Update the catalog under a mutex or single writer goroutine." },
      { step: "query", detail: "Look up terms in the index and return ranked results." },
    ],
    assessment: [
      "Why is bounded concurrency important in an indexer?",
      "How can symlinks create traversal cycles?",
      "What makes an index incrementally updatable?",
      "How would you test an indexer's error handling?",
    ],
  }),
  codeExamples: [
    {
      language: "go",
      caption: "A bounded walk-and-hash pipeline",
      code: `package main

import (
    "crypto/sha256"
    "fmt"
    "io/fs"
    "os"
    "path/filepath"
    "sync"
)

type result struct {
    path string
    sum  [32]byte
}

func main() {
    root := "."
    jobs := make(chan string)
    results := make(chan result)
    var wg sync.WaitGroup

    for i := 0; i < 4; i++ {
        wg.Add(1)
        go func() {
            defer wg.Done()
            for path := range jobs {
                data, err := os.ReadFile(path)
                if err != nil {
                    fmt.Fprintln(os.Stderr, "skip", path, err)
                    continue
                }
                results <- result{path: path, sum: sha256.Sum256(data)}
            }
        }()
    }

    go func() {
        filepath.WalkDir(root, func(path string, d fs.DirEntry, err error) error {
            if err != nil {
                return nil
            }
            if !d.IsDir() && d.Type().IsRegular() {
                jobs <- path
            }
            return nil
        })
        close(jobs)
        wg.Wait()
        close(results)
    }()

    seen := map[[32]byte][]string{}
    for r := range results {
        seen[r.sum] = append(seen[r.sum], r.path)
    }
    for _, paths := range seen {
        if len(paths) > 1 {
            fmt.Println(paths)
        }
    }
}`,
    },
  ],
  exerciseIds: ["ex-indexer"],
  promptIds: ["prompt-project-learning", "prompt-concurrency", "prompt-profiling"],
});

const interpretersVms = topic({
  id: "interpreters-vms",
  phaseId: "phase-8",
  order: 3,
  title: "Interpreters and Virtual Machines",
  definition:
    "An interpreter executes a program representation directly. A virtual machine executes bytecode with its own instruction set, operand stack or registers, and runtime state.",
  summary:
    "Turn parsed code into evaluation, then bytecode, with tests for semantics and errors.",
  difficulty: "advanced",
  estimatedMinutes: 110,
  keywords: ["interpreters", "virtual machines", "bytecode", "execution loop", "stack machine"],
  aliases: ["tree-walking interpreter", "VM", "bytecode compiler", "opcode", "stack machine"],
  prerequisites: ["lexing-parsing", "ast-typechecking", "stack-heap"],
  related: ["toolchain", "cli-tools", "stores-databases"],
  objectives: [
    "Evaluate an AST with an environment.",
    "Design a small bytecode instruction set.",
    "Implement a fetch-decode-execute loop.",
    "Test language semantics and runtime errors.",
  ],
  lessons: [
    lesson("tree", "Tree-walking", "Environments, scopes, and evaluation.", 35),
    lesson("bytecode", "Bytecode", "Instructions, stack, and control flow.", 40),
    lesson("semantics", "Semantics", "Errors, recursion, and conformance tests.", 35),
  ],
  content: content({
    what:
      "A tree-walking interpreter evaluates AST nodes recursively, using an environment for variable bindings. A bytecode compiler lowers an AST to a linear instruction sequence. A VM executes that sequence with a program counter and operand stack, handling calls, branches, and errors.",
    why:
      "Interpreters and VMs make language semantics concrete. They teach dispatch, state, control flow, and memory. Building one is a milestone systems project that connects parsing, data structures, and execution.",
    mentalModel:
      "A tree-walking interpreter is a reader following a sentence structure. A VM is a tiny CPU: fetch the next opcode, update the stack, and repeat. The environment or stack is its working memory.",
    precise:
      "Bytecode instructions are usually one byte for the opcode plus operands. A stack machine pushes and pops operands; a register machine targets virtual registers. Call frames store return addresses, locals, and arguments. Error handling must distinguish parse, type, and runtime errors. Garbage collection is unnecessary for short-lived toy interpreters but becomes necessary for general allocation. Tail calls, closures, and lexical scope require careful design. Exact designs are implementation choices; language semantics must be specified and tested.",
    connections:
      "Parsing provides the AST. The VM resembles the CPU execution cycle and stack frames. Environments connect to memory models. Testing language semantics mirrors compiler conformance suites. Serializing bytecode connects to storage formats.",
    misconceptions: [
      "Thinking a VM is necessarily a full hardware emulator.",
      "Ignoring lexical scope when implementing closures.",
      "Forgetting to validate stack depth and operand types.",
      "Treating parse errors and runtime errors as the same category.",
    ],
    trace: [
      { step: "compile 2 + 3 * 4", detail: "Emit PUSH 2, PUSH 3, PUSH 4, MUL, ADD." },
      { step: "execute PUSH", detail: "Push each literal onto the operand stack." },
      { step: "execute MUL", detail: "Pop 3 and 4, push 12." },
      { step: "execute ADD", detail: "Pop 2 and 12, push 14." },
    ],
    assessment: [
      "How does a stack machine differ from a register machine?",
      "What belongs in a call frame?",
      "Why are conformance tests essential for a language implementation?",
      "When does a toy interpreter need garbage collection?",
    ],
  }),
  codeExamples: [
    {
      language: "go",
      caption: "A bytecode stack machine for arithmetic",
      code: `package main

import "fmt"

type op byte

const (
    push op = iota
    add
    mul
    print
)

type instr struct {
    code op
    arg  int
}

func run(program []instr) {
    stack := []int{}
    for pc := 0; pc < len(program); pc++ {
        in := program[pc]
        switch in.code {
        case push:
            stack = append(stack, in.arg)
        case add:
            b, a := stack[len(stack)-1], stack[len(stack)-2]
            stack = append(stack[:len(stack)-2], a+b)
        case mul:
            b, a := stack[len(stack)-1], stack[len(stack)-2]
            stack = append(stack[:len(stack)-2], a*b)
        case print:
            fmt.Println(stack[len(stack)-1])
        }
    }
}

func main() {
    run([]instr{
        {push, 2}, {push, 3}, {push, 4}, {mul}, {add}, {print},
    }) // 14
}`,
    },
  ],
  exerciseIds: ["ex-shunting-yard"],
  promptIds: ["prompt-project-learning", "prompt-compiler-assembly", "prompt-deep-tutor"],
});

const serversConcurrency = topic({
  id: "servers-concurrency",
  phaseId: "phase-8",
  order: 4,
  title: "HTTP Servers and Concurrent Workers",
  definition:
    "A server accepts requests, dispatches work, and returns responses. Concurrent workers process independent units of work while sharing bounded resources.",
  summary:
    "Design a production-shaped HTTP service with timeouts, limits, shutdown, and observability.",
  difficulty: "advanced",
  estimatedMinutes: 110,
  keywords: ["HTTP servers", "concurrent workers", "graceful shutdown", "middleware", "rate limits"],
  aliases: ["net/http server", "handler", "middleware", "graceful shutdown", "backpressure"],
  prerequisites: ["context-networking", "goroutines", "channels-select"],
  related: ["stores-databases", "profiling", "context-networking"],
  objectives: [
    "Build handlers with explicit error mapping.",
    "Apply timeouts, limits, and graceful shutdown.",
    "Separate transport concerns from domain logic.",
    "Observe requests with logs and metrics.",
  ],
  lessons: [
    lesson("handlers", "Handlers and middleware", "Routing, errors, and middleware composition.", 35),
    lesson("limits", "Limits and shutdown", "Timeouts, body limits, and graceful stop.", 35),
    lesson("workers", "Background workers", "Queues, retries, and shutdown coordination.", 40),
  ],
  content: content({
    what:
      "An HTTP server maps requests to handlers. Handlers validate input, call domain logic, and write a response. Middleware wraps handlers for cross-cutting concerns. Background workers process asynchronous tasks from a bounded queue. Graceful shutdown stops accepting new work and waits for in-flight operations.",
    why:
      "Most systems eventually expose a network interface. Correct servers require limits and cancellation to survive load and failures. Separating transport from domain logic makes testing and reuse practical.",
    mentalModel:
      "The server is a receptionist: it receives requests, checks the form, routes to a specialist, and returns an answer. Workers are back-office staff processing a queue. Shutdown is a closing procedure: stop accepting visitors, finish current business, then lock up.",
    precise:
      "http.ServeMux routes by path patterns in modern Go. `http.MaxBytesReader` limits request bodies. Always set server timeouts; default zero values can hang. Handlers should respect `r.Context()` cancellation. Use `http.Server.Shutdown` with a context deadline for graceful shutdown, and signal handling via os/signal. Middleware is a function that wraps an http.Handler. Background workers need their own context and WaitGroup. Do not write to a ResponseWriter from multiple goroutines. Map domain errors to HTTP status codes explicitly; never leak internals in production responses.",
    connections:
      "Servers sit on TCP and HTTP, use goroutines per request, and depend on context cancellation. Storage-backed services connect to key-value stores and databases. Observability uses logs, metrics, and traces. Profiling reveals handler hotspots and lock contention.",
    misconceptions: [
      "Relying on default timeouts.",
      "Writing partial errors after headers have been sent.",
      "Blocking shutdown forever because a worker ignores context.",
      "Treating middleware as business logic.",
    ],
    trace: [
      { step: "request arrives", detail: "The server accepts a connection and dispatches to the handler chain." },
      { step: "middleware", detail: "Logging, recovery, and limits run around the handler." },
      { step: "handler", detail: "Validate, call domain logic with request context, write status and body." },
      { step: "SIGTERM", detail: "Shutdown stops new connections and waits for active handlers." },
    ],
    assessment: [
      "Why are server timeouts essential?",
      "How does graceful shutdown work?",
      "Why must domain errors be mapped explicitly?",
      "What happens if a worker ignores its context during shutdown?",
    ],
  }),
  codeExamples: [
    {
      language: "go",
      caption: "Limited handler, middleware, and graceful shutdown",
      code: `package main

import (
    "context"
    "encoding/json"
    "log"
    "net/http"
    "os"
    "os/signal"
    "time"
)

type response struct {
    OK bool \`json:"ok"\`
}

func logging(next http.Handler) http.Handler {
    return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
        start := time.Now()
        next.ServeHTTP(w, r)
        log.Printf("%s %s %s", r.Method, r.URL.Path, time.Since(start))
    })
}

func main() {
    mux := http.NewServeMux()
    mux.HandleFunc("GET /healthz", func(w http.ResponseWriter, r *http.Request) {
        w.Header().Set("Content-Type", "application/json")
        json.NewEncoder(w).Encode(response{OK: true})
    })

    srv := &http.Server{
        Addr:              ":8080",
        Handler:           logging(mux),
        ReadHeaderTimeout: 2 * time.Second,
        ReadTimeout:       5 * time.Second,
        WriteTimeout:      10 * time.Second,
        IdleTimeout:       60 * time.Second,
    }

    go func() {
        if err := srv.ListenAndServe(); err != nil && err != http.ErrServerClosed {
            log.Fatal(err)
        }
    }()

    stop := make(chan os.Signal, 1)
    signal.Notify(stop, os.Interrupt)
    <-stop

    ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
    defer cancel()
    if err := srv.Shutdown(ctx); err != nil {
        log.Fatal(err)
    }
}`,
    },
  ],
  exerciseIds: [],
  promptIds: ["prompt-project-learning", "prompt-code-review", "prompt-profiling"],
});

const storesDatabases = topic({
  id: "stores-databases",
  phaseId: "phase-8",
  order: 5,
  title: "Key-Value Stores and Databases",
  definition:
    "A key-value store maps keys to values. A database adds structured queries, transactions, durability, and concurrency control. Storage engines organize data in memory and on disk.",
  summary:
    "Design persistence, crash safety, and query behavior for a small store.",
  difficulty: "advanced",
  estimatedMinutes: 110,
  keywords: ["key-value stores", "databases", "persistence", "transactions", "storage engines"],
  aliases: ["KV store", "B-tree", "LSM tree", "write-ahead log", "durability", "isolation"],
  prerequisites: ["filesystems-sync", "data-structures-complexity", "mutexes-atomics"],
  related: ["serialization-distributed", "syscalls-io", "profiling"],
  objectives: [
    "Choose an in-memory or on-disk data structure.",
    "Explain durability and crash recovery.",
    "Reason about atomicity and isolation.",
    "Design a persistence format with versioning.",
  ],
  lessons: [
    lesson("engine", "Storage engines", "Hash indexes, B-trees, and LSM trees.", 35),
    lesson("durability", "Durability", "Append logs, fsync, and recovery.", 35),
    lesson("transactions", "Concurrency", "Locks, MVCC, and isolation levels.", 40),
  ],
  content: content({
    what:
      "A key-value store exposes Get, Put, and Delete over opaque keys. Persistence can use an append-only log, a hash index, a B-tree, or an LSM tree. Transactions group operations with atomicity, consistency, isolation, and durability guarantees. Databases layer schemas, indexes, and query languages over storage.",
    why:
      "Storage is where correctness and durability become visible. A store must define what happens after a crash, what concurrent readers see, and when a write is durable. These questions recur in every backend system.",
    mentalModel:
      "A write-ahead log is a diary written before action: replay it after a crash to restore state. An in-memory index is a catalog for fast lookup. A transaction is an all-or-nothing envelope around operations.",
    precise:
      "An append-only log plus an in-memory index is simple but grows unbounded without compaction. B-trees favor read-heavy workloads and in-place updates; LSM trees buffer writes in memory and periodically merge sorted files. fsync controls durability relative to the OS page cache and device cache. Isolation levels define which interleavings are permitted; serializable is strongest but costly. MVCC keeps versions for concurrent readers. A checksummed log record with a length prefix supports detection of torn writes. Version the file format and include a schema marker.",
    connections:
      "Persistence uses syscalls, fsync, and filesystem atomicity. Concurrency uses mutexes or single-writer goroutines. Data structures determine complexity. Serialization formats determine compatibility. Observability reveals latency and recovery behavior.",
    misconceptions: [
      "Assuming an in-memory map survives process exit.",
      "Thinking a write is durable once the syscall returns.",
      "Believing transactions eliminate all concurrency bugs outside the database.",
      "Ignoring torn writes and partial log records.",
    ],
    trace: [
      { step: "Put(k,v)", detail: "Append a length-prefixed, checksummed record to the log." },
      { step: "fsync", detail: "Request durability; the OS flushes buffered data to the device." },
      { step: "update memory", detail: "Apply the record to the in-memory index." },
      { step: "recover", detail: "Replay valid log records; stop at corruption and report it." },
    ],
    assessment: [
      "What does a write-ahead log enable?",
      "Compare B-trees and LSM trees.",
      "What does fsync guarantee?",
      "How would you detect a partially written record?",
    ],
  }),
  codeExamples: [
    {
      language: "go",
      caption: "A tiny durable append-only store",
      code: `package main

import (
    "bufio"
    "encoding/json"
    "fmt"
    "os"
)

type record struct {
    Key   string \`json:"key"\`
    Value string \`json:"value"\`
    Del   bool   \`json:"del,omitempty"\`
}

func main() {
    f, _ := os.OpenFile("store.log", os.O_CREATE|os.O_APPEND|os.O_RDWR, 0o600)
    defer f.Close()

    enc := json.NewEncoder(f)
    _ = enc.Encode(record{Key: "lang", Value: "go"})
    _ = f.Sync()

    if _, err := f.Seek(0, 0); err != nil {
        panic(err)
    }
    sc := bufio.NewScanner(f)
    state := map[string]string{}
    for sc.Scan() {
        var r record
        if err := json.Unmarshal(sc.Bytes(), &r); err != nil {
            fmt.Println("stop at corruption:", err)
            break
        }
        if r.Del {
            delete(state, r.Key)
        } else {
            state[r.Key] = r.Value
        }
    }
    fmt.Println(state) // map[lang:go]
}`,
    },
  ],
  exerciseIds: [],
  promptIds: ["prompt-project-learning", "prompt-code-review", "prompt-os"],
});

const serializationDistributed = topic({
  id: "serialization-distributed",
  phaseId: "phase-8",
  order: 6,
  title: "Serialization, Observability, and Distributed Systems",
  definition:
    "Serialization converts data structures to a stable byte representation and back. Observability uses logs, metrics, and traces to understand system behavior. Distributed systems coordinate independent machines over unreliable networks.",
  summary:
    "Make data portable, systems visible, and distributed behavior understandable.",
  difficulty: "advanced",
  estimatedMinutes: 100,
  keywords: ["serialization", "performance analysis", "observability", "distributed systems", "logs", "metrics", "traces"],
  aliases: ["JSON", "protobuf", "gob", "OpenTelemetry", "tracing", "eventual consistency"],
  prerequisites: ["stores-databases", "syscalls-io", "context-networking"],
  related: ["servers-concurrency", "profiling", "toolchain"],
  objectives: [
    "Choose a serialization format for a use case.",
    "Add structured logs, metrics, and traces.",
    "Explain the basic failure modes of distributed systems.",
    "Design for idempotency and retries.",
  ],
  lessons: [
    lesson("serial", "Serialization", "Formats, compatibility, and performance.", 35),
    lesson("observe", "Observability", "Logs, metrics, traces, and correlation.", 30),
    lesson("distributed", "Distributed systems", "Partitions, retries, consistency, and idempotency.", 35),
  ],
  content: content({
    what:
      "Serialization maps structured values to bytes with an explicit schema or conventions. Observability is the ability to infer internal state from outputs. Distributed systems are multiple programs coordinating over a network, where latency, partial failure, and message duplication are normal.",
    why:
      "Data outlives programs, so compatibility matters. Systems fail in ways that logs alone cannot explain. Distributed designs must tolerate retries and partitions. These topics turn individual programs into reliable services.",
    mentalModel:
      "Serialization is writing a contract in a common language. Observability is instrumentation on a machine: dials, gauges, and a flight recorder. Distributed systems are a team working by mail: letters can be late, lost, or delivered twice.",
    precise:
      "JSON is human-readable and flexible but loses type precision and is verbose. encoding/gob is Go-specific and not stable across unrelated programs or versions. Protobuf uses schemas and field numbers for forward/backward compatibility. Use explicit byte order for binary formats and version your data. Structured logs are key-value events; metrics are aggregated numeric time series; traces follow a request across services via trace IDs and spans. Distributed systems face the CAP trade-off and partial failure. Retries require idempotency keys and bounded backoff. Clocks are not perfectly synchronized. Exactly-once delivery is generally implemented as at-least-once plus deduplication.",
    connections:
      "Serialization interacts with endianness, alignment, and schema versioning. Observability depends on context propagation. Distributed coordination builds on networking and timeouts. Storage systems need recovery and consistency reasoning. Profiling is a local, high-detail form of observability.",
    misconceptions: [
      "Assuming gob is a portable interchange format.",
      "Logging unstructured strings with no request context.",
      "Retrying non-idempotent operations without deduplication.",
      "Assuming a network timeout means the remote operation did not happen.",
    ],
    trace: [
      { step: "client request", detail: "A trace ID is created and propagated with the request." },
      { step: "service logs", detail: "Structured events include trace and span IDs." },
      { step: "metrics", detail: "Counters and histograms record request rate, errors, and latency." },
      { step: "retry", detail: "A timed-out request is retried with the same idempotency key." },
    ],
    assessment: [
      "Why is JSON sometimes a poor choice for high-volume internal RPC?",
      "What is the difference between logs, metrics, and traces?",
      "Why can a timeout be ambiguous?",
      "How do idempotency keys help with retries?",
    ],
  }),
  codeExamples: [
    {
      language: "go",
      caption: "Versioned JSON and request correlation",
      code: `package main

import (
    "encoding/json"
    "fmt"
    "log/slog"
    "os"
)

type Event struct {
    Version int    \`json:"v"\`
    TraceID string \`json:"trace_id"\`
    Name    string \`json:"name"\`
}

func main() {
    logger := slog.New(slog.NewJSONHandler(os.Stdout, nil))
    ev := Event{Version: 1, TraceID: "abc123", Name: "index.started"}
    logger.Info("event", "trace_id", ev.TraceID, "name", ev.Name)

    data, _ := json.Marshal(ev)
    var decoded Event
    if err := json.Unmarshal(data, &decoded); err != nil {
        panic(err)
    }
    fmt.Println(decoded.TraceID)
}`,
    },
  ],
  exerciseIds: [],
  promptIds: ["prompt-project-learning", "prompt-code-review", "prompt-profiling"],
});

export const phase8: Phase = {
  id: "phase-8",
  number: 8,
  title: "Systems Projects",
  tagline: "Build the real thing",
  description:
    "Integrate everything into real systems: CLI tools, indexers, interpreters, servers, stores, serialization, and distributed concerns.",
  objectives: [
    "Ship complete systems with tests and documentation.",
    "Apply concurrency, persistence, and observability deliberately.",
    "Measure and explain performance trade-offs.",
    "Write design notes that connect code to computer science.",
  ],
  prerequisites: ["Phases 1–7, especially Go concurrency and operating systems"],
  completionCriteria: [
    "At least three projects are complete with tests.",
    "One project includes profiling or tracing evidence.",
    "Every project has written design notes and known limitations.",
  ],
  estimatedWeeks: 8,
  keywords: [
    "CLI tools", "file indexers", "interpreters", "virtual machines",
    "HTTP servers", "concurrent workers", "key-value stores", "databases",
    "serialization", "performance analysis", "observability", "distributed systems",
  ],
  projectIdea: "Choose a project, define milestones, and ship it with evidence.",
  topics: [
    cliTools,
    fileIndexers,
    interpretersVms,
    serversConcurrency,
    storesDatabases,
    serializationDistributed,
  ],
};
