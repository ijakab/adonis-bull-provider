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
        if(this.handle) {
            if(this.eventName) {
                queue.process('*', (payload) => {
                    if(payload.name === this.eventName) this.handle(payload)
                })
            } else {
                queue.process('*', this.handle)
            }
        }
        if(this.completed) {
            if(this.eventName) {
                queue.on('completed', (payload) => {
                    if(payload.name === this.eventName) this.completed(payload)
                })
            } else {
                queue.on('completed', this.completed)
            }
        }
        
        instances.push(queue)
        return queue
    }
}

module.exports = BaseQueue
