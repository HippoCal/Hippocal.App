# HippoCal – Deploy Setup (GitHub Actions + Fastlane)

This app is built and released to the app stores via **GitHub Actions + Fastlane**
(replacing Ionic Appflow). This document lists everything needed to run the
pipeline.

- Android release workflow: `.github/workflows/release.yml`
- Fastlane lanes: `fastlane/Fastfile` (`android deploy`, `ios beta`)
- Package / bundle id: `de.hippocal.app`

---

## 1. Toolchain (Capacitor 8)

The build requires (also reflected in the CI runner):

| Tool | Version |
|------|---------|
| Node.js | 22+ |
| JDK | 21 |
| Android Gradle Plugin | 8.13.0 |
| Gradle | 8.14.3 |
| Android Studio | Otter (2025.2.1)+ |
| Xcode (iOS) | 26+ |
| CocoaPods (iOS) | latest |

SDK levels: `minSdk 24`, `compileSdk 36`, `targetSdk 36` (see `android/variables.gradle`).

---

## 2. Android – required GitHub Secrets

Repo → **Settings → Secrets and variables → Actions → New repository secret**:

| Secret | Content |
|--------|---------|
| `ANDROID_KEYSTORE_BASE64` | Upload keystore (`.jks`) as base64 (see §4) |
| `ANDROID_KEYSTORE_PASSWORD` | Keystore (store) password |
| `ANDROID_KEY_ALIAS` | Key alias |
| `ANDROID_KEY_PASSWORD` | Key password |
| `PLAY_SERVICE_ACCOUNT_JSON` | Full JSON of the Google Play service account (see §3) |

The workflow decodes the keystore + service account into temp files and passes
their paths to Gradle/Fastlane via env vars (`ANDROID_KEYSTORE_PATH`,
`SUPPLY_JSON_KEY`). The Gradle signing config in `android/app/build.gradle` reads
these env vars; without them the release build stays unsigned (so local debug
builds are unaffected).

---

## 3. Google Play service account

1. Play Console → **Setup → API access**.
2. Create (or link) a Google Cloud service account.
3. Grant it access with at least **Release** permissions for the app.
4. Create a JSON key for the service account and download it.
5. Paste the **entire JSON** into the `PLAY_SERVICE_ACCOUNT_JSON` secret.

> First upload only: an app must have had at least one manual AAB upload in the
> Play Console before the API can push builds. HippoCal already exists on Play
> (previously via Appflow), so API uploads work out of the box.

---

## 4. ⚠️ Upload key – must match Play App Signing

With **Play App Signing** (almost certainly enabled), Google holds the *app
signing key*; you upload with an **upload key**. The AAB produced by CI **must be
signed with the same upload key that Appflow used**, otherwise Play rejects it
with *"upload certificate mismatch"*.

- If you already hold that keystore → use exactly that one.
- If Appflow generated/held it → export it from Appflow, **or** request an
  **upload key reset** in Play Console (Setup → App integrity → App signing →
  reset upload key).

Encode the keystore for the secret:

```bash
base64 -w0 upload.jks          # Linux
base64 -i upload.jks | pbcopy  # macOS
```

> Never commit the keystore or the service-account JSON. `.gitignore` already
> excludes `*.jks`, `*.keystore`, and `fastlane/*.json`.

---

## 5. Trigger a release

**Manually:** Actions → *Android Release* → **Run workflow** → choose a track
(`internal` / `alpha` / `beta` / `production`).

**By tag:**

```bash
git tag v6.6.0
git push origin v6.6.0
```

Recommended flow: ship to **internal** first, verify, then promote to
**production** (either re-run on the production track or promote inside Play
Console).

Run Fastlane locally (after `npm run build` + `npx cap sync android`):

```bash
bundle install
bundle exec fastlane android deploy track:internal
```

---

## 6. iOS (optional – not yet wired into CI)

The `ios beta` lane (TestFlight) exists in `fastlane/Fastfile` but needs a
**macOS runner** and code signing. To enable:

1. Add a macOS job (`runs-on: macos-latest`) that runs `npm ci`, `npm run build`,
   `npx cap sync ios`, `pod install`, then `bundle exec fastlane ios beta`.
2. **App Store Connect API key** (`.p8`) → secrets `ASC_KEY_ID`, `ASC_ISSUER_ID`,
   `ASC_KEY_CONTENT` (base64 of the `.p8`).
3. **Code signing** via `fastlane match` (certs/profiles in a private repo) or
   manual certificates + provisioning profiles.

Deployment target is iOS 15.0 (`ios/App/App.xcodeproj`, `ios/App/Podfile`).

---

## 7. Local build & 16 KB verification

Unsigned build (just to verify it compiles):

```bash
npm ci
npm run build
npx cap sync android
cd android && ./gradlew :app:bundleRelease
```

**Signed** build locally — pass the keystore as Gradle properties (preferred over
env vars: they are read per-build, so no `--gradlew stop` daemon dance and no
`ANDROID_KEYSTORE_*` env caching):

```bash
cd android && ./gradlew :app:bundleRelease \
  -PRELEASE_STORE_FILE=/absolute/path/hippocal.keystore \
  -PRELEASE_STORE_PASSWORD=... \
  -PRELEASE_KEY_ALIAS=hippocal \
  -PRELEASE_KEY_PASSWORD=...
```

`build.gradle` reads these properties first and falls back to the `ANDROID_KEYSTORE_*`
env vars. Use an **absolute** `RELEASE_STORE_FILE` path (relative paths resolve
against `android/app/`). Verify the result: `jarsigner -verify <aab>` → `jar verified.`

The AAB is written to `android/app/build/outputs/bundle/release/app-release.aab`.

Verify the native libraries are 16 KB aligned (Android 15+ requirement) — both
`.so` must report `0x4000`:

```bash
find app/build/intermediates/merged_native_libs/release -name '*.so' \
  -exec sh -c 'echo "== $1 =="; readelf -lW "$1" | awk "/LOAD/{print \$NF}" | sort -u' _ {} \;
```

The 16 KB-aligned libs come from `@capacitor-mlkit/barcode-scanning@8.1.0`
(MLKit 17.3.0 / CameraX 1.5.2). No manual version overrides are needed.

---

## 8. Troubleshooting

| Symptom | Cause / fix |
|---------|-------------|
| `upload certificate mismatch` (Play) | Wrong upload key — see §4 |
| `You need to upload an APK/AAB first` | First upload must be manual in Play Console (n/a for existing app) |
| `.so` shows `0x1000` in readelf | Old native libs — ensure barcode-scanning is `8.1.0`, no version overrides in `variables.gradle` |
| Node/Angular engine warnings in CI | Angular 17 officially supports Node 18/20; usually builds on Node 22. If it fails, build web assets on Node 20 in a separate step |
| Content behind status/nav bar | Edge-to-edge (API 35+) — handle via CSS safe-area insets; check `android/app/src/main/res/values/styles.xml` |
