const Config = use('Config')
const bull = require('bull')
const {getQueueName, getQueueConfig} = use('Queue/Helpers')
const instances = use('Queue/Instances')

class BaseQueue {
    static get redis() {
        return Config.get('bull.defaultRedis', 'local')
    }
    
    static createQueue() {
        let config = getQueueConfig(this.fileName)
        let name = getQueueName(this.fileName)
        
        let queue = new bull(name, config)
        let instance = new this()
        
        if(instance.handle) {
            if(this.eventName) {
                queue.process('*', (payload) => {
                    if(payload.name === this.eventName) instance.handle(payload)
                })
            } else {
                queue.process('*', this.handle)
            }
        }
        if(instance.completed) {
            if(this.eventName) {
                queue.on('completed', (payload) => {
                    if(payload.name === this.eventName) instance.completed(payload)
                })
            } else {
                queue.on('completed', instance.completed)
            }
        }
        
        instances.push(queue)
        return queue
    }
}

module.exports = BaseQueue
