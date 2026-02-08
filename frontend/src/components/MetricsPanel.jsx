import React from 'react';

const MetricsPanel = ({ metrics, complexity, algorithm }) => {

    // Format algorithm name for display
    const algoDisplay = algorithm.charAt(0).toUpperCase() + algorithm.slice(1) + " Sort";

    return (
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700 w-full lg:w-80 flex-shrink-0 transition-colors duration-300">
            <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-6 flex items-center gap-2 pb-4 border-b border-gray-100 dark:border-gray-700">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-purple-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                Analytics
            </h3>

            <div className="space-y-6">
                <div>
                    <p className="text-xs uppercase tracking-wide text-gray-400 dark:text-gray-500 font-semibold mb-1">Algorithm</p>
                    <p className="font-bold text-2xl text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400">
                        {algoDisplay}
                    </p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-xl border border-gray-100 dark:border-gray-700 transition-colors">
                        <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Comparisons</p>
                        <p className="font-mono text-xl font-bold text-gray-800 dark:text-white">{metrics.comparisons}</p>
                    </div>
                    <div className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-xl border border-gray-100 dark:border-gray-700 transition-colors">
                        <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Swaps</p>
                        <p className="font-mono text-xl font-bold text-gray-800 dark:text-white">{metrics.swaps}</p>
                    </div>
                </div>

                <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-xl border border-blue-100 dark:border-blue-800 transition-colors">
                    <p className="text-xs text-blue-600 dark:text-blue-300 mb-1 font-medium">Execution Time</p>
                    <div className="flex items-baseline gap-1">
                        <p className="font-mono text-2xl font-bold text-blue-700 dark:text-blue-200">
                            {metrics.execution_time_ms}
                        </p>
                        <span className="text-sm font-medium text-blue-600 dark:text-blue-400">ms</span>
                    </div>
                </div>

                <div className="pt-6 border-t border-gray-100 dark:border-gray-700">
                    <h4 className="font-semibold text-gray-700 dark:text-gray-300 mb-3 text-sm flex items-center gap-2">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        Complexity Analysis
                    </h4>
                    <div className="space-y-3">
                        <div className="flex justify-between items-center text-sm p-3 bg-gray-50 dark:bg-gray-700/30 rounded-lg">
                            <span className="text-gray-600 dark:text-gray-400">Time</span>
                            <span className="font-mono bg-purple-100 dark:bg-purple-900/30 px-2 py-1 rounded text-purple-700 dark:text-purple-300 font-bold text-xs ring-1 ring-purple-200 dark:ring-purple-800">
                                {complexity.time || '-'}
                            </span>
                        </div>
                        <div className="flex justify-between items-center text-sm p-3 bg-gray-50 dark:bg-gray-700/30 rounded-lg">
                            <span className="text-gray-600 dark:text-gray-400">Space</span>
                            <span className="font-mono bg-green-100 dark:bg-green-900/30 px-2 py-1 rounded text-green-700 dark:text-green-300 font-bold text-xs ring-1 ring-green-200 dark:ring-green-800">
                                {complexity.space || '-'}
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MetricsPanel;
