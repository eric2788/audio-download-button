import $ from 'jquery'
import download from './utils'

const regVid = /https:\/\/www\.youtube\.com\/watch\?v=(?<id>[^&]+)/g

const mp3Api = 'https://www.320youtube.com/v16/watch?v='

let ytDownloading = false

const audioMap = {}

async function downloadMp3(){
    console.debug(`scanning ${location.href}`)
    const vid = regVid.exec(location.href)?.groups?.id
    regVid.lastIndex = 0
    if(!vid) {
      console.warn('vid unknown')
      throw new Error('not a valid youtube video id')
    }
    console.debug(`video id is ${vid}`)
    let audio_url;
    if (audioMap[vid] == undefined) {
      console.debug('cannot find download link in cache, fetching...')
      const res = await fetch(mp3Api.concat(vid))
      const html = await res.text()
      const doc = new DOMParser().parseFromString(html, "text/html")
      const btn = $(doc).find('#download .btn.btn-success.btn-lg')
      const url = btn.attr('href')
      if(!url || url.length == 0 || url === null) {
        alert('無法下載此視頻的音頻')
        throw new Error('url is unknown, cannot download music')
      }
      audio_url = url
      audioMap[vid] = url
    }else{
      audio_url = audioMap[vid]
    }
    const title = $('h1.title.style-scope.ytd-video-primary-info-renderer')[0].childNodes[0].innerText
    console.log(`title: ${title}`)
    await download({audio_url, title, format: 'mp3'})
    console.log('download completed.')
}

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
      e.preventDefault()
      if(ytDownloading) return
      console.log('downloading music...')
      e.currentTarget.innerText = '下載中...'
      ytDownloading = true
      downloadMp3().catch(err => console.warn(err.message)).finally(() => {
        ytDownloading = false
        e.currentTarget.innerText = '下載音頻'
      })
    })
    browser.runtime.sendMessage({
      command: 'notify',
      data: {
        title: '音頻按鈕已出現在視頻下方。',
        message: '按下按鈕即可進行音頻下載。'
      }
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