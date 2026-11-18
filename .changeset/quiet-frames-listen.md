---
'@web/storybook-builder': patch
---

Pass the `security.insecureIframeMessaging` option of the Storybook config to the preview. Storybook 9.1.21 reads it as the `INSECURE_IFRAME_MESSAGING` global.
