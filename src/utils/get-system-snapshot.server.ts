import "@tanstack/react-start/server-only";

import { readFile } from "node:fs/promises";
import {
  cpus,
  freemem,
  hostname,
  loadavg,
  networkInterfaces,
  totalmem,
  uptime,
} from "node:os";

import type { NetworkConnectionType, SystemSnapshot } from "@/types/system";

type ActiveNetwork = {
  address: string;
  interfaceName: string;
  type: NetworkConnectionType;
};

function getNetworkType(interfaceName: string): NetworkConnectionType {
  if (/^(wlan|wlp|wlx|wifi)/i.test(interfaceName)) return "wifi";
  if (/^(eth|enp|eno|ens|end)/i.test(interfaceName)) return "ethernet";
  return "other";
}

function getActiveNetwork(): ActiveNetwork | null {
  const activeNetworks = Object.entries(networkInterfaces()).flatMap(
    ([interfaceName, addresses]) =>
      (addresses ?? [])
        .filter((address) => address.family === "IPv4" && !address.internal)
        .map((address) => ({
          address: address.address,
          interfaceName,
          type: getNetworkType(interfaceName),
        })),
  );
  const priority: Record<NetworkConnectionType, number> = {
    ethernet: 0,
    wifi: 1,
    other: 2,
    offline: 3,
  };

  return (
    activeNetworks.sort(
      (left, right) => priority[left.type] - priority[right.type],
    )[0] ?? null
  );
}

async function getCpuTemperature() {
  try {
    const rawTemperature = await readFile(
      "/sys/class/thermal/thermal_zone0/temp",
      "utf8",
    );
    const temperature = Number.parseFloat(rawTemperature.trim());

    if (!Number.isFinite(temperature)) return null;
    return temperature > 1_000 ? temperature / 1_000 : temperature;
  } catch {
    return null;
  }
}

async function getAvailableMemory(totalMemoryBytes: number) {
  try {
    const memoryInfo = await readFile("/proc/meminfo", "utf8");
    const availableKilobytes = Number.parseInt(
      memoryInfo.match(/^MemAvailable:\s+(\d+)\s+kB$/m)?.[1] ?? "",
      10,
    );

    if (Number.isFinite(availableKilobytes)) {
      return Math.min(totalMemoryBytes, availableKilobytes * 1_024);
    }
  } catch {
    // Non-Linux development environments do not expose /proc/meminfo.
  }

  return freemem();
}

export async function getSystemSnapshot(): Promise<SystemSnapshot> {
  const activeNetwork = getActiveNetwork();
  const cpuCount = Math.max(1, cpus().length);
  const totalMemoryBytes = totalmem();
  const [cpuTemperatureCelsius, availableMemoryBytes] = await Promise.all([
    getCpuTemperature(),
    getAvailableMemory(totalMemoryBytes),
  ]);

  return {
    cpuLoadPercent: Math.min(100, Math.max(0, (loadavg()[0] / cpuCount) * 100)),
    cpuTemperatureCelsius,
    freeMemoryBytes: availableMemoryBytes,
    hostname: hostname(),
    ipAddress: activeNetwork?.address ?? null,
    networkInterface: activeNetwork?.interfaceName ?? null,
    networkType: activeNetwork?.type ?? "offline",
    totalMemoryBytes,
    updatedAt: new Date().toISOString(),
    uptimeSeconds: uptime(),
  };
}
