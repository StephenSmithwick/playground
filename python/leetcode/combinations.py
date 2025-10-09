from typing import List

class Solution:
    # combine(4,2) = [  [1,2],[1,3],[1,4], [2,3],[2,4], [3,4]  ]
    # combine(4,3) = [  [1,2,3], [1,2,4], [1,3,4], [2,3,4] ]
    # combine(6,3) = [  [1,2,3], [1,2,4], [1,2,5], [1,2,6]
    #                   [1,3,4], [1,3,5], [1,3,6],
    #                   [1,4,5], [1,4,6],
    #                   [1,5,6],
        #                   [2,3,4], [2,3,5], [2,3,6]
        #                   [2,4,5], [2,4,6],
        #                   [2,5,6],
    #                   [3,4,5], [3,4,6],
    #                   [3,5,6],
    #                   [4,5,6]]
    # combine(1,1) = [[1]]
    def combine(self, n: int, k: int, start: int = 1) -> List[List[int]]:
        if k == 1:
            return [[i] for i in range(start, n+1)]
        results : List[List[int]] = []
        for i in range(start, n+1):
            for c in self.combine(n, k-1, i+1):
                results.append([i] + c)

        return results


for n,k in [
    (4, 2),
    (4, 3),
    (4, 5),
    (6, 3),
    (1, 1)
]:
    print(f"combine({n}, {k}) = {Solution().combine(n,k)}")
