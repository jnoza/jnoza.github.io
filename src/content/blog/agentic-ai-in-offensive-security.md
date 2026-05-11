---
title: "Agentic AI in Offensive Security"
date: 2026-04-22
excerpt: "Autonomous LLM agents are quietly reshaping the operator's toolkit. A field-honest look at where they help, where they fail, and what red teams should actually build first."
tags: ["red-team", "ai", "tradecraft"]
---

There is a particular kind of hype cycle that the security industry runs on,
and "agentic AI" is squarely in the middle of one right now. Vendors will tell
you their agent can replace a junior operator. Twitter threads will tell you
your job is at risk. Conference talks will demo a flashy end-to-end pwn that
quietly skips over the parts where a human typed for an hour.

This post is the version I would give a senior operator over coffee: what
agentic systems actually do well in offensive engagements today, where they
fall apart, and the small set of internal tools I would build first if I were
standing up an "AI-augmented red team" function in 2026.

## What "agentic" actually means here

Strip away the marketing and an agent is just a loop:

1. A planner LLM decides the next step.
2. The step is dispatched to a tool — a shell, a browser, an exploit framework, an internal API.
3. The result is fed back into the model.
4. Repeat until a stop condition.

That is it. The interesting questions are all in the seams: what tools you
expose, how much state you let the model carry, how you constrain the action
space, and what you do when the model confidently hallucinates a CVE that
does not exist.

## Where agents are genuinely useful right now

A short, honest list.

- **Recon enrichment.** Given a domain or org, an agent is excellent at fanning
  out across passive sources, deduping noise, and producing a structured
  attack-surface summary that a human would spend an afternoon on.
- **Log and artifact triage.** Pointing an agent at a directory of post-ex
  output (Bloodhound dumps, beacon logs, screenshots) and asking "what is
  interesting and why" produces a surprisingly good first pass.
- **Report drafting.** Not the executive summary &mdash; that still needs a
  human &mdash; but the per-finding prose, remediation notes, and severity
  rationale. This alone has bought my team back real hours.
- **Tool wrappers for junior operators.** A natural-language front-end over
  internal tooling shortens onboarding without watering down the underlying
  tradecraft.

## Where they break, every time

The failure modes are not subtle if you have actually run agents in
adversarial environments.

- **Fabricated tradecraft.** Models will cheerfully invent flag combinations,
  registry keys, and API endpoints that do not exist. In offensive work, a
  confidently wrong command often burns the engagement.
- **No theory of detection.** An agent has no intuition for what a SOC will
  see. It will pick the loudest possible path because it worked in training
  data.
- **Long-horizon planning.** Multi-day, objective-based campaigns require
  patience, restraint, and the willingness to do nothing for hours. Agents
  optimize for visible progress and burn down operational security in the
  process.

## A minimal, defensible blueprint

If I were starting today, I would not buy the autonomous-pentester product.
I would build a small set of focused, auditable agents around the boring
parts of the workflow. Something like this, in pseudocode:

```python
# A deliberately minimal agent loop.
# No autonomous exploitation. Every tool call is logged
# and gated by a policy the team can read.

from dataclasses import dataclass
from typing import Callable

@dataclass
class Tool:
    name: str
    run: Callable[[str], str]
    requires_approval: bool = False

def run_agent(goal: str, tools: list[Tool], policy, llm, max_steps: int = 12):
    history = [{"role": "system", "content": policy}]
    history.append({"role": "user", "content": goal})

    for step in range(max_steps):
        plan = llm.plan(history)
        if plan.done:
            return plan.summary

        tool = next((t for t in tools if t.name == plan.tool), None)
        if tool is None:
            history.append({"role": "system", "content": f"unknown tool: {plan.tool}"})
            continue

        if tool.requires_approval and not human_approves(plan):
            history.append({"role": "system", "content": "operator declined step"})
            continue

        result = tool.run(plan.args)
        history.append({"role": "tool", "name": tool.name, "content": result})

    return "max_steps_reached"
```

Two things to notice. First, every meaningful action passes through
`requires_approval`. Second, the loop does nothing clever &mdash; the value
is in the *policy*, the *tool surface*, and the *audit trail*, not in the
model.

## What this means for the program

Agentic AI does not change the answer to the question "what is this team for?"
The job is still: **prove how the organization would be breached, and prove
that the defense would catch it.** Agents are a force multiplier on the
unglamorous half of that job &mdash; the recon, the triage, the writing &mdash;
and they are a liability on the half that requires judgment.

Build for the first half. Be skeptical of anyone selling you the second.
