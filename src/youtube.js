import $ from 'jquery'
import download from './utils'

const regVid = /https:\/\/www\.youtube\.com\/watch\?v=(?<id>\w+)/

const mp3Api = 'https://ytapivmp3.com/api/button/mp3/'


async function downloadMp3(){
    const vid = regVid.exec(location.href).groups?.id
    if(!vid) {
      throw new Error('not a valid youtube video id')
    }
    console.debug(`video id is ${vid}`)
    const res = await fetch(mp3Api.concat(vid))
    const html = await res.text()
    const doc = new DOMParser().parseFromString(html, "text/html")
    const list = doc.getElementsByClassName('download flex flex-wrap sm:inline-flex text-center items-center justify-center')
    const audio_url = list[0].childNodes[1].href
    if(!audio_url || audio_url.length == 0 || audio_url === null) {
      alert('無法下載此視頻的音頻')
      throw new Error('url is unknown, cannot download music')
    }
    const title = $('h1.title.style-scope.ytd-video-primary-info-renderer')[0].childNodes[0].innerText
    console.log(`title: ${title}`)
    await download({
      audio_url,
      title: title || vid,
      format: 'mp3'
    })
}

let downloading = false

function process() {
    if (!location.pathname.startsWith('/watch')) {
      return;
    }
    console.log(`${location.href} is video link.`)
    if ($('#download-mp3').length > 0) {
      return;
    }

    console.debug('initalizing button in youtube...')
    const title = $('h1.title.style-scope.ytd-video-primary-info-renderer')
    title.append(`
    <a href="javascript: void(0)" id="download-mp3"
      type="button"
      style="background-color: red;
          border: none;
          color: white;
          padding: 5px 12px;
          text-align: center;
          text-decoration: none;
          display: inline-block;
          font-size: 15px;
          float: right;
          ">
        下載音頻
    </a>
    `)
    $('#download-mp3').on('click', e => {
      if(downloading) return
      e.currentTarget.innerText = '下載中...'
      downloading = true
      downloadMp3().catch(console.warn).finally(() => {
        e.currentTarget.innerText = '下載音頻'
        downloading = false
      })
    })
    browser.runtime.sendMessage({
      title: '音頻按鈕已出現在視頻下方。',
      message: '按下按鈕即可進行音頻下載。'
    })
}

function initialize(){
  /*
    window.addEventListener('yt-navigate-start', process);
    if (document.body) {
      console.log('body has loaded')
      process()
    }else {
      document.addEventListener('DOMContentLoaded', process);
      console.log('wait for body load')
    }
    */
   if(document.body){
      document.body.addEventListener('yt-page-data-updated', process)
   } else {
    console.debug('body not loaded yet, waiting..')
    document.addEventListener('DOMContentLoaded', initialize);
  }

  setInterval(() => {
    console.debug('checking button is alive...')
    if($('#download-mp3').length == 0){
        console.debug('button is gone? try processing again.')
        process()
    }else{
        console.debug('button is alive.')
    }
  }, 15000)
}

export default initialize;