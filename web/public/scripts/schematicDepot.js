'use strict';

var kicad2svg = document.require('kicad2svg');

function renderPcbModule(targetId, pcbModuleText, options) {
  var mod = kicad2svg.modParser.parseModule(pcbModuleText);
  var svg = kicad2svg.modToSvg(mod, options);
  $('#' + targetId).html(svg);
}

function renderSchematicSymbol(targetId, pcbModuleText, options) {
  var lib = kicad2svg.libParser.parseSymbolDef(pcbModuleText);
  var svg = kicad2svg.libToSvg(lib, options);
  $('#' + targetId).html(svg);
}
