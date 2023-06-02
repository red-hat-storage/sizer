import puppeteer, { Browser, Page } from "puppeteer";
import express from "express";
import bodyParser from "body-parser";
import { body, validationResult } from "express-validator";
import { isValidPlatformName, isValidInstanceName } from "./validation.mjs";

const REACT_APP_PORT = 3001;
const MAIN_APP_PORT = 9100;
const LOCAL_LINK = `http://localhost:${REACT_APP_PORT}`;

export class AppInstance {
  #browser: Browser;
  page: Page;

  async init(): Promise<void> {
    this.#browser = await puppeteer.launch({
      headless: false,
      executablePath: "/usr/bin/google-chrome",
      args: [
        "--disable-gpu",
        "--disable-dev-shm-usage",
        "--disable-setuid-sandbox",
        "--no-sandbox",
        "--headless=new",
      ],
    });
    this.page = await this.#browser.newPage();
    await this.page.goto(LOCAL_LINK, { waitUntil: "domcontentloaded" });
  }

  async refresh(): Promise<void> {
    await this.page.close();
    this.page = await this.#browser.newPage();
    await this.page.goto(LOCAL_LINK, { waitUntil: "domcontentloaded" });
  }

  async addStorageClusterWorkload(
    usableSize: number,
    diskSize: number,
    platform: string,
    msName?: string
  ): Promise<any> {
    return await this.page.evaluate(
      async (usableSize, diskSize, platform, msName) => {
        await (window as any).createStorageCluster(
          usableSize,
          diskSize,
          "internal",
          platform,
          msName ? [msName] : []
        );
      },
      usableSize,
      diskSize,
      platform,
      msName
    );
  }

  async schedule(): Promise<void> {
    return await this.page.evaluate(async () => {
      await (window as any).schedule();
    });
  }

  async setPlatform(platform: string): Promise<void> {
    return await this.page.evaluate(async (platform) => {
      await (window as any).changePlatform(platform);
    }, platform);
  }

  async createMachineSet(
    msName: string,
    instanceName: string,
    cpu: number,
    memory: number
  ): Promise<void> {
    await this.page.evaluate(
      async (machineSetName, instanceName, cpu, memory) => {
        await (window as any).createMachineSet(
          machineSetName,
          instanceName,
          cpu,
          memory,
          true
        );
      },
      msName,
      instanceName,
      cpu,
      memory
    );
  }

  async getLayout(): Promise<any> {
    return await this.page.evaluate(async () => {
      const value = await (window as any).showLayout();
      return value;
    });
  }
}

const DEDICATED_MS_NAME = "odf-ms";

const reactApp = express();
reactApp.use(express.static("../build"));
reactApp.listen(REACT_APP_PORT, () => {
  console.log(`Hosting the react application at ${REACT_APP_PORT}`);
});

const app = express();
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

const backend = new AppInstance();
await backend.init();

app.get("/", async (_req, res) => {
  await backend.schedule();
  const layout = await backend.getLayout();
  res.send(layout);
});

app.get("/reset", async (_req, res) => {
  await backend.refresh();
  return res.send();
});

app.post(
  "/",
  body("usableCapacity").isNumeric().toFloat(),
  body("diskSize").optional().isNumeric().toFloat(),
  body("cpu").optional().isNumeric().toFloat(),
  body("mem").optional().isNumeric().toFloat(),
  body("platform").custom((value) => isValidPlatformName(value)),
  body("instanceName").custom((value, { req }) =>
    isValidInstanceName(value, req.body.platform)
  ),
  async (req, res) => {
    const result = validationResult(req);
    if (!result.isEmpty()) {
      return res.status(400).send({ errors: result.array() });
    }
    const body = req.body;
    const usableCapacity = body?.usableCapacity;
    const diskSize = body?.diskSize;
    const platform = body?.platform;

    const instanceName = body?.instanceName;
    const cpu = body?.cpu;
    const mem = body?.mem;

    await backend.setPlatform(platform);
    const shouldCreateMS = instanceName || cpu || mem;
    if (shouldCreateMS) {
      await backend.createMachineSet(DEDICATED_MS_NAME, instanceName, cpu, mem);
    }
    if (usableCapacity) {
      await backend.addStorageClusterWorkload(
        usableCapacity,
        diskSize,
        platform,
        shouldCreateMS ? DEDICATED_MS_NAME : ""
      );
    }
    await backend.schedule();
    res.send();
  }
);

app.listen(MAIN_APP_PORT, () => {
  console.log(`Listening on port ${MAIN_APP_PORT}`);
});
