﻿//=============================================================================
//  Script Name:    PaletteCardsFromSwatchGroup.jsx
//  Description:    Builds a customizable card-style palette from the selected
//                  swatch group. You can adjust the spacing between cards and
//                  choose label/value fonts via editable, live-filtering ComboBoxes.
//  Author:         Allister Petersen
//  AI Co-Author:   OpenAI ChatGPT (May 2025)
//  Created:        2025-05-19
//  Last Modified:  2025-05-30
//  Version:        1.9.0
//  Requirements:   Illustrator CC 2018+
//=============================================================================

(function(){
  "use strict";
  if (!app.documents.length) {
    alert("Open a document first.");
    return;
  }
  var doc = app.activeDocument;
  if (!doc.swatchGroups.length) {
    alert("No Swatch Groups found.");
    return;
  }

  // --- Gather data ---
  var groupNames = [];
  for (var i = 0; i < doc.swatchGroups.length; i++) {
    var nm = doc.swatchGroups[i].name;
    groupNames.push(nm ? nm : ("Group " + (i+1)));
  }
  var allFonts = [];
  for (var f = 0; f < app.textFonts.length; f++) {
    allFonts.push(app.textFonts[f].name);
  }
  function idxOf(arr,val){
    for(var j=0;j<arr.length;j++){
      if(arr[j] === val) return j;
    }
    return 0;
  }
  var defaultBold = "Arial-BoldMT",
      defaultReg  = "ArialMT";

  // --- Build UI ---
  var dlg = new Window("dialog","Palette Cards Settings");
  dlg.alignChildren = "left";

  // 1) Swatch group
  dlg.add("statictext",undefined,"1) Select Swatch Group:");
  var lbGroup = dlg.add("listbox",[0,0,200,120], groupNames, {multiselect:false});
  lbGroup.selection = null;

  // 2) Spacing
  dlg.add("statictext",undefined,"2) Spacing between cards (pts):");
  var edMargin = dlg.add("edittext",[0,0,60,20],"20");
  edMargin.characters = 5;

  // 3) Font selectors with live filtering
  dlg.add("statictext",undefined,"3) Choose fonts (type to filter):");
  var fontPanel = dlg.add("group");
  fontPanel.orientation = "column";

  // Helper to filter a dropdownlist based on its .text
  function enableLiveFilter(dd) {
    dd.onChanging = function() {
      var q = dd.text.toLowerCase();
      var filtered = allFonts.filter(function(n){
        return n.toLowerCase().indexOf(q) !== -1;
      });
      // preserve current text
      var currentText = dd.text;
      dd.removeAll();
      filtered.forEach(function(name){ dd.add("item", name); });
      dd.text = currentText;
      // if exact match in list, select it
      var selIdx = idxOf(filtered, currentText);
      dd.selection = selIdx < filtered.length ? selIdx : null;
    };
  }

  // Bold label font
  var rowB = fontPanel.add("group");
  rowB.add("statictext",undefined,"Label font (bold):");
  var ddBold = rowB.add("dropdownlist",[0,0,180,20], allFonts);
  ddBold.editable = true;
  ddBold.selection = idxOf(allFonts, defaultBold);
  enableLiveFilter(ddBold);

  // Regular value font
  var rowR = fontPanel.add("group");
  rowR.add("statictext",undefined,"Value font (regular):");
  var ddReg = rowR.add("dropdownlist",[0,0,180,20], allFonts);
  ddReg.editable = true;
  ddReg.selection = idxOf(allFonts, defaultReg);
  enableLiveFilter(ddReg);

  // 4) OK / Cancel
  var btns = dlg.add("group");
  btns.alignment = "right";
  btns.add("button",undefined,"OK",{name:"ok"});
  btns.add("button",undefined,"Cancel",{name:"cancel"});

  // --- Show & validate ---
  if (dlg.show() !== 1) {
    dlg.close();
    return;
  }
  if (!lbGroup.selection) {
    alert("Please select a Swatch Group before proceeding.");
    dlg.close();
    return;
  }

  // --- Read settings ---
  var swatches      = doc.swatchGroups[lbGroup.selection.index].getAllSwatches(),
      margin        = parseFloat(edMargin.text),
      fontBoldName  = ddBold.selection ? ddBold.selection.text : ddBold.text,
      fontRegName   = ddReg.selection  ? ddReg.selection.text  : ddReg.text;

  if (isNaN(margin) || margin < 0) {
    alert("Please enter a valid non-negative number for spacing.");
    return;
  }

  // --- Config ---
  var CFG = {
    swatchSize:   100,
    bgHeight:      60,
    margin:        margin,
    columns:       4,
    infoOffsetX:   4,
    textInsetY:   16,
    fontBold:      fontBoldName,
    fontReg:       fontRegName,
    fontSize:     10,
    lineGap:       2,
    shadowOffX:    4,
    shadowOffY:   -4,
    shadowOp:     30
  };

  // --- Color conversion ---
  function colorInfo(c){
    if (c.typename==="SpotColor") c = c.spot.color;
    var red,green,blue,cyan,mag,yel,bl,cmyk,rgb,hex;
    if (c.typename==="CMYKColor") {
      cyan = Math.round(c.cyan); mag = Math.round(c.magenta);
      yel  = Math.round(c.yellow); bl = Math.round(c.black);
      cmyk = [cyan,mag,yel,bl].join(", ");
      red   = Math.round(255*(1-c.cyan/100)*(1-c.black/100));
      green = Math.round(255*(1-c.magenta/100)*(1-c.black/100));
      blue  = Math.round(255*(1-c.yellow/100)*(1-c.black/100));
      rgb   = [red,green,blue].join(", ");
    } else if (c.typename==="RGBColor") {
      var arr = app.convertSampleColor(
        ImageColorSpace.RGB,
        [c.red,c.green,c.blue],
        ImageColorSpace.CMYK,
        ColorConvertPurpose.defaultpurpose
      );
      cyan = Math.round(arr[0]); mag = Math.round(arr[1]);
      yel  = Math.round(arr[2]); bl = Math.round(arr[3]);
      cmyk = [cyan,mag,yel,bl].join(", ");
      red   = Math.round(c.red); green = Math.round(c.green); blue = Math.round(c.blue);
      rgb   = [red,green,blue].join(", ");
    } else {
      cmyk = rgb = "None"; red = green = blue = 0;
    }
    if (rgb !== "None") {
      function toHex(v){ var s=v.toString(16); return s.length<2?"0"+s:s; }
      hex = "#" + toHex(red) + toHex(green) + toHex(blue);
      hex = hex.toUpperCase();
    } else {
      hex = "None";
    }
    return { cmyk:cmyk, rgb:rgb, hex:hex };
  }

  var cardHeight = CFG.swatchSize + CFG.bgHeight + CFG.margin;

  // --- Render cards ---
  for(var i=0;i<swatches.length;i++){
    var sw   = swatches[i],
        info = colorInfo(sw.color),
        col  = i % CFG.columns,
        row  = Math.floor(i / CFG.columns),
        x    = col * (CFG.swatchSize + CFG.margin),
        y    = -row * cardHeight;

    var block = doc.pathItems.rectangle(y, x, CFG.swatchSize, CFG.swatchSize);
    block.filled = true; block.stroked = false; block.fillColor = sw.color;

    var pY    = y - CFG.swatchSize;
    var panel = doc.pathItems.rectangle(pY, x, CFG.swatchSize, CFG.bgHeight);
    panel.filled = true; panel.stroked = false;
    var white = new RGBColor(); white.red=255; white.green=255; white.blue=255;
    panel.fillColor = white;

    var grp    = doc.groupItems.add();
    block.move(grp, ElementPlacement.INSIDE);
    panel.move(grp, ElementPlacement.INSIDE);
    var shadow = grp.duplicate(); shadow.move(grp, ElementPlacement.PLACEAFTER);
    for(var j=0;j<shadow.pathItems.length;j++){
      var pi    = shadow.pathItems[j],
          black = new RGBColor(); black.red=0; black.green=0; black.blue=0;
      pi.fillColor = black; pi.stroked = false;
    }
    shadow.opacity = CFG.shadowOp;
    shadow.translate(CFG.shadowOffX, CFG.shadowOffY);

    var lines = [
      "Pantone: " + (sw.color.typename==="SpotColor"?sw.color.spot.name:"None"),
      "CMYK: "   + info.cmyk,
      "RGB: "    + info.rgb,
      "HEX: "    + info.hex
    ];
    var lh = CFG.fontSize + CFG.lineGap,
        t0 = pY - CFG.textInsetY;

    for(var k=0;k<lines.length;k++){
      var parts = lines[k].split(": "),
          L     = parts[0] + ": ",
          V     = parts[1] || "",
          tx    = x + CFG.infoOffsetX,
          tYK   = t0 - k * lh,
          tfL   = doc.textFrames.pointText([tx, tYK]);
      tfL.contents = L;
      tfL.textRange.characterAttributes.textFont =
        app.textFonts.getByName(CFG.fontBold);
      tfL.textRange.characterAttributes.size = CFG.fontSize;
      var tfV = doc.textFrames.pointText([tx + tfL.width, tYK]);
      tfV.contents = V;
      tfV.textRange.characterAttributes.textFont =
        app.textFonts.getByName(CFG.fontReg);
      tfV.textRange.characterAttributes.size = CFG.fontSize;
    }
  }

})();
