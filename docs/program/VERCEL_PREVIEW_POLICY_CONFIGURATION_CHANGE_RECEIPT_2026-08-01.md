# VERCEL PREVIEW POLICY CONFIGURATION CHANGE RECEIPT — 2026-08-01

## Owner decision

- Decision: `OPTION_B_APPROVED_IN_PRINCIPLE`
- Approval date: 2026-08-01
- Approved intent: allow Preview builds only in the canonical official Vercel project while keeping the secondary project suppressed and preserving Production protections.

## Canonical project

- Name: `swim-fluent-uae-w532`
- Project ID: `prj_4wRrALwNzlU0msHb9pGOsExmNID0`

## Secondary project

- Name: `swim-fluent-uae`
- Project ID: `prj_HrvwRKrf0NueBmwjX18ARNRef9Fy`

## Current Ignored Build Step expression

```text
node -e "const ref=process.env.VERCEL_GIT_COMMIT_REF||'';const projectId=process.env.VERCEL_PROJECT_ID||'';const canonical='prj_4wRrALwNzlU0msHb9pGOsExmNID0';process.exit(ref.startsWith('agent/')||(projectId&&projectId!==canonical)?0:1)"
```

### Current behavior

| Context | Result |
|---|---|
| Canonical project + `agent/*` branch | Ignored / canceled |
| Canonical project + non-`agent/*` branch | Build allowed |
| Secondary project + any branch | Ignored / canceled |
| Production promotion | Governed separately; unchanged |

## Proposed expression

```text
node -e "const projectId=process.env.VERCEL_PROJECT_ID||'';const canonical='prj_4wRrALwNzlU0msHb9pGOsExmNID0';process.exit(projectId&&projectId!==canonical?0:1)"
```

### Proposed behavior

| Context | Result |
|---|---|
| Canonical project + `agent/*` branch | Preview build allowed |
| Canonical project + non-`agent/*` branch | Build allowed as before |
| Secondary project + any branch | Ignored / canceled |
| Production promotion | Unchanged and separately protected |

## Rollback expression

```text
node -e "const ref=process.env.VERCEL_GIT_COMMIT_REF||'';const projectId=process.env.VERCEL_PROJECT_ID||'';const canonical='prj_4wRrALwNzlU0msHb9pGOsExmNID0';process.exit(ref.startsWith('agent/')||(projectId&&projectId!==canonical)?0:1)"
```

## Canonical-project proof

The failed exact-head Preview deployment `dpl_96bKps6DXCeAjMjGoQmkver8q1xG` belongs to project `prj_4wRrALwNzlU0msHb9pGOsExmNID0` and commit `76ac3d4438fdb3cf8a0666cc4c34c56dc4c6a8e5` on branch `agent/p1-3-semantic-route-redirect-preview-20260801`.

## Secondary-project suppression proof

The proposed expression retains the explicit condition that returns the Ignore signal whenever `VERCEL_PROJECT_ID` is present and differs from the canonical project ID. Therefore project `prj_HrvwRKrf0NueBmwjX18ARNRef9Fy` remains suppressed.

## Production-protection proof

This proposed change affects only the Ignored Build Step decision for canonical-project builds. It does not:

- merge any PR;
- promote any Preview to Production;
- change Production branch settings;
- alter Production domains;
- modify secrets;
- modify database, Supabase, permissions, publishing, scheduling, Analytics, Ads, billing, or spend controls.

## Application status

- Applied timestamp: `NOT_APPLIED`
- Reason: the connected Vercel toolset exposes read-only project/deployment inspection and deployment creation, but no project-settings mutation capability for updating the Ignored Build Step command. No authenticated Vercel CLI or token is available in the execution environment.
- No manual UI action was attempted.
- No Retry, Redeploy, Push, code change, branch creation, PR creation, PR modification, merge, or Production action was performed.

## Verification target

- Commit SHA: `76ac3d4438fdb3cf8a0666cc4c34c56dc4c6a8e5`
- Branch: `agent/p1-3-semantic-route-redirect-preview-20260801`

## Verification deployment receipt

- Deployment ID: `NOT_CREATED`
- Preview URL: `NOT_AVAILABLE`
- State: `NOT_VERIFIED`
- Timestamp: `NOT_AVAILABLE`

## Final verdict

`BLOCKED_BY_TOOLING — CONFIGURATION_CHANGE_NOT_APPLIED`

The exact current, proposed, and rollback expressions are documented and validated logically. The minimum remaining action is a single authenticated Vercel project-settings update on canonical project `prj_4wRrALwNzlU0msHb9pGOsExmNID0`, followed by one exact-head Preview build for commit `76ac3d4438fdb3cf8a0666cc4c34c56dc4c6a8e5`.