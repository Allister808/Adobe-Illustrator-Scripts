//=============================================================================
//  Script Name:    StyleGuideDesigner_WithPaletteCards.jsx
//  Description:    Creates elements for a style guide, Typography and Color Style
//                  with integrated palette‐card design and artboard titles.
//  Author:         Allister Petersen
//  AI Co-Author:   OpenAI ChatGPT (Jun 2025)
//  Created:        2025-05-19
//  Last Modified:  2025-05-21
//  Version:        1.0.0
//  Requirements:   Illustrator CC 2018+
//=============================================================================

(function(){
  if (!app.documents.length) {
    alert("Open a document first.");
    return;
  }
  var doc = app.activeDocument;

  // === DATA COLLECTION ===
  var allFonts = [];
  for (var i = 0; i < app.textFonts.length; i++) {
    allFonts.push(app.textFonts[i].name);
  }
  function fontIndex(arr, name) {
    for (var j = 0; j < arr.length; j++) {
      if (arr[j] === name) return j;
    }
    return 0;
  }

  // Defaults
  var defaultBlocks = [
    { label:"Headline",   font:"Arial-BoldMT",   size:36, note:"Headline should always be in title case." },
    { label:"Subhead",    font:"ArialMT",        size:28, note:"Subhead in sentence case."   },
    { label:"Descriptor", font:"Arial-ItalicMT", size:20, note:"Descriptors can use italic." }
  ];
  var defaultSwatches = [
    { name:"Brand Blue",    color:"#1E4B7A", pantone:"" },
    { name:"Accent Orange", color:"#FF9900", pantone:"" },
    { name:"Cool Grey",     color:"#AAB3BA", pantone:"" },
    { name:"Black",         color:"#000000", pantone:"" },
    { name:"White",         color:"#FFFFFF", pantone:"" }
  ];

  // Color converters
  function hexToRGB(hex){
    hex = hex.replace("#","");
    if (hex.length === 3) hex = hex[0]+hex[0]+hex[1]+hex[1]+hex[2]+hex[2];
    var r = parseInt(hex.substr(0,2),16),
        g = parseInt(hex.substr(2,2),16),
        b = parseInt(hex.substr(4,2),16),
        c = new RGBColor();
    c.red = r; c.green = g; c.blue = b;
    return c;
  }
  function hexToCMYK(hex){
    hex = hex.replace("#","");
    if (hex.length === 3) hex = hex[0]+hex[0]+hex[1]+hex[1]+hex[2]+hex[2];
    var r = parseInt(hex.substr(0,2),16)/255,
        g = parseInt(hex.substr(2,2),16)/255,
        b = parseInt(hex.substr(4,2),16)/255,
        k = 1 - Math.max(r,g,b);
    if (k === 1) return {c:0,m:0,y:0,k:100};
    return {
      c: Math.round((1-r-k)/(1-k)*100),
      m: Math.round((1-g-k)/(1-k)*100),
      y: Math.round((1-b-k)/(1-k)*100),
      k: Math.round(k*100)
    };
  }

  // === BUILD UI ===
  var dlg = new Window("dialog","Style Guide Designer");
  dlg.orientation="row"; dlg.alignChildren="fill"; dlg.preferredSize=[1000,700];
  var tabs = dlg.add("tabbedpanel"); tabs.preferredSize=[700,650];

  // -- TYPOGRAPHY TAB --
  var tabType = tabs.add("tab",undefined,"Typography");
  tabType.orientation="column"; tabType.alignChildren=["fill","top"];
  var typePanel = tabType.add("panel",undefined,undefined,{scrollable:true});
  typePanel.alignChildren=["fill","top"]; typePanel.preferredSize=[680,500];

  var maxRows=10, shownRows=defaultBlocks.length, blockPanels=[];
  for(var i=0;i<maxRows;i++){
    (function(i){
      var def = defaultBlocks[i]||{label:"",font:allFonts[0],size:18,note:""};
      var grp = typePanel.add("panel",undefined,"Style "+(i+1));
      grp.margins=8; grp.alignChildren=["left","center"];
      grp.visible = (i<shownRows);

      grp.add("statictext",undefined,"Name:");
      var edName = grp.add("edittext",undefined,def.label);
      edName.characters = 18;

      grp.add("statictext",undefined,"Font:");
      var ddFont = grp.add("dropdownlist",undefined,allFonts);
      ddFont.selection = ddFont.items[ fontIndex(allFonts,def.font) ];
      ddFont.editable = true;
      ddFont.onChanging = function(){
        var q=this.text.toLowerCase(); this.removeAll();
        for(var k=0;k<allFonts.length;k++){
          if(allFonts[k].toLowerCase().indexOf(q)>=0) this.add("item",allFonts[k]);
        }
        this.text = q;
      };

      var g2 = grp.add("group");
      g2.add("statictext",undefined,"Size:");
      var edSize = g2.add("edittext",undefined,def.size); edSize.characters=5;

      grp.add("statictext",undefined,"Note:");
      var edNote = grp.add("edittext",undefined,def.note); edNote.characters=30;

      blockPanels.push({name:edName,font:ddFont,size:edSize,note:edNote});
    })(i);
  }
  var ctrlType = tabType.add("group"); ctrlType.alignment="left";
  ctrlType.add("button",undefined,"Add Row").onClick = function(){
    if(shownRows<maxRows){ blockPanels[shownRows].name.parent.visible=true; shownRows++; }
  };
  ctrlType.add("button",undefined,"Remove Row").onClick = function(){
    if(shownRows>1){ shownRows--; blockPanels[shownRows].name.parent.visible=false; }
  };

  // -- COLOR STYLES TAB --
  var tabCol = tabs.add("tab",undefined,"Color Styles");
  tabCol.orientation="column"; tabCol.alignChildren=["fill","top"];
  var colorPanel = tabCol.add("panel",undefined,undefined,{scrollable:true});
  colorPanel.alignChildren=["fill","top"]; colorPanel.preferredSize=[680,500];

  var maxCols=12, shownCols=defaultSwatches.length, swPanels=[];
  for(var i=0;i<maxCols;i++){
    (function(i){
      var def = defaultSwatches[i]||{name:"",color:"#CCCCCC",pantone:""};
      var grp = colorPanel.add("panel",undefined,"Swatch "+(i+1));
      grp.margins=8; grp.orientation="row"; grp.alignChildren=["left","center"];
      grp.visible=(i<shownCols);

      grp.add("statictext",undefined,"Name:");
      var edN = grp.add("edittext",undefined,def.name); edN.characters=12;

      grp.add("statictext",undefined,"Hex:");
      var edC = grp.add("edittext",undefined,def.color); edC.characters=8;

      var sw = grp.add("panel",undefined,undefined,{borderStyle:"sunken"});
      sw.preferredSize=[30,18];
      function updS(){
        var h=edC.text.replace("#",""); if(h.length===3)h=h[0]+h[0]+h[1]+h[1]+h[2]+h[2];
        sw.graphics.backgroundColor = sw.graphics.newBrush(
          sw.graphics.BrushType.SOLID_COLOR,
          [
            parseInt(h.substr(0,2),16)/255,
            parseInt(h.substr(2,2),16)/255,
            parseInt(h.substr(4,2),16)/255,
            1
          ]
        );
      }
      updS(); edC.onChanging=updS;

      grp.add("button",undefined,"Pick").onClick=function(){
        var cp=$.colorPicker();
        if(cp!==undefined){
          var r=(cp>>16)&255,g=(cp>>8)&255,b=cp&255;
          function hx(n){return("0"+n.toString(16)).slice(-2);}
          edC.text="#"+hx(r)+hx(g)+hx(b); updS();
        }
      };

      grp.add("statictext",undefined,"Pantone:");
      var edP=grp.add("edittext",undefined,def.pantone); edP.characters=10;

      swPanels.push({name:edN,color:edC,pantone:edP});
    })(i);
  }
  var ctrlCol = colorPanel.add("group"); ctrlCol.alignment="left";
  ctrlCol.add("button",undefined,"Add Swatch").onClick = function(){
    if(shownCols<maxCols){ swPanels[shownCols].name.parent.visible=true; shownCols++; }
  };
  ctrlCol.add("button",undefined,"Remove Swatch").onClick = function(){
    if(shownCols>1){ shownCols--; swPanels[shownCols].name.parent.visible=false; }
  };

  // -- Preset Save/Load (handlers omitted) --
  var presetGrp = dlg.add("group"); presetGrp.alignment="left";
  var btnSave = presetGrp.add("button",undefined,"Save Preset");
  var btnLoad = presetGrp.add("button",undefined,"Load Preset");

  // -- Dialog Buttons --
  var btnGrp = dlg.add("group"); btnGrp.alignment="right";
  btnGrp.add("button",undefined,"Create",{name:"ok"});
  btnGrp.add("button",undefined,"Cancel",{name:"cancel"});
  if(dlg.show()!==1) return;

  // === COLLECT INPUTS ===
  var blocks=[], swList=[];
  for(var i=0;i<shownRows;i++){
    var b=blockPanels[i]; if(!b.name.text) continue;
    blocks.push({
      label:b.name.text,
      font:(b.font.selection?b.font.selection.text:allFonts[0]),
      size:parseInt(b.size.text,10),
      note:b.note.text
    });
  }
  for(var i=0;i<shownCols;i++){
    var s=swPanels[i]; if(!s.name.text) continue;
    swList.push({
      name:s.name.text,
      color:s.color.text,
      pantone:s.pantone.text||"none"
    });
  }

  // === PERFORMANCE CACHING ===
  for(var i=0;i<blocks.length;i++){
    blocks[i].fontObj = app.textFonts.getByName(blocks[i].font);
  }
  for(var i=0;i<swList.length;i++){
    swList[i].rgbColor = hexToRGB(swList[i].color);
    swList[i].cmykVal  = hexToCMYK(swList[i].color);
  }

  // === ARTBOARD SETUP + NAMING + TITLES ===
  var abRect   = doc.artboards[0].artboardRect,
      w        = abRect[2]-abRect[0],
      h        = abRect[1]-abRect[3],
      abIndex  = doc.artboards.length;

  doc.artboards.add([abRect[0],abRect[3],          abRect[0]+w, abRect[3]-h]);
  doc.artboards.add([abRect[0],abRect[3]-h,        abRect[0]+w, abRect[3]-2*h]);

  // **Set artboard panel names**
  try { doc.artboards[abIndex].name     = "Typography";   } catch(e){}
  try { doc.artboards[abIndex+1].name   = "Color Styles"; } catch(e){}

  var artTypoRect  = doc.artboards[abIndex].artboardRect,
      artColorRect = doc.artboards[abIndex+1].artboardRect,
      artTypoLeft  = artTypoRect[0], artTypoTop  = artTypoRect[1],
      artColorLeft = artColorRect[0],artColorTop = artColorRect[1];

  var titleSize    = 36,
      titleOffset  = 40,
      titleSpacing = titleSize + titleOffset;

  // Typography title text
  var tfT = doc.textFrames.pointText([artTypoLeft+20, artTypoTop - titleOffset]);
  tfT.contents = "Typography";
  tfT.textRange.characterAttributes.textFont  = app.textFonts.getByName("Arial-BoldMT");
  tfT.textRange.characterAttributes.size      = titleSize;
  tfT.textRange.characterAttributes.fillColor = hexToRGB("#000000");

  // Color Styles title text
  var tfC = doc.textFrames.pointText([artColorLeft+20, artColorTop - titleOffset]);
  tfC.contents = "Color Styles";
  tfC.textRange.characterAttributes.textFont  = app.textFonts.getByName("Arial-BoldMT");
  tfC.textRange.characterAttributes.size      = titleSize;
  tfC.textRange.characterAttributes.fillColor = hexToRGB("#000000");

  // === DRAW ===
  try{ app.executeMenuCommand('doc-redraw off'); }catch(e){}

  // — Typography —
  doc.artboards.setActiveArtboardIndex(abIndex);
  var x0 = artTypoLeft + 100,
      startY = artTypoTop - titleSpacing - 63,
      rowGap = 300, topSpace = 20, bottomSpace = 40, aaSize = 150;

  for(var i=0;i<blocks.length;i++){
    var b=blocks[i],
        yy=startY - i*rowGap,
        styleSize=b.size*1.25,
        descSize=Math.round(13*1.25),
        sampleSize=Math.max(23,Math.round(b.size*0.56*1.25)),
        fontNameY=yy-styleSize-topSpace,
        descY=fontNameY-descSize-topSpace,
        sampleY=descY-sampleSize-bottomSpace,
        aaY=yy-(aaSize-styleSize);

    // Style label
    var tf = doc.textFrames.pointText([x0,yy]);
    tf.contents = b.label;
    tf.textRange.characterAttributes.textFont  = b.fontObj;
    tf.textRange.characterAttributes.size      = styleSize;
    tf.textRange.characterAttributes.fillColor = hexToRGB("#000000");

    // Font name
    var fn = doc.textFrames.pointText([x0,fontNameY]);
    fn.contents = b.font;
    fn.textRange.characterAttributes.textFont  = b.fontObj;
    fn.textRange.characterAttributes.size      = styleSize;
    fn.textRange.characterAttributes.fillColor = hexToRGB("#000000");

    // Note
    var nt = doc.textFrames.pointText([x0,descY]);
    nt.contents = b.note;
    nt.textRange.characterAttributes.textFont  = app.textFonts.getByName("ArialMT");
    nt.textRange.characterAttributes.size      = descSize;
    nt.textRange.characterAttributes.fillColor = hexToRGB("#000000");

    // Sample
    var sa = doc.textFrames.pointText([x0,sampleY]);
    sa.contents = "abcdefghijklmnopqrstuvwxyz\nABCDEFGHIJKLMNOPQRSTUVWXYZ\n1234567890";
    sa.textRange.characterAttributes.textFont  = b.fontObj;
    sa.textRange.characterAttributes.size      = sampleSize;
    sa.textRange.characterAttributes.fillColor = hexToRGB("#000000");

    // Aa
    var aa = doc.textFrames.pointText([x0+460,aaY]);
    aa.contents = "Aa";
    aa.textRange.characterAttributes.textFont  = b.fontObj;
    aa.textRange.characterAttributes.size      = aaSize;
    aa.textRange.characterAttributes.fillColor = hexToRGB("#000000");
  }

  // — Color Cards —
  doc.artboards.setActiveArtboardIndex(abIndex+1);

  var CFG = {
    swatchSize:  100,
    bgHeight:     60,
    margin:      40,
    columns:     4,
    infoOffsetX:  4,
    textInsetY:  16,
    fontBold:     "Arial-BoldMT",
    fontReg:      "ArialMT",
    fontSize:    10,
    lineGap:     2,
    shadowOffX:   4,
    shadowOffY:  -4,
    shadowOp:    30
  };
  var cardHeight = CFG.swatchSize + CFG.bgHeight + CFG.margin,
      cardTopY   = artColorTop - titleSpacing,
      colorXOffset = artColorLeft + 100; // shift right

  for(var i=0;i<swList.length;i++){
    var s    = swList[i],
        col  = i % CFG.columns,
        row  = Math.floor(i / CFG.columns),
        x1   = colorXOffset + col * (CFG.swatchSize + CFG.margin),
        y1   = cardTopY - row * cardHeight;

    // Swatch block
    var block = doc.pathItems.rectangle(y1, x1, CFG.swatchSize, CFG.swatchSize);
    block.filled   = true;
    block.stroked  = false;
    block.fillColor = s.rgbColor;

    // Info panel
    var pY = y1 - CFG.swatchSize;
    var panel = doc.pathItems.rectangle(pY, x1, CFG.swatchSize, CFG.bgHeight);
    panel.filled = true;
    panel.stroked = false;
    var white = new RGBColor(); white.red=255; white.green=255; white.blue=255;
    panel.fillColor = white;

    // Group + shadow
    var grp = doc.groupItems.add();
    block.move(grp,ElementPlacement.INSIDE);
    panel.move(grp,ElementPlacement.INSIDE);
    var shadow = grp.duplicate();
    shadow.move(grp,ElementPlacement.PLACEAFTER);
    for(var j=0;j<shadow.pathItems.length;j++){
      var pi = shadow.pathItems[j],
          black = new RGBColor();
      black.red=0; black.green=0; black.blue=0;
      pi.fillColor=black; pi.stroked=false;
    }
    shadow.opacity = CFG.shadowOp;
    shadow.translate(CFG.shadowOffX,CFG.shadowOffY);

    // Text lines
    var CMYK = s.cmykVal,
        RGB  = [Math.round(s.rgbColor.red),Math.round(s.rgbColor.green),Math.round(s.rgbColor.blue)].join(", "),
        HEX  = s.color.toUpperCase(),
        PANT = s.pantone||"None";
    var lines = [
      "Pantone: " + PANT,
      "CMYK: "   + [CMYK.c,CMYK.m,CMYK.y,CMYK.k].join(", "),
      "RGB: "    + RGB,
      "HEX: "    + HEX
    ];
    var lh = CFG.fontSize + CFG.lineGap,
        t0 = pY - CFG.textInsetY;

    for(var k=0;k<lines.length;k++){
      var parts = lines[k].split(": "),
          L = parts[0] + ": ",
          V = parts[1]||"",
          tx = x1 + CFG.infoOffsetX,
          ty = t0 - k*lh;
      var tfL = doc.textFrames.pointText([tx,ty]);
      tfL.contents = L;
      tfL.textRange.characterAttributes.textFont = app.textFonts.getByName(CFG.fontBold);
      tfL.textRange.characterAttributes.size     = CFG.fontSize;
      var tfV = doc.textFrames.pointText([tx+tfL.width,ty]);
      tfV.contents = V;
      tfV.textRange.characterAttributes.textFont = app.textFonts.getByName(CFG.fontReg);
      tfV.textRange.characterAttributes.size     = CFG.fontSize;
    }
  }

  try{ app.executeMenuCommand('doc-redraw on'); }catch(e){}
  alert("Style guide created!\nSee artboards “"+abIndex+"” (Typography) and “"+(abIndex+1)+"” (Color Styles).");
})();
