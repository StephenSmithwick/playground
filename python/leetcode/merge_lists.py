class ListNode:
    def __init__(self, val=0, next=None):
        self.val = val
        self.next = next

    def __str__(self):
         return f"{self.val} -> {self.next}"

class Solution:
    def mergeTwoLists(self, list1, list2):
        cursor = head = ListNode()

        while list1 and list2:
            if list1.val <= list2.val:
                cursor.next, list1 = list1, list1.next
            else:
                cursor.next, list2 = list2, list2.next
            cursor = cursor.next

        cursor.next = list1 or list2

        return head.next

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



for list1, list2 in [
    ([1,3,5], [2,4]),
    (None, [1,2,3]),
    ([1,2,3], None),
    (None, None),
    ([1,2,4], [1,3,4]),
    ([5], [1,2,4]),
    ([1,2,4], [5]),
]:
    def mergeTwoLists(self, list1, list2):
        cursor = head = ListNode()

        while list1 and list2:
            if list1.val <= list2.val:
                cursor.next, list1 = list1, list1.next
            else:
                cursor.next, list2 = list2, list2.next
            cursor = cursor.next

        cursor.next = list1 or list2

        return head.next

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



for list1, list2 in [
    ([1,3,5], [2,4]),
    (None, [1,2,3]),
    ([1,2,3], None),
    (None, None),
    ([1,2,4], [1,3,4]),
    ([5], [1,2,4]),
    ([1,2,4], [5]),
]:
    def mergeTwoLists(self, list1, list2):
        cursor = head = ListNode()

        while list1 and list2:
            if list1.val <= list2.val:
                cursor.next, list1 = list1, list1.next
            else:
                cursor.next, list2 = list2, list2.next
            cursor = cursor.next

        cursor.next = list1 or list2

        return head.next

for list1, list2 in [
    ([1,3,5], [2,4]),
    (None, [1,2,3]),
    ([1,2,3], None),
    (None, None),
    ([1,2,4], [1,3,4]),
    ([5], [1,2,4]),
    ([1,2,4], [5]),
]:
    print(f"mergeTwoLists({list1}, {list2}) = { nodes_to_list(Solution().mergeTwoLists( list_to_nodes(list1), list_to_nodes(list2) ))}")
