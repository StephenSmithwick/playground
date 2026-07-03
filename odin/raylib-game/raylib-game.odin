package game

import rl "vendor:raylib"

player_jumps: int
player_flip := false
player_duck := false
player_pos := rl.Rectangle {
	x      = 640,
	y      = 320,
	width  = 48,
	height = 48,
}
player_vel: rl.Vector2
player_texture: rl.Texture2D

Animation :: struct {
	base:   rl.Rectangle,
	frames: int,
	repeat: bool,
}

idle := Animation {
	base = rl.Rectangle{x = 0, y = 0, width = 24, height = 24},
	frames = 2,
	repeat = true,
}
run := Animation {
	base = rl.Rectangle{x = 96, y = 24, width = 24, height = 24},
	frames = 4,
	repeat = true,
}
jump := Animation {
	base = rl.Rectangle{x = 0, y = 72, width = 24, height = 24},
	frames = 8,
	repeat = false,
}
duck := Animation {
	base = rl.Rectangle{x = 96, y = 96, width = 24, height = 24},
	frames = 4,
	repeat = false,
}

animation_frame_timer: f32
animation_frame: int
animation_frame_duration := f32(0.1)

draw :: proc(animation: Animation) {
	animation_frame_timer += rl.GetFrameTime()
	animation_frame =
		int(animation_frame_timer / animation_frame_duration) % (animation.frames + 1)
	if animation_frame == animation.frames && animation.repeat {
		animation_frame_timer = 0
		animation_frame = 0
	}

	player_source := rl.Rectangle {
		x      = animation.base.x + f32(animation_frame) * animation.base.width,
		y      = animation.base.y,
		width  = -animation.base.width if player_flip else animation.base.width,
		height = animation.base.height,
	}
	rl.DrawTexturePro(player_texture, player_source, player_pos, 0, 0, rl.WHITE)
}

input :: proc() {
	player_duck = false
	if rl.IsKeyDown(.LEFT) {
		player_flip = true
		player_vel.x = -400
	} else if rl.IsKeyDown(.RIGHT) {
		player_flip = false
		player_vel.x = 400
	} else if rl.IsKeyDown(.DOWN) {
		player_duck = true
		player_vel.x = player_vel.x / 2
	} else {
		player_vel.x = 0
	}
	if (rl.IsKeyPressed(.SPACE) || rl.IsKeyPressed(.UP)) && player_jumps > 0 {
		player_vel.y = -600
		player_jumps -= 1
	}
}

update :: proc() {
	player_vel.y += 2000 * rl.GetFrameTime()
	player_pos.x += player_vel.x * rl.GetFrameTime()
	player_pos.y += player_vel.y * rl.GetFrameTime()

	if player_pos.x < 0 {
		player_pos.x = 0
	} else if player_pos.x + player_pos.width > f32(rl.GetScreenWidth()) {
		player_pos.x = f32(rl.GetScreenWidth()) - player_pos.width
	}

	if player_pos.y > f32(rl.GetScreenHeight()) - player_pos.height {
		player_pos.y = f32(rl.GetScreenHeight()) - player_pos.height
		player_jumps = 2
	}
}

getAnimation :: proc() -> Animation {
	if player_vel.y < 0 {
		return jump
	} else if player_duck {
		return duck
	}; if player_vel.x > 0 || player_vel.x < 0 {
		return run
	} else {
		return idle
	}
}


main :: proc() {
	rl.InitWindow(1280, 720, "Raylib Game")
	player_texture = rl.LoadTexture("player-animations.png")

	for !rl.WindowShouldClose() {
		rl.BeginDrawing()
		rl.ClearBackground(rl.SKYBLUE)

		input()
		update()
		draw(getAnimation())

		rl.EndDrawing()
	}

	rl.CloseWindow()
}
