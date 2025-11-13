use bevy::prelude::*;

pub fn layout(columns: u32, rows: u32, start: UVec2) -> TextureAtlasLayout {
    let mut sprites = Vec::new();
    let tile_size = UVec2::splat(16);

    for x in 0..columns {
        for y in 0..rows {
            let cell = UVec2::new(x, y);
            let rect_min = tile_size * cell;

            sprites.push(URect {
                min: start + rect_min,
                max: start + rect_min + tile_size,
            });
        }
    }

    let grid_size = UVec2::new(columns, rows);

    TextureAtlasLayout {
        size: ((tile_size) * grid_size),
        textures: sprites,
    }
}
