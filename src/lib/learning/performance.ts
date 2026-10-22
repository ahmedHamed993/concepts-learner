import { concept, ex, ref } from "./types";

export const performanceConcepts = [
  concept({
    id: "perf-methodology",
    categoryId: "performance",
    order: 1,
    name: "Benchmarking and Performance Methodology",
    description:
      "Design measurements that answer a specific performance question without bias from setup, noise, or misleading aggregates.",
    difficulty: "advanced",
    prerequisiteIds: [
      "go-testing",
      "go-profiling-benchmarking",
      "algo-benchmarking-complexity",
    ],
    relatedIds: ["mem-profiling", "net-performance-profiling", "perf-profiling"],
    model:
      "A benchmark is an experiment: state the hypothesis, control the variables, measure the right signal, and report uncertainty.",
    formal:
      "A useful benchmark fixes inputs, isolates the code under test from setup, runs enough iterations to exceed timer resolution, and reports a distribution or confidence interval rather than a single best run. Go benchmarks report nanoseconds per operation and allocations per operation with `-benchmem`.",
    internals:
      "The Go testing package calibrates the iteration count before measuring, supports sub-benchmarks, and can compare results with `benchstat`. CPU frequency scaling, GC activity, cache state, and background load are confounders that must be controlled or disclosed.",
    example:
      "A slice append benchmark should separate allocation growth from element work, report allocations per operation, and compare sizes that reflect realistic workloads.",
    connections:
      "Profiling explains where time goes, complexity analysis predicts scaling, and cache behavior explains discontinuities that a single benchmark run can hide.",
    mistakes:
      "Do not benchmark setup work; do not compare runs with different inputs; do not remove all allocations and call it optimization without checking correctness; do not trust one run.",
    practice:
      "Write a benchmark for two implementations of the same operation, run each several times, and report the distribution and allocations per operation.",
    exercises: [
      ex(
        "Benchmark two growth strategies",
        "Benchmark appending to a slice with and without preallocated capacity. Use `-benchmem`, run multiple sizes, and explain the allocation and copying differences rather than reporting only the fastest run.",
        [
          "Design a controlled comparison.",
          "Interpret allocations per operation.",
        ],
        [
          "Test at least three input sizes.",
          "Report ns/op and allocs/op.",
          "Explain the role of capacity growth.",
        ],
        [
          "Both implementations are measured with the same inputs.",
          "Results include allocation counts.",
          "The conclusion follows from the data.",
        ],
        [
          "Preallocation avoids repeated growth copies.",
          "Small sizes may not reveal asymptotic differences.",
          "A single ns/op number hides variance.",
        ],
        "advanced",
        [
          "Use `b.ReportAllocs()`.",
          "Compare with `benchstat` rather than eyeballing one run.",
        ],
        "The experiment must isolate the growth strategy; allocations per operation and multiple sizes reveal costs that a single timing cannot.",
      ),
      ex(
        "Detect a misleading benchmark",
        "Review a benchmark that opens a file inside the timed loop, uses one iteration, and reports the minimum of three runs. Identify every methodological flaw and rewrite it to answer a well-defined question.",
        [
          "Recognize setup leakage and insufficient sampling.",
          "Turn a vague measurement into a testable hypothesis.",
        ],
        [
          "List at least four flaws.",
          "Rewrite setup outside the timed region.",
          "State what the new benchmark does and does not prove.",
        ],
        [
          "Every identified flaw is real.",
          "The rewritten benchmark has a clear question.",
          "Limitations are stated.",
        ],
        [
          "I/O setup dominates a tight loop.",
          "One iteration is below reliable timer resolution.",
          "Minimum-of-three hides variance and outliers.",
        ],
        "advanced",
        [
          "Ask what exactly is being timed.",
          "Separate setup, execution, and teardown.",
        ],
        "Benchmarks fail when they measure the wrong region or sample too little; the fix is a scoped question, isolated work, and repeated measurements.",
      ),
    ],
    projectRefs: [
      ref(
        "algorithm-benchmark",
        "m-profile",
        "Design controlled benchmarks and report statistically meaningful results.",
      ),
    ],
  }),
  concept({
    id: "perf-profiling",
    categoryId: "performance",
    order: 2,
    name: "Profiling and Flame Graphs",
    description:
      "Use CPU, memory, and blocking profiles to locate real bottlenecks and read flame graphs without over-interpreting samples.",
    difficulty: "advanced",
    prerequisiteIds: ["perf-methodology", "go-profiling-benchmarking", "mem-profiling"],
    relatedIds: [
      "net-performance-profiling",
      "perf-release",
      "mem-data-locality",
    ],
    model:
      "A profile is a statistical sample of where work happens; a flame graph stacks those samples so wide bars show expensive call paths, not necessarily slow functions.",
    formal:
      "Go exposes CPU, heap, goroutine, mutex, and block profiles through `runtime/pprof` and `net/http/pprof`. CPU profiling samples stacks at a fixed frequency; heap profiling samples allocations. Flame graphs aggregate stacks and width represents sample proportion.",
    internals:
      "The runtime records samples asynchronously, then a tool symbolizes addresses into functions and inlines. Sampling error, inlining, and missing frames mean a profile locates candidates, not proof of a single cause.",
    example:
      "A CPU flame graph showing most samples under `encoding/json` suggests serialization cost; confirming it requires targeted benchmarks before and after a change.",
    connections:
      "Benchmark methodology defines the workload, memory profiles explain retention, and cache behavior explains why a small hot loop can dominate.",
    mistakes:
      "Do not optimize the widest function without checking callers; do not mix profiles from different workloads; do not treat allocation counts as retained memory; do not ignore goroutine leaks in concurrency profiles.",
    practice:
      "Profile a small service under a realistic load, identify one hot path, make one change, and prove the effect with a benchmark and a new profile.",
    exercises: [
      ex(
        "Read a CPU flame graph",
        "Given a CPU profile of a JSON-heavy endpoint, identify the three largest sample paths, state which are application code versus library code, and propose one change with a measurement plan.",
        [
          "Interpret stack aggregation.",
          "Separate hot paths from root causes.",
        ],
        [
          "Name three paths and their proportions.",
          "Distinguish inclusive from self cost.",
          "State a before-and-after measurement.",
        ],
        [
          "The paths are read correctly.",
          "The proposed change targets a real path.",
          "The measurement plan is falsifiable.",
        ],
        [
          "A wide parent bar is inclusive cost.",
          "Library cost may still be avoidable at the call site.",
          "Profiles from different loads are not comparable.",
        ],
        "advanced",
        [
          "Look at the leaf frames for self cost.",
          "Use `go tool pprof -top` as a cross-check.",
        ],
        "Flame graphs locate candidate paths; a measurement plan turns a visual clue into evidence.",
      ),
      ex(
        "Compare heap and allocation profiles",
        "Write a program that allocates many short-lived objects and some long-lived objects. Capture an allocation profile and an in-use heap profile, then explain why the two views differ.",
        [
          "Distinguish allocation volume from retained memory.",
          "Use the correct profile for the question.",
        ],
        [
          "Capture both profile types.",
          "Identify a high-volume temporary allocation.",
          "Identify the retained object.",
        ],
        [
          "The profiles are labeled correctly.",
          "The explanation matches the observed difference.",
          "Retention is traced to a reference.",
        ],
        [
          "Allocations can be collected immediately.",
          "An in-use profile shows what survives GC.",
          "A leak is retention, not merely high allocation volume.",
        ],
        "advanced",
        [
          "Force a GC before capturing an in-use profile.",
          "Ask whether the object is still reachable.",
        ],
        "Allocation profiles measure churn, while in-use profiles measure reachable memory after collection.",
      ),
    ],
    projectRefs: [
      ref(
        "concurrent-indexer",
        "m-profile",
        "Use CPU and memory profiles to locate bottlenecks in a concurrent indexer.",
      ),
    ],
  }),
  concept({
    id: "perf-reliability",
    categoryId: "performance",
    order: 3,
    name: "Reliability, SLOs, and Failure Engineering",
    description:
      "Define service objectives, instrument failure signals, and design degradation that keeps promises under partial failure.",
    difficulty: "advanced",
    prerequisiteIds: [
      "net-reliability-failure",
      "net-logging-observability",
      "net-distributed-fundamentals",
    ],
    relatedIds: [
      "net-consistency-replication",
      "perf-release",
      "os-deadlocks-starvation",
    ],
    model:
      "Reliability is a user-facing promise measured over time; failures are normal, so systems need bounded retries, isolation, and a plan for graceful degradation.",
    formal:
      "An SLI is a measured indicator such as success rate or latency; an SLO is a target for that indicator over a window; an error budget is the allowed shortfall. Retries require idempotency and backoff; circuit breakers and bulkheads limit failure propagation.",
    internals:
      "Timeouts free resources but do not cancel work already committed; retries multiply load during overload; queues hide latency until they saturate. Observability must record the outcome, not only the attempt.",
    example:
      "A service with a 99.9% availability SLO can fail roughly 43 minutes per 30 days; retrying a non-idempotent write can double-charge users without improving the SLI.",
    connections:
      "Networking reliability defines transport failure modes, observability supplies the signal, and distributed consistency determines what recovery can promise.",
    mistakes:
      "Do not retry every error; do not set a timeout without checking cancellation; do not alert on every symptom; do not call a system reliable because it has no error logs.",
    practice:
      "Define one SLI and SLO for a small API, instrument it, and simulate a dependency failure to show the error budget impact.",
    exercises: [
      ex(
        "Design an SLO for an API",
        "For a task API, define an availability SLI and a latency SLI, choose an SLO window and target, and explain how the error budget changes operational decisions.",
        [
          "Translate user expectations into measurable indicators.",
          "Connect error budgets to tradeoffs.",
        ],
        [
          "Define numerator and denominator for each SLI.",
          "Choose a justified window and target.",
          "State two actions triggered by budget exhaustion.",
        ],
        [
          "Indicators are measurable from real telemetry.",
          "The SLO is neither trivially loose nor impossible.",
          "Actions are concrete.",
        ],
        [
          "An SLI must be based on observed requests.",
          "Averages hide tail latency.",
          "An error budget funds controlled risk.",
        ],
        "advanced",
        [
          "Use percentiles for latency, not averages.",
          "Ask whether failed requests count in the denominator.",
        ],
        "An SLO turns reliability into a measurable budget that guides release and reliability work.",
      ),
      ex(
        "Make a dependency failure survivable",
        "Add a timeout, bounded retry with backoff, and a fallback to a service that calls a flaky dependency. Test overload and partial failure, then explain which failures are retried and which are surfaced.",
        [
          "Prevent retry storms.",
          "Preserve user-visible semantics under degradation.",
        ],
        [
          "Use context deadlines.",
          "Retry only retryable errors.",
          "Expose a degraded response or clear error.",
        ],
        [
          "Failures are bounded in time.",
          "Non-idempotent operations are not blindly retried.",
          "Behavior under overload is documented.",
        ],
        [
          "Retries amplify load if not bounded.",
          "A timeout without cancellation may leave work running.",
          "Fallbacks must still satisfy the API contract.",
        ],
        "advanced",
        [
          "Classify errors before choosing a retry policy.",
          "Use jitter to avoid synchronized retries.",
        ],
        "Failure engineering bounds each failure's blast radius and makes retry, cancellation, and degradation explicit.",
      ),
    ],
    projectRefs: [
      ref(
        "http-service",
        "m-observability",
        "Instrument an HTTP service with SLIs, error budgets, and actionable alerts.",
      ),
    ],
  }),
  concept({
    id: "perf-release",
    categoryId: "performance",
    order: 4,
    name: "Production Testing and Release Engineering",
    description:
      "Combine unit, integration, contract, fuzz, and load tests with staged rollout and rollback criteria.",
    difficulty: "advanced",
    prerequisiteIds: [
      "go-testing",
      "go-fuzz",
      "net-http-https",
      "perf-reliability",
    ],
    relatedIds: ["go-fuzz", "perf-reliability", "comp-go-architecture"],
    model:
      "A release is a hypothesis about production; each test layer reduces a different uncertainty, and rollout limits the cost of being wrong.",
    formal:
      "Unit tests isolate logic, integration tests exercise real boundaries, contract tests fix interfaces between components, fuzz tests search input space, and load tests explore behavior under concurrency. Canary and blue-green releases bound exposure; rollback criteria must be defined before deployment.",
    internals:
      "CI runs deterministic tests quickly, while slower fuzzing and load tests may run on schedules. Artifacts should be reproducible and identified by digest. Feature flags decouple deployment from release, but add state that must be tested.",
    example:
      "A handler can pass unit tests and still fail a contract test if its JSON field names drift; a canary with error-rate rollback catches the mismatch before all traffic moves.",
    connections:
      "HTTP contracts define integration assumptions, fuzzing explores parser edge cases, and observability supplies rollout decisions.",
    mistakes:
      "Do not rely on end-to-end tests alone; do not call a load test a correctness test; do not deploy without a rollback signal; do not use feature flags as permanent untested branches.",
    practice:
      "Create a release checklist for a small HTTP service covering test layers, artifact identity, rollout stages, and rollback triggers.",
    exercises: [
      ex(
        "Build a layered test plan",
        "For an HTTP task API, write one unit, one integration, one contract, one fuzz, and one load test. For each, state the risk it reduces and what it deliberately does not prove.",
        [
          "Match test layers to distinct risks.",
          "Avoid overclaiming test coverage.",
        ],
        [
          "Cover all five layers.",
          "Use a real boundary in the integration test.",
          "State a non-goal for each test.",
        ],
        [
          "Each test addresses a different uncertainty.",
          "Boundaries are real, not mocked away.",
          "Limitations are explicit.",
        ],
        [
          "A mock-heavy test does not prove integration behavior.",
          "Fuzzing explores inputs, not production load.",
          "Load tests do not prove semantic correctness.",
        ],
        "advanced",
        [
          "Name the failure each test would catch.",
          "Keep deterministic tests in the fast CI path.",
        ],
        "Each test layer is a different experiment; the plan is sound when each layer targets a risk the others do not.",
      ),
      ex(
        "Define a safe rollout",
        "Design a canary release for the API with traffic percentages, health signals, rollback triggers, and a migration plan for a backward-incompatible change. Explain how the error budget influences the decision.",
        [
          "Bound the blast radius of a bad release.",
          "Make rollback a precomputed action.",
        ],
        [
          "Define at least two rollout stages.",
          "Use measurable rollback triggers.",
          "Address schema or API compatibility.",
        ],
        [
          "Rollback is possible without data loss.",
          "Triggers reference real telemetry.",
          "Error-budget impact is stated.",
        ],
        [
          "A canary without a decision rule is just a delay.",
          "Backward-incompatible changes need expand-and-contract migration.",
          "Rollback must be tested before it is needed.",
        ],
        "advanced",
        [
          "Choose triggers before looking at the canary.",
          "Ask what happens to requests during rollback.",
        ],
        "A safe release bounds exposure, measures the right signals, and has a rehearsed rollback path tied to the error budget.",
      ),
    ],
    projectRefs: [
      ref(
        "http-service",
        "m-routes",
        "Add contract, integration, and load tests with a safe release checklist.",
      ),
    ],
  }),
];
