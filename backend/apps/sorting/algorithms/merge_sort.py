from ..services.step_tracker import StepTracker

def merge_sort(array):
    tracker = StepTracker()
    tracker.log_initial_state(array)
    
    def merge(arr, l, m, r):
        n1 = m - l + 1
        n2 = r - m
        
        # Log merge start
        tracker.log_merge_start([l, r], arr, f"Merging range [{l}, {r}]")
        
        # Create temp arrays
        L = [0] * n1
        R = [0] * n2
        
        for i in range(0, n1):
            L[i] = arr[l + i]
        for j in range(0, n2):
            R[j] = arr[m + 1 + j]
            
        i = 0     # Initial index of first subarray
        j = 0     # Initial index of second subarray
        k = l     # Initial index of merged subarray
        
        while i < n1 and j < n2:
            tracker.log_comparison([l + i, m + 1 + j], arr) # Visualization: comparing front of L vs R
            # Note: actual indices in main array are a bit tricky since we're using temp arrays
            # But we can approximate visualization focus
            
            if L[i] <= R[j]:
                arr[k] = L[i]
                tracker.log_overwrite([k], arr, L[i])
                i += 1
            else:
                arr[k] = R[j]
                tracker.log_overwrite([k], arr, R[j])
                j += 1
            k += 1
            
        while i < n1:
            arr[k] = L[i]
            tracker.log_overwrite([k], arr, L[i])
            i += 1
            k += 1
            
        while j < n2:
            arr[k] = R[j]
            tracker.log_overwrite([k], arr, R[j])
            j += 1
            k += 1

        tracker.log_merge_end([l, r], arr, f"Merged range [{l}, {r}] complete")

    def merge_sort_helper(arr, l, r):
        # Create tree node for this recursion step
        current_node = {
            "id": f"merge-{l}-{r}",
            "range": [l, r],
            "array": arr[l : r + 1], # Store snapshot
            "phase": "divide",
            "children": []
        }

        # Step 1: Log Divide
        tracker.log_divide([l, r], arr, f"Div: processing range [{l}, {r}]")

        if l < r:
            m = l + (r - l) // 2
            
            # Recurse
            left_child = merge_sort_helper(arr, l, m)
            right_child = merge_sort_helper(arr, m + 1, r)
            
            current_node["children"] = [left_child, right_child]

            # Step 2: Log Conquer (before merge)
            tracker.log_conquer([l, r], arr, f"Conq: ready to merge [{l}, {m}] and [{m+1}, {r}]")
            
            # Merge
            merge(arr, l, m, r)
            
            current_node["phase"] = "sorted"
        else:
            current_node["phase"] = "leaf"

        return current_node

    # Run the sort and build tree
    root_node = merge_sort_helper(array, 0, len(array) - 1)
    
    # Return both linear steps and the tree structure
    return tracker.finalize(array, dc_tree=root_node)
