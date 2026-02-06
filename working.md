# Sorting Visualizer Project - Detailed Working Documentation

## Overview
This project is a web-based sorting algorithm visualizer consisting of a Django REST API backend and a React frontend. The backend implements various sorting algorithms and tracks their execution steps, while the frontend visualizes the sorting process in real-time with animated bar charts.

## Backend Architecture

### API Endpoints
- **POST /api/sort/**: Main sorting endpoint that accepts sorting requests and returns step-by-step execution data.

### Data Structures

#### Request Data (Frontend to Backend)
Sent as JSON in POST body to `/api/sort/`:
```json
{
  "algorithm": "string",  // One of: 'bubble', 'selection', 'insertion', 'merge', 'quick', 'heap'
  "array": "array of integers",  // Non-empty list of integers to be sorted
  "speed": "string"  // Optional, default "medium" (currently not used in backend logic)
}
```

#### Response Data (Backend to Frontend)
Returned as JSON from `/api/sort/`:
```json
{
  "steps": [
    {
      "array": [int, int, ...],  // Deep copy of array at this step
      "type": "string",  // One of: "initial", "comparison", "swap", "overwrite", "finished"
      "indices": [int, int, ...],  // Indices involved in the operation (e.g., [0, 1] for comparison/swap)
      "description": "string",  // Human-readable description of the step
      "comparisons": int,  // Cumulative comparison count up to this step
      "swaps": int  // Cumulative swap count up to this step
    },
    ...
  ],
  "sorted_array": [int, int, ...],  // Final sorted array
  "metrics": {
    "comparisons": int,  // Total number of comparisons performed
    "swaps": int,  // Total number of swaps performed
    "execution_time_ms": float  // Backend execution time in milliseconds (rounded to 4 decimal places)
  },
  "complexity": {
    "time": "string",  // Time complexity notation (e.g., "O(n^2)", "O(n log n)")
    "space": "string"  // Space complexity notation (e.g., "O(1)", "O(n)")
  }
}
```

### Backend File Responsibilities

#### `backend/apps/sorting/api/views.py`
- Contains `SortView` class that handles POST requests to `/api/sort/`
- Validates incoming data using `SortRequestSerializer`
- Calls `SortFactory.sort()` with algorithm name and array
- Returns the sorting result or error responses

#### `backend/apps/sorting/api/serializers.py`
- `SortRequestSerializer`: Validates incoming request data
  - `algorithm`: ChoiceField with predefined algorithm options
  - `array`: ListField of integers, cannot be empty
  - `speed`: Optional CharField, defaults to "medium"
- `SortResponseSerializer`: Defines structure for response data (used for documentation, not actual serialization in current code)

#### `backend/apps/sorting/services/sort_factory.py`
- `SortFactory` class with static `sort()` method
- Maps algorithm names to their implementation functions and complexity data
- Calls the appropriate sorting function based on algorithm name
- Adds complexity information to the result returned by the sorting function

#### `backend/apps/sorting/services/step_tracker.py`
- `StepTracker` class that tracks sorting execution steps
- Methods:
  - `log_initial_state()`: Records initial array state
  - `log_comparison()`: Records comparison operations with indices and values
  - `log_swap()`: Records swap operations with indices
  - `log_overwrite()`: Records value overwrites (used in merge sort)
  - `finalize()`: Calculates execution time and returns complete result dictionary
- Maintains counters for comparisons and swaps
- Creates deep copies of arrays for each step to preserve state history

#### `backend/apps/sorting/algorithms/*.py` (e.g., `bubble_sort.py`)
- Each file implements one sorting algorithm
- Uses `StepTracker` to log operations during sorting
- Returns the result from `tracker.finalize(array)`
- Algorithm-specific logic:
  - Bubble sort: Nested loops with comparison and conditional swap
  - Selection sort: Finds minimum in unsorted portion and swaps
  - Insertion sort: Builds sorted portion by inserting elements
  - Merge sort: Recursive divide-and-conquer with merge operations
  - Quick sort: Partition-based recursive sorting
  - Heap sort: Heapify and extract operations

## Frontend Architecture

### Components and File Responsibilities

#### `frontend/src/pages/Visualizer.jsx`
- Main page component that orchestrates the entire visualization
- State management:
  - `algorithm`, `arraySize`, `speed`: User input controls
  - `array`: Current array being visualized
  - `highlightIndices`, `highlightType`: For bar highlighting during animation
  - `description`: Current step description
  - `isSorting`: Boolean flag for UI state
  - `metrics`, `complexity`: Data from backend response
- Methods:
  - `handleGenerate()`: Creates new random array of specified size
  - `handleSort()`: Calls API, sets up animation with response data
  - `animate()`: Recursive function that steps through sorting animation
  - `handleReset()`: Stops animation and regenerates array
- Renders: Header, Controls, BarChart, MetricsPanel

#### `frontend/src/components/Controls.jsx`
- User interface for controlling the visualization
- Props: All state setters and handlers from Visualizer
- Elements:
  - Algorithm dropdown: Selects sorting algorithm
  - Array size slider: Range input (5-100) with live value display
  - Speed dropdown: Selects animation speed in milliseconds
  - Action buttons: "New Array", "Sort", "Reset"
- Disables controls during sorting to prevent state conflicts

#### `frontend/src/components/BarChart.jsx`
- Renders the animated bar chart visualization
- Props:
  - `array`: Current array values for bar heights
  - `highlightIndices`: Array of indices to highlight
  - `highlightType`: Type of highlight ("comparison", "swap", "overwrite", "finished")
  - `description`: Current step description for overlay
- Features:
  - Calculates bar heights as percentage of max value
  - Color coding: Blue (default), Yellow (comparison), Red (swap), Purple (overwrite), Green (finished)
  - Scale effect on swaps for visual emphasis
  - Shows values and indices when array size ≤ 40
  - Description overlay at top-left

#### `frontend/src/components/MetricsPanel.jsx`
- Displays sorting metrics and complexity information
- Props: `metrics`, `complexity`, `algorithm`
- Displays:
  - Algorithm name (formatted)
  - Comparisons count
  - Swaps count
  - Execution time in milliseconds
  - Time and space complexity notations

#### `frontend/src/services/api.js`
- Axios-based API client for backend communication
- `sortArray()` function: Makes POST request to `/api/sort/` with algorithm, array, speed
- Returns response data or throws error

### Frontend Data Flow

1. **Initialization**: `Visualizer` generates random array on mount and size change
2. **User Input**: Controls component updates state in Visualizer
3. **Sort Trigger**: `handleSort()` calls `api.sortArray()` with current state
4. **Response Processing**: Backend response sets metrics, complexity, and starts animation
5. **Animation Loop**: `animate()` function iterates through steps array:
   - Updates array state with step's array
   - Sets highlight indices and type
   - Updates description
   - Updates real-time metrics from step data
   - Schedules next step with setTimeout based on speed
6. **Completion**: Animation stops, final state displayed

### Animation Details
- Each step in the `steps` array represents one operation (comparison, swap, etc.)
- Animation speed controlled by user-selected delay between steps
- Real-time metrics update as animation progresses
- Highlighting provides visual feedback for current operation
- Description text explains what's happening at each step

## Data Flow Between Frontend and Backend

1. **Frontend Request**:
   - User clicks "Sort" button
   - `Visualizer.handleSort()` calls `api.sortArray(algorithm, array, speed)`
   - POST request sent to `http://localhost:8000/api/sort/` with JSON payload

2. **Backend Processing**:
   - `SortView.post()` receives request
   - Validates data with `SortRequestSerializer`
   - Calls `SortFactory.sort(algorithm, array)`
   - `SortFactory` looks up algorithm function and calls it
   - Algorithm implementation uses `StepTracker` to log each operation
   - `StepTracker.finalize()` calculates metrics and returns result
   - `SortFactory` adds complexity data
   - Result returned as JSON response

3. **Frontend Response Handling**:
   - Response data destructured into `steps`, `metrics`, `complexity`
   - `animate()` function starts with the steps array
   - Each animation frame updates UI with step data
   - Metrics panel updated with final/backend metrics

## Detailed Field Descriptions

### Steps Array Structure
Each step object in the `steps` array contains:
- `array`: Immutable snapshot of the entire array at that moment
- `type`: Operation type for frontend highlighting logic
- `indices`: Specific elements involved (e.g., compared indices, swapped positions)
- `description`: User-friendly explanation of the operation
- `comparisons`/`swaps`: Running totals for real-time display

### Metrics Object
- `comparisons`: Total element comparisons (e.g., `array[j] > array[j+1]`)
- `swaps`: Total element exchanges (assignments in sorting)
- `execution_time_ms`: Actual backend processing time, not animation time

### Complexity Object
- Static values based on algorithm type, not calculated from actual run
- Time: Worst-case asymptotic complexity
- Space: Auxiliary space requirements

This architecture allows for detailed step-by-step visualization while maintaining clean separation between sorting logic (backend) and presentation (frontend).</content>
<parameter name="filePath">D:\Project\SEM_5\DAA\working.md