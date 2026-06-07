package main

import (
	"fmt"
	"strings"

	"github.com/charmbracelet/bubbles/spinner"
	"github.com/charmbracelet/bubbles/textinput"
	"github.com/charmbracelet/bubbles/viewport"
	tea "github.com/charmbracelet/bubbletea"
	"github.com/charmbracelet/lipgloss"
)

const minContentWidth = 55
const minCowboyWidth = 12
const cowboyEnd = 56

var cowboyData = []struct {
	Color string
	Text  string
}{
	{"#352682", "⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀"},
	{"#382680", "⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀▁▗▆▆▖▂⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀"},
	{"#3a267f", "⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀▂▟▄▟⠀⠀⠀⠀⠀⠀▔▜██▛▔⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀"},
	{"#412679", "⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀▃▆█████▖⠀⠀⠀⠀⠀⠀▗██▙⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀"},
	{"#452779", "⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀▗▄▖▁▗▟███████▌⠀⠀⠀⠀▄██████▄⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀"},
	{"#4B2675", "⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀▗▄▂⠀▗▄▟█▆███████████▖⠀⠀▐████████▌⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀"},
	{"#502773", "⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀▂▄▆▆▆▆███████████████▛▀▜██▌⠀⠀▟█████████▖⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀"},
	{"#59276f", "⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀▟██████████████████████▂▂▂▞▞⠀⠀▗█▌██████▌█▌⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀"},
	{"#602669", "⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀▟██████████████████████▂▂▂▂▞⠀⠀⠀ █▐██████▌▜▛⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀"},
	{"#742764", "⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀███████████████████████⠀⠀⠀⠀⠀⠀⠀⠀▐▛▟██████▙▟▌⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀"},
	{"#83275b", "⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀▕██████████████████████▌⠀⠀⠀⠀⠀⠀⠀⠀▐██████████▙⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀"},
	{"#972755", "⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀▐█████████████████████▛⠀⠀⠀⠀⠀⠀⠀⠀⠀▝▘▜███▜███▜▐▌⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀"},
	{"#a02652", "⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀▁▂▟███▛███▔⠀⠀▔▔▀▀▜██▛▜██▘⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀▐██▌▐██▛▐▟▌⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀"},
	{"#b92549", "⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀▜████████▘⠀⠀⠀⠀⠀⠀⠀▐██⠀▐█▌⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀▐██⠀▕██▌▐▀▌⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀▖⠀⠀"},
	{"#ca2442", "⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀▝▀▔▐█▛██▌⠀⠀⠀▖⠀⠀⠀⠀▗█▌⠀▟▛⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀▜█▌▕█▛▝▔⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀▐⠀⠀⠀"},
	{"#cb234a", "⠀⠀⠀⠀⠀⠀▗▍⠀⠀▍⠀⠀▝█▌▝██⠀▗▟▙▄▗▍▂▟█▅▆█▌▄▆█▟▗▆▖⠀▖⠀▃⠀▖▖▗█▙⠀█▙▗⠀▖▖⠀▂▗⠀⠀▗▂▟█▟▆▙▖"},
	{"#cf2440", "⠀⠀⠀▄▗▟██▟██▟▆██████▟█████▄███████████████▙████████████▙██▆██▆▗████████"},
}
var cowboyHeight = len(cowboyData)
var cowboyWidth = len([]rune(cowboyData[0].Text))

func renderCowboy(width int, height int) string {
	height = max(0, height)
	if width > cowboyEnd {
		return sliceCowboy(0, min(width, cowboyWidth), height)
	}
	return sliceCowboy(cowboyEnd-width, cowboyEnd, height)
}

func sliceCowboy(start int, end int, height int) string {
	var b strings.Builder

	for _, line := range cowboyData[:min(height, cowboyHeight)] {
		runes := []rune(line.Text)

		visiblePart := string(runes[start:end])
		styled := lipgloss.NewStyle().Foreground(lipgloss.Color(line.Color)).Render(visiblePart)
		b.WriteString(styled + "\n")
	}
	return strings.TrimSuffix(b.String(), "\n")
}

type ResultItem struct {
	Title    string
	Details  string
	Expanded bool
	IsActive bool
}

// --- Bubble Tea Architecture ---

// --- Bubble Tea Architecture ---

type model struct {
	items       []*ResultItem
	cursor      int
	textInput   textinput.Model
	spinner     spinner.Model
	viewport    viewport.Model
	ready       bool
	width       int
	height      int
	bannerWidth int
	autoScroll  bool // Tracks if the view should stick to the bottom
}

func initialModel() model {
	ti := textinput.New()
	ti.Placeholder = "Suggested Request"
	ti.Focus()
	ti.CharLimit = 156

	s := spinner.New()
	s.Spinner = spinner.Dot
	s.Style = lipgloss.NewStyle().Foreground(lipgloss.Color("205"))

	items := []*ResultItem{}

	for i := 1; i <= 20; i++ {
		items = append(items, &ResultItem{
			Title:    fmt.Sprintf("Result Item %d", i),
			Details:  "This is the first line of details.\nHere is the second line containing more data.\nAnd a third line of expanded context.",
			Expanded: false,
		})
	}
	items = append(items, &ResultItem{
		Title:    "Active Result Item",
		Details:  "This item is currently processing in the background.",
		Expanded: false,
		IsActive: true,
	})

	return model{
		items:      items,
		textInput:  ti,
		spinner:    s,
		autoScroll: true, // Default to tailing the logs
	}
}

func (m model) Init() tea.Cmd {
	return tea.Batch(textinput.Blink, m.spinner.Tick)
}

func (m model) Update(msg tea.Msg) (tea.Model, tea.Cmd) {
	var cmds []tea.Cmd
	var cmd tea.Cmd

	switch msg := msg.(type) {
	case tea.WindowSizeMsg:
		m.width = msg.Width
		m.height = msg.Height

		m.bannerWidth = 0

		if m.width > minContentWidth+minCowboyWidth {
			m.bannerWidth = min(m.width-minContentWidth, cowboyWidth)
		}

		contentWidth := m.width
		if m.bannerWidth > 0 {
			contentWidth = m.width - m.bannerWidth - 2
		}

		m.textInput.Width = m.width - 4

		viewportHeight := m.height - 1
		if !m.ready {
			m.viewport = viewport.New(contentWidth, viewportHeight)
			m.ready = true
		} else {
			m.viewport.Width = contentWidth
			m.viewport.Height = viewportHeight
		}

	case tea.KeyMsg:
		switch msg.String() {
		case "ctrl+c", "esc":
			return m, tea.Quit
		case "up":
			m.autoScroll = false // Break auto-scroll on manual navigation
			if m.cursor > 0 {
				m.cursor--
			}
		case "down":
			if m.cursor < len(m.items)-1 {
				m.cursor++
			}
			// Re-engage auto-scroll if user manually navigates to the very bottom
			if m.cursor == len(m.items)-1 {
				m.autoScroll = true
			}
		case "enter", "right":
			if len(m.items) > 0 {
				m.items[m.cursor].Expanded = true
			}
		case "left":
			if len(m.items) > 0 {
				m.items[m.cursor].Expanded = false
			}
		}
	}

	// Update Sub-components
	m.textInput, cmd = m.textInput.Update(msg)
	cmds = append(cmds, cmd)

	m.spinner, cmd = m.spinner.Update(msg)
	cmds = append(cmds, cmd)

	m.viewport, cmd = m.viewport.Update(msg)
	cmds = append(cmds, cmd)

	// Handle Mouse Wheel Scrolling Overrides
	if mouseMsg, ok := msg.(tea.MouseMsg); ok {
		if mouseMsg.Type == tea.MouseWheelUp {
			m.autoScroll = false
		} else if mouseMsg.Type == tea.MouseWheelDown && m.viewport.AtBottom() {
			m.autoScroll = true
		}
	}

	// --- Layout Generation & Viewport Sync ---
	if m.ready {
		// If sticky bottom is active, force cursor to the latest item
		if m.autoScroll && len(m.items) > 0 {
			m.cursor = len(m.items) - 1
		}

		var listBuilder strings.Builder
		cursorLine := 0
		currentLine := 0

		for i, item := range m.items {
			// Record the exact line index of the active cursor
			if m.cursor == i {
				cursorLine = currentLine
			}

			cursorStr := "  "
			if m.cursor == i {
				cursorStr = "│ "
			}

			icon := "▷"
			if item.Expanded {
				icon = "▽"
			}
			if item.IsActive {
				icon = m.spinner.View()
			}

			header := fmt.Sprintf("%s%s %s", cursorStr, icon, item.Title)
			if m.cursor == i {
				header = lipgloss.NewStyle().Foreground(lipgloss.Color("42")).Render(header)
			}
			listBuilder.WriteString(header + "\n")
			currentLine++ // Header takes 1 line

			if item.Expanded {
				detailStyle := lipgloss.NewStyle().
					Foreground(lipgloss.Color("240")).
					MarginLeft(4).
					Width(m.viewport.Width - 6)

				renderedDetail := detailStyle.Render(item.Details)
				listBuilder.WriteString(renderedDetail + "\n")

				// Calculate exact wrapped height of details
				currentLine += lipgloss.Height(renderedDetail)
			}
		}

		m.viewport.SetContent(listBuilder.String())

		// Apply Scroll Logic
		if m.autoScroll {
			m.viewport.GotoBottom()
		} else {
			// Mathematical cursor tracking: Ensure the cursor line stays within the viewport's visible Y-bounds
			if cursorLine < m.viewport.YOffset {
				m.viewport.YOffset = cursorLine
			} else if cursorLine >= m.viewport.YOffset+m.viewport.Height {
				m.viewport.YOffset = cursorLine - m.viewport.Height + 1
			}
		}
	}

	return m, tea.Batch(cmds...)
}

func (m model) View() string {
	if !m.ready {
		return "Loading..."
	}

	topSectionHeight := m.height - 1
	banner := renderCowboy(m.bannerWidth, topSectionHeight)

	// Because we pushed generation to Update(), View() is now incredibly lightweight
	vpView := lipgloss.NewStyle().
		Width(m.viewport.Width).
		Height(m.viewport.Height).
		Render(m.viewport.View())

	var topContent string
	if m.bannerWidth > 0 {
		topContent = lipgloss.JoinHorizontal(lipgloss.Top, banner, vpView)
	} else {
		topContent = vpView
	}

	return lipgloss.JoinVertical(lipgloss.Left, topContent, m.textInput.View())
}

func main() {
	p := tea.NewProgram(initialModel(), tea.WithAltScreen(), tea.WithMouseCellMotion())
	if _, err := p.Run(); err != nil {
		fmt.Printf("Alas, there's been an error: %v", err)
	}
}
