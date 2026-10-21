Flat explainer boards in the style of `ref-boards.css`. One folder per case study with an index.html holding `.board` elements.
Render + convert (Node 22, Chrome, Pillow):

    node tools/case-boards/boards.mjs tools/case-boards/ref-boards/<case> /tmp/<case> 2
    python3 tools/case-boards/ref-boards/to-webp.py /tmp/<case> assets/images/<dir>
