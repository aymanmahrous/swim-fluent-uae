# P1.3 Preview Runtime Blocker Verification — 2026-08-01

## Classification

`COMPLETED_VERIFIED`

Root-cause class: `VERCEL_POLICY`

Minimum recovery action under the currently allowed choices: `NO_RECOVERY_POSSIBLE`

Reason: the project's configured **Ignored Build Step** explicitly exits successfully for every branch whose ref starts with `agent/`. Vercel interprets that result as an instruction to cancel the deployment before the application build completes. Retrying, redeploying the same source, or pushing another commit to the same `agent/...` branch would execute the same policy and cancel again.

## Target Deployment

| Field | Verified value |
|---|---|
| Project ID | `prj_4wRrALwNzlU0msHb9pGOsExmNID0` |
| Project name | `swim-fluent-uae-w532` |
| Framework | `tanstack-start` |
| Deployment ID | `dpl_96bKps6DXCeAjMjGoQmkver8q1xG` |
| Deployment URL | `https://swim-fluent-uae-w532-k347wc6r2-swimmingayman-8492s-projects.vercel.app` |
| Branch alias | `https://swim-fluent-uae-w532-git-ag-76ca33-swimmingayman-8492s-projects.vercel.app` |
| Commit SHA | `76ac3d4438fdb3cf8a0666cc4c34c56dc4c6a8e5` |
| PR | `#246` |
| Branch | `agent/p1-3-semantic-route-redirect-preview-20260801` |
| Trigger source | `git` / GitHub push |
| Creator | `relaxfixuae` (`LOmliP6nMBglRrVePvDrzwGH`) |
| Region | `iad1` |
| Created time | `2026-08-01T12:52:00.965Z` / `2026-08-01 16:52:00.965 +04:00` |
| Build policy started | `2026-08-01T12:52:02.504Z` |
| Terminal state recorded | `2026-08-01T12:52:04.184Z` |
| Ready state | `CANCELED` |
| Runtime availability | `UNAVAILABLE` |

## Build Evidence

Vercel build logs confirm the following sequence:

1. Build runner started in `iad1`.
2. GitHub repository and exact commit `76ac3d4` were cloned.
3. Clone completed successfully.
4. Previous build cache was restored.
5. Vercel executed the configured Ignored Build Step command:

```text
node -e "const ref=process.env.VERCEL_GIT_COMMIT_REF||'';const projectId=process.env.VERCEL_PROJECT_ID||'';const canonical='prj_4wRrALwNzlU0msHb9pGOsExmNID0';process.exit(ref.startsWith('agent/')||(projectId&&projectId!==canonical)?0:1)"
```

6. Vercel then logged:

```text
The Deployment has been canceled as a result of running the command defined in the "Ignored Build Step" setting.
```

## Required Deployment Fields

| Required field | Verified result |
|---|---|
| Deployment ID | `dpl_96bKps6DXCeAjMjGoQmkver8q1xG` |
| Trigger source | GitHub push (`source=git`) |
| Creator | `relaxfixuae` |
| Created time | `2026-08-01T12:52:00.965Z` |
| Canceled time | Exact dedicated cancellation timestamp not separately exposed; terminal `ready` timestamp is `2026-08-01T12:52:04.184Z` |
| Cancellation reason | Configured Vercel Ignored Build Step matched the `agent/` branch |
| Build started | Yes — clone and ignored-build command ran |
| Application build completed | No |
| Logs availability | Yes — build logs available |
| Runtime availability | No |

## Root-Cause Decision

### Selected classification

`VERCEL_POLICY`

### Rejected classifications

- `MANUAL_CANCELLATION`: rejected; logs explicitly attribute cancellation to Ignored Build Step.
- `SUPERSEDED_BY_NEWER_DEPLOYMENT`: rejected; the exact-head deployment is the latest deployment for the official project and no newer valid runtime for this SHA exists.
- `BUILD_FAILURE`: rejected; no compiler/build failure occurred. The build was intentionally stopped before application build.
- `QUOTA_LIMIT`: rejected; no quota or billing message appears.
- `CONFIGURATION_ERROR`: rejected as primary classification; the policy is functioning exactly as configured.
- `UNKNOWN_WITH_EVIDENCE`: rejected; the cause is explicit.

## Newer Deployment Check

- Newer valid deployment for commit `76ac3d4438fdb3cf8a0666cc4c34c56dc4c6a8e5`: `NOT_FOUND`
- Newer valid deployment for branch `agent/p1-3-semantic-route-redirect-preview-20260801`: `NOT_FOUND`
- Official project's current latest deployment remains `dpl_96bKps6DXCeAjMjGoQmkver8q1xG`, state `CANCELED`.
- Earlier deployments from the same branch were also canceled by the same branch-policy behavior.
- No secondary-project runtime for the final exact HEAD was found.

## Minimum Recovery Analysis

| Candidate action | Result |
|---|---|
| Retry Deployment | Insufficient; the same ignored-build command will run and cancel again. |
| Redeploy Existing Build | Impossible as a runtime recovery; no completed application build exists for this deployment. |
| Push New Commit | Insufficient while the branch still begins with `agent/`; policy will cancel again. |
| No Recovery Possible | **Selected under current policy and permitted action list.** |

A testable Preview requires a separate approved change outside this evidence batch, such as changing/bypassing the Ignored Build Step policy for this branch or building the exact commit from a ref not matched by the policy. Neither action was executed.

## Safety Receipt

- No Retry.
- No Redeploy.
- No new code push.
- No redirect changes.
- No sitemap changes.
- No Analytics changes.
- No Production deployment or write.
- No merge.
- PR #246 remains Draft and unmodified.
- This evidence file was added only to the existing evidence branch `agent/p1-3-preview-http-browser-receipts-20260801`.
