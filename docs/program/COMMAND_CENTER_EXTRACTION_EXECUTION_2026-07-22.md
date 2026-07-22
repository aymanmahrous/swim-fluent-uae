# Command Center Hub Extraction Execution

Date: 2026-07-22

## Objective

Extract the internal Relax Fix Command Center Hub into a separate private repository and independent deployment without changing the current public Production deployment.

## Safety baseline

- Source repository: `aymanmahrous/swim-fluent-uae`
- Source baseline: `493289513970042475828358ffcfe31afa1a694e`
- Working branch: `migration/command-center-extraction`
- Production branch `main` remains untouched.
- No Vercel deployment, Supabase migration, database write, secret rotation, or DNS change is authorized in this preparation step.

## Internal application scope

Routes identified for extraction:

- `/staff`
- `/forgot-password` where required by staff authentication
- `/os`
- `/os/inbox`
- `/os/crm`
- `/os/analytics`
- `/os/content`
- `/os/automations`
- `/os/planner`
- `/os/media`
- `/os/integrations`

The extraction must include only the dependencies required by these routes, including authentication guards, RBAC, internal API handlers, platform services, UI components, and required Supabase contracts.

## Exclusions

The independent Command Center repository must not include public-site concerns unless they are shared prerequisites that are intentionally refactored:

- Arabic and English public landing pages
- Public SEO and marketing metadata
- Public booking UI
- Public chatbot/sales assistant
- Replit-specific generated files
- `.env`, `.env.local`, credentials, tokens, private keys, session material, or production data
- `node_modules`, build output, uploaded attachments, or generated route artifacts that can be recreated

## Target architecture

- New private repository: `aymanmahrous/relaxfix-command-center-hub`
- Independent Vercel project and deployment
- Suggested internal domain: `hub.relaxfixuae.com`
- Separate environment-variable set
- Supabase may be shared initially only with the existing staff authentication and RBAC boundaries preserved
- Public Production site remains on `www.relaxfixuae.com`

## Execution gates

1. Create the new private GitHub repository.
2. Inventory imports and transitive dependencies for the internal routes.
3. Copy the minimum runnable application into the new repository on a migration branch.
4. Add an environment-variable example without values.
5. Run install, typecheck, lint, tests, and production build.
6. Verify unauthenticated access is blocked.
7. Verify authenticated staff routes with an Owner-controlled session.
8. Create a separate Vercel project only after the repository passes checks.
9. Configure a temporary non-production URL first.
10. Move to `hub.relaxfixuae.com` only after acceptance.
11. Remove internal routes from the public repository in a later, separate PR only after the independent app is proven stable.

## Current status

- Safe extraction branch created from the latest Production source baseline.
- Production is unchanged.
- Destination repository creation is the next required action.
