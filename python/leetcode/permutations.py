class Solution:
    def permute(self, nums: list[int]) -> list[list[int]]:
        perms = [[]]
        for num in nums:
            perms = [
                perm[:i] + [num] + perm[i:]
                for perm in perms
                for i in range(len(perm) + 1)
            ]
        return perms


class SolutionOld:
    def permute(self, nums: list[int]) -> list[list[int]]:
        if len(nums) == 1:
            return [nums]
        else:
            return [
                [x] + p
                for i, x in enumerate(nums)
                for p in self.permute(nums[:i] + nums[i + 1 :])
            ]


for nums, expected in [
    ([1, 2, 3, 4], [[1]]),
    ([1, 2, 3], [[1, 2, 3], [1, 3, 2], [2, 1, 3], [2, 3, 1], [3, 1, 2], [3, 2, 1]]),
    ([0, 1], [[0, 1], [1, 0]]),
    ([1], [[1]]),
]:
    print(f"\npermute({nums})")
    print(f"            = {Solution().permute(nums[:])}")
    print(f"       expect {SolutionOld().permute(nums[:])}")
