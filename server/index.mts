import puppeteer, { Browser, Page } from "puppeteer";
import express from "express";

const REACT_APP_PORT = 3001;
const MAIN_APP_PORT = 9100;
const LOCAL_LINK = `http://localhost:${REACT_APP_PORT}`;

export class AppInstance {
  #browser: Browser;
  page: Page;

  async init(): Promise<void> {
    this.#browser = await puppeteer.launch({
      headless: true,
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

  async addStorageClusterWorkload(
    usableSize: number,
    diskSize: number,
    platform: string,
    msName?: string
  ): Promise<any> {
    return await this.page.evaluate(
      async (usableSize, diskSize, platform) => {
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
      platform
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

const reactApp = express();
reactApp.use(express.static("../build"));
reactApp.listen(REACT_APP_PORT, () => {
  console.log(`Hosting the react application at ${REACT_APP_PORT}`);
});

const app = express();
const backend = new AppInstance();
await backend.init();

app.get("/addMachine", async (req, res) => {
  const msName = req.query.msName as string;
  const instanceName = req.query?.instance as string;
  const cpu = Number(req.query?.cpu);
  const mem = Number(req.query?.mem);
  const platform = req.query?.platform as string;
  if (platform !== "AWS") {
    await backend.setPlatform(platform);
  }
  await backend.createMachineSet(msName, instanceName, cpu, mem);
  await backend.schedule();
  res.status(200).send({ message: "Added machineset successfully!" });
});

app.get("/", async (req, res) => {
  const usableCapacity = Number(req.query.usableCapacity);
  const diskSize = Number(req.query.diskSize);
  const platform: string = (
    req.query.platform ? req.query.platform : "AWS"
  ) as string;
  const msName: string = req.query?.msName as string;
  if (platform !== "AWS") {
    await backend.setPlatform(platform);
  }
  if (req.query?.usableCapacity) {
    await backend.addStorageClusterWorkload(
      usableCapacity,
      diskSize,
      platform,
      msName
    );
  }
  await backend.schedule();
  const layout = await backend.getLayout();
  res.send(layout);
});

app.listen(MAIN_APP_PORT, () => {
  console.log(`Listening on port ${MAIN_APP_PORT}`);
});
