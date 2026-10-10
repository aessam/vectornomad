# Hook Metrics

Append-only log. Each row = one hook invocation. Analyze with `python3 scripts/hooks_metrics_summary.py`.

| timestamp_ms | hook | event | target | duration_ms | exit | mode | notes |
|---|---|---|---|---|---|---|---|
| 1791665021827 | post-bash-cost-detect | PostToolUse | mkdir -p .github/workflows .claude scripts src/data/feeds sr | 48 | 0 | informational | non-paid |
| 1791665030083 | pre-bash-python-venv | PreToolUse | cd /private/tmp/claude-501/-Users-aessam-tmp-MyWebsite/d985e | 47 | 0 | informational | non-python |
| 1791665191835 | post-bash-cost-detect | PostToolUse | cd /private/tmp/claude-501/-Users-aessam-tmp-MyWebsite/d985e | 41 | 0 | informational | non-paid |
| 1791665191914 | pre-bash-python-venv | PreToolUse | cat > scripts/fetch-feeds.mjs <<'EOF'// Pulls the three pub | 42 | 0 | informational | non-python |
| 1791665192017 | post-bash-cost-detect | PostToolUse | cat > scripts/fetch-feeds.mjs <<'EOF'// Pulls the three pub | 43 | 0 | informational | non-paid |
| 1791665192095 | pre-bash-python-venv | PreToolUse | cat > src/content.config.ts <<'EOF'import { defineCollectio | 45 | 0 | informational | non-python |
| 1791665192235 | post-bash-cost-detect | PostToolUse | cat > src/content.config.ts <<'EOF'import { defineCollectio | 51 | 0 | informational | non-paid |
| 1791665192316 | pre-bash-python-venv | PreToolUse | cat > src/pages/index.astro <<'EOF'---import Layout from ' | 41 | 0 | informational | non-python |
| 1791665192473 | post-bash-cost-detect | PostToolUse | cat > src/pages/index.astro <<'EOF'---import Layout from ' | 51 | 0 | informational | non-paid |
| 1791665208110 | pre-bash-python-venv | PreToolUse | python3 - <<'PY'import re,iop='scripts/fetch-feeds.mjs's= | 49 | 2 | blocking | no venv |
| 1791665213296 | pre-write-config-guard | PreToolUse | /Users/aessam/tmp/MyWebsite/scripts/fetch-feeds.mjs | 45 | 0 | advisory | non-sensitive |
| 1791665213382 | post-edit-lint | PostToolUse | ~/tmp/MyWebsite/scripts/fetch-feeds.mjs | 41 | 0 | advisory | ext skipped |
| 1791665216955 | pre-bash-python-venv | PreToolUse | npm install 2>&1  tail -3 && echo "=== smoke" && scripts/sm | 47 | 0 | informational | non-python |
| 1791665235657 | post-bash-cost-detect | PostToolUse | npm install 2>&1  tail -3 && echo "=== smoke" && scripts/sm | 39 | 0 | informational | non-paid |
| 1791665249903 | pre-write-config-guard | PreToolUse | /Users/aessam/tmp/MyWebsite/scripts/fetch-feeds.mjs | 50 | 0 | advisory | non-sensitive |
| 1791665280171 | post-edit-lint | PostToolUse | ~/tmp/MyWebsite/scripts/fetch-feeds.mjs | 47 | 0 | advisory | ext skipped |
| 1791665280250 | pre-write-config-guard | PreToolUse | /Users/aessam/tmp/MyWebsite/.github/workflows/build.yml | 40 | 0 | advisory | non-sensitive |
| 1791665280331 | post-edit-lint | PostToolUse | ~/tmp/MyWebsite/.github/workflows/build.yml | 42 | 0 | advisory | ext skipped |
| 1791665280406 | pre-bash-python-venv | PreToolUse | node -e "const a=require('/var/folders/ll/cs92d_x12t77646gcv | 40 | 0 | informational | non-python |
| 1791665280559 | post-bash-cost-detect | PostToolUse | node -e "const a=require('/var/folders/ll/cs92d_x12t77646gcv | 38 | 0 | informational | non-paid |
| 1791665280632 | pre-bash-python-venv | PreToolUse | cat > ADR.md <<'EOF'# ADR## 2026-10-10 DSCN-1: Astro, sta | 39 | 0 | informational | non-python |
| 1791665280739 | post-bash-cost-detect | PostToolUse | cat > ADR.md <<'EOF'# ADR## 2026-10-10 DSCN-1: Astro, sta | 42 | 0 | informational | non-paid |
| 1791665307887 | pre-bash-python-venv | PreToolUse | scripts/smoke-feeds.sh /private/tmp/claude-501/-Users-aessam | 45 | 0 | informational | non-python |
| 1791665308605 | post-bash-cost-detect | PostToolUse | scripts/smoke-feeds.sh /private/tmp/claude-501/-Users-aessam | 42 | 0 | informational | non-paid |
| 1791665323803 | pre-bash-python-venv | PreToolUse | node -e "const {XMLParser}=require('fast-xml-parser');const | 46 | 0 | informational | non-python |
| 1791665324200 | post-bash-cost-detect | PostToolUse | node -e "const {XMLParser}=require('fast-xml-parser');const | 42 | 0 | informational | non-paid |
| 1791665333568 | pre-write-config-guard | PreToolUse | /Users/aessam/tmp/MyWebsite/scripts/fetch-feeds.mjs | 47 | 0 | advisory | non-sensitive |
| 1791665333646 | post-edit-lint | PostToolUse | ~/tmp/MyWebsite/scripts/fetch-feeds.mjs | 42 | 0 | advisory | ext skipped |
| 1791665337746 | pre-bash-python-venv | PreToolUse | scripts/smoke-feeds.sh /private/tmp/claude-501/-Users-aessam | 47 | 0 | informational | non-python |
| 1791665338654 | post-bash-cost-detect | PostToolUse | scripts/smoke-feeds.sh /private/tmp/claude-501/-Users-aessam | 41 | 0 | informational | non-paid |
| 1791665448966 | pre-bash-python-venv | PreToolUse | git ls-files  grep -E '^(package-lock.json.github/workflow | 52 | 0 | informational | non-python |
