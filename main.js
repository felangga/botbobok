var Twit = require('twit');
var fs = require('fs');
var shuffle = require('shuffle-array');

var T = new Twit({
  consumer_key:         '',
  consumer_secret:      '',
  access_token:         '',
  access_token_secret:  '',
  timeout_ms:           60*1000,  // optional HTTP request timeout to apply to all requests.
  strictSSL:            true,     // optional - requires SSL certificates to be valid.
})

var tweets = [
  'Met malam kak, selamat tidur :* ',
  'Sudah malam lho, kamu ga ngantuk ? Selamat bobok ya :* ',
  'Udah doa belum ? jangan lupa berdoa dan jangan lupa doain aku ~ '
];

var username = "";

function getRandomInt(max) {
  return Math.floor(Math.random() * Math.floor(max));
}

function ngeTweet(username) {
  T.post('statuses/update', { status: tweets[getRandomInt(tweets.length)] + "@"+ username }, function(err, data, response) {
    console.log(data);
  })
}


function getFollower(cursor, callback) {

  T.get('followers/list', { screen_name: 'botbobok', count: 200, cursor:cursor },  function (err, data, response) {

    for (var i = 0; i < data.users.length; i++) {
      username += data.users[i].screen_name + "\n";
    }

    if (data.next_cursor != 0) {
      getFollower(data.next_cursor_str, callback);
    } else {



      fs.writeFile('followers.txt', username, function(err, data){
        if (err) console.log(err);
        console.log("Insert : OK");
        callback();
      });


    }
  })
}

//getFollower(-1);

// T.get('application/rate_limit_status', { },  function (err, data, response) {
//   console.log(data.resources.followers)
// })

function updateFollower(totalFollower, callback) {
  fs.readFile('count.txt', 'utf-8' ,function(err, buf) {
    console.log("Current followers : " + buf.toString());
    if (buf.toString() != totalFollower) {
      fs.writeFile('count.txt', totalFollower, function(err, data){
        if (err) console.log(err);
        console.log("Update jumlah follower : OK");
        getFollower(-1, function(){
          callback();
        });
      });
    } else {
      console.log("Tidak ada perubahan followers :(");
      callback();
    }
  });
}

function main() {
  // get followers total
  T.get('users/show', { screen_name:"botbobok" },  function (err, data, response) {
    var totalFollower = data.followers_count;
    console.log("Total Follower : " + totalFollower);

    updateFollower(totalFollower, function() {
      var username = [];
      fs.readFileSync('followers.txt', 'utf-8').split(/\r?\n/).forEach(function(line){
        if (line != '') username.push(line);
      });
      shuffle(username);
      for (var i = 0; i < username.length; i++) {
        ngeTweet(username[i]);
      //console.log(username[i]);
      }


    });



  })

}


main();
