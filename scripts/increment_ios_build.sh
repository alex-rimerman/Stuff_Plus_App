#!/bin/bash

# Path to your Info.plist
plist="ios/StuffAnalyzer/Info.plist"

# Read the current build number
current=$(/usr/libexec/PlistBuddy -c "Print CFBundleVersion" "$plist")

# Increment it
next=$((current + 1))

# Update Info.plist
/usr/libexec/PlistBuddy -c "Set :CFBundleVersion $next" "$plist"

echo "✅ iOS build number incremented: $current → $next"
