const bull = require("bull");

const { getQueueName, getQueueConfig } = use("Queue/Helpers");
const Config = use("Config");
const instances = use("Queue/Instances");
const Logger = use("Logger");

class BaseQueue {
  static get redis() {
    return Config.get("bull.defaultRedis", "local");
  }

  static createQueue() {
    let queue = this.getQueueInstance();
    let instance = new this();

    queue.process("*", async payload => {
      Logger.info("Received new job %s", payload.name);
      try {
        if (payload.name && instance[payload.name])
          return await instance[payload.name](payload);
        if (instance.defaultHandle)
          return await instance.defaultHandle(payload);
      } catch (e) {
        try {
          if (instance.onError) return await instance.onError(e, payload);
        } catch (err) {
          Logger.error("Unhandled error on handling bool error");
          Logger.error("%o", err);
        }
        Logger.error("Unhandled error on bool event");
        Logger.error("%o", e);
      }
    });

    return queue;
  }

  static getQueueInstance() {
    let name = getQueueName(this.fileName);

    if (!instances[name]) {
      let config = getQueueConfig(this.fileName);
      instances[name] = new bull(name, config);
    }
    return instances[name];
  }
}

module.exports = BaseQueue;
