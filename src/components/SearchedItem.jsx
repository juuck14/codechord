import React, { useMemo, useState } from "react";
import { COLOR_SCHEME, isSelected } from "@/common";

export default function SearchedItem({ index, item, deleteItem, selectedItems, handleSongClick }) {
    const [hover, setHover] = useState(false);

    const handleClick = (i, d) => {
        handleSongClick(d);
    };
    const handleMouseEnter = () => setHover(true);
    const handleMouseLeave = () => setHover(false);

    const isOpen = useMemo(() => {
        return item.chordsInfos.some(d => isSelected(selectedItems, {...d, id: item.id})) || hover;
    }, [selectedItems, hover]);

    return (
        <div
            className="mb-3 p-2 rounded-lg border border-gray-300 shadow-sm bg-white transition-colors duration-300"
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            style={{ cursor: "pointer", width: 400 }}
        >
            <div className="flex items-center">
                
                <div
                    style={{
                        width: 20,
                        height: 20,
                        backgroundColor: COLOR_SCHEME[index],
                        marginRight: 10,
                        borderRadius: 4,
                        flexShrink: 0
                    }}
                />
                <div className="flex-1 font-medium text-gray-800">
                    {item.artist} - {item.song}{hover}
                </div>
                <span
                    className="border text-xs ml-2 px-2 py-1 rounded bg-red-100 hover:bg-red-200 transition"
                    onClick={(e) => {
                        e.stopPropagation();
                        deleteItem(item.id);
                    }}
                >
                    &#10005;
                </span>
            </div>

            {/* 아래 펼쳐지는 부분 */}
            <div
                className={`overflow-hidden transition-all duration-500 ease-in-out`}
                style={{
                    height: isOpen ? 'auto' : 0,
                    opacity: isOpen ? 1 : 0,
                }}
            >
                <div className="mt-2 flex flex-wrap">
                    {item.chordsInfos.map((chordsInfo, i) => (
                        <span
                            key={i}
                            className={`${isSelected(selectedItems, {...chordsInfo, id: item.id}) ? "bg-blue-100" : "bg-gray-50"}
                                ml-2 mr-3 cursor-pointer px-3 py-1 rounded hover:bg-gray-200 transition`}
                            onClick={() => handleClick(
                                i,
                                {
                                    ...chordsInfo,
                                    id: item.id,
                                    song: item.song,
                                    artist: item.artist,
                                    index: index
                                }
                            )}
                        >
                            {chordsInfo.section}
                        </span>
                    ))}
                </div>
            </div>
        </div>
    );
}
