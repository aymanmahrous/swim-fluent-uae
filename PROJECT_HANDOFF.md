git switch feat/phase2-pulse
git pull --ff-only origin feat/phase2-pulse

Copy-Item PROJECT_HANDOFF.md PROJECT_HANDOFF.md.phase2-backup

Get-Content docs/program/PROJECT_HANDOFF_PHASE2_APPEND.patch -Raw | apply_patch

git diff -- PROJECT_HANDOFF.md
git add PROJECT_HANDOFF.md
git commit -m "docs: add Phase 2 pulse evidence to handoff"
git push origin feat/phase2-pulse
