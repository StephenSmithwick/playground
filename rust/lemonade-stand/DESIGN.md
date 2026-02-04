# Lemonade Stand — Game Concept (Technical Overview)

## High-Level Overview
A lightly-futuristic management sim where the player operates a child-run lemonade stand in a near-future urban neighborhood. Systems lean on deterministic simulation, data-driven definitions, and modular AI behavior to support scalability and player-driven events.

The emphasis: real-time cohort-based simulation + procedural city activity flows + event-driven reactions.

## Core Pillars

### Cohort-Based Population Simulation
Rather than individual NPC agents, the city uses cohorts (group abstractions) to simulate population behavior:
- Each cohort: origin_cell, destination_cell, size, intent, movement_model.
- Cohorts derive their movement lanes from a navgraph with cached shortest-path segments.
- Cohorts may split or merge based on:
- Spatial divergence at intersections
- Event attraction weights
- Time-of-day schedules

Simulation tick target: 30–120 Hz depending on hardware/perf budgeting.

### Dynamic Events
Events drive demand, pathing, and world “vibe.” Two categories:
1.	Procedural Events
- Weather changes
- School recesses
- Park gatherings
- Traffic congestion
2.	Player-Driven Events - Trigger via periodic schedules or probabilistic rolls.
- Temporary stand upgrades
- Marketing campaigns
- Traffic blockages from player antics
- Mini-quests

Events post signals into a central event bus:
```rust
Event {
    event_id,
    event_type,
    location,
    radius,
    effects: { path_modifier, mood_modifier, demand_modifier, time_cost }
}
```
Systems subscribe to only what they need.

## World Simulation
### Grid + Cells
The city uses a sparse grid partition:
- Each cell stores static metadata (zone type, population density profile).
- Dynamic state (active cohorts, events, temperature, noise levels).
- Transport graph overlaid as a dedicated structure referencing cells but not constrained by them.

### Time System
- 1 real-time second = N simulated seconds adjustable via settings.
- Daily schedules use spline-based intensity profiles per population segment:
```
students = Curve( morning_peak, lunch_spike, afterschool_wave )
office_workers = Curve( commute_peaks, lunch_low )
retirees = Flat-ish Curve
```

### Weather Simulation
Simple but extensible:
- Temperature curve (diurnal + stochastic noise)
- Precipitation probability
- Sunlight exposure → affects outdoor population
- Heat index → increases lemonade demand up to saturation threshold

## Commerce & Stand Operations
### Product Modeling
Each drink variant defined in a data file:
```rust
Drink {
    base_cost,
    recipe_requirements,
    crafting_time,
    spoilage_profile,
    attractiveness_curve  // demand vs temp, vs mood, etc.
}
```

### Pricing Model
Demand curve is evaluated per cohort:
```
demand = clamp( base_interest
                * attractiveness(temp)
                * price_sensitivity(price)
                * event_bonus
                * brand_modifier )
```

Where brand_modifier is a stateful value that decays over time.

### Crafting / Stock System
- Pre-batch or just-in-time modes
- Storage capped by upgrade tier
- Spoilage → soft pressure against hoarding

## AI & Scripting
### NPC Interest Model
Cohorts passing within the stand’s influence radius evaluate:
- Is the stand discoverable? (line-of-sight + signage modifiers)
- Is the price acceptable?
- Are they time-constrained due to events, school bell, monorail schedule?

### Opponent AI (Optional Futures)
Opponents run lightweight rule-based scripts:
- No LLM calls in the inner loop
- Behavior trees or GOAP templates precompiled
- They observe stand performance and adapt crude strategies:
- Undercut price
- Relocate stand
- Offer freebies during peak times

## Rendering & Art Pipeline
### Visual Style
- Slightly futuristic urban environment
- Tilt-shift / depth-miniaturization look
- High-brightness greens and clean shadows
- Monorail pillars as anchoring vertical elements

### Scene Graph
- Stand as modular prefab (table, pitchers, sign, children operators)
- Environment cells baked into static meshes
- Dynamic agents represented as GPU-instanced billboards if population is >N

### Camera
- Orthographic or shallow-perspective hybrid
- 3 modes: player, cinematic, debug

## Data-Driven Architecture
### Asset Configuration
All game definitions stored as:
- JSON or TOML data tables
- Hot-reloadable if engine supports it

### Event Definitions
```rust
EventDefinition {
    trigger: { time_of_day | weather | probability | player_action },
    area,
    modifiers,
    duration
}
```

### Balancing
Use spreadsheet-like CSVs (imported at build time) for:
- Cohort densities
- Price elasticities
- Weather influence weights
- Event attraction multipliers

## Performance Considerations
### Cohort Compression
If density spikes:
- Merge cohorts traveling identically
- Drop fidelity on small cohorts during high load
- Use “shadow cohorts” for long-range flux but only materialize near the stand

### Pathfinding
- Precompute main path corridors
- Cache corridor → destination links
- Localized dynamic replanning for event disruptions

### Multithreading
- Simulation runs on worker threads
- Rendering and UI on main thread
- Event system lock-free via ring buffers

## Future Extensions
- Narrative arcs using semi-procedural storytelling
- Expanded city districts
- Social media simulation influencing demand
