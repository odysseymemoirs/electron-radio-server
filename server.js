const express = require('express')
const app = express();
const server = require("http").Server(app);
const io = require("socket.io")(server);

const radio = require("radio-stream");

const urlParser = require('./parser')

app.use(express.static('public'));

app.get('/', function (req, res) {
  res.sendFile(__dirname + '/public/index.html');
});


let stream = null;
// socket.on('close', () => clearInterval(interval));
// socket.on('error', console.error);
// socket.on('data', d => console.log(d));


// errors such as "connect ECONNREFUSED 213.136.92.8:8050" kills our nodejs server 
// and we cant handle such error by try catch
// so we can handle it like below
process.on('uncaughtException', function (err) {
  console.log(err);
});

io.on('connection', function (webClient) {

  console.log(`Client ${webClient.id} connected`)


  webClient.on('disconnect', (reason) => {
    console.log(` Client: ${webClient.id} disconnected, reason: ${reason}`)

    if(stream)
      stream.destroy((e) => { console.log('stream destroyed') })

  })


  webClient.on('sendRadioIp', (dataFromClient) => {

    try {

      stream = radio.createReadStream(dataFromClient);

      stream.on("connect", function () {
        console.error("Radio Stream connected!");
      });

      // When a 'metadata' event happens, usually a new song is starting.
      stream.on("metadata", function (title) {
        console.log(title)
        webClient.emit('getRadioTitle', title)
      });

      stream.onClose(() => {
        // webClient.emit('getRadioTitle', 'connection closed')
        console.log('stream closes')

      })
    } catch (error) {
      // webClient.emit('getRadioTitle', 'connection error, try again')
      console.log(error)
    }

  })

  webClient.on('parseRadioStations', async (searchInput) => {

    let parsed = await urlParser(searchInput)
    console.log(parsed)

    let data = parsed
    webClient.emit('parseRadioStations', data)

  })
});

server.listen(process.env.PORT || 4000);