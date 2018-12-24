const fs = require('fs');

let count = 0;
let sqlite_count = 0;

/* add sqlite function */
var file = "./test.db";
// load sqlite3
var sqlite3 = require("sqlite3").verbose();
// new a sqlite database, filename is test.db
var db = new sqlite3.Database(file);


exports.send = function(time, data, gsensor,mac, rssi) {
  console.log(time);

  /* save way1 : save into .txt */

  let str = '';
  data.forEach(d => {
    str += count + "\t" + d + "\n";
    count++
  })
  filename = 'out.txt';
  fs.appendFile(filename, str, function(err) {
    if (err) {
      return console.log(err)
    }
  })

  console.log('\x1b[32m', '[SAVETXT] ', mac, '\x1b[0m');

  /* save way2 : save into sqlite */
  db.serialize(function(){
    //db.run => if ecgData data table isn't exist, then build a new one
    db.run("CREATE TABLE IF NOT EXISTS ecgData (thing TEXT)");
    var stmt = db.prepare("INSERT INTO ecgData VALUES (?)");

    // Test for write in 10 data
    /*
    for (var i = 0; i < 10; i++){
      stmt.run("staff_number"+i);
    }
    */

    // Write in the received data
    data.forEach(gg => {
	stmt.run(gg);
    })
	
	
    stmt.finalize();
	
    db.each("SELECT rowid AS id, thing FROM ecgData", function(err,row){
      //log out show all data
      console.log(row.id + ": " + row.thing);
      });
  });
  db.close();


};
