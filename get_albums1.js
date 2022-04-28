var SpotifyWebApi = require('spotify-web-api-node');
const fs = require('fs')
const express = require('express')

const scopes = [
    'ugc-image-upload',
    'user-read-playback-state',
    'user-modify-playback-state',
    'user-read-currently-playing',
    'streaming',
    'app-remote-control',
    'user-read-email',
    'user-read-private',
    'playlist-read-collaborative',
    'playlist-modify-public',
    'playlist-read-private',
    'playlist-modify-private',
    'user-library-modify',
    'user-library-read',
    'user-top-read',
    'user-read-playback-position',
    'user-read-recently-played',
    'user-follow-read',
    'user-follow-modify'
  ];
  
var spotifyApi = new SpotifyWebApi({
    clientId: '0556a0ca11734b969f9185803abe22b9',
    clientSecret: '0b75487d23a941eab5bbf95e647b3417',
    redirectUri: 'http://localhost:8888/callback/'
  });
  
  const app = express();
  
  app.get('/login', (req, res) => {
    res.redirect(spotifyApi.createAuthorizeURL(scopes));
  });
  
  app.get('/callback', (req, res) => {
    const error = req.query.error;
    const code = req.query.code;
    const state = req.query.state;
  
    if (error) {
      console.error('Callback Error:', error);
      res.send(`Callback Error: ${error}`);
      return;
    }
  
    spotifyApi
      .authorizationCodeGrant(code)
      .then(data => {
        const access_token = data.body['access_token'];
        const refresh_token = data.body['refresh_token'];
        const expires_in = data.body['expires_in'];
  
        spotifyApi.setAccessToken(access_token);
        spotifyApi.setRefreshToken(refresh_token);
  
        console.log('Done! You can close server with Ctrl-C.'); 
        res.send('Success! You can now close the window.');
		getMyData();
  
        setInterval(async () => {
          const data = await spotifyApi.refreshAccessToken();
          const access_token = data.body['access_token'];
  
          console.log('The access token has been refreshed!');
          console.log('access_token:', access_token);
          spotifyApi.setAccessToken(access_token);
        }, expires_in / 2 * 1000);
      })
      .catch(error => {
        console.error('Error getting Tokens:', error);
        res.send(`Error getting Tokens: ${error}`);
      });
  });
  
  app.listen(8888, () =>
    console.log(
      'HTTP Server up. Now go to http://localhost:8888/login in your browser.'
    )
  );

  function getMyData() {
	(async () => {
	  const me = await spotifyApi.getMe();
	  getUserAlbums(me.body.id);
	})().catch(e => {
	  console.error(e);
	});
  }

  async function getUserAlbums() {
	const page = await spotifyApi.getMySavedAlbums({limit: 50, offset: 0})
	let temp = page.body.items;
	let data = '';
	data = JSON.stringify(page.body.items);
	// for (let album of temp) {
	//   data = data.concat("name: " + album.album.name + "; image: " + album.album.images[0].url + "; year: " + album.album.release_date + "; artist: " + album.album.artists[0].name + "; tracks: ");
	//   for (let [index, track] of album.album.tracks.items.entries()) {
	// 	if (index != 0) {
	// 		data = data.concat(", ");
	// 	}
	// 	data = data.concat(track.name);
	//   }
	//   data = data.concat("\n");
	//}
	fs.writeFileSync('test.json', data);
  }





