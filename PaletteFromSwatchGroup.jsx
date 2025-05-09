//=============================================================================
//  Script Name:    PaletteFromSwatchGroup.jsx
//  Description:    Builds a grid of swatches from a swatch group.
//  Author:         Allister Petersen
//  AI Co-Author:   OpenAI ChatGPT (April 2025)
//  Created:        2025-05-09
//  Last Modified:  2025-05-09
//  Version:        1.0.0
//  Requirements:   Illustrator CC 2018+
//  Note:           Drop into “Presets/en_US/Scripts” and restart Illustrator.
//============================================================================
(function() {
  if (!app.documents.length || !app.activeDocument.swatchGroups.length) {
    alert("Please open a document and make sure you have at least one Swatch Group.");
    return;
  }

  var doc    = app.activeDocument;
  var groups = doc.swatchGroups;
  var names  = [];
  for (var i = 0; i < groups.length; i++) {
    names.push(groups[i].name || ("Group " + (i+1)));
  }

  // build picker dialog
  var w = new Window("dialog", "Choose Color Group");
  w.alignChildren = "fill";
  w.add("statictext", undefined, "Select the Swatch Group to lay out:");
  var dd = w.add("dropdownlist", undefined, names);
  dd.selection = 0;
  var btns = w.add("group");
  btns.alignment = "right";
  btns.add("button", undefined, "OK",     {name:"ok"});
  btns.add("button", undefined, "Cancel", {name:"cancel"});

  if (w.show() !== 1) {
    // user cancelled
    w.close();
    return;   // now valid, because we’re inside a function
  }

  var group    = groups[dd.selection.index];
  var swatches = group.getAllSwatches();

  // layout parameters
  var size   = 50;   // square size (pt)
  var margin = 20;   // gap between squares (pt)
  var cols   = 5;    // number of columns

  // draw the grid
  for (var i = 0; i < swatches.length; i++) {
    var row = Math.floor(i/cols),
        col = i % cols,
        x   = col*(size + margin),
        y   = -row*(size + margin);
    var rect = doc.pathItems.rectangle(y, x, size, size);
    rect.filled    = true;
    rect.stroked   = false;
    rect.fillColor = swatches[i].color;
  }

})();
