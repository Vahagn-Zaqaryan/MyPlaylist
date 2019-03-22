/*----- MODELS -----*/

// Modules
require('./tables.js');

// Finding information about user in database by ID
function getUser(id) {
  return sq.sync().then(() => users.findOne({
    where: {
      google_id: id
    }
  }));
}

// Updating accessToken, refreshToken and google ID of user 
function upsertUser(user) {
  if (user.refreshToken != "undefined" && refreshToken != "" && refreshToken != null) {
    var updates = {
      accessToken: accessToken,
      refreshToken: refreshToken,
      google_id: id
    }
  } else {
    var updates = {
      accessToken: accessToken,
      google_id: id
    }
  }
  return sq.sync().then(() => users.upsert(updates));
}

// Updating playlist information
function upsertPlaylist(data) {
  var updates = {
    title: data.title,
    description: data.description,
    youtube_id: data.youtube_id,
    videos: data.videos,
    thumbnail: data.thumbnail,
    user_id: data.user_id
  }
  return sq.sync().then(() => playlists.upsert(updates));
}
