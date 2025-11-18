class Solution:
    def letterCasePermutation(self, s: str) -> list[str]:
        perms = [""]
        for ch in s:
            inserts = [ch.lower(), ch.upper()] if ch.isalpha() else [ch]
            perms = [perm + insert for perm in perms for insert in inserts]
        return perms


for s, expected in [
    ("a1b2", ["a1b2", "a1B2", "A1b2", "A1B2"]),
    ("3z4", ["3z4"]),
]:
    print(f"letterCasePermutation({s})")
    print(f"            = {Solution().letterCasePermutation(s)}")
    print(f"       expect {expected}")
