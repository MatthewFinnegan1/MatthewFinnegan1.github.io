#!/usr/bin/env bash

set -euo pipefail

readonly image_limit=$((500 * 1024))
readonly video_limit=$((6 * 1024 * 1024))
readonly hero_limit=$((250 * 1024))

failed=0

check_file() {
  local file=$1
  local limit=$2
  local label=$3
  local size

  size=$(wc -c < "$file" | tr -d ' ')
  if (( size > limit )); then
    printf 'ERROR: %s is %s bytes; %s budget is %s bytes.\n' "$file" "$size" "$label" "$limit"
    failed=1
  fi
}

while IFS= read -r -d '' file; do
  check_file "$file" "$image_limit" "image"
done < <(find assets/img -type f \( -iname '*.jpg' -o -iname '*.jpeg' -o -iname '*.png' -o -iname '*.webp' -o -iname '*.avif' \) -print0)

while IFS= read -r -d '' file; do
  check_file "$file" "$video_limit" "video"
done < <(find assets/img -type f \( -iname '*.mp4' -o -iname '*.m4v' -o -iname '*.webm' \) -print0)

check_file "assets/img/profile/profile-hero-800.jpg" "$hero_limit" "hero image"

if (( failed )); then
  exit 1
fi

printf 'Media budgets passed.\n'
