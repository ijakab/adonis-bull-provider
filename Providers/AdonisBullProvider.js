"use strict";
const { ServiceProvider } = use("@adonisjs/fold");
const fs = require("fs-extra");

class AdonisBullProvider extends ServiceProvider {
  register() {
    this.app.bind("Queue/BaseQueue", () => {
      return require("../src/BaseQueue");
    });
    this.app.bind("Queue/Helpers", () => {
      return require("../src/Helpers");
    });
    this.app.bind("Queue", () => {
      return require("../src/Service");
    });
    this.app.bind("Queue/Instances", () => {
      return require("../src/QueueInstances");
    });
  }

  async boot() {
    try {
      if (process.env.GCR_DOMAIN)  {
        const Redis = require("ioredis");
        Redis.prototype.client = function() {}  // "client" not available on GCP redis
      }
    } catch (e) {
      console.error(e)
    }
    
    
    const Config = use("Config");
    const { getQueueDir, getQueueHandler } = use("Queue/Helpers");

    let redisConfig = Config.get("redis");
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
      return; //directory does not exist
    }

    let onBoot = Config.get("bull.onBoot");
    if (onBoot == undefined || onBoot == null) onBoot = true;

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
      if (onBoot) Handler.createQueue();
    }
  }
}

module.exports = AdonisBullProvider;
