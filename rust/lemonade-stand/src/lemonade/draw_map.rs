use bevy::prelude::*;

use crate::lemonade::{
    map_data::{MapData, TileType},
    tilemapper::layout,
};

#[derive(Resource, Clone, Reflect)]
#[reflect(Resource)]
pub struct Map {
    tilemap: Handle<Image>,
    map: MapData,
    grass: Vec<Sprite>,
    sidewalk: Vec<Sprite>,
    road: Vec<Sprite>,
    water: Vec<Sprite>,
}

pub(super) fn plugin(app: &mut App) {
    app.add_systems(Startup, (setup, draw_map).chain());
}

fn load_sprites(
    tilemap: Handle<Image>,
    layout: Handle<TextureAtlasLayout>,
    count: usize,
) -> Vec<Sprite> {
    (0..count)
        .map(|i| {
            Sprite::from_atlas_image(
                tilemap.clone(),
                TextureAtlas {
                    layout: layout.clone(),
                    index: i,
                },
            )
        })
        .collect()
}

fn setup(
    mut commands: Commands,
    assets: Res<AssetServer>,
    mut atlas: ResMut<Assets<TextureAtlasLayout>>,
) {
    let text = std::fs::read_to_string("assets/maps/test_map.ron").unwrap();
    let map: MapData = ron::from_str(&text).unwrap();
    let tilemap = assets.load("images/tilemap.png");

    commands.insert_resource(Map {
        tilemap: tilemap.clone(),
        map,
        grass: load_sprites(
            tilemap.clone(),
            atlas.add(layout(8, 3, UVec2 { x: 0, y: 0 })),
            24,
        ),
        sidewalk: load_sprites(
            tilemap.clone(),
            atlas.add(layout(8, 3, UVec2 { x: 128, y: 0 })),
            24,
        ),
        water: load_sprites(
            tilemap.clone(),
            atlas.add(layout(8, 3, UVec2 { x: 128, y: 96 })),
            24,
        ),
        road: load_sprites(
            tilemap.clone(),
            atlas.add(layout(5, 2, UVec2 { x: 80, y: 256 })),
            10,
        ),
    });
}

fn draw_map(mut commands: Commands, map: Res<Map>) {
    // Center the rendered tiles around the origin
    let half_w = (map.map.width as f32) / 2.0;
    let half_h = (map.map.height as f32) / 2.0;

    for (row_y, row) in map.map.tiles().iter().enumerate() {
        for (col_x, tile) in row.iter().enumerate() {
            let sprite = match tile {
                TileType::Grass => &map.grass[4],
                TileType::Water => &map.water[4],
                TileType::Sidewalk => &map.sidewalk[4],
                TileType::Road => &map.road[9],
            };

            // Compute world position so grid is centered at (0,0)
            let x = (col_x as f32 - half_w + 0.5) * 16.0;
            // invert Y so top row of subsection appears at positive Y
            let y = (-(row_y as f32 - half_h + 0.5)) * 16.0;

            commands.spawn((sprite.clone(), Transform::from_xyz(x, y, 0.0)));
        }
    }
}
