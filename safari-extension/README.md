# Safari Extension

## Build & Run

1. Open the Xcode project:
   ```
   open "Bitbucket Conventional Commits/Bitbucket Conventional Commits.xcodeproj"
   ```

2. In Xcode, press **⌘R** to build and run

3. Restart Safari when prompted

## Enable the Extension

1. **Safari → Settings → Extensions** → check "Bitbucket Conventional Commits"

2. **Safari → Develop → Allow Unsigned Extensions**
   (Enable Develop menu in Safari → Settings → Advanced if you don't see it)

> Note: "Allow Unsigned Extensions" resets each time Safari restarts.

## Rebuilding After Code Changes

If you update the extension code:

```bash
pnpm build-safari
```

Then in Xcode, press **⌘R** again to rebuild.
