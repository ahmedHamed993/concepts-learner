import type { PromptTemplate, PromptVariable } from "@/lib/types";

function text(
  key: string,
  label: string,
  placeholder?: string,
  required = true,
): PromptVariable {
  return { key, label, type: "text", required, placeholder };
}

function area(
  key: string,
  label: string,
  placeholder?: string,
  required = true,
): PromptVariable {
  return { key, label, type: "textarea", required, placeholder };
}

function select(
  key: string,
  label: string,
  options: string[],
  defaultValue?: string,
): PromptVariable {
  return {
    key,
    label,
    type: "select",
    required: true,
    options,
    defaultValue: defaultValue ?? options[0],
  };
}

export const seedPrompts: PromptTemplate[] = [
  {
    id: "prompt-deep-tutor",
    title: "Deep Concept Tutor",
    description:
      "Learn any CS concept from first principles, with an intuition-first explanation and a check for understanding.",
    category: "Learn a Concept",
    template:
      "You are my computer science tutor. Teach me {{concept}} from first principles. Explain the intuitive model first, then the precise technical model, give a small example, identify common misconceptions, and connect it to related concepts. Ask me a question that tests my understanding before moving on. Do not reveal the answer until I attempt it.",
    keywords: ["first principles", "mental model", "misconceptions", "tutor"],
    phases: [1, 2, 3, 4, 5, 6, 7, 8],
    difficulty: "beginner",
    variables: [
      text("concept", "Concept", "e.g. escape analysis"),
    ],
    source: "seed",
  },
  {
    id: "prompt-trace-code",
    title: "Go Code Execution Tracer",
    description:
      "Predict, trace, and explain a Go program, separating guarantees from implementation details.",
    category: "Code Tracing",
    template:
      "Analyze this Go code: {{code}}. First ask me to predict the output. After my attempt, explain the execution step by step, including variable changes, control flow, relevant allocations or copies, and error behavior. Separate guaranteed language semantics from implementation-dependent details. Finish with a harder variation.",
    keywords: ["execution trace", "predict output", "Go", "semantics"],
    phases: [1, 2, 3, 7],
    difficulty: "intermediate",
    variables: [
      area("code", "Go code", "Paste a small, runnable Go program"),
    ],
    source: "seed",
  },
  {
    id: "prompt-architecture",
    title: "Computer Architecture Tutor",
    description:
      "Study a concept through logic, registers, instructions, memory, and CPU execution.",
    category: "CPU and Assembly",
    template:
      "Teach me {{concept}} from the perspective of digital logic and computer architecture. Explain the relevant bits, registers, instructions, memory accesses, and CPU operations. Use a concrete example. Distinguish architectural guarantees from microarchitectural implementation details. Ask me to predict what happens next.",
    keywords: ["architecture", "CPU", "registers", "instructions", "cache"],
    phases: [3, 4, 5],
    difficulty: "intermediate",
    variables: [
      text("concept", "Concept", "e.g. cache lines or two's complement"),
    ],
    source: "seed",
  },
  {
    id: "prompt-memory-investigation",
    title: "Memory Investigation",
    description:
      "Run a Go memory experiment and distinguish what the output does and does not prove.",
    category: "Memory and Pointers",
    template:
      "Help me investigate {{concept}} using a small Go program. Ask me to predict the behavior first. Then help me run the experiment, interpret the output, and understand what the result proves and does not prove. When relevant, discuss addresses, pointers, stack and heap behavior, escape analysis, and garbage collection without making unsupported assumptions.",
    keywords: ["memory", "pointers", "escape analysis", "stack", "heap", "GC"],
    phases: [3, 5, 6],
    difficulty: "advanced",
    variables: [
      text("concept", "Concept", "e.g. which values escape to the heap"),
    ],
    source: "seed",
  },
  {
    id: "prompt-socratic",
    title: "Socratic Programming Mentor",
    description:
      "Solve your own problem through focused questions and hints instead of an immediate answer.",
    category: "Socratic Tutor",
    template:
      "Act as a Socratic programming mentor. My current problem is {{problem}}. Do not give me the solution immediately. Ask one focused question at a time, provide hints only when necessary, and help me discover the solution independently. After I solve it, review correctness, complexity, edge cases, readability, and testing.",
    keywords: ["socratic", "hints", "mentor", "debugging thinking"],
    phases: [1, 2, 7],
    difficulty: "beginner",
    variables: [
      area("problem", "Your problem", "Describe what you are stuck on"),
    ],
    source: "seed",
  },
  {
    id: "prompt-compiler-assembly",
    title: "Compiler and Assembly Investigator",
    description:
      "Trace how Go code becomes assembly and executes, with reproducible experiments.",
    category: "Compiler Internals",
    template:
      "Help me understand how {{code}} is compiled and executed on {{architecture}} using {{go_version}}. Explain the relevant Go semantics, compiler stages, generated assembly, linking, runtime behavior, and hardware execution. Guide me toward reproducible experiments and authoritative documentation. Clearly label any implementation-specific assumptions.",
    keywords: ["compiler", "assembly", "linking", "runtime", "Go version"],
    phases: [4, 5, 7],
    difficulty: "advanced",
    variables: [
      area("code", "Go code", "Paste the function or snippet"),
      text("architecture", "Architecture", "amd64, arm64, etc."),
      text("go_version", "Go version", "e.g. go1.24 linux/amd64"),
    ],
    source: "seed",
  },
  {
    id: "prompt-debugging",
    title: "Debugging Mentor",
    description:
      "Isolate a failing Go program with a minimal reproduction and targeted experiments.",
    category: "Debugging",
    template:
      "Review this failing Go program: {{code}}. The observed behavior is {{observed_behavior}}, and the expected behavior is {{expected_behavior}}. Help me isolate the cause using a minimal reproduction, tests, debugger or compiler diagnostics, and targeted experiments. Start with a hint instead of rewriting the program. Explain the underlying misconception after the issue is fixed.",
    keywords: ["debugging", "minimal reproduction", "tests", "hypothesis"],
    phases: [1, 2, 7],
    difficulty: "intermediate",
    variables: [
      area("code", "Failing code", "Paste the smallest reproducible program"),
      text("observed_behavior", "Observed behavior", "What actually happens"),
      text("expected_behavior", "Expected behavior", "What should happen"),
    ],
    source: "seed",
  },
  {
    id: "prompt-quiz",
    title: "Spaced Repetition Quiz",
    description:
      "Quiz one question at a time across reasoning, tracing, application, and edge cases.",
    category: "Spaced Repetition",
    template:
      "Quiz me on {{topic}} at {{difficulty}} difficulty. Ask one question at a time. Include conceptual reasoning, code tracing, practical applications, and edge cases. Wait for my response before revealing the answer. Track the concepts I struggle with and recommend what I should review next.",
    keywords: ["quiz", "spaced repetition", "difficulty", "review"],
    phases: [1, 2, 3, 4, 5, 6, 7, 8],
    difficulty: "intermediate",
    variables: [
      text("topic", "Topic", "e.g. channels and select"),
      select("difficulty", "Difficulty", ["beginner", "intermediate", "advanced"]),
    ],
    source: "seed",
  },
  {
    id: "prompt-code-review",
    title: "Senior Engineer Code Review",
    description:
      "Get a correctness-first review that separates bugs from optional improvements.",
    category: "Code Review",
    template:
      "Review my Go implementation for {{goal}}. Evaluate correctness, maintainability, complexity, error handling, concurrency safety, memory behavior, and performance. Separate actual bugs from optional improvements. Explain trade-offs and give me the smallest useful improvement first.",
    keywords: ["code review", "correctness", "maintainability", "trade-offs"],
    phases: [1, 2, 7, 8],
    difficulty: "intermediate",
    variables: [
      area("goal", "Goal", "What the code is supposed to do, plus the code"),
    ],
    source: "seed",
  },
  {
    id: "prompt-project-learning",
    title: "Project-Based Learning",
    description:
      "Break a Go project into milestones, tests, and acceptance criteria without skipping the learning.",
    category: "Project Planning",
    template:
      "Help me build {{project}} using Go. Break the work into milestones with explicit requirements, tests, and acceptance criteria. Introduce one new concept at a time. Ask me to implement each milestone independently before reviewing it. Explain how each design decision connects to broader computer science concepts.",
    keywords: ["project", "milestones", "acceptance criteria", "testing"],
    phases: [1, 7, 8],
    difficulty: "intermediate",
    variables: [
      text("project", "Project", "e.g. concurrent file indexer"),
    ],
    source: "seed",
  },
  {
    id: "prompt-predict-output",
    title: "Predict the Output",
    description:
      "Practice reading Go precisely by predicting behavior before an explanation.",
    category: "Predict the Output",
    template:
      "Here is a Go program: {{code}}. Do not run it or explain it yet. Ask me to predict the exact output, including errors, panics, zero values, and ordering. After I answer, reveal the result and walk through the execution. Then ask me to write a variation that changes one specific behavior.",
    keywords: ["predict output", "Go semantics", "zero values", "panics"],
    phases: [1, 2, 3],
    difficulty: "beginner",
    variables: [
      area("code", "Go code", "Paste a short program with a surprising result"),
    ],
    source: "seed",
  },
  {
    id: "prompt-complexity",
    title: "Algorithms and Complexity Coach",
    description:
      "Analyze correctness, complexity, invariants, and trade-offs without jumping to code.",
    category: "Algorithms and Complexity",
    template:
      "Help me analyze {{algorithm}} for the problem {{problem}}. First ask me to state the invariant and the expected complexity. Then examine correctness, time and space complexity, edge cases, and alternative structures. Compare at least two approaches and identify when the asymptotically slower one might win in practice. Do not write the final implementation until I have attempted the design.",
    keywords: ["algorithm", "complexity", "invariant", "Big O", "trade-offs"],
    phases: [2, 3, 7],
    difficulty: "intermediate",
    variables: [
      text("algorithm", "Algorithm or problem", "e.g. binary search"),
      area("problem", "Specific problem", "Describe constraints and inputs"),
    ],
    source: "seed",
  },
  {
    id: "prompt-os",
    title: "Operating Systems Tutor",
    description:
      "Connect a program's behavior to kernels, processes, syscalls, memory, and I/O.",
    category: "Operating Systems",
    template:
      "Teach me {{concept}} from an operating systems perspective. Start with the user-visible behavior, then explain the kernel mechanisms, privilege transitions, memory mappings, scheduling, and I/O involved. Use a concrete experiment I can run on my machine. Distinguish POSIX or Go guarantees from Linux and hardware implementation details. Ask me to predict what the kernel does next.",
    keywords: ["kernel", "syscall", "virtual memory", "scheduler", "I/O"],
    phases: [4, 5, 6, 7],
    difficulty: "advanced",
    variables: [
      text("concept", "Concept", "e.g. a blocking read or page fault"),
    ],
    source: "seed",
  },
  {
    id: "prompt-concurrency",
    title: "Go Concurrency Lab",
    description:
      "Design, trace, and verify concurrent Go code with races, cancellation, and bounds.",
    category: "Go Concurrency",
    template:
      "Help me design and verify this Go concurrency problem: {{problem}}. First ask me to draw the goroutine lifetimes and ownership. Then review synchronization, channel closing, cancellation, error propagation, deadlock and leak risks, and bounding. Ask me to provide a trace of an interleaving that could fail. Only then suggest code changes. Include how to test with the race detector and execution traces.",
    keywords: ["goroutines", "channels", "race detector", "cancellation", "worker pool"],
    phases: [7, 8],
    difficulty: "advanced",
    variables: [
      area("problem", "Concurrency problem", "Describe the workflow and constraints"),
    ],
    source: "seed",
  },
  {
    id: "prompt-profiling",
    title: "Performance Profiling Partner",
    description:
      "Measure first, then interpret profiles and design a controlled optimization experiment.",
    category: "Performance and Profiling",
    template:
      "Help me investigate the performance of {{workload}}. Ask me for the benchmark setup, input sizes, and environment. Then help me choose between CPU, heap, block, mutex, and trace data. Interpret only the evidence I provide, state what is not proven, and propose one controlled experiment at a time. Connect the findings to memory, caches, compiler behavior, and the OS. Require before-and-after measurements.",
    keywords: ["benchmark", "pprof", "trace", "allocations", "latency"],
    phases: [3, 4, 7, 8],
    difficulty: "advanced",
    variables: [
      text("workload", "Workload", "What are you measuring?"),
    ],
    source: "seed",
  },
  {
    id: "prompt-exam",
    title: "Quiz and Exam Preparation",
    description:
      "Build an adaptive question set from your learning phase and focus on weak concepts.",
    category: "Quiz and Exam Preparation",
    template:
      "Prepare me for a {{exam_type}} covering {{topics}}. Ask questions in rounds, mixing recall, explanation, code tracing, and design. After each answer, grade it against a rubric, show what was missing, and adapt the next question toward my weak areas. Do not be lenient about incorrect technical claims. End with a short review plan.",
    keywords: ["exam", "quiz", "rubric", "review plan"],
    phases: [1, 2, 3, 4, 5, 6, 7, 8],
    difficulty: "intermediate",
    variables: [
      text("exam_type", "Exam type", "e.g. systems interview or final"),
      text("topics", "Topics", "Chapters, phase, or keyword list"),
    ],
    source: "seed",
  },
  {
    id: "prompt-explain-code",
    title: "Explain My Own Code",
    description:
      "Turn your own implementation into a precise explanation, including assumptions and gaps.",
    category: "Explain My Own Code",
    template:
      "Here is code I wrote: {{code}}. Do not rewrite it. Ask me questions until you can infer my intent. Then produce a precise explanation of the data flow, control flow, memory behavior, concurrency, error handling, and complexity. Identify assumptions, hidden coupling, and one misconception I may be holding. Finish with a small experiment that would test the weakest assumption.",
    keywords: ["explain code", "intent", "data flow", "assumptions"],
    phases: [1, 2, 3, 7, 8],
    difficulty: "intermediate",
    variables: [
      area("code", "Your code", "Paste code you wrote"),
    ],
    source: "seed",
  },
];

export function getPromptById(id: string): PromptTemplate | undefined {
  return seedPrompts.find((prompt) => prompt.id === id);
}
