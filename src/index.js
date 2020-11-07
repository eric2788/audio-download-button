import bilibili from './bilibili'
import youtube from './youtube'

console.log('mp3 download btn addon activated')

switch(location.origin){
    case "https://www.bilibili.com":
        bilibili()
        break;
    case "https://www.youtube.com":
        youtube()
        break;
    default:
        console.debug('unknown video website, skipped')
        break;
}