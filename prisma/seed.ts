import { spawn } from "child_process";
import path from "path";

async function runSeedScript() {
  const scriptPath = path.join(process.cwd(), "prisma", "seed-wsa-students.cjs");

  await new Promise<void>((resolve, reject) => {
    const child = spawn("node", [scriptPath], {
      stdio: "inherit",
      env: process.env,
    });

    child.on("close", (code) => {
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(`Seeding script exited with code ${code}`));
      }
    });

    child.on("error", (err) => reject(err));
  });
}

runSeedScript().catch((error) => {
  console.error("Seeding error:", error);
  process.exit(1);
});
