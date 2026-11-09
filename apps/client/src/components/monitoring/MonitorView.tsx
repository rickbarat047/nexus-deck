import { useConnectionStore } from "../../stores/connectionStore";
import { useEffect } from "react";
import { subscribeMetrics, unsubscribeMetrics } from "../../websocket/client";

export default function MonitorView() {
  const metrics = useConnectionStore((s) => s.metrics);
  useEffect(() => {
    subscribeMetrics(2000);
    return () => unsubscribeMetrics();
  }, []);
  if (!metrics) return <div className="text-text-secondary">Waiting for PC status…</div>;
  const { cpu, gpu, memory, disks, network } = metrics;
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      <Card title="Processor">
        <Row label="Usage" value={cpu.utilization !== null ? `${cpu.utilization}%` : "n/a"} />
        <Row label="Temperature" value={cpu.temperatureSupported ? `${cpu.temperatureC}°C` : `not available (${cpu.temperatureReason})`} />
      </Card>
      <Card title="Graphics Card">
        <Row label="Name" value={gpu.name ?? "n/a"} />
        <Row label="Usage" value={gpu.utilization !== null ? `${gpu.utilization}%` : "n/a"} />
        <Row label="Temperature" value={gpu.temperatureC !== null ? `${gpu.temperatureC}°C` : (gpu.reason ?? "n/a")} />
      </Card>
      <Card title="Memory">
        <Row label="Used" value={`${(memory.usedBytes / 1e9).toFixed(1)} GB`} />
        <Row label="Total" value={`${(memory.totalBytes / 1e9).toFixed(1)} GB`} />
        <Row label="Usage" value={`${memory.utilization}%`} />
      </Card>
      <Card title="Disk Storage">
        {disks.map((d, i) => (
          <div key={i}>
            <Row label={d.mount} value={`${d.utilization}%`} />
          </div>
        ))}
      </Card>
      <Card title="Network">
        <Row label="Download" value={network.downloadBytesPerSec !== null ? `${(network.downloadBytesPerSec / 1024).toFixed(1)} KB/s` : (network.reason ?? "n/a")} />
        <Row label="Upload" value={network.uploadBytesPerSec !== null ? `${(network.uploadBytesPerSec / 1024).toFixed(1)} KB/s` : "n/a"} />
      </Card>
    </div>
  );
}

function Card({ title, children }: { title: string; children: any }) {
  return <div className="bg-card rounded-2xl p-4"><h3 className="text-accent font-semibold mb-2">{title}</h3>{children}</div>;
}
function Row({ label, value }: { label: string; value: string }) {
  return <div className="flex justify-between text-sm py-1"><span className="text-text-secondary">{label}</span><span>{value}</span></div>;
}