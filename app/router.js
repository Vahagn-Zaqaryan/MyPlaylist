'use strict';

const router = require('koa-router')();
const config = require('../config/config');
const passport = require('koa-passport');
const YAPI = require('./youtube');
const {User, Order, Sale, Playlist, Copy, Video} = require("./tables");
const koaBody = require('koa-body')();
const send = require('./payment');

async function main(ctx) {
  var news = [];
  var ordIds = [];
  var gid = null;
  if (ctx.isAuthenticated()) {
    var ords = await Order.findAll({
      where: {
        ownerId: ctx.state.user.id
      }
    })
    if (ords.length > 0) {
      for (var i in ords) {
        ordIds.push(ords[i].dataValues.playlistId);
      }
    }
    gid = ctx.state.user.googleId;
  }

  var pls = await Playlist.findAll({
    where: {
      status: "sale",
      userId: {
        $not: gid
      },
      id: {
        $notIn: ordIds
      }
    },
    order: [['id', 'DESC']],
    limit: 10
  })

  if (pls.length > 0) {
    for (var i in pls) {
      news.push(pls[i].dataValues);
      news[i].price = (await Sale.findOne({
        where: {
          playlistId: pls[i].dataValues.id
        }
      })).dataValues.price;
    }
  }

  await ctx.render('main/index', {
    news: news
  });
}

async function playlist_l(ctx) {
  if (ctx.isAuthenticated()) {
    var playlists = await Playlist.findAll({
      where: {
        userId: ctx.state.user.googleId
      },
      order: [['status']]
    });
    var pls = [];
    var prices = [];
    for (var i in playlists) {
      pls.push(playlists[i].dataValues);
      var priceD = await Sale.findOne({where: {playlistId: playlists[i].dataValues.id}});
      if (priceD != null) {
        var price = priceD.dataValues.price;
      } else {
        var price = null;
      }
      prices.push({id: playlists[i].dataValues.youtubeId, price: price});
    }
    var bpls = [];
    var ords = await Order.findAll({
      where: {
        ownerId: ctx.state.user.id
      }
    })

    var bprices = [];
    for (var i in ords) {
      var pl = await Playlist.findOne({
        where: {
          id: ords[i].dataValues.playlistId
        }
      })
      bpls.push(pl.dataValues);
      var priceD = await Sale.findOne({where: {playlistId: pl.dataValues.id}});
      bprices.push({id: playlists[i].dataValues.youtubeId, price: priceD.dataValues.price});

    }

    await ctx.render('my_playlists/my_playlists', {
      playlists: pls,
      prices: prices,
      boughtPlaylists: bpls,
      boughtPrices: bprices
    });
  } else {
    ctx.redirect('/main');
  }
}

async function playlist_p(ctx) {
  if (ctx.isAuthenticated()) {
    var info = await Playlist.findOne({
      where: {
        youtubeId: ctx.params.id
      }
    });

    if (info.dataValues.videos != '') {
      var items = [];
      var vid = info.dataValues.videos.split(",");
      for (var i in vid) {
        var v = await Video.findOne({
          where: {
            videoId: vid[i]
          }
        });
        var title = v.dataValues.title;
        var thumb = v.dataValues.thumbnail;
        items.push({
          snippet: {
            title: title,
            thumbnails: {
              default: {
                url: thumb
              }
            },
            resourceId: {
              videoId: vid[i]
            }
          }
        })
      }
    } else {
      var youApi = new YAPI(config, ctx.state.user.accessToken, ctx.state.user.refreshToken);
      var items = (await youApi.getPlaylistItems(ctx.params.id)).items;

    }
    var infs = await Sale.findOne({
      where: {
        playlistId: info.id
      }
    });

    if (infs) {
      info.price = infs.dataValues.price
    }
    await ctx.render('playlist-page/index', {
      info: info,
      items: items
    });
  } else {
    ctx.redirect('/');
  }
}


async function store(ctx) {
  if (ctx.isAuthenticated()) {
    var ords = await Order.findAll({
      where: {
        ownerId: ctx.state.user.id
      }
    })
    var ordIds = [];
    for (var i in ords) {
      ordIds.push(ords[i].dataValues.playlistId);
    }
    var playlists = await Playlist.findAll({
      where: {
        status: "sale",
        userId: {
          $not: ctx.state.user.googleId
        },
        id: {
          $notIn: ordIds
        }
      }
    });

    var pls = [];
    var prs = [];
    for (var i in playlists) {
      pls.push(playlists[i].dataValues);
      var price = (await Sale.findOne({
        where: {
          playlistId: playlists[i].dataValues.id
        }
      })).dataValues.price;
      prs.push({price: price});
    }

    await ctx.render('store/store', {
      playlists: pls,
      prices: prs
    });
  } else {
    ctx.redirect('/');
  }
}

async function dashboard(ctx, next) {
  if (ctx.isAuthenticated()) {
    var news = [];
    var ordIds = [];
    var gid = null;
    if (ctx.isAuthenticated()) {
      var ords = await Order.findAll({
        where: {
          ownerId: ctx.state.user.googleId
        }
      })
      if (ords.length > 0) {
        for (var i in ords) {
          ordIds.push(ords[i].dataValues.playlistId);
        }
      }
      gid = ctx.state.user.googleId;
    }
    var pls = await Playlist.findAll({
      where: {
        status: "sale",
        userId: {
          $not: gid
        },
        id: {
          $notIn: ordIds
        }
      },
      order: [['id', 'DESC']],
      limit: 10
    })

    if (pls.length > 0) {
      for (var i in pls) {
        news.push(pls[i].dataValues);
        news[i].price = (await Sale.findOne({
          where: {
            playlistId: pls[i].dataValues.id
          }
        })).dataValues.price;
      }
    }
    await ctx.render('main/index', {
      user: ctx.state.user,
      news: news
    });
  } else {
    ctx.redirect("/");
  }
}

async function logout(ctx) {
  ctx.logout();
  ctx.redirect('/');
}

async function buy(ctx) {
  console.log("-------------------------------------------------------------");
  try {
    var exist = await Order.findOne({
      where: {
        playlistId: ctx.request.body.id,
        ownerId: ctx.state.user.id
      }
    });

    if (exist == null) {
      var interPassword = (await User.findOne({
        where: {
          googleId: ctx.state.user.googleId
        },
        attributes: ['interPassword']
      })).get('interPassword');

      var amount = (await Sale.findOne({
        where: {
          playlistId: ctx.request.body.id
        }
      })).get('price');

      var playlist = (await Playlist.findOne({
        where: {
          id: ctx.request.body.id
        }
      })).dataValues;

      var receiver = (await User.findOne({
        where: {
          googleId: playlist.userId
        },
        attributes: ['interledger']
      })).dataValues.interledger;

      if (ctx.state.user.interledger == '' || ctx.state.user.interledger == null || interPassword == '' || interPassword == null) {
        ctx.body = "Inter";
        return 0;
      }
      ;

      //await send(ctx.state.user.interledger, interPassword, amount, receiver, "Payment for Playlist: " + playlist.youtubeId);
      console.log("Payment sent");

      await Order.create({
        playlistId: ctx.request.body.id,
        ownerId: ctx.state.user.id
      });
      console.log("Order created for user : " + ctx.state.user.id);

      var youApi = new YAPI(config, ctx.state.user.accessToken, ctx.state.user.refreshToken);

      var newId = await youApi.insertPlaylist({
        title: playlist.title,
        description: playlist.description
      });

      await Copy.create({
        baseId: playlist.id,
        copyId: newId,
        ownerId: ctx.state.user.id
      });

      console.log("Copy added into Database " + newId);

      var videos = playlist.videos.split(",");

      for (var i in videos) {
        await youApi.insertVideo({
          pid: newId,
          ptitle: playlist.title,
          vid: videos[i]
        })
      }
      ;

      ctx.body = "OK";
      console.log("Response sent");
    }
  } catch (err) {
    console.log("On line 333: " + err);
    ctx.body = "err";
  }
}

async function inter(ctx) {
  try {
    await User.upsert({
      googleId: ctx.state.user.googleId,
      interledger: ctx.request.body.int,
      interPassword: ctx.request.body.intp
    })
    ctx.body = "OK";
  } catch (err) {
    console.log("On line 347: " + err);
    ctx.body = "err";
  }
}

async function payment_settings(ctx) {
  if (ctx.isAuthenticated()) {
    await ctx.render('payment/index', {user: ctx.state.user});
  } else {
    ctx.redirect('/');
  }
}

async function deletePlaylist(ctx) {
  try {
    var youApi = new YAPI(config, ctx.state.user.accessToken, ctx.state.user.refreshToken);


    var inf = await Copy.findOne({
      where: {
        baseId: ctx.request.body.id,
        ownerId: ctx.state.user.id
      }
    });

    await Order.destroy({
      where: {
        ownerId: ctx.state.user.id,
        playlistId: ctx.request.body.id
      }
    });
    console.log("Order destroied for user : " + ctx.state.user.id);

    if (inf.dataValues.copyId != null) {
      await Copy.destroy({
        where: {
          baseId: ctx.request.body.id,
          ownerId: ctx.state.user.id
        }
      });
      console.log("Copy destroied " + inf.dataValues.copyId);

      await youApi.deletePlaylist(inf.dataValues.copyId);
    }
    ctx.body = "OK";
  } catch (err) {
    console.log("On line 404: " + err);
    ctx.body = "err";
  }
}


// ------------ //
// Sale process //
// ------------ //
router.post('/sell', koaBody, async (ctx) => {
  // CONSOLES
  console.log("////////////// Starting sell process //////////////////");
  console.log(ctx.request.body);
  if (ctx.state.user.interledger == null || ctx.state.user.interledger == '') {
    ctx.body = "Inter";
    return 0;
  }

  let id = ctx.request.body.id;
  let price = ctx.request.body.price;
  console.log(id);
  // MAIN CODE
  try {
    // CONSOLE
    console.log("We get price ---- $" + price);
    // CODE
    // Insert a new row in table Sales
    await Sale.upsert(
      {playlistId: id, price: price}
    );

    // Selecting row in table Playlist by id
    let playlist = await Playlist.findById(id);
    console.log("Youtube playlist id - " + playlist.get('youtubeId'));
    //YAPI connection
    var youApi = new YAPI(config, ctx.state.user.accessToken, ctx.state.user.refreshToken);
    var items = await youApi.getPlaylistItems(playlist.get('youtubeId'));

    // Array for videos
    var videos = [];
    for (var j in items.items) {
      videos.push(items.items[j].snippet.resourceId.videoId);
      await Video.upsert({
        videoId: items.items[j].snippet.resourceId.videoId,
        title: items.items[j].snippet.title,
        thumbnail: items.items[j].snippet.thumbnails.default.url
      })
    }
    videos = videos.join(",");

    // Playlist status changing process and video id inserting
    await Playlist.update(
      {status: "sale", videos: videos},
      {where: {id: id, userId: ctx.state.user.googleId}}
    );

    // Massage
    ctx.body = "OK";
  }
  catch (err) {
    // CONSOLE
    console.log("On line 463: " + err);
    // ERROR
    ctx.body = "Err";
  }
});

// ------------------------ //
// Sale cancelation process //
// ------------------------ //
router.post('/cancelSale', koaBody, async (ctx) => {
  // CONSOLES
  console.log("////////////// Canceling playlist sale //////////////////");
  console.log(ctx.request.body);

  // MAIN CODE
  try {
    // Removing playlist from playlist SALE table
    await Sale.destroy(
      {where: {playlistId: ctx.request.body.id}}
    );
    // Playlist status change process
    await Playlist.update(
      {status: "deleted"},
      {where: {id: ctx.request.body.id}}
    );
    // CODE - end
    ctx.body = "OK";
  }
  catch (err) {
    // CONSOLE
    console.log("On line 493: " + err);
    // ERROR
    ctx.body = "Err";
  }
});

router.get('/payment_settings', payment_settings);
router.get('/main', main);
router.get('/', main);
router.get('/my-playlists', playlist_l);
router.get('/playlist-page/:id', playlist_p);
router.get('/store', store);
router.post('/buy', koaBody, buy);
router.post('/inter', koaBody, inter);
router.post('/deletePlaylist', koaBody, deletePlaylist);
router.get('/auth/google', passport.authenticate('google', {
  scope: config.google.scope,
  accessType: config.google.accessType,
  approvalPrompt: config.google.approvalPrompt
}));

router.get('/auth/google/callback', passport.authenticate('google', {
  successRedirect: '/dashboard',
  failureRedirect: '/'
}));

router.get('/logout', logout);

router.get('/dashboard', dashboard);

module.exports = router;
