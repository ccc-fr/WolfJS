lvl_data='{  "walls" : ['+
    '[1, 1, 1, 1, 1, 1, 1, 1, 1, 3],'+
    '[3, 0, 0, 0, 0, 3, 0, 0, 4, 2],'+
    '[3, 0, 2, 0, 0, 0, 0, 0, 0, 2],'+
    '[3, 0, 0, 0, 0, 0, 0, 0, 0, 2],'+
    '[3, 0, 0, 0, 3, 3, 0, 0, 0, 2],'+
    '[3, 1, 0, 0, 3, 3, 0, 0, 4, 2],'+
    '[3, 0, 0, 0, 0, 0, 0, 0, 0, 2],'+
    '[3, 0, 2, 0, 0, 0, 0, 2, 0, 2],'+
    '[3, 0, 0, 0, 0, 2, 0, 0, 0, 2],'+
    '[2, 4, 4, 4, 4, 4, 4, 4, 4, 1]'+
  '],'+
  '"start" : [4,4],'+
  '"end" : [8,8],'+
  '"pov" : 60,'+
  '"rotation": 4.6,'+
  '"constanteHWall": 3,'+
  '"invert": true'+
'}';

//On attend que le DOM soit chargé avant de tout lancer
document.addEventListener('DOMContentLoaded',  domLoaded, false);

function domLoaded()
{
  //Ces deux là en variable globale car ils vont être utilisés partout
  canvas = document.getElementById("MapCanvas");
  ctx = canvas.getContext("2d");
  
  canevas_tex = document.getElementById('preview_tex_canvas');
  ctx_tex = canevas_tex.getContext('2d');
  
  canevas_enemy = document.getElementById('preview_enemy_canvas');
  ctx_enemy = canevas_enemy.getContext('2d');
  
  canvas_object = document.getElementById('preview_object_canvas');
  ctx_object = canvas_object.getContext('2d');
    
  lvl = {};
  lvl.start = [];
  lvl.end = [];
  lvl.enemies = [];
  lvl.objects = [];
  lvl.doors = [];
  lvl.pov = 60;
  lvl.rotation = 4.6;
  lvl.constanteHWall = 3;
  $("#input_pov").val(lvl.pov);
  $("#input_rotation").val(lvl.rotation);
  $("#input_constanteHWall").val(lvl.constanteHWall);
  walls = [];
  textures_data = {};
  enemies_data = {};
  current_texture = 0;
  current_enemy = -1;
  current_door = -1;
  b_next_is_start = false;
  b_next_is_end = false;
  b_next_is_enemy = false;
  b_next_is_object = false;
  b_select_mode = false;
  b_erase_mode = false;
  b_wall_mode = false;
  b_enemy_mode = false;
  b_enemy_path_mode = false;
  b_object_mode = false;
  b_next_is_door = false;
  b_next_is_door_opening = false;
  b_next_is_door_trigger_text_pos = false;
  
  draw_checkboard();
  canvas.addEventListener('click', domClicked, false);
  $("#select_up").change(build_texture);
  $("#select_right").change(build_texture);
  $("#select_down").change(build_texture);
  $("#select_left").change(build_texture);
  $("#input_pov").change(update_settings);
  $("#input_rotation").change(update_settings);
  $("#input_constanteHWall").change(update_settings);
  $("#select_enemy").change(build_enemy);
  $("#select_object").change(build_object);
  $("#select_door_type").change(update_door_type);
  load_textures('data/textures/textures_list.json');
  load_enemies('data/sprites/enemies_list.json');
  load_objects('data/sprites/objects_list.json');
  update_state_display();
}

function draw_checkboard()
{
  /* la map fait max 64*64
  le canvas fait 768*768
  donc chaque case fait 12*12
  2 pixels de bords
  On profite aussi de cette fonction pour initialiser l'array walls
  */
  ctx.strokeStyle = "black";
  ctx.lineWidth = 2;
  walls[0] = [];
  for (var j=0; j < 64; j++)
      walls[0][j] = 0;
  for (var i = 1; i < 64; i++)
  {
    ctx.beginPath();
    ctx.moveTo(i*12,1);
    ctx.lineTo(i*12,767);
    ctx.stroke();
    ctx.moveTo(1,i*12);
    ctx.lineTo(767,i*12);
    ctx.stroke();
    walls[i] = [];
    for (var j=0; j < 64; j++)
      walls[i][j] = 0;
  }
}

function load_example()
{
  load_level_from_string(lvl_data, true);
}

function load_level_from_string(lvl_string, invert_data)
{
  lvl = JSON.parse(lvl_string);
  //  walls = [];
  //on inverse les X et les Y pour être dans le bon sens
  // à corriger, à partir du moment où on a un éditeur on devrait plus avoir à faire ça
  if (invert_data)
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
  //walls est dans le bon sens, youpi
  //s'il n'y a pas d'enemies on initialise à vide la liste des enemies.
  if (!lvl.enemies)
    lvl.enemies = [];
  if (!lvl.objects)
    lvl.objects = [];
  if (!lvl.doors)
    lvl.doors = [];
  draw_level();
}

function draw_level()
{
  for (i= 0 ; i< walls.length ; i++)
  {
    for( j = 0 ; j < walls[i].length ; j++)
    {
      draw_texture(i,j,i*12+1,j*12+1,10);
    }
  }
  //On peint le point de départ aussi, s'il y en a un
  if (typeof lvl.start != "undefined" && lvl.start.length > 0)
    paint_cell(lvl.start[0], lvl.start[1], 10, "green");
  //On peint le point de départ aussi, s'il y en a un
  if (typeof lvl.end != "undefined" && lvl.end.length > 0)
    paint_cell(lvl.end[0], lvl.end[1], 10, "red");
  //On print les ennemis
  for (i = 0; i < lvl.enemies.length ; i++)
  {
    paint_enemy(Math.floor(lvl.enemies[i].position.x), Math.floor(lvl.enemies[i].position.y), lvl.enemies[i].id);
    if ( current_enemy == i && lvl.enemies[i].path != undefined)
    {
      //A faire : ne dessiner que pour l'ennemi sélectionné, sinon on va rien voir !
      for (var j = 0; j < lvl.enemies[i].path.length ; j++)
      {  
        paint_enemy_path( lvl.enemies[i].path[j].arrow, lvl.enemies[i].path[j].position.x, lvl.enemies[i].path[j].position.y);
      }
    }
  }
  //On print les objets
  for (i = 0; i < lvl.objects.length ; i++)
  {
    paint_object(Math.floor(lvl.objects[i].position.x), Math.floor(lvl.objects[i].position.y), lvl.objects[i].id);
  }
  //On print les portes
  for (i = 0; i < lvl.doors.length ; i++)
  {
    paint_door(lvl.doors[i]);
  }

}

//gestion des clicks sur le canvas du quadrillage
function domClicked(event)
{
  //il y a un problème avec cette méthode si on utilise l'ascenseur !
  //on est décalé d'autant que l'ascenseur s'est déplacé.
  var mousePos = { 
    x: event.clientX - canvas.offsetTop,
    y: event.clientY - canvas.offsetLeft
  } ;
  //alert("posx:"+mousePos.x+"; posY:"+mousePos.y);
  //On change la couleur de la case clickée
  var cell = {
    x: Math.floor(mousePos.x/12),
    y: Math.floor(mousePos.y/12)
  }
  
  if (b_select_mode || b_erase_mode)
  {
    //Dans le select mode on recherche ce qu'il y a sous la case pointée
    //Y'a t'il un mur ?
    if ( walls[cell.x][cell.y] != 0)
    {
      if(b_select_mode)
        select_texture(walls[cell.x][cell.y]);
      if(b_erase_mode)
      {
        walls[cell.x][cell.y] = 0;
        draw_level();
      }
      //return;
    }
    else
    {
      //On recherche si un ennemi est présent sur la case
      for (var i =0; i < lvl.enemies.length; i++)
      {
        if (Math.floor(lvl.enemies[i].position.x) == cell.x && Math.floor(lvl.enemies[i].position.y) == cell.y)
        {
          if (b_select_mode)
          {
            $("#current_enemy_pos_disp").text("X:"+lvl.enemies[i].position.x +"| Y:"+lvl.enemies[i].position.y);
            $("#select_enemy option[data-id="+lvl.enemies[i].id+"]").val();
            $("#select_enemy").val($("#select_enemy option[data-id="+lvl.enemies[i].id+"]").val());
            //val ne trigg pas le changement, on le fait à la main pour rafrachir
            $("#select_enemy").trigger("change");
            $("#input_enemy_rotation").val(lvl.enemies[i].rotation);
            current_enemy = i;
            //permet d'afficher les flèches de l'ennemi sélectionné => bourrin car on redessine tout !
            draw_level();
          }
          if (b_erase_mode)
          {
            lvl.enemies.splice(i,1);
            draw_level();
          }
          return;
        }
      }
       //On recherche si un object est présent sur la case
      for (var i =0; i < lvl.objects.length; i++)
      {
        if (Math.floor(lvl.objects[i].position.x) == cell.x && Math.floor(lvl.objects[i].position.y) == cell.y)
        {
          if (b_select_mode)
          {
            $("#select_object option[data-id="+lvl.objects[i].id+"]").val();
            $("#select_object").val($("#select_object option[data-id="+lvl.objects[i].id+"]").val());
            //val ne trigg pas le changement, on le fait à la main pour rafrachir
            $("#select_object").trigger("change");
            current_enemy = i;
            //permet d'afficher les flèches de l'ennemi sélectionné => bourrin car on redessine tout !
            draw_level();
          }
          if (b_erase_mode)
          {
            lvl.objects.splice(i,1);
            draw_level();
          }
          return;
        }
      }
      
      //On recherche si une porte est présente sur la carte
      for (var i =0; i < lvl.doors.length; i++)
      {
        if (lvl.doors[i].x == cell.x && lvl.doors[i].y == cell.y)
        {
          if (b_select_mode)
          {
            $("#current_door_pos_disp").text("x: "+lvl.door[i].x+" / y: " + lvl.door[i].y);
            if (typeof lvl.door[i].position != "undefined")
                $("#current_door_opening_pos_disp").text("x: "+lvl.door[i].position.x+" / y: " + lvl.door[i].position.y);
            if (typeof lvl.door[i].trigger != "undefined")
            {
              $("#current_door_texture_text_value_disp").text("x: "+lvl.door[i].trigger.x+" / y: " + lvl.door[i].trigger.y);
              if (typeof lvl.door[i].trigger.texture != "undefined")
                current_door_trigger_pos
              $("#current_door_trigger_pos").text(lvl.door[i].trigger.texture);
            }

            current_door = i;
            $("#current_door_index").text(current_door);
            //permet d'afficher les flèches de l'ennemi sélectionné => bourrin car on redessine tout !
            draw_level();
          }
          if (b_erase_mode)
          {
            lvl.doors.splice(i,1);
            draw_level();
          }
          return;
        }
      }
      
    }
  }
  else
  {
    if (!b_next_is_start && !b_next_is_end && !b_next_is_enemy && !b_next_is_object && !b_next_is_door && !b_next_is_door_opening && !b_next_is_door_trigger_text_pos)
    {
      walls[cell.x][cell.y] = current_texture;
      //draw_level();
      draw_texture(cell.x,cell.y,cell.x*12+1, cell.y*12+1,10);
    }
    if (b_next_is_start)
    {
      //Note : il faudrait effacer le précédent point de départ
      // on le peint en blanc...
      if (typeof lvl.start != "undefined" && lvl.start.length > 0)
        paint_cell(lvl.start[0], lvl.start[1], 10, "white");
      lvl.start = [cell.x,cell.y];
      paint_cell(cell.x, cell.y, 10, "green");
      b_next_is_start = false;
    }
    if (b_next_is_end)
    {
      //Note : il faudrait effacer le précédent point de départ
      // on le peint en blanc...
      if (typeof lvl.end != "undefined" && lvl.end.length > 0)
        paint_cell(lvl.end[0], lvl.end[1], 10, "white");
      lvl.end = [cell.x,cell.y];
      paint_cell(cell.x, cell.y, 10, "red");
      b_next_is_end = false;
    }
    if (b_next_is_enemy)
    {
      if (!b_enemy_path_mode)
      {
        //Récupération info ennemi courant
        var index_enemy = $('#select_enemy option:selected').val();
        paint_enemy(cell.x,cell.y, enemies_data.enemies[index_enemy-1].id);
        lvl.enemies.push({"position":{"x":cell.x+0.5,"y":cell.y+0.5}, "id":enemies_data.enemies[index_enemy-1].id, "rotation":$("#input_enemy_rotation").val()});
        b_next_is_enemy = false;
      }
      else
      {
        //si pas d'ennemi sélectionné on ne fait rien !
        if (current_enemy != -1)
        {
          ctx.font = "15px Arial bold";
          ctx.fillStyle ="black"; 
          ctx.fillText($("#current_selected_direction").val(),1+cell.x*12,11+cell.y*12);
          //On ajoute la flèche au joueur sélectionné
          var path = [];
          if ( lvl.enemies[current_enemy].path == undefined)
            lvl.enemies[current_enemy].path = path;
          lvl.enemies[current_enemy].path.push({"position":{"x":cell.x, "y":cell.y}, "arrow": $("#current_selected_direction").val()});
        }
        else
        {
          alert("please select an enemy first");
        }
      }
    }
    if (b_next_is_object)
    {
      //Récupération info ennemi courant
      var index_object = $('#select_object option:selected').val();
      paint_object(cell.x,cell.y, objects_data.objects[index_object-1].id);
      lvl.objects.push({"position":{"x":cell.x+0.5,"y":cell.y+0.5}, "id":objects_data.objects[index_object-1].id});
    }
    if (b_next_is_door)
    {
      if (current_door == -1)
        current_door = lvl.doors.length; //on rempli le prochain élément de la liste
      if (typeof lvl.doors[current_door] == "undefined")
        lvl.doors[current_door] = {};
      lvl.doors[current_door].x = cell.x;
      lvl.doors[current_door].y = cell.y;
      paint_door(lvl.doors[current_door]);
      $("#current_door_pos_disp").text("x: "+lvl.doors[current_door].x+" / y: " + lvl.doors[current_door].y);
      $("#current_door_index").text(current_door);
    }
    if (b_next_is_door_opening)
    {
      if (current_door != -1 && typeof lvl.doors[current_door].x != "undefined")
      {
        if (typeof lvl.doors[current_door].position == "undefined")
          lvl.doors[current_door].position = {};
        lvl.doors[current_door].position.x = cell.x;
        lvl.doors[current_door].position.y = cell.y;
        paint_door(lvl.doors[current_door]);
        $("#current_door_opening_pos_disp").text("x: "+lvl.doors[current_door].position.x+" / y: " + lvl.doors[current_door].position.y);
        $("#current_door_index").text(current_door);
      }
    }
    if (b_next_is_door_trigger_text_pos )
    {
      //dans l'idéal on commence pas par là!
      if (current_door != -1 && typeof lvl.doors[current_door].x != "undefined")
      {
        if (typeof lvl.doors[current_door].trigger == "undefined")
          lvl.doors[current_door].trigger = {};
        lvl.doors[current_door].trigger.x = cell.x;
        lvl.doors[current_door].trigger.y = cell.y;
        paint_door(lvl.doors[current_door]);
        $("#current_door_texture_text_value_disp").text("x: "+lvl.doors[current_door].trigger.x+" / y: " + lvl.doors[current_door].trigger.y);
        $("#current_door_index").text(current_door);
      }
    }
  }
  
}

//Export le json et le copie dans le textarea de la page
function export_level()
{
  var my_level = {};
  my_level.walls = walls;
  my_level.start = lvl.start;
  my_level.end = lvl.end;
  my_level.pov = lvl.pov;
  my_level.rotation = lvl.rotation;
  my_level.constanteHWall = lvl.constanteHWall;
  my_level.enemies = lvl.enemies;
  my_level.objects = lvl.objects;
  my_level.doors = lvl.doors;
  var json_level = JSON.stringify(my_level);
  $("#generated_level_data").val(json_level);
}

//import le niveau à partir du texte contenu dans le textarea
function import_level_from_txt_area()
{
  var tmp_level_data = $("#generated_level_data").val();
  if ( tmp_level_data != "")
    load_level_from_string(tmp_level_data, false);
  else
    alert("No import : Empty !");
}

//"charge" les textures et construit les selectbox.
function load_textures(textures_json_path)
{
  console.log("chargement textures");
  $.getJSON(textures_json_path, function (textures_json)
  {
    debugger;
    console.log("toto");
    textures_data = textures_json;
    var option_html="<option value='0'>Vide</option>";
    //On build les options des selectbox
    for (var i=0; i < textures_data.textures.length ;i++)
    {
      option_html = option_html + "<option data-id="+textures_data.textures[i].id+" value="+ textures_data.textures[i].value+">"+ textures_data.textures[i].name+"</option>";
    }
    //liste construite, on ajoute les options
    $("#select_up").html(option_html);
    $("#select_left").html(option_html);
    $("#select_right").html(option_html);
    $("#select_down").html(option_html);
    
    
  }).fail( function(error) 
    {
      debugger;
      console.log("error:"+error);
    });
}


//charge les sprites et construit la select box
function load_enemies(enemies_json_path)
{
    console.log("chargement ennemies");
  $.getJSON(enemies_json_path, function (enemies_json)
  {
    debugger;
    console.log("titi");
    enemies_data = enemies_json;
    var option_html="<option value='0'>Vide</option>";
    //On build les options des selectbox
    for (var i=0; i < enemies_data.enemies.length ;i++)
    {
      option_html = option_html + "<option data-id="+enemies_data.enemies[i].id+" value="+ enemies_data.enemies[i].value+">"+ enemies_data.enemies[i].name+"</option>";
      var myImage = new Image();
      myImage.src =  enemies_data.enemies_path +  enemies_data.enemies[i].file;
      myImage.style = "display:none;";
      myImage.id = enemies_data.enemies[i].id;
      document.body.appendChild(myImage);
    }
    //liste construite, on ajoute les options
    $("#select_enemy").html(option_html);
    
  }).fail( function(error) 
    {
      debugger;
      console.log("error ennemies:"+error);
    });
}

//charge les sprites et construit la select box
function load_objects(objects_json_path)
{
    console.log("chargement ennemies");
  $.getJSON(objects_json_path, function (objects_json)
  {
    debugger;
    console.log("truc");
    objects_data = objects_json;
    var option_html="<option value='0'>Vide</option>";
    //On build les options des selectbox
    for (var i=0; i < objects_data.objects.length ;i++)
    {
      option_html = option_html + "<option data-id="+objects_data.objects[i].id+" value="+ objects_data.objects[i].value+">"+ objects_data.objects[i].name+"</option>";
      var myImage = new Image();
      myImage.src =  objects_data.objects_path +  objects_data.objects[i].file;
      myImage.style = "display:none;";
      myImage.id = objects_data.objects[i].id;
      document.body.appendChild(myImage);
    }
    //liste construite, on ajoute les options
    $("#select_object").html(option_html);
    
  }).fail( function(error) 
    {
      debugger;
      console.log("error ennemies:"+error);
    });
}

//copie la texture du select up dans les 3 autres boites
function copy_texture()
{
  //haut
  var current_texture = parseInt($("#select_up").val());
  //droite
  $("#select_right").val(current_texture);
  //bas
  $("#select_down").val(current_texture);
  //gauche
  $("#select_left").val(current_texture);
  build_texture();
}
  
//charge la texture en paramètre dans l'editeur et les 4 select box  
function select_texture(texture_to_load)
{
  $("#select_up").val((parseInt(texture_to_load,10) & 255) );
  $("#select_right").val((parseInt(texture_to_load,10) & 65280) >> 8);
  $("#select_down").val((parseInt(texture_to_load,10) & 16711680) >> 16);
  $("#select_left").val((parseInt(texture_to_load,10) & 4278190080) >> 24);
  build_texture();
}

//Construit la texture à partir des 4 textures choisies
function build_texture()
{
  /* On a le droit à 255 textures différentes en tout, la valeur est l'id
  * la valeur est un entier de 32 bits.
  * les 8 premiers bits sont la textures du haut
  * les 8 suivants la texture de droite
  * les 8 derniers la texture du bas
  * les 8 derniers la texture de gauche
  */
  //haut
  current_texture = parseInt($("#select_up").val(),10);
  //droite
  current_texture += (parseInt($("#select_right").val(),10) << 8);
  //bas
  current_texture += (parseInt($("#select_down").val(),10) << 16);
  //gauche
  current_texture += (parseInt($("#select_left").val(),10) << 24);
  $("#current_texture_value_disp").text(current_texture);
  //dessin de la texture dans le canvas preview_tex_canvas
  if (current_texture != 0)
  {
    //haut
    ctx_tex.beginPath();
    ctx_tex.moveTo(32, 32);
    ctx_tex.lineTo(0, 0);
    ctx_tex.lineTo(64, 0);
    var img = document.getElementById($('#select_up option:selected').attr('data-id'));
    if (img != null)
    {
      var pat=ctx_tex.createPattern(img,"no-repeat");
      ctx_tex.fillStyle=pat;
      ctx_tex.fill();
    }
    else
    {
      ctx_tex.fillStyle="white";
      ctx_tex.fill();
    }
    
    //droite
    ctx_tex.beginPath();
    ctx_tex.moveTo(32, 32);
    ctx_tex.lineTo(64, 0);
    ctx_tex.lineTo(64, 64);
    var img = document.getElementById($('#select_right option:selected').attr('data-id'));
    if (img != null)
    {
      var pat=ctx_tex.createPattern(img,"no-repeat");
      ctx_tex.fillStyle=pat;
      ctx_tex.fill();
    }
    else
    {
      ctx_tex.fillStyle="white";
      ctx_tex.fill();
    }
    //bas
    ctx_tex.beginPath();
    ctx_tex.moveTo(32, 32);
    ctx_tex.lineTo(0, 64);
    ctx_tex.lineTo(64, 64);
    var img = document.getElementById($('#select_down option:selected').attr('data-id'));
    if (img != null)
    {
      var pat=ctx_tex.createPattern(img,"no-repeat");
      ctx_tex.fillStyle=pat;
      ctx_tex.fill();
    }
    else
    {
      ctx_tex.fillStyle="white";
      ctx_tex.fill();
    }
    //gauche
    ctx_tex.beginPath();
    ctx_tex.moveTo(32, 32);
    ctx_tex.lineTo(0, 0);
    ctx_tex.lineTo(0, 64);
    var img = document.getElementById($('#select_left option:selected').attr('data-id'));
   if (img != null)
    {
      var pat=ctx_tex.createPattern(img,"no-repeat");
      ctx_tex.fillStyle=pat;
      ctx_tex.fill();
    }
    else
    {
      ctx_tex.fillStyle="white";
      ctx_tex.fill()
    }
  }
  else
  {
    ctx_tex.fillStyle="white";
    ctx_tex.fill();
  }
}
/*Valeur pour les bitsmasks
* haut   : (x & 255)
* droite : (x & 65280) >> 8
* bas    : (x & 16711680) >> 16
* gauche : (x & 4278190080) >> 24
* pour récupérer l'identifiant par rapport au json textures_data:
* var mon_id = $(textures_data.textures).filter(function (i,n){return n.value===5})[0].id;
*/

/*affiche la texture de l'ennemi sélectionné dans le canvas preview_enemy_canvas*/
function build_enemy()
{
  var img = document.getElementById($('#select_enemy option:selected').attr('data-id'));
  ctx_enemy.clearRect(0, 0, canevas_enemy.width, canevas_enemy.height);
  ctx_enemy.drawImage (img, 0, 0);    
}

/*affiche la texture de l'objet sélectionné dans le canvas preview_object_canvas*/
function build_object()
{
  var img = document.getElementById($('#select_object option:selected').attr('data-id'));
  ctx_object.clearRect(0, 0, canvas_object.width, canvas_object.height);
  ctx_object.drawImage (img, 0, 0);    
}

//Construit la texture à partir des 4 textures choisies
function draw_texture(cellx,celly,x,y,width)
{
  var value_texture = 0;
  var id_texture = 0;
  var array_texture = [];
  //haut
  value_texture = (walls[cellx][celly] & 255);
  array_texture = $(textures_data.textures).filter(function (i,n){return n.value===value_texture});
  if (array_texture.length > 0)
    id_texture = array_texture[0].id;
  else
    id_texture = 0;
  ctx.beginPath();
  ctx.moveTo(x+(width/2), y+(width/2));
  ctx.lineTo(x, y);
  ctx.lineTo(x+width, y);
  var img = document.getElementById(id_texture);
  if (img != null)
  {
    var pat=ctx.createPattern(img,"repeat");
    ctx.fillStyle=pat;
    
  }
  else
  {
    ctx.closePath();
//    ctx.stroke();
    ctx.fillStyle="white";
  }
  ctx.fill();
  
  //droite
  value_texture = (walls[cellx][celly] & 65280) >> 8;
  array_texture = $(textures_data.textures).filter(function (i,n){return n.value===value_texture});
  if (array_texture.length > 0)
    id_texture = array_texture[0].id;
  else
    id_texture = 0;
  ctx.beginPath();  
  ctx.moveTo(x+(width/2), y+(width/2));
  ctx.lineTo(x+width, y);
  ctx.lineTo(x+width, y+width);
  var img = document.getElementById(id_texture);
  if (img != null)
  {
    var pat=ctx.createPattern(img,"repeat");
    ctx.fillStyle=pat;
    
  }
  else
  {
    ctx.closePath();
//    ctx.stroke();
    ctx.fillStyle="white";
  }
  ctx.fill();
  
  //bas
  value_texture = (walls[cellx][celly] & 16711680) >> 16;
  array_texture = $(textures_data.textures).filter(function (i,n){return n.value===value_texture});
  if (array_texture.length > 0)
    id_texture = array_texture[0].id;
  else
    id_texture = 0;
  ctx.beginPath();  
  ctx.moveTo(x+(width/2), y+(width/2));
  ctx.lineTo(x,  y+width);
  ctx.lineTo(x+width, y+width);
  var img = document.getElementById(id_texture);
  if (img != null)
  {
    var pat=ctx.createPattern(img,"repeat");
    ctx.fillStyle=pat;
    
  }
  else
  {
    ctx.closePath();
//    ctx.stroke();
    ctx.fillStyle="white";
  }
  ctx.fill();
  
  //gauche
  value_texture = (walls[cellx][celly] & 4278190080) >> 24;
  array_texture = $(textures_data.textures).filter(function (i,n){return n.value===value_texture});
  if (array_texture.length > 0)
    id_texture = array_texture[0].id;
  else
    id_texture = 0;
  ctx.beginPath();  
  ctx.moveTo(x+(width/2), y+(width/2));
  ctx.lineTo(x,  y);
  ctx.lineTo(x, y+width);
  var img = document.getElementById(id_texture);
  if (img != null)
  {
    var pat=ctx.createPattern(img,"repeat");
    ctx.fillStyle=pat;
    
  }
  else
  {
    ctx.closePath();
//    ctx.stroke();
    ctx.fillStyle="white";
  }
  ctx.fill();
}
 
//peint la cellule d'une couleur unie color
function paint_cell(x,y,width,color)
{
  ctx.fillStyle = color;
  ctx.fillRect(x*12+1,y*12+1,width,width);
}

//peint la cellule avec un enemy, 
function paint_enemy(x,y,id_enemy)
{
  var img = document.getElementById(id_enemy);
  //on fait ça pour clear la case
  paint_cell(x,y,10,"white");
  ctx.drawImage (img,0,0,64,64, x*12+1, y*12+1, 10,10);  
}

//peint la cellule avec un enemy, 
function paint_object(x,y,id_object)
{
  var img = document.getElementById(id_object);
  //on fait ça pour clear la case
  paint_cell(x,y,10,"white");
  ctx.drawImage (img,0,0,64,64, x*12+1, y*12+1, 10,10);  
}

//dessine une flèche de pattern d'ennemi
function paint_enemy_path(arrow, x, y)
{
  ctx.font = "15px Arial bold";
  ctx.fillStyle ="black"; 
  ctx.fillText(arrow,1+x*12,11+y*12);
}

//peint la porte et sa position pour l'ouverture
function paint_door(door)
{
  //on fait un cadre orange autour de la position
  //et un cyan autour de la porte elle même
  //et un magenta autour du trigger
  //le format ?
  /*
  Door[x][y] => la position où on peut activer a porte, c'est ce qu'on passe en paramètre
  Door[x][y].position => .x et .y position de la porte à ouvrir, où mettre wall à 0.
  Door[x][y].trigger.texture => valeur de la texture de remplacement pour le trigger
  Door[x][y].trigger.x/y => .x et .y si different de position d'activation alors on fait un trigger !
  Door[x][y].old_texture => ajouté par la suite pour fermer la porte au cas où dans wall
  Door[x][y].trigger.old_texture
  Trigger pas obligatoire
  */
  ctx.strokeStyle = "orange";
  ctx.strokeRect(door.x*12+2, door.y*12+2, 9, 9);
  if (typeof door.position != "undefined")
  {
    ctx.strokeStyle = "cyan";
    ctx.strokeRect(door.position.x*12+2, door.position.y*12+2, 9, 9);
  }
  if (typeof door.trigger != "undefined")
  {
    ctx.strokeStyle = "magenta";
    ctx.strokeRect(door.trigger.x*12+2, door.trigger.y*12+2, 9, 9);
  }
}

//indique que la prochaine case à mettre est la position de départ.
function next_is_start()
{
  //On ne doit les avoir ensembles à true;
  reset_b_states();
  b_next_is_start = true;
  update_state_display();
}

//indique que la prochaine case à mettre est la position de départ.
function next_is_end()
{
  //On ne doit les avoir ensembles à true;
  reset_b_states();
  b_next_is_end = true;
  update_state_display();
}

//prochain clic dans le dom sera un positionnement d'enemi
function next_is_enemy()
{
 //On ne doit les avoir ensembles à true;
  reset_b_states();
  b_next_is_enemy = true;
  update_state_display();
}

//les prochaines cases seront le path de l'ennemi sélectionné en cours
function next_is_enemy_path()
{
  reset_b_states();
  b_next_is_enemy = true;
  b_enemy_path_mode = true; 
  update_state_display();
}

//prochain clic dans le dom sera un positionnement d'enemi
function next_is_object()
{
 //On ne doit les avoir ensembles à true;
  reset_b_states();
  b_next_is_object = true;
  update_state_display();
}

//prochain clic dans le dom sera un positionnement de porte
function next_is_door()
{
 //On ne doit pas les avoir ensembles à true;
  reset_b_states();
  b_next_is_door = true;
  update_state_display();
}

//prochain clic dans le dom sera un positionnement de déclencheur de porte
function next_is_door_opening()
{
 //On ne doit pas les avoir ensembles à true;
  reset_b_states();
  b_next_is_door_opening = true;
  update_state_display();
}

//prochain clic dans le dom sera un positionnement de texture du trigger de prote
function next_is_door_trigger()
{
 //On ne doit pas les avoir ensembles à true;
  reset_b_states();
  b_next_is_door_trigger_text_pos = true;
  update_state_display();
}

function reset_b_states()
{
  b_select_mode = false;
  b_erase_mode = false;
  b_wall_mode = false;
  b_next_is_start = false;
  b_next_is_end = false;
  b_next_is_enemy = false;
  b_enemy_path_mode = false; 
  b_next_is_object = false;
  b_next_is_door = false;
  b_next_is_door_opening = false;
  b_object_mode = false;
  b_next_is_door_trigger_text_pos = false;
}

function update_settings()
{
  lvl.pov = parseInt($("#input_pov").val(),10);
  lvl.rotation = Number($("#input_rotation").val());
  lvl.constanteHWall = Number($("#input_constanteHWall").val());
}

//Gestion des différents modes
//  b_select_mode = false;
//  b_erase_mode = false;
//  b_wall_mode = false;
//  b_enemy_mode = false;
//  b_enemy_path_mode = false;

//Select mode: permet de sélectionner la case et de retourner la texture ou l'ennemi qui s'y trouve
function select_mode()
{
  reset_b_states();
  b_select_mode = true;
  update_state_display();
}

//permet de supprimer le contenu d'une case, que ce soit un ennemi, un mur ou une case départ
function erase_mode()
{
  reset_b_states();
  b_erase_mode = true;
  update_state_display();
}

//mode pour ajoute des murs
function wall_mode()
{
  reset_b_states();
  b_wall_mode = true;
  update_state_display();
}

//mode pour ajouter des enemis
function enemy_mode()
{
  reset_b_states();
  b_enemy_mode = true;
  update_state_display();
}

//mode pour ajouter des objets
function object_mode()
{
  reset_b_states();
  b_object_mode = true;
  b_next_is_object = true;
  update_state_display();
}

//met à jour la direction qu'on va utiliser
function change_arrow_direction(evt)
{
  $("#current_selected_direction").val(evt.target.innerText);
  $("#current_selected_direction").text(evt.target.innerText);
}

//met à jour les indicateurs de mode
function update_state_display()
{
  $( "#disp_b_next_is_start" ).prop( "checked", b_next_is_start );
  $( "#disp_b_next_is_end" ).prop( "checked", b_next_is_end );
  $( "#disp_b_next_is_enemy" ).prop( "checked", b_next_is_enemy );
  $( "#disp_b_next_is_object" ).prop( "checked", b_next_is_object );
  $( "#disp_b_select_mode" ).prop( "checked", b_select_mode );
  $( "#disp_b_erase_mode" ).prop( "checked", b_erase_mode );
  $( "#disp_b_wall_mode" ).prop( "checked", b_wall_mode );
  $( "#disp_b_enemy_mode" ).prop( "checked", b_enemy_mode );
  $( "#disp_b_enemy_path_mode" ).prop( "checked", b_enemy_path_mode );
  $( "#disp_b_object_mode" ).prop( "checked", b_object_mode );
  $( "#disp_b_next_is_door" ).prop( "checked", b_next_is_door );
  $( "#disp_b_next_is_door_opening" ).prop( "checked", b_next_is_door_opening );
  $( "#disp_b_next_is_door_trigger_tex_position" ).prop( "checked", b_next_is_door_trigger_text_pos );
}

// On copie la valeur de la texture wall dans les infos de la porte
function push_texture_to_trigger()
{
  if( current_door != -1 && (typeof lvl.doors[current_door].trigger != "undefined"))
    lvl.doors[current_door].trigger.texture = current_texture;
  $("#current_door_texture_text_value_disp").text(current_texture);
}

// On copie la valeur de la texture wall dans les infos de la porte/mur qui apparait
function push_texture_to_wall_triggered()
{
  if( current_door != -1 && (typeof lvl.doors[current_door].x != "undefined"))
    lvl.doors[current_door].texture = current_texture;
  $("#current_door_wall_texture_text_value_disp").text(current_texture);
}

function inc_current_door()
{
  if (current_door < lvl.doors.length)
    current_door++; 
  $("#current_door_index").text(current_door);
  
  if (typeof lvl.doors[current_door] !="undefined" && typeof lvl.doors[current_door].trigger != "undefined" && typeof lvl.doors[current_door].trigger.texture !="undefined")
    $("#current_door_texture_text_value_disp").text(lvl.doors[current_door].trigger.texture);
  else
    $("#current_door_texture_text_value_disp").text("");
  
  if (typeof lvl.doors[current_door] !="undefined" && typeof lvl.doors[current_door].texture != "undefined")
    $("#current_door_wall_texture_text_value_disp").text(lvl.doors[current_door].texture);
  else
    $("#current_door_wall_texture_text_value_disp").text("");
}

function dec_current_door()
{
  if (current_door>0)
    current_door--; 
  $("#current_door_index").text(current_door);
  
  if (typeof lvl.doors[current_door] !="undefined" && typeof lvl.doors[current_door].trigger != "undefined" && typeof lvl.doors[current_door].trigger.texture !="undefined")
    $("#current_door_texture_text_value_disp").text(lvl.doors[current_door].trigger.texture);
  else
    $("#current_door_texture_text_value_disp").text("");
  
  if (typeof lvl.doors[current_door] !="undefined" && typeof lvl.doors[current_door].texture != "undefined")
    $("#current_door_wall_texture_text_value_disp").text(lvl.doors[current_door].texture);
  else
    $("#current_door_wall_texture_text_value_disp").text("");
}

function update_door_type()
{
  if( current_door != -1 && (typeof lvl.doors[current_door] != "undefined"))
    lvl.doors[current_door].type = $("#select_door_type").val();
}
