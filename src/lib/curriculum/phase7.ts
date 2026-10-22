import type { Phase } from "@/lib/types";
import { content, lesson, topic } from "./helpers";

const goroutines = topic({
  id: "goroutines",
  phaseId: "phase-7",
  order: 1,
  title: "Goroutines and Worker Pools",
  definition:
    "A goroutine is a lightweight concurrent function execution managed by the Go runtime. A worker pool bounds concurrency by running tasks on a fixed number of workers.",
  summary:
    "Start concurrent work, coordinate lifetimes, and bound resource use with worker pools.",
  difficulty: "intermediate",
  estimatedMinutes: 95,
  keywords: ["goroutines", "worker pools", "concurrency", "WaitGroup", "lifecycle"],
  aliases: ["go statement", "WaitGroup", "task pool", "fan-out", "fan-in"],
  prerequisites: ["go-runtime", "go-flow"],
  related: ["channels-select", "context-networking", "profiling"],
  objectives: [
    "Explain how a goroutine is scheduled and why it is cheap.",
    "Avoid goroutine leaks by defining lifetimes.",
    "Use sync.WaitGroup correctly.",
    "Bound concurrency with a worker pool.",
  ],
  lessons: [
    lesson("start", "Starting goroutines", "The go statement, closures, and lifetimes.", 30),
    lesson("wait", "Waiting and leaking", "WaitGroup, leaks, and shutdown.", 30),
    lesson("pools", "Worker pools", "Bounded queues, backpressure, and results.", 35),
  ],
  content: content({
    what:
      "The go statement starts a function concurrently. The runtime schedules goroutines on OS threads. Goroutines have their own stacks that grow and shrink. A WaitGroup waits for a set of tasks to finish. A worker pool runs jobs from a queue with a fixed number of workers, limiting concurrency.",
    why:
      "Concurrency can improve latency and throughput, but unbounded goroutines can exhaust memory and overwhelm downstream services. Defining ownership and shutdown is essential. Worker pools make resource use explicit and provide backpressure.",
    mentalModel:
      "A goroutine is a task card handed to the runtime. The scheduler decides which card runs. A WaitGroup is a countdown for a batch of cards. A worker pool is a fixed team taking cards from a queue; the queue length and team size control pressure.",
    precise:
      "Goroutines are multiplexed onto OS threads by the runtime. They are not guaranteed to run in parallel; parallelism is bounded by GOMAXPROCS and available CPUs. A WaitGroup's Add must happen before waiting, and a negative counter panics. Closing a channel signals completion but sending on a closed channel panics. A goroutine that blocks forever on a channel or lock is leaked unless something can unblock it. Worker pools usually combine a jobs channel, a results channel, and a WaitGroup or errgroup. `golang.org/x/sync/errgroup` is convenient but is an external module, not standard library.",
    connections:
      "The Go runtime implements scheduling. Channels and context provide coordination. The memory model defines visibility between goroutines. Profiling reveals goroutine leaks and scheduler latency. Networking servers are commonly structured as a goroutine per connection or a worker pool.",
    misconceptions: [
      "Thinking more goroutines always increase throughput.",
      "Forgetting that a loop variable captured by a goroutine can be shared.",
      "Calling WaitGroup.Add inside the goroutine being waited on, creating a race.",
      "Assuming program exit waits for goroutines; main returning terminates the program.",
    ],
    trace: [
      { step: "wg.Add(3)", detail: "Counter becomes 3 before workers are waited on." },
      { step: "go worker(job)", detail: "Each worker runs concurrently and defers wg.Done()." },
      { step: "wg.Wait()", detail: "Blocks until the counter reaches 0." },
    ],
    assessment: [
      "What is a goroutine leak?",
      "Why should WaitGroup.Add happen outside the goroutine?",
      "How does a worker pool provide backpressure?",
      "Does main wait for outstanding goroutines automatically?",
    ],
  }),
  codeExamples: [
    {
      language: "go",
      caption: "A bounded worker pool",
      code: `package main

import (
    "fmt"
    "sync"
)

func main() {
    jobs := make(chan int)
    results := make(chan int)
    var wg sync.WaitGroup

    const workers = 3
    for i := 0; i < workers; i++ {
        wg.Add(1)
        go func(id int) {
            defer wg.Done()
            for job := range jobs {
                results <- job * job
            }
        }(i)
    }

    go func() {
        for i := 1; i <= 5; i++ {
            jobs <- i
        }
        close(jobs)
    }()

    go func() {
        wg.Wait()
        close(results)
    }()

    for r := range results {
        fmt.Println(r)
    }
}`,
    },
  ],
  exerciseIds: ["ex-producer-consumer"],
  promptIds: ["prompt-concurrency", "prompt-code-review", "prompt-project-learning"],
});

const channelsSelect = topic({
  id: "channels-select",
  phaseId: "phase-7",
  order: 2,
  title: "Channels and select",
  definition:
    "A channel is a typed conduit for communication between goroutines. select waits on multiple channel operations and proceeds with one that is ready.",
  summary:
    "Coordinate with channels, understand buffering, and use select for timeouts and cancellation.",
  difficulty: "intermediate",
  estimatedMinutes: 90,
  keywords: ["channels", "select", "buffered channels", "closing", "timeouts"],
  aliases: ["chan", "unbuffered channel", "channel close", "select statement", "default case"],
  prerequisites: ["goroutines"],
  related: ["mutexes-atomics", "context-networking", "profiling"],
  objectives: [
    "Explain blocking behavior for buffered and unbuffered channels.",
    "Close channels safely and detect closure.",
    "Use select for timeouts and cancellation.",
    "Choose channels or shared memory with mutexes deliberately.",
  ],
  lessons: [
    lesson("comm", "Channel communication", "Send, receive, buffering, and blocking.", 30),
    lesson("select", "select", "Multiple cases, defaults, and fairness.", 30),
    lesson("close", "Closing and patterns", "Closure, pipelines, and pitfalls.", 30),
  ],
  content: content({
    what:
      "An unbuffered channel synchronizes sender and receiver: a send blocks until a receive is ready, and vice versa. A buffered channel accepts sends until its buffer is full. Receiving from a closed channel returns the zero value immediately. select chooses among ready channel operations.",
    why:
      "Channels express ownership transfer and coordination, and select enables timeouts and multiplexing. Misuse causes deadlocks, panics, and goroutine leaks. Choosing between channels and mutexes is a central Go design decision.",
    mentalModel:
      "A channel is a handoff point. An unbuffered channel is a direct handshake; a buffered channel is a small shelf. Closing the channel tells everyone no more items are coming, but the shelf may still contain items.",
    precise:
      "Only the sender should close a channel, and only when no more sends will occur. Sending on or closing a closed channel panics. Receiving from a nil channel blocks forever; sending to a nil channel blocks forever. select with no ready cases blocks; with a default it proceeds immediately. If multiple cases are ready, selection is pseudo-random. A closed channel is always ready for receive, returning the zero value and false if assigned to a second variable. Channels are safe for concurrent use.",
    connections:
      "Channels rely on runtime scheduling and memory model synchronization. Pipelines are compositions of stages connected by channels. Context cancellation can be delivered through a Done channel. Profiling can reveal blocked goroutines. Worker pools use channels as queues.",
    misconceptions: [
      "Closing a channel to signal that no more receives are desired.",
      "Assuming buffered channels make a program race-free.",
      "Thinking select picks cases in source order.",
      "Using a nil channel unintentionally and deadlocking.",
    ],
    trace: [
      { step: "ch := make(chan int)", detail: "Unbuffered channel; sends and receives must rendezvous." },
      { step: "go func(){ ch <- 1 }()", detail: "The sender blocks until a receiver is ready." },
      { step: "v := <-ch", detail: "The handoff completes; both proceed." },
      { step: "close(ch)", detail: "Future receives return 0 and ok=false." },
    ],
    assessment: [
      "What happens when receiving from a closed channel?",
      "Who should close a channel?",
      "How does select behave when multiple cases are ready?",
      "When is a mutex a better fit than a channel?",
    ],
  }),
  codeExamples: [
    {
      language: "go",
      caption: "Timeout, cancellation, and safe closure",
      code: `package main

import (
    "fmt"
    "time"
)

func producer(out chan<- int, stop <-chan struct{}) {
    defer close(out)
    for i := 1; ; i++ {
        select {
        case out <- i:
        case <-stop:
            return
        }
    }
}

func main() {
    out := make(chan int)
    stop := make(chan struct{})
    go producer(out, stop)

    timeout := time.After(5 * time.Millisecond)
    for {
        select {
        case v, ok := <-out:
            if !ok {
                return
            }
            fmt.Println("got", v)
        case <-timeout:
            close(stop)
            for range out {
            }
            fmt.Println("stopped")
            return
        }
    }
}`,
    },
  ],
  exerciseIds: ["ex-producer-consumer"],
  promptIds: ["prompt-concurrency", "prompt-trace-code", "prompt-code-review"],
});

const mutexesAtomics = topic({
  id: "mutexes-atomics",
  phaseId: "phase-7",
  order: 3,
  title: "Mutexes, Atomics, and the Go Memory Model",
  definition:
    "A mutex provides mutual exclusion around shared state. Atomic operations provide indivisible reads and writes with defined ordering. The Go memory model specifies when writes become visible to other goroutines.",
  summary:
    "Prevent data races, reason about happens-before, and pick the simplest safe primitive.",
  difficulty: "advanced",
  estimatedMinutes: 100,
  keywords: ["mutexes", "atomic operations", "race conditions", "Go memory model", "data races"],
  aliases: ["sync.Mutex", "RWMutex", "atomic", "happens-before", "race detector"],
  prerequisites: ["goroutines", "channels-select", "filesystems-sync"],
  related: ["profiling", "go-runtime", "context-networking"],
  objectives: [
    "Define a data race and a race condition.",
    "Use mutexes to protect invariants, not individual lines.",
    "Use atomics for simple counters and flags.",
    "Apply happens-before reasoning to a program.",
  ],
  lessons: [
    lesson("races", "Races", "Data races, race conditions, and the race detector.", 30),
    lesson("locks", "Locks", "Mutex, RWMutex, deadlocks, and granularity.", 30),
    lesson("atomics", "Atomics and memory model", "Ordering, visibility, and happens-before.", 40),
  ],
  content: content({
    what:
      "A data race occurs when two goroutines access the same memory concurrently, at least one access is a write, and there is no synchronization. A race condition is a broader correctness bug caused by timing. Mutexes serialize access; atomics perform indivisible operations. The Go memory model defines synchronization operations that create happens-before relationships.",
    why:
      "Concurrent code fails unpredictably when synchronization is wrong. The race detector finds many data races during execution but cannot prove their absence. Understanding happens-before lets you justify visibility and ordering rather than hoping the compiler and CPU behave.",
    mentalModel:
      "A mutex is a room key: only one goroutine enters the critical section at a time. An atomic operation is a turnstile that cannot be split. Happens-before is a chain of guarantees: if A happens before B, B sees A's effects.",
    precise:
      "The Go spec states that a data race is undefined behavior: the program may produce arbitrary results. `sync.Mutex` provides Lock/Unlock; `RWMutex` allows multiple readers or one writer. Unlock of a mutex happens before a subsequent Lock. Sends and receives on a channel are synchronized. `sync/atomic` operations provide atomicity and ordering; use the typed atomic types where possible. Copying a mutex after use is a bug. `go test -race` instruments memory accesses to detect races. Atomics do not make compound operations atomic unless expressed as one atomic operation.",
    connections:
      "The memory model bridges Go semantics and CPU memory ordering. The runtime and hardware may reorder accesses within the rules. Profiling and race detection are empirical tools. Channels are synchronization primitives under the same model. Filesystem and database concurrency face analogous visibility problems.",
    misconceptions: [
      "Thinking a data race can only corrupt a single variable and is otherwise harmless.",
      "Using atomic.AddInt64 for an invariant involving multiple variables.",
      "Assuming RWMutex is always faster than Mutex.",
      "Believing the race detector finds every race.",
    ],
    trace: [
      { step: "x = 1 in goroutine A", detail: "Without synchronization, goroutine B is not guaranteed to see 1." },
      { step: "mu.Lock(); x = 1; mu.Unlock()", detail: "A later Lock by B happens after the Unlock, so B sees x = 1." },
      { step: "atomic.AddInt64(&n, 1)", detail: "The increment is indivisible; concurrent increments are not lost." },
    ],
    assessment: [
      "Define a data race precisely.",
      "Why is copying a used mutex a bug?",
      "What does happens-before guarantee?",
      "When is atomic.AddInt64 insufficient?",
    ],
  }),
  codeExamples: [
    {
      language: "go",
      caption: "Protecting an invariant and using an atomic counter",
      code: `package main

import (
    "fmt"
    "sync"
    "sync/atomic"
)

type Account struct {
    mu      sync.Mutex
    balance int
}

func (a *Account) Deposit(n int) {
    a.mu.Lock()
    defer a.mu.Unlock()
    a.balance += n
}

func (a *Account) Balance() int {
    a.mu.Lock()
    defer a.mu.Unlock()
    return a.balance
}

func main() {
    a := &Account{}
    var wg sync.WaitGroup
    var ops atomic.Int64

    for i := 0; i < 100; i++ {
        wg.Add(1)
        go func() {
            defer wg.Done()
            a.Deposit(10)
            ops.Add(1)
        }()
    }
    wg.Wait()

    fmt.Println(a.Balance(), ops.Load()) // 1000 100
    // go test -race ./...
}`,
    },
  ],
  exerciseIds: [],
  promptIds: ["prompt-concurrency", "prompt-code-review", "prompt-debugging"],
});

const contextNetworking = topic({
  id: "context-networking",
  phaseId: "phase-7",
  order: 4,
  title: "Context, TCP, and HTTP",
  definition:
    "context.Context carries cancellation, deadlines, and request-scoped values across API boundaries. TCP provides reliable ordered byte streams; HTTP is an application protocol layered on top.",
  summary:
    "Build cancelable network operations and understand the stream beneath HTTP.",
  difficulty: "advanced",
  estimatedMinutes: 100,
  keywords: ["context cancellation", "networking", "TCP", "HTTP", "deadlines", "servers"],
  aliases: ["context.Context", "net/http", "net.Dial", "deadline", "connection"],
  prerequisites: ["syscalls-io", "goroutines", "channels-select"],
  related: ["context-networking", "servers-concurrency", "profiling"],
  objectives: [
    "Propagate cancellation and deadlines with context.",
    "Explain TCP's stream abstraction and connection lifecycle.",
    "Build an HTTP handler and client with timeouts.",
    "Avoid leaking request-scoped resources.",
  ],
  lessons: [
    lesson("context", "Cancellation", "Context trees, deadlines, and values.", 30),
    lesson("tcp", "TCP", "Connections, streams, and partial I/O.", 30),
    lesson("http", "HTTP", "Requests, handlers, timeouts, and servers.", 40),
  ],
  content: content({
    what:
      "A context carries a deadline, cancellation signal, and optional values. It forms a tree: canceling a parent cancels descendants. TCP delivers an ordered, reliable byte stream over an IP network, with connection setup and teardown. HTTP defines request/response semantics, methods, headers, and status codes, commonly over TCP.",
    why:
      "Network calls can hang, and servers must stop work when clients disconnect. Deadlines prevent resource exhaustion. TCP's byte-stream nature explains partial reads and message framing. HTTP is the default integration protocol for services and tools.",
    mentalModel:
      "Context is a cancellation signal traveling down a call tree. TCP is a pipe that delivers bytes in order but does not preserve message boundaries. HTTP is a structured conversation over that pipe: a request with headers and a body, then a response.",
    precise:
      "Use context.Background or TODO at the top, derive with WithCancel, WithTimeout, or WithDeadline, and pass it as the first parameter. Do not store contexts in structs or use them for optional parameters. Cancel functions must be called to release resources. A TCP connection is a stream; `Read` may return any positive number of bytes. Message framing requires a length prefix or delimiter. HTTP/1.1 supports persistent connections and pipelining; HTTP/2 multiplexes streams. `http.Server` has ReadHeaderTimeout, ReadTimeout, WriteTimeout, and IdleTimeout. Set timeouts on clients and servers; the zero value often means no timeout. Context values should be request-scoped metadata, not dependency injection.",
    connections:
      "Networking uses syscalls and the netpoller. Goroutines handle concurrent connections. Context connects cancellation to in-flight I/O. HTTP servers connect to operating-system sockets. Profiling and observability reveal latency and connection leaks.",
    misconceptions: [
      "Thinking a TCP read returns exactly one message.",
      "Using context.WithValue for required dependencies.",
      "Forgetting to cancel a derived context and leaking a timer.",
      "Assuming an HTTP client has a default timeout.",
    ],
    trace: [
      { step: "ctx, cancel := context.WithTimeout(...)", detail: "A timer and cancellation channel are created; cancel releases them." },
      { step: "req.WithContext(ctx)", detail: "The request carries the deadline into transport operations." },
      { step: "client.Do(req)", detail: "The transport dials, writes bytes, and reads the response, respecting the context." },
      { step: "deadline exceeded", detail: "The context is canceled; in-flight I/O returns an error." },
    ],
    assessment: [
      "What three things does a context carry?",
      "Why must TCP message boundaries be defined by the application?",
      "Why should contexts not be stored in structs?",
      "Which server timeouts protect against slow clients?",
    ],
  }),
  codeExamples: [
    {
      language: "go",
      caption: "A timeout-aware HTTP handler and client",
      code: `package main

import (
    "context"
    "fmt"
    "io"
    "net/http"
    "time"
)

func main() {
    mux := http.NewServeMux()
    mux.HandleFunc("/hello", func(w http.ResponseWriter, r *http.Request) {
        ctx, cancel := context.WithTimeout(r.Context(), 2*time.Second)
        defer cancel()

        req, _ := http.NewRequestWithContext(ctx, http.MethodGet, "http://example.com", nil)
        resp, err := http.DefaultClient.Do(req)
        if err != nil {
            http.Error(w, err.Error(), http.StatusBadGateway)
            return
        }
        defer resp.Body.Close()

        body, _ := io.ReadAll(io.LimitReader(resp.Body, 1024))
        fmt.Fprintf(w, "status=%d bytes=%d\\n", resp.StatusCode, len(body))
    })

    srv := &http.Server{
        Addr:              ":8080",
        Handler:           mux,
        ReadHeaderTimeout: 2 * time.Second,
        WriteTimeout:      5 * time.Second,
    }
    _ = srv.ListenAndServe()
}`,
    },
  ],
  exerciseIds: ["ex-context-timeout"],
  promptIds: ["prompt-concurrency", "prompt-os", "prompt-code-review"],
});

const profiling = topic({
  id: "profiling",
  phaseId: "phase-7",
  order: 5,
  title: "Benchmarking, Profiling, and pprof",
  definition:
    "Benchmarking measures performance under controlled conditions. Profiling attributes resource use such as CPU time, allocations, and blocking to program locations.",
  summary:
    "Replace guesses with measurements using Go benchmarks, pprof profiles, and execution traces.",
  difficulty: "advanced",
  estimatedMinutes: 100,
  keywords: ["profiling", "benchmarking", "pprof", "allocations", "execution trace", "performance"],
  aliases: ["go test -bench", "CPU profile", "heap profile", "block profile", "trace"],
  prerequisites: ["cache-memory", "go-runtime", "data-structures-complexity"],
  related: ["escape-analysis-gc", "profiling", "data-structures-complexity"],
  objectives: [
    "Write a meaningful Go benchmark.",
    "Collect and read CPU, heap, block, and mutex profiles.",
    "Use execution traces to investigate latency and scheduling.",
    "Avoid common measurement errors.",
  ],
  lessons: [
    lesson("bench", "Benchmarks", "b.N, setup, sub-benchmarks, and allocation reporting.", 30),
    lesson("profiles", "Profiles", "CPU, heap, goroutine, block, and mutex.", 35),
    lesson("trace", "Traces and method", "Latency, scheduling, and avoiding bad experiments.", 35),
  ],
  content: content({
    what:
      "A benchmark runs a function repeatedly and reports time per operation and allocations. A profile samples or records events: CPU time, heap allocation, goroutine stacks, blocking, or mutex contention. An execution trace records scheduler and runtime events over time.",
    why:
      "Optimization without measurement is guesswork. Profiles reveal actual hotspots, allocation sources, and contention. Benchmarks provide regression evidence. Traces expose latency caused by scheduling, GC, and blocking rather than raw CPU work.",
    mentalModel:
      "A benchmark is a controlled experiment. A profile is a heat map of where resources go. A trace is a flight recorder of one run. Each answers a different question; none alone proves production behavior.",
    precise:
      "Go benchmarks use `func BenchmarkX(b *testing.B)` and should exclude expensive setup from the timed loop, or use b.ResetTimer. `b.ReportAllocs` reports allocations. `go test -bench=. -benchmem` enables allocation reporting. CPU and heap profiles can be written with `go test -cpuprofile cpu.out -memprofile mem.out`. Use `go tool pprof` to inspect. `net/http/pprof` exposes runtime profiles from a server; protect it. `runtime/trace` records execution traces, viewable with `go tool trace`. Sampling has overhead and statistical error; multiple runs and realistic inputs matter.",
    connections:
      "Profiling connects algorithms and complexity to real hardware behavior. Escape analysis and allocation profiles reduce GC pressure. Cache behavior shows up as unexplained CPU time. Syscalls and network waits appear in traces and block profiles. Benchmark results inform design trade-offs.",
    misconceptions: [
      "Benchmarking with unrealistic tiny inputs.",
      "Optimizing the fastest function instead of the dominant cost.",
      "Ignoring allocations because the CPU profile looks flat.",
      "Exposing pprof endpoints publicly without authentication.",
    ],
    trace: [
      { step: "go test -bench=BenchmarkJoin -benchmem", detail: "Reports ns/op and allocs/op." },
      { step: "-cpuprofile cpu.out", detail: "Samples CPU stacks during the benchmark." },
      { step: "go tool pprof -http=:0 cpu.out", detail: "Opens an interactive report of hotspots and call graph." },
      { step: "runtime/trace", detail: "Shows goroutine scheduling, GC, and network blocking timelines." },
    ],
    assessment: [
      "What does b.ResetTimer do?",
      "What is the difference between a CPU profile and an execution trace?",
      "Why can a profile on a laptop mislead about production?",
      "Which profile helps investigate lock contention?",
    ],
  }),
  codeExamples: [
    {
      language: "go",
      caption: "A benchmark and profile commands",
      code: `package bench

import (
    "strings"
    "testing"
)

func BenchmarkJoin(b *testing.B) {
    parts := []string{"deep", "systems", "learning"}
    b.ReportAllocs()
    for i := 0; i < b.N; i++ {
        _ = strings.Join(parts, " ")
    }
}

// go test -bench=. -benchmem
// go test -bench=BenchmarkJoin -cpuprofile cpu.out -memprofile mem.out
// go tool pprof -http=:0 cpu.out
// go tool pprof -http=:0 mem.out
//
// Server profiling (protect this endpoint):
// import _ "net/http/pprof"
// go tool pprof http://localhost:6060/debug/pprof/profile?seconds=30`,
    },
  ],
  exerciseIds: ["ex-benchmark-strings"],
  promptIds: ["prompt-profiling", "prompt-code-review"],
});

export const phase7: Phase = {
  id: "phase-7",
  number: 7,
  title: "Advanced Go and Systems Programming",
  tagline: "Concurrency and evidence",
  description:
    "Build concurrent systems with goroutines, channels, synchronization, context, networking, and measurement-driven performance work.",
  objectives: [
    "Design bounded, cancelable concurrent programs.",
    "Reason about data races and the Go memory model.",
    "Build and harden HTTP services.",
    "Use benchmarks, profiles, and traces to guide optimization.",
  ],
  prerequisites: ["Phase 1 Go", "Phase 3 memory", "Phase 6 operating systems"],
  completionCriteria: [
    "One concurrent service passes the race detector.",
    "You can explain a profile of your own program.",
    "You can implement graceful cancellation.",
  ],
  estimatedWeeks: 6,
  keywords: [
    "goroutines", "channels", "select", "mutexes", "atomic operations",
    "race conditions", "Go memory model", "context cancellation",
    "worker pools", "networking", "TCP", "HTTP", "profiling",
    "benchmarking", "pprof",
  ],
  projectIdea: "Build a concurrent file indexer and an HTTP service with graceful shutdown.",
  topics: [goroutines, channelsSelect, mutexesAtomics, contextNetworking, profiling],
};
