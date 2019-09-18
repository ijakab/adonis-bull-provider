const {getQueueHandler} = use('Queue/Helpers')

module.exports = (queueName) => {
    const Handler = getQueueHandler(queueName)
    return Handler.getQueueInstance()
}
