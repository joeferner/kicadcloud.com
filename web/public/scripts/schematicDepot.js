'use strict';

var kicad2svg = document.require('kicad2svg');

function renderPcbModule(targetSelector, pcbModuleCode, options) {
  pcbModuleCode = (pcbModuleCode || '').trim();
  var mod = kicad2svg.modParser.parseModule(pcbModuleCode);
  var svg = kicad2svg.modToSvg(mod, options);
  $(targetSelector).html(svg);
}

function renderSchematicSymbol(targetSelector, schematicSymbolCode, options) {
  schematicSymbolCode = (schematicSymbolCode || '').trim();
  var lib = kicad2svg.libParser.parseSymbolDef(schematicSymbolCode);
  var svg = kicad2svg.libToSvg(lib, options);
  $(targetSelector).html(svg);
}
