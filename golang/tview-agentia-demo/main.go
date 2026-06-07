package main

import (
	"fmt"
	"strings"
	"time"

	"github.com/gdamore/tcell/v2"
	"github.com/rivo/tview"
)

type Line struct {
	Color string
	Value []rune
}

const minCowboyWidth = 12
const cowboyEnd = 56

func Cowboy() []Line {
	return []Line{
		{"#352682", []rune("⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀")},
		{"#382680", []rune("⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀▁▗▆▆▖▂⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀")},
		{"#3a267f", []rune("⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀▂▟▄▟⠀⠀⠀⠀⠀⠀▔▜██▛▔⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀")},
		{"#412679", []rune("⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀▃▆█████▖⠀⠀⠀⠀⠀⠀▗██▙⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀")},
		{"#452779", []rune("⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀▗▄▖▁▗▟███████▌⠀⠀⠀⠀▄██████▄⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀")},
		{"#4B2675", []rune("⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀▗▄▂⠀▗▄▟█▆███████████▖⠀⠀▐████████▌⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀")},
		{"#502773", []rune("⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀▂▄▆▆▆▆███████████████▛▀▜██▌⠀⠀▟█████████▖⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀")},
		{"#59276f", []rune("⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀▟██████████████████████▂▂▂▞▞⠀⠀▗█▌██████▌█▌⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀")},
		{"#602669", []rune("⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀▟██████████████████████▂▂▂▂▞⠀⠀⠀ █▐██████▌▜▛⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀")},
		{"#742764", []rune("⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀███████████████████████⠀⠀⠀⠀⠀⠀⠀⠀▐▛▟██████▙▟▌⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀")},
		{"#83275b", []rune("⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀▕██████████████████████▌⠀⠀⠀⠀⠀⠀⠀⠀▐██████████▙⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀")},
		{"#972755", []rune("⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀▐█████████████████████▛⠀⠀⠀⠀⠀⠀⠀⠀⠀▝▘▜███▜███▜▐▌⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀")},
		{"#a02652", []rune("⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀▁▂▟███▛███▔⠀⠀▔▔▀▀▜██▛▜██▘⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀▐██▌▐██▛▐▟▌⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀")},
		{"#b92549", []rune("⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀▜████████▘⠀⠀⠀⠀⠀⠀⠀▐██⠀▐█▌⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀▐██⠀▕██▌▐▀▌⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀▖⠀⠀")},
		{"#ca2442", []rune("⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀▝▀▔▐█▛██▌⠀⠀⠀▖⠀⠀⠀⠀▗█▌⠀▟▛⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀▜█▌▕█▛▝▔⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀▐⠀⠀⠀")},
		{"#cb234a", []rune("⠀⠀⠀⠀⠀⠀▗▍⠀⠀▍⠀⠀▝█▌▝██⠀▗▟▙▄▗▍▂▟█▅▆█▌▄▆█▟▗▆▖⠀▖⠀▃⠀▖▖▗█▙⠀█▙▗⠀▖▖⠀▂▗⠀⠀▗▂▟█▟▆▙▖")},
		{"#cf2440", []rune("⠀⠀⠀▄▗▟██▟██▟▆██████▟█████▄███████████████▙████████████▙██▆██▆▗████████")},
	}
}

// StartNodeSpinner attaches a background spinner to a specific TreeNode.
// It requires the app pointer to trigger thread-safe UI redraws.
func StartNodeSpinner(app *tview.Application, node *tview.TreeNode, baseText string, stop <-chan struct{}) {
	frames := []rune{'⠋', '⠙', '⠹', '⠸', '⠼', '⠴', '⠦', '⠧', '⠇', '⠏'}

	go func() {
		ticker := time.NewTicker(80 * time.Millisecond)
		defer ticker.Stop()
		i := 0

		for {
			select {
			case <-stop:
				app.QueueUpdateDraw(func() {
					node.SetText(baseText)
				})
				return
			case <-ticker.C:
				frame := frames[i%len(frames)]
				app.QueueUpdateDraw(func() {
					node.SetText(fmt.Sprintf("[yellow]%c[-] %s", frame, baseText))
				})
				i++
			}
		}
	}()
}

func main() {
	app := tview.NewApplication()

	// Initialize components
	banner := tview.NewTextView().SetDynamicColors(true)
	banner.SetBorder(false)

	cowboyWidth := 12
	cowboyEnd := 56

	for _, line := range Cowboy() {
		fmt.Fprintf(banner, "[%s]%s[-]\n", line.Color, string(line.Value[cowboyEnd-cowboyWidth:cowboyEnd]))
	}

	root := tview.NewTreeNode("Root")
	tree := tview.NewTreeView().
		SetRoot(root).
		SetCurrentNode(root)
	tree.SetTopLevel(1).SetGraphics(false)

	tree.SetBorder(false)

	for i := 1; i <= 20; i++ {
		headerNode := tview.NewTreeNode(fmt.Sprintf("▷ Result Item %d", i)).
			SetColor(tcell.ColorGreen).
			SetExpanded(false). // Default to collapsed
			SetSelectable(true)

		multilineText := "This is the first line of details.\nHere is the second line containing more data.\nAnd a third line of expanded context."

		// Split the text and attach each line as a child node
		for _, line := range strings.Split(multilineText, "\n") {
			childNode := tview.NewTreeNode(line).
				SetColor(tcell.ColorGray).
				SetSelectable(false) // Skip detail lines when navigating with arrow keys

			headerNode.AddChild(childNode)
		}

		root.AddChild(headerNode)
	}

	loadingNode := tview.NewTreeNode("▷ Active Result Item").
		SetColor(tcell.ColorWhite).
		SetExpanded(false).
		SetSelectable(true)

	root.AddChild(loadingNode)

	// 3. Define the toggle logic when the user presses Enter
	tree.SetSelectedFunc(func(node *tview.TreeNode) {
		if len(node.GetChildren()) > 0 {
			node.SetExpanded(!node.IsExpanded())

			// Optional: Update text indicator based on state
			text := node.GetText()
			if node.IsExpanded() {
				node.SetText(strings.Replace(text, "▷", "▽", 1))
			} else {
				node.SetText(strings.Replace(text, "▽", "▷", 1))
			}
		}
	})

	input := tview.NewInputField().SetLabel("Query: ")
	input.SetBorder(true).SetTitle("Input (Esc to quit)")

	// Assemble the layout tree
	contentFlex := tview.NewFlex().SetDirection(tview.FlexRow).
		AddItem(tree, 0, 1, true).  // Proportional height 1
		AddItem(input, 3, 1, false) // Fixed height 3

	mainFlex := tview.NewFlex().SetDirection(tview.FlexColumn).
		AddItem(banner, 17, 1, false). // Fixed width 17
		AddItem(contentFlex, 0, 1, true)

	app.SetBeforeDrawFunc(func(screen tcell.Screen) bool {
		width, _ := screen.Size()

		if width < 60 {
			if mainFlex.GetItemCount() == 2 {
				mainFlex.RemoveItem(banner)
			}
		} else {
			if mainFlex.GetItemCount() == 1 {
				mainFlex.Clear()
				mainFlex.
					AddItem(banner, cowboyWidth, 1, false).
					AddItem(contentFlex, 0, 1, true)
			}
		}
		return false
	})

	app.SetInputCapture(func(event *tcell.EventKey) *tcell.EventKey {
		switch event.Key() {
		case tcell.KeyEscape:
			app.Stop()
			return nil
		case tcell.KeyUp, tcell.KeyDown:
			app.SetFocus(tree)
		case tcell.KeyRight:
			app.SetFocus(tree)
			if node := tree.GetCurrentNode(); node != nil && !node.IsExpanded() && len(node.GetChildren()) > 0 {
				node.SetExpanded(true)
				node.SetText(strings.Replace(node.GetText(), "▷", "▽", 1))
			}
			return nil
		case tcell.KeyLeft:
			app.SetFocus(tree)
			if node := tree.GetCurrentNode(); node != nil && node.IsExpanded() {
				node.SetExpanded(false)
				node.SetText(strings.Replace(node.GetText(), "▽", "▷", 1))
			}
			return nil
		default:
			if event.Rune() != 0 || event.Key() == tcell.KeyBackspace || event.Key() == tcell.KeyBackspace2 {
				app.SetFocus(input)
			}
		}
		return event
	})

	stopSpinner := make(chan struct{})

	StartNodeSpinner(app, loadingNode, "Active Result Item", stopSpinner)

	go func() {
		time.Sleep(3 * time.Second)

		close(stopSpinner)

		app.QueueUpdateDraw(func() {
			loadingNode.
				SetText("▷ Active Result Item").
				SetColor(tcell.ColorGreen)
		})
	}()

	if err := app.SetRoot(mainFlex, true).SetFocus(input).Run(); err != nil {
		panic(err)
	}
}
