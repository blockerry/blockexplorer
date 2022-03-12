var mongoose = require('mongoose'),
    db = require('../lib/database'),
    Tx = require('../models/tx'),
    Address = require('../models/address'),
    settings = require('../lib/settings');

var COUNT = 5000; // number of blocks to index

function exit() {
  mongoose.disconnect();
  process.exit(0);
}

var dbString = 'mongodb://' + settings.dbsettings.user;
dbString = dbString + ':' + settings.dbsettings.password;
dbString = dbString + '@' + settings.dbsettings.address;
dbString = dbString + ':' + settings.dbsettings.port;
dbString = dbString + "/IQUIDUS-BENCHMARK";

mongoose.connect(dbString, function(err) {
  if (err) {
    console.log('Unable to connect to database: %s', dbString);
    console.log('Aborting');
    exit();
  }

  Tx.deleteMany({}, function(err) {
    Address.deleteMany({}, function(err2) {
      var s_timer = new Date().getTime();

      db.update_tx_db(settings.coin.name, 1, COUNT, 0, settings.sync.update_timeout, false, function() {
        var e_timer = new Date().getTime();

        Tx.countDocuments({}, function(txerr, txcount) {
          Address.countDocuments({}, function(aerr, acount) {
            var stats = {
              tx_count: txcount,
              address_count: acount,
              seconds: (e_timer - s_timer)/1000,
            };

            console.log(stats);
            exit();
          });
        });
      });
    });
  });
});