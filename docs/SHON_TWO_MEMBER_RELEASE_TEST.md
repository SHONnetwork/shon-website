# SHON two-member release acceptance test

Run against the development branch using two dedicated test accounts, A and B. Do not use real member private data. Record date, browser, test accounts (aliases only), results, and evidence. Registration and sign-in were previously confirmed by the site owner; do only a quick regression check.

## Acceptance journey

1. A and B sign in separately, preferably in isolated browser profiles. Each opts into public directory and supplies only synthetic profile data.
2. Public Discover shows opted-in public fields. Verify private story, private questionnaire, and private interest tags never appear. Turn off public interest visibility and check again.
3. A requests a connection to B. Before acceptance, attempt `shon_start_conversation` and a direct message insert from A's own authenticated browser client. Both must fail at the database, not merely hide buttons.
4. B accepts. Both accounts see accepted connection. A starts a conversation, sends a unique test message; B receives it, replies, and A sees the reply after refresh.
5. B blocks A. Both new conversation attempts and new message inserts must fail. Messenger should close or disable the conversation. Verify the same directly through the authenticated client.
6. Remove the block. Confirm behavior follows the accepted-connection state, and verify revoked/declined connection does not authorize new messages.
7. Repeat with A and B swapped. Refresh, sign out, and sign back in between critical steps.
8. Check narrow-screen and keyboard-only navigation of Discover, Connections, and Messenger. Verify no browser console errors and no unexpected exposure of private records.

## Release decision

Mark each step PASS/FAIL with evidence. Do not merge to main unless authorization and privacy tests pass. Any untested step stays OPEN; a code review is not a substitute for an authenticated two-account test.
