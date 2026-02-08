import React, { useMemo } from 'react';

const BarChart = ({ array, highlightIndices = [], highlightType = '', description = '' }) => {
    // Determine the max value for scaling height, assume 100 as base max if values are small
    const maxValue = useMemo(() => {
        if (!array || array.length === 0) return 100;
        return Math.max(...array, 100);
    }, [array]);

    // Auto-font size based on array length
    const showValues = array.length <= 32;

    return (
        <div className="flex-1 bg-white dark:bg-gray-800 p-4 sm:p-6 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700 flex flex-col relative overflow-hidden transition-all duration-300 group" style={{ height: '384px' }}>

            {/* Background Grid Lines */}
            <div className="absolute inset-0 flex flex-col justify-end pb-8 px-6 pointer-events-none z-0 space-y-[20%] opacity-10">
                <div className="w-full border-t border-gray-400 dark:border-gray-500 h-[20%]"></div>
                <div className="w-full border-t border-gray-400 dark:border-gray-500 h-[20%]"></div>
                <div className="w-full border-t border-gray-400 dark:border-gray-500 h-[20%]"></div>
                <div className="w-full border-t border-gray-400 dark:border-gray-500 h-[20%]"></div>
            </div>

            {/* Description Overlay */}
            <div className="absolute top-4 left-6 right-6 z-20 flex justify-between items-start pointer-events-none">
                <div className="bg-white/90 dark:bg-gray-700/90 backdrop-blur-sm px-4 py-1.5 rounded-full shadow-sm border border-gray-100 dark:border-gray-600 transition-colors">
                    <p className="text-sm font-semibold text-gray-700 dark:text-gray-200 flex items-center gap-2">
                        {description ? (
                            <>
                                <span className={`w-2 h-2 rounded-full ${description.includes('Complete') ? 'bg-green-500' : 'bg-blue-500 animate-pulse'}`}></span>
                                {description}
                            </>
                        ) : (
                            "Ready to sort..."
                        )}
                    </p>
                </div>
            </div>

            {/* Bars Container */}
            <div className="mt-12 mb-2 mx-2 z-10 flex items-end justify-center" style={{ gap: '2px', height: '280px' }}>
                {array.map((value, idx) => {
                        const numValue = Number(value);
                        const heightPercent = Math.max((numValue / maxValue) * 100, 5); // Minimum 5% height

                        // Determine Color directly
                        let barColor = '#3B82F6'; // blue-500
                        let isHighlighted = highlightIndices.includes(idx);
                        let shadowStyle = '';
                        let transformStyle = 'scale(1)';

                        if (isHighlighted) {
                            if (highlightType === 'comparison') {
                                barColor = '#FACC15'; // yellow-400
                                shadowStyle = '0 0 15px rgba(250, 204, 21, 0.6)';
                            } else if (highlightType === 'swap') {
                                barColor = '#EF4444'; // red-500
                                shadowStyle = '0 0 20px rgba(239, 68, 68, 0.7)';
                                transformStyle = 'scale(1.05) translateY(-3px)';
                            } else if (highlightType === 'overwrite') {
                                barColor = '#A855F7'; // purple-500
                                shadowStyle = '0 0 15px rgba(168, 85, 247, 0.6)';
                            } else if (highlightType === 'finished') {
                                barColor = '#10B981'; // emerald-500
                                shadowStyle = '0 0 10px rgba(16, 185, 129, 0.4)';
                            }
                        } else if (highlightType === 'finished') {
                            barColor = '#10B981'; // emerald-500
                        }

                        return (
                            <div
                                key={idx}
                                className="rounded-t-md"
                                style={{
                                    height: `${heightPercent}%`,
                                    width: `calc(${100 / array.length}% - 2px)`,
                                    minWidth: '4px',
                                    backgroundColor: barColor,
                                    boxShadow: shadowStyle,
                                    transform: transformStyle,
                                    position: 'relative',
                                    transition: 'all 0.3s ease'
                                }}
                                title={`Index: ${idx}, Value: ${numValue}`}
                            >
                                {/* Value Label - Shown ABOVE bar */}
                                {showValues && (
                                    <div
                                        className="absolute -top-6 left-1/2 -translate-x-1/2 text-[10px] sm:text-xs font-bold text-gray-700 dark:text-gray-200 pointer-events-none whitespace-nowrap"
                                    >
                                        {numValue}
                                    </div>
                                )}

                                {/* Index Label - Shown below the bar */}
                                <div className="absolute top-full mt-1 left-1/2 -translate-x-1/2 text-[9px] text-gray-400 dark:text-gray-500">
                                    {idx}
                                </div>
                            </div>
                        );
                    })}
            </div>
        </div>
    );
};

export default BarChart;
