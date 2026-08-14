#!/usr/bin/env bash
# Produce a sideloadable APK at build/apk/yodo.apk
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

export JAVA_HOME="${JAVA_HOME:-$HOME/.local/jdk-17}"
export ANDROID_HOME="${ANDROID_HOME:-$HOME/Android/Sdk}"
export ANDROID_SDK_ROOT="$ANDROID_HOME"
export PATH="$JAVA_HOME/bin:$ANDROID_HOME/cmdline-tools/latest/bin:$ANDROID_HOME/platform-tools:$PATH"

if [[ ! -x "$JAVA_HOME/bin/java" ]]; then
  echo "JDK 17 not found at $JAVA_HOME. Install Temurin 17 there, or set JAVA_HOME." >&2
  exit 1
fi
if [[ ! -d "$ANDROID_HOME/platforms/android-36" ]]; then
  echo "Android SDK not found at $ANDROID_HOME. Install platform 36, build-tools 36.0.0, and NDK 27.1.12297006." >&2
  exit 1
fi

echo "==> Generating native Android project"
CI=1 npx expo prebuild --platform android --non-interactive --clean

printf 'sdk.dir=%s\n' "$ANDROID_HOME" > android/local.properties
if ! grep -q '^org.gradle.java.home=' android/gradle.properties; then
  printf '\norg.gradle.java.home=%s\n' "$JAVA_HOME" >> android/gradle.properties
fi

echo "==> Assembling release APK"
cd android
./gradlew :app:assembleRelease --no-daemon

mkdir -p "$ROOT/build/apk"
cp -f "$ROOT/android/app/build/outputs/apk/release/app-release.apk" "$ROOT/build/apk/yodo.apk"
echo "==> APK: $ROOT/build/apk/yodo.apk"
ls -lh "$ROOT/build/apk/yodo.apk"
