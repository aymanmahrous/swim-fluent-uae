<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

# Mandatory Project Continuation Rules

This file is binding operational guidance for every AI agent, automation, developer, reviewer, or tool working in this repository.

## 1. Do not restart the project

Before proposing or making any change, read and follow:

1. `PROJECT_HANDOFF.md`
2. `PROJECT_STRATEGY_HANDOFF.md`
3. `docs/program/PROJECT_DIRECTOR_AUTHORITY_AND_AGENT_CONTINUATION_HANDOFF.md`
4. Program Board Issue #54 and the exact Issues, PRs, deployments, and evidence referenced by the Handoff

Do not rebuild, redesign, replace the architecture, create a duplicate system of record, or begin from zero. Continue from the latest verified GitHub and Vercel state.

## 2. Owner delegation and project director

The project owner has delegated day-to-day project coordination and execution management to the Main Project Director recorded in the authority Handoff.

The Main Project Director may prioritize work, divide workstreams, conduct read-only audits, maintain Issues and documentation, reject conflicting or unsafe proposals, prepare small isolated branches and Draft PRs, and require evidence before work is described as complete.

This delegation does not override protected owner approvals. Explicit owner approval remains required for Production deployment or promotion, protected merges, Production migrations or writes, credentials, secrets or environment changes, legal acceptance, Privacy or Consent acceptance, Analytics activation, real bookings or customer records, publishing or scheduling, outbound WhatsApp, email or SMS, Ads, billing, spend, and irreversible external actions.

## 3. Mandatory work discipline

- Use evidence-first status. An Issue, plan, assignment, or agent statement is not proof of delivery.
- Keep each PR small, isolated, reversible, and limited to one workstream.
- Do not merge automatically.
- Do not deploy or write to Production automatically.
- Do not modify external accounts or enable integrations without the required approval.
- Do not invent facts, credentials, claims, locations, prices, qualifications, legal conclusions, or business data.
- Stop and report conflicts, unsafe scope, missing evidence, duplicated work, or Production risk.
- Update the operational Handoff after every major approved phase.

## 4. Long text and context-preservation rule

When instructions, reports, audit results, plans, decision packs, or generated text become long enough that chat context may be lost or truncated, the agent must notify the owner before continuing the long exchange.

The agent must recommend that the long material be placed in a dedicated page, document, Issue, PR description, or repository Markdown file. Once the owner sends or opens that page or document, the agent must use it as the continuation source instead of restarting or asking the owner to repeat prior work.

The agent must:

- preserve the original source link or file path;
- summarize the current state and next action at the top;
- record decisions, approvals, blockers, evidence, and unresolved questions;
- avoid splitting one authoritative plan across many disconnected chats;
- never claim that omitted or truncated text was reviewed;
- clearly state when only part of a long source was available.

## 5. New-agent startup checklist

Every new agent must, before acting:

1. Read the three mandatory Handoff and governance files.
2. Inspect the latest relevant branch, PR, CI, Preview, Production, and Issue evidence.
3. Confirm the current approved strategy and protected gates.
4. Identify the single next authorized action.
5. Check for file overlap or duplicate work with open PRs.
6. Work in an isolated branch or Draft PR when code or repository content changes.
7. Report what was inspected, what changed, validation performed, and what remains protected.

If these steps cannot be completed, the agent must remain read-only and report the blocker rather than improvising.