# Credits plan (2026-09-03)

Branch: feat/credits
Plan: docs/superpowers/plans/2026-09-03-credits.md
Base: 0d213ce

Task 1: complete (commits 0d213ce..d57fb22, review clean)
Minors: parsePackKind test only covers pack_10; typecheck not in report
Task 2: complete (commits d57fb22..8b3d6a0, review clean)
Minors: test title "failed e pending" only asserts failed (plan-mandated)
Task 3: complete (commits 8b3d6a0..ac8dd6f, review clean)
Minors: stubs always-allow until Task 5
Task 4: complete (commits ac8dd6f..2189b6a, review clean)
Minors: instanceof CreditsRequiredError; unchecked session returning; credit increment after flip not row-checked
Task 5: complete (commits 2189b6a..dafc2d2, review clean)
Minors: deleteUploadedFile in same try as persist can lie about "nada foi cobrado"
Task 6: complete (commits dafc2d2..3d4bf33, review clean)
Minors: orphan pending if MP create fails; webhook never marks failed; webhook unauthenticated MP lookup; uncaught JSON parse
Task 7: complete (commits 3d4bf33..9465c60, review clean after fix 9465c60)
Minors: duplicated safeNextPath; unused amountCents; raw English payment status
Task 8: complete (commits 9465c60..34df32d, review clean)

Final review: Critical/Important fixed in 262e919
All tasks complete. Remaining minors:
- parsePackKind test only covers pack_10
- test title "failed e pending" only asserts failed
- instanceof CreditsRequiredError
- deleteUploadedFile in same try as persist
- orphan pending if MP create fails; webhook never marks failed
- duplicated safeNextPath; unused amountCents; raw English payment status
