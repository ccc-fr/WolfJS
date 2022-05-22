/*Main script for WolfJS*/

sin = [];
cos = []; //inutile car cos(x) = sinx(x+PI/2)
tan = [];
// Configuration des touches
//var toucheGauche=81;
//var toucheDroite=68;
//var toucheBas=83;
//var toucheRotHoraire=90;
//var toucheRotHoraireAlt=65;
//var toucheRotAntiHoraire=69;
const toucheLeft=37;
const toucheRight=39;
const toucheDown=40;
const toucheUp=38;
const strafe=18;
const strafe_2=226;
const p_key = 80;
const ctrl_key = 17;
const space_bar_key = 32;
const u_key = 85;
const i_key = 73;
const t_key = 84;
const y_key = 89;
const one_key = 49;
const two_key = 50;
const three_key = 51;
//var toucheRotHoraireAltP2=34;
//var toucheRotAntiHoraireP2=35;
var down_pressed = 0;
var up_pressed = 0;
var left_pressed = 0;
var right_pressed = 0;
var altgr_pressed = 0;
var space_bar_pressed = false;

// Unité de mouvement Haut/bas, le _sa est la version ajustée pour suivre la vitesse de rafraichissement du jeu.
// car requestAnimationFrame tourne à la vitesse de refresh du display (60Hz, 120Hz, 144Hz etc)
// donc si on ajuste pas on va allez trop vite ou trop lentement.
// les constantes indiquent la vitesse pour 60Hz, pour ajuster on fait simplement constanteUnity * (60/FPS) 
const move_UpDown_unity = 0.121;
var move_UpDown_unity_sa;
// Unité de mouvement gauche/droite
const move_LeftRight_unity = 0.045;
var move_LeftRight_unity_sa;
// Unité de mouvement Haut/bas des enemis
const move_UpDown_unity_enemy = 0.033;
var move_UpDown_unity_enemy_sa;
var fps = 60;
//distance max de l'ennemi par rapport à un mur
//le but est d'éviter que visuellement il donne l'impression
//de les traverser
const max_enemy_wall_distance = 0.25;
//vitesse de passage d'une animation à une autre en ms
var animation_speed = 150;
//temps avant que l'ennemi ne tire
var time_fire_trigger = 2000;
const checkboard_size = 64;
// distance minimale de détection des ennemis
const enemy_sight_distance = 20;
const enemy_sight_angle = Math.PI;
//la vie du joueur
var life = 100;
var player_fire = false;
var time_last_pistol_shot = Date.now();
var time_before_pistol_animation_end = 0;
var time_weapon_animation_step_start = 0;
var time_before_weapon_animation_step_end = 0;
/*audio*/
var contextAudio;
var audioBufferLoader;
const playlist = [
      'data/sounds/barreta_m9.wav',
      'data/sounds/Skorpion.wav',
      'data/sounds/headblow.wav',
      'data/sounds/grunt.wav',
      'data/sounds/grunt_enemy.wav',
      'data/sounds/you.wav',
      'data/sounds/Sound Off.mp3', //background music
      'data/sounds/shotgun.wav',
      'data/sounds/empty_gun.wav',
      'data/sounds/drink.wav',
      'data/sounds/clip.wav',
      'data/sounds/cartridge.wav',
      'data/sounds/open_door.wav',
      'data/sounds/switch.wav',
      'data/sounds/pling.wav'
    ];
const lvl_list = [
  "data/levels/lvl_1.json",
  "data/levels/lvl_2.json",
  "data/levels/lvl_3.json",
  "data/levels/lvl_4.json",
  "data/levels/lvl_5.json",
  "data/levels/lvl_6.json",
  "data/levels/lvl_7.json",
  "data/levels/lvl_8.json",
  "data/levels/lvl_9.json",
];
var lvl_index = 0;
var textures_list = [];
var enemy_tex_list = [];
var weapons_tex_list = [];
var object_tex_list = [];
var object_data_by_id = [];
var weapon_image;
var current_weapon = 1;
var previous_weapon = 0;
var weapon_animation_step = -1;
var ammo = [];
var available_weapons = [false,true,false]; //tant que l'arme n'est pas ramassée on ne peux pas la sélectionner
var available_keys = [false,false,false];//blue,yellow,red
/*Variantes de PI*/
const PI_0_5 = Math.PI / 2;
const PI_1_5 = Math.PI * 1.5;
const PI_2 = Math.PI * 2;
//resolution de l'affichage
var resolution_step = 2;
//debug_mode
const debug_mode = false;

//On attend que le DOM soit chargé avant de tout lancer
document.addEventListener('DOMContentLoaded',  domLoaded, false);

function domLoaded()
{
  //Ces deux là en variable globale car ils vont être utilisés partout
  canvas = document.getElementById("myCanvas");
  ctx = canvas.getContext("2d");
  //idem pout celui-là
  barredevie = document.getElementById("barredevie");
  ctx_bdv = barredevie.getContext("2d");
  //timer pour indiquer les frames
  time_of_last_image = Date.now();
  /*
  //on commence sans la pause, la pause c'est bien pour le debug
  pause = true;
  //position du joueur et rotation de l'angle de vue
  posx = 0;
  posy = 0;
  on_ending_point = false;
  rotation = 0; // en radian, JS fait tout en radian.
  //constante de calcul pour la hauteur des murs. 
  constanteH = 0;
  //pov en radians
  pov = 0;
  //incrément d'un rayon à un autre en fonction largeur canvas et pov
  inc_ray = 0;
  //l'object qui va contenir les infos de notre niveau
  lvl = {};
  //les infos sur les textures
  textures_data = {};
  //les infos sur les enemis
  enemies_data = {};
  //case visibles par le joueur, pour l'affichage des ennemis.
  visible_cells = [];
  //pour chaque colonne dessinnée on conserve la hauteur
  columns_height = [];
  //0 = quadrant A, 1 = quadrant B etc. A = 0 à PI/2, B = PI2=/2 à PI etc 
  quadrant_rotation = 0;
*/
  //generate sin/tan tables
  build_sohcahtoa();
  
  // init and load sounds, peut-être pas le meilleur endroit
  var contextClass = (window.AudioContext ||   window.webkitAudioContext ||   window.mozAudioContext ||   window.oAudioContext ||   window.msAudioContext);
  if (contextClass) 
  {
    // Web Audio API is available.
    contextAudio = new contextClass();
  } 
  else 
  {
    // Web Audio API is not available. Ask the user to use a supported browser.
    alert("No Web api support !");
  }
  
  audioBufferLoader = new BufferLoader(
    contextAudio,
    playlist,
    audioFinishedLoading
    );

  audioBufferLoader.load();
  

 /* window.addEventListener("keydown", keyDown,false);
  window.addEventListener("keyup", keyUp,false);
  
  //charge les données et textures des ennemis
  load_enemies('data/sprites/enemies_list.json');

  //On charge le niveau du document Json
  //loadLevel("http://localhost:8000/data/levels/lvl_1.json");
  //On attend que l'audio soit prêt:

  loadLevel("data/levels/lvl_7.json");*/
}

function step(timestamp)
{
  
  //On tourne automatiquement
//  rotation = (rotation + 0.111);
//  if (rotation > Math.PI*2)
//    rotation = rotation%(2*Math.PI);
//  if (rotation < 0)
//    rotation = rotation+ 2*Math.PI;
//  console.log("Nouvelle rotation:"+rotation);

  //ajustement de la vitesses du  jeu en fonction des FPS
  ajustGameSpeed();
  
 //On regarde quelle touche est appuyée
  checkButtonPress();

   // L'IA et tout les trucs qui bougent/interagissent
  doLogic();
  
  //dessinons le sol et plafond !
  drawFloorCeil();

  //On se lance, dessinons les murs !
  drawWalls();
  
  //Trop cool maintenant on dessine les enemis !
  drawObjects();
  
  //Trop cool maintenant on dessine les enemis !
  drawEnemies();
  
  //draw Weapons
  drawWeapons();
  
  //On affiche les FPS
  printFPS();
  
  //affiche ce qui n'est pas de l'ordre du debug comme printFPS, dont le message de fin de lvl
  printMsg();
  
  //on demande la frame suivante
  if (!pause)
    window.requestAnimationFrame(step);
  
}

function printFPS()
{
  //var maintenant = Date.now();
  ctx.font = "20px Arial";
  ctx.fillStyle ="white"; 
  ctx.fillText(fps, 10, 20);
  if (debug_mode)
    ctx.fillText("rot:"+(Math.round((rotation/3.14)*180)), 10, 40);
  ctx_bdv.fillStyle="white";
  ctx_bdv.fillRect(0,0,barredevie.width,barredevie.height);
  ctx_bdv.font = "20px Arial";
  ctx_bdv.fillStyle ="black"; 
  ctx_bdv.fillText("life:"+life, 10, 20);
  ctx_bdv.fillText("ammo:"+ammo[current_weapon-1], 10, 35);
  for (var i = 0; i < available_keys.length; i++)
  { 
    if (available_keys[i])
      ctx_bdv.drawImage(object_tex_list[objects_data.objects[i].id],0,40,64,24,10+i*20,50,40,20);
  }
  //time_of_last_image = maintenant;
}

function loadLevel(lvl_path)
{    
  console.log("chargement niveau");
  $.getJSON(lvl_path, function (lvl_data)
  {
    console.log("toto");
    //debugger;
    
    //réinit qui vient de domLoaded à la base

    time_of_last_image = Date.now();
    //on commence sans la pause, la pause c'est bien pour le debug
    pause = true;
    //position du joueur et rotation de l'angle de vue
    posx = 0;
    posy = 0;
    on_ending_point = false;
    on_blue_point = false;
    on_yellow_point = false;
    on_red_point = false;
    rotation = 0; // en radian, JS fait tout en radian.
    //constante de calcul pour la hauteur des murs. 
    constanteH = 0;
    //pov en radians
    pov = 0;
    //incrément d'un rayon à un autre en fonction largeur canvas et pov
    inc_ray = 0;
    //l'object qui va contenir les infos de notre niveau
    lvl = {};
    //les infos sur les textures
    textures_data = {};
    //les infos sur les enemis
    //enemies_data = {};
    //les infos sur les objets (santé, munitions, clés)
    //objects_data = {};
    //case visibles par le joueur, pour l'affichage des ennemis.
    visible_cells = [];
    //pour chaque colonne dessinnée on conserve la hauteur
    columns_height = [];
    //0 = quadrant A, 1 = quadrant B etc. A = 0 à PI/2, B = PI2=/2 à PI etc 
    quadrant_rotation = 0;
    //fin
    
    //on ne garde pas les clés du level précédent:
    available_keys = [false,false,false];
    
    lvl = lvl_data; 
    // temporaire !!!! ajout des points de vue pour chaque ennemi
    if (typeof lvl.enemies != "undefined")
    {
      for (var i = 0; i< lvl.enemies.length; i++)
      {
        lvl.enemies[i].life = 100;
      }
    }
    
    //  Le chargement su fichier local/serveur marche pas, on laisse tomber pour l'instant
   //  lvl = JSON.parse(lvl_data);
    //on ajoute 0.5 pour se mettre au milieu de la case
    posx = lvl.start[0]+0.2;
    posy = lvl.start[1]+0.8;
    rotation = lvl.rotation;
    walls = [];
    //on inverse les X et les Y pour être dans le bon sens
    if (lvl.invert)
    {
      for (i = 0; i < lvl.walls.length; i++)
      {
        walls[i] = [];
        for (j = 0; j < lvl.walls[0].length; j++)
        {
          walls[i][j] = lvl.walls[j][i];
        }
      }
    }
    else
      walls = lvl.walls;
    //On charge les textures
    console.log("chargement des textures");
    $.getJSON("data/textures/textures_list.json", function (data_tex)
    { 
      console.log("textures chargées");
      textures_data = data_tex;
      build_textures_list(textures_data, textures_list);
      //tout est chargé on lance le rendu
      step();
    }).fail( function(error) 
    {
      debugger;
      console.log("error texture:"+error);
    });   
  }).fail( function(error) 
    {
      debugger;
      console.log("error level:"+error);
    });
}

function keyDown(evt)
{
  //debugger;
  evt.preventDefault;
  switch (event.keyCode) 
  {
    case toucheDown:
      down_pressed += 1;
      break;
    case toucheLeft:
      left_pressed += 1;
      break;
    case toucheRight:
      right_pressed += 1;
      break;
    case toucheUp:
      up_pressed += 1;
      break;
    case strafe:
    case strafe_2:
      altgr_pressed += 1;
      break;
    case p_key:
      pause_game();
      break;
    case ctrl_key:
      handle_fire();
      break;
    case space_bar_key:
      space_bar_pressed = true;
      break;
    case u_key:
      (lvl_index - 1 >= 0) ? lvl_index-- : 0;
      loadLevel(lvl_list[lvl_index]);
      break;
    case i_key:
      (lvl_index + 1 < lvl_list.length) ? lvl_index++ : lvl_index;
      loadLevel(lvl_list[lvl_index]);
      break;
    case t_key:
      if (resolution_step > 1)
        resolution_step--;
      break;
    case y_key:
      resolution_step++;
      break;
    case one_key:
      current_weapon = 1;
      break;
    case two_key:
      if (available_weapons[2])
        current_weapon = 2;
      break;
  }
}

function keyUp(evt)
{
  //debugger;
  evt.preventDefault;
  switch (event.keyCode) 
  {
    case toucheDown:
      down_pressed = 0;
      break;
    case toucheLeft:
      left_pressed = 0;
      break;
    case toucheRight:
      right_pressed = 0;
      break;
    case toucheUp:
      up_pressed = 0;
      break;
    case strafe:
    case strafe_2:
      altgr_pressed = 0;
      break;
    case space_bar_key:
      space_bar_pressed = false;
      break;
  }
}


function checkButtonPress()
{
  //console.log("vérification boutons");
  //haut + bas et gauche + droite pas autorisé
  //on avance de 0.111 unité, parce que.
  if (up_pressed && ! down_pressed)
  {
    //Haut et bas c'est un poil plus compliqué
    //il faut bouger posx et posy par rapport à rotation
    //Et ne pas se cogner dans les murs !
    // L'hypothénuse fait donc 0.111, move_UpDown_unity
    if (rotation >=0 && rotation < PI_0_5)
    {
      var new_posx = posx + get_cos(rotation) * move_UpDown_unity_sa;
      var new_posy = posy - get_sin(rotation) * move_UpDown_unity_sa;
      //Detection collision, pour l'instant on ne bouge pas si on cogne
      if (walls[Math.floor(new_posx)][Math.floor(new_posy)] == 0)
      {       
        posx = new_posx;
        posy = new_posy;
      } 
    }
    else if (rotation >= PI_0_5 && rotation < Math.PI)
    {
      var tmp_rotation = Math.PI - rotation; 
      var new_posx = posx - get_cos(tmp_rotation) * move_UpDown_unity_sa;
      var new_posy = posy - get_sin(tmp_rotation) * move_UpDown_unity_sa;
      //Detection collision, pour l'instant on ne bouge pas si on cogne
      if (walls[Math.floor(new_posx)][Math.floor(new_posy)] == 0)
      {       
        posx = new_posx;
        posy = new_posy;
      }     
    }
    else if (rotation >= Math.PI && rotation < PI_1_5)
    {
      var tmp_rotation = rotation - Math.PI; 
      var new_posx = posx - get_cos(tmp_rotation) * move_UpDown_unity_sa;
      var new_posy = posy + get_sin(tmp_rotation) * move_UpDown_unity_sa;
      //Detection collision, pour l'instant on ne bouge pas si on cogne
      if (walls[Math.floor(new_posx)][Math.floor(new_posy)] == 0)
      {       
        posx = new_posx;
        posy = new_posy;
      }     
    }
    else
    {
      var tmp_rotation =  PI_2 - rotation; 
      var new_posx = posx + get_cos(tmp_rotation) * move_UpDown_unity_sa;
      var new_posy = posy + get_sin(tmp_rotation) * move_UpDown_unity_sa;
      //Detection collision, pour l'instant on ne bouge pas si on cogne
      if (walls[Math.floor(new_posx)][Math.floor(new_posy)] == 0)
      {       
        posx = new_posx;
        posy = new_posy;
      }  
    }
  }
  //Touche bas pressée
  if (down_pressed && !up_pressed)
  {
    //Idem que lorsqu'on fait up, mais on se dirige dans le sens opposé
    if (rotation >=0 && rotation < Math.PI/2)
    {
      //equivalent à aller en bas à gauche
      var tmp_rotation = rotation;
      var new_posx = posx - get_cos(tmp_rotation) * move_UpDown_unity_sa;
      var new_posy = posy + get_sin(tmp_rotation) * move_UpDown_unity_sa;
      //Detection collision, pour l'instant on ne bouge pas si on cogne
      if (walls[Math.floor(new_posx)][Math.floor(new_posy)] == 0)
      {       
        posx = new_posx;
        posy = new_posy;
      } 
    }
    else if (rotation >= PI_0_5 && rotation < Math.PI)
    {
      //equivalent à aller en bas à droite
      var tmp_rotation = PI_2-(Math.PI + rotation); 
      var new_posx = posx + get_cos(tmp_rotation) * move_UpDown_unity_sa;
      var new_posy = posy + get_sin(tmp_rotation) * move_UpDown_unity_sa;
      //Detection collision, pour l'instant on ne bouge pas si on cogne
      if (walls[Math.floor(new_posx)][Math.floor(new_posy)] == 0)
      {       
        posx = new_posx;
        posy = new_posy;
      }     
    }
    else if (rotation >= Math.PI && rotation < PI_1_5)
    {
      //equivalent à aller en haut à droite
      var tmp_rotation =  rotation - Math.PI; 
      var new_posx = posx + get_cos(tmp_rotation) * move_UpDown_unity_sa;
      var new_posy = posy - get_sin(tmp_rotation) * move_UpDown_unity_sa;
      //Detection collision, pour l'instant on ne bouge pas si on cogne
      if (walls[Math.floor(new_posx)][Math.floor(new_posy)] == 0)
      {       
        posx = new_posx;
        posy = new_posy;
      }     
    }
    else
    {
      //equivalent à aller en haut à gauche
      var tmp_rotation =  Math.PI-(rotation - Math.PI); 
      var new_posx = posx - get_cos(tmp_rotation) * move_UpDown_unity_sa;
      var new_posy = posy - get_sin(tmp_rotation) * move_UpDown_unity_sa;
      //Detection collision, pour l'instant on ne bouge pas si on cogne
      if (walls[Math.floor(new_posx)][Math.floor(new_posy)] == 0)
      {       
        posx = new_posx;
        posy = new_posy;
      }  
    }
  }
  //les rotations c'est simple on modifie directement l'angle rotation
  if (left_pressed && !right_pressed && !altgr_pressed)
  {
    //On tourne automatiquement
    rotation = (rotation + move_LeftRight_unity_sa);
    if (rotation > PI_2)
      rotation = rotation%(PI_2);
    if (rotation < 0)
      rotation = rotation+ PI_2;
    //console.log("Nouvelle rotation:"+rotation);
  }
  if (right_pressed && !left_pressed && !altgr_pressed)
  {
    rotation = (rotation - move_LeftRight_unity_sa);
    if (rotation > PI_2)
      rotation = rotation%(PI_2);
    if (rotation < 0)
      rotation = rotation+ PI_2;
   // console.log("Nouvelle rotation:"+rotation);
  }
  if (left_pressed && !right_pressed && altgr_pressed)
  {
    //On va à gauche !
    //Et ne pas se cogner dans les murs !
    // L'hypothénuse fait donc 0.111, move_UpDown_unity
    if (rotation >=0 && rotation < PI_0_5)
    {
      //aller en haut à gauche
      var tmp_rotation = Math.PI - (rotation + PI_0_5);
      var new_posx = posx - get_cos(tmp_rotation) * move_UpDown_unity_sa;
      var new_posy = posy - get_sin(tmp_rotation) * move_UpDown_unity_sa;
      //Detection collision, pour l'instant on ne bouge pas si on cogne
      if (walls[Math.floor(new_posx)][Math.floor(new_posy)] == 0)
      {       
        posx = new_posx;
        posy = new_posy;
      }   
    }
    else if (rotation >= PI_0_5 && rotation < Math.PI)
    {     
      //aller en bas à gauche
      var tmp_rotation =  (rotation - PI_0_5); 
      var new_posx = posx - get_cos(tmp_rotation) * move_UpDown_unity_sa;
      var new_posy = posy + get_sin(tmp_rotation) * move_UpDown_unity_sa;
      //Detection collision, pour l'instant on ne bouge pas si on cogne
      if (walls[Math.floor(new_posx)][Math.floor(new_posy)] == 0)
      {       
        posx = new_posx;
        posy = new_posy;
      }   
    }
    else if (rotation >= Math.PI && rotation < PI_1_5)
    { 
      //aller en bas à droite
      var tmp_rotation =  PI_1_5 - (rotation);
      var new_posx = posx + get_cos(tmp_rotation) * move_UpDown_unity_sa;
      var new_posy = posy + get_sin(tmp_rotation) * move_UpDown_unity_sa;
      //Detection collision, pour l'instant on ne bouge pas si on cogne
      if (walls[Math.floor(new_posx)][Math.floor(new_posy)] == 0)
      {       
        posx = new_posx;
        posy = new_posy;
      }  
    }
    else
    {
      //aller en haut à gauche
      var tmp_rotation =  rotation - PI_1_5 ;  
      var new_posx = posx + get_cos(tmp_rotation) * move_UpDown_unity_sa;
      var new_posy = posy - get_sin(tmp_rotation) * move_UpDown_unity_sa;
      //Detection collision, pour l'instant on ne bouge pas si on cogne
      if (walls[Math.floor(new_posx)][Math.floor(new_posy)] == 0)
      {       
        posx = new_posx;
        posy = new_posy;
      } 
    }
  }
  if (right_pressed && !left_pressed && altgr_pressed)
  {
    //Haut et bas c'est un poil plus compliqué
    //il faut bouger posx et posy par rapport à rotation
    //Et ne pas se cogner dans les murs !
    // L'hypothénuse fait donc 0.111, move_UpDown_unity
    if (rotation >=0 && rotation < PI_0_5)
    {
      var tmp_rotation = PI_0_5 - (rotation);
      var new_posx = posx + get_cos(tmp_rotation) * move_UpDown_unity_sa;
      var new_posy = posy + get_sin(tmp_rotation) * move_UpDown_unity_sa;
      //Detection collision, pour l'instant on ne bouge pas si on cogne
      if (walls[Math.floor(new_posx)][Math.floor(new_posy)] == 0)
      {       
        posx = new_posx;
        posy = new_posy;
      }  
    }
    else if (rotation >= PI_0_5 && rotation < Math.PI)
    {
      var tmp_rotation = (rotation - PI_0_5); 
      var new_posx = posx + get_cos(tmp_rotation) * move_UpDown_unity_sa;
      var new_posy = posy - get_sin(tmp_rotation) * move_UpDown_unity_sa;
      //Detection collision, pour l'instant on ne bouge pas si on cogne
      if (walls[Math.floor(new_posx)][Math.floor(new_posy)] == 0)
      {       
        posx = new_posx;
        posy = new_posy;
      }   
    }
    else if (rotation >= Math.PI && rotation < PI_1_5)
    {
      var tmp_rotation = PI_1_5 - rotation; 
      var new_posx = posx - get_cos(tmp_rotation) * move_UpDown_unity_sa;
      var new_posy = posy - get_sin(tmp_rotation) * move_UpDown_unity_sa;
      //Detection collision, pour l'instant on ne bouge pas si on cogne
      if (walls[Math.floor(new_posx)][Math.floor(new_posy)] == 0)
      {       
        posx = new_posx;
        posy = new_posy;
      }   
    }
    else
    {
      var tmp_rotation =  rotation - PI_1_5; 
      var new_posx = posx - get_cos(tmp_rotation) * move_UpDown_unity_sa;
      var new_posy = posy + get_sin(tmp_rotation) * move_UpDown_unity_sa;
      //Detection collision, pour l'instant on ne bouge pas si on cogne
      if (walls[Math.floor(new_posx)][Math.floor(new_posy)] == 0)
      {       
        posx = new_posx;
        posy = new_posy;
      }    
    }
  }
}

function drawFloorCeil()
{
  // Create gradient
  //sol
  var grd_ground=ctx.createLinearGradient(0,0,0,canvas.height/2);
  grd_ground.addColorStop(0,"red");
  grd_ground.addColorStop(1,"black");
  
  //plafond
  var grd_ceil=ctx.createLinearGradient(0,canvas.height/2,0,canvas.height);
  grd_ceil.addColorStop(0,"black");
  grd_ceil.addColorStop(1,"grey");

  // Fill with gradient
  ctx.fillStyle=grd_ground;
  ctx.fillRect(0,0,canvas.width,canvas.height/2);
  ctx.fillStyle=grd_ceil;
  ctx.fillRect(0,canvas.height/2,canvas.width,canvas.height);
}

function drawWalls()
{
  //console.log("dessin mur");
  //il faut convertir les degrés en radian
  pov = lvl.pov * (Math.PI / 180);
  //rotation est l'angle de départ, on suppose qu'un angle 0 = abscisse
  inc_ray = pov / canvas.width;
  //on trace de gauche à droite, donc -pov/2 comme angle de départ
  //debugger;
  //indication du quadrant dans lequel se trouve l'axe de vision et le rayon
  quadrant_rotation = -1;
  var quadrant_theta = -1;
  //on réinitialise la liste des cellules visibles:
  visible_cells = [];
  //et idem pour la taille des colonnes
  columns_height = [];
  
  //Constante pour le calcul de la hauteur des murs
  constanteH = (lvl.constanteHWall * canvas.height)/2;
  for (i=0; i < canvas.width; i = i + resolution_step)
  {
    //console.log(i);
    //l'angle est rotation -pov/2 +i*inc_ray
//    var theta = (rotation + (pov/2) - (i*inc_ray))%Math.PI;
    //Si rotation est négatif on le remet dans le "bon" sens
    if (rotation <0)
      rotation = PI_2 + rotation;
    //calcul angle beta pour la distance p
    if ( (rotation >=0 && rotation < (PI_0_5)))
    {
      var beta = Math.abs(rotation);
      quadrant_rotation = 0;
    } 
    else if ( rotation >= (PI_0_5) && rotation < (Math.PI))
    {
      var beta = Math.PI - Math.abs(rotation);
      quadrant_rotation = 1;
    }
    else if (rotation >= (Math.PI) && rotation < (PI_1_5))
    {
      var beta = Math.abs(rotation) - Math.PI;
      quadrant_rotation = 2;
    }  
    else
    {
      var beta = PI_2 - Math.abs(rotation);
      quadrant_rotation = 3;
    }
      
    var theta = (rotation + (pov/2) - (i*inc_ray));
    //Si la theta negatif le rajoute 2PI pour l'avoir en positif histoire de tourner dans le même sens
    if (theta < 0)
      theta += PI_2;
    //Si theta > 2PI alors on est pas content
    if (theta >= PI_2)
      theta = theta%(PI_2);
    
    if ( (theta >=0 && theta < (PI_0_5)))
    {
      quadrant_theta = 0;
    } 
    else if ( theta >= (PI_0_5) && theta < (Math.PI))
    {
      quadrant_theta = 1;
    }
    else if (theta >= (Math.PI) && theta < (PI_1_5))
    {
      quadrant_theta = 2;
    }  
    else
    {
      quadrant_theta = 3;
    }
    
    //correction de beta  si le rayon n'est pas dans le même quadrant que l'axe de rotation.
//      if (quadrant_rotation != quadrant_theta)
//        beta -= quadrant_theta * (Math.PI/2);

    
    //y = ax+b où a = tan-1(theta)
//    var a = Math.atan(theta);
//    var b = posy-(a*posx);
    // coordonnées de l'intersection
    //position de la cellule où est le joueur
    var hitVert = false;
    var hitHoriz = false;
    var px = 0;
    var py = 0;
    //décalage du joueur dans la cellule
    var dx = 0;
    var dy = 0;
    // incrément de case
    var inc_x = 0;
    var inc_y = 0;
    var HIntercept = {};
    var VIntercept = {};
    var yStep = 0;
    var xStep = 0;
    //textures
    var value_texture = 0;
    var prev_value_texture = 0;
    var array_texture = [];
    var id_texture = "";
    var texture = {};
    //en fonction de l'inclinaison de l'angle on -/+ x et y
    //      if (theta >= 0 && theta < Math.PI)
    //        inc_y = -1;
    //      if ( (theta >= 0 && theta < (Math.PI/2)) || (theta >= (1.5*Math.PI) && theta < 2*Math.PI ))
    //        inc_x = 1;
    //    debugger;
    //Quadrant A : entre 0 et 0.5PI
    if ( theta >= 0 && theta < (PI_0_5) )
    {
      px = Math.floor(posx);
      py = Math.floor(posy);
      //décalage du joueur dans la cellule
      dx = 1-(posx - px);
      dy = (posy - py);
      // incrément de case
      inc_x = 1;
      inc_y = -1;
      
      //On  prend HIntercept[x,y] la position du point qui intercepte la prochaine horizontale
      //Attention doit dépendre du cadran dans lequel on est !
      HIntercept = {x: posx+(dy/get_tan(theta)), y: py};
      //Et réciproquement VIntercept[x,y] la position du point qui intercepte la prochaine verticale
      VIntercept = {x : px+1, y:posy + (dx*get_tan(theta)*inc_y) };
      
      yStep = get_tan(theta) * inc_y;
      xStep = get_tan(PI_0_5 - theta) * inc_x;
      var has_progressed = true;
      try {
        while( !hitVert && !hitHoriz && has_progressed)
        {
          has_progressed = false;
          while ( !hitVert && !hitHoriz && ( HIntercept.x < VIntercept.x) && HIntercept.x < checkboard_size && HIntercept.y >= 1)
          {
            if (walls[Math.floor(HIntercept.x)][HIntercept.y-1] > 0)
            {
              hitHoriz = true;
              break;
            }
            //pas de break, donc la case est visible ! on l'ajoute à la liste
            add_visible_cells(Math.floor(HIntercept.x), [HIntercept.y-1] );
            //on progresse sur la prochaine interception possible
            HIntercept.x += xStep;
            HIntercept.y += inc_y;
            has_progressed = true;
          }
          while ( !hitVert && !hitHoriz && (VIntercept.x < HIntercept.x ) && VIntercept.x < checkboard_size && VIntercept.y >= 0)
          {
            if (walls[VIntercept.x][Math.floor(VIntercept.y)] > 0)
            {
              hitVert = true;
              break;
            }
            //pas de break, donc la case est visible ! on l'ajoute à la liste
            add_visible_cells(VIntercept.x, Math.floor(VIntercept.y) );
            //on progresse sur la prochaine interception possible
            VIntercept.x += inc_x;
            VIntercept.y += yStep;
            has_progressed = true;
          }

          //ce cas peut se produire ! On ne dessine rien pour l'instant.
          if(VIntercept.x == HIntercept.x)
            break;
          
          //En dehors des clous ? On sort aussi
//          if (VIntercept.x > 64 ||  HIntercept.x > 64 || VIntercept.x < 0 ||  HIntercept.x < 0 || VIntercept.y > 64 ||  HIntercept.y > 64 || VIntercept.y < 0 ||  HIntercept.y < 0)
//          {
//            console.log("boucle hors limite quadrant A");
//            break;
//          }
          
        }
      }
      catch (error)
      {
        console.log("erreur quadrant A");
        debugger;
      }
   
      //il faut diviser une constante par  rapport à la distance pour avoir la distance à afficher.
      var heightWall = 0;
      var p = 0;
      if (hitVert)
      {  
        //calcul deltaX et deltaY
        //console.log("hit Vertical quadrant A:["+(Math.floor([VIntercept.x]))+","+(Math.floor(VIntercept.y))+"]");
        var deltaX =  Math.abs(VIntercept.x - posx);
        var deltaY =  Math.abs(posy-VIntercept.y); 
        
        p = deltaX * get_cos(beta) + deltaY * get_sin(beta);
        //p = Math.sqrt(deltaX*deltaX + deltaY+deltaY);
        //console.log("p : "+p);
        heightWall = (constanteH / p);

        //Si on touche vertical dans le quadrant A alors on a la texture gauche
        value_texture = (walls[VIntercept.x][Math.floor(VIntercept.y)] & 4278190080) >> 24;
        //si c'est la même texture pas la peine de la charger à nouveau...
        if (prev_value_texture != value_texture)
        {
          /*array_texture = $(textures_data.textures).filter(function (i,n){return n.value===value_texture});
          if (array_texture.length > 0)
            id_texture = array_texture[0].id;
          else
            id_texture = 0;
          texture = document.getElementById(id_texture);*/
          texture =  textures_list[value_texture];
          prev_value_texture = value_texture;
        }
        if (texture != null)
          drawColumn(texture, VIntercept.y,i,(canvas.height/2) - (heightWall/2), heightWall);
        else
        {
          ctx.fillStyle="purple";
          ctx.fillRect(i,(canvas.height/2) - (heightWall/2),1, heightWall);
        }
        columns_height[i] = heightWall;
        for (var toto = 1; toto < resolution_step; toto++)
        {
          columns_height[i+toto] = heightWall;
        }
      }

      if (hitHoriz)
      {   
        //calcul deltaX et deltaY
        //console.log("hit Horizon quadrant A:["+(Math.floor([HIntercept.x]))+","+(HIntercept.y-1)+"]");
        var deltaX =  Math.abs(HIntercept.x - posx);
        var deltaY =  Math.abs(posy-HIntercept.y);  
        
        p = deltaX * get_cos(beta) + deltaY * get_sin(beta);
        //p = Math.sqrt(deltaX*deltaX + deltaY+deltaY);
       // console.log("p : "+p);
        heightWall = (constanteH / p);

        //Si on touche horizontal dans quadrant A alors c'est bas:
        value_texture = (walls[Math.floor(HIntercept.x)][HIntercept.y-1] & 16711680) >> 16;
        if (prev_value_texture != value_texture)
        {
          /*array_texture = $(textures_data.textures).filter(function (i,n){return n.value===value_texture});
          if (array_texture.length > 0)
            id_texture = array_texture[0].id;
          else
            id_texture = 0;
          texture = document.getElementById(id_texture);*/
          texture = textures_list[value_texture];
          prev_value_texture = value_texture;
        }
        if (texture != null)
          drawColumn(texture, HIntercept.x,i,(canvas.height/2) - (heightWall/2), heightWall);
        else
        {
          ctx.fillStyle="purple";
          ctx.fillRect(i,(canvas.height/2) - (heightWall/2),1, heightWall);
        } 
        columns_height[i] = heightWall;
        for (var toto = 1; toto < resolution_step; toto++)
        {
          columns_height[i+toto] = heightWall;
        }
      }
  //    ctx.beginPath();
  //    ctx.moveTo(i, (canvas.height/2) - heightWall );
  //    ctx.moveTo(i, canvas.height - heightWall);
  //    ctx.stroke();
      
//        ctx.fillRect(i,(canvas.height/2) - (heightWall/2),1, heightWall);
  //    drawWalls dessine les murs, drawColumn dessine une colonne d'un mur !  
      //ajout ici d'un continue, car sur le papier pas la peine de tester les autres cas
      continue;
    }
    
    //Quadrant B : entre 0.5Pi et PI
    if ( theta >= (PI_0_5) && theta < Math.PI )
    {
      px = Math.floor(posx);
      py = Math.floor(posy);
      //décalage du joueur dans la cellule
      dx = (posx - px);
      dy = (posy - py);
      // incrément de case
      inc_x = -1;
      inc_y = -1;
      var new_theta = Math.PI - theta;
      //On  prend HIntercept[x,y] la position du point qui intercepte la prochaine horizontale
      //Attention doit dépendre du cadran dans lequel on est !
      HIntercept = {x: posx-(dy/get_tan(new_theta)), y: py};
      //Et réciproquement VIntercept[x,y] la position du point qui intercepte la prochaine verticale
      VIntercept = {x : px, y:posy + (dx*get_tan(new_theta)*inc_y) };
      
      yStep = get_tan(new_theta) * inc_y;
      xStep = get_tan(PI_0_5 - new_theta) * inc_x;
      var has_progressed = true;
      try
      {
        while( !hitVert && !hitHoriz && has_progressed)
        { 
          has_progressed = false;
          while ( !hitVert && !hitHoriz && ( HIntercept.x > VIntercept.x) && HIntercept.x >= 0 && HIntercept.y >= 1 )
          {
            if (walls[Math.floor(HIntercept.x)][HIntercept.y-1] > 0)
            {
              hitHoriz = true;
              break;
            }
            //pas de break, donc la case est visible ! on l'ajoute à la liste
            add_visible_cells(Math.floor(HIntercept.x), HIntercept.y-1 );
            //on progresse sur la prochaine interception possible
            HIntercept.x += xStep;
            HIntercept.y += inc_y;
            has_progressed = true;
          }
          while ( !hitVert && !hitHoriz && (VIntercept.x > HIntercept.x ) && VIntercept.x >= 1 && VIntercept.y >= 0)
          {
            if (walls[VIntercept.x-1][Math.floor(VIntercept.y)] > 0)
            {
              hitVert = true;
              break;
            }
            //pas de break, donc la case est visible ! on l'ajoute à la liste
            add_visible_cells(Math.floor(VIntercept.x-1), Math.floor(VIntercept.y));
            //on progresse sur la prochaine interception possible
            VIntercept.x += inc_x;
            VIntercept.y += yStep;
            has_progressed = true;
          }

          //ce cas peut se produire ! On ne dessine rien pour l'instant.
          if(VIntercept.x == HIntercept.x)
            break;
          
//          //En dehors des clous ? On sort aussi
//          if (VIntercept.x > 64 ||  HIntercept.x > 64 || VIntercept.x < 0 ||  HIntercept.x < 0 || VIntercept.y > 64 ||  HIntercept.y > 64 || VIntercept.y < 0 ||  HIntercept.y < 0)
//          {
//            console.log("boucle hors limite quadrant B");
//            break;
//          }
          
        }
      }
      catch (error)
      {
        console.log("erreur quadrant B");
        debugger;
      }
    
     
      //il faut diviser une constante par  rapport à la distance pour avoir la distance à afficher.
      var heightWall = 0;
      var p = 0;
      if (hitVert)
      {  
        //calcul deltaX et deltaY
        //console.log("hit Vertical quadrant B:["+(Math.floor([VIntercept.x-1]))+","+(Math.floor(VIntercept.y))+"]");
        var deltaX =  Math.abs(VIntercept.x - posx);
        var deltaY =  Math.abs(posy-VIntercept.y); 
        
        p = deltaX * get_cos(beta) + deltaY * get_sin(beta);
//        p = Math.sqrt(deltaX*deltaX + deltaY+deltaY);
        //console.log("p : "+p);
        heightWall = (constanteH / p);

        //Si on touche vertical dans le quadrant B alors on a la texture de droite
        value_texture = (walls[VIntercept.x-1][Math.floor(VIntercept.y)] & 65280) >> 8;
        //si c'est la même texture pas la peine de la charger à nouveau...
        if (prev_value_texture != value_texture)
        {
      /*    array_texture = $(textures_data.textures).filter(function (i,n){return n.value===value_texture});
          if (array_texture.length > 0)
            id_texture = array_texture[0].id;
          else
            id_texture = 0;
          texture = document.getElementById(id_texture);*/
          texture = textures_list[value_texture];
          prev_value_texture = value_texture;
        }
        if (texture != null)
          drawColumn(texture, VIntercept.y,i,(canvas.height/2) - (heightWall/2), heightWall);
        else
        {
          ctx.fillStyle="purple";
          ctx.fillRect(i,(canvas.height/2) - (heightWall/2),1, heightWall);
        }
        columns_height[i] = heightWall;
        for (var toto = 1; toto < resolution_step; toto++)
        {
          columns_height[i+toto] = heightWall;
        }
      }

      if (hitHoriz)
      {   
        //calcul deltaX et deltaY
        //console.log("hit Horizon quadrant B:["+(Math.floor([HIntercept.x]))+","+(HIntercept.y-1)+"]");
        var deltaX =  Math.abs(HIntercept.x - posx);
        var deltaY =  Math.abs(posy-HIntercept.y);   

        p = deltaX * get_cos(beta) + deltaY * get_sin(beta);
//        p = Math.sqrt(deltaX*deltaX + deltaY+deltaY);
       // console.log("p : "+p);
        heightWall = (constanteH / p);

        value_texture = (walls[Math.floor(HIntercept.x)][HIntercept.y-1] & 16711680) >> 16;
        if (prev_value_texture != value_texture)
        {
         /* array_texture = $(textures_data.textures).filter(function (i,n){return n.value===value_texture});
          if (array_texture.length > 0)
            id_texture = array_texture[0].id;
          else
            id_texture = 0;
          texture = document.getElementById(id_texture);*/          
          texture = textures_list[value_texture];
          prev_value_texture = value_texture;
        }
        if (texture != null)
          drawColumn(texture, HIntercept.x,i,(canvas.height/2) - (heightWall/2), heightWall);
        else
        {
          ctx.fillStyle="purple";
          ctx.fillRect(i,(canvas.height/2) - (heightWall/2),1, heightWall);
        } 
        columns_height[i] = heightWall;
        for (var toto = 1; toto < resolution_step; toto++)
        {
          columns_height[i+toto] = heightWall;
        }
      }
      //ajout ici d'un continue, car sur le papier pas la peine de tester les autres cas
      continue;
    }
    
    //Quadrant C : entre Pi et 1.5PI
    if ( theta >= Math.PI && theta < (PI_1_5)  )
    {
      px = Math.floor(posx);
      py = Math.floor(posy);
      //décalage du joueur dans la cellule
      dx = (posx - px);
      dy = 1-(posy - py);
      // incrément de case
      inc_x = -1;
      inc_y = 1;
      var new_theta = theta - Math.PI ;
      //On  prend HIntercept[x,y] la position du point qui intercepte la prochaine horizontale
      //Attention doit dépendre du cadran dans lequel on est !
      HIntercept = {x: posx-(dy/get_tan(new_theta)), y: py+1};
      //Et réciproquement VIntercept[x,y] la position du point qui intercepte la prochaine verticale
      VIntercept = {x : px, y:posy + (dx*get_tan(new_theta)*inc_y) };
      
      yStep = get_tan(new_theta) * inc_y;
      xStep = get_tan(PI_0_5 - new_theta) * inc_x;
      var has_progressed = true;
      try
      {
        while( !hitVert && !hitHoriz && has_progressed)
        {
          has_progressed = false;
          while ( !hitVert && !hitHoriz && ( HIntercept.x > VIntercept.x) && HIntercept.x >=0 && HIntercept.y < checkboard_size)
          {          
            if (walls[HIntercept.x > 0 ? Math.floor(HIntercept.x) : 0 ][HIntercept.y] > 0)
            {
              hitHoriz = true;
              break;
            }
            //pas de break, donc la case est visible ! on l'ajoute à la liste
            add_visible_cells(HIntercept.x > 0 ? Math.floor(HIntercept.x) : 0, HIntercept.y);
            //on progresse sur la prochaine interception possible
            HIntercept.x += xStep;
            HIntercept.y += inc_y;
            has_progressed = true;
          }
          while ( !hitVert && !hitHoriz && (VIntercept.x > HIntercept.x ) && VIntercept.x >= 1 && VIntercept.y < checkboard_size)
          {
              //test : if VIntercept.x <0 alors VIntercept.x = 0
              if (walls[VIntercept.x <1 ? 0 : VIntercept.x-1][Math.floor(VIntercept.y)] > 0)
              {
                hitVert = true;
                break;
              }
              //pas de break, donc la case est visible ! on l'ajoute à la liste
              add_visible_cells(VIntercept.x <1 ? 0 : VIntercept.x-1, Math.floor(VIntercept.y));
              //on progresse sur la prochaine interception possible
  //          if (walls[VIntercept.x-1][Math.floor(VIntercept.y)] > 0)
  //          {
  //            hitVert = true;
  //            break;
  //          }
            VIntercept.x += inc_x;
            VIntercept.y += yStep;
            has_progressed = true;
          }

          //ce cas peut se produire ! On ne dessine rien pour l'instant.
          if(VIntercept.x == HIntercept.x)
            break;
          
          //En dehors des clous ? On sort aussi
//          if (VIntercept.x > 64 ||  HIntercept.x > 64 || VIntercept.x < 0 ||  HIntercept.x < 0 || VIntercept.y > 64 ||  HIntercept.y > 64 || VIntercept.y < 0 ||  HIntercept.y < 0)
//          {
//            console.log("boucle hors limite quadrant C");
//            break;
//          }
          
        }
      }
      catch (error)
      {
        console.log("erreur quadrant C");
        debugger;
      }
          
      
      //il faut diviser une constante par  rapport à la distance pour avoir la distance à afficher.
      var heightWall = 0;
      var p = 0;
      if (hitVert)
      { 
        
        //calcul deltaX et deltaY
        //console.log("hit Vertical quadrant C:["+([VIntercept.x-1])+","+(Math.floor(VIntercept.y))+"]");
        var deltaX =  Math.abs(VIntercept.x - posx);
        var deltaY =  Math.abs(posy-VIntercept.y); 

        p = deltaX * get_cos(beta) + deltaY * get_sin(beta);
       // console.log("p : "+p);
        heightWall = (constanteH / p);

        //Si on touche vertical dans quadrant C alors c'est droite:
        value_texture = (walls[VIntercept.x-1][Math.floor(VIntercept.y)] & 65280) >> 8;
        if (prev_value_texture != value_texture)
        {
    /*      array_texture = $(textures_data.textures).filter(function (i,n){return n.value===value_texture});
          if (array_texture.length > 0)
            id_texture = array_texture[0].id;
          else
            id_texture = 0;
          texture = document.getElementById(id_texture);*/
          texture = textures_list[value_texture];
          prev_value_texture = value_texture;
        }
        if (texture != null)
          drawColumn(texture, VIntercept.y,i,(canvas.height/2) - (heightWall/2), heightWall);
        else
        {
          ctx.fillStyle="purple";
          ctx.fillRect(i,(canvas.height/2) - (heightWall/2),1, heightWall);
        }   
        columns_height[i] = heightWall;
        for (var toto = 1; toto < resolution_step; toto++)
        {
          columns_height[i+toto] = heightWall;
        }
      }

      if (hitHoriz)
      {   
        //calcul deltaX et deltaY
       // console.log("hit Horizon quadrant C:["+(Math.floor([HIntercept.x]))+","+(HIntercept.y)+"]");
        var deltaX =  Math.abs(HIntercept.x - posx);
        var deltaY =  Math.abs(posy-HIntercept.y);   
        //p = Math.sqrt(deltaX*deltaX + deltaY+deltaY);
        p = deltaX * get_cos(beta) + deltaY * get_sin(beta);
        //console.log("p : "+p);
        heightWall = (constanteH / p);

        //Si on touche horizontal dans quadrant C alors c'est haut:
        value_texture = (walls[Math.floor(HIntercept.x)][HIntercept.y] & 255);
        if (prev_value_texture != value_texture)
        {
/*          array_texture = $(textures_data.textures).filter(function (i,n){return n.value===value_texture});
          if (array_texture.length > 0)
            id_texture = array_texture[0].id;
          else
            id_texture = 0;
          texture = document.getElementById(id_texture);*/
          texture = textures_list[value_texture];
          prev_value_texture = value_texture;
        }
        if (texture != null)
          drawColumn(texture, HIntercept.x,i,(canvas.height/2) - (heightWall/2), heightWall);
        else
        {
          ctx.fillStyle="purple";
          ctx.fillRect(i,(canvas.height/2) - (heightWall/2),1, heightWall);
        } 
        columns_height[i] = heightWall;
        for (var toto = 1; toto < resolution_step; toto++)
        {
          columns_height[i+toto] = heightWall;
        }
      }
  //    ctx.beginPath();
  //    ctx.moveTo(i, (canvas.height/2) - heightWall );
  //    ctx.moveTo(i, canvas.height - heightWall);
  //    ctx.stroke();
//        ctx.fillRect(i,(canvas.height/2) - (heightWall/2),1, heightWall);
      //ajout ici d'un continue, car sur le papier pas la peine de tester les autres cas
      continue;
    }
    
    //Quadrant D : entre 1.5Pi et 2PI
    if ( theta >= (PI_1_5) && theta < (PI_2) )
    {
      px = Math.floor(posx);
      py = Math.floor(posy);
      //décalage du joueur dans la cellule
      dx = 1-(posx - px);
      dy = 1-(posy - py);
      // incrément de case
      inc_x = 1;
      inc_y = 1;
      var new_theta = PI_2 - theta ;
      //On  prend HIntercept[x,y] la position du point qui intercepte la prochaine horizontale
      //Attention doit dépendre du cadran dans lequel on est !
      HIntercept = {x: posx+(dy/get_tan(new_theta)), y: py+1};
      //Et réciproquement VIntercept[x,y] la position du point qui intercepte la prochaine verticale
      VIntercept = {x : px+1, y:posy + (dx*get_tan(new_theta)*inc_y) };
      
      yStep = get_tan(new_theta) * inc_y;
      xStep = get_tan(PI_0_5 - new_theta) * inc_x;
      var has_progressed = true;
      try
      {
        while( !hitVert && !hitHoriz && has_progressed)
        {
          has_progressed = false;
          while ( !hitVert && !hitHoriz && ( HIntercept.x < VIntercept.x) && HIntercept.x < checkboard_size && HIntercept.y < checkboard_size )
          {
            if (walls[Math.floor(HIntercept.x)][HIntercept.y] > 0)
            {
              hitHoriz = true;
              break;
            }
            //pas de break, donc la case est visible ! on l'ajoute à la liste
            add_visible_cells(Math.floor(HIntercept.x), HIntercept.y);
            //on progresse sur la prochaine interception possible
            HIntercept.x += xStep;
            HIntercept.y += inc_y;
            has_progressed = true;
          }
          while ( !hitVert && !hitHoriz && (VIntercept.x < HIntercept.x ) && VIntercept.x < checkboard_size && VIntercept.y < checkboard_size )
          {
            if (walls[VIntercept.x][Math.floor(VIntercept.y)] > 0)
            {
              hitVert = true;
              break;
            }
            //pas de break, donc la case est visible ! on l'ajoute à la liste
            add_visible_cells(VIntercept.x, Math.floor(VIntercept.y));
            //on progresse sur la prochaine interception possible
            VIntercept.x += inc_x;
            VIntercept.y += yStep;
            has_progressed = true;
          }

          //ce cas peut se produire ! On ne dessine rien pour l'instant.
          if(VIntercept.x == HIntercept.x)
            break;
          
          //En dehors des clous ? On sort aussi
//          if (VIntercept.x > 64 ||  HIntercept.x > 64 || VIntercept.x < 0 ||  HIntercept.x < 0 || VIntercept.y > 64 ||  HIntercept.y > 64 || VIntercept.y < 0 ||  HIntercept.y < 0)
//          {
//            console.log("boucle hors limite quadrant D");
//            break;
//          }

        }
      }
      catch (error)
      {
        console.log("erreur quadrant D");
        debugger;
      }
          
     
      //il faut diviser une constante par  rapport à la distance pour avoir la distance à afficher.
      var heightWall = 0;
      var p = 0;
      if (hitVert)
      {  
        //calcul deltaX et deltaY
        //console.log("hit Vertical quadrant D:["+(Math.floor([VIntercept.x]))+","+(Math.floor(VIntercept.y))+"]");
        var deltaX =  Math.abs(VIntercept.x - posx);
        var deltaY =  Math.abs(posy-VIntercept.y);   

        p = deltaX * get_cos(beta) + deltaY * get_sin(beta);
//        p = Math.sqrt(deltaX*deltaX + deltaY+deltaY);
       // console.log("p : "+p);
        heightWall = (constanteH / p);

          //Si on touche vertical dans quadrant D alors c'est gauche:
        value_texture = (walls[VIntercept.x][Math.floor(VIntercept.y)] & 4278190080) >> 24;
        if (prev_value_texture != value_texture)
        {
      /*    array_texture = $(textures_data.textures).filter(function (i,n){return n.value===value_texture});
          if (array_texture.length > 0)
            id_texture = array_texture[0].id;
          else
            id_texture = 0;
          texture = document.getElementById(id_texture);*/
          texture = textures_list[value_texture];
          prev_value_texture = value_texture;
        }
        if (texture != null)
          drawColumn(texture, VIntercept.y,i,(canvas.height/2) - (heightWall/2), heightWall);
        else
        {
          ctx.fillStyle="purple";
          ctx.fillRect(i,(canvas.height/2) - (heightWall/2),1, heightWall);
        }
        columns_height[i] = heightWall;
        for (var toto = 1; toto < resolution_step; toto++)
        {
          columns_height[i+toto] = heightWall;
        }
      }

      if (hitHoriz)
      {   
        //calcul deltaX et deltaY
        //console.log("hit Horizon quadrant D:["+(Math.floor([HIntercept.x]))+","+(HIntercept.y-1)+"]");
        var deltaX =  Math.abs(HIntercept.x - posx);
        var deltaY =  Math.abs(posy-HIntercept.y);   

        p = deltaX * get_cos(beta) + deltaY * get_sin(beta);
//        p = Math.sqrt(deltaX*deltaX + deltaY+deltaY);
       // console.log("p : "+p);
        heightWall = (constanteH / p);

         //Si on touche horizontal dans quadrant D alors c'est haut:
        value_texture = (walls[Math.floor(HIntercept.x)][HIntercept.y] & 255);
        if (prev_value_texture != value_texture)
        {
/*          array_texture = $(textures_data.textures).filter(function (i,n){return n.value===value_texture});
          if (array_texture.length > 0)
            id_texture = array_texture[0].id;
          else
            id_texture = 0;
           texture = document.getElementById(id_texture);*/
          texture = textures_list[value_texture];
          prev_value_texture = value_texture;
        }
        if (texture != null)
          drawColumn(texture, HIntercept.x,i,(canvas.height/2) - (heightWall/2), heightWall);
        else
        {
          ctx.fillStyle="purple";
          ctx.fillRect(i,(canvas.height/2) - (heightWall/2),1, heightWall);
        }
        columns_height[i] = heightWall;
        for (var toto = 1; toto < resolution_step; toto++)
        {
          columns_height[i+toto] = heightWall;
        }
      }
      //ajout ici d'un continue, car sur le papier pas la peine de tester les autres cas
      //continue;//pas la peine on est déjà à la fin
    }
   
  }

}

/*
Dessine une colonne à l'écran
texture: Element de l'image (<img> récupéré via son id)
intercept: position ou le rayon coupe l'image (à ensuite recalculer par rapport largeur image)
dx: position x dans le canvas où on dessine
dy: position y dans le canvas où on dessine
dh: hauteur de la colonne, la largeur est forcément 1
*/
function drawColumn(texture, intercept, dx, dy, dh)
{
  //si on met juste texture.width sans le -1 on a un trou à la fin de la texture (ou au début...mystère)
  var sx = Math.round(Math.abs(intercept - Math.floor(intercept)) * (texture.width-1));
  ctx.drawImage(texture,sx,(resolution_step-1),1, texture.height,dx,dy,resolution_step,dh);
}

function pause_game()
{
  pause = !pause;
  //il faut relancer la boucle après la pause
  if (pause == false)
  {
    if(contextAudio.state === 'suspended') 
    {
      contextAudio.resume().then(function() {
        console.log("sound resumed");
      });
    } 
    step();
  }
  else
  {
    //stoppons l'audio
    if(contextAudio.state === 'running') {
      contextAudio.suspend().then(function() {
         console.log("sound suspended");
      });
    }
  }  
}

function build_sohcahtoa()
{
  //On a pas besoin de construire la liste des cos car cos(x) = sin(x+90);
  // 2eme trick sin(x) = -sin(x+180);
  //debugger;
  for (var i = 0; i < 18000; i++)
  {
    var i_rad = (i==0) ? 0 : ( ((i/100)/180) *Math.PI) ;
    sin[i] = Math.sin(i_rad);
    sin[i+18000] = -sin[i];
    tan[i] = Math.tan(i_rad);
    tan[i+18000] = tan[i];
  }
}

function get_sin(x)
{
  //le sin passé en paramètre est en radian.
  //il faut récupérer sa valeur en degré au centième.
  var indice_deg = Math.floor(((x / Math.PI) * 180) * 100);
  return sin[indice_deg];
}

function get_cos(x)
{
  //cos(x) = sin(x+PI/4), mais il ne faut pas dépasser 2PI !
  var cos_rad = (x + PI_0_5)%(PI_2);
  return get_sin(cos_rad);
}

function get_tan(x)
{
  var indice_deg = Math.floor(((x / Math.PI) * 180) * 100);
  return tan[indice_deg];
}

//charge les sprites et construit la select box
function load_enemies(enemies_json_path)
{
  console.log("chargement ennemies");
  $.getJSON(enemies_json_path, function (enemies_json)
  {
    //debugger;
    console.log("titi");
    enemies_data = enemies_json;
    for (var i=0; i < enemies_data.enemies.length ;i++)
    {
      var myImage = new Image();
      myImage.src =  enemies_data.enemies_path +  enemies_data.enemies[i].file;
      myImage.style = "display:none;";
      myImage.id = enemies_data.enemies[i].id;
      document.body.appendChild(myImage);
    }
    build_enemy_textures_list(enemies_data, enemy_tex_list);
    
  }).fail( function(error) 
    {
      debugger;
      console.log("error ennemies:"+error);
    });
}


//charge les sprites et construit la select box
function load_objects(objects_json_path)
{
    console.log("chargement objects");
  $.getJSON(objects_json_path, function (objects_json)
  {
    debugger;
    console.log("truc");
    objects_data = objects_json;
    for (var i=0; i < objects_data.objects.length ;i++)
    {
      var myImage = new Image();
      myImage.src =  objects_data.objects_path +  objects_data.objects[i].file;
      myImage.style = "display:none;";
      myImage.id = objects_data.objects[i].id;
      document.body.appendChild(myImage);
      object_data_by_id[objects_data.objects[i].id] = objects_data.objects[i];
    }
    build_object_textures_list(objects_data, object_tex_list);

  }).fail( function(error) 
    {
      debugger;
      console.log("error objects:"+error);
    });
}


//charge les sprites des armes
function load_weapons(weapons_json_path)
{
  console.log("chargement armes");
  $.getJSON(weapons_json_path, function (weapons_json)
  {
    //debugger;
    console.log("tututu");
    weapons_data = weapons_json;
    for (var i=0; i < weapons_data.weapons.length ;i++)
    {
      var myImage = new Image();
      myImage.src =  weapons_data.weapons_textures_path +  weapons_data.weapons[i].file;
      myImage.style = "display:none;";
      myImage.id = weapons_data.weapons[i].id;
      document.body.appendChild(myImage);
      ammo[i] = weapons_data.weapons[i].default_ammo;
    }
    build_weapon_textures_list(weapons_data, weapons_tex_list);
    
  }).fail( function(error) 
    {
      debugger;
      console.log("error weapons:"+error);
    });
}

//Ajout d'une case à la liste de celle visible. Pour éviter les doublons on vérifie qu'elle n'est pas déjà notée.
function add_visible_cells(x, y)
{
  var new_cell = x+","+y;
  if (visible_cells.indexOf(new_cell) < 0)
    visible_cells.push(new_cell);
}

//Affichons nos amis les ennemis !
function drawEnemies()
{
  //principe numéro 1 : on affiche un ennemi seulement si sa position actuelle est dans une cellule visible par le joueur (dans visible_cell)
  //principe numéro 2: On détermine les parties visibles de l'ennemi en fonction de la hauteur des murs en autour de lui (dans columns_height
  //principe 3: on affiche l'image du sprite de l'ennemi en fonction de l'angle de vision du joueur et de l'angle courant de l'ennemi.
  //principe 4 : on dessine les ennemis du plus lointain au plus proche, il faut donc une passe pour déterminer la distance, et donc la hauteur.
  var visible_enemies = [];
  for (var i = 0; i < lvl.enemies.length; i++)
  {
    var new_cell = Math.floor(lvl.enemies[i].position.x)+"," +Math.floor(lvl.enemies[i].position.y);
    lvl.enemies[i].shootable = false; // cf check_enemies_hit
    if (visible_cells.indexOf(new_cell) >= 0)
    {
      //Calcul distance et donc hauteur
      //rappel d = √ ( c − a ) 2 + ( d − b ) 2 .
      var d_enemy = Math.sqrt(Math.pow(lvl.enemies[i].position.x - posx, 2)+ Math.pow(lvl.enemies[i].position.y - posy, 2));
      var new_length = visible_enemies.push(lvl.enemies[i]);
      visible_enemies[new_length-1].height = (constanteH / d_enemy);
      visible_enemies[new_length-1].original_index = i;
    }
  }
  
  //Si pas de visible on ne fait rien...
  if (visible_enemies.length > 0)
  {
    //on classe la liste pour prendre les plus grands à la fin
    visible_enemies.sort(compare_heigt);
    var quadrant_enemy = 0;
    var picture_index = 0;
    if (debug_mode)
    {
      ctx.font = "20px Arial";
      ctx.fillStyle ="white"; 
      ctx.fillText("E.V:"+visible_enemies.length,10,60);
    }
    
    for (var j = 0; j< visible_enemies.length;j++)
    {
      //Maintenant on print !
      //Récupérons l'image du sprite
      //on a toujours pour les images enemies :
      //0 = face, 1 = gauche, 2 = dos, 3 = droite
      if (visible_enemies[j].rotation >= 0 && visible_enemies[j].rotation < PI_0_5)
        quadrant_enemy = 0;
      else if(visible_enemies[j].rotation >= PI_0_5 && visible_enemies[j].rotation < Math.PI)
       quadrant_enemy = 1;
      else if(visible_enemies[j].rotation >= Math.PI && visible_enemies[j].rotation < PI_1_5)
       quadrant_enemy = 2;
      else if(visible_enemies[j].rotation >= PI_1_5 && visible_enemies[j].rotation < PI_2)
       quadrant_enemy = 3;
      var alpha = 0;
      //quadrant 0 : 0 à pi/2, 1 : pi/2 à pi, 2: pi à 1.5pi; 3: 1.5pi à 2pi
      switch(quadrant_rotation)
      {
        case 0:
          switch(quadrant_enemy)
            {
              case 0:
                picture_index = 2;
                break;
              case 1:
                picture_index = 1;
                break;
              case 2:
                picture_index = 0;
                break;
              case 3:
                picture_index = 3;
                break;
            }
          break;
        case 1:
          switch(quadrant_enemy)
            {
              case 0:
                picture_index = 3;
                break;
              case 1:
                picture_index = 2;
                break;
              case 2:
                picture_index = 1;
                break;
              case 3:
                picture_index = 0;
                break;
            }
          break;
        case 2:
          switch(quadrant_enemy)
            {
              case 0:
                picture_index = 0;
                break;
              case 1:
                picture_index = 3;
                break;
              case 2:
                picture_index = 2;
                break;
              case 3:
                picture_index = 1;
                break;
            }
          break;
        case 3:
          switch(quadrant_enemy)
            {
              case 0:
                picture_index = 1;
                break;
              case 1:
                picture_index = 0;
                break;
              case 2:
                picture_index = 3;
                break;
              case 3:
                picture_index = 2;
                break;
            }
          break;
      }
      //ok on a l'index, on récupère l'image
      //var image = document.getElementById(visible_enemies[j].id);
      var image = enemy_tex_list[visible_enemies[j].id];
      //on cherche le premier point visible à gauche en fonction de la position de l'ennemi et de la hauteur des murs, et on refait pareil pour le point le plus visible à droite.
      // où commence le dessin ??? SOCATOA
      //calcul de l'indice, à partir de theta = rotation + (pov/2) -(i*inc_ray), on cherche i l'indice de la colonne.
      // avec theta => tan(theta)= (posy-y) / (posx-x)
//      var index_column_enemy = Math.floor( (Math.atan((posy-visible_enemies[j].position.y) / (posx-visible_enemies[j].position.x)) - rotation - (pov/2))/(-inc_ray) );
//      var index_column_enemy = Math.floor( (Math.atan(visible_enemies[j].position.y / visible_enemies[j].position.x) - rotation - (pov/2))/(-inc_ray) );
      //alpha = angle par rapport au champ vision joueur de la position de l'ennemi
      var alpha = Math.atan(Math.abs(visible_enemies[j].position.y-posy) / Math.abs( visible_enemies[j].position.x-posx));
//      var alpha = Math.atan((visible_enemies[j].position.y-posy) / ( visible_enemies[j].position.x-posx));
      var index_column_enemy = 0;
      var tmp_rotation = ((pov/2)+rotation)%(PI_2);
//      if (rotation + pov/2 > 2*Math.PI )
//      {
//        tmp_rotation = rotation%(2*Math.PI);
//        //deux cas : soit même quadrant, soit avant soit après
//        index_column_enemy = Math.floor(((pov/2) + rotation - alpha) / inc_ray);
//      }
      if (posy  < visible_enemies[j].position.y)
      {
        if (posx  > visible_enemies[j].position.x)
        {
          index_column_enemy = Math.floor((tmp_rotation - (Math.PI + alpha) ) / inc_ray);
        }
         else if ((tmp_rotation + alpha) > Math.PI )
          index_column_enemy = Math.floor( ((tmp_rotation + alpha)-PI_2) / inc_ray);
        else
          index_column_enemy = Math.floor((tmp_rotation + alpha) / inc_ray);
      }
      else
      {
        if (posx  > visible_enemies[j].position.x)
          index_column_enemy = Math.floor((tmp_rotation - (Math.PI - alpha) ) / inc_ray);
        else
          index_column_enemy = Math.floor((tmp_rotation - alpha) / inc_ray);
      }
      
      //limiter la taille de l'image
      var x_high_left = -1;
      var pic_width = -1;
      var index_image = 0; 
      //le milieu est à index_column, mais on commence avant
      var left_canvas_start = (index_column_enemy - Math.floor(visible_enemies[j].height /2));
      for (var k = left_canvas_start ; k <  (index_column_enemy + (Math.floor(visible_enemies[j].height /2))) && k < canvas.width; k++)
      {
        //Si k <0 on est en dehors de l'écran donc on affiche rien
        if (k > 0 )
        {
          if (columns_height[k] < visible_enemies[j].height)
          {
            //la colonne est plus petite => personnage devant
            if (x_high_left == -1)
              x_high_left = index_image;
          }
          else
          {
            if (x_high_left != -1)
            {
//              pic_width = k - (left_canvas_start < 0 ? 0 : left_canvas_start);
//              pic_width = index_image;
              break;  
            }
          }
        }
        index_image += 1;
        
        //plus simplee : on dessine les colonnes
//        if (columns_height[k] < visible_enemies[j].height)
//        {
//          drawColumn(image, ((k - left_canvas_start)*image.width)/visible_enemies[j].height,k,(canvas.height/2) - (visible_enemies[j].height/2), visible_enemies[j].height);
//        }
      }
      //Si x_high_left est à -1 alors on a rien à afficher puisque le mur est toujours plus haut
      if (x_high_left != -1)
      {
        //si on est sorti parce qu'on a dépassé canvas_width alors pic_width = index_image
        pic_width = index_image - x_high_left;
       
        //sx equivaut à x_high_left rapporté à la taille originale de l'image
        //sy equivaut à pic_width rapporté à la taille de l'image moins sx
        var x_high_left_orig = ((x_high_left) * image.height) / visible_enemies[j].height;
        var pic_width_orig = (pic_width * image.height ) / visible_enemies[j].height;

        ctx.drawImage(image, x_high_left_orig+get_image_ani_step(visible_enemies[j],picture_index), 0, pic_width_orig, image.height, left_canvas_start+x_high_left, (canvas.height/2) - (visible_enemies[j].height/2), pic_width, visible_enemies[j].height);
        
        //console.log("left_canvas_start:"+left_canvas_start+" columns_height.length/2"+columns_height.length/2+" x_high_left"+x_high_left+" pic_width"+pic_width);
        if ( left_canvas_start + x_high_left <= (columns_height.length/2) && left_canvas_start + pic_width >=  (columns_height.length/2) )
        {
          lvl.enemies[visible_enemies[j].original_index].shootable = true;
          visible_enemies[j].shootable = true;
        }
        else
        {
          visible_enemies[j].shootable = false;
        }

        //dessin complet qui fonctionne
  //      ctx.drawImage(image, (64*picture_index), 0, 64, image.height, left_canvas_start, (canvas.height/2) - (visible_enemies[j].height/2), visible_enemies[j].height, visible_enemies[j].height);
        if (debug_mode)
        {
          ctx.font = "20px Arial";
          ctx.fillStyle ="white"; 
          ctx.fillText("alpha:"+(alpha*180/3.14).toFixed(1)+"/c:"+index_column_enemy+"/height:"+visible_enemies[j].height.toFixed(1)+" |"+left_canvas_start.toFixed(0)+"/"+x_high_left.toFixed(0)+"/"+x_high_left_orig.toFixed(0)+"/"+(64*picture_index).toFixed(0)+"/"+pic_width.toFixed(0)+"/"+pic_width_orig.toFixed(0)+"|"+(visible_enemies[j].status == "chasing" ? ">:-(":"")+"|PV:"+visible_enemies[j].life+"|"+(visible_enemies[j].shootable ? "Shoot":"OOR"),10,80+j*20);
        }
      }

    }

  }
  
}

//Affichons nos amis les objets !
function drawObjects()
{
  if (typeof lvl.objects=="undefined")
    return;
  
  var visible_objects = [];
  for (var i = 0; i < lvl.objects.length; i++)
  {
    var new_cell = Math.floor(lvl.objects[i].position.x)+"," +Math.floor(lvl.objects[i].position.y);
    if (visible_cells.indexOf(new_cell) >= 0)
    {
      //Calcul distance et donc hauteur
      //rappel d = √ ( c − a ) 2 + ( d − b ) 2 .
      var d_object = Math.sqrt(Math.pow(lvl.objects[i].position.x - posx, 2)+ Math.pow(lvl.objects[i].position.y - posy, 2));
      var new_length = visible_objects.push(lvl.objects[i]);
      visible_objects[new_length-1].height = (constanteH / d_object);
      visible_objects[new_length-1].original_index = i;
    }
  }
  
  //Si pas de visible on ne fait rien...
  if (visible_objects.length > 0)
  {
    //on classe la liste pour prendre les plus grands à la fin
    visible_objects.sort(compare_heigt);
    var quadrant_enemy = 0;
    var picture_index = 0;
   
    for (var j = 0; j< visible_objects.length;j++)
    {
      //ok on a l'index, on récupère l'image
      //var image = document.getElementById(visible_enemies[j].id);
      var image = object_tex_list[visible_objects[j].id];
    
      var alpha = Math.atan(Math.abs(visible_objects[j].position.y-posy) / Math.abs( visible_objects[j].position.x-posx));
//      var alpha = Math.atan((visible_enemies[j].position.y-posy) / ( visible_enemies[j].position.x-posx));
      var index_column_object = 0;
      var tmp_rotation = ((pov/2)+rotation)%(PI_2);
//      if (rotation + pov/2 > 2*Math.PI )
//      {
//        tmp_rotation = rotation%(2*Math.PI);
//        //deux cas : soit même quadrant, soit avant soit après
//        index_column_enemy = Math.floor(((pov/2) + rotation - alpha) / inc_ray);
//      }
      if (posy  < visible_objects[j].position.y)
      {
        if (posx  > visible_objects[j].position.x)
        {
          index_column_object = Math.floor((tmp_rotation - (Math.PI + alpha) ) / inc_ray);
        }
         else if ((tmp_rotation + alpha) > Math.PI )
          index_column_object = Math.floor( ((tmp_rotation + alpha)-PI_2) / inc_ray);
        else
          index_column_object = Math.floor((tmp_rotation + alpha) / inc_ray);
      }
      else
      {
        if (posx  > visible_objects[j].position.x)
          index_column_object = Math.floor((tmp_rotation - (Math.PI - alpha) ) / inc_ray);
        else
          index_column_object = Math.floor((tmp_rotation - alpha) / inc_ray);
      }
      
      //limiter la taille de l'image
      var x_high_left = -1;
      var pic_width = -1;
      var index_image = 0; 
      //le milieu est à index_column, mais on commence avant
      var left_canvas_start = (index_column_object - Math.floor(visible_objects[j].height /2));
      for (var k = left_canvas_start ; k <  (index_column_object + (Math.floor(visible_objects[j].height /2))) && k < canvas.width; k++)
      {
        //Si k <0 on est en dehors de l'écran donc on affiche rien
        if (k > 0 )
        {
          if (columns_height[k] < visible_objects[j].height)
          {
            //la colonne est plus petite => personnage devant
            if (x_high_left == -1)
              x_high_left = index_image;
          }
          else
          {
            if (x_high_left != -1)
            {
//              pic_width = k - (left_canvas_start < 0 ? 0 : left_canvas_start);
//              pic_width = index_image;
              break;  
            }
          }
        }
        index_image += 1;
        
        //plus simplee : on dessine les colonnes
//        if (columns_height[k] < visible_enemies[j].height)
//        {
//          drawColumn(image, ((k - left_canvas_start)*image.width)/visible_enemies[j].height,k,(canvas.height/2) - (visible_enemies[j].height/2), visible_enemies[j].height);
//        }
      }
      //Si x_high_left est à -1 alors on a rien à afficher puisque le mur est toujours plus haut
      if (x_high_left != -1)
      {
        //si on est sorti parce qu'on a dépassé canvas_width alors pic_width = index_image
        pic_width = index_image - x_high_left;
       
        //sx equivaut à x_high_left rapporté à la taille originale de l'image
        //sy equivaut à pic_width rapporté à la taille de l'image moins sx
        var x_high_left_orig = ((x_high_left) * image.height) / visible_objects[j].height;
        var pic_width_orig = (pic_width * image.height ) / visible_objects[j].height;

        ctx.drawImage(image, x_high_left_orig+get_image_ani_step(visible_objects[j],picture_index), 0, pic_width_orig, image.height, left_canvas_start+x_high_left, (canvas.height/2) - (visible_objects[j].height/2), pic_width, visible_objects[j].height);
        
      }

    }

  }
  
}

//entre deux objects contenant une hauteur, compare cette hauteur pour tri (cf drawEnemies)
function compare_heigt(obj_1, obj_2)
{
  return obj_1.height - obj_2.height;
}

//retourne la position de l'index de l'animation dans l'image du sprite en fonction du contexte.
function get_image_ani_step(enemy, picture_index)
{
  //Deux cas : l'ennemi marche ou est à l'arrêt
  // S'il est à l'arrêt on part de 0 et on mutiplie index par 64
  // S'il marche il faut prendre le bon angle avec index soit 256+256*index
  // puis par rapport à ce nouveau 0, prendre l'image qui correspond à la step d'animation qui 
  // est dans les propriétés du perso
  if (enemy.walking == true || enemy.status == "firing")
  {
    //on change de step d'animation en se basant sur animation step qui est rempli par l'IA
    //on décale de 256 car les 4 premières image sont la pose T.
    //pour le tir on a 256 (4 premières) + 4*256 (marche), soit 5*256
    //le tir consiste en 3 steps de 4 images (4*64)
    if (enemy.status == "firing" && enemy.animation_step == 0)
      return 64*picture_index;
    var offset_image =  (enemy.status == "firing") ? 1216 : 256;
    return (offset_image+256*picture_index + enemy.animation_step * 64);
  }
  else if (enemy.status == "death")
  {
    switch (enemy.animation_step)
    {
      case 0:
        return 2048;
        break;
      case 1:
        return 2112;
        break;
      case 2:
        return 2176;
        break;
      case 3:
        return 2240;
        break;
    }
      
  }
  else if (enemy.status == "dead")
  {
    //on se fiche du picture index ici, le reste est en 2240
    //TODO : stocker les valeurs des images dans une table !
    return 2240;
  }
  else         
  {
    return (64*picture_index);
  }
}

//L'IA et tous les trucs qui demande de la logique
function doLogic()
{
  var maintenant = Date.now();

  //Si on est sur la case de fin et que la touche espace est pressée on charge le niveau suivant
  if (typeof lvl.end != "undefined" && ( (posx >= lvl.end[0] && posx <= lvl.end[0]+1) && (posy >= lvl.end[1] && posy <= lvl.end[1]+1)))
  {
    on_ending_point = true;
    if (space_bar_pressed == 1)
    {
      lvl_index++;
      space_bar_pressed = false;
      loadLevel(lvl_list[lvl_index]);
    }
  }
  else
    on_ending_point = false;
  
  /*On parcourt les objets pour savoir si on en récupère un */
  if (typeof lvl.objects!="undefined")
  {
    for (var i = 0; i < lvl.objects.length; i++)
    {
      if ( (posx >= lvl.objects[i].position.x-0.5 && posx <= lvl.objects[i].position.x+0.5) && (posy >= lvl.objects[i].position.y-0.5 && posy <= lvl.objects[i].position.y+0.5))
      {
        switch(object_data_by_id[lvl.objects[i].id].type)
        {
          case "key":
            available_keys[object_data_by_id[lvl.objects[i].id].key_index] = true;
             playSound("pling");
            break;
          case "ammo":
            ammo[object_data_by_id[lvl.objects[i].id].ammo_type] += object_data_by_id[lvl.objects[i].id].qty;
            if (object_data_by_id[lvl.objects[i].id].ammo_type == 0)
              playSound("clip");
            else
              playSound("cartridge");
            break;
          case "health":
            life += object_data_by_id[lvl.objects[i].id].qty;
            playSound("drink");
          break;
          case "weapon":
            if (available_weapons[object_data_by_id[lvl.objects[i].id].weapon_index] == false)
            {
              available_weapons[object_data_by_id[lvl.objects[i].id].weapon_index] = true;
              current_weapon = object_data_by_id[lvl.objects[i].id].weapon_index;
            }
            ammo[object_data_by_id[lvl.objects[i].id].ammo_type] += object_data_by_id[lvl.objects[i].id].qty;
            if (object_data_by_id[lvl.objects[i].id].ammo_type == 0)
              playSound("clip");
            else
              playSound("cartridge");
            break;
          break;
        }
        lvl.objects.splice(i,1);
      }
    }
  }
  
  /*On parcourt les portes pour savoir si on peut en activer une*/
  if (typeof lvl.doors!="undefined")
  {
    for (var i = 0; i < lvl.doors.length; i++)
    {
      if ( (posx >= lvl.doors[i].position.x && posx <= lvl.doors[i].position.x+1) && (posy >= lvl.doors[i].position.y && posy <= lvl.doors[i].position.y+1))
      {
                  /*les types
           <option value="-2" default>default</option>
      <option value="-1">auto-trigger</option>
      <option value="0">blue key</option>
      <option value="1">yellow key</option>
      <option value="2">red key</option>
      <option value="3">auto-trigger-up</option>
      <option value="4">blue key up</option>
      <option value="5">yellow key up</option>
      <option value="6">red key up</option>
      les clés available_keys = [false,false,false];//blue,yellow,red*/
        var type = (typeof lvl.doors[i].type == "undefined") ? -2 : parseInt(lvl.doors[i].type,10);
        on_blue_point = false;
        on_yellow_point = false;
        on_red_point = false;
        
        if (space_bar_pressed == 1 || type == -1 || type == 3)
        {      
          //On supprime le mur marqué en x/y
          switch(type)
          {
            case -2:
              walls[lvl.doors[i].x][lvl.doors[i].y] = 0;
              break;
            case -1:
              walls[lvl.doors[i].x][lvl.doors[i].y] = 0;
              break;
            case 0:
              if (available_keys[0] == true)
                walls[lvl.doors[i].x][lvl.doors[i].y] = 0;
              else
                on_blue_point = true;
              break;
            case 1:
              if (available_keys[1] == true)
                walls[lvl.doors[i].x][lvl.doors[i].y] = 0;
              else
                on_yellow_point = true;
              break;
            case 2:
              if (available_keys[2] == true)
                walls[lvl.doors[i].x][lvl.doors[i].y] = 0;
              else
                on_red_point = true;
              break;
            case 3:
              walls[lvl.doors[i].x][lvl.doors[i].y] = lvl.doors[i].texture;
              break;
            case 4:
              if (available_keys[0] == true)
                walls[lvl.doors[i].x][lvl.doors[i].y] = lvl.doors[i].texture;
              else
                on_blue_point = true;
              break;
            case 5:
              if (available_keys[1] == true)
                walls[lvl.doors[i].x][lvl.doors[i].y] = lvl.doors[i].texture;
              else
                on_yellow_point = true;
              break;
            case 6:
              if (available_keys[2] == true)
                walls[lvl.doors[i].x][lvl.doors[i].y] = lvl.doors[i].texture;
              else
                on_red_point = true;
              break;
            default:
              break;
          }
          if (typeof lvl.doors[i].trigger != "undefined")
          {
            walls[lvl.doors[i].trigger.x][lvl.doors[i].trigger.y] = lvl.doors[i].trigger.texture;
            playSound("switch");
          }
          else
            if (type != -1 && type != 3)
              playSound("door");
        }
      }
      //lvl.objects.splice(i,1);
    }
    space_bar_pressed = false;
  }
  
  for (var i = 0; i < lvl.enemies.length; i++)
  {
    //On parcourt la liste des ennemis.
    //S'ils ont un path alors on passe leur statut walking à "true", sinon false.
    //Ensuite on les déplace vers la première case du path, on note l'indice de la case qu'on veut attendre.
    //Une fois la case atteinte on incrémente, à la dernière case on le fait revenir à son point d'arrivée et on boucle.
    //  move_UpDown_unity_enemy
    
    if (lvl.enemies[i].status == "dead") //S'il est mort on a besoin de rien faire d'autre
     continue;
    
    if (lvl.enemies[i].status == "death") //il est entrain de mourir !
    {
      
      if (lvl.enemies[i].animation_step == -1)
      {
        lvl.enemies[i].animation_step = 0;
        lvl.enemies[i].time_last_image = maintenant;
        lvl.enemies[i].walking = false;
      }
      
      if ( maintenant > lvl.enemies[i].time_last_image + animation_speed )
      {
        //On passe à l'image suivante, Note: l'étape 0 est la tête qu gonfle
        //étape 1 tête explose, 2 on tombe, 3 les restes
        if (lvl.enemies[i].animation_step + 1 < 4 )
        {
          lvl.enemies[i].animation_step +=1;
          lvl.enemies[i].time_last_image = maintenant;
        }
        else
          lvl.enemies[i].status == "dead";
      }
      continue;
    }
    
    //Pour chaque ennemi on vérifie s'il voit le joueur ou pas, si oui passe en mode "chasing"
    //trois critères : le joueur est-il à moins de "enemy_sight_distance" de l'ennemi ? 
    //Et est-il dans son angle de vue enemy_sight_angle ? y'a t'il un obstacle ?
    var is_at_distance = get_distance(lvl.enemies[i].position.x, lvl.enemies[i].position.y, posx, posy) < enemy_sight_distance;
    var angle_joueur = get_angle(lvl.enemies[i].position.x, lvl.enemies[i].position.y, posx, posy);
    var is_at_angle = in_angle_intervalle(Number(lvl.enemies[i].rotation), angle_joueur, enemy_sight_angle);
    var is_there_no_obstacle = !is_there_obstacle(lvl.enemies[i].position.x, lvl.enemies[i].position.y, posx, posy);
      
    
    if (is_at_distance && is_at_angle && is_there_no_obstacle && lvl.enemies[i].status != "firing" && lvl.enemies[i].status != "death" && lvl.enemies[i].status != "dead")
    {
      if (lvl.enemies[i].status != "chasing")
        playSoundLocalized("you",i);//s'il n'était pas déjà en chasse il aperçoit le joueur et l'interpelle
      lvl.enemies[i].status = "chasing";
      lvl.enemies[i].path_target = {};
      lvl.enemies[i].path_target.position = {};
      lvl.enemies[i].path_target.position.x = posx;
      lvl.enemies[i].path_target.position.y = posy;
      if (lvl.enemies[i].time_chase_started == undefined)
        lvl.enemies[i].time_chase_started = maintenant;
    }
    
    var has_moved = false;
    //rotation_mask indique le send de rotation du perso quand il marche NSOE nord/sud/ouest/est
    var rotation_mask = 0;
    if ((lvl.enemies[i].path !=  undefined || lvl.enemies[i].status == "chasing") && lvl.enemies[i].status != "firing" )
    {
      lvl.enemies[i].walking = true;
      //On test s'il a déjà une target, sinon on lui assigne le premier de path
      if (lvl.enemies[i].path_target == undefined)
      {
//      lvl.enemies[i].path_target = lvl.enemies[i].path[0];
        lvl.enemies[i].path_target = {};
        lvl.enemies[i].path_target.position = {};
        lvl.enemies[i].path_target.position.x = lvl.enemies[i].path[0].position.x + 0.5;
        lvl.enemies[i].path_target.position.y = lvl.enemies[i].path[0].position.y + 0.5;
        lvl.enemies[i].path_target.arrow = lvl.enemies[i].path[0].arrow;
        lvl.enemies[i].path_target_index = 0;
        //on rajoute 0.5 pour qu'il ne se cogne pas dans les murs. 
      }
      //On test si on a atteint la target, si oui on va à next_target, sinon on avance.
      //Note système bancal car on prend pas en compte les flèches !
      if ( Math.abs(lvl.enemies[i].position.x - lvl.enemies[i].path_target.position.x) >= move_UpDown_unity_enemy_sa )
      {
        //has_moved = true;
        if (Math.abs(lvl.enemies[i].position.x < lvl.enemies[i].path_target.position.x))
        {
          //il ne faut pas traverser les murs !
          var new_enemy_x = lvl.enemies[i].position.x + move_UpDown_unity_enemy_sa;
          var new_enemy_x_wall_distance = new_enemy_x + max_enemy_wall_distance;
          if (lvl.walls[Math.floor(new_enemy_x_wall_distance)][Math.floor(lvl.enemies[i].position.y)] == 0) 
          {
            lvl.enemies[i].position.x = new_enemy_x;
            rotation_mask += 1;
            has_moved = true;
          }
        }
        else
        {
          //il ne faut pas traverser les murs !
          var new_enemy_x = lvl.enemies[i].position.x - move_UpDown_unity_enemy_sa;
          var new_enemy_x_wall_distance = new_enemy_x - max_enemy_wall_distance;
          if (lvl.walls[Math.floor(new_enemy_x_wall_distance)][Math.floor(lvl.enemies[i].position.y)] == 0) 
          {
            lvl.enemies[i].position.x = new_enemy_x;
            rotation_mask += 2;
            has_moved = true;
          }
        }
      }
      if ( Math.abs(lvl.enemies[i].position.y - lvl.enemies[i].path_target.position.y) >= move_UpDown_unity_enemy_sa )
      {
      
        if (Math.abs(lvl.enemies[i].position.y < lvl.enemies[i].path_target.position.y))
        {
          //il ne faut pas traverser les murs !
          var new_enemy_y = lvl.enemies[i].position.y + move_UpDown_unity_enemy_sa;
          var new_enemy_y_wall_distance = new_enemy_y + max_enemy_wall_distance;
          if (lvl.walls[Math.floor(lvl.enemies[i].position.x)][Math.floor(new_enemy_y_wall_distance)] == 0) 
          {
            lvl.enemies[i].position.y = new_enemy_y;
            rotation_mask += 4;
            has_moved = true;
          }
        }
        else
        {
          //il ne faut pas traverser les murs !
          var new_enemy_y = lvl.enemies[i].position.y - move_UpDown_unity_enemy_sa;
          var new_enemy_y_wall_distance = new_enemy_y - max_enemy_wall_distance;
          if (lvl.walls[Math.floor(lvl.enemies[i].position.x)][Math.floor(new_enemy_y_wall_distance)] == 0) 
          {
            lvl.enemies[i].position.y = new_enemy_y;
            rotation_mask += 8;
            has_moved = true;
          }
        }
      }
            
      if (has_moved)
      {
        //on met à jour la rotation
        switch (rotation_mask)
        {
          case 1:
            lvl.enemies[i].rotation = 0.01;
            break;
          case 2:
            lvl.enemies[i].rotation = 3.14;
            break;
          case 4:
            lvl.enemies[i].rotation = 4.71;
            break;
          case 5:
            lvl.enemies[i].rotation = 5.495;
            break;
          case 6:
            lvl.enemies[i].rotation = 3.925;
            break;
          case 8:
            lvl.enemies[i].rotation = 1.57;
            break;
          case 9:
            lvl.enemies[i].rotation = 0.785;
            break;
          case 10:
            lvl.enemies[i].rotation = 2.355;
            break;
          default:
           break;
        }
        //Step d'animation, il y en a 4 pour la marche, on bouge toutes les 150 ms
        if (lvl.enemies[i].time_last_image !=undefined )
        {
          if ( maintenant > lvl.enemies[i].time_last_image + animation_speed )
          {
            //On passe à l'image suivante
            if (lvl.enemies[i].animation_step + 1 < 4)
              lvl.enemies[i].animation_step +=1;
            else
              lvl.enemies[i].animation_step = 0;
            
            lvl.enemies[i].time_last_image = maintenant;
            
          }
          //S'il a marché depuis plus de time_fire_trigger en mode chasse il tire
         if ( maintenant > lvl.enemies[i].time_chase_started + time_fire_trigger &&  lvl.enemies[i].status != "firing" )
          {
            lvl.enemies[i].status = "firing";
            lvl.enemies[i].animation_step = 0;
            lvl.enemies[i].time_last_image = maintenant;
          }
        }
        else
        {
          lvl.enemies[i].animation_step = 0;
          lvl.enemies[i].time_last_image = maintenant;
        } 
      }
      else
      {
        //il n'a pas bougé donc on lui indique sa prochaine position
        if (lvl.enemies[i].status != "chasing")
        {
          if (lvl.enemies[i].path !=  undefined && lvl.enemies[i].path_target_index + 1 < lvl.enemies[i].path.length)
          {  
            lvl.enemies[i].path_target_index +=1 ;
  //          lvl.enemies[i].path_target = lvl.enemies[i].path[lvl.enemies[i].path_target_index];
  //          lvl.enemies[i].path_target.position.x += 0.5;
  //          lvl.enemies[i].path_target.position.y += 0.5;
            lvl.enemies[i].path_target = {};
            lvl.enemies[i].path_target.position = {};
            lvl.enemies[i].path_target.position.x = lvl.enemies[i].path[lvl.enemies[i].path_target_index].position.x + 0.5;
            lvl.enemies[i].path_target.position.y = lvl.enemies[i].path[lvl.enemies[i].path_target_index].position.y +0.5;
            lvl.enemies[i].path_target.arrow = lvl.enemies[i].path[lvl.enemies[i].path_target_index].arrow;
          }
          else
          {
            lvl.enemies[i].path_target_index = 0;
  //          lvl.enemies[i].path_target = lvl.enemies[i].path[0];
  //          lvl.enemies[i].path_target.position.x += 0.5;
  //          lvl.enemies[i].path_target.position.y += 0.5;
            lvl.enemies[i].path_target = {};
            lvl.enemies[i].path_target.position = {};
            lvl.enemies[i].path_target.position.x = lvl.enemies[i].path[0].position.x + 0.5;
            lvl.enemies[i].path_target.position.y = lvl.enemies[i].path[0].position.y +0.5;
            lvl.enemies[i].path_target.arrow = lvl.enemies[i].path[0].arrow;
          }
        }
        else
        {
          //Il n'a pas bougé et est en chasse donc il a perdu de vu le joueur
          //il va tourner sur lui-même pour le chercher !
          if (lvl.enemies[i].time_last_image == undefined)
          {
            lvl.enemies[i].time_last_image = maintenant;
          }
          else 
          {
            if ( maintenant > lvl.enemies[i].time_last_image + animation_speed)
            {
              lvl.enemies[i].time_last_image = maintenant; // on le moment où il a perdu la trace du joueur
              lvl.enemies[i].rotation += 0.785; // on tourne toujours dans le même sens pour se simplifier la vie
              if (lvl.enemies[i].rotation > 6.28)
                lvl.enemies[i].rotation = 0.01;
            }
          }
          //Enfin in réinitialise le temps de chasse avant tir puisqu'il l'a perdu de vu !
          lvl.enemies[i].time_chase_started = maintenant;
        }
      }
            
    }
    else
    {
      if (lvl.enemies[i].status == "firing")
      {
        //3 étapes : il met la main à la poche, il vise, il tire. 
        if ( maintenant > lvl.enemies[i].time_last_image + animation_speed )
        {
          //On passe à l'image suivante, Note: l'étape 0 est la pose T, il n'y a qu'une animation_speed entre T et 1, mais 3 entre les autres.
          if (lvl.enemies[i].animation_step + 1 < 4 )
            lvl.enemies[i].animation_step +=1;
          else
          {
            lvl.enemies[i].animation_step = 0;
            //on tire, donc on reste-t'on en mode fire ? roulette !
            if (Math.round(Math.random()))
            {
              lvl.enemies[i].status = "chasing";
              lvl.enemies[i].time_chase_started = maintenant;
            }
          }
          
          if (lvl.enemies[i].animation_step == 2)
          {
            //on vise
            //euh en fait on l'a déjà c'est target non ?
            //mais bon mettons à jour
            lvl.enemies[i].path_target.position.x = posx;
            lvl.enemies[i].path_target.position.y = posy;
          }
          
          if (lvl.enemies[i].animation_step == 3)
          {
            //est-ce qu'il nous a touché ?
            //playSound("enemy_gun");
            playSoundLocalized("enemy_gun",i);
            if (is_hit(i))
            {  
              life -=10;
              playSound("player_hit");            }
          }

          if (lvl.enemies[i].animation_step !=0)
            lvl.enemies[i].time_last_image = maintenant;
          else
            lvl.enemies[i].time_last_image = maintenant + 2 * animation_speed;
        }
      }
      else
        lvl.enemies[i].walking = false;
    }
  }
  
}

//cette fonction retourne si les deux points passés en paramètre sont visibles l'un à l'autre
//on va du point (xa,ya) (l'ennemi) vers (xb,yb) (le joueur)
//a pas l'air de bien fonctionner dans certains cas, à vérifier !
function is_there_obstacle(xa, ya, xb, yb)
{
  var hitVert = false;
  var hitHoriz = false;
  var has_progressed = true;
  
  // Il y a un cas particulier qui va nous casser les pieds : si xb = xa à cause de la division par zero.
  if (xa != xb)
  {
    //droite d'équation y = ax+b, donc x = (y-b)/a
    //on détermine a
    var a = (yb - ya)/(xb - xa);
    var b = ya - (a * xa);

    //on bouge d'abord les x
    var inc_x = xb < xa ? -1 : 1;
    var inc_y = yb < ya ? -1 : 1;
/*
    //current_x et y sont dépendants du sens dans lequel on va !
    var current_x = Math.floor(xa + inc_x);
    var current_y = Math.floor(ya + inc_y);
    //il faut un HIntercept et un VIntercept ? => oui !
    var HIntercept = {x: (current_y - b) / a, y: current_y};
    var VIntercept = {x: current_x, y: a * current_x + b };
*/

    //On va en haut à droite Quadrant A
    if (inc_x > 0 && inc_y < 0)
    {
      var current_x = Math.floor(xa) + inc_x;
      var current_y = Math.ceil(ya) + inc_y;
      //il faut un HIntercept et un VIntercept ? => oui !
      var HIntercept = {x: (current_y - b) / a, y: current_y};
      var VIntercept = {x: current_x, y: a * current_x + b };
      
      while ( !hitVert && !hitHoriz && has_progressed)
      {
        has_progressed = false;
        while (!hitVert && !hitHoriz && (HIntercept.x < VIntercept.x) && HIntercept.y >= yb && HIntercept.x < checkboard_size && HIntercept.y >= 1)
        {
          if (walls[Math.floor(HIntercept.x)][HIntercept.y-1] > 0)
          {
            hitHoriz = true;
            break;
          }
          //on progresse sur la prochaine interception possible
          HIntercept.y += inc_y;
          HIntercept.x = (HIntercept.y - b) / a;
          has_progressed = true; 
        }
        while (!hitVert && !hitHoriz && (VIntercept.x < HIntercept.x) && VIntercept.x <= xb && VIntercept.x < checkboard_size && VIntercept.y >= 0)
        {
          if (walls[VIntercept.x][Math.floor(VIntercept.y)] > 0)
          {
            hitVert = true;
            break;
          }
          //on progresse sur la prochaine interception possible
          VIntercept.x += inc_x;
          VIntercept.y = (a * VIntercept.x) + b;
          has_progressed = true; 
        }
      }
      if (hitVert || hitHoriz)
        return true;
    }
    //on va en haut à gauche quadrant B
    if ( inc_x < 0 && inc_y < 0)
    {
      var current_x = Math.ceil(xa) + inc_x;
      var current_y = Math.ceil(ya) + inc_y;
      //il faut un HIntercept et un VIntercept ? => oui !
      var HIntercept = {x: (current_y - b) / a, y: current_y};
      var VIntercept = {x: current_x, y: a * current_x + b };
      
      while ( !hitVert && !hitHoriz && has_progressed)
      {
        has_progressed = false;
        while (!hitVert && !hitHoriz && (HIntercept.x > VIntercept.x) && HIntercept.y >= yb && HIntercept.x >= 0 && HIntercept.y >= 1)
        {
          if (walls[Math.floor(HIntercept.x)][HIntercept.y-1] > 0)
          {
            hitHoriz = true;
            break;
          }
          //on progresse sur la prochaine interception possible
          HIntercept.y += inc_y;
          HIntercept.x = (HIntercept.y - b) / a;
          has_progressed = true; 
        }
        while (!hitVert && !hitHoriz && (VIntercept.x > HIntercept.x) && VIntercept.x >= xb && VIntercept.x >= 1 && VIntercept.y >= 0)
        {
          if (walls[VIntercept.x-1][Math.floor(VIntercept.y)] > 0)
          {
            hitVert = true;
            break;
          }
          //on progresse sur la prochaine interception possible
          VIntercept.x += inc_x;
          VIntercept.y = (a * VIntercept.x) + b;
          has_progressed = true; 
        }
      }
      if (hitVert || hitHoriz)
        return true;
    }
    //On va en bas à gauche quadrant C
    if (inc_x < 0 && inc_y > 0)
    {
      var current_x = Math.ceil(xa) + inc_x;
      var current_y = Math.floor(ya) + inc_y;
      //il faut un HIntercept et un VIntercept ? => oui !
      var HIntercept = {x: (current_y - b) / a, y: current_y};
      var VIntercept = {x: current_x, y: a * current_x + b };
      
      while ( !hitVert && !hitHoriz && has_progressed)
      {
        has_progressed = false;
        while (!hitVert && !hitHoriz && (HIntercept.x > VIntercept.x) && HIntercept.y <= yb && HIntercept.x >= 0 && HIntercept.y < checkboard_size)
        {
          if (walls[HIntercept.x > 0 ? Math.floor(HIntercept.x) : 0 ][HIntercept.y] > 0)
          {
            hitHoriz = true;
            break;
          }
          //on progresse sur la prochaine interception possible
          HIntercept.y += inc_y;
          HIntercept.x = (HIntercept.y - b) / a;
          has_progressed = true; 
        }
        while (!hitVert && !hitHoriz && (VIntercept.x > HIntercept.x) && VIntercept.x >= xb && VIntercept.x >= 1 && VIntercept.y < checkboard_size)
        {
          if (walls[VIntercept.x <1 ? 0 : VIntercept.x-1][Math.floor(VIntercept.y)] > 0)
          {
            hitVert = true;
            break;
          }
          //on progresse sur la prochaine interception possible
          VIntercept.x += inc_x;
          VIntercept.y = (a * VIntercept.x) + b;
          has_progressed = true; 
        }
      }
      if (hitVert || hitHoriz)
        return true;
    }
    //on va en bas à droite quadrant D
    if (inc_x > 0 && inc_y > 0)
    {
      var current_x = Math.floor(xa) + inc_x;
      var current_y = Math.floor(ya) + inc_y;
      //il faut un HIntercept et un VIntercept ? => oui !
      var HIntercept = {x: (current_y - b) / a, y: current_y};
      var VIntercept = {x: current_x, y: a * current_x + b };
      
      while ( !hitVert && !hitHoriz && has_progressed)
      {
        has_progressed = false;
        while (!hitVert && !hitHoriz && (HIntercept.x < VIntercept.x) && HIntercept.y <= yb && HIntercept.x < checkboard_size && HIntercept.y < checkboard_size)
        {
          if (walls[Math.floor(HIntercept.x)][HIntercept.y] > 0)
          {
            hitHoriz = true;
            break;
          }
          //on progresse sur la prochaine interception possible
          HIntercept.y += inc_y;
          HIntercept.x = (HIntercept.y - b) / a;
          has_progressed = true; 
        }
        while (!hitVert && !hitHoriz && (VIntercept.x < HIntercept.x ) && VIntercept.x <= xb  && VIntercept.x < checkboard_size && VIntercept.y < checkboard_size )
        {
          if (walls[VIntercept.x][Math.floor(VIntercept.y)] > 0)
          {
            hitVert = true;
            break;
          }
          //on progresse sur la prochaine interception possible
          VIntercept.x += inc_x;
          VIntercept.y = (a * VIntercept.x) + b;
          has_progressed = true; 
        }
      }
      if (hitVert || hitHoriz)
        return true;
    }
  }
  else
  {
    debugger;
    //cas particulier dans le cas particulier
    if (ya == yb)
      return true;
    //Cas où xb == xa ! on ne teste que les interceptions horizontales
    var inc_y = yb < ya ? -1 : 1;
    var current_x = Math.floor(xa);
    var current_y = yb < ya ? Math.floor(ya) + inc_y : Math.ceil(ya) + inc_y ;
    //il faut un HIntercept et un VIntercept ? => oui !
    var HIntercept = {x: current_x, y: current_y};

    has_progressed = true;

    //On teste en descendant (y est incrémenté)
    while (!hitHoriz && has_progressed && (inc_y > 0 ? (HIntercept.y < yb) && (HIntercept.y < checkboard_size) : (HIntercept.y > yb) && (HIntercept.y >= 1)))
    {
      if (walls[Math.floor(HIntercept.x)][HIntercept.y] > 0)
      {
        hitHoriz = true;
        return true;
      }
      //on progresse sur la prochaine interception possible
      HIntercept.y += inc_y;
      has_progressed = true; 
    }
  }
  
  return false;
}

//retourne simplement la distance entre deux points
function get_distance(xa, ya, xb, yb)
{
  return Math.sqrt(Math.pow(xb-xa,2)+Math.pow(yb-ya,2));
}
  
//retourne l'angle entre deux points
function get_angle(xa, ya, xb, yb)
{
  var tmp = Math.atan2((yb-ya),(xb-xa));
//   if (yb < ya)
//     tmp = - tmp;
//   else
//     tmp = -tmp;
//  return (tmp < 0 ? -tmp: tmp);
  return -tmp;
}

//indique si rotation_2 est à +/-angle_valide/2 de rotation_1
function in_angle_intervalle(rotation_1, rotation_2, angle_valide)
{
  /*
  //reste un problème entre 270 et 0° !!!
  var rotation_2_trans = Math.PI*2 + rotation_2;
  if (rotation_1 + (angle_valide / 2) > rotation_2 && rotation_1 - (angle_valide / 2) < rotation_2)
    return true;
  //Dans le cas où le signe nous joue des tours on ressaye transposé
  if (rotation_1 + (angle_valide / 2) > (rotation_2_trans) && rotation_1 - (angle_valide / 2) < rotation_2_trans)
    return true;
  return false;
  */
  //transposer un angle négatif en positif
  var rotation_2_trans = PI_2 + rotation_2;
  //calcul angle gauche et droit
  var angle_g = rotation_1 + (angle_valide / 2);
  var angle_d = rotation_1 - (angle_valide / 2);
  if (angle_d > 0)
  {
    if (rotation_2 > 0)
      return  (angle_g > rotation_2 && angle_d < rotation_2);
    else
      return  (angle_g > rotation_2_trans && angle_d < rotation_2_trans);
  }
  else
  {
    //angle_d < 0
    if (rotation_2 > 0)
      return  (angle_g > rotation_2 && angle_d < rotation_2);
    else
      return  (angle_g > rotation_2 && angle_d < rotation_2);
  }
}

//indique si le tire de l'ennemi touche ou non
function is_hit(index_ennemi)
{
  //l'ennemi vise à "target", on compare avec notre position actuelle
  //en donnant une zone de 0.5 autour de notre position, aussi simple que ça !
  //lvl.enemies[i].path_target.position.x
  //lvl.enemies[i].path_target.position.y
  //il faudrait quand même ajouter la détection de collision avec les murs...
  if (!is_there_obstacle(lvl.enemies[index_ennemi].position.x, lvl.enemies[index_ennemi].position.y, posx, posy) &&
      lvl.enemies[index_ennemi].path_target.position.x + 0.5 > posx &&
      lvl.enemies[index_ennemi].path_target.position.x -0.5 < posx &&
      lvl.enemies[index_ennemi].path_target.position.y + 0.5 > posy &&
      lvl.enemies[index_ennemi].path_target.position.y - 0.5 < posy)
    return true;
  else
    return false;
}

    //on vérifie si notre tir a fait mouche
function check_enemies_hit()
{
  //Parcours la liste des ennemis
  //si pas d'obstacle et si dans l'axe de tir alors
  //lvl.enemies[i].life -= 50;
  //cf la fonction drawEnemies, on ne prend que les ennemis visibles.
  // Note pour éviter de se prendre la tête à savoir si l'ennemi est "tirable"
  // on va faire le calcul dans drawEnnemies, on aura une image de retard
  // mais ça devrait pas être trop grave et surtout on évitera de faire des calculs en double.
  //En gros si sa largeur croise le milieu de l'écran c'est bon.
  //Note on devrait enregister quelque part la position de l'ennemi à l'écran
  //pour ce genre de calculs
  for (var i = 0 ; i < lvl.enemies.length ; i++)
  {
    if (lvl.enemies[i].shootable)
    {
      lvl.enemies[i].life -= weapons_data.weapons[current_weapon-1].damage;
      if ( lvl.enemies[i].life > 0)
        playSoundLocalized("enemy_hit",i);
    }
    
    if (lvl.enemies[i].life <= 0 && lvl.enemies[i].status != "death" && lvl.enemies[i].status != "dead")
    {
      //il est mort, on lance l'animation de mort
      lvl.enemies[i].status = "death";
      lvl.enemies[i].animation_step = -1;  
      lvl.enemies[i].walking = false;
      playSound("enemy_killed");
    }
  }
}

//bah oui dessinons l'arme
function drawWeapons()
{
  if ( (previous_weapon != current_weapon) || typeof weapon_image == "undefined")
  { 
    weapon_image = weapons_tex_list[current_weapon];
    previous_weapon = current_weapon;
  }
  
  var maintenant = Date.now();
  /*
  var decalage_x = 0;
  var decalage_y = 0;
  if (time_before_pistol_animation_end <= 0)
    decalage_y = 0;
  else if (time_before_pistol_animation_end > 300)
     decalage_y = (time_before_pistol_animation_end-400)/4;
  else if (time_before_pistol_animation_end > 200)
     decalage_y = -(time_before_pistol_animation_end-400+100)/4;
  else if (time_before_pistol_animation_end < 100)
     decalage_y = (time_before_pistol_animation_end-400+300)/4;
  
  //l'image a deux éléments, repos et tire, chacun fait 64*64
  //si time_before_animation_end > 100 alors animation de tire
  // 50 premiers on monte, le reste on descend
  //si time_before_animation_end < 100 alors image de repos 
  if (time_before_pistol_animation_end > 150)
    decalage_x = 64;
  ctx.drawImage(weapon_image, 0 + decalage_x, 0, 63, weapon_image.height, canvas.width/2 - 64, canvas.height - 103 + decalage_y , 128,weapon_image.height*2);
  if (time_before_pistol_animation_end > 0 )
  {
    time_before_pistol_animation_end -= (maintenant - time_last_pistol_shot);
    time_last_pistol_shot = maintenant;
    if (time_before_pistol_animation_end < 0)
    {  
      time_before_pistol_animation_end = 0;
      //player_fire = false;
    }
  }
  */
  
  /*rewrite*/
  var decalage_x = 0;
  var decalage_y = 0;
  if (time_before_pistol_animation_end > 0 )
    time_before_pistol_animation_end = weapons_data.weapons[current_weapon-1].animation_length - (maintenant - time_last_pistol_shot);
 
  if ((time_before_pistol_animation_end > 0) && (maintenant - time_weapon_animation_step_start) >= weapons_data.weapons[current_weapon-1].animation[weapon_animation_step].length)
  {
    //On vérifie s'il y a une étape supplémentaire
    if (typeof weapons_data.weapons[current_weapon-1].animation[weapon_animation_step+1] != "undefined")
    {
      weapon_animation_step++;
      time_weapon_animation_step_start = maintenant;
    }
    else
    {
      weapon_animation_step = -1;
      time_before_pistol_animation_end = -1;
    }
  }
  //weapons_data.weapons[current_weapon-1].animation[weapon_animation_step].length
  
  if (time_before_pistol_animation_end <= 0)
  {
    weapon_animation_step = -1;
    decalage_x = weapons_data.weapons[current_weapon-1].rest_position.shift_x;
    decalage_y = weapons_data.weapons[current_weapon-1].rest_position.shift_y;
  }
  else
  {
    decalage_x = weapons_data.weapons[current_weapon-1].animation[weapon_animation_step].shift_x;
    decalage_y = weapons_data.weapons[current_weapon-1].animation[weapon_animation_step].shift_y;
  }
  
  //on enlève le 103 il est dans le fichier json
  /*console.log("drawWeapons: "+
      "\n\tweapon animation step: "+
        weapon_animation_step +
      "\n\ttime_before_pistol_animation_end: " +        
        time_before_pistol_animation_end +
      "\n\tdecalage_x: "  +
        decalage_x+    
      "\n\tdecalage_y: " +
        decalage_y+  
      "\n\ttime_weapon_animation_step_start: "+
        time_weapon_animation_step_start+
      "\n\tmaintenant - time_weapon_animation_step_start:"+
        (maintenant - time_weapon_animation_step_start)
        );*/
  ctx.drawImage(weapon_image, 0 + decalage_x, 0, 63, weapon_image.height, canvas.width/2 - (weapon_image.height* weapons_data.weapons[current_weapon-1].zoom)/2, canvas.height + decalage_y , 64 * weapons_data.weapons[current_weapon-1].zoom,weapon_image.height* weapons_data.weapons[current_weapon-1].zoom);

}

function handle_fire()
{
  //player_fire = true;
  //l'animation de tire dure 200ms.
  //limitons le nombre de tires par secondes à 5 par secondes
  if (ammo[current_weapon-1] >0)
  { 
    if (time_before_pistol_animation_end < weapons_data.weapons[current_weapon-1].delay_between_shot)
    {
      /*
      time_before_pistol_animation_end = 400;
      time_last_pistol_shot = Date.now();
      //on vérifie si notre tir a fait mouche
      check_enemies_hit();
      playSound("player_gun");*/
      time_before_pistol_animation_end = weapons_data.weapons[current_weapon-1].animation_length;
      time_last_pistol_shot = Date.now();
      weapon_animation_step = 0;
      time_weapon_animation_step_start = Date.now();
      //On enlève une balle à notre compteur
      ammo[current_weapon-1] -= 1;
      //on vérifie si notre tir a fait mouche
      check_enemies_hit();
      playSound(weapons_data.weapons[current_weapon-1].sound);
    }
  }
  else
    playSound("empty_gun");
}

/*après chargement de l'audio construction de la liste*/
function audioFinishedLoading(bufferList)
{
  // Create two sources and play them both together.
  //var source1 = contextAudio.createBufferSource();
  //var source2 = contextAudio.createBufferSource();
  //source1.buffer = bufferList[0];
  //source2.buffer = bufferList[1];

  //source1.connect(contextAudio.destination);
  // source2.connect(contextAudio.destination);
  // source1.start(6);
  //source2.start(0);
  
  //On ne lance la suite que lorsque le son est chargé
  window.addEventListener("keydown", keyDown,false);
  window.addEventListener("keyup", keyUp,false);
  
  //charge les données et textures des ennemis
  load_enemies('data/sprites/enemies_list.json');

  //charge les données et textures des armes
  load_weapons('data/sprites/weapons_list.json');
  
  //charge les données et textures des objets
  load_objects('data/sprites/objects_list.json');
  
  //On charge le niveau du document Json
  //loadLevel("http://localhost:8000/data/levels/lvl_1.json");
  //On attend que l'audio soit prêt:

  loadLevel(lvl_list[lvl_index]);
  playSound("bgm");

}

//joue un son du audioBufferLoader
function playSound(mysound)
{
  var source = contextAudio.createBufferSource();
  var gainNode = contextAudio.createGain();
  var my_sound_index = 0;
  var start = 0;
  var tune = 1.0;
  var gain = 0;
  var loop = false;
  switch (mysound)
  {
    case "payer_gun":
      my_sound_index = 0;
    break;
    case "enemy_gun":
      my_sound_index = 1;
      //tonalité qu'on fait varier, 1.0 == tonalité normale auquel on ajoute du random en plus ou moins
      tune = 1.0 + ((Math.random()/3) * (Math.random() < 0.5 ? -1 : 1));
    break;
    case "enemy_killed":
      my_sound_index = 2;
    break;
    case "player_hit":
      my_sound_index = 3;
      tune = 0.8;
      start = contextAudio.currentTime + 0.2;
    break;
    case "enemy_hit":
      my_sound_index = 4;
      start = contextAudio.currentTime + 0.2;
    break;
    case "you":
      my_sound_index = 5;
      start = contextAudio.currentTime + 0.5;
      tune = 1.0 + ((Math.random()/4) * (Math.random() < 0.75 ? -1 : 1));
    break;
    case "bgm":
      my_sound_index = 6;
      gain = 0.5;
      loop = true;
    break;
    case "player_shotgun":
      my_sound_index = 7;
    break;
    case "empty_gun":
      my_sound_index = 8;
    break;
    case "drink":
      gain = 1.5;
      my_sound_index = 9;
    break;
    case "clip":
      my_sound_index = 10;
    break;
    case "cartridge":
      my_sound_index = 11;
    break;
    case "door":
      my_sound_index = 12;
    break;
    case "switch":
      my_sound_index = 13;
    break;
    case "pling":
      my_sound_index = 14;
    break;
    default:
      my_sound_index = 0;
    break;
  }
  
  source.buffer = audioBufferLoader.bufferList[my_sound_index];
  if (gain != 0)
  {
    gainNode.gain.value = gain;
    source.connect(gainNode);
    gainNode.connect(contextAudio.destination);
  }
  else
    source.connect(contextAudio.destination);
  source.playbackRate.value = tune;
  source.loop = loop;
  source.start(start);
}

//joue un son du audioBufferLoader mais positionné dans l'espace
function playSoundLocalized(mysound, enemy_index)
{
  var source = contextAudio.createBufferSource();
  var my_sound_index = 0;
  var start = 0;
  var tune = 1.0;
  var loop = false;
  
  var panner = contextAudio.createPanner();
  
  switch (mysound)
  {
    case "player_gun":
      my_sound_index = 0;
    break;
    case "enemy_gun":
      my_sound_index = 1;
      //tonalité qu'on fait varier, 1.0 == tonalité normale auquel on ajoute du random en plus ou moins
      tune = 1.0 + ((Math.random()/3) * (Math.random() < 0.5 ? -1 : 1));
    break;
    case "enemy_killed":
      my_sound_index = 2;
    break;
    case "player_hit":
      my_sound_index = 3;
      tune = 0.8;
      start = contextAudio.currentTime + 0.2;
    break;
    case "enemy_hit":
      my_sound_index = 4;
      start = contextAudio.currentTime + 0.2;
    break;
    case "you":
      my_sound_index = 5;
      start = contextAudio.currentTime + 0.5;
      tune = 1.0 + ((Math.random()/4) * (Math.random() < 0.75 ? -1 : 1));
    break;
    case "bgm":
      my_sound_index = 6;
      loop = true;
    break;
    case "player_shotgun":
      my_sound_index = 7;
    break;
    case "empty_gun":
      my_sound_index = 8;
    break;
    case "drink":
      my_sound_index = 9;
    break;
    case "clip":
      my_sound_index = 10;
    break;
    case "cartridge":
      my_sound_index = 11;
    break;
    case "door":
      my_sound_index = 12;
    break;
    case "switch":
      my_sound_index = 13;
    break;
    case "pling":
      my_sound_index = 14;
    break;
    default:
      my_sound_index = 0;
    break;
  }
  
  panner.panningModel = 'HRTF';
  panner.distanceModel = 'inverse';
  panner.refDistance = 1;
  panner.maxDistance = 64;
  panner.rolloffFactor = 0.5;
  
  // On est toujours en 0,0,0 ? où est-ce qu'on passe notre position réelle ?
  //peut-être mieux ? l'API fera les calculs elle-même !
  contextAudio.listener.positionX.value = posx;
  contextAudio.listener.positionY.value = posy;
  contextAudio.listener.positionZ.value = 0;
  //  /*The forward properties represent the 3D coordinate position of the listener's forward direction (e.g. the direction they are facing in), while the up properties represent the 3D coordinate position of the top of the listener's head. These two together can nicely set the direction.*/
  //on a rotation qui est notre angle de vision
  //donc suffit de calculer x et y par rapport à cet angle et la position actuelle.
  contextAudio.listener.forwardX.value = posx + get_cos(rotation);
  contextAudio.listener.forwardY.value = posy + get_sin(rotation);
  contextAudio.listener.forwardZ.value = 0;
  //indique
  /*contextAudio.listener.upX.value = 0;
  contextAudio.listener.upY.value = 1;
  contextAudio.listener.upZ.value = 0;*/
  
  panner.setPosition(lvl.enemies[enemy_index].position.x, lvl.enemies[enemy_index].position.y, 0);

  // Convert angle into a unit vector. 
  //panner.setOrientation(Math.cos(angle), -Math.sin(angle), 1);
  
  source.buffer = audioBufferLoader.bufferList[my_sound_index];
  source.connect(panner);
  panner.connect(contextAudio.destination);
  source.playbackRate.value = tune;
  source.loop = loop;
  source.start(start);
}

function printMsg()
{
  var message = "";
  if (on_ending_point)
    message += "Maintain space to end level!";
  if (on_blue_point)
    message += " You need the blue key";
  if (on_yellow_point)
    message += " You need the yellow key";
  if (on_red_point)
    message += " You need the red key";
  
  ctx.font = "20px Courier New";
  ctx.fillStyle ="white"; 
  ctx.fillText(message, 10, 20);
}

/*
à partir des éléments du DOM construit une liste pour récupérer rapidement
le contenu de la texture.
*/
function build_textures_list(textures_data, tex_list)
{
  //textures_list
  for (var i = 0; i< textures_data.textures.length; i++)
  {
    tex_list[textures_data.textures[i].value] = document.getElementById(textures_data.textures[i].id);
  }
  console.log("wall textures list built");
}

function build_enemy_textures_list(textures_data, tex_list)
{
  //textures_list
  for (var i = 0; i< textures_data.enemies.length; i++)
  {
    tex_list[textures_data.enemies[i].id] = document.getElementById(textures_data.enemies[i].id);
  }
  console.log("enemies list built");
}

function build_object_textures_list(textures_data, tex_list)
{
  //textures_list
  for (var i = 0; i< textures_data.objects.length; i++)
  {
    tex_list[textures_data.objects[i].id] = document.getElementById(textures_data.objects[i].id);
  }
  console.log("objects list built");
}

function build_weapon_textures_list(textures_data, tex_list)
{
  //textures_list
  for (var i = 0; i< textures_data.weapons.length; i++)
  {
    tex_list[textures_data.weapons[i].value] = document.getElementById(textures_data.weapons[i].id);
  }
  console.log("weapons list built");
}

function ajustGameSpeed()
{
  //compute the new fps
  var maintenant = Date.now();
  fps = Math.round((1/(maintenant - time_of_last_image)) * 1000);
  move_UpDown_unity_sa = move_UpDown_unity * (60/fps);
  move_LeftRight_unity_sa = move_LeftRight_unity * (60/fps);
  move_UpDown_unity_enemy_sa = move_UpDown_unity_enemy * (60/fps);
  time_of_last_image = maintenant;
}