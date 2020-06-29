// const io = require("socket.io-client")

let socket = io('https://electron-radio.herokuapp.com/');

let currentRadioPlayBtn;

socket.on('connect', function (data) {

});
socket.on('disconnect', function (data) { console.log('disconnect', data) });

// then
socket.on('getRadioTitle', function (data) {

  let radioTitle = ''
  radioTitle = data.replace(/[^A-Za-z 0-9 \.,\?""!@#\$%\^&\*\(\)-_=\+;:<>\/\\\|\}\{\[\]`~]*/g, '')
  radioTitle = radioTitle.slice(12, data.length - 3)
  // if (!radioTitle) radioTitle = 'No radio music title'

  let currentRadioTitle = document.createElement('h5').textContent = 'Сейчас играет: ' + radioTitle

  let radiotitle = document.querySelector('.radioTitle')
  radiotitle.innerHTML = ''
  radiotitle.append(currentRadioTitle)
  console.log('data', data)
});

// search input handler
function runSearch(e) {

  if (e.keyCode == 13) {

    // get serach input value
    const search = document.querySelector('#radioInput').value

    //send search result to server 
    socket.emit('parseRadioStations', search);

    // clear old search result
    let insertArea = document.querySelector('.insert')
    insertArea.innerHTML = ''
    insertArea.insertAdjacentHTML('afterbegin', `

          <div class="lds-heart" >
            <div></div>
          </div> `)
  }
}

// then
socket.on('parseRadioStations', function (data) {

  let insertArea = document.querySelector('.insert')

  insertArea.innerHTML = ''

  console.log('parsed', data)

  data.map((station) => {
    insertArea.insertAdjacentHTML('beforeend', `
    
    <div class="box" style=" overflow: hidden">
  <article class="media">
    <div class="media-left">
      <figure class="image is-128x128">
        <img src=http:${station.stationImg} alt="Image">
      </figure>
    </div>
    <div class="media-content">
      <div class="content">
        <p>
          <strong>${station.stationTitle}</strong> <br>
          <small>
            слушают: ${station.stationListeners}
          </small> <br>
          <small>
            Ip: ${station.stationIP}
          </small>
          <br>
        </p>
      </div>
      <nav class="level is-mobile">
  <div class="level-left">

    <a class="level-item" aria-label="like">
      <span  ip=${station.stationIP} id='playRadio' class="icon is-small">
        <i  class="fas fa-play" aria-hidden="true"></i>
      </span>
    </a>
  </div>
</nav>
    </div>
  </article>
</div>

    `)
  })

  // convert NodeList to Array with spread operator ... to be able map over
  const play = [...document.querySelectorAll('#playRadio')]

  play.map((element) => {

    const stationIP = element.getAttribute('ip')

    element.addEventListener('click', (e) => {
      
      try {

        // console.log("e",e)

        // if(currentRadioPlayBtn) {

        //   currentRadioPlayBtn.classList.remove('fa-pause')
        //   currentRadioPlayBtn.classList.add('fa-play')

        // }

        // currentRadioPlayBtn = e.path[0];
        
        // currentRadioPlayBtn.classList.remove('fa-play')

        // currentRadioPlayBtn.classList.add('fa-pause')

        let audio = document.querySelector('#audioNode')
        audio.pause()
        audio.remove()

      } catch (error) {
        console.log('no such element')
      }

      const audio = document.createElement('audio')
      audio.setAttribute('controls', true)
      audio.setAttribute('hidden', true)
      audio.setAttribute('preload', 'none')

      audio.id = 'audioNode'

      audio.insertAdjacentHTML('afterbegin', `<source id='audioNodeSource' src=${stationIP}>`)
      document.body.append(audio)

      audio.pause()

      setTimeout(function () {
        audio.play();
      }, 1000);

      // send current playing radio ip to server which will handle radio music title changings
      // and will send back new song title when new song starts
      socket.emit('sendRadioIp', stationIP);

    })

  })
});
