import { DESK_DISPLAY_REPOSITORY } from "@/constants/update";

export function getReleaseAssetUrl(version: string) {
  return `https://github.com/${DESK_DISPLAY_REPOSITORY}/releases/download/v${version}/desk-display-${version}.tar.gz`;
}
