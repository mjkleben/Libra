const cheerio=require('cheerio')
const axios = require("axios");

let item ="more than you know"


var getYoutubeLink = (data) =>{
    return axios(data)
    .then(response => {
      const html = response.data;
      const $ = cheerio.load(html);
      var links = $('a');
      var video_id;
      $(links).each(function(i, link){
        let current_link = $(link).attr('href');
        if(current_link.includes("watch")){
            video_id = current_link;
            return false;
        }
      });
      return video_id;
    }
    
    )
    .catch(console.error);
}


if(!item.includes("youtube.com")){
  let url = "https://www.youtube.com/results?search_query=more than you know";

  getYoutubeLink(url).then(data => {
    console.log(data);
  });

}

