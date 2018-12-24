var fs = require("fs");
var file = "./test.db";

// load sqlite3
var sqlite3 = require("sqlite3").verbose();

// new a sqlite database, filename is test.db
var db = new sqlite3.Database(file);

db.serialize(function(){
	//db.run => if staff data table isn't exist, then build a new one
	db.run("CREATE TABLE IF NOT EXISTS Stuff (thing TEXT)");
	var stmt = db.prepare("INSERT INTO Stuff VALUES (?)");


	// Test for write in 10 data
	for (var i = 0; i < 10; i++){
		stmt.run("staff_number"+i);
	}
	
	stmt.finalize();
	
	db.each("SELECT rowid AS id, thing FROM stuff", function(err,row){
		//log out show all data
		console.log(row.id + ": " + row.thing);

		});
	});
db.close();
