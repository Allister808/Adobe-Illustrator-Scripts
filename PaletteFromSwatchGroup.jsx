﻿//=============================================================================
//  Script Name:    PaletteFromSelectedSwatchGroup.jsx
//  Description:    Builds a grid of swatches from the currently selected group.
//  Author:         Cloudax Alexander
//  AI Co-Author:   OpenAI ChatGPT (May 2025)
//  Created:        2025-05-09
//  Last Modified:  2025-05-19
//  Version:        1.1.0
//  Requirements:   Illustrator CC 2018+
//  Note:           Drop into “Presets/en_US/Scripts” and restart Illustrator.
//=============================================================================

(function () {
  "use strict";

  //–– Preliminary checks ––
  if (!app.documents.length) {
    alert("No document open. Please open a document first.");
    return;
  }
  var doc = app.activeDocument;
  if (!doc.swatchGroups.length) {
    alert("No Swatch Groups found in this document.");
    return;
  }

  //–– Build the dialog ––
  var dlg = new Window("dialog", "Palette From Swatch Group");
  dlg.alignChildren = "fill";

  // 1) Select Swatch Group
  dlg.add("statictext", undefined, "1. Select Swatch Group:");
  var groupNames = [];
  for (var i = 0; i < doc.swatchGroups.length; i++) {
    var name = doc.swatchGroups[i].name;
    groupNames.push(name ? name : ("Group " + (i+1)));
  }
  var dd = dlg.add("dropdownlist", undefined, groupNames);
  dd.selection = 0;

  // 2) Layout options
  dlg.add("statictext", undefined, "2. Layout options (in points):");
  var opts = dlg.add("group");
  opts.orientation = "column";
  var row1 = opts.add("group");
  row1.add("statictext",undefined,"Square size:");
  var sizeInput = row1.add("edittext", [0,0,60,20], "50");
  row1.add("statictext",undefined,"pt");
  var row2 = opts.add("group");
  row2.add("statictext",undefined,"Spacing (margin):");
  var marginInput = row2.add("edittext", [0,0,60,20], "20");
  row2.add("statictext",undefined,"pt");
  var row3 = opts.add("group");
  row3.add("statictext",undefined,"Columns:");
  var colsInput = row3.add("edittext", [0,0,60,20], "5");

  // 3) Buttons
  var btns = dlg.add("group");
  btns.alignment = "right";
  btns.add("button", undefined, "OK",     {name:"ok"});
  btns.add("button", undefined, "Cancel", {name:"cancel"});

  //–– Show & bail on cancel ––
  if (dlg.show() !== 1) {
    dlg.close();
    return;
  }

  //–– Parse & validate inputs ––
  var group    = doc.swatchGroups[dd.selection.index];
  var swatches = group.getAllSwatches();
  var size     = parseFloat(sizeInput.text);
  var margin   = parseFloat(marginInput.text);
  var cols     = parseInt(colsInput.text, 10);
  if (isNaN(size) || size <= 0 ||
      isNaN(margin) || margin < 0 ||
      isNaN(cols) || cols < 1) {
    alert("Please enter valid numeric values:\n• size > 0\n• margin ≥ 0\n• columns ≥ 1");
    return;
  }

  //–– Draw the grid ––
  for (var j = 0; j < swatches.length; j++) {
    var row = Math.floor(j/cols),
        col = j % cols,
        x   = col*(size + margin),
        y   = -row*(size + margin);
    var rect = doc.pathItems.rectangle(y, x, size, size);
    rect.filled    = true;
    rect.stroked   = false;
    rect.fillColor = swatches[j].color;
  }

})();
