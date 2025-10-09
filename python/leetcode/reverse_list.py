from typing import Optional

class ListNode:
    def __init__(self, val=0, next=None):
        self.val = val
        self.next = next

    def __str__(self):
         return f"{self.val} -> {self.next}"

class Solution:
    # 1 -> 2 -> 3 -> None
    def reverseList(self, head: Optional[ListNode]) -> Optional[ListNode]:
        prev, cursor = None, head
        while cursor:
            next = cursor.next
            cursor.next = prev
            prev, cursor = cursor, next

        return prev


def list_to_nodes(val):
    tail = None
    while val:
        prev = ListNode(val.pop(), tail)
        tail = prev
    return tail

def nodes_to_list(val):
    list = []
    while val:
        list.append(val.val)
        val = val.next
    return list


for x in [
    [1,2,3],
    [],
    None
]:
    print(f"reverseList({x}) = { nodes_to_list(Solution().reverseList( list_to_nodes(x)))}")
