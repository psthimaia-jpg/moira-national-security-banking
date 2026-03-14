import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Activity,
  AlertCircle,
  Battery,
  BatteryCharging,
  CheckCircle2,
  Clock,
  Fingerprint,
  MapPin,
  OctagonX,
  Radio,
  Smartphone,
  Sun,
  Wifi,
  WifiOff,
  XCircle,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { useGetSensorEvents, useLogSensorEvent } from "../../hooks/useQueries";
import AVEVABehavioralSensibility from "../AVEVABehavioralSensibility";
import LexusIgnition from "../LexusIgnition";

// ── Sensor types ──────────────────────────────────────────────
interface SensorData {
  id: string;
  name: string;
  icon: React.ComponentType<{
    className?: string;
    style?: React.CSSProperties;
  }>;
  value: string;
  status: "active" | "warning" | "error" | "unavailable" | "pending";
  detail?: string;
  lastUpdated: number;
}

function formatEventTime(ts: bigint): string {
  const ms = Number(ts / BigInt(1_000_000));
  if (!ms || Number.isNaN(ms)) return "just now";
  const diff = Date.now() - ms;
  if (diff < 60000) return `${Math.floor(diff / 1000)}s ago`;
  if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
  return new Date(ms).toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

const STATUS_CONFIG = {
  active: {
    color: "oklch(0.65 0.16 150)",
    bg: "oklch(0.65 0.16 150 / 0.15)",
    label: "Active",
    icon: CheckCircle2,
  },
  warning: {
    color: "oklch(0.78 0.12 75)",
    bg: "oklch(0.78 0.12 75 / 0.15)",
    label: "Warning",
    icon: AlertCircle,
  },
  error: {
    color: "oklch(0.65 0.22 15)",
    bg: "oklch(0.65 0.22 15 / 0.15)",
    label: "Error",
    icon: XCircle,
  },
  unavailable: {
    color: "oklch(0.45 0.04 255)",
    bg: "oklch(0.45 0.04 255 / 0.1)",
    label: "Unavailable",
    icon: XCircle,
  },
  pending: {
    color: "oklch(0.6 0.04 255)",
    bg: "oklch(0.6 0.04 255 / 0.1)",
    label: "Pending",
    icon: Clock,
  },
};

declare global {
  interface Window {
    AmbientLightSensor?: new () => {
      illuminance: number;
      onreading: (() => void) | null;
      onerror: ((e: Event) => void) | null;
      start(): void;
    };
  }
  interface Navigator {
    connection?: {
      effectiveType?: string;
      type?: string;
      downlink?: number;
      addEventListener?: (event: string, handler: () => void) => void;
      removeEventListener?: (event: string, handler: () => void) => void;
    };
    getBattery?: () => Promise<{
      level: number;
      charging: boolean;
      addEventListener: (event: string, handler: () => void) => void;
      removeEventListener: (event: string, handler: () => void) => void;
    }>;
  }
}

interface SensorsPageProps {
  inactionActive?: boolean;
  bioStatus?: "NORMAL" | "ELEVATED" | "DISTRESS";
}

export default function SensorsPage({
  inactionActive = false,
  bioStatus = "NORMAL",
}: SensorsPageProps) {
  const [sensors, setSensors] = useState<Record<string, SensorData>>({
    network: {
      id: "network",
      name: "Network Status",
      icon: Wifi,
      value: "Checking...",
      status: "pending",
      lastUpdated: Date.now(),
    },
    battery: {
      id: "battery",
      name: "Battery",
      icon: Battery,
      value: "Checking...",
      status: "pending",
      lastUpdated: Date.now(),
    },
    motion: {
      id: "motion",
      name: "Device Motion",
      icon: Activity,
      value: "Waiting...",
      status: "pending",
      lastUpdated: Date.now(),
    },
    light: {
      id: "light",
      name: "Ambient Light",
      icon: Sun,
      value: "Checking...",
      status: "pending",
      lastUpdated: Date.now(),
    },
    location: {
      id: "location",
      name: "Geolocation",
      icon: MapPin,
      value: "Not enabled",
      status: "pending",
      lastUpdated: Date.now(),
    },
    orientation: {
      id: "orientation",
      name: "Screen Orientation",
      icon: Smartphone,
      value: "Checking...",
      status: "pending",
      lastUpdated: Date.now(),
    },
  });

  const logSensorEvent = useLogSensorEvent();
  const sensorEventsQuery = useGetSensorEvents();
  const batteryRef = useRef<{ level: number; charging: boolean } | null>(null);

  const updateSensor = useCallback(
    (id: string, update: Partial<SensorData>) => {
      setSensors((prev) => ({
        ...prev,
        [id]: { ...prev[id], ...update, lastUpdated: Date.now() },
      }));
    },
    [],
  );

  // Network sensor
  useEffect(() => {
    const updateNetwork = () => {
      const conn = navigator.connection;
      const isOnline = navigator.onLine;
      const type =
        conn?.effectiveType ??
        conn?.type ??
        (isOnline ? "Connected" : "Offline");
      const downlink = conn?.downlink ? ` · ${conn.downlink}Mbps` : "";

      updateSensor("network", {
        value: isOnline ? `${type.toUpperCase()}${downlink}` : "Offline",
        status: isOnline ? "active" : "error",
        icon: isOnline ? Wifi : WifiOff,
        detail: isOnline ? `Connected via ${type}` : "No network connection",
      });
    };

    updateNetwork();
    window.addEventListener("online", updateNetwork);
    window.addEventListener("offline", updateNetwork);
    navigator.connection?.addEventListener?.("change", updateNetwork);

    return () => {
      window.removeEventListener("online", updateNetwork);
      window.removeEventListener("offline", updateNetwork);
    };
  }, [updateSensor]);

  // Battery sensor
  // biome-ignore lint/correctness/useExhaustiveDependencies: intentionally run once
  useEffect(() => {
    const initBattery = async () => {
      try {
        if (!navigator.getBattery) {
          updateSensor("battery", {
            value: "Not supported",
            status: "unavailable",
            detail: "Battery API unavailable",
          });
          return;
        }

        const battery = await navigator.getBattery();
        batteryRef.current = {
          level: battery.level,
          charging: battery.charging,
        };

        const updateBattery = () => {
          const pct = Math.round(battery.level * 100);
          const status = pct > 20 ? "active" : pct > 10 ? "warning" : "error";
          batteryRef.current = {
            level: battery.level,
            charging: battery.charging,
          };

          updateSensor("battery", {
            value: `${pct}%${battery.charging ? " ⚡" : ""}`,
            status,
            icon: battery.charging ? BatteryCharging : Battery,
            detail: battery.charging
              ? "Currently charging"
              : `${pct}% remaining`,
          });

          // Auto-log significant changes
          void logSensorEvent.mutateAsync({
            eventType: "battery",
            value: `${pct}% | charging: ${battery.charging}`,
          });
        };

        updateBattery();
        battery.addEventListener("levelchange", updateBattery);
        battery.addEventListener("chargingchange", updateBattery);
      } catch (_err) {
        updateSensor("battery", {
          value: "Access denied",
          status: "unavailable",
          detail: "Battery permission denied",
        });
      }
    };

    void initBattery();
  }, [updateSensor]);

  // Device motion sensor
  useEffect(() => {
    let motionHandler: ((e: DeviceMotionEvent) => void) | null = null;

    const enableMotion = async () => {
      // iOS 13+ requires permission
      if (
        typeof DeviceMotionEvent !== "undefined" &&
        "requestPermission" in DeviceMotionEvent
      ) {
        try {
          // @ts-expect-error iOS specific API
          const perm = await DeviceMotionEvent.requestPermission();
          if (perm !== "granted") {
            updateSensor("motion", {
              value: "Permission denied",
              status: "unavailable",
              detail: "Motion access not granted",
            });
            return;
          }
        } catch {
          updateSensor("motion", {
            value: "Not available",
            status: "unavailable",
          });
          return;
        }
      }

      if (typeof DeviceMotionEvent === "undefined") {
        updateSensor("motion", {
          value: "Not supported",
          status: "unavailable",
          detail: "DeviceMotion API unavailable",
        });
        return;
      }

      motionHandler = (e: DeviceMotionEvent) => {
        const acc = e.accelerationIncludingGravity;
        if (acc) {
          const x = acc.x?.toFixed(1) ?? "0";
          const y = acc.y?.toFixed(1) ?? "0";
          const z = acc.z?.toFixed(1) ?? "0";
          updateSensor("motion", {
            value: `X:${x} Y:${y} Z:${z}`,
            status: "active",
            detail: `Acceleration: ${x}, ${y}, ${z} m/s²`,
          });
        }
      };

      window.addEventListener("devicemotion", motionHandler);
      updateSensor("motion", {
        value: "Monitoring",
        status: "active",
        detail: "Reading device accelerometer",
      });
    };

    void enableMotion();

    return () => {
      if (motionHandler) {
        window.removeEventListener("devicemotion", motionHandler);
      }
    };
  }, [updateSensor]);

  // Ambient light sensor
  useEffect(() => {
    if (typeof window.AmbientLightSensor !== "undefined") {
      try {
        const sensor = new window.AmbientLightSensor!();
        sensor.onreading = () => {
          updateSensor("light", {
            value: `${sensor.illuminance.toFixed(0)} lux`,
            status: "active",
            detail: `Ambient: ${sensor.illuminance.toFixed(0)} lux`,
          });
        };
        sensor.onerror = () => {
          updateSensor("light", {
            value: "Access denied",
            status: "unavailable",
            detail: "Light sensor permission denied",
          });
        };
        sensor.start();
      } catch {
        updateSensor("light", {
          value: "Not supported",
          status: "unavailable",
          detail: "AmbientLight API unavailable",
        });
      }
    } else {
      updateSensor("light", {
        value: "Not supported",
        status: "unavailable",
        detail: "AmbientLightSensor API not available in this browser",
      });
    }
  }, [updateSensor]);

  // Screen orientation
  useEffect(() => {
    const updateOrientation = () => {
      const orientation = screen.orientation?.type ?? "unknown";
      const isPortrait =
        orientation.includes("portrait") ||
        window.innerHeight > window.innerWidth;
      updateSensor("orientation", {
        value: isPortrait ? "Portrait" : "Landscape",
        status: "active",
        detail: `${orientation} · ${window.innerWidth}×${window.innerHeight}`,
      });
    };

    updateOrientation();
    window.addEventListener("orientationchange", updateOrientation);
    window.addEventListener("resize", updateOrientation);

    return () => {
      window.removeEventListener("orientationchange", updateOrientation);
      window.removeEventListener("resize", updateOrientation);
    };
  }, [updateSensor]);

  // Geolocation
  const requestLocation = useCallback(async () => {
    // Guard: geolocation API may not exist in all environments
    if (!navigator.geolocation) {
      updateSensor("location", {
        value: "Not supported",
        status: "unavailable",
        detail: "Geolocation API unavailable in this browser",
      });
      return;
    }

    updateSensor("location", { value: "Requesting...", status: "pending" });
    try {
      const pos = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          timeout: 10000,
          enableHighAccuracy: false,
        });
      });
      const { latitude, longitude, accuracy } = pos.coords;
      updateSensor("location", {
        value: `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`,
        status: "active",
        detail: `Accuracy: ±${accuracy.toFixed(0)}m`,
      });
      await logSensorEvent.mutateAsync({
        eventType: "geolocation",
        value: `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`,
      });
    } catch (err) {
      const msg =
        typeof GeolocationPositionError !== "undefined" &&
        err instanceof GeolocationPositionError
          ? err.message
          : "Location access denied or unavailable";
      updateSensor("location", {
        value: "Access denied",
        status: "unavailable",
        detail: msg,
      });
    }
  }, [updateSensor, logSensorEvent]);

  // Auto-log network on init - run once
  // biome-ignore lint/correctness/useExhaustiveDependencies: intentionally run once
  useEffect(() => {
    void logSensorEvent.mutateAsync({
      eventType: "network",
      value: navigator.onLine ? "online" : "offline",
    });
    void logSensorEvent.mutateAsync({
      eventType: "orientation",
      value: window.innerHeight > window.innerWidth ? "portrait" : "landscape",
    });
  }, []);

  const handleLogEvent = async (sensorId: string) => {
    const sensor = sensors[sensorId];
    try {
      await logSensorEvent.mutateAsync({
        eventType: sensor.id,
        value: sensor.value,
      });
      toast.success(`${sensor.name} event logged`);
    } catch {
      toast.error("Failed to log event");
    }
  };

  const sensorList = Object.values(sensors);
  const activeSensors = sensorList.filter((s) => s.status === "active").length;
  const recentEvents = (sensorEventsQuery.data ?? []).slice(-5).reverse();

  return (
    <div className="pb-4">
      {/* Inaction Safety Banner */}
      {inactionActive && (
        <div
          className="flex items-center gap-2 px-3 py-2 text-[10px] font-mono-code font-bold uppercase tracking-widest"
          style={{
            background: "oklch(0.13 0.03 20 / 0.9)",
            borderBottom: "1px solid oklch(0.62 0.2 18 / 0.4)",
            color: "oklch(0.75 0.18 18)",
          }}
        >
          <OctagonX className="w-3 h-3 flex-shrink-0" />
          Inaction Safety engaged — sensor logging paused
        </div>
      )}
      {/* Header */}
      <div className="px-3 pt-3 pb-2">
        <div className="flex items-center justify-between mb-1">
          <h1 className="font-display font-bold text-lg text-foreground">
            Device Sensors
          </h1>
          <div className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-[oklch(0.65_0.16_150_/_0.15)] border border-[oklch(0.65_0.16_150_/_0.3)]">
            <div className="w-1.5 h-1.5 rounded-full bg-[oklch(0.65_0.16_150)] animate-pulse-dot" />
            <span className="text-[10px] font-body font-medium text-[oklch(0.65_0.16_150)]">
              {activeSensors}/{sensorList.length} Active
            </span>
          </div>
        </div>
        <p className="text-[11px] text-muted-foreground font-body">
          Real-time device sensor monitoring · v50+
        </p>
      </div>

      {/* ── Lexus Ignition Sequence ──────────────────────────── */}
      <LexusIgnition />

      {/* ── M-Sim Biometric Binding Card ──────────────────────── */}
      <div className="px-3 mb-2">
        <motion.div
          data-ocid="sensors.msim_binding.card"
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="rounded-xl p-3"
          style={{
            background: "oklch(0.10 0.015 255)",
            border: "1px solid oklch(0.72 0.18 200 / 0.35)",
            boxShadow: "0 0 16px oklch(0.72 0.18 200 / 0.08)",
          }}
        >
          {/* Card header */}
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <div
                className="w-7 h-7 rounded-lg flex items-center justify-center"
                style={{
                  background: "oklch(0.72 0.18 200 / 0.15)",
                  border: "1px solid oklch(0.72 0.18 200 / 0.4)",
                }}
              >
                <Fingerprint
                  className="w-3.5 h-3.5"
                  style={{ color: "oklch(0.72 0.18 200)" }}
                />
              </div>
              <div>
                <span
                  className="text-[11px] font-mono-code font-bold tracking-wider"
                  style={{ color: "oklch(0.72 0.18 200)" }}
                >
                  M-Sim Biometric Binding
                </span>
                <div
                  className="text-[8px] font-mono-code tracking-widest"
                  style={{ color: "oklch(0.4 0.06 200)" }}
                >
                  DEMO — Simulated hardware binding
                </div>
              </div>
            </div>
            {/* Binding result badge */}
            <motion.div
              data-ocid="sensors.msim_binding.status.badge"
              animate={bioStatus === "DISTRESS" ? { opacity: [1, 0.5, 1] } : {}}
              transition={{ duration: 0.8, repeat: Number.POSITIVE_INFINITY }}
              className="px-2 py-0.5 rounded-full text-[8px] font-mono-code font-bold flex-shrink-0"
              style={{
                background:
                  bioStatus === "NORMAL"
                    ? "oklch(0.65 0.16 150 / 0.15)"
                    : bioStatus === "ELEVATED"
                      ? "oklch(0.78 0.12 75 / 0.15)"
                      : "oklch(0.65 0.22 15 / 0.18)",
                border:
                  bioStatus === "NORMAL"
                    ? "1px solid oklch(0.65 0.16 150 / 0.4)"
                    : bioStatus === "ELEVATED"
                      ? "1px solid oklch(0.78 0.12 75 / 0.4)"
                      : "1px solid oklch(0.65 0.22 15 / 0.5)",
                color:
                  bioStatus === "NORMAL"
                    ? "oklch(0.72 0.16 150)"
                    : bioStatus === "ELEVATED"
                      ? "oklch(0.78 0.12 75)"
                      : "oklch(0.75 0.18 18)",
              }}
            >
              {bioStatus === "NORMAL"
                ? "BOUND"
                : bioStatus === "ELEVATED"
                  ? "CAUTION"
                  : "MISMATCH"}
            </motion.div>
          </div>

          {/* Status fields grid */}
          <div className="grid grid-cols-2 gap-2 mb-2">
            {/* M-Sim Key */}
            <div
              className="rounded-lg p-2"
              style={{
                background: "oklch(0.13 0.02 255)",
                border: "1px solid oklch(0.65 0.16 150 / 0.25)",
              }}
            >
              <div
                className="text-[8px] font-mono-code tracking-widest uppercase mb-1"
                style={{ color: "oklch(0.45 0.04 255)" }}
              >
                M-Sim Key
              </div>
              <div className="flex items-center gap-1.5">
                <div
                  className="w-1.5 h-1.5 rounded-full"
                  style={{ background: "oklch(0.65 0.16 150)" }}
                />
                <span
                  className="text-[10px] font-mono-code font-bold"
                  style={{ color: "oklch(0.65 0.16 150)" }}
                >
                  ACTIVE
                </span>
              </div>
            </div>

            {/* Bio Pulse */}
            <div
              className="rounded-lg p-2"
              style={{
                background: "oklch(0.13 0.02 255)",
                border: `1px solid ${
                  bioStatus === "NORMAL"
                    ? "oklch(0.65 0.16 150 / 0.25)"
                    : bioStatus === "ELEVATED"
                      ? "oklch(0.78 0.12 75 / 0.3)"
                      : "oklch(0.65 0.22 15 / 0.35)"
                }`,
              }}
            >
              <div
                className="text-[8px] font-mono-code tracking-widest uppercase mb-1"
                style={{ color: "oklch(0.45 0.04 255)" }}
              >
                Bio Pulse
              </div>
              <div className="flex items-center gap-1.5">
                <motion.div
                  className="w-1.5 h-1.5 rounded-full"
                  style={{
                    background:
                      bioStatus === "NORMAL"
                        ? "oklch(0.65 0.16 150)"
                        : bioStatus === "ELEVATED"
                          ? "oklch(0.78 0.12 75)"
                          : "oklch(0.65 0.22 15)",
                  }}
                  animate={
                    bioStatus === "DISTRESS" ? { opacity: [1, 0.3, 1] } : {}
                  }
                  transition={{
                    duration: 0.8,
                    repeat: Number.POSITIVE_INFINITY,
                  }}
                />
                <span
                  className="text-[10px] font-mono-code font-bold"
                  style={{
                    color:
                      bioStatus === "NORMAL"
                        ? "oklch(0.65 0.16 150)"
                        : bioStatus === "ELEVATED"
                          ? "oklch(0.78 0.12 75)"
                          : "oklch(0.75 0.18 18)",
                  }}
                >
                  {bioStatus === "NORMAL"
                    ? "PEACEFUL"
                    : bioStatus === "ELEVATED"
                      ? "ELEVATED"
                      : "STRESS"}
                </span>
              </div>
            </div>
          </div>

          {/* Binding result message */}
          <div
            className="rounded-lg px-2.5 py-2"
            style={{
              background:
                bioStatus === "NORMAL"
                  ? "oklch(0.11 0.02 150 / 0.5)"
                  : bioStatus === "ELEVATED"
                    ? "oklch(0.12 0.025 75 / 0.5)"
                    : "oklch(0.12 0.03 18 / 0.6)",
              border:
                bioStatus === "NORMAL"
                  ? "1px solid oklch(0.45 0.12 150 / 0.3)"
                  : bioStatus === "ELEVATED"
                    ? "1px solid oklch(0.55 0.1 75 / 0.35)"
                    : "1px solid oklch(0.55 0.18 18 / 0.4)",
            }}
          >
            <p
              className="text-[9px] font-mono-code font-bold"
              style={{
                color:
                  bioStatus === "NORMAL"
                    ? "oklch(0.7 0.16 150)"
                    : bioStatus === "ELEVATED"
                      ? "oklch(0.78 0.12 75)"
                      : "oklch(0.75 0.18 18)",
              }}
            >
              {bioStatus === "NORMAL"
                ? "BOUND — High-value transactions permitted"
                : bioStatus === "ELEVATED"
                  ? "CAUTION — Manual verification required"
                  : "MISMATCH — Inaction Safety auto-engaged"}
            </p>
          </div>
        </motion.div>
      </div>

      {/* u2550u2550 AVEVA BEHAVIORAL SENSIBILITY u2550u2550 */}
      <AVEVABehavioralSensibility />
      {/* Sensor cards */}
      <div className="px-3 space-y-2">
        {sensorList.map((sensor) => {
          const Icon = sensor.icon;
          const statusCfg = STATUS_CONFIG[sensor.status];
          const StatusIcon = statusCfg.icon;

          return (
            <motion.div
              key={sensor.id}
              layout
              className="rounded-xl overflow-hidden"
              style={{
                background: "oklch(0.16 0.022 255)",
                border: "1px solid oklch(0.26 0.03 255)",
              }}
            >
              <div className="p-3">
                <div className="flex items-start gap-3">
                  {/* Icon */}
                  <div
                    className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ background: statusCfg.bg }}
                  >
                    <Icon
                      className="w-4.5 h-4.5"
                      style={{ color: statusCfg.color }}
                    />
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-0.5">
                      <span className="text-xs font-body font-medium text-foreground">
                        {sensor.name}
                      </span>
                      <div className="flex items-center gap-1">
                        <StatusIcon
                          className="w-3 h-3"
                          style={{ color: statusCfg.color }}
                        />
                        <span
                          className="text-[10px] font-body"
                          style={{ color: statusCfg.color }}
                        >
                          {statusCfg.label}
                        </span>
                      </div>
                    </div>

                    <motion.p
                      key={sensor.value}
                      initial={{ opacity: 0.5 }}
                      animate={{ opacity: 1 }}
                      className="font-mono-code text-xs text-foreground font-medium"
                      style={{
                        color:
                          sensor.status === "active"
                            ? "oklch(0.95 0.01 255)"
                            : "oklch(0.55 0.04 255)",
                      }}
                    >
                      {sensor.value}
                    </motion.p>

                    {sensor.detail && (
                      <p className="text-[10px] text-muted-foreground font-body mt-0.5 truncate">
                        {sensor.detail}
                      </p>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div
                  className="flex items-center justify-between mt-2.5 pt-2 border-t"
                  style={{ borderColor: "oklch(0.22 0.025 255)" }}
                >
                  {sensor.id === "location" && sensor.status !== "active" ? (
                    <button
                      type="button"
                      onClick={requestLocation}
                      className="text-[10px] font-body font-medium text-gold hover:text-gold/80 transition-colors"
                    >
                      Enable Location →
                    </button>
                  ) : (
                    <span className="text-[9px] font-mono-code text-muted-foreground">
                      Updated{" "}
                      {Math.floor((Date.now() - sensor.lastUpdated) / 1000)}s
                      ago
                    </span>
                  )}

                  <button
                    type="button"
                    onClick={() => {
                      if (!inactionActive) void handleLogEvent(sensor.id);
                    }}
                    disabled={logSensorEvent.isPending || inactionActive}
                    className="text-[10px] font-body font-medium px-2 py-1 rounded-md transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                    style={{
                      background: "oklch(0.22 0.028 255)",
                      color: "oklch(0.7 0.08 255)",
                    }}
                  >
                    Log Event
                  </button>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Sensor Event Log */}
      <div className="px-3 mt-4">
        <div className="flex items-center gap-2 mb-2">
          <Radio className="w-3.5 h-3.5 text-gold" />
          <h2 className="text-xs font-display font-semibold text-foreground uppercase tracking-widest">
            Recent Events
          </h2>
        </div>

        <div
          className="rounded-xl overflow-hidden"
          style={{
            background: "oklch(0.14 0.02 255)",
            border: "1px solid oklch(0.22 0.025 255)",
          }}
        >
          {sensorEventsQuery.isLoading ? (
            <div className="p-3 space-y-2">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-8 w-full bg-navy-raised" />
              ))}
            </div>
          ) : recentEvents.length === 0 ? (
            <div className="p-4 text-center text-muted-foreground text-xs font-body">
              No events logged yet. Tap "Log Event" on any sensor.
            </div>
          ) : (
            <div
              className="divide-y"
              style={{ borderColor: "oklch(0.2 0.022 255)" }}
            >
              <AnimatePresence initial={false}>
                {recentEvents.map((event, i) => (
                  <motion.div
                    key={`${event.eventType}-${String(event.timestamp)}-${i}`}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="flex items-center gap-2.5 px-3 py-2"
                  >
                    <div
                      className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                      style={{ background: "oklch(0.78 0.12 75)" }}
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span
                          className="text-[10px] font-display font-semibold px-1.5 py-0.5 rounded"
                          style={{
                            background: "oklch(0.78 0.12 75 / 0.15)",
                            color: "oklch(0.78 0.12 75)",
                          }}
                        >
                          {event.eventType}
                        </span>
                        <span className="text-[10px] font-mono-code text-foreground/80 truncate">
                          {event.value}
                        </span>
                      </div>
                    </div>
                    <span className="text-[9px] font-mono-code text-muted-foreground flex-shrink-0">
                      {formatEventTime(event.timestamp)}
                    </span>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </div>
      </div>

      {/* Sovereign Licensing Footer */}
      <div
        className="text-center py-3 mt-2 mx-3 border-t"
        style={{ borderColor: "oklch(0.22 0.025 255)" }}
      >
        <p
          className="text-[9px] font-mono-code"
          style={{ color: "oklch(0.4 0.04 255)" }}
        >
          © P.S. Thimaia · CC BY-NC-ND · MOIRA SmartBank AI
        </p>
      </div>
    </div>
  );
}
