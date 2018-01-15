const app = require('express')()
const server = require('http').Server(app)
const io = require('socket.io')(server)

server.listen(3002)

const Meetup = require('meetup')
const mup = new Meetup()
let topicsCounter = {}

io.on('connection', socket => {
  console.log('got connection')
})

mup.stream("/2/rsvps", stream => {
  stream
    .on("data", item => {

      const arrayOfTopics = Object.keys(topicsCounter)
      arrayOfTopics.sort((topicA, topicB) => {
        if (topicsCounter[topicA] > topicsCounter[topicB]) {
          return -1
        }
        else if (topicsCounter[topicB] > topicsCounter[topicA]) {
          return 1
        }
        else {
          return 0
        }
      })

      const ten = arrayOfTopics.slice(0,10).map(function(name) {
        return {name: name, count: topicsCounter[name] }
      })

      const topicNames = item.group.group_topics.map(topic => topic.topic_name)

      if (topicNames.includes('Software Development')) {
        const addRsvp = {
           type: 'ADD_RSVP',
           payload: item
        }

        io.emit('action', addRsvp)
        
        topicNames.forEach(name => {
          if (topicsCounter[name]) {
            topicsCounter[name]++
          }
          else {
             topicsCounter[name] = 1
          }

          const updateTopics =
          {
	           type: 'UPDATE_TOPICS',
	           payload: ten
          }

          io.emit('action', updateTopics)
        })
       }
     })

    .on("error", e => {
      console.log("error!" + e)
    })
})
