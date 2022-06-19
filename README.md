# WolfJS
A simple FPS game done in Javascript and Canvas in the style of Wolfenstein 3D

This is a simple raycaster 3D engine/game inspired by:
- Fabien Sanglard (https://twitter.com/fabynou) amazing books:
http://fabiensanglard.net/gebb/index.html

- Matt Godbolt "Wolfenstein 3D's map renderer" video
https://www.youtube.com/watch?v=eOCQfxRQ2pY

- GameHut (Jon Burton) "CODING SECRETS: How Toy Story's "Next-Gen" 3D Depth Effect Was Created" video
https://www.youtube.com/watch?v=nXKs1ZSgMic

- Wolfenstein 3D by id Software

Thank you all for the inspiration !

A level editor is provided: Eddie, and all graphical assets are png files that can be easily modified.

------------------------------------------------------------------
# How to run the game ?
- Copy the directory on your webserver and access the index page
- If you don't have a webserver you can use python integrated webserver:
  - install python
  - extract the directory on you hard drive
  - launch "cmd" or "powershell"
  - go to where you extract the files (c:\blablable\WolfJS\ for instance)
  - in the console type "python -m http.server"
  - start your browser and go to http://localhost:8000/, the game should start

------------------------------------------------------------------
# How to play ?
- controls are:
  - arrows to move
  - ctrl to shoot
  - space for action (open doors, activate the end of the level and push triggers)
  - "<>" for strafing
  - the game start each level by setting the Pause On, press "p" to remove it to start playing.
  - 1: pistol
  - 2: super shotgun

- shortcuts
  - p: toggle pause (activated by default at each level start)
  - i: go to next level
  - u: go to previous level
  - y: reduce details
  - t: raise details 

- Misc:
  - There are blue, red and yellow keys to collect in some level (ok only one, but you can create your own level !)
  - Some ammo (clips for pistol and shells for ssg) are disposed on the level for you to grab.
  - Drink some D-Cider to get you life up ! (Kudos to CTM)
  - You cannot die, death is not implemented...  
  - If you want to change the controls edit them in the /script/scripts.js file (shouldn't be to hard to find)
  - To finish the level you must find the exit door and open it (note: doesn't work on the last level)

------------------------------------------------------------------
# How to create a level ?
  - go to the page Eddie.html
  - you may want to unzoom the page to see everything
  - The simplest thing to do to understand how it works would be to load an existing level:
    - go to the data/levels directory
    - copy/paste the content of the level file (for instance lvl_2.json) into the textarea at the bottom of the page
    - click on "import level from textarea"
    - the level data should display in the grid
- Once the level is modified
  - press the Export level button
  - copy paste the textarea content and overwrite one of the lbl_x.json file with it
  - launch the game and test your level !
  
------------------------------------------------------------------
# Additional notes:
- Only tested with Chromium and Edge, firefox users may experience difficuties with the controls.
- Use jquery somewhere (https://jquery.org/license/)
- Audio rely on the WebaudioAPI and the buffer audio loader class is the work of 
Boris Smus (https://www.html5rocks.com/en/profiles/#smus, https://www.html5rocks.com/en/tutorials/webaudio/intro/js/buffer-loader.js)
- All sounds/musics are theoritically in the public domain.
- Totally buggy and unfinished
- Fill free to fork and enhanced it :-)
