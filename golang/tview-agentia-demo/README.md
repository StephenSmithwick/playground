A simple demo tview cli to demo the interface I want for agentia.

To execute: `go run .`

## Features: 
- Adaptive left banner which smartly shrinks to a minimum size as the terminal size shrinks eventually dissappearing if the terminal is too small
- Expanding results list on the right with loading indicator for bottom item if we are waiting from a response from the terminal
- Bottom query with suggested text if none are provided


## TODO 
- adaptive banner does not grow/shrink as planned
- spinner is not currently working
