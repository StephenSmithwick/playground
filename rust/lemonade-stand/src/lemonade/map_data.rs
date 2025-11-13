use bevy::prelude::*;
use serde::Deserialize;

#[derive(Clone, Copy, Debug, Deserialize)]
pub enum TileType {
    Grass,
    Sidewalk,
    Road,
    Water,
}

impl From<char> for TileType {
    fn from(item: char) -> TileType {
        match item {
            'G' => TileType::Grass,
            'W' => TileType::Water,
            'R' => TileType::Road,
            'S' => TileType::Sidewalk,
            _ => TileType::Grass,
        }
    }
}

#[derive(Asset, Debug, Deserialize, Reflect, Clone)]
pub struct MapData {
    pub width: usize,
    pub height: usize,
    rows: Vec<String>,
}

impl MapData {
    pub fn tiles(&self) -> Vec<Vec<TileType>> {
        self.rows
            .iter()
            .map(|line| line.chars().map(TileType::from).collect())
            .collect()
    }
}
