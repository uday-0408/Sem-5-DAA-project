import React, { useMemo } from 'react';

const BarChart = ({ array, highlightIndices = [], highlightType = '', description = '' }) => {
    // Determine the max value for scaling height
    const maxValue = useMemo(() => Math.max(...array, 100), [array]);

    // Auto-font size based on array length
    const showValues = array.length <= 40;

    return (
        <div className="flex-1 bg-white p-6 rounded-lg shadow-md h-96 flex flex-col relative overflow-hidden">
            {/* Description Overlay */}
            <div className="absolute top-2 left-4 z-10 bg-white/80 px-3 py-1 rounded shadow-sm border border-gray-100">
                <p className="text-sm font-semibold text-gray-700">
                    {description || "Ready to sort..."}
                </p>
            </div>

            <div className="flex items-end justify-center w-full h-full space-x-1 mt-6">
                {array.map((value, idx) => {
                    // Determine color based on state
                    let bgColor = 'bg-blue-500'; // Default
                    let scale = 'scale-100';

                    if (highlightIndices.includes(idx)) {
                        if (highlightType === 'comparison') {
                            bgColor = 'bg-yellow-400';
                        } else if (highlightType === 'swap') {
                            bgColor = 'bg-red-500';
                            scale = 'scale-110'; // Pop effect
                        } else if (highlightType === 'overwrite') {
                            bgColor = 'bg-purple-500';
                        } else if (highlightType === 'finished') {
                            bgColor = 'bg-green-500';
                        }
                    } else if (highlightType === 'finished') {
                        bgColor = 'bg-green-500';
                    }

                    // Calculate height percentage
                    const heightPercent = (value / maxValue) * 100;

                    return (
                        <div
                            key={idx}
                            style={{
                                height: `${heightPercent}%`,
                                width: `${100 / array.length}%`
                            }}
                            className={`
                                ${bgColor} ${scale} 
                                bar-transition rounded-t-lg shadow-sm opacity-90 hover:opacity-100
                                flex items-end justify-center pb-1
                            `}
                            title={`Index: ${idx}, Value: ${value}`}
                        >
                            {/* Show Value if space permits */}
                            {showValues && (
                                <span className="text-[10px] md:text-xs font-bold text-white drop-shadow-md -mb-6 md:mb-1">
                                    {value}
                                </span>
                            )}
                        </div>
                    );
                })}
            </div>

            {/* X-Axis Indices (Optional, if few elements) */}
            {showValues && (
                <div className="flex justify-center w-full space-x-1 mt-1 border-t pt-1">
                    {array.map((_, idx) => (
                        <div key={idx} style={{ width: `${100 / array.length}%` }} className="text-center text-[8px] text-gray-400">
                            {idx}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default BarChart;
