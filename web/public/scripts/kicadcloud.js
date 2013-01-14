'use strict';

var kicad2svg = document.require('kicad2svg');

var EdaItem = EdaItem || {};

EdaItem.types = {
  schematicSymbol: 1,
  pcbModule: 2
};

function navigateToEdaItem(type, id) {
  type = parseInt(type);
  id = parseInt(id);
  switch (type) {
  case EdaItem.types.schematicSymbol:
    document.location.href = '/schematicSymbol/' + id;
    break;
  case EdaItem.types.pcbModule:
    document.location.href = '/pcbModule/' + id;
    break;
  default:
    console.error("unknown EDA item type", type);
    break;
  }
}

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
  return lib;
}

function renderEdaItems(root) {
  $('.edaItemSvg', root).each(function(i, elem) {
    try {
      var elemId = $(elem).attr('id');
      var parts = elemId.match(/edaItem_([0-9]*)_([0-9]*)/);
      var type = parts[1];
      var id = parts[2];
      var code = $('#' + elemId + '_code').val();
      switch (parseInt(type)) {
      case EdaItem.types.schematicSymbol:
        renderSchematicSymbol('#' + elemId, code, {
          size: 100
        });
        break;
      case EdaItem.types.pcbModule:
        renderPcbModule('#' + elemId, code, {
          size: 100
        });
        break;
      default:
        console.error("unknown EDA item type", type);
        break;
      }
    } catch (ex) {
      console.error("could not render EDA item", ex.stack);
    }
  });
}

function myAlert(level, message) {
  alert(message);
}