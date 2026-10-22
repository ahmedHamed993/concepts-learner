import { concept, ex, ref } from "./types";

export const concurrencyConcepts = [
  concept({
    id: "conc-models",
    categoryId: "concurrency",
    order: 1,
    name: "Concurrency Models and Execution",
    description:
      "Compare processes, threads, goroutines, and event loops by what runs concurrently, how state is shared, and what the scheduler controls.",
    difficulty: "advanced",
    prerequisiteIds: ["go-goroutines", "os-threads", "os-scheduling"],
    relatedIds: ["go-channels", "net-concurrency-parallelism", "os-context-switch"],
    model:
      "A concurrency model is a contract about independent activities: who schedules them, what memory they share, and how they communicate.",
    formal:
      "Concurrency is the interleaving of independent activities; parallelism is simultaneous execution on multiple cores. Processes isolate address spaces, threads share an address space, goroutines are runtime-scheduled stacks multiplexed over OS threads, and event loops interleave callbacks on one thread.",
    internals:
      "The Go runtime schedules goroutines onto a pool of OS threads using local run queues and work stealing; blocking system calls hand off the thread so other goroutines can run. The OS scheduler, in turn, decides which runnable threads receive CPU time.",
    example:
      "Ten thousand goroutines can share a few OS threads because each goroutine starts with a small growable stack; ten thousand processes would each carry an address space and kernel process state.",
    connections:
      "Threads are an operating-system abstraction, channels are a Go communication mechanism, and cache coherence determines the cost of sharing memory across cores.",
    mistakes:
      "Do not equate concurrency with parallelism; do not assume goroutines are OS threads; do not share mutable state without a synchronization argument; do not treat an event loop as free of blocking hazards.",
    practice:
      "Model the same workload as processes, threads, goroutines, and an event loop, then compare isolation, scheduling cost, and failure modes.",
    exercises: [
      ex(
        "Map a workload onto four concurrency models",
        "Take a workload that reads many files and computes a digest for each. Describe implementations using processes, OS threads, goroutines, and a single-threaded event loop. For each model, state what is shared, what the scheduler controls, and where blocking occurs.",
        [
          "Distinguish concurrency from parallelism.",
          "Identify the scheduler and shared state for each model.",
        ],
        [
          "Cover all four models.",
          "Name shared and isolated state explicitly.",
          "Explain one blocking hazard per model.",
        ],
        [
          "Each model has a coherent execution story.",
          "The classifier correctly separates isolation from scheduling.",
          "Blocking behavior is tied to the underlying mechanism.",
        ],
        [
          "Processes do not share an address space by default.",
          "Goroutines share memory but are scheduled by the Go runtime.",
          "A blocking call in an event loop stalls unrelated work.",
        ],
        "advanced",
        [
          "Ask what the unit of scheduling is in each model.",
          "Separate memory isolation from CPU scheduling.",
        ],
        "Processes isolate memory, threads share it under OS scheduling, goroutines share it under runtime scheduling, and event loops multiplex tasks without preemptive parallelism.",
      ),
      ex(
        "Measure a concurrency-versus-parallelism claim",
        "Write a Go program that performs CPU-bound work over N items. Run it with GOMAXPROCS(1) and GOMAXPROCS(4), then repeat with a workload that sleeps instead of computing. Explain why the two workloads scale differently.",
        [
          "Relate GOMAXPROCS to parallel execution.",
          "Separate CPU-bound from blocking workloads.",
        ],
        [
          "Measure wall-clock time for both settings.",
          "Use at least two workload sizes.",
          "Explain goroutine scheduling during sleeps.",
        ],
        [
          "CPU-bound results show parallelism when GOMAXPROCS increases.",
          "Sleeping work overlaps without using multiple cores.",
          "The explanation references the scheduler and blocking.",
        ],
        [
          "GOMAXPROCS bounds simultaneous Go code execution, not goroutine count.",
          "Sleeping goroutines yield their thread.",
          "CPU-bound goroutines compete for available threads.",
        ],
        "advanced",
        [
          "Use `time.Now` around the whole workload.",
          "Keep the item count fixed when comparing settings.",
        ],
        "Concurrency lets blocked work overlap on one thread, while parallelism requires multiple runnable threads and available cores.",
      ),
    ],
    projectRefs: [
      ref(
        "scheduler-simulator",
        "m-thread",
        "Model threads, run queues, and context switches to compare concurrency models.",
      ),
    ],
  }),
  concept({
    id: "conc-races",
    categoryId: "concurrency",
    order: 2,
    name: "Data Races and Memory Ordering",
    description:
      "Reason about conflicting accesses, happens-before edges, race detection, and the memory-ordering assumptions behind synchronization.",
    difficulty: "advanced",
    prerequisiteIds: [
      "go-race-memory-model",
      "go-mutex-atomics",
      "arch-multiprocessor-coherence",
    ],
    relatedIds: ["os-synchronization", "go-channels", "conc-locks-atomics"],
    model:
      "A data race is two accesses to the same memory, at least one write, with no ordering relationship. Synchronization creates ordering edges so that the program has a defined meaning.",
    formal:
      "The Go memory model defines happens-before through goroutine creation, channel operations, mutexes, atomics, and package initialization. A race detector observes conflicting accesses at run time and reports the unsynchronized pair.",
    internals:
      "Cores buffer stores in private caches; coherence protocols make writes visible, but the compiler and CPU may reorder independent accesses. Synchronization instructions and runtime hooks constrain reordering and establish visibility across threads.",
    example:
      "Two goroutines incrementing a shared counter without synchronization can lose updates; a mutex or an atomic add creates an ordering edge and makes the update indivisible.",
    connections:
      "Atomics build the primitives used by locks, channels schedule synchronization through the runtime, and cache coherence explains the hardware cost of shared writes.",
    mistakes:
      "Do not assume a race is only a wrong final value; do not use a race detector as proof of correctness; do not mix atomic and non-atomic access to the same value; do not ignore compiler reordering.",
    practice:
      "Write a racy program, reproduce it under the race detector, fix it with two different primitives, and explain the happens-before edges added by each fix.",
    exercises: [
      ex(
        "Reproduce and explain a data race",
        "Write a Go program with two goroutines updating one shared integer. Run it repeatedly, run it with `go test -race`, and explain the conflicting accesses and why the final value is not reliable.",
        [
          "Identify the exact conflicting accesses.",
          "Explain why an observed result is not a correctness proof.",
        ],
        [
          "Use at least two goroutines and many iterations.",
          "Capture a race-detector report.",
          "State the missing happens-before edge.",
        ],
        [
          "The report is real and reproducible.",
          "The explanation names the shared location and access pair.",
          "The final value is not used as the only evidence.",
        ],
        [
          "Unsynchronized read/write pairs are races.",
          "The race detector needs the conflicting accesses to actually occur.",
          "A mutex or atomic operation creates ordering.",
        ],
        "advanced",
        [
          "Keep the iteration count high enough to expose conflicts.",
          "Read the race report from the two stacks outward.",
        ],
        "The race is a pair of unsynchronized conflicting accesses; without happens-before, both the final value and the observed order are unreliable.",
      ),
      ex(
        "Synchronize the same state two ways",
        "Fix the shared counter once with `sync.Mutex` and once with `sync/atomic`. Run both under race detection and compare their guarantees, performance characteristics, and limits.",
        [
          "Apply locking and atomic primitives correctly.",
          "Compare the guarantees each primitive provides.",
        ],
        [
          "Both versions pass race detection.",
          "Include a benchmark.",
          "Explain why a compound operation may still need a lock.",
        ],
        [
          "Both implementations are race-free.",
          "The comparison states the granularity difference.",
          "The compound-operation limitation is correct.",
        ],
        [
          "Atomic add is indivisible for one location.",
          "A mutex can protect multi-step invariants.",
          "Atomics are not a substitute for every critical section.",
        ],
        "advanced",
        [
          "Use `atomic.Int64` rather than raw pointer arithmetic in modern Go.",
          "Test with many goroutines, not just two.",
        ],
        "Atomics establish ordering and indivisibility for a single value, while mutexes protect invariants spanning multiple operations or locations.",
      ),
    ],
    projectRefs: [
      ref(
        "worker-pool",
        "m-race",
        "Stress-test shared state and prove the worker pool is race-free under the race detector.",
      ),
    ],
  }),
  concept({
    id: "conc-locks-atomics",
    categoryId: "concurrency",
    order: 3,
    name: "Locks, Atomics, and Lock-Free Structures",
    description:
      "Choose synchronization primitives using progress guarantees, contention behavior, deadlock risk, and invariant scope.",
    difficulty: "advanced",
    prerequisiteIds: ["conc-races", "go-mutex-atomics", "os-synchronization"],
    relatedIds: [
      "os-deadlocks-starvation",
      "arch-multiprocessor-coherence",
      "net-races-sync",
    ],
    model:
      "A lock turns a critical section into a queue of ownership; an atomic operation makes one transition indivisible; lock-free code retries when another thread wins.",
    formal:
      "A mutex provides mutual exclusion and usually blocks contenders; a read-write lock permits concurrent readers; an atomic compare-and-swap performs a conditional update in one indivisible step. Progress guarantees distinguish blocking, lock-free, and wait-free algorithms.",
    internals:
      "Lock implementations spin briefly, then park threads through the runtime. Atomics compile to machine instructions with ordering semantics; contention causes cache-line ping-pong and can erase the benefit of fine-grained locks.",
    example:
      "A bounded queue can use a mutex around head and tail, or a lock-free ring with atomic indices and careful memory ordering; the lock-free version is not automatically faster under contention.",
    connections:
      "OS synchronization explains blocking and wakeups, memory ordering constrains atomic correctness, and scheduler behavior determines whether spinning is useful.",
    mistakes:
      "Do not hold a lock across I/O or a callback; do not assume lock-free means wait-free or simple; do not protect an invariant with per-field atomics; do not ignore lock ordering.",
    practice:
      "Implement the same bounded queue with a mutex and with atomics, then measure throughput and explain the failure modes of each design.",
    exercises: [
      ex(
        "Mutex versus atomic queue",
        "Build a bounded integer queue twice: once with a mutex and condition variable, once with atomic indices. Test correctness with concurrent producers and consumers, then compare throughput under low and high contention.",
        [
          "Implement correct synchronization for a shared structure.",
          "Relate contention to primitive choice.",
        ],
        [
          "Both versions preserve FIFO order and bounds.",
          "Include low- and high-contention measurements.",
          "Explain one progress hazard per version.",
        ],
        [
          "Stress tests pass without races.",
          "The comparison is supported by measurements.",
          "The hazard analysis is specific to the implementation.",
        ],
        [
          "A full queue must block or reject producers explicitly.",
          "Atomic indices alone may not make a multi-step enqueue wait-free.",
          "Mutexes can be simpler but may serialize independent operations.",
        ],
        "advanced",
        [
          "Start with a single-producer, single-consumer case.",
          "Use the race detector before optimizing.",
        ],
        "Mutexes make invariants easy to state but can serialize access; atomics reduce blocking but make ordering and multi-step invariants the hard part.",
      ),
      ex(
        "Diagnose a deadlock",
        "Given two goroutines that acquire the same pair of mutexes in opposite orders, reproduce a deadlock deterministically, capture goroutine stacks, and fix the lock ordering.",
        [
          "Recognize circular wait.",
          "Use stacks as evidence rather than guessing.",
        ],
        [
          "Reproduce the deadlock reliably.",
          "Show both goroutine stacks.",
          "Describe the ordering rule that prevents it.",
        ],
        [
          "The failure is reproducible.",
          "The evidence shows each goroutine waiting on the other's lock.",
          "The fix removes the cycle.",
        ],
        [
          "Deadlock requires a wait cycle, not merely two locks.",
          "A consistent global lock order prevents this cycle.",
          "Timeouts can detect but not repair the design.",
        ],
        "advanced",
        [
          "Force the interleaving with channels or barriers.",
          "Use `SIGQUIT` or a goroutine dump to inspect blocked goroutines.",
        ],
        "Opposite lock acquisition creates a circular wait; a consistent ordering rule removes the cycle by construction.",
      ),
    ],
    projectRefs: [
      ref(
        "worker-pool",
        "m-backpressure",
        "Choose bounded locking or lock-free queues with an explicit overload and progress policy.",
      ),
    ],
  }),
  concept({
    id: "conc-system-io",
    categoryId: "concurrency",
    order: 4,
    name: "Signals, Processes, and Systems Interfaces",
    description:
      "Control long-running programs through process state, signals, file descriptors, and robust shutdown paths.",
    difficulty: "advanced",
    prerequisiteIds: ["os-processes", "os-syscalls", "os-file-descriptors"],
    relatedIds: ["os-interrupts", "os-permissions-isolation", "go-file-io"],
    model:
      "A process is a kernel-managed state machine; signals and file descriptors are narrow interfaces for changing that state or moving data across the kernel boundary.",
    formal:
      "Signals are asynchronous notifications delivered to a process with configurable dispositions. File descriptors are per-process integers referring to kernel objects; system calls transition between user and kernel mode to perform privileged operations.",
    internals:
      "The kernel records pending signals, interrupts or resumes a thread, and runs a handler or default action. Descriptor tables map integers to open file descriptions; closing one descriptor may or may not release the underlying object depending on references.",
    example:
      "A server traps SIGTERM, stops accepting connections, drains in-flight requests, closes listeners, and exits with a defined status instead of being killed abruptly.",
    connections:
      "Processes and threads define what a signal targets, syscalls define the boundary, and buffered I/O determines how much unflushed work shutdown must handle.",
    mistakes:
      "Do not do complex work inside a signal handler; do not assume every signal can be ignored; do not close descriptors in one goroutine while another uses them; do not treat SIGKILL as catchable.",
    practice:
      "Write a CLI that handles SIGINT and SIGTERM, closes files and listeners, and reports a clean shutdown status.",
    exercises: [
      ex(
        "Graceful shutdown under signals",
        "Write a Go program that opens a file, starts a worker loop, and handles SIGINT and SIGTERM by stopping new work, flushing output, closing descriptors, and exiting with status 0.",
        [
          "Connect signals to process state changes.",
          "Implement a shutdown path with no leaked resources.",
        ],
        [
          "Handle both signals.",
          "Stop accepting new work before closing resources.",
          "Report the shutdown reason.",
        ],
        [
          "Both signals produce a clean exit.",
          "No worker writes after shutdown begins.",
          "Descriptors are closed exactly once.",
        ],
        [
          "SIGTERM is a request that a program can handle.",
          "SIGKILL cannot be caught or ignored.",
          "Shutdown order matters: stop intake, drain, then close.",
        ],
        "advanced",
        [
          "Use `signal.NotifyContext` for cancellation.",
          "Test by sending signals to a built binary, not just unit tests.",
        ],
        "Signals are asynchronous requests; correctness comes from mapping them onto a controlled shutdown sequence with explicit resource ownership.",
      ),
      ex(
        "Descriptor ownership audit",
        "Review a program that opens files in several goroutines and closes them from a central cleanup path. Identify double-close, use-after-close, and leak risks, then redesign ownership so each resource has one clear closer.",
        [
          "Assign explicit ownership to descriptors.",
          "Reason about concurrent close and use.",
        ],
        [
          "Classify at least three failure modes.",
          "Propose an ownership rule.",
          "Show the shutdown sequence.",
        ],
        [
          "Each risk is tied to a concrete interleaving.",
          "Ownership is unambiguous.",
          "The sequence closes only after users stop.",
        ],
        [
          "Closing a descriptor while another goroutine reads it is a race.",
          "Double close can close an unrelated reused descriptor.",
          "A central closer still needs a stop-and-wait barrier.",
        ],
        "advanced",
        [
          "Ask who creates the descriptor and who is allowed to close it.",
          "Use `context` cancellation to stop users before closing.",
        ],
        "Descriptor safety is an ownership problem: one component creates, one component closes, and shutdown establishes that no users remain before close.",
      ),
    ],
    projectRefs: [
      ref(
        "process-inspector",
        "m-process",
        "Inspect process control state and explain signal-driven state changes.",
      ),
      ref(
        "log-analyzer",
        "m-stream",
        "Handle streaming I/O and interruption cleanly in a systems tool.",
      ),
    ],
  }),
];
