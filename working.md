# DAA Sorting Visualizer - Complete Technical Documentation

## Table of Contents
1. [Architecture Overview](#architecture-overview)
2. [Backend Deep Dive](#backend-deep-dive)
3. [Frontend Deep Dive](#frontend-deep-dive)
4. [Complete Data Flow](#complete-data-flow)
5. [Algorithm Implementation Details](#algorithm-implementation-details)
6. [UI Component Breakdown](#ui-component-breakdown)

---

## Architecture Overview

This is a **full-stack sorting algorithm visualizer** with:
- **Backend**: Django REST Framework (Python)
- **Frontend**: React + Vite + TailwindCSS
- **Communication**: REST API over HTTP (JSON payloads)
- **Pattern**: Factory Pattern for algorithm selection, Step-by-step tracking for visualization

### High-Level Flow
```
User Action (Frontend) 
    → API POST Request with {algorithm, array, speed}
        → Django REST Serializer validates input
            → SortFactory selects algorithm function
                → Algorithm executes with StepTracker
                    → Returns {steps[], sorted_array[], metrics{}, complexity{}}
                        → Frontend receives response
                            → Animation loop renders steps with setTimeout()
```

---

## Backend Deep Dive

### 1. API Endpoint: `/api/sort/`

**File**: `backend/apps/sorting/api/urls.py`
```python
path('sort/', SortView.as_view(), name='sort')
```

**Full URL**: `http://localhost:8000/api/sort/`

**Method**: `POST`

**Handler**: `backend/apps/sorting/api/views.py` → `SortView` class

---

### 2. Request Structure

**File**: `backend/apps/sorting/api/serializers.py` → `SortRequestSerializer`

#### Fields:
| Field | Type | Validation | Required | Default |
|-------|------|------------|----------|---------|
| `algorithm` | `string` | Must be one of: `'bubble'`, `'selection'`, `'insertion'`, `'merge'`, `'quick'`, `'heap'` | Yes | - |
| `array` | `list[int]` | Must be non-empty list of integers | Yes | - |
| `speed` | `string` | Any string (currently unused in backend) | No | `"medium"` |

#### Example Request Payload:
```json
{
  "algorithm": "bubble",
  "array": [64, 34, 25, 12, 22, 11, 90],
  "speed": "medium"
}
```

**Serializer Code**:
```python
class SortRequestSerializer(serializers.Serializer):
    ALGORITHM_CHOICES = [
        ('bubble', 'Bubble Sort'),
        ('selection', 'Selection Sort'),
        ('insertion', 'Insertion Sort'),
        ('merge', 'Merge Sort'),
        ('quick', 'Quick Sort'),
        ('heap', 'Heap Sort'),
    ]
    
    algorithm = serializers.ChoiceField(choices=ALGORITHM_CHOICES)
    array = serializers.ListField(
        child=serializers.IntegerField(),
        allow_empty=False
    )
    speed = serializers.CharField(required=False, default="medium")
```

---

### 3. Response Structure

**File**: `backend/apps/sorting/api/serializers.py` → `SortResponseSerializer`

#### Fields:
| Field | Type | Description |
|-------|------|-------------|
| `steps` | `list[dict]` | Array of step objects, each representing one operation |
| `sorted_array` | `list[int]` | Final sorted array |
| `metrics` | `dict` | Contains `comparisons`, `swaps`, `execution_time_ms` |
| `complexity` | `dict` | Contains `time` and `space` complexity strings |

#### Example Response:
```json
{
  "steps": [
    {
      "array": [64, 34, 25, 12, 22, 11, 90],
      "type": "initial",
      "indices": [],
      "description": "Initial State",
      "comparisons": 0,
      "swaps": 0
    },
    {
      "array": [64, 34, 25, 12, 22, 11, 90],
      "type": "comparison",
      "indices": [0, 1],
      "description": "Comparing 64, 34",
      "comparisons": 1,
      "swaps": 0
    },
    {
      "array": [34, 64, 25, 12, 22, 11, 90],
      "type": "swap",
      "indices": [0, 1],
      "description": "Swapping indices 0 and 1",
      "comparisons": 1,
      "swaps": 1
    },
    ...
  ],
  "sorted_array": [11, 12, 22, 25, 34, 64, 90],
  "metrics": {
    "comparisons": 21,
    "swaps": 12,
    "execution_time_ms": 0.0234
  },
  "complexity": {
    "time": "O(n^2)",
    "space": "O(1)"
  }
}
```

---

### 4. SortView Request Handler

**File**: `backend/apps/sorting/api/views.py`

**Class**: `SortView(APIView)`

**Method**: `post(self, request)`

#### Processing Flow:
1. **Deserialize Request**: 
   ```python
   serializer = SortRequestSerializer(data=request.data)
   ```

2. **Validate Input**:
   ```python
   if serializer.is_valid():
       algorithm = serializer.validated_data['algorithm']  # string
       array = list(serializer.validated_data['array'])    # list[int]
   ```

3. **Call SortFactory**:
   ```python
   result = SortFactory.sort(algorithm, array)
   # Returns dict with keys: steps, sorted_array, metrics, complexity
   ```

4. **Return Response**:
   ```python
   return Response(result, status=status.HTTP_200_OK)
   ```

5. **Error Handling**:
   - Validation errors → `400 Bad Request`
   - Runtime errors → `500 Internal Server Error`

---

### 5. SortFactory Pattern

**File**: `backend/apps/sorting/services/sort_factory.py`

**Purpose**: Maps algorithm names to their implementation functions and metadata

#### ALGORITHM_MAP Structure:
```python
ALGORITHM_MAP = {
    'bubble': {
        'func': bubble_sort,              # Function reference
        'time_complexity': 'O(n^2)',      # String
        'space_complexity': 'O(1)'        # String
    },
    # ... other algorithms
}
```

#### SortFactory.sort() Method:
```python
@staticmethod
def sort(algorithm_name, array):
    # 1. Lookup algorithm
    algo_info = ALGORITHM_MAP.get(algorithm_name.lower())
    
    # 2. Validate algorithm exists
    if not algo_info:
        raise ValueError(f"Algorithm '{algorithm_name}' not found")
    
    # 3. Execute algorithm function
    result = algo_info['func'](array)
    # result = {steps: [...], sorted_array: [...], metrics: {...}}
    
    # 4. Add complexity metadata to result
    result['complexity'] = {
        'time': algo_info['time_complexity'],
        'space': algo_info['space_complexity']
    }
    
    # 5. Return complete result
    return result
```

**Key Point**: Each algorithm function receives the array and returns a dict with `steps`, `sorted_array`, and `metrics`.

---

### 6. StepTracker - The Core Tracking Mechanism

**File**: `backend/apps/sorting/services/step_tracker.py`

**Class**: `StepTracker`

**Purpose**: Records every operation during sorting for frontend visualization

#### Instance Variables:
| Variable | Type | Description |
|----------|------|-------------|
| `steps` | `list[dict]` | Array of all recorded steps |
| `comparisons` | `int` | Total comparison count |
| `swaps` | `int` | Total swap count |
| `start_time` | `float` | Performance counter start time |

#### Methods:

##### 1. `__init__(self)`
Initializes tracking state:
```python
self.steps = []
self.comparisons = 0
self.swaps = 0
self.start_time = time.perf_counter()
```

##### 2. `log_initial_state(self, array)`
Records the starting array state:
```python
self._append_step(array, "initial", [], "Initial State")
```

##### 3. `log_comparison(self, indices, array)`
Records a comparison operation:
```python
def log_comparison(self, indices, array):
    self.comparisons += 1
    vals = [str(array[idx]) for idx in indices if 0 <= idx < len(array)]
    description = f"Comparing {', '.join(vals)}"
    self._append_step(array, "comparison", indices, description)
```
- Increments `comparisons` counter
- Creates human-readable description
- Stores snapshot of array at this moment
- Stores indices being compared (typically 2 indices)

##### 4. `log_swap(self, indices, array)`
Records a swap operation:
```python
def log_swap(self, indices, array):
    self.swaps += 1
    description = f"Swapping indices {indices[0]} and {indices[1]}"
    self._append_step(array, "swap", indices, description)
```
- Increments `swaps` counter
- Stores post-swap array state
- Stores the two swapped indices

##### 5. `log_overwrite(self, indices, array, value)`
Records an overwrite operation (used in Merge Sort):
```python
def log_overwrite(self, indices, array, value):
    description = f"Overwriting index {indices[0]} with {value}"
    self._append_step(array, "overwrite", indices, description)
```
- Does NOT increment swap counter (merge sort uses assignments, not swaps)
- Records which index was overwritten and with what value

##### 6. `finalize(self, array)`
Completes tracking and returns final result:
```python
def finalize(self, array):
    end_time = time.perf_counter()
    execution_time_ms = (end_time - self.start_time) * 1000
    
    # Add final state
    self._append_step(array, "finished", [], "Sorting Complete")
    
    return {
        "steps": self.steps,
        "sorted_array": array,
        "metrics": {
            "comparisons": self.comparisons,
            "swaps": self.swaps,
            "execution_time_ms": round(execution_time_ms, 4)
        }
    }
```

##### 7. `_append_step(self, array, step_type, indices, description)` (Private)
Internal method to add a step:
```python
def _append_step(self, array, step_type, indices, description=""):
    self.steps.append({
        "array": copy.deepcopy(array),        # Deep copy of current array state
        "type": step_type,                    # "initial"|"comparison"|"swap"|"overwrite"|"finished"
        "indices": indices,                   # List of indices involved (e.g., [0, 1])
        "description": description,           # Human-readable description
        "comparisons": self.comparisons,      # Current comparison count
        "swaps": self.swaps                   # Current swap count
    })
```

**Critical Point**: Uses `copy.deepcopy()` to capture array snapshot at each step, preventing reference issues.

---

### 7. Step Object Structure

Each step in the `steps[]` array is a dictionary with:

| Field | Type | Example | Description |
|-------|------|---------|-------------|
| `array` | `list[int]` | `[34, 64, 25, 12]` | Deep copy of array at this moment |
| `type` | `string` | `"comparison"` | Step type: `"initial"`, `"comparison"`, `"swap"`, `"overwrite"`, `"finished"` |
| `indices` | `list[int]` | `[0, 1]` | Array indices involved in this operation |
| `description` | `string` | `"Comparing 34, 64"` | Human-readable description |
| `comparisons` | `int` | `5` | Total comparisons up to this point |
| `swaps` | `int` | `2` | Total swaps up to this point |

---

## Algorithm Implementation Details

All algorithms follow the same pattern:
1. Create `StepTracker` instance
2. Log initial state
3. Execute sorting logic with step tracking
4. Return `tracker.finalize(array)`

### Bubble Sort

**File**: `backend/apps/sorting/algorithms/bubble_sort.py`

**Algorithm Logic**:
```python
def bubble_sort(array):
    tracker = StepTracker()
    tracker.log_initial_state(array)
    n = len(array)
    
    for i in range(n):
        swapped = False
        for j in range(0, n - i - 1):
            # Log every comparison
            tracker.log_comparison([j, j + 1], array)
            
            if array[j] > array[j + 1]:
                # Perform swap
                array[j], array[j + 1] = array[j + 1], array[j]
                # Log the swap
                tracker.log_swap([j, j + 1], array)
                swapped = True
        
        # Early exit optimization
        if not swapped:
            break
    
    return tracker.finalize(array)
```

**Step Generation**:
- Logs comparison BEFORE checking condition
- Logs swap AFTER performing swap (so array snapshot shows swapped state)
- Array is modified in-place
- Early exit if no swaps occur in a pass

**Example Step Sequence for `[64, 34]`**:
1. `{type: "initial", array: [64, 34], indices: []}`
2. `{type: "comparison", array: [64, 34], indices: [0, 1]}`
3. `{type: "swap", array: [34, 64], indices: [0, 1]}`
4. `{type: "finished", array: [34, 64], indices: []}`

---

### Selection Sort

**File**: `backend/apps/sorting/algorithms/selection_sort.py`

**Algorithm Logic**:
```python
def selection_sort(array):
    tracker = StepTracker()
    tracker.log_initial_state(array)
    n = len(array)
    
    for i in range(n):
        min_idx = i
        # Find minimum in unsorted portion
        for j in range(i + 1, n):
            tracker.log_comparison([j, min_idx], array)
            if array[j] < array[min_idx]:
                min_idx = j
        
        # Swap if needed
        if min_idx != i:
            array[i], array[min_idx] = array[min_idx], array[i]
            tracker.log_swap([i, min_idx], array)
    
    return tracker.finalize(array)
```

**Key Differences from Bubble Sort**:
- Compares current element `j` with current minimum `min_idx`
- Only swaps once per outer loop iteration (when minimum is found)
- Swaps may involve non-adjacent indices (e.g., `[0, 5]`)

---

### Merge Sort

**File**: `backend/apps/sorting/algorithms/merge_sort.py`

**Algorithm Logic**:
```python
def merge_sort(array):
    tracker = StepTracker()
    tracker.log_initial_state(array)
    
    def merge(arr, l, m, r):
        # Create temporary arrays
        n1 = m - l + 1
        n2 = r - m
        L = [arr[l + i] for i in range(n1)]
        R = [arr[m + 1 + j] for j in range(n2)]
        
        i = j = 0
        k = l  # Start index for merged subarray
        
        # Merge the temp arrays back
        while i < n1 and j < n2:
            tracker.log_comparison([k], arr)
            if L[i] <= R[j]:
                arr[k] = L[i]
                tracker.log_overwrite([k], arr, L[i])
                i += 1
            else:
                arr[k] = R[j]
                tracker.log_overwrite([k], arr, R[j])
                j += 1
            k += 1
        
        # Copy remaining elements
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
    
    def merge_sort_helper(arr, l, r):
        if l < r:
            m = l + (r - l) // 2
            merge_sort_helper(arr, l, m)      # Sort left half
            merge_sort_helper(arr, m + 1, r)  # Sort right half
            merge(arr, l, m, r)               # Merge sorted halves
    
    merge_sort_helper(array, 0, len(array) - 1)
    return tracker.finalize(array)
```

**Key Characteristics**:
- Uses `log_overwrite()` instead of `log_swap()`
- Recursive divide-and-conquer approach
- Creates temporary arrays `L` and `R` for merging
- Each overwrite shows a single index being modified
- Comparison logs the position being written to (`[k]`)

**Why log_overwrite?**: Merge sort doesn't swap elements; it assigns values from temporary arrays back to the original array.

---

### Quick Sort

**File**: `backend/apps/sorting/algorithms/quick_sort.py`

**Algorithm Logic**:
```python
def quick_sort(array):
    tracker = StepTracker()
    tracker.log_initial_state(array)
    
    def partition(arr, low, high):
        i = low - 1
        pivot = arr[high]  # Last element as pivot
        
        for j in range(low, high):
            tracker.log_comparison([j, high], arr)
            if arr[j] < pivot:
                i += 1
                arr[i], arr[j] = arr[j], arr[i]
                tracker.log_swap([i, j], arr)
        
        # Place pivot in correct position
        arr[i + 1], arr[high] = arr[high], arr[i + 1]
        tracker.log_swap([i + 1, high], arr)
        return i + 1
    
    def quick_sort_helper(arr, low, high):
        if low < high:
            pi = partition(arr, low, high)
            quick_sort_helper(arr, low, pi - 1)   # Sort left of pivot
            quick_sort_helper(arr, pi + 1, high)  # Sort right of pivot
    
    quick_sort_helper(array, 0, len(array) - 1)
    return tracker.finalize(array)
```

**Key Characteristics**:
- Compares elements with pivot (located at `high` index)
- Swaps elements smaller than pivot to the left
- Final swap places pivot in its sorted position
- Recursive partitioning

---

### Heap Sort

**File**: `backend/apps/sorting/algorithms/heap_sort.py`

**Algorithm Logic**:
```python
def heap_sort(array):
    tracker = StepTracker()
    tracker.log_initial_state(array)
    n = len(array)
    
    def heapify(arr, n, i):
        largest = i
        l = 2 * i + 1  # Left child
        r = 2 * i + 2  # Right child
        
        if l < n:
            tracker.log_comparison([i, l], arr)
            if arr[l] > arr[largest]:
                largest = l
        
        if r < n:
            tracker.log_comparison([largest, r], arr)
            if arr[r] > arr[largest]:
                largest = r
        
        if largest != i:
            arr[i], arr[largest] = arr[largest], arr[i]
            tracker.log_swap([i, largest], arr)
            heapify(arr, n, largest)  # Recursively heapify affected subtree
    
    # Build max heap
    for i in range(n // 2 - 1, -1, -1):
        heapify(array, n, i)
    
    # Extract elements from heap one by one
    for i in range(n - 1, 0, -1):
        array[i], array[0] = array[0], array[i]  # Move current root to end
        tracker.log_swap([i, 0], array)
        heapify(array, i, 0)  # Heapify reduced heap
    
    return tracker.finalize(array)
```

**Key Characteristics**:
- Two-phase algorithm: build heap, then extract
- Compares parent with children (indices calculated as `2*i+1` and `2*i+2`)
- Swaps to maintain heap property
- Recursive heapify calls generate multiple swap sequences

---

## Frontend Deep Dive

### 1. API Service Layer

**File**: `frontend/src/services/api.js`

**Purpose**: Centralized HTTP client for backend communication

#### axios Instance Configuration:
```javascript
const api = axios.create({
    baseURL: 'http://localhost:8000/api',  // Backend base URL
    headers: {
        'Content-Type': 'application/json',  // JSON request/response
    },
});
```

#### sortArray Function:
```javascript
export const sortArray = async (algorithm, array, speed) => {
    try {
        const response = await api.post('/sort/', {
            algorithm,  // string: e.g., "bubble"
            array,      // number[]: e.g., [64, 34, 25]
            speed       // string: e.g., "medium" (unused by backend currently)
        });
        return response.data;  // Returns the response body directly
    } catch (error) {
        console.error("Error sorting array:", error);
        throw error;  // Re-throw for caller to handle
    }
};
```

**Return Type**: 
```typescript
{
  steps: Array<{
    array: number[],
    type: string,
    indices: number[],
    description: string,
    comparisons: number,
    swaps: number
  }>,
  sorted_array: number[],
  metrics: {
    comparisons: number,
    swaps: number,
    execution_time_ms: number
  },
  complexity: {
    time: string,
    space: string
  }
}
```

---

### 2. Main Visualizer Component

**File**: `frontend/src/pages/Visualizer.jsx`

**Component**: `Visualizer`

**Purpose**: Main orchestrator - manages state, fetches data, controls animation

#### State Variables:

| State | Type | Initial Value | Purpose |
|-------|------|---------------|---------|
| `algorithm` | `string` | `'bubble'` | Selected algorithm name |
| `arraySize` | `number` | `20` | Number of elements in array |
| `speed` | `number` | `50` | Animation delay in milliseconds |
| `array` | `number[]` | `[]` | Current array being visualized |
| `highlightIndices` | `number[]` | `[]` | Indices to highlight in BarChart |
| `highlightType` | `string` | `''` | Type of highlight: `'comparison'`, `'swap'`, `'overwrite'`, `'finished'` |
| `description` | `string` | `''` | Current step description text |
| `isSorting` | `boolean` | `false` | Whether animation is in progress |
| `metrics` | `object` | `{comparisons: 0, swaps: 0, execution_time_ms: 0}` | Current metrics |
| `complexity` | `object` | `{time: '-', space: '-'}` | Algorithm complexity info |

#### Refs:
```javascript
const animationRef = useRef(null);  // Stores setTimeout ID for animation loop
```

#### Key Functions:

##### 1. `generateRandomArray(size)`
```javascript
const generateRandomArray = (size) => {
    return Array.from({ length: size }, () => 
        Math.floor(Math.random() * 100) + 5  // Random int between 5-104
    );
};
```

##### 2. `handleGenerate()`
Generates a new random array and resets state:
```javascript
const handleGenerate = () => {
    if (isSorting) return;  // Prevent generation during animation
    const newArray = generateRandomArray(arraySize);
    setArray(newArray);
    setHighlightIndices([]);
    setHighlightType('');
    setDescription('Ready to sort');
    setMetrics({ comparisons: 0, swaps: 0, execution_time_ms: 0 });
    setComplexity({ time: '-', space: '-' });
};
```

##### 3. `handleSort()` - The Core Sorting Function
```javascript
const handleSort = async () => {
    if (isSorting) return;  // Prevent double-click
    
    try {
        setIsSorting(true);
        setDescription("Fetching steps...");
        
        // API Call
        const response = await sortArray(algorithm, array, "medium");
        // response = {steps: [...], sorted_array: [...], metrics: {...}, complexity: {...}}
        
        // Update metrics and complexity immediately
        setMetrics(response.metrics);
        setComplexity(response.complexity);
        
        // Start animation
        if (response.steps && response.steps.length > 0) {
            animate(response.steps, response.metrics);
        } else {
            setIsSorting(false);
            setDescription("Already sorted?");
        }
    } catch (error) {
        console.error(error);
        setIsSorting(false);
        setDescription("Error: Failed to fetch sorting steps.");
    }
};
```

**Flow**:
1. Set `isSorting` to true (disables controls)
2. Call `sortArray()` API function
3. Receive complete step data from backend
4. Update metrics/complexity state
5. Pass steps to `animate()` function

##### 4. `animate(allSteps, finalMetrics)` - Animation Loop
```javascript
const animate = (allSteps, finalMetrics) => {
    let stepIndex = 0;  // Local counter for current step
    
    const runLoop = () => {
        // Exit condition
        if (stepIndex >= allSteps.length) {
            setIsSorting(false);
            setDescription("Sorting Complete!");
            setHighlightType('finished');
            setHighlightIndices([]);
            if (finalMetrics) setMetrics(finalMetrics);
            return;
        }
        
        // Get current step
        const stepData = allSteps[stepIndex];
        
        // Update all visualization state
        setArray(stepData.array);                    // Update array display
        setHighlightIndices(stepData.indices || []); // Highlight active indices
        setHighlightType(stepData.type);             // Set color scheme
        setDescription(stepData.description);        // Update description text
        
        // Update real-time metrics
        if (typeof stepData.comparisons !== 'undefined') {
            setMetrics({
                comparisons: stepData.comparisons,
                swaps: stepData.swaps,
                execution_time_ms: finalMetrics ? finalMetrics.execution_time_ms : 0
            });
        }
        
        // Move to next step
        stepIndex++;
        
        // Schedule next iteration
        animationRef.current = setTimeout(runLoop, speed);
    };
    
    runLoop();  // Start the loop
};
```

**Animation Mechanics**:
- **Not using `setInterval`**: Uses recursive `setTimeout` for better control
- **Speed control**: `speed` state controls delay between steps
- **Step-by-step state updates**: Each iteration updates multiple state variables
- **Cleanup**: Stores timeout ID in `animationRef` for cancellation
- **Real-time metrics**: Updates comparison/swap counts as animation progresses

##### 5. `handleReset()`
```javascript
const handleReset = () => {
    clearTimeout(animationRef.current);  // Cancel any running animation
    setIsSorting(false);
    handleGenerate();  // Generate new random array
};
```

#### useEffect Hooks:

##### 1. Initial Array Generation
```javascript
useEffect(() => {
    handleGenerate();
}, []);  // Runs once on mount
```

##### 2. Array Size Change Handler
```javascript
useEffect(() => {
    handleGenerate();
}, [arraySize]);  // Regenerates array when size changes
```

##### 3. Cleanup on Unmount
```javascript
useEffect(() => {
    return () => clearTimeout(animationRef.current);
}, []);  // Clears any pending timeout when component unmounts
```

---

## UI Component Breakdown

### 1. Controls Component

**File**: `frontend/src/components/Controls.jsx`

**Purpose**: User input controls for algorithm selection, array size, speed, and actions

#### Props:
| Prop | Type | Description |
|------|------|-------------|
| `algorithm` | `string` | Current algorithm selection |
| `setAlgorithm` | `function` | State setter for algorithm |
| `arraySize` | `number` | Current array size |
| `setArraySize` | `function` | State setter for array size |
| `speed` | `number` | Current animation speed (ms) |
| `setSpeed` | `function` | State setter for speed |
| `onGenerate` | `function` | Callback for "New Array" button |
| `onSort` | `function` | Callback for "Sort" button |
| `onReset` | `function` | Callback for "Reset" button |
| `isSorting` | `boolean` | Whether sorting is in progress (disables controls) |

#### UI Elements:

##### Algorithm Select Dropdown:
```jsx
<select
    value={algorithm}
    onChange={(e) => setAlgorithm(e.target.value)}
    disabled={isSorting}
>
    <option value="bubble">Bubble Sort</option>
    <option value="selection">Selection Sort</option>
    <option value="insertion">Insertion Sort</option>
    <option value="merge">Merge Sort</option>
    <option value="quick">Quick Sort</option>
    <option value="heap">Heap Sort</option>
</select>
```
**Values**: Match backend `ALGORITHM_CHOICES` exactly

##### Array Size Range Slider:
```jsx
<input
    type="range"
    min="5"
    max="100"
    value={arraySize}
    onChange={(e) => setArraySize(Number(e.target.value))}
    disabled={isSorting}
/>
```
**Range**: 5-100 elements

##### Speed Select Dropdown:
```jsx
<select
    value={speed}
    onChange={(e) => setSpeed(Number(e.target.value))}
    disabled={isSorting}
>
    <option value={500}>Slow (500ms)</option>
    <option value={200}>Medium (200ms)</option>
    <option value={50}>Fast (50ms)</option>
    <option value={10}>Ultra Fast (10ms)</option>
</select>
```
**Values**: Milliseconds between animation steps

##### Action Buttons:
```jsx
<button onClick={onGenerate} disabled={isSorting}>New Array</button>
<button onClick={onSort} disabled={isSorting}>
    {isSorting ? 'Sorting...' : 'Sort'}
</button>
<button onClick={onReset}>Reset</button>
```

**Disabled State**: All controls disabled when `isSorting === true` except Reset button

---

### 2. BarChart Component

**File**: `frontend/src/components/BarChart.jsx`

**Purpose**: Renders the array as vertical bars with color-coded highlighting

#### Props:
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `array` | `number[]` | - | Current array to display |
| `highlightIndices` | `number[]` | `[]` | Indices to highlight |
| `highlightType` | `string` | `''` | Type of highlight for color selection |
| `description` | `string` | `''` | Text description to display above chart |

#### Rendering Logic:

##### 1. Max Value Calculation (for height scaling):
```javascript
const maxValue = useMemo(() => Math.max(...array, 100), [array]);
```
**Purpose**: Determines the tallest bar for relative height calculation
**Memo**: Recalculates only when array changes

##### 2. Value Display Toggle:
```javascript
const showValues = array.length <= 40;
```
**Purpose**: Only show numeric values when array is small enough (≤40 elements)

##### 3. Bar Color Logic:
```javascript
let bgColor = 'bg-blue-500';  // Default blue
let scale = 'scale-100';       // Default size

if (highlightIndices.includes(idx)) {
    if (highlightType === 'comparison') {
        bgColor = 'bg-yellow-400';  // Yellow for comparisons
    } else if (highlightType === 'swap') {
        bgColor = 'bg-red-500';     // Red for swaps
        scale = 'scale-110';        // Slightly larger for emphasis
    } else if (highlightType === 'overwrite') {
        bgColor = 'bg-purple-500';  // Purple for overwrites (merge sort)
    } else if (highlightType === 'finished') {
        bgColor = 'bg-green-500';   // Green when done
    }
} else if (highlightType === 'finished') {
    bgColor = 'bg-green-500';       // All bars green when finished
}
```

**Color Scheme**:
- **Blue** (`bg-blue-500`): Default/inactive
- **Yellow** (`bg-yellow-400`): Being compared
- **Red** (`bg-red-500`): Being swapped
- **Purple** (`bg-purple-500`): Being overwritten (merge sort)
- **Green** (`bg-green-500`): Sorted/finished

##### 4. Height Calculation:
```javascript
const heightPercent = (value / maxValue) * 100;

<div style={{ height: `${heightPercent}%` }}>
```
**Purpose**: Bars scale proportionally to container height

##### 5. Bar Width Calculation:
```javascript
style={{ width: `${100 / array.length}%` }}
```
**Purpose**: Distribute full width evenly across all bars

##### 6. Value Labels (conditional):
```jsx
{showValues && (
    <span className="text-xs font-bold text-white">
        {value}
    </span>
)}
```
**Display**: Only when `array.length <= 40`

##### 7. Index Labels (conditional):
```jsx
{showValues && (
    <div className="flex justify-center w-full space-x-1 mt-1 border-t pt-1">
        {array.map((_, idx) => (
            <div key={idx} style={{ width: `${100 / array.length}%` }}>
                {idx}
            </div>
        ))}
    </div>
)}
```
**Display**: Row of index numbers below bars when ≤40 elements

##### 8. Description Overlay:
```jsx
<div className="absolute top-2 left-4 bg-white/80 px-3 py-1 rounded">
    <p className="text-sm font-semibold text-gray-700">
        {description || "Ready to sort..."}
    </p>
</div>
```
**Position**: Top-left corner of chart
**Content**: Current step description from backend

---

### 3. MetricsPanel Component

**File**: `frontend/src/components/MetricsPanel.jsx`

**Purpose**: Displays algorithm metrics and complexity analysis

#### Props:
| Prop | Type | Description |
|------|------|-------------|
| `metrics` | `object` | `{comparisons, swaps, execution_time_ms}` |
| `complexity` | `object` | `{time, space}` |
| `algorithm` | `string` | Current algorithm name |

#### Display Sections:

##### 1. Algorithm Name Display:
```javascript
const algoDisplay = algorithm.charAt(0).toUpperCase() + algorithm.slice(1) + " Sort";
// "bubble" → "Bubble Sort"
```

##### 2. Metrics Grid:
```jsx
<div className="grid grid-cols-2 gap-4">
    <div className="bg-gray-50 p-3 rounded-md">
        <p className="text-xs text-gray-500">Comparisons</p>
        <p className="font-mono text-lg font-bold">{metrics.comparisons}</p>
    </div>
    <div className="bg-gray-50 p-3 rounded-md">
        <p className="text-xs text-gray-500">Swaps</p>
        <p className="font-mono text-lg font-bold">{metrics.swaps}</p>
    </div>
</div>
```
**Layout**: 2-column grid
**Font**: Monospace for numeric values

##### 3. Execution Time:
```jsx
<div className="bg-blue-50 p-3 rounded-md border border-blue-100">
    <p className="text-xs text-blue-600">Execution Time (Backend)</p>
    <p className="font-mono text-lg font-bold text-blue-800">
        {metrics.execution_time_ms} <span className="text-sm">ms</span>
    </p>
</div>
```
**Note**: This is the server-side execution time, NOT animation time

##### 4. Complexity Analysis:
```jsx
<div className="space-y-2">
    <div className="flex justify-between items-center text-sm">
        <span className="text-gray-600">Time Complexity:</span>
        <span className="font-mono bg-gray-100 px-2 py-1 rounded text-purple-600">
            {complexity.time || '-'}
        </span>
    </div>
    <div className="flex justify-between items-center text-sm">
        <span className="text-gray-600">Space Complexity:</span>
        <span className="font-mono bg-gray-100 px-2 py-1 rounded text-green-600">
            {complexity.space || '-'}
        </span>
    </div>
</div>
```
**Values**: Static strings from backend (e.g., `"O(n^2)"`, `"O(1)"`)

---

## Complete Data Flow

### User Clicks "Sort" Button → Final Animation

#### Step-by-Step Flow:

1. **User Action**:
   - User clicks "Sort" button in `Controls` component
   - `onSort` prop triggers `handleSort()` in `Visualizer`

2. **State Update**:
   ```javascript
   setIsSorting(true);  // Disables all controls
   setDescription("Fetching steps...");
   ```

3. **HTTP Request**:
   ```javascript
   // frontend/src/services/api.js
   const response = await axios.post('http://localhost:8000/api/sort/', {
       algorithm: "bubble",
       array: [64, 34, 25, 12, 22, 11, 90],
       speed: "medium"
   });
   ```

4. **Backend: Request Handling**:
   ```python
   # backend/apps/sorting/api/views.py
   serializer = SortRequestSerializer(data=request.data)
   serializer.is_valid()  # Validates algorithm choice and array
   algorithm = "bubble"
   array = [64, 34, 25, 12, 22, 11, 90]
   ```

5. **Backend: SortFactory**:
   ```python
   # backend/apps/sorting/services/sort_factory.py
   algo_info = ALGORITHM_MAP['bubble']
   # algo_info = {
   #     'func': bubble_sort,
   #     'time_complexity': 'O(n^2)',
   #     'space_complexity': 'O(1)'
   # }
   ```

6. **Backend: Algorithm Execution**:
   ```python
   # backend/apps/sorting/algorithms/bubble_sort.py
   tracker = StepTracker()
   tracker.log_initial_state([64, 34, 25, 12, 22, 11, 90])
   # tracker.steps = [
   #     {array: [64,34,25,12,22,11,90], type: "initial", indices: [], ...}
   # ]
   
   # First comparison
   tracker.log_comparison([0, 1], [64, 34, 25, 12, 22, 11, 90])
   # Increments comparisons to 1
   # Appends: {array: [64,34,...], type: "comparison", indices: [0,1], ...}
   
   # First swap (64 > 34)
   array[0], array[1] = array[1], array[0]  # array = [34, 64, ...]
   tracker.log_swap([0, 1], [34, 64, 25, 12, 22, 11, 90])
   # Increments swaps to 1
   # Appends: {array: [34,64,...], type: "swap", indices: [0,1], ...}
   
   # ... continues for all comparisons/swaps ...
   
   return tracker.finalize([11, 12, 22, 25, 34, 64, 90])
   # Returns {
   #     steps: [...],  # All logged steps
   #     sorted_array: [11, 12, 22, 25, 34, 64, 90],
   #     metrics: {comparisons: 21, swaps: 12, execution_time_ms: 0.0234}
   # }
   ```

7. **Backend: Response Assembly**:
   ```python
   # backend/apps/sorting/services/sort_factory.py
   result['complexity'] = {
       'time': 'O(n^2)',
       'space': 'O(1)'
   }
   # Final result = {
   #     steps: [...],
   #     sorted_array: [...],
   #     metrics: {...},
   #     complexity: {time: "O(n^2)", space: "O(1)"}
   # }
   ```

8. **Backend: HTTP Response**:
   ```python
   # backend/apps/sorting/api/views.py
   return Response(result, status=200)
   # Returns JSON with all step data
   ```

9. **Frontend: Response Received**:
   ```javascript
   // frontend/src/pages/Visualizer.jsx
   const response = await sortArray(...);
   // response = {
   //     steps: [{...}, {...}, ...],
   //     sorted_array: [...],
   //     metrics: {...},
   //     complexity: {...}
   // }
   
   setMetrics(response.metrics);
   setComplexity(response.complexity);
   ```

10. **Frontend: Animation Starts**:
    ```javascript
    animate(response.steps, response.metrics);
    
    // Animation loop begins:
    // stepIndex = 0
    const stepData = allSteps[0];  // First step (initial state)
    setArray(stepData.array);
    setHighlightIndices(stepData.indices);
    setHighlightType(stepData.type);
    setDescription(stepData.description);
    
    // After 'speed' milliseconds (e.g., 50ms):
    // stepIndex = 1
    const stepData = allSteps[1];  // First comparison
    setArray(stepData.array);       // Same array
    setHighlightIndices([0, 1]);    // Highlight first two bars
    setHighlightType("comparison"); // Yellow color
    setDescription("Comparing 64, 34");
    setMetrics({comparisons: 1, swaps: 0, ...});
    
    // After another 50ms:
    // stepIndex = 2
    const stepData = allSteps[2];  // First swap
    setArray([34, 64, ...]);        // Updated array
    setHighlightIndices([0, 1]);    // Same indices
    setHighlightType("swap");       // Red color + scale effect
    setDescription("Swapping indices 0 and 1");
    setMetrics({comparisons: 1, swaps: 1, ...});
    
    // ... continues until stepIndex >= allSteps.length ...
    ```

11. **Frontend: BarChart Renders**:
    ```jsx
    // For each step, BarChart re-renders with new props:
    array.map((value, idx) => {
        let bgColor = 'bg-blue-500';
        
        if (highlightIndices.includes(idx)) {  // [0, 1]
            if (highlightType === 'comparison') {
                bgColor = 'bg-yellow-400';  // Bars 0 and 1 turn yellow
            } else if (highlightType === 'swap') {
                bgColor = 'bg-red-500';     // Bars 0 and 1 turn red
                scale = 'scale-110';         // Bars grow slightly
            }
        }
        
        const heightPercent = (value / maxValue) * 100;
        return <div style={{height: `${heightPercent}%`}} className={bgColor} />;
    });
    ```

12. **Frontend: MetricsPanel Updates**:
    ```jsx
    <div>{metrics.comparisons}</div>  // Shows incrementing count
    <div>{metrics.swaps}</div>        // Shows incrementing count
    <div>{complexity.time}</div>      // Shows "O(n^2)"
    ```

13. **Frontend: Animation Completion**:
    ```javascript
    // When stepIndex >= allSteps.length:
    setIsSorting(false);               // Re-enable controls
    setDescription("Sorting Complete!");
    setHighlightType('finished');      // All bars turn green
    setHighlightIndices([]);
    ```

---

## Key Technical Details

### 1. Why Deep Copy in StepTracker?
```python
"array": copy.deepcopy(array)
```
**Reason**: Python lists are mutable references. Without deep copy, all steps would reference the same final sorted array. Deep copy captures the array state at each moment.

### 2. Why setTimeout Instead of setInterval?
```javascript
animationRef.current = setTimeout(runLoop, speed);
```
**Reason**: 
- `setInterval` can queue up calls if execution takes longer than interval
- Recursive `setTimeout` ensures each step completes before scheduling next
- Easier to cancel and control flow

### 3. Why Log Comparison Before Swap?
```python
tracker.log_comparison([j, j + 1], array)  # Array before swap
if array[j] > array[j + 1]:
    array[j], array[j + 1] = array[j + 1], array[j]
    tracker.log_swap([j, j + 1], array)    # Array after swap
```
**Reason**: Users see the comparison visually BEFORE the swap happens, matching mental model of algorithm execution.

### 4. Why Merge Sort Uses log_overwrite?
```python
arr[k] = L[i]
tracker.log_overwrite([k], arr, L[i])
```
**Reason**: 
- Merge sort doesn't swap two elements
- It assigns values from temporary arrays back
- Visual distinction: purple color vs red for swaps
- Doesn't increment swap counter (separate operation type)

### 5. Animation Speed Control
```javascript
setTimeout(runLoop, speed);  // speed = 50ms
```
**Frontend Only**: Speed only affects animation delay. Backend execution is always full speed. The `speed` parameter sent to backend is currently unused.

### 6. Metrics Update Timing
```javascript
// Step-by-step metrics updates during animation
setMetrics({
    comparisons: stepData.comparisons,  // From each step
    swaps: stepData.swaps,
    execution_time_ms: finalMetrics.execution_time_ms  // Static from final
});
```
**Behavior**: Comparison and swap counts animate; execution time is constant (backend processing time).

### 7. Disable Controls During Sorting
```jsx
disabled={isSorting}
```
**Reason**: Prevent state changes mid-animation (changing algorithm, size, generating new array) which would cause inconsistent visualization.

### 8. Array Value Range
```javascript
Math.floor(Math.random() * 100) + 5  // 5-104
```
**Range**: 5-104 ensures bars are visible (min height 5) and fits well visually.

### 9. showValues Threshold
```javascript
const showValues = array.length <= 40;
```
**Reason**: With >40 elements, numeric labels overlap and become unreadable. Auto-hide for better UX.

### 10. Color Coding Philosophy
- **Yellow**: "Looking" (comparison, reading)
- **Red**: "Changing" (swap, destructive operation)
- **Purple**: "Writing" (overwrite, assignment)
- **Green**: "Done" (finished, sorted)
- **Blue**: "Neutral" (default, inactive)

---

## Summary of File Responsibilities

| File | Responsibility |
|------|----------------|
| **Backend** | |
| `backend/sorting_visualizer/urls.py` | Main URL router, includes app URLs under `/api/` |
| `backend/apps/sorting/api/urls.py` | Sorting API routes, defines `/sort/` endpoint |
| `backend/apps/sorting/api/views.py` | Request handler, deserializes input, calls SortFactory, returns response |
| `backend/apps/sorting/api/serializers.py` | Input/output validation schemas |
| `backend/apps/sorting/services/sort_factory.py` | Algorithm selector, adds complexity metadata |
| `backend/apps/sorting/services/step_tracker.py` | Step recording, metrics calculation, result assembly |
| `backend/apps/sorting/algorithms/*.py` | Individual sorting algorithm implementations |
| **Frontend** | |
| `frontend/src/main.jsx` | React app entry point |
| `frontend/src/App.jsx` | Root component, routing (if any) |
| `frontend/src/services/api.js` | HTTP client, API call wrapper |
| `frontend/src/pages/Visualizer.jsx` | Main page, state orchestration, animation control |
| `frontend/src/components/Controls.jsx` | User input controls (algorithm, size, speed, buttons) |
| `frontend/src/components/BarChart.jsx` | Array visualization with color-coded highlighting |
| `frontend/src/components/MetricsPanel.jsx` | Metrics and complexity display |

---

## Request/Response Contract Summary

### Request Schema:
```typescript
POST /api/sort/
{
  algorithm: "bubble" | "selection" | "insertion" | "merge" | "quick" | "heap",
  array: number[],  // Non-empty array of integers
  speed?: string    // Optional, currently unused
}
```

### Response Schema:
```typescript
200 OK
{
  steps: Array<{
    array: number[],              // Deep copy of array at this step
    type: "initial" | "comparison" | "swap" | "overwrite" | "finished",
    indices: number[],            // Indices involved in operation
    description: string,          // Human-readable description
    comparisons: number,          // Total comparisons so far
    swaps: number                 // Total swaps so far
  }>,
  sorted_array: number[],         // Final sorted array
  metrics: {
    comparisons: number,          // Total comparison operations
    swaps: number,                // Total swap operations
    execution_time_ms: number     // Backend execution time (float)
  },
  complexity: {
    time: string,                 // e.g., "O(n^2)"
    space: string                 // e.g., "O(1)"
  }
}
```

---

## Animation State Machine

```
[IDLE STATE]
  ↓ User clicks "Sort"
[FETCHING]
  isSorting = true
  description = "Fetching steps..."
  ↓ API call completes
[ANIMATING - Loop]
  For each step:
    - Update array display
    - Highlight indices
    - Apply color (yellow/red/purple)
    - Update description
    - Update metrics
    - Wait 'speed' ms
  ↓ All steps complete
[FINISHED]
  highlightType = "finished"
  All bars turn green
  description = "Sorting Complete!"
  isSorting = false
  ↓ User clicks "Reset" or "New Array"
[IDLE STATE]
```

---

## Performance Considerations

1. **Backend Execution**: Typically <1ms for arrays up to 100 elements
2. **Network Latency**: Main bottleneck (typically 10-100ms for localhost)
3. **Animation Duration**: Depends on steps count × speed setting
   - Bubble sort on 20 elements ≈ 200 steps × 50ms = 10 seconds
   - Quick sort on 20 elements ≈ 80 steps × 50ms = 4 seconds
4. **React Re-renders**: Optimized with `useMemo` in BarChart for max value calculation
5. **Deep Copy Overhead**: Backend creates deep copy for each step, acceptable for arrays <100 elements

---

## Extension Points

### Adding a New Algorithm:

1. **Create algorithm file**: `backend/apps/sorting/algorithms/new_algo.py`
   ```python
   from ..services.step_tracker import StepTracker
   
   def new_algo(array):
       tracker = StepTracker()
       tracker.log_initial_state(array)
       # Algorithm logic with tracker.log_comparison/swap/overwrite calls
       return tracker.finalize(array)
   ```

2. **Import in sort_factory.py**:
   ```python
   from ..algorithms.new_algo import new_algo
   ```

3. **Add to ALGORITHM_MAP**:
   ```python
   'newalgo': {
       'func': new_algo,
       'time_complexity': 'O(?)',
       'space_complexity': 'O(?)'
   }
   ```

4. **Add to serializer choices**:
   ```python
   ALGORITHM_CHOICES = [
       # ...
       ('newalgo', 'New Algorithm'),
   ]
   ```

5. **Add to frontend dropdown**:
   ```jsx
   <option value="newalgo">New Algorithm</option>
   ```

No other changes needed! The framework handles everything else.

---

This documentation provides a complete technical breakdown of data structures, API contracts, state management, and rendering logic for the DAA Sorting Visualizer project.
