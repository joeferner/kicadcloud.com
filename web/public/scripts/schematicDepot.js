'use strict';

var kicad2svg = document.require('kicad2svg');

function renderPcbModule(targetSelector, pcbModuleText, options) {
  pcbModuleText = (pcbModuleText || '').trim();
  var mod = kicad2svg.modParser.parseModule(pcbModuleText);
  var svg = kicad2svg.modToSvg(mod, options);
  $(targetSelector).html(svg);
}

function renderSchematicSymbol(targetSelector, pcbModuleText, options) {
  pcbModuleText = (pcbModuleText || '').trim();
  var lib = kicad2svg.libParser.parseSymbolDef(pcbModuleText);
  var svg = kicad2svg.libToSvg(lib, options);
  $(targetSelector).html(svg);
}
