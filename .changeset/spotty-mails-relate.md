---
'@fake-scope/fake-pkg': patch
---

fix: convert fileUrl to path before compile, close #753
fix: remove baseUrl from esm to keep module import specifier, cause it use tsc resolver.
