const Config = use('Config')
const Helpers = use('Helpers')
const instances = use('Queue/Instances')

let BullHelper = {
    getQueueName(fileName) {
        let prefix = Config.get('bull.prefix')
        return  prefix ? `${prefix}_${fileName}` : fileName
    },
    
    getQueueConfig(fileName) {
        let Handler = BullHelper.getQueueHandler(fileName)
        let redisConfig = Config.get(`redis.${Handler.redis}`)
        let config = {redis: redisConfig}
        
        if(Handler.config) {
            Object.assign(config, Handler.config)
        }
        
        return config
    },
    
    getQueueDir() {
        let queueDir = Config.get('bull.queueDirectory')
        if(!queueDir) queueDir = Helpers.appRoot('app/Queues')
        else queueDir = Helpers.appRoot(queueDir)
        return queueDir
    },
    
    getQueueHandler(fileName) {
        return require(`${BullHelper.getQueueDir()}/${fileName}`)
    },
    
    async closeAll() {
        for(let instance of instances) {
            await instance.close()
        }
    }
}

module.exports = BullHelper
