// Generated by CoffeeScript 1.3.1
var check_collisions, drop_bomb, explode, explosion_logic, extinguish, game_logic, game_started, init_game, objects, player_collision, players, set_explosion, set_upgrade, timer, walkover_logic;

players = new Array();

objects = new Array();

timer = null;

game_started = false;

init_game = function() {
  var c_index, object, r_index, row, _i, _j, _len, _len1;
  $('#stats').css('color', 'black');
  $('#numbombs1').text(1);
  $('#numbombs2').text(1);
  $('#rangebombs1').text(1);
  $('#rangebombs2').text(1);
  $('#awesomeness').html('&#8734;');
  game_started = true;
  objects = [[5, 5, 0, 0, 0, 0, 0, 0, 0], [5, 1, 0, 1, 0, 1, 0, 1, 0], [0, 0, 0, 0, 0, 0, 0, 0, 0], [0, 1, 0, 1, 0, 1, 0, 1, 0], [0, 0, 0, 0, 0, 0, 0, 0, 0], [0, 1, 0, 1, 0, 1, 0, 1, 0], [0, 0, 0, 0, 0, 0, 0, 0, 0], [0, 1, 0, 1, 0, 1, 0, 1, 5], [0, 0, 0, 0, 0, 0, 0, 5, 5]];
  for (r_index = _i = 0, _len = objects.length; _i < _len; r_index = ++_i) {
    row = objects[r_index];
    for (c_index = _j = 0, _len1 = row.length; _j < _len1; c_index = ++_j) {
      object = row[c_index];
      if (object === 5) {
        objects[r_index][c_index] = new Empty();
      } else if (object === 0) {
        if (Math.random() < 0.7) {
          if (Math.random() < 0.3) {
            if (Math.random() < 0.5) {
              objects[r_index][c_index] = new Wood('range_up');
            } else {
              objects[r_index][c_index] = new Wood('bomb_up');
            }
          } else {
            objects[r_index][c_index] = new Wood();
          }
        } else {
          objects[r_index][c_index] = new Empty();
        }
      } else if (object === 1) {
        objects[r_index][c_index] = new Stone();
      }
    }
  }
  players[0] = {
    id: 0,
    position: {
      x: 25,
      y: 25
    },
    facing: 'down',
    speed: 5,
    bomb_supply: {
      max_number: 1,
      number: 1,
      range: 1
    },
    controls: {
      up: 87,
      down: 83,
      left: 65,
      right: 68,
      drop: 88
    },
    up: false,
    down: false,
    right: false,
    left: false,
    drop: false,
    dead: false
  };
  return players[1] = {
    id: 1,
    facing: 'up',
    position: {
      x: 425,
      y: 425
    },
    speed: 5,
    bomb_supply: {
      max_number: 1,
      number: 1,
      range: 1
    },
    controls: {
      up: 80,
      down: 186,
      left: 76,
      right: 222,
      drop: 191
    },
    up: false,
    down: false,
    right: false,
    left: false,
    drop: false,
    dead: false
  };
};

game_logic = function() {
  var player, _i, _len;
  for (_i = 0, _len = players.length; _i < _len; _i++) {
    player = players[_i];
    movement_logic(player);
    walkover_logic(player);
  }
  draw_player();
  draw_bomb();
  if (check_collisions()) {
    clearTimeout(timer);
    return game_started = false;
  } else {
    return timer = setTimeout("game_logic()", 25);
  }
};

walkover_logic = function(player) {
  var coords, kind;
  coords = get_grid_coords(player);
  if (objects[coords.row][coords.col].type === 'upgrade') {
    kind = objects[coords.row][coords.col].kind;
    if (kind === 'bomb_up' && player.bomb_supply.max_number < 10) {
      player.bomb_supply.max_number += 1;
      player.bomb_supply.number += 1;
      $('#numbombs' + (player.id + 1)).text(player.bomb_supply.max_number);
    } else if (kind === 'range_up' && player.bomb_supply.range < 10) {
      player.bomb_supply.range += 1;
      $('#rangebombs' + (player.id + 1)).text(player.bomb_supply.range);
    }
    objects[coords.row][coords.col] = new Empty();
    return update_map(coords.row, coords.col);
  }
};

drop_bomb = function(r, c, pid, brange) {
  return objects[r][c] = new Bomb(brange, pid, setTimeout("explode(" + r + "," + c + ")", 2500));
};

explode = function(r, c) {
  var bomb, offset, pid, range, times;
  bomb = objects[r][c];
  clearTimeout(bomb.timer);
  pid = bomb.player_id;
  players[pid].bomb_supply.number += 1;
  range = bomb.range;
  explosion_logic(r, c, range);
  offset = range;
  return times = Math.ceil(range / 5);
};

explosion_logic = function(r, c, range) {
  var countdown, temp_c, temp_r;
  set_explosion(r, c);
  countdown = range;
  temp_r = r - 1;
  while (countdown > 0 && temp_r >= 0 && objects[temp_r][c].walkable) {
    set_explosion(temp_r, c);
    temp_r -= 1;
    countdown -= 1;
  }
  if (countdown > 0 && temp_r >= 0 && objects[temp_r][c].destructible) {
    if (objects[temp_r][c].type === 'bomb') {
      explode(temp_r, c);
    } else if (objects[temp_r][c].type === 'wood') {
      set_explosion(temp_r, c);
    }
  }
  countdown = range;
  temp_r = r + 1;
  while (countdown > 0 && temp_r <= 8 && objects[temp_r][c].walkable) {
    set_explosion(temp_r, c);
    temp_r += 1;
    countdown -= 1;
  }
  if (countdown > 0 && temp_r <= 8 && objects[temp_r][c].destructible) {
    if (objects[temp_r][c].type === 'bomb') {
      explode(temp_r, c);
    } else if (objects[temp_r][c].type === 'wood') {
      set_explosion(temp_r, c);
    }
  }
  countdown = range;
  temp_c = c - 1;
  while (countdown > 0 && temp_c >= 0 && objects[r][temp_c].walkable) {
    set_explosion(r, temp_c);
    temp_c -= 1;
    countdown -= 1;
  }
  if (countdown > 0 && temp_c >= 0 && objects[r][temp_c].destructible) {
    if (objects[r][temp_c].type === 'bomb') {
      explode(r, temp_c);
    } else if (objects[r][temp_c].type === 'wood') {
      set_explosion(r, temp_c);
    }
  }
  countdown = range;
  temp_c = c + 1;
  while (countdown > 0 && temp_c <= 8 && objects[r][temp_c].walkable) {
    set_explosion(r, temp_c);
    temp_c += 1;
    countdown -= 1;
  }
  if (countdown > 0 && temp_c <= 8 && objects[r][temp_c].destructible) {
    if (objects[r][temp_c].type === 'bomb') {
      return explode(r, temp_c);
    } else if (objects[r][temp_c].type === 'wood') {
      return set_explosion(r, temp_c);
    }
  }
};

set_explosion = function(r, c) {
  if (objects[r][c].type === 'explosion') {
    objects[r][c].count += 1;
  } else {
    if (objects[r][c].type === 'wood' && objects[r][c].upgrade !== false) {
      setTimeout("set_upgrade(" + r + "," + c + ",'" + objects[r][c].upgrade + "')", 1000);
    } else if (objects[r][c].type === 'upgrade') {
      setTimeout("set_upgrade(" + r + "," + c + ",'" + objects[r][c].kind + "')", 1000);
    }
    objects[r][c] = new Explosion();
  }
  return setTimeout("extinguish(" + r + "," + c + ")", 1000);
};

extinguish = function(r, c) {
  if (objects[r][c].type === 'explosion') {
    if (objects[r][c].count === 1) {
      objects[r][c] = new Empty();
      return update_map(r, c);
    } else {
      return objects[r][c].count -= 1;
    }
  }
};

set_upgrade = function(r, c, kind) {
  objects[r][c] = new Upgrade(kind);
  return update_map(r, c);
};

check_collisions = function() {
  var player, _i, _len;
  for (_i = 0, _len = players.length; _i < _len; _i++) {
    player = players[_i];
    if (player_collision(player)) {
      player.dead = true;
    }
  }
  if (players[0].dead && players[1].dead) {
    game_over_screen('double suicide');
    return true;
  } else if (players[0].dead) {
    game_over_screen('player 1 dead');
    return true;
  } else if (players[1].dead) {
    game_over_screen('player 2 dead');
    return true;
  } else {
    return false;
  }
};

player_collision = function(player) {
  var c, coords, r;
  coords = get_grid_coords(player);
  r = coords.row;
  c = coords.col;
  if (objects[r][c].type === 'explosion') {
    return true;
  } else {
    return false;
  }
};

$(function() {
  return intro_screen();
});

$(document).bind('keydown', function(e) {
  var coords, player, player_id, _i, _len;
  if (!event.metaKey) {
    if (!game_started) {
      if (e.which === 32) {
        init_game();
        init_draw();
        game_logic();
      }
    }
    for (player_id = _i = 0, _len = players.length; _i < _len; player_id = ++_i) {
      player = players[player_id];
      if (e.which === player.controls.up) {
        player.up = true;
      } else if (e.which === player.controls.down) {
        player.down = true;
      } else if (e.which === player.controls.left) {
        player.left = true;
      } else if (e.which === player.controls.right) {
        player.right = true;
      } else if (e.which === player.controls.drop) {
        coords = get_grid_coords(player);
        if (player.bomb_supply.number > 0 && objects[coords.row][coords.col].type !== 'bomb') {
          drop_bomb(coords.row, coords.col, player_id, player.bomb_supply.range);
          player.bomb_supply.number -= 1;
        }
      }
    }
    return false;
  }
}).bind('keyup', function(e) {
  var player, player_id, _i, _len;
  if (!event.metaKey) {
    for (player_id = _i = 0, _len = players.length; _i < _len; player_id = ++_i) {
      player = players[player_id];
      if (e.which === player.controls.up) {
        player.up = false;
      } else if (e.which === player.controls.down) {
        player.down = false;
      } else if (e.which === player.controls.left) {
        player.left = false;
      } else if (e.which === player.controls.right) {
        player.right = false;
      }
    }
    return false;
  }
});
