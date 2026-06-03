---
title: "Agentic AI in Offensive Security"
date: 2026-04-22
excerpt: "Autonomous LLM agents are quietly reshaping the operator's toolkit. A field-honest look at where they help, where they fail, and what red teams should actually build first."
tags: ["red-team", "ai", "tradecraft"]
---

Every few years the security industry finds a new thing to be breathless about,
and right now it's agentic AI. The pitch writes itself: an agent that replaces
your junior operator, runs the whole kill chain while you sleep, turns a
five-day engagement into an afternoon. I've sat through enough of these demos to
know where the camera cuts away. It's usually right around the part where
someone spent an hour hand-feeding the model context.

I run a red team, and we use this stuff. So rather than another think piece,
here's the conversation I'd actually have with you over coffee: what these
systems are good at today, where they fall on their face, and the handful of
tools I'd build first if I were standing up an AI-augmented team from scratch.

## What "agentic" actually means

"Agent" is carrying a lot of weight as a word. Strip off the branding and it's a
loop:

1. A model picks the next step.
2. The step runs against some tool: a shell, a browser, an exploit framework, an internal API.
3. The output goes back into the model.
4. Repeat until it decides it's done.

That's the whole trick. Everything interesting lives in the parts nobody demos:
which tools you hand it, how much state it carries between steps, how tightly you
fence in what it's allowed to do, and what happens when it tells you, with total
confidence, that CVE-2024-99999 is the way in. It isn't. It doesn't exist.

## Where it actually earns its keep

I'll be specific, because the generic version of this list is useless.

- **Recon enrichment.** Hand it a domain or an org and it'll fan out across
  passive sources, knock down the duplicates, and give back a structured
  attack-surface summary. That's an afternoon of analyst time back in your
  pocket.
- **Triage of post-ex junk.** Point it at a pile of BloodHound output, beacon
  logs, and screenshots, then ask what's worth a second look. The first pass is
  genuinely good. It won't replace an operator's eye, but it's a real head start.
- **Report drafting.** Not the exec summary, since leadership can smell generated
  prose and so can I, but the per-finding write-ups, the remediation notes, the
  severity rationale. This one alone has handed my team back real hours every
  engagement.
- **A friendlier front door for junior operators.** A natural-language wrapper
  over internal tooling cuts onboarding time without dumbing down what's
  underneath.

## Where it breaks, every single time

If you've run agents against something that fights back, none of this is subtle.

- **It makes things up.** Flags, registry keys, API endpoints, entire
  exploitation paths, all stated with the same confidence as the things that are
  real. In offensive work a confidently wrong command doesn't just waste time. It
  can torch the engagement.
- **It has no feel for detection.** The model has no idea what the SOC sees. Left
  alone it reaches for the loudest path on the board, because that's what showed
  up most in its training data.
- **It can't sit still.** Objective-based campaigns that play out over days need
  patience and restraint, the discipline to do nothing for hours. Agents are
  wired to show progress, and they'll spend your operational security to do it.

## A minimal blueprint I'd actually defend

If I were starting today I wouldn't touch the autonomous-pentester-in-a-box
products. I'd build a few small, focused, auditable agents around the boring
edges of the workflow and leave the judgment calls to people. The shape I keep
coming back to looks like this:

<figure class="not-prose my-10">
  <svg viewBox="0 0 620 560" role="img" aria-label="A minimal agent loop: a goal and a policy feed a planner model. If the plan is not done, each step must clear an approval gate before the tool surface runs it. Every result is written to an append-only audit log that feeds back into the planner." style="width:100%;height:auto;font-family:'Consolas','Cascadia Code','SF Mono',ui-monospace,monospace;">
    <defs>
      <marker id="ah" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
        <path d="M0,0 L10,5 L0,10 z" fill="var(--color-fg-dim)"/>
      </marker>
      <marker id="ah-cy" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
        <path d="M0,0 L10,5 L0,10 z" fill="var(--color-accent)"/>
      </marker>
    </defs>

    <!-- feedback loop (drawn first, sits behind boxes) -->
    <path d="M185,505 L110,505 L110,137 L185,137" fill="none" stroke="var(--color-accent)" stroke-width="1.5" marker-end="url(#ah-cy)"/>
    <text x="103" y="321" transform="rotate(-90 103 321)" text-anchor="middle" fill="var(--color-accent)" font-size="11">result &#8594; context</text>

    <!-- A: goal + policy -->
    <rect x="185" y="20" width="230" height="54" rx="6" fill="var(--color-bg-soft)" stroke="var(--color-accent-2)" stroke-width="1.5"/>
    <text x="300" y="52" text-anchor="middle" fill="var(--color-fg)" font-size="15">goal + policy</text>
    <line x1="300" y1="74" x2="300" y2="108" stroke="var(--color-fg-dim)" stroke-width="1.5" marker-end="url(#ah)"/>

    <!-- B: planner -->
    <rect x="185" y="110" width="230" height="54" rx="6" fill="var(--color-bg-soft)" stroke="var(--color-line)" stroke-width="1"/>
    <text x="300" y="142" text-anchor="middle" fill="var(--color-fg)" font-size="15">planner model</text>
    <line x1="300" y1="164" x2="300" y2="188" stroke="var(--color-fg-dim)" stroke-width="1.5" marker-end="url(#ah)"/>

    <!-- diamond: done? -->
    <polygon points="300,190 358,224 300,258 242,224" fill="var(--color-bg-soft)" stroke="var(--color-line)" stroke-width="1"/>
    <text x="300" y="229" text-anchor="middle" fill="var(--color-fg)" font-size="14">plan.done?</text>

    <!-- yes -> summary -->
    <line x1="358" y1="224" x2="462" y2="224" stroke="var(--color-fg-dim)" stroke-width="1.5" marker-end="url(#ah)"/>
    <text x="404" y="214" text-anchor="middle" fill="var(--color-fg-muted)" font-size="12">yes</text>
    <rect x="466" y="197" width="134" height="54" rx="6" fill="var(--color-bg-soft)" stroke="var(--color-accent-2)" stroke-width="1.5"/>
    <text x="533" y="229" text-anchor="middle" fill="var(--color-fg)" font-size="15">summary</text>

    <!-- no -> approval gate -->
    <line x1="300" y1="258" x2="300" y2="294" stroke="var(--color-fg-dim)" stroke-width="1.5" marker-end="url(#ah)"/>
    <text x="312" y="282" text-anchor="start" fill="var(--color-fg-muted)" font-size="12">no</text>

    <!-- C: approval gate -->
    <rect x="185" y="296" width="230" height="54" rx="6" fill="var(--color-bg-soft)" stroke="var(--color-accent)" stroke-width="1.5"/>
    <text x="300" y="318" text-anchor="middle" fill="var(--color-fg)" font-size="15">approval gate</text>
    <text x="300" y="336" text-anchor="middle" fill="var(--color-fg-dim)" font-size="11">requires_approval</text>
    <line x1="300" y1="350" x2="300" y2="384" stroke="var(--color-fg-dim)" stroke-width="1.5" marker-end="url(#ah)"/>
    <text x="312" y="372" text-anchor="start" fill="var(--color-fg-muted)" font-size="12">approved</text>

    <!-- D: tool surface -->
    <rect x="185" y="386" width="230" height="54" rx="6" fill="var(--color-bg-soft)" stroke="var(--color-line)" stroke-width="1"/>
    <text x="300" y="408" text-anchor="middle" fill="var(--color-fg)" font-size="15">tool surface</text>
    <text x="300" y="426" text-anchor="middle" fill="var(--color-fg-dim)" font-size="11">shell &#183; browser &#183; exploit &#183; api</text>
    <line x1="300" y1="440" x2="300" y2="474" stroke="var(--color-fg-dim)" stroke-width="1.5" marker-end="url(#ah)"/>

    <!-- E: audit log -->
    <rect x="185" y="476" width="230" height="54" rx="6" fill="var(--color-bg-soft)" stroke="var(--color-line)" stroke-width="1"/>
    <text x="300" y="498" text-anchor="middle" fill="var(--color-fg)" font-size="15">audit log</text>
    <text x="300" y="516" text-anchor="middle" fill="var(--color-fg-dim)" font-size="11">append-only</text>
  </svg>
  <figcaption style="text-align:center;font-family:'Consolas','Cascadia Code','SF Mono',ui-monospace,monospace;font-size:12px;color:var(--color-fg-dim);margin-top:0.5rem;">A deliberately boring loop. No autonomous exploitation; every step is gated and logged.</figcaption>
</figure>

Two things matter here, and neither of them is the model. First, every
meaningful action has to clear an approval gate before it runs. Nothing touches a
target without a human saying yes. Second, every step, approved or not, gets
written to an append-only log you can read after the fact. The value isn't in
some clever planner. It's in the policy, the small and deliberate set of tools
you expose, and the paper trail. The model is the least interesting part of the
system, and that's exactly how you want it.

## What this means for the program

None of this changes what the team is for. The job is still the same: prove how
the organization actually gets breached, and prove the defense would catch it.
Agents are a multiplier on the unglamorous half of that work, the recon, the
triage, the writing. They're a liability on the half that needs judgment.

So build for the first half. And be very skeptical of anyone trying to sell you
the second.
</content>
