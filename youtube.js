const fs = require('fs');
const ytdl = require('ytdl-core');
const cheerio=require('cheerio')
const axios = require("axios");

let audio_formats = ["mp3", "wav", "aiff", "aac", "ogg", "wma", "flac", "alac", "mp4", "avi", "wmv", "mov"];
let video_formats = ["mp4", "avi", "wmv", "mov"];
//  Function for querying top search
var scrapeYoutube = (html) =>{
    const $ = cheerio.load(html);
    var links = $('a');
    var video_id;
  
    $(links).each(function(i, link){
      let current_link = $(link).attr('href');
      // Top search for search query is found, break the \ loop
      if(current_link.includes("watch")){
          video_id = current_link;
          return false;
      }
    });
    return video_id;
  }
  
  showProgress = (item) =>{
    item.on('response', function(res) {
      var totalSize = res.headers['content-length'];
      var dataRead = 0;
      res.on('data', function(data) {
        dataRead += data.length;
        var percent = dataRead / totalSize;
        console.log(Math.round((percent * 100).toFixed(2))  + '% ');
      });
  
    });
  
  }
  
  
  async function convertYoutube(user_input, format){
    let youtube_url = user_input;
  
    // Query the user's input to find the video id of YouTube video
    if(!user_input.includes("youtube.com")){
      var query_html = await axios.get("https://www.youtube.com/results?search_query=" + user_input).then(response => {return response.data}).catch(console.error);
      youtube_url = "https://www.youtube.com" + scrapeYoutube(query_html);
    }
  
    // Convert the YouTube URL depending on format
    if(audio_formats.includes(format)){
      var conversion_item = ytdl( youtube_url, {filter: 'audio'});
      conversion_item.pipe(fs.createWriteStream(user_input + '.' + format));
      showProgress(conversion_item);
    }
  
    else if(video_formats.includes(format)){
      var conversion_item = ytdl( youtube_url).pipe(fs.createWriteStream(user_input + '.' + format));
    }
  }
    

module.exports = {audio_formats, video_formats, convertYoutube, scrapeYoutube};