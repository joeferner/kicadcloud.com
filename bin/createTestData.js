'use strict';

var persist = require('persist');
var models = require('../lib/models');

persist.connect(function(err, conn) {
  if (err) {
    throw err;
  }

  var user1 = new models.User();
  user1.username = 'joeferner';
  user1.setPassword("test");
  user1.email = 'joe@fernsroth.com';
  user1.verified = true;

  conn.save([user1], function(err) {
    if (err) {
      throw err;
    }

    /*
    var pcbModule1 = new models.PcbModule();
    pcbModule1.description = "Test PCB module 1";
    pcbModule1.code = pcbModule1KiCadData;
    pcbModule1.keywords = "cap, capacitor, through hole";
    pcbModule1.createdBy = user1.id;
    pcbModule1.modifiedBy = user1.id;

    var schematicSymbol1 = new models.SchematicSymbol();
    schematicSymbol1.description = "Test Schematic Symbol 1";
    schematicSymbol1.code = schematicSymbol1KiCadData;
    schematicSymbol1.keywords = "cap, capacitor";
    schematicSymbol1.createdBy = user1.id;
    schematicSymbol1.modifiedBy = user1.id;

    conn.save([pcbModule1, schematicSymbol1], function(err) {
      if (err) {
        throw err;
      }

      console.log("Test data created!");
    });
    */
  });
});

var schematicSymbol1KiCadData =
  "DEF C C 0 10 N Y 1 F N\n"
    + "F0 \"C\" 50 100 50 H V L CNN\n"
    + "F1 \"C\" 50 -100 50 H V L CNN\n"
    + "$FPLIST\n"
    + "SM*\n"
    + "C?\n"
    + "C1-1\n"
    + "$ENDFPLIST\n"
    + "DRAW\n"
    + "P 2 0 1 20  -100 -30  100 -30 N\n"
    + "P 2 0 1 20  -100 30  100 30 N\n"
    + "X ~ 1 0 200 170 D 40 40 1 1 P\n"
    + "X ~ 2 0 -200 170 U 40 40 1 1 P\n"
    + "ENDDRAW\n"
    + "ENDDEF";

var pcbModule1KiCadData =
  "$MODULE C1\n"
    + "Po 0 0 0 15 3F92C496 00000000 ~~\n"
    + "Li C1\n"
    + "Cd Condensateur e = 1 pas\n"
    + "Kw C\n"
    + "Sc 00000000\n"
    + "Op 0 0 0\n"
    + "T0 100 -900 400 400 0 80 N V 21 \"C1\"\n"
    + "T1 0 -900 400 400 0 80 N I 21 \"V***\"\n"
    + "DS -980 -500 1000 -500 120 21\n"
    + "DS 1000 -500 1000 500 120 21\n"
    + "DS 1000 500 -1000 500 120 21\n"
    + "DS -1000 500 -1000 -500 120 21\n"
    + "DS -1000 -250 -750 -500 120 21\n"
    + "$PAD\n"
    + "Sh \"1\" C 550 550 0 0 0\n"
    + "Dr 320 0 0\n"
    + "At STD N 00E0FFFF\n"
    + "Ne 0 \"\"\n"
    + "Po -500 0\n"
    + "$EndPAD\n"
    + "$PAD\n"
    + "Sh \"2\" C 550 550 0 0 0\n"
    + "Dr 320 0 0\n"
    + "At STD N 00E0FFFF\n"
    + "Ne 0 \"\"\n"
    + "Po 500 0\n"
    + "$EndPAD\n"
    + "$SHAPE3D\n"
    + "Na \"discret/capa_1_pas.wrl\"\n"
    + "Sc 1.000000 1.000000 1.000000\n"
    + "Of 0.000000 0.000000 0.000000\n"
    + "Ro 0.000000 0.000000 0.000000\n"
    + "$EndSHAPE3D\n"
    + "$EndMODULE  C1\n";
