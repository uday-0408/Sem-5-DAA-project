import React from 'react';

const TreeNode = ({ node, highlightIndices, currentPhase, algoType }) => {
    if (!node) return null;

    const { id, range, array, children, pivotIndex } = node;
    const [l, r] = range;

    const isLeaf = !children || children.length === 0;

    // Determine state
    let state = 'default';

    // 1. Check if node is completely finished
    if (node.phase === 'sorted' || node.phase === 'partitioned') {
        // However, during animation, we might want to override this if it's currently being processed again
        // But generally, once sorted, it stays green.
        // Let's rely on the dynamic highlighting mostly.
    }

    // 2. Dynamic Highlight Interaction
    // Is this node's range the one currently being operated on?
    const isExactRange = highlightIndices && highlightIndices.length === 2 &&
        highlightIndices[0] === l && highlightIndices[1] === r;

    // Is a pivot being selected in this node?
    const isPivotStep = algoType === 'quick' && currentPhase === 'pivot';
    // If it's a pivot step, we usually highlight a single index. If that index is within our range?
    // Actually, pivot step typically highlights [pivotIndex].
    // If we are in 'pivot' phase, and the pivotIndex matches our node's pivotIndex?
    const isActivePivot = isPivotStep && highlightIndices && highlightIndices[0] === pivotIndex;

    if (isActivePivot) {
        state = 'pivot';
    } else if (isExactRange) {
        if (currentPhase === 'divide') state = 'dividing';
        else if (currentPhase === 'merge_start' || currentPhase === 'merge_end') state = 'merging';
        else state = 'active';
    } else if (highlightIndices && highlightIndices[0] >= l && highlightIndices[1] <= r) {
        // If the current operation is strictly inside this node's range (e.g. recursive child)
        state = 'path';
    }

    // Styles
    const baseStyle = "flex flex-col items-center p-2 rounded-lg border-2 transition-all duration-300 relative bg-white dark:bg-gray-800 min-w-[3.5rem]";
    let colorStyle = "border-gray-200 dark:border-gray-700 text-gray-400 dark:text-gray-500 opacity-70";

    // "Sorted" or "Partitioned" nodes from the static tree data (after they are done)
    // We can't easily know if they are done *yet* during animation unless we track visited nodes.
    // For simplicity, we'll rely on currentPhase and active path.
    // Enhanced: Use `path` state to keep parents somewhat visible.

    if (state === 'default') {
        colorStyle = "border-gray-200 dark:border-gray-700 text-gray-400 dark:text-gray-600 opacity-50 scale-95";
    } else if (state === 'path') {
        colorStyle = "border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-400 opacity-100";
    } else if (state === 'dividing') {
        colorStyle = "border-blue-400 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 shadow-md transform scale-105 z-10";
    } else if (state === 'merging') {
        colorStyle = "border-purple-500 bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300 shadow-lg transform scale-110 z-20 ring-2 ring-purple-200 dark:ring-purple-900";
    } else if (state === 'active') {
        colorStyle = "border-indigo-400 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700";
    } else if (state === 'pivot') {
        colorStyle = "border-orange-500 bg-orange-50 dark:bg-orange-900/20 text-orange-700 font-bold shadow-orange-300 scale-105";
    }

    return (
        <div className="flex flex-col items-center mx-1 sm:mx-2">
            <div className={`${baseStyle} ${colorStyle}`}>
                <div className="text-[9px] uppercase tracking-wider mb-1 font-mono opacity-60">
                    [{l}-{r}]
                </div>
                <div className="flex gap-0.5 justify-center flex-wrap max-w-[12rem]">
                    {array.length <= 8 ? (
                        array.map((val, idx) => (
                            <span key={idx} className={`text-[10px] w-4 text-center ${idx + l === pivotIndex ? 'font-bold text-orange-500' : ''}`}>
                                {val}
                            </span>
                        ))
                    ) : (
                        <span className="text-[10px] italic">...{array.length} items...</span>
                    )}
                </div>
            </div>

            {/* Children */}
            {!isLeaf && (
                <div className="flex items-start justify-center gap-2 mt-4 relative">
                    {/* Visual Connector Line */}
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 -mt-4 w-px h-4 bg-gray-300 dark:bg-gray-600"></div>
                    <div className="absolute top-0 left-4 right-4 -mt-2 h-px bg-gray-200 dark:bg-gray-700"></div>

                    {children.map((child, idx) => (
                        <TreeNode
                            key={child.id || idx}
                            node={child}
                            highlightIndices={highlightIndices}
                            currentPhase={currentPhase}
                            algoType={algoType}
                        />
                    ))}
                </div>
            )}
        </div>
    );
};

const DivideConquerTree = ({ tree, highlightIndices, currentPhase, algoType }) => {
    if (!tree || (algoType !== 'merge' && algoType !== 'quick')) return null;

    return (
        <div className="w-full flex-1 bg-white dark:bg-gray-800 p-4 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700 overflow-hidden flex flex-col h-[500px] transition-colors duration-300">
            <div className="flex justify-between items-center mb-4 border-b border-gray-100 dark:border-gray-700 pb-2">
                <h3 className="font-bold text-gray-700 dark:text-gray-200 flex items-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-indigo-500" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M7 3a1 1 0 000 2h6a1 1 0 100-2H7zM4 7a1 1 0 011-1h10a1 1 0 110 2H5a1 1 0 01-1-1zM2 11a2 2 0 012-2h12a2 2 0 012 2v4a2 2 0 01-2 2H4a2 2 0 01-2-2v-4z" />
                    </svg>
                    Recursion Tree
                </h3>
                <span className="text-xs bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 px-2 py-1 rounded-full font-medium">
                    {algoType === 'merge' ? 'Merge Sort' : 'Quick Sort'}
                </span>
            </div>

            <div className="flex-1 overflow-auto custom-scrollbar flex justify-center py-6">
                <div className="min-w-max">
                    <TreeNode
                        node={tree}
                        highlightIndices={highlightIndices}
                        currentPhase={currentPhase}
                        algoType={algoType}
                    />
                </div>
            </div>

            <div className="mt-2 text-[10px] text-gray-400 dark:text-gray-500 flex gap-4 justify-center">
                <div className="flex items-center gap-1"><span className="w-2 h-2 rounded bg-blue-500"></span> Divide</div>
                <div className="flex items-center gap-1"><span className="w-2 h-2 rounded bg-purple-500"></span> Merge</div>
                <div className="flex items-center gap-1"><span className="w-2 h-2 rounded bg-orange-500"></span> Pivot</div>
            </div>
        </div>
    );
};

export default DivideConquerTree;
