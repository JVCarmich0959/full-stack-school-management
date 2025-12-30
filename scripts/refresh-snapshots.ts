#!/usr/bin/env ts-node
import prisma from "../src/lib/prisma";
import {
  getSnapshotQueueDepth,
  processSnapshotQueue,
} from "../src/lib/services/snapshotService";

async function main() {
  let pending = await getSnapshotQueueDepth();
  console.log(`[snapshot-worker] queue depth ${pending}`);

  while (pending > 0) {
    const result = await processSnapshotQueue(10);
    console.log(
      `[snapshot-worker] processed=${result.processed} errors=${result.errorCount}`
    );
    pending = await getSnapshotQueueDepth();
    console.log(`[snapshot-worker] queue depth ${pending}`);
    if (result.processed === 0) {
      break;
    }
  }

  console.log("Snapshot worker completed.");
}

main()
  .catch((error) => {
    console.error("Snapshot worker failed:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
