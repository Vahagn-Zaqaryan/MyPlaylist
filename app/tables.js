const Sequelize = require('sequelize');
const sq = require("./db");

const User = sq.define('users', {
  id: {type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true},
  googleId: {type: Sequelize.STRING(22), unique: true},
  accessToken: Sequelize.TEXT,
  refreshToken: Sequelize.TEXT,
  photos: Sequelize.TEXT,
  displayName: Sequelize.TEXT,
  interledger: Sequelize.TEXT,
  interPassword: Sequelize.TEXT
});

const Order = sq.define('orders', {
  id: {type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true},
  playlistId: Sequelize.TEXT,
  ownerId: Sequelize.STRING(22)
});

const Sale = sq.define('sales', {
  id: {type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true},
  playlistId: {type: Sequelize.INTEGER, unique: true},
  price: Sequelize.FLOAT
});

const Playlist = sq.define('playlists', {
  id: {type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true},
  title: Sequelize.TEXT,
  description: Sequelize.TEXT,
  youtubeId: {type: Sequelize.STRING(35), unique: true},
  status: {type: Sequelize.STRING(9), defaultValue: "youtube"},
  videos: Sequelize.TEXT,
  thumbnail: Sequelize.TEXT,
  userId: Sequelize.STRING(22)
});

const Copy = sq.define('copies', {
  id: {type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true},
  baseId: Sequelize.TEXT,
  copyId: Sequelize.TEXT,
  ownerId: Sequelize.STRING(22)
});

const Video = sq.define('videos', {
  id: {type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true},
  videoId: {type: Sequelize.STRING(12), unique: true},
  title: Sequelize.TEXT,
  thumbnail: Sequelize.TEXT
});

User.sync();
Playlist.sync();
Sale.sync();
Order.sync();
Copy.sync();
Video.sync();

module.exports = {User, Order, Sale, Playlist, Copy, Video};
