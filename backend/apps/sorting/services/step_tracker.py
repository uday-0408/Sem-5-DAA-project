import time
import copy

class StepTracker:
    def __init__(self):
        self.steps = []
        self.comparisons = 0
        self.swaps = 0
        self.start_time = time.perf_counter()

    def _append_step(self, array, step_type, indices, description=""):
        self.steps.append({
            "array": copy.deepcopy(array),
            "type": step_type,
            "indices": indices,
            "description": description,
            "comparisons": self.comparisons,
            "swaps": self.swaps
        })

    def log_initial_state(self, array):
        self._append_step(array, "initial", [], "Initial State")

    def log_comparison(self, indices, array):
        """
        Log a comparison event.
        indices: list of indices being compared e.g. [0, 1]
        """
        self.comparisons += 1
        vals = []
        # Safe value extraction
        for idx in indices:
            if 0 <= idx < len(array):
                vals.append(str(array[idx]))
            else:
                vals.append("?")
        
        description = f"Comparing {', '.join(vals)}"
        self._append_step(array, "comparison", indices, description)

    def log_swap(self, indices, array):
        """
        Log a swap event.
        indices: list of indices being swapped e.g. [0, 1]
        """
        self.swaps += 1
        description = f"Swapping indices {indices[0]} and {indices[1]}"
        self._append_step(array, "swap", indices, description)

    def log_overwrite(self, indices, array, value):
        """
        Log a value overwrite (mainly for Merge Sort).
        """
        # We assume overwrite counts as a 'swap' or 'move' operation conceptually for complexity tracking 
        # but maybe we don't increment swap count strictly if it's merge sort? 
        # Strictly merge sort has array assignments. 
        # We will not increment swap here to keep traditional metrics clean, or we can add 'assignments'.
        # For visualization, we treat it as a step.
        description = f"Overwriting index {indices[0]} with {value}"
        self._append_step(array, "overwrite", indices, description)

    def log_divide(self, indices, array, description="Dividing"):
        self._append_step(array, "divide", indices, description)

    def log_conquer(self, indices, array, description="Conquering"):
        self._append_step(array, "conquer", indices, description)

    def log_merge_start(self, indices, array, description="Starting Merge"):
        self._append_step(array, "merge_start", indices, description)

    def log_merge_end(self, indices, array, description="Merge Complete"):
        self._append_step(array, "merge_end", indices, description)

    def log_partition(self, indices, array, pivot_index):
        description = f"Partitioning with pivot at {pivot_index}"
        self._append_step(array, "partition", indices, description)

    def log_pivot(self, indices, array, description="Pivot Selected"):
        self._append_step(array, "pivot", indices, description)

    def finalize(self, array, dc_tree=None):
        """
        Calculate final metrics and return the result dictionary.
        """
        end_time = time.perf_counter()
        execution_time_ms = (end_time - self.start_time) * 1000
        
        # Ensure the final sorted state is recorded
        self._append_step(array, "finished", [], "Sorting Complete")

        result = {
            "steps": self.steps,
            "sorted_array": array,
            "metrics": {
                "comparisons": self.comparisons,
                "swaps": self.swaps,
                "execution_time_ms": round(execution_time_ms, 4)
            }
        }

        if dc_tree:
            result["dc_tree"] = dc_tree

        return result
