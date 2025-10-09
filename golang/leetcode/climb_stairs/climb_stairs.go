package main

import "fmt"

func main() {

	for n := 1; n < 47; n++ {
		fmt.Println("climbStairs(", n, ") = ", climbStairs(n))
	}
}

func climbStairs(n int) int {
	ways := []int{0}

	for true {
		doneClimbing := true
		for _, value := range ways {
			if value < n {
				doneClimbing = false
				break
			}
		}
		if doneClimbing {
			break
		}

		toAdd := []int{}
		for i, value := range ways {
			if value+1 <= n {
				ways[i]++
			}
			if value+2 <= n {
				toAdd = append(toAdd, value+2)
			}
		}
		ways = append(ways, toAdd...)
	}
	return len(ways)
}
