import React, { useState, useEffect, useRef } from 'react';
import Controls from '../components/Controls';
import BarChart from '../components/BarChart';
import MetricsPanel from '../components/MetricsPanel';
import { sortArray } from '../services/api';

const generateRandomArray = (size) => {
    return Array.from({ length: size }, () => Math.floor(Math.random() * 100) + 5);
};

const Visualizer = () => {
    const [algorithm, setAlgorithm] = useState('bubble');
    const [arraySize, setArraySize] = useState(20);
    const [speed, setSpeed] = useState(50);
    const [array, setArray] = useState([]);

    // Visualization State
    const [highlightIndices, setHighlightIndices] = useState([]);
    const [highlightType, setHighlightType] = useState('');
    const [description, setDescription] = useState('');

    const [isSorting, setIsSorting] = useState(false);

    // Metrics State
    const [metrics, setMetrics] = useState({ comparisons: 0, swaps: 0, execution_time_ms: 0 });
    const [complexity, setComplexity] = useState({ time: '-', space: '-' });

    const animationRef = useRef(null);

    // Initialize random array
    useEffect(() => {
        handleGenerate();
    }, []);

    // Regenerate when size changes
    useEffect(() => {
        handleGenerate();
    }, [arraySize]);

    const handleGenerate = () => {
        if (isSorting) return;
        const newArray = generateRandomArray(arraySize);
        setArray(newArray);
        setHighlightIndices([]);
        setHighlightType('');
        setDescription('Ready to sort');
        setMetrics({ comparisons: 0, swaps: 0, execution_time_ms: 0 });
        setComplexity({ time: '-', space: '-' });
    };

    const handleSort = async () => {
        if (isSorting) return;

        try {
            setIsSorting(true);
            setDescription("Fetching steps...");
            // Call backend
            const response = await sortArray(algorithm, array, "medium");

            // Setup visualization
            setMetrics(response.metrics);
            setComplexity(response.complexity);

            // Start animation loop
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

    const animate = (allSteps, finalMetrics) => {
        let stepIndex = 0;

        const runLoop = () => {
            if (stepIndex >= allSteps.length) {
                setIsSorting(false);
                setDescription("Sorting Complete!");
                setHighlightType('finished');
                setHighlightIndices([]);
                // Ensure final metrics match
                if (finalMetrics) setMetrics(finalMetrics);
                return;
            }

            const stepData = allSteps[stepIndex];

            setArray(stepData.array);
            setHighlightIndices(stepData.indices || []);
            setHighlightType(stepData.type);
            setDescription(stepData.description);

            // Update real-time metrics if available in step data
            if (typeof stepData.comparisons !== 'undefined') {
                setMetrics({
                    comparisons: stepData.comparisons,
                    swaps: stepData.swaps,
                    execution_time_ms: finalMetrics ? finalMetrics.execution_time_ms : 0
                });
            }

            stepIndex++;

            animationRef.current = setTimeout(runLoop, speed);
        };

        runLoop();
    };

    const handleReset = () => {
        clearTimeout(animationRef.current);
        setIsSorting(false);
        handleGenerate();
    };

    // Cancel animation on unmount
    useEffect(() => {
        return () => clearTimeout(animationRef.current);
    }, []);

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
            {/* Header */}
            <header className="bg-white shadow-sm sticky top-0 z-10">
                <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                        <div className="w-8 h-8 bg-blue-600 rounded-md flex items-center justify-center text-white font-bold">
                            AL
                        </div>
                        <h1 className="text-xl font-bold text-gray-800 tracking-tight">
                            DAA Sort Visualizer
                        </h1>
                    </div>
                </div>
            </header>

            <main className="flex-1 max-w-7xl mx-auto px-4 py-8 w-full flex flex-col md:flex-row gap-6">

                {/* Left/Main Column: Visuals & Controls */}
                <div className="flex-1 flex flex-col">
                    <Controls
                        algorithm={algorithm}
                        setAlgorithm={setAlgorithm}
                        arraySize={arraySize}
                        setArraySize={setArraySize}
                        speed={speed}
                        setSpeed={setSpeed}
                        onGenerate={handleGenerate}
                        onSort={handleSort}
                        onReset={handleReset}
                        isSorting={isSorting}
                    />

                    <BarChart
                        array={array}
                        highlightIndices={highlightIndices}
                        highlightType={highlightType}
                        description={description}
                    />

                    {/* Educational Note */}
                    <div className="mt-6 bg-blue-50 border-l-4 border-blue-500 p-4 rounded-r-md">
                        <h4 className="font-bold text-blue-900">Algorithm Logic:</h4>
                        <p className="text-blue-800 text-sm mt-1">
                            Watch the yellow bars for comparisons and red/purple bars for swaps/assignments.
                            The backend tracks every operations step-by-step.
                        </p>
                    </div>
                </div>

                {/* Right Column: Metrics */}
                <MetricsPanel
                    metrics={metrics}
                    complexity={complexity}
                    algorithm={algorithm}
                />
            </main>
        </div>
    );
};

export default Visualizer;
