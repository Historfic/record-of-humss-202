import { useEffect, useState } from "react";
import { isOnline, onNetworkChange } from "../lib/net";
import { flushOutbox } from "../lib/db";
import { count } from "../lib/outbox";

export function OfflineBanner() {
  const [online, setOnline] = useState(isOnline());
  const [pending, setPending] = useState(count());

  useEffect(() => {
    return onNetworkChange((next) => {
      setOnline(next);
      if (next) {
        flushOutbox()
          .catch(() => {})
          .finally(() => setPending(count()));
      } else {
        setPending(count());
      }
    });
  }, []);

  if (online && pending === 0) return null;

  if (!online) {
    return (
      <div
        data-testid="offline-banner"
        className="bg-yellow-100 text-yellow-900 text-sm px-3 py-2 text-center"
      >
        Offline — {pending} change(s) will sync when you reconnect
      </div>
    );
  }

  return (
    <div className="bg-blue-100 text-blue-900 text-sm px-3 py-2 text-center">
      Syncing {pending} change(s)…
    </div>
  );
}
