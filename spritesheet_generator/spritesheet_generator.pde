PGraphics pg;

void setup() {
  size(701, 433);
  pg = createGraphics(width, height);
  generate();
  pg.save("spritesheet.png");
  background(120);
  image(pg, 0, 0);
}

void generate(){
  String[] names = listFileNames("E:\\p5\\CatCatcher\\spritesheet_generator\\data");
  float x = 0;
  float y = 0;
  float furthestRight = 0;
  float furthestDown = 0;
  float rowHeight = 0;
  pg.beginDraw();
  pg.clear();
  for (String name : names) {
    if (name.startsWith("unused")) {
      continue;
    }
    PImage img = loadImage(name);
    if (x + img.width >= width) {
      y += rowHeight;
      rowHeight = 0;
      x = 0;
    }
    pg.image(img, x, y);
    printLoadCode(name, img, x, y);
    x += img.width;
    rowHeight = max(rowHeight, img.height);
    furthestRight = max(furthestRight, x);
    furthestDown = max(furthestDown, y + img.height);
  }
  println("\nfinalDimensions " + furthestRight + " by " + furthestDown);
  pg.endDraw(); 
}

void printLoadCode(String name, PImage img, float x, float y) {
  String nameWithoutSuffix = translateFilenameToVariableName(name);
  if (name.contains("1")) {
    print(nameWithoutSuffix + " = [sprites.get(" + x + "," + y +"," + img.width + "," + img.height + "),");
  } else if (name.contains("2")) {
    println(" sprites.get(" + x + "," + y +"," + img.width + "," + img.height + ")];");
  } else {
    println(nameWithoutSuffix + " = sprites.get(" + x + "," + y + "," + img.width + "," + img.height + ");");
  }
}

String translateFilenameToVariableName(String name){
  switch(name){
     case "polaroid-blep.png": return "polaroidBlep";
     case "polaroid-idle.png": return "polaroidIdle";
     case "chopsticks-hold.png": return "sticksHeld";
     case "chopsticks-idle.png": return "sticksIdle";
     case "kitten-held.png": return "catHeld";
     case "kitten-down-1.png": return "catWalkDown";
     case "kitten-side-1.png": return "catWalkRight";
     case "kitten-up-1.png": return "catWalkUp";
     case "donate-button-1.png": return "catDonate";
     case "_title_white.png": return "title";
     case "kitten-lie-1.png": return "catTitle";
     case "kitten-sit-1.png": return "catSit";
     case "kitten-slipp-1.png": return "catSleep";
     case "button-play-1.png": return "labelPlayButton";
     case "button-again-1.png": return "labelAgainButton";
     case "tutorial-thentakeaphoto.png": return "labelTutorialTakeAPhoto";
     case "tutorial-putcatshere.png": return "labelTutorialPutCatsHere";
     case "tutorial-bequick.png": return "labelTutorialBeQuick";
     case "sound-icon-small.png": return "soundIcon";
     case "music-icon-small.png": return "musicIcon";
     default: return "UNKNOWN";
  }
}

String[] listFileNames(String dir) {
  File file = new File(dir);
  if (file.isDirectory()) {
    String names[] = file.list();
    return names;
  }
  return null;
}
