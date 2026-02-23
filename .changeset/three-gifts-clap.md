---
'@web/browser-logs': patch
---

Avoid browser crashes when serializing browser logs of complex objects

If we are seeing too many object iterations, we know something is off. This can
happen when we are seeing e.g. large linked lists where every element recursively
has access to the full list again. This will not quickly yield circular early bail-outs,
but instead result in the stringification to take LOTS of processing time and results
in browser crashes. We should limit object iterations for this reason, and instead expect
people to inspect such logs in the browser directly.

Related #2798.
