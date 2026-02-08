from ..services.step_tracker import StepTracker

def quick_sort(array):
    tracker = StepTracker()
    tracker.log_initial_state(array)
    
    def partition(arr, low, high):
        pivot = arr[high]
        i = (low - 1)
        
        # Log pivot selection
        tracker.log_pivot([high], arr, f"Selected pivot: {pivot} at index {high}")
        
        for j in range(low, high):
            tracker.log_comparison([j, high], arr)
            if arr[j] < pivot:
                i = i + 1
                arr[i], arr[j] = arr[j], arr[i]
                tracker.log_swap([i, j], arr)
                
        arr[i + 1], arr[high] = arr[high], arr[i + 1]
        tracker.log_swap([i + 1, high], arr)
        return (i + 1)

    def quick_sort_helper(arr, low, high):
        # Create tree node
        current_node = {
            "id": f"quick-{low}-{high}",
            "range": [low, high],
            "array": arr[low : high + 1] if low <= high else [],
            "phase": "divide",
            "children": [],
            "pivotIndex": None
        }

        # Step 1: Divide
        tracker.log_divide([low, high], arr, f"Processing range [{low}, {high}]")
        
        if low < high:
            # Partition
            pi = partition(arr, low, high)
            current_node["pivotIndex"] = pi
            
            tracker.log_partition([low, high], arr, pi) # Mark partition complete
            
            # Recurse
            left_child = quick_sort_helper(arr, low, pi - 1)
            right_child = quick_sort_helper(arr, pi + 1, high)
            
            current_node["children"] = [left_child, right_child]
            current_node["phase"] = "partitioned"
        
        return current_node

    root_node = quick_sort_helper(array, 0, len(array) - 1)
    
    return tracker.finalize(array, dc_tree=root_node)
