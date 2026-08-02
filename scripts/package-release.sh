#!/bin/sh
set -eu

version="${1:-}"

if ! printf '%s\n' "$version" | grep -Eq '^[0-9]+\.[0-9]+\.[0-9]+$'; then
  echo "Version must use major.minor.patch" >&2
  exit 1
fi

package_version="$(node -p "require('./package.json').version")"

if [ "$version" != "$package_version" ]; then
  echo "Release version $version does not match package.json $package_version" >&2
  exit 1
fi

if [ ! -f .output/server/index.mjs ]; then
  echo "Run npm run build before packaging a release" >&2
  exit 1
fi

release_directory="dist/release"
staging_directory="$release_directory/staging"
archive_name="desk-display-$version.tar.gz"
archive_path="$release_directory/$archive_name"
manifest_path="$release_directory/desk-display-release.json"

rm -rf "$release_directory"
mkdir -p "$staging_directory"
cp -R .output "$staging_directory/.output"
printf '%s\n' "$version" > "$staging_directory/VERSION"

tar \
  -czf "$archive_path" \
  -C "$staging_directory" \
  .output VERSION

if command -v sha256sum >/dev/null 2>&1; then
  checksum="$(sha256sum "$archive_path" | awk '{ print $1 }')"
else
  checksum="$(shasum -a 256 "$archive_path" | awk '{ print $1 }')"
fi

printf '{\n  "version": "%s",\n  "sha256": "%s"\n}\n' \
  "$version" \
  "$checksum" \
  > "$manifest_path"

rm -rf "$staging_directory"
printf '%s\n' "$archive_path" "$manifest_path"
