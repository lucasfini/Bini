# Bini Agents Guide: How to Use Them Optimally

You have 6 specialized agents at your disposal in `.claude/agents/`. Each has a specific expertise and is designed to make your development faster, more reliable, and more enjoyable. This guide explains what each agent does and when to use them.

---

## The 6 Agents & Their Roles

### **1. Design Agent** 🎨
**Expertise:** Benji + Honkish design philosophies, animations, micro-interactions, presence indicators, delight moments

**When to use:**
- Designing new UI components
- Creating animations or transitions
- Adding partner interaction features
- Making design decisions (should we add animation X?)
- Reviewing designs before implementation
- Brainstorming delight moments and Easter eggs

**Example prompts:**
```
"I'm building a task completion celebration. How would Benji + Honkish approach this? Suggest animations and micro-interactions."

"Review this tray component. Does it follow Benji principles? How can I add more delight?"

"Should partner presence be shown as animated dots or something else? Align with our design philosophy."
```

**What NOT to ask:**
- Code implementation details (use other agents)
- Testing strategy (use Test Writer)
- Performance issues (use Performance Agent)

---

### **2. Code Quality Agent** 👮
**Expertise:** Architecture standards, naming conventions, TypeScript strictness, error handling, code organization

**When to use:**
- Before committing code
- Reviewing code for standard compliance
- Refactoring to improve maintainability
- Questions about where code should live
- Ensuring TypeScript strictness
- Checking for architecture violations

**Example prompts:**
```
"Review this service for code quality. Check TypeScript, error handling, JSDoc, and architecture."

"Should this API call live in a service, hook, or component? How does Bini's architecture approach this?"

"This component is 500 lines. How should I refactor it to follow Bini's patterns?"

"Are there any code standard violations in this file?"
```

**What NOT to ask:**
- Design decisions (use Design Agent)
- Testing strategy (use Test Writer)
- Bug diagnosis (use Bug Squasher)

---

### **3. Test Writer Agent** 🧪
**Expertise:** Jest testing, test coverage, unit/integration tests, mocking, edge cases

**When to use:**
- Writing tests for new code
- Achieving 100% hook coverage
- Achieving 80%+ service/component coverage
- Mocking Supabase for tests
- Creating test utilities
- Checking test completeness

**Example prompts:**
```
"Generate comprehensive tests for this hook. Aim for 100% coverage. Include happy path, errors, and edge cases."

"Write tests for this service method. Mock Supabase calls."

"Test this component for rendering, user interactions, and state changes."

"Check if these tests cover all branches and edge cases."
```

**What NOT to ask:**
- Implementation details (use other agents)
- Design questions (use Design Agent)
- Performance optimization (use Performance Agent)

---

### **4. Performance Agent** ⚡
**Expertise:** React Native rendering, Reanimated animations, bundle size, memory management, profiling

**When to use:**
- Optimizing component rendering
- Fixing jank or frame drops
- Reducing bundle size
- Optimizing animations
- Finding performance bottlenecks
- Improving app startup time

**Example prompts:**
```
"This timeline screen feels slow when scrolling. Profile it and suggest optimizations."

"Review this animation. Is it 60 FPS? Should I use Reanimated instead?"

"How can I optimize this FlatList to reduce frame drops?"

"What's causing memory leaks in this component?"
```

**What NOT to ask:**
- Code architecture questions (use Code Quality Agent)
- Testing strategy (use Test Writer)
- Design decisions (use Design Agent)

---

### **5. Documentation Agent** 📚
**Expertise:** JSDoc standards, inline comments, architectural guides, README updates, clarity

**When to use:**
- Adding JSDoc to functions, hooks, and components
- Writing architectural decision documents
- Explaining complex code
- Creating feature guides
- Updating README
- Ensuring documentation completeness

**Example prompts:**
```
"Generate JSDoc for this hook. Include all parameters, return type, and a usage example."

"This feature is complex. Write a guide explaining how it works."

"Review this code. Are JSDoc comments complete? What documentation is missing?"

"Write an architectural decision document for this feature."
```

**What NOT to ask:**
- Code implementation (use other agents)
- Testing strategy (use Test Writer)
- Performance optimization (use Performance Agent)

---

### **6. Bug Squasher Agent** 🐛
**Expertise:** Root cause analysis, debugging, reproduction steps, bug patterns, prevention

**When to use:**
- Investigating mysterious bugs
- Debugging crashes or errors
- Finding root causes
- Creating reproduction steps
- Preventing future bugs
- Understanding error stack traces

**Example prompts:**
```
"The timeline shows blank when there are 10+ tasks. Help me debug this."

"The app crashes when scrolling. Trace the root cause."

"Partner presence sometimes doesn't sync. Why?"

"Analyze this error stack trace and suggest a fix."
```

**What NOT to ask:**
- Implementing fixes (other agents can help write code)
- Design decisions (use Design Agent)
- Testing strategy (use Test Writer)

---

## Optimal Development Workflow

### **Phase 1: Planning** 📋

**Agents to consult:**
1. **Design Agent** - Plan the UI/UX approach
2. **Code Quality Agent** - Plan architecture and code organization

**Questions to ask:**
- "How should I design this feature? What does Benji + Honkish suggest?"
- "What's the best architecture for this? Where should code live?"

---

### **Phase 2: Implementation** 💻

**Primary agent:** Code Quality Agent (keep checking standard compliance)

**Secondary agents:**
- **Design Agent** - As you build, ensure UI matches design philosophy
- **Documentation Agent** - Add JSDoc and comments as you code

**Workflow:**
1. Implement feature following architecture
2. Check with Code Quality Agent for compliance
3. Add Design Agent touches for polish
4. Document with JSDoc as you go

---

### **Phase 3: Testing** ✅

**Primary agent:** Test Writer Agent

**Questions to ask:**
- "Generate comprehensive tests for this hook (need 100% coverage)"
- "Test this service method"

**Result:** All new code has 100% hook coverage, 80%+ service/component coverage

---

### **Phase 4: Optimization** 🚀

**Primary agent:** Performance Agent

**Questions to ask:**
- "Profile this screen. Where are the performance bottlenecks?"
- "Optimize this FlatList"
- "Is this animation 60 FPS?"

---

### **Phase 5: Bug Fixes** 🐛

**Primary agent:** Bug Squasher Agent

**Questions to ask:**
- "Help me debug this. Here's the error..."
- "Why is this happening?"

**Then:** Use Test Writer to add regression test, then revisit Code Quality Agent

---

### **Phase 6: Launch** 🚀

**Agents to consult:**
1. **Documentation Agent** - Final review of docs
2. **Code Quality Agent** - Final code review
3. **Performance Agent** - Final performance check

---

## Real-World Scenarios

### **Scenario 1: Building a New Feature (Task Recurrence)**

```
Step 1: Planning
→ Design Agent: "How should task recurrence look? Benji + Honkish approach?"
→ Code Quality Agent: "Where should recurrence logic live? Types first?"

Step 2: Implementation
→ Code Quality Agent: "Review my service method for standard compliance"
→ Design Agent: "Should I add animations when setting recurrence?"
→ Documentation Agent: "Generate JSDoc for my useRecurrence hook"

Step 3: Testing
→ Test Writer Agent: "Generate tests for this hook (100% coverage)"

Step 4: Optimization
→ Performance Agent: "Is the recurrence selector performant?"

Step 5: Done!
```

---

### **Scenario 2: Debugging a Bug (Tasks Not Syncing)**

```
Step 1: Investigation
→ Bug Squasher Agent: "Tasks aren't syncing to partner. Help me debug."
→ Bug Squasher Agent: "Trace the root cause"

Step 2: Fix
→ Code Quality Agent: "Review my fix for standard compliance"
→ Documentation Agent: "Why did this bug happen? Document it."

Step 3: Prevent Future
→ Test Writer Agent: "Generate test that reproduces this bug"
```

---

### **Scenario 3: Performance Optimization (Timeline Jank)**

```
Step 1: Diagnosis
→ Performance Agent: "Timeline feels janky. Where are the bottlenecks?"

Step 2: Fix
→ Code Quality Agent: "Review my optimizations for correctness"
→ Performance Agent: "Is this faster now? Still 60 FPS?"

Step 3: Test
→ Test Writer Agent: "Generate tests to ensure I didn't break anything"
```

---

## Agent Combination Strategies

### **Building Features** 🏗️
1. **Design Agent** - Plan the UX
2. **Code Quality Agent** - Plan architecture
3. **Implementation** (you) - Write code
4. **Design Agent** - Polish and delight
5. **Documentation Agent** - Add JSDoc
6. **Test Writer Agent** - Generate tests
7. **Code Quality Agent** - Final review
8. **Performance Agent** - Optimize

### **Fixing Bugs** 🐛
1. **Bug Squasher Agent** - Diagnose
2. **Implementation** (you) - Fix
3. **Test Writer Agent** - Add regression test
4. **Code Quality Agent** - Review fix
5. **Performance Agent** - Check impact

### **Refactoring** ♻️
1. **Code Quality Agent** - Identify issues
2. **Implementation** (you) - Refactor
3. **Test Writer Agent** - Ensure tests pass
4. **Performance Agent** - Ensure no regression
5. **Documentation Agent** - Update docs

---

## How to Invoke Agents

In Claude Code, you can invoke agents in a few ways:

### **1. Explicit Invocation** (Recommended)
```
"Use the Design Agent to review this component for Benji + Honkish alignment."

"Ask the Code Quality Agent to check this service for standard compliance."

"Have the Test Writer Agent generate tests for this hook."
```

### **2. Role-Based Request**
```
"Design-wise, how should this look?"  → Automatically consults Design Agent

"Code-quality-wise, is this correct?" → Automatically consults Code Quality Agent
```

### **3. Let Me Route**
I'll automatically route your request to the right agent based on the context:
```
"I built this new feature. Review it."
→ I'll consult multiple agents in optimal order
```

---

## Agent Availability & Limitations

### **What Agents Can Do**
✅ Review code and suggest improvements
✅ Answer architecture questions
✅ Generate code patterns and examples
✅ Debug and trace issues
✅ Design features and interactions
✅ Suggest optimizations
✅ Generate comprehensive documentation

### **What Agents Cannot Do**
❌ Directly edit your files (you do the implementation)
❌ Run code or tests (you run them)
❌ Make business decisions (that's you)
❌ Replace human judgment (they advise, you decide)

---

## Tips for Best Results

### **1. Be Specific**
**Bad:** "Review this code"
**Good:** "Review this service for TypeScript strictness, error handling, and JSDoc completeness"

### **2. Provide Context**
**Bad:** "Why is it slow?"
**Good:** "The timeline scrolls slowly when there are 100+ tasks. It feels like frame drops. What's the bottleneck?"

### **3. Ask for Examples**
**Bad:** "How do I optimize?"
**Good:** "Optimize this FlatList. Show me specific changes and explain why."

### **4. Iterate**
```
You: "Review this code for quality"
Agent: [Suggests improvements]
You: "Can you clarify the TypeScript part?"
Agent: [Explains more]
You: "Now review again"
Agent: [Re-reviews with your feedback]
```

---

## Agent Decision Tree

```
I'm building something new
  ├─ Start with Design Agent (UX/UI approach)
  ├─ Then Code Quality Agent (architecture)
  ├─ Implement
  ├─ Review with Code Quality Agent
  └─ Test with Test Writer Agent

Something is broken
  ├─ Start with Bug Squasher Agent (diagnose)
  ├─ Implement fix
  ├─ Test with Test Writer Agent
  └─ Review with Code Quality Agent

Something feels slow
  ├─ Start with Performance Agent (profile)
  ├─ Implement optimization
  └─ Verify with Performance Agent again

Something is unclear
  ├─ Ask Documentation Agent (explain or generate docs)
  └─ Add JSDoc

Code isn't meeting standards
  ├─ Ask Code Quality Agent (what's wrong?)
  └─ Fix based on guidance
```

---

## Maximum Productivity Workflow

**Every feature or bug fix cycle:**

1. **Clarify**: What am I building / fixing?
2. **Design** (if building): Consult Design Agent
3. **Plan** (if building): Consult Code Quality Agent
4. **Implement**: Write code
5. **Review**: Run Code Quality Agent
6. **Document**: Run Documentation Agent
7. **Test**: Run Test Writer Agent
8. **Optimize**: Run Performance Agent
9. **Bug Check**: Run Bug Squasher to review for common issues
10. **Merge**: Everything passes!

**Time investment:**
- Features: ~20% planning + design, ~30% implementation, ~50% testing/review/docs/optimization
- Bug fixes: ~30% diagnosis, ~30% implementation, ~40% testing/verification

---

## Remember

These agents are **force multipliers**, not replacements for your judgment:

- **You** decide what to build
- **Design Agent** advises on how it should feel
- **You** implement
- **Code Quality Agent** advises on standards
- **You** commit the code

The goal is **speed + quality + confidence** in every feature and fix.

Use them liberally. Ask them questions. Iterate. Build amazing things.

---

## Quick Reference: When to Use Each Agent

| Situation | Primary Agent | Secondary Agents |
|-----------|---------------|------------------|
| New feature | Design Agent | Code Quality Agent, Test Writer Agent |
| Bug fix | Bug Squasher Agent | Test Writer Agent, Code Quality Agent |
| Optimization | Performance Agent | Code Quality Agent |
| Code review | Code Quality Agent | Design Agent, Performance Agent |
| Documentation | Documentation Agent | Code Quality Agent |
| Design decision | Design Agent | Code Quality Agent |
| Test coverage | Test Writer Agent | Code Quality Agent |
| Error analysis | Bug Squasher Agent | Performance Agent |

---

**Your agents are here to make you unstoppable. Use them well.** 🚀
