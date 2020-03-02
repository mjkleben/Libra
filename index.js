const electron = require('electron');
const path = require('path');
const url = require('url');

// SET ENV
process.env.NODE_ENV = 'development';

const {app, BrowserWindow, Menu, ipcMain} = electron;


// Create a persistent database for user information
const Store = require('electron-store');
const store = new Store();

// store.set('unicorn', '🦄');
// console.log(store.get('unicorn'));
// //=> '🦄'

// // Use dot-notation to access nested properties
// store.set('foo.bar', true);
// console.log(store.get('foo'));
// //=> {bar: true}

// store.delete('unicorn');
// console.log(store.get('unicorn'));
//=> undefined

let mainWindow;
let addWindow;

// Creating the app and its browser------------------------
// Listen for app to be ready
app.on('ready', function(){
  // Create new window
  mainWindow = new BrowserWindow({
      webPreferences: {
        nodeIntegration: true
    },
    width: 350,
    height:480,
    // resizable: false

  });
  // Load html in window
  mainWindow.loadURL(url.format({
    pathname: path.join(__dirname, 'mainWindow.html'),
    protocol: 'file:',
    slashes:true
  }));
  // Quit app when closed
  mainWindow.on('closed', function(){
    app.quit();
  });

  // Build menu from template
  const mainMenu = Menu.buildFromTemplate(mainMenuTemplate);
  // Insert menu
  Menu.setApplicationMenu(mainMenu);
});

// Handle add item window
function createAddWindow(){
  addWindow = new BrowserWindow({
    width: 300,
    height:200,
    title:'Add Shopping List Item'
  });
  addWindow.loadURL(url.format({
    pathname: path.join(__dirname, 'addWindow.html'),
    protocol: 'file:',
    slashes:true
  }));
  // Handle garbage collection
  addWindow.on('close', function(){
    addWindow = null;
  });
}


const fs = require('fs');
const ytdl = require('ytdl-core');
let audio_formats = ["mp3", "wav", "aiff", "aac", "ogg", "wma", "flac", "alac", "mp4", "avi", "wmv", "mov"];
let video_formats = ["mp4", "avi", "wmv", "mov"];

const cheerio=require('cheerio')
const axios = require("axios");

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

async function convertYoutube(user_input, format){
  let youtube_url = user_input;

  // Query the user's input to find the video id of YouTube video
  if(!user_input.includes("youtube.com")){
    var query_html = await axios.get("https://www.youtube.com/results?search_query=" + user_input).then(response => {return response.data}).catch(console.error);
    youtube_url = "https://www.youtube.com" + scrapeYoutube(query_html);
  }

  // Convert the YouTube URL depending on format
  if(audio_formats.includes(format)){
    var status = ytdl( youtube_url, {filter: 'audio'});
    status.pipe(fs.createWriteStream(user_input + '.' + format));


    status.on('response', function(res) {
      var totalSize = res.headers['content-length'];
      var dataRead = 0;
      res.on('data', function(data) {
        dataRead += data.length;
        var percent = dataRead / totalSize;
        process.stdout.cursorTo(0);
        process.stdout.clearLine(1);
        process.stdout.write((percent * 100).toFixed(2) + '% ');
      });
      res.on('end', function() {
        process.stdout.write('\n');
      });});
      
    console.log("DONE WITH CONVERSION");
  }

  else if(video_formats.includes(format)){
    ytdl( youtube_url).pipe(fs.createWriteStream(user_input + '.' + format));
    console.log("DONE WITH CONVERSION");
  }
}
  




// var convertSoundcloud = (video_id, format) =>{
//   if(audio_formats.includes(format)){
//     console.log("STEP 3");
//     ytdl('https://www.youtube.com/watch?v=GsF05B8TFWg', {filter: 'audio'}).pipe(fs.createWriteStream('audioVideo.' + format));

//   }
//   else if(video_formats.includes(format)){
//     console.log("STEP 4");
//     ytdl('https://www.youtube.com/watch?v=GsF05B8TFWg').pipe(fs.createWriteStream('video.' + format));
//   }
// }


// Catch item:add
ipcMain.on('start-conversion', function(e, user_input, format, platform){
  if(platform=="youtube"){
    convertYoutube(user_input, format)
  }
});




// Create menu template
const mainMenuTemplate =  [
  // Each object is a dropdown
  {
    label: 'Settings',
    submenu:[
      {
        label:'Download Location',
        click(){
          createAddWindow();
        }
      },
      {
        label:'Clear Items',
        click(){
          mainWindow.webContents.send('item:clear');
        }
      },
      {
        label: 'Quit',
        accelerator:process.platform == 'darwin' ? 'Command+Q' : 'Ctrl+Q',
        click(){
          app.quit();
        }
      }
    ]
  }
];

// If OSX, add empty object to menu
if(process.platform == 'darwin'){
  mainMenuTemplate.unshift({});
}

// Add developer tools option if in dev
if(process.env.NODE_ENV !== 'production'){
  mainMenuTemplate.push({
    label: 'Developer Tools',
    submenu:[
      {
        role: 'reload'
      },
      {
        label: 'Toggle DevTools',
        accelerator:process.platform == 'darwin' ? 'Command+I' : 'Ctrl+I',
        click(item, focusedWindow){
          focusedWindow.toggleDevTools();
        }
      }
    ]
  });
}