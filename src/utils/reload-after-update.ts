import { fetchInstalledVersion } from "@/utils/fetch-installed-version";

export async function reloadAfterUpdate(version: string) {
  for (let attempt = 0; attempt < 80; attempt += 1) {
    await new Promise((resolve) => window.setTimeout(resolve, 1_500));

    try {
      if ((await fetchInstalledVersion()) === version) {
        window.location.reload();
        return;
      }
    } catch {
      // The server is expected to be unavailable during the restart.
    }
  }

  window.location.reload();
}
