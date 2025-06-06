import React, { useMemo, useState } from "react";
import { COLOR_SCHEME, isSelected } from "@/common";
import deleteIcon from "@/assets/deleteIcon.svg";

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
            className="searched-item"
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
        >
            <div className="flex items-center w-full">
                <div className="flex items-center w-full">
                    <div
                        className="w-[20px] h-[20px] mr-[14px] rounded-full"
                        style={{
                            backgroundColor: COLOR_SCHEME[index],
                        }}/>
                    <div className="song-info">
                        <div className="song">{item.song}</div>
                        <div className="artist">{item.artist}</div>
                    </div>
                </div>
                <div
                    onClick={(e) => {
                        e.stopPropagation();
                        deleteItem(item.id);
                    }}
                >
                    <img src={deleteIcon}
                        alt="delete"
                        className="delete"/>
                </div>
            </div>

            {/* 아래 펼쳐지는 부분 */}
            <div className={`sections ${isOpen ? "open" : ""}`}>
                {item.chordsInfos.map((chordsInfo, i) => (
                    <div
                        key={i}
                        className={`section ${isSelected(selectedItems, {...chordsInfo, id: item.id}) ? "selected" : ""}`}
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
                    </div>
                ))}
            </div>
        </div>
    );
}
