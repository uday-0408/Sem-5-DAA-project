import React from 'react';

const Controls = ({
    algorithm,
    setAlgorithm,
    arraySize,
    setArraySize,
    speed,
    setSpeed,
    onGenerate,
    onSort,
    onReset,
    isSorting
}) => {
    return (
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700 transition-all duration-300">
            <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-4 flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-500" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
                </svg>
                Configuration
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                {/* Algorithm Selection */}
                <div className="group">
                    <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-2 group-hover:text-blue-500 transition-colors">
                        Algorithm
                    </label>
                    <div className="relative">
                        <select
                            value={algorithm}
                            onChange={(e) => setAlgorithm(e.target.value)}
                            disabled={isSorting}
                            className="w-full pl-4 pr-10 py-2.5 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all appearance-none disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <option value="bubble">Bubble Sort</option>
                            <option value="selection">Selection Sort</option>
                            <option value="insertion">Insertion Sort</option>
                            <option value="merge">Merge Sort</option>
                            <option value="quick">Quick Sort</option>
                            <option value="heap">Heap Sort</option>
                        </select>
                        <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                            <svg className="w-5 h-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                            </svg>
                        </div>
                    </div>
                </div>

                {/* Array Size */}
                <div className="group">
                    <label className="flex justify-between text-sm font-medium text-gray-600 dark:text-gray-400 mb-2 group-hover:text-blue-500 transition-colors">
                        <span>Array Size</span>
                        <span className="text-blue-600 dark:text-blue-400 font-bold">{arraySize}</span>
                    </label>
                    <input
                        type="range"
                        min="5"
                        max="64"
                        value={arraySize}
                        onChange={(e) => setArraySize(Number(e.target.value))}
                        disabled={isSorting}
                        className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer disabled:opacity-50 accent-blue-600 hover:accent-blue-500"
                    />
                </div>

                {/* Speed Control */}
                <div className="group">
                    <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-2 group-hover:text-blue-500 transition-colors">
                        Speed
                    </label>
                    <div className="relative">
                        <select
                            value={speed}
                            onChange={(e) => setSpeed(Number(e.target.value))}
                            disabled={isSorting}
                            className="w-full pl-4 pr-10 py-2.5 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all appearance-none disabled:opacity-50"
                        >
                            <option value={500}>Slow (500ms)</option>
                            <option value={200}>Medium (200ms)</option>
                            <option value={50}>Fast (50ms)</option>
                            <option value={10}>Ultra Fast (10ms)</option>
                        </select>
                        <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                            <svg className="w-5 h-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                            </svg>
                        </div>
                    </div>
                </div>
            </div>

            {/* Actions - Full width row */}
            <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-gray-100 dark:border-gray-700">
                <button
                    onClick={onGenerate}
                    disabled={isSorting}
                    className="flex-1 px-4 py-3 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 border border-gray-300 dark:border-gray-600 rounded-xl hover:bg-gray-200 dark:hover:bg-gray-600 transition-all font-medium focus:ring-2 focus:ring-gray-400 disabled:opacity-50 flex items-center justify-center gap-2 group"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 group-hover:rotate-180 transition-transform duration-500" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
                    </svg>
                    <span>New Array</span>
                </button>
                <button
                    onClick={onSort}
                    disabled={isSorting}
                    className={`flex-[2] px-6 py-3 ${isSorting ? 'bg-indigo-400 cursor-not-allowed' : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-lg shadow-indigo-500/30'} text-white rounded-xl transition-all font-bold flex justify-center items-center gap-2 transform active:scale-95`}
                >
                    {isSorting ? (
                        <>
                            <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Sorting...
                        </>
                    ) : (
                        <>
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                            </svg>
                            Start Visualization
                        </>
                    )}
                </button>
                <button
                    onClick={onReset}
                    className="flex-1 px-4 py-3 bg-white dark:bg-gray-700 text-rose-500 border border-rose-200 dark:border-rose-900/30 rounded-xl hover:bg-rose-50 dark:hover:bg-rose-900/20 transition-all font-medium flex items-center justify-center gap-2 disabled:opacity-50"
                    title="Stop & Reset"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8 7a1 1 0 00-1 1v4a1 1 0 002 0V8a1 1 0 00-1-1zm4 0a1 1 0 00-1 1v4a1 1 0 002 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    <span>Reset</span>
                </button>
            </div>
        </div>
    );
};

export default Controls;
