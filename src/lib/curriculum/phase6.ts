import type { Phase } from "@/lib/types";
import { content, lesson, topic } from "./helpers";

const kernelProcesses = topic({
  id: "kernel-processes",
  phaseId: "phase-6",
  order: 1,
  title: "Kernels, Processes, and Threads",
  definition:
    "The kernel is the privileged core of the operating system. A process is an isolated execution context with its own virtual address space. A thread is a schedulable execution path within a process.",
  summary:
    "Understand privilege, isolation, and the difference between processes and threads.",
  difficulty: "intermediate",
  estimatedMinutes: 85,
  keywords: ["kernel", "processes", "threads", "privilege", "isolation", "user space"],
  aliases: ["user mode", "kernel mode", "PCB", "task", "address space"],
  prerequisites: ["isa-cpu-cycle", "virtual-memory"],
  related: ["scheduling", "syscalls-io", "goroutines"],
  objectives: [
    "Explain user mode versus kernel mode.",
    "Describe what a process owns.",
    "Compare process and thread isolation.",
    "Connect Go goroutines to OS threads.",
  ],
  lessons: [
    lesson("privilege", "Privilege and protection", "Modes, traps, and kernel boundaries.", 25),
    lesson("process", "Processes", "Address space, state, descriptors, and lifecycle.", 30),
    lesson("threads", "Threads and goroutines", "Shared memory, stacks, and scheduling units.", 30),
  ],
  content: content({
    what:
      "The kernel runs with elevated privileges and controls hardware, memory mappings, scheduling, and I/O. A process contains at least one thread and owns a virtual address space and resource handles. Threads in a process share memory but have separate stacks and register state.",
    why:
      "Isolation explains why one program cannot freely read another's memory. The process boundary is central to security and reliability. Thread versus process choice affects sharing cost, crash scope, and communication. Goroutines depend on OS threads underneath.",
    mentalModel:
      "The kernel is the building manager with master keys. Each process is an apartment with its own address and belongings. Threads are people inside an apartment sharing the same rooms; a crash in the building's plumbing (kernel) can affect everyone.",
    precise:
      "On x86-64, privilege levels are represented by rings, with user code typically at ring 3 and kernel at ring 0. System calls transition into the kernel through controlled entry points. Each process has a virtual address space described by page tables, plus file descriptors and credentials. Threads share the address space and file descriptor table but have their own stacks, registers, and thread-local state. Context switches save and restore execution state. Go goroutines are user-space tasks multiplexed onto OS threads by the Go runtime.",
    connections:
      "Virtual memory implements process isolation. System calls are the controlled boundary. The scheduler chooses processes and threads. Go's scheduler multiplexes goroutines onto threads and processors. Interrupts and timers drive preemption.",
    misconceptions: [
      "Thinking a process is the same as a program binary; a process is a running instance with state.",
      "Assuming threads are fully isolated from each other.",
      "Believing a goroutine maps one-to-one to an OS thread.",
      "Thinking user code can directly execute privileged instructions.",
    ],
    trace: [
      { step: "go run app", detail: "The OS creates a process with a new address space and one initial thread." },
      { step: "Go runtime starts", detail: "It creates scheduler structures and additional OS threads as needed." },
      { step: "go f()", detail: "A goroutine is scheduled onto an available thread and processor." },
      { step: "file read", detail: "The thread enters the kernel through a system call; kernel performs I/O." },
    ],
    assessment: [
      "What does a process own that threads share?",
      "Why can't user code directly access kernel memory?",
      "How does a goroutine relate to an OS thread?",
      "What state must be saved on a context switch?",
    ],
  }),
  codeExamples: [
    {
      language: "go",
      caption: "Process identity, threads, and goroutines",
      code: `package main

import (
    "fmt"
    "os"
    "runtime"
    "sync"
)

func main() {
    fmt.Println("pid", os.Getpid())
    fmt.Println("os threads available", runtime.NumCPU())

    var wg sync.WaitGroup
    for i := 0; i < 4; i++ {
        wg.Add(1)
        go func(id int) {
            defer wg.Done()
            fmt.Println("goroutine", id)
        }(i)
    }
    wg.Wait()
    fmt.Println("goroutines now", runtime.NumGoroutine())
}`,
    },
  ],
  exerciseIds: [],
  promptIds: ["prompt-os", "prompt-deep-tutor"],
});

const scheduling = topic({
  id: "scheduling",
  phaseId: "phase-6",
  order: 2,
  title: "CPU Scheduling",
  definition:
    "The scheduler decides which runnable task runs on a CPU and for how long. It balances responsiveness, fairness, throughput, and latency.",
  summary:
    "Understand time slices, priorities, preemption, and how scheduling affects program behavior.",
  difficulty: "intermediate",
  estimatedMinutes: 75,
  keywords: ["scheduling", "preemption", "time slice", "context switch", "priority"],
  aliases: ["CFS", "round robin", "run queue", "fair scheduling", "latency"],
  prerequisites: ["kernel-processes"],
  related: ["goroutines", "profiling", "virtual-memory"],
  objectives: [
    "Compare common scheduling policies.",
    "Explain preemption and time slices.",
    "Estimate context-switch costs and their causes.",
    "Connect OS scheduling to Go's scheduler.",
  ],
  lessons: [
    lesson("policies", "Scheduling policies", "Round robin, priority, and fairness.", 25),
    lesson("preempt", "Preemption", "Timers, involuntary switches, and latency.", 25),
    lesson("observe", "Observing scheduling", "Load, benchmarks, and runtime traces.", 25),
  ],
  content: content({
    what:
      "A runnable thread waits in a run queue. The scheduler selects one, restores its context, and lets it run until it blocks, yields, or is preempted. Policies differ in fairness, latency, and throughput. Modern general-purpose schedulers often use weighted fair queuing or similar approaches.",
    why:
      "Scheduling determines tail latency under load and how CPU-bound and I/O-bound work share a machine. It explains why adding goroutines can help or hurt, and why benchmarks on an idle laptop differ from production.",
    mentalModel:
      "The scheduler is a dispatcher with a queue of waiting workers. Some workers finish quickly and ask for more; others block. The dispatcher must decide who goes next and when to interrupt a long task.",
    precise:
      "Linux's Completely Fair Scheduler (CFS) historically tracked virtual runtime and selected the leftmost task in a red-black tree; newer kernels use EEVDF. Exact policies are implementation details. A context switch saves registers and kernel state and may invalidate caches. Preemption may be voluntary (blocking) or involuntary (timer, higher-priority wakeup). Priority inversion occurs when a low-priority task holds a lock needed by a high-priority task. Go's scheduler is cooperative at synchronization points and asynchronously preemptible in recent versions; it is not the same as the kernel scheduler.",
    connections:
      "Scheduling relies on interrupts and timers. Virtual memory makes switching address spaces possible. Concurrency in Go adds another scheduling layer. Profiling with execution traces shows scheduler latency and run queue delays.",
    misconceptions: [
      "Thinking more runnable threads always means more throughput.",
      "Assuming a context switch is free.",
      "Believing Go's scheduler and the OS scheduler are identical.",
      "Ignoring CPU caches when reasoning about thread migration.",
    ],
    trace: [
      { step: "Task A runs", detail: "A timer interrupt fires after its slice expires." },
      { step: "Context switch", detail: "A's registers are saved; B's are restored." },
      { step: "Cache effects", detail: "B may start with cold caches; performance depends on working set." },
    ],
    assessment: [
      "What is the difference between voluntary and involuntary preemption?",
      "Why can context switches be expensive?",
      "What is priority inversion?",
      "How does Go's scheduler differ from the kernel's?",
    ],
  }),
  codeExamples: [
    {
      language: "go",
      caption: "Observing scheduler behavior with a trace",
      code: `package main

import (
    "os"
    "runtime"
    "runtime/trace"
    "sync"
)

func main() {
    f, _ := os.Create("trace.out")
    defer f.Close()
    trace.Start(f)
    defer trace.Stop()

    var wg sync.WaitGroup
    for i := 0; i < runtime.GOMAXPROCS(0); i++ {
        wg.Add(1)
        go func() {
            defer wg.Done()
            work := 0
            for j := 0; j < 1e7; j++ {
                work += j
            }
            _ = work
        }()
    }
    wg.Wait()
    // go tool trace trace.out
}`,
    },
  ],
  exerciseIds: [],
  promptIds: ["prompt-os", "prompt-profiling"],
});

const virtualMemory = topic({
  id: "virtual-memory",
  phaseId: "phase-6",
  order: 3,
  title: "Virtual Memory and Page Tables",
  definition:
    "Virtual memory gives each process its own address space mapped to physical memory through page tables. Pages are fixed-size blocks, commonly 4 KiB, though larger pages exist.",
  summary:
    "See how addresses translate, why isolation works, and what a page fault really does.",
  difficulty: "advanced",
  estimatedMinutes: 95,
  keywords: ["virtual memory", "page tables", "page fault", "paging", "address translation", "TLB"],
  aliases: ["MMU", "page", "TLB", "demand paging", "swap"],
  prerequisites: ["stack-heap", "kernel-processes"],
  related: ["cache-memory", "pointers-addresses", "filesystems-sync"],
  objectives: [
    "Explain virtual-to-physical address translation.",
    "Describe page tables and the TLB.",
    "Distinguish minor and major page faults.",
    "Connect virtual memory to isolation and allocation.",
  ],
  lessons: [
    lesson("translation", "Address translation", "Virtual addresses, pages, and frames.", 30),
    lesson("tables", "Page tables and TLB", "Multi-level tables and caching translations.", 30),
    lesson("faults", "Page faults", "Demand paging, copy-on-write, and swap.", 35),
  ],
  content: content({
    what:
      "The CPU emits virtual addresses. The memory management unit (MMU) translates them using page tables maintained by the kernel. Physical memory is divided into frames. A page table entry maps a virtual page to a physical frame and stores permission bits. A TLB caches recent translations.",
    why:
      "Virtual memory enables isolation, demand allocation, shared libraries, copy-on-write, and memory-mapped files. It also explains why a process can reserve a huge address range without using physical memory, and why touching new pages can fault.",
    mentalModel:
      "A virtual address is an apartment number in a building directory. The MMU consults the directory (page table) to find the actual storage location. The TLB is a sticky note with recent lookups. A missing entry triggers the manager (kernel) to fetch or create the page.",
    precise:
      "On x86-64, addresses are translated through multi-level page tables; four or five levels are used depending on configuration. The TLB caches translations; a TLB miss may be handled by hardware page-table walk or by software. A page fault occurs when a translation is absent or permissions fail. A minor fault can be resolved without I/O (for example, mapping an already resident page); a major fault requires I/O such as reading from swap or a file. Copy-on-write maps pages read-only until a write faults and a private copy is made. Page size and table format are architecture-specific.",
    connections:
      "Pointers are virtual addresses. Cache behavior sits on top of physical memory access; virtually indexed caches add complexity. The kernel manages mappings and page faults. Filesystems support memory-mapped files. Go's allocator obtains memory from the OS and manages it in arenas and spans.",
    misconceptions: [
      "Thinking a virtual address is a physical address.",
      "Assuming allocated memory is immediately backed by physical RAM.",
      "Believing every page fault is an error.",
      "Thinking the TLB is another level of data cache.",
    ],
    trace: [
      { step: "load [virtual address]", detail: "CPU sends the virtual address to the MMU." },
      { step: "TLB lookup", detail: "A hit returns the physical frame and permissions quickly." },
      { step: "TLB miss", detail: "The page table is walked; a valid entry fills the TLB." },
      { step: "invalid entry", detail: "A page fault traps to the kernel, which may map a page or terminate the process." },
    ],
    assessment: [
      "What does the TLB cache?",
      "Why is a page fault not necessarily fatal?",
      "How does copy-on-write save memory?",
      "What is the difference between virtual address space and resident memory?",
    ],
  }),
  codeExamples: [
    {
      language: "text",
      caption: "Virtual to physical translation (conceptual)",
      code: `virtual address
  +-------------------+-------------------+
  | virtual page no. | page offset       |
  +-------------------+-------------------+
            |
            v
       page table lookup  ---> TLB hit? use translation
            |
            v
  +-------------------+-------------------+
  | physical frame no.| offset (same)     |
  +-------------------+-------------------+

Permissions are checked alongside translation.
A missing/invalid entry causes a page fault into the kernel.`,
    },
  ],
  exerciseIds: ["ex-page-map"],
  promptIds: ["prompt-os", "prompt-memory-investigation", "prompt-deep-tutor"],
});

const syscallsIo = topic({
  id: "syscalls-io",
  phaseId: "phase-6",
  order: 4,
  title: "System Calls, File Descriptors, and I/O",
  definition:
    "A system call is a controlled request from a user program to the kernel. A file descriptor is a small integer index into a process's table of open file descriptions.",
  summary:
    "Cross the user/kernel boundary and understand blocking, readiness, and descriptor ownership.",
  difficulty: "advanced",
  estimatedMinutes: 90,
  keywords: ["system calls", "file descriptors", "interrupts", "I/O", "blocking", "readiness"],
  aliases: ["syscall", "fd", "epoll", "poll", "io_uring", "EINTR"],
  prerequisites: ["kernel-processes", "virtual-memory"],
  related: ["filesystems-sync", "context-networking", "go-runtime"],
  objectives: [
    "Trace a system call across the user/kernel boundary.",
    "Explain file descriptors and descriptor inheritance.",
    "Distinguish blocking, non-blocking, and readiness-based I/O.",
    "Handle partial reads and interrupted calls.",
  ],
  lessons: [
    lesson("boundary", "Crossing the boundary", "Syscall entry, arguments, and errors.", 25),
    lesson("fds", "Descriptors", "Open files, offsets, pipes, sockets, and inheritance.", 30),
    lesson("models", "I/O models", "Blocking, polling, readiness, and async I/O.", 35),
  ],
  content: content({
    what:
      "A system call switches from user mode to kernel mode through an architecture-specific instruction. The kernel validates arguments, performs the operation, and returns a result or error. File descriptors identify open resources such as files, sockets, pipes, and devices. I/O models determine how a program waits for data.",
    why:
      "All meaningful programs interact with the outside world through syscalls. High-performance servers are shaped by I/O readiness and batching. Descriptor leaks and partial reads cause production failures. The syscall boundary is where security checks occur.",
    mentalModel:
      "The kernel is a service counter behind a locked door. A system call is a request form passed through a secure window. A file descriptor is a claim ticket in your process's wallet. You do not hold the file itself; you hold an index into the kernel's open-file table.",
    precise:
      "On Linux, syscalls return -1 and set errno on failure; Go wraps this in error values and may retry certain errors. File descriptors are per-process integers; fork duplicates the table, while exec preserves descriptors unless close-on-exec is set. `read` may return fewer bytes than requested and 0 at EOF. `write` may perform partial writes. Blocking I/O sleeps the thread; readiness APIs such as select, poll, epoll, and kqueue report when operations can proceed; io_uring provides submission/completion queues. In Go, the netpoller and runtime integrate non-blocking descriptors with goroutine scheduling; exact behavior is implementation-specific.",
    connections:
      "Syscalls connect processes to hardware and filesystems. The Go runtime handles network I/O through the netpoller. Page faults and memory mapping are kernel services. Interrupts and timers drive wakeups. Permissions are enforced at the syscall boundary.",
    misconceptions: [
      "Confusing a Go error with errno semantics; the runtime translates and can retry.",
      "Assuming read fills the whole buffer.",
      "Thinking a file descriptor is the file itself.",
      "Believing all I/O is blocking at the OS level just because program code looks synchronous.",
    ],
    trace: [
      { step: "n, err := f.Read(buf)", detail: "Go calls a read operation on the descriptor." },
      { step: "kernel entry", detail: "The CPU switches privilege; the kernel validates the descriptor and buffer." },
      { step: "data available", detail: "The kernel copies bytes into the process buffer and returns a count." },
      { step: "short read", detail: "n may be less than len(buf); the caller must handle it or use io.ReadFull." },
    ],
    assessment: [
      "What does a file descriptor index into?",
      "Why must code handle short reads?",
      "What is the difference between blocking and readiness-based I/O?",
      "Why is EINTR possible, and how should Go code generally handle it?",
    ],
  }),
  codeExamples: [
    {
      language: "go",
      caption: "Descriptors, partial reads, and a raw syscall",
      code: `package main

import (
    "fmt"
    "io"
    "os"
    "strings"
    "syscall"
)

func main() {
    r := strings.NewReader("hello world")
    buf := make([]byte, 4)
    for {
        n, err := r.Read(buf)
        fmt.Printf("read %d bytes: %q\\n", n, buf[:n])
        if err == io.EOF {
            break
        }
        if err != nil {
            panic(err)
        }
    }

    fmt.Println("stdout fd", os.Stdout.Fd())

    var uname syscall.Utsname
    if err := syscall.Uname(&uname); err == nil {
        fmt.Println("uname syscall succeeded")
    }
}`,
    },
  ],
  exerciseIds: ["ex-syscall-trace"],
  promptIds: ["prompt-os", "prompt-deep-tutor"],
});

const filesystemsSync = topic({
  id: "filesystems-sync",
  phaseId: "phase-6",
  order: 5,
  title: "Filesystems, Interrupts, and Synchronization",
  definition:
    "A filesystem organizes persistent data into files and directories with metadata. Interrupts notify the CPU of external events. Synchronization primitives coordinate concurrent access to shared state.",
  summary:
    "Connect durable storage, event delivery, and concurrent correctness at the OS level.",
  difficulty: "advanced",
  estimatedMinutes: 95,
  keywords: ["filesystems", "interrupts", "synchronization", "permissions", "durability", "locks"],
  aliases: ["inode", "fsync", "interrupt handler", "mutex", "spinlock", "permissions"],
  prerequisites: ["syscalls-io", "kernel-processes"],
  related: ["mutexes-atomics", "scheduling", "syscalls-io"],
  objectives: [
    "Explain filesystem metadata versus file content.",
    "Describe durability and write ordering.",
    "Trace interrupt handling at a high level.",
    "Choose synchronization primitives for a scenario.",
  ],
  lessons: [
    lesson("fs", "Filesystems", "Inodes, directories, journals, and durability.", 30),
    lesson("interrupts", "Interrupts", "Hardware events, handlers, and bottom halves.", 30),
    lesson("locks", "Synchronization", "Locks, atomics, and memory ordering.", 35),
  ],
  content: content({
    what:
      "Filesystems map names to file objects with metadata such as permissions, size, timestamps, and block locations. Interrupts signal the CPU to handle hardware events. Synchronization primitives such as mutexes, semaphores, and atomics prevent data races and enforce ordering.",
    why:
      "Persistence and interleaving are two of the hardest parts of systems software. A successful write may not be durable until flushed. A data race may only appear under load. Interrupts explain latency, device drivers, and scheduling.",
    mentalModel:
      "A filesystem is a library catalog: directories are indexes, file metadata is a catalog card, and data blocks are shelves. An interrupt is a tap on the shoulder that makes the CPU pause and handle an urgent event. A lock is a single key to a shared room.",
    precise:
      "Unix-like filesystems traditionally use inodes for metadata. rename within a directory is usually atomic on POSIX systems, but durability requires fsync of the file and possibly the containing directory. Writes may be cached in the page cache; fsync requests persistence but hardware caches and drive behavior still matter. Permissions are checked at syscall entry based on credentials. Interrupt handlers must be fast; deferred work is handled later. Locks serialize access but can block; atomics provide indivisible operations with ordering guarantees. The Go memory model defines happens-before for synchronization operations; hardware-specific ordering is abstracted through these rules.",
    connections:
      "Filesystems implement syscalls and use block devices. Interrupts drive I/O completion and timers. Synchronization connects to Go's mutexes, channels, and memory model. Durability relates to databases and crash consistency. Permissions relate to security and process credentials.",
    misconceptions: [
      "Thinking a successful write means data is on durable media.",
      "Assuming rename alone guarantees crash consistency without understanding the filesystem.",
      "Believing an atomic operation removes the need to reason about ordering.",
      "Thinking interrupt handlers can safely do arbitrary long work.",
    ],
    trace: [
      { step: "write(fd, data)", detail: "Data enters the page cache; the syscall returns before physical persistence." },
      { step: "fsync(fd)", detail: "The kernel flushes relevant data and metadata; the device may still cache." },
      { step: "device interrupt", detail: "The controller signals completion; the kernel completes pending I/O." },
      { step: "rename + directory fsync", detail: "A common pattern for durable file replacement, with filesystem-specific caveats." },
    ],
    assessment: [
      "What does fsync guarantee, and what does it not guarantee?",
      "Why is rename often used for atomic file replacement?",
      "Why must interrupt handlers be short?",
      "What is the difference between a data race and a race condition?",
    ],
  }),
  codeExamples: [
    {
      language: "go",
      caption: "Atomic replacement and explicit durability",
      code: `package main

import (
    "fmt"
    "os"
    "path/filepath"
)

func writeAtomic(path string, data []byte) error {
    dir := filepath.Dir(path)
    tmp, err := os.CreateTemp(dir, ".tmp-*")
    if err != nil {
        return err
    }
    tmpName := tmp.Name()
    defer os.Remove(tmpName)

    if _, err := tmp.Write(data); err != nil {
        tmp.Close()
        return err
    }
    if err := tmp.Sync(); err != nil {
        tmp.Close()
        return err
    }
    if err := tmp.Close(); err != nil {
        return err
    }
    if err := os.Rename(tmpName, path); err != nil {
        return err
    }
    d, err := os.Open(dir)
    if err != nil {
        return err
    }
    defer d.Close()
    return d.Sync() // directory fsync for durability on many filesystems
}

func main() {
    err := writeAtomic("config.json", []byte("{\\"ok\\":true}\\n"))
    fmt.Println(err)
}`,
    },
  ],
  exerciseIds: [],
  promptIds: ["prompt-os", "prompt-deep-tutor", "prompt-code-review"],
});

export const phase6: Phase = {
  id: "phase-6",
  number: 6,
  title: "Operating Systems",
  tagline: "The machine's manager",
  description:
    "Learn how the kernel isolates processes, schedules work, maps memory, handles syscalls and I/O, and coordinates concurrency.",
  objectives: [
    "Explain privilege boundaries and process isolation.",
    "Trace virtual address translation and page faults.",
    "Understand syscalls, descriptors, and I/O models.",
    "Reason about filesystem durability and synchronization.",
  ],
  prerequisites: ["Phase 3 memory", "Phase 4 architecture"],
  completionCriteria: [
    "You can explain a syscall from user code to kernel return.",
    "You can describe page-table translation and a page fault.",
    "You can demonstrate atomic file replacement.",
  ],
  estimatedWeeks: 5,
  keywords: [
    "kernel", "processes", "threads", "scheduling", "virtual memory",
    "page tables", "system calls", "file descriptors", "filesystems",
    "interrupts", "synchronization", "permissions", "I/O",
  ],
  projectIdea: "Build a concurrent file indexer and document its syscall behavior.",
  topics: [kernelProcesses, scheduling, virtualMemory, syscallsIo, filesystemsSync],
};
