import React, { useState, useEffect, useRef } from 'react';
import Controls from '../components/Controls';
import BarChart from '../components/BarChart';
import MetricsPanel from '../components/MetricsPanel';
import DivideConquerTree from '../components/DivideConquerTree';
import { sortArray } from '../services/api';

const generateRandomArray = (size) => {
    return Array.from({ length: size }, () => Math.floor(Math.random() * 100) + 5);
};

const Visualizer = ({ darkMode, toggleDarkMode }) => {
    const [algorithm, setAlgorithm] = useState('bubble');
    const [arraySize, setArraySize] = useState(16); // Lower default for tree viz
    const [speed, setSpeed] = useState(200); // Slower default for tree viz
    const [array, setArray] = useState([]);

    // Visualization State
    const [highlightIndices, setHighlightIndices] = useState([]);
    const [highlightType, setHighlightType] = useState('');
    const [description, setDescription] = useState('');
    const [dcTree, setDcTree] = useState(null);

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
        setDcTree(null); // Clear tree
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
            setDcTree(response.dc_tree || null); // Set tree if available

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
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col font-sans transition-colors duration-300">
            {/* Header */}
            <header className="sticky top-0 z-20 backdrop-blur-md bg-white/70 dark:bg-gray-900/80 border-b border-gray-200 dark:border-gray-800 shadow-sm">
                <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center text-white font-bold shadow-lg transform rotate-3">
                            <span className="transform -rotate-3 text-lg">AL</span>
                        </div>
                        <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 tracking-tight">
                            DAA Sort Visualizer
                        </h1>
                    </div>

                    <button
                        onClick={toggleDarkMode}
                        className="p-2 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        aria-label="Toggle Dark Mode"
                    >
                        {darkMode ? (
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 100 2h1z" clipRule="evenodd" />
                            </svg>
                        ) : (
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
                            </svg>
                        )}
                    </button>
                </div>
            </header>

            <main className="flex-1 max-w-7xl mx-auto px-4 py-8 w-full flex flex-col gap-8">
                {/* Controls - Top */}
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

                {/* Main Content Area */}
                <div className="flex flex-col lg:flex-row gap-6 w-full items-start">

                    {/* Left Column: Visualization */}
                    <div className="flex-1 w-full flex flex-col gap-6">
                        <BarChart
                            array={array}
                            highlightIndices={highlightIndices}
                            highlightType={highlightType}
                            description={description}
                        />

                        {/* Educational Note */}
                        <div className="bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-500 p-5 rounded-r-lg shadow-sm">
                            <h4 className="font-bold text-blue-900 dark:text-blue-300 flex items-center gap-2">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                                </svg>
                                Algorithm Logic
                            </h4>
                            <p className="text-blue-800 dark:text-blue-200 text-sm mt-1 ml-7">
                                Current Step: <span className="font-semibold text-gray-800 dark:text-white">{description}</span>
                            </p>
                        </div>
                    </div>

                    {/* Right Column: Tree & Metrics */}
                    <div className="w-full lg:w-96 flex flex-col gap-6 flex-shrink-0">
                        {/* Recursive Tree (Conditional) */}
                        {dcTree && (
                            <DivideConquerTree
                                tree={dcTree}
                                highlightIndices={highlightIndices}
                                currentPhase={highlightType}
                                algoType={algorithm}
                            />
                        )}

                        <MetricsPanel
                            metrics={metrics}
                            complexity={complexity}
                            algorithm={algorithm}
                        />
                    </div>
                </div>
            </main>
        </div>
    );
};

export default Visualizer;
