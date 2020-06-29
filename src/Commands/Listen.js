"use strict";

const fs = require("fs-extra");
const Arena = require("bull-arena");
const basicAuth = require("express-basic-auth");

const { Command } = require("@adonisjs/ace");
const { getQueueDir, getQueueHandler } = use("Queue/Helpers");
const Config = use("Config");
const Logger = use("Logger");

class Listen extends Command {
  static get signature() {
    return `
    queue:listen
    { --arena : Run bull arena dashboard }
    `;
  }

  static get description() {
    return "Start the Queue";
  }

  ui(queues_, redisConfig, bullConfig) {
    const { connection } = redisConfig;

    const queues = queues_.map(queue => {
      const handler = getQueueHandler(queue);
      return {
        name: handler.key,
        hostId: handler.fileName.replace(".js", ""),
        host: redisConfig[connection].host,
        port: redisConfig[connection].port || 6379,
        password: redisConfig[connection].password || null,
        type: "bull",
        prefix: redisConfig.keyPrefix || "bull"
      };
    });

    const port = bullConfig.arenaPort || 1212;
    const arenaConfig = Arena(
      {
        queues
      },
      {
        basePath: bullConfig.arenaPrefix || "/",
        disableListen: true,
        useCdn: false,
        port
      }
    );

    const express = require("express");
    const app = express();

    const basicAuthConfig = { challenge: true, users: {} };
    basicAuthConfig.users[bullConfig.arenaUser || "admin"] =
      bullConfig.arenaPassword || "";

    app.use(basicAuth(basicAuthConfig));

    // Make arena's resources (js/css deps) available at the base app route
    app.use("/", arenaConfig);

    const server = app.listen(port, () => {
      Logger.info("Bull arena is listening at: %s", port);
    });

    const shutdown = () => {
      server.close(() => {
        Logger.info("Stopping bull board server");
        process.exit(0);
      });
    };

    process.on("SIGTERM", shutdown);
    process.on("SIGINT", shutdown);
  }

  bullListener(queues) {
    const BaseQueue = use("Queue/BaseQueue");
    for (let queue of queues) {
      if (!queue.endsWith(".js")) continue;
      let Handler = getQueueHandler(queue);
      let debugInstance = new Handler();
      if (!(debugInstance instanceof BaseQueue))
        throw {
          status: 500,
          message: `${Handler.name} does not extend BaseQueue class. use it with Queue/BaseQueue and extend it`
        };

      Handler.fileName = queue;
      Handler.createQueue();
    }
  }

  async handle(args, { arena }) {
    const bullConfig = Config.get("bull");
    let onBoot = bullConfig.onBoot;
    if (onBoot == undefined || onBoot == null) onBoot = true;
    if (onBoot)
      throw {
        status: 500,
        message: "You cannot use the command while onBoot=true"
      };

    const redisConfig = Config.get("redis");
    if (!redisConfig) {
      throw {
        status: 500,
        message:
          "Bull uses redis in background. Make config/redis.js file https://adonisjs.com/docs/4.1/redis"
      };
    }

    try {
      var queues = await fs.readdir(getQueueDir());
    } catch (e) {
      Logger.error("Could not load queue directory %s");
      return; //directory does not exist
    }

    this.bullListener(queues);
    Logger.info("Bull is listening");
    if (arena) {
      this.ui(queues, redisConfig, bullConfig);
    }
  }
}

module.exports = Listen;
