#!/bin/bash

# Check if all required environment variables are set
if [ -z "$FB_API_KEY" ] || \
   [ -z "$FB_AUTH_DOMAIN" ] || \
   [ -z "$FB_PROJECT_ID" ] || \
   [ -z "$FB_STORAGE_BUCKET" ] || \
   [ -z "$FB_MESSAGING_SENDER_ID" ] || \
   [ -z "$FB_APP_ID" ] || \
   [ -z "$FB_MEASUREMENT_ID" ]; then
  echo "Error: One or more Firebase environment variables are not set."
  echo "Please set all required FB_* variables (e.g., FB_API_KEY, FB_AUTH_DOMAIN, etc.)."
  exit 1
fi

# Define source and destination files
TEMPLATE_FILE="src/lib/firebase.template.ts"
OUTPUT_FILE="src/lib/firebase.ts"

# Perform replacements using sed
sed -e "s|__FB_API_KEY__|${FB_API_KEY}|g" \
    -e "s|__FB_AUTH_DOMAIN__|${FB_AUTH_DOMAIN}|g" \
    -e "s|__FB_PROJECT_ID__|${FB_PROJECT_ID}|g" \
    -e "s|__FB_STORAGE_BUCKET__|${FB_STORAGE_BUCKET}|g" \
    -e "s|__FB_MESSAGING_SENDER_ID__|${FB_MESSAGING_SENDER_ID}|g" \
    -e "s|__FB_APP_ID__|${FB_APP_ID}|g" \
    -e "s|__FB_MEASUREMENT_ID__|${FB_MEASUREMENT_ID}|g" \
    "$TEMPLATE_FILE" > "$OUTPUT_FILE"

echo "Firebase config generated successfully: $OUTPUT_FILE"
