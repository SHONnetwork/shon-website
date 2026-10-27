# SHON backup and privacy plan

## Laptop cleanup
Keep local historical SHON files in a single archive folder until their contents are compared with the repository. GitHub holds current tracked files and version history, but cannot guarantee it contains drafts never committed. Do not delete personal research, assets, secrets, or source material solely because filenames resemble a project backup.

## Database boundaries
The current Supabase project includes RLS-enabled member profiles, private stories, household preferences, public interest tags, connections, messages, blocks, reports and support records. RLS enabled is not proof that every policy is correct.

## Matching architecture
1. Member-owned private preferences stay private.
2. Explicitly public, consented interests can be compared in Discover.
3. Household compatibility must be computed through a narrowly scoped authenticated service or RPC returning only approved summaries, never raw private questionnaire answers.
4. Reciprocal interest is a separate connection stage.
5. Blocking and visibility rules apply before displaying any candidate.
6. Unknown answers must not be treated as negative matches; protected traits must not be used as exclusions.

## Release gate
Verify permission policies, account save/reload, Discover, matching, messaging, block/report and keyboard access before merging development into main. Do not apply destructive schema changes or publish private records.
