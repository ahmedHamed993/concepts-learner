import type { Phase } from "@/lib/types";
import { content, lesson, topic } from "./helpers";

const decomposition = topic({
  id: "decomposition",
  phaseId: "phase-2",
  order: 1,
  title: "Problem Decomposition",
  definition:
    "Problem decomposition is the process of breaking an ambiguous problem into smaller, independently solvable parts with explicit inputs, outputs, and constraints.",
  summary:
    "Turn vague requirements into a sequence of testable subproblems before writing code.",
  difficulty: "beginner",
  estimatedMinutes: 65,
  keywords: ["problem decomposition", "requirements", "constraints", "edge cases"],
  aliases: ["divide and conquer", "requirements analysis", "problem solving"],
  prerequisites: ["go-flow"],
  related: ["abstraction", "recursion", "invariants-testing-clean-code"],
  objectives: [
    "Restate a problem in terms of inputs, outputs, and constraints.",
    "Split a problem into parts with clear contracts.",
    "Identify edge cases and unknowns before implementation.",
    "Decide what to defer without losing correctness.",
  ],
  lessons: [
    lesson("contract", "Define the contract", "Inputs, outputs, constraints, and failure modes.", 20),
    lesson("split", "Split and sequence", "Decomposition strategies and dependency ordering.", 25),
    lesson("edges", "Edge cases and unknowns", "Adversarial examples and risks.", 20),
  ],
  content: content({
    what:
      "Decomposition converts a goal into a small graph of subproblems. Each subproblem should have a contract: what it accepts, what it returns, what it may fail on, and what it guarantees. Parts should be small enough to test and explain independently.",
    why:
      "Most failed projects do not fail because of syntax. They fail because the problem was never defined, hidden constraints were discovered late, or components had mismatched assumptions. Decomposition is the cheapest place to prevent that.",
    mentalModel:
      "Treat the program as a set of black boxes connected by pipes. First draw the boxes and name what flows through each pipe. Only then choose implementations.",
    precise:
      "A useful decomposition is a directed acyclic graph of responsibilities. Each node has a contract and each edge represents data or control flow. Constraints include performance targets, memory limits, error behavior, concurrency, and external formats. Unknowns should become explicit questions or experiments, not assumptions.",
    connections:
      "Decomposition feeds abstraction and interface design. Recursion is a decomposition strategy where a problem contains smaller instances of itself. Complexity analysis evaluates whether the decomposition meets performance constraints. Project milestones are decompositions with acceptance criteria.",
    misconceptions: [
      "Starting with a file structure instead of a problem model.",
      "Assuming requirements are complete when they are only a first draft.",
      "Decomposing by technology layers when the real boundaries are data ownership.",
      "Ignoring failure behavior in the initial contract.",
    ],
    trace: [
      { step: "Goal: count unique words", detail: "Inputs: byte stream. Output: map word to count. Constraints: memory and token rules." },
      { step: "Split", detail: "Tokenizer, normalizer, counter, formatter become separate contracts." },
      { step: "Edge cases", detail: "Unicode, punctuation, empty input, very long tokens, read errors." },
      { step: "Order", detail: "Build tokenizer and tests first; formatter can be deferred." },
    ],
    assessment: [
      "What belongs in a function contract beyond its parameter list?",
      "How do you decide the order in which to build subproblems?",
      "Why is 'it depends' an incomplete answer about performance?",
      "What is a hidden constraint you might discover late in a file indexer?",
    ],
  }),
  codeExamples: [
    {
      language: "text",
      caption: "A decomposition before code",
      code: `Goal: report the 10 most frequent words in a file.

Contract
  input:  path + options
  output: ordered (word, count) pairs
  errors: unreadable file, invalid encoding, no tokens

Parts
  1. readLines(path) -> iterator + error
  2. tokenize(line) -> []token
  3. normalize(token) -> word
  4. count(words) -> map[word]int
  5. topN(counts, n) -> []entry
  6. render(entries) -> text

First milestone: 1-4 with tests on small strings.
Deferred: streaming top-N, locale rules, progress UI.`,
    },
  ],
  exerciseIds: [],
  promptIds: ["prompt-project-learning", "prompt-socratic"],
});

const abstraction = topic({
  id: "abstraction",
  phaseId: "phase-2",
  order: 2,
  title: "Abstraction and Encapsulation",
  definition:
    "Abstraction exposes the essential behavior of a component while hiding implementation detail. Encapsulation controls access to internal state so invariants cannot be violated from outside.",
  summary:
    "Design boundaries that reduce what a caller must know and make change safe.",
  difficulty: "beginner",
  estimatedMinutes: 70,
  keywords: ["abstraction", "encapsulation", "interfaces", "information hiding", "coupling"],
  aliases: ["information hiding", "module boundary", "API design", "cohesion"],
  prerequisites: ["decomposition"],
  related: ["go-interfaces-generics", "invariants-testing-clean-code", "data-structures-complexity"],
  objectives: [
    "Distinguish essential behavior from accidental detail.",
    "Design small APIs that are hard to misuse.",
    "Apply information hiding to protect invariants.",
    "Recognize harmful coupling and premature abstraction.",
  ],
  lessons: [
    lesson("behavior", "Behavior versus detail", "Choosing the right boundary.", 20),
    lesson("hide", "Hiding state", "Invariants, constructors, and zero values.", 25),
    lesson("trade", "Coupling trade-offs", "When abstraction helps and when it hurts.", 25),
  ],
  content: content({
    what:
      "An abstraction is a named contract that hides how something is done. Encapsulation is the enforcement mechanism: unexported fields, constructors, and methods that preserve invariants. Good boundaries reduce coupling and allow implementations to change without breaking callers.",
    why:
      "Every exposed detail becomes a dependency someone can rely on. Every hidden detail is freedom to change. The skill is choosing boundaries that match stable behavior, not current implementation convenience.",
    mentalModel:
      "An abstraction is a vending machine: a small set of buttons, predictable outcomes, and no need to know the internal mechanism. Encapsulation is the locked case that prevents you from reaching inside and breaking it.",
    precise:
      "In Go, exported identifiers form the public API of a package. Struct fields can be unexported even when the struct is exported. The zero value should be useful or clearly documented as invalid. Interfaces should usually be defined by the consumer and kept small. Leaky abstractions expose underlying constraints; that is acceptable when documented but dangerous when hidden.",
    connections:
      "Abstraction connects to interfaces and method sets. Encapsulation interacts with package boundaries and testing. Information hiding affects compile-time dependencies, which the Go compiler checks. Invariants are the property that encapsulation protects.",
    misconceptions: [
      "Creating an interface for every type before there is a second implementation.",
      "Equating encapsulation with getters and setters that expose everything anyway.",
      "Believing more abstraction always means better design.",
      "Exposing internal slices or maps from methods, allowing callers to mutate them.",
    ],
    trace: [
      { step: "type Buffer struct { data []byte }", detail: "Unexported data is inaccessible outside the package." },
      { step: "func (b *Buffer) Write(p []byte)", detail: "The method defines the only supported mutation path." },
      { step: "Data() []byte", detail: "Returning the internal slice would leak encapsulation; a copy or controlled view may be needed." },
    ],
    assessment: [
      "What makes an API hard to misuse?",
      "Why should interfaces often live in the consuming package?",
      "How can returning a slice leak encapsulated state?",
      "Give an example of premature abstraction.",
    ],
  }),
  codeExamples: [
    {
      language: "go",
      caption: "A small type that protects its invariant",
      code: `package counter

type Counter struct{ n int }

func (c *Counter) Add(delta int) {
    if delta < 0 {
        delta = 0
    }
    c.n += delta
}

func (c Counter) Value() int { return c.n }

// Callers cannot set n to a negative value directly.
// The invariant "n >= 0" is maintained by the exported API.`,
    },
  ],
  exerciseIds: [],
  promptIds: ["prompt-code-review", "prompt-deep-tutor"],
});

const recursion = topic({
  id: "recursion",
  phaseId: "phase-2",
  order: 3,
  title: "Recursion",
  definition:
    "Recursion solves a problem by calling the same procedure on smaller instances, with one or more base cases that terminate the chain.",
  summary:
    "Reason about recursive structure, call stacks, and recursive-to-iterative transformations.",
  difficulty: "intermediate",
  estimatedMinutes: 80,
  keywords: ["recursion", "base case", "call stack", "divide and conquer", "backtracking"],
  aliases: ["recursive function", "tail call", "call stack", "memoization"],
  prerequisites: ["go-flow", "abstraction"],
  related: ["stack-heap", "data-structures-complexity", "interpreters-vms"],
  objectives: [
    "Write recursive functions with correct base cases and progress guarantees.",
    "Trace recursion using the call stack.",
    "Choose between recursion, iteration, and memoization.",
    "Recognize stack overflow and exponential blow-up risks.",
  ],
  lessons: [
    lesson("shape", "Recursive shape", "Base cases, progress, and induction.", 25),
    lesson("stack", "The call stack", "Frames, unwinding, and depth limits.", 25),
    lesson("convert", "Recursion in practice", "Trees, backtracking, memoization, and iteration.", 30),
  ],
  content: content({
    what:
      "A recursive function calls itself with input that moves toward a base case. Each call adds a stack frame. The result is built while unwinding, or accumulated as an argument. Divide and conquer and backtracking are common recursive patterns.",
    why:
      "Recursion is natural for trees, graphs, grammars, and divide-and-conquer algorithms. It also exposes how function calls use memory. Understanding it is necessary for parsers, interpreters, and filesystem traversals.",
    mentalModel:
      "A recursive call is a detour: the current computation pauses, a smaller copy of the problem is solved, and the result returns to the paused point. The stack is a stack of paused notes.",
    precise:
      "Correct recursion needs at least one base case and an argument that strictly progresses toward it for every reachable input. Each active call occupies stack memory in typical Go implementations; the Go runtime grows goroutine stacks, but unbounded recursion can still exhaust memory. Go does not guarantee tail-call optimization. Memoization caches results by input; it trades memory for time and is only valid when the function is deterministic on that input.",
    connections:
      "The call stack is a concrete memory region. Recursion depth and branching determine complexity and stack usage. Tree recursion is the basis for interpreting grammars and walking ASTs. Backtracking needs careful state restoration.",
    misconceptions: [
      "Thinking recursion is always slower or always faster than iteration.",
      "Assuming Go optimizes tail calls.",
      "Forgetting to restore mutable state during backtracking.",
      "Using memoization when the function depends on external mutable state.",
    ],
    trace: [
      { step: "fact(3)", detail: "Calls fact(2), which calls fact(1), which calls fact(0)." },
      { step: "fact(0) returns 1", detail: "Base case reached; unwinding begins." },
      { step: "fact(1), fact(2), fact(3)", detail: "Each multiplies n by the returned value: 1, 2, 6." },
    ],
    assessment: [
      "What two properties must a recursive function guarantee?",
      "How is memory used while a recursive call is paused?",
      "When does memoization not help?",
      "Why can recursion be risky on deeply linked input?",
    ],
  }),
  codeExamples: [
    {
      language: "go",
      caption: "Recursion with memoization for Fibonacci",
      code: `package main

import "fmt"

func fib(n int, memo map[int]int) int {
    if n < 2 {
        return n
    }
    if v, ok := memo[n]; ok {
        return v
    }
    v := fib(n-1, memo) + fib(n-2, memo)
    memo[n] = v
    return v
}

func main() {
    fmt.Println(fib(30, map[int]int{})) // 832040
}`,
    },
  ],
  exerciseIds: ["ex-recursive-permutations"],
  promptIds: ["prompt-socratic", "prompt-trace-code"],
});

const structuresComplexity = topic({
  id: "data-structures-complexity",
  phaseId: "phase-2",
  order: 4,
  title: "Data Structures and Big O",
  definition:
    "A data structure organizes values to support particular operations. Big O notation describes an upper bound on how an algorithm's resource use grows as input size increases.",
  summary:
    "Connect operation costs to structure choice, and measure growth instead of guessing.",
  difficulty: "intermediate",
  estimatedMinutes: 100,
  keywords: ["algorithms", "data structures", "Big O notation", "complexity", "hashing", "sorting"],
  aliases: ["asymptotic analysis", "time complexity", "space complexity", "O(n)", "log n"],
  prerequisites: ["go-collections", "recursion"],
  related: ["cache-memory", "profiling", "go-collections"],
  objectives: [
    "Analyze the time and space complexity of common operations.",
    "Choose structures based on required operations and constraints.",
    "Distinguish average, expected, amortized, and worst-case costs.",
    "Use experiments to confirm asymptotic reasoning.",
  ],
  lessons: [
    lesson("analysis", "Counting operations", "Loops, nesting, and growth rates.", 30),
    lesson("structures", "Core structures", "Arrays, lists, maps, trees, heaps, and graphs.", 35),
    lesson("tradeoffs", "Trade-offs", "Memory, locality, expected case, and benchmarks.", 35),
  ],
  content: content({
    what:
      "Complexity analysis counts how work grows with input size, ignoring constant factors. Common classes include O(1), O(log n), O(n), O(n log n), O(n^2), and O(2^n). Data structures pair representation with operations: arrays support indexing, maps support keyed lookup, heaps support priority access, and trees support ordered operations.",
    why:
      "The right structure can change a program from unusable to fast. The wrong one can pass small tests and fail in production. Big O is a shared language for discussing trade-offs, but it is not a substitute for measurement.",
    mentalModel:
      "Imagine input size n as a dial. Ask how many extra steps each turn of the dial adds. Constants are noise; growth shape is the signal. Memory is another dial: caching often trades space for speed.",
    precise:
      "Big O is an asymptotic upper bound; Big Theta describes a tight bound. Hashing gives expected O(1) map lookup under reasonable hash distribution, but worst case is O(n) per operation without mitigation. append is amortized O(1) because occasional copies are spread across many appends. Sorting comparison-based values is O(n log n) in the worst case for standard comparison sorts. Space complexity counts auxiliary memory, not just input. Cache effects can make an O(n) traversal with poor locality slower than an O(n log n) traversal with good locality for realistic n.",
    connections:
      "Array contiguity connects to cache lines. Hash tables connect to memory allocation and hash quality. Recursion defines recurrence relations. Benchmarks in advanced Go provide empirical evidence, including allocations and CPU profiles.",
    misconceptions: [
      "Assuming O(1) map access is guaranteed worst-case.",
      "Using Big O to compare algorithms at small, fixed n without measuring.",
      "Confusing amortized cost with worst-case cost of a single operation.",
      "Ignoring space complexity and garbage collector pressure.",
    ],
    trace: [
      { step: "for i := 0; i < n; i++", detail: "n iterations, O(n) time." },
      { step: "for j := i; j < n; j++", detail: "The nested total is n + (n-1) + ... + 1 = O(n^2)." },
      { step: "map lookup inside the loop", detail: "Expected O(1) each, so expected overall O(n^2) is unchanged." },
    ],
    assessment: [
      "What is the average and worst-case complexity of a Go map lookup?",
      "Why is append described as amortized O(1)?",
      "When might a worse asymptotic algorithm win in practice?",
      "How does a heap differ from a sorted slice for priority queues?",
    ],
  }),
  codeExamples: [
    {
      language: "go",
      caption: "Duplicate detection: nested loop versus map",
      code: `package main

import "fmt"

func hasDuplicateSlow(values []int) bool {
    for i := 0; i < len(values); i++ {
        for j := i + 1; j < len(values); j++ {
            if values[i] == values[j] {
                return true
            }
        }
    }
    return false
}

func hasDuplicateFast(values []int) bool {
    seen := make(map[int]struct{}, len(values))
    for _, v := range values {
        if _, ok := seen[v]; ok {
            return true
        }
        seen[v] = struct{}{}
    }
    return false
}

func main() {
    fmt.Println(hasDuplicateSlow([]int{1, 2, 3, 2}))
    fmt.Println(hasDuplicateFast([]int{1, 2, 3, 2}))
}`,
    },
  ],
  exerciseIds: ["ex-complexity-lab"],
  promptIds: ["prompt-complexity", "prompt-predict-output"],
});

const invariantsTestingCleanCode = topic({
  id: "invariants-testing-clean-code",
  phaseId: "phase-2",
  order: 5,
  title: "Invariants, Testing, and Clean Code",
  definition:
    "An invariant is a property that must remain true throughout a specified region of a program. Tests are executable evidence about behavior. Clean code makes intent and invariants easier to see and change.",
  summary:
    "Use invariants to reason about correctness, tests to protect it, and clarity to keep it maintainable.",
  difficulty: "intermediate",
  estimatedMinutes: 85,
  keywords: ["invariants", "testing", "debugging", "clean code", "edge cases", "refactoring"],
  aliases: ["loop invariant", "property-based testing", "unit test", "regression test"],
  prerequisites: ["go-errors-packages-testing", "decomposition", "data-structures-complexity"],
  related: ["go-errors-packages-testing", "profiling", "syscalls-io"],
  objectives: [
    "State loop and data invariants precisely.",
    "Design tests around behavior, boundaries, and failure modes.",
    "Debug by minimizing a reproduction and testing hypotheses.",
    "Refactor in small steps while keeping tests green.",
  ],
  lessons: [
    lesson("invariants", "Reasoning with invariants", "Preconditions, postconditions, and loop invariants.", 25),
    lesson("tests", "Testing strategy", "Tables, boundaries, fakes, and failure paths.", 30),
    lesson("debug", "Debugging and refactoring", "Minimal reproductions, hypotheses, and safe cleanup.", 30),
  ],
  content: content({
    what:
      "An invariant is a statement that remains true at a defined point, such as the start of every loop iteration. Testing exercises code to compare observed behavior with expected behavior. Debugging is disciplined hypothesis testing. Clean code reduces the distance between intent and implementation.",
    why:
      "Invariants turn 'I think this works' into a checkable argument. Tests are evidence, not proof. Debugging without hypotheses produces random edits. Clean code matters because most time is spent reading and modifying, not writing.",
    mentalModel:
      "An invariant is a guardrail: if it holds before and after each step, it holds at the end. A test is a tripwire around behavior you care about. A debugger is a magnifying glass over a minimized reproduction.",
    precise:
      "Binary search commonly maintains that the target, if present, lies within [low, high]. A test should fail for the right reason, exercise the smallest meaningful behavior, and include boundaries. In Go, `testing` provides subtests and helpers; `t.Fatal` stops the current test goroutine. Debugging tools include print statements, `go test -run`, the `log` package, and Delve. Clean code favors small functions, explicit names, early returns, and comments that explain why rather than restating what.",
    connections:
      "Invariants support complexity arguments and concurrency reasoning. Tests provide evidence for mastery claims. Debugging relies on understanding the execution trace and memory state. Clear code connects to abstraction and encapsulation.",
    misconceptions: [
      "Thinking coverage percentage equals quality.",
      "Writing tests only for the happy path.",
      "Adding comments that duplicate the code instead of explaining why.",
      "Changing multiple things at once while debugging.",
    ],
    trace: [
      { step: "Predicate: target absent or within [low,high]", detail: "Established before the loop." },
      { step: "Compare mid", detail: "Discard the half that cannot contain target." },
      { step: "Loop ends when low > high", detail: "Absence follows from the invariant and termination." },
    ],
    assessment: [
      "State the invariant of binary search.",
      "What makes a test failure useful?",
      "How do you minimize a failing reproduction?",
      "When does a comment add value instead of noise?",
    ],
  }),
  codeExamples: [
    {
      language: "go",
      caption: "Binary search and a table-driven boundary test",
      code: `package search

func BinarySearch(values []int, target int) (int, bool) {
    low, high := 0, len(values)-1
    for low <= high {
        mid := low + (high-low)/2
        switch {
        case values[mid] == target:
            return mid, true
        case values[mid] < target:
            low = mid + 1
        default:
            high = mid - 1
        }
    }
    return -1, false
}

// Invariant: if target exists, its index is in [low, high].
// Test cases: empty slice, one element, target below, target above,
// duplicates, and a large sorted range.`,
    },
  ],
  exerciseIds: ["ex-binary-search-invariants"],
  promptIds: ["prompt-code-review", "prompt-quiz", "prompt-socratic"],
});

export const phase2: Phase = {
  id: "phase-2",
  number: 2,
  title: "Programming Fundamentals",
  tagline: "Thinking before syntax",
  description:
    "Learn to decompose problems, design boundaries, reason recursively, analyze complexity, and use invariants and tests as evidence.",
  objectives: [
    "Break ambiguous problems into testable contracts.",
    "Choose data structures deliberately and analyze trade-offs.",
    "Write invariant-based correctness arguments.",
    "Debug with hypotheses and minimal reproductions.",
  ],
  prerequisites: ["Phase 1 topics: functions, collections, structs, testing"],
  completionCriteria: [
    "You can state invariants for a non-trivial algorithm.",
    "You can analyze and benchmark two implementations.",
    "One data structure is implemented with tests.",
  ],
  estimatedWeeks: 4,
  keywords: [
    "problem decomposition", "abstraction", "encapsulation", "recursion",
    "algorithms", "data structures", "Big O notation", "invariants",
    "testing", "debugging", "clean code",
  ],
  projectIdea: "Implement a data structure library with tests and complexity notes.",
  topics: [decomposition, abstraction, recursion, structuresComplexity, invariantsTestingCleanCode],
};
