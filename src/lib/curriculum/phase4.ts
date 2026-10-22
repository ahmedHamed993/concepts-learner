import type { Phase } from "@/lib/types";
import { content, lesson, topic } from "./helpers";

const logicCircuits = topic({
  id: "logic-circuits",
  phaseId: "phase-4",
  order: 1,
  title: "Boolean Logic and Digital Circuits",
  definition:
    "Boolean algebra manipulates true and false values with AND, OR, and NOT. Logic gates implement these operations in hardware; combinational circuits compute a function of their current inputs.",
  summary:
    "From truth tables to gates to adders, learn how computation becomes physical.",
  difficulty: "beginner",
  estimatedMinutes: 70,
  keywords: ["Boolean algebra", "logic gates", "combinational circuits", "truth tables", "adders"],
  aliases: ["AND gate", "OR gate", "XOR", "NAND", "combinational logic"],
  prerequisites: ["bits-integers"],
  related: ["registers-alu", "isa-cpu-cycle"],
  objectives: [
    "Evaluate Boolean expressions and build truth tables.",
    "Explain universal gates and De Morgan's laws.",
    "Trace a half adder and full adder.",
    "Distinguish combinational from sequential behavior.",
  ],
  lessons: [
    lesson("boolean", "Boolean algebra", "Operators, identities, and simplification.", 20),
    lesson("gates", "Gates and truth tables", "AND, OR, NOT, XOR, NAND, and universal gates.", 25),
    lesson("adders", "From gates to adders", "Ripple-carry addition and propagation delay.", 25),
  ],
  content: content({
    what:
      "Boolean values are 0 and 1. AND, OR, and NOT form a complete set of operations. Gates are physical devices with those behaviors. A combinational circuit's output depends only on its current inputs, with no stored state.",
    why:
      "Every arithmetic and logic instruction ultimately reduces to gates. Understanding this layer makes CPU behavior concrete and explains why operations like addition have delay and carry propagation.",
    mentalModel:
      "A gate is a tiny decision machine with wires for inputs and output. A circuit is a directed graph of decisions. Signals flow from inputs to outputs; nothing is remembered unless the circuit includes storage elements.",
    precise:
      "De Morgan's laws state that NOT(A AND B) = (NOT A) OR (NOT B), and the dual for OR. NAND and NOR are universal because either can implement AND, OR, and NOT. A half adder produces sum = A XOR B and carry = A AND B. A full adder combines two operand bits plus carry-in. A ripple-carry adder chains full adders, so the worst-case carry path grows with bit width. Propagation delay is a physical property, not a software abstraction.",
    connections:
      "Logic gates implement bitwise operators. Adders support integer arithmetic and two's complement. Sequential circuits add state, leading to registers and the CPU cycle. Clock speed is limited by the longest combinational path.",
    misconceptions: [
      "Thinking XOR is the same as OR; XOR is true only when exactly one input is true.",
      "Assuming circuits compute instantly; signals propagate with delay.",
      "Believing NAND gates are only used in textbooks.",
      "Confusing combinational circuits with circuits that have memory.",
    ],
    trace: [
      { step: "A=1, B=1", detail: "XOR is 0, AND is 1, so half-adder sum=0, carry=1: binary 2." },
      { step: "Full adder with carry-in 1", detail: "Sum = A XOR B XOR Cin; carry-out is the majority of A, B, Cin." },
      { step: "Ripple carry", detail: "Each carry-out feeds the next bit, so higher bits wait for lower-bit chains." },
    ],
    assessment: [
      "Why are NAND gates considered universal?",
      "What is the difference between OR and XOR?",
      "Write the truth table for a half adder.",
      "Why does ripple carry limit adder speed?",
    ],
  }),
  codeExamples: [
    {
      language: "go",
      caption: "Truth tables for the basic operations",
      code: `package main

import "fmt"

func main() {
    for a := 0; a <= 1; a++ {
        for b := 0; b <= 1; b++ {
            and := a & b
            or := a | b
            xor := a ^ b
            fmt.Printf("A=%d B=%d  AND=%d OR=%d XOR=%d\\n", a, b, and, or, xor)
        }
    }
}`,
    },
  ],
  exerciseIds: ["ex-logic-gates"],
  promptIds: ["prompt-architecture", "prompt-deep-tutor"],
});

const registersAlu = topic({
  id: "registers-alu",
  phaseId: "phase-4",
  order: 2,
  title: "Registers, the ALU, and Sequential Circuits",
  definition:
    "A register stores a fixed-width binary value on a clock edge. The arithmetic logic unit (ALU) performs integer and bitwise operations. Sequential circuits combine combinational logic with state held in registers.",
  summary:
    "Understand clocked state, datapaths, flags, and how the CPU transforms values.",
  difficulty: "intermediate",
  estimatedMinutes: 80,
  keywords: ["registers", "ALU", "sequential circuits", "clock", "flags"],
  aliases: ["arithmetic logic unit", "program counter", "instruction register", "datapath"],
  prerequisites: ["logic-circuits"],
  related: ["isa-cpu-cycle", "cache-memory", "assembly-machine-code"],
  objectives: [
    "Explain how a register differs from a wire.",
    "Describe the ALU's role and common operations.",
    "Trace a simple clocked datapath.",
    "Explain flags such as zero and carry.",
  ],
  lessons: [
    lesson("state", "State and clocks", "Latches, flip-flops, and registers.", 25),
    lesson("alu", "The ALU", "Operations, operands, results, and flags.", 25),
    lesson("datapath", "Building a datapath", "Registers, buses, and control signals.", 30),
  ],
  content: content({
    what:
      "Registers are small, fast storage elements internal to the CPU. The program counter holds the address of the next instruction. The ALU combines operands to produce a result and condition flags. Sequential circuits use a clock to coordinate state updates.",
    why:
      "Registers are the fastest storage in the machine and constrain instruction encoding. The ALU explains what arithmetic instructions actually do. Flags drive conditional branches, which control all program flow. This layer makes assembly and CPU execution concrete.",
    mentalModel:
      "Registers are labelled pigeonholes at the CPU's desk. The ALU is a calculator fed by two pigeonholes and a control signal; its answer goes back to a pigeonhole and sets small indicator lights (flags). The clock is a metronome deciding when to update.",
    precise:
      "A simple register updates its value on a clock edge when write-enable is asserted. Setup and hold times are physical constraints on when inputs must be stable. Typical general-purpose registers are 32 or 64 bits wide. A status register holds flags such as zero, sign, carry, and overflow. The ALU is combinational; the surrounding registers are sequential. On many architectures, integer and floating-point operations use separate register files and execution units. Exact register names and widths are architecture-specific.",
    connections:
      "Registers feed the instruction cycle and hold pointers used for memory addressing. Cache memory exists to bridge the gap between register speed and RAM latency. Assembly exposes registers directly. Calls and returns save and restore registers, connecting to stack frames.",
    misconceptions: [
      "Believing registers are just a very fast RAM array; they are part of the execution datapath.",
      "Thinking a clock tick means an instruction completes; many instructions take multiple cycles.",
      "Assuming flags are always updated; some instructions do not set them.",
      "Treating register contents as persisted across calls; calling conventions decide.",
    ],
    trace: [
      { step: "Clock edge", detail: "Register R1 captures the value on its input if write-enable is high." },
      { step: "ALU operation", detail: "R1 and R2 feed the ALU; control selects ADD." },
      { step: "Write back", detail: "The sum is written to R3 on the next edge; flags reflect the result." },
    ],
    assessment: [
      "What distinguishes a register from a wire?",
      "Why does the ALU need control signals?",
      "What are condition flags used for?",
      "Why are setup and hold times relevant to overclocking?",
    ],
  }),
  codeExamples: [
    {
      language: "go",
      caption: "Modeling an 8-bit ALU with flags",
      code: `package main

import "fmt"

type Flags struct{ Zero, Carry, Negative bool }

func add8(a, b uint8) (uint8, Flags) {
    wide := uint16(a) + uint16(b)
    result := uint8(wide)
    return result, Flags{
        Zero:     result == 0,
        Carry:    wide > 0xff,
        Negative: result&0x80 != 0,
    }
}

func main() {
    r, f := add8(200, 100)
    fmt.Printf("result=%d zero=%v carry=%v negative=%v\\n",
        r, f.Zero, f.Carry, f.Negative)
}`,
    },
  ],
  exerciseIds: [],
  promptIds: ["prompt-architecture", "prompt-predict-output"],
});

const isaCpuCycle = topic({
  id: "isa-cpu-cycle",
  phaseId: "phase-4",
  order: 3,
  title: "Instruction Sets and the CPU Cycle",
  definition:
    "An instruction set architecture (ISA) defines the instructions, registers, addressing modes, and memory model visible to software. The CPU executes instructions through fetch, decode, and execute phases.",
  summary:
    "Follow an instruction from memory through the pipeline and understand what software can rely on.",
  difficulty: "intermediate",
  estimatedMinutes: 85,
  keywords: ["instruction sets", "CPU execution cycle", "ISA", "fetch decode execute", "pipeline"],
  aliases: ["ISA", "RISC", "CISC", "program counter", "instruction pointer"],
  prerequisites: ["registers-alu"],
  related: ["assembly-machine-code", "cache-memory", "kernel-processes"],
  objectives: [
    "Describe the instruction cycle.",
    "Distinguish architecture from microarchitecture.",
    "Read basic addressing modes and instruction categories.",
    "Explain pipelining and hazards conceptually.",
  ],
  lessons: [
    lesson("cycle", "Fetch, decode, execute", "Control flow of the CPU.", 25),
    lesson("isa", "The ISA contract", "Instructions, registers, and memory model.", 30),
    lesson("pipeline", "Pipelining", "Throughput, hazards, and out-of-order execution.", 30),
  ],
  content: content({
    what:
      "The ISA is the software-visible contract: instruction encodings, registers, privilege levels, and memory semantics. A CPU fetches an instruction at the program counter, decodes it, executes it, and updates state. Real processors pipeline these stages so multiple instructions are in flight.",
    why:
      "Assembly is written against the ISA. Compilers target it. Operating systems rely on privilege levels and instruction behavior. Performance depends on microarchitecture, but correctness depends on the architectural contract.",
    mentalModel:
      "The ISA is a recipe language. The CPU is a kitchen that reads a recipe, prepares steps ahead, and sometimes reorders work as long as the final dish is identical. The architecture promises the dish; the microarchitecture decides the kitchen layout.",
    precise:
      "Common ISAs include x86-64 and ARM64. RISC architectures favor fixed-length or regular encodings and load/store memory access; CISC architectures historically favor variable-length encodings and more complex instructions. The instruction cycle is conceptually fetch, decode, execute, memory access, and write-back. Superscalar processors issue multiple instructions per cycle; out-of-order cores reorder independent work; speculative execution predicts branches. The architecture exposes the result, not the exact cycle schedule. Memory ordering rules define what parallel observers may see, and are weaker on many multiprocessors than sequential consistency.",
    connections:
      "The CPU cycle connects registers, ALU, cache, and memory. Compilers emit ISA instructions and exploit instruction-level parallelism. The OS uses privileged instructions and interrupts to control the machine. Go's memory model abstracts the CPU's ordering rules for concurrent programs.",
    misconceptions: [
      "Assuming execution is strictly one instruction at a time.",
      "Thinking assembly is portable because it looks low-level.",
      "Confusing clock speed with actual instruction throughput.",
      "Assuming the compiler's output order equals the CPU's execution order.",
    ],
    trace: [
      { step: "Fetch", detail: "Read the instruction at the program counter from instruction memory or cache." },
      { step: "Decode", detail: "Determine operation, operands, and addressing mode." },
      { step: "Execute", detail: "ALU computes; load/store units access data cache." },
      { step: "Write-back", detail: "Update a register or memory; advance the program counter." },
    ],
    assessment: [
      "What belongs to the ISA contract versus microarchitecture?",
      "Why can a processor execute instructions out of program order safely?",
      "What is a pipeline hazard?",
      "Why is assembly not portable across architectures?",
    ],
  }),
  codeExamples: [
    {
      language: "text",
      caption: "A conceptual instruction trace",
      code: `Program (pseudo-assembly):
  MOV  R1, #5
  MOV  R2, #7
  ADD  R3, R1, R2
  CMP  R3, #12
  BEQ  equal
  ...

Fetch MOV R1  -> decode  -> execute: R1 = 5
Fetch MOV R2  -> decode  -> execute: R2 = 7
Fetch ADD     -> operands ready -> execute: R3 = 12, flags set
Fetch CMP     -> compare       -> flags updated
Fetch BEQ     -> branch taken if equal flag set

A pipelined CPU may overlap these stages. The visible result is
the architectural state, not the exact overlap.`,
    },
  ],
  exerciseIds: ["ex-instruction-trace"],
  promptIds: ["prompt-architecture", "prompt-compiler-assembly"],
});

const assemblyMachineCode = topic({
  id: "assembly-machine-code",
  phaseId: "phase-4",
  order: 4,
  title: "Assembly and Machine Code",
  definition:
    "Machine code is the binary encoding of instructions. Assembly is a human-readable notation mapping to those encodings, typically one instruction per line with symbolic operands.",
  summary:
    "Read generated Go assembly, understand registers and calling conventions, and connect source to instructions.",
  difficulty: "advanced",
  estimatedMinutes: 95,
  keywords: ["assembly", "machine code", "calling convention", "registers", "instructions"],
  aliases: ["asm", "objdump", "go tool objdump", "disassembly", "ABI"],
  prerequisites: ["isa-cpu-cycle"],
  related: ["toolchain", "cache-memory", "profiling"],
  objectives: [
    "Read a small disassembly and identify loads, stores, and arithmetic.",
    "Explain the role of a calling convention.",
    "Generate Go assembly output reproducibly.",
    "Separate Go semantics from compiler output details.",
  ],
  lessons: [
    lesson("read", "Reading assembly", "Operands, registers, and simple instructions.", 30),
    lesson("abi", "Calling conventions", "Arguments, returns, stack, and callee-saved registers.", 30),
    lesson("inspect", "Inspecting Go output", "go build, objdump, and symbol naming.", 35),
  ],
  content: content({
    what:
      "Compilers translate source into machine instructions. Assembly notation names operations and operands, such as registers or memory addresses. Function calls follow a calling convention that determines where arguments and return values live and which registers must be preserved.",
    why:
      "Reading assembly verifies what the compiler actually emitted, diagnoses performance issues, and grounds abstract semantics in real instructions. It is also needed to understand caches, branch behavior, and runtime internals.",
    mentalModel:
      "Source is a story; assembly is the list of physical actions. Registers are workbench slots, memory is the warehouse, and each instruction is a single step. The compiler chooses the sequence; the CPU executes it.",
    precise:
      "Go's internal assembly syntax is not GNU assembler syntax; it is Plan 9-style, and `go tool objdump` shows machine instructions in a more familiar format. Since Go 1.17 on amd64, the register-based ABI passes some arguments and results in registers. Exact conventions differ by architecture and Go version. `go build -gcflags='-S'` prints compiler assembly; `go tool objdump -s symbol binary` disassembles a built binary. Symbols are mangled with package paths. Compiler output may change across versions; it is not part of the language specification.",
    connections:
      "Assembly exposes the ISA, registers, and memory operands. Cache behavior is visible in load/store patterns. Compiler optimization transforms source before code generation. Profiling attributes time to instructions or functions. Escape analysis influences whether operations hit the stack or heap.",
    misconceptions: [
      "Thinking Go assembly looks like Intel or AT&T syntax; it does not.",
      "Believing compiler-generated assembly is stable across versions.",
      "Assuming function arguments always live on the stack.",
      "Reading assembly without knowing the target architecture.",
    ],
    trace: [
      { step: "go build -gcflags='-S' main.go", detail: "The compiler prints pseudo-assembly for generated functions." },
      { step: "go tool objdump -s 'main.add' ./app", detail: "Disassembles the compiled function and prints addresses and bytes." },
      { step: "ADDQ AX, BX", detail: "Adds the contents of a register to another; exact syntax varies by toolchain." },
    ],
    assessment: [
      "What is the difference between assembly and machine code?",
      "Why is Go's assembly syntax unusual?",
      "What does a calling convention specify?",
      "How can you check the assembly generated for a function?",
    ],
  }),
  codeExamples: [
    {
      language: "asm",
      caption: "Example output shape (amd64, may differ by version)",
      code: `TEXT main.add(SB) /tmp/main.go
  main.go:6   0x0000  48 8b 44 24 08   MOVQ 0x8(SP), AX
  main.go:6   0x0005  48 03 44 24 10   ADDQ 0x10(SP), AX
  main.go:7   0x000a  48 89 44 24 18   MOVQ AX, 0x18(SP)
  main.go:7   0x000f  c3               RET

Addresses, offsets, and exact instructions are implementation details.
Use go tool objdump and record the Go version when experimenting.`,
    },
  ],
  exerciseIds: ["ex-assembly-inspect"],
  promptIds: ["prompt-compiler-assembly", "prompt-architecture"],
});

const cacheMemory = topic({
  id: "cache-memory",
  phaseId: "phase-4",
  order: 5,
  title: "RAM, Cache Hierarchy, and Cache Lines",
  definition:
    "Memory hierarchy organizes storage by speed and size. Registers are fastest and smallest; caches sit between the CPU and main memory. A cache line is the fixed-size block transferred between cache levels.",
  summary:
    "Understand locality, cache lines, and why data layout often matters more than operation count.",
  difficulty: "intermediate",
  estimatedMinutes: 90,
  keywords: ["RAM", "cache hierarchy", "cache lines", "locality", "memory latency"],
  aliases: ["L1", "L2", "L3", "cache miss", "spatial locality", "temporal locality"],
  prerequisites: ["registers-alu", "alignment"],
  related: ["data-structures-complexity", "profiling", "stack-heap"],
  objectives: [
    "Rank storage levels by latency and capacity.",
    "Explain temporal and spatial locality.",
    "Relate cache lines to array and linked-list traversal.",
    "Interpret a benchmark showing a cache effect.",
  ],
  lessons: [
    lesson("hierarchy", "The hierarchy", "Registers, caches, RAM, and storage.", 30),
    lesson("lines", "Cache lines and locality", "Blocks, hits, misses, and access patterns.", 30),
    lesson("measure", "Measuring locality", "Row-major traversal and benchmark evidence.", 30),
  ],
  content: content({
    what:
      "The CPU accesses data through a hierarchy. Caches hold recently used blocks and nearby data. Data moves in cache lines, commonly 64 bytes on x86-64, though the size is architecture-specific. Hits are served quickly; misses stall or trigger prefetch and lower-level access.",
    why:
      "Main memory is orders of magnitude slower than registers and caches. Asymptotically equal algorithms can differ dramatically due to memory access patterns. Struct size, array layout, and pointer chasing all affect cache behavior.",
    mentalModel:
      "The cache is a desk with limited space; RAM is a filing room. When you need one sheet, a whole folder (cache line) comes to the desk. Sequential access uses the whole folder; random pointer chasing keeps making trips.",
    precise:
      "Caches are organized in levels. L1 is per-core and small, L2 larger, L3 often shared. Addresses map to cache sets; conflicts evict lines. Writes use policies such as write-back. Prefetchers detect patterns and fetch ahead. Exact sizes, latencies, and line widths vary by CPU. On typical x86-64 hardware, a cache line is 64 bytes; ARM systems commonly use 64 bytes as well, but consult the target. Layout can matter more than Big O for realistic sizes.",
    connections:
      "Alignment and struct padding determine how many cache lines a value touches. Contiguous slices exploit spatial locality; linked lists and map buckets may not. Profiling tools can reveal cache misses. The operating system manages virtual-to-physical mappings but not cache contents directly.",
    misconceptions: [
      "Assuming cache line size is part of the Go specification.",
      "Thinking Big O captures all performance differences.",
      "Believing a linked list is faster for traversal because insertion is O(1).",
      "Ignoring that concurrent writes to nearby data can cause cache-line contention.",
    ],
    trace: [
      { step: "Traverse []int sequentially", detail: "One cache line brings several adjacent integers; next accesses hit." },
      { step: "Chase pointers in a linked list", detail: "Each node may be on a different line, causing dependent misses." },
      { step: "Two goroutines update adjacent counters", detail: "The line ping-pongs between cores (false sharing)." },
    ],
    assessment: [
      "Why is sequential array access usually cache-friendly?",
      "What is false sharing?",
      "How can struct layout affect cache behavior?",
      "Why are cache sizes and latencies not guaranteed by a language?",
    ],
  }),
  codeExamples: [
    {
      language: "go",
      caption: "Sequential versus strided traversal",
      code: `package main

import (
    "fmt"
    "time"
)

func main() {
    const n = 16 << 20
    data := make([]int, n)
    for i := range data {
        data[i] = i
    }

    start := time.Now()
    sum := 0
    for i := 0; i < n; i++ {
        sum += data[i]
    }
    fmt.Println("sequential", sum, time.Since(start))

    start = time.Now()
    sum = 0
    for i := 0; i < n; i += 16 {
        sum += data[i]
    }
    fmt.Println("strided", sum, time.Since(start))

    // Measure on your machine; timings are not guarantees.
}`,
    },
  ],
  exerciseIds: ["ex-cache-lines"],
  promptIds: ["prompt-architecture", "prompt-profiling", "prompt-deep-tutor"],
});

const endianness = topic({
  id: "endianness",
  phaseId: "phase-4",
  order: 6,
  title: "Endianness and Byte Order",
  definition:
    "Endianness is the order in which the bytes of a multi-byte value are stored in memory or transmitted. Little-endian stores the least significant byte first; big-endian stores the most significant byte first.",
  summary:
    "Interpret multi-byte data correctly across memory, files, and networks.",
  difficulty: "intermediate",
  estimatedMinutes: 55,
  keywords: ["endianness", "byte order", "little-endian", "big-endian", "network order"],
  aliases: ["little endian", "big endian", "byte swapping", "network byte order"],
  prerequisites: ["bits-integers", "alignment"],
  related: ["serialization-distributed", "assembly-machine-code", "context-networking"],
  objectives: [
    "Explain little-endian versus big-endian layout.",
    "Decode a multi-byte value from raw bytes.",
    "Use explicit serialization instead of raw memory dumps.",
    "Recognize network byte order.",
  ],
  lessons: [
    lesson("order", "Byte order", "Memory layout of multi-byte values.", 20),
    lesson("convert", "Conversion", "Encoding and decoding with explicit byte order.", 20),
    lesson("wire", "On the wire", "Protocols, files, and portability.", 15),
  ],
  content: content({
    what:
      "For a 32-bit value 0x01020304, little-endian memory stores 04 03 02 01 in increasing addresses; big-endian stores 01 02 03 04. Endianness applies to multi-byte integers, floating-point values, and sometimes checksums or lengths.",
    why:
      "Reading binary file formats, network protocols, and serialized data requires knowing byte order. Copying struct memory directly is not portable. Endianness bugs can produce plausible but wrong values.",
    mentalModel:
      "Write the number's bytes on four cards. Little-endian lays the cards down starting with the least important digit; big-endian starts with the most important. The number is the same; the reading order differs.",
    precise:
      "Most common desktop and server CPUs are little-endian, but the Go language does not mandate a processor's byte order. Use encoding/binary with an explicit order (binary.LittleEndian or binary.BigEndian) for portable data. Network protocols traditionally use big-endian, called network byte order. Bit shifts and masks are endian-independent at the language level; raw byte interpretation is not. Float bit patterns can be converted to uint32 or uint64 with math.Float32bits and math.Float64bits.",
    connections:
      "Endianness affects serialization, filesystems, and networking. Machine code instruction encodings also have byte order. Cache behavior is unaffected by endianness, but data interpretation is. Struct layout and padding combine with byte order to make raw dumps non-portable.",
    misconceptions: [
      "Assuming all CPUs are little-endian.",
      "Thinking JSON or Protobuf contains raw Go struct memory; they define their own encoding.",
      "Believing endianness changes the arithmetic result on a single machine.",
      "Forgetting that a file's documented byte order must be followed explicitly.",
    ],
    trace: [
      { step: "value = 0x01020304", detail: "Logical value is unambiguous." },
      { step: "Little-endian bytes", detail: "04 03 02 01 at increasing addresses." },
      { step: "Big-endian bytes", detail: "01 02 03 04 at increasing addresses." },
    ],
    assessment: [
      "What is the little-endian byte sequence for 0xDEADBEEF?",
      "Why should file formats define byte order explicitly?",
      "What does network byte order traditionally mean?",
      "How can you serialize a float portably?",
    ],
  }),
  codeExamples: [
    {
      language: "go",
      caption: "Explicit little-endian and big-endian encoding",
      code: `package main

import (
    "encoding/binary"
    "fmt"
)

func main() {
    value := uint32(0x01020304)

    le := make([]byte, 4)
    binary.LittleEndian.PutUint32(le, value)
    be := make([]byte, 4)
    binary.BigEndian.PutUint32(be, value)

    fmt.Printf("little: % x\\n", le) // 04 03 02 01
    fmt.Printf("big:    % x\\n", be) // 01 02 03 04
}`,
    },
  ],
  exerciseIds: [],
  promptIds: ["prompt-deep-tutor", "prompt-architecture", "prompt-predict-output"],
});

export const phase4: Phase = {
  id: "phase-4",
  number: 4,
  title: "Computer Architecture",
  tagline: "How the machine computes",
  description:
    "Build up from Boolean logic and gates to registers, the ALU, instruction sets, assembly, caches, and byte order.",
  objectives: [
    "Explain computation from gates to instructions.",
    "Read basic assembly and identify memory accesses.",
    "Reason about caches and data layout.",
    "Separate architectural guarantees from microarchitecture.",
  ],
  prerequisites: ["Phase 3 memory and number representation"],
  completionCriteria: [
    "You can trace a simple instruction cycle.",
    "You can disassemble and explain a small Go function.",
    "You can demonstrate a cache-locality effect with measurements.",
  ],
  estimatedWeeks: 5,
  keywords: [
    "Boolean algebra", "logic gates", "combinational circuits", "sequential circuits",
    "registers", "ALU", "instruction sets", "CPU execution cycle", "assembly",
    "machine code", "RAM", "cache hierarchy", "cache lines", "endianness",
  ],
  projectIdea: "Build a number representation explorer and an assembly reading journal.",
  topics: [logicCircuits, registersAlu, isaCpuCycle, assemblyMachineCode, cacheMemory, endianness],
};
